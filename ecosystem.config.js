module.exports = {
  apps: [
    {
      name: "app1",
      script: "./src/index.ts",
      watch: true,
      env: {
        NODE_ENV: "development", // define env variables here
      },
    },
  ],
};
