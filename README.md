# SkyCast

SkyCast is a modern weather dashboard application designed to provide real-time weather updates, forecasts, and insights. It features a Next.js frontend and an Express.js backend, making it modular and scalable for development and deployment.

## Project Structure

- **Frontend/weather-cast**: The Next.js application for the user interface.
- **Backend**: The Express.js API server for weather data and user preferences.

## Key Features

- **Live City Search**: Search for cities with auto-complete and recent search history.
- **Temperature Toggle**: Switch between Celsius and Fahrenheit.
- **Forecast Panels**: View hourly and weekly weather forecasts.
- **Solar Details**: Display sunrise, sunset, and last update times.
- **Favorites Management**: Save favorite cities with editable notes.
- **System Status**: Backend status and uptime badges for monitoring.

## Prerequisites

Ensure you have the following installed:
- Node.js (v16 or later)
- npm (v7 or later)
- Docker (optional, for containerized setup)

## Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/desanduimanjith-droid/SkyCast.git
   cd SkyCast
   ```

2. Install dependencies:
   - Frontend:
     ```bash
     cd Frontend/weather-cast
     npm install
     ```
   - Backend:
     ```bash
     cd ../../Backend
     npm install
     ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

4. Start the frontend server in another terminal:
   ```bash
   cd Frontend/weather-cast
   npm run dev
   ```

5. Open the application in your browser:
   ```
   http://localhost:3000
   ```

### Using Docker

1. Build and start the services:
   ```bash
   docker-compose up --build
   ```

2. Access the application at:
   ```
   http://localhost:3000
   ```

## API Endpoints

The backend provides the following endpoints:
- **GET /api/weather**: Fetch weather data for a city.
- **GET /api/favorites**: Retrieve saved favorite cities.
- **POST /api/favorites**: Add a new favorite city.
- **PATCH /api/favorites/:id**: Update a favorite city.
- **DELETE /api/favorites/:id**: Remove a favorite city.
- **GET /api/status**: Check backend status and uptime.

## Contributing

We welcome contributions! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## License

This project is licensed under the MIT License. See the LICENSE file for details.