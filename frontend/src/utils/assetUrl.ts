const DOCUMENT_EXTENSION_REGEX = /\.(pdf|doc|docx|zip)$/i;

export const normalizeCloudinaryDocumentUrl = (value: string): string => {
  if (!value || !/^https?:\/\//i.test(value)) return value;

  try {
    const parsed = new URL(value);
    if (!parsed.hostname.includes("res.cloudinary.com")) return value;

    const pathname = parsed.pathname || "";
    if (!DOCUMENT_EXTENSION_REGEX.test(pathname)) return value;

    // Cloudinary PDFs should be served from raw/upload for browser viewing.
    if (pathname.includes("/image/upload/")) {
      parsed.pathname = pathname.replace("/image/upload/", "/raw/upload/");
      return parsed.toString();
    }

    return value;
  } catch (_error) {
    return value;
  }
};

export const resolveAssetUrl = (value: string): string => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) {
    return normalizeCloudinaryDocumentUrl(value);
  }
  const backendBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  return `${backendBase}${value}`;
};

