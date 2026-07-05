const { Router } = require("express");
const path = require("path");
const router = Router();

const brandsPage = path.join(__dirname, "../public/views/brands.html");

router.get("/", (req, res) =>{
    res.sendFile(brandsPage);
});

module.exports = router;