CREATE DATABASE taxi_traj;
\c taxi_traj

CREATE EXTENSION IF NOT EXISTS postgis;                         

CREATE TABLE taxi_trip_raw (
    trip_id       BIGINT,
    call_type     CHAR(1),
    origin_call   TEXT,
    origin_stand  TEXT,
    taxi_id       INTEGER,
    ts            BIGINT,       
    day_type      CHAR(1),
    missing_data  BOOLEAN,
    polyline      TEXT         
);

COPY taxi_trip_raw(
    trip_id, call_type, origin_call, origin_stand,
    taxi_id, ts, day_type, missing_data, polyline
)
FROM 'train.csv'
DELIMITER ','
CSV HEADER;

DELETE FROM taxi_trip_raw
 WHERE missing_data IS TRUE;

ALTER TABLE taxi_trip_raw
  ADD COLUMN timestamp_ts TIMESTAMPTZ
    GENERATED ALWAYS AS (
      to_timestamp(ts) AT TIME ZONE 'UTC'
    ) STORED;

ALTER TABLE taxi_trip_raw
  ADD COLUMN coords_json JSONB;

UPDATE taxi_trip_raw
   SET coords_json = polyline::jsonb;                          
ALTER TABLE taxi_trip_raw
  ADD COLUMN path_geom GEOMETRY(LINESTRING, 4326);

WITH pts AS (
  SELECT
    trip_id,
    (elem ->> 0)::FLOAT    AS lon,
    (elem ->> 1)::FLOAT    AS lat,
    idx
  FROM taxi_trip_raw,
       jsonb_array_elements(coords_json) WITH ORDINALITY AS arr(elem, idx)
),
lines AS (
  SELECT
    trip_id,
    ST_SetSRID(
      ST_MakeLine(ST_MakePoint(lon, lat) ORDER BY idx),
      4326
    ) AS geom
  FROM pts
  GROUP BY trip_id
)
UPDATE taxi_trip_raw AS t
   SET path_geom = l.geom
  FROM lines AS l
 WHERE t.trip_id = l.trip_id;

CREATE INDEX idx_taxi_path_gist
  ON taxi_trip_raw
  USING GIST(path_geom);

CREATE INDEX idx_taxi_ts
  ON taxi_trip_raw(timestamp_ts);
CREATE INDEX idx_taxi_taxiid
  ON taxi_trip_raw(taxi_id);

ALTER TABLE taxi_trip_raw
  ADD COLUMN num_points INTEGER
    GENERATED ALWAYS AS (
      jsonb_array_length(coords_json)
    ) STORED;

ALTER TABLE taxi_trip_raw
  ADD COLUMN start_point  GEOMETRY(POINT, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(
      ST_MakePoint(
        (coords_json->0->>0)::FLOAT,
        (coords_json->0->>1)::FLOAT
      ), 4326
    )
  ) STORED,
  ADD COLUMN end_point    GEOMETRY(POINT, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(
      ST_MakePoint(
        (coords_json->(jsonb_array_length(coords_json)-1)->>0)::FLOAT,
        (coords_json->(jsonb_array_length(coords_json)-1)->>1)::FLOAT
      ), 4326
    )
  ) STORED;

