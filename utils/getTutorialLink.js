const helper = require('jsdoc/util/templateHelper');

module.exports = function tutoriallink(tutorial) {
  return helper.toTutorial(tutorial, null, {
    tag: 'em', classname: 'disabled', prefix: 'Tutorial: '
  });
};
