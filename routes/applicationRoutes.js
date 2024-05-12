import express from "express";
import {
  employerGetAllApplications,
  jobseekerDeleteApplication,
  jobseekerGetAllApplications,
  changeMessageStatus,
  postApplication,
  adminGetAllApplications,
  saveDocumentToServer,
} from "../controllers/applicationController.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isAuthenticated, postApplication);
router.post("/updateMessageStatus", changeMessageStatus);
router.get("/employer/getall", isAuthenticated, employerGetAllApplications);
router.get("/admin/getall",isAuthenticated,authorizeRoles("Admin"),  adminGetAllApplications);
router.get("/jobseeker/getall", isAuthenticated, jobseekerGetAllApplications);
router.delete("/delete/:id", isAuthenticated, jobseekerDeleteApplication);
router.post('/saveDocumentToServer',saveDocumentToServer);

export default router;
