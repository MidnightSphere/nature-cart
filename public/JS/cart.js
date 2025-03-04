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
  

function loadCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartContainer = document.getElementById("cart-container");
  const totalPriceElement = document.getElementById("total-price");

  cartContainer.innerHTML = "";
  let totalPrice = 0;

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p class='text-center'>Your cart is empty.</p>";
  } else {
    cart.forEach((item, index) => {
      let priceValue =
        typeof item.price === "string"
          ? parseFloat(item.price.replace(/₹|\/kg|\/dozen|\/liter/g, "").trim())
          : parseFloat(item.price);
      totalPrice += priceValue;

      cartContainer.innerHTML += `
                <div class="card mb-3 shadow-sm product-card">
                    <div class="row g-0">
                        <div class="col-md-3 d-flex align-items-center">
                            <img src="${item.img}" class="img-fluid rounded-start" alt="${item.name}">
                        </div>
                        <div class="col-md-6">
                            <div class="card-body">
                                <h5 class="card-title">${item.name}</h5>
                                <h5 class="card-title">${item.farmname}</h5>
                                <p class="card-text">Price: <strong>₹${priceValue}</strong></p>
                            </div>
                        </div>
                        <div class="col-md-3 d-flex flex-column justify-content-center align-items-center rightbtn">
                            <button class="btn btn-success w-100 mb-2" onclick="openPaymentModal(${index})">Buy Now</button>
                            <button class="btn btn-danger w-100" onclick="removeFromCart(${index})">Remove</button>
                        </div>
                    </div>
                </div>
            `;
    });
  }

  totalPriceElement.textContent = `${totalPrice.toFixed(2)}`;
  updateCartCount();
}

// 🛒 Function to update cart count
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  document.getElementById("cart-count").textContent = cart.length;
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

function buyNow(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let selectedProduct = cart[index];

  // Simulating a Payment Redirect
  alert(`Redirecting to Payment Gateway for ${selectedProduct.name}...`);

  // Remove item from cart after buying
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

document.addEventListener("DOMContentLoaded", loadCart);

// Function to open the payment modal
function openPaymentModal(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if the cart is empty or index is out of range
  if (!cart[index]) {
    console.error("Invalid product selection for payment.");
    return;
  }

  // Store selected product for payment processing
  localStorage.setItem("selectedProduct", JSON.stringify(cart[index]));

  // Ensure the modal exists before trying to open it
  let paymentModalElement = document.getElementById("paymentModal");
  if (!paymentModalElement) {
    console.error("Payment modal not found in DOM.");
    return;
  }

  // Show the Bootstrap modal
  let paymentModal = new bootstrap.Modal(paymentModalElement);
  paymentModal.show();
}

function togglePaymentFields() {
  const method = document.getElementById("paymentMethod").value;

  // Hide all fields first
  document.querySelectorAll(".payment-field").forEach((field) => {
    field.classList.add("d-none");
  });

  // Show relevant field
  if (method === "upi")
    document.getElementById("upiField").classList.remove("d-none");
  if (method === "wallet")
    document.getElementById("walletField").classList.remove("d-none");
  if (method === "card")
    document.getElementById("cardField").classList.remove("d-none");
  if (method === "netbanking")
    document.getElementById("netbankingField").classList.remove("d-none");
}

// Function to confirm payment and process it
function confirmPayment() {
  const method = document.getElementById("paymentMethod").value;
  let isValid = true;
  let validationMessage = "";

  // Validate based on selected payment method
  if (!method) {
    validationMessage = "❌ Please select a payment method!";
    isValid = false;
  } else {
    if (method === "upi") {
      const upiId = document.getElementById("upiId").value.trim();
      if (!upiId.match(/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/)) {
        validationMessage = "❌ Enter a valid UPI ID (e.g., user@upi).";
        isValid = false;
      }
    } else if (method === "wallet") {
      const mobileNumber = document.getElementById("mobileNumber").value.trim();
      if (!mobileNumber.match(/^[6-9]\d{9}$/)) {
        validationMessage = "❌ Enter a valid 10-digit mobile number.";
        isValid = false;
      }
    } else if (method === "card") {
      const cardNumber = document.getElementById("cardNumber").value.trim();
      const expiryDate = document.getElementById("expiryDate").value;
      const cvv = document.getElementById("cvv").value.trim();
      if (!cardNumber.match(/^\d{16}$/)) {
        validationMessage = "❌ Enter a valid 16-digit card number.";
        isValid = false;
      } else if (!expiryDate) {
        validationMessage = "❌ Select a valid expiry date.";
        isValid = false;
      } else if (!cvv.match(/^\d{3}$/)) {
        validationMessage = "❌ Enter a valid 3-digit CVV.";
        isValid = false;
      }
    } else if (method === "netbanking") {
      const bank = document.getElementById("bank").value;
      if (!bank) {
        validationMessage = "❌ Please select your bank.";
        isValid = false;
      }
    }
  }

  if (!isValid) {
    alert(validationMessage);
    return;
  }

  // Process the payment if validation passes
  processPayment(method);
}

// Function to process payment
function processPayment(method) {
  let selectedProduct = JSON.parse(localStorage.getItem("selectedProduct"));

  if (!selectedProduct) {
    alert("❌ Error: No product selected!");
    return;
  }

  // Simulate a loading state for payment processing
  alert(
    `⏳ Processing payment for ${selectedProduct.farmname} using ${method}...`
  );

  setTimeout(() => {
    alert("✅ Payment Successful! Your order has been placed.");

    // Remove the item from the cart after payment
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter((item) => item.farmname !== selectedProduct.farmname);
    localStorage.setItem("cart", JSON.stringify(cart));

    // Reload cart to reflect changes
    loadCart();

    // Close the payment modal
    let paymentModal = bootstrap.Modal.getInstance(
      document.getElementById("paymentModal")
    );
    paymentModal.hide();
  }, 2000);
}

// Function to open checkout modal and show total
function openCheckoutModal() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Your cart is empty. Add items before checkout!");
    return;
  }

  let totalAmount = cart.reduce(
    (sum, product) => sum + parseFloat(product.price),
    0
  );

  document.getElementById("checkout-summary").innerHTML = `You have <b>${
    cart.length
  }</b> items in your cart. <br> 
         Total Amount: <b>₹${totalAmount.toFixed(2)}</b>`;

  let checkoutModal = new bootstrap.Modal(
    document.getElementById("checkoutModal")
  );
  checkoutModal.show();
}

// Function to toggle checkout payment fields based on the selected method
function toggleCheckoutPaymentFields() {
  const method = document.getElementById("checkout-payment-method").value;

  document.querySelectorAll(".payment-field").forEach((field) => {
    field.classList.add("d-none");
  });

  if (method === "upi")
    document.getElementById("checkout-upi-field").classList.remove("d-none");
  if (method === "wallet")
    document.getElementById("checkout-wallet-field").classList.remove("d-none");
  if (method === "card")
    document.getElementById("checkout-card-field").classList.remove("d-none");
  if (method === "netbanking")
    document
      .getElementById("checkout-netbanking-field")
      .classList.remove("d-none");
}

// Function to validate and process checkout payment
function processCheckout() {
  const method = document.getElementById("checkout-payment-method").value;
  let isValid = true;
  let validationMessage = "";

  if (!method) {
    validationMessage = "Please select a payment method!";
    isValid = false;
  } else {
    if (method === "upi") {
      const upiId = document.getElementById("checkout-upi-id").value;
      if (!upiId) {
        validationMessage = "Please enter a valid UPI ID.";
        isValid = false;
      }
    } else if (method === "wallet") {
      const mobileNumber = document.getElementById(
        "checkout-mobile-number"
      ).value;
      if (!mobileNumber) {
        validationMessage =
          "Please enter your mobile number linked with the wallet.";
        isValid = false;
      }
    } else if (method === "card") {
      const cardNumber = document.getElementById("checkout-card-number").value;
      const expiryDate = document.getElementById("checkout-expiry-date").value;
      const cvv = document.getElementById("checkout-cvv").value;
      if (!cardNumber || !expiryDate || !cvv) {
        validationMessage = "Please enter complete card details.";
        isValid = false;
      }
    } else if (method === "netbanking") {
      const bank = document.getElementById("checkout-bank").value;
      if (!bank) {
        validationMessage = "Please select your bank.";
        isValid = false;
      }
    }
  }

  if (!isValid) {
    alert(validationMessage);
    return;
  }

  // Process the payment
  processTotalPayment(method);
}

// Function to process payment for all items
function processTotalPayment(method) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let totalAmount = cart.reduce(
    (sum, product) => sum + parseFloat(product.price),
    0
  );

  alert(
    `Processing total checkout of ₹${totalAmount.toFixed(2)} using ${method}...`
  );

  setTimeout(() => {
    alert("✅ Payment Successful! Your order has been placed.");

    // Empty the cart after successful checkout
    localStorage.removeItem("cart");

    // Reload the cart page to reflect changes
    loadCart();

    // Close the checkout modal
    let checkoutModal = bootstrap.Modal.getInstance(
      document.getElementById("checkoutModal")
    );
    checkoutModal.hide();
  }, 2000);
}
