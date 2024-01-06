// routes/productsRoute.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin === 1) {
    return next();
  }
  const message = 'bạn không có quyền admin';
  res.send(`<script>alert("${message}"); window.location.href = "/home";</script>`);
}
router.post('/search',isAuthenticated, orderController.searchOrder);
router.get('/search',isAuthenticated, orderController.searchResult);
router.get('/',isAuthenticated, orderController.getAllOrder);
router.get('/:orderId',isAuthenticated, orderController.getOrder);
router.post('/:orderId', orderController.setStatus);
module.exports = router;
