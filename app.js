const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const db = require('./model/dbconnect');
const app = express();
const adminRouter = require('./admin/routes/adminRouter');
const adminPro = require('./admin/routes/productsRoute');
const adminOrder = require('./admin/routes/orderRoute');
const adminUser = require('./admin/routes/usersRoute');
const adminCate = require('./admin/routes/categoryRoute');
const loginRoute = require('./routes/loginRoute');
const homeRoute = require('./routes/homeRoute');
const userRoute = require('./routes/userRoute');
const personal = require('./routes/personalRoute');
const productRoute = require('./routes/productRoute');
const notifyRoute = require('./admin/routes/NotificationRoute');
const signupRoute = require('./routes/signupRoute');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const searchRoute = require('./routes/searchRoute');
const userController = require('./controllers/userController');
const multer = require('multer'); // Để xử lý tải lên ảnh
const { render } = require('ejs');

// Cấu hình multer cho việc tải lên ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './img/users'); // Thư mục để lưu trữ tệp tin ảnh
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Sử dụng tên gốc của tệp tin
  },
});
const upload = multer({ storage });

app.set('view engine', 'ejs');
// Cấu hình và sử dụng middleware session
app.use(session({ secret: '1234$', resave: true, saveUninitialized: true,cookie: {maxAge: 3600000,}, }));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'img')));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'image')));
app.use(express.static(path.join(__dirname, 'js')));
app.use(express.static(path.join(__dirname, 'fonts')));
app.use(express.static(path.join(__dirname, '../admin/views')));
app.use(express.static(path.join(__dirname, '../admin/font-awesome')));
app.use(express.static(path.join(__dirname, '../admin/js')));
app.locals.loggedIn = false;
// Cấu hình Passport và sử dụng Local Strategy
passport.use(new LocalStrategy(
  (username, password, done) => {
    // Kiểm tra xác thực từ cơ sở dữ liệu MySQL
    db.query('SELECT * FROM users WHERE Username = ? AND Password = ?', [username, password], (err, results) => {
      if (err) {
        return done(err);
      }
      if (!results.length) {
        return done(null, false, { message: 'Sai tài khoản hoặc mật khẩu.' });
      }
      const user = results[0];
      app.locals.loggedIn = true;
      app.locals.user = user;
      app.locals.isAdmin = user.isAdmin;
      return done(null, user);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.Username);
});

passport.deserializeUser((username, done) => {
  // Lấy thông tin người dùng từ tên người dùng
  db.query('SELECT * FROM users WHERE Username = ?', [username], (err, results) => {
    if (err) {
      return done(err);
    }
    if (!results.length) {
      return done(null, false);
    }
    const user = results[0];
    return done(null, user);
  });
});
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    app.locals.user=null;
    app.locals.loggedIn = false;
    res.redirect('/home'); // Hoặc trang chính (home) của bạn
  });
});
app.get('/contact', (req, res) => {
  res.render('contact');
});
// Thiết lập và sử dụng middleware cho Express
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

// Định nghĩa route cho trang đăng nhập
app.use('/login', loginRoute);
app.use('/home', homeRoute);
app.use('/', homeRoute);
app.use('/user', userRoute);
app.use('/signup', signupRoute);
app.use('/admin', adminRouter);
app.use('/admin/products', adminPro);
app.use('/admin/category', adminCate);
app.use('/admin/orders', adminOrder);
app.use('/admin/users', adminUser);
app.use('/personal', personal);
app.use('/products', productRoute);
app.use('/cart', cartRoutes);
app.use('/admin/notify', notifyRoute);
app.use('/order', orderRoutes);
app.use('/search',searchRoute)
app.post('/signup',upload.single('img'), userController.signup);
app.post('/dmk', userController.changePassword);
app.post('/upload', upload.single('img'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Vui lòng tải lên một hình ảnh.');
  }
  const imgPath = `/img/users/${req.file.filename}`;
  res.send('Upload thành công');
});
// Khởi động máy chủ
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Ứng dụng đang chạy tại http://localhost:${port}`);
});