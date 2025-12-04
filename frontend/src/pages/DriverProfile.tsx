import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trophy, Flag, Timer, Medal, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { f1Api } from "@/services/api";

// Helper function to get driver image URL
const getDriverImageUrl = (abbreviation?: string, name?: string): string => {
  if (!abbreviation) {
    return 'https://placehold.co/600x600/101010/DC0000?text=DR';
  }
  
  // Try local image first (if you've downloaded images, place them in public/drivers/)
  // Format: NOR.png, VER.png, etc.
  const localImage = `/drivers/${abbreviation.toUpperCase()}.png`;
  
  // For now, return placeholder - you can add actual images later
  // When you add images, they should be in frontend/public/drivers/ directory
  // and named like: NOR.png, VER.png, HAM.png, etc.
  return localImage;
};

const DriverProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["driverProfile", id],
    queryFn: async () => {
      const response = await f1Api.fetchData<any>(`/drivers/${id}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Error loading driver profile</p>
          <button
            onClick={() => navigate('/')}
            className="text-red-600 hover:text-red-500 underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const driver = (data as any)?.driver || {};
  const currentSeason = (data as any)?.current_season || {};
  const career = (data as any)?.career || {};

  // Fix name parsing - handle cases where name might be empty or just abbreviation
  let firstName = '';
  let lastName = '';
  if (driver.name && driver.name.trim() && driver.name !== driver.abbreviation) {
    const nameParts = driver.name.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    } else if (nameParts.length === 1) {
      firstName = nameParts[0];
      lastName = '';
    }
  }
  
  // Fallback to abbreviation if name is not available
  if (!firstName && driver.abbreviation) {
    firstName = driver.abbreviation;
    lastName = '';
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navigation Bar */}
      <div className="border-b border-gray-800 bg-neutral-950 px-4 py-4 md:px-8 flex items-center">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-wider text-sm">Back to Dashboard</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Driver Photo & Key Info */}
          <div className="lg:col-span-5 relative">
             <div className="relative z-10">
                {/* Large abbreviation watermark */}
                <div className="absolute -top-10 -left-10 text-[12rem] font-black text-red-600/20 select-none leading-none">
                  {driver.abbreviation || driver.number || '?'}
                </div>
                <img 
                  src={getDriverImageUrl(driver.abbreviation, driver.name)} 
                  alt={driver.name || driver.abbreviation || 'Driver'} 
                  className="w-full h-auto object-cover relative z-10 drop-shadow-2xl"
                  onError={(e) => {
                    // Fallback to placeholder if local image doesn't exist
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('placehold.co')) {
                      target.src = `https://placehold.co/600x600/101010/DC0000?text=${driver.abbreviation || 'DR'}`;
                    }
                  }}
                />
             </div>
             
             {/* Name Plate */}
             <div className="mt-4 border-l-4 border-red-600 pl-6">
                <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">
                  {firstName && lastName ? (
                    <>
                      {firstName}<br/>{lastName}
                    </>
                  ) : firstName ? (
                    firstName
                  ) : (
                    driver.abbreviation || 'Driver'
                  )}
                </h1>
                <div className="flex items-center gap-3 mt-4">
                  <Flag className="h-6 w-6 text-white" />
                  <span className="text-lg font-medium tracking-widest uppercase">
                    {driver.nationality && driver.nationality !== 'Unknown' ? driver.nationality : 'Unknown'}
                  </span>
                </div>
             </div>
          </div>

          {/* Key Stats (Right Side) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatBox 
                label="Team" 
                value={driver.team || 'Unknown'} 
                className="col-span-1 sm:col-span-2 bg-neutral-800/50 border-red-600/20" 
                textClass="text-3xl text-red-500"
              />
              <StatBox 
                icon={<Trophy className="h-6 w-6 text-yellow-500" />}
                label="World Championships" 
                value={career.world_championships?.toString() || '0'} 
              />
              <StatBox 
                icon={<Medal className="h-6 w-6 text-white" />}
                label="Podiums" 
                value={currentSeason.podiums?.toString() || '0'} 
              />
              <StatBox 
                icon={<div className="font-bold text-red-500">PTS</div>}
                label={`${currentSeason.season || new Date().getFullYear()} Points`} 
                value={currentSeason.points?.toFixed(1) || '0'} 
              />
              <StatBox 
                icon={<Timer className="h-6 w-6 text-gray-400" />}
                label="Grand Prix Entered" 
                value={career.grand_prix_entered?.toString() || currentSeason.races_entered?.toString() || '0'} 
              />
              <StatBox 
                icon={<Trophy className="h-6 w-6 text-yellow-400" />}
                label={`${currentSeason.season || new Date().getFullYear()} Wins`} 
                value={currentSeason.wins?.toString() || '0'} 
              />
            </div>

            {/* Biography / Details Section */}
            <div className="mt-8 bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <h3 className="text-lg font-bold uppercase tracking-wider mb-6 border-b border-gray-700 pb-2">Driver Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {driver.date_of_birth && (
                  <DetailRow label="Date of Birth" value={driver.date_of_birth} icon={<Calendar className="w-4 h-4" />} />
                )}
                {currentSeason.position > 0 && (
                  <DetailRow label={`${currentSeason.season || new Date().getFullYear()} Position`} value={`${currentSeason.position}`} icon={<Trophy className="w-4 h-4" />} />
                )}
                <DetailRow label="Highest Race Finish" value={career.highest_race_finish || 'N/A'} icon={<Trophy className="w-4 h-4" />} />
                <DetailRow label="Highest Grid Position" value={career.highest_grid_position || 'N/A'} icon={<Flag className="w-4 h-4" />} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const StatBox = ({ label, value, icon, className, textClass }: any) => (
  <Card className={`bg-neutral-800 border-neutral-700 ${className || ''}`}>
    <CardContent className="p-6 flex flex-col justify-center h-full">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">{label}</span>
      </div>
      <span className={`text-4xl font-black italic ${textClass || 'text-white'}`}>{value}</span>
    </CardContent>
  </Card>
);

const DetailRow = ({ label, value, icon }: any) => (
  <div className="flex items-start justify-between border-b border-gray-700/50 pb-2">
    <div className="flex items-center text-gray-400 gap-2">
      {icon}
      <span className="text-sm uppercase font-medium">{label}</span>
    </div>
    <span className="text-white font-bold">{value}</span>
  </div>
);

export default DriverProfile;