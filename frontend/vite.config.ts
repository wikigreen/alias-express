import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000", // Your backend server running Socket.IO
        ws: true, // Enable WebSocket proxying
        changeOrigin: true, // Necessary for virtual hosted sites
        secure: false, // Disable SSL verification if needed
      },
      "/api": {
        target: "http://localhost:3000", // Your backend server running Socket.IO
        changeOrigin: true, // Necessary for virtual hosted sites
        secure: false, // Disable SSL verification if needed
      },
    },
  },
});
