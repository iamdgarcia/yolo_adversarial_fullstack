
import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageUpload: (file: File, imageUrl: string) => void;
  className?: string;
}

const ImageUploader = ({ onImageUpload, className }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setPreviewUrl(imageUrl);
      onImageUpload(file, imageUrl);
    };
    
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card 
      className={cn(
        "p-8 transition-all duration-300 animate-scale-in h-full",
        isDragging ? "ring-2 ring-primary" : "",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {!previewUrl ? (
        <div className="flex flex-col items-center justify-center gap-4 text-center h-full py-12">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2 animate-pulse-subtle">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-1">Upload an image</h3>
            <p className="text-muted-foreground mb-5 max-w-md">
              Drag and drop an image here, or click to browse
            </p>
            <Button onClick={handleClick} className="transition-all duration-300">
              Select Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative animate-fade-in">
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="relative overflow-hidden rounded-md">
            <div className="aspect-square w-full overflow-hidden rounded-md">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="h-full w-full object-cover transition-all hover:scale-105 duration-300"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ImageUploader;
