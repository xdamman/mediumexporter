var rssParser = require('rss-parser')
  , fs = require('fs')
  , path = require('path')
  , getPost = require('./get-post');

module.exports = function(feedURL, program, callback) {
  let outputDir = program.output || process.cwd();
  rssParser.parseURL(feedURL, function(err, data) {
    if (err) return callback(err);
    Promise.all(data.feed.entries.map(entry => {
      return new Promise((resolve, reject) => {
        getPost(entry.link, program, function(err, text) {
          if (err) return reject(err);
          entry.filename = path.join(outputDir, entry.title.replace(/\W+/g, '_') + '.md');
          fs.writeFile(entry.filename, text, err => {
            if (err) return reject(err);
            resolve(text);
          })
        });
      })
    })).then(_ => callback && callback(null, data));
  })
}
