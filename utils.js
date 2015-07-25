var request = require('request');

var MEDIUM_IMG_CDN = "https://medium2.global.ssl.fastly.net/max/";

var utils = {
  loadMediumPost: function(mediumURL, cb) {
    if(mediumURL.match(/^http/i)) {
      request(mediumURL+"?format=json", function(err, res, body) {
        if(err) return cb(err);
        var json_string = body.substr(body.indexOf('{'));
        var json = JSON.parse(json_string);
        return cb(null, json);
      });
    }
    else {
      json = require(mediumURL);
      return cb(null, json);
    }

  },
  processParagraph: function(p) {
    var markup = "";
    switch(p.type) {
      case 1:
        markup = "";
        break;
      case 2:
        markup = "#";
        break;
      case 3:
        markup = "##";
        break;
      case 4: // image & caption
        var imgwidth = parseInt(p.metadata.originalWidth,10);
        var imgsrc = MEDIUM_IMG_CDN+Math.max(imgwidth*2,2000)+"/"+p.metadata.id;
        markup = "!["+p.text+"]("+imgsrc+")";
        break;
      case 9:
        markup = "*";
        break;
    }

    var markups_array = utils.createMarkupsArray(p.markups);

    if(markups_array.length > 0) {
      var previousIndex=0, text=p.text, tokens=[];
      for(var j=0;j<markups_array.length;j++) {
        if(markups_array[j]) {
          token = text.substring(previousIndex, j);
          previousIndex = j;
          tokens.push(token);
          tokens.push(markups_array[j]);
        }
      }
      p.text = tokens.join('');
    }

    p.text = markup + p.text;

    if(p.alignment == 2) p.text = "<center>" + p.text + "</center>";

    return p.text;
  },
  addMarkup: function(markups_array, open, close, start, end) {
    if(markups_array[start])
      markups_array[start] += open;
    else
      markups_array[start] = open;

    if(markups_array[end])
      markups_array[end] += close;
    else
      markups_array[end] = close;

    return markups_array;
  },
  createMarkupsArray: function(markups) {
    // TODO
    if(!markups || markups.length == 0) return [];
    var markups_array = [];
    for(var j=0;j<markups.length;j++) {
      var m = markups[j];
      switch(m.type) {
        case 1: // bold
          utils.addMarkup(markups_array, "**","**",m.start,m.end);
          break;
        case 3: // anchor tag
          utils.addMarkup(markups_array, "[", "]("+m.href+")", m.start, m.end);
          break;
        default:
          console.log("Unknown markup type "+m.type)
          break;
      }
    }
    return markups_array;
  }
}

module.exports = utils;
