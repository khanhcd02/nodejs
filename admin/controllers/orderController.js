// controllers/productsController.js
const db = require('../models/dbconnect');

const ITEMS_PER_PAGE_ORDERS = 10; // Số đơn đặt hàng trên mỗi trang
var searchTerm="";
exports.getAllOrder = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE_ORDERS;
  searchTerm="";
  // Truy vấn cơ sở dữ liệu để lấy tổng số lượng đơn đặt hàng
  db.query('SELECT COUNT(*) AS totalCount FROM `order`', (countErr, countResults) => {
    if (countErr) {
      console.error('Lỗi truy vấn tổng số lượng đơn đặt hàng: ' + countErr.stack);
      const message = 'Lỗi máy chủ nội bộ';
      res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
      return;
    }

    const totalCount = countResults[0].totalCount;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE_ORDERS);

    // Truy vấn cơ sở dữ liệu để lấy danh sách đơn đặt hàng dựa trên trang và offset
    db.query('SELECT `order`.*, users.Fullname FROM `users` JOIN `order` ON `users`.Id = `order`.CustomerId ORDER BY `order`.Id LIMIT ? OFFSET ?', [ITEMS_PER_PAGE_ORDERS, offset], (err, results) => {
      if (err) {
        console.error('Lỗi truy vấn MySQL: ' + err.stack);
        const message = 'Lỗi máy chủ nội bộ';
        res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
        return;
      }

      res.render('../admin/views/orders/orders.ejs', {
        order: results,
        currentPage: page,
        totalPages: totalPages,
        searchTerm: searchTerm
      });
    });
  });
};

exports.getOrder = (req, res) => {
  // Truy vấn cơ sở dữ liệu để lấy sản phẩm
  const orderId = req.params.orderId;
  db.query('SELECT orderdetail.*, order.Address, order.Status, products.Name AS ProductName FROM `order` JOIN orderdetail ON `order`.Id = orderdetail.OrderId JOIN products ON orderdetail.ProductId = products.Id WHERE orderdetail.OrderId = ?',[orderId], (err, results) => {
    if (err) {
      console.error('Error querying MySQL: ' + err.stack);
      const message = 'Internal Server Error';
      res.send(`<script>alert("${message}"); window.location.href = "/admin/orders";</script>`);
    }
    // Sử dụng tệp EJS để hiển thị danh sách sản phẩm
    res.render('../admin/views/orders/orderdetails.ejs', { order: results });
  });
};

exports.setStatus = (req, res) => {
  const { status,address } = req.body;
  const orderId = req.params.orderId;
  db.query('UPDATE maymayshop.order SET Address = ?, Status = ? WHERE Id = ?',
    [address, status, orderId],
    (err, results) => {
      if (err) {
        console.error('Lỗi update đơn hàng:', err);
        res.status(500).json({ message: 'Lỗi update đơn hàng' });
      } else {
        const message = 'Dữ liệu đã được update thành công';
        res.send(`<script>alert("${message}"); window.location.href = "/admin/orders";</script>`);
      }
    }
  );
};

exports.searchOrder = (req, res) => {
  searchTerm = req.body.searchTerm;
  const searchValue = '%' + searchTerm + '%';
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE_ORDERS;

  db.query('SELECT `order`.*, users.Fullname FROM `users` JOIN `order` ON `users`.Id = `order`.CustomerId WHERE `order`.Id LIKE ? OR CustomerId LIKE ? OR Fullname LIKE ? LIMIT ? OFFSET ?',
    [searchValue, searchValue, searchValue, ITEMS_PER_PAGE_ORDERS, offset],
    (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ' + err.stack);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Truy vấn cơ sở dữ liệu để lấy tổng số lượng đơn hàng tìm kiếm
      db.query('SELECT COUNT(*) AS totalCount FROM `users` JOIN `order` ON `users`.Id = `order`.CustomerId WHERE `order`.Id LIKE ? OR CustomerId LIKE ? OR Fullname LIKE ?', [searchValue, searchValue, searchValue], (countErr, countResults) => {
        if (countErr) {
          console.error('Lỗi truy vấn tổng số lượng đơn hàng tìm kiếm: ' + countErr.stack);
          const message = 'Lỗi máy chủ nội bộ';
          res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
          return;
        }

        const totalCount = countResults[0].totalCount;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE_ORDERS);

        res.render('../admin/views/orders/orders.ejs', {
          order: results,
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
  const offset = (page - 1) * ITEMS_PER_PAGE_ORDERS;

  db.query('SELECT `order`.*, users.Fullname FROM `users` JOIN `order` ON `users`.Id = `order`.CustomerId WHERE `order`.Id LIKE ? OR CustomerId LIKE ? OR Fullname LIKE ? LIMIT ? OFFSET ?',
    [searchValue, searchValue, searchValue, ITEMS_PER_PAGE_ORDERS, offset],
    (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ' + err.stack);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Truy vấn cơ sở dữ liệu để lấy tổng số lượng đơn hàng tìm kiếm
      db.query('SELECT COUNT(*) AS totalCount FROM `users` JOIN `order` ON `users`.Id = `order`.CustomerId WHERE `order`.Id LIKE ? OR CustomerId LIKE ? OR Fullname LIKE ?', [searchValue, searchValue, searchValue], (countErr, countResults) => {
        if (countErr) {
          console.error('Lỗi truy vấn tổng số lượng đơn hàng tìm kiếm: ' + countErr.stack);
          const message = 'Lỗi máy chủ nội bộ';
          res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
          return;
        }

        const totalCount = countResults[0].totalCount;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE_ORDERS);

        res.render('../admin/views/orders/orders.ejs', {
          order: results,
          currentPage: page,
          totalPages: totalPages,
          searchTerm: searchTerm
        });
      });
    }
  );
};