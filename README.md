# SkyCast

SkyCast is a weather website with a Next.js frontend and a separate Node.js backend folder.

## Structure

- Frontend/weather-cast - Next.js app
- Backend - Express API for weather data and saved cities

The frontend and backend are split so they can be developed and deployed separately.

## Run locally

1. Install frontend dependencies:
	- cd Frontend/weather-cast
	- npm install
2. Install backend dependencies:
	- cd ../../Backend
	- npm install
3. Start the backend:
	- npm run dev
4. Start the frontend in another terminal:
	- npm run dev

The frontend expects the backend at http://localhost:4001 by default.