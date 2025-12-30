// Platform Constants

export const PLATFORM_COMMISSION_RATE = 0.15; // 15%

export const PASSWORD_MIN_LENGTH = 8;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

export const DISPLAY_NAME_MAX_LENGTH = 50;
export const BIO_MAX_LENGTH = 500;

export const CONTENT_TITLE_MIN_LENGTH = 5;
export const CONTENT_TITLE_MAX_LENGTH = 100;
export const CONTENT_DESCRIPTION_MIN_LENGTH = 20;
export const CONTENT_DESCRIPTION_MAX_LENGTH = 5000;

export const MAX_TAGS_PER_CONTENT = 10;

export const MINIMUM_PURCHASE_PRICE = 1; // USD
export const MINIMUM_SUBSCRIPTION_PRICE = 5; // USD

export const MINIMUM_PAYOUT_THRESHOLD = 50; // USD
export const INSTANT_PAYOUT_FEE_RATE = 0.02; // 2%

export const PAYOUT_HOLD_DAYS = 7;

export const OTP_EXPIRATION_MINUTES = 5;
export const OTP_MAX_ATTEMPTS_PER_HOUR = 3;

export const ACCESS_TOKEN_EXPIRATION = '15m';
export const REFRESH_TOKEN_EXPIRATION = '7d';

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MINUTES = 15;

export const MAX_FILE_SIZE = {
  IMAGE: 20 * 1024 * 1024, // 20MB
  VIDEO: 5 * 1024 * 1024 * 1024, // 5GB
  AUDIO: 500 * 1024 * 1024, // 500MB
  DOCUMENT: 200 * 1024 * 1024, // 200MB
  PROFILE_PHOTO: 5 * 1024 * 1024, // 5MB
};

export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
export const SUPPORTED_VIDEO_FORMATS = ['mp4', 'mov', 'avi', 'mkv'];
export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'flac', 'm4a', 'ogg'];
export const SUPPORTED_DOCUMENT_FORMATS = ['pdf', 'docx', 'epub', 'txt', 'zip', 'rar'];

export const CATEGORIES = [
  'Photos',
  'Videos',
  'Music',
  'Podcasts/Audio',
  'Documents/eBooks',
  'Courses/Tutorials',
  'Digital Art',
  '3D Models/Assets',
  'Software/Tools',
  'Other',
];

export const STREAMING_URL_EXPIRATION = 3600; // 1 hour in seconds

export const AFFILIATE_COMMISSION_RATE = 0.1; // 10% of first purchase
export const AFFILIATE_COOKIE_DAYS = 30;

export const REVIEW_TEXT_MIN_LENGTH = 20;
export const REVIEW_TEXT_MAX_LENGTH = 500;

export const PAID_MESSAGE_MIN_PRICE = 1;
export const PAID_MESSAGE_MAX_PRICE = 50;
export const MESSAGE_CHARACTER_LIMIT = 1000;
export const MESSAGE_ATTACHMENT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const CUSTOM_REQUEST_DESCRIPTION_MAX_LENGTH = 500;
export const MAX_REQUEST_REVISIONS = 2;

export const SUBSCRIPTION_EXPIRATION_REMINDER_DAYS = 7;
export const SUBSCRIPTION_GRACE_PERIOD_DAYS = 3;

export const MAX_PLAYLISTS_PER_USER = 100;
export const MAX_TRACKS_PER_PLAYLIST = 500;

export const FEED_PAGE_SIZE = 20;
export const SEARCH_RESULTS_PAGE_SIZE = 24;

export const MAX_FEATURED_CONTENT = 6;

export const RATE_LIMIT = {
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  OTP: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  PURCHASE: { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 purchases per hour
  STREAM: { maxAttempts: 100, windowMs: 60 * 60 * 1000 }, // 100 streams per hour
  API: { maxAttempts: 1000, windowMs: 60 * 60 * 1000 }, // 1000 requests per hour
};

export const VIDEO_QUALITIES = ['240p', '360p', '480p', '720p', '1080p'];
export const AUDIO_BITRATE = 320; // kbps

export const WATERMARK_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];
export const WATERMARK_OPACITY_MIN = 0.2;
export const WATERMARK_OPACITY_MAX = 0.8;
