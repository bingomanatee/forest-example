import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default ({ mode }) => {
  let config = {
    plugins: [react(), splitVendorChunkPlugin()],
    resolve: {
      alias: { '~': '/src' },
    },
    build: {
      // For Dev stage
      sourcemap: process.env.VITE_SOURCE_MAP || false,
    },
  };

  if (mode === 'development') {
    let env = loadEnv(mode, process.cwd());

    // A custom plugin that rewrites config file path based on value in .env.local
    const configFileRouting = () => ({
      name: 'config-file-routing',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.startsWith('/config/config.json') && env.VITE_PUBLISHER_ID) {
            req.url = `/config/${env.VITE_PUBLISHER_ID}.json`;
          }
          next();
        });
      },
    });
    config.plugins.push(configFileRouting());

    config.server = {
      host: '0.0.0.0',
      watch: {
        usePolling: true,
      },
      proxy: {
        // Proxying API requests to the backend server
        '/web': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              proxyReq.setHeader('Publisher-Id', env.VITE_PUBLISHER_ID);
            });
          },
        },
      },
    };
    config.build = {
      sourcemap: true,
    };
  }
  return defineConfig(config);
};
