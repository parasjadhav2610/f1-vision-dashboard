import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Flag, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/services/api";

const RaceCalendar = () => {
  const currentYear = new Date().getFullYear();
  const { data, isLoading, error } = useQuery({
    queryKey: ["raceCalendar", currentYear],
    queryFn: async () => {
      const response = await f1Api.getRaceCalendar(currentYear);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary">
              {currentYear} Season
            </Badge>
            <h2 className="text-4xl font-black uppercase tracking-tight">
              Race Calendar
            </h2>
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary">
              {currentYear} Season
            </Badge>
            <h2 className="text-4xl font-black uppercase tracking-tight">
              Race Calendar
            </h2>
            <p className="mt-2 text-muted-foreground">
              Error loading calendar. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const calendar = data?.calendar || [];
  const season = data?.season || currentYear;

  // Format date for display
  const formatDate = (dateStr: string | null, fullDate: string | null) => {
    if (!fullDate) return dateStr || "TBD";
    try {
      const date = new Date(fullDate);
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const day = date.getDate();
      return `${month} ${day}`;
    } catch {
      return dateStr || "TBD";
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary">
            {season} Season
          </Badge>
          <h2 className="text-4xl font-black uppercase tracking-tight">
            Race Calendar
          </h2>
          <p className="mt-2 text-muted-foreground">Grand Prix Schedule</p>
        </div>

        {calendar.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No calendar data available yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {calendar.map((race: any) => (
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
                      <span className="text-muted-foreground">
                        {race.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          race.status === "upcoming" ? "default" : "secondary"
                        }
                        className={
                          race.status === "upcoming"
                            ? "bg-primary/20 text-primary border-primary"
                            : ""
                        }
                      >
                        {formatDate(race.date, race.full_date)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          race.status === "completed"
                            ? "border-muted"
                            : "border-primary/50 text-primary"
                        }
                      >
                        {race.status === "completed"
                          ? "Completed"
                          : race.status === "upcoming"
                          ? "Upcoming"
                          : "Scheduled"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RaceCalendar;
