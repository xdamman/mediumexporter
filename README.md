# Medium Exporter

Export your stories published on medium.com to markdown.

## Usage

    ./index.js {url}
        -O, --output - write to specified output directory
        -I, --info – Show information about the medium post

## CLI example

If not output directory is specified, images and content will be downloaded into `/content`

    ./index.js https://medium.com/@PatrickHeneise/malaysia-16be98ab673e

## programmatic example

### get individual posts

    async function example() {
      await mediumexporter.getPost('url', {
        output: "./content/posts"
      });
      console.log("done");
    }

### get feeds (default page size is 10)

    const exporter = require('./index')
    exporter.getFeed('https://medium.com/feed/@xdamman', { output: 'content' })
