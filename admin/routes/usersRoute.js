// routes/productsRoute.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const usersController = require('../controllers/usersController');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './img/users'); // Thư mục để lưu trữ tệp tin ảnh
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Sử dụng tên gốc của tệp tin
    },
});
const upload = multer({ storage });
router.get('/',isAuthenticated, usersController.getAllUsers);
router.get('/add',isAuthenticated, (req, res) => {
    res.render('../admin/views/users/addUser.ejs');
});
router.post('/add',upload.single('image'),  usersController.addUser);

router.post('/search',isAuthenticated, usersController.searchUser);
router.get('/search',isAuthenticated, usersController.searchResult);
router.get('/:userId',isAuthenticated, usersController.getUser);
router.post('/:userId',upload.single('image'),  usersController.UpdateUser);
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin === 1) {
    return next();
  }
  const message = 'bạn không có quyền admin';
  res.send(`<script>alert("${message}"); window.location.href = "/home";</script>`);
}
module.exports = router;