import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  wins: number;
  points: number;
  showTeam?: boolean;
};

const DriverCard: React.FC<Props> = ({ id, name, teamId, teamName, wins, points, showTeam = true }) => {
  const navigate = useNavigate();
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <div className="text-sm text-muted-foreground">{points} pts • {wins} wins</div>
          </div>
          <div className="flex items-center gap-2">
            {showTeam && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/constructors/${teamId}`}>{teamName}</Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2 text-sm text-muted-foreground">Driver ID: {id}</div>
      </CardContent>
    </Card>
  );
};

export default DriverCard;
