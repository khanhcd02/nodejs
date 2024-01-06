const db = require('../model/dbconnect');

exports.searchP = (req, res) => {
  // Truy vấn cơ sở dữ liệu để lấy sản phẩm
  const searchTerm = req.body.searchTerm;
  const searchValue = '%' + searchTerm + '%';
  db.query('SELECT * FROM products where Name LIKE ?',
  [searchValue], 
  (err, results) => {
    if (err) {
      console.error('Error querying MySQL: ' + err.stack);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.render('search.ejs', { searchResults: results});
  });
};
