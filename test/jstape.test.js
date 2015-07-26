var utils = require('../utils');
var expect = require('chai').expect;

var mediumURL = "https://medium.com/@xdamman/my-10-day-meditation-retreat-in-silence-71abda54940e";
var story = {};

describe("js tape", function() {

  it("loads the json of a medium post locally", function(done) {
    this.timeout(5000);
    utils.loadMediumPost("./test/medium_posts/jstape.json", function(err, json) {
      expect(err).to.not.exist;
      expect(json.success).to.be.true;
      story.paragraphs = json.payload.value.content.bodyModel.paragraphs;
      expect(json.payload.value.content.bodyModel.paragraphs).to.not.be.empty;
      done();
    });
  });

  // Buggy because the href value contains a "(" and ")" which confuses markdown
  it("converts a paragraph with an important quote that includes an anchor tag to markdown", function(done) {
    var p = story.paragraphs[28];
    var text = utils.processParagraph(p);

    var markdown = "> #Test assertions should be dead simple,\n> #& [completely free of magic](https://en.wikipedia.org/wiki/Magic_(programming)).";
    expect(text).to.equal(markdown);
    done();
  });

  it("converts a paragraph with a github gist embed to markdown", function(done) {
    var p = story.paragraphs[38];
    var text = utils.processParagraph(p);

    var markdown = '\n<iframe src="https://medium.com/media/9d8e481812059cb5d76ec771194c2ecb" frameborder=0></iframe>';
    expect(text).to.equal(markdown);
    done();
  });

  it("converts a paragraph with code excerpt to markdown", function(done) {
    var p = story.paragraphs[41];
    var text = utils.processParagraph(p);

    var markdown = '\n    TAP version 13\n    # A passing test\n    ok 1 This test will pass.\n    # Assertions with tape.\n    not ok 2 Given two mismatched values, .equal() should produce a nice bug report\n      ---\n        operator: equal\n        expected: \'something to test\'\n        actual:   \'sonething to test\'\n      ...';
    expect(text).to.equal(markdown);
    done();
  });
});
