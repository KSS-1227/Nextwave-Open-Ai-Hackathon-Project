import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, FileText, Check, Edit, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExtractedData {
  date: string;
  description: string;
  amount: number;
  category: string;
}

export function DocumentUploader() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demo data for OCR simulation
  const demoExtractedData: ExtractedData[] = [
    { date: "2024-01-15", description: "Sale - Samsung Mobile", amount: 25000, category: "Revenue" },
    { date: "2024-01-15", description: "Purchase - Xiaomi Stock", amount: -18000, category: "Inventory" },
    { date: "2024-01-16", description: "Electricity Bill", amount: -2500, category: "Utilities" },
    { date: "2024-01-16", description: "Staff Salary", amount: -15000, category: "Salary" },
    { date: "2024-01-17", description: "Sale - iPhone Accessories", amount: 3200, category: "Revenue" },
  ];

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Simulate OCR processing
    setTimeout(() => {
      setExtractedData(demoExtractedData);
      setIsProcessing(false);
    }, 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const saveExtractedData = () => {
    // Simulate saving to database
    alert("Data saved successfully! Check the dashboard for updated insights.");
    setIsEditing(false);
  };

  const startCamera = () => {
    // In a real app, this would open camera
    alert("Camera feature would open here. For demo, uploading sample ledger.");
    // Simulate camera capture
    const mockFile = new File([""], "camera-capture.jpg", { type: "image/jpeg" });
    handleFileUpload(mockFile);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Financial Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!uploadedFile ? (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4 cursor-pointer hover:border-primary/50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Upload your ledger or receipts</h3>
                <p className="text-muted-foreground">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports: PDF, JPG, PNG (Max 10MB)
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button size="lg" className="btn-primary">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <Button size="lg" variant="outline" onClick={(e) => { e.stopPropagation(); startCamera(); }}>
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploadedFile(null);
                    setExtractedData([]);
                    setPreviewUrl("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {isProcessing && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Processing document with AI OCR...</p>
                </div>
              )}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Preview & Extracted Data */}
      {extractedData.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Document Preview */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="text-base">Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {previewUrl ? (
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Document processed successfully</p>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">No preview available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extracted Data */}
          <Card className="modern-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Extracted Data</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    ✓ {extractedData.length} entries found
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {extractedData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.description}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <div className={cn(
                      "text-sm font-medium",
                      item.amount > 0 ? "text-success" : "text-destructive"
                    )}>
                      {item.amount > 0 ? "+" : ""}₹{Math.abs(item.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button onClick={saveExtractedData} className="w-full btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}