/**
 * Get the full image URL for display
 * Handles both Cloudinary URLs and local storage paths
 * @param {string} imageUrl - The image URL from the database
 * @returns {string} - Full URL for the image
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If it's already a full URL (Cloudinary or external), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // For local storage paths, prepend the API base URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Remove '/api' from the end to get the server URL
  const serverUrl = apiUrl.replace(/\/api$/, '');
  
  // Ensure the path starts with /
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${serverUrl}${path}`;
};
