const { Router } = require("express");
const path = require("path");
const router = Router();

const dashboardPage = path.join(__dirname, "../public/views/dashboard.html");

router.get("/", (req, res) =>{
    res.sendFile(dashboardPage);
});

module.exports = router