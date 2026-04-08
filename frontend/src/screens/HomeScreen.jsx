import { useState, useEffect } from 'react';
import { Row, Col, Button, ButtonGroup, Form } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { Link } from 'react-router-dom';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import Meta from '../components/Meta';

const CATEGORIES = [
  { label: 'Телефондар', value: 'Phones' },
  { label: 'Электроника', value: 'Electronics' },
  { label: 'Киім', value: 'Clothing' },
  { label: 'Аксессуарлар', value: 'Accessories' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Жаңалары' },
  { value: 'priceAsc', label: 'Баға: өсу бойынша' },
  { value: 'priceDesc', label: 'Баға: кему бойынша' },
  { value: 'rating', label: 'Рейтинг бойынша' },
];

const FEATURES = [
  { icon: '🚚', title: 'Тез жеткізу', desc: 'Қазақстан бойынша 1-3 күн ішінде жеткізу' },
  { icon: '🔒', title: 'Қауіпсіз төлем', desc: 'SSL шифрлау арқылы қорғалған төлемдер' },
  { icon: '⭐', title: 'Сапалы өнімдер', desc: '100% түпнұсқа кепілдігі бар өнімдер' },
];

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(Number(pageNumber) || 1);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy, minPrice, maxPrice, keyword]);

  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber: currentPage,
    category: selectedCategory || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    sortBy,
  });

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleMinPriceChange = (e) => {
    setMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e) => {
    setMaxPrice(e.target.value);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <>
      {keyword && (
        <Link to='/' className='btn btn-light mb-4'>
          Артқа
        </Link>
      )}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta />
          {!keyword && (
            <div className='hero-section'>
              <h1 className='hero-headline'>Жай ғана. Керемет.</h1>
              <p className='hero-subheadline'>
                Ең озық технологиялар мен премиум дизайнның мінсіз үйлесімі.
              </p>
              <Button as={Link} to='/#products' className='hero-cta'>
                Қазір сатып алу
              </Button>
            </div>
          )}

          {!keyword && (
            <div className='features-section'>
              <h2 className='features-heading'>Неге JustShop?</h2>
              <Row className='g-4'>
                {FEATURES.map((f, i) => (
                  <Col key={i} md={4}>
                    <div className='feature-card'>
                      <div className='feature-icon'>{f.icon}</div>
                      <h3 className='feature-title'>{f.title}</h3>
                      <p className='feature-desc'>{f.desc}</p>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {!keyword && (
            <div className='d-flex justify-content-center mb-4' id='products'>
              <ButtonGroup className='category-button-group d-flex flex-wrap gap-2'>
                <Button
                  className={`category-pill ${selectedCategory === '' ? 'active' : ''}`}
                  onClick={() => handleCategoryClick('')}
                >
                  Барлығы
                </Button>
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat.value}
                    className={`category-pill ${selectedCategory === cat.value ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat.value)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          )}

          {/* Filters Row */}
          <div className='filters-row mb-4'>
            <Row className='align-items-end g-3'>
              <Col xs={12} sm={6} md={3}>
                <Form.Label className='filter-label'>Сұрыптау</Form.Label>
                <Form.Select value={sortBy} onChange={handleSortChange} className='filter-select'>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6} sm={3} md={2}>
                <Form.Label className='filter-label'>Мин. баға (₸)</Form.Label>
                <Form.Control
                  type='number'
                  placeholder='0'
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  className='filter-input'
                />
              </Col>
              <Col xs={6} sm={3} md={2}>
                <Form.Label className='filter-label'>Макс. баға (₸)</Form.Label>
                <Form.Control
                  type='number'
                  placeholder='∞'
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  className='filter-input'
                />
              </Col>
              <Col xs={12} sm={12} md={3} className='d-flex align-items-end'>
                <Button variant='outline-secondary' onClick={clearFilters} className='clear-filters-btn'>
                  Сүзгілерді тазалау
                </Button>
              </Col>
            </Row>
          </div>
          
          <div className='d-flex justify-content-between align-items-center mb-4 section-header'>
            <h2 className='section-title'>
              {selectedCategory && !keyword
                ? `${CATEGORIES.find((c) => c.value === selectedCategory)?.label || selectedCategory}`
                : 'Соңғы өнімдер'}
            </h2>
            <span className='products-count'>{data?.products?.length || 0} өнім</span>
          </div>
          <Row>
            {data.products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3} className='product-col'>
                <Product product={product} />
              </Col>
            ))}
          </Row>
          <Paginate
            pages={data.pages}
            page={data.page}
            keyword={keyword ? keyword : ''}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}
    </>
  );
};

export default HomeScreen;
