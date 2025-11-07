//@ts-nocheck
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { Search, FileArchive, Eye, Loader, Zap, FileText, BarChart3, PieChart, TrendingDown, Download, Calendar, HardDrive, Sparkles, ArrowUpDown } from "lucide-react";
import axiosInstance from "@/lib/api";
import { useNavigate } from "react-router-dom";

// Import chart components
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const History = () => {
  const navigate = useNavigate();
  const [filedata, setFileData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeChart, setActiveChart] = useState("sizeComparison");
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
    if (efficiency < 0.3) {
      return { text: "Excellent", color: "text-green-600", bgColor: "bg-green-100", borderColor: "border-green-200" };
    } else if (efficiency < 0.5) {
      return { text: "Good", color: "text-blue-600", bgColor: "bg-blue-100", borderColor: "border-blue-200" };
    } else if (efficiency < 0.7) {
      return { text: "Fair", color: "text-yellow-600", bgColor: "bg-yellow-100", borderColor: "border-yellow-200" };
    } else {
      return { text: "Poor", color: "text-red-600", bgColor: "bg-red-100", borderColor: "border-red-200" };
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

  // Download file as CSV
  const handleDownload = async (file) => {
    setIsDownloading(true);
    try {
      const response = await axiosInstance.get(
        `/decompress/${file.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "ngrok-skip-browser-warning": "69420",
          },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `decompressed_${file.filename.replace('.gz', '')}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error("Error downloading file:", error);
      alert('Failed to download file. Please try again.');
    } finally {
      setIsDownloading(false);
      handleCloseModal();
    }
  };

  // Filter files based on search term
  const filteredFiles = filedata.filter(file => 
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare data for charts
  const prepareChartData = () => {
    const sortedFiles = [...filedata].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    return sortedFiles.map(file => ({
      name: file.filename.length > 10 ? file.filename.substring(0, 8) + '...' : file.filename,
      originalSize: parseInt(file.original_size_bits) / 8,
      compressedSize: parseInt(file.compressed_size_bits) / 8,
      compressionRatio: parseFloat(file.compression_ratio) * 100,
      savings: (1 - parseFloat(file.compression_ratio)) * 100,
      date: new Date(file.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: file.created_at,
      algorithm: "Hybrid",
      efficiency: getCompressionEfficiency(file.compression_ratio).text
    }));
  };

  const chartData = prepareChartData();

  // Modern color palette
  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const SIZE_COLORS = ['#6366F1', '#10B981'];
  const GRADIENT_COLORS = {
    primary: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  };

  // Calculate overall statistics
  const overallStats = {
    totalFiles: filedata.length,
    totalOriginalSize: filedata.reduce((sum, file) => sum + parseInt(file.original_size_bits) / 8, 0),
    totalCompressedSize: filedata.reduce((sum, file) => sum + parseInt(file.compressed_size_bits) / 8, 0),
    averageRatio: filedata.length > 0 ? 
      filedata.reduce((sum, file) => sum + parseFloat(file.compression_ratio), 0) / filedata.length : 0,
    averageSavings: filedata.length > 0 ? 
      (1 - filedata.reduce((sum, file) => sum + parseFloat(file.compression_ratio), 0) / filedata.length) * 100 : 0
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Size') ? formatFileSize(entry.value * 8) : `${entry.value.toFixed(1)}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navbar isAuthenticated={true} />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            Compression History
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track and analyze your file compression performance with beautiful analytics
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 p-1 bg-gray-100/50 rounded-2xl">
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="files" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileArchive className="w-4 h-4 mr-2" />
              All Files
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Statistics Cards - Modern Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-blue-50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-600">Total Files</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{overallStats.totalFiles}</div>
                  <p className="text-xs text-gray-500 mt-1">Compressed files</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-green-50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-600">Space Saved</CardTitle>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{overallStats.averageSavings.toFixed(1)}%</div>
                  <p className="text-xs text-gray-500 mt-1">Average reduction</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-purple-50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-600">Original Size</CardTitle>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <HardDrive className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{formatFileSize(overallStats.totalOriginalSize * 8)}</div>
                  <p className="text-xs text-gray-500 mt-1">Total before compression</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-orange-50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-600">Compressed Size</CardTitle>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Download className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{formatFileSize(overallStats.totalCompressedSize * 8)}</div>
                  <p className="text-xs text-gray-500 mt-1">Total after compression</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                      Analytics Dashboard
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                      Interactive visualization of your compression performance
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 bg-gray-100/50 p-1 rounded-2xl">
                    {[
                      { id: "sizeComparison", label: "Sizes", icon: ArrowUpDown },
                      { id: "ratioTrend", label: "Trend", icon: TrendingDown },
                      { id: "algorithmDistribution", label: "Efficiency", icon: Sparkles }
                    ].map((item) => (
                      <Button 
                        key={item.id}
                        variant={activeChart === item.id ? "default" : "ghost"} 
                        size="sm"
                        onClick={() => setActiveChart(item.id)}
                        className={`rounded-xl gap-2 ${
                          activeChart === item.id 
                            ? 'bg-white shadow-sm text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <item.icon className="h-3 w-3" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 p-4 border">
                  {activeChart === "sizeComparison" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="originalSize" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={SIZE_COLORS[0]} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={SIZE_COLORS[0]} stopOpacity={0.2}/>
                          </linearGradient>
                          <linearGradient id="compressedSize" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={SIZE_COLORS[1]} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={SIZE_COLORS[1]} stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          verticalAlign="top" 
                          height={36}
                          iconType="circle"
                          iconSize={8}
                        />
                        <Bar 
                          dataKey="originalSize" 
                          name="Original Size" 
                          fill="url(#originalSize)" 
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="compressedSize" 
                          name="Compressed Size" 
                          fill="url(#compressedSize)" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {activeChart === "ratioTrend" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          verticalAlign="top" 
                          height={36}
                          iconType="circle"
                          iconSize={8}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="savings" 
                          name="Space Saved" 
                          stroke="#10B981" 
                          fill="url(#savingsGradient)" 
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="compressionRatio" 
                          name="Compression Ratio" 
                          stroke="#6366F1" 
                          strokeWidth={3}
                          dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {activeChart === "algorithmDistribution" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={chartData.reduce((acc, item) => {
                            const existing = acc.find(a => a.name === item.efficiency);
                            if (existing) {
                              existing.value += 1;
                            } else {
                              acc.push({ name: item.efficiency, value: 1 });
                            }
                            return acc;
                          }, [])}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={120}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                              stroke="#fff" 
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} files`, 'Count']} />
                        <Legend 
                          layout="vertical" 
                          verticalAlign="middle" 
                          align="right"
                          wrapperStyle={{ right: -50 }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                      File Library
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Browse and manage all your compressed files
                    </CardDescription>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search files..." 
                      className="pl-10 rounded-xl bg-white/50 border-gray-200" 
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
                  <div className="rounded-2xl border border-gray-200 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gradient-to-r from-gray-50 to-blue-50/50">
                        <TableRow className="hover:bg-transparent border-b border-gray-200">
                          <TableHead className="font-semibold text-gray-900 py-4">File Name</TableHead>
                          <TableHead className="font-semibold text-gray-900">Original</TableHead>
                          <TableHead className="font-semibold text-gray-900">Compressed</TableHead>
                          <TableHead className="font-semibold text-gray-900">Ratio</TableHead>
                          <TableHead className="font-semibold text-gray-900">Efficiency</TableHead>
                          <TableHead className="font-semibold text-gray-900">Date</TableHead>
                          <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFiles.length > 0 ? (
                          filteredFiles.map((file) => {
                            const efficiency = getCompressionEfficiency(file.compression_ratio);
                            return (
                              <TableRow key={file.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                                <TableCell className="font-medium py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                      <FileArchive className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="font-semibold text-gray-900">{file.filename}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-gray-600 font-medium">{formatFileSize(file.original_size_bits)}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-green-600 font-semibold">{formatFileSize(file.compressed_size_bits)}</span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium">
                                    {getCompressionRatioPercentage(file.compression_ratio)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={`${efficiency.bgColor} ${efficiency.color} border ${efficiency.borderColor} font-medium`}>
                                    {efficiency.text}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(file.created_at).toLocaleDateString()}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="gap-2 hover:bg-blue-100 hover:text-blue-700 rounded-lg"
                                    onClick={() => handleViewClick(file)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                              <FileArchive className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p className="text-lg font-semibold mb-2">No files found</p>
                              <p className="text-sm">
                                {filedata.length === 0 
                                  ? "Start by compressing your first file" 
                                  : "No files match your search criteria"}
                              </p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Result Modal */}
        <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
          <DialogContent className="sm:max-w-4xl border-0 bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm">
            <DialogHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-green-600 bg-clip-text text-transparent">
                    Compression Details
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Detailed analysis of your file compression using advanced algorithms
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedFile && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* File Info and Stats */}
                  <div className="space-y-6">
                    {/* File Info Card */}
                    <Card className="border-0 bg-white/50 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-100 rounded-xl">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{selectedFile.filename}</p>
                            <p className="text-sm text-gray-500">
                              {selectedFile.rows} rows × {selectedFile.cols} columns
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-0 bg-gradient-to-br from-white to-blue-50 shadow-sm">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm font-medium text-gray-600 mb-1">Original Size</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatFileSize(selectedFile.original_size_bits)}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-0 bg-gradient-to-br from-white to-green-50 shadow-sm">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm font-medium text-gray-600 mb-1">Compressed Size</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatFileSize(selectedFile.compressed_size_bits)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Efficiency Progress */}
                    <Card className="border-0 bg-white/50 shadow-sm">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-gray-600">Compression Efficiency</p>
                          <Badge className={getCompressionEfficiency(selectedFile.compression_ratio).bgColor + " " + getCompressionEfficiency(selectedFile.compression_ratio).color}>
                            {getCompressionEfficiency(selectedFile.compression_ratio).text}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Compression Ratio</span>
                            <span className="font-semibold text-gray-900">
                              {(parseFloat(selectedFile.compression_ratio) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(1 - parseFloat(selectedFile.compression_ratio)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Mini Chart */}
                  <Card className="border-0 bg-white/50 shadow-sm">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-4">Size Comparison</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              {
                                name: 'Comparison',
                                original: parseInt(selectedFile.original_size_bits) / 8,
                                compressed: parseInt(selectedFile.compressed_size_bits) / 8,
                              }
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [formatFileSize(value * 8), 'Size']}
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                              }}
                            />
                            <Legend />
                            <Bar 
                              dataKey="original" 
                              name="Original Size" 
                              fill="#6366F1" 
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                              dataKey="compressed" 
                              name="Compressed Size" 
                              fill="#10B981" 
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl border-gray-300 hover:bg-gray-50"
                    onClick={handleCloseModal}
                    disabled={isDownloading}
                  >
                    Close
                  </Button>
                  <Button 
                    className="flex-1 gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    onClick={() => handleDownload(selectedFile)}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {isDownloading ? "Downloading..." : "Download CSV"}
                  </Button>
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