const util = require('util');
const addParamAttributes = require('./addParamAttributes');

module.exports = function addSignatureParams(f) {
  const params = f.params ? addParamAttributes(f.params) : [];

  f.signature = util.format('%s(%s)', (f.signature || ''), params.join(', '));
};
