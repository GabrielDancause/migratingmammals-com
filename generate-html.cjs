const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/cost-of-living-index.json', 'utf8'));

const lowestBudget = [...data].sort((a,b) => (a.monthlyBudgetUSD || Infinity) - (b.monthlyBudgetUSD || Infinity))[0];
const chiangMaiBudget = data.find(c => c.city === 'Chiang Mai').monthlyBudgetUSD;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Nomad Cost of Living Index 2026</title>
  <meta name="description" content="Definitive comparison of digital nomad living costs across ${data.length} cities. Compare rent, meals, and coworking prices.">
  <link rel="canonical" href="https://migratingmammals.com/cost-of-living-index">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0a0b10;
      --card-bg: #111318;
      --border: #1e2030;
      --accent: #C4956A;
      --text-primary: #e0d5c8;
      --text-secondary: #888;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text-primary);
      line-height: 1.6;
    }
    header {
      text-align: center;
      padding: 60px 20px 40px;
      border-bottom: 1px solid var(--border);
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 900;
      margin-bottom: 15px;
    }
    .accent { color: var(--accent); }
    .subtitle {
      color: var(--text-secondary);
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto 30px;
    }
    .stats-container {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      min-width: 200px;
    }
    .stat-card h3 { font-size: 0.9rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
    .stat-card .value { font-family: 'JetBrains Mono', monospace; font-size: 2rem; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .stat-card p { font-size: 0.9rem; }
    main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .chart-container {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 40px;
      overflow-x: auto;
    }
    .chart-container h2 { margin-bottom: 20px; font-size: 1.5rem; }
    .bar-row {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .bar-label { width: 150px; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bar-track {
      flex: 1;
      height: 24px;
      background: var(--bg);
      border-radius: 4px;
      position: relative;
    }
    .bar-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding-left: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: #000;
      font-weight: 600;
    }
    .controls {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    select, input {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text-primary);
      padding: 10px 15px;
      border-radius: 4px;
      font-family: inherit;
      outline: none;
    }
    select:focus, input:focus { border-color: var(--accent); }
    .table-container {
      overflow-x: auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 40px;
    }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th, td { padding: 15px 20px; border-bottom: 1px solid var(--border); }
    th { background: rgba(0,0,0,0.2); font-weight: 600; cursor: pointer; user-select: none; }
    th:hover { color: var(--accent); }
    td.mono { font-family: 'JetBrains Mono', monospace; }
    tr:hover td { background: rgba(255,255,255,0.02); }
    .null-val { color: var(--text-secondary); font-style: italic; }
    .region-tag { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; background: var(--bg); border: 1px solid var(--border); }

    .faq-section { margin-top: 60px; }
    .faq-section h2 { margin-bottom: 30px; font-size: 2rem; }
    .faq-item { margin-bottom: 25px; }
    .faq-item h3 { font-size: 1.2rem; margin-bottom: 10px; color: var(--accent); }
    .faq-item p { color: var(--text-secondary); }

    .methodology { margin-top: 40px; padding-top: 40px; border-top: 1px solid var(--border); }
    .methodology h2 { font-size: 1.5rem; margin-bottom: 15px; }
    .methodology p { color: var(--text-secondary); margin-bottom: 10px; font-size: 0.95rem; }

    footer {
      text-align: center;
      padding: 40px 20px;
      border-top: 1px solid var(--border);
      margin-top: 60px;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    footer a { color: var(--accent); text-decoration: none; }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <header>
    <h1>Digital Nomad <span class="accent">Cost of Living</span> Index 2026</h1>
    <p class="subtitle">Definitive comparison of digital nomad living costs across ${data.length} popular cities. Rent, meals, coworking, and more.</p>
    <div class="stats-container">
      <div class="stat-card">
        <h3>Cities Analyzed</h3>
        <div class="value">${data.length}</div>
        <p>Across 6 continents</p>
      </div>
      <div class="stat-card">
        <h3>Cheapest Nomad City</h3>
        <div class="value">${lowestBudget.city}</div>
        <p>~$${lowestBudget.monthlyBudgetUSD}/mo</p>
      </div>
      <div class="stat-card">
        <h3>Chiang Mai Budget</h3>
        <div class="value">$${chiangMaiBudget}</div>
        <p>Monthly estimated total</p>
      </div>
    </div>
  </header>

  <main>
    <div class="chart-container">
      <h2>Monthly Budget (Cheapest to Most Expensive)</h2>
      <div id="chart-content"></div>
    </div>

    <div class="controls">
      <select id="region-filter">
        <option value="all">All Regions</option>
        <option value="Southeast Asia">Southeast Asia</option>
        <option value="Europe">Europe</option>
        <option value="Latin America">Latin America</option>
        <option value="East Asia">East Asia</option>
        <option value="Middle East">Middle East</option>
        <option value="Africa">Africa</option>
        <option value="North America">North America</option>
      </select>
      <input type="number" id="budget-filter" placeholder="Max Budget USD (e.g. 1500)" />
      <input type="text" id="search-filter" placeholder="Search city..." />
    </div>

    <div class="table-container">
      <table id="data-table">
        <thead>
          <tr>
            <th data-sort="city">City ↕</th>
            <th data-sort="region">Region ↕</th>
            <th data-sort="monthlyBudgetUSD">Monthly Budget ↕</th>
            <th data-sort="rentStudioUSD">1BR Rent ↕</th>
            <th data-sort="mealCheapUSD">Cheap Meal ↕</th>
            <th data-sort="coffeeUSD">Coffee ↕</th>
          </tr>
        </thead>
        <tbody id="table-body">
          <!-- Populated via JS -->
        </tbody>
      </table>
    </div>

    <section class="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div class="faq-item">
        <h3>What is the cheapest city for digital nomads?</h3>
        <p>Based on our 2026 data, ${lowestBudget.city} offers the lowest monthly budget for digital nomads at approximately $${lowestBudget.monthlyBudgetUSD} per month. Other highly affordable options include typically cities in Southeast Asia and Latin America.</p>
      </div>
      <div class="faq-item">
        <h3>How much does it cost to live in Chiang Mai?</h3>
        <p>Our current estimate puts the monthly budget for a digital nomad in Chiang Mai at $${chiangMaiBudget}. This includes rent for a 1-bedroom apartment in the city center, groceries, dining out, and basic utilities. It remains one of the best value-for-money destinations.</p>
      </div>
      <div class="faq-item">
        <h3>Is Lisbon expensive for digital nomads?</h3>
        <p>Lisbon has seen significant price increases over the last few years. According to our index, a comfortable digital nomad budget in Lisbon is around $${data.find(c=>c.city==='Lisbon').monthlyBudgetUSD}/month, with a 1-bedroom apartment costing roughly $${data.find(c=>c.city==='Lisbon').rentStudioUSD}. While more expensive than Eastern Europe or Southeast Asia, it remains cheaper than major US cities.</p>
      </div>
      <div class="faq-item">
        <h3>What is the best city for remote workers?</h3>
        <p>The "best" city depends on your preferences for climate, timezone, and budget. Popular choices that balance affordability, internet speed, and community include Chiang Mai, Bali, Lisbon, and Medellín.</p>
      </div>
      <div class="faq-item">
        <h3>How much money do you need to be a digital nomad?</h3>
        <p>Nomad budgets range dramatically. While you can live in parts of Southeast Asia or South America for under $1,000/month, European cities typically require $2,000-$3,000, and major US hubs require $4,000+. We generally recommend earning at least $2,000/month for a comfortable buffer.</p>
      </div>
    </section>

    <section class="methodology">
      <h2>Methodology</h2>
      <p>Data was collected in 2026 compiling figures from Numbeo, Expatistan, NomadList, and TheEarthAwaits.</p>
      <p>The <strong>Monthly Budget</strong> is a calculated estimate tailored to digital nomads. It assumes: Rent for a 1-bedroom apartment in the city center, 2 daily cheap restaurant meals (or equivalent grocery spend), daily coffee, plus an estimated $300 buffer for transport, SIM card, and incidentals.</p>
      <p>Where specific data points were unavailable, we adhere to a strict "null over fake" policy, displaying no value rather than an estimation.</p>
    </section>
  </main>

  <footer>
    <p>© 2026 <a href="/">migratingmammals.com</a> · A <a href="https://gab.ae">GAB Ventures</a> property</p>
  </footer>

  <script>
    // Embed data directly
    const rawData = ${JSON.stringify(data)};
    let tableData = [...rawData];
    let sortCol = 'monthlyBudgetUSD';
    let sortAsc = true;

    const tbody = document.getElementById('table-body');
    const regionFilter = document.getElementById('region-filter');
    const budgetFilter = document.getElementById('budget-filter');
    const searchFilter = document.getElementById('search-filter');
    const chartContent = document.getElementById('chart-content');

    function formatUSD(val) {
      if (val === null || val === undefined) return '<span class="null-val">N/A</span>';
      return '$' + val.toLocaleString();
    }

    function renderChart() {
      const sorted = [...tableData].filter(d => d.monthlyBudgetUSD).sort((a,b) => a.monthlyBudgetUSD - b.monthlyBudgetUSD);
      if (sorted.length === 0) {
        chartContent.innerHTML = '<p>No data to display.</p>';
        return;
      }
      const maxVal = sorted[sorted.length-1].monthlyBudgetUSD;

      let html = '';
      sorted.forEach(d => {
        const pct = (d.monthlyBudgetUSD / maxVal) * 100;
        html += \`
          <div class="bar-row">
            <div class="bar-label">\${d.city}</div>
            <div class="bar-track">
              <div class="bar-fill" style="width: \${pct}%">\$\${d.monthlyBudgetUSD.toLocaleString()}</div>
            </div>
          </div>
        \`;
      });
      chartContent.innerHTML = html;
    }

    function renderTable() {
      tbody.innerHTML = '';
      tableData.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td><strong>\${d.city}</strong><br><small style="color:var(--text-secondary)">\${d.country}</small></td>
          <td><span class="region-tag">\${d.region}</span></td>
          <td class="mono">\${formatUSD(d.monthlyBudgetUSD)}</td>
          <td class="mono">\${formatUSD(d.rentStudioUSD)}</td>
          <td class="mono">\${formatUSD(d.mealCheapUSD)}</td>
          <td class="mono">\${formatUSD(d.coffeeUSD)}</td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function filterData() {
      const region = regionFilter.value;
      const maxBudget = parseFloat(budgetFilter.value);
      const search = searchFilter.value.toLowerCase();

      tableData = rawData.filter(d => {
        const regionMatch = region === 'all' || d.region === region;
        const budgetMatch = isNaN(maxBudget) || (d.monthlyBudgetUSD && d.monthlyBudgetUSD <= maxBudget);
        const searchMatch = d.city.toLowerCase().includes(search) || d.country.toLowerCase().includes(search);
        return regionMatch && budgetMatch && searchMatch;
      });

      sortData();
    }

    function sortData() {
      tableData.sort((a, b) => {
        let valA = a[sortCol];
        let valB = b[sortCol];

        if (valA === null) valA = sortAsc ? Infinity : -Infinity;
        if (valB === null) valB = sortAsc ? Infinity : -Infinity;

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
      renderTable();
      renderChart();
    }

    document.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (sortCol === col) {
          sortAsc = !sortAsc;
        } else {
          sortCol = col;
          sortAsc = true;
        }
        sortData();
      });
    });

    regionFilter.addEventListener('change', filterData);
    budgetFilter.addEventListener('input', filterData);
    searchFilter.addEventListener('input', filterData);

    // Initial render
    sortData();
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Digital Nomad Cost of Living Index 2026",
    "description": "Definitive comparison of digital nomad living costs across ${data.length} popular cities. Compare rent, meals, and coworking prices.",
    "author": {
      "@type": "Organization",
      "name": "migratingmammals.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "GAB Ventures",
      "logo": {
        "@type": "ImageObject",
        "url": "https://migratingmammals.com/favicon.ico"
      }
    },
    "datePublished": "2026-01-01",
    "mainEntityOfPage": "https://migratingmammals.com/cost-of-living-index"
  }
  </script>
</body>
</html>`;

fs.writeFileSync('public/cost-of-living-index.html', html);
console.log('Done generating public/cost-of-living-index.html');
