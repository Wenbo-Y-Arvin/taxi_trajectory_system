import React, { useState } from 'react';
import { Card, Form, Button, ListGroup, Alert, Row, Col } from 'react-bootstrap';

export default function SimilarityPanel({ 
  currentK,           
  setCurrentK,        
  fetchSimilar,
  clearSimilar,
  similarTrips 
}) {
  
  const [info, setInfo] = useState('');

  const handleClickK = () => {
    const kNum = Number(currentK);
    setInfo('');
    if (!Number.isInteger(kNum) || kNum < 1) {
      setInfo('please input a number greater than one');
      return;
    }
    // Trigger similarity fetch: relies on user clicking a trip, panel just sets prompt
    setInfo(`click on the blue trajectory in the map to show ${kNum} similar trajectories.`);
  };

  return (
    <Card className="mb-4">
      <Card.Header>Trajectory Similarity Matching</Card.Header>
      <Card.Body>
        <Alert variant="info">
          Please select similar Trajectory number, then click on the blue Trajectory in the map to query.
        </Alert>
        <Form className="mb-3">
          <Row className="align-items-start g-2">
            <Col xs="auto">
              <Form.Label htmlFor="inputK" srOnly>
                k
              </Form.Label>
              <Form.Control
                id="inputK"
                type="number"
                min={1}
                value={currentK}
                onChange={e => setCurrentK(e.target.value)}
                placeholder="k"
              />
            </Col>
            <Col xs="auto" className="mt-4 p-3">
              <Button variant="primary" onClick={handleClickK}>
                Set k
              </Button>
            </Col>
            <Col xs="auto" className="mt-4 p-3">
              <Button variant="danger" onClick={clearSimilar}>
                Clear
              </Button>
            </Col>
          </Row>
        </Form>
        {info && <Alert variant="secondary" className="mt-3">{info}</Alert>}
        <div className="mt-4" />
        {similarTrips.length > 0 && (
          <>
            <h6>Similar Trajectory List (Taxi ID & Distance)</h6>
            <ListGroup>
              {similarTrips.map(({ taxi_id, distance }) => (
                <ListGroup.Item key={taxi_id} className="d-flex justify-content-between">
                  <span>Taxi ID: {taxi_id}</span>
                  <span>Distance: {distance.toFixed(2)} km</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Card.Body>
    </Card>
  );
}