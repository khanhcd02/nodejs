// routes/productsRoute.js
const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController'); // Import controller sản phẩm

router.get('/', productsController.getAllProducts);
router.get('/:productId', productsController.getProduct);
module.exports = router;