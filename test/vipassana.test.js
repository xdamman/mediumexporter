var utils = require('../utils');
var expect = require('chai').expect;

var mediumURL = "https://medium.com/@xdamman/my-10-day-meditation-retreat-in-silence-71abda54940e";
var story = {};

describe("vipassana", function() {

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

  it("converts a paragraph with an anchor tag to markdown", function(done) {
    var p = story.paragraphs[11];
    var text = utils.processParagraph(p);

    var markdown = "\nI’ve been running all around for the past 7 years, moving from Belgium to San Francisco to create a startup ([Storify](https://storify.com)). I never spent more than a day away from my iPhone since the first version came out. I was always “connected”. I needed to take a break, to think about things. I wanted to take the time to better understand life and its purpose."
    expect(text).to.equal(markdown);
    done();
  });

  it("converts a paragraph with multiple markups to markdown", function(done) {
    var p = story.paragraphs[4];
    var text = utils.processParagraph(p);

    var markdown = "\nI’ve always been interested in meditation but I’ve never practiced it. I’m just too lazy. I bought the book “[Search Inside Yourself](http://www.amazon.com/Search-Inside-Yourself-Unexpected-Achieving/dp/0062116932)” (by Chade-Meng Tan, a Google engineer), read the first chapter and stopped (like I do with most books). I knew that if I wanted to be serious about this I should put myself in a situation where I wouldn’t have any other alternative than to just do it. That’s how I work. So I signed up for 10-day Vipassana Meditation Retreat in [Dhamma Manda](http://www.manda.dhamma.org/), 3 hours north of San Francisco, April 15th 2015."
    expect(text).to.equal(markdown);
    done();
  });

  it("converts a paragraph with an image", function(done) {
    var p = story.paragraphs[13];
    var text = utils.processParagraph(p);

    var markdown = "\n![The Dhamma Manda Vipassana Meditation Center in North California (near Kelseyville) (Photo [Dhamma Manda on Facebook](http://facebook.com/DhammaManda))](https://medium2.global.ssl.fastly.net/max/2000/1*peNGm67ELigNQtSx4WUoaQ.jpeg)*The Dhamma Manda Vipassana Meditation Center in North California (near Kelseyville) (Photo [Dhamma Manda on Facebook](http://facebook.com/DhammaManda))*";
    expect(text).to.equal(markdown);
    done();
  });

});
