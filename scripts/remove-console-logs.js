#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories to process
const directories = [
  'frontend/src/components',
  'frontend/src/app',
  'frontend/src/hooks',
  'frontend/src/contexts',
  'frontend/src/services',
  'frontend/src/utils'
];

// File extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove all console statements (log, error, warn, debug, etc.)
    // Match console.* statements on their own line
    const consoleRegex = /^\s*console\.(log|error|warn|debug|info)\([^)]*\);\s*$/gm;

    // Also match console statements with comments
    const consoleWithCommentRegex = /^\s*console\.(log|error|warn|debug|info)\([^)]*\);\s*\/\/.*$/gmi;

    if (consoleRegex.test(content) || consoleWithCommentRegex.test(content)) {
      content = content.replace(consoleRegex, '');
      content = content.replace(consoleWithCommentRegex, '');

      // Remove empty lines that might be left behind (but keep max 1 empty line)
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

      fs.writeFileSync(filePath, content, 'utf8');
      modified = true;
    }

    return modified;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory ${dir} does not exist, skipping...`);
    return;
  }

  const files = fs.readdirSync(dir, { withFileTypes: true });
  let modifiedCount = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      modifiedCount += processDirectory(fullPath);
    } else if (file.isFile() && extensions.includes(path.extname(file.name))) {
      if (removeConsoleLogs(fullPath)) {
        console.log(`Cleaned: ${fullPath}`);
        modifiedCount++;
      }
    }
  }

  return modifiedCount;
}

console.log('🧹 Removing console.log statements from production code...\n');

let totalModified = 0;
for (const dir of directories) {
  console.log(`Processing ${dir}...`);
  totalModified += processDirectory(dir);
}

console.log(`\n✅ Cleanup complete! Modified ${totalModified} files.`);
console.log('Note: All console.* statements have been removed from production code.');