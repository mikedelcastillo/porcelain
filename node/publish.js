var mike = require('mike-node');

var DIR = {};
DIR.ROOT = "../";
DIR.SASS = DIR.ROOT + "sass/";
DIR.PUBLIC = DIR.ROOT + "public/";
DIR.CSS = DIR.PUBLIC + "css/";

function publish() {
  mike.sass.files(DIR.SASS, DIR.CSS);
}

publish();
