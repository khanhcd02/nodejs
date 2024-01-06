// routes/productsRoute.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin === 1) {
    return next();
  }
  const message = 'bạn không có quyền admin';
  res.send(`<script>alert("${message}"); window.location.href = "/home";</script>`);
}
router.get('/',isAuthenticated, categoryController.getAllCategory);
router.get('/add',isAuthenticated, (req, res) => {
    res.render('../admin/views/category/addcategory.ejs');
});
router.post('/search',isAuthenticated, categoryController.searchC);
router.get('/search',isAuthenticated, categoryController.searchResult);
router.get('/update/:categoryId',isAuthenticated, categoryController.getCategory);

router.post('/add',isAuthenticated, categoryController.AddCategory);
router.post('/update/:categoryId',isAuthenticated, categoryController.UCategory);
router.post('/del/:categoryId',isAuthenticated, categoryController.delcategory);
module.exports = router;
