var utils = require('./utils')
  , fs = require('fs')
  , Promise = require('bluebird')
  ;

module.exports = function(mediumURL, program, callback) {
  utils.loadMediumPost(mediumURL, function(err, json) {

    var s = json.payload.value;
    var story = {};

    story.title = s.title;
    story.date = new Date(s.createdAt);
    story.url = s.canonicalUrl;
    story.language = s.detectedLanguage;
    story.license = s.license;

    if(program.info) {
      console.log(story);
      process.exit(0);
    }

    var outputText = '';

    if(program.headers) {
      outputText += 'url:' + story.url + '\n';
      outputText += 'date:' + story.date + '\n';
      outputText += 'title:' + story.title + '\n';
      outputText += program.separator + '\n';
    }

    story.sections = s.content.bodyModel.sections;
    story.paragraphs = s.content.bodyModel.paragraphs;

    var sections = [];
    for(var i=0;i<story.sections.length;i++) {
      var s = story.sections[i];
      var section = utils.processSection(s);
      sections[s.startIndex] = section;
    }

    if(story.paragraphs.length > 1) {
      story.subtitle = story.paragraphs[1].text;
    }

    story.markdown = [];
    story.markdown.push("\n# "+story.title.replace(/\n/g,'\n# '));
    if (undefined != story.subtitle) {
      story.markdown.push("\n"+story.subtitle.replace(/#+/,''));
    }

    let lastParagraph = null;
    story.paragraphs = story.paragraphs.filter((p, idx) => {
      if (p.type === 8 && lastParagraph && lastParagraph.type === 8) {
        lastParagraph.text += '\n\n' + p.text;
        return false;
      }
      lastParagraph = p;
      return true;
    })

    var promises = [];

    for(var i=2;i<story.paragraphs.length;i++) {
      
      if(sections[i]) story.markdown.push(sections[i]);

      var promise = new Promise(function (resolve, reject) {
        var p = story.paragraphs[i];
        utils.processParagraph(p, function(err, text) {
          // Avoid double title/subtitle
          if(text != story.markdown[i])
            return resolve(text);
          else
            return resolve();
        });
      });
      promises.push(promise);
    }

    Promise.all(promises).then((results) => {
      results.map(text => {
        story.markdown.push(text);
      })

      if (program.debug) {
        console.log("debug", story.paragraphs);
      }
      outputText += story.markdown.join('\n');
      if (callback) {
        callback(null, outputText);
      } else if (program.output) {
        fs.writeFile(program.output, outputText, err => {
          if (err) throw err;
        })
      } else {
        console.log(outputText);
      }
    });

  });
}
