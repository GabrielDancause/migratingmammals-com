const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('nerdwallet.html', 'utf8');
const $ = cheerio.load(html);

$('h3').each((i, el) => {
    const title = $(el).text().trim();
    if (title.length > 5 && title.includes('Card')) {
        // Go way up the DOM tree
        const block = $(el).parents().filter((j, parent) => {
            const text = $(parent).text();
            return text.includes('Annual fee') || text.includes('Foreign transaction');
        }).first();

        if (block.length) {
            const text = block.text();
            const annualFeeMatch = text.match(/Annual fee\s*\$(\d+)/i) || text.match(/\$(\d+)\s*Annual fee/i);
            const fxMatch = text.match(/Foreign transaction fee\s*(None|\d+%)/i);
            const rewardsMatch = text.match(/Rewards\s*(.+?)(?=(Sign-up|Welcome|Annual))/i) || [null, ''];

            console.log("Card:", title);
            console.log("  Annual fee:", annualFeeMatch ? annualFeeMatch[1] : 'unknown');
            console.log("  FX fee:", fxMatch ? fxMatch[1] : 'unknown');
            console.log("  Rewards:", rewardsMatch[1].substring(0, 50));
        }
    }
});
