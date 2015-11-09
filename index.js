'use strict';

var assign = require('object-assign');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');

var loaded = {};

function resolvePath (p) {
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

function loadOptions () {
  var opts;
  var rcFile = path.join(process.cwd(), '.gulprc');

  if (fs.existsSync(rcFile)) {
    try {
      opts = JSON.parse(fs.readFileSync(rcFile));
    } catch (e) {
      throw new Error('cannot parse config "' + rcFile + '" because: ' + e);
    }
  }

  return assign({
    base: '.',
    gulp: 'node_modules/gulp'
  }, opts, argv);
}

function loadTask (task, opts) {
  var func;
  var funcLoadError;

  // Don't recurse.
  if (loaded[task]) { return; }
  loaded[task] = task;

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
  opts.gulp.task(task, func);
}

function loadTasks () {
  var opts = loadOptions();

  // Can specify the path to the Gulp module.
  opts.gulp = require(resolvePath(opts.gulp));

  // Base path can be a string or array of base paths.
  if (typeof opts.base === 'string') {
    opts.base = [opts.base];
  }

  // Ensure all paths are normalised.
  opts.base = opts.base.map(resolvePath);

  // Load all specified tasks.
  argv._.forEach(function (task) {
    loadTask(task, opts);
  });

  // Export the options so they can be used.
  return opts;
}

module.exports = {
  load: loadTasks,
  opts: loadOptions
};
