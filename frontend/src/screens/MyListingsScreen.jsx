import { Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import {
  useGetMyListingsQuery,
  useDeleteSellerListingMutation,
  useMarkAsSoldMutation,
} from '../slices/sellerApiSlice';
import Message from '../components/Message';
import Loader from '../components/Loader';

const STATUS_BADGES = {
  active: { bg: 'success', label: 'Белсенді' },
  pending: { bg: 'warning', label: 'Күтуде' },
  sold: { bg: 'secondary', label: 'Сатылды' },
  rejected: { bg: 'danger', label: 'Қабылданбады' },
};

const MyListingsScreen = () => {
  const { data: listings, isLoading, error, refetch } = useGetMyListingsQuery();
  const [deleteListing, { isLoading: isDeleting }] = useDeleteSellerListingMutation();
  const [markAsSold, { isLoading: isMarking }] = useMarkAsSoldMutation();

  const handleDelete = async (id) => {
    if (window.confirm('Бұл жарнаманы өшіруді қалайсыз ба?')) {
      try {
        await deleteListing(id).unwrap();
        toast.success('Жарнама өшірілді');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Өшіру сәтсіз');
      }
    }
  };

  const handleMarkAsSold = async (id) => {
    try {
      await markAsSold(id).unwrap();
      toast.success('Сатылды деп белгіленді');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Белгілеу сәтсіз');
    }
  };

  return (
    <div className='my-listings-screen'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h2 className='section-title mb-0'>Менің жарнамаларым</h2>
        <Button
          as={Link}
          to='/create-listing'
          className='apple-btn-primary'
        >
          + Жаңа жарнама
        </Button>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : listings?.length === 0 ? (
        <Message>
          Сізде әлі жарнама жоқ.{' '}
          <Link to='/create-listing'>Жарнама жариялау</Link>
        </Message>
      ) : (
        <Row>
          {listings?.map((listing) => (
            <Col key={listing._id} md={6} lg={4} className='mb-4'>
              <Card className='listing-card h-100'>
                <div className='listing-image-wrapper'>
                  <Card.Img
                    variant='top'
                    src={listing.image || '/images/sample.jpg'}
                    className='listing-image'
                  />
                  <Badge
                    bg={STATUS_BADGES[listing.status]?.bg || 'secondary'}
                    className='status-badge'
                  >
                    {STATUS_BADGES[listing.status]?.label || listing.status}
                  </Badge>
                  {listing.isUserListing && (
                    <Badge bg='info' className='type-badge'>
                      Жеке сатушы
                    </Badge>
                  )}
                </div>

                <Card.Body className='d-flex flex-column'>
                  <Card.Title className='listing-title'>
                    {listing.name}
                  </Card.Title>

                  <div className='listing-meta mb-3'>
                    <p className='listing-price'>₸{listing.price.toLocaleString()}</p>
                    <p className='listing-location'>📍 {listing.city}</p>
                    <p className='listing-condition'>📦 {listing.condition}</p>
                  </div>

                  <div className='mt-auto d-flex gap-2'>
                    {listing.status !== 'sold' && (
                      <>
                        <Button
                          as={Link}
                          to={`/product/${listing._id}`}
                          variant='light'
                          size='sm'
                          className='flex-grow-1'
                        >
                          <FaEdit /> Өңдеу
                        </Button>
                        <Button
                          variant='success'
                          size='sm'
                          onClick={() => handleMarkAsSold(listing._id)}
                          disabled={isMarking}
                        >
                          <FaCheck />
                        </Button>
                      </>
                    )}
                    <Button
                      variant='danger'
                      size='sm'
                      onClick={() => handleDelete(listing._id)}
                      disabled={isDeleting}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Body>

                <Card.Footer className='text-muted small'>
                  Жарияланды: {new Date(listing.createdAt).toLocaleDateString('kk-KZ')}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MyListingsScreen;
