const utils = require('./utils')
const path = require('path')
const fs = require('fs')
const r2 = require('r2')
const slugify = require('underscore.string/slugify')

function createFolder(path) {
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }
  } catch (err) {
    // may exist already, ignore
    console.error(err)
  }
  return
}

module.exports = async function(mediumURL, params) {
  if (!mediumURL || mediumURL.substr(0, 18) !== 'https://medium.com') {
    throw new Error('no url or not a medium.com url')
  }

  let output = null
  const json = await utils.loadMediumPost(mediumURL)
  const s = json.payload.value
  const story = {}
  const images = []

  story.title = s.title
  story.subtitle = s.virtuals.subtitle
  story.date = new Date(s.createdAt).toJSON()
  story.slug = s.slug
  story.url = s.canonicalUrl
  story.images = []
  story.language = s.detectedLanguage
  if (s.virtuals.tags) {
    story.tags = s.virtuals.tags.map(t => t.slug)
  }
  if (s.license && s.license !== 0) {
    story.license = s.license
  }

  if (s.virtuals.previewImage) {
    story.featuredImage = s.virtuals.previewImage.imageId
  }

  if (params && params.info) {
    process.exit(0)
  }

  if (params) {
    output = params.output ? params.output : 'content'
  } else {
    output = process.env.PWD
  }

  story.sections = s.content.bodyModel.sections
  story.paragraphs = s.content.bodyModel.paragraphs

  const sections = []
  for (let i = 0; i < story.sections.length; i++) {
    const s = story.sections[i]
    const section = utils.processSection(s, images)
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
      const text = utils.processParagraph(p, images)
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
      if (!!images.length) {
        let featuredImage = story.featuredImage
        let outputPath = path.join(output, story.slug, 'images')
        createFolder(outputPath)
        story.images = await utils.downloadImages(images, {
          featuredImage: featuredImage,
          imageFolder: outputPath
        })
      } else {
        createFolder(output)
      }

      for (let text of results) {
        story.markdown.push(text)
      }

      if (params && params.debug) {
        console.log('debug', story.paragraphs)
      }

      // frontmatter
      let outputText = '---\n'
      outputText += `slug: ${story.slug}\n`
      outputText += `date: ${story.date}\n`
      outputText += `title: ${story.title}\n`
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
        outputText += 'keywords:\n'
        for (const tag of story.tags) {
          outputText += `- ${tag}\n`
        }
      }
      outputText += 'draft: true' + '\n'
      outputText += '---\n'

      outputText += story.markdown.join('\n')

      let outputPath = `${output}/${story.slug}.md`
      if (output) {
        if (!!images.length) {
          outputPath = path.join(output, story.slug) + '/index.md'
        }
        fs.writeFileSync(outputPath, outputText)
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
