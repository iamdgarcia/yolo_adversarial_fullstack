
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import ImageUploader from "@/components/ImageUploader";
import ImageProcessor from "@/components/ImageProcessor";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageUpload = (file: File, url: string) => {
    setImageFile(file);
    setImageUrl(url);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-12">
          <section>
            <div className="flex flex-col gap-2 max-w-3xl mx-auto text-center mb-12 animate-fade-in">
              <h2 className="text-3xl font-semibold tracking-tight">
                Generate Corrupted Images for YOLO Models
              </h2>
              <p className="text-muted-foreground">
                Upload an image and customize parameters to create adversarial examples for YOLO object detection
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 h-[300px]">
                <ImageUploader onImageUpload={handleImageUpload} />
              </div>
              
              <div className="md:col-span-2">
                {imageFile ? (
                  <ImageProcessor imageFile={imageFile} imageUrl={imageUrl} />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-center p-8 border rounded-lg">
                    <p className="max-w-md">
                      Upload an image to start generating corrupted images for YOLO models
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <Separator />

          <section className="max-w-3xl mx-auto">
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-semibold">How It Works</h3>
              
              <div className="w-full flex justify-center mb-6">
                <div className="relative w-full max-w-2xl rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src="/example.gif" 
                    alt="YOLO model corruption process demonstration" 
                    className="w-full object-cover"
                  />
                </div>
              </div>
              
              <div className="grid gap-8 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-medium">1</div>
                  <h4 className="font-medium">Upload Image</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload any image that you want to corrupt for YOLO model testing
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-medium">2</div>
                  <h4 className="font-medium">Configure Parameters</h4>
                  <p className="text-sm text-muted-foreground">
                    Select the YOLO model version, number of iterations, and corruption type
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-medium">3</div>
                  <h4 className="font-medium">Download Results</h4>
                  <p className="text-sm text-muted-foreground">
                    Get both the corrupted image and the noise pattern that was applied
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
