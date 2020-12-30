const addParamAttributes = require('./addParamAttributes');
const _ = require('lodash');

module.exports = function addSignatureParams(doclet) {
  const params = doclet.params ? addParamAttributes(doclet.params) : [];
  doclet.signature = `${doclet.signature || ''}(${_.join(params, ', ')})`;
};
