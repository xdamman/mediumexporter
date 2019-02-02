const utils = require('./utils')
const fs = require('fs')
const r2 = require('r2')
const slugify = require('slugify')

module.exports = async function(mediumURL, program) {
  const json = await utils.loadMediumPost(mediumURL)
  const s = json.payload.value
  const story = {}

  story.title = s.title
  story.date = new Date(s.createdAt).toJSON()
  story.url = s.canonicalUrl
  story.language = s.detectedLanguage
  story.license = s.license

  if (program.info) {
    console.log(story)
    process.exit(0)
  }

  let outputText = '---\n'
  outputText += 'url:' + story.url + '\n'
  outputText += 'date:' + story.date + '\n'
  outputText += 'title:' + story.title + '\n'
  outputText += '---\n\n'

  story.sections = s.content.bodyModel.sections
  story.paragraphs = s.content.bodyModel.paragraphs

  const sections = []
  for (let i = 0; i < story.sections.length; i++) {
    const s = story.sections[i]
    const section = utils.processSection(s)
    sections[s.startIndex] = section
  }

  if (story.paragraphs.length > 1) {
    story.subtitle = story.paragraphs[1].text
  }

  story.markdown = []
  story.markdown.push('\n# ' + story.title.replace(/\n/g, '\n# '))
  if (undefined != story.subtitle) {
    story.markdown.push('\n' + story.subtitle.replace(/#+/, ''))
  }

  let lastParagraph = null
  story.paragraphs = story.paragraphs.filter((p, idx) => {
    if (p.type === 8 && lastParagraph && lastParagraph.type === 8) {
      lastParagraph.text += '\n\n' + p.text
      return false
    }
    lastParagraph = p
    return true
  })

  const promises = []

  for (let i = 2; i < story.paragraphs.length; i++) {
    if (sections[i]) story.markdown.push(sections[i])

    const promise = new Promise(function(resolve, reject) {
      const p = story.paragraphs[i]
      utils.processParagraph(p, function(err, text) {
        // Avoid double title/subtitle
        if (text != story.markdown[i]) return resolve(text)
        else return resolve()
      })
    })
    promises.push(promise)
  }

  Promise.all(promises).then(async results => {
    const path = `${program.output}/${slugify(story.title)}`
    fs.mkdirSync(path, { recursive: true })
    for (let text of results) {
      if (text.indexOf('https://cdn-images-1.medium.com') > 0) {
        const link = text.substr(5, text.length - 6)
        let file = text.split('/')[text.split('/').length - 1]
        file = file.substr(0, file.length - 1)
        const response = await (await r2(link).response).buffer()
        fs.writeFileSync(`${path}/${file}`, response, 'base64')
        text = `![](${file})`
      }
      story.markdown.push(text)
    }

    if (program.debug) {
      console.log('debug', story.paragraphs)
    }

    outputText += story.markdown.join('\n')
    if (program.output) {
      fs.writeFile(`${path}/${slugify(story.title)}.md`, outputText, err => {
        if (err) throw err
        return
      })
    } else if (!program.output && program.commands) {
      console.log(outputText)
      return outputText
    } else {
      return outputText
    }
  })
}
