import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Flag } from "lucide-react";

// Mock data - will be replaced with Python API
const mockRaces = [
  { round: 1, name: "Bahrain Grand Prix", location: "Sakhir", date: "Mar 2-4", status: "completed" },
  { round: 2, name: "Saudi Arabian Grand Prix", location: "Jeddah", date: "Mar 9-11", status: "completed" },
  { round: 3, name: "Australian Grand Prix", location: "Melbourne", date: "Mar 23-25", status: "completed" },
  { round: 4, name: "Japanese Grand Prix", location: "Suzuka", date: "Apr 6-8", status: "upcoming" },
  { round: 5, name: "Chinese Grand Prix", location: "Shanghai", date: "Apr 20-22", status: "upcoming" },
  { round: 6, name: "Miami Grand Prix", location: "Miami", date: "May 4-6", status: "upcoming" },
];

const RaceCalendar = () => {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary">2024 Season</Badge>
          <h2 className="text-4xl font-black uppercase tracking-tight">
            Race Calendar
          </h2>
          <p className="mt-2 text-muted-foreground">Upcoming Grand Prix Schedule</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockRaces.map((race) => (
            <Card 
              key={race.round}
              className={`bg-card border-border transition-all duration-300 group ${
                race.status === "upcoming" 
                  ? "hover:border-primary/50 hover:shadow-racing" 
                  : "opacity-60"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-black text-lg border border-primary/20">
                      R{race.round}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">
                        {race.name}
                      </CardTitle>
                    </div>
                  </div>
                  {race.status === "completed" ? (
                    <Flag className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Calendar className="h-5 w-5 text-primary animate-pulse-red" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{race.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={race.status === "upcoming" ? "default" : "secondary"}
                      className={race.status === "upcoming" ? "bg-primary/20 text-primary border-primary" : ""}
                    >
                      {race.date}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={race.status === "completed" ? "border-muted" : "border-primary/50 text-primary"}
                    >
                      {race.status === "completed" ? "Completed" : "Upcoming"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RaceCalendar;