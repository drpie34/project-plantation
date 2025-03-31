import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react', 
            'react-dom', 
            'react-router-dom'
          ],
          'ui': [
            '@radix-ui/react-accordion', 
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            '@radix-ui/react-tabs',
            '@radix-ui/react-popover',
            'class-variance-authority',
            'clsx', 
            'lucide-react'
          ],
          'data-visualization': [
            'chart.js', 
            'react-chartjs-2', 
            'recharts', 
            '@xyflow/react'
          ],
          'ui-components': [
            '@/components/ui/button',
            '@/components/ui/card',
            '@/components/ui/tabs',
            '@/components/ui/dialog'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 800 // Increase the limit to reduce warnings
  },
}));
