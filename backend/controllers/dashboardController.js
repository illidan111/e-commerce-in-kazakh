import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Total Revenue (sum of all paid orders)
  const ordersResult = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
  ]);
  const totalRevenue = ordersResult.length > 0 ? ordersResult[0].totalRevenue : 0;

  // Total Orders
  const totalOrders = await Order.countDocuments();

  // Total Users
  const totalUsers = await User.countDocuments();

  // Total Products
  const totalProducts = await Product.countDocuments();

  res.json({
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
  });
});

// @desc    Get monthly sales for last 6 months
// @route   GET /api/dashboard/monthly-sales
// @access  Private/Admin
const getMonthlySales = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySales = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Format the data for the chart
  const monthNames = ['Қаң', 'Ақп', 'Нау', 'Сәу', 'Мам', 'Мау', 'Шіл', 'Там', 'Қыр', 'Қаз', 'Қар', 'Жел'];
  
  const formattedSales = monthlySales.map(item => ({
    month: monthNames[item._id.month - 1],
    revenue: item.revenue,
    orders: item.orders,
    fullMonth: `${item._id.year} ${monthNames[item._id.month - 1]}`
  }));

  res.json(formattedSales);
});

// @desc    Get recent orders (last 5)
// @route   GET /api/dashboard/recent-orders
// @access  Private/Admin
const getRecentOrders = asyncHandler(async (req, res) => {
  const recentOrders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email');

  const formattedOrders = recentOrders.map(order => ({
    _id: order._id,
    customerName: order.user ? order.user.name : 'Қонақ',
    customerEmail: order.user ? order.user.email : '',
    date: order.createdAt,
    totalPrice: order.totalPrice,
    isPaid: order.isPaid,
    paidAt: order.paidAt,
    isDelivered: order.isDelivered,
    deliveredAt: order.deliveredAt,
  }));

  res.json(formattedOrders);
});

// @desc    Get top selling products
// @route   GET /api/dashboard/top-products
// @access  Private/Admin
const getTopProducts = asyncHandler(async (req, res) => {
  // Get all orders and aggregate product sales
  const topProducts = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        name: { $first: '$orderItems.name' },
        totalSold: { $sum: '$orderItems.qty' },
        revenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 3 }
  ]);

  res.json(topProducts);
});

export {
  getDashboardStats,
  getMonthlySales,
  getRecentOrders,
  getTopProducts,
};
