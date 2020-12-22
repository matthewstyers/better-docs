const helper = require('jsdoc/util/templateHelper');

module.exports = function hashToLink(doclet, hash) {
  let url;

  if (!/^(#.+)/.test(hash)) { return hash; }

  url = helper.createLink(doclet);
  url = url.replace(/(#.+|$)/, hash);

  return '<a href="' + url + '">' + hash + '</a>';
};
