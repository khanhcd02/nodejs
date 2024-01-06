// routes/productsRoute.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin === 1) {
    return next();
  }
  const message = 'bạn không có quyền admin';
  res.send(`<script>alert("${message}"); window.location.href = "/home";</script>`);
}
router.post('/search',isAuthenticated, NotificationController.search);
router.get('/search',isAuthenticated, NotificationController.searchResult);
router.get('/',isAuthenticated, NotificationController.getAll);
router.get('/:cusId',isAuthenticated, NotificationController.get1);
module.exports = router;
