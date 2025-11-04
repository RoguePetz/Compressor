import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Download, FileArchive, Clock, TrendingDown, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Results = () => {
  const { id } = useParams();

  // Mock data
  const compressionData = {
    fileName: "database_backup.sql",
    originalSize: "2.4 GB",
    compressedSize: "890 MB",
    ratio: "63%",
    algorithm: "Huffman Coding",
    compressionTime: "2.3s",
    date: "Jan 15, 2024 at 3:45 PM"
  };

  const chartData = [
    { name: "Original", size: 2400 },
    { name: "Compressed", size: 890 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-4xl font-bold">Compression Complete!</h1>
            <p className="text-muted-foreground">Your file has been successfully compressed</p>
          </div>

          {/* Results Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileArchive className="h-5 w-5" />
                  File Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">File Name</p>
                  <p className="font-medium">{compressionData.fileName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Algorithm Used</p>
                  <p className="font-medium">{compressionData.algorithm}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Compressed On</p>
                  <p className="font-medium">{compressionData.date}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Compression Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Original Size</p>
                  <p className="font-medium">{compressionData.originalSize}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Compressed Size</p>
                  <p className="font-medium text-accent">{compressionData.compressedSize}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Compression Ratio</p>
                  <p className="font-medium text-accent text-2xl">{compressionData.ratio}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Size Comparison</CardTitle>
              <CardDescription>Visual representation of compression efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Size (MB)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="size" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Download Compressed File
            </Button>
            <Link to="/compress" className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                Compress Another File
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
