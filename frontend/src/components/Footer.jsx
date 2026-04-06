import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='custom-footer'>
      <Container>
        <Row>
          <Col className='text-center py-3'>
            <p>Copyright © {currentYear} JustShop Inc. Барлық құқықтар қорғалған.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};
export default Footer;
