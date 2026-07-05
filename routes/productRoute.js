const { Router } = require("express");
const path = require("path");
const router = Router();

const productsPage = path.join(__dirname, "../public/views/products.html");

router.get("/", (req, res) =>{
    res.sendFile(productsPage);
});

module.exports = router