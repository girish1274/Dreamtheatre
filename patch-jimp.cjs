// patch-jimp.js
const fs = require('fs');
const path = require('path');

function patchJimpMIMEIssue(dir) {
  if (!fs.existsSync(dir)) return;

  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      patchJimpMIMEIssue(fullPath);
    } else if (file === 'jimp.js') {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Could not find MIME for Buffer')) {
        console.log('🔧 Patching Jimp at', fullPath);
        const fixed = content.replace(
          /throw new Error\('Could not find MIME for Buffer <null>'\)/,
          `console.warn('[WARN] Buffer was null. Defaulting to image/png'); return 'image/png';`
        );
        fs.writeFileSync(fullPath, fixed);
      }
    }
  });
}

patchJimpMIMEIssue(path.join(__dirname, 'node_modules'));
