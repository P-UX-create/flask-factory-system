const { Router } = require("express");
const path = require("path");
const router = Router();

const historyPage = path.join(__dirname, "../public/views/history.html");

router.get("/", (req, res) =>{
    res.sendFile(historyPage);
});

module.exports = router