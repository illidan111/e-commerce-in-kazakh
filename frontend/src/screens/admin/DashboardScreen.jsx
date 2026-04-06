import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUsers, FaBox, FaMoneyBillWave } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
  useGetDashboardStatsQuery,
  useGetMonthlySalesQuery,
  useGetRecentOrdersQuery,
  useGetTopProductsQuery,
} from '../../slices/dashboardApiSlice';

const DashboardScreen = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetDashboardStatsQuery();
  const { data: monthlySales, isLoading: salesLoading, error: salesError } = useGetMonthlySalesQuery();
  const { data: recentOrders, isLoading: ordersLoading, error: ordersError } = useGetRecentOrdersQuery();
  const { data: topProducts, isLoading: productsLoading, error: productsError } = useGetTopProductsQuery();

  const isLoading = statsLoading || salesLoading || ordersLoading || productsLoading;
  const error = statsError || salesError || ordersError || productsError;

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  const statCards = [
    {
      title: 'Жалпы сатылым',
      value: `₸${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: <FaMoneyBillWave size={24} color='#0071e3' />,
      bgColor: '#e8f4fd',
    },
    {
      title: 'Тапсырыстар саны',
      value: (stats?.totalOrders ?? 0).toLocaleString(),
      icon: <FaShoppingCart size={24} color='#34c759' />,
      bgColor: '#e8f9ef',
    },
    {
      title: 'Пайдаланушылар саны',
      value: (stats?.totalUsers ?? 0).toLocaleString(),
      icon: <FaUsers size={24} color='#af52de' />,
      bgColor: '#f5e8fc',
    },
    {
      title: 'Өнімдер саны',
      value: (stats?.totalProducts ?? 0).toLocaleString(),
      icon: <FaBox size={24} color='#ff9500' />,
      bgColor: '#fff4e5',
    },
  ];

  return (
    <>
      <h2 className='section-title mb-4'>Әкімші панелі</h2>

      {/* Stat Cards */}
      <Row className='mb-4'>
        {statCards.map((card, index) => (
          <Col key={index} xl={3} lg={6} md={6} sm={6} className='mb-3'>
            <Card className='stat-card h-100'>
              <Card.Body>
                <div className='stat-card-content'>
                  <div 
                    className='stat-icon'
                    style={{ backgroundColor: card.bgColor }}
                  >
                    {card.icon}
                  </div>
                  <div className='stat-info'>
                    <h3 className='stat-value'>{card.value}</h3>
                    <p className='stat-title'>{card.title}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Sales Chart */}
      <Card className='mb-4 chart-card'>
        <Card.Body>
          <h4 className='chart-title mb-4'>Соңғы 6 айдағы сатылым</h4>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={monthlySales || []}>
                <XAxis 
                  dataKey='month' 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#86868b', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#86868b', fontSize: 12 }}
                  tickFormatter={(value) => `₸${((value ?? 0) / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value) => [`₸${(Number(value ?? 0)).toLocaleString()}`, 'Сатылым']}
                  contentStyle={{ 
                    background: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey='revenue' 
                  fill='#0071e3' 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>

      <Row>
        {/* Recent Orders */}
        <Col lg={8} className='mb-4'>
          <Card className='h-100'>
            <Card.Body>
              <h4 className='chart-title mb-4'>Соңғы тапсырыстар</h4>
              <Table responsive hover className='admin-table'>
                <thead>
                  <tr>
                    <th>Тапсырыс №</th>
                    <th>Клиент</th>
                    <th>Күн</th>
                    <th>Сома</th>
                    <th>Төленді</th>
                    <th>Жеткізілді</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders?.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <Link to={`/order/${order._id}`} className='order-link'>
                          {order._id.substring(0, 8)}...
                        </Link>
                      </td>
                      <td>{order.customerName}</td>
                      <td>{new Date(order.date).toLocaleDateString('kk-KZ')}</td>
                      <td>₸{(order.totalPrice ?? 0).toLocaleString()}</td>
                      <td>
                        <Badge bg={order.isPaid ? 'success' : 'warning'}>
                          {order.isPaid ? 'Төленді' : 'Күтуде'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={order.isDelivered ? 'success' : 'warning'}>
                          {order.isDelivered ? 'Жеткізілді' : 'Жолда'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Top Products */}
        <Col lg={4} className='mb-4'>
          <Card className='h-100'>
            <Card.Body>
              <h4 className='chart-title mb-4'>Топ өнімдер</h4>
              {topProducts?.map((product, index) => (
                <div key={product._id} className='top-product-item'>
                  <div className='top-product-rank'>{index + 1}</div>
                  <div className='top-product-info'>
                    <p className='top-product-name'>{product.name}</p>
                    <p className='top-product-stats'>
                      {(product.totalSold ?? 0).toLocaleString()} сатылды • ₸{(product.revenue ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default DashboardScreen;
