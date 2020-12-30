const addAttrs = require('./addAttrs');
const addSignatureParams = require('./addSignatureParams');
const addSignatureReturns = require('./addSignatureReturns');
const needsSignature = require('./needsSignature');
const getComponentTitle = require('./getComponentTitle');

module.exports = function getSignature(doclet) {
  if (doclet.kind === 'component') {
    getComponentTitle(doclet);
  } else if (needsSignature(doclet)) {
    addSignatureParams(doclet);
    addSignatureReturns(doclet);
    addAttrs(doclet);
  }
};
