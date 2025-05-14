import { Navbar, Container } from 'react-bootstrap';

export default function AppNavbar() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand href="#">🚕 Taxi Trajectory Explorer</Navbar.Brand>
      </Container>
    </Navbar>
  );
}
