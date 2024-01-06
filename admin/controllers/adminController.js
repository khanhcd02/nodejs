const db = require('../models/dbconnect');
const path = require('path');
// Hàm lấy tổng số sản phẩm
function getTotalProducts() {
  return new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) AS TotalProducts FROM products', (err, results) => {
          if (err) {
              console.error('Error executing query for total products:', err);
              return reject(err);
          }
          const totalProducts = results[0].TotalProducts;
          resolve(totalProducts);
      });
  });
}

// Hàm lấy tổng số người dùng
function getTotalUsers() {
  return new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) AS TotalUsers FROM users', (err, results) => {
          if (err) {
              console.error('Error executing query for total users:', err);
              return reject(err);
          }
          const totalUsers = results[0].TotalUsers;
          resolve(totalUsers);
      });
  });
}

// Hàm lấy tổng số đơn hàng
function getTotalOrders() {
  return new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) AS TotalOrders FROM maymayshop.order', (err, results) => {
          if (err) {
              console.error('Error executing query for total orders:', err);
              return reject(err);
          }
          const totalOrders = results[0].TotalOrders;
          resolve(totalOrders);
      });
  });
}
function generateRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
exports.getChartData = async (req, res) => {
  const totalProducts = await getTotalProducts();
  const totalUsers = await getTotalUsers();
  const totalOrders = await getTotalOrders();
  const customerData = await getCustomerOrderData();
  const selectedRevenue = req.query.revenue || 'day'; 
  const revenueResult = await getRevenue(selectedRevenue);
  db.query('SELECT products.Name AS ProductName, SUM(orderdetail.Quantity) AS TotalSold FROM orderdetail JOIN products ON orderdetail.ProductId = products.Id JOIN `order` ON orderdetail.OrderId = `order`.Id WHERE `order`.Status = 2 GROUP BY orderdetail.ProductId; ', (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      
      const colors = [];
      const borderColor = [];
  
      results.forEach((row) => {
        const randomColor = generateRandomColor();
        colors.push(randomColor);
        borderColor.push(`${randomColor}FF`);
      });
      const data = {
        labels: results.map(row => row.ProductName), // Tên sản phẩm 
        datasets: [{
          label: 'Sản phẩm bán được',
          data: results.map(row => row.TotalSold),
          backgroundColor: colors, // Màu nền
          borderColor: borderColor, // Màu viền
          borderWidth: 1
        }]
      };
      const indexPath = path.join(__dirname, '../views/adminpage/index.ejs');
      res.render(indexPath, { user: req.user, data , totalProducts, totalUsers, totalOrders, customerData, selectedRevenue, revenue: revenueResult  });
    });
  
};

function getCustomerOrderData() {
  return new Promise((resolve, reject) => {
    db.query(`
      SELECT users.Fullname AS CustomerName, COUNT(maymayshop.order.Id) AS OrderCount
      FROM users 
      LEFT JOIN maymayshop.order ON users.Id = maymayshop.order.CustomerId
      WHERE maymayshop.order.Status = 2
      GROUP BY users.Id
      HAVING OrderCount >= 5
    `, (err, results) => {
      if (err) {
        console.error('Error executing query for customer orders:', err);
        return reject(err);
      }
      const customerLabels = results.map(row => row.CustomerName);
      const customerData = {
        labels: customerLabels,
        datasets: [{
          data: results.map(row => row.OrderCount),
          backgroundColor: customerLabels.map(() => generateRandomColor()),
          borderColor: customerLabels.map(label => `${generateRandomColor()}FF`),
          borderWidth: 1
        }]
      };
      resolve(customerData);
    });
  });
}

function getRevenue(x){
  return new Promise((resolve, reject) => {
    var sql='SELECT DATE(OrderDate) AS OrderDay, SUM(Total) AS TotalRevenue FROM maymayshop.order GROUP BY OrderDay;';
    if(x==='month')
      sql='SELECT YEAR(OrderDate) AS OrderYear, MONTH(OrderDate) AS OrderMonth, SUM(Total) AS TotalRevenue FROM maymayshop.order GROUP BY OrderYear, OrderMonth;';
    else if(x==='year')
      sql='SELECT YEAR(OrderDate) AS OrderYear, SUM(Total) AS TotalRevenue FROM maymayshop.order GROUP BY OrderYear;';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query for total orders:', err);
            return reject(err);
        }
        const tk = results;
        resolve(tk);
    });
  });
}

exports.revenue = async (req, res) => {
  try {
    const selectedRevenue = req.query.revenue || 'day'; 
    const revenueResult = await getRevenue(selectedRevenue);
    res.send({ selectedRevenue, revenue: revenueResult });
  } catch (error) {
    console.error('Error handling revenue:', error);
    res.status(500).send('Internal Server Error');
  }
}
