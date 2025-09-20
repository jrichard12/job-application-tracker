/**
 * Truncates a URL for display purposes while preserving its functionality
 * @param url - The URL to truncate
 * @param maxLength - Maximum length for the displayed text (default: 50)
 * @returns The truncated URL text for display
 */
export function truncateUrl(url: string, maxLength: number = 50): string {
    if (!url || url.length <= maxLength) {
        return url;
    }

    // For URLs, try to keep the domain visible and truncate the path
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        const protocol = urlObj.protocol;
        
        // If just the domain + protocol is too long, truncate it
        const domainWithProtocol = `${protocol}//${domain}`;
        if (domainWithProtocol.length >= maxLength - 3) {
            return url.substring(0, maxLength - 3) + '...';
        }
        
        // Calculate how much space we have for the path
        const remainingSpace = maxLength - domainWithProtocol.length - 3; // 3 for '...'
        const pathAndQuery = url.substring(domainWithProtocol.length);
        
        if (pathAndQuery.length <= remainingSpace) {
            return url; // No truncation needed
        }
        
        // Truncate the path part
        return domainWithProtocol + pathAndQuery.substring(0, remainingSpace) + '...';
    } catch {
        // If URL parsing fails, just truncate from the beginning
        return url.substring(0, maxLength - 3) + '...';
    }
}