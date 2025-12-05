import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { constructors } from '../data/constructors';
import { drivers } from '../data/drivers';

const ConstructorDetailRoot: React.FC = () => {
  const { id } = useParams();
  const team = constructors.find((c) => c.id === id);
  if (!team) return <div className="p-6">Constructor not found</div>;

  const teamDrivers = drivers.filter((d) => d.teamId === team.id);

  return (
    <div className="container mx-auto p-6">
      <div className="rounded-lg overflow-hidden mb-6 bg-white border">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <p className="text-sm text-gray-600 mt-2">{team.description || 'Team description coming soon.'}</p>
            <div className="mt-3 text-sm text-gray-700">
              <span className="mr-4">Rank: <span className="font-semibold">{team.currentRank}</span></span>
              <span className="mr-4">Points: <span className="font-semibold">{team.totalPoints}</span></span>
              <span>Engine: <span className="font-semibold">{team.engineSupplier}</span></span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Championships</div>
            <div className="text-2xl font-semibold">{team.championships}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 border rounded">
          <h3 className="text-lg font-semibold">Leadership & Key Roles</h3>
          <div className="mt-3">
            <div className="text-sm text-gray-500">Team Principal</div>
            <div className="font-medium">{team.teamPrincipal || 'N/A'}</div>
          </div>
          <div className="mt-3">
            <div className="text-sm text-gray-500">Technical Director</div>
            <div className="font-medium">{team.technicalDirector || 'N/A'}</div>
          </div>
          <div className="mt-3">
            <div className="text-sm text-gray-500">Head of Aerodynamics</div>
            <div className="font-medium">{team.headOfAerodynamics || 'N/A'}</div>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h3 className="text-lg font-semibold">Facilities</h3>
          <div className="mt-3">
            <div className="text-sm text-gray-500">Factory Location</div>
            <div className="font-medium">{team.factoryLocation || 'N/A'}</div>
          </div>
          <div className="mt-3">
            <div className="text-sm text-gray-500">Wind Tunnel Location</div>
            <div className="font-medium">{team.windTunnelLocation || 'N/A'}</div>
          </div>
          <div className="mt-3">
            <div className="text-sm text-gray-500">Simulator Details</div>
            <div className="font-medium">{team.simulatorDetails || 'N/A'}</div>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Drivers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamDrivers.map((d) => (
            <div key={d.id} className="p-4 border rounded">
              <div className="text-lg font-medium">{d.name}</div>
              <div className="text-sm text-gray-600">Points: <span className="font-semibold">{d.points}</span></div>
              <div className="text-sm text-gray-600">Wins: <span className="font-semibold">{d.wins}</span></div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link to="/constructors" className="text-sm text-blue-600 underline">Back to constructors</Link>
      </div>
    </div>
  );
};

export default ConstructorDetailRoot;
