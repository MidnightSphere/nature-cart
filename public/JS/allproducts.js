document.addEventListener("DOMContentLoaded", function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        // Reverse Geocoding using OpenStreetMap's Nominatim API
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        )
          .then((response) => response.json())
          .then((data) => {
            let city =
              data.address.city || data.address.town || data.address.village;
            if (city) {
              document.getElementById(
                "locationSelect"
              ).innerHTML = `<option selected>${city}</option>`;
            } else {
              document.getElementById(
                "locationSelect"
              ).innerHTML = `<option selected>Location not found</option>`;
            }
          })
          .catch((error) => {
            console.error("Error fetching location:", error);
            document.getElementById(
              "locationSelect"
            ).innerHTML = `<option selected>Error detecting location</option>`;
          });
      },
      function (error) {
        console.error("Geolocation error:", error);
        document.getElementById(
          "locationSelect"
        ).innerHTML = `<option selected>Enable location services</option>`;
      }
    );
  } else {
    document.getElementById(
      "locationSelect"
    ).innerHTML = `<option selected>Geolocation not supported</option>`;
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    let response = await fetch("/check-user-role", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Use JWT if applicable
      },
    });

    let data = await response.json();
    const sellProductBtn = document.getElementById("sellProductBtn");

    if (!sellProductBtn) return; // Ensure button exists

    sellProductBtn.setAttribute(
      "href",
      data.role === "farmer" ? "/panel" : "/signup-farmer"
    );
  } catch (error) {
    console.error("Error fetching user role:", error);
  }
});

function loadProducts() {
  const categoryButtons = document.querySelectorAll(".category-btn");
  const productContainer = document.getElementById("product-container");

  console.log(productContainer);
  if (!productContainer) return;

  const products = [
    {
      name: "Apple",
      category: "fruits",
      img: "Images/red-apple-fruit.jpg",
    },
    {
      name: "Banana",
      category: "fruits",
      img: "Images/banana-310449_1280.png",
    },
    {
      name: "Tomato",
      category: "vegetables",
      img: "Images/tomato-6707992_1280.png",
    },
    {
      name: "Potato",
      category: "vegetables",
      img: "Images/potato-istockphoto-534781391-612x612.jpg",
    },
    { name: "Milk", category: "dairy", img: "Images/milk-natural.png" },
    { name: "Cheese", category: "dairy", img: "Images/cheese.jpg" },
    { name: "Rice", category: "grains", img: "Images/rice.jpg" },
    { name: "Wheat", category: "grains", img: "Images/wheat.jpeg" },
    {
      name: "Turmeric",
      category: "spices",
      img: "Images/turmeric.jpg",
    },
    { name: "Pepper", category: "spices", img: "/Images/pepper.png " },
  ];

  function displayProducts(category) {
    const productContainer = document.getElementById("product-container");
    if (!productContainer) {
      console.error("Error: #product-container not found!");
      return;
    }
    productContainer.innerHTML = ""; // Clear previous products

    const filteredProducts =
      category === "all"
        ? products
        : products.filter((p) => p.category === category);

    filteredProducts.forEach((product) => {
      productContainer.innerHTML = filteredProducts
        .map(
          (product) => `
        <div class="col-md-3 col-sm-6">
            <div class="card text-center">
                <div class="image-container">
                    <img src="${product.img}" class="card-img-top" alt="${
            product.name
          }">
                </div>
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <a href="/products?name=${encodeURIComponent(
                      product.name
                    )}" class="btn btn-view">View More</a>
                </div>
            </div>
        </div>
    `
        )
        .join("");
    });
  }
  ``;
  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      const selectedCategory = this.getAttribute("data-category");
      displayProducts(selectedCategory);
    });
  });

  displayProducts("all"); // Load all products by default
}

loadProducts();
