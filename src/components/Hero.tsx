import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroImage from "@/assets/f1-hero.jpg";

const Hero = () => {
  const scrollToContent = () => {
    document.getElementById("content")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Speed Line Animation */}
      <div className="absolute inset-0 bg-gradient-speed animate-speed-line opacity-30" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 inline-block animate-pulse-red">
          <div className="h-1 w-20 bg-primary" />
        </div>
        
        <h1 className="mb-6 text-6xl font-black uppercase tracking-tighter text-foreground md:text-8xl animate-fade-in-up">
          F1 Data
          <span className="block bg-gradient-hero bg-clip-text text-transparent">
            Insights
          </span>
        </h1>
        
        <p className="mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Explore comprehensive Formula 1 statistics, driver standings, race results, 
          and historical data. Your ultimate destination for F1 analytics.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-racing font-bold uppercase tracking-wide"
            onClick={scrollToContent}
          >
            Explore Data
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-wide"
          >
            Learn F1 Basics
          </Button>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer"
          aria-label="Scroll down"
        >
          <ChevronDown className="h-8 w-8 text-primary" />
        </button>
      </div>
    </div>
  );
};

export default Hero;