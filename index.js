'use strict';

var assign = require('object-assign');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');

var loaded = {};

function resolvePath (p) {
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

function loadOptions (mergeWithOpts) {
  var opts;
  var rcFile = path.join(process.cwd(), '.gulprc');

  if (fs.existsSync(rcFile)) {
    try {
      opts = JSON.parse(fs.readFileSync(rcFile));
    } catch (e) {
      throw new Error('cannot parse config "' + rcFile + '" because: ' + e);
    }
  }

  // Merge with defaults.
  opts = assign({
    base: 'build/gulp',
    gulp: 'node_modules/gulp'
  }, mergeWithOpts, opts, argv);

  // Can specify the path to the Gulp module.
  opts.gulp = require(resolvePath(opts.gulp));

  // Base path can be a string or array of base paths.
  if (typeof opts.base === 'string') {
    opts.base = [opts.base];
  }

  // Ensure all paths are normalised.
  opts.base = opts.base.map(resolvePath);

  return opts;
}

function loadTask (task) {
  var func;
  var funcLoadError;
  var opts = loadOptions();

  // Don't recurse and also, don't search if we don't have to.
  if (loaded[task]) {
    return loaded[task];
  }

  // Find the first matching module.
  opts.base.some(function (base) {
    try {
      return func = require(path.join(base, task));
    } catch (e) {
      funcLoadError = e;
      return false;
    }
  });

  // Try and give helpful load errors.
  if (!func && funcLoadError) {
    throw new Error ('could not load task "' + task + '" from ' + JSON.stringify(opts.base) + ' because: ' + funcLoadError);
  }

  // Simple register.
  return loaded[task] = func;
}

function initTasks () {
  var opts = loadOptions();
  var tasks = argv._;

  // If no task was specified, load the default task.
  if (!tasks.length) {
    tasks.push('default');
  }

  // Load all specified tasks.
  tasks.forEach(function (task) {
    opts.gulp.task(task, loadTask(task));
  });
}

module.exports = {
  init: initTasks,
  load: loadTask,
  opts: loadOptions
};
