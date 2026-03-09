const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/cost-of-living-index.json', 'utf8'));

// Now write scripts/crawl-cost-of-living.cjs so it has the climate mapping
