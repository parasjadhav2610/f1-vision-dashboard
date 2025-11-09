import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Flag, Users, Timer } from "lucide-react";

const stats = [
  { icon: Trophy, label: "Total Races", value: "1,100+", color: "text-primary" },
  { icon: Flag, label: "Championships", value: "74", color: "text-primary" },
  { icon: Users, label: "Active Drivers", value: "20", color: "text-primary" },
  { icon: Timer, label: "Fastest Lap", value: "1:14.260", color: "text-primary" },
];

const StatsOverview = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-racing-track">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.label}
                className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-racing group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsOverview;