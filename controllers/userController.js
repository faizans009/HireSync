import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import { generateOTP } from "../utils/OTPGenerate.js";
import {sendEmail} from "../utils/sendEmail.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";

// register
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  try {
    if (!name || !email || !phone || !password || !role) {
      return next(new ErrorHandler("Please fill full form!"));
    }
    const isEmail = await User.findOne({ email });
    if (isEmail) {
      return next(new ErrorHandler("Email already registered!"));
    }
    const newUser = await User.create({
      name,
      email,
      phone,
      password,
      role,
    });
    const otp = generateOTP();
    await sendEmail(email, otp);
    newUser.otp.value = otp;
    newUser.otp.createdAt = new Date();
    newUser.otp.expiresAt = new Date(Date.now() + 25 * 60 * 1000);
    await newUser.save();


    res.status(201).json({
      success: true,
      message: "User Registered! Please check your email for the OTP.",
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Registration failed", 500));
  } 
});

// verify otp
export const validateOTP = async (req, res,next) => {
  const { enteredOTP, email } = req.body;
  try {
    const user = await User.findOne({email});
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    if (user.otp.value !== enteredOTP ) {
      return next(new ErrorHandler("Invalid opt", 401));
    }
    if (user.otp.expiresAt < new Date()) {
      return next(new ErrorHandler("OTP expired", 400));
    }
    user.isVerified=true;
    await user.save();
    const token = sendToken(user, 200, res, "User Logged In!");
  } catch (error) {
    console.log(error.message);
    next(new ErrorHandler("Validate otp failed", 500));
  }
};

// login

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


export const getUser = catchAsyncErrors((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});