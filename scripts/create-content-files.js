#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// This script helps create the content files by reading from the source files

const contentDir = path.join(__dirname, '../src/content');
const filesDir = path.join(__dirname, '../src/contexts/files');

// Ensure content directory exists
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true });
}

function escapeForTypeScript(content) {
  return content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function createContentFile(filename, exportName, description) {
  const filePath = path.join(filesDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Warning: ${filename} not found, creating placeholder`);
    const placeholder = `// Placeholder content for ${description}
export const ${exportName} = \`${description} content will be loaded here.\`;`;
    
    const outputPath = path.join(contentDir, `${exportName.toLowerCase().replace(/_/g, '-')}.ts`);
    fs.writeFileSync(outputPath, placeholder);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const escapedContent = escapeForTypeScript(content);
    
    const tsContent = `// Auto-generated content file for ${description}
export const ${exportName} = \`${escapedContent}\`;`;

    const outputPath = path.join(contentDir, `${exportName.toLowerCase().replace(/_/g, '-')}.ts`);
    fs.writeFileSync(outputPath, tsContent);
    console.log(`Created ${outputPath} (${Math.round(content.length / 1024)}KB)`);
  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
  }
}

// Create content files
console.log('Creating content files...');

createContentFile('llms-efp.txt', 'EFP_CONTENT', 'EFP Complete Documentation');
createContentFile('llms-eik.txt', 'EIK_CONTENT', 'Ethereum Identity Kit Complete');
createContentFile('llms-ens.txt', 'ENS_CONTENT', 'ENS Complete Documentation');
createContentFile('llms-siwe.txt', 'SIWE_CONTENT', 'SIWE Complete Documentation');

console.log('Content files created! Remember to update file-context-loader.ts to import these.');