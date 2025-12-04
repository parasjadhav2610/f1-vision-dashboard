import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  MapPin,
  Calendar,
  Flag,
  Loader2,
  ArrowLeft,
  Clock,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/services/api";
import { RaceDetail as RaceDetailType } from "@/types/race";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const RaceDetail = () => {
  // Get season and round from URL parameters
  const { season, round } = useParams<{ season: string; round: string }>();
  const navigate = useNavigate();

  // Fetch race details from API
  const { data, isLoading, error } = useQuery<RaceDetailType>({
    queryKey: ["raceDetail", season, round],
    queryFn: async () => {
      if (!season || !round) {
        throw new Error("Season and round are required");
      }
      const response = await f1Api.getRaceDetails(
        parseInt(season),
        parseInt(round)
      );
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!season && !!round, // Only fetch if both params are available
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <div className="mt-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <p className="mt-4 text-muted-foreground">Loading race details...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <section className="py-16 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <Badge className="mb-4 bg-destructive/20 text-destructive border-destructive">
                Error
              </Badge>
              <h2 className="text-4xl font-black uppercase tracking-tight">
                Race Not Found
              </h2>
              <p className="mt-2 text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "Could not load race details. Please try again later."}
              </p>
              <Button
                onClick={() => navigate("/")}
                className="mt-6"
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const { race, results, season: raceSeason, round: raceRound } = data;

  // Format date helper (if we had date in the response)
  const formatTime = (time: string | null) => {
    if (!time || time === "DNF") return time || "N/A";
    return time;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <section className="border-b border-border bg-card/50 py-6 px-4">
        <div className="mx-auto max-w-7xl">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calendar
          </Button>
        </div>
      </section>

      {/* Race Details Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Race Header */}
          <div className="mb-10 text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary">
              {raceSeason} Season • Round {raceRound}
            </Badge>
            <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
              {race.name}
            </h1>
            <p className="mt-2 text-muted-foreground">Grand Prix Details</p>
          </div>

          {/* Race Information Cards */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Location Card */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm font-semibold">Location</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{race.location}</p>
                <p className="text-sm text-muted-foreground">{race.country}</p>
              </CardContent>
            </Card>

            {/* Season Card */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm font-semibold">Season</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{raceSeason}</p>
                <p className="text-sm text-muted-foreground">Formula 1 Season</p>
              </CardContent>
            </Card>

            {/* Round Card */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm font-semibold">Round</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">#{raceRound}</p>
                <p className="text-sm text-muted-foreground">Race Number</p>
              </CardContent>
            </Card>

            {/* Participants Card */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm font-semibold">Drivers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{results.length}</p>
                <p className="text-sm text-muted-foreground">Participants</p>
              </CardContent>
            </Card>
          </div>

          {/* Race Results Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-bold">Race Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No results available for this race.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Pos</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                        <TableHead className="text-right">Best Lap</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result, index) => (
                        <TableRow
                          key={index}
                          className={
                            result.position === 1
                              ? "bg-primary/5 border-l-2 border-l-primary"
                              : ""
                          }
                        >
                          <TableCell className="font-bold">
                            {result.position === 1 ? (
                              <div className="flex items-center gap-1">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                {result.position}
                              </div>
                            ) : (
                              result.position
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-semibold">
                                {result.driver_full_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {result.driver}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{result.team}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {result.points > 0 ? (
                              <Badge variant="default" className="bg-primary">
                                {result.points}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{formatTime(result.time)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {result.best_lap_time
                              ? formatTime(result.best_lap_time)
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                result.status === "Finished"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                result.status === "Finished"
                                  ? "bg-green-500/20 text-green-500 border-green-500"
                                  : ""
                              }
                            >
                              {result.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default RaceDetail;

