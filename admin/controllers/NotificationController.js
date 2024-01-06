const db = require('../models/dbconnect');

const ITEMS_PER_PAGE_ORDERS = 2; // Số đơn đặt hàng trên mỗi trang
var searchTerm="";
exports.getAll = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE_ORDERS;
  searchTerm="";
  // Truy vấn cơ sở dữ liệu để lấy tổng số lượng đơn đặt hàng
  db.query('SELECT COUNT(DISTINCT customerID) AS totalDistinctCustomers FROM maymayshop.order;', (countErr, countResults) => {
    if (countErr) {
      console.error('Lỗi truy vấn tổng số lượng đơn đặt hàng: ' + countErr.stack);
      const message = 'Lỗi máy chủ nội bộ';
      res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
      return;
    }

    const totalCount = countResults[0].totalDistinctCustomers;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE_ORDERS);

    // Truy vấn cơ sở dữ liệu để lấy danh sách đơn đặt hàng dựa trên trang và offset
    db.query('SELECT DISTINCT CustomerId, Fullname,Img FROM maymayshop.order,users where maymayshop.order.CustomerId=users.Id LIMIT ? OFFSET ?', [ITEMS_PER_PAGE_ORDERS, offset], (err, results) => {
      if (err) {
        console.error('Lỗi truy vấn MySQL: ' + err.stack);
        const message = 'Lỗi máy chủ nội bộ';
        res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
        return;
      }

      res.render('../admin/views/Notify/Notification.ejs', {
        mess: results,
        currentPage: page,
        totalPages: totalPages,
        searchTerm: searchTerm
      });
    });
  });
};

exports.get1 = (req, res) => {
  // Truy vấn cơ sở dữ liệu để lấy sản phẩm
  const cusId = req.params.cusId;
  db.query('select * from `order` where customerId=?',[cusId], (err, results1) => {
    if (err) {
      console.error('Error querying MySQL: ' + err.stack);
      const message = 'Internal Server Error';
      res.send(`<script>alert("${message}"); window.location.href = "/admin/orders";</script>`);
    }
    db.query('SELECT orderdetail.*,products.Name FROM maymayshop.order,orderdetail,products where orderdetail.ProductId=products.Id and orderdetail.OrderId=maymayshop.order.Id and CustomerId=?',[cusId], (err, results2) => {
      if (err) {
        console.error('Error querying MySQL: ' + err.stack);
        const message = 'Internal Server Error';
        res.send(`<script>alert("${message}"); window.location.href = "/admin/orders";</script>`);
      }
      res.render('../admin/views/Notify/NotifyContent.ejs', { mess: results1,content: results2 });
    });
  });
};

exports.search = (req, res) => {
    searchTerm = req.body.searchTerm;
    const searchValue = '%' + searchTerm + '%';
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * ITEMS_PER_PAGE_ORDERS;
  
    db.query('SELECT DISTINCT users.Id as CustomerId, users.Fullname, users.Img ' +
    'FROM users ' +
    'LEFT JOIN maymayshop.order ON users.Id = maymayshop.order.CustomerId ' +
    'WHERE users.Id LIKE ? OR users.Fullname LIKE ? ' +
    'LIMIT ? OFFSET ?',
      [searchValue, searchValue, ITEMS_PER_PAGE_ORDERS, offset],
      (err, results) => {
        if (err) {
          console.error('Error querying MySQL: ' + err.stack);
          res.status(500).send('Internal Server Error');
          return;
        }
  
        // Truy vấn cơ sở dữ liệu để lấy tổng số lượng đơn hàng tìm kiếm
        db.query('SELECT COUNT(DISTINCT users.Id) AS totalDistinctCustomers ' +
        'FROM users ' +
        'LEFT JOIN maymayshop.order ON users.Id = maymayshop.order.CustomerId ' +
        'WHERE users.Id LIKE ? OR users.Fullname LIKE ?', [searchValue, searchValue], (countErr, countResults) => {
          if (countErr) {
            console.error('Lỗi truy vấn tổng số lượng đơn hàng tìm kiếm: ' + countErr.stack);
            const message = 'Lỗi máy chủ nội bộ';
            res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
            return;
          }
  
          const totalCount = countResults[0].totalDistinctCustomers;
          const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE_ORDERS);
  
          res.render('../admin/views/Notify/Notification.ejs', {
            mess: results,
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

  db.query('SELECT DISTINCT users.Id as CustomerId, users.Fullname, users.Img ' +
  'FROM users ' +
  'LEFT JOIN maymayshop.order ON users.Id = maymayshop.order.CustomerId ' +
  'WHERE users.Id LIKE ? OR users.Fullname LIKE ? ' +
  'LIMIT ? OFFSET ?',
    [searchValue, searchValue, ITEMS_PER_PAGE_ORDERS, offset],
    (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ' + err.stack);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Truy vấn cơ sở dữ liệu để lấy tổng số lượng đơn hàng tìm kiếm
      db.query('SELECT COUNT(DISTINCT users.Id) AS totalDistinctCustomers ' +
      'FROM users ' +
      'LEFT JOIN maymayshop.order ON users.Id = maymayshop.order.CustomerId ' +
      'WHERE users.Id LIKE ? OR users.Fullname LIKE ?', [searchValue, searchValue], (countErr, countResults) => {
        if (countErr) {
          console.error('Lỗi truy vấn tổng số lượng đơn hàng tìm kiếm: ' + countErr.stack);
          const message = 'Lỗi máy chủ nội bộ';
          res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
          return;
        }

        const totalCount = countResults[0].totalDistinctCustomers;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE_ORDERS);

        res.render('../admin/views/Notify/Notification.ejs', {
          mess: results,
          currentPage: page,
          totalPages: totalPages,
          searchTerm: searchTerm
        });
      });
    }
  );
};
