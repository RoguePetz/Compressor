import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { Search, FileArchive, Eye, Loader, Zap, FileText, BarChart3 } from "lucide-react";
import axiosInstance from "@/lib/api";

const History = () => {
  const [filedata, setFileData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const FetchStoredFiles = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        "/list-files",
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );
      
      const resData = response?.data;
      if (resData && resData.files) {
        setFileData(resData.files);
      }
    } catch (error: any) {
      console.error("Error fetching files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    FetchStoredFiles();
  }, []);

  // Format file size from bits to readable format
  const formatFileSize = (bits) => {
    const bytes = parseInt(bits) / 8;
    if (bytes >= 1000000000) {
      return `${(bytes / 1000000000).toFixed(1)} GB`;
    } else if (bytes >= 1000000) {
      return `${(bytes / 1000000).toFixed(1)} MB`;
    } else if (bytes >= 1000) {
      return `${(bytes / 1000).toFixed(1)} KB`;
    } else {
      return `${bytes} B`;
    }
  };

  // Calculate compression ratio percentage
  const getCompressionRatioPercentage = (ratio) => {
    return `${(parseFloat(ratio) * 100).toFixed(1)}%`;
  };

  // Get compression efficiency text and color
  const getCompressionEfficiency = (ratio) => {
    const efficiency = parseFloat(ratio);
    if (efficiency < 0.5) {
      return { text: "Excellent", color: "text-green-600" };
    } else if (efficiency < 0.7) {
      return { text: "Good", color: "text-yellow-600" };
    } else {
      return { text: "Fair", color: "text-orange-600" };
    }
  };

  // Handle view button click
  const handleViewClick = (file) => {
    setSelectedFile(file);
    setShowResultModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowResultModal(false);
    setSelectedFile(null);
  };

  // Filter files based on search term
  const filteredFiles = filedata.filter(file => 
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Compression History</h1>
          <p className="text-muted-foreground mt-2">View and manage all your compression activities</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>All Compressions</CardTitle>
                <CardDescription>Complete history of your file compressions</CardDescription>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search files..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading compression history...</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Original Size</TableHead>
                    <TableHead>Compressed</TableHead>
                    <TableHead>Ratio</TableHead>
                    <TableHead>Algorithm</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.length > 0 ? (
                    filteredFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileArchive className="h-4 w-4 text-muted-foreground" />
                            {file.filename}
                          </div>
                        </TableCell>
                        <TableCell>{formatFileSize(file.original_size_bits)}</TableCell>
                        <TableCell className="text-accent">
                          {formatFileSize(file.compressed_size_bits)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                            {getCompressionRatioPercentage(file.compression_ratio)}
                          </span>
                        </TableCell>
                        <TableCell>Hybrid</TableCell>
                        <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleViewClick(file)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {filedata.length === 0 ? "No compression history found" : "No files match your search"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Result Modal */}
        <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Compression Details
              </DialogTitle>
              <DialogDescription>
                File compression details using Golomb coding.
              </DialogDescription>
            </DialogHeader>

            {selectedFile && (
              <div className="space-y-4">
                {/* File Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">{selectedFile.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedFile.rows} rows × {selectedFile.cols} columns
                    </p>
                  </div>
                </div>

                {/* Compression Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Original Size</p>
                    <p className="text-lg font-bold">
                      {formatFileSize(selectedFile.original_size_bits)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Compressed Size</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatFileSize(selectedFile.compressed_size_bits)}
                    </p>
                  </div>
                </div>

                {/* Compression Ratio */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Compression Ratio</p>
                    <span className={`text-sm font-bold ${
                      getCompressionEfficiency(selectedFile.compression_ratio).color
                    }`}>
                      {(parseFloat(selectedFile.compression_ratio) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(1 - parseFloat(selectedFile.compression_ratio)) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Efficiency: {getCompressionEfficiency(selectedFile.compression_ratio).text}
                  </p>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Golomb Parameter</p>
                    <p className="text-sm font-medium">m = {selectedFile.m}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">File ID</p>
                    <p className="text-sm font-medium">#{selectedFile.id}</p>
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
                    onClick={() => {
                      // Navigate to detailed results page if needed
                      handleCloseModal();
                    }}
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
    </div>
  );
};

export default History;