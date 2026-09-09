import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Определяем base path динамически
// Для GitHub Pages: /имя-репозитория/
// Для локальной разработки: /
const getBasePath = () => {
  // Если установлена переменная окружения VITE_BASE_PATH, используем её
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH;
  }
  
  // Если это сборка для GitHub Pages, определяем из GITHUB_REPOSITORY
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
    return `/${repoName}/`;
  }
  
  // По умолчанию используем относительный путь
  return './';
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: getBasePath(),
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});
