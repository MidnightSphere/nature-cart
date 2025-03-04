document.addEventListener("DOMContentLoaded", async () => {
    try {
        let response = await fetch("/check-user-role", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}` // Use JWT if applicable
            }
        });
  
        let data = await response.json();
        const sellProductBtn = document.getElementById("sellProductBtn");
  
        if (!sellProductBtn) return; // Ensure button exists
  
        sellProductBtn.setAttribute("href", data.role === "farmer" ? "/panel" : "/signup-farmer");
    } catch (error) {
        console.error("Error fetching user role:", error);
    }
  });
  

document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const productName = urlParams.get("name"); // Default to Potato if no param

  fetchProducts(productName);
});

async function fetchProducts(productName) {
  try {
    const response = await fetch(
      `/product?name=${encodeURIComponent(productName)}`
    );
    if (!response.ok)
      throw new Error("Sorry, no products found for this search.");

    const data = await response.json();
    if (!data.success) throw new Error(data.message || "No products found");

    // document.getElementById("product-title").innerText = productName;

    document.getElementById(
      "product-title"
    ).textContent = `Showing results for: ${productName}`;

    document.getElementById("product-list").innerHTML = ""; // Clear previous products
    data.products.forEach((product) => {
      displayProduct(
        product.name,
        product.farmer.farmName,
        product.price,
        product.category,
        product.imageUrl,
        true
      );
    });
  } catch (error) {
    console.error("Error:", error);
    document.getElementById(
      "product-list"
    ).innerHTML = `<p class="text-danger">${error.message}</p>`;
  }
}

// Function to Display Product in UI
function displayProduct(
  name,
  farmName,
  productPrice,
  productCategory,
  imageUrl,
  isFromDB = false
) {
  let productList = document.getElementById("product-list");

  if (!productList) {
    console.error("Error: #product-list not found!");
    return; // Stop execution if container is missing
  }

  let categorySection = document.getElementById(productCategory);
  if (!categorySection) {
    categorySection = document.createElement("div");
    categorySection.id = productCategory;
    categorySection.classList.add("col-12", "mt-4");
    categorySection.innerHTML = `<div class="row"></div>`;
    productList.appendChild(categorySection);
  }

  let rowContainer = categorySection.querySelector(".row");

  let imageUrlPath = isFromDB ? imageUrl : URL.createObjectURL(imageUrl);
  let newProduct = document.createElement("div");
  newProduct.classList.add("col-md-3");
  newProduct.innerHTML = `
        <div class="card" style="height: 90%;">
            <img src="${imageUrlPath}" class="card-img-top product-image" alt="Product Image" style="height: 200px; width:200px; object-fit: cover;">
            <div class="card-body">
                <h5 class="card-title">${name}</h5>
                <h5 class="card-title">${farmName}</h5>
                <p class="card-text">Price: ₹${productPrice} /kg</p>
                <button class="btn btn-success w-100 btn-add-to-cart" data-name="${name}" data-farmname="${farmName}" 
                        data-price="${productPrice}" 
                        data-img="${imageUrlPath}">Add to Cart</button>
            </div>
        </div>`;

  rowContainer.appendChild(newProduct);
}

// 🛒 Fix: Handle 'Add to Cart' for dynamically loaded buttons
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-add-to-cart")) {
    const button = event.target;
    const name = button.getAttribute("data-name");
    const farmname = button.getAttribute("data-farmname");
    const price = button.getAttribute("data-price");
    const img = button.getAttribute("data-img");

    addToCart({ name, farmname, price, img });
  }
});

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingProduct = cart.find(
    (item) => item.name === product.name
  );
  if (existingProduct) {
    alert("Item is already in your cart!");
  } else {
    cart.push({
      name: product.name,
      farmname: product.farmname,
      price: product.price,
      img: product.img,
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    alert("Added to cart successfully!");
  }
}

// 🛒 Function to update cart count
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  document.getElementById("cart-count").textContent = cart.length;
}

// Update cart count on page load
document.addEventListener("DOMContentLoaded", updateCartCount);
