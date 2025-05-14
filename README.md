**Taxi Trajectory Explorer**
An interactive web application that allows users to filter taxi trajectories by ID, time range, call type, perform trajectory‐similarity matching, and query the database via an chatbot.

---

## Features

* **ID‐ & Time‐Based Filtering**: Retrieve trajectories for a given taxi or within any datetime interval.
* **Call Type Filter**: Narrow results by taxi call type (A/B/C) in a case‐insensitive fashion.
* **Spatial Bounds Slider**: Intuitively set longitude/latitude windows with range sliders.
* **Trajectory Similarity Matching**: Compute top-k similar trips using Dynamic Time Warping.
* **Natural‐Language Chatbot**: Ask “show me trips of taxi 20000520 from … to …” and get both SQL results and human‐friendly answers via NLP.js.
* **Clear Similarity Overlays**: Remove red “similar” paths on demand.

---

## Tech Stack

* **Frontend**: React (v18) with React-Bootstrap for UI and React-Leaflet for map rendering.
* **Backend**: Node.js (v20) + Express.js for RESTful APIs.
* **Database**: PostgreSQL (v15) with PostGIS extension for spatial support.
* **Environment Management**: dotenv for secure config.
* **NLP**: node-nlp for intent/entity extraction.
* **Similarity**: dynamic-time-warping for trajectory distance.

---

## Installation Guide

### Prerequisites

* Node.js & npm (v18+) installed 
* PostgreSQL (v15+) with PostGIS extension enabled 

### Database Setup

1. **Open SQL Shell(psql)**

   * Enter Server, Database, Port, Username and Password to enter the PostgreSQL command line.

2. **Change The Path To Your train.csv**

   * in import_and_process_data.sql, change the 'train.csv' to the actual path to your train.csv file.

3. **Import SQL File**

   * enter '\i \sql\import_and_process_data.sql' in PostgreSQL command line.
   

### Backend Setup

```bash
# in db.js, set up user, host, database, password and port to connect to the database.
cd backend
npm install
npm start
```

* Express routes mount under `/api/trips`, `/api/similarity`, `/api/chat` 

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

* Opens at [http://localhost:3000](http://localhost:3000) by default 

---

## Usage

1. **Filtering**: Enter Taxi ID, pick datetime‐range, set call type (A/B/C), and/or drag sliders to define spatial window.
2. **Similarity**: Click a blue trajectory after searching on the map → top-k similar trips (red) are highlighted and listed.
3. **Chatbot**: Type natural‐language queries (e.g., “show me trips of taxi 20000520 between 2013-07-01 00:00:00 and 2013-07-03 23:59:59”) and receive results.

---

## API Endpoints

### `GET /api/trips/search`

* **Params**: `taxiId`, `start`, `end`, `callType`, `minLng`, `maxLng`, `minLat`, `maxLat`
* **Response**: `[{ trip_id, path_geom }]`
* **Notes**: Combines multiple filters with SQL `AND`.

### `GET /api/similarity/similar`

* **Params**: `tripId`, `k`
* **Response**: `[{ trip_id, distance }]` sorted by DTW distance.

### `POST /api/chat`

* **Body**: `{ message: string }`
* **Response**: `{ answer: string, rows: [...] }` using NLP.js and regex for intent/entity parsing and translating to SQL.

---

## Project Structure

```
/backend
  /routes
    trips.js
    similarity.js
    chat.js
  db.js
  server.js
  package.json
/frontend
  /public
  /src
    components
      AppNavbar.jsx
      Filters.jsx
      SimilarityPanel.jsx
      Chatbot.jsx
      TripMap.jsx
    App.js
    index.js
  package.json
/sql
  import_and_process_data.sql
README.md
```

---

## Development Notes

* Ensure PostGIS is enabled before importing data.
* Use `dotenv.config()` early in `server.js` to load `.env`.
* Generate newer NLP training data when expanding chatbot capabilities.

---

## Troubleshooting

* **CERT\_HAS\_EXPIRED** on `npm install`: Switch registry or update your CA certs.
* **Map Tiles Gaps**: Call `map.invalidateSize()` after rendering.
* **404 Axios Errors**: Verify route paths in `App.js` and `server.js`.

---

## License

MIT License © 2025 Wenbo Yang

---

## Acknowledgments

* **PostGIS** for spatial DB functionality 
* **Leaflet / React-Leaflet** for map UI 
* **React-Bootstrap** for responsive components 
* **node-nlp** for NLP capabilities
* **Dynamic Time Warping** for similarity matching 

