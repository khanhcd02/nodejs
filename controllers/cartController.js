const db = require('../model/dbconnect');

function addToCart(req, res) {
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity,10)  || 1; // Mặc định số lượng là 1 nếu không được chỉ định
  const price = parseFloat(req.body.price);
  const img = req.body.img;
  const name = req.body.name;
  if (!req.session.cart) {
    req.session.cart = [];
  }

  // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
  const existingItem = req.session.cart.find(item => item.productId === productId);

  if (existingItem) {
    // Nếu sản phẩm đã tồn tại, cập nhật số lượng
    existingItem.quantity += quantity;
  } else {
    // Nếu sản phẩm chưa tồn tại, thêm sản phẩm mới vào giỏ hàng
    req.session.cart.push({ productId, name, img, quantity, price });
  }
  const message = 'Đã thêm sản phẩm vào giỏ hàng';
  res.send(`<script>alert("${message}"); window.location.href = "/home";</script>`);
}

function getCart(req, res) {
  const cartContents = req.session.cart || [];
  let total = 0;
  cartContents.forEach(item => {
    item.subtotal = item.price * item.quantity;
    total += item.price * item.quantity;
  });
  res.render('cart', { cartContents,total });
}
function removeFromCart(req, res) {
  const productId = req.params.productId;
  if (!req.session.cart) {
    req.session.cart = [];
  }

  // Tìm vị trí của sản phẩm trong giỏ hàng
  const index = req.session.cart.findIndex(item => item.productId === productId);

  if (index >= 0) {
    // Nếu sản phẩm tồn tại, xoá nó khỏi giỏ hàng
    req.session.cart.splice(index, 1);
  }

  const message = 'Đã xoá sản phẩm khỏi giỏ hàng';
  res.redirect('/cart');
}

module.exports = {
  addToCart,
  getCart,
  removeFromCart, // Thêm hàm này
};