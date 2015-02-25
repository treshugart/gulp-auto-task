# gulp-auto-task

Automatically create gulp tasks from node modules from a glob pattern.

## Installation

```
npm install gulp-auto-task
```

## Including

```
require('gulp-auto-task');
```

## Usage

Simply call it as a function passing in your a glob pattern and an optional options object.

```js
var gulp = require('gulp');
var gulpAutoTask = require('./build/lib/auto-task');

gulpAutoTask('{*,**/*}.js', {
    // This is prepended to the glob pattern and excluded from the task name.
    base: './build/gulp',

    // The gulp instance you want it applied to. If not specified this tries
    // to `require('gulp')` for you.
    gulp: gulp
});
```
