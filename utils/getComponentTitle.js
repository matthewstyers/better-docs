const addParamAttributes = require('./addParamAttributes');
const updateItemName = require('./updateItemName');
const _ = require('lodash');

module.exports = function getComponentTitle(doclet) {
  const params = doclet.params ? addParamAttributes(doclet.params) : [];
  let hasNonPropParams = false;

  let pString = _.reduce(params, (memo, param, i) => {
    /* always put props first */
    if (_.includes(param, 'props')) {
      memo = `\
<div class='punctuation jsx spread'>...</div>props\
${memo.length ? ', ' : ''}${memo}`;
    } else {
      hasNonPropParams = true;
      memo += param;
    }

    /* add separator unless it's the end */
    if (i < (params.length - 1)) memo += ', ';

    return memo;
  }, '');
  if (!_.isEmpty(pString)) {
    pString = `\
&nbsp;<div class="signature jsx component">\
<div class='punctuation jsx opening'>{${hasNonPropParams ? ' ...{' : ''}</div>\
&nbsp;<div class='props jsx'>${pString}</div>&nbsp;\
<div class='jsx punctuation closing'>}${hasNonPropParams ? '}' : ''}</div>\
</div>`;
  }

  /* format for placement in component-style signature */
  let children = _.find(doclet.properties, { name: 'children' });
  if (doclet.name === 'Collapse') console.log(children);
  if (children) {
    /* convert to type name */
    children = `\
<div class="punctuation jsx opening">{</div>\
<div class="props jsx children">${ updateItemName(children) }</div>\
<div class="punctuation jsx closing">}</div>\
`;
    /* convert to final string */
    children += `\
<div class='jsx-tag'>&lt;</div>\
<div class='name'>${doclet.name}</div>\
<div class='jsx-tag'>&gt;</div>`;
  }

  const firstCloseTag = '<div class="jsx-tag">' + (children
    ? '&gt;</div>'
    : '&nbsp;/&gt;</div>'
  );



  doclet.signature = `<div class='jsx-tag'>&lt;</div>\
<span class='code-name'>${doclet.name}</span>\
${pString + firstCloseTag}\
${children || ''}`;
};
