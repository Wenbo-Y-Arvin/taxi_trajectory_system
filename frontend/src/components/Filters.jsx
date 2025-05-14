// frontend/src/components/Filters.jsx
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function Filters({ setTrips, fetchRoute }) {

  const [taxiId, setTaxiId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [callType, setCallType] = useState('All');

  const [bounds, setBounds]     = useState(null);
  const [lngRange, setLngRange] = useState([0, 0]);  
  const [latRange, setLatRange] = useState([0, 0]); 

  const [error, setError] = useState('');

  const [startCoords, setStartCoords] = useState('');
  const [endCoords, setEndCoords] = useState('');

  useEffect(() => {
    axios.get('/api/trips/bounds')
      .then(({ data }) => {
        setBounds(data);
        setLngRange([data.min_lng, data.max_lng]);
        setLatRange([data.min_lat, data.max_lat]);
      })
      .catch(() => setError('Failed to load map bounds.'));
  }, []);

  const handleSearch = async () => {
    
    if (taxiId && !/^\d+$/.test(taxiId)) {
      return setError('Taxi ID must be digits only.');
    }
    
    if ((start && !end) || (!start && end)) {
      return setError('Please provide both Start and End times.');
    }

    setError('');  

    const params = {};
    if (taxiId) params.taxiId = taxiId;
    if (start)  params.start  = start;
    if (end)    params.end    = end;
    if (callType && callType !== 'All') {
      params.callType = callType;  
    }

    if (
      bounds &&
      (lngRange[0] !== bounds.min_lng ||
       lngRange[1] !== bounds.max_lng ||
       latRange[0] !== bounds.min_lat ||
       latRange[1] !== bounds.max_lat)
    ) {
      params.minLng = lngRange[0];
      params.maxLng = lngRange[1];
      params.minLat = latRange[0];
      params.maxLat = latRange[1];
    }

    try {
      const { data } = await axios.get('/api/trips/search', { params });
      if (data.length === 0) {
        setError('No results found for these filters.');
      }
      setTrips(data);
    } catch {
      setError('Search failed. Please try again.');
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Row className="mb-3 g-3">
            {/* Taxi ID */}
            <Col md={3}>
              <Form.Label>Taxi ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. 20000589"
                value={taxiId}
                onChange={e => setTaxiId(e.target.value)}
              />
            </Col>

            {/* Time Range */}
            <Col md={5}>
              <Form.Label>Time Range</Form.Label>
              <Row>
                <Col>
                  <Form.Control
                    type="datetime-local"
                    value={start}
                    onChange={e => setStart(e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="datetime-local"
                    value={end}
                    onChange={e => setEnd(e.target.value)}
                  />
                </Col>
              </Row>
            </Col>
            {/* CALL_TYPE*/}
            <Col md={2}>
              <Form.Label>Call Type</Form.Label>
              <Form.Select
                value={callType}
                onChange={e => setCallType(e.target.value)}
              >
                <option>All</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Longitude Slider */}
          {bounds ? (
            <>
              <Form.Label>Longitude Range</Form.Label>
              <Slider
                range
                min={bounds.min_lng}
                max={bounds.max_lng}
                value={lngRange}
                onChange={setLngRange}
                allowCross={false}
                tipFormatter={v => v.toFixed(5)}
              />
              <div className="d-flex justify-content-between small mb-3">
                <span>{lngRange[0].toFixed(5)}</span>
                <span>{lngRange[1].toFixed(5)}</span>
              </div>

              {/* Latitude Slider */}
              <Form.Label>Latitude Range</Form.Label>
              <Slider
                range
                min={bounds.min_lat}
                max={bounds.max_lat}
                value={latRange}
                onChange={setLatRange}
                allowCross={false}
                tipFormatter={v => v.toFixed(5)}
              />
              <div className="d-flex justify-content-between small mb-3">
                <span>{latRange[0].toFixed(5)}</span>
                <span>{latRange[1].toFixed(5)}</span>
              </div>
            </>
          ) : (
            <div className="text-center my-3">
              <Spinner animation="border" />
            </div>
          )}

          <Button variant="primary" onClick={handleSearch}>
            Search
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
