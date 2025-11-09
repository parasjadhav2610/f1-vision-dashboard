# F1 Vision Dashboard

A comprehensive Formula 1 data visualization dashboard built with React (TypeScript) frontend and Python (Flask) backend, powered by FastF1 library.

## Features

- 📊 **Driver Standings** - Current championship standings with points and wins
- 🏁 **Latest Race Results** - Results from the most recent Grand Prix
- 📅 **Race Calendar** - Complete season schedule with race dates and locations
- 📈 **Statistics Overview** - Key F1 statistics including total races, championships, active drivers, and fastest lap times
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations

## Tech Stack

### Frontend

- React 18 with TypeScript
- Vite for fast development
- React Query for data fetching
- Tailwind CSS for styling
- Shadcn/ui components
- React Router for navigation

### Backend

- Python 3.11+
- Flask for REST API
- FastF1 for F1 data
- Flask-CORS for cross-origin requests
- Pandas for data manipulation

## Prerequisites

- Node.js 18+ and npm/yarn/bun
- Python 3.11+
- pip (Python package manager)

## Installation

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment (recommended):

```bash
python -m venv venv
```

3. Activate the virtual environment:

   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Run the backend server:

```bash
python app.py
```

The backend will start on `http://localhost:8000`

**Note**: FastF1 will cache data in a `./cache` directory. The first time you request data for a season, it may take some time to download and cache the data.

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
bun install
```

3. Create a `.env` file in the frontend directory (optional):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

If you don't create this file, the frontend will default to `http://localhost:8000/api`

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
bun run dev
```

The frontend will start on `http://localhost:8080`

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /` - API information
- `GET /api/results/latest?season=2024` - Get latest race results
- `GET /api/standings/drivers?season=2024` - Get driver championship standings
- `GET /api/standings/constructors?season=2024` - Get constructor championship standings
- `GET /api/calendar?season=2024` - Get race calendar for a season
- `GET /api/stats/overview?season=2024` - Get overview statistics
- `GET /api/races/<season>/<round>` - Get detailed race information

## Project Structure

```
f1-vision-dashboard/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile         # Docker configuration
│   └── cache/             # FastF1 cache (created automatically)
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service
│   │   └── ...
│   ├── package.json       # Node dependencies
│   └── ...
└── README.md
```

## Development

### Backend Development

The backend uses Flask's debug mode for development. To run with debug mode:

```bash
python app.py
```

The backend will automatically reload on code changes.

### Frontend Development

The frontend uses Vite for hot module replacement. Changes will be reflected immediately in the browser.

## Data Source

This application uses the [FastF1](https://github.com/theOehrly/Fast-F1) library, which provides access to Formula 1 timing data and results. FastF1 uses the official F1 API and Ergast API to fetch data.

## Troubleshooting

### Backend Issues

1. **FastF1 cache issues**: If you encounter cache-related errors, try deleting the `backend/cache` directory and let FastF1 rebuild it.

2. **Port already in use**: If port 8000 is already in use, you can change it in `backend/app.py`:

   ```python
   app.run(host='0.0.0.0', port=8000, debug=True)
   ```

3. **Missing dependencies**: Make sure all dependencies are installed:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Issues

1. **CORS errors**: Make sure the backend is running and CORS is enabled (which it is by default).

2. **API connection errors**: Check that the backend is running on the correct port and the `VITE_API_BASE_URL` environment variable is set correctly.

3. **Build errors**: Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

## Docker Deployment

### Backend

To build and run the backend with Docker:

```bash
cd backend
docker build -t f1-backend .
docker run -p 8000:8000 f1-backend
```

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [FastF1](https://github.com/theOehrly/Fast-F1) for providing F1 data access
- [Ergast API](http://ergast.com/mrd/) for historical F1 data
- Formula 1 for the official timing data
