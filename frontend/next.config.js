/** @type {import('next').NextConfig} */
const nextConfig = {
  // API Backend URL
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080/api',
  },
}

module.exports = nextConfig
