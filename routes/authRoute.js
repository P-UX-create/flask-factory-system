const { Router } = require("express");
const path = require("path");
const router = Router();

const { forgotPassword, resetPassword } = require("../controllers/auth/changePassword");     
const validateToken = require("../controllers/auth/validateResetToken");     
const verifyToken = require("../controllers/auth/validateController");
const { signUp, login, deleteUser } = require("../controllers/auth/authController")
const { logOut } = require("../controllers/auth/logoutController")
const { updateUsername }= require("../controllers/auth/updateName");


router.post("/logout", logOut);
router.patch("/me", verifyToken, updateUsername)
router.delete("/me", verifyToken,deleteUser )
router.post("/signup", signUp );
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", validateToken, resetPassword);

module.exports = router;