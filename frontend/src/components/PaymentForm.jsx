import { useState } from 'react';
import { Spinner } from 'react-bootstrap';

const PaymentForm = ({ totalPrice, onPaymentSuccess, onPaymentError }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | processing | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const rawCardNumber = cardNumber.replace(/\s/g, '');

  const getCardType = () => {
    if (rawCardNumber.startsWith('4')) return 'visa';
    if (rawCardNumber.startsWith('5')) return 'mastercard';
    return 'unknown';
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  };

  const displayCardNumber = () => {
    if (rawCardNumber.length === 0) return '**** **** **** ****';
    const padded = rawCardNumber.padEnd(16, '*');
    const masked = '•••• •••• •••• ' + padded.slice(12);
    if (rawCardNumber.length <= 12) {
      return '•••• •••• •••• ' + padded.slice(12);
    }
    return '•••• •••• •••• ' + rawCardNumber.slice(12);
  };

  const validate = () => {
    const newErrors = {};
    if (rawCardNumber.length !== 16) {
      newErrors.cardNumber = 'Карта нөмірі 16 сан болуы керек';
    }
    if (!cardName.trim()) {
      newErrors.cardName = 'Карта иесінің атын енгізіңіз';
    }
    const expiryParts = expiry.split('/');
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      newErrors.expiry = 'Жарамдылық мерзімі MM/YY форматында болуы керек';
    } else {
      const month = parseInt(expiryParts[0], 10);
      const year = parseInt('20' + expiryParts[1], 10);
      const now = new Date();
      const expiryDate = new Date(year, month);
      if (month < 1 || month > 12 || expiryDate <= now) {
        newErrors.expiry = 'Жарамдылық мерзімі болашақ күн болуы керек';
      }
    }
    if (cvv.length !== 3 || !/^\d{3}$/.test(cvv)) {
      newErrors.cvv = 'CVV 3 сан болуы керек';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('processing');
    setErrorMessage('');

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate failed payment for cards starting with 0000
    if (rawCardNumber.startsWith('0000')) {
      setStatus('error');
      setErrorMessage('Төлем қабылданбады. Картаңызды тексеріңіз.');
      if (onPaymentError) {
        onPaymentError('Төлем қабылданбады');
      }
      return;
    }

    setStatus('success');

    // After 1 second, trigger the success callback
    setTimeout(() => {
      if (onPaymentSuccess) {
        onPaymentSuccess({
          id: 'CARD_' + Date.now(),
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          payer: {
            name: cardName,
            card_last_four: rawCardNumber.slice(-4),
          },
        });
      }
    }, 1000);
  };

  const cardType = getCardType();

  return (
    <div className='payment-form-container'>
      {/* Live Card Preview */}
      <div className='card-preview'>
        <div className='card-preview-inner'>
          <div className='card-preview-top'>
            <div className='card-chip'>
              <svg width='36' height='26' viewBox='0 0 36 26' fill='none'>
                <rect width='36' height='26' rx='4' fill='#d4af37' opacity='0.8' />
                <line x1='0' y1='8' x2='36' y2='8' stroke='#b8962e' strokeWidth='1' />
                <line x1='0' y1='13' x2='36' y2='13' stroke='#b8962e' strokeWidth='1' />
                <line x1='0' y1='18' x2='36' y2='18' stroke='#b8962e' strokeWidth='1' />
                <line x1='12' y1='0' x2='12' y2='26' stroke='#b8962e' strokeWidth='1' />
                <line x1='24' y1='0' x2='24' y2='26' stroke='#b8962e' strokeWidth='1' />
              </svg>
            </div>
            <div className='card-type-logo'>
              {cardType === 'visa' && (
                <span className='card-brand-text visa'>VISA</span>
              )}
              {cardType === 'mastercard' && (
                <div className='mc-logo'>
                  <div className='mc-circle mc-red'></div>
                  <div className='mc-circle mc-orange'></div>
                </div>
              )}
            </div>
          </div>
          <div className='card-preview-number'>{displayCardNumber()}</div>
          <div className='card-preview-bottom'>
            <div>
              <div className='card-preview-label'>КАРТА ИЕСІ</div>
              <div className='card-preview-name'>
                {cardName || 'АТЫ ЖӨНІ'}
              </div>
            </div>
            <div>
              <div className='card-preview-label'>МЕРЗІМІ</div>
              <div className='card-preview-expiry'>{expiry || 'MM/YY'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overlays */}
      {status === 'processing' && (
        <div className='payment-status-overlay'>
          <Spinner animation='border' className='payment-spinner' />
          <p className='payment-status-text'>Төлем өңделуде...</p>
        </div>
      )}

      {status === 'success' && (
        <div className='payment-status-overlay success'>
          <div className='payment-success-icon'>✅</div>
          <p className='payment-status-text'>Төлем сәтті өтті!</p>
        </div>
      )}

      {status === 'error' && (
        <div className='payment-error-banner'>
          <span>❌ {errorMessage}</span>
          <button onClick={() => setStatus('idle')} className='retry-btn'>
            Қайталау
          </button>
        </div>
      )}

      {/* Payment Form */}
      {(status === 'idle' || status === 'error') && (
        <form onSubmit={handleSubmit} className='payment-form'>
          <div className='payment-field'>
            <label className='payment-label'>Карта нөмірі</label>
            <input
              type='text'
              className={`payment-input ${errors.cardNumber ? 'error' : ''}`}
              placeholder='1234 5678 9012 3456'
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
            />
            {errors.cardNumber && (
              <span className='payment-field-error'>{errors.cardNumber}</span>
            )}
          </div>

          <div className='payment-field'>
            <label className='payment-label'>Карта иесінің аты</label>
            <input
              type='text'
              className={`payment-input ${errors.cardName ? 'error' : ''}`}
              placeholder='АТЫ ЖӨНІ'
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
            />
            {errors.cardName && (
              <span className='payment-field-error'>{errors.cardName}</span>
            )}
          </div>

          <div className='payment-row'>
            <div className='payment-field'>
              <label className='payment-label'>Мерзімі</label>
              <input
                type='text'
                className={`payment-input ${errors.expiry ? 'error' : ''}`}
                placeholder='MM/YY'
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                maxLength={5}
              />
              {errors.expiry && (
                <span className='payment-field-error'>{errors.expiry}</span>
              )}
            </div>
            <div className='payment-field'>
              <label className='payment-label'>CVV</label>
              <input
                type='password'
                className={`payment-input ${errors.cvv ? 'error' : ''}`}
                placeholder='•••'
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))
                }
                maxLength={3}
              />
              {errors.cvv && (
                <span className='payment-field-error'>{errors.cvv}</span>
              )}
            </div>
          </div>

          <button type='submit' className='payment-submit-btn'>
            Төлеу ₸{Number(totalPrice).toLocaleString()}
          </button>
        </form>
      )}

      {/* Security Badges */}
      <div className='payment-security'>
        <div className='security-badge'>
          <span className='security-lock'>🔒</span>
          <span>SSL қорғалған</span>
        </div>
        <div className='security-cards'>
          <span className='security-visa'>VISA</span>
          <div className='security-mc'>
            <div className='smc-circle smc-red'></div>
            <div className='smc-circle smc-orange'></div>
          </div>
        </div>
        <div className='security-text'>Деректеріңіз қауіпсіз</div>
      </div>
    </div>
  );
};

export default PaymentForm;
