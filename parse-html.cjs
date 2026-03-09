const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('nerdwallet.html', 'utf8');
const $ = cheerio.load(html);

// Find elements with 'Chase Sapphire Preferred' to find the structure
let found = false;
$('*').each((i, el) => {
    if (!found && $(el).text().includes('Chase Sapphire Preferred') && $(el).hasClass('MuiTypography-root')) {
        console.log("Found:", $(el).attr('class'));
        // Try to get a larger parent
        const parent = $(el).closest('div[data-testid="product-card"]');
        if (parent.length) {
            console.log("Parent product card HTML length:", parent.html().length);
            found = true;
        }
    }
});

// Lets find all cards
const cards = $('div[data-testid="product-card"]');
console.log("Total product cards found:", cards.length);

if (cards.length > 0) {
    cards.each((i, el) => {
        const title = $(el).find('h3[data-testid="product-card-name"]').text().trim();
        const info = $(el).find('p, span, li').map((j, item) => $(item).text().trim()).get();
        console.log("Card:", title);
        console.log("Info segments:", info.slice(0, 10).join(' | '));
        console.log("-----");
    });
}
