#! /usr/bin/env node

if (require.main !== module) {
  module.exports = {
    getFeed: require('./lib/get-feed'),
    getPost: require('./lib/get-post')
  }
} else {
  var program = require('commander'),
    package = require('./package.json')
  program
    .version(package.version)
    .description(package.description)
    .usage('[options] <medium post or feed url>')
    .option('-I, --info', 'Show information about the medium post')
    .option(
      '-O, --output <destination>',
      'File (if URL is a post) or directory (if URL is a feed) to output to'
    )
    .option('-d, --debug', 'Show debugging info')
    .on('--help', function() {
      console.log('  Examples:')
      console.log('')
      console.log('    $ mediumexporter -O content')
      console.log('')
    })

  program.parse(process.argv)

  var mediumURL = program.args[0]

  if (!mediumURL) {
    console.log('missing medium url')
  }

  if (mediumURL.match(/medium\.com\/feed\//)) {
    require('./lib/get-feed')(mediumURL, program)
  } else {
    require('./lib/get-post')(mediumURL, program)
  }
}
