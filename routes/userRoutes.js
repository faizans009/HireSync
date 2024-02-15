import express from "express";
import { login, register,validateOTP, logout, getUser, forgetPassword, forgetOTP, updatePassword } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/validate",validateOTP );
router.post("/login", login);
router.post("/forgotPassword", forgetPassword);
router.post("/forgetOTP", forgetOTP);
router.post("/updatePassword",isAuthenticated, updatePassword);
router.get("/logout", isAuthenticated, logout);
router.get("/getUser", isAuthenticated, getUser);

export default router;