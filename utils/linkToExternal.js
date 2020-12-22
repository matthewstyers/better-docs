const { linkto } = require('jsdoc/util/templateHelper');

module.exports = function linktoExternal(longName, name) {
  return linkto(longName, name.replace(/(^"|"$)/g, ''));
};
