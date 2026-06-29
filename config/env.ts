export const PORT = process.env.PORT || 3000;
export const MONGODB_URI = process.env.MONGODB_URI;

export const JWT_ACC_SECRET = process.env.JWT_ACC_SECRET;       
export const JWT_ACC_EXPIRES_IN = process.env.JWT_ACC_EXPIRES_IN || "15m";
export const JWT_REF_SECRET = process.env.JWT_REF_SECRET;   
export const JWT_REF_EXPIRES_IN = process.env.JWT_REF_EXPIRES_IN || "7d";

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export const NEXT_PUBLIC_APP_NAME = "SchoolHub";
export const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
export const RESEND_API_KEY = process.env.RESEND_API_KEY; 
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export const NODE_ENV = process.env.NODE_ENV || "development";