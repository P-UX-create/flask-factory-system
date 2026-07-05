const { Router } = require("express");
const path = require("path");
const router = Router();

const landingPage = path.join(__dirname, "../public/views/index.html");
const loginPage = path.join(__dirname, "../public/views/login.html");
const signupPage = path.join(__dirname, "../public/views/signup.html");
const forgotPassword = path.join(__dirname, "../public/views/forgot.html");
const resetPassword = path.join(__dirname, "../public/views/reset.html");
const guestMiddleware = require("../middlewares/guestMiddleware")

router.get("/",  guestMiddleware, (req, res) => {
    res.sendFile(landingPage);
});

router.get("/login",  guestMiddleware, (req, res) =>{
    res.sendFile(loginPage);
});

router.get("/signup",  guestMiddleware, (req, res) =>{
    res.sendFile(signupPage);
});

router.get("/forgot",  guestMiddleware,  (req, res) =>{
    res.sendFile(forgotPassword);
});

router.get("/reset", guestMiddleware,  (req, res) =>{
    res.sendFile(resetPassword);
});


module.exports = router