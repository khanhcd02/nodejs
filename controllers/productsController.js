// controllers/productsController.js
const db = require('../model/dbconnect');

exports.getAllProducts = (req, res) => {
  // Truy vấn cơ sở dữ liệu để lấy danh sách sản phẩm
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Error querying MySQL: ' + err.stack);
      res.status(500).send('Internal Server Error');
      return;
    }
    // Sử dụng tệp EJS để hiển thị danh sách sản phẩm
    res.render('products.ejs', { products: results });
  });
};
exports.getProduct = (req, res) => {
  // Truy vấn cơ sở dữ liệu để lấy sản phẩm
  const productId = req.params.productId;
  db.query('SELECT * FROM products where Id=?',[productId], (err, results) => {
    if (err) {
      console.error('Error querying MySQL: ' + err.stack);
      res.status(500).send('Internal Server Error');
      return;
    }
    // Sử dụng tệp EJS để hiển thị danh sách sản phẩm
    res.render('productdetail.ejs', { products: results });
  });
};
exports.findProduct = (req, res) => {
  // Truy vấn cơ sở dữ liệu để lấy sản phẩm
  const productId = req.params.productId;
  db.query('SELECT * FROM products where Name=?',[productId], (err, results) => {
    if (err) {
      console.error('Error querying MySQL: ' + err.stack);
      res.status(500).send('Internal Server Error');
      return;
    }
    // Sử dụng tệp EJS để hiển thị danh sách sản phẩm
    res.render('productdetail.ejs', { products: results });
  });
};