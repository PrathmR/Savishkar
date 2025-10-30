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
  const protocol = cloudinaryUrl.startsWith('https') ? https : http;
  
  return new Promise((resolve, reject) => {
    protocol.get(cloudinaryUrl, (proxyRes) => {
      // Set appropriate headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${disposition}; filename="Savishkar_2025_Rulebook.pdf"`);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Copy content-length if available
      if (proxyRes.headers['content-length']) {
        res.setHeader('Content-Length', proxyRes.headers['content-length']);
      }
      
      // Pipe the response
      proxyRes.pipe(res);
      
      proxyRes.on('end', resolve);
      proxyRes.on('error', reject);
    }).on('error', reject);
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
      await proxyCloudinaryPDF(rulebookUrl, res, 'attachment');
      return;
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
      await proxyCloudinaryPDF(rulebookUrl, res, 'inline');
      return;
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
