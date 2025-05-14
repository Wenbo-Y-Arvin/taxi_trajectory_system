const express = require('express');
const DynamicTimeWarping = require('dynamic-time-warping');
const pool = require('../db');
const router = express.Router();

// 1. Fetch one reference trajectory
async function fetchTrajectory(tripId) {
  const { rows } = await pool.query(
    `SELECT ST_AsGeoJSON(path_geom)::json AS path_geom FROM taxi_trip_raw WHERE trip_id=$1`,
    [tripId]
  );
  return rows[0].path_geom.coordinates; 
}

// 2. Endpoint: find top-k similar trajectories
router.get('/similar', async (req, res) => {
  const { tripId, k = 5 } = req.query;
  try {
    const refCoords = await fetchTrajectory(tripId);
    // Fetch candidates (e.g., same taxi or same day_type)
    const { rows } = await pool.query(
        `SELECT trip_id, taxi_id, ST_AsGeoJSON(path_geom)::json AS path_geom
        FROM taxi_trip_raw
        WHERE trip_id <> $1
        AND path_geom IS NOT NULL
        LIMIT 1000`, [tripId]
    );

    // 3. Compute DTW distance for each
    const results = rows.map(r => {
        const otherCoords = r.path_geom.coordinates;
        const dtw = new DynamicTimeWarping(
           
            refCoords.map(p => p[0] + p[1]),
            otherCoords.map(p => p[0] + p[1]),
            (a, b) => Math.hypot(a - b)
        );
        return {
            trip_id: r.trip_id,
            taxi_id: r.taxi_id,
            distance: dtw.getDistance(),
            path_geom: r.path_geom
        };
    });

    // 4. Return top-k by smallest distance
    results.sort((a,b) => a.distance - b.distance);
    res.json(results.slice(0, k));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Similarity search failed' });
  }
});

module.exports = router;
