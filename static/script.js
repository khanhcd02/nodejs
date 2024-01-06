// JavaScript (script.js)
const productList = document.getElementById("productList");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

productList.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("viewDetailsButton")) {
    const productId = target.getAttribute("data-product-id");
    // Sử dụng Ajax hoặc Fetch API để tải trang chi tiết sản phẩm
    fetch(`/product/${productId}`)
      .then((response) => response.text())
      .then((data) => {
        // Hiển thị trang chi tiết sản phẩm trong phần modalContent
        modalContent.innerHTML = data;
        modal.style.display = "block";
      });
  }
});


closeModalButton.addEventListener("click", () => {
  modal.style.display = "none";
});
