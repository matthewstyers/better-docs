const { htmlsafe } = require('jsdoc/util/templateHelper');
const util = require('util');

module.exports = function buildAttrsString(attribs) {
  let attribsString = '';

  if (attribs && attribs.length) {
    attribsString = htmlsafe(util.format('(%s) ', attribs.join(', ')));
  }

  return attribsString;
};
