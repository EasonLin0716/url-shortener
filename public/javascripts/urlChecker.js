const Urls = require('../../models/urls')
const randomGenerator = require('./randomGenerator')


function urlChecker(shortenLink) {
  return new Promise((resolve, reject) => {
    Url
      .findOne({ shortenLink: shortenLink })
      .exec((err, url) => {
        if (err) reject(err)
        if (url === null) {
          resolve(false)
        } else {
          shortenLink = randomGenerator(5)
          resolve(true)
        }
      })
  })
}

module.exports = urlChecker