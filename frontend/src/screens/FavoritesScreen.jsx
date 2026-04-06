import { Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Product from '../components/Product';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { FaHeart } from 'react-icons/fa';

const FavoritesScreen = () => {
  const { favoriteItems } = useSelector((state) => state.favorites);

  return (
    <>
      <Meta title='Таңдаулылар' />
      <Link to='/' className='btn btn-light mb-4'>
        Артқа
      </Link>
      
      <div className='d-flex align-items-center mb-4'>
        <FaHeart className='me-2' style={{ color: '#ff3b30', fontSize: '24px' }} />
        <h1 className='m-0 section-title'>Таңдаулылар</h1>
      </div>

      {favoriteItems.length === 0 ? (
        <Message>
          <div className='text-center py-5'>
            <FaHeart style={{ fontSize: '48px', color: '#d2d2d7', marginBottom: '16px' }} />
            <h3 className='mb-3'>Таңдаулылар бос</h3>
            <p className='text-muted mb-4'>Сіз әлі ешқандай өнімді таңдаулыларға қосқан жоқсыз</p>
            <Link to='/' className='btn btn-primary'>
              Өнімдерді қарау
            </Link>
          </div>
        </Message>
      ) : (
        <>
          <p className='text-muted mb-4'>
            {favoriteItems.length} {favoriteItems.length === 1 ? 'өнім' : 'өнім'} сақталған
          </p>
          <Row>
            {favoriteItems.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3} className='product-col'>
                <Product product={product} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </>
  );
};

export default FavoritesScreen;
