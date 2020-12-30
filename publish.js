/* eslint-disable func-names */
const env = require('jsdoc/env');
const fs = require('jsdoc/fs');
const helper = require('jsdoc/util/templateHelper');
const path = require('jsdoc/path');
const taffy = require('taffydb').taffy;
const _ = require('lodash');
const { singular } = require('pluralize');
const bundler = require('./bundler');

const htmlsafe = helper.htmlsafe;
const linkto = helper.linkto;
const resolveAuthorLinks = helper.resolveAuthorLinks;

const {
  Template,
  addAttrs,
  addSignatureTypes,
  attachModuleSymbols,
  buildNav,
  createGenerate,
  convertHashToLink,
  generateSourceFiles,
  getSignature,
  getPathFromDoclet,
  getTutorialLink,
  shortenPaths,
} = require('./utils');

let data;
let view;

const find = (query) => helper.find(data, query);
const getAncestorLinks = (doclet) => helper.getAncestorLinks(data, doclet);


/**
    @param {TAFFY} taffyData See <http://taffydb.com/>.
    @param {object} opts
    @param {Tutorial} tutorials
 */
exports.publish = function(taffyData, opts, tutorials) {
  const conf = env.conf.templates || {};
  const sourceFilePaths = [];
  let sourceFiles = {};
  let staticFileFilter;
  let staticFilePaths;
  let staticFileScanner;

  const templatePath = path.normalize(opts.template);
  const fromDir = path.join(templatePath, 'static');
  const staticFiles = fs.ls(fromDir, 3);
  // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
  // doesn't try to hand them out later

  // don't call registerLink() on this one! 'index' is also a valid longname
  const indexUrl = helper.getUniqueFilename('index');

  const globalUrl = helper.getUniqueFilename('global');
  helper.registerLink('global', globalUrl);

  data = taffyData;
  conf.default = conf.default || {};
  conf.betterDocs = _.defaultsDeep({}, conf.betterDocs || conf['better-docs'], {
    tutorials: { title: 'Tutorials' }
  });

  /* structure tutorials conf */
  if (!conf.betterDocs.tutorials.singular) {
    conf.betterDocs.tutorials.singular =
      singular(conf.betterDocs.tutorials.title);
  }

  // update outdir if necessary, then create outdir
  let outdir = path.normalize(env.opts.destination);
  const packageInfo = (find({ kind: 'package' }) || [])[0];
  if (packageInfo && packageInfo.name) {
    outdir = path.join(outdir, packageInfo.name, (packageInfo.version || ''));
  }
  fs.mkPath(outdir);

  // console.log(conf.betterDocs)
  view = new Template(path.join(templatePath, 'tmpl'));

  const generate = createGenerate(outdir, view);

  // set up templating
  view.layout = conf.default.layoutFile ?
    path.getResourcePath(path.dirname(conf.default.layoutFile),
      path.basename(conf.default.layoutFile)) :
    'layout.tmpl';

  // set up tutorials for helper
  helper.setTutorials(tutorials);

  data = helper.prune(data);
  data.sort('name, longname, version, since');
  helper.addEventListeners(data);

  data().each(function(doclet) {
    let sourcePath;

    doclet.attribs = '';

    if (doclet.examples) {
      doclet.examples = doclet.examples.map(function(example) {
        let caption;
        let code;

        if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
          caption = RegExp.$1;
          code = RegExp.$3;
        }

        return {
          caption: caption || '',
          code: code || example
        };
      });
    }
    if (doclet.see) {
      doclet.see.forEach(function(seeItem, i) {
        doclet.see[i] = convertHashToLink(doclet, seeItem);
      });
    }

    // build a list of source files
    if (doclet.meta) {
      sourcePath = getPathFromDoclet(doclet);
      sourceFiles[sourcePath] = {
        resolved: sourcePath,
        shortened: null
      };
      if (sourceFilePaths.indexOf(sourcePath) === -1) {
        sourceFilePaths.push(sourcePath);
      }
    }
  });



  staticFiles.forEach(function(fileName) {
    const toDir = fs.toDir(fileName.replace(fromDir, outdir));

    fs.mkPath(toDir);
    fs.copyFileSync(fileName, toDir);
  });

  // copy user-specified static files to outdir
  if (conf.default.staticFiles) {
    // The canonical property name is `include`. We accept `paths` for backwards compatibility
    // with a bug in JSDoc 3.2.x.
    staticFilePaths = conf.default.staticFiles.include ||
            conf.default.staticFiles.paths ||
            [];
    staticFileFilter = new (require('jsdoc/src/filter')).Filter(conf.default.staticFiles);
    staticFileScanner = new (require('jsdoc/src/scanner')).Scanner();

    staticFilePaths.forEach(function(filePath) {
      filePath = path.resolve(env.pwd, filePath);
      const extraStaticFiles = staticFileScanner.scan(
        [filePath], 10, staticFileFilter
      );

      extraStaticFiles.forEach(function(fileName) {
        const sourcePath = fs.toDir(filePath);
        const toDir = fs.toDir(fileName.replace(sourcePath, outdir));

        fs.mkPath(toDir);
        fs.copyFileSync(fileName, toDir);
      });
    });
  }

  if (sourceFilePaths.length) {
    sourceFiles = shortenPaths(sourceFiles, path.commonPrefix(sourceFilePaths));
  }
  data().each(function(doclet) {
    let docletPath;
    const url = helper.createLink(doclet);

    helper.registerLink(doclet.longname, url);

    // add a shortened version of the full path
    if (doclet.meta) {
      docletPath = getPathFromDoclet(doclet);
      docletPath = sourceFiles[docletPath].shortened;
      if (docletPath) {
        doclet.meta.shortpath = docletPath;
      }
    }
  });

  data().each(function(doclet) {
    const url = helper.longnameToUrl[doclet.longname];

    if (url.indexOf('#') > -1) {
      doclet.id = helper.longnameToUrl[doclet.longname].split(/#/).pop();
    } else doclet.id = doclet.name;

    /* add signture, if any */
    getSignature(doclet);
  });

  // do this after the urls have all been generated
  data().each(function(doclet) {
    doclet.ancestors = getAncestorLinks(doclet);

    if (doclet.kind === 'member') {
      addSignatureTypes(doclet);
      addAttrs(doclet);
    }

    if (doclet.kind === 'constant') {
      addSignatureTypes(doclet);
      addAttrs(doclet);
      doclet.kind = 'member';
    }
  });

  view.smallHeader = !conf.betterDocs.navButtons;

  const members = helper.getMembers(data);
  if (opts.tutorials) {
    // sort tutorials
    try {
      const tutorialsFile = JSON.parse(fs.readFileSync(`${opts.tutorials}/tutorials.json`));
      members.tutorials = Object.keys(tutorialsFile).map(key =>
        tutorials._tutorials[key]
      );
      view.smallHeader = false;
    } catch (error) {
      // tutorials.json doesn't exist
      if (error.code !== 'ENOENT') {
        throw error;
      }
      members.tutorials = tutorials.children;
    }
  } else {
    members.tutorials = tutorials.children;
  }
  view.tutorials = members.tutorials;
  members.components = helper.find(data, { kind: 'class', component: { isUndefined: false }});
  members.classes = helper.find(data, { kind: 'class', component: { isUndefined: true }});

  // output pretty-printed source files by default
  const outputSourceFiles =
    conf.default && conf.default.outputSourceFiles !== false;

  // add template helpers
  view.find = find;
  view.linkto = linkto;
  view.resolveAuthorLinks = resolveAuthorLinks;
  view.tutorialToUrl = helper.tutorialToUrl;
  view.tutoriallink = getTutorialLink;
  view.htmlsafe = htmlsafe;
  view.outputSourceFiles = outputSourceFiles;

  // once for all
  view.nav = buildNav(members, null, conf.betterDocs);

  view.tutorialsNav = buildNav(members, ['tutorials'], conf.betterDocs);

  bundler(members.components, outdir, conf);
  attachModuleSymbols(find({ longname: { left: 'module:' }}), members.modules);

  // generate the pretty-printed source files first so other pages can link to them
  if (outputSourceFiles) {
    generateSourceFiles(sourceFiles, opts.encoding, generate);
  }

  if (members.globals.length) { generate('Global', 'Title', [{ kind: 'globalobj' }], globalUrl); }

  // index page displays information from package.json and lists files
  const files = find({ kind: 'file' });
  const packages = find({ kind: 'package' });

  generate('Home', '',
    packages.concat(
      [{
        kind: 'mainpage',
        readme: opts.readme,
        longname: (opts.mainpagetitle) ? opts.mainpagetitle : 'Main Page'
      }]
    ).concat(files), indexUrl);

  // set up the lists that we'll use to generate pages
  const classes = taffy(members.classes);
  const modules = taffy(members.modules);
  const namespaces = taffy(members.namespaces);
  const mixins = taffy(members.mixins);
  const externals = taffy(members.externals);
  const interfaces = taffy(members.interfaces);
  const components = taffy(members.components);

  Object.keys(helper.longnameToUrl).forEach(function(longname) {
    const myClasses = helper.find(classes, { longname: longname });
    const myExternals = helper.find(externals, { longname: longname });
    const myInterfaces = helper.find(interfaces, { longname: longname });
    const myMixins = helper.find(mixins, { longname: longname });
    const myModules = helper.find(modules, { longname: longname });
    const myNamespaces = helper.find(namespaces, { longname: longname });
    const myComponents = helper.find(components, { longname: longname });

    if (myModules.length) {
      generate(myModules[0].name, 'Module', myModules,  helper.longnameToUrl[longname]);
    }

    if (myClasses.length) {
      generate(myClasses[0].name, 'Class', myClasses, helper.longnameToUrl[longname]);
    }

    if (myNamespaces.length) {
      generate(myNamespaces[0].name, 'Namespace', myNamespaces, helper.longnameToUrl[longname]);
    }

    if (myMixins.length) {
      generate(myMixins[0].name, 'Mixin', myMixins, helper.longnameToUrl[longname]);
    }

    if (myExternals.length) {
      generate(myExternals[0].name, 'External', myExternals, helper.longnameToUrl[longname]);
    }

    if (myInterfaces.length) {
      generate(myInterfaces[0].name, 'Interface', myInterfaces, helper.longnameToUrl[longname]);
    }

    if (myComponents.length) {
      generate(myComponents[0].name, 'Components', myComponents, helper.longnameToUrl[longname]);
    }
  });

  // TODO: move the tutorial functions to templateHelper.js
  function generateTutorial(title, subtitle, tutorial, filename) {
    const tutorialData = {
      title: title,
      subtitle: subtitle,
      header: tutorial.title,
      content: tutorial.parse(),
      children: tutorial.children,
      isTutorial: true
    };
    const tutorialPath = path.join(outdir, filename);
    let html = view.render('tutorial.tmpl', tutorialData);

    // yes, you can use {@link} in tutorials too!
    html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>

    fs.writeFileSync(tutorialPath, html, 'utf8');
  }

  // tutorials can have only one parent so there is no risk for loops
  function saveChildren(node) {
    node.children.forEach(function(child) {
      generateTutorial(
        child.title,
        conf.betterDocs.tutorials.singular,
        child,
        helper.tutorialToUrl(child.name)
      );
      saveChildren(child);
    });
  }

  saveChildren(tutorials);

  function saveLandingPage() {
    const content = fs.readFileSync(conf.betterDocs.landing, 'utf8');

    const landingPageData = {
      title: 'Home',
      content,
    };

    const homePath = path.join(outdir, 'index.html');
    const docsPath = path.join(outdir, 'docs.html');

    fs.renameSync(homePath, docsPath);

    view.layout = 'landing.tmpl';
    let html = view.render('content.tmpl', landingPageData);

    // allow {@link} in tutorials
    // turn {@link foo} into <a href="foodoc.html">foo</a>
    html = helper.resolveLinks(html);

    fs.writeFileSync(homePath, html, 'utf8');
  }

  if (conf.betterDocs.landing) {
    saveLandingPage();
  }
};
