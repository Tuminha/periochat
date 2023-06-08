/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
};

module.exports = {
  // ...
  serverRuntimeConfig: {
    // Will only be available on the server side
    port: process.env.PORT || 3000,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    port: process.env.PORT || 3000,
  },
};


export default nextConfig;
