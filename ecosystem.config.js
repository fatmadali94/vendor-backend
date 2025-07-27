module.exports = {
  apps: [
    {
      name: "vendor-backend",
      script: "./dist/index.js", // Compiled file
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
