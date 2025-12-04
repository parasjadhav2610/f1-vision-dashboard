from flask import Flask, jsonify, request
from flask_cors import CORS
import fastf1
from fastf1.ergast import Ergast
import pandas as pd
from datetime import datetime
import traceback
import logging
import os
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Enable caching for fastf1 (recommended)
# Create cache directory if it doesn't exist
cache_dir = './cache'
if not os.path.exists(cache_dir):
    os.makedirs(cache_dir)
    logger.info(f"Created cache directory: {cache_dir}")

fastf1.Cache.enable_cache(cache_dir)

# Rate limiting helper to avoid hitting Ergast API limits
class RateLimiter:
    def __init__(self, calls_per_hour=150):
        self.calls_per_hour = calls_per_hour
        self.calls = []
    
    def can_proceed(self):
        """Check if we can make another API call"""
        now = time.time()
        # Remove calls older than 1 hour
        self.calls = [call_time for call_time in self.calls if now - call_time < 3600]
        return len(self.calls) < self.calls_per_hour
    
    def record_call(self):
        """Record that we made an API call"""
        self.calls.append(time.time())

rate_limiter = RateLimiter(calls_per_hour=150)  # Conservative limit

# Default season (current year)
CURRENT_YEAR = datetime.now().year

def get_active_season():
    """Get the most recent F1 season with completed races"""
    current_year = datetime.now().year
    # Try current year first
    for year in [current_year, current_year - 1, current_year - 2]:
        try:
            schedule = fastf1.get_event_schedule(year)
            if schedule is not None and not schedule.empty:
                completed = schedule[schedule['EventDate'] < pd.Timestamp.now()]
                if not completed.empty:
                    logger.info(f"Using season {year} (has {len(completed)} completed races)")
                    return year
        except Exception as e:
            logger.warning(f"Could not check season {year}: {str(e)}")
            continue
    # Fallback to current year if nothing found
    return current_year


@app.route('/')
def home():
    return jsonify({
        "message": "F1 Data Insights API",
        "version": "1.0.0",
        "endpoints": {
            "latest_results": "/api/results/latest",
            "driver_standings": "/api/standings/drivers?season=2024",
            "constructor_standings": "/api/standings/constructors?season=2024",
            "race_calendar": "/api/calendar?season=2024",
            "stats_overview": "/api/stats/overview",
            "race_details": "/api/races/<season>/<round>",
        }
    })

@app.route('/api/results/latest')
def get_latest_results():
    """Get the latest race results"""
    try:
        season = request.args.get('season', get_active_season(), type=int)
        
        # Get schedule for the season
        schedule = fastf1.get_event_schedule(season)
        
        # Find the last completed race
        completed_races = schedule[schedule['EventDate'] < pd.Timestamp.now()]
        if completed_races.empty:
            return jsonify({"error": "No completed races found for this season"}), 404
        
        latest_event = completed_races.iloc[-1]
        event_name = latest_event['EventName']
        round_number = latest_event['RoundNumber']
        location = latest_event['Location']
        country = latest_event['Country']
        
        # Load session data
        try:
            session = fastf1.get_session(season, round_number, 'R')
            session.load()
            
            # Get results
            results = session.results
            
            # Format results
            formatted_results = []
            for idx, result in results.iterrows():
                # Handle FastestLapTime column - it might not exist or have different names
                fastest_lap = None
                if 'FastestLapTime' in result.index:
                    fastest_lap = str(result['FastestLapTime']) if pd.notna(result['FastestLapTime']) else None
                elif 'BestLapTime' in result.index:
                    fastest_lap = str(result['BestLapTime']) if pd.notna(result['BestLapTime']) else None
                
                # Handle NaN values in position
                position = result.get('Position')
                position_int = int(position) if pd.notna(position) and position != '' else 0
                
                formatted_results.append({
                    "position": position_int,
                    "driver": result.get('Abbreviation', result.get('Driver', 'N/A')),
                    "driver_full_name": result.get('FullName', result.get('Driver', 'N/A')),
                    "team": result.get('TeamName', result.get('Team', 'N/A')),
                    "points": float(result['Points']) if pd.notna(result.get('Points')) else 0,
                    "time": str(result['Time']) if pd.notna(result.get('Time')) else "DNF",
                    "status": result.get('Status', 'Finished') if pd.notna(result.get('Status')) else "Finished",
                    "best_lap_time": fastest_lap,
                })
            
            return jsonify({
                "race": {
                    "name": event_name,
                    "location": location,
                    "country": country,
                    "round": int(round_number),
                    "season": season,
                    "date": latest_event['EventDate'].strftime('%Y-%m-%d') if pd.notna(latest_event['EventDate']) else None
                },
                "results": formatted_results
            })
        except Exception as e:
            logger.error(f"Error loading session data: {str(e)}")
            # Fallback: return basic info without detailed results
            return jsonify({
                "race": {
                    "name": event_name,
                    "location": location,
                    "country": country,
                    "round": int(round_number),
                    "season": season,
                    "date": latest_event['EventDate'].strftime('%Y-%m-%d') if pd.notna(latest_event['EventDate']) else None
                },
                "results": [],
                "error": "Could not load detailed results. Session data may not be available yet."
            })
            
    except Exception as e:
        logger.error(f"Error in get_latest_results: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/standings/drivers')
def get_driver_standings():
    """Get driver championship standings using FastF1 Ergast interface"""
    try:
        season = request.args.get('season', get_active_season(), type=int)
        
        logger.info(f"Fetching driver standings for season {season} using FastF1 Ergast")
        
        ergast = Ergast()
        standings = ergast.get_driver_standings(season=season)
        
        if standings.content and not standings.content[0].empty:
            df = standings.content[0]
            
            formatted_standings = []
            for _, row in df.iterrows():
                # Handle constructor names (it's a list)
                teams = row.get('constructorNames', [])
                team_name = teams[0] if isinstance(teams, list) and len(teams) > 0 else "N/A"
                if isinstance(teams, str): # Fallback if it's a string
                    team_name = teams
                
                formatted_standings.append({
                    "position": int(row.get('position', 0)),
                    "driver": row.get('driverCode', 'N/A'),
                    "driver_full_name": f"{row.get('givenName', '')} {row.get('familyName', '')}".strip(),
                    "team": team_name,
                    "points": float(row.get('points', 0)),
                    "wins": int(row.get('wins', 0)),
                })
            
            return jsonify({
                "season": season,
                "standings": formatted_standings
            })
        else:
            return jsonify({
                "season": season,
                "standings": [],
                "error": f"No standings found for season {season}"
            }), 404
            
    except Exception as e:
        logger.error(f"Error in get_driver_standings: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "season": season if 'season' in locals() else CURRENT_YEAR,
            "standings": [],
            "error": f"Could not fetch driver standings: {str(e)}"
        }), 500

@app.route('/api/standings/constructors')
def get_constructor_standings():
    """Get constructor championship standings using FastF1 Ergast interface"""
    try:
        season = request.args.get('season', get_active_season(), type=int)
        
        logger.info(f"Fetching constructor standings for season {season} using FastF1 Ergast")
        
        ergast = Ergast()
        standings = ergast.get_constructor_standings(season=season)
        
        if standings.content and not standings.content[0].empty:
            df = standings.content[0]
            
            formatted_standings = []
            for _, row in df.iterrows():
                formatted_standings.append({
                    "position": int(row.get('position', 0)),
                    "constructor": row.get('constructorName', 'N/A'),
                    "points": float(row.get('points', 0)),
                    "wins": int(row.get('wins', 0)),
                })
            
            return jsonify({
                "season": season,
                "standings": formatted_standings
            })
        else:
            return jsonify({
                "season": season,
                "standings": [],
                "error": f"No standings found for season {season}"
            }), 404
            
    except Exception as e:
        logger.error(f"Error in get_constructor_standings: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "season": season if 'season' in locals() else CURRENT_YEAR,
            "standings": [],
            "error": str(e)
        }), 500

@app.route('/api/calendar')
def get_race_calendar():
    """Get race calendar for a season"""
    try:
        season = request.args.get('season', get_active_season(), type=int)
        
        # Get schedule
        schedule = fastf1.get_event_schedule(season)
        
        if schedule is None or schedule.empty:
            return jsonify({"error": f"No schedule found for season {season}"}), 404
        
        # Format calendar
        formatted_calendar = []
        current_date = pd.Timestamp.now()
        
        for idx, event in schedule.iterrows():
            event_date = event['EventDate'] if pd.notna(event.get('EventDate')) else None
            session5_date = event['Session5Date'] if pd.notna(event.get('Session5Date')) else event_date
            
            # Determine status
            if event_date is not None:
                if event_date < current_date:
                    status = "completed"
                else:
                    status = "upcoming"
            else:
                status = "scheduled"
            
            # Format date
            if event_date is not None and isinstance(event_date, pd.Timestamp):
                # Format as "Mon DD" (e.g., "Mar 15")
                date_str = event_date.strftime('%b %d')
                full_date_iso = event_date.isoformat()
            else:
                date_str = "TBD"
                full_date_iso = None
            
            # Handle round number properly
            round_num = event.get('RoundNumber')
            round_int = int(round_num) if pd.notna(round_num) and round_num != '' else idx + 1
            
            formatted_calendar.append({
                "round": round_int,
                "name": event['EventName'] if pd.notna(event.get('EventName')) else 'TBD',
                "location": event['Location'] if pd.notna(event.get('Location')) else 'TBD',
                "country": event['Country'] if pd.notna(event.get('Country')) else 'TBD',
                "date": date_str,
                "full_date": full_date_iso,
                "status": status,
            })
        
        return jsonify({
            "season": season,
            "calendar": formatted_calendar
        })
        
    except Exception as e:
        logger.error(f"Error in get_race_calendar: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats/overview')
def get_stats_overview():
    """Get overview statistics"""
    try:
        season = request.args.get('season', get_active_season(), type=int)
        
        # Get various stats
        schedule = fastf1.get_event_schedule(season)
        total_races = len(schedule) if schedule is not None and not schedule.empty else 0
        
        # Try to get fastest lap from latest race
        try:
            if schedule is not None and not schedule.empty:
                completed_races = schedule[schedule['EventDate'] < pd.Timestamp.now()]
                if not completed_races.empty:
                    latest_event = completed_races.iloc[-1]
                    session = fastf1.get_session(season, latest_event['RoundNumber'], 'R')
                    session.load()
                    
                    if hasattr(session, 'laps') and not session.laps.empty:
                        fastest_lap = session.laps['LapTime'].min()
                        if pd.notna(fastest_lap):
                            # Format timedelta to MM:SS.mmm format
                            if isinstance(fastest_lap, pd.Timedelta):
                                total_seconds = fastest_lap.total_seconds()
                                minutes = int(total_seconds // 60)
                                seconds = total_seconds % 60
                                fastest_lap_str = f"{minutes}:{seconds:06.3f}"
                            else:
                                fastest_lap_str = str(fastest_lap)
                        else:
                            fastest_lap_str = "N/A"
                    else:
                        fastest_lap_str = "N/A"
                else:
                    fastest_lap_str = "N/A"
            else:
                fastest_lap_str = "N/A"
        except:
            fastest_lap_str = "N/A"
        
        # Get driver count from schedule (estimate based on typical F1 seasons)
        try:
            # Count unique drivers from recent races
            if schedule is not None and not schedule.empty:
                completed_races = schedule[schedule['EventDate'] < pd.Timestamp.now()]
                if not completed_races.empty:
                    # Try to get driver count from latest race
                    try:
                        latest_event = completed_races.iloc[-1]
                        session = fastf1.get_session(season, latest_event['RoundNumber'], 'R')
                        session.load(laps=False, telemetry=False, weather=False, messages=False)
                        
                        if hasattr(session, 'results') and not session.results.empty:
                            active_drivers = len(session.results)
                        else:
                            active_drivers = 20
                    except:
                        active_drivers = 20
                else:
                    active_drivers = 20
            else:
                active_drivers = 20
        except Exception as e:
            logger.warning(f"Could not get driver count: {str(e)}")
            active_drivers = 20
        
        # Calculate total races in F1 history (approximate)
        total_f1_races = 1100  # Approximate historical total
        
        # Championships (since 1950)
        championships = CURRENT_YEAR - 1949
        
        return jsonify({
            "total_races": total_f1_races,
            "championships": championships,
            "active_drivers": active_drivers,
            "fastest_lap": fastest_lap_str,
            "season": season,
            "season_races": total_races,
        })
        
    except Exception as e:
        logger.error(f"Error in get_stats_overview: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/races/<int:season>/<int:round>')
def get_race_details(season, round):
    """Get detailed race information"""
    try:
        session = fastf1.get_session(season, round, 'R')
        session.load()
        
        # Get event info
        schedule = fastf1.get_event_schedule(season)
        event = schedule[schedule['RoundNumber'] == round].iloc[0] if not schedule.empty else None
        
        # Get results
        results = session.results
        
        formatted_results = []
        for idx, result in results.iterrows():
            # Handle position properly
            position = result.get('Position')
            position_int = int(position) if pd.notna(position) and position != '' else 0
            
            formatted_results.append({
                "position": position_int,
                "driver": result.get('Abbreviation', 'N/A'),
                "driver_full_name": result.get('FullName', 'N/A'),
                "team": result.get('TeamName', 'N/A'),
                "points": float(result['Points']) if pd.notna(result.get('Points')) else 0,
                "time": str(result['Time']) if pd.notna(result.get('Time')) else "DNF",
                "status": result.get('Status', 'Finished') if pd.notna(result.get('Status')) else "Finished",
                "best_lap_time": str(result['FastestLapTime']) if pd.notna(result.get('FastestLapTime')) else None,
            })
        
        return jsonify({
            "season": season,
            "round": round,
            "race": {
                "name": event['EventName'] if event is not None else "Race",
                "location": event['Location'] if event is not None else "TBD",
                "country": event['Country'] if event is not None else "TBD",
            },
            "results": formatted_results
        })
        
    except Exception as e:
        logger.error(f"Error in get_race_details: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
