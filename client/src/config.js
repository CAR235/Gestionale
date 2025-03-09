const getApiBaseUrl = () => {
  // Always use the hardcoded IP address for API access
  return 'http://192.168.1.148:3000';
};

export const API_BASE_URL = getApiBaseUrl();