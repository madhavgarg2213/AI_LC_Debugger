import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 Starting development mode for AI Leetcode Debugger...');
console.log('📁 Watching for changes...');

// Function to build the extension
async function buildExtension() {
  try {
    console.log('🔨 Building extension...');
    await execAsync('npm run build-extension');
    console.log('✅ Extension built successfully!');
    console.log('📂 Files ready in dist/ directory');
    console.log('🔄 Reload the extension in Chrome to see changes');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
  }
}

// Initial build
buildExtension();

// Watch for changes in source files
const watchPaths = ['src/', 'public/'];
const watchedFiles = new Set();

watchPaths.forEach(path => {
  if (fs.existsSync(path)) {
    fs.watch(path, { recursive: true }, (eventType, filename) => {
      if (filename && !watchedFiles.has(filename)) {
        watchedFiles.add(filename);
        console.log(`📝 File changed: ${filename}`);
        buildExtension();
        
        // Remove from watched files after a delay
        setTimeout(() => {
          watchedFiles.delete(filename);
        }, 1000);
      }
    });
  }
});

console.log('👀 Watching for changes in:', watchPaths.join(', '));
console.log('💡 Press Ctrl+C to stop'); 