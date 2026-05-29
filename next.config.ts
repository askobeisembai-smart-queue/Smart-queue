import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Обязательно для GitHub Pages
  images: {
    unoptimized: true, // Отключает оптимизацию картинок, которую GitHub не поддерживает
  },
  basePath: '/Smart-queue', // Имя твоего репозитория с точностью до регистра
};

export default nextConfig;