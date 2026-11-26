export const port = Number(process.env.PORT || 4173);
export const siteUrl = new URL(process.env.SITE_URL || `http://127.0.0.1:${port}/`);

if (!['http:', 'https:'].includes(siteUrl.protocol) || siteUrl.search || siteUrl.hash || siteUrl.username || siteUrl.password) {
  throw new Error('SITE_URL должен содержать HTTP(S)-адрес сайта без параметров и учётных данных.');
}
if (!siteUrl.pathname.endsWith('/')) siteUrl.pathname += '/';

export const counterId = (process.env.METRIKA_COUNTER_ID || '').trim();
export const verification = (process.env.GOOGLE_SITE_VERIFICATION || '').trim();

if (counterId && !/^[1-9][0-9]{0,14}$/.test(counterId)) {
  throw new Error('METRIKA_COUNTER_ID должен содержать номер счётчика, например 12345678.');
}
if (verification && !/^[a-zA-Z0-9_-]+$/.test(verification)) {
  throw new Error('GOOGLE_SITE_VERIFICATION должен содержать значение атрибута content из метатега.');
}
