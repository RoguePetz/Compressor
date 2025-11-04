import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import { FileArchive, TrendingDown, Clock, HardDrive, Plus } from "lucide-react";

const Dashboard = () => {
  // Mock data
  const recentCompressions = [
    { id: 1, name: "database_backup.sql", size: "2.4 GB", compressed: "890 MB", ratio: "63%", date: "2 hours ago" },
    { id: 2, name: "user_data.json", size: "156 MB", compressed: "45 MB", ratio: "71%", date: "5 hours ago" },
    { id: 3, name: "logs_2024.txt", size: "890 MB", compressed: "124 MB", ratio: "86%", date: "1 day ago" },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Compressions"
            value="127"
            icon={FileArchive}
            trend="+12% from last month"
            trendUp={true}
          />
          <StatCard 
            title="Avg. Compression Ratio"
            value="68%"
            icon={TrendingDown}
            trend="+5% improvement"
            trendUp={true}
          />
          <StatCard 
            title="Total Time Saved"
            value="3.2h"
            icon={Clock}
          />
          <StatCard 
            title="Space Saved"
            value="12.4 GB"
            icon={HardDrive}
            trend="+2.1 GB this week"
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
            <div className="space-y-4">
              {recentCompressions.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileArchive className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.size} → {item.compressed}</p>
                    <p className="text-sm text-accent">{item.ratio} reduction</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link to="/history">
                <Button variant="outline">View All History</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
