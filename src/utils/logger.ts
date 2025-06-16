export default {
  info: (message: string | unknown) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${
      typeof message === 'string' ? message : JSON.stringify(message)
    }`);
  },
  warn: (message: string | unknown) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${
      typeof message === 'string' ? message : JSON.stringify(message)
    }`);
  },
  error: (message: string | unknown, error?: unknown) => {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${
        typeof message === 'string' ? message : JSON.stringify(message)
      }${error ? ` - ${JSON.stringify(error)}` : ''}`
    );
  }
};