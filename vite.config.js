// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "node:path";
import viteTsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  server: {
    host: "0.0.0.0",
    // 필요하면 포트 지정 (생략 시 5173)
    // port: 5173,
    /**
     * ✅ 프록시 설정
     * - /api            : Next.js API (chatCompletion 등)
     * - /api/trpc       : tRPC 쿼리 (llmApiKey.all 등)
     * - /auth (선택)    : next-auth 콜백/세션 라우트가 필요할 때
     */
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/api/trpc": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      // 필요 없으면 지워도 됨
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), viteTsconfigPaths()],
  resolve: {
    alias: {
      Components: path.resolve(process.cwd(), "./src/Components"),
      Library: path.resolve(process.cwd(), "./src/Library"),
      Pages: path.resolve(process.cwd(), "./src/Pages"),
      Communicator: path.resolve(process.cwd(), "./src/Communicator"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  optimizeDeps: {
    // 필요한 경우만 사용
    // exclude: [],
  },
});
