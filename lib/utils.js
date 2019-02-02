const r2 = require('r2')

const MEDIUM_IMG_CDN = 'https://cdn-images-1.medium.com/max/'

async function loadMediumPost(mediumURL) {
  if (mediumURL.match(/^http/i)) {
    mediumURL = mediumURL.replace(/#.+$/, '')
    mediumURL = `${mediumURL}?format=json`
    const response = await r2(mediumURL).text
    const json = JSON.parse(response.substr(response.indexOf('{')))
    return json
  } else {
    json = require(process.cwd() + '/' + mediumURL)
    return json
  }
}

function processSection(s) {
  var section = ''
  if (s.backgroundImage) {
    var imgwidth = parseInt(s.backgroundImage.originalWidth, 10)
    var imgsrc =
      MEDIUM_IMG_CDN + Math.max(imgwidth * 2, 2000) + '/' + s.backgroundImage.id
    section = '\n![](' + imgsrc + ')'
  }
  return section
}

async function getYouTubeEmbed(iframesrc, cb) {
  const body = await r2(iframesrc).text
  var tokens = body.match(/youtube.com%2Fembed%2F([^%]+)%3F/)
  if (tokens && tokens.length > 1) {
    var videoId = tokens[1]
    return `<center><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></center>`
  }
  return `<iframe src="${iframesrc}" frameborder=0></iframe>`
}

async function getGitHubEmbed(iframesrc) {
  let body
  try {
    body = r2(iframesrc).text
    var tokens = body.match(/script src="https:\/\/gist.github.com\/([^"]*)"/)
    if (!tokens) {
      return new Error('GitHub embed not found')
    }
    var scriptsrc = `https://gist.github.com/${tokens[1]}`
    let html = await r2(scriptsrc).html
    html
      .split('\n')
      .map((line, idx) => {
        if (idx === 0) return '' // skip stylesheet
        line = line.replace(/document.write\('(.*)'\)/, '$1')
        line = line
          .replace(/\\n\s*/g, '\n')
          .replace(/\n+/g, '\n')
          .replace(/\\(.)/g, '$1')
          .replace(/`/g, '&#96;')
        return line
      })
      .join('\n')
    return html
  } catch (err) {
    return err
  }
}

function processParagraph(p, cb) {
  var markups_array = createMarkupsArray(p.markups)

  if (markups_array.length > 0) {
    var previousIndex = 0,
      text = p.text,
      tokens = []
    for (var j = 0; j < markups_array.length; j++) {
      if (markups_array[j]) {
        token = text.substring(previousIndex, j)
        previousIndex = j
        tokens.push(token)
        tokens.push(markups_array[j])
      }
    }
    tokens.push(text.substring(j - 1))
    p.text = tokens.join('')
  }

  if (p.type !== 8 && p.type !== 10) {
    p.text = p.text.replace(/>/g, '&gt;').replace(/</g, '&lt;')
  }

  var markup = ''
  switch (p.type) {
    case 1:
      markup = '\n'
      break
    case 2:
      p.text = '\n# ' + p.text.replace(/\n/g, '\n# ')
      break
    case 3:
      p.text = '\n## ' + p.text.replace(/\n/g, '\n## ')
      break
    case 4: // image & caption
      var imgwidth = parseInt(p.metadata.originalWidth, 10)
      var imgsrc =
        MEDIUM_IMG_CDN + Math.max(imgwidth * 2, 2000) + '/' + p.metadata.id
      var text = '\n![' + p.text + '](' + imgsrc + ')'
      if (p.text) {
        text += '*' + p.text + '*'
      }
      p.text = text
      break
    case 6:
      markup = '> '
      break
    case 7: // quote
      p.text = '> # ' + p.text.replace(/\n/g, '\n> # ')
      break
    case 8:
      p.text = '\n```\n' + p.text + '\n```\n'
      break
    case 9:
      markup = '\n* '
      break
    case 10:
      markup = '\n1. '
      break
    case 11:
      return getGitHubEmbed(
        'https://medium.com/media/' + p.iframe.mediaResourceId,
        function(err, embed) {
          cb(null, `\n${embed}`)
        }
      )
    case 13:
      markup = '\n### '
      break
    case 15: // caption for section image
      p.text = '*' + p.text + '*'
      break
  }

  p.text = markup + p.text

  if (p.alignment == 2 && p.type != 6 && p.type != 7)
    p.text = '<center>' + p.text + '</center>'

  return cb(null, p.text)
}
function addMarkup(markups_array, open, close, start, end) {
  if (markups_array[start]) markups_array[start] += open
  else markups_array[start] = open

  if (markups_array[end]) markups_array[end] += close
  else markups_array[end] = close

  return markups_array
}
function createMarkupsArray(markups) {
  if (!markups || markups.length == 0) return []
  var markups_array = []
  for (var j = 0; j < markups.length; j++) {
    var m = markups[j]
    switch (m.type) {
      case 1: // bold
        addMarkup(markups_array, '**', '**', m.start, m.end)
        break
      case 2: // italic
        addMarkup(markups_array, '*', '*', m.start, m.end)
        break
      case 3: // anchor tag
        addMarkup(markups_array, '[', '](' + m.href + ')', m.start, m.end)
        break
      case 10: // code
        addMarkup(markups_array, '`', '`', m.start, m.end)
        break
      default:
        console.error('Unknown markup type ' + m.type, m)
        break
    }
  }
  return markups_array
}

module.exports = exports = {
  loadMediumPost,
  processParagraph,
  processSection,
  getYouTubeEmbed,
  getGitHubEmbed,
  addMarkup,
  createMarkupsArray
}
