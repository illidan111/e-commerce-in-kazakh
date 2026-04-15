import { Table, Button, Badge, Image, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import {
  useGetAllSellerListingsQuery,
  useApproveListingMutation,
  useDeleteSellerListingMutation,
} from '../../slices/sellerApiSlice';
import Message from '../../components/Message';
import Loader from '../../components/Loader';

const STATUS_BADGES = {
  active: { bg: 'success', label: 'Белсенді' },
  pending: { bg: 'warning', label: 'Күтуде' },
  sold: { bg: 'secondary', label: 'Сатылды' },
  rejected: { bg: 'danger', label: 'Қабылданбады' },
};

const ListingModerationScreen = () => {
  const { data: listings, isLoading, error, refetch } = useGetAllSellerListingsQuery();
  const [approveListing] = useApproveListingMutation();
  const [deleteListing] = useDeleteSellerListingMutation();

  const handleApprove = async (id) => {
    try {
      await approveListing({ id, status: 'active' }).unwrap();
      toast.success('Жарнама қабылданды');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Қабылдау сәтсіз');
    }
  };

  const handleReject = async (id) => {
    try {
      await approveListing({ id, status: 'rejected' }).unwrap();
      toast.success('Жарнама қабылданбады');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Қабылдамау сәтсіз');
    }
  };

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

  return (
    <div className='listing-moderation-screen'>
      <h2 className='section-title mb-4'>Жарнамаларды модерациялау</h2>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : listings?.length === 0 ? (
        <Message>Жеке сатушылардың жарнамалары жоқ</Message>
      ) : (
        <Table responsive hover className='admin-table'>
          <thead>
            <tr>
              <th>Сурет</th>
              <th>Тақырып</th>
              <th>Сатушы</th>
              <th>Баға</th>
              <th>Қала</th>
              <th>Күйі</th>
              <th>Күні</th>
              <th>Әрекет</th>
            </tr>
          </thead>
          <tbody>
            {listings?.map((listing) => (
              <tr key={listing._id}>
                <td>
                  <Image
                    src={listing.image || '/images/sample.jpg'}
                    alt={listing.name}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </td>
                <td>
                  <strong>{listing.name}</strong>
                  <p className='text-muted small mb-0'>{listing.category}</p>
                </td>
                <td>{listing.seller?.name || 'Белгісіз'}</td>
                <td>₸{listing.price.toLocaleString()}</td>
                <td>{listing.city}</td>
                <td>
                  <Badge
                    bg={STATUS_BADGES[listing.status]?.bg || 'secondary'}
                  >
                    {STATUS_BADGES[listing.status]?.label || listing.status}
                  </Badge>
                </td>
                <td>{new Date(listing.createdAt).toLocaleDateString('kk-KZ')}</td>
                <td>
                  <div className='d-flex gap-2'>
                    {listing.status === 'pending' && (
                      <>
                        <Button
                          variant='success'
                          size='sm'
                          onClick={() => handleApprove(listing._id)}
                          title='Қабылдау'
                        >
                          <FaCheck />
                        </Button>
                        <Button
                          variant='warning'
                          size='sm'
                          onClick={() => handleReject(listing._id)}
                          title='Қабылданбады'
                        >
                          <FaTimes />
                        </Button>
                      </>
                    )}
                    <Button
                      variant='danger'
                      size='sm'
                      onClick={() => handleDelete(listing._id)}
                      title='Өшіру'
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ListingModerationScreen;
