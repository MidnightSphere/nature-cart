const mongoose = require("mongoose");

// Connect to a single MongoDB database
mongoose.connect("mongodb://127.0.0.1:27017/naturecart")
.then(
    console.log("db Connected")
)

// Customer Schema
const customerSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    profilePhoto: { type: String }, 
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    dob: { type: String, required: true }
});

// Farmer Schema
const farmerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    farmName: { type: String }, // ✅ Make sure this field exists
    profilePhoto: { type: String }, 
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    dob: { type: String, required: true }
});

// Product Schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer" } // ✅ Store farmer's ObjectId
});

// Create models using the same database
const Customer = mongoose.model("Customer", customerSchema);
const Farmer = mongoose.model("Farmer", farmerSchema);
const Product = mongoose.model("Product", productSchema);

module.exports = { Customer, Farmer, Product };
