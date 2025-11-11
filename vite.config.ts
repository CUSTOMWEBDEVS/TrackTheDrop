import { defineConfig } from 'vite';
export default defineConfig({ base: '/blood-tracker-pwa/', server: { host: true, port: 5173 }, build: { target: 'es2020' } });