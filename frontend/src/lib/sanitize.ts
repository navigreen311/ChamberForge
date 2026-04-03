/**
 * Input sanitization utilities for the ChamberForge frontend.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

const HTML_ESCAPE_RE = /[&<>"'/]/g;

/**
 * Escape HTML special characters to prevent XSS when rendering user input.
 */
export function escapeHtml(str: string): string {
  return str.replace(HTML_ESCAPE_RE, (ch) => HTML_ESCAPE_MAP[ch] || ch);
}

/**
 * Sanitize arbitrary user input:
 * - Strip HTML tags
 * - Trim whitespace
 * - Limit to maxLength characters (default 10 000)
 */
export function sanitizeInput(str: string, maxLength: number = 10_000): string {
  // Strip HTML tags
  let cleaned = str.replace(/<[^>]*>/g, "");
  // Trim
  cleaned = cleaned.trim();
  // Enforce length limit
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }
  return cleaned;
}
