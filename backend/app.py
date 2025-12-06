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
        # Validate round parameter
        if round <= 0:
            return jsonify({"error": "Invalid round number"}), 400

        # Get schedule and ensure round exists
        schedule = fastf1.get_event_schedule(season)
        if schedule is None or schedule.empty:
            return jsonify({"error": f"No schedule found for season {season}"}), 404

        if not any(schedule['RoundNumber'] == round):
            return jsonify({"error": f"Round {round} not found for season {season}"}), 404

        # Proceed to load session
        try:
            session = fastf1.get_session(season, round, 'R')
            session.load()
        except Exception as e:
            logger.error(f"Could not load session for season={season} round={round}: {e}")
            return jsonify({"error": "Session data not available for this race"}), 503
        
        # Get event info
        event = schedule[schedule['RoundNumber'] == round].iloc[0]
        
        # Get results
        results = session.results if hasattr(session, 'results') else None
        formatted_results = []
        if results is not None:
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
                    "best_lap_time": str(result['FastestLapTime']) if 'FastestLapTime' in result.index and pd.notna(result.get('FastestLapTime')) else None,
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

@app.route('/api/drivers/<driver_abbr>')
def get_driver_profile(driver_abbr):
    """Get detailed driver profile and statistics"""
    try:
        season = request.args.get('season', get_active_season(), type=int)
        
        # Initialize Ergast API
        ergast = Ergast()
        
        # Get driver information from Ergast
        driver_name = driver_abbr
        driver_number = ''
        nationality = 'Unknown'
        date_of_birth = ''
        
        try:
            # Try to get driver info from Ergast
            driver_info = ergast.get_driver_info(driver_abbr=driver_abbr)
            if driver_info is not None and not driver_info.empty:
                driver_row = driver_info.iloc[0]
                given_name = driver_row.get('givenName', '')
                family_name = driver_row.get('familyName', '')
                if given_name or family_name:
                    driver_name = f"{given_name} {family_name}".strip()
                driver_number = str(driver_row.get('permanentNumber', '')) if pd.notna(driver_row.get('permanentNumber')) else ''
                nationality = driver_row.get('nationality', 'Unknown')
                date_of_birth = driver_row.get('dateOfBirth', '')
                logger.info(f"Retrieved driver info: {driver_name}, {nationality}")
        except Exception as e:
            logger.warning(f"Could not get driver info from Ergast: {str(e)}")
            # Try alternative method - get from standings data
            try:
                standings = ergast.get_driver_standings(season=season)
                if standings.content and not standings.content[0].empty:
                    df = standings.content[0]
                    driver_row = df[df['driverCode'] == driver_abbr.upper()]
                    if not driver_row.empty:
                        row = driver_row.iloc[0]
                        given_name = row.get('givenName', '')
                        family_name = row.get('familyName', '')
                        if given_name or family_name:
                            driver_name = f"{given_name} {family_name}".strip()
                        nationality = row.get('nationality', 'Unknown')
                        driver_number = str(row.get('permanentNumber', '')) if pd.notna(row.get('permanentNumber')) else ''
            except Exception as e2:
                logger.debug(f"Alternative method also failed: {str(e2)}")
        
        # Get current season statistics from standings
        current_position = 0
        current_team = 'Unknown'
        total_points = 0
        total_wins = 0
        total_podiums = 0
        races_entered = 0
        
        try:
            schedule = fastf1.get_event_schedule(season)
            completed_races = schedule[schedule['EventDate'] < pd.Timestamp.now()] if schedule is not None and not schedule.empty else pd.DataFrame()
            
            # Process completed races to get stats
            for idx, event in completed_races.iterrows():
                try:
                    round_num = event['RoundNumber']
                    session = fastf1.get_session(season, round_num, 'R')
                    session.load(laps=False, telemetry=False, weather=False, messages=False)
                    
                    if hasattr(session, 'results') and not session.results.empty:
                        driver_result = session.results[session.results['Abbreviation'] == driver_abbr]
                        if not driver_result.empty:
                            races_entered += 1
                            result_row = driver_result.iloc[0]
                            points = float(result_row.get('Points', 0)) if pd.notna(result_row.get('Points')) else 0
                            position = int(result_row.get('Position', 0)) if pd.notna(result_row.get('Position')) else 0
                            
                            total_points += points
                            if position == 1:
                                total_wins += 1
                            if position <= 3:
                                total_podiums += 1
                            
                            # Get team name from most recent race
                            if current_team == 'Unknown':
                                current_team = result_row.get('TeamName', 'Unknown')
                            
                            # Try to get nationality from FastF1 results if not already set
                            if (nationality == 'Unknown' or nationality == '') and not driver_result.empty:
                                # Check various possible column names for nationality
                                for col in ['CountryCode', 'Nationality', 'Country', 'CountryName']:
                                    if col in result_row.index and pd.notna(result_row.get(col)):
                                        nat_value = result_row.get(col)
                                        if nat_value and str(nat_value).strip():
                                            nationality = str(nat_value).strip()
                                            logger.info(f"Found nationality from FastF1: {nationality}")
                                            break
                except Exception as e:
                    logger.debug(f"Error processing race {event.get('EventName', 'Unknown')}: {str(e)}")
                    continue
            
            # Try to get position from standings by calling the standings endpoint logic
            try:
                from flask import current_app
                # Get standings data
                schedule = fastf1.get_event_schedule(season)
                current_date = pd.Timestamp.now()
                completed_races = schedule[schedule['EventDate'] < current_date].copy()
                
                driver_stats = {}
                for idx, event in completed_races.tail(min(len(completed_races), 24)).iterrows():
                    try:
                        round_number = event['RoundNumber']
                        session = fastf1.get_session(season, round_number, 'R')
                        session.load(laps=False, telemetry=False, weather=False, messages=False)
                        
                        if hasattr(session, 'results') and not session.results.empty:
                            for _, result in session.results.iterrows():
                                driver_abbr_check = result.get('Abbreviation', '')
                                if driver_abbr_check.upper() == driver_abbr.upper():
                                    driver_stats[driver_abbr_check] = {
                                        'points': float(result.get('Points', 0)) if pd.notna(result.get('Points')) else 0,
                                        'wins': 1 if int(result.get('Position', 0)) == 1 else 0,
                                        'team': result.get('TeamName', 'Unknown')
                                    }
                                    break
                    except:
                        continue
                
                # Calculate position
                if driver_abbr in driver_stats:
                    all_drivers = {}
                    # Recalculate all drivers for position
                    for idx, event in completed_races.tail(min(len(completed_races), 24)).iterrows():
                        try:
                            round_number = event['RoundNumber']
                            session = fastf1.get_session(season, round_number, 'R')
                            session.load(laps=False, telemetry=False, weather=False, messages=False)
                            
                            if hasattr(session, 'results') and not session.results.empty:
                                for _, result in session.results.iterrows():
                                    driver_abbr_check = result.get('Abbreviation', '')
                                    if driver_abbr_check not in all_drivers:
                                        all_drivers[driver_abbr_check] = {'points': 0, 'wins': 0}
                                    points = float(result.get('Points', 0)) if pd.notna(result.get('Points')) else 0
                                    all_drivers[driver_abbr_check]['points'] += points
                                    if int(result.get('Position', 0)) == 1:
                                        all_drivers[driver_abbr_check]['wins'] += 1
                        except:
                            continue
                    
                    sorted_drivers = sorted(all_drivers.items(), key=lambda x: (x[1]['points'], x[1]['wins']), reverse=True)
                    for pos, (abbr, stats) in enumerate(sorted_drivers, start=1):
                        if abbr.upper() == driver_abbr.upper():
                            current_position = pos
                            total_points = stats['points']
                            total_wins = stats['wins']
                            break
            except Exception as e:
                logger.debug(f"Could not calculate position: {str(e)}")
            
            # Get career statistics using Ergast
            career_stats = {
                "grand_prix_entered": races_entered,
                "world_championships": 0,
                "highest_race_finish": "1",
                "highest_grid_position": "1",
            }
            
            try:
                results = ergast.get_driver_results(driver_abbr=driver_abbr)
                if results is not None and not results.empty:
                    career_stats["grand_prix_entered"] = len(results['raceName'].unique()) if 'raceName' in results.columns else races_entered
                    if 'position' in results.columns:
                        wins = results[results['position'] == '1']
                        if not wins.empty and 'season' in wins.columns:
                            career_stats["world_championships"] = len(wins.groupby('season').size())
            except Exception as e:
                logger.debug(f"Could not get career stats: {str(e)}")
            
            # Construct driver image URL (Formula1.com format)
            driver_slug = driver_name.lower().replace(' ', '-')
            driver_image = f"https://media.formula1.com/content/dam/fom-website/drivers/{driver_abbr[0].upper()}/{driver_abbr.upper()}{driver_name.split()[0][:3].upper() if driver_name.split() else ''}01_{driver_name.replace(' ', '_')}/{driver_slug}.png.transform/2col/image.png"
            
            # Driver nationality mapping (fallback if API doesn't provide it)
            DRIVER_NATIONALITY_MAP = {
                'NOR': 'British',
                'VER': 'Dutch',
                'HAM': 'British',
                'LEC': 'Monegasque',
                'SAI': 'Spanish',
                'PER': 'Mexican',
                'ALO': 'Spanish',
                'RUS': 'British',
                'OCO': 'French',
                'GAS': 'French',
                'STR': 'Canadian',
                'ALB': 'Thai',
                'BOT': 'Finnish',
                'ZHO': 'Chinese',
                'HUL': 'German',
                'MAG': 'Danish',
                'TSU': 'Japanese',
                'RIC': 'Australian',
                'PIA': 'Australian',
                'SAR': 'American',
                'BEAR': 'British',
                'LAW': 'New Zealander',
                'DOO': 'Australian',
                'COL': 'Argentine',
                'BOR': 'Brazilian',
                'BEA': 'British',
                'HAD': 'French',
                'ANT': 'Italian',
            }
            
            # Use mapping as final fallback
            if (nationality == 'Unknown' or nationality == '') and driver_abbr.upper() in DRIVER_NATIONALITY_MAP:
                nationality = DRIVER_NATIONALITY_MAP[driver_abbr.upper()]
                logger.info(f"Using nationality mapping: {nationality}")
            
            return jsonify({
                "driver": {
                    "abbreviation": driver_abbr,
                    "name": driver_name,
                    "number": driver_number,
                    "nationality": nationality,
                    "team": current_team,
                    "image": driver_image,
                    "date_of_birth": date_of_birth,
                },
                "current_season": {
                    "season": season,
                    "position": current_position,
                    "points": total_points,
                    "wins": total_wins,
                    "podiums": total_podiums,
                    "races_entered": races_entered,
                },
                "career": career_stats
            })
            
        except Exception as e:
            logger.error(f"Error getting driver statistics: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({"error": str(e)}), 500
            
    except Exception as e:
        logger.error(f"Error in get_driver_profile: {str(e)}")
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
