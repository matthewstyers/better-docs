const path = require('path');
const env = require('jsdoc/env');
const fs = require('jsdoc/fs');
const helper = require('jsdoc/util/templateHelper');

module.exports = function createGenerate(outdir, view) {
  return function generate(title, subtitle, docs, filename, resolveLinks) {
    const docData = {
      env: env,
      title: title,
      subtitle: subtitle,
      docs: docs
    };

    const outpath = path.join(outdir, filename);
    let html;

    resolveLinks = resolveLinks !== false;

    html = view.render('container.tmpl', docData);

    if (resolveLinks) {
      html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
    }

    fs.writeFileSync(outpath, html, 'utf8');
  };
};
