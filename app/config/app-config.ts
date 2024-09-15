declare global {
  interface Window {
    ENV: {
      APP_TIME_ZONE: string;
    };
  }
}

export const APP_TIME_ZONE = typeof window !== 'undefined' ? window.ENV.APP_TIME_ZONE : 'America/Chicago';