const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
router.get('/', isAuthenticated, orderController.checkout);
router.post('/create', orderController.createOrder);
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }

module.exports = router;
