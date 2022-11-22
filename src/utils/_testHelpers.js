const { jsdom } = require('jsdom/lib/old-api');

exports.jsdomHelper = html => {
  if (typeof document !== 'undefined') {
    return;
  }
  global.document = jsdom(html || '');
  global.window = global.document.defaultView;
  global.navigator = { userAgent: 'JSDOM' };
};
