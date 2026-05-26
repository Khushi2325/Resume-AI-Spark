/**
 * Utility functions for input and link validation.
 * Filters out placeholder values and checks structure.
 */

export const isValidLink = (
  url: string | undefined | null,
  type: 'github' | 'leetcode' | 'linkedin' | 'email' | 'phone' | 'url'
): boolean => {
  if (!url) return false;
  const val = url.trim();
  if (val === "") return false;

  const lowercase = val.toLowerCase();

  if (type === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  if (type === 'phone') {
    // Allows optional +, digits, spaces, dashes, parentheses
    return /^\+?[0-9\s\-()]{7,18}$/.test(val);
  }

  if (type === 'github') {
    return lowercase.includes("github.com");
  }

  if (type === 'leetcode') {
    return lowercase.includes("leetcode.com");
  }

  if (type === 'linkedin') {
    return lowercase.includes("linkedin.com");
  }

  if (type === 'url') {
    try {
      new URL(val.startsWith('http') ? val : 'https://' + val);
      return true;
    } catch {
      return false;
    }
  }

  return true;
};

/**
 * Extracts username from clean profile URL.
 */
export const extractUsername = (
  url: string | undefined | null,
  type: 'github' | 'leetcode' | 'linkedin'
): string | null => {
  if (!isValidLink(url, type)) return null;
  const cleanUrl = url!.trim().replace(/\/+$/, "");
  const parts = cleanUrl.split("/");
  return parts[parts.length - 1] || null;
};
