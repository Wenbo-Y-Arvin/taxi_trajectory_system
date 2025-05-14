// frontend/src/App.js
import React, { useState } from 'react';
import AppNavbar from './components/AppNavbar';
import Filters from './components/Filters';
import SimilarityPanel from './components/SimilarityPanel';
import Chatbot from './components/Chatbot';
import TripMap from './components/TripMap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

function App() {
  const [trips, setTrips] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [similarTrips, setSimilarTrips] = useState([]);
  const [currentK, setCurrentK] = useState(5);

  const fetchRoute = async (startCoords, endCoords) => {
    const [lng1, lat1] = startCoords.split(',').map(Number);
    const [lng2, lat2] = endCoords.split(',').map(Number);
    try {
      const { data } = await axios.get('/api/routing/route', {
        params: { startLng: lng1, startLat: lat1, endLng: lng2, endLat: lat2 }
      });
      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      setRouteCoords(coords);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSimilar = async (tripId) => {
    try {
      const { data } = await axios.get('/api/similarity/similar', { params: { tripId, k: currentK } });
      setSimilarTrips(data);
    } catch (e) {
      console.error(e);
    }
  };
  const clearSimilar = () => setSimilarTrips([]);

  return (
    <>
      <AppNavbar />

      <Container fluid className="px-4 mt-4 d-flex flex-column pb-5" style={{ minHeight: '100vh' }}>
        {/* 第一行：Filters 占满整行 */}
        <Row className="mb-3 flex-shrink-0">
          <Col>
            <Filters setTrips={setTrips} fetchRoute={fetchRoute} />
          </Col>
        </Row>

        {/* 第二行：左侧相似度面板 + Chatbot，右侧地图 */}
        <Row className="flex-grow-1">
          {/* 左侧栏 */}
          <Col md={3} className="d-flex flex-column">
            <SimilarityPanel
              fetchSimilar={fetchSimilar}
              clearSimilar={clearSimilar}
              similarTrips={similarTrips}
              currentK={currentK}
              setCurrentK={setCurrentK}
            />
            <div className="mt-3">
              <Chatbot />
            </div>
          </Col>

          {/* 右侧主区：地图 */}
          <Col md={9} className="d-flex">
            <div className="flex-grow-1">
              <TripMap
                trips={trips}
                routeCoords={routeCoords}
                similarTrips={similarTrips}
                fetchSimilar={fetchSimilar}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
