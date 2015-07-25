var utils = require('./utils')
  ;

var mediumURL = "https://medium.com/@xdamman/my-10-day-meditation-retreat-in-silence-71abda54940e";
var mediumURL = "./test/vipassana.json";

utils.loadMediumPost(mediumURL, function(err, json) {

  var s = json.payload.value;
  var story = {};

  story.title = s.title;
  story.subtitle = s.content.subtitle;
  story.paragraphs = s.content.bodyModel.paragraphs;

  story.markdown = [];
  for(var i=0;i<story.paragraphs.length;i++) {
    var p = story.paragraphs[i];
    var text = utils.processParagraph(p);
    story.markdown.push(text);
  }

  console.log(story.markdown.join('\n\n'));

});
