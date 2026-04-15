import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaHeart } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import SearchBox from './SearchBox';
import { resetCart } from '../slices/cartSlice';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { favoriteItems } = useSelector((state) => state.favorites);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      dispatch(resetCart());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header>
      <Navbar className='custom-navbar' variant='light' expand='lg' collapseOnSelect>
        <Container fluid className='header-container'>
          <Navbar.Brand as={Link} to='/' className='brand-text header-brand'>
            JustShop
          </Navbar.Brand>
          <div className='header-search d-none d-lg-block'>
            <SearchBox />
          </div>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav' className='header-nav-collapse'>
            <div className='d-lg-none mb-3 mt-2'>
              <SearchBox />
            </div>
            <Nav className='header-nav'>
              <Nav.Link as={Link} to='/favorites' className='favorites-link'>
                <FaHeart className='nav-icon' />
                <span className='nav-text'>Таңдаулылар</span>
                {favoriteItems.length > 0 && (
                  <Badge pill bg='danger' className='nav-badge'>
                    {favoriteItems.length}
                  </Badge>
                )}
              </Nav.Link>
              <Nav.Link as={Link} to='/cart' className='cart-link'>
                <FaShoppingCart className='nav-icon' />
                <span className='nav-text'>Себет</span>
                {cartItems.length > 0 && (
                  <Badge pill bg='success' className='nav-badge'>
                    {cartItems.reduce((a, c) => a + c.qty, 0)}
                  </Badge>
                )}
              </Nav.Link>
              {userInfo ? (
                <>
                  <NavDropdown title={userInfo.name} id='username'>
                    <NavDropdown.Item as={Link} to='/profile'>
                      Профиль
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to='/create-listing'>
                      Жарнама жариялау
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to='/my-listings'>
                      Менің жарнамаларым
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={logoutHandler}>
                      Шығу
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <Nav.Link as={Link} to='/login'>
                  <FaUser /> Кіру
                </Nav.Link>
              )}

              {/* Admin Links */}
              {userInfo && userInfo.isAdmin && (
                <NavDropdown title='Әкімші' id='adminmenu' align='end' style={{ position: 'relative', zIndex: 9999 }}>
                  <NavDropdown.Item as={Link} to='/admin/dashboard'>
                    Статистика
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to='/admin/reviews'>
                    Пікірлер
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to='/admin/listings'>
                    Жарнамалар
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to='/admin/productlist'>
                    Өнімдер
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to='/admin/orderlist'>
                    Тапсырыстар
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to='/admin/userlist'>
                    Пайдаланушылар
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
