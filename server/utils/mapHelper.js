/**
 * Server-side Google Maps URL Normalizer
 */
const formatGoogleMapsEmbedUrl = (input) => {
  if (!input || typeof input !== 'string') {
    return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2000!2d86.0144974!3d19.9893948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19934cf63ac249%3A0x26775cf1d78df3ac!2sKHANN%20BROTERS!5e0!3m2!1sen!2sin!4v1';
  }

  const str = input.trim();
  if (!str) {
    return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2000!2d86.0144974!3d19.9893948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19934cf63ac249%3A0x26775cf1d78df3ac!2sKHANN%20BROTERS!5e0!3m2!1sen!2sin!4v1';
  }

  // 1. If iframe tag
  const iframeMatch = str.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }

  // 2. If already valid embed URL
  if (str.includes('/maps/embed')) {
    return str;
  }

  // 3. Extract placeId hex
  const placeIdMatch = str.match(/!1s(0x[0-9a-fA-F]+:0x[0-9a-fA-F]+)/);

  // 4. Extract lat / lng coordinates
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

  if (placeIdMatch && lat && lng) {
    const hex = encodeURIComponent(placeIdMatch[1]);
    const name = encodeURIComponent(placeName || 'Studio');
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${hex}!2s${name}!5e0!3m2!1sen!2sin!4v1`;
  }

  if (lat && lng) {
    return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1`;
  }

  if (placeName) {
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d86.0144974!3d19.9893948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19934cf63ac249%3A0x26775cf1d78df3ac!2s${encodeURIComponent(placeName)}!5e0!3m2!1sen!2sin!4v1`;
  }

  return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2000!2d86.0144974!3d19.9893948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19934cf63ac249%3A0x26775cf1d78df3ac!2sKHANN%20BROTERS!5e0!3m2!1sen!2sin!4v1';
};

module.exports = { formatGoogleMapsEmbedUrl };
