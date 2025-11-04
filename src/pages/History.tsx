import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navbar from "@/components/Navbar";
import { Search, FileArchive, Eye } from "lucide-react";

const History = () => {
  // Mock data
  const compressionHistory = [
    { id: 1, name: "database_backup.sql", size: "2.4 GB", compressed: "890 MB", ratio: "63%", algorithm: "Huffman", date: "2024-01-15" },
    { id: 2, name: "user_data.json", size: "156 MB", compressed: "45 MB", ratio: "71%", algorithm: "LZW", date: "2024-01-15" },
    { id: 3, name: "logs_2024.txt", size: "890 MB", compressed: "124 MB", ratio: "86%", algorithm: "Hybrid", date: "2024-01-14" },
    { id: 4, name: "images_archive.zip", size: "1.2 GB", compressed: "456 MB", ratio: "62%", algorithm: "LZW", date: "2024-01-14" },
    { id: 5, name: "report_Q4.pdf", size: "45 MB", compressed: "12 MB", ratio: "73%", algorithm: "Huffman", date: "2024-01-13" },
  ];

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
                <Input placeholder="Search files..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                {compressionHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileArchive className="h-4 w-4 text-muted-foreground" />
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell className="text-accent">{item.compressed}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                        {item.ratio}
                      </span>
                    </TableCell>
                    <TableCell>{item.algorithm}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="text-right">
                      <Link to={`/results/${item.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default History;
