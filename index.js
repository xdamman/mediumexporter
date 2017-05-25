#! /usr/bin/env node

var program = require('commander')
  , utils = require('./utils')
  , package = require('./package.json')
  ;

program
  .version(package.version)
  .description(package.description)
  .usage('[options] <medium post url>')
  .option('-H, --headers', 'Add headers at the beginning of the markdown file with metadata')
  .option('-S, --separator <separator>', 'Separator between headers and body','')
  .option('-I, --info', 'Show information about the medium post')
  .on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ mediumexporter https://medium.com/@xdamman/my-10-day-meditation-retreat-in-silence-71abda54940e > medium_post.md');
    console.log('    $ mediumexporter --headers --separator --- https://medium.com/@xdamman/my-10-day-meditation-retreat-in-silence-71abda54940e > medium_post.md');
    console.log('    $ mediumexporter mediumpost.json');
    console.log('');
  });

program.parse(process.argv);

var mediumURL = program.args[0];

utils.loadMediumPost(mediumURL, function(err, json) {

  var s = json.payload.value;
  var story = {};

  story.title = s.title;
  story.subtitle = s.content.subtitle;
  story.date = new Date(s.createdAt);
  story.url = s.canonicalUrl;
  story.language = s.detectedLanguage;
  story.license = s.license;

  if(program.info) {
    console.log(story);
    process.exit(0);
  }

  story.sections = s.content.bodyModel.sections;
  story.paragraphs = s.content.bodyModel.paragraphs;

  var sections = [];
  for(var i=0;i<story.sections.length;i++) {
    var s = story.sections[i];
    var section = utils.processSection(s);
    sections[s.startIndex] = section;
  }

  story.markdown = [];
  story.markdown.push("\n# "+story.title.replace(/\n/g,'\n# '));
  if (undefined != story.subtitle) {
    story.markdown.push("\n## "+story.subtitle.replace(/\n/g,'\n## '));
  }
  for(var i=0;i<story.paragraphs.length;i++) {
    
    if(sections[i]) story.markdown.push(sections[i]);

    var p = story.paragraphs[i];
    var text = utils.processParagraph(p);

    // Avoid double title/subtitle
    if(text != story.markdown[i])
      story.markdown.push(text);
  }

  if(program.headers) {
    console.log("url: "+story.url);
    console.log("date: "+story.date);
    console.log(program.separator);
  }
  console.log(story.markdown.join('\n'));

});
