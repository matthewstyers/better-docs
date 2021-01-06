const { linkto } = require('jsdoc/util/templateHelper');
const buildMemberNav = require('./buildMemberNav');
const linkToExternal = require('./linkToExternal');
const getTutorialLink = require('./getTutorialLink');
const hasOwnProp = Object.prototype.hasOwnProperty;
const _ = require('lodash');

module.exports = function buildGroupNav(filtered, title, betterDocs) {
  let nav = '';
  const seen = {};
  nav += '<div class="category">';
  if (title) nav += '<h2>' + title + '</h2>';

  _.each(filtered, (items = [], type) => {
    const _title = betterDocs.navTitles[type] || _.startCase(type);
    let to = linkto;

    switch(type) {
    case 'externals': to = linkToExternal; break;
    case 'tutorials': to = (long, name) => getTutorialLink(name); break;
    default: break;
    }

    nav += buildMemberNav(items, _title, seen, to);
  });

  let globalNav;
  if (filtered.globals && filtered.globals.length) {
    globalNav = '';

    filtered.globals.forEach((g) => {
      if (g.kind !== 'typedef' && !hasOwnProp.call(seen, g.longname)) {
        globalNav += '<li>' + linkto(g.longname, g.name) + '</li>';
      }
      seen[g.longname] = true;
    });

    if (!globalNav) {
      // turn the heading into a link so you can actually get to the global page
      nav += '<h3>' + linkto('global', 'Global') + '</h3>';
    } else {
      nav += '<h3>Global</h3><ul>' + globalNav + '</ul>';
    }
  }
  nav += '</div>';
  return nav;
};
