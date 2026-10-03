export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function cn(...classes: (string | number | boolean | undefined | null | any)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export const loadScript = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Validates that a redirect URL is strictly an internal application path.
 * Rejects external URLs, protocol-relative URLs, and malicious protocol schemes.
 */
export function getSafeRedirectUrl(url: string | null | undefined, fallback = '/account'): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  // Must start with a single slash (not '//') and must not contain ':' (protocol scheme)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes(':') && !trimmed.includes('\\')) {
    return trimmed;
  }
  return fallback;
}

