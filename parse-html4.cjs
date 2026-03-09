const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('nerdwallet.html', 'utf8');
const $ = cheerio.load(html);

const cards = [];
$('h3').each((i, el) => {
    const title = $(el).text().trim();
    if (title.length > 5 && title.includes('Card')) {
        const pTags = $(el).closest('div').parent().parent().parent().find('p').map((j, p) => $(p).text().trim()).get();
        // Fallback: look at all text nodes within a reasonable distance
        const containerText = $(el).closest('div').parent().parent().parent().text();

        let annualFeeMatch = containerText.match(/Annual fee\s*\$([\d,]+)/i);
        if (!annualFeeMatch) annualFeeMatch = containerText.match(/\$([\d,]+)\s*Annual fee/i);

        // They are all "no foreign transaction fee" cards on this page!
        const fxFee = 0;

        let rewardsRate = "";
        let signupBonus = "";

        const rewardsMatch = containerText.match(/Earn (.*?)(?=(Sign-up|Welcome|Annual fee|$))/i);
        if (rewardsMatch) {
            rewardsRate = "Earn " + rewardsMatch[1].substring(0, 100);
        }

        const bonusMatch = containerText.match(/(?:Sign-up bonus|Welcome offer|Intro offer|Bonus).*?(Earn .*?|Get .*?)(?=(Annual fee|Rewards|$))/i);
        if (bonusMatch) {
            signupBonus = bonusMatch[1].substring(0, 100);
        }

        if (annualFeeMatch && !cards.find(c => c.cardName === title)) {
            let issuer = "Unknown";
            if (title.includes("Chase")) issuer = "Chase";
            else if (title.includes("Capital One")) issuer = "Capital One";
            else if (title.includes("Bank of America")) issuer = "Bank of America";
            else if (title.includes("Wells Fargo")) issuer = "Wells Fargo";
            else if (title.includes("Amex") || title.includes("American Express")) issuer = "Amex";
            else if (title.includes("Citi")) issuer = "Citi";
            else if (title.includes("Discover")) issuer = "Discover";

            let fee = parseInt(annualFeeMatch[1].replace(/,/g, ''));

            cards.push({
                cardName: title,
                issuer: issuer,
                annualFeeUSD: fee,
                foreignTxFeePct: 0,
                rewardsRate: rewardsRate,
                signupBonus: signupBonus || null,
                loungeAccess: title.includes("Sapphire Reserve") || title.includes("Venture X") || title.includes("Platinum"),
                travelInsurance: title.includes("Sapphire") || title.includes("Venture"),
                category: fee > 250 ? "premium" : fee > 0 ? "mid-tier" : "no-annual-fee"
            });
        }
    }
});

console.log(JSON.stringify(cards, null, 2));
