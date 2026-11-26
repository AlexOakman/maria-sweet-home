export const escapeHtml = (value) => String(value).replace(
  /[&<>"']/g,
  (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
);

const nav = [
  ['works/', 'Работы'],
  ['fillings/', 'Начинки'],
  ['reviews/', 'Отзывы'],
  ['about/', 'О кондитере'],
];

export function createSite({ site, gallery, fillings, reviews, url, assets, counterId, verification }) {
  const path = (route) => url.pathname + route;
  const asset = (file) => path(`assets/${file}`);
  const absolute = (route) => new URL(route, url).href;
  const [wedding, bento] = ['wedding', 'bento'].map((id) => gallery.find((group) => group.id === id));

  function photo(file, alt, { eager = false, priority = false, mobile = true } = {}) {
    if (!assets.has(file)) throw new Error(`Изображение отсутствует: ${file}`);
    const small = file.replace(/\.webp$/, '-480.webp');
    const source = mobile && small !== file && assets.has(small)
      ? `<source media="(max-width: 600px)" srcset="${asset(small)}">`
      : '';
    return `<picture>${source}<img src="${asset(file)}" alt="${escapeHtml(alt)}"${eager ? '' : ' loading="lazy"'}${priority ? ' fetchpriority="high"' : ''} decoding="async"></picture>`;
  }

  function contact(channel, { label, className = '', arrow = false } = {}) {
    const { url: href, label: name } = site.contacts[channel];
    const external = channel === 'instagram' || channel === 'avito';
    return `<a href="${escapeHtml(href)}" data-contact="${channel}" class="${className}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(label ?? name)}${arrow ? '<span aria-hidden="true">↗</span>' : ''}</a>`;
  }

  function link(route, label, className = 'text-link') {
    return `<a class="${className}" href="${path(route)}">${escapeHtml(label)}<span aria-hidden="true">↗</span></a>`;
  }

  function logo() {
    return `<a class="wordmark" href="${path('')}" aria-label="${escapeHtml(site.name)} — главная">
      <span class="wordmark-icon" aria-hidden="true">✿</span>
      <span>Maria <em>Sweet Home</em></span>
    </a>`;
  }

  function header(route) {
    const items = nav.map(([href, label]) =>
      `<a href="${path(href)}"${route === href ? ' aria-current="page"' : ''}>${label}</a>`).join('');
    return `<header class="site-header">
      <div class="shell header-inner">
        ${logo()}
        <nav class="main-nav" aria-label="Основная навигация">${items}</nav>
        ${link('contacts/', 'Контакты', 'button button-small button-outline')}
      </div>
    </header>`;
  }

  function footer() {
    return `<footer class="site-footer">
      <div class="shell footer-inner">
        <div>${logo()}<p>${escapeHtml(site.author)} · ${escapeHtml(site.city)}</p></div>
        <div class="footer-links">
          ${contact('phone')}${contact('instagram')}${contact('avito')}
        </div>
      </div>
    </footer>`;
  }

  function pageIntro(heading, description, parent) {
    return `<header class="page-intro">
        ${parent ? `<a class="back-link" href="${path(parent[0])}">← ${parent[1]}</a>` : ''}
        <h1>${heading}</h1>
        <p>${description}</p>
      </header>`;
  }

  function detailsLink() {
    return `<section class="invitation">
      <div><h2>Обсудим ваш торт?</h2><p>Расскажите о поводе и желаемой дате.</p></div>
      ${contact('max', { label: 'Написать в MAX', className: 'button button-primary', arrow: true })}
    </section>`;
  }

  function categoryCards() {
    return `<div class="category-grid">${[wedding, bento].map((group) => {
      const { image, alt } = group.items[0];
      return `<a class="category-card category-${group.id}" href="${path(`works/${group.id}/`)}">
        <div class="category-image">${photo(image, alt)}</div>
        <div class="category-copy">
          <div><h3>${escapeHtml(group.name)}</h3><p>${escapeHtml(group.summary)}</p></div>
          <span class="round-link" aria-hidden="true">↗</span>
        </div>
      </a>`;
    }).join('')}</div>`;
  }

  function photoGrid(items, variant = '', firstEager = false) {
    return `<div class="photo-grid ${variant}">${items.map(({ image, alt, title }, index) =>
      `<figure class="photo-card">${photo(image, alt, { eager: firstEager && index === 0 })}
        <figcaption>${escapeHtml(title)}</figcaption>
      </figure>`).join('')}</div>`;
  }

  function reviewGrid(entries, id) {
    return `<div class="review-grid">${entries.map(({ image, alt }) =>
      `<a class="review-card" href="${asset(image)}" data-review aria-label="${escapeHtml(alt)}. Увеличить скриншот">
        ${photo(image, alt, { mobile: false })}
        <span aria-hidden="true">Увеличить <span>↗</span></span>
      </a>`).join('')}</div>
      <dialog id="${id}" class="review-dialog" aria-label="Отзыв крупным планом">
        <form method="dialog"><button class="button button-small button-outline" aria-label="Закрыть отзыв">Закрыть ×</button></form>
        <p class="review-hint">Прокрутите изображение, чтобы дочитать отзыв.</p>
        <div class="review-enlargement" tabindex="0"></div>
      </dialog>`;
  }

  function home() {
    return `<div class="shell">
      <section class="hero" aria-labelledby="hero-heading">
        <div class="hero-copy">
          <p class="eyebrow"><span aria-hidden="true">✦</span> Торты на заказ · Краснодар</p>
          <h1 id="hero-heading">Торты для ваших <em>особенных дней</em></h1>
          <p class="hero-description">Свадебные торты, бенто и десерты от Марии Дубинец.</p>
          <div class="hero-actions">
            ${contact('max', { label: 'Обсудить заказ', className: 'button button-primary', arrow: true })}
            ${link('works/', 'Посмотреть работы', 'button button-quiet')}
          </div>
          <p class="hero-motto">${escapeHtml(site.motto)}</p>
        </div>
        <div class="hero-media">
          <div class="hero-photo">${photo(site.hero.image, site.hero.alt, { eager: true, priority: true })}</div>
          <figure class="hero-motion" data-motion>
            ${photo(site.hero.poster, '', { eager: true })}
            <video aria-hidden="true" muted loop playsinline preload="none" data-source="${asset(site.hero.video)}"></video>
            <button class="motion-button" type="button" aria-label="Воспроизвести фоновое видео" hidden><span aria-hidden="true">▶</span></button>
          </figure>
        </div>
      </section>
      <section class="section home-gallery" aria-labelledby="categories">
        <div class="section-heading">
          <h2 id="categories">Выберите свой торт</h2>
          ${link('works/', 'Все работы')}
        </div>
        ${categoryCards()}
      </section>
      <section class="section fillings-teaser" aria-labelledby="taste">
        <div class="teaser-image">${photo(fillings.examples[0].image, fillings.examples[0].alt)}</div>
        <div class="teaser-copy">
          <h2 id="taste">А что внутри?</h2>
          <p>Посмотрите разрезы тортов и варианты начинок. Любимый вкус подберём вместе.</p>
          ${link('fillings/', 'Посмотреть начинки', 'button button-outline')}
        </div>
      </section>
      <section class="section home-reviews" aria-labelledby="opinions">
        <div class="section-heading"><h2 id="opinions">Отзывы</h2>${link('reviews/', 'Все отзывы')}</div>
        ${reviewGrid(reviews.slice(0, 2), 'review-preview')}
      </section>
      ${detailsLink()}
    </div>`;
  }

  function works() {
    return `<div class="shell page">
      ${pageIntro('Торты и десерты', 'Примеры оформления для свадьбы, дня рождения и небольших праздников.')}
      ${categoryCards()}
      ${gallery.filter(({ id }) => id !== wedding.id && id !== bento.id).map((group) => `
        <section class="section" id="${escapeHtml(group.id)}">
          <div class="section-heading stacked"><h2>${escapeHtml(group.name)}</h2><p>${escapeHtml(group.summary)}</p></div>
          ${photoGrid(group.items)}
        </section>`).join('')}
      <section class="section compact-copy"><h2>Другие десерты</h2><p>На заказ также доступны меренговый рулет и макаронс.</p></section>
      ${detailsLink()}
    </div>`;
  }

  function portfolio(group) {
    return `<div class="shell page">
      ${pageIntro(escapeHtml(group.name), escapeHtml(group.summary), ['works/', 'Все работы'])}
      ${photoGrid(group.items, 'portfolio-grid', true)}
      <div class="section-inline">${link('fillings/', 'Посмотреть начинки', 'button button-outline')}</div>
      ${detailsLink()}
    </div>`;
  }

  function fillingsPage() {
    return `<div class="shell page">
      ${pageIntro('Начинки', 'Примеры разрезов и вкусы для бенто. Доступность начинки можно уточнить при заказе.')}
      <ul class="flavours" aria-label="Вкусы для бенто">${fillings.names.map(
        (name) => `<li>${escapeHtml(name)}</li>`).join('')}</ul>
      ${photoGrid(fillings.examples.map((example) => ({ title: 'Пример разреза', ...example })), 'filling-grid', true)}
      ${detailsLink()}
    </div>`;
  }

  function reviewsPage() {
    return `<div class="shell page">
      ${pageIntro('Отзывы', 'Что пишут клиенты Марии на Авито.')}
      ${reviewGrid(reviews, 'review-full')}
      <div class="section-inline">${contact('avito', { label: 'Отзывы на Авито', className: 'button button-outline', arrow: true })}</div>
    </div>`;
  }

  function about() {
    return `<div class="shell page">
      <section class="about-panel">
        <div class="portrait">${photo(site.portrait, 'Чёрно-белый портрет кондитера Марии Дубинец', { eager: true, priority: true })}</div>
        <div class="about-copy">
          <p class="eyebrow">Кондитер · ${escapeHtml(site.city)}</p>
          <h1>${escapeHtml(site.author)}</h1>
          <p>${escapeHtml(site.about)}</p>
          <p class="about-motto">${escapeHtml(site.motto)}</p>
          ${contact('max', { label: 'Написать Марии', className: 'button button-primary', arrow: true })}
        </div>
      </section>
    </div>`;
  }

  function contacts() {
    return `<div class="shell page">
      ${pageIntro('Контакты и заказ', 'Напишите Марии, чтобы обсудить торт и забронировать дату в Краснодаре.')}
      <div class="order-layout">
        <section class="contact-panel">
          <h2>Связаться</h2>
          ${contact('max', { label: 'Обсудить заказ в MAX', className: 'button button-primary', arrow: true })}
          <div class="contact-list">
            ${contact('phone', { arrow: true })}${contact('instagram', { arrow: true })}${contact('avito', { arrow: true })}
          </div>
        </section>
        <section class="order-steps" aria-labelledby="order-heading">
          <h2 id="order-heading">Как заказать</h2>
          <dl>${site.order.map(({ title, text }) => `<div><dt>${escapeHtml(title)}</dt><dd>${escapeHtml(text)}</dd></div>`).join('')}</dl>
        </section>
      </div>
    </div>`;
  }

  const pages = [
    { route: '', title: 'Торты на заказ в Краснодаре', description: 'Свадебные и бенто-торты на заказ в Краснодаре от Марии Дубинец. Примеры работ, начинки, отзывы и контакты.', render: home },
    { route: 'works/', title: 'Торты и десерты в Краснодаре', description: 'Портфолио Марии Дубинец. Свадебные, бенто, детские торты и торты на день рождения.', render: works },
    { route: 'works/wedding/', title: 'Свадебные торты на заказ в Краснодаре', description: 'Многоярусные свадебные торты Марии Дубинец. Посмотрите примеры оформления и обсудите торт для свадьбы.', image: wedding.items[0].image, render: () => portfolio(wedding) },
    { route: 'works/bento/', title: 'Бенто-торты на заказ в Краснодаре', description: 'Бенто-торты Марии Дубинец с индивидуальными надписями и декором. Посмотрите примеры и выберите начинку.', image: bento.items[0].image, render: () => portfolio(bento) },
    { route: 'fillings/', title: 'Начинки для тортов и бенто', description: 'Фотографии разрезов и варианты начинок для бенто-тортов Maria Sweet Home.', render: fillingsPage },
    { route: 'reviews/', title: 'Отзывы о тортах Марии Дубинец', description: 'Отзывы клиентов Maria Sweet Home о тортах на заказ, перенесённые из профиля Авито.', render: reviewsPage },
    { route: 'about/', title: 'Мария Дубинец — кондитер из Краснодара', description: 'Познакомьтесь с Марией Дубинец, автором свадебных и бенто-тортов Maria Sweet Home в Краснодаре.', image: site.portrait, render: about },
    { route: 'contacts/', title: 'Контакты и условия заказа', description: 'Как заказать торт у Марии Дубинец в Краснодаре. Напишите в MAX или позвоните, чтобы обсудить дату, доставку и оформление.', render: contacts },
  ];

  function document(page, { missing = false } = {}) {
    const title = escapeHtml(`${page.title} | ${site.name}`);
    const description = escapeHtml(page.description);
    const canonical = escapeHtml(absolute(page.route));
    const metadata = missing ? '<meta name="robots" content="noindex">' : `
      <link rel="canonical" href="${canonical}">
      <meta property="og:type" content="website">
      <meta property="og:locale" content="ru_RU">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${escapeHtml(absolute(`assets/${page.image ?? site.hero.image}`))}">
      <meta property="og:url" content="${canonical}">`;
    return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${metadata}
  ${verification && page.route === '' ? `<meta name="google-site-verification" content="${escapeHtml(verification)}">` : ''}
  <meta name="theme-color" content="#fcf7ef">
  <link rel="icon" href="${asset('favicon.png')}" type="image/png">
  <link rel="stylesheet" href="${asset('site.css')}">
  <script defer src="${asset('site.js')}"></script>
</head>
<body${counterId ? ` data-metrika="${counterId}"` : ''}>
  <a class="skip-link" href="#main">К содержанию</a>
  ${header(page.route)}
  <main id="main">${page.render()}</main>
  ${footer()}
</body>
</html>`;
  }

  const notFound = {
    route: '404.html',
    title: 'Страница не найдена',
    description: 'Вернитесь на главную страницу Maria Sweet Home.',
    render: () => `<div class="shell page">${pageIntro('Страница не найдена', 'Перейдите на главную или откройте галерею работ.')}${link('', 'На главную', 'button button-primary')}</div>`,
  };

  return { pages, document, notFound };
}
