import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';

import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useProfileMutation } from '../slices/usersApiSlice';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { Link } from 'react-router-dom';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { userInfo } = useSelector((state) => state.auth);

  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo, userInfo?.email, userInfo?.name]);

  const dispatch = useDispatch();
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Құпия сөздер сәйкес келмейді');
    } else {
      try {
        const res = await updateProfile({
          // NOTE: here we don't need the _id in the request payload as this is
          // not used in our controller.
          // _id: userInfo._id,
          name,
          email,
          password,
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success('Профиль сәтті жаңартылды');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <>
      <Row className='profile-row'>
        <Col lg={4} md={5} className='profile-form-col'>
          <div className='profile-form-card'>
            <h2 className='section-title mb-4'>Пайдаланушы профилі</h2>
            <Form onSubmit={submitHandler}>
              <Form.Group className='mb-3' controlId='name'>
                <Form.Label className='filter-label'>Аты</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Атыңызды енгізіңіз'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='filter-input'
                />
              </Form.Group>

              <Form.Group className='mb-3' controlId='email'>
                <Form.Label className='filter-label'>Электрондық пошта</Form.Label>
                <Form.Control
                  type='email'
                  placeholder='Электрондық поштаңызды енгізіңіз'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='filter-input'
                />
              </Form.Group>

              <Form.Group className='mb-3' controlId='password'>
                <Form.Label className='filter-label'>Жаңа құпия сөз</Form.Label>
                <Form.Control
                  type='password'
                  placeholder='Жаңа құпия сөзді енгізіңіз'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='filter-input'
                />
              </Form.Group>

              <Form.Group className='mb-4' controlId='confirmPassword'>
                <Form.Label className='filter-label'>Құпия сөзді растаңыз</Form.Label>
                <Form.Control
                  type='password'
                  placeholder='Құпия сөзді қайта енгізіңіз'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='filter-input'
                />
              </Form.Group>

              <Button type='submit' variant='primary' className='w-100'>
                Жаңарту
              </Button>
              {loadingUpdateProfile && <Loader />}
            </Form>
          </div>
        </Col>
        <Col lg={8} md={7} className='profile-orders-col'>
          <h2 className='section-title mb-4'>Менің тапсырыстарым</h2>
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant='danger'>
              {error?.data?.message || error.error}
            </Message>
          ) : (
            <div className='orders-table-wrapper'>
              <Table striped hover responsive className='table-sm orders-table'>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Күні</th>
                    <th>Жиыны</th>
                    <th>Төленген</th>
                    <th>Жеткізілген</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className='order-id'>{order._id}</td>
                      <td>{order.createdAt.substring(0, 10)}</td>
                      <td className='order-total'>₸{order.totalPrice.toLocaleString()}</td>
                      <td>
                        {order.isPaid ? (
                          <span className='status-paid'>{order.paidAt.substring(0, 10)}</span>
                        ) : (
                          <FaTimes style={{ color: '#ff3b30' }} />
                        )}
                      </td>
                      <td>
                        {order.isDelivered ? (
                          <span className='status-delivered'>{order.deliveredAt.substring(0, 10)}</span>
                        ) : (
                          <FaTimes style={{ color: '#ff3b30' }} />
                        )}
                      </td>
                      <td>
                        <Button
                          as={Link}
                          to={`/order/${order._id}`}
                          className='btn-sm btn-details'
                          variant='light'
                        >
                          Толығырақ
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Col>
      </Row>
    </>
  );
};

export default ProfileScreen;
