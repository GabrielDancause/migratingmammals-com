const fs = require('fs');
const html = fs.readFileSync('public/travel-card-fees.html', 'utf8');
const data = fs.readFileSync('data/travel-card-fees.json', 'utf8');

const updatedHtml = html.replace(
    '// Placeholder for data and logic',
    `const cardData = ${data};\n        // Application logic follows`
);

fs.writeFileSync('public/travel-card-fees.html', updatedHtml);
console.log("Data injected.");
