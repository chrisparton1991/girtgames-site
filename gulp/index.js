var fs = require('fs');
var gulp = require('gulp');

var tasks = fs.readdirSync('./gulp/tasks/');

tasks.forEach(function (task) {
    require('./tasks/' + task);
});
