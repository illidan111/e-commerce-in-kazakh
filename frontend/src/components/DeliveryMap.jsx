import { useState } from 'react';
import { Form, Button, Card, Badge } from 'react-bootstrap';

const DeliveryMap = ({ onAddressSelect }) => {
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const cities = [
    { name: 'Алматы', delivery: 'Тегін', time: '1-2 күн', zone: 'green', coords: '76.8512,43.2220' },
    { name: 'Астана', delivery: 'Тегін', time: '1-2 күн', zone: 'green', coords: '71.4704,51.1801' },
    { name: 'Шымкент', delivery: 'Тегін', time: '1-2 күн', zone: 'green', coords: '69.5901,42.3417' },
    { name: 'Қарағанды', delivery: '500 ₸', time: '2-3 күн', zone: 'yellow', coords: '73.0898,49.8047' },
    { name: 'Атырау', delivery: '500 ₸', time: '2-3 күн', zone: 'yellow', coords: '51.9227,47.1167' },
    { name: 'Өскемен', delivery: '500 ₸', time: '2-3 күн', zone: 'yellow', coords: '82.6278,49.9781' },
    { name: 'Ақтөбе', delivery: '1000 ₸', time: '3-5 күн', zone: 'red', coords: '57.2067,50.2797' },
    { name: 'Тараз', delivery: '1000 ₸', time: '3-5 күн', zone: 'red', coords: '71.3667,42.9000' },
  ];

  const handleCitySelect = (city) => {
    setSelectedCity(city.name);
    onAddressSelect && onAddressSelect({
      address: {
        city: city.name,
        street: '',
        houseNumber: '',
        country: 'Қазақстан'
      },
      deliveryCost: city.delivery === 'Тегін' ? 0 : parseInt(city.delivery),
      deliveryTime: city.time,
      zone: city.zone
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const foundCity = cities.find(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (foundCity) {
      handleCitySelect(foundCity);
    }
  };

  const getZoneBadgeVariant = (zone) => {
    switch (zone) {
      case 'green': return 'success';
      case 'yellow': return 'warning';
      case 'red': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="delivery-map-container">
      {/* Search Form */}
      <Form onSubmit={handleSearch} className="mb-3">
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="Қала іздеу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow-1"
          />
          <Button type="submit" variant="primary">
            Іздеу
          </Button>
        </div>
      </Form>

      {/* City buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {cities.map(city => (
          <button
            key={city.name}
            onClick={() => handleCitySelect(city)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: selectedCity === city.name ? 'none' : '1px solid #e0e0e0',
              background: selectedCity === city.name ? '#0071e3' : 'white',
              color: selectedCity === city.name ? 'white' : '#1d1d1f',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            {city.zone === 'green' ? '🟢' : city.zone === 'yellow' ? '🟡' : '🔴'} {city.name}
          </button>
        ))}
      </div>

      {/* Google Maps iframe */}
      <iframe
        src={`https://maps.google.com/maps?q=${encodeURIComponent((selectedCity || 'Алматы') + ',Kazakhstan')}&z=12&output=embed`}
        width="100%"
        height="400px"
        style={{ border: 'none', borderRadius: '16px' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Maps"
      />

      {/* Selected city info */}
      {selectedCity && (
        <Card className="mt-3 address-info-card">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h6 className="mb-0">📍 <strong>{selectedCity}</strong></h6>
              <Badge bg={getZoneBadgeVariant(cities.find(c => c.name === selectedCity)?.zone)}>
                {cities.find(c => c.name === selectedCity)?.zone === 'green' ? '🟢' : 
                 cities.find(c => c.name === selectedCity)?.zone === 'yellow' ? '🟡' : '🔴'}
              </Badge>
            </div>
            <div className="d-flex gap-4 mb-3">
              <div>
                <small className="text-muted d-block">Жеткізу</small>
                <strong className="text-primary">
                  {cities.find(c => c.name === selectedCity)?.delivery}
                </strong>
              </div>
              <div>
                <small className="text-muted d-block">Мерзім</small>
                <strong>{cities.find(c => c.name === selectedCity)?.time}</strong>
              </div>
            </div>
            <Button 
              variant="success" 
              className="w-100"
              onClick={() => onAddressSelect && onAddressSelect({
                address: {
                  city: selectedCity,
                  street: '',
                  houseNumber: '',
                  country: 'Қазақстан'
                },
                deliveryCost: cities.find(c => c.name === selectedCity)?.delivery === 'Тегін' ? 0 : 
                  parseInt(cities.find(c => c.name === selectedCity)?.delivery || 1000),
                deliveryTime: cities.find(c => c.name === selectedCity)?.time || '3-5 күн',
                zone: cities.find(c => c.name === selectedCity)?.zone || 'red'
              })}
            >
              Осы мекенжайды таңдау
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Legend */}
      <div style={{ marginTop: '12px', fontSize: '13px', color: '#6e6e73', textAlign: 'center' }}>
        🟢 Алматы, Астана, Шымкент — Тегін, 1-2 күн &nbsp;|&nbsp;
        🟡 Қарағанды, Атырау, Өскемен — 500 ₸, 2-3 күн &nbsp;|&nbsp;
        🔴 Басқа қалалар — 1000 ₸, 3-5 күн
      </div>
    </div>
  );
};

export default DeliveryMap;
