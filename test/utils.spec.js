var utils = require('../utils');
var expect = require('chai').expect;

var mediumURL = "https://medium.com/@xdamman/my-10-day-meditation-retreat-in-silence-71abda54940e";
var story = {};

describe("utils", function() {

  it.skip("loads the json of a medium post over the Internet", function(done) {
    this.timeout(5000);
    utils.loadMediumPost(mediumURL, function(err, json) {
      expect(err).to.not.exist;
      expect(json.success).to.be.true;
      done();
    });
  });

  it("loads the json of a medium post locally", function(done) {
    this.timeout(5000);
    utils.loadMediumPost("./test/medium_posts/vipassana.json", function(err, json) {
      expect(err).to.not.exist;
      expect(json.success).to.be.true;
      story.paragraphs = json.payload.value.content.bodyModel.paragraphs;
      expect(json.payload.value.content.bodyModel.paragraphs).to.not.be.empty;
      done();
    });
  });

  it("creates the markups array", function(done) {
    expect(story.paragraphs.length > 1).to.be.true;
    var p = story.paragraphs[4], markups_array = [];
    expect(p.markups).to.not.be.empty;
    markups_array = utils.createMarkupsArray(p.markups);
    expect(markups_array).to.not.be.empty;
    done();
  });

});
