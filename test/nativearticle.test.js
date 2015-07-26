var utils = require('../utils');
var expect = require('chai').expect;

var mediumURL = "https://medium.com/@xdamman/my-10-day-meditation-retreat-in-silence-71abda54940e";
var story = {};

describe("native article", function() {

  it("loads the json of a medium post locally", function(done) {
    utils.loadMediumPost("./test/medium_posts/nativearticle.json", function(err, json) {
      expect(err).to.not.exist;
      expect(json.success).to.be.true;
      story.paragraphs = json.payload.value.content.bodyModel.paragraphs;
      expect(json.payload.value.content.bodyModel.paragraphs).to.not.be.empty;
      done();
    });
  });

  it("converts a paragraph with an anchor tag to markdown", function(done) {
    var p = story.paragraphs[14];
    var text = utils.processParagraph(p);

    var markdown = "\nThe next step for you reader is to install an ad blocker for your browser. I recommend [uBlock](http://ublock.org). Also [Pocket](http://getpocket.com) or [Instapaper](http://instapaper.com) are great apps to read content from publishers without having to load their website again and again.";
    expect(text).to.equal(markdown);
    done();
  });
});
