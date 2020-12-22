const { linkto } = require('jsdoc/util/templateHelper');
const buildMemberNav = require('./buildMemberNav');
const linkToExternal = require('./linkToExternal');
const getTutorialLink = require('./getTutorialLink');
const hasOwnProp = Object.prototype.hasOwnProperty;

module.exports = function buildGroupNav(members, title, betterDocs) {
  let globalNav;
  const seenTutorials = {};
  let nav = '';
  const seen = {};
  nav += '<div class="category">';
  if (title) {
    nav += '<h2>' + title + '</h2>';
  }
  nav += buildMemberNav(
    members.tutorials || [],
    betterDocs.tutorials.title,
    seenTutorials,
    (long, name) => getTutorialLink(name)
  );
  nav += buildMemberNav(members.modules || [], 'Modules', {}, linkto);
  nav += buildMemberNav(members.externals || [], 'Externals', seen, linkToExternal);
  nav += buildMemberNav(members.namespaces || [], 'Namespaces', seen, linkto);
  nav += buildMemberNav(members.classes || [], 'Classes', seen, linkto);
  nav += buildMemberNav(members.interfaces || [], 'Interfaces', seen, linkto);
  nav += buildMemberNav(members.events || [], 'Events', seen, linkto);
  nav += buildMemberNav(members.mixins || [], 'Mixins', seen, linkto);
  nav += buildMemberNav(members.components || [], 'Components', seen, linkto);

  if (members.globals && members.globals.length) {
    globalNav = '';

    members.globals.forEach((g) => {
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
