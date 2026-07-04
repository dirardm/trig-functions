import { defineConfig } from 'vite';import react from '@vitejs/plugin-react';
export default defineConfig({base:'/trig-functions/',plugins:[react()],build:{target:'esnext'},assetsInclude:['**/*.wasm']});
