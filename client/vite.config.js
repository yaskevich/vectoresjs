import vue from '@vitejs/plugin-vue'

/**
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [vue()],
  server: {
    port: 3070,
    proxy: {
     '/api': {
       target: 'http://localhost:3071',
       changeOrigin: true,
       secure: false,
       ws: true,
     }
   }
  }
}
