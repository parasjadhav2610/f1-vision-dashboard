import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/services/api";

const LatestResults = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["latestResults"],
    queryFn: async () => {
      const response = await f1Api.getLatestResults();
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
              Latest Race
            </Badge>
            <h2 className="text-4xl font-black uppercase tracking-tight">
              Race Results
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
              Latest Race
            </Badge>
            <h2 className="text-4xl font-black uppercase tracking-tight">
              Race Results
            </h2>
            <p className="mt-2 text-muted-foreground">
              Error loading results. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const results = data?.results || [];
  const raceInfo = data?.race || {
    name: "Latest Race",
    location: "",
    date: "",
  };

  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary">
            Latest Race
          </Badge>
          <h2 className="text-4xl font-black uppercase tracking-tight">
            Race Results
          </h2>
          <p className="mt-2 text-muted-foreground">
            {raceInfo.name}{" "}
            {raceInfo.date ? `- ${new Date(raceInfo.date).getFullYear()}` : ""}
          </p>
          {raceInfo.location && (
            <p className="mt-1 text-sm text-muted-foreground">
              {raceInfo.location}
            </p>
          )}
        </div>

        {results.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No results available yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.slice(0, 6).map((result: any) => (
              <Card
                key={result.position}
                className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-racing group"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg font-black text-xl ${
                        result.position === 1
                          ? "bg-primary text-primary-foreground"
                          : result.position === 2
                          ? "bg-muted text-foreground"
                          : result.position === 3
                          ? "bg-racing-metallic text-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {result.position}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                        {result.driver_full_name || result.driver}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {result.team}
                      </p>
                    </div>
                  </div>
                  {result.position === 1 && (
                    <Trophy className="h-6 w-6 text-primary animate-pulse-red" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono">
                        {result.time || result.status}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-primary/50 text-primary"
                    >
                      {result.points} pts
                    </Badge>
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

export default LatestResults;
