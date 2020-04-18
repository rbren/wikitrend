const BASE_URL = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/`;

async function getStatsForDay(day) {
  const str = day.format("YYYY/MM/DD");
  const cached = localStorage.getItem(str);
  if (cached) return JSON.parse(cached);

  console.log(str);
  const resp = await axios.get(BASE_URL + str);
  const stats = resp.data.items[0].articles;
  const map = {};
  stats.forEach(stat => {
    map[stat.article] = stat.views;
  })
  return map;
}

const yesterday = moment();
const start = yesterday.clone().subtract(1, 'year');
console.log(start, yesterday);

let current = start.clone();
window.allStats = {};

async function loadStats() {
  while (current.isBefore(yesterday)) {
    const stats = await getStatsForDay(current);
    allStats[current.format("YYYYMMDD")] = stats;
    current.add(1, 'day');
  }
  return allStats;
}