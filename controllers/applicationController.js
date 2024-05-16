import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import multer from "multer";
import path from "path";
// import cloudinary from "cloudinary";
import fs from 'fs';
// ------------------------------------ Upload Document Logic --------------------------------------
const allowedDocumentType = ['application/pdf'];

const DocumentFilter = (req, file, cb) => {
  if (allowedDocumentType.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF Allowed!'), false);
  }
};

const store = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads'; // Destination directory
    // Check if the directory exists, if not, create it
    fs.mkdir(uploadDir, { recursive: true }, function (err) {
      if (err) {
        return cb(err);
      }
      cb(null, uploadDir);
    });
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});

const upload = multer({ storage: store, fileFilter: DocumentFilter });

// Upload Document API

export const saveDocumentToServer = async (req, res) => {
  try {
    upload.single('resume')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ Message: "multerError", error: err.message });
      } else if (err) {
        console.log(err)
        return res.status(500).json({ Message: "errorUploadingDocument", Error: err.message });
      }

      if (!req?.file) {
        return res.status(400).json({ Message: "enterAllFields" });
      }

      const fileType = req.file.mimetype;
      const fileName = req.file.filename;
      const fileURL = `${fileName}`;

      res.status(200).json({ message: "documentUploadedSuccessfully", url: fileURL });
    });

  } catch (error) {
    res.status(500).json({ message: "errorUploadingDocument", Error: error.message });
  }
};


export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer not allowed to access this resource.", 400)
    );
  }
console.log(req.body)
  const { name, email, coverLetter, phone, resume,address, jobId } = req.body;
  console.log(jobId)
  if (!jobId) {
    
    return next(new ErrorHandler("Job id not found!", 400));
  }
  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const employerID = {
    user: jobDetails.postedBy,
    role: "Employer",
  };
  if (
    !name ||
    !email ||
    !coverLetter ||
    !phone ||
    !address ||
    !resume 
  ) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }

  const applicantID = {
    user: req.user._id,
    role: "Job Seeker",
  };
  const application = await Application.create({
    jobId,
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID,
    employerID,
    resume,
  });
  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});


export const employerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "employerID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const changeMessageStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.body
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    if (application.messageSent) {
      return next(new ErrorHandler("Message already sent!", 400));
    }
    application.messageSent = true
    await application.save()
    res.status(200).json({
      success: true,
      message: "Status updated!"
    });
  }
)
export const jobseekerGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "applicantID.user": _id });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

export const jobseekerDeleteApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted!",
    });
  }
);

export const adminGetAllApplications = catchAsyncErrors(
  async (req, res, next) => {
    // if (!(req.user.role === "Admin" )) {
    //   return next(new ErrorHandler("Unauthorized. Only admin can get users data.", 403));

    // }
    const applications = await Application.find();
    res.status(200).json({
      success: true,
      applications,
    });
  }
);