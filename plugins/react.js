const _ = require('lodash');
const special = new RegExp(/^(component|hook|hoc|native|ios|android)$/);
const native = new RegExp(/\.(native|ios|android)\.(js|jsx)$/);
const iosExp = new RegExp(/\.ios\.(js|jsx)$/);
const androidExp = new RegExp(/\.android\.(js|jsx)$/);
// const { splitJoinedArray } = require('../utils');

const platformMap = {
  'native': 'Native',
  'ios': 'iOS',
  'android': 'Android'
};
const getName = (v) => platformMap[v] || v;
const platformTag = (v) => ({ originalTitle: v, title: v, text: '', value: '' });

exports.handlers = {
  newDoclet: function newDoclet({ doclet }) {
    if (_.isEmpty(doclet.comment)) return;

    let isNative = false;

    /* check to see if file has modified file extension */
    if (doclet.meta && doclet.meta.filename) {
      isNative = native.test(doclet.meta.filename);
    }

    if (isNative) {
      if (!_.isArray(doclet.tags)) doclet.tags = [];

      /* add native tag */
      if (
        !_.find(doclet.tags, { title: 'native' })
      ) doclet.tags.push(platformTag('native'));

      /* check for platform-specific tags */
      if (
        iosExp.test(doclet.meta.filename) &&
        !_.find(doclet.tags, { title: 'ios' })
      ) doclet.tags.push(platformTag('ios'));
      else if (
        androidExp.test(doclet.meta.filename) &&
        !_.find(doclet.tags, { title: 'android' })
      ) doclet.tags.push(platformTag('android'));
    }

    const tags = _.filter(doclet.tags, ({ title } = {}) => special.test(title));

    /* process special tags */
    _.map(tags, ({ title, value }) => {
      /* update doc */
      switch(title) {
      /* update doclet name and kind */
      case 'component':
      case 'hoc':
      case 'hook':
        doclet.kind = title;
        if (!_.isEmpty(value)) doclet.name = value;
        break;
      /* set native flag; add flags based on type */
      case 'android':
      case 'ios':
      case 'native':
        if (!doclet.type) doclet.type = {};
        if (!_.isArray(doclet.type.names)) doclet.type.names = [];

        /* add isNative flag */
        doclet.isNative = true;

        /* insert name */
        doclet.type.names.unshift(getName(title));
        break;
      default: break;
      }
    });
  }
};
