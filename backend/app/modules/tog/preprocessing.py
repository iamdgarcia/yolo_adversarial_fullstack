import cv2
import numpy as np
import torch
from PIL import Image
def preprocess_for_yolo(source, new_shape=(608, 928), color=(114, 114, 114), auto=True, scaleFill=False, scaleup=True, stride=32):
    """
    Realiza preprocesamiento en una imagen para que sea compatible con YOLO.

    Argumentos:
    image_path (str): La ruta de la imagen a procesar.
    new_shape (tuple, opcional): El nuevo tamaño deseado para la imagen. El valor por defecto es (608, 928).
    color (tuple, opcional): El color de relleno para el padding. El valor por defecto es (114, 114, 114).
    auto (bool, opcional): Si True, ajusta el tamaño de la imagen para que sea múltiplo del stride. El valor por defecto es True.
    scaleFill (bool, opcional): Si True, estira la imagen para que coincida con new_shape. El valor por defecto es False.
    scaleup (bool, opcional): Si True, permite aumentar el tamaño de la imagen. El valor por defecto es True.
    stride (int, opcional): El stride utilizado para el ajuste automático del tamaño de la imagen. El valor por defecto es 32.

    Retorna:
    torch.Tensor: La imagen preprocesada, lista para ser utilizada como entrada para el modelo YOLO.
    """
    # Cargar la imagen
    if isinstance(source, str):
        image = cv2.imread(source)
    elif isinstance(source,(np.ndarray, np.generic)):
        image = source.copy()
    elif isinstance(source, Image.Image):
        image = cv2.cvtColor(np.array(source), cv2.COLOR_RGB2BGR)
    else:
        raise ValueError("Unsupported image format")
    shape = image.shape[:2]  # shape = [height, width]

    # Calcular el nuevo tamaño con aspect ratio
    if isinstance(new_shape, int):
        new_shape = (new_shape, new_shape)

    r = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
    if not scaleup:  # no escalar arriba, solo hacia abajo
        r = min(r, 1.0)

    # Tamaño sin padding
    new_unpad = (int(round(shape[1] * r)), int(round(shape[0] * r)))
    dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]  # padding en ambos ejes

    if auto:  # Rectángulo mínimo
        dw, dh = np.mod(dw, stride), np.mod(dh, stride)
    elif scaleFill:  # Estirar
        dw, dh = 0.0, 0.0
        new_unpad = new_shape
        r = new_shape[0] / shape[0], new_shape[1] / shape[1]

    dw /= 2  # Dividir padding en ambos lados
    dh /= 2

    if shape[::-1] != new_unpad:  # Reescalar
        image = cv2.resize(image, new_unpad, interpolation=cv2.INTER_LINEAR)
    top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
    left, right = int(round(dw - 0.1)), int(round(dw + 0.1))

    # Añadir padding
    image = cv2.copyMakeBorder(image, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color)

    # Convertir BGR a RGB, a CHW, normalizar, y añadir batch dimension
    image = image[:, :, ::-1].transpose(2, 0, 1)
    image = np.ascontiguousarray(image)

    return torch.from_numpy(image).float().div(255.0).unsqueeze(0), shape

def postprocess_from_yolo(tensor, original_shape, color=(114, 114, 114)):
    """
    Convert a tensor output from a YOLO model back to an image.

    Arguments:
    tensor (torch.Tensor): The tensor to convert, shape should be (1, C, H, W).
    original_shape (tuple): The original height and width of the image before preprocessing.
    color (tuple, optional): The color used for padding. Default is (114, 114, 114).

    Returns:
    np.ndarray: The post-processed image.
    """
    if tensor.dim() == 4:
        tensor = tensor.squeeze(0)  # Remove batch dimension

    # Denormalize the pixel values
    image = tensor.mul(255.0).byte().cpu().numpy()

    # Transpose from CHW to HWC format
    image = np.transpose(image, (1, 2, 0))

    # Convert from RGB to BGR
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    # Remove padding
    height, width = image.shape[:2]
    original_height, original_width = original_shape

    # We assume that the padding was added symmetrically, so we can reverse it based on the original dimensions
    scaling_factor = min(height / original_height, width / original_width)
    new_unpad = (int(round(original_width * scaling_factor)), int(round(original_height * scaling_factor)))

    # Calculate padding offsets
    dh, dw = height - new_unpad[1], width - new_unpad[0]
    top, bottom = dh // 2, dh - (dh // 2)
    left, right = dw // 2, dw - (dw // 2)

    # Remove padding
    image = image[top:height - bottom, left:width - right]

    # Resize back to original shape
    if (height, width) != original_shape:
        image = cv2.resize(image, (original_width, original_height), interpolation=cv2.INTER_LINEAR)

    return image