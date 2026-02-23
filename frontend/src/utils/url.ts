const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getImageUrl = (imagePath?: string | null): string | undefined => {
    if (!imagePath) return undefined;

    // If already a full URL (http or https), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Get base URL (remove /api from API_URL)
    const baseUrl = API_URL.replace('/api', '').replace(/\/$/, '');

    // Ensure path starts with /
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    // Construct full URL
    return `${baseUrl}${cleanPath}`;
};

export const getUiAvatarUrl = (firstName?: string, lastName?: string): string => {
    const name = encodeURIComponent(`${firstName || ''} ${lastName || ''}`.trim() || 'User');
    return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`;
};
