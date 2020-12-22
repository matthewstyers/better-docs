const { htmlsafe, linkto } = require('jsdoc/util/templateHelper');

module.exports = function buildItemTypeStrings(item) {
  const types = [];

  if (item && item.type && item.type.names) {
    item.type.names.forEach((name) => {
      types.push(linkto(name, htmlsafe(name)));
    });
  }

  return types;
};
