import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary'; 
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
  folder: 'buyer-profile',
  allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
  resource_type: 'auto',
  transformation: [{ width: 500, height: 500, crop: 'limit' }],
} as any,
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;