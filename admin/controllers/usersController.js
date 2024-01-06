const db = require('../models/dbconnect');

exports.addUser = (req, res) => {
  const { fullname, username, password, email, sdt,isAdmin } = req.body;
  // Kiểm tra xem người dùng đã tải lên ảnh chưa
  if (!req.file) {
    console.error('Không có tệp ảnh được tải lên.');
    res.status(400).json({ message: 'Không có tệp ảnh được tải lên.' });
    return;
  }
  const image = req.file.filename; 
  db.query('INSERT INTO users (Fullname, Img, Username, Password, Email, SDT, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [fullname, image, username, password, email, sdt, isAdmin],
    (err, results) => {
      if (err) {
        console.error('Lỗi thêm sản phẩm:', err);
        res.status(500).json({ message: 'Lỗi thêm sản phẩm' });
      } else {
        const message = 'Dữ liệu đã được thêm thành công';
        res.send(`<script>alert("${message}"); window.location.href = "/admin/users";</script>`);
      }
    }
  );
};

const ITEMS_PER_PAGE_USERS = 2; // Số người dùng trên mỗi trang
var searchTerm="";
exports.getAllUsers = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE_USERS;
  searchTerm="";
  // Truy vấn cơ sở dữ liệu để lấy tổng số lượng người dùng
  db.query('SELECT COUNT(*) AS totalCount FROM users', (countErr, countResults) => {
    if (countErr) {
      console.error('Lỗi truy vấn tổng số lượng người dùng: ' + countErr.stack);
      const message = 'Lỗi máy chủ nội bộ';
      res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
      return;
    }

    const totalCount = countResults[0].totalCount;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE_USERS);

    // Truy vấn cơ sở dữ liệu để lấy danh sách người dùng dựa trên trang và offset
    db.query('SELECT * FROM users LIMIT ? OFFSET ?', [ITEMS_PER_PAGE_USERS, offset], (err, results) => {
      if (err) {
        console.error('Lỗi truy vấn MySQL: ' + err.stack);
        const message = 'Lỗi máy chủ nội bộ';
        res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
        return;
      }

      res.render('../admin/views/users/users.ejs', {
        users: results,
        currentPage: page,
        totalPages: totalPages,
        searchTerm: searchTerm
      });
    });
  });
};

exports.getUser = (req, res) => {
  // Truy vấn cơ sở dữ liệu để lấy sản phẩm
  const userId = req.params.userId;
  db.query('SELECT * FROM users where Id=?',[userId], (err, results) => {
    if (err) {
      console.error('Error querying MySQL: ' + err.stack);
      res.status(500).send('Internal Server Error');
      return;
    }
    // Sử dụng tệp EJS để hiển thị danh sách sản phẩm
    res.render('../admin/views/users/userdetails.ejs', { u: results });
  });
};
exports.UpdateUser = (req, res) => {
  const { fullname, username, password, email, sdt,isAdmin } = req.body;
  const userId = req.params.userId;
  let image='';
  // Kiểm tra xem người dùng đã tải lên ảnh chưa
  if (!req.file) {
    image=req.body.curImg;
  }else{ image = req.file.filename;}
  db.query('UPDATE users SET Fullname = ?, Img = ?, Username = ?, Password = ?, Email = ?, SDT = ?, isAdmin = ? WHERE Id = ?',
    [fullname, image, username, password, email, sdt, isAdmin, userId],
    (err, results) => {
      if (err) {
        console.error('Lỗi update người dùng:', err);
        res.status(500).json({ message: 'Lỗi update người dùng' });
      } else {
        const message = 'Dữ liệu đã được update thành công';
        res.send(`<script>alert("${message}"); window.location.href = "/admin/users";</script>`);
      }
    }
  );
};

exports.searchUser = (req, res) => {
  searchTerm = req.body.searchTerm;
  const searchValue = '%' + searchTerm + '%';
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE_USERS;

  db.query('SELECT * FROM users WHERE Id LIKE ? OR Fullname LIKE ? OR Username LIKE ? LIMIT ? OFFSET ?',
    [searchValue, searchValue, searchValue, ITEMS_PER_PAGE_USERS, offset],
    (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ' + err.stack);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Truy vấn cơ sở dữ liệu để lấy tổng số lượng người dùng tìm kiếm
      db.query('SELECT COUNT(*) AS totalCount FROM users WHERE Id LIKE ? OR Fullname LIKE ? OR Username LIKE ?', [searchValue, searchValue, searchValue], (countErr, countResults) => {
        if (countErr) {
          console.error('Lỗi truy vấn tổng số lượng người dùng tìm kiếm: ' + countErr.stack);
          const message = 'Lỗi máy chủ nội bộ';
          res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
          return;
        }

        const totalCount = countResults[0].totalCount;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE_USERS);

        res.render('../admin/views/users/users.ejs', {
          users: results,
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
  const offset = (page - 1) * ITEMS_PER_PAGE_USERS;

  db.query('SELECT * FROM users WHERE Id LIKE ? OR Fullname LIKE ? OR Username LIKE ? LIMIT ? OFFSET ?',
    [searchValue, searchValue, searchValue, ITEMS_PER_PAGE_USERS, offset],
    (err, results) => {
      if (err) {
        console.error('Error querying MySQL: ' + err.stack);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Truy vấn cơ sở dữ liệu để lấy tổng số lượng người dùng tìm kiếm
      db.query('SELECT COUNT(*) AS totalCount FROM users WHERE Id LIKE ? OR Fullname LIKE ? OR Username LIKE ?', [searchValue, searchValue, searchValue], (countErr, countResults) => {
        if (countErr) {
          console.error('Lỗi truy vấn tổng số lượng người dùng tìm kiếm: ' + countErr.stack);
          const message = 'Lỗi máy chủ nội bộ';
          res.send(`<script>alert("${message}"); window.location.href = "/admin";</script>`);
          return;
        }

        const totalCount = countResults[0].totalCount;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE_USERS);

        res.render('../admin/views/users/users.ejs', {
          users: results,
          currentPage: page,
          totalPages: totalPages,
          searchTerm: searchTerm
        });
      });
    }
  );
};