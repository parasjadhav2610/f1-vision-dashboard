import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, Users, Trophy, Zap, Timer, Map } from "lucide-react";

const guideItems = [
  {
    icon: Flag,
    title: "What is Formula 1?",
    description: "Formula 1 is the pinnacle of motorsport racing. It's a world championship featuring the fastest single-seater cars, driven by the world's best drivers on circuits around the globe.",
    color: "bg-primary/10 text-primary border-primary/20"
  },
  {
    icon: Users,
    title: "Teams & Drivers",
    description: "10 teams compete with 2 drivers each. Teams design and build their own cars, competing for the Constructors' Championship while drivers race for the Drivers' Championship.",
    color: "bg-primary/10 text-primary border-primary/20"
  },
  {
    icon: Trophy,
    title: "Points System",
    description: "Top 10 finishers score points: 25-18-15-12-10-8-6-4-2-1. The driver with the fastest lap gets 1 bonus point if they finish in the top 10.",
    color: "bg-primary/10 text-primary border-primary/20"
  },
  {
    icon: Timer,
    title: "Race Weekend",
    description: "Each race weekend has practice sessions (Friday), qualifying (Saturday) to determine grid positions, and the main race (Sunday) typically lasting around 2 hours.",
    color: "bg-primary/10 text-primary border-primary/20"
  },
  {
    icon: Zap,
    title: "Key Terms",
    description: "DRS: Drag Reduction System for overtaking. Pit Stop: Quick tire/repair changes. Pole Position: Starting first on the grid. Fastest Lap: Quickest lap time in the race.",
    color: "bg-primary/10 text-primary border-primary/20"
  },
  {
    icon: Map,
    title: "Race Tracks",
    description: "F1 races on various circuits: street circuits (Monaco), permanent tracks (Silverstone), and hybrid circuits (Singapore). Each has unique challenges and characteristics.",
    color: "bg-primary/10 text-primary border-primary/20"
  },
];

const BeginnersGuide = () => {
  return (
    <section className="py-16 px-4 bg-racing-track">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary">New to F1?</Badge>
          <h2 className="text-4xl font-black uppercase tracking-tight">
            Beginner's Guide
          </h2>
          <p className="mt-2 text-muted-foreground">Everything you need to know to start following Formula 1</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guideItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.title}
                className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-racing group"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${item.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Card className="bg-gradient-card border-primary/20 p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to dive deeper?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Explore driver statistics, historical data, lap records, and detailed race analysis 
              to become an F1 expert. Use our data insights to track performance trends and predictions.
            </p>
            <Badge className="bg-primary text-primary-foreground text-base px-6 py-2">
              More features coming soon
            </Badge>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BeginnersGuide;