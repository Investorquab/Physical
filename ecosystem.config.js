module.exports = {
  apps: [
    {
      name: "physical-api",
      cwd: "/root/physical/apps/api",
      script: "npx",
      args: "tsx src/index.ts",
      env: { API_PORT: "4001", CORS_ORIGIN: "https://physical-depin.vercel.app" },
      restart_delay: 5000,
      max_restarts: 20,
    },
    {
      name: "physical-worker-ingestion",
      cwd: "/root/physical/apps/worker-ingestion",
      script: "npx",
      args: "tsx src/index.ts",
      restart_delay: 5000,
      max_restarts: 20,
    },
    {
      name: "physical-worker-oracle",
      cwd: "/root/physical/apps/worker-oracle",
      script: "npx",
      args: "tsx src/index.ts",
      restart_delay: 5000,
      max_restarts: 20,
    },
  ],
};
