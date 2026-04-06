import { API_BASE_URL } from "./api";

export function getMediaUrl(assetPath) {
  if (!assetPath) {
    return "";
  }

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  if (assetPath.startsWith("/")) {
    return `${API_BASE_URL}${assetPath}`;
  }

  return `${API_BASE_URL}/documents/${encodeURIComponent(assetPath)}`;
}
