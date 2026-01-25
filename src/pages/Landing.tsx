import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Download, Zap, CheckCircle2, ArrowRight, Database, FileCheck } from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: Lock,
      title: "Upload private data securely",
      description: "Your original dataset remains encrypted and never leaves your control.",
    },
    {
      icon: Zap,
      title: "Generate synthetic data instantly",
      description: "Create realistic datasets in seconds with our advanced algorithms.",
    },
    {
      icon: Download,
      title: "Export synthetic CSV for research & ML",
      description: "Download privacy-safe data ready for analysis and model training.",
    },
    {
      icon: Shield,
      title: "Proof-based privacy workflow",
      description: "Aleo-ready verification ensures your data transformation is verifiable.",
    },
  ];

  const useCases = [
    { title: "Research Datasets", description: "Share data with collaborators safely" },
    { title: "ML Model Training", description: "Train models without privacy risks" },
    { title: "Analytics", description: "Analyze patterns without exposing PII" },
    { title: "Public Data Sharing", description: "Release datasets without leaking real users" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        
        <div className="container relative z-10 px-4 py-32 md:py-40">
          <div className="mx-auto max-w-4xl text-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground mb-8">
                <Shield className="h-4 w-4" />
                <span>Privacy-Preserving Data Generation</span>
              </div>
            </div>

            <h1 className="animate-fade-up text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl mb-6" style={{ animationDelay: "0.1s" }}>
              <span className="text-gradient">AleoSynth</span>
            </h1>
            
            <p className="animate-fade-up text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 text-balance" style={{ animationDelay: "0.2s" }}>
              Generate realistic synthetic datasets without exposing sensitive data.
            </p>

            <div className="animate-fade-up flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/upload" className="gap-2">
                  Start Generating
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/demo">View Demo Dataset</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 border-t border-border/50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Privacy-first synthetic data
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Create datasets that maintain statistical properties while protecting individual privacy.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group glass-card p-6 hover:border-foreground/20 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-foreground/10 transition-colors">
                  <feature.icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32 border-t border-border/50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to generate privacy-safe synthetic data.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Upload Dataset", description: "Drag and drop your CSV file. Your data stays private.", icon: Database },
              { step: "02", title: "Configure Settings", description: "Select sensitive columns and generation parameters.", icon: FileCheck },
              { step: "03", title: "Export Results", description: "Download your synthetic dataset ready for use.", icon: Download },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-muted/30 mb-4">{item.step}</div>
                <div className="h-12 w-12 rounded-lg bg-foreground flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-background" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 right-0 translate-x-1/2">
                    <ArrowRight className="h-6 w-6 text-muted" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 md:py-32 border-t border-border/50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for every use case
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="glass-card p-6 text-center hover:border-foreground/20 transition-all">
                <CheckCircle2 className="h-6 w-6 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-1">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 border-t border-border/50">
        <div className="container px-4">
          <div className="glass-card glow-border p-12 md:p-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to protect your data?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Start generating privacy-safe synthetic datasets in minutes.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/upload" className="gap-2">
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">AleoSynth</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 AleoSynth. Privacy-preserving synthetic data generation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
