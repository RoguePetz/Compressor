import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { Upload, FileArchive, Zap, Download, FileText, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/api";

interface CompressionResult {
  cols: number;
  compressed_size_bits: number;
  compression_ratio: number;
  file_id: number;
  filename: string;
  m: number;
  message: string;
  original_size_bits: number;
  rows: number;
}

const Compress = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState("golomb");
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }
  
    setIsCompressing(true);
    setProgress(0);
  
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    try {
      const response = await axiosInstance.post(
        "/compress",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "ngrok-skip-browser-warning": "69420",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            }
          },
        }
      );
  
      const resData = response?.data;
      setCompressionResult(resData);
      setShowResultModal(true);
      toast.success("File compressed successfully!");
      console.log("Server response:", resData);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Compression failed");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
    // Optionally navigate to results page or reset the form
    // navigate("/results/1");
  };

  const formatFileSize = (bits: number) => {
    const bytes = bits / 8;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getCompressionEfficiency = (ratio: number) => {
    if (ratio < 0.5) return { text: "Excellent", color: "text-green-600" };
    if (ratio < 0.8) return { text: "Good", color: "text-blue-600" };
    if (ratio < 1) return { text: "Moderate", color: "text-yellow-600" };
    return { text: "No Compression", color: "text-red-600" };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold">Compress Files</h1>
            <p className="text-muted-foreground mt-2">Upload and compress your files using Golomb coding</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
              <CardDescription>Select a file to compress with Golomb algorithm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Zone */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer space-y-4 block">
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      {/* <p className="text-sm text-muted-foreground">Maximum file size: 100MB</p> */}
                    </div>
                  )}
                </label>
              </div>

              {/* Algorithm Selection - Only Golomb */}
              <div className="space-y-2">
                <Label htmlFor="algorithm">Compression Algorithm</Label>
                <Select value={algorithm} onValueChange={setAlgorithm} disabled>
                  <SelectTrigger id="algorithm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="golomb">Golomb Coding</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Golomb coding is the only available algorithm
                </p>
              </div>

              {/* Progress */}
              {isCompressing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Compressing with Golomb coding...</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {/* Action Button */}
              <Button 
                onClick={handleCompress} 
                disabled={isCompressing}
                className="w-full gap-2"
                size="lg"
              >
                {isCompressing ? (
                  <>Processing with Golomb...</>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Compress with Golomb
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileArchive className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">About Golomb Coding</h3>
                  <p className="text-sm text-muted-foreground">
                    Golomb coding is a lossless data compression method using a family of data codes 
                    to encode non-negative integers. It's particularly effective for data with 
                    geometric distributions and is widely used in image and video compression.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Compression Successful!
            </DialogTitle>
            <DialogDescription>
              Your file has been compressed using Golomb coding.
            </DialogDescription>
          </DialogHeader>

          {compressionResult && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">{compressionResult.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {compressionResult.rows} rows × {compressionResult.cols} columns
                  </p>
                </div>
              </div>

              {/* Compression Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Original Size</p>
                  <p className="text-lg font-bold">
                    {formatFileSize(compressionResult.original_size_bits)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Compressed Size</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatFileSize(compressionResult.compressed_size_bits)}
                  </p>
                </div>
              </div>

              {/* Compression Ratio */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Compression Ratio</p>
                  <span className={`text-sm font-bold ${
                    getCompressionEfficiency(compressionResult.compression_ratio).color
                  }`}>
                    {(compressionResult.compression_ratio * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(1 - compressionResult.compression_ratio) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Efficiency: {getCompressionEfficiency(compressionResult.compression_ratio).text}
                </p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Golomb Parameter</p>
                  <p className="text-sm font-medium">m = {compressionResult.m}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">File ID</p>
                  <p className="text-sm font-medium">#{compressionResult.file_id}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
                {/* <Button 
                  className="flex-1 gap-2"
                  onClick={() => navigate(`/results/${compressionResult.file_id}`)}
                >
                  <BarChart3 className="h-4 w-4" />
                  View Details
                </Button> */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Compress;