from typing import Any
from ultralytics import YOLO
from ultralytics.utils.loss import v8DetectionLoss
from enum import Enum
from typing import Union, List
from modules.tog.preprocessing import preprocess_for_yolo, postprocess_from_yolo
import torch
import numpy as np
import logging

class CF_Type(Enum):
    VANISHING = 0
    FABRICATION = 1

class Hyperparameters:
        box = 7.5
        cls = 0.5
        dfl = 1.5

class TOG:
    """
    @brief Main class for the Targeted Object Generation (TOG) to generate adversarial examples using the YOLO model.

    This class is designed to manipulate images in a way that the altered image is misinterpreted by the YOLO object
    detection model in a predefined manner, either making objects vanish or creating fake detections.

    Attributes:
        model (YOLO): The YOLO model used for object detection.
        device (str): The computation device, e.g., 'cuda' or 'cpu'.
        loss (v8DetectionLoss): The loss function utilized for generating adversarial examples.
        eps_iter (float): Amount of admisible change in each iter
        l_threshold (float): Loss threshold to consider that the TOG has achieved the goal
    """
    model = None
    device = ""
    loss = None
    eps_iter = 2 / 255.0 
    l_threshold = 0.1 
    l_fabrication = 0.1
    class_names = []
    history_noise = []
    debug = False
    lastLoss : float = 0
    def __init__(self,model_path : str, device : str ="cuda",debug : bool = False) -> None:
        """
        @brief Initializes the TOG class with the specified model and device.

        Loads the YOLO model, sets it to the specified device, initializes the hyperparameters, and sets up the 
        model for training by enabling gradient computation for all parameters.

        @param model_path The path to the YOLO model file.
        @param device The device on which to run the model, defaults to 'cuda'.
        """
        self.debug = debug
        self.device = device
        self.model = YOLO(model_path).to(self.device)
        self.class_names = list(self.model.names.keys())
        self.model.model.args = Hyperparameters()
        for param in self.model.model.parameters():
             param.requires_grad = True
        self.loss = v8DetectionLoss(model=self.model.model)

    def __call__(self, source, n_iters: Union[int, str] = "min", cf_type: CF_Type = CF_Type.VANISHING, new_shape=(608, 928),bb_details : Union[int,List] = None) -> Any:
        """
        @brief Generates an adversarial example based on the provided parameters.

        Depending on the cf_type, this function prepares the necessary batch dictionary, processes the input source 
        image, and iteratively adjusts the image to create an adversarial example aimed to fool the YOLO model.

        @param source The input source data for generating the adversarial example.
        @param n_iters The number of iterations for the adversarial generation process; can be an integer or 'min'.
        @param cf_type The type of counterfactual attack to be applied (VANISHING or FABRICATION).
        @param new_shape The shape to which the input image is resized, defaults to (608, 928).
        @param bb_details Details or specifications of bounding boxes to be used in FABRICATION attacks; can be None, an integer, or a list.

        @return A tuple containing the adversarially modified image and the noise applied to the original image.
        """
        batch_dict = {}
        self.history_noise = []
        if cf_type == CF_Type.VANISHING:
            batch_dict = {
            "batch_idx": torch.tensor([[0.0]], device=self.device, requires_grad=True),
            'cls': torch.tensor([[0.0]], device=self.device, requires_grad=True),
            "bboxes": torch.tensor([[0,0,0,0]], dtype=torch.float32, device=self.device, requires_grad=True)
            }
        elif cf_type == CF_Type.FABRICATION:
            bboxes = []
            classes = []
            # Para la perturbación "fabrication", se generan o proporcionan bounding boxes específicas
            if bb_details is None:
                num_bbs = np.random.randint(1, 5)  # Genera un número aleatorio de bounding boxes
                for _ in range(num_bbs):
                    # Genera bounding boxes aleatorias. Ajusta los rangos según sea necesario.
                    bboxes.append([np.random.rand() for _ in range(4)])
                    classes.append([float(np.random.randint(0,len(self.class_names)))])
            elif isinstance(bb_details, int):
                # Genera un número fijo de bounding boxes con posiciones aleatorias
                num_bbs = bb_details
                for _ in range(num_bbs):
                    bboxes.append([np.random.rand() for _ in range(4)])
                    classes.append([float(np.random.randint(0,len(self.class_names)))])
            elif isinstance(bb_details, list):
                if len(bb_details[0])==5:
                    logging.debug("Se recibe boundingbox con formato de etiquetado <class><x><y><w><h>")
                    for bbox in bb_details:
                        classes.append([float(bbox[0])])
                        bboxes.append(bbox[1:])
                else:
                    # Utiliza las bounding boxes proporcionadas en bb_details
                    bboxes = bb_details
            else:
                raise ValueError("bb_details debe ser None, un entero, o una lista de bbs.")
            batch_dict = {
            "batch_idx": torch.tensor([[0.0] for _ in range(len(bboxes))], device=self.device, requires_grad=True),
            'cls': torch.tensor(classes, device=self.device, requires_grad=True),
            "bboxes": torch.tensor(bboxes, dtype=torch.float32, device=self.device, requires_grad=True)
            }
        image_tensor, original_shape = preprocess_for_yolo(source,new_shape)
        image_tensor = image_tensor.to(self.device)
        x_adv = image_tensor.clone().detach()
        force_stop = False
        if isinstance(n_iters,int):
            total_iters = n_iters
        elif isinstance(n_iters,str):
            if n_iters == "min":
                total_iters = 1000
                force_stop = True
            else:
                raise NotImplementedError(f"Not valid n_iters value: {n_iters}")
        else:
            raise NotImplementedError(f"Not valid n_iters type: {type(n_iters)}")
        for i in range(total_iters):
            x_adv,loss = self.step(x_adv,batch_dict)
            if self.debug:
                logging.debug(f"Current loss {loss}")
            if force_stop:
                if cf_type==CF_Type.VANISHING and loss< self.l_threshold:
                    # DSI_LOG_INFO(f"Goal achieved at iter {i}. Current loss: {loss}")
                    break
                if cf_type==CF_Type.FABRICATION and loss< self.l_fabrication:
                    logging.info(f"Goal achieved at iter {i}. Current loss: {loss}")
                    break
            if self.debug:
                self.history_noise.append(postprocess_from_yolo(x_adv,original_shape))  
    
        img_result = postprocess_from_yolo(x_adv,original_shape)
        # Calcular el ruido generado
        noise = x_adv - image_tensor  
        noise_for_visualization = postprocess_from_yolo(noise,original_shape)
        return img_result, noise_for_visualization

    def step(self,x_adv,batch_dict):
        """
        @brief Performs a single optimization step to adjust the adversarial example.

        This method computes the loss based on the current adversarial example and the specified batch details, then
        uses the gradient of the loss to update the adversarial example.

        @param x_adv The current adversarial example.
        @param batch_dict A dictionary containing batch-specific details for the loss computation.

        @return The updated adversarial example after applying the gradient update.
        """
        x = x_adv.requires_grad_(True)
        result = self.model.model(x)
        l, _ = self.loss(result, batch_dict)
        self.lastLoss = l.cpu().detach().numpy()
        x.retain_grad()
        l.backward(retain_graph=True)
        gradients = x.grad.data
        # Calculate the L2 norm of the gradient
        l2_norm = torch.norm(gradients.view(gradients.shape[0], -1), p=2, dim=1).view(-1, 1, 1, 1)

        # Avoid division by zero
        l2_norm = l2_norm + 1e-10
        # Normalize the gradient using L2 norm (and clip if it exceeds self.eps_iter)
        normalized_g = gradients / l2_norm
        # Aplicar perturbación adversaria
        # x_adv_final = (x - self.eps_iter * gradients.sign()).clamp(0, 1)
        x_adv_final = (x -normalized_g.to(self.device)).clamp(0, 1)

        return x_adv_final, l.cpu().detach().numpy()