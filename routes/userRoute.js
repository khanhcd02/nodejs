const express = require('express');
const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
  res.render('user.ejs', { user: req.user });
});

// Middleware kiểm tra xem người dùng đã đăng nhập chưa
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
