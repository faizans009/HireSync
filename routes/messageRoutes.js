import express from "express";
// import { chatIUserController } from "../controllers/index.js";
import { chatIUserController } from "../controllers/chatControllers.js";
const router = express.Router();

router.get("/allusers/:id", chatIUserController.getAllUsers);
router.post("/setavatar/:id", chatIUserController.setAvatar);
router.get("/logout/:id", chatIUserController.logOut);
export default router;
