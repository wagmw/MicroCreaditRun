import api from "../api/client";

/**
 * Get the full base URL for images
 */
export const getImageBaseUrl = () => {
  return api.defaults.baseURL.replace("/api", "");
};

/**
 * Convert a relative photo URL to an absolute URL
 * Always returns the thumbnail URL for bandwidth optimization
 */
export const getCustomerPhotoUrl = (photoUrl) => {
  if (!photoUrl) return null;

  if (photoUrl.startsWith("http")) {
    return photoUrl;
  }

  return `${getImageBaseUrl()}${photoUrl}`;
};

/**
 * Get the full-size image URL from a thumbnail URL
 * Use this when you need to display a larger version
 */
export const getFullPhotoUrl = (photoUrl) => {
  if (!photoUrl) return null;

  // Replace 'thumbnail' with 'photo' in the URL
  const fullUrl = photoUrl.replace("/thumbnail", "/photo");

  if (fullUrl.startsWith("http")) {
    return fullUrl;
  }

  return `${getImageBaseUrl()}${fullUrl}`;
};

/**
 * Check if a URL is a thumbnail URL
 */
export const isThumbnailUrl = (photoUrl) => {
  return photoUrl && photoUrl.includes("/thumbnail");
};
