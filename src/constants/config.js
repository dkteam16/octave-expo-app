export const SITE_URL = "https://octave.co.in/";

// Use your LAN IP (e.g., http://192.168.1.XX:5000) or 10.0.2.2 for Android emulator
// export const BACKEND_API_URL = "http://10.0.2.2:5000/api";
export const BACKEND_API_URL = "https://focal-surprised-representation-back.trycloudflare.com/api";

export const ALLOWED_HOSTS = [
  "octave.co.in",
  "shopify.com",
  "myshopify.com",
  "shop.app",
  "gokwik.co",
  "razorpay.com",
  "paytm.com",
  "phonepe.com",
  "google.com",
  "facebook.com",
];

export function isAllowedUrl(url) {
  try {
    const host = new URL(url).hostname;
    return ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith("." + allowed));
  } catch (e) {
    return false;
  }
}
