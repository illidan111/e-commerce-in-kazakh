import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Form,
  Modal,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../slices/productsApiSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { addToCart } from '../slices/cartSlice';
import { FaCamera, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 3;

const ProductScreen = () => {
  const { id: productId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate('/cart');
  };

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (reviewImages.length + files.length > MAX_IMAGES) {
      toast.error(`Ең көбі ${MAX_IMAGES} сурет жүктеуге болады`);
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" файлы 5МБ-ден асып кетті`);
        continue;
      }
      validFiles.push(file);
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploaded: false,
      url: null,
    }));

    setReviewImages([...reviewImages, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...reviewImages];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setReviewImages(newImages);
  };

  const uploadImages = async () => {
    if (reviewImages.length === 0) return [];

    setUploadingImages(true);
    try {
      const formData = new FormData();
      reviewImages.forEach((img) => {
        if (!img.uploaded) {
          formData.append('images', img.file);
        }
      });

      const { data } = await axios.post('/api/upload/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadingImages(false);
      return data.images;
    } catch (err) {
      setUploadingImages(false);
      toast.error(err.response?.data?.message || 'Суреттерді жүктеу сәтсіз аяқталды');
      return null;
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      let imageUrls = [];
      if (reviewImages.length > 0) {
        imageUrls = await uploadImages();
        if (imageUrls === null) return;
      }

      await createReview({
        productId,
        rating,
        comment,
        images: imageUrls,
      }).unwrap();

      reviewImages.forEach(img => URL.revokeObjectURL(img.preview));
      setReviewImages([]);
      setRating(0);
      setComment('');
      refetch();
      toast.success('Пікір сәтті жасалды');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  return (
    <>
      <Link className='btn btn-light my-3' to='/'>
        Артқа
      </Link>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta title={product.name} description={product.description} />
          <Row>
            <Col md={6}>
              <Image src={product.image} alt={product.name} fluid style={{ maxHeight: '400px', objectFit: 'contain' }} />
            </Col>
            <Col md={3}>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h3>{product.name}</h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Rating
                    value={product.rating}
                  
                    text={`${product.numReviews} пікір`}
                  />
                </ListGroup.Item>
                <ListGroup.Item>Баға: ₸{product.price.toLocaleString()}</ListGroup.Item>
                <ListGroup.Item>
                  Сипаттама: {product.description}
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={3}>
              <Card>
                <ListGroup variant='flush'>
                  <ListGroup.Item>
                    <Row>
                      <Col>Баға:</Col>
                      <Col>
                        <strong>₸{product.price.toLocaleString()}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Күйі:</Col>
                      <Col>
                        {product.countInStock > 0 ? 'Қоймада бар' : 'Қоймада жоқ'}
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  {/* Qty Select */}
                  {product.countInStock > 0 && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Саны</Col>
                        <Col>
                          <Form.Control
                            as='select'
                            value={qty}
                            onChange={(e) => setQty(Number(e.target.value))}
                          >
                            {[...Array(product.countInStock).keys()].map(
                              (x) => (
                                <option key={x + 1} value={x + 1}>
                                  {x + 1}
                                </option>
                              )
                            )}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}

                  <ListGroup.Item>
                    <Button
                      className='btn-block'
                      type='button'
                      disabled={product.countInStock === 0}
                      onClick={addToCartHandler}
                    >
                      Себетке қосу
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          <Row className='review'>
            <Col md={6}>
              <h2 className='section-title mb-4'>Пікірлер</h2>
              {product.reviews.length === 0 && <Message>Пікірлер жоқ</Message>}
              <ListGroup variant='flush'>
                {product.reviews.map((review) => (
                  <ListGroup.Item key={review._id} className='review-item'>
                    <div className='review-header'>
                      <strong className='reviewer-name'>{review.name}</strong>
                      <Rating value={review.rating} />
                    </div>
                    <p className='review-date text-muted'>{review.createdAt.substring(0, 10)}</p>
                    <p className='review-comment'>{review.comment}</p>
                    
                    {review.images && review.images.length > 0 && (
                      <div className='review-images-gallery'>
                        {review.images.map((imgUrl, idx) => (
                          <div 
                            key={idx} 
                            className='review-thumbnail'
                            onClick={() => openImageModal(imgUrl)}
                          >
                            <Image src={imgUrl} alt={`Review ${idx + 1}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </ListGroup.Item>
                ))}
                <ListGroup.Item className='review-form-section'>
                  <h2 className='section-title mb-3'>Пікір жазу</h2>

                  {loadingProductReview && <Loader />}
                  {uploadingImages && (
                    <div className='upload-loading mb-3'>
                      <Loader />
                      <span className='ms-2'>Суреттер жүктелуде...</span>
                    </div>
                  )}
                  {userInfo ? (
                    <Form onSubmit={submitHandler}>
                      <Form.Group className='mb-3' controlId='rating'>
                        <Form.Label className='filter-label'>Бағалау</Form.Label>
                        <Form.Control
                          as='select'
                          required
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          className='filter-select'
                        >
                          <option value=''>Таңдаңыз...</option>
                          <option value='1'>1 - Нашар</option>
                          <option value='2'>2 - Орташа</option>
                          <option value='3'>3 - Жақсы</option>
                          <option value='4'>4 - Өте жақсы</option>
                          <option value='5'>5 - Тамаша</option>
                        </Form.Control>
                      </Form.Group>
                      
                      <Form.Group className='mb-3' controlId='comment'>
                        <Form.Label className='filter-label'>Пікір</Form.Label>
                        <Form.Control
                          as='textarea'
                          rows={3}
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className='filter-input'
                          placeholder='Өнім туралы пікіріңізді жазыңыз...'
                        />
                      </Form.Group>

                      <Form.Group className='mb-3'>
                        <Form.Label className='filter-label'>Суреттер (ең көбі 3)</Form.Label>
                        
                        {reviewImages.length > 0 && (
                          <div className='image-previews mb-3'>
                            {reviewImages.map((img, index) => (
                              <div key={index} className='image-preview-item'>
                                <Image src={img.preview} alt={`Preview ${index + 1}`} />
                                <button
                                  type='button'
                                  className='remove-image-btn'
                                  onClick={() => removeImage(index)}
                                  aria-label='Суретті жою'
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {reviewImages.length < MAX_IMAGES && (
                          <div className='upload-btn-wrapper'>
                            <input
                              type='file'
                              id='review-images'
                              multiple
                              accept='image/jpeg,image/png,image/webp'
                              onChange={handleImageSelect}
                              style={{ display: 'none' }}
                            />
                            <label htmlFor='review-images' className='upload-btn-apple'>
                              <FaCamera className='me-2' />
                              Сурет қосу
                              <span className='upload-hint'>
                                ({reviewImages.length}/{MAX_IMAGES}) • 5МБ дейін
                              </span>
                            </label>
                          </div>
                        )}
                      </Form.Group>

                      <Button
                        disabled={loadingProductReview || uploadingImages}
                        type='submit'
                        variant='primary'
                        className='w-100'
                      >
                        {uploadingImages ? 'Жүктелуде...' : 'Пікір жіберу'}
                      </Button>
                    </Form>
                  ) : (
                    <Message>
                      Пікір жазу үшін <Link to='/login'>кіріңіз</Link>
                    </Message>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>

          <Modal 
            show={showImageModal} 
            onHide={closeImageModal} 
            centered 
            size='lg'
            className='image-preview-modal'
          >
            <Modal.Header className='border-0 pb-0'>
              <Button 
                variant='link' 
                className='ms-auto text-dark' 
                onClick={closeImageModal}
              >
                <FaTimes size={24} />
              </Button>
            </Modal.Header>
            <Modal.Body className='text-center pt-0'>
              {selectedImage && (
                <Image src={selectedImage} alt='Full size' fluid className='modal-image' />
              )}
            </Modal.Body>
          </Modal>
        </>
      )}
    </>
  );
};

export default ProductScreen;
