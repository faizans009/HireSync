import express from "express";
import {
  deleteJob,
  getAllJobs,
  getAllJobsAdmin,
  getMyJobs,
  getSingleJob,
  postJob,
  updateJob,
} from "../controllers/jobController.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/getall", getAllJobs);
router.get("/getAllJobsAdmin",isAuthenticated, authorizeRoles("Admin"),getAllJobsAdmin);
router.post("/post", isAuthenticated, postJob);
router.get("/getmyjobs", isAuthenticated, getMyJobs);
router.put("/update/:id", isAuthenticated, updateJob);
router.delete("/delete/:id", isAuthenticated, deleteJob);
router.get("/:id", isAuthenticated, getSingleJob);

export default router;
