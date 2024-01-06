// controllers/userController.js
const path = require('path');
const multer = require('multer');
const db = require('../model/dbconnect');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'img/users/');
  },
  filename: (req, file, cb) => {
    cb(null, path.extname(file.originalname));
  },
});

const upload = multer({ storage });
// Xử lý đăng ký
exports.signup = (req, res) => {
  const formData = req.body;
  formData.img = req.file.path.substring(10);
  db.query('SELECT * FROM users WHERE username = ?', [formData.username], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return;
    }
    if (results.length > 0) {
      const message = 'Đăng ký thất bại:TK đã tồn tại!';
      res.send(`<script>alert("${message}"); window.location.href = "/signup";</script>`);
    } else {
      db.getConnection((err, connection) => {
        if (err) {
          console.error('Lỗi kết nối đến cơ sở dữ liệu:', err);
          const message = 'Lỗi kết nối đến cơ sở dữ liệu';
          res.send(`<script>alert("${message}"); window.location.href = "/signup";</script>`);
        } else {
          // Câu truy vấn SQL để chèn dữ liệu vào bảng
          const sql = 'INSERT INTO users (Fullname, Img, Username, Password, Email, SDT, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)';

          // Thực hiện câu truy vấn SQL với kết nối đang mượn
          connection.query(sql, [formData.fullname,formData.img, formData.username, formData.password, formData.email, formData.sdt,0], (queryErr, result) => {
            // Trả lại kết nối vào pool sau khi hoàn thành
            connection.release();

            if (queryErr) {
              console.log(req.body);
              console.log(req.file);
              console.error('Lỗi thêm dữ liệu:', queryErr);
              res.status(500).json({ message: 'Lỗi thêm dữ liệu' });
            } else {
              console.log('Dữ liệu đã được thêm thành công');
              const message = 'Đăng ký thành công';
              res.send(`<script>alert("${message}"); window.location.href = "/login";</script>`);
            }
          });
        }
      });
    }
  });
};

exports.deleteAccount = (req, res) => {
  const { tkdel } = req.body;

  // Thực hiện xử lý xóa tài khoản ở đây và gửi kết quả về cho trình duyệt
  db.query('SELECT * FROM users WHERE Username = ?', [tkdel], (err, results) => {
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
          const sql = 'DELETE FROM users WHERE Username = ?';

          // Thực hiện câu truy vấn SQL với kết nối đang mượn
          connection.query(sql, [tkdel], (queryErr, result) => {
            // Trả lại kết nối vào pool sau khi hoàn thành
            connection.release();

            if (queryErr) {
              console.error('Lỗi xóa dữ liệu:', queryErr);
              res.status(500).json({ message: 'Lỗi xóa dữ liệu' });
            } else {
              console.log('Dữ liệu đã được xóa thành công');
              res.json({ message: 'Dữ liệu đã được xóa thành công' });
            }
          });
        }
      });
    } else {
      res.status(200).send('username chưa tồn tại');
      return;
    }
  });
};

// Xử lý đổi mật khẩu
exports.changePassword = (req, res) => {
  const { uid, mk } = req.body;

  // Thực hiện xử lý đổi mật khẩu ở đây và gửi kết quả về cho trình duyệt
  db.query('SELECT * FROM users WHERE Id = ?', [uid], (err, results) => {
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
          // Câu truy vấn SQL để cập nhật mật khẩu
          const sql = 'UPDATE users SET Password = ? WHERE Id = ?';

          // Thực hiện câu truy vấn SQL với kết nối đang mượn
          connection.query(sql, [mk, uid], (queryErr, result) => {
            // Trả lại kết nối vào pool sau khi hoàn thành
            connection.release();

            if (queryErr) {
              console.error('Lỗi cập nhật dữ liệu:', queryErr);
              res.status(500).json({ message: 'Lỗi cập nhật dữ liệu' });
            } else {
              console.log('Dữ liệu đã được cập nhật thành công');
              const message = 'Đổi mật khẩu thành công';
              res.send(`<script>alert("${message}"); window.location.href = "/personal";</script>`);
            }
          });
        }
      });
    } else {
      res.status(200).send('Tk không tồn tại');
      return;
    }
  });
};
