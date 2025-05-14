import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';

function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length) {
      map.fitBounds(coords);
    }
  }, [coords, map]);
  return null;
}

function MapResizer({ trips }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
    
    const tripCoords = trips.flatMap(t =>
      t.path_geom?.coordinates?.map(([lng, lat]) => [lat, lng]) || []
    );
    if (tripCoords.length) {
      map.fitBounds(tripCoords);
    }
  }, [map, trips]);
  return null;
}

export default function TripMap({ trips, routeCoords, similarTrips, fetchSimilar }) {
  const similarCoords = similarTrips.flatMap(t =>
    t.path_geom?.coordinates?.map(([lng, lat]) => [lat, lng]) || []
  );
  const allCoords = [...routeCoords, ...similarCoords];

  return (
    <Card className="h-100">
      <Card.Body className="map-wrapper h-100 p-2">
        <MapContainer
          center={[41.15, -8.62]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          whenCreated={map => setTimeout(() => map.invalidateSize(), 200)}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* 原有蓝色轨迹，点击触发相似度匹配 */}
          {Array.isArray(trips) && trips.map(trip => (
            <Polyline
              key={trip.trip_id}
              positions={trip.path_geom.coordinates.map(([lng, lat]) => [lat, lng])}
              pathOptions={{ color: '#007bff', weight: 3 }}
              eventHandlers={{ click: () => fetchSimilar(trip.trip_id) }}
            />
          ))}

          <MapResizer trips={trips} />

          {/* 绿色路线 */}
          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{ color: 'green', weight: 4 }}
            />
          )}

          {/* 红色相似轨迹 */}
          {similarTrips.map(({ trip_id, taxi_id, distance, path_geom }) => (
            <Polyline
              key={`sim-${trip_id}`}
              positions={path_geom.coordinates.map(([lng, lat]) => [lat, lng])}
              pathOptions={{ color: 'red', weight: 2 }}
            />
          ))}

          {/* 视野自适应 */}
          <FitBounds coords={allCoords} />
        </MapContainer>
      </Card.Body>
    </Card>
  );
}
