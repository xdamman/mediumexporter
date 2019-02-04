const utils = require('./utils')
const fs = require('fs')
const r2 = require('r2')
const slugify = require('underscore.string/slugify')

module.exports = async function(mediumURL, params) {
  if (!mediumURL || mediumURL.substr(0, 18) !== 'https://medium.com') {
    throw new Error('no url or not a medium.com url')
  }

  let output = null
  const json = await utils.loadMediumPost(mediumURL)
  const s = json.payload.value
  const story = {}

  story.title = s.title
  story.subtitle = s.virtuals.subtitle
  story.date = new Date(s.createdAt).toJSON()
  story.url = s.canonicalUrl
  story.images = []
  story.language = s.detectedLanguage
  if (s.virtuals.tags) {
    story.tags = s.virtuals.tags.map(t => t.slug)
  }
  if (s.license && s.license !== 0) {
    story.license = s.license
  }

  if (params && params.info) {
    process.exit(0)
  }

  if (params) {
    params.output = params.output ? params.output : 'content'
    output = `${params.output}/${slugify(story.title, {
      lower: true,
      remove: '.'
    })}`
  } else {
    output = `${process.env.PWD}/${slugify(story.title, {
      lower: true,
      remove: '.'
    })}`
  }

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
      const text = utils.processParagraph(p)
      // Avoid double title/subtitle
      if (text != story.markdown[i]) {
        return resolve(text)
      } else {
        return resolve()
      }
    })
    promises.push(promise)
  }

  return Promise.all(promises)
    .then(async results => {
      let hasImages = false
      function createFolder() {
        try {
          fs.mkdirSync(output, { recursive: true })
        } catch (err) {
          // may exist already, ignore
          console.error(err)
        }
        return
      }

      for (let text of results) {
        if (text && text.startsWith('\n![')) {
          if (!hasImages) {
            createFolder()
          }
          hasImages = true
          const link = text
            .match(/(?:!\[(.*?)\]\((.*?)\))/)
            .filter(l => l.startsWith('http'))[0]

          const file = link.split('/')[link.split('/').length - 1]
          console.log('image', link, file)
          const response = await (await r2.get(link).response).buffer()
          fs.writeFileSync(`${output}/${file}`, response, 'base64')
          text = text.replace(link, file)
          story.images.push(link)
        }
        story.markdown.push(text)
      }

      if (params && params.debug) {
        console.log('debug', story.paragraphs)
      }

      // frontmatter
      let outputText = '---\n'
      outputText += `url: ${story.url}\n`
      outputText += `date: ${story.date}\n`
      outputText += `title:  ${story.title}\n`
      if (story.subtitle) {
        outputText += `subtitle: ${story.subtitle}\n`
      }
      if (story.images.length > 0) {
        outputText += 'images:\n'
        for (const image of story.images) {
          outputText += `- ${image}\n`
        }
      }
      if (story.tags.length > 0) {
        outputText += 'tags:\n'
        for (const tag of story.tags) {
          outputText += `- ${tag}\n`
        }
      }
      outputText += 'draft: true' + '\n'
      outputText += '---\n'

      outputText += story.markdown.join('\n')
      let path = `${output}.md`
      if (output) {
        if (hasImages) {
          path = `${output}/_index.md`
        }
        fs.writeFileSync(path, outputText)
        return
      } else if (!output && params && params.commands) {
        console.log(outputText)
        return outputText
      } else {
        return outputText
      }
    })
    .catch(err => {
      console.log('something went wrong')
      console.log(err)
      return err
    })
}
