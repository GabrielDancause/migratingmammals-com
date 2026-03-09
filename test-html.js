const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/cost-of-living-index.json', 'utf8'));

// Now we need to create public/cost-of-living-index.html
