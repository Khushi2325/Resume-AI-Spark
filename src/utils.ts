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

  if (type === 'url') {
    try {
      new URL(val.startsWith('http') ? val : 'https://' + val);
      return true;
    } catch {
      return false;
    }
  }

  // For social links (github, linkedin, leetcode), allow any non-empty string 
  // so users can input just their usernames or handles.
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
