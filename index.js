var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');

module.exports = function (options) {
  options = options || {};
  var bases = options.base || './';
  var gulp = options.gulp || require('gulp');
  var tasks = argv._;

  if (typeof bases === 'string') {
    bases = [bases];
  }

  tasks.forEach(function (task) {
    bases.forEach(function (base) {
      var baseTask = path.join(process.cwd(), base, task);
      var baseTaskJs = baseTask + '.js';
      if (fs.existsSync(baseTaskJs)) {
        gulp.task(task, function () {
          return require(baseTask)(argv);
        });
      }
    });
  });
};
