/**
 * Configuration settings for the application
 */

// Replace with your GitHub username and repository name
export const GITHUB_USERNAME = 'tomvaillant';
export const GITHUB_REPO = '20min-trump-form';
export const GITHUB_BRANCH = 'main';

// GitHub Raw content URL (with placeholders for dynamic content)
export const GITHUB_RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

// GitHub API URLs for integration
export const GITHUB_API_BASE = 'https://api.github.com/repos';
export const GITHUB_REPO_API = `${GITHUB_API_BASE}/${GITHUB_USERNAME}/${GITHUB_REPO}`;

// Image and data paths
export const IMAGES_PATH = 'images';
export const DATA_PATH = 'timeline-data.csv';

// Image URL for display
export const getImageUrl = (filename) => `${GITHUB_RAW_BASE_URL}/${IMAGES_PATH}/${filename}`;

// CSV Data URL
export const getDataUrl = () => `${GITHUB_RAW_BASE_URL}/${DATA_PATH}`;