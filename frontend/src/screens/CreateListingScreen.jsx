import { useState } from 'react';
import { Form, Button, Card, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreateSellerListingMutation } from '../slices/sellerApiSlice';
import { useUploadListingImagesMutation } from '../slices/uploadApiSlice';
import Message from '../components/Message';

const CATEGORIES = [
  { label: 'Телефондар', value: 'Phones' },
  { label: 'Электроника', value: 'Electronics' },
  { label: 'Киім', value: 'Clothing' },
  { label: 'Аксессуарлар', value: 'Accessories' },
];

const CITIES = [
  'Алматы',
  'Астана',
  'Шымкент',
  'Қарағанды',
  'Атырау',
  'Өскемен',
  'Басқа',
];

const CONDITIONS = ['Жаңа', 'Жақсы', 'Қолданылған'];

const CreateListingScreen = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('Жаңа');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [createListing, { isLoading }] = useCreateSellerListingMutation();
  const [uploadImages] = useUploadListingImagesMutation();

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.error('Ең көбі 5 сурет жүктеуге болады');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      setUploading(true);
      const res = await uploadImages(formData).unwrap();
      setImages([...images, ...res.images]);
      toast.success('Суреттер жүктелді');
    } catch (err) {
      toast.error(err?.data?.message || 'Суреттерді жүктеу сәтсіз');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !price || !category || !city || !phone) {
      toast.error('Барлық міндетті өрістерді толтырыңыз');
      return;
    }

    if (images.length === 0) {
      toast.error('Кемінде бір сурет жүктеңіз');
      return;
    }

    try {
      await createListing({
        name: title,
        description,
        price: Number(price),
        category,
        condition,
        city,
        phone,
        images,
      }).unwrap();

      toast.success('Жарнама сәтті жарияланды');
      navigate('/my-listings');
    } catch (err) {
      toast.error(err?.data?.message || 'Жарнама жариялау сәтсіз');
    }
  };

  return (
    <div className='create-listing-screen'>
      <h2 className='section-title mb-4'>Жарнама жариялау</h2>

      <Card className='listing-form-card'>
        <Card.Body className='p-4'>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                {/* Title */}
                <Form.Group className='mb-4'>
                  <Form.Label className='form-label'>Тақырып *</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Мысалы: iPhone 14 Pro 256GB'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className='apple-input'
                  />
                </Form.Group>

                {/* Category */}
                <Form.Group className='mb-4'>
                  <Form.Label className='form-label'>Санат *</Form.Label>
                  <Form.Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className='apple-input'
                  >
                    <option value=''>Санатты таңдаңыз</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Description */}
                <Form.Group className='mb-4'>
                  <Form.Label className='form-label'>Сипаттама *</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={5}
                    placeholder='Өнім туралы толық ақпарат...'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className='apple-input'
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    {/* Price */}
                    <Form.Group className='mb-4'>
                      <Form.Label className='form-label'>Баға (₸) *</Form.Label>
                      <Form.Control
                        type='number'
                        placeholder='100000'
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className='apple-input'
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    {/* Condition */}
                    <Form.Group className='mb-4'>
                      <Form.Label className='form-label'>Жағдайы *</Form.Label>
                      <div className='condition-radio-group'>
                        {CONDITIONS.map((cond) => (
                          <Badge
                            key={cond}
                            className={`condition-badge ${condition === cond ? 'active' : ''}`}
                            onClick={() => setCondition(cond)}
                            bg={condition === cond ? 'primary' : 'light'}
                            text={condition === cond ? 'white' : 'dark'}
                          >
                            {cond}
                          </Badge>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    {/* City */}
                    <Form.Group className='mb-4'>
                      <Form.Label className='form-label'>Қала *</Form.Label>
                      <Form.Select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className='apple-input'
                      >
                        <option value=''>Қаланы таңдаңыз</option>
                        {CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    {/* Phone */}
                    <Form.Group className='mb-4'>
                      <Form.Label className='form-label'>Телефон *</Form.Label>
                      <Form.Control
                        type='tel'
                        placeholder='+7 (XXX) XXX-XX-XX'
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className='apple-input'
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              <Col md={4}>
                {/* Images Upload */}
                <Form.Group className='mb-4'>
                  <Form.Label className='form-label'>Фотосуреттер (макс. 5) *</Form.Label>
                  <div className='image-upload-area'>
                    {images.length === 0 ? (
                      <div className='upload-placeholder'>
                        <div className='upload-icon'>📷</div>
                        <p className='upload-text'>Суреттерді осында түсіріңіз</p>
                        <p className='upload-hint'>немесе басыңыз</p>
                      </div>
                    ) : (
                      <div className='image-preview-grid'>
                        {images.map((img, index) => (
                          <div key={index} className='preview-item'>
                            <img src={img} alt={`Preview ${index + 1}`} />
                            <button
                              type='button'
                              className='remove-btn'
                              onClick={() => removeImage(index)}
                            >
                              ✕
                            </button>
                            {index === 0 && <span className='main-badge'>Негізгі</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    <Form.Control
                      type='file'
                      multiple
                      accept='image/*'
                      onChange={handleImageUpload}
                      className='file-input'
                      disabled={images.length >= 5 || uploading}
                    />
                    {uploading && (
                      <div className='upload-loading'>
                        <Spinner animation='border' size='sm' />
                        <span>Жүктелуде...</span>
                      </div>
                    )}
                  </div>
                  <p className='text-muted small mt-2'>
                    {images.length}/5 сурет жүктелді
                  </p>
                </Form.Group>
              </Col>
            </Row>

            <div className='d-flex gap-3 mt-4'>
              <Button
                type='submit'
                variant='primary'
                className='apple-btn-primary'
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner animation='border' size='sm' className='me-2' />
                    Жүктелуде...
                  </>
                ) : (
                  'Жарнама жариялау'
                )}
              </Button>
              <Button
                type='button'
                variant='light'
                className='apple-btn-secondary'
                onClick={() => navigate(-1)}
              >
                Болдырмау
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateListingScreen;
