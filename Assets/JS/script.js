function translateLanguage(lang) {
  var selectField = document.querySelector(".goog-te-combo");
  if (selectField) {
    selectField.value = lang;
    selectField.dispatchEvent(new Event("change"));
  }
}

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

document.addEventListener("DOMContentLoaded", function () {
  const categoryButtons = document.querySelectorAll(".category-btn");
  const productContainer = document.getElementById("product-container");

  const products = [
    {
      name: "Apple",
      category: "fruits",
      img: "Assets/Images/red-apple-fruit.jpg",
    },
    {
      name: "Banana",
      category: "fruits",
      img: "Assets/Images/banana-310449_1280.png",
    },
    {
      name: "Tomato",
      category: "vegetables",
      img: "Assets/Images/tomato-6707992_1280.png",
    },
    {
      name: "Potato",
      category: "vegetables",
      img: "Assets/Images/potato-istockphoto-534781391-612x612.jpg",
    },
    { name: "Milk", category: "dairy", img: "Assets/Images/milk-carton.jpg" },
    { name: "Cheese", category: "dairy", img: "Assets/Images/cheese.jpg" },
    { name: "Rice", category: "grains", img: "Assets/Images/rice.jpg" },
    { name: "Wheat", category: "grains", img: "Assets/Images/wheat.jpg" },
    {
      name: "Turmeric",
      category: "spices",
      img: "/Assets/Images/turmeric.jpg",
    },
    { name: "Pepper", category: "spices", img: "/Assets/Images/pepper.jpg" },
  ];

  function displayProducts(category) {
    productContainer.innerHTML = "";
    const filteredProducts =
      category === "all"
        ? products
        : products.filter((p) => p.category === category);

    filteredProducts.forEach((product) => {
      productContainer.innerHTML += `
                <div class="col-md-3 col-sm-6">
                    <div class="card text-center">
                        <div class="image-container">
                            <img src="${product.img}" class="card-img-top" alt="${product.name}">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <a href="products.html?category=${product.category}" class="btn btn-view">View More</a>
                        </div>
                    </div>
                </div>`;
    });
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      const selectedCategory = this.getAttribute("data-category");
      displayProducts(selectedCategory);
    });
  });

  displayProducts("all"); // Load all products by default
});
