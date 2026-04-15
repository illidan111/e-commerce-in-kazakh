import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import fs from 'fs';

const port = process.env.PORT || 5000;

connectDB();

// Ensure uploads directories exist
const __dirname = path.resolve();
const uploadsDir = path.join(__dirname, 'uploads');
const listingsDir = path.join(uploadsDir, 'listings');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(listingsDir)) {
  fs.mkdirSync(listingsDir, { recursive: true });
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/seller', sellerRoutes);

app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

if (process.env.NODE_ENV === 'production') {
  app.use('/uploads', express.static('/var/data/uploads'));
  app.use('/uploads/listings', express.static('/var/data/uploads/listings'));
  app.use('/images/reviews', express.static('/var/data/reviews'));
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  app.use('/uploads/listings', express.static(path.join(__dirname, '/uploads/listings')));
  app.use('/images/reviews', express.static(path.join(__dirname, '/frontend/public/images/reviews')));
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);
