import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your Name!"],
    minLength: [3, "Name must contain at least 3 Characters!"],
    maxLength: [30, "Name cannot exceed 30 Characters!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your Email!"],
    validate: [validator.isEmail, "Please provide a valid Email!"],
  },
  phone: {
    type: Number,
    required: [true, "Please enter your Phone Number!"],
  },
  password: {
    type: String,
    required: [true, "Please provide a Password!"],
    minLength: [8, "Password must contain at least 8 characters!"],
    // maxLength: [32, "Password cannot exceed 32 characters!"],
    select: false,
  },
  // otp: {
  //   value: {
  //     type: Number,
  //     default: null,
  //   },
  //   createdAt : {
  //     type: Date,
  //     default: null,
  //   },
  //   expiresAt: {
  //     type: Date,
  //     default: null,
  //   },
  // },
  // isVerified: {
  //   type: Boolean,
  //   default: false,
  // },
  ////////////////////////////
  isAvatarImageSet: {
    type: Boolean,
    default: true,
  },
  avatarImage: {
    type: String,
    default: "yolo",
  },
  ////////////////////////////////////////////////////////////////

  role: {
    type: String,
    required: [true, "Please select a role"],
    enum: ["Job Seeker", "Employer","Admin"],
  },
  resetPasswordToken:String,
  resetPasswordExpire:Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//ENCRYPTING THE PASSWORD WHEN THE USER REGISTERS OR MODIFIES HIS PASSWORD
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//COMPARING THE USER PASSWORD ENTERED BY USER WITH THE USER SAVED PASSWORD
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//GENERATING A JWT TOKEN WHEN A USER REGISTERS OR LOGINS, IT DEPENDS ON OUR CODE THAT WHEN DO WE NEED TO GENERATE THE JWT TOKEN WHEN THE USER LOGIN OR REGISTER OR FOR BOTH.
userSchema.methods.getJWTToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES,
    }
  );
};

userSchema.methods.getResetPasswordToken= async function(){
  // generating token
  const resetToken = crypto.randomBytes(20).toString('hex')
  // hashing and adding token to userSchema
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 15*60*1000
  return resetToken;
  
}

export const User = mongoose.model("User", userSchema);
