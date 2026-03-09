const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/cost-of-living-index.json', 'utf8'));

// Wait, the instructions say "null over fake" for missing values!
// "When scraping or gathering data, adhere strictly to a 'null over fake' policy: always use null for missing values rather than generating fake or mocked data."
// I will rewrite the script to use null instead of Math.random
