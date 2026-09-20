'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src');
const out = path.join(root, 'dist');
const canonicalRoot = 'https://edricgan.dev';

function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(function (name) {
    const item = path.join(dir, name);
    const stat = fs.lstatSync(item);
    if (stat.isDirectory()) removeDir(item);
    else fs.unlinkSync(item);
  });
  fs.rmdirSync(dir);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(function (name) {
    const source = path.join(from, name);
    const target = path.join(to, name);
    if (fs.statSync(source).isDirectory()) copyDir(source, target);
    else fs.copyFileSync(source, target);
  });
}

function write(route, html) {
  const destination = route === '/' ? path.join(out, 'index.html') : path.join(out, route, 'index.html');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, html, 'utf8');
}

removeDir(out);
fs.mkdirSync(out, { recursive: true });

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(value + 'T00:00:00Z'));
}

function nav(active) {
  const items = [
    ['work', '/work/', 'Work'],
    ['projects', '/projects/', 'Projects'],
    ['coaching', '/coaching/', 'Coaching'],
    ['writing', '/articles/', 'Writing']
  ];
  return '<header class="masthead"><div class="wide masthead__inner">' +
    '<a class="brand" href="/" aria-label="Edric Gan, home"><img src="/assets/profile.jpg" alt="" width="32" height="32"><strong>Edric Gan</strong></a>' +
    '<button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav">Menu</button>' +
    '<nav class="nav" id="site-nav" data-nav aria-label="Main navigation">' +
    items.map(function (item) {
      return '<a href="' + item[1] + '"' + (active === item[0] ? ' aria-current="page"' : '') + '>' + item[2] + '</a>';
    }).join('') +
    '<a href="/#contact">Contact</a></nav></div></header>';
}

function footer() {
  return '<footer class="footer"><div class="wide footer__inner">' +
    '<span>© 2026 Edric Gan · Singapore</span>' +
    '<span><a href="mailto:edricgan.44@gmail.com">Email</a> · <a href="https://x.com/edricgsh" rel="me">X</a> · <a href="https://www.linkedin.com/in/edricgan/" rel="me">LinkedIn</a></span>' +
    '</div></footer>';
}

function shell(options) {
  const title = options.title === 'Edric Gan' ? 'Edric Gan — Builder, AI products, and fintech' : options.title + ' — Edric Gan';
  const url = canonicalRoot + (options.route === '/' ? '/' : '/' + options.route.replace(/^\//, '').replace(/\/$/, ''));
  const jsonLd = options.jsonLd ? '<script type="application/ld+json">' + JSON.stringify(options.jsonLd) + '</script>' : '';
  return '<!doctype html><html lang="en"><head>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(title) + '</title><meta name="description" content="' + esc(options.description) + '">' +
    '<link rel="canonical" href="' + esc(url) + '"><meta name="theme-color" content="#FBFAF7">' +
    '<meta property="og:type" content="' + (options.type || 'website') + '"><meta property="og:title" content="' + esc(title) + '">' +
    '<meta property="og:description" content="' + esc(options.description) + '"><meta property="og:url" content="' + esc(url) + '">' +
    '<meta property="og:image" content="' + canonicalRoot + '/assets/og-preview.jpg"><meta name="twitter:card" content="summary_large_image">' +
    (options.published ? '<meta property="article:published_time" content="' + esc(options.published) + '">' : '') +
    '<link rel="icon" href="/assets/profile.jpg"><link rel="preconnect" href="https://fonts.googleapis.com">' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500&display=swap" rel="stylesheet">' +
    '<link rel="stylesheet" href="/styles.css">' + jsonLd + '</head><body>' +
    '<a class="skip-link" href="#main">Skip to content</a>' + nav(options.active) +
    '<main id="main">' + options.body + '</main>' + footer() + '<script src="/app.js" defer></script></body></html>';
}

function sectionHead(index, title, link, linkText) {
  return '<div class="section-head"><div class="section-head__title"><span>' + index + '</span><h2>' + title + '</h2></div>' +
    (link ? '<a href="' + link + '">' + linkText + ' →</a>' : '') + '</div>';
}

function row(title, text, meta, stack, link) {
  const heading = link ? '<a href="' + link + '">' + title + '</a>' : title;
  return '<li><div class="row"><div><h3>' + heading + '</h3><p>' + text + '</p>' +
    (stack ? '<div class="stack">' + stack + '</div>' : '') + '</div>' +
    (meta ? '<span class="meta">' + meta + '</span>' : '') + '</div></li>';
}

const manifest = JSON.parse(fs.readFileSync(path.join(src, 'articles', 'manifest.json'), 'utf8'));
const articleSummaries = {
  'discords-database-evolution-scaling': 'How Discord moved from MongoDB to Cassandra and ScyllaDB, then reduced hot partitions with a new data service.',
  'from-zero-coding-experience-to-software': 'How I moved from electrical engineering into software through small projects, practice, and steady job applications.',
  'navigating-tech-job-interviews-in': 'A practical guide to coding tests, system design, and behavioural interviews.',
  'my-path-to-securing-tech-jobs-2023': 'The steps I used to find a role in a difficult market, and the lessons that helped most.',
  'unlocking-the-power-of-productivity': 'A simple framework for choosing the right work and finishing it with less waste.',
  'singapore-flat-price-predictor': 'A Singapore resale-flat model that used MLflow and stacking to beat the baseline by 15%.',
  'spam-filtering-system-with-deep-learning': 'A spam filter built with GloVe embeddings and a bidirectional GRU.',
  'how-to-design-a-spam-filtering-system': 'A step-by-step spam classifier, with the right metrics for an imbalanced dataset.'
};

function articleCredit(article) {
  return article.publication === 'Towards Data Science' ? '<span class="publication">Towards Data Science</span>' : '';
}

function articleList(limit) {
  const items = typeof limit === 'number' ? manifest.slice(0, limit) : manifest;
  return '<ol class="writing-list">' + items.map(function (article) {
    const mins = Math.max(1, Math.ceil(article.body_words / 220));
    return '<li><span class="meta date">' + formatDate(article.date) + '</span><div><h3><a href="/articles/' + article.slug + '/">' + esc(article.title) + '</a></h3>' + articleCredit(article) + '</div><span class="meta">' + mins + ' min</span></li>';
  }).join('') + '</ol>';
}

const personLd = {
  '@context': 'https://schema.org', '@type': 'Person', name: 'Edric Gan', url: canonicalRoot,
  jobTitle: 'Builder and Tech Lead', address: { '@type': 'PostalAddress', addressCountry: 'SG' },
  sameAs: ['https://x.com/edricgsh', 'https://www.linkedin.com/in/edricgan/', 'https://github.com/edricgsh']
};

const home = '<div class="col"><section class="hero">' +
  '<p class="eyebrow">Builder · Tech lead · Singapore</p>' +
  '<h1>I build useful products. Today, most of them use AI.</h1>' +
  '<p class="hero__lede">I turn new ideas into working systems. I also help engineers grow into senior roles.</p>' +
  '<p class="hero__note">Eight years across fintech, payments, Web3, and product engineering. I built products at Visa, Ant Group, Immutable, and startups.</p>' +
  '<div class="hero__actions"><a class="btn btn--primary" href="/projects/">See what I built</a><a class="btn btn--secondary" href="/coaching/">Work with me</a></div>' +
  '<dl class="metrics"><div class="metric"><dt>Experience</dt><dd>8 years</dd></div><div class="metric"><dt>NFTs moved</dt><dd>250K+</dd></div><div class="metric"><dt>Daily payments</dt><dd>1M+</dd></div><div class="metric"><dt>People trained</dt><dd>100+</dd></div></dl>' +
  '</section>' +
  '<section class="section">' + sectionHead('01', 'Now') + '<ul class="rows">' +
    row('AI Tech Advisor for a social media platform <span class="live" aria-label="Live"></span>', 'It connects to four major social platforms. LangGraph and n8n coordinate AI, automation, image, and video workflows.', '', 'LANGGRAPH · N8N · HIGGSFIELD · FAL · GROK · NANO BANANA') +
    row('Lingooso <span class="live" aria-label="Live"></span>', 'It turns YouTube videos into lessons. AI creates useful practice and engaging shorts for small, consistent learning sessions.', '', 'AI PRACTICE · LEARNING SHORTS · SPACED REPETITION', 'https://www.lingooso.com/') +
    row('Coaching engineers', 'I have coached engineers and trained more than 100 adult learners. I focus on system design, backend work, AI, and career growth.', '', '', '/coaching/') +
  '</ul></section>' +
  '<section class="section">' + sectionHead('02', 'Selected projects', '/projects/', 'All projects') + '<ul class="rows">' +
    row('AI Tech Advisor', 'I advise the team on agent design, automation, social integrations, and multi-provider media pipelines.', 'LIVE · 4 MAJOR PLATFORMS', 'LANGGRAPH · N8N · MULTI-PROVIDER IMAGES · VIDEO GENERATION', '/projects/#ai-platform') +
    row('Lingooso', 'AI turns one YouTube link into vocabulary, practice, quizzes, and engaging shorts for steady, bite-sized learning.', 'LIVE · 60+ EARLY USERS', 'AI PRACTICE · LEARNING SHORTS · SM-2 · 10 LANGUAGES', '/projects/#lingooso') +
    row('Applied machine learning', 'Prediction and classification projects with measured results, experiment tracking, and model comparison.', '15% OVER BASELINE', 'MLFLOW · XGBOOST · GLOVE · BIDIRECTIONAL GRU', '/projects/#data-science') +
  '</ul></section>' +
  '<section class="section">' + sectionHead('03', 'Work', '/work/', 'Full history') + '<ul class="rows">' +
    row('Tech Lead · Fintech startup', 'I lead a six-person team and work on card-issuing transactions that process millions of dollars each month.', 'APR 2025 — NOW') +
    row('Immutable', 'Moved 250K+ NFTs in five hours. Cut migration costs by 40%.', '2023 — 2025') +
    row('Ant Group', 'Led ten engineers to launch a bank\'s first fixed-deposit product. It brought in millions in deposits in its first month.', '2020 — 2023') +
    row('Visa', 'Built a campaign platform for millions of cardholders. Cut campaign setup time by 70%.', '2018 — 2020') +
  '</ul></section>' +
  '<section class="section">' + sectionHead('04', 'Coaching & training', '/coaching/', 'How I help') + '<ul class="rows">' +
    '<li><div class="row"><div><h3>One-to-one coaching</h3><p>Clear plans for system design, backend skills, AI work, interviews, and the move to senior roles.</p><blockquote class="quote">“Edric is very good at understanding my needs and managed to exceed expectations every time.”<cite>— Pierre-Edouard, coached for two years</cite></blockquote></div><span class="meta">100+ PEOPLE TRAINED</span></div></li>' +
    row('Technical training', 'I trained 100+ adult learners across four cohorts in React, Java, CI/CD, and information security.', 'LEAD INSTRUCTOR') +
  '</ul></section>' +
  '<section class="section">' + sectionHead('05', 'Writing', '/articles/', 'All 8 articles') + articleList(4) + '</section>' +
  '<section class="contact-block" id="contact"><div class="contact-block__inner"><p class="eyebrow">Work together</p><h2>Building or backing an ambitious product?</h2><p>I work with founders, investors, and engineering teams to assess technical opportunities, shape AI products, and turn complex plans into working systems.</p><div class="actions"><a class="btn btn--primary" href="mailto:edricgan.44@gmail.com">Discuss an opportunity</a><a class="btn btn--secondary" href="/projects/">See selected work</a></div></div></section></div>';

write('/', shell({ title: 'Edric Gan', route: '/', active: '', description: 'Edric Gan builds AI and fintech products, leads engineering teams, and coaches engineers.', body: home, jsonLd: personLd }));

const projects = '<div class="wide"><header class="page-head prose-width"><p class="eyebrow">Projects</p><h1>Selected products and systems.</h1><p>I work across product, backend, frontend, AI, and delivery. These projects show the range.</p></header>' +
  '<section class="section case-grid">' +
  '<article class="case-study case-study--featured" id="ai-platform"><div class="case-study__copy"><p class="eyebrow">Current · AI Tech Advisor</p><h2>AI platform for social media</h2><p class="case-study__dek">One workflow to plan, create, review, and publish social content.</p><ul class="case-study__facts"><li><strong>4</strong><span>major social platforms</span></li><li><strong>4+</strong><span>image providers</span></li><li><strong>Image + video</strong><span>generation pipelines</span></li></ul><div class="case-study__body"><p>I advise the team on AI architecture, agent workflows, product integrations, and delivery.</p><ul class="impact-list"><li><strong>Agent orchestration:</strong> LangGraph manages multi-step content generation, tool use, and review flows.</li><li><strong>Workflow automation:</strong> n8n connects services and runs repeat jobs outside the main application.</li><li><strong>Media routing:</strong> Higgsfield, fal, Grok, Nano Banana, and other providers support image work. A separate pipeline handles video generation.</li><li><strong>Publishing:</strong> The product connects with Facebook, Instagram, X, and LinkedIn.</li><li><strong>Marketing workflow:</strong> Brand context, drafts, approvals, scheduling, and analytics live in one place.</li></ul><p>This architecture reduces manual marketing work. It also lets the team compare models, control costs, and add providers without rebuilding the product.</p></div><div class="stack">LANGGRAPH · N8N · NEXT.JS · VERCEL · HIGGSFIELD · FAL · GROK · NANO BANANA · VIDEO GENERATION</div></div></article>' +
  '<article class="case-study" id="lingooso"><div><p class="eyebrow">Current · Live</p><h2>Lingooso</h2><p class="case-study__dek">Turn any YouTube video into practice you can use every day.</p><ul class="case-study__facts"><li><strong>60+</strong><span>early users</span></li><li><strong>10</strong><span>languages</span></li><li><strong>AI</strong><span>practice and shorts</span></li></ul><div class="case-study__body"><p>Lingooso creates vocabulary, flashcards, quizzes, synced reading, and short practice videos from real content. AI explains each word in context and generates useful exercises.</p><p>Engaging, bite-sized shorts help learners practice often without a long study session. Spaced repetition brings each word back at the right time.</p><p>More than 60 early users are testing the product and shaping what comes next.</p></div><div class="actions"><a class="btn btn--secondary" href="https://www.lingooso.com/">Visit Lingooso</a></div><div class="stack">AI PRACTICE · LEARNING SHORTS · VIDEO PROCESSING · SM-2 · TEXT TO SPEECH · ANALYTICS</div></div><figure class="case-study__media"><img src="/assets/lingooso.jpg" alt="Lingooso language lesson product preview" loading="lazy"><figcaption>Language lessons built from YouTube content.</figcaption></figure></article>' +
  '<article class="case-study" id="teammates"><div><p class="eyebrow">Open source</p><h2>TEAMMATES</h2><p class="case-study__dek">A peer feedback platform used by universities.</p><div class="case-study__body"><p>I contributed to a mature open-source product with a large user base and an established engineering process.</p><p>The work strengthened my skills in shared code ownership, review, and safe changes.</p></div><div class="actions"><a class="btn btn--secondary" href="https://github.com/TEAMMATES/teammates">View the repository</a></div></div><figure class="case-study__media"><img src="/assets/teammates.png" alt="TEAMMATES open-source project" loading="lazy"><figcaption>Peer feedback for teaching teams and students.</figcaption></figure></article>' +
  '<article class="case-study" id="data-science"><div><p class="eyebrow">Data science</p><h2>Prediction and spam detection</h2><p class="case-study__dek">Three projects that move from data checks to measured model results.</p><ul class="case-study__facts"><li><strong>15%</strong><span>over baseline</span></li><li><strong>3</strong><span>stacked models</span></li><li><strong>2</strong><span>spam approaches</span></li></ul><div class="case-study__body"><p>The flat-price model uses MLflow and a stack of random forest, Elastic Net, and XGBoost. It beat the baseline by 15%.</p><p>The spam work compares classic machine learning with GloVe embeddings and a bidirectional GRU.</p></div><div class="actions"><a class="btn btn--secondary" href="/articles/singapore-flat-price-predictor/">Read the case study</a></div></div><figure class="case-study__media"><img src="/assets/hdb.jpg" alt="Singapore flat price prediction interface" loading="lazy"><figcaption>Experiment tracking and model stacking for flat prices.</figcaption></figure></article>' +
  '</section></div>';

write('projects', shell({ title: 'Projects', route: '/projects/', active: 'projects', description: 'AI products, fintech systems, open source work, and data science projects built by Edric Gan.', body: projects }));

const work = '<div class="col"><header class="page-head"><p class="eyebrow">Work</p><h1>Eight years of systems, products, and teams.</h1><p>I build software that moves money, assets, and ideas. The numbers below come from shipped work.</p></header><section class="section"><ol class="timeline">' +
  '<li><div class="timeline__date">Apr 2025 — now</div><div class="timeline__body"><h2>Fintech startup</h2><p class="role">TECH LEAD</p><ul><li>Lead a six-person engineering team.</li><li>Work with the card-issuing transaction team.</li><li>Support systems that process millions of dollars each month.</li></ul></div></li>' +
  '<li><div class="timeline__date">Aug 2023 — Apr 2025</div><div class="timeline__body"><h2>Immutable</h2><p class="role">FULL STACK WEB3 ENGINEER</p><ul><li>Moved more than 250,000 NFTs between protocols in five hours.</li><li>Cut migration cost by 40% with gas work and batching.</li><li>Cut partner integration time from 12 weeks to 8 weeks.</li><li>Helped three gaming partners launch.</li></ul></div></li>' +
  '<li><div class="timeline__date">Dec 2022 — Aug 2023</div><div class="timeline__body"><h2>Ant Group · digital wholesale bank</h2><p class="role">TECH LEAD</p><ul><li>Led ten engineers to launch the bank\'s first fixed-deposit product.</li><li>Built an interest engine and tools for three product variants.</li><li>The launch brought in millions in deposits in its first month.</li><li>Improved delivery predictability by 40% and cut incidents by 60%.</li></ul></div></li>' +
  '<li><div class="timeline__date">Feb 2020 — Dec 2022</div><div class="timeline__body"><h2>Ant Group · payments</h2><p class="role">SENIOR SOFTWARE ENGINEER</p><ul><li>Moved millions of accounts and funds with no downtime.</li><li>Reached a 99.99% migration success rate.</li><li>Kept payment processing live for more than one million daily transactions.</li><li>Delivered 100% uptime during major sales campaigns.</li></ul></div></li>' +
  '<li><div class="timeline__date">Jun 2018 — Feb 2020</div><div class="timeline__body"><h2>Visa</h2><p class="role">SOFTWARE ENGINEER</p><ul><li>Built a campaign platform for millions of cardholders.</li><li>Cut campaign setup time by 70%.</li><li>Set the test plan for more than eight services.</li><li>Reached 90% test coverage and cut regression issues by 60%.</li></ul></div></li>' +
  '<li><div class="timeline__date">2014 — 2018</div><div class="timeline__body"><h2>Nanyang Technological University</h2><p class="role">BENG · ELECTRICAL AND ELECTRONIC ENGINEERING</p><ul><li>First Class Honours, Highest Distinction.</li><li>Dean\'s List, 2014/15.</li><li>CGPA 4.61 out of 5.</li></ul></div></li>' +
  '</ol></section><section class="contact-block"><div class="contact-block__inner"><p class="eyebrow">Work together</p><h2>Technical leadership from plan to production.</h2><p>I help founders and teams make sound technical choices, lead delivery, and stay close enough to the code to ship.</p><div class="actions"><a class="btn btn--primary" href="mailto:edricgan.44@gmail.com">Discuss an opportunity</a><a class="btn btn--secondary" href="/projects/">See projects</a></div></div></section></div>';

write('work', shell({ title: 'Work', route: '/work/', active: 'work', description: 'Edric Gan has eight years of experience across fintech, payments, Web3, and technical leadership.', body: work }));

const coaching = '<div class="col"><header class="page-head"><p class="eyebrow">Coaching & training</p><h1>Clear steps for hard technical and career problems.</h1><p>I help engineers move up. I also help teams build stronger backend, cloud, and delivery skills.</p><dl class="metrics"><div class="metric"><dt>People trained</dt><dd>100+</dd></div><div class="metric"><dt>Cohorts taught</dt><dd>4</dd></div><div class="metric"><dt>Longest coaching</dt><dd>2 years</dd></div><div class="metric"><dt>Outcomes</dt><dd>New roles + promotions</dd></div></dl></header>' +
  '<section class="section"><div class="service-grid"><article class="service"><span class="label">For engineers</span><h2>One-to-one coaching</h2><p>A plan built around your role, gaps, and next step.</p><ul><li>System design and backend engineering</li><li>AI agents and product delivery</li><li>Interview practice and job search</li><li>Leadership and the move to senior roles</li><li>One 60-minute call and ongoing chat</li></ul><div class="actions"><a class="btn btn--primary" href="https://mentorcruise.com/mentor/edricgan/">Book a free intro call</a></div></article>' +
  '<article class="service"><span class="label">For teams</span><h2>Training and technical advice</h2><p>Practical sessions based on the systems your team has to run.</p><ul><li>Backend performance and system design</li><li>Cloud, Docker, Kubernetes, and CI/CD</li><li>Test-driven development</li><li>AI product strategy and delivery</li><li>Delivery process for growing teams</li></ul><div class="actions"><a class="btn btn--secondary" href="mailto:edricgan.44@gmail.com">Ask about team work</a></div></article></div></section>' +
  '<section class="section">' + sectionHead('01', 'Results') + '<ul class="rows"><li><div class="row"><div><h3>Landed a role at Ant Group International</h3><p>One engineer reached this goal after a year of backend work and interview practice.</p><blockquote class="quote">“Edric structured learning projects that helped me grasp core concepts.”<cite>— Ying Xuan, coached for one year</cite></blockquote></div><span class="meta">CAREER MOVE</span></div></li>' +
  row('Moved from QA into software engineering', 'A two-year plan used code reviews, small projects, and interview practice.', 'ROLE CHANGE') +
  row('100+ adult learners trained', 'Courses covered React, Java, CI/CD, information security, and career skills.', '4 COHORTS') +
  row('Promoted to senior engineer', 'One client reached a senior role after focused coaching on technical growth and leadership.', 'PROMOTION') +
  '</ul></section><section class="contact-block"><div class="contact-block__inner"><p class="eyebrow">First step</p><h2>Bring one goal. Leave with a clear next move.</h2><p>The intro call is free. We will check the fit and define the first useful step.</p><div class="actions"><a class="btn btn--primary" href="https://mentorcruise.com/mentor/edricgan/">Book a free intro call</a><button class="btn btn--secondary" type="button" data-copy-email>Copy email</button></div></div></section></div>';

write('coaching', shell({ title: 'Coaching', route: '/coaching/', active: 'coaching', description: 'Technical coaching and training for engineers and teams, built on experience helping more than 100 learners.', body: coaching }));

const articlesIndex = '<div class="col"><header class="page-head"><p class="eyebrow">Writing</p><h1>Notes on systems, careers, and applied machine learning.</h1><p>Eight articles and 15,995 words. Every article lives here and opens as a real web page.</p></header><section class="section">' + articleList() + '</section></div>';

write('articles', shell({ title: 'Writing', route: '/articles/', active: 'writing', description: 'Eight articles by Edric Gan on system design, software careers, productivity, and machine learning.', body: articlesIndex }));

function cleanArticleBody(html, slug) {
  let body = html
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<\/?html[^>]*>/gi, '')
    .replace(/<\/?body[^>]*>/gi, '')
    .replace(/\.\/assets\/articles\//g, '/assets/articles/')
    .replace(/<p><em>Thank you for taking the time to read and support this newsletter\.<\/em><\/p>/gi, '')
    .replace(/<p><em>If you[^<]*support[^<]*<\/em><\/p>/gi, '')
    .replace(/<div><pre>404: Not Found<\/pre><figcaption><a href="([^"]+)">[^<]+<\/a><\/figcaption><\/div>/gi, '<p><a href="$1">View the original code</a>.</p>')
    .replace(/https:\/\/github\.com\/huai99\/Email-Spam-Detection-Python\/blob\/master\/Email%20Spam%20\(%20Medium%20Part%202\)\.ipynb/gi, 'https://github.com/huai99/Email-Spam-Detection-Python')
    .replace(/<h3/gi, '<h4').replace(/<\/h3>/gi, '</h4>')
    .replace(/<h2/gi, '<h3').replace(/<\/h2>/gi, '</h3>')
    .replace(/<h1/gi, '<h2').replace(/<\/h1>/gi, '</h2>')
    .replace(/<a([^>]*target="_blank"[^>]*)>/gi, function (_, attrs) {
      return '<a' + attrs.replace(/\srel="[^"]*"/i, '') + ' rel="noopener noreferrer">';
    })
    .replace(/<img(?![^>]*\salt=)([^>]*)>/gi, '<img alt=""$1>')
    .replace(/<img(?![^>]*\sloading=)([^>]*)>/gi, '<img loading="lazy"$1>');
  if (slug === 'spam-filtering-system-with-deep-learning') {
    body = body.replace(/href="\/articles\/spam-filtering-system-with-deep-learning\/?"/g, 'href="/articles/how-to-design-a-spam-filtering-system/"');
  }
  return body;
}

manifest.forEach(function (article, index) {
  const mins = Math.max(1, Math.ceil(article.body_words / 220));
  const summary = articleSummaries[article.slug] || article.summary || 'An article by Edric Gan.';
  const raw = fs.readFileSync(path.join(src, 'articles', article.slug + '.html'), 'utf8');
  const bodyHtml = cleanArticleBody(raw, article.slug);
  const previous = index > 0 ? manifest[index - 1] : null;
  const next = index < manifest.length - 1 ? manifest[index + 1] : null;
  const articlePage = '<div class="col"><header class="article-head"><a class="route-back" href="/articles/">← All writing</a><h1>' + esc(article.title) + '</h1><p class="article-head__summary">' + esc(summary) + '</p><div class="article-head__meta"><span class="meta">' + formatDate(article.date) + '</span><span class="meta">' + mins + ' min read</span>' + (article.publication === 'Towards Data Science' ? '<span class="meta">Towards Data Science</span>' : '') + '</div></header>' +
    '<article class="article-body">' + bodyHtml + '</article><nav class="article-pager" aria-label="Article navigation"><span>' + (previous ? '<a href="/articles/' + previous.slug + '/">← Newer</a>' : '<a href="/articles/">← All writing</a>') + '</span><span>' + (next ? '<a href="/articles/' + next.slug + '/">Older →</a>' : '<a href="/articles/">All writing →</a>') + '</span></nav></div>';
  const articleLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: article.title,
    datePublished: article.date, dateModified: article.date,
    author: { '@type': 'Person', name: 'Edric Gan', url: canonicalRoot },
    mainEntityOfPage: canonicalRoot + '/articles/' + article.slug,
    description: summary, wordCount: article.body_words
  };
  write(path.join('articles', article.slug), shell({ title: article.title, route: '/articles/' + article.slug + '/', active: 'writing', description: summary, type: 'article', published: article.date, body: articlePage, jsonLd: articleLd }));
});

const notFound = '<div class="col not-found"><p class="eyebrow">404</p><h1>That page is not here.</h1><p>The link may be old. The work, projects, coaching, and writing are all still available.</p><div class="actions"><a class="btn btn--primary" href="/">Go home</a><a class="btn btn--secondary" href="/articles/">Read the articles</a></div></div>';
fs.writeFileSync(path.join(out, '404.html'), shell({ title: 'Page not found', route: '/404', description: 'Page not found.', body: notFound }), 'utf8');

copyDir(path.join(src, 'assets'), path.join(out, 'assets'));
fs.copyFileSync(path.join(src, 'styles.css'), path.join(out, 'styles.css'));
fs.copyFileSync(path.join(src, 'app.js'), path.join(out, 'app.js'));
fs.writeFileSync(path.join(out, 'CNAME'), 'edricgan.dev\n', 'utf8');
fs.writeFileSync(path.join(out, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + canonicalRoot + '/sitemap.xml\n', 'utf8');

const urls = ['/', '/work/', '/projects/', '/coaching/', '/articles/'].concat(manifest.map(function (article) { return '/articles/' + article.slug + '/'; }));
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(function (url) {
  return '  <url><loc>' + canonicalRoot + (url === '/' ? '/' : url) + '</loc></url>';
}).join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(out, 'sitemap.xml'), sitemap, 'utf8');

console.log('Built ' + (urls.length + 1) + ' HTML pages in ' + out);
