import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import { convertToWebP, getOptimizedOptions } from '../utils/imageConverter.js';
import streamifier from 'streamifier';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload buffer to Cloudinary with WebP conversion
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary response
 */
export const uploadBufferToCloudinary = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'savishkar',
        format: 'webp',
        resource_type: 'image',
        public_id: options.public_id,
        transformation: options.transformation || [],
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Custom storage engine that converts to WebP before uploading
 */
class WebPCloudinaryStorage {
  constructor(options) {
    this.options = options;
  }

  async _handleFile(req, file, cb) {
    try {
      console.log(`📤 Processing ${file.originalname} for WebP conversion...`);

      // Read file buffer
      const chunks = [];
      file.stream.on('data', (chunk) => chunks.push(chunk));
      file.stream.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          
          // Get conversion options
          const conversionOptions = typeof this.options.conversionOptions === 'function'
            ? this.options.conversionOptions(req, file)
            : this.options.conversionOptions || {};

          // Convert to WebP
          const webpBuffer = await convertToWebP(buffer, conversionOptions);

          // Get upload params
          const params = typeof this.options.params === 'function'
            ? await this.options.params(req, file)
            : this.options.params || {};

          // Upload to Cloudinary
          const result = await uploadBufferToCloudinary(webpBuffer, {
            ...params,
            format: 'webp'
          });

          console.log(`✅ Uploaded to Cloudinary: ${result.secure_url}`);

          cb(null, {
            path: result.secure_url,
            filename: result.public_id,
            size: result.bytes,
            format: result.format,
            width: result.width,
            height: result.height,
            resource_type: result.resource_type,
            url: result.url,
            secure_url: result.secure_url
          });
        } catch (error) {
          console.error('❌ Error processing file:', error);
          cb(error);
        }
      });

      file.stream.on('error', (error) => {
        console.error('❌ Stream error:', error);
        cb(error);
      });
    } catch (error) {
      console.error('❌ Error in _handleFile:', error);
      cb(error);
    }
  }

  _removeFile(req, file, cb) {
    // Optionally implement file removal from Cloudinary
    if (file.filename) {
      cloudinary.uploader.destroy(file.filename, (error, result) => {
        cb(error, result);
      });
    } else {
      cb(null);
    }
  }
}

// Storage for payment screenshots with WebP conversion
export const paymentStorageWebP = new WebPCloudinaryStorage({
  params: {
    folder: 'savishkar/payments',
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `payment-${uniqueSuffix}`;
    }
  },
  conversionOptions: getOptimizedOptions('payment')
});

// Storage for event images with WebP conversion
export const eventStorageWebP = new WebPCloudinaryStorage({
  params: {
    folder: 'savishkar/events',
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `event-${uniqueSuffix}`;
    }
  },
  conversionOptions: getOptimizedOptions('event')
});

// Storage for user avatars with WebP conversion
export const avatarStorageWebP = new WebPCloudinaryStorage({
  params: {
    folder: 'savishkar/avatars',
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `avatar-${uniqueSuffix}`;
    }
  },
  conversionOptions: getOptimizedOptions('avatar')
});

// Storage for QR codes with WebP conversion (lossless)
export const qrCodeStorageWebP = new WebPCloudinaryStorage({
  params: {
    folder: 'savishkar/qrcodes',
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `qrcode-${uniqueSuffix}`;
    }
  },
  conversionOptions: getOptimizedOptions('qrcode')
});

export default cloudinary;
