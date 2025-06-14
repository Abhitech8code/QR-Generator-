
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QRGenerator from '@/components/QRGenerator';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Futuristic Background */}
      <div className="fixed inset-0 -z-10">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-purple-500/10 animate-gradient-xy"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-pink-500/25 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full shadow-[0_0_20px_rgba(139,92,246,0.8)] animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_18px_rgba(168,85,247,0.8)] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      {/* Hero Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8 mb-16">
            <div className="relative">
              <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent animate-float">
                Generate QR Codes
              </h2>
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 blur-3xl opacity-50 animate-pulse"></div>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Create stunning, customizable QR codes with advanced features. 
              Perfect for business, personal use, and everything in between.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {[
                { icon: '✨', text: 'Free Forever', color: 'from-yellow-400 to-orange-500' },
                { icon: '🚀', text: 'Instant Generation', color: 'from-blue-400 to-purple-500' },
                { icon: '📱', text: 'Mobile Friendly', color: 'from-green-400 to-blue-500' },
                { icon: '🎨', text: 'Fully Customizable', color: 'from-pink-400 to-red-500' },
                { icon: '📊', text: 'Multiple Formats', color: 'from-purple-400 to-pink-500' },
                { icon: '🔒', text: 'Privacy First', color: 'from-indigo-400 to-purple-500' }
              ].map((feature, index) => (
                <span 
                  key={index}
                  className={`bg-gradient-to-R ${feature.color} bg-clip-text text-transparent font-semibold px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:scale-105 transition-transform duration-300 cursor-default`}
                >
                  {feature.icon} {feature.text}
                </span>
              ))}
            </div>
          </div>
          
          {/* QR Generator */}
          <QRGenerator darkMode={darkMode} />
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Advanced Features
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional QR code generation with enterprise-grade features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "⚡ Real-time Generation",
                description: "See your QR code update instantly as you type, with zero delay",
                icon: "⚡",
                gradient: "from-yellow-400 to-orange-500"
              },
              {
                title: "🎯 Multiple QR Types",
                description: "URLs, Text, Email, Phone, WiFi, SMS - all formats supported",
                icon: "🎯",
                gradient: "from-blue-400 to-purple-500"
              },
              {
                title: "🎨 Advanced Styling",
                description: "Custom colors, sizes, and error correction levels",
                icon: "🎨",
                gradient: "from-pink-400 to-red-500"
              },
              {
                title: "📥 Multi-format Export",
                description: "Download as PNG, SVG, or high-resolution formats",
                icon: "📥",
                gradient: "from-green-400 to-blue-500"
              },
              {
                title: "🔒 Privacy Focused",
                description: "All processing done locally - your data never leaves your device",
                icon: "🔒",
                gradient: "from-purple-400 to-pink-500"
              },
              {
                title: "📱 Mobile Optimized",
                description: "Perfect experience on all devices and screen sizes",
                icon: "📱",
                gradient: "from-indigo-400 to-purple-500"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group relative p-8 rounded-2xl bg-card/20 backdrop-blur-xl border border-border/30 hover:border-primary/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-primary/25"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
