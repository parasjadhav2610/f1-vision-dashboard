import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data - will be replaced with Python API
const mockResults = [
  { position: 1, driver: "Max Verstappen", team: "Red Bull Racing", time: "1:32:07.986", points: 25 },
  { position: 2, driver: "Lewis Hamilton", team: "Mercedes", time: "+5.241s", points: 18 },
  { position: 3, driver: "Charles Leclerc", team: "Ferrari", time: "+8.567s", points: 15 },
  { position: 4, driver: "Lando Norris", team: "McLaren", time: "+12.345s", points: 12 },
  { position: 5, driver: "Carlos Sainz", team: "Ferrari", time: "+18.923s", points: 10 },
];

const LatestResults = () => {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary">Latest Race</Badge>
          <h2 className="text-4xl font-black uppercase tracking-tight">
            Race Results
          </h2>
          <p className="mt-2 text-muted-foreground">Abu Dhabi Grand Prix 2024</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockResults.map((result) => (
            <Card 
              key={result.position}
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-racing group"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg font-black text-xl ${
                    result.position === 1 ? "bg-primary text-primary-foreground" :
                    result.position === 2 ? "bg-muted text-foreground" :
                    result.position === 3 ? "bg-racing-metallic text-foreground" :
                    "bg-secondary text-foreground"
                  }`}>
                    {result.position}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                      {result.driver}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{result.team}</p>
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
                    <span className="font-mono">{result.time}</span>
                  </div>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    {result.points} pts
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestResults;