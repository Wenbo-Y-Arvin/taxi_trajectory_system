// backend/routes/trips.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/search', async (req, res) => {
  const { taxiId, start, end, minLng, minLat, maxLng, maxLat, callType } = req.query;

  const conditions = [];
  const params = [];

  if (taxiId) {
    params.push(taxiId);
    conditions.push(`taxi_id = $${params.length}`);
  }
  if (callType) {
    params.push(callType);
    conditions.push(`call_type = $${params.length}`);  
  }
  if (start && end) {
    params.push(start, end);
    conditions.push(`timestamp_ts BETWEEN $${params.length - 1} AND $${params.length}`);
  }
  if (minLng && minLat && maxLng && maxLat) {
    params.push(minLng, minLat, maxLng, maxLat);
    conditions.push(`
      path_geom && ST_MakeEnvelope($${params.length - 3}, $${params.length - 2}, 
                                  $${params.length - 1}, $${params.length}, 4326)
    `);
  }

  if (conditions.length === 0) {
    return res.json([]);
  }

  const sql = `
    SELECT trip_id, call_type, ST_AsGeoJSON(path_geom)::json AS path_geom
    FROM taxi_trip_raw
    WHERE ${conditions.join(' AND ')}
      AND path_geom IS NOT NULL
  `;

  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

router.get('/bounds', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        ST_XMin(extent_geom) AS min_lng,
        ST_YMin(extent_geom) AS min_lat,
        ST_XMax(extent_geom) AS max_lng,
        ST_YMax(extent_geom) AS max_lat
      FROM (
        SELECT ST_Extent(path_geom) AS extent_geom
        FROM taxi_trip_raw
        WHERE path_geom IS NOT NULL
      ) AS sub;
    `);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch global bounds' });
  }
});

module.exports = router;
