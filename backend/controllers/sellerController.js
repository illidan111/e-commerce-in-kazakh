import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';

// @desc    Create new seller listing
// @route   POST /api/seller/products
// @access  Private
const createSellerListing = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    condition,
    city,
    phone,
    images,
  } = req.body;

  if (!name || !description || !price || !category || !city || !phone) {
    res.status(400);
    throw new Error('Барлық міндетті өрістерді толтырыңыз');
  }

  const product = new Product({
    name,
    description,
    price: Number(price),
    category,
    condition: condition || 'Жаңа',
    city,
    phone,
    images: images || [],
    image: images && images.length > 0 ? images[0] : '',
    seller: req.user._id,
    isUserListing: true,
    status: 'pending',
    brand: 'Жеке сатушы',
    countInStock: 1,
    user: req.user._id,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Get user's own listings
// @route   GET /api/seller/my-products
// @access  Private
const getMyListings = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id })
    .sort({ createdAt: -1 })
    .populate('seller', 'name email');

  res.json(products);
});

// @desc    Edit own listing
// @route   PUT /api/seller/products/:id
// @access  Private
const updateSellerListing = asyncHandler(async (req, res) => {
  const { name, description, price, category, condition, city, phone, images } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Жарнама табылмады');
  }

  // Check if the user owns this listing
  if (product.seller.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Бұл жарнаманы өзгертуге рұқсатыңыз жоқ');
  }

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price !== undefined ? Number(price) : product.price;
  product.category = category || product.category;
  product.condition = condition || product.condition;
  product.city = city || product.city;
  product.phone = phone || product.phone;
  
  if (images && images.length > 0) {
    product.images = images;
    product.image = images[0];
  }

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc    Delete own listing
// @route   DELETE /api/seller/products/:id
// @access  Private
const deleteSellerListing = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Жарнама табылмады');
  }

  // Check if the user owns this listing
  if (product.seller.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Бұл жарнаманы өшіруге рұқсатыңыз жоқ');
  }

  await Product.deleteOne({ _id: product._id });
  res.json({ message: 'Жарнама өшірілді' });
});

// @desc    Get all seller listings (for admin moderation)
// @route   GET /api/seller/all
// @access  Private/Admin
const getAllSellerListings = asyncHandler(async (req, res) => {
  const products = await Product.find({ isUserListing: true })
    .sort({ createdAt: -1 })
    .populate('seller', 'name email');

  res.json(products);
});

// @desc    Admin approves listing
// @route   PUT /api/admin/seller/products/:id/approve
// @access  Private/Admin
const approveListing = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'active', 'rejected'

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Жарнама табылмады');
  }

  if (!product.isUserListing) {
    res.status(400);
    throw new Error('Бұл жарнама жеке сатушы жарнамасы емес');
  }

  product.status = status || 'active';
  const updatedProduct = await product.save();

  res.json(updatedProduct);
});

// @desc    Mark listing as sold
// @route   PUT /api/seller/products/:id/sold
// @access  Private
const markAsSold = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Жарнама табылмады');
  }

  if (product.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Бұл жарнаманы өзгертуге рұқсатыңыз жоқ');
  }

  product.status = 'sold';
  product.countInStock = 0;
  const updatedProduct = await product.save();

  res.json(updatedProduct);
});

export {
  createSellerListing,
  getMyListings,
  updateSellerListing,
  deleteSellerListing,
  getAllSellerListings,
  approveListing,
  markAsSold,
};
