export const SITE_URL = "https://octave.co.in/";

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