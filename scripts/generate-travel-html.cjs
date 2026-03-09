const fs = require('fs');

const dataFile = 'data/travel-card-fees.json';
const data = fs.readFileSync(dataFile, 'utf8');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Travel Credit Card Foreign Transaction Fee Comparison 2026</title>
  <meta name="description" content="Compare foreign transaction fees, annual fees, and travel perks across major US credit cards. Find the best travel card with no foreign transaction fee.">
  <link rel="canonical" href="https://migratingmammals.com/travel-card-fees" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0a0b10;
      --card-bg: #111318;
      --border: #1e2030;
      --accent: #C4956A;
      --text-main: #e0d5c8;
      --text-sec: #888888;
      --success: #38a169;
      --danger: #e53e3e;
      --font-sans: 'Inter', -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.6;
    }

    header {
      padding: 60px 24px 40px;
      text-align: center;
      max-width: 900px;
      margin: 0 auto;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 900;
      letter-spacing: -1px;
      margin-bottom: 16px;
      color: #fff;
    }

    .subtitle {
      color: var(--text-sec);
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .accent { color: var(--accent); }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px 60px;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
      align-items: center;
      justify-content: space-between;
      background: var(--card-bg);
      padding: 16px 20px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .search-box {
      flex: 1;
      min-width: 250px;
    }

    .search-box input {
      width: 100%;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text-main);
      padding: 10px 16px;
      border-radius: 8px;
      font-family: var(--font-sans);
      font-size: 0.95rem;
    }

    .search-box input:focus {
      outline: none;
      border-color: var(--accent);
    }

    .filters {
      display: flex;
      gap: 12px;
    }

    select {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text-main);
      padding: 10px 16px;
      border-radius: 8px;
      font-family: var(--font-sans);
      font-size: 0.9rem;
      cursor: pointer;
      appearance: none;
    }
    select:focus { outline: none; border-color: var(--accent); }

    .table-wrapper {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    th, td {
      padding: 16px;
      border-bottom: 1px solid var(--border);
    }

    th {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-sec);
      font-weight: 700;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }

    th:hover { color: var(--text-main); }

    .sort-asc::after { content: ' ↑'; color: var(--accent); }
    .sort-desc::after { content: ' ↓'; color: var(--accent); }

    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,0.02); }

    .card-name {
      font-weight: 700;
      color: #fff;
      margin-bottom: 4px;
    }

    .card-issuer {
      font-size: 0.8rem;
      color: var(--text-sec);
      background: rgba(255,255,255,0.05);
      padding: 2px 8px;
      border-radius: 12px;
      display: inline-block;
    }

    .money-val {
      font-family: var(--font-mono);
      font-weight: 500;
    }

    .fx-fee {
      font-family: var(--font-mono);
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.85rem;
      display: inline-block;
    }

    .fx-zero { background: rgba(56, 161, 105, 0.15); color: #68d391; }
    .fx-high { background: rgba(229, 62, 62, 0.15); color: #fc8181; }

    .bool-icon {
      font-size: 1.2rem;
    }
    .bool-true { color: #68d391; }
    .bool-false { color: #4a5568; }

    .details-cell {
      font-size: 0.85rem;
      color: var(--text-sec);
      max-width: 250px;
    }

    .perk-tag {
      font-size: 0.75rem;
      padding: 2px 6px;
      background: rgba(196, 149, 106, 0.15);
      color: var(--accent);
      border-radius: 4px;
      margin-right: 4px;
      display: inline-block;
      margin-top: 4px;
    }

    /* FAQ Section */
    .faq-section {
      max-width: 800px;
      margin: 60px auto;
      padding: 0 24px;
    }

    .faq-section h2 {
      font-size: 1.8rem;
      color: #fff;
      margin-bottom: 30px;
      text-align: center;
    }

    .faq-item {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 16px;
    }

    .faq-q {
      font-weight: 700;
      color: #fff;
      font-size: 1.1rem;
      margin-bottom: 12px;
    }

    .faq-a {
      color: var(--text-sec);
      font-size: 0.95rem;
    }

    .footer {
      text-align: center;
      padding: 40px 24px;
      border-top: 1px solid var(--border);
      color: var(--text-sec);
      font-size: 0.85rem;
    }

    .footer a {
      color: var(--accent);
      text-decoration: none;
    }
    .footer a:hover { text-decoration: underline; }

    @media (max-width: 768px) {
      .controls { flex-direction: column; align-items: stretch; }
      .filters { flex-direction: column; }
      .hide-mobile { display: none; }
      th, td { padding: 12px; }
    }
  </style>
</head>
<body>

  <header>
    <h1>Travel Credit Card Foreign Transaction Fee Comparison <span class="accent">2026</span></h1>
    <p class="subtitle">We compared 24 popular travel credit cards to find the best options with no foreign transaction fees, analyzing annual costs, rewards, and travel perks.</p>
  </header>

  <div class="container">
    <div class="controls">
      <div class="search-box">
        <input type="text" id="search-input" placeholder="Search by card name, issuer, or rewards...">
      </div>
      <div class="filters">
        <select id="fee-filter">
          <option value="all">All Annual Fees</option>
          <option value="0">$0 Annual Fee</option>
          <option value="1-99">$1 - $99</option>
          <option value="100+">$100+</option>
        </select>
        <select id="fx-filter">
          <option value="all">All FX Fees</option>
          <option value="0">No FX Fee (0%)</option>
        </select>
        <select id="category-filter">
          <option value="all">All Categories</option>
          <option value="premium">Premium</option>
          <option value="mid-tier">Mid-Tier</option>
          <option value="no-annual-fee">No Annual Fee</option>
        </select>
      </div>
    </div>

    <div style="margin-bottom: 12px; font-size: 0.9rem; color: var(--text-sec);">
      Showing <span id="result-count" style="color: #fff; font-weight: 600;">0</span> cards
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th data-sort="cardName">Card & Issuer</th>
            <th data-sort="annualFeeUSD">Annual Fee</th>
            <th data-sort="foreignTxFeePct">FX Fee</th>
            <th class="hide-mobile">Rewards & Bonus</th>
            <th data-sort="loungeAccess">Perks</th>
          </tr>
        </thead>
        <tbody id="table-body">
          <!-- Rows injected via JS -->
        </tbody>
      </table>
    </div>
  </div>


  <div class="faq-section" style="margin-top: 40px; margin-bottom: 40px;">
    <h2>Methodology</h2>
    <p style="color: var(--text-sec); line-height: 1.6;">We analyzed 24 major U.S. travel credit cards to compare their foreign transaction fees, annual fees, and travel perks such as lounge access and travel insurance. Data was sourced from public issuer information and cross-referenced with top financial review sites like NerdWallet, Bankrate, The Points Guy, and CNBC. We categorized the cards into premium, mid-tier, and no-annual-fee segments to provide a comprehensive comparison for different types of travelers.</p>
  </div>

  <div class="faq-section">
    <h2>Frequently Asked Questions</h2>

    <div class="faq-item">
      <div class="faq-q">Which credit cards have no foreign transaction fee?</div>
      <div class="faq-a">Many travel credit cards offer no foreign transaction fees. Popular options include the Chase Sapphire Preferred, Capital One Venture X, Capital One Savor, and the Bank of America Travel Rewards card. Generally, cards branded for travel or premium rewards waive this fee.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Is the Chase Sapphire worth the annual fee for travel?</div>
      <div class="faq-a">Yes, for most frequent travelers. The Chase Sapphire Preferred has a $95 annual fee but offers 2x points on travel, primary rental car insurance, and valuable points that transfer to airlines and hotels. The Chase Sapphire Reserve ($550 fee) includes lounge access and a $300 travel credit, making it worthwhile for heavy travelers.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Do Capital One cards charge foreign transaction fees?</div>
      <div class="faq-a">No, none of Capital One's U.S.-issued credit cards charge a foreign transaction fee. This applies to all their cards, including the Quicksilver, Savor, and Venture lines, making them excellent choices for international travel.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">What is a foreign transaction fee?</div>
      <div class="faq-a">A foreign transaction fee (or FX fee) is a surcharge added by your credit card issuer on purchases made outside your home country or in a foreign currency. It is typically around 3% of the transaction amount, which can add up quickly during a trip.</div>
    </div>

    <div class="faq-item">
      <div class="faq-q">Which is the best credit card for international travel?</div>
      <div class="faq-a">The "best" card depends on your travel style. The Capital One Venture X is highly rated for premium perks (lounge access) at a lower effective cost than competitors. The Chase Sapphire Preferred is the best mid-tier option, while the Wells Fargo Autograph is an excellent no-annual-fee choice.</div>
    </div>
  </div>

  <div class="footer">
    © 2026 <a href="/">migratingmammals.com</a> · A <a href="https://gab.ae">GAB Ventures</a> property
  </div>

  <!-- JSON Data -->
  <script id="card-data" type="application/json">
${data}
  </script>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const rawData = document.getElementById('card-data').textContent;
      let cards = [];
      try { cards = JSON.parse(rawData); } catch (e) { console.error('Data parse error', e); }

      let currentData = [...cards];
      let sortCol = 'cardName';
      let sortDir = 1;

      const tbody = document.getElementById('table-body');
      const searchInput = document.getElementById('search-input');
      const feeFilter = document.getElementById('fee-filter');
      const fxFilter = document.getElementById('fx-filter');
      const categoryFilter = document.getElementById('category-filter');
      const resultCount = document.getElementById('result-count');
      const headers = document.querySelectorAll('th[data-sort]');

      function renderTable() {
        resultCount.textContent = currentData.length;

        if (currentData.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px; color: var(--text-sec);">No cards found matching criteria.</td></tr>';
          return;
        }

        tbody.innerHTML = currentData.map(card => {
          const fxClass = card.foreignTxFeePct === 0 ? 'fx-zero' : 'fx-high';
          const fxText = card.foreignTxFeePct === 0 ? '0%' : card.foreignTxFeePct + '%';

          let perks = '';
          if (card.loungeAccess) perks += '<span class="perk-tag">Lounge Access</span>';
          if (card.travelInsurance) perks += '<span class="perk-tag">Travel Insurance</span>';
          if (!perks) perks = '<span style="color: var(--text-sec); font-size: 0.8rem;">Standard perks</span>';

          return \`
          <tr>
            <td>
              <div class="card-name">\${card.cardName}</div>
              <div class="card-issuer">\${card.issuer}</div>
            </td>
            <td class="money-val">$\${card.annualFeeUSD}</td>
            <td><span class="fx-fee \${fxClass}">\${fxText}</span></td>
            <td class="hide-mobile details-cell">
              <div style="color: #e0d5c8; margin-bottom: 4px; font-weight: 500;">\${card.rewardsRate}</div>
              <div style="font-size: 0.75rem;">\${card.signupBonus || 'No signup bonus'}</div>
            </td>
            <td>
              \${perks}
            </td>
          </tr>
          \`;
        }).join('');
      }

      function sortData(column) {
        if (sortCol === column) {
          sortDir *= -1;
        } else {
          sortCol = column;
          sortDir = 1;
        }

        headers.forEach(th => {
          th.classList.remove('sort-asc', 'sort-desc');
          if (th.dataset.sort === sortCol) {
            th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');
          }
        });

        currentData.sort((a, b) => {
          let valA = a[sortCol];
          let valB = b[sortCol];

          // Boolean sorting
          if (typeof valA === 'boolean') valA = valA ? 1 : 0;
          if (typeof valB === 'boolean') valB = valB ? 1 : 0;

          if (typeof valA === 'string' && typeof valB === 'string') {
            return valA.localeCompare(valB) * sortDir;
          }
          return (valA - valB) * sortDir;
        });

        renderTable();
      }

      function applyFilters() {
        const query = searchInput.value.toLowerCase();
        const fee = feeFilter.value;
        const fx = fxFilter.value;
        const cat = categoryFilter.value;

        currentData = cards.filter(card => {
          // Search
          const matchesSearch = card.cardName.toLowerCase().includes(query) ||
                                card.issuer.toLowerCase().includes(query) ||
                                card.rewardsRate.toLowerCase().includes(query);
          if (!matchesSearch) return false;

          // Fee filter
          if (fee === '0' && card.annualFeeUSD !== 0) return false;
          if (fee === '1-99' && (card.annualFeeUSD < 1 || card.annualFeeUSD > 99)) return false;
          if (fee === '100+' && card.annualFeeUSD < 100) return false;

          // FX filter
          if (fx === '0' && card.foreignTxFeePct !== 0) return false;

          // Category filter
          if (cat !== 'all' && card.category !== cat) return false;

          return true;
        });

        // Re-apply sort
        const tmpCol = sortCol;
        const tmpDir = sortDir;
        sortCol = null;
        sortData(tmpCol);
        if (sortDir !== tmpDir) {
           sortDir = tmpDir;
           sortData(tmpCol);
        }
      }

      // Events
      headers.forEach(th => {
        th.addEventListener('click', () => sortData(th.dataset.sort));
      });

      searchInput.addEventListener('input', applyFilters);
      feeFilter.addEventListener('change', applyFilters);
      fxFilter.addEventListener('change', applyFilters);
      categoryFilter.addEventListener('change', applyFilters);

      // Init
      sortData('cardName');
    });
  </script>

  <!-- JSON-LD -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Travel Credit Card Foreign Transaction Fee Comparison",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Any"
    }
  </script>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Travel Credit Card Foreign Transaction Fee Comparison 2026",
      "description": "Compare foreign transaction fees, annual fees, and travel perks across major US credit cards. Find the best travel card with no foreign transaction fee.",
      "author": {
        "@type": "Organization",
        "name": "migratingmammals.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "GAB Ventures",
        "url": "https://gab.ae"
      },
      "datePublished": "2026-01-01"
    }
  </script>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Which credit cards have no foreign transaction fee?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Many travel credit cards offer no foreign transaction fees. Popular options include the Chase Sapphire Preferred, Capital One Venture X, Capital One Savor, and the Bank of America Travel Rewards card. Generally, cards branded for travel or premium rewards waive this fee."
          }
        },
        {
          "@type": "Question",
          "name": "Is the Chase Sapphire worth the annual fee for travel?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, for most frequent travelers. The Chase Sapphire Preferred has a $95 annual fee but offers 2x points on travel, primary rental car insurance, and valuable points that transfer to airlines and hotels. The Chase Sapphire Reserve ($550 fee) includes lounge access and a $300 travel credit, making it worthwhile for heavy travelers."
          }
        },
        {
          "@type": "Question",
          "name": "Do Capital One cards charge foreign transaction fees?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No, none of Capital One's U.S.-issued credit cards charge a foreign transaction fee. This applies to all their cards, including the Quicksilver, Savor, and Venture lines, making them excellent choices for international travel."
          }
        },
        {
          "@type": "Question",
          "name": "What is a foreign transaction fee?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A foreign transaction fee (or FX fee) is a surcharge added by your credit card issuer on purchases made outside your home country or in a foreign currency. It is typically around 3% of the transaction amount, which can add up quickly during a trip."
          }
        },
        {
          "@type": "Question",
          "name": "Which is the best credit card for international travel?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The 'best' card depends on your travel style. The Capital One Venture X is highly rated for premium perks (lounge access) at a lower effective cost than competitors. The Chase Sapphire Preferred is the best mid-tier option, while the Wells Fargo Autograph is an excellent no-annual-fee choice."
          }
        }
      ]
    }
  </script>
</body>
</html>`;

fs.writeFileSync('public/travel-card-fees.html', htmlContent);
console.log('Successfully wrote public/travel-card-fees.html');
