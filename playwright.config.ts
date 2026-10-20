import { defineConfig, devices } from '@playwright/test';
const engine=process.env.BROWSER_ENGINE;
const browser=engine==='firefox'?devices['Desktop Firefox']:engine==='webkit'?devices['Desktop Safari']:devices['Desktop Chrome'];
export default defineConfig({testDir:'tests/browser', use:{baseURL:'http://127.0.0.1:5173',...browser,...(!engine?{channel:process.env.BROWSER_CHANNEL || 'chrome'}:{})}, webServer:{command:'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:true}, reporter:'list'});
