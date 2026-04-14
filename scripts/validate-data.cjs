const fs = require('fs');
const path = require('path');

const phonesPath = path.join(__dirname, '../src/data/phones.json');
const phones = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));

console.log('🚀 Starting Mobile Dokane Data Integrity Scan...\n');

const errors = [];
const warnings = [];
const slugs = new Set();

const requiredCategories = ['Network', 'Body', 'Display', 'Platform', 'Memory', 'Main Camera', 'Battery', 'Features'];

phones.forEach((phone, index) => {
  const name = phone.name || `Unnamed Phone at index ${index}`;
  
  // 1. Slug Integrity
  if (!phone.slug) errors.push(`[${name}] Missing slug.`);
  if (slugs.has(phone.slug)) errors.push(`[${name}] Duplicate slug detected: ${phone.slug}`);
  slugs.add(phone.slug);

  // 2. Price Logical Sync
  const prices = phone.prices || {};
  if (prices.official && prices.unofficial && prices.unofficial > prices.official) {
    warnings.push(`[${name}] Price Anomaly: Unofficial price (${prices.unofficial}) is higher than Official (${prices.official}).`);
  }
  if (!prices.unofficial) errors.push(`[${name}] Missing Unofficial price (Critical for aggregator).`);

  // 3. Technical Category Mapping
  const specs = phone.specs_v2 || {};
  requiredCategories.forEach(cat => {
    if (!specs[cat]) {
      warnings.push(`[${name}] Missing Category: ${cat} is missing from specs_v2.`);
    }
  });

  // 4. Color Variant Sync
  if (phone.color_variants) {
    phone.color_variants.forEach(variant => {
      if (!variant.image) errors.push(`[${name}] Color variant '${variant.name}' is missing an image path.`);
      if (!variant.color.startsWith('#')) warnings.push(`[${name}] Color variant '${variant.name}' has non-standard hex code: ${variant.color}`);
    });
  }

  // 5. Benchmark Data Validity (Sanity Checks)
  if (phone.benchmarks_v2) {
    const pTest = phone.benchmarks_v2.performance_test || {};
    if (pTest.geekbench_6_single && parseInt(pTest.geekbench_6_single.value) > 5000) {
      warnings.push(`[${name}] Benchmark Suspicion: Geekbench Single-core score seems unusually high (>5000).`);
    }
  }
});

// Summary Report
console.log(`📊 Scan Complete: Checked ${phones.length} devices.\n`);

if (errors.length > 0) {
  console.log('❌ ERRORS FOUND:');
  errors.forEach(err => console.log(`   - ${err}`));
} else {
  console.log('✅ No critical data errors found.');
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS / DATA GAPS:');
  warnings.forEach(warn => console.log(`   - ${warn}`));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n🏆 Data is 100% Consistent & Market-Ready.');
}

process.exit(errors.length > 0 ? 1 : 0);
