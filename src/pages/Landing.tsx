import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Landing = () => {
  const features = [
    {
      title: "Private Upload",
      description: "Your original dataset remains encrypted and never leaves your control.",
    },
    {
      title: "Instant Generation",
      description: "Create realistic synthetic datasets in seconds with advanced algorithms.",
    },
    {
      title: "Export Ready",
      description: "Download privacy-safe CSV/JSON data ready for research and ML training.",
    },
    {
      title: "Proof-Based Privacy",
      description: "Aleo-ready verification ensures your data transformation is verifiable.",
    },
  ];

  const useCases = [
    { title: "Research", description: "Share datasets with collaborators safely" },
    { title: "ML Training", description: "Train models without privacy risks" },
    { title: "Analytics", description: "Analyze patterns without exposing PII" },
    { title: "Public Sharing", description: "Release datasets without leaking real users" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-background/90 backdrop-blur-sm">
        <div className="container flex h-12 items-center justify-between">
          <span className="text-xs font-medium tracking-widest uppercase">AleoSynth</span>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-[11px] tracking-wide text-muted-foreground hover:text-foreground transition-colors uppercase">
              Home
            </Link>
            <Link to="/upload" className="text-[11px] tracking-wide text-muted-foreground hover:text-foreground transition-colors uppercase">
              Generate
            </Link>
            <Link to="/results" className="text-[11px] tracking-wide text-muted-foreground hover:text-foreground transition-colors uppercase">
              Results
            </Link>
            <Link to="/demo" className="text-[11px] tracking-wide text-muted-foreground hover:text-foreground transition-colors uppercase">
              Demo
            </Link>
          </div>

          <Button variant="outline" size="sm" className="h-7 text-[10px] tracking-wide uppercase px-4 rounded-sm" asChild>
            <Link to="/upload">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient">
        <div className="absolute inset-0 grid-pattern" />
        
        <div className="container relative z-10 px-4 pt-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="animate-fade-up mb-6">
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                Privacy-Preserving Synthetic Data
              </span>
            </div>

            <h1 className="animate-fade-up text-2xl md:text-4xl font-light tracking-tight mb-4" style={{ animationDelay: "0.1s" }}>
              Generate realistic datasets
              <br />
              <span className="text-muted-foreground">without exposing sensitive data</span>
            </h1>
            
            <p className="animate-fade-up text-xs text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed" style={{ animationDelay: "0.2s" }}>
              AleoSynth creates synthetic datasets that maintain statistical properties 
              while protecting individual privacy. Built for researchers, analysts, and ML engineers.
            </p>

            <div className="animate-fade-up flex items-center justify-center gap-3" style={{ animationDelay: "0.3s" }}>
              <Button variant="default" size="sm" className="h-8 text-[10px] tracking-wide uppercase px-5 rounded-sm" asChild>
                <Link to="/upload" className="gap-2">
                  Start Generating
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-[10px] tracking-wide uppercase px-5 rounded-sm" asChild>
                <Link to="/demo">View Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border/20">
        <div className="container px-4">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase block mb-3">
              Features
            </span>
            <h2 className="text-lg font-light">
              Privacy-first synthetic data generation
            </h2>
          </div>

          <div className="grid gap-px md:grid-cols-2 lg:grid-cols-4 border border-border/30">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 border-r border-b border-border/30 last:border-r-0 hover:bg-secondary/30 transition-colors"
              >
                <h3 className="text-xs font-medium mb-2 tracking-wide">{feature.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 border-t border-border/20">
        <div className="container px-4">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase block mb-3">
              Process
            </span>
            <h2 className="text-lg font-light">
              Three simple steps
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-2xl mx-auto">
            {[
              { step: "01", title: "Upload", description: "Drag and drop your CSV file securely" },
              { step: "02", title: "Configure", description: "Select sensitive columns and parameters" },
              { step: "03", title: "Export", description: "Download synthetic data ready for use" },
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="text-[10px] text-muted-foreground tracking-widest mb-2">{item.step}</div>
                <h3 className="text-xs font-medium mb-1">{item.title}</h3>
                <p className="text-[10px] text-muted-foreground">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block mt-4">
                    <ArrowRight className="h-3 w-3 text-muted-foreground/50 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 border-t border-border/20">
        <div className="container px-4">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase block mb-3">
              Use Cases
            </span>
            <h2 className="text-lg font-light">
              Built for every workflow
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-3xl mx-auto">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="p-4 border border-border/30 text-center hover:border-border/60 transition-colors">
                <h3 className="text-xs font-medium mb-1">{useCase.title}</h3>
                <p className="text-[10px] text-muted-foreground">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/20">
        <div className="container px-4">
          <div className="border border-border/30 p-10 text-center max-w-xl mx-auto">
            <h2 className="text-lg font-light mb-2">
              Ready to protect your data?
            </h2>
            <p className="text-[11px] text-muted-foreground mb-6">
              Start generating privacy-safe synthetic datasets in minutes.
            </p>
            <Button variant="default" size="sm" className="h-8 text-[10px] tracking-wide uppercase px-5 rounded-sm" asChild>
              <Link to="/upload" className="gap-2">
                Get Started
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/20">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground">AleoSynth</span>
            <p className="text-[10px] text-muted-foreground">
              Privacy-preserving synthetic data generation
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
