const buildItemTypeStrings = require('./buildItemTypeStrings');

module.exports = function addNonParamAttributes(items) {
  let types = [];

  items.forEach((item) => {
    types = types.concat(buildItemTypeStrings(item));
  });

  return types;
};
