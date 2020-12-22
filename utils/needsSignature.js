const getsSignature = ['function', 'class', 'hoc', 'hook', 'component'];

const _ = require('lodash');
module.exports = function needsSignature(doclet) {
  let needsSig = false;

  // function and class definitions always get a signature
  if (_.includes(getsSignature, doclet.kind)) {
    needsSig = true;
    // typedefs that contain functions get a signature, too
  } else if (doclet.kind === 'typedef' && doclet.type && doclet.type.names &&
        doclet.type.names.length) {
    for (let i = 0, l = doclet.type.names.length; i < l; i++) {
      if (_.includes(getsSignature, doclet.type.names[i].toLowerCase())) {
        needsSig = true;
        break;
      }
    }
    // and namespaces that are functions get a signature (but finding them is a
    // bit messy)
  } else if (doclet.kind === 'namespace' && doclet.meta && doclet.meta.code &&
        doclet.meta.code.type && doclet.meta.code.type.match(/[Ff]unction/)) {
    needsSig = true;
  }

  return needsSig;
};
