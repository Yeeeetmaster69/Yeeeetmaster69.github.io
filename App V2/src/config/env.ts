import Constants from 'expo-constants';

const BASE_URL =
  (Constants.expoConfig?.extra as any)?.functionsBaseUrl ||
  process.env.FUNCTIONS_BASE_URL ||
  'https://us-central1-handyman-c1eee.cloudfunctions.net';

export const FUNCTIONS_BASE_URL = BASE_URL;
export const functionUrl = (path: string) => `${FUNCTIONS_BASE_URL}/${path}`;
