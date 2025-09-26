export const proxiedImage = (url) => {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      return `/api/proxy/image?url=${encodeURIComponent(url)}`;
    }
    return url;
  } catch {
    return url;
  }
};
