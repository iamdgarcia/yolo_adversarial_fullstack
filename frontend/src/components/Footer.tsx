
import React from "react";

const Footer = () => {
  return (
    <footer className="py-6 w-full border-t">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Daniel García Logo" 
              className="h-8 w-auto"
            />
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Daniel García. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="mailto:info@iamdgarcia.com" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              info@iamdgarcia.com
            </a>
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
