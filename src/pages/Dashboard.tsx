//@ts-nocheck
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import { FileArchive, TrendingDown, Clock, HardDrive, Plus } from "lucide-react";
import axiosInstance from "@/lib/api";
import { useEffect, useState } from "react";
import tokenService from "@/lib/token.service";

const Dashboard = () => {
  const [filedata, setFileData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Calculate time ago from created_at
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  // Calculate statistics from filedata
  const calculateStats = () => {
    if (filedata.length === 0) return null;

    const totalCompressions = filedata.length;
    
    // Average compression ratio
    const avgRatio = filedata.reduce((sum, file) => 
      sum + parseFloat(file.compression_ratio), 0) / totalCompressions;
    
    // Total space saved
    const totalSpaceSaved = filedata.reduce((sum, file) => 
      sum + (parseInt(file.original_size_bits) - parseInt(file.compressed_size_bits)) / 8, 0);
    
    // Format space saved
    const formatSpaceSaved = (bytes) => {
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

    // Estimate time saved (rough calculation based on file sizes)
    const estimatedTimeSaved = (totalSpaceSaved / 1000000) * 0.1; // Rough estimate in hours

    return {
      totalCompressions,
      avgCompressionRatio: avgRatio,
      spaceSaved: formatSpaceSaved(totalSpaceSaved),
      timeSaved: `${estimatedTimeSaved.toFixed(1)}h`
    };
  };

  const stats = calculateStats();
  const recentCompressions = filedata
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3); // Get 3 most recent files

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome back! Here's your compression overview.</p>
          </div>
          <Link to="/compress">
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              New Compression
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Total Compressions"
            value={stats ? stats.totalCompressions.toString() : "0"}
            icon={FileArchive}
            trend={stats ? `+${stats.totalCompressions} total files` : "No compressions yet"}
            trendUp={true}
          />
          <StatCard 
            title="Avg. Compression Ratio"
            value={stats ? `${(stats.avgCompressionRatio * 100).toFixed(1)}%` : "0%"}
            icon={TrendingDown}
            trend={stats ? `${((1 - stats.avgCompressionRatio) * 100).toFixed(1)}% space saved` : "No data"}
            trendUp={true}
          />
          <StatCard 
            title="Space Saved"
            value={stats ? stats.spaceSaved : "0 B"}
            icon={HardDrive}
            trend={stats ? "Total compressed space" : "No space saved yet"}
            trendUp={true}
          />
        </div>

        {/* Recent Compressions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Compressions</CardTitle>
            <CardDescription>Your latest compression activities</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading recent compressions...</p>
                </div>
              </div>
            ) : recentCompressions.length > 0 ? (
              <>
                <div className="space-y-4">
                  {recentCompressions.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileArchive className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{file.filename}</p>
                          <p className="text-sm text-muted-foreground">{getTimeAgo(file.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatFileSize(file.original_size_bits)} → {formatFileSize(file.compressed_size_bits)}
                        </p>
                        <p className="text-sm text-accent">
                          {getCompressionRatioPercentage(file.compression_ratio)} reduction
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link to="/history">
                    <Button variant="outline">View All History</Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FileArchive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No compression history yet</p>
                <Link to="/compress">
                  <Button>Start Your First Compression</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;