// Type definitions for Race data structures
// These types match the data structures returned by the backend API

export interface RaceCalendarItem {
  round: number;
  name: string;
  location: string;
  country: string;
  date: string;
  full_date: string | null;
  status: "completed" | "upcoming" | "scheduled";
}

export interface RaceResult {
  position: number;
  driver: string;
  driver_full_name: string;
  team: string;
  points: number;
  time: string;
  status: string;
  best_lap_time: string | null;
}

export interface RaceDetail {
  season: number;
  round: number;
  race: {
    name: string;
    location: string;
    country: string;
  };
  results: RaceResult[];
}

export interface RaceCalendarResponse {
  season: number;
  calendar: RaceCalendarItem[];
}

