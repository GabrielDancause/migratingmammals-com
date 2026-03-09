const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('nerdwallet.html', 'utf8');
const $ = cheerio.load(html);

// Find elements with 'Chase Sapphire Preferred' to find the structure
let parentContainer = null;
$('h3').each((i, el) => {
    if ($(el).text().includes('Chase Sapphire Preferred')) {
        parentContainer = $(el).closest('div').parent().parent();
        console.log("Found h3 parent with text:", parentContainer.text().substring(0, 100));
        return false;
    }
});

$('h3').each((i, el) => {
    const title = $(el).text().trim();
    if (title.length > 5 && title.includes('Card')) {
        console.log("Card found:", title);
        // Let's look around this h3 for fees
        const nearby = $(el).closest('div').parent().parent().text();
        const annualFeeMatch = nearby.match(/Annual fee.*?\$(\d+)/i) || nearby.match(/\$(\d+).*?Annual fee/i);
        const fxFeeMatch = nearby.match(/Foreign transaction fee.*?(\d+)%/i);

        console.log("  Annual fee:", annualFeeMatch ? annualFeeMatch[1] : 'unknown');
        console.log("  FX fee:", fxFeeMatch ? fxFeeMatch[1] + '%' : 'unknown');
    }
});
