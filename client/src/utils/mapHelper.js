/**
 * Transforms any Google Maps URL, browser place link, share link, or iframe code
 * into a 100% embeddable iframe URL with X-Frame-Options ALLOWED.
 */

export const generateDefaultEmbed = () => {
  // Official embed URL for KHANN BROTHERS / Khan Manzil, Odisha, India
  return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2000!2d86.0144974!3d19.9893948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19934cf63ac249%3A0x26775cf1d78df3ac!2sKHANN%20BROTERS!5e0!3m2!1sen!2sin!4v1';
};

export const formatGoogleMapsEmbedUrl = (input, fallbackAddress = 'QueS.M design Studio Khan Manzil, Odisha, India') => {
  if (!input || typeof input !== 'string') {
    return generateDefaultEmbed();
  }

  const str = input.trim();
  if (!str) return generateDefaultEmbed();

  // 1. If full iframe tag was pasted, extract src="..."
  const iframeMatch = str.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }

  // 2. If already a valid /maps/embed URL
  if (str.includes('/maps/embed')) {
    return str;
  }

  // 3. Extract placeId hex (e.g. 0x3a19934cf63ac249:0x26775cf1d78df3ac)
  const placeIdMatch = str.match(/!1s(0x[0-9a-fA-F]+:0x[0-9a-fA-F]+)/);

  // 4. Extract lat / lng coordinates
  // Matches !3d19.9893948!4d86.0144974 or @19.9894204,86.0144516 or ?ll=19.989,86.014 or q=19.989,86.014
  const exactCoordMatch = str.match(/!3d(-?[\d.]+)!4d(-?[\d.]+)/);
  const atCoordMatch = str.match(/@(-?[\d.]+),(-?[\d.]+)/);
  const qCoordMatch = str.match(/[?&](?:q|ll)=(-?[\d.]+),(-?[\d.]+)/);

  const lat = exactCoordMatch ? exactCoordMatch[1] : (atCoordMatch ? atCoordMatch[1] : (qCoordMatch ? qCoordMatch[1] : null));
  const lng = exactCoordMatch ? exactCoordMatch[2] : (atCoordMatch ? atCoordMatch[2] : (qCoordMatch ? qCoordMatch[2] : null));

  // 5. Extract place title / name
  const placeNameParam = str.match(/!2s([^!&]+)/);
  const placePathMatch = str.match(/\/place\/([^/@?]+)/);
  let placeName = '';
  if (placeNameParam && placeNameParam[1]) {
    placeName = decodeURIComponent(placeNameParam[1].replace(/\+/g, ' '));
  } else if (placePathMatch && placePathMatch[1]) {
    placeName = decodeURIComponent(placePathMatch[1].replace(/\+/g, ' '));
  }

  // If placeId and coordinates are present, construct high-precision Google Maps pb embed
  if (placeIdMatch && lat && lng) {
    const hex = encodeURIComponent(placeIdMatch[1]);
    const name = encodeURIComponent(placeName || 'Studio');
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${hex}!2s${name}!5e0!3m2!1sen!2sin!4v1`;
  }

  // If coordinates are present
  if (lat && lng) {
    return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1`;
  }

  // If only place name
  if (placeName) {
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d86.0144974!3d19.9893948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19934cf63ac249%3A0x26775cf1d78df3ac!2s${encodeURIComponent(placeName)}!5e0!3m2!1sen!2sin!4v1`;
  }

  return generateDefaultEmbed();
};

/**
 * Returns direct URL for user navigation in Google Maps app
 */
export const getDirectDirectionsUrl = (googleMapsUrl, storeAddress) => {
  if (googleMapsUrl && googleMapsUrl.startsWith('http') && !googleMapsUrl.includes('/maps/embed')) {
    return googleMapsUrl;
  }
  const query = encodeURIComponent(storeAddress || 'KHANN BROTERS Khan Manzil, Odisha, India');
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};
