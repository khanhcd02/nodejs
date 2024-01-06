const db = require('../model/dbconnect');

function createOrder(req, res) {
  const cartContents = req.session.cart || [];
  const address = req.body.address;
  const userid= req.body.userid;
  if (cartContents.length === 0) {
    //return res.status(400).send('Cart is empty. Cannot place an empty order.');
    const message = 'Cart is empty. Cannot place an empty order.';
    return res.send(`<script>alert("${message}"); window.location.href = "/cart";</script>`);
  }

  // Tạo đơn hàng trong cơ sở dữ liệu
  const order = {
    CustomerId: userid,
    OrderDate: new Date(),
    Address: address,
    Total: calculateTotal(cartContents), // Tổng giá trị đơn hàng dựa trên giá sản phẩm trong giỏ hàng
    Status: 1, // Trạng thái đơn hàng 
  };

  db.query('INSERT INTO `order` SET ?', order, (orderErr, orderResult) => {
    if (orderErr) {
      const message = 'Error creating order.';
      return res.send(`<script>alert("${message}"); window.location.href = "/cart";</script>`);
    }

    // Lấy ID của đơn hàng vừa tạo (đã tự động tăng từ cơ sở dữ liệu)
    const orderId = orderResult.insertId;
    const orderDetails = [];
    // Tạo các chi tiết đơn hàng trong cơ sở dữ liệu
    for (const item of cartContents) {
      const detail = {
        OrderId: orderId, // Sử dụng ID đơn hàng mới tạo
        ProductId: item.productId,
        Quantity: item.quantity,
        Price: item.quantity * item.price, // Tổng giá của số lượng sản phẩm đã thêm vào giỏ hàng
      };
      orderDetails.push(detail);
    }
    Promise.all(orderDetails.map(detail => {
      return new Promise((resolve, reject) => {
        db.query('INSERT INTO `orderdetail` SET ?', detail, (detailErr, detailResult) => {
          if (detailErr) {
            reject(detailErr);
          } else {
            resolve(detailResult);
          }
        });
      });
    }))
    .then(() => {
      // Sau khi tạo đơn hàng và chi tiết đơn hàng thành công, xóa thông tin giỏ hàng trong phiên
      req.session.cart = [];
      const message = 'Order placed successfully.';
      res.send(`<script>alert("${message}"); window.location.href = "/cart";</script>`);
    })
    .catch(error => {
      const message = 'Error creating order details.';
      return res.send(`<script>alert("${message}"); window.location.href = "/cart";</script>`);
    });
  });
}

function checkout(req, res) {
  const loggedIn = true;
  const user=req.user;
  const cartContents = req.session.cart || [];
  const total = calculateTotal(cartContents); // Tính tổng giá trị đơn hàng
  res.render('checkout', { user, cartContents, total,loggedIn});
}

function calculateTotal(cartContents) {
  // Hàm tính tổng giá trị đơn hàng dựa trên nội dung giỏ hàng
  let total = 0;
  for (const item of cartContents) {
    total += item.quantity * item.price; // Số lượng sản phẩm * giá của sản phẩm
  }
  return total;
}

module.exports = {
  createOrder,
  checkout,
};
