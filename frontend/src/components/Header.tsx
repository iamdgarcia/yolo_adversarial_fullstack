
import React from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn("w-full py-6", className)}>
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Daniel García Logo" 
              className="h-12 w-auto"
            />
            <h1 className="text-xl font-medium tracking-tight">YOLO Image Corruptor</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Advanced Image Generation Tool
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
