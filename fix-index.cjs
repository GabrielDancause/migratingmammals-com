const fs = require('fs');

const index = fs.readFileSync('src/pages/index.astro', 'utf8');

let newIndex = index.replace(
  /{ title: "Digital Nomad Cost of Living Index 2026",.*?\},/,
  `{ title: "Digital Nomad Cost of Living Index 2026", subtitle: "42 items · most popular cities", slug: "/cost-of-living-index", stat: "$894", statLabel: "Chiang Mai monthly budget", desc: "Compile cost of living data for 42 popular digital nomad cities. The cheapest city, Da Nang, costs just $870/mo.", tag: "ORIGINAL RESEARCH" },`
);

fs.writeFileSync('src/pages/index.astro', newIndex);
