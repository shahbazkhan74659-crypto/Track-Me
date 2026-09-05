import nextConfig from "eslint-config-next";

const config = [
  { ignores: ["playwright/.cache/**", "playwright-report/**", "test-results/**"] },
  ...nextConfig,
];

export default config;
