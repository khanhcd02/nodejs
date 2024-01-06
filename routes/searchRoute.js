const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController'); // Import controller

// Trang tìm kiếm sản phẩm
router.get('/', (req, res) => {
  res.render('search.ejs', { searchResults: [] }); // Trang ban đầu với kết quả tìm kiếm trống
});

// Xử lý tìm kiếm sản phẩm
router.post('/', searchController.searchP); // Sử dụng controller để xử lý tìm kiếm

module.exports = router;
