const express = require('express');
const router = express.Router();
const passport = require('passport');
const db = require('../model/dbconnect');

router.get('/', (req, res) => {
  const errorMessage = req.query.error ? 'Sai tài khoản hoặc mật khẩu.' : '';
  res.render('login.ejs', { message: errorMessage });
});

router.post('/', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login?error=true',
}));

module.exports = router;
