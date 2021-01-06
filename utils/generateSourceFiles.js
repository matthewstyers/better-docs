const fs = require('jsdoc/fs');
const helper = require('jsdoc/util/templateHelper');
const logger = require('jsdoc/util/logger');
const _ = require('lodash');

module.exports = function generateSourceFiles(sourceFiles, encoding, generate) {
  encoding = encoding || 'utf8';
  _.each(_.keys(sourceFiles), (file) => {
    let source;
    // links are keyed to the shortened path in each doclet's `meta.shortpath` property
    const sourceOutfile = helper.getUniqueFilename(sourceFiles[file].shortened);

    helper.registerLink(sourceFiles[file].shortened, sourceOutfile);

    try {
      source = {
        kind: 'source',
        code: helper.htmlsafe(
          fs.readFileSync(sourceFiles[file].resolved, encoding)
        )
      };
    } catch (e) {
      logger.error('Error while generating source file %s: %s', file, e.message);
    }

    generate({
      title: sourceFiles[file].shortened,
      subtitle: 'Source', docs: [source],
      filename: sourceOutfile,
      resolveLinks: false
    });
  });
};
