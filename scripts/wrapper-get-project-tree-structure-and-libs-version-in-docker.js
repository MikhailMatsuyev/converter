#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const { platform } = require('os');
const path = require('path');

const isWindows = platform() === 'win32';
const scriptName = 'get-project-tree-structure-and-libs-version-in-docker.ps1';
const scriptPath = path.join(__dirname, scriptName);

console.log(`🌍 Platform: ${platform()}`);
console.log(`🚀 Starting development environment...`);

try {
    if (isWindows) {
        // Для Windows используем PowerShell
        execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, {
            stdio: 'inherit',
            cwd: process.cwd()
        });
    } else {
        // Для Linux/macOS используем pwsh (PowerShell Core) или переходим на bash
        console.log('⚠️  PowerShell script detected, trying to run with pwsh...');

        // Проверяем, установлен ли PowerShell Core
        try {
            execSync('which pwsh', { stdio: 'ignore' });
            execSync(`pwsh -File "${scriptPath}"`, {
                stdio: 'inherit',
                cwd: process.cwd()
            });
        } catch (error) {
            console.log('❌ PowerShell Core (pwsh) not found.');
            console.log('📋 Please install PowerShell Core:');
            console.log('   Ubuntu/Debian: sudo apt-get install powershell');
            console.log('   macOS: brew install powershell');
            console.log('\n🎯 Alternative: Use the bash script instead.');
            process.exit(1);
        }
    }
} catch (error) {
    console.error('❌ Error starting development environment:', error.message);
    process.exit(1);
}
