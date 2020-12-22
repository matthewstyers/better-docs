const env = require('jsdoc/env');
const hasOwnProp = Object.prototype.hasOwnProperty;

module.exports = function buildMemNav(items, itemHeading, itemsSeen, linktoFn) {
  const subCategories = items.reduce((memo, item) => {
    const subCategory = item.subCategory || '';
    memo[subCategory] = memo[subCategory] || [];
    return {
      ...memo,
      [subCategory]: [...memo[subCategory], item]
    };
  }, {});

  const subCategoryNames = Object.keys(subCategories);

  let nav = '';

  subCategoryNames.forEach((subCategoryName) => {
    const subCategoryItems = subCategories[subCategoryName];
    if (subCategoryItems.length) {
      let itemsNav = '';

      subCategoryItems.forEach((item) => {
        let displayName;

        if (!hasOwnProp.call(item, 'longname')) {
          itemsNav += '<li>' + linktoFn('', item.name) + '</li>';
        } else if (!hasOwnProp.call(itemsSeen, item.longname)) {
          if (env.conf.templates.default.useLongnameInNav) {
            displayName = item.longname;
          } else {
            displayName = item.name;
          }
          itemsNav += '<li>' + linktoFn(item.longname, displayName.replace(/\b(module|event):/g, ''));

          if (item.children && item.children.length) {
            itemsNav += '<ul>';
            item.children.forEach(child => {
              if (env.conf.templates.default.useLongnameInNav) {
                displayName = child.longname;
              } else {
                displayName = child.name;
              }
              itemsNav += '<li>' + linktoFn(child.longname, displayName.replace(/\b(module|event):/g, '')) + '</li>';
            });
            itemsNav += '</ul>';
          }

          itemsNav += '</li>';

          itemsSeen[item.longname] = true;
        }
      });

      if (itemsNav !== '') {
        let heading = itemHeading;
        if (subCategoryName) {
          heading = heading + ' / ' + subCategoryName;
        }
        nav += '<h3>' + heading + '</h3><ul>' + itemsNav + '</ul>';
      }
    }
  });

  return nav;
};
