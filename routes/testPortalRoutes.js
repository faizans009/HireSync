import express from "express";
import { createTest, getTest, submitTest } from "../controllers/testPortalController.js";

const router = express.Router();

router
.post("/createTest/:job", createTest)
.get("/getTest/:job", getTest)
.post("/submitTest/:job", submitTest)

export default router;
