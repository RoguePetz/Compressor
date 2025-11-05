import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { Upload, FileArchive, Zap } from "lucide-react";
import { toast } from "sonner";

const Compress = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [algorithm, setAlgorithm] = useState("golomb");
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);

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

    // Simulate compression progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            toast.success("File compressed successfully!");
            navigate("/results/1");
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
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
                      <p className="text-sm text-muted-foreground">Maximum file size: 100MB</p>
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
    </div>
  );
};

export default Compress;