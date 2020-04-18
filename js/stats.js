
const ITEMS_PER_DATE = 5;
const MAX_DAYS_FOR_UNIQUE = 2;

function formatPct(num) {
  return Math.floor(num * 100) + "%";
}

function getExternalLink(article, isGoogle) {
  let url = `https://en.wikipedia.org/wiki/${article}`;
  if (isGoogle) {
    const query = article.replace(/_/g, "+");
    url = `https://www.google.com/search?q=${query}&tbm=nws`
  }
  const icon = isGoogle ? "fa-google" : "fa-wikipedia-w";
  return `[<a target="_blank" href="${url}"><span class="fa fa-fw ${icon}"></span></a>]`
}

function getArticleLink(id) {
  const plain = id.replace(/_/g, " ");
  const query = id.replace(/_/g, "+");
  return `
  ${plain} ${getExternalLink(id)} ${getExternalLink(id, true)}
  `.trim();
}

function formatDate(d) {
  return moment(d).format("MMM Do, YYYY");
}

function formatDiff(diff) {
  return `
<li>${getArticleLink(diff.article)}: ${formatPct(diff.diff)}</li>
  `
}

function formatDiscovered(disc) {
  return `
<li>${getArticleLink(disc.article)}: ${disc.views}</li>
  `
}

async function main() {
  const views = await loadStats();
  const datesSorted = Object.keys(views).sort();
  datesSorted.reverse();
  const totalViews = {};
  const totalOccurrences = {};
  for (let date in views) {
    for (let art in views[date]) {
      totalViews[art] = totalViews[art] || 0;
      totalOccurrences[art] = totalOccurrences[art] || 0;
      totalViews[art] += views[date][art];
      totalOccurrences[art]++;
    }
  }

  let sorted = [];
  for (let article in totalViews) {
    sorted.push({
      article,
      views: totalViews[article],
      occurrences: totalOccurrences[article],
    });
  }

  sorted = sorted.sort((v1, v2) => {
    return v1.views - v2.views;
  })

  const byArticle = {};
  sorted.forEach(s => {
    s.average = s.views / s.occurrences;
    byArticle[s.article] = s;
  })

  for (let date of datesSorted) {
    let diffs = [];
    let discovered = [];
    for (let article in views[date]) {
      const stats = byArticle[article];
      const diff = (views[date][article] - stats.average) / stats.average;
      diffs.push({diff, article, stats});
      if (stats.occurrences <= MAX_DAYS_FOR_UNIQUE) {
        discovered.push({article, stats, views: views[date][article]});
      }
    }
    diffs = diffs.sort((d1, d2) => d2.diff - d1.diff);
    discovered = discovered.sort((d1, d2) => {
      return d2.views - d1.views;
    })
    console.log(date, diffs.slice(0, 3));
    $(".data").append(`
    <div class="datum">
      <h4 class="date">${formatDate(date)}</h4>
      <div class="trending">
        <h5>Trending</h5>
        <ol>
          ${diffs.slice(0, ITEMS_PER_DATE).map(formatDiff).join('\n')}
        </ol>
      </div>
      <div class="discovered">
        <h5>Discovered</h5>
        <ol>
          ${discovered.slice(0, ITEMS_PER_DATE).map(formatDiscovered).join('\n')}
        </ol>
      </div>
    </div>
    `)
  }
  $(".loading").hide();
}
main();

