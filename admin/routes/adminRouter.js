// admin/adminRouter.js
const express = require('express');
const router = express.Router();
const path = require('path');
const adminController = require('../controllers/adminController');

router.get('/',isAuthenticated, adminController.getChartData);

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin === 1) {
    return next();
  }
  const message = 'bạn không có quyền admin';
  res.send(`<script>alert("${message}"); window.location.href = "/home";</script>`);
}
router.get('admin/:revenue', isAuthenticated, adminController.getChartData);
module.exports = router;
