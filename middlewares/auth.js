import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("User Not Authorized", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // req.user = await User.findById(decoded.id);
  req.user = await User.findOne({email:decoded.email});
  // console.log(req.user)
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  next();
});

export const authorizeRoles=(...roles)=>{
  return (req,res,next)=>{
      if(!roles.includes(req.user.role)){
          return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`,403))
      }
      next()
  }
}


