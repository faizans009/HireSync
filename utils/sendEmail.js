import nodemailer from "nodemailer"
import ErrorHandler from "../middlewares/error.js";
// import expressAsyncHandler from "expressAsyncHandler";
// import User from "../models/userSchema.js"

// const User = require("../models/user");

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   auth: {
//     user: "muhammadfaizanmu75@gmail.com",
//     // user: process.env.SMTP_MAIL,
//     // pass: process.env.SMTP_PASSWORD, 
//     pass: "srbj hatz lbll pmgo", 
//   },
// });


const transporter = nodemailer.createTransport({
    // host: process.env.SMTP_HOST,
    service: 'gmail', 
    auth: {
      user: "muhammadfaizanmu75@gmail.com",
      pass: "srbj hatz lbll pmgo",
    },
    // debug: true, // Enable debugging
  });
export const sendEmail = async ( email, otp) => {
  const mailOptions = {
    from: "muhammadfaizanmu75@gmail.com",
    to: email,
    subject: "OTP for hire sync",
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true; 
  } catch (error) {
    console.log(error);
    throw new ErrorHandler("Email sending failed!", 500);
  }
};
