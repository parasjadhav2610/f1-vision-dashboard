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