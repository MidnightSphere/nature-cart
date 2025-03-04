const productsByCategory = {
    Fruits: ["Apple", "Banana", "Mango"],
    Vegetables: ["Carrot", "Potato", "Tomato"],
    Dairy: ["Milk", "Cheese", "Butter"],
    Grains: ["Rice", "Wheat", "Oats"],
    Spices: ["Turmeric", "Cumin", "Coriander"]
};

// Handle category selection and update product dropdown
document.getElementById('categoryDropdown').addEventListener('change', function () {
    let category = this.value;
    let productDropdown = document.getElementById('productDropdown');
    productDropdown.innerHTML = '<option value="">Select Product</option>'; // Reset dropdown

    if (category && productsByCategory[category]) {
        productsByCategory[category].forEach(product => {
            let option = document.createElement('option');
            option.value = product;
            option.textContent = product;
            productDropdown.appendChild(option);
        });
    }
});

// Fetch Products from Database and Display
document.addEventListener('DOMContentLoaded', fetchProducts);

async function fetchProducts() {
    try {
        let response = await fetch('/get-products');

        if (!response.ok) throw new Error("Failed to fetch products.");

        let products = await response.json(); // ✅ Corrected this line

        products.forEach(product => {
            displayProduct(product.name, product.price, product.quantity, product.category, product.imageUrl, true);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        alert("Failed to fetch products. Please try again.");
    }
}

// Add Product to Database and Display in UI
document.getElementById('addProductForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    let productName = document.getElementById('productDropdown').value;
    let productPrice = document.getElementById('productPrice').value;
    let productQuantity = document.getElementById('productQuantity').value;
    let productCategory = document.getElementById('categoryDropdown').value;
    let productImage = document.getElementById('productImage').files[0];

    if (!productCategory || !productName) {
        alert('Please select a category and a product name.');
        return;
    }

    let formData = new FormData();
    formData.append('name', productName);
    formData.append('price', productPrice);
    formData.append('quantity', productQuantity);
    formData.append('category', productCategory);
    formData.append('imageUrl', productImage);

    try {
        let response = await fetch('/add-product', {
            method: 'POST',
            body: formData
        });

        let result = await response.json();

        if (response.ok && result.success) {
            alert("Product added successfully!");
            
            // ✅ Reset form fields
            document.getElementById('addProductForm').reset();

            // ✅ Hide modal
            var modalInstance = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
            modalInstance.hide();

            // ✅ Display newly added product instantly
            displayProduct(result.product.name, result.product.price, result.product.quantity, result.product.category, result.product.imageUrl, true);
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error adding product:", error);
        alert("Something went wrong. Please try again.");
    }
});

// Function to Display Product in UI
function displayProduct(productName, productPrice, productQuantity, productCategory, imageUrl, isFromDB = false) {
    let categorySection = document.getElementById(productCategory);
    if (!categorySection) {
        categorySection = document.createElement('div');
        categorySection.id = productCategory;
        categorySection.classList.add('col-12', 'mt-4');
        categorySection.innerHTML = `<h4>${productCategory}</h4><div class="row"></div>`;
        document.getElementById('productList').appendChild(categorySection);
    }

    let rowContainer = categorySection.querySelector('.row');
    if (!rowContainer) {
        rowContainer = document.createElement('div');
        rowContainer.classList.add('row');
        categorySection.appendChild(rowContainer);
    }

    let imageUrlPath = isFromDB ? imageUrl : URL.createObjectURL(imageUrl);
    let newProduct = document.createElement('div');
    newProduct.classList.add('col-md-3');
    newProduct.innerHTML = `
        <div class="card" style="height: 100%;">
            <img src="${imageUrlPath}" class="card-img-top product-image" alt="Product Image" style="height: 200px; width:200px; object-fit: cover;">
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <h5 class="card-title">${productName}</h5>
                    <div class="dropdown">
                        <button class="btn btn-light p-1" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                            <li><a class="dropdown-item edit-btn" href="#">Edit</a></li>
                            <li><a class="dropdown-item delete-btn" href="#">Delete</a></li>
                        </ul>
                    </div>
                </div>
                <p class="card-text d-flex justify-content-between">
                    <span class="product-price">Price: ₹${productPrice}</span> 
                    <span class="product-quantity">Qty: ${productQuantity} Kg</span>
                </p>
            </div>
        </div>`;

    rowContainer.appendChild(newProduct);
}
