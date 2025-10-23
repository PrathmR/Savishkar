import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { paymentStorage, eventStorage as cloudEventStorage, avatarStorage as cloudAvatarStorage } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directories if they don't exist
const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
const eventsDir = path.join(__dirname, '..', 'uploads', 'events');

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}
if (!fs.existsSync(eventsDir)) {
  fs.mkdirSync(eventsDir, { recursive: true });
}

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for event images
const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, eventsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Determine if we should use cloud storage (based on environment)
const useCloudStorage = process.env.USE_CLOUDINARY === 'true' && 
                        process.env.CLOUDINARY_CLOUD_NAME && 
                        process.env.CLOUDINARY_API_KEY && 
                        process.env.CLOUDINARY_API_SECRET;

// Create multer upload instances with cloud or local storage
export const uploadAvatar = multer({
  storage: useCloudStorage ? cloudAvatarStorage : avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

export const uploadEventImage = multer({
  storage: useCloudStorage ? cloudEventStorage : eventStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for event images
  },
  fileFilter: fileFilter
});

export const uploadPaymentScreenshot = multer({
  storage: useCloudStorage ? paymentStorage : multer.diskStorage({
    destination: (req, file, cb) => {
      const paymentsDir = path.join(__dirname, '..', 'uploads', 'payments');
      if (!fs.existsSync(paymentsDir)) {
        fs.mkdirSync(paymentsDir, { recursive: true });
      }
      cb(null, paymentsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Default export for backward compatibility
export default uploadAvatar;
