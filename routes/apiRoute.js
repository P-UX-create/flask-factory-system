const { Router } = require("express");
const path = require("path");
const router = Router();

const { getDashboard } = require("../controllers/dashboardController")
const { showBrand, createBrand, updateBrand, deleteBrand } = require("../controllers/brandsController");
const { 
   getHistory
} = require("../controllers/historyController")

const {
 createProduct,
 getAllProducts,
 getOneProduct,
 updateProduct,
 deleteProduct,
}= require('../controllers/productController');

// dashboard
router.get("/dashboard", getDashboard);

// Brands
router.get("/brands", showBrand);
router.post("/brands", createBrand);
router.patch("/brands/:id", updateBrand);
router.delete("/brands/:id", deleteBrand);

// Products
router.get("/products", getAllProducts);
router.get("/brands/select",showBrand);
router.post("/products", createProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// History
router.get("/history", getHistory)


module.exports = router