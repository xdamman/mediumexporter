x = require('./index')
console.log(x)
x.getFeed('https://medium.com/feed/@patrickheneise', { output: 'content' })
