import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runServerPlugin() {
  let child;
  return {
    name: "run-api-server",
    configureServer() {
      const serverPath = path.join(__dirname, "server", "index.js");
      child = spawn("node", [`"${serverPath}"`], {
        stdio: "inherit",
        shell: true,
      });
      child.on("error", (err) => console.error("API server error:", err));
      child.on("exit", (code) => code !== null && code !== 0 && console.warn("API server exited with code", code));
    },
    closeBundle() {
      if (child) child.kill();
    },
  };
}

export default defineConfig({
  plugins: [react(), runServerPlugin()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, req, res) => {
            console.warn("Proxy error (is API server running?):", err.message);
          });
          proxy.on("proxyRes", (proxyRes) => {
            if (proxyRes.statusCode === 502 || proxyRes.statusCode === 503) {
              console.warn("API server may not be running on port 3001");
            }
          });
        },
      },
    },
  },
});
