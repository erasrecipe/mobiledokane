const fs = require('fs');
const path = require('path');

const phonesPath = path.join(__dirname, '../src/data/phones.json');
const phones = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));

// Extract only what's needed for search autocomplete
const searchIndex = phones.map(p => ({
  n: p.name,
  s: p.slug,
  b: p.brand,
  i: p.image
}));

const outputPath = path.join(__dirname, '../src/data/search-index.json');
fs.writeFileSync(outputPath, JSON.stringify(searchIndex));

console.log('✅ Search index generated successfully (Lighter & Faster).');
