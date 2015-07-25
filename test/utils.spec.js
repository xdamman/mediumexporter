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

  it("converts a paragraph to markdown", function(done) {
    var p = story.paragraphs[4];
    var text = utils.processParagraph(p);

    var markdown = "\nI’ve always been interested in meditation but I’ve never practiced it. I’m just too lazy. I bought the book “[Search Inside Yourself](http://www.amazon.com/Search-Inside-Yourself-Unexpected-Achieving/dp/0062116932)” (by Chade-Meng Tan, a Google engineer), read the first chapter and stopped (like I do with most books). I knew that if I wanted to be serious about this I should put myself in a situation where I wouldn’t have any other alternative than to just do it. That’s how I work. So I signed up for 10-day Vipassana Meditation Retreat in [Dhamma Manda](http://www.manda.dhamma.org/)";
    expect(text).to.equal(markdown);
    done();
  });

  it("converts a paragraph with an image", function(done) {
    var p = story.paragraphs[13];
    var text = utils.processParagraph(p);

    var markdown = "\n![The Dhamma Manda Vipassana Meditation Center in North California (near Kelseyville) (Photo [Dhamma Manda on Facebook](http://facebook.com/DhammaManda)](https://medium2.global.ssl.fastly.net/max/2000/1*peNGm67ELigNQtSx4WUoaQ.jpeg)*The Dhamma Manda Vipassana Meditation Center in North California (near Kelseyville) (Photo [Dhamma Manda on Facebook](http://facebook.com/DhammaManda)*";
    expect(text).to.equal(markdown);
    done();
  });

});
