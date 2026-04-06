import path from 'path';
import express from 'express';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

// Ensure reviews directory exists
const reviewsDir = 'frontend/public/images/reviews';
if (!fs.existsSync(reviewsDir)) {
  fs.mkdirSync(reviewsDir, { recursive: true });
}

// Single image upload storage (for product images)
const singleStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Multiple images upload storage (for review images)
const reviewStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, reviewsDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `review-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`
    );
  },
});

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Тек суреттер жүктеуге рұқсат етіледі (JPEG, PNG, WEBP)'), false);
  }
}

// 5MB file size limit
const maxFileSize = 5 * 1024 * 1024;

const uploadSingle = multer({
  storage: singleStorage,
  fileFilter,
  limits: { fileSize: maxFileSize }
});

const uploadMultiple = multer({
  storage: reviewStorage,
  fileFilter,
  limits: { fileSize: maxFileSize }
});

const uploadSingleImage = uploadSingle.single('image');
const uploadReviewImages = uploadMultiple.array('images', 3);

// Single image upload endpoint (existing)
router.post('/', (req, res) => {
  uploadSingleImage(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send({ message: 'Файл өлшемі 5МБ-ден аспауы керек' });
      }
      return res.status(400).send({ message: err.message });
    }

    res.status(200).send({
      message: 'Image uploaded successfully',
      image: `/${req.file.path}`,
    });
  });
});

// Multiple images upload endpoint for reviews
router.post('/reviews', (req, res) => {
  uploadReviewImages(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send({ message: 'Әр файл өлшемі 5МБ-ден аспауы керек' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).send({ message: 'Ең көбі 3 сурет жүктеуге болады' });
      }
      return res.status(400).send({ message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: 'Суреттер жүктелмеді' });
    }

    const images = req.files.map(file => `/images/reviews/${file.filename}`);

    res.status(200).send({
      message: 'Суреттер сәтті жүктелді',
      images: images,
    });
  });
});

export default router;
