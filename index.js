#! /usr/bin/env node

var program = require('commander')
  , package = require('./package.json')
  ;

program
  .version(package.version)
  .description(package.description)
  .usage('[options] <medium post or feed url>')
  .option('-H, --headers', 'Add headers at the beginning of the markdown file with metadata')
  .option('-S, --separator <separator>', 'Separator between headers and body','')
  .option('-I, --info', 'Show information about the medium post')
  .option('-O, --output <destination>', 'File (if URL is a post) or directory (if URL is a feed) to output to')
  .option('-d, --debug', 'Show debugging info')
  .on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ mediumexporter https://medium.com/@xdamman/my-10-day-meditation-retreat-in-silence-71abda54940e > medium_post.md');
    console.log('    $ mediumexporter -O ./posts https://medium.com/feed/@xdamman');
    console.log('    $ mediumexporter --headers --separator --- https://medium.com/@xdamman/my-10-day-meditation-retreat-in-silence-71abda54940e > medium_post.md');
    console.log('    $ mediumexporter mediumpost.json');
    console.log('');
  });

program.parse(process.argv);

var mediumURL = program.args[0];

if (mediumURL.match(/medium\.com\/feed\//)) {
  require('./get-feed')(mediumURL, program);
} else {
  require('./get-post')(mediumURL, program);
}

