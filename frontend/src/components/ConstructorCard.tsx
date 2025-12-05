import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type Props = {
  id: string;
  name: string;
  championships: number;
  driversCount: number;
};

const colorFromId = (id: string) => {
  const map: Record<string, string> = {
    'mclaren': 'border-orange-500',
    'red-bull': 'border-sky-600',
    'mercedes': 'border-emerald-500',
    'ferrari': 'border-red-600',
    'williams': 'border-indigo-500',
    'rb-f1-team': 'border-sky-400',
    'sauber': 'border-violet-500',
    'aston-martin': 'border-lime-600',
    'haas': 'border-stone-500',
    'alpine': 'border-cyan-600',
  };
  return map[id] ?? 'border-gray-400';
};

const ConstructorCard: React.FC<Props> = ({ id, name, championships, driversCount }) => {
  return (
    <Link to={`/constructors/${id}`}>
      <Card className={cn("hover:scale-[1.02] transition-transform duration-150", colorFromId(id))}>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn("h-12 w-12 rounded-md bg-gradient-to-br", "bg-opacity-20 flex items-center justify-center")}></div>
              <div>
                <CardTitle>{name}</CardTitle>
                <CardDescription className="text-sm">{driversCount} drivers</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Championships</div>
              <div className="text-lg font-semibold">{championships}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">Click for team details</div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ConstructorCard;
