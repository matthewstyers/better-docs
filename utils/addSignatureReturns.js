const { getAttribs } = require('jsdoc/util/templateHelper');
const addNonParamAttributes = require('./addNonParamAttributes');
const buildAttrsString = require('./buildAttrsString');
const _ = require('lodash');

module.exports = function addSignatureReturns(f) {
  const attribs = [];
  let attribsString = '';
  let returnTypes = [];
  let returnTypesString = '';
  const source = f.yields || f.returns;

  // jam all the return-type attributes into an array. this could create odd results (for example,
  // if there are both nullable and non-nullable return types), but let's assume that most people
  // who use multiple @return tags aren't using Closure Compiler type annotations, and vice-versa.
  if (source) {
    source.forEach((item) => {
      getAttribs(item).forEach((attrib) => {
        if (attribs.indexOf(attrib) === -1) attribs.push(attrib);
      });
    });
    attribsString = buildAttrsString(attribs);
  }

  if (source) returnTypes = _.join(addNonParamAttributes(source), '|');

  if (returnTypes.length) {
    returnTypesString = `<i class="fas fa-fw fa-long-arrow-right fa-sm"></i> ${attribsString}${returnTypes}`;
  }
  f.signature = `\
<span class="signature">${f.signature || ''}</span>\
<span class="type-signature return">${returnTypesString}</span>`;
};
