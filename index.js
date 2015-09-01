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
        var taskFunc = require(baseTask);

        if (taskFunc.private === true) {
          return;
        }

        if (!taskFunc.dependencies) {
          taskFunc.dependencies = [];
        }

        gulp.task(task, taskFunc.dependencies, function () {
          return taskFunc(argv);
        });
      }
    });
  });
};
