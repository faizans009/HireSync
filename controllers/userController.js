import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import { generateOTP } from "../utils/OTPGenerate.js";
import {sendEmail} from "../utils/sendEmail.js";
import ErrorHandler from "../middlewares/error.js";
import { forgotPasswordToken, sendToken } from "../utils/jwtToken.js";
import jwt from "jsonwebtoken";

// old register

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  try{

    if (!name || !email || !phone || !password || !role) {
      return next(new ErrorHandler("Please fill full form!"));
    }
    const isEmail = await User.findOne({ email });
    if (isEmail) {
      return next(new ErrorHandler("Email already registered!"));
    }
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
    });
    sendToken(user, 201, res, "User Registered!");
  }
  catch(error){
    console.log(error.message);
  
  }
});


// new register
// export const register = catchAsyncErrors(async (req, res, next) => {
//   const { name, email, phone, password, role } = req.body;
//   try {
//     if (!name || !email || !phone || !password || !role) {
//       return next(new ErrorHandler("Please fill full form!"));
//     }
//     const isEmail = await User.findOne({ email });
//     if (isEmail) {
//       return next(new ErrorHandler("Email already registered!"));
//     }
//     const newUser = await User.create({
//       name,
//       email,
//       phone,
//       password,
//       role,
//     });
//     const otp = generateOTP();
//     await sendEmail(email, otp);
//     newUser.otp.value = otp;
//     newUser.otp.createdAt = new Date();
//     newUser.otp.expiresAt = new Date(Date.now() + 25 * 60 * 1000);
//     await newUser.save();


//     res.status(201).json({
//       success: true,
//       message: "User Registered! Please check your email for the OTP.",
//     });
//   } catch (error) {
//     console.log(error);
//     next(new ErrorHandler("Registration failed", 500));
//   } 
// });

// verify otp
// export const validateOTP = async (req, res,next) => {
//   const { enteredOTP, email } = req.body;
//   try {
//     const user = await User.findOne({email});
//     if (!user) {
//       return next(new ErrorHandler("User not found", 404));
//     }
//     if (user.otp.value !== enteredOTP ) {
//       return next(new ErrorHandler("Invalid otp", 401));
//     }
//     if (user.otp.expiresAt < new Date()) {
//       return next(new ErrorHandler("OTP expired", 400));
//     }
//     user.isVerified=true;
//     user.otp = null;
//     await user.save();
//     const token = sendToken(user, 200, res, "User Logged In!");
//   } catch (error) {
//     console.log(error.message);
//     next(new ErrorHandler("Validate otp failed", 500));
//   }
// };
// old login
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email ,password and role."));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided email and ${role} not found!`, 404)
    );
  }
  sendToken(user, 201, res, "User Logged In!");
});




// new login

// export const login = catchAsyncErrors(async (req, res, next) => {
//   const { email, password, role } = req.body;
//   if (!email || !password || !role) {
//     return next(new ErrorHandler("Please provide email ,password and role."));
//   }
//   const user = await User.findOne({ email }).select("+password");
//   if (!user) {
//     return next(new ErrorHandler("Invalid Email Or Password.", 400));
//   }
//   const isPasswordMatched = await user.comparePassword(password);
//   if (!isPasswordMatched) {
//     return next(new ErrorHandler("Invalid Email Or Password.", 400));
//   }
//   if (user.role !== role) {
//     return next(
//       new ErrorHandler(`User with provided email and ${role} not found!`, 404)
//     );
//   }
//   if (user.isVerified === false) {
//     const otp = generateOTP();
//     await sendEmail(email, otp);
//     user.otp.value = otp;
//     user.otp.createdAt = new Date();
//     user.otp.expiresAt = new Date(Date.now() + 25 * 60 * 1000);
//     await user.save();
//     return next(new ErrorHandler("Otp send to email,plz verify your account first", 400));
//   }
//   sendToken(user, 201, res, "User Logged In!");
  
// });
// logout
export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Successfully.",
    });
});

// get user
export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

// forgot password
export const forgetPassword = async (req, res,next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return new ResponseHandler(res, 404, false, "User not found");
    }

    const otp = generateOTP();
    await sendEmail(email, otp);
    user.otp.value = otp;
    user.otp.createdAt = new Date();
    user.otp.expiresAt = new Date(Date.now() + 25 * 60 * 1000);
    await user.save();
    return res.status(200).json({ success: true, message: "OTP sent to your email" ,user});
  } catch (error) {
    next(new ErrorHandler("Forgot password failed", 500));
  }
};

// verify forgot password otp
export const forgetOTP = async (req, res,next) => {
  const { enteredOTP, email } = req.body;
  try {
    const user = await User.findOne({email});
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    if (user.otp.value !== enteredOTP ) {
      return next(new ErrorHandler("Invalid otp", 401));
    }
    if (user.otp.expiresAt < new Date()) {
      return next(new ErrorHandler("OTP expired", 400));
    }
    user.isVerified=true;
    // user.otp = null;
    await user.save();
    const token = forgotPasswordToken(user, 201, res, "User Logged In!");
    res.json({ token });
  } catch (error) {
    console.log(error.message);
    next(new ErrorHandler("Validate otp failed", 500));
  }
};
// update password
export const updatePassword = async (req, res,next) => {
  // console.log(req.user)
  const { newPassword } = req.body;
  
    const { email } = req.user;
    // console.log(email)
    // console.log(newPassword)
    const user = await User.findOne({ email });
    if (!user) {
      return new ResponseHandler(res, 404, false, "User not found");
    }
    user.password=newPassword;
    await user.save();
      return res.status(200).json({ message: 'Password updated successfully' });
    }


export const allUsers = async (req, res) => {
      const keyword = req.query.search
        ? {
            $or: [
              { name: { $regex: req.query.search, $options: "i" } },
              { email: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
    
      const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
      res.send(users);
    };

