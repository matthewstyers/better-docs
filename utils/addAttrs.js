const util = require('util');
const { getAttribs } = require('jsdoc/util/templateHelper');
const buildAttrsString = require('./buildAttrsString');

module.exports = function addAttrs(doclet) {
  const attribs = getAttribs(doclet);
  const attribsString = buildAttrsString(attribs);

  doclet.attribs = util.format('<span class="type-signature">%s</span>', attribsString);
  doclet.rawAttribs = attribs;
};
