import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { productionSecurity } from './src/security/policy';
export default defineConfig({plugins:[react(), productionSecurity()], test:{include:['tests/unit/**/*.test.ts']}});
