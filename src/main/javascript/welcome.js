var $ = require('jquery');

var aboutJs = $('#about-js');
aboutJs.html('By default any files ending in <code>.js</code> in <code>src/main/javascript</code> or its subdirectories will be style checked with <a href="http://www.jslint.com/" target="_blank">JSLint</a> and compiled with <a href="http://browserify.org/" target="_blank">Browserify</a>.');
aboutJs.removeClass('bg-danger');
