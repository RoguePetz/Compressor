import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileArchive, LayoutDashboard, History, User, LogOut } from "lucide-react";

interface NavbarProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const Navbar = ({ isAuthenticated = false, onLogout }: NavbarProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <FileArchive className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            CompressDB
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-2 transition-colors ${
                  isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              <Link 
                to="/compress" 
                className={`flex items-center gap-2 transition-colors ${
                  isActive('/compress') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileArchive className="h-4 w-4" />
                <span className="hidden md:inline">Compress</span>
              </Link>
              <Link 
                to="/history" 
                className={`flex items-center gap-2 transition-colors ${
                  isActive('/history') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <History className="h-4 w-4" />
                <span className="hidden md:inline">History</span>
              </Link>
              <Link 
                to="/profile" 
                className={`flex items-center gap-2 transition-colors ${
                  isActive('/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Profile</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
