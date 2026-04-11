// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  
  // Check if OTP is expired
  const isOTPExpired = (otpExpiry) => {
    if (!otpExpiry) return true;
    return new Date() > new Date(otpExpiry);
  };
  
  // Generate OTP with expiry (30 minutes)
  const generateOTPWithExpiry = () => {
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 30); // OTP valid for 30 minutes
    
    return { otp, otpExpiry };
  };
  
  module.exports = { generateOTP, isOTPExpired, generateOTPWithExpiry };