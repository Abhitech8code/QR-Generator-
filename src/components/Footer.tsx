
import React from 'react';
import { Github, Linkedin, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card/20 backdrop-blur-lg border-t border-border/30 mt-12 relative z-10">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          {/* Social Links */}
          <div className="flex justify-center space-x-6">
            <a
              href="https://github.com/Abhitech8code"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-125 hover:rotate-12"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Github className="h-7 w-7 relative z-10 group-hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
            </a>
            <a
              href="https://www.linkedin.com/in/abhishektech08/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative text-muted-foreground hover:text-blue-500 transition-all duration-300 transform hover:scale-125 hover:rotate-12"
            >
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Linkedin className="h-7 w-7 relative z-10 group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            </a>
          </div>
          
          {/* Copyright */}
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <span>© 2024 QR Generator Pro. Made with</span>
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
            <span>by Abhishek</span>
          </div>
          
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Generate QR codes for free. No registration required. 
            Your data is processed locally and never stored on our servers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
