import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from './Loader';
import {
  useCreateStripePaymentIntentMutation,
  usePayOrderMutation,
} from '../slices/ordersApiSlice';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1d1d1f',
      '::placeholder': {
        color: '#86868b',
      },
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
  hidePostalCode: true,
};

const StripePayment = ({ order, refetch }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const [createPaymentIntent] = useCreateStripePaymentIntentMutation();
  const [payOrder] = usePayOrderMutation();

  useEffect(() => {
    const getPaymentIntent = async () => {
      try {
        const res = await createPaymentIntent({
          orderId: order._id,
          amount: order.totalPrice,
        }).unwrap();
        setClientSecret(res.clientSecret);
      } catch (err) {
        setErrorMessage(err?.data?.message || 'Төлемді инициализациялау қатесі');
      }
    };

    if (order && !order.isPaid) {
      getPaymentIntent();
    }
  }, [order, createPaymentIntent]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (error) {
        setErrorMessage(error.message);
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        await payOrder({
          orderId: order._id,
          details: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            update_time: new Date().toISOString(),
            email_address: order.user.email,
          },
        });
        refetch();
        toast.success('Тапсырыс төленді');
        navigate(`/order/${order._id}`);
      }
    } catch (err) {
      setErrorMessage(err?.data?.message || 'Төлем қатесі');
      toast.error(err?.data?.message || 'Төлем қатесі');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Card Icons */}
      <div style={{ marginBottom: '15px', textAlign: 'center' }}>
        <svg
          width="40"
          height="26"
          viewBox="0 0 48 32"
          style={{ marginRight: '8px' }}
        >
          <rect width="48" height="32" rx="4" fill="#1A1F71" />
          <text
            x="24"
            y="20"
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            VISA
          </text>
        </svg>
        <svg
          width="40"
          height="26"
          viewBox="0 0 48 32"
          style={{ marginRight: '8px' }}
        >
          <circle cx="15" cy="16" r="14" fill="#EB001B" />
          <circle cx="33" cy="16" r="14" fill="#F79E1B" />
          <path
            d="M24 8C27.5 10.5 30 13 30 16C30 19 27.5 21.5 24 24C20.5 21.5 18 19 18 16C18 13 20.5 10.5 24 8Z"
            fill="#FF5F00"
          />
        </svg>
      </div>

      <Form onSubmit={handleSubmit}>
        {/* Card Input Container */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #d1d1d6',
            borderRadius: '10px',
            padding: '15px 20px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <Alert
            variant="danger"
            style={{
              backgroundColor: '#fff2f2',
              border: 'none',
              color: '#dc3545',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '15px',
            }}
          >
            {errorMessage}
          </Alert>
        )}

        {/* Pay Button */}
        <Button
          type="submit"
          disabled={!stripe || isProcessing || !clientSecret}
          style={{
            backgroundColor: '#007AFF',
            border: 'none',
            borderRadius: '25px',
            padding: '14px 32px',
            fontSize: '17px',
            fontWeight: '500',
            width: '100%',
            boxShadow: '0 4px 14px rgba(0, 122, 255, 0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              e.target.style.backgroundColor = '#0051D5';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#007AFF';
          }}
        >
          {isProcessing ? (
            <Loader size="sm" />
          ) : (
            <>
              Төлеу ₸{order.totalPrice}
            </>
          )}
        </Button>

        {/* Test Card Info */}
        <p
          style={{
            fontSize: '12px',
            color: '#86868b',
            textAlign: 'center',
            marginTop: '15px',
          }}
        >
          Тест карта: 4242 4242 4242 4242, келешек күні, кез келген CVC
        </p>
      </Form>
    </div>
  );
};

export default StripePayment;
