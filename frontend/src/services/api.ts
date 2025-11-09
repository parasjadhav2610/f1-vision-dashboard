// API service for connecting to Python backend
// This file provides a structured way to make API calls to your Python backend

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

interface ApiResponse<T> {
  data: T;
  error?: string;
}

class F1ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetchData<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Latest race results
  async getLatestResults() {
    return this.fetchData("/results/latest");
  }

  // Driver standings
  async getDriverStandings(season?: number) {
    const seasonParam = season ? `?season=${season}` : "";
    return this.fetchData(`/standings/drivers${seasonParam}`);
  }

  // Constructor standings
  async getConstructorStandings(season?: number) {
    const seasonParam = season ? `?season=${season}` : "";
    return this.fetchData(`/standings/constructors${seasonParam}`);
  }

  // Race calendar
  async getRaceCalendar(season?: number) {
    const seasonParam = season ? `?season=${season}` : "";
    return this.fetchData(`/calendar${seasonParam}`);
  }

  // Driver information
  async getDriverInfo(driverId: string) {
    return this.fetchData(`/drivers/${driverId}`);
  }

  // Lap records
  async getLapRecords(circuitId?: string) {
    const circuitParam = circuitId ? `?circuit=${circuitId}` : "";
    return this.fetchData(`/records/laps${circuitParam}`);
  }

  // Historical data
  async getHistoricalData(year: number) {
    return this.fetchData(`/history/${year}`);
  }

  // Race details
  async getRaceDetails(season: number, round: number) {
    return this.fetchData(`/races/${season}/${round}`);
  }

  // Stats overview
  async getStatsOverview(season?: number) {
    const seasonParam = season ? `?season=${season}` : "";
    return this.fetchData(`/stats/overview${seasonParam}`);
  }
}

// Export singleton instance
export const f1Api = new F1ApiService(API_BASE_URL);

// Export types for use in components
export type { ApiResponse };
