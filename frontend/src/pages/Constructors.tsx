import React from "react";
import ConstructorCard from "@/components/ConstructorCard";
import { constructors } from "@/data/constructors";
import { drivers } from "@/data/drivers";

const Constructors: React.FC = () => {
  const getDriversCount = (id: string) => constructors.find(c => c.id === id)?.drivers.length ?? 0;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Constructors</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {constructors.map(c => (
          <ConstructorCard key={c.id} id={c.id} name={c.name} championships={c.championships} driversCount={getDriversCount(c.id)} />
        ))}
      </div>
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">All Drivers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map(d => (
            <div key={d.id} className="">
              {/* Lazy inline card using existing DriverCard component import path if needed by consumers */}
              <div className="p-4 rounded-lg border bg-card text-card-foreground">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">{d.name}</div>
                    <div className="text-sm text-muted-foreground">{d.teamName} • {d.points} pts</div>
                  </div>
                  <div>
                    <a className="text-sm text-primary underline" href={`/constructors/${d.teamId}`}>View team</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Constructors;
