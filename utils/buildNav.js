const buildGroupNav = require('./buildGroupNav');
/**
 * Create the navigation sidebar.
 * @param {object} members The members that will be used to create the sidebar.
 * @param {array<object>} members.classes
 * @param {array<object>} members.components
 * @param {array<object>} members.externals
 * @param {array<object>} members.globals
 * @param {array<object>} members.mixins
 * @param {array<object>} members.modules
 * @param {array<object>} members.namespaces
 * @param {array<object>} members.tutorials
 * @param {array<object>} members.events
 * @param {array<object>} members.interfaces
 * @return {string} The HTML for the navigation sidebar.
 */
module.exports = function buildNav(members, navTypes = null, betterDocs) {
  const href = betterDocs.landing ? 'docs.html' : 'index.html';
  let nav = navTypes ? '' : `<h2><a href="${href}">Documentation</a></h2>`;

  const rootScope = {};

  const types = navTypes || betterDocs.navTypes;
  types.forEach((type) =>  {
    if (!members[type]) return;
    members[type].forEach((el) => {
      rootScope[type] ? rootScope[type].push(el) : rootScope[type] = [el];
    });
  });

  nav += buildGroupNav(rootScope, null, betterDocs);


  return nav;
};
