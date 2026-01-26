import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/aleo/WalletButton";

const Header = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  // Don't show header on landing page (it has its own nav)
  if (isLanding) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-background/90 backdrop-blur-sm">
      <div className="container flex h-12 items-center justify-between">
        <Link to="/" className="text-xs font-medium tracking-widest uppercase">
          AleoSynth
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-[11px] tracking-wide uppercase transition-colors ${
              location.pathname === "/" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            to="/upload"
            className={`text-[11px] tracking-wide uppercase transition-colors ${
              location.pathname === "/upload" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Generate
          </Link>
          <Link
            to="/results"
            className={`text-[11px] tracking-wide uppercase transition-colors ${
              location.pathname === "/results" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Results
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <WalletButton />
          <Button variant="outline" size="sm" className="h-7 text-[10px] tracking-wide uppercase px-4 rounded-sm hidden sm:inline-flex" asChild>
            <Link to="/upload">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;