const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const { Customer, Farmer, Product } = require("./mongodb");
const session = require("express-session");
const multer = require("multer");

app.use(express.json());
app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

app.use(
  session({
    secret: "123456789",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", async (req, res) => {
  try {
    let role = "guest";

    // Fetch products and populate the farmer field to get farmName
    let products = await Product.find().populate("farmer", "farmName");

    console.log("Session Data:", req.session); // Debug session

    if (req.session.user) {
      role = req.session.user.role; // Use role from session
    }

    console.log("Final Role:", role); // Debug role assignment

    res.render("index", {
      user: req.session.user || null,
      products,
      role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/panel", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login-farmer"); // Redirect if not logged in
  }

  try {
    const products = await Product.find(); // Fetch all products from MongoDB
    console.log(req.session.user); // Log user session for debugging
    res.render("panel", {
      user: req.session.user,
      products: products, // Pass products to panel.hbs
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).send("Server Error");
  }
});

app.get("/allproducts", (req, res) => {
  res.render("allproducts");
});

// app.get("/product", (req, res) => {
//     res.render("product");
// });

app.get("/cart", (req, res) => {
  res.render("cart");
});

app.get("/role", (req, res) => {
  res.render("role");
});

//customer
app.get("/login-customer", (req, res) => {
  res.render("login-customer");
});
app.get("/signup-customer", (req, res) => {
  res.render("signup-customer");
});

//Farmer
app.get("/login-farmer", (req, res) => {
  res.render("login-farmer");
});

app.get("/signup-farmer", (req, res) => {
  res.render("signup-farmer");
});

app.get("/add-product", (req, res) => {
  res.send("hello");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/"); // Redirect after logout
  });
});

hbs.registerHelper("eq", function (a, b) {
  return a === b;
});

//Images
//Customer
const customerStorage = multer.diskStorage({
  destination: "./uploads/Customer/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Farmer
const farmerStorage = multer.diskStorage({
  destination: "./uploads/Farmer/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

//Product
const productStorage = multer.diskStorage({
  destination: "./uploads/Products/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadCustomer = multer({ storage: customerStorage });
const uploadFarmer = multer({ storage: farmerStorage });
const uploadProduct = multer({ storage: productStorage });

// For customer
app.post(
  "/signup-customer",
  uploadCustomer.single("profilePhoto"),
  async (req, res) => {
    try {
      const check = await Customer.findOne({ username: req.body.username });

      if (check) {
        res.render("signup-customer", { error: "Username already exists!" });
      } else {
        const data = {
          username: req.body.username,
          password: req.body.password,
          role: "customer",
          phone: req.body.phone,
          email: req.body.email,
          profilePhoto: req.file
            ? `/uploads/Customer/${req.file.filename}`
            : null,
          address: req.body.address,
          city: req.body.city,
          pincode: req.body.pincode,
          dob: req.body.dob,
        };

        await Customer.create(data);
        res.render("login-customer", {
          success: "Account created successfully! Please log in.",
        });
      }
    } catch (error) {
      console.error(error);
      res.render("signup-customer", {
        error: "Something went wrong. Please try again!",
      });
    }
  }
);

app.post("/login-customer", async (req, res) => {
  try {
    const check = await Customer.findOne({ username: req.body.username });

    if (check && check.password === req.body.password) {
      req.session.user = {
        username: check.username,
        role: "customer",
        phone: check.phone,
        email: check.email,
        profilePhoto: check.profilePhoto,
        address: check.address,
        city: check.city,
        pincode: check.pincode,
        dob: check.dob,
      };
      res.redirect("/");
    } else {
      res.render("login-customer", { error: "Wrong username or password!" });
    }
  } catch {
    res.render("login-customer", { error: "Wrong username and password !" });
  }
});

// For Farmer

app.post(
  "/signup-farmer",
  uploadFarmer.single("profilePhoto"),
  async (req, res) => {
    try {
      const check = await Farmer.findOne({ username: req.body.username });

      if (check) {
        return res.render("signup-farmer", {
          error: "Username already exists!",
        });
      }
      const data = {
        username: req.body.username,
        password: req.body.password,
        phone: req.body.phone,
        farmName: req.body.farmName,
        profilePhoto: req.file ? `/uploads/Farmer/${req.file.filename}` : null,
        address: req.body.address,
        city: req.body.city,
        pincode: req.body.pincode,
        dob: req.body.dob,
      };

      await Farmer.create(data);
      return res.render("login-farmer", {
        success: "Account created successfully! Please log in.",
      });
    } catch (error) {
      console.error("Signup Error:", error);
      return res.render("signup-farmer", {
        error: `Something went wrong: ${error.message}`,
      });
    }
  }
);

app.post("/login-farmer", async (req, res) => {
  try {
    const check = await Farmer.findOne({ username: req.body.username });

    if (check && check.password === req.body.password) {
      // Store full user details in session
      req.session.user = {
        username: check.username,
        role: "farmer",
        phone: check.phone,
        farmName: check.farmName,
        profilePhoto: check.profilePhoto,
        address: check.address, // Ensure it's not undefined
        city: check.city,
        pincode: check.pincode,
        dob: check.dob,
      };
      res.redirect("/panel");
    } else {
      res.render("login-farmer", { error: "Wrong username or password!" });
    }
  } catch (error) {
    console.error(error);
    res.render("login-farmer", { error: "Something went wrong!" });
  }
});

//Product

app.post("/add-product", uploadProduct.single("imageUrl"), async (req, res) => {
  console.log("Route hit: /add-product"); // Debugging

  try {
    const { name, price, quantity, category } = req.body;
    console.log("Received Data:", req.body); // Debugging

    if (!name || !price || !quantity || !category) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image file is required" });
    }

    console.log("File received:", req.file); // Debugging

    // ✅ Ensure user is logged in as a farmer
    console.log("Session user:", req.session.user);
    if (!req.session.user || req.session.user.role !== "farmer") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized: Only farmers can add products",
        });
    }

    // ✅ Fetch the farmer's details from the database
    console.log("Looking for farmer with username:", req.session.user.username);
    const farmer = await Farmer.findOne({
      username: req.session.user.username,
    });
    console.log("Farmer found:", farmer);

    if (!farmer) {
      return res
        .status(404)
        .json({ success: false, message: "Farmer not found" });
    }

    // ✅ Store farmer's ObjectId instead of farmName
    const data = {
      farmer: farmer._id,
      name,
      price,
      quantity,
      category,
      imageUrl: `/uploads/Products/${req.file.filename}`,
    };

    const savedProduct = await Product.create(data);
    console.log("Product saved successfully:", savedProduct); // Debugging

    return res.status(201).json({
      success: true,
      message: "Product added successfully!",
      product: savedProduct,
    });
  } catch (error) {
    if (!res.headersSent) {
      // ✅ Prevents sending multiple responses
      console.error("Error adding product:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: `Something went wrong: ${error.message}`,
        });
    }
  }
});

// ✅ Render the Product Page (Separate Route)
app.get("/products", (req, res) => {
  res.render("products"); // ✅ This only renders the product page
});

// ✅ FIXED Get Product Route
app.get("/product", async (req, res) => {
  try {
    const productName = req.query.name; // Get name from query parameter
    if (!productName) {
      return res
        .status(400)
        .json({ success: false, message: "Product name is required" });
    }

    // ✅ Find products that exactly match the name
    const products = await Product.find({ name: productName })
      .populate("farmer", "farmName")
      .select("name price category imageUrl farmer");

    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found" });
    }

    res.json({ success: true, products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/get-products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Port connected to Port ${PORT}!`);
});
