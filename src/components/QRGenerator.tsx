import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Palette, QrCode, Sparkles, Zap, Shield, Upload, Image, Wand2 } from "lucide-react";

interface QRGeneratorProps {
  darkMode: boolean;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ darkMode }) => {
  const [inputText, setInputText] = useState('');
  const [qrType, setQrType] = useState('text');
  const [qrStyle, setQrStyle] = useState('standard');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [foregroundColor, setForegroundColor] = useState('#8B5CF6');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [qrSize, setQrSize] = useState('300');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState('M');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const generateQRCode = async (text: string) => {
    if (!text.trim()) {
      setQrCodeUrl('');
      return;
    }

    try {
      let finalText = text;
      
      // Format text based on type
      switch (qrType) {
        case 'email':
          if (!text.includes('mailto:')) {
            finalText = `mailto:${text}`;
          }
          break;
        case 'phone':
          if (!text.includes('tel:')) {
            finalText = `tel:${text}`;
          }
          break;
        case 'url':
          if (!text.startsWith('http://') && !text.startsWith('https://')) {
            finalText = `https://${text}`;
          }
          break;
        case 'wifi':
          const [ssid, password] = text.split(',');
          if (ssid && password) {
            finalText = `WIFI:T:WPA;S:${ssid.trim()};P:${password.trim()};H:false;;`;
          }
          break;
        case 'sms':
          if (!text.includes('sms:')) {
            finalText = `sms:${text}`;
          }
          break;
      }

      console.log('Generating QR code for:', finalText);

      // Generate base QR code
      let url = await QRCode.toDataURL(finalText, {
        width: parseInt(qrSize),
        margin: 2,
        color: {
          dark: foregroundColor,
          light: uploadedImage ? 'transparent' : backgroundColor,
        },
        errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
      });

      console.log('Base QR generated successfully');

      // Apply background image if uploaded
      if (uploadedImage) {
        try {
          url = await applyBackgroundImage(url, uploadedImage);
          console.log('Background image applied');
        } catch (error) {
          console.error('Failed to apply background image:', error);
          toast.error('Failed to apply background image');
        }
      }

      // Apply advanced styling
      if (qrStyle !== 'standard') {
        try {
          url = await applyAdvancedStyling(url, qrStyle);
          console.log('Advanced styling applied');
        } catch (error) {
          console.error('Failed to apply styling:', error);
          toast.error('Failed to apply styling effects');
        }
      }

      // Add logo if present
      if (logoImage) {
        try {
          url = await addLogoToQR(url, logoImage);
          console.log('Logo added');
        } catch (error) {
          console.error('Failed to add logo:', error);
          toast.error('Failed to add logo');
        }
      }

      setQrCodeUrl(url);
      console.log('QR code generation completed');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code. Please check your input.');
    }
  };

  const createRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const applyBackgroundImage = async (qrUrl: string, backgroundUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const backgroundImg = document.createElement('img');
      backgroundImg.crossOrigin = 'anonymous';
      
      backgroundImg.onload = () => {
        const qrImg = document.createElement('img');
        qrImg.crossOrigin = 'anonymous';
        
        qrImg.onload = () => {
          try {
            canvas.width = parseInt(qrSize);
            canvas.height = parseInt(qrSize);
            
            // Draw background image (scaled to fit)
            ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
            
            // Apply blend mode for better QR visibility
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw QR code on top
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(qrImg, 0, 0, canvas.width, canvas.height);
            
            resolve(canvas.toDataURL());
          } catch (error) {
            console.error('Error in background image processing:', error);
            resolve(qrUrl); // Return original if processing fails
          }
        };
        
        qrImg.onerror = () => {
          console.error('Failed to load QR image');
          resolve(qrUrl);
        };
        
        qrImg.src = qrUrl;
      };
      
      backgroundImg.onerror = () => {
        console.error('Failed to load background image');
        resolve(qrUrl);
      };
      
      backgroundImg.src = backgroundUrl;
    });
  };

  const applyAdvancedStyling = async (qrUrl: string, style: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(qrUrl);
        return;
      }

      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          
          ctx.drawImage(img, 0, 0);

          switch (style) {
            case 'rounded':
              applyRoundedCorners(ctx, canvas.width, canvas.height);
              break;
            case 'circular':
              applyCircularMask(ctx, canvas.width, canvas.height);
              break;
            case 'gradient':
              applyGradientEffect(ctx, canvas.width, canvas.height);
              break;
            case 'neon':
              applyNeonEffect(ctx, canvas.width, canvas.height);
              break;
            case 'cartoon':
              applyCartoonEffect(ctx, canvas.width, canvas.height);
              break;
            case 'pixelated':
              applyPixelatedEffect(ctx, canvas.width, canvas.height);
              break;
          }

          resolve(canvas.toDataURL());
        } catch (error) {
          console.error('Error applying styling:', error);
          resolve(qrUrl);
        }
      };
      
      img.onerror = () => {
        console.error('Failed to load image for styling');
        resolve(qrUrl);
      };
      
      img.src = qrUrl;
    });
  };

  const applyRoundedCorners = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const radius = 20;
    ctx.globalCompositeOperation = 'destination-in';
    createRoundedRect(ctx, 0, 0, width, height, radius);
    ctx.fill();
  };

  const applyCircularMask = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;
    
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
  };

  const applyGradientEffect = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, foregroundColor);
    gradient.addColorStop(1, '#FF6B6B');
    
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const applyNeonEffect = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.shadowColor = foregroundColor;
    ctx.shadowBlur = 20;
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = foregroundColor;
    ctx.fillRect(0, 0, width, height);
  };

  const applyCartoonEffect = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // Simple cartoon effect by reducing color depth
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.floor(data[i] / 64) * 64;     // Red
        data[i + 1] = Math.floor(data[i + 1] / 64) * 64; // Green
        data[i + 2] = Math.floor(data[i + 2] / 64) * 64; // Blue
      }
      
      ctx.putImageData(imageData, 0, 0);
    } catch (error) {
      console.error('Error applying cartoon effect:', error);
    }
  };

  const applyPixelatedEffect = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    try {
      const pixelSize = 8;
      ctx.imageSmoothingEnabled = false;
      
      // Scale down and then up to create pixelated effect
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        tempCanvas.width = width / pixelSize;
        tempCanvas.height = height / pixelSize;
        
        tempCtx.drawImage(ctx.canvas, 0, 0, tempCanvas.width, tempCanvas.height);
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(tempCanvas, 0, 0, width, height);
      }
    } catch (error) {
      console.error('Error applying pixelated effect:', error);
    }
  };

  const addLogoToQR = async (qrUrl: string, logoUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(qrUrl);
        return;
      }

      const qrImg = document.createElement('img');
      qrImg.crossOrigin = 'anonymous';
      
      qrImg.onload = () => {
        try {
          canvas.width = qrImg.width;
          canvas.height = qrImg.height;
          
          ctx.drawImage(qrImg, 0, 0);

          const logoImg = document.createElement('img');
          logoImg.crossOrigin = 'anonymous';
          
          logoImg.onload = () => {
            try {
              const logoSize = Math.min(canvas.width, canvas.height) * 0.2;
              const logoX = (canvas.width - logoSize) / 2;
              const logoY = (canvas.height - logoSize) / 2;
              
              // Draw white background for logo
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
              
              ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
              resolve(canvas.toDataURL());
            } catch (error) {
              console.error('Error adding logo:', error);
              resolve(qrUrl);
            }
          };
          
          logoImg.onerror = () => {
            console.error('Failed to load logo image');
            resolve(qrUrl);
          };
          
          logoImg.src = logoUrl;
        } catch (error) {
          console.error('Error in logo processing:', error);
          resolve(qrUrl);
        }
      };
      
      qrImg.onerror = () => {
        console.error('Failed to load QR image for logo');
        resolve(qrUrl);
      };
      
      qrImg.src = qrUrl;
    });
  };

  useEffect(() => {
    if (inputText.trim()) {
      generateQRCode(inputText);
    }
  }, [inputText, qrType, qrStyle, foregroundColor, backgroundColor, qrSize, errorCorrectionLevel, logoImage, uploadedImage]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'background' | 'logo') => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'background') {
          setUploadedImage(result);
          toast.success('Background image uploaded successfully!');
        } else {
          setLogoImage(result);
          toast.success('Logo uploaded successfully!');
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadQRCode = async (format: 'png' | 'svg' | 'pdf') => {
    if (!inputText.trim()) {
      toast.error('Please enter some text first');
      return;
    }

    try {
      let finalText = inputText;
      
      switch (qrType) {
        case 'email':
          if (!inputText.includes('mailto:')) {
            finalText = `mailto:${inputText}`;
          }
          break;
        case 'phone':
          if (!inputText.includes('tel:')) {
            finalText = `tel:${inputText}`;
          }
          break;
        case 'url':
          if (!inputText.startsWith('http://') && !inputText.startsWith('https://')) {
            finalText = `https://${inputText}`;
          }
          break;
        case 'wifi':
          const [ssid, password] = inputText.split(',');
          if (ssid && password) {
            finalText = `WIFI:T:WPA;S:${ssid.trim()};P:${password.trim()};H:false;;`;
          }
          break;
        case 'sms':
          if (!inputText.includes('sms:')) {
            finalText = `sms:${inputText}`;
          }
          break;
      }

      let dataUrl: string;
      
      if (format === 'png') {
        dataUrl = await QRCode.toDataURL(finalText, {
          width: 1024,
          margin: 2,
          color: {
            dark: foregroundColor,
            light: uploadedImage ? 'transparent' : backgroundColor,
          },
          errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
        });
      } else if (format === 'svg') {
        const svgString = await QRCode.toString(finalText, {
          type: 'svg',
          width: 1024,
          margin: 2,
          color: {
            dark: foregroundColor,
            light: uploadedImage ? 'transparent' : backgroundColor,
          },
          errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
        });
        dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
      } else {
        dataUrl = await QRCode.toDataURL(finalText, {
          width: 2048,
          margin: 4,
          color: {
            dark: foregroundColor,
            light: uploadedImage ? 'transparent' : backgroundColor,
          },
          errorCorrectionLevel: errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
        });
      }

      // Apply background image and styling to download version
      if (uploadedImage) {
        dataUrl = await applyBackgroundImage(dataUrl, uploadedImage);
      }
      if (qrStyle !== 'standard') {
        dataUrl = await applyAdvancedStyling(dataUrl, qrStyle);
      }
      if (logoImage) {
        dataUrl = await addLogoToQR(dataUrl, logoImage);
      }

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qrcode-${qrStyle}-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`🎉 Amazing ${qrStyle} QR code downloaded as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  const getPlaceholder = () => {
    switch (qrType) {
      case 'url':
        return 'https://example.com';
      case 'email':
        return 'example@email.com';
      case 'phone':
        return '+1234567890';
      case 'wifi':
        return 'NetworkName, Password';
      case 'sms':
        return '+1234567890';
      default:
        return 'Enter your text here';
    }
  };

  const presetColors = [
    '#8B5CF6', '#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#14B8A6', '#F97316',
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ];

  const qrStyles = [
    { value: 'standard', label: '🔳 Standard', description: 'Classic QR code' },
    { value: 'rounded', label: '🔲 Rounded', description: 'Smooth rounded corners' },
    { value: 'circular', label: '⭕ Circular', description: 'Perfect circle shape' },
    { value: 'gradient', label: '🌈 Gradient', description: 'Beautiful color gradient' },
    { value: 'neon', label: '✨ Neon', description: 'Glowing neon effect' },
    { value: 'cartoon', label: '🎨 Cartoon', description: 'Fun cartoon style' },
    { value: 'pixelated', label: '🎮 Pixelated', description: 'Retro pixel art' }
  ];

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-2xl border-0 bg-card/20 backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
      <div className="relative z-10">
        <CardHeader className="text-center pb-6">
          <CardTitle className="flex items-center justify-center gap-3 text-4xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
            <QrCode className="h-12 w-12 text-primary animate-pulse" />
            Incredible QR Generator Pro
          </CardTitle>
          <p className="text-muted-foreground mt-2 text-xl">Create stunning, artistic QR codes with advanced styling and effects</p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qr-type" className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      QR Code Type
                    </Label>
                    <Select value={qrType} onValueChange={setQrType}>
                      <SelectTrigger className="transition-all duration-300 hover:border-primary/70 focus:border-primary hover:shadow-lg hover:shadow-primary/25">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">📝 Text</SelectItem>
                        <SelectItem value="url">🌐 URL</SelectItem>
                        <SelectItem value="email">📧 Email</SelectItem>
                        <SelectItem value="phone">📱 Phone</SelectItem>
                        <SelectItem value="wifi">📶 WiFi</SelectItem>
                        <SelectItem value="sms">💬 SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="error-level" className="text-sm font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Error Correction
                    </Label>
                    <Select value={errorCorrectionLevel} onValueChange={setErrorCorrectionLevel}>
                      <SelectTrigger className="transition-all duration-300 hover:border-primary/70 focus:border-primary hover:shadow-lg hover:shadow-primary/25">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%)</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input-text" className="text-sm font-semibold">Content</Label>
                  <Input
                    id="input-text"
                    type="text"
                    placeholder={getPlaceholder()}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="transition-all duration-300 hover:border-primary/70 focus:border-primary text-lg py-4 hover:shadow-lg hover:shadow-primary/25 bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qr-size" className="text-sm font-semibold flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      QR Size
                    </Label>
                    <Select value={qrSize} onValueChange={setQrSize}>
                      <SelectTrigger className="transition-all duration-300 hover:border-primary/70 focus:border-primary hover:shadow-lg hover:shadow-primary/25">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="200">Small (200px)</SelectItem>
                        <SelectItem value="300">Medium (300px)</SelectItem>
                        <SelectItem value="400">Large (400px)</SelectItem>
                        <SelectItem value="500">XL (500px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qr-style" className="text-sm font-semibold flex items-center gap-2">
                      <Wand2 className="h-4 w-4" />
                      Style
                    </Label>
                    <Select value={qrStyle} onValueChange={setQrStyle}>
                      <SelectTrigger className="transition-all duration-300 hover:border-primary/70 focus:border-primary hover:shadow-lg hover:shadow-primary/25">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {qrStyles.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Advanced Styling */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Advanced Styling
                </h3>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quick Colors</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setForegroundColor(color)}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-all duration-200 hover:shadow-xl hover:rotate-12"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fg-color" className="text-sm font-medium">Foreground</Label>
                    <div className="flex gap-2">
                      <Input
                        id="fg-color"
                        type="color"
                        value={foregroundColor}
                        onChange={(e) => setForegroundColor(e.target.value)}
                        className="w-14 h-14 rounded-lg border-2 cursor-pointer hover:scale-105 transition-transform duration-200"
                      />
                      <Input
                        type="text"
                        value={foregroundColor}
                        onChange={(e) => setForegroundColor(e.target.value)}
                        className="flex-1 bg-background/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bg-color" className="text-sm font-medium">Background</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bg-color"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-14 h-14 rounded-lg border-2 cursor-pointer hover:scale-105 transition-transform duration-200"
                        disabled={!!uploadedImage}
                      />
                      <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 bg-background/50 backdrop-blur-sm"
                        disabled={!!uploadedImage}
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Logo & Images
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Add Logo</Label>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => logoInputRef.current?.click()}
                          variant="outline" 
                          className="w-full hover:bg-primary/10 transition-all duration-300"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'logo')}
                          className="hidden"
                        />
                        {logoImage && (
                          <div className="relative">
                            <img src={logoImage} alt="Logo" className="w-full h-20 object-cover rounded border" />
                            <Button
                              onClick={() => setLogoImage(null)}
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1"
                            >
                              ×
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Background Image</Label>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="w-full hover:bg-primary/10 transition-all duration-300"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Background
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'background')}
                          className="hidden"
                        />
                        {uploadedImage && (
                          <div className="relative">
                            <img src={uploadedImage} alt="Background" className="w-full h-20 object-cover rounded border" />
                            <Button
                              onClick={() => setUploadedImage(null)}
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1"
                            >
                              ×
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {uploadedImage && (
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-blue-500/20">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        📷 Background image will blend with your QR code
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code Preview */}
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-xl rounded-2xl p-8 border border-border/30">
                {qrCodeUrl ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <img
                      src={qrCodeUrl}
                      alt="Generated QR Code"
                      className="relative mx-auto rounded-xl shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(139,92,246,0.3)] max-w-full"
                      style={{ maxWidth: `${qrSize}px`, width: '100%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="w-full h-72 flex items-center justify-center border-2 border-dashed border-primary/30 rounded-xl bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="text-center text-muted-foreground">
                      <QrCode className="h-20 w-20 mx-auto mb-4 opacity-50 animate-pulse" />
                      <p className="text-lg font-medium">Incredible QR Preview</p>
                      <p className="text-sm">Enter content to see your amazing QR code</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Style Preview */}
              {qrStyle !== 'standard' && (
                <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-4 border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    ✨ {qrStyles.find(s => s.value === qrStyle)?.description}
                  </p>
                </div>
              )}

              {/* Download Buttons */}
              {qrCodeUrl && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Download Your Masterpiece</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      onClick={() => downloadQRCode('png')}
                      className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-primary/50 group"
                    >
                      <Download className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                      PNG
                    </Button>
                    <Button
                      onClick={() => downloadQRCode('svg')}
                      variant="outline"
                      className="hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 hover:border-primary transition-all duration-300 transform hover:scale-105 group"
                    >
                      <Download className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                      SVG
                    </Button>
                    <Button
                      onClick={() => downloadQRCode('pdf')}
                      variant="outline"
                      className="hover:bg-gradient-to-r hover:from-green-500/10 hover:to-blue-500/10 hover:border-green-500 hover:text-green-600 transition-all duration-300 transform hover:scale-105 group"
                    >
                      <Download className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                      High-Res
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default QRGenerator;
