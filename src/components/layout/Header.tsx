import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground group-hover:bg-foreground/90 transition-colors">
            <Shield className="h-4 w-4 text-background" />
          </div>
          <span className="text-lg font-semibold tracking-tight">AleoSynth</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm transition-colors hover:text-foreground ${
              isHome ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            to="/upload"
            className={`text-sm transition-colors hover:text-foreground ${
              location.pathname === "/upload" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Generate
          </Link>
          <Link
            to="/results"
            className={`text-sm transition-colors hover:text-foreground ${
              location.pathname === "/results" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Results
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="hero" size="sm" asChild>
            <Link to="/upload">Start Generating</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
