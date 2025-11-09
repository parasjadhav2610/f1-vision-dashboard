import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Flag, Users, Timer, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/services/api";

const StatsOverview = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["statsOverview"],
    queryFn: async () => {
      const response = await f1Api.getStatsOverview();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });

  // Format fastest lap time (backend already formats it as MM:SS.mmm)
  const formatLapTime = (timeStr: string | null) => {
    if (!timeStr || timeStr === "N/A") return "N/A";
    // Backend returns formatted time as MM:SS.mmm, so just return it
    return timeStr;
  };

  const stats = [
    {
      icon: Trophy,
      label: "Total Races",
      value: data?.total_races
        ? data.total_races.toLocaleString() + "+"
        : "1,100+",
      color: "text-primary",
    },
    {
      icon: Flag,
      label: "Championships",
      value: data?.championships?.toString() || "74",
      color: "text-primary",
    },
    {
      icon: Users,
      label: "Active Drivers",
      value: data?.active_drivers?.toString() || "20",
      color: "text-primary",
    },
    {
      icon: Timer,
      label: "Fastest Lap",
      value: formatLapTime(data?.fastest_lap) || "N/A",
      color: "text-primary",
    },
  ];

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-background to-racing-track">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((index) => (
              <Card key={index} className="bg-card border-border">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <Loader2 className="h-7 w-7 text-primary animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">
                      Loading...
                    </p>
                    <p className="text-2xl font-black text-foreground">-</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
