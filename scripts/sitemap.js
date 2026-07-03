import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://rezinova-plitka.com.ua';

// В данном SPA (калькуляторе) есть только главная страница и страница Thank You.
// Если в будущем появятся категории, статьи или товары, их URL нужно добавить в этот массив.
const pages = [
  '',
  '/thank-you'
];

const generateSitemap = () => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  const date = new Date().toISOString().split('T')[0];

  pages.forEach((page) => {
    // Основная (украинская) версия
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${page}</loc>\n`;
    xml += `    <lastmod>${date}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
    // Указание альтернативной версии для SEO
    xml += `    <xhtml:link rel="alternate" hreflang="ru" href="${BASE_URL}/ru${page}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="uk" href="${BASE_URL}${page}" />\n`;
    xml += `  </url>\n`;

    // Альтернативная (русская) версия
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/ru${page}</loc>\n`;
    xml += `    <lastmod>${date}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
    // Указание альтернативной версии для SEO
    xml += `    <xhtml:link rel="alternate" hreflang="ru" href="${BASE_URL}/ru${page}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="uk" href="${BASE_URL}${page}" />\n`;
    xml += `  </url>\n`;
  });

  xml += '</urlset>\n';

  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
  console.log('Sitemap successfully generated with /ru localized URLs!');
};

generateSitemap();
