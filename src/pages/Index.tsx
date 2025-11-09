import Hero from "@/components/Hero";
import StatsOverview from "@/components/StatsOverview";
import LatestResults from "@/components/LatestResults";
import DriverStandings from "@/components/DriverStandings";
import RaceCalendar from "@/components/RaceCalendar";
import BeginnersGuide from "@/components/BeginnersGuide";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <div id="content">
        <StatsOverview />
        <LatestResults />
        <DriverStandings />
        <RaceCalendar />
        <BeginnersGuide />
      </div>
      
      {/* Footer */}
      <footer className="border-t border-border bg-racing-track py-8">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            F1 Data Insights © 2024 | Data provided by Python API
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Built for F1 fans • Statistics • Analysis • Insights
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;