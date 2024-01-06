// controllers/productsController.js
const db = require('../models/dbconnect');

exports.addProduct = (req, res) => {
  const { name, shortDes, price, categoryId, fullDes } = req.body;
  // Kiểm tra xem người dùng đã tải lên ảnh chưa
  if (!req.file) {
    console.error('Không có tệp ảnh được tải lên.');
    res.status(400).json({ message: 'Không có tệp ảnh được tải lên.' });
    return;
  }

  const image = req.file.filename; // Đường dẫn tệp hình ảnh sau khi tải lên

  db.query('INSERT INTO products (Name, Img, CategoryId, ShortDes, FullDes, Price) VALUES (?, ?, ?, ?, ?, ?)',
    [name, image, categoryId, shortDes, fullDes, price],
    (err, results) => {
      if (err) {
        console.error('Lỗi thêm sản phẩm:', err);
        res.status(500).json({ message: 'Lỗi thêm sản phẩm' });
      } else {
        const message = 'Dữ liệu đã được thêm thành công';
        res.send(`<script>alert("${message}"); window.location.href = "/admin/products";</script>`);
      }
    }
  );
};

exports.UProduct = (req, res) => {
  const { name, shortDes, price, categoryId, fullDes } = req.body;
  const productId = req.params.productId;
  let image='';
  // Kiểm tra xem người dùng đã tải lên ảnh chưa
  if (!req.file) {
    image=req.body.curImg;
  }else{ image = req.file.filename;}

  

  db.query('UPDATE products SET Name = ?, Img = ?, CategoryId = ?, ShortDes = ?, FullDes = ?, Price = ? WHERE Id = ?',
    [name, image, categoryId, shortDes, fullDes, price, productId],
    (err, results) => {
      if (err) {
        console.error('Lỗi update sản phẩm:', err);
        res.status(500).json({ message: 'Lỗi update sản phẩm' });
      } else {
        const message = 'Dữ liệu đã được update thành công';
        res.send(`<script>alert("${message}"); window.location.href = "/admin/products";</script>`);
      }
    }
  );
};

const ITEMS_PER_PAGE_PRODUCTS = 10; // Số sản phẩm trên mỗi trang

exports.getAllProducts = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE_PRODUCTS;
  searchTerm="";
  // Truy vấn cơ sở dữ liệu để lấy tổng số lượng sản phẩm
  db.query('SELECT COUNT(*) AS totalCount FROM products WHERE isDel=0', (countErr, countResults) => {
    if (countErr) {
      console.error('Lỗi truy vấn tổng số lượng sản phẩm: ' + countErr.stack);
      const message = 'Lỗi máy chủ nội bộ';
      res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
      return;
    }

    const totalCount = countResults[0].totalCount;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE_PRODUCTS);

    // Truy vấn cơ sở dữ liệu để lấy danh sách sản phẩm dựa trên trang và offset
    db.query('SELECT * FROM products WHERE isDel=0 LIMIT ? OFFSET ?', [ITEMS_PER_PAGE_PRODUCTS, offset], (err, results) => {
      if (err) {
        console.error('Lỗi truy vấn MySQL: ' + err.stack);
        const message = 'Lỗi máy chủ nội bộ';
        res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
        return;
      }

      res.render('../admin/views/products/adminproducts.ejs', {
        products: results,
        currentPage: page,
        totalPages: totalPages,
        searchTerm: searchTerm
      });
    });
  });
};
exports.getUpdate = (req, res) => {
  // Truy vấn cơ sở dữ liệu để lấy sản phẩm
  const productId = req.params.productId;
  db.query('SELECT * FROM products where Id=?',[productId], (err, proresults) => {
    if (err) {
      console.error('Error querying MySQL: ' + err.stack);
      res.status(500).send('Internal Server Error');
      return;
    }
    db.query('SELECT Id, Name FROM category WHERE isDel=0', (err, cateresults) => {
      if (err) {
          console.error('Lỗi truy vấn danh mục sản phẩm:', err);
          res.status(500).json({ message: 'Lỗi truy vấn danh mục sản phẩm' });
          return;
      }
      res.render('../admin/views/products/Uproduct.ejs', { product: proresults, categories: cateresults });
    });
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
    res.render('../admin/views/products/adminprodetail.ejs', { products: results });
  });
};
exports.getCategories = (req, res) => {
  db.query('SELECT Id, Name FROM category WHERE isDel=0', (err, results) => {
      if (err) {
          console.error('Lỗi truy vấn danh mục sản phẩm:', err);
          res.status(500).json({ message: 'Lỗi truy vấn danh mục sản phẩm' });
      } else {
          const categories = results;
          res.render('../admin/views/products/addproduct.ejs', { categories });
      }
  });
};
exports.delProduct = (req, res) => {
  const  productId  = req.params.productId;
  db.query('SELECT * FROM products WHERE Id = ?', [productId], (err, results) => {
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
          // Câu truy vấn SQL để xóa dữ liệu từ bảng
          const sql = 'UPDATE products SET isDel = ? WHERE Id = ?';

          // Thực hiện câu truy vấn SQL với kết nối đang mượn
          connection.query(sql, [1,productId], (queryErr, result) => {
            // Trả lại kết nối vào pool sau khi hoàn thành
            connection.release();

            if (queryErr) {
              console.error('Lỗi xóa dữ liệu:', queryErr);
              res.status(500).json({ message: 'Lỗi xóa dữ liệu' });
            } else {
              const message = 'Dữ liệu đã được xoá thành công';
              res.send(`<script>alert("${message}"); window.location.href = "/admin/products";</script>`);
            }
          });
        }
      });
    } else {
      const message = 'loại sản phẩm này chưa có';
      res.send(`<script>alert("${message}"); window.location.href = "/admin/products";</script>`);
    }
  });
}
var searchTerm="";
exports.searchP = (req, res) => {
  searchTerm = req.body.searchTerm;
  const searchValue = '%' + searchTerm + '%';
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE_PRODUCTS;

  db.query('SELECT * FROM products WHERE Id LIKE ? OR Name LIKE ? LIMIT ? OFFSET ?',
    [searchValue, searchValue, ITEMS_PER_PAGE_PRODUCTS, offset],
    (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ' + err.stack);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Truy vấn cơ sở dữ liệu để lấy tổng số lượng sản phẩm tìm kiếm
      db.query('SELECT COUNT(*) AS totalCount FROM products WHERE Id LIKE ? OR Name LIKE ?', [searchValue, searchValue], (countErr, countResults) => {
        if (countErr) {
          console.error('Lỗi truy vấn tổng số lượng sản phẩm tìm kiếm: ' + countErr.stack);
          const message = 'Lỗi máy chủ nội bộ';
          res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
          return;
        }

        const totalCount = countResults[0].totalCount;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE_PRODUCTS);

        res.render('../admin/views/products/adminproducts.ejs', {
          products: results,
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
  const offset = (page - 1) * ITEMS_PER_PAGE_PRODUCTS;

  db.query('SELECT * FROM products WHERE Id LIKE ? OR Name LIKE ? LIMIT ? OFFSET ?',
    [searchValue, searchValue, ITEMS_PER_PAGE_PRODUCTS, offset],
    (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ' + err.stack);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Truy vấn cơ sở dữ liệu để lấy tổng số lượng sản phẩm tìm kiếm
      db.query('SELECT COUNT(*) AS totalCount FROM products WHERE Id LIKE ? OR Name LIKE ?', [searchValue, searchValue], (countErr, countResults) => {
        if (countErr) {
          console.error('Lỗi truy vấn tổng số lượng sản phẩm tìm kiếm: ' + countErr.stack);
          const message = 'Lỗi máy chủ nội bộ';
          res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
          return;
        }

        const totalCount = countResults[0].totalCount;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE_PRODUCTS);

        res.render('../admin/views/products/adminproducts.ejs', {
          products: results,
          currentPage: page,
          totalPages: totalPages,
          searchTerm: searchTerm
        });
      });
    }
  );
};