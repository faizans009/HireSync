import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import multer from "multer";
import cloudinary from "cloudinary";

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
        cb(null, '../uploads'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

const upload = multer({ storage: store, fileFilter: DocumentFilter });

// export const postApplication = catchAsyncErrors(async (req, res, next) => {
//   const { role } = req.user;
//   if (role === "Employer") {
//     return next(
//       new ErrorHandler("Employer not allowed to access this resource.", 400)
//     );
//   }
//   // if (!req.files || Object.keys(req.files).length === 0) {
//   //   return next(new ErrorHandler("Resume File Required!", 400));
//   // }
//   // const { resume } = req.files;
//   // const allowedFormats = ["image/png", "image/jpeg", "image/webp","application/pdf"];
//   // if (!allowedFormats.includes(resume.mimetype)) {
//   //   return next(
//   //     new ErrorHandler("Invalid file type. Please upload a PNG file.", 400)
//   //   );
//   // }
//   // const cloudinaryResponse = await cloudinary.uploader.upload(
//   //   resume.tempFilePath
//   // );

//   // if (!cloudinaryResponse || cloudinaryResponse.error) {
//   //   console.error(
//   //     "Cloudinary Error:",
//   //     cloudinaryResponse.error || "Unknown Cloudinary error"
//   //   );
//   //   return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
//   // }



// // // Upload Document API

//     let fileName
//         upload.single('Document')(req, res, (err) => {
//             if (err instanceof multer.MulterError) {
//                 return res.status(400).json({ Message: "multer error", error: err.message });
//             } else if (err) {
//                 return res.status(500).json({ Message: "Something went wrong", Error: err.message });
//             }

//             if (!req?.file) {
//                 return res.status(400).json({ Message: "No file uploades"});
//             }

//             const fileType = req.file.mimetype;
//             fileName = req.file.filename;
//             console.log(fileName)
            

           
//         });



//   const { name, email, coverLetter, phone, address, jobId } = req.body;
//   const applicantID = {
//     user: req.user._id,
//     role: "Job Seeker",
//   };
//   if (!jobId) {
//     return next(new ErrorHandler("Job not found!", 404));
//   }
//   const jobDetails = await Job.findById(jobId);
//   if (!jobDetails) {
//     return next(new ErrorHandler("Job not found!", 404));
//   }

//   const employerID = {
//     user: jobDetails.postedBy,
//     role: "Employer",
//   };
//   if (
//     !name ||
//     !email ||
//     !coverLetter ||
//     !phone ||
//     !address ||
//     !applicantID ||
//     !employerID ||
//     !resume
//   ) {
//     return next(new ErrorHandler("Please fill all fields.", 400));
//   }
//   const application = await Application.create({
//     jobId,
//     name,
//     email,
//     coverLetter,
//     phone,
//     address,
//     applicantID,
//     employerID,
//     // resume: {
//     //   public_id: cloudinaryResponse.public_id,
//     //   url: cloudinaryResponse.secure_url,
//     // },
//     resume:fileName
//   });
//   res.status(200).json({
//     success: true,
//     message: "Application Submitted!",
//     application,
//   });
// });
export const saveDocumentToServer = async (req, res) => {
  try {
      upload.single('resume')(req, res, (err) => {
          if (err instanceof multer.MulterError) {
              return res.status(400).json({ Message:"multer error", error: err.message });
          } else if (err) {
              return res.status(500).json({ Message: "internal server error", Error: err.message });
          }

          if (!req?.file) {
              return res.status(400).json({ Message: "file not uploaded" });
          }

          const fileType = req.file.mimetype;
          const fileName = req.file.filename;
          const fileURL = `${fileName}`;

          res.status(rc.OK).json({ message: rm.documentUploadedSuccessfully, url: fileURL });
      });

  } catch (error) {
      res.status(rc.INTERNAL_SERVER_ERROR).json({ message: rm.errorUploadingDocument, Error: error.message });
  }
};

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(
      new ErrorHandler("Employer not allowed to access this resource.", 400)
    );
  }

//   let fileName;
//   let error=false;
//   upload.single('resume')(req, res, (err) => {
//     if (err instanceof multer.MulterError) {
//      error=true

//     } else if (err) {
//       error=true
//     }

//     if (!req.file) {
//       error=true
//     }

//     fileName = req.file.filename;
//     console.log(fileName);
//   });
// if (!error){
//   return next(new ErrorHandler("error uploading file", 404))
// }
  const { name, email, coverLetter, phone, address, jobId } = req.body;
  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
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
    !fileName // Use fileName instead of resume
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
    resume: fileName,
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

export const changeMessageStatus= catchAsyncErrors(
  async (req, res, next) => {
    const {id}=req.body
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Application not found!", 404));
    }
    if(application.messageSent){
      return next(new ErrorHandler("Message already sent!", 400));
    }
    application.messageSent=true
    await application.save()
    res.status(200).json({
      success: true,
      message:"Status updated!"
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