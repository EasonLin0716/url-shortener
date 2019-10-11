const Urls = require('../../models/urls')
const randomGenerator = require('./randomGenerator')


function urlChecker(shortenLink) {
  return new Promise((resolve, reject) => {
    // 進入檢查迴圈
    Urls
      .findOne({ shortenLink: shortenLink })
      .exec((err, url) => {
        console.log(url)
        if (err) reject(err)
        if (url === null) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
  })
}

module.exports = urlChecker