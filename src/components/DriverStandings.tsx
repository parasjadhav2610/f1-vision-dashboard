import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

// Mock data - will be replaced with Python API
const mockStandings = [
  { position: 1, driver: "Max Verstappen", team: "Red Bull Racing", points: 575, wins: 19 },
  { position: 2, driver: "Lewis Hamilton", team: "Mercedes", points: 452, wins: 7 },
  { position: 3, driver: "Charles Leclerc", team: "Ferrari", points: 398, wins: 5 },
  { position: 4, driver: "Lando Norris", team: "McLaren", points: 347, wins: 3 },
  { position: 5, driver: "Carlos Sainz", team: "Ferrari", points: 312, wins: 2 },
  { position: 6, driver: "George Russell", team: "Mercedes", points: 289, wins: 1 },
  { position: 7, driver: "Sergio Perez", team: "Red Bull Racing", points: 254, wins: 2 },
  { position: 8, driver: "Fernando Alonso", team: "Aston Martin", points: 206, wins: 0 },
];

const DriverStandings = () => {
  return (
    <section className="py-16 px-4 bg-racing-track">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary">2024 Season</Badge>
          <h2 className="text-4xl font-black uppercase tracking-tight">
            Driver Standings
          </h2>
          <p className="mt-2 text-muted-foreground">Championship Points Table</p>
        </div>

        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="py-4 px-4 text-left text-sm font-bold uppercase tracking-wide">Pos</th>
                    <th className="py-4 px-6 text-left text-sm font-bold uppercase tracking-wide">Driver</th>
                    <th className="py-4 px-6 text-left text-sm font-bold uppercase tracking-wide hidden md:table-cell">Team</th>
                    <th className="py-4 px-4 text-center text-sm font-bold uppercase tracking-wide hidden sm:table-cell">Wins</th>
                    <th className="py-4 px-6 text-right text-sm font-bold uppercase tracking-wide">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStandings.map((driver) => (
                    <tr 
                      key={driver.position}
                      className="border-b border-border/50 hover:bg-primary/5 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-black ${
                          driver.position === 1 ? "bg-primary text-primary-foreground shadow-racing" :
                          driver.position === 2 ? "bg-muted text-foreground" :
                          driver.position === 3 ? "bg-racing-metallic text-foreground" :
                          "bg-secondary text-foreground"
                        }`}>
                          {driver.position}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold group-hover:text-primary transition-colors">
                            {driver.driver}
                          </span>
                          {driver.position === 1 && (
                            <Trophy className="h-4 w-4 text-primary animate-pulse-red" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground hidden md:table-cell">
                        {driver.team}
                      </td>
                      <td className="py-4 px-4 text-center font-mono hidden sm:table-cell">
                        {driver.wins}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Badge variant="outline" className="border-primary/50 text-primary font-bold">
                          {driver.points}
                        </Badge>
                      </td>
                    </tr>
                  ))}
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