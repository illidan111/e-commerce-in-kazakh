import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Rating from './Rating';
import { addToFavorites, removeFromFavorites } from '../slices/favoritesSlice';

const Product = ({ product }) => {
  const dispatch = useDispatch();
  const { favoriteItems } = useSelector((state) => state.favorites);

  const isFavorite = favoriteItems.some((item) => item._id === product._id);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite) {
      dispatch(removeFromFavorites(product._id));
    } else {
      dispatch(addToFavorites(product));
    }
  };

  return (
    <Card className='my-3 product-card'>
      <div className='product-image-wrapper'>
        <Link to={`/product/${product._id}`}>
          <Card.Img src={product.image} variant='top' className='product-image' />
        </Link>
        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={toggleFavorite}
          aria-label={isFavorite ? 'Таңдаулылардан алып тастау' : 'Таңдаулыларға қосу'}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <Card.Body className='product-card-body'>
        <Link to={`/product/${product._id}`}>
          <Card.Title as='div' className='product-title'>
            {product.name}
          </Card.Title>
        </Link>

        <Rating
          value={product.rating}
          text={`${product.numReviews} пікір`}
        />

        <div className='product-price'>₸{product.price.toLocaleString()}</div>
      </Card.Body>
    </Card>
  );
};

export default Product;
