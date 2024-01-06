const db = require('../models/dbconnect');

const ITEMS_PER_PAGE = 2;
var searchTerm="";
exports.getAllCategory = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;
  searchTerm="";
  // Truy vấn để lấy tổng số lượng loại sản phẩm
  db.query('SELECT COUNT(*) AS totalCount FROM category WHERE isDel=0', (countErr, countResults) => {
    if (countErr) {
      console.error('Lỗi truy vấn tổng số lượng: ' + countErr.stack);
      const message = 'Lỗi máy chủ nội bộ';
      res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
      return;
    }

    const totalCount = countResults[0].totalCount;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Truy vấn để lấy dữ liệu trang hiện tại
    db.query('SELECT * FROM category WHERE isDel=0 LIMIT ? OFFSET ?', [ITEMS_PER_PAGE, offset], (err, results) => {
      if (err) {
        console.error('Lỗi truy vấn MySQL: ' + err.stack);
        const message = 'Lỗi máy chủ nội bộ';
        res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
        return;
      }

      res.render('../admin/views/category/category.ejs', { category: results, currentPage: page, totalPages: totalPages, searchTerm: searchTerm });
    });
  });
};


exports.getCategory = (req, res) => {
  const categoryId = req.params.categoryId;
  db.query('SELECT * FROM category WHERE Id = ?', [categoryId], (err, results) => {
    if (err) {
      console.error('Error querying MySQL: ' + err.stack);
      const message = 'Internal Server Error';
      res.send(`<script>alert("${message}"); window.location.href = "/admin/category";</script>`);
    }
    res.render('../admin/views/category/Ucategory.ejs', { category: results });
  });
};

exports.AddCategory = (req, res) => {
  const { name } = req.body;
  db.query('SELECT * FROM category WHERE Name = ?', [name], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return;
    }
    if (results.length > 0) {
      const message = 'Đã có loại sản phẩm này rồi';
      res.send(`<script>alert("${message}"); window.location.href = "/admin/category";</script>`);
    } else {
      db.getConnection((err, connection) => {
        if (err) {
          console.error('Lỗi kết nối đến cơ sở dữ liệu:', err);
          res.status(500).json({ message: 'Lỗi kết nối đến cơ sở dữ liệu' });
        } else {
          const sql = 'INSERT INTO category (Name) VALUES (?)';
          connection.query(sql, [name], (queryErr, result) => {
            connection.release();

            if (queryErr) {
              console.error('Lỗi thêm dữ liệu:', queryErr);
              res.status(500).json({ message: 'Lỗi thêm dữ liệu' });
            } else {
              const message = 'Dữ liệu đã được thêm thành công';
              res.send(`<script>alert("${message}"); window.location.href = "/admin/category";</script>`);
            }
          });
        }
      });
    }
  });
};

exports.UCategory = (req, res) => {
  const name = req.body.name;
  const categoryId = req.params.categoryId;
  db.query('SELECT * FROM category WHERE Id = ?', [categoryId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return;
    }
    if (results.length > 0) {
      db.getConnection((err, connection) => {
        if (err) {
          console.error('Lỗi kết nối đến cơ sở dữ liệu:', err);
          res.status(500).json({ message: 'Lỗi kết nối đến cơ sở dữ liệu' });
        } else {
          const sql = 'UPDATE category SET Name = ? WHERE Id = ?';
          connection.query(sql, [name,categoryId], (queryErr, result) => {
            connection.release();

            if (queryErr) {
              console.error('Lỗi sửa dữ liệu:', queryErr);
              res.status(500).json({ message: 'Lỗi sửa dữ liệu' });
            } else {
              const message = 'Dữ liệu đã được cập nhật thành công';
              res.send(`<script>alert("${message}"); window.location.href = "/admin/category";</script>`);
            }
          });
        }
      });
    } else {
      const message = 'không tìm thấy loại sản phẩm này';
      res.send(`<script>alert("${message}"); window.location.href = "/admin/category";</script>`);
    }
  });
};

exports.delcategory = (req, res) => {
  const  categoryId  = req.params.categoryId;
  db.query('SELECT * FROM category WHERE Id = ?', [categoryId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return;
    }
    if (results.length > 0) {
      db.getConnection((err, connection) => {
        if (err) {
          console.error('Lỗi kết nối đến cơ sở dữ liệu:', err);
          res.status(500).json({ message: 'Lỗi kết nối đến cơ sở dữ liệu' });
        } else {
          let sql = 'UPDATE products SET isDel=? WHERE CategoryId = ?';
          connection.query(sql, [1,categoryId], (queryErr, result) => {
            connection.release();
          });
          sql = 'UPDATE category SET isDel=? WHERE Id = ?';
          connection.query(sql, [1,categoryId], (queryErr, result) => {
            // Trả lại kết nối vào pool sau khi hoàn thành
            connection.release();

            if (queryErr) {
              console.error('Lỗi xóa dữ liệu:', queryErr);
              res.status(500).json({ message: 'Lỗi xóa dữ liệu' });
            } else {
              const message = 'Dữ liệu đã được xoá thành công';
              res.send(`<script>alert("${message}"); window.location.href = "/admin/category";</script>`);
            }
          });
        }
      });
    } else {
      const message = 'loại sản phẩm này chưa có';
      res.send(`<script>alert("${message}"); window.location.href = "/admin/category";</script>`);
    }
  });
}

exports.searchC = (req, res) => {
  searchTerm = req.body.searchTerm;
  const searchValue = '%' + searchTerm + '%';
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  db.query('SELECT * FROM category WHERE Id LIKE ? OR Name LIKE ? LIMIT ? OFFSET ?',
    [searchValue, searchValue, ITEMS_PER_PAGE, offset],
    (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ' + err.stack);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Truy vấn cơ sở dữ liệu để lấy tổng số lượng danh mục tìm kiếm
      db.query('SELECT COUNT(*) AS totalCount FROM category WHERE Id LIKE ? OR Name LIKE ?', [searchValue, searchValue], (countErr, countResults) => {
        if (countErr) {
          console.error('Lỗi truy vấn tổng số lượng danh mục tìm kiếm: ' + countErr.stack);
          const message = 'Lỗi máy chủ nội bộ';
          res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
          return;
        }

        const totalCount = countResults[0].totalCount;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

        res.render('../admin/views/category/category.ejs', {
          category: results,
          currentPage: page,
          totalPages: totalPages,
          searchTerm: searchTerm
        });
      });
    }
  );
};

exports.searchResult = (req, res) => {
  const searchValue = '%' + searchTerm + '%';
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  db.query('SELECT * FROM category WHERE Id LIKE ? OR Name LIKE ? LIMIT ? OFFSET ?',
    [searchValue, searchValue, ITEMS_PER_PAGE, offset],
    (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ' + err.stack);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Truy vấn cơ sở dữ liệu để lấy tổng số lượng danh mục tìm kiếm
      db.query('SELECT COUNT(*) AS totalCount FROM category WHERE Id LIKE ? OR Name LIKE ?', [searchValue, searchValue], (countErr, countResults) => {
        if (countErr) {
          console.error('Lỗi truy vấn tổng số lượng danh mục tìm kiếm: ' + countErr.stack);
          const message = 'Lỗi máy chủ nội bộ';
          res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
          return;
        }

        const totalCount = countResults[0].totalCount;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

        res.render('../admin/views/category/category.ejs', {
          category: results,
          currentPage: page,
          totalPages: totalPages,
          searchTerm: searchTerm
        });
      });
    }
  );
};