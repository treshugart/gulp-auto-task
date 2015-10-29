var assign = require('object-assign');
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var loaded = [];

function loadTask (task, opts) {
  var func;
  var funcLoadError;

  // Don't trace tasks if they've already been loaded.
  if (loaded.indexOf(task) > -1) {
    return;
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

  if (funcLoadError) {
    throw new Error ('could not load task "' + task + '" because it could not be found in ' + JSON.stringify(opts.base) + ' because: ' + funcLoadError);
  }

  // Flag so we can check for circular deps.
  loaded.push(task);

  // Tasks can be: module.exports = ['dependencies']
  if (Array.isArray(func)) {
    var deps = func;
    func = function (opts, done) {
      return done();
    };
    func.dependencies = deps;
  }

  // Don't register private tasks.
  if (func.private) {
    return;
  }

  (func.dependencies || []).forEach(function (dep) {
    try {
      loadTask(dep, opts);
    } catch (e) {
      throw new Error('could not load task dependency "' + dep + '" for "' + task + '" because: ' + e);
    }
  });

  if (func.length > 1) {
    opts.gulp.task(task, func.dependencies, function (done) {
      return func(argv, done);
    });
  } else {
    opts.gulp.task(task, func.dependencies, function () {
      return func(argv);
    });
  }
}

module.exports = function (opts) {
  opts = assign({
    base: process.cwd(),
    gulp: require('gulp')
  }, opts);

  if (typeof opts.base === 'string') {
    opts.base = [opts.base];
  }

  opts.base = opts.base.map(function (base) {
    return path.isAbsolute(base) ? base : path.join(process.cwd(), base);
  });

  argv._.forEach(function (task) {
    loadTask(task, opts);
  });
};
