
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Download, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock function to simulate API call for image corruption
const corruptImage = async (
  imageFile: File,
  model: string,
  nIters: string,
  ctype: string
): Promise<{ adversarialImage: string; noiseImage: string }> => {
  const formData = new FormData();
  console.log(nIters.toString());
  formData.append("file", imageFile);
  formData.append("model", `${model}.pt`);
  formData.append("device","cpu");
  formData.append("n_iters", nIters.toString());
  formData.append("ctype", ctype);

  const response = await fetch("http://localhost:8000/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to process image");
  }

  const data = await response.json();

  return {
    adversarialImage: `data:image/jpeg;base64,${data.adv_image_base64}`,
    noiseImage: `data:image/jpeg;base64,${data.noise}`,
  };
};


const detectImage = async (
  imageFile: File,
  model: string
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("model", `${model}.pt`);

  const response = await fetch("http://localhost:8000/detect", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to detect objects");
  }

  const data = await response.json();
  return data.result;
};

const detectBase64Image = async (
  base64Image: string,
  model: string
): Promise<string> => {
  // Convert base64 to Blob
  const blob = await fetch(base64Image).then(res => res.blob());
  const file = new File([blob], "adversarial.png", { type: blob.type });

  return await detectImage(file, model);
};

const processBothImages = async (
  imageFile: File,
  adversarialImage: string,
  model: string
): Promise<{ originalResult: string; corruptedResult: string }> => {
  const originalResult = await detectImage(imageFile, model);
  const corruptedResult = await detectBase64Image(adversarialImage, model);

  return { originalResult, corruptedResult };
};


interface ImageProcessorProps {
  imageFile: File | null;
  imageUrl: string | null;
}

const ImageProcessor = ({ imageFile, imageUrl }: ImageProcessorProps) => {
  const [model, setModel] = useState("yolov8n");
  const [nIters, setNIters] = useState("-1");
  const [ctype, setCtype] = useState("vanishing");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingBoth, setIsProcessingBoth] = useState(false);
  const [results, setResults] = useState<{
    adversarialImage: string;
    noiseImage: string;
  } | null>(null);
  const [detectionResults, setDetectionResults] = useState<{
    originalResult: string;
    corruptedResult: string;
  } | null>(null);

  const handleProcess = async () => {
    if (!imageFile) {
      toast.error("Please upload an image first");
      return;
    }

    setIsProcessing(true);
    setResults(null);
    setDetectionResults(null);

    try {
      console.log(nIters);
      // Parse nIters value - could be a number or "min"
      const parsedNIters = nIters === "min" ? "min" : parseInt(nIters, 10);
      console.log(parsedNIters);
      // Call API to process the image
      const result = await corruptImage(
        imageFile,
        model,
        parsedNIters.toString(),
        ctype
      );
      
      setResults(result);
      toast.success("Image processed successfully");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Error processing image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessBoth = async () => {
    if (!imageFile || !results) {
      toast.error("Please generate a corrupted image first");
      return;
    }

    setIsProcessingBoth(true);

    try {
      // Call API to process both images through the YOLO model
      const bothResults = await processBothImages(
        imageFile,
        results.adversarialImage,
        model
      );
      
      setDetectionResults(bothResults);
      toast.success("Detection comparison completed");
    } catch (error) {
      console.error("Error processing images:", error);
      toast.error("Error processing images. Please try again.");
    } finally {
      setIsProcessingBoth(false);
    }
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up">
      <Card className="p-6">
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="model-select">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model-select" className="w-full">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {/* YOLOv8 variants */}
                <SelectItem value="yolov8n">YOLOv8n</SelectItem>
                <SelectItem value="yolov8s">YOLOv8s</SelectItem>
                <SelectItem value="yolov8m">YOLOv8m</SelectItem>
                <SelectItem value="yolov8l">YOLOv8l</SelectItem>
                <SelectItem value="yolov8x">YOLOv8x</SelectItem>
                
                {/* YOLOv11 variants */}
                <SelectItem value="yolov11n">YOLOv11n</SelectItem>
                <SelectItem value="yolov11s">YOLOv11s</SelectItem>
                <SelectItem value="yolov11m">YOLOv11m</SelectItem>
                <SelectItem value="yolov11l">YOLOv11l</SelectItem>
                <SelectItem value="yolov11x">YOLOv11x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="n-iters">Number of Iterations</Label>
            <Input
              id="n-iters"
              value={nIters}
              onChange={(e) => setNIters(e.target.value)}
              placeholder="Enter -1, a positive number, or 'min'"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Enter -1, a positive number, or 'min'
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ctype-select">Corruption Type</Label>
            <Select value={ctype} onValueChange={setCtype}>
              <SelectTrigger id="ctype-select" className="w-full">
                <SelectValue placeholder="Select corruption type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vanishing">Vanishing</SelectItem>
                <SelectItem value="fabrication">Fabrication</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleProcess} 
          disabled={!imageFile || isProcessing}
          className="mt-6 w-full"
        >
          {isProcessing ? "Processing..." : "Generate Corrupted Image"}
        </Button>
      </Card>

      {results && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium">Results</h3>
            
            <Button 
              onClick={handleProcessBoth}
              disabled={isProcessingBoth}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isProcessingBoth && "animate-spin")} />
              {isProcessingBoth ? "Processing..." : "Run YOLO Detection"}
            </Button>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Original Image */}
            <div className="space-y-2">
              <Card className="p-4 overflow-hidden">
                <h4 className="text-sm font-medium mb-2">Original Image</h4>
                <div className="aspect-square relative overflow-hidden rounded-md">
                  {imageUrl && (
                    <img 
                      src={imageUrl} 
                      alt="Original"
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                {detectionResults && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-md text-sm">
                    <p className="font-medium mb-1">Detection Results:</p>
                    <p className="text-muted-foreground">{detectionResults.originalResult}</p>
                  </div>
                )}
              </Card>
            </div>
            
            {/* Adversarial Image */}
            <div className="space-y-2">
              <Card className="p-4 overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Corrupted Image</h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => downloadImage(results.adversarialImage, "corrupted-image.png")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    <span className="text-xs">Download</span>
                  </Button>
                </div>
                <div className="aspect-square relative overflow-hidden rounded-md">
                  <img 
                    src={results.adversarialImage} 
                    alt="Corrupted"
                    className="object-cover w-full h-full"
                  />
                </div>
                {detectionResults && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-md text-sm">
                    <p className="font-medium mb-1">Detection Results:</p>
                    <p className="text-muted-foreground">{detectionResults.corruptedResult}</p>
                  </div>
                )}
              </Card>
            </div>
            
            {/* Noise Image */}
            <div className="space-y-2">
              <Card className="p-4 overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Noise Pattern</h4>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => downloadImage(results.noiseImage, "noise-pattern.png")}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    <span className="text-xs">Download</span>
                  </Button>
                </div>
                <div className="aspect-square relative overflow-hidden rounded-md bg-black/5">
                  <img 
                    src={results.noiseImage} 
                    alt="Noise Pattern"
                    className="object-cover w-full h-full"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageProcessor;
