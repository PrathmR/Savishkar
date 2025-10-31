import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import Settings from '../models/Settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Handle CORS preflight requests
router.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).send();
});

// Helper function to get rulebook URL from database
const getRulebookUrl = async () => {
  try {
    const url = await Settings.get('rulebook_url');
    return url;
  } catch (error) {
    console.error('Error fetching rulebook URL from database:', error);
    return null;
  }
};

// Helper function to proxy PDF from Cloudinary with proper headers
const proxyCloudinaryPDF = (cloudinaryUrl, res, disposition = 'attachment') => {
  // Ensure HTTPS for Cloudinary URLs
  const secureUrl = cloudinaryUrl.replace('http://', 'https://');
  const protocol = secureUrl.startsWith('https') ? https : http;
  
  return new Promise((resolve, reject) => {
    const request = protocol.get(secureUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (proxyRes) => {
      // Check for successful response
      if (proxyRes.statusCode !== 200) {
        console.error(`❌ Cloudinary returned status ${proxyRes.statusCode}`);
        reject(new Error(`Failed to fetch PDF from Cloudinary: ${proxyRes.statusCode}`));
        return;
      }

      // Set appropriate headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${disposition}; filename="Savishkar_2025_Rulebook.pdf"`);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Accept-Ranges', 'bytes');
      
      // Copy content-length if available
      if (proxyRes.headers['content-length']) {
        res.setHeader('Content-Length', proxyRes.headers['content-length']);
      }
      
      // Pipe the response
      proxyRes.pipe(res);
      
      proxyRes.on('end', () => {
        console.log('✅ PDF successfully proxied from Cloudinary');
        resolve();
      });
      
      proxyRes.on('error', (error) => {
        console.error('❌ Error in proxy response:', error);
        reject(error);
      });
    });

    request.on('error', (error) => {
      console.error('❌ Error fetching from Cloudinary:', error);
      reject(error);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

/**
 * @route   GET /api/rulebook/download
 * @desc    Download the event rulebook PDF
 * @access  Public
 */
router.get('/download', async (req, res) => {
  try {
    // Check if rulebook URL is stored in database
    const rulebookUrl = await getRulebookUrl();
    
    if (rulebookUrl) {
      console.log('📖 Proxying Cloudinary rulebook for download:', rulebookUrl);
      try {
        await proxyCloudinaryPDF(rulebookUrl, res, 'attachment');
        return;
      } catch (proxyError) {
        console.error('❌ Failed to proxy Cloudinary PDF:', proxyError);
        // Fall through to local file if Cloudinary fails
      }
    }
    
    // Otherwise, serve from local storage
    const rulebookPath = path.join(__dirname, '../uploads/rulebook.pdf');
    
    // Check if file exists
    if (!fs.existsSync(rulebookPath)) {
      console.error('❌ Rulebook not found at:', rulebookPath);
      return res.status(404).json({
        success: false,
        message: 'Rulebook not found. Please contact the administrator.'
      });
    }

    // Get file stats
    const stat = fs.statSync(rulebookPath);
    console.log(`📖 Serving local rulebook: ${stat.size} bytes`);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Savishkar_2025_Rulebook.pdf"');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // Stream the file
    const fileStream = fs.createReadStream(rulebookPath);
    
    fileStream.on('error', (error) => {
      console.error('❌ Error streaming rulebook:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading rulebook'
        });
      }
    });

    fileStream.pipe(res);
    
  } catch (error) {
    console.error('❌ Rulebook download error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error downloading rulebook',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

/**
 * @route   GET /api/rulebook/view
 * @desc    View the rulebook PDF in browser (inline)
 * @access  Public
 */
router.get('/view', async (req, res) => {
  try {
    // Check if rulebook URL is stored in database
    const rulebookUrl = await getRulebookUrl();
    
    if (rulebookUrl) {
      console.log('📖 Proxying Cloudinary rulebook for viewing:', rulebookUrl);
      try {
        await proxyCloudinaryPDF(rulebookUrl, res, 'inline');
        return;
      } catch (proxyError) {
        console.error('❌ Failed to proxy Cloudinary PDF:', proxyError);
        // Fall through to local file if Cloudinary fails
      }
    }
    
    // Otherwise, serve from local storage
    const rulebookPath = path.join(__dirname, '../uploads/rulebook.pdf');
    
    // Check if file exists
    if (!fs.existsSync(rulebookPath)) {
      console.error('❌ Rulebook not found at:', rulebookPath);
      return res.status(404).json({
        success: false,
        message: 'Rulebook not found. Please contact the administrator.'
      });
    }

    // Get file stats
    const stat = fs.statSync(rulebookPath);
    console.log(`📖 Viewing local rulebook: ${stat.size} bytes`);

    // Set headers for inline PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Savishkar_2025_Rulebook.pdf"');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // Stream the file
    const fileStream = fs.createReadStream(rulebookPath);
    
    fileStream.on('error', (error) => {
      console.error('❌ Error streaming rulebook:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error viewing rulebook'
        });
      }
    });

    fileStream.pipe(res);
    
  } catch (error) {
    console.error('❌ Rulebook view error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error viewing rulebook',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

/**
 * @route   GET /api/rulebook/info
 * @desc    Get rulebook information
 * @access  Public
 */
router.get('/info', async (req, res) => {
  try {
    // Check if rulebook URL is stored in database
    const rulebookUrl = await getRulebookUrl();
    
    if (rulebookUrl) {
      return res.json({
        success: true,
        available: true,
        filename: 'Savishkar_2025_Rulebook.pdf',
        storage: 'cloudinary',
        url: rulebookUrl,
        downloadUrl: '/api/rulebook/download',
        viewUrl: '/api/rulebook/view',
        message: 'Rulebook hosted on Cloudinary CDN'
      });
    }
    
    // Check local file
    const rulebookPath = path.join(__dirname, '../uploads/rulebook.pdf');
    
    if (!fs.existsSync(rulebookPath)) {
      return res.json({
        success: true,
        available: false,
        storage: 'local',
        message: 'Rulebook not available'
      });
    }

    // Get file stats
    const stat = fs.statSync(rulebookPath);

    res.json({
      success: true,
      available: true,
      filename: 'Savishkar_2025_Rulebook.pdf',
      storage: 'local',
      size: stat.size,
      sizeFormatted: `${(stat.size / 1024 / 1024).toFixed(2)} MB`,
      lastModified: stat.mtime,
      downloadUrl: '/api/rulebook/download',
      viewUrl: '/api/rulebook/view'
    });
    
  } catch (error) {
    console.error('❌ Rulebook info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting rulebook information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
