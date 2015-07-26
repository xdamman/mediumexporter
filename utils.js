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
  processSection: function(s) {
    var section = "";
    if(s.backgroundImage) {
      var imgwidth = parseInt(s.backgroundImage.originalWidth,10);
      var imgsrc = MEDIUM_IMG_CDN+Math.max(imgwidth*2,2000)+"/"+s.backgroundImage.id;
      section = "\n![]("+imgsrc+")";
    }
    return section;
  },
  processParagraph: function(p) {

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
      tokens.push(text.substring(j-1));
      p.text = tokens.join('');
    }

    var markup = "";
    switch(p.type) {
      case 1:
        markup = "\n";
        break;
      case 2:
        p.text = "\n#"+p.text.replace(/\n/g,'\n#');
        break;
      case 3:
        p.text = "\n##"+p.text.replace(/\n/g,'\n##');
        break;
      case 4: // image & caption
        var imgwidth = parseInt(p.metadata.originalWidth,10);
        var imgsrc = MEDIUM_IMG_CDN+Math.max(imgwidth*2,2000)+"/"+p.metadata.id;
        p.text = "\n!["+p.text+"]("+imgsrc+")*"+p.text+"*";
        break;
      case 6:
        markup = "> ";
        break;
      case 7: // quote
        p.text = "> #"+p.text.replace(/\n/g,'\n> #');
        break;
      case 8:
        p.text = "\n    "+p.text.replace(/\n/g,'\n    ');
        break;
      case 9:
        markup = "\n* ";
        break;
      case 10:
        markup = "\n1. ";
        break;
      case 11:
        p.text = '\n<iframe src="https://medium.com/media/'+p.iframe.mediaResourceId+'" frameborder=0></iframe>';
        break;
      case 13:
        markup = "\n###";
        break;
      case 15: // caption for section image
        p.text = "*"+p.text+"*";
        break;
    }

    p.text = markup + p.text;

    if(p.alignment == 2&& p.type != 6 && p.type != 7) p.text = "<center>" + p.text + "</center>";

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
    if(!markups || markups.length == 0) return [];
    var markups_array = [];
    for(var j=0;j<markups.length;j++) {
      var m = markups[j];
      switch(m.type) {
        case 1: // bold
          utils.addMarkup(markups_array, "**","**",m.start,m.end);
          break;
        case 2: // italic
          utils.addMarkup(markups_array, "*","*",m.start,m.end);
          break;
        case 3: // anchor tag
          utils.addMarkup(markups_array, "[", "]("+m.href+")", m.start, m.end);
          break;
        default:
          console.error("Unknown markup type "+m.type, m);
          break;
      }
    }
    return markups_array;
  }
}

module.exports = utils;
