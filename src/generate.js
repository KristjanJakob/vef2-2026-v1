import fs from 'node:fs/promises'

const MAX_QUESTIONS_PER_CATEGORY = 100

/**
 * 
 * @param {number} line 
 * @returns 
 */
function parseLine(line){
  const split = line.split(",");
    
    const categoryNumber = split[0];
    const subCategory = split[1];
    const difficulty = split[2];
    const quality = split[3];
    const question = split[4];
    const answer = split[5];

    const q = {
      categoryNumber,
      subCategory,
      difficulty,
      quality,
      question,
      answer 
    }
    return q
}

/** Groupa spurningar eftir flokkum **/
function groupByCategory(questions) {
  const map = new Map();

  for (const q of questions){
    const category = q.subCategory;

    if(!category || category.trim() === '') {
      continue;
    }
    else if(!map.has(category)) {
      map.set(category,[]);
    }
    map.get(category).push(q);
  }
  return map;
}

/** Breyta heiti í slug**/
function slugify(name){
  const mapping = {
    'ð': 'd', 'Ð': 'D',
    'þ': 'th', 'Þ': 'Th',
    'æ': 'ae', 'Æ': 'Ae',
    'ö': 'o', 'Ö': 'O' // or 'oe' based on preference
  };

  return name
    .toString()
    .toLowerCase()
    .trim()
    // 1. Replace Icelandic specific characters
    .replace(/[ðÐþÞæÆöÖ]/g, (match) => mapping[match])
    // 2. Remove accent marks (á->a, é->e, etc.)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // 3. Remove any remaining non-alphanumeric characters
    .replace(/[^a-z0-9 -]/g, '')
    // 4. Replace spaces and special characters with dashes
    .replace(/\s+/g, '-')
    // 5. Remove multiple consecutive dashes
    .replace(/-+/g, '-');
}

function generateQuestionHtml(q){
  const html = `
  <section>
    <h3>${q.question}</h3>
    <details>
      <summary>Sýna svar</summary>
      <p>${q.answer}</p>
      <div class="actions">
        <button class="rett">Rétt</button>
        <button class="rangt">Rangt</button>
      </div>
    </details>
  </section>
  `;
  return html
}

function pageTemplate({title, contentHtml}) {
  return `<!doctype html>
  <html lang="is">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    <main class="container">
      <header>
        <h1>${title}</h1>
        <nav><a href="./index.html">Forsíða</a></nav>
      </header>

      <div>
        Rétt: <span id="correct">0</span> |
        Rangt: <span id="wrong">0</span>
      </div>

      ${contentHtml}

    </main>
    <script src="./scripts.js"></script>
  </body>
  </html>`;
}

function isValidQuestion(q) {
  return Boolean(q.question != null && q.answer != null && q.subCategory != null);
}

function applyFilters(q){
  return q.quality === '3';
}


async function main() {
  const content = await fs.readFile('./questions.csv','utf-8');

  const lines = content.split('\n');

  const questions = lines.map(parseLine);
    
  const filteredQuestions = questions
  .filter(isValidQuestion).filter(applyFilters);

  const categoryMap = groupByCategory(filteredQuestions);

  for (const [categoryName, qs] of categoryMap.entries()) {
    const slug = slugify(categoryName);
    const contentHtml = qs.slice(0, MAX_QUESTIONS_PER_CATEGORY)
    .map(generateQuestionHtml).join('\n');
  
    const pageHtml = pageTemplate({title: categoryName, contentHtml});
    const path = `./dist/${slug}.html`;

    await fs.writeFile(path, pageHtml, 'utf-8');
  }
  const categories = Array.from(categoryMap.keys());

  const linkarHtml = categories
    .map((categoryName) => {
      const slug = slugify(categoryName);
      return `<li><a href="./${slug}.html">${categoryName}</a></li>`;
    }).join('\n');

  const indexHtml = `
    <p>Veldu flokk til að sjá spurningar.</p>
    <ul>
      ${linkarHtml}
    </ul>  
  `;

  const indexPageHtml = pageTemplate({
    title: 'Forsíða',
    contentHtml: indexHtml,
  })

  await fs.writeFile('./dist/index.html', indexPageHtml, 'utf-8');
}

main().catch((error) => {
  console.error('error generating', error);
});
