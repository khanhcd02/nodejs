// routes/productsRoute.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const productsController = require('../controllers/productController');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './img/products'); // Thư mục để lưu trữ tệp tin ảnh
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Sử dụng tên gốc của tệp tin
    },
  });
  
const upload = multer({ storage });
router.post('/search',isAuthenticated, productsController.searchP);
router.get('/search',isAuthenticated, productsController.searchResult);
router.get('/',isAuthenticated, productsController.getAllProducts);
router.get('/add',isAuthenticated, productsController.getCategories);
router.post('/add',upload.single('image'),  productsController.addProduct);
router.get('/update/:productId',isAuthenticated, productsController.getUpdate);
router.post('/update/:productId',upload.single('image'),  productsController.UProduct);
router.get('/:productId',isAuthenticated, productsController.getProduct);
router.post('/del/:productId', productsController.delProduct);
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin === 1) {
    return next();
  }
  const message = 'bạn không có quyền admin';
  res.send(`<script>alert("${message}"); window.location.href = "/home";</script>`);
}
module.exports = router;
