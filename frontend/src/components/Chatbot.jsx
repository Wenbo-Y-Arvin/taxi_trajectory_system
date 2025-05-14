// frontend/src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  ListGroup,
  InputGroup,
  FormControl,
  Button,
  Spinner,
  Row,
  Col,
} from 'react-bootstrap';
import axios from 'axios';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! I am an intelligent database assistant. Is there anything I can help you with?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

 
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { from: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/chat/chat', { message: text });
      setMessages((prev) => [...prev, { from: 'bot', text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: 'Something went wrong. Please try again later.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        Taxi Trajectory Search Assistant
      </Card.Header>
      <Card.Body style={{ height: '400px', overflowY: 'auto', padding: '1rem' }}>
        <ListGroup variant="flush">
          {messages.map((m, idx) => (
            <ListGroup.Item
              key={idx}
              className={
                m.from === 'user'
                  ? 'text-end bg-light'
                  : 'text-start bg-white'
              }
            >
              <Row>
                <Col xs="auto" className="align-self-center">
                  <strong>{m.from === 'user' ? 'you:' : 'assistant:'}</strong>
                </Col>
                <Col>{m.text}</Col>
              </Row>
            </ListGroup.Item>
          ))}
          <div ref={endRef} />
        </ListGroup>
      </Card.Body>
      <Card.Footer>
        <InputGroup>
          <FormControl
            placeholder="Please enter a query, for example: Query the trips of Taxi ID 20000589"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <Button
            variant="primary"
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{' '}
                Querying...
              </>
            ) : (
              'Send'
            )}
          </Button>
        </InputGroup>
      </Card.Footer>
    </Card>
  );
}
