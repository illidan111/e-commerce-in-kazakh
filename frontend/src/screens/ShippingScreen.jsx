import { useState } from 'react';
import { Form, Button, Collapse, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import DeliveryMap from '../components/DeliveryMap';
import { saveShippingAddress } from '../slices/cartSlice';

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );
  const [country, setCountry] = useState(shippingAddress.country || 'Қазақстан');
  
  const [showMap, setShowMap] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle address selection from map
  const handleAddressSelect = (selectedData) => {
    const { address: addrData, deliveryCost, deliveryTime, zone } = selectedData;
    
    // Auto-fill form fields
    setAddress(addrData.street ? `${addrData.street} ${addrData.houseNumber}`.trim() : '');
    setCity(addrData.city || '');
    setCountry(addrData.country || 'Қазақстан');
    
    // Store delivery info
    setDeliveryInfo({
      cost: deliveryCost,
      time: deliveryTime,
      zone: zone
    });
    
    // Hide map after selection
    setShowMap(false);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    navigate('/payment');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <h1>Жеткізу</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className='my-2' controlId='address'>
          <Form.Label>Мекенжай</Form.Label>
          <Form.Control
            type='text'
            placeholder='Мекенжайды енгізіңіз'
            value={address}
            required
            onChange={(e) => setAddress(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='city'>
          <Form.Label>Қала</Form.Label>
          <Form.Control
            type='text'
            placeholder='Қаланы енгізіңіз'
            value={city}
            required
            onChange={(e) => setCity(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='postalCode'>
          <Form.Label>Пошта индексі</Form.Label>
          <Form.Control
            type='text'
            placeholder='Пошта индексін енгізіңіз'
            value={postalCode}
            required
            onChange={(e) => setPostalCode(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='country'>
          <Form.Label>Ел</Form.Label>
          <Form.Control
            type='text'
            placeholder='Елді енгізіңіз'
            value={country}
            required
            onChange={(e) => setCountry(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button type='submit' variant='primary' className='w-100 mb-3'>
          Жалғастыру
        </Button>

        {/* Map Toggle Button */}
        <Button 
          type='button'
          variant='outline-primary'
          className='w-100 map-toggle-btn mb-3'
          onClick={() => setShowMap(!showMap)}
        >
          {showMap ? '🗺️ Картаны жасыру' : '🗺️ Картадан таңдау'}
        </Button>

        {/* Delivery Map */}
        <Collapse in={showMap}>
          <div>
            <DeliveryMap onAddressSelect={handleAddressSelect} />
          </div>
        </Collapse>

        {/* Delivery Info Display */}
        {deliveryInfo && (
          <div className={`delivery-info-display ${deliveryInfo.zone}-zone`}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted d-block">Жеткізу құны</small>
                <strong className="fs-5">
                  {deliveryInfo.cost === 0 ? 'Тегін' : `${deliveryInfo.cost} ₸`}
                </strong>
              </div>
              <div className="text-end">
                <small className="text-muted d-block">Жеткізу мерзімі</small>
                <Badge 
                  bg={deliveryInfo.zone === 'green' ? 'success' : deliveryInfo.zone === 'yellow' ? 'warning' : 'danger'}
                  className="mt-1"
                >
                  {deliveryInfo.time}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </Form>
    </FormContainer>
  );
};

export default ShippingScreen;
