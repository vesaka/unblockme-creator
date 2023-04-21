const path = require('path');
const vuePlugin = require('@vitejs/plugin-vue')

const { defineConfig } = require('vite');

/**
 * https://vitejs.dev/config
 */
const config = defineConfig({
    root: path.join(__dirname, 'src', 'renderer'),
    publicDir: 'public',
    server: {
        port: 8080,
    },
    open: false,
    build: {
        outDir: path.join(__dirname, 'build', 'renderer'),
        emptyOutDir: true,
    },
    plugins: [vuePlugin()],
    resolve: {
        alias: {
            $root: path.resolve(__dirname, './src'),
            $main: path.resolve(__dirname, './src/main'),
            $renderer: path.resolve(__dirname, './src/renderer'),
            $lib: path.resolve(__dirname, './src/lib'),
        }
    },
});

module.exports = config;
