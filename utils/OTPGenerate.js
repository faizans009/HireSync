// const otpGenerator = require("otp-generator");
import otpGenerator from 'otp-generator'

export const generateOTP = () => {
    // console.log("generating otp")
    let OTP = otpGenerator.generate(6, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });

    
    
    OTP = Number(OTP);
    
    
    if (OTP.length > 6) {
        return OTP.slice(0, 6);
    }
    // console.log(OTP)

    return OTP;
};