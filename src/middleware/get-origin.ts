export function getOrigin() {
  const origins = Bun.env.CORS_URL;
  if (!origins) {
    throw new Error('CORS_ORIGINS is not defined in the .env file');
  }
  // Split the comma-separated list into an array and trim any whitespace
  return origins.split(',').map((origin) => origin.trim());
}
