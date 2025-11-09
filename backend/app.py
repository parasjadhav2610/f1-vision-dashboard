from flask import Flask, jsonify, request
from flask_cors import CORS
import fastf1
import pandas as pd
from datetime import datetime
import traceback
import logging
import os

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

# Default season (current year)
CURRENT_YEAR = datetime.now().year


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
        season = request.args.get('season', CURRENT_YEAR, type=int)
        
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
                
                formatted_results.append({
                    "position": int(result['Position']),
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
    """Get driver championship standings using FastF1 only"""
    try:
        season = request.args.get('season', CURRENT_YEAR, type=int)
        
        logger.info(f"Fetching driver standings for season {season} using FastF1")
        
        # Get race schedule for the season
        try:
            schedule = fastf1.get_event_schedule(season)
            if schedule is None or schedule.empty:
                return jsonify({
                    "season": season,
                    "standings": [],
                    "error": f"No schedule found for season {season}"
                }), 404
        except Exception as schedule_error:
            logger.error(f"Error getting schedule: {str(schedule_error)}")
            return jsonify({
                "season": season,
                "standings": [],
                "error": f"Could not get race schedule: {str(schedule_error)}"
            }), 500
        
        # Get completed races only
        current_date = pd.Timestamp.now()
        completed_races = schedule[schedule['EventDate'] < current_date].copy()
        
        if completed_races.empty:
            return jsonify({
                "season": season,
                "standings": [],
                "error": f"No completed races found for season {season}"
            }), 404
        
        # Initialize driver data structures
        driver_stats = {}  # {driver_abbr: {'points': 0, 'wins': 0, 'name': '', 'team': ''}}
        
        # Process each completed race
        races_processed = 0
        races_failed = 0
        max_races_to_process = min(len(completed_races), 24)  # Limit to prevent timeout
        
        logger.info(f"Processing {max_races_to_process} completed races for season {season}")
        
        for idx, event in completed_races.tail(max_races_to_process).iterrows():
            try:
                round_number = event['RoundNumber']
                event_name = event.get('EventName', f'Round {round_number}')
                
                logger.debug(f"Loading race {round_number}: {event_name}")
                
                # Load race session (only results, not full telemetry)
                session = fastf1.get_session(season, round_number, 'R')
                session.load(laps=False, telemetry=False, weather=False, messages=False)
                
                # Get results
                if hasattr(session, 'results') and not session.results.empty:
                    for _, result in session.results.iterrows():
                        try:
                            driver_abbr = result.get('Abbreviation', '')
                            if not driver_abbr or pd.isna(driver_abbr):
                                continue
                            
                            driver_name = result.get('FullName', driver_abbr)
                            team_name = result.get('TeamName', 'N/A')
                            points = float(result.get('Points', 0)) if pd.notna(result.get('Points')) else 0.0
                            position = int(result.get('Position', 0)) if pd.notna(result.get('Position')) else 0
                            
                            # Initialize driver if not seen before
                            if driver_abbr not in driver_stats:
                                driver_stats[driver_abbr] = {
                                    'points': 0,
                                    'wins': 0,
                                    'name': driver_name,
                                    'team': team_name
                                }
                            
                            # Update stats
                            driver_stats[driver_abbr]['points'] += points
                            if position == 1:
                                driver_stats[driver_abbr]['wins'] += 1
                            
                            # Update name/team if we have better data (use most recent)
                            if driver_name and driver_name != driver_abbr:
                                driver_stats[driver_abbr]['name'] = driver_name
                            if team_name and team_name != 'N/A':
                                driver_stats[driver_abbr]['team'] = team_name
                                
                        except Exception as result_error:
                            logger.warning(f"Error processing result for {event_name}: {str(result_error)}")
                            continue
                    
                    races_processed += 1
                    logger.debug(f"Successfully processed race {round_number}")
                else:
                    logger.warning(f"No results found for race {round_number}: {event_name}")
                    races_failed += 1
                    
            except Exception as race_error:
                logger.warning(f"Error loading race {event.get('EventName', 'Unknown')}: {str(race_error)}")
                races_failed += 1
                continue
        
        # Check if we got any data
        if not driver_stats:
            return jsonify({
                "season": season,
                "standings": [],
                "error": f"Could not extract driver data from {races_processed} processed races"
            }), 500
        
        # Sort drivers by points (descending)
        sorted_drivers = sorted(
            driver_stats.items(), 
            key=lambda x: (x[1]['points'], x[1]['wins']), 
            reverse=True
        )
        
        # Format standings
        formatted_standings = []
        for position, (driver_abbr, stats) in enumerate(sorted_drivers, start=1):
            formatted_standings.append({
                "position": position,
                "driver": driver_abbr,
                "driver_full_name": stats['name'],
                "team": stats['team'],
                "points": stats['points'],
                "wins": stats['wins'],
            })
        
        logger.info(f"Successfully calculated standings from {races_processed} races ({races_failed} failed)")
        
        return jsonify({
            "season": season,
            "standings": formatted_standings,
            "races_processed": races_processed,
            "total_races": len(completed_races)
        })
        
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
    """Get constructor championship standings using FastF1 only"""
    try:
        season = request.args.get('season', CURRENT_YEAR, type=int)
        
        logger.info(f"Fetching constructor standings for season {season} using FastF1")
        
        # Get race schedule for the season
        try:
            schedule = fastf1.get_event_schedule(season)
            if schedule is None or schedule.empty:
                return jsonify({
                    "season": season,
                    "standings": [],
                    "error": f"No schedule found for season {season}"
                }), 404
        except Exception as schedule_error:
            logger.error(f"Error getting schedule: {str(schedule_error)}")
            return jsonify({
                "season": season,
                "standings": [],
                "error": f"Could not get race schedule: {str(schedule_error)}"
            }), 500
        
        # Get completed races only
        current_date = pd.Timestamp.now()
        completed_races = schedule[schedule['EventDate'] < current_date].copy()
        
        if completed_races.empty:
            return jsonify({
                "season": season,
                "standings": [],
                "error": f"No completed races found for season {season}"
            }), 404
        
        # Initialize constructor data structures
        constructor_stats = {}  # {constructor_name: {'points': 0, 'wins': 0}}
        
        # Process each completed race
        races_processed = 0
        races_failed = 0
        max_races_to_process = min(len(completed_races), 24)  # Limit to prevent timeout
        
        logger.info(f"Processing {max_races_to_process} completed races for constructor standings")
        
        for idx, event in completed_races.tail(max_races_to_process).iterrows():
            try:
                round_number = event['RoundNumber']
                event_name = event.get('EventName', f'Round {round_number}')
                
                # Load race session (only results, not full telemetry)
                session = fastf1.get_session(season, round_number, 'R')
                session.load(laps=False, telemetry=False, weather=False, messages=False)
                
                # Get results
                if hasattr(session, 'results') and not session.results.empty:
                    for _, result in session.results.iterrows():
                        try:
                            team_name = result.get('TeamName', '')
                            if not team_name or pd.isna(team_name) or team_name == '':
                                continue
                            
                            points = float(result.get('Points', 0)) if pd.notna(result.get('Points')) else 0.0
                            position = int(result.get('Position', 0)) if pd.notna(result.get('Position')) else 0
                            
                            # Initialize constructor if not seen before
                            if team_name not in constructor_stats:
                                constructor_stats[team_name] = {
                                    'points': 0,
                                    'wins': 0
                                }
                            
                            # Update stats (sum points from both drivers)
                            constructor_stats[team_name]['points'] += points
                            if position == 1:
                                constructor_stats[team_name]['wins'] += 1
                                
                        except Exception as result_error:
                            logger.warning(f"Error processing result for {event_name}: {str(result_error)}")
                            continue
                    
                    races_processed += 1
                else:
                    races_failed += 1
                    
            except Exception as race_error:
                logger.warning(f"Error loading race {event.get('EventName', 'Unknown')}: {str(race_error)}")
                races_failed += 1
                continue
        
        # Check if we got any data
        if not constructor_stats:
            return jsonify({
                "season": season,
                "standings": [],
                "error": f"Could not extract constructor data from {races_processed} processed races"
            }), 500
        
        # Sort constructors by points (descending)
        sorted_constructors = sorted(
            constructor_stats.items(), 
            key=lambda x: (x[1]['points'], x[1]['wins']), 
            reverse=True
        )
        
        # Format standings
        formatted_standings = []
        for position, (constructor_name, stats) in enumerate(sorted_constructors, start=1):
            formatted_standings.append({
                "position": position,
                "constructor": constructor_name,
                "points": stats['points'],
                "wins": stats['wins'],
            })
        
        logger.info(f"Successfully calculated constructor standings from {races_processed} races")
        
        return jsonify({
            "season": season,
            "standings": formatted_standings,
            "races_processed": races_processed,
            "total_races": len(completed_races)
        })
            
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
        season = request.args.get('season', CURRENT_YEAR, type=int)
        
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
            
            formatted_calendar.append({
                "round": int(event['RoundNumber']) if pd.notna(event.get('RoundNumber')) else idx + 1,
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
        season = request.args.get('season', CURRENT_YEAR, type=int)
        
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
            formatted_results.append({
                "position": int(result['Position']),
                "driver": result['Abbreviation'],
                "driver_full_name": result['FullName'],
                "team": result['TeamName'],
                "points": float(result['Points']) if pd.notna(result['Points']) else 0,
                "time": str(result['Time']) if pd.notna(result['Time']) else "DNF",
                "status": result['Status'] if pd.notna(result['Status']) else "Finished",
                "best_lap_time": str(result['FastestLapTime']) if pd.notna(result['FastestLapTime']) else None,
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
