import React from "react";
import { useParams, Link } from "react-router-dom";
import { constructors } from "@/data/constructors";
import { drivers } from "@/data/drivers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DriverCard from "@/components/DriverCard";

const ConstructorDetail: React.FC = () => {
  const { id } = useParams();
  const team = constructors.find((c) => c.id === id);
  if (!team) return <div className="p-6">Constructor not found</div>;

  const teamDrivers = drivers.filter((d) => d.teamId === team.id);

  return (
    <div className="container mx-auto p-6">
      {/* Header Card */}
      <div className="rounded-lg overflow-hidden mb-6 bg-card border">
        <div className="p-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{team.name}</h1>
            <p className="text-sm text-muted-foreground mt-2">{team.description || 'Team description coming soon.'}</p>
            <div className="mt-3 text-sm text-muted-foreground">
              <span className="mr-4">Rank: <span className="font-semibold">{team.currentRank}</span></span>
              <span className="mr-4">Points: <span className="font-semibold">{team.totalPoints}</span></span>
              <span>Engine: <span className="font-semibold">{team.engineSupplier}</span></span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Championships</div>
            <div className="text-2xl font-semibold">{team.championships}</div>
          </div>
        </div>
      </div>

      {/* Team Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Leadership & Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leadership & Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Team Principal</p>
              <p className="font-semibold">{team.teamPrincipal || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Technical Director</p>
              <p className="font-semibold">{team.technicalDirector || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Head of Aerodynamics</p>
              <p className="font-semibold">{team.headOfAerodynamics || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Infrastructure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Factory Location</p>
                <p className="font-semibold">{team.factoryLocation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wind Tunnel Location</p>
                <p className="font-semibold">{team.windTunnelLocation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Simulator Details</p>
                <p className="font-semibold">{team.simulatorDetails || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drivers Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Drivers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamDrivers.map((d) => (
            <DriverCard
              key={d.id}
              id={d.id}
              name={d.name}
              teamId={d.teamId}
              teamName={constructors.find((c) => c.id === d.teamId)?.name ?? d.teamId}
              showTeam={false}
              wins={d.wins}
              points={d.points}
            />
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link to="/constructors" className="text-sm text-primary underline">Back to constructors</Link>
      </div>
    </div>
  );
};

export default ConstructorDetail;
