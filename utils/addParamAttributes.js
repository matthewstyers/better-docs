const updateItemName = require('./updateItemName');

module.exports = function addParamAttributes(params) {
  return params.filter((param) =>  {
    return param.name && param.name.indexOf('.') === -1;
  }).map(updateItemName);
};
