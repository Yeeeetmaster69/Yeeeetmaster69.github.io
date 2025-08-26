import Constants from 'expo-constants';

const config = Constants.expoConfig?.extra as any;

export const FUNCTIONS_BASE_URL = 
  config?.functionsBaseUrl ||
  process.env.FUNCTIONS_BASE_URL ||
  'https://us-central1-handyman-c1eee.cloudfunctions.net';

export const functionUrl = (path: string) => `${FUNCTIONS_BASE_URL}/${path}`;

// Export all app configuration
export const APP_CONFIG = {
  firebase: config?.firebase || {},
  stripe: {
    publishableKey: config?.stripePublishableKey || process.env.STRIPE_PUBLISHABLE_KEY || '',
  },
  square: {
    appId: config?.squareAppId || process.env.SQUARE_APP_ID || '',
    locationId: config?.squareLocationId || process.env.SQUARE_LOCATION_ID || '',
  },
  features: {
    enableOnboarding: config?.enableOnboarding ?? true,
    enableGeofencedTracking: config?.enableGeofencedTracking ?? true,
    enablePayments: config?.enablePayments ?? false,
  },
  adminPortalUrl: config?.adminPortalUrl || process.env.ADMIN_PORTAL_URL || 'https://admin.handymanpro.app',
  googleMapsApiKey: config?.firebase?.apiKey || process.env.GOOGLE_MAPS_API_KEY || '',
};
