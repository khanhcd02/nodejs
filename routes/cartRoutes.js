const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Sử dụng phương thức POST để thêm sản phẩm vào giỏ hàng
router.post('/products/:productId',isAuthenticated, cartController.addToCart);

// Sử dụng phương thức GET để xem giỏ hàng
router.get('/', cartController.getCart);
router.post('/remove/:productId', cartController.removeFromCart);
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }
module.exports = router;
