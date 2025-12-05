import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/services/api";
import { Link } from "react-router-dom";
import { constructors } from "@/data/constructors";

const teamNameToId = (teamName: string): string => {
  const team = constructors.find(c => c.name === teamName);
  return team?.id ?? '';
};

const DriverStandings = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["driverStandings"],
    queryFn: async () => {
      const response = await f1Api.getDriverStandings();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });

  const currentYear = data?.season || new Date().getFullYear();

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-racing-track">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary">
              {currentYear} Season
            </Badge>
            <h2 className="text-4xl font-black uppercase tracking-tight">
              Driver Standings
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
      <section className="py-16 px-4 bg-racing-track">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary">
              {currentYear} Season
            </Badge>
            <h2 className="text-4xl font-black uppercase tracking-tight">
              Driver Standings
            </h2>
            <p className="mt-2 text-muted-foreground">
              Error loading standings. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const standings = data?.standings || [];
  const season = data?.season || currentYear;

  return (
    <section className="py-16 px-4 bg-racing-track">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary">
            {season} Season
          </Badge>
          <h2 className="text-4xl font-black uppercase tracking-tight">
            Driver Standings
          </h2>
          <p className="mt-2 text-muted-foreground">
            Championship Points Table
          </p>
        </div>

        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="py-4 px-4 text-left text-sm font-bold uppercase tracking-wide">
                      Pos
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-bold uppercase tracking-wide">
                      Driver
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-bold uppercase tracking-wide hidden md:table-cell">
                      Team
                    </th>
                    <th className="py-4 px-4 text-center text-sm font-bold uppercase tracking-wide hidden sm:table-cell">
                      Wins
                    </th>
                    <th className="py-4 px-6 text-right text-sm font-bold uppercase tracking-wide">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {standings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No standings data available
                      </td>
                    </tr>
                  ) : (
                    standings.map((driver: any) => (
                      <tr
                        key={driver.position}
                        className="border-b border-border/50 hover:bg-primary/5 transition-colors group"
                      >
                        <td className="py-4 px-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg font-black ${
                              driver.position === 1
                                ? "bg-primary text-primary-foreground shadow-racing"
                                : driver.position === 2
                                ? "bg-muted text-foreground"
                                : driver.position === 3
                                ? "bg-racing-metallic text-foreground"
                                : "bg-secondary text-foreground"
                            }`}
                          >
                            {driver.position}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold group-hover:text-primary transition-colors">
                                {driver.driver_full_name || driver.driver}
                              </span>
                              {driver.position === 1 && (
                                <Trophy className="h-4 w-4 text-primary animate-pulse-red" />
                              )}
                            </div>
                            {/* Show team on mobile only - hidden on md+ where Team column is visible */}
                            <Link
                              to={`/constructors/${teamNameToId(driver.team)}`}
                              className="text-xs text-muted-foreground hover:text-primary transition-colors md:hidden"
                            >
                              {driver.team}
                            </Link>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground hidden md:table-cell">
                          <Link
                            to={`/constructors/${teamNameToId(driver.team)}`}
                            className="text-primary hover:underline transition-colors"
                          >
                            {driver.team}
                          </Link>
                        </td>
                        <td className="py-4 px-4 text-center font-mono hidden sm:table-cell">
                          {driver.wins || 0}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Badge
                            variant="outline"
                            className="border-primary/50 text-primary font-bold"
                          >
                            {driver.points}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DriverStandings;
