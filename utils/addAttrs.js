const util = require('util');
const { getAttribs } = require('jsdoc/util/templateHelper');
const buildAttrsString = require('./buildAttrsString');

module.exports = function addAttrs(f) {
  const attribs = getAttribs(f);
  const attribsString = buildAttrsString(attribs);

  f.attribs = util.format('<span class="type-signature">%s</span>', attribsString);
  f.rawAttribs = attribs;
};
