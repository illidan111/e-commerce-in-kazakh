import { useState } from 'react';
import { Table, Button, Badge, Nav, Tab, Row, Col } from 'react-bootstrap';
import { FaCheck, FaTrash, FaBan, FaStar, FaExternalLinkAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
  useGetAllReviewsQuery,
  useUpdateReviewStatusMutation,
  useDeleteReviewMutation,
} from '../../slices/productsApiSlice';

const ReviewListScreen = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: reviews, isLoading, error, refetch } = useGetAllReviewsQuery();
  const [updateReviewStatus, { isLoading: isUpdating }] = useUpdateReviewStatusMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge bg='success'>Бекітілген</Badge>;
      case 'pending':
        return <Badge bg='warning' text='dark'>Күтуде</Badge>;
      case 'spam':
        return <Badge bg='danger'>Спам</Badge>;
      default:
        return <Badge bg='secondary'>{status}</Badge>;
    }
  };

  const handleApprove = async (productId, reviewId) => {
    try {
      await updateReviewStatus({ productId, reviewId, status: 'approved' }).unwrap();
      toast.success('Пікір бекітілді');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleMarkAsSpam = async (productId, reviewId) => {
    try {
      await updateReviewStatus({ productId, reviewId, status: 'spam' }).unwrap();
      toast.success('Пікір спам ретінде белгіленді');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleDelete = async (productId, reviewId) => {
    if (window.confirm('Бұл пікірді өшіруге сенімдісіз бе?')) {
      try {
        await deleteReview({ productId, reviewId }).unwrap();
        toast.success('Пікір өшірілді');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const filterReviews = (reviews, tab) => {
    if (!reviews) return [];
    switch (tab) {
      case 'pending':
        return reviews.filter((r) => r.status === 'pending');
      case 'approved':
        return reviews.filter((r) => r.status === 'approved');
      case 'spam':
        return reviews.filter((r) => r.status === 'spam');
      default:
        return reviews;
    }
  };

  const filteredReviews = filterReviews(reviews, activeTab);

  const getCounts = () => {
    if (!reviews) return { all: 0, pending: 0, approved: 0, spam: 0 };
    return {
      all: reviews.length,
      pending: reviews.filter((r) => r.status === 'pending').length,
      approved: reviews.filter((r) => r.status === 'approved').length,
      spam: reviews.filter((r) => r.status === 'spam').length,
    };
  };

  const counts = getCounts();

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <>
      <h2 className='section-title mb-4'>Пікірлерді модерациялау</h2>

      {/* Filter Tabs */}
      <Nav variant='pills' className='mb-4 review-filters'>
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className='filter-tab'
          >
            Барлығы ({counts.all})
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
            className='filter-tab'
          >
            Күтуде ({counts.pending})
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'approved'}
            onClick={() => setActiveTab('approved')}
            className='filter-tab'
          >
            Бекітілген ({counts.approved})
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'spam'}
            onClick={() => setActiveTab('spam')}
            className='filter-tab'
          >
            Спам ({counts.spam})
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <div className='review-table-wrapper'>
        <Table responsive hover className='admin-table review-table'>
          <thead>
            <tr>
              <th>Пікір жазған</th>
              <th>Өнім</th>
              <th>Баға</th>
              <th>Пікір</th>
              <th>Күні</th>
              <th>Күйі</th>
              <th>Әрекеттер</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews?.length === 0 ? (
              <tr>
                <td colSpan='7' className='text-center py-4'>
                  Пікірлер табылмады
                </td>
              </tr>
            ) : (
              filteredReviews?.map((review) => (
                <tr key={review._id} className={`review-row ${review.status}`}>
                  <td>
                    <strong>{review.name}</strong>
                  </td>
                  <td>
                    <Link 
                      to={`/product/${review.productId}`} 
                      className='product-link'
                      target='_blank'
                    >
                      {review.productName?.substring(0, 30)}
                      {review.productName?.length > 30 ? '...' : ''}
                      <FaExternalLinkAlt size={12} className='ms-1' />
                    </Link>
                  </td>
                  <td>
                    <div className='rating-display'>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={14}
                          color={i < review.rating ? '#ff9500' : '#e5e5e5'}
                        />
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className='review-comment-cell'>
                      {review.comment?.substring(0, 100)}
                      {review.comment?.length > 100 ? '...' : ''}
                      {review.images?.length > 0 && (
                        <span className='ms-2 text-muted'>
                          ({review.images.length} сурет)
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{new Date(review.createdAt).toLocaleDateString('kk-KZ')}</td>
                  <td>{getStatusBadge(review.status)}</td>
                  <td>
                    <div className='action-buttons'>
                      {review.status !== 'approved' && (
                        <Button
                          variant='success'
                          size='sm'
                          className='action-btn'
                          onClick={() => handleApprove(review.productId, review._id)}
                          disabled={isUpdating}
                          title='Бекіту'
                        >
                          <FaCheck />
                        </Button>
                      )}
                      {review.status !== 'spam' && (
                        <Button
                          variant='warning'
                          size='sm'
                          className='action-btn'
                          onClick={() => handleMarkAsSpam(review.productId, review._id)}
                          disabled={isUpdating}
                          title='Спам ретінде белгілеу'
                        >
                          <FaBan />
                        </Button>
                      )}
                      <Button
                        variant='danger'
                        size='sm'
                        className='action-btn'
                        onClick={() => handleDelete(review.productId, review._id)}
                        disabled={isDeleting}
                        title='Өшіру'
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default ReviewListScreen;
