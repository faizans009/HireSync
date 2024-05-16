import express from "express";
import { login, register, logout, getUser, forgetPassword,allUsers, getAllUsersData, resetPassword } from "../controllers/userController.js";
import {  authorizeRoles,isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
// router.post("/validate",validateOTP );
router.post("/login", login);
// router.post("/forgotPassword", forgetPassword);

// router.post("/forgetOTP", forgetOTP);
// router.post("/updatePassword",isAuthenticated, updatePassword);
router.get("/logout", isAuthenticated, logout);
router.get("/getUser", isAuthenticated, getUser);
router.get("/getAllUsers",isAuthenticated, allUsers);
router.get("/getAllUsersData",isAuthenticated,authorizeRoles("Admin"), getAllUsersData);


router.post('/password/forgot',forgetPassword)
router.put('/password/reset/:token',resetPassword)

export default router;
