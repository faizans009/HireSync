import express from "express";

import { messageController } from "../controllers/messageControllers.js";
const router = express.Router();
router.post("/addmsg/", messageController.addMessage);
router.post("/getmsg/", messageController.getMessages);

export default router;
