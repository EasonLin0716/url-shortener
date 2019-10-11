/* -----require needed middlewares and others----- */
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const exphbs = require('express-handlebars')
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const randomGenerator = require('./public/javascripts/randomGenerator')
const urlChecker = require('./public/javascripts/urlChecker')

/* -----db connecting----- */
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/url-shortener', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
const db = mongoose.connection
db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  console.log('mongodb connected!')
})
const Urls = require('./models/urls')

/* -----middleware setting----- */
app.use(express.static('public'))
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(flash())

/* -----route setting----- */
let createLinkSuccess = false


app.get('/', async (req, res) => {
  let numOfShortUrlUsed = 0
  await Urls.find({}, (err, urls) => {
    numOfShortUrlUsed = urls.length
  })
  createLinkSuccess = false
  res.render('index', { createLinkSuccess, numOfShortUrlUsed })
})


app.post('/', (req, res) => {
  // 若使用者沒有輸入內容，就按下了送出鈕，需要防止表單送出並提示使用者
  const urlReg = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm
  if (!urlReg.test(req.body.link)) return res.send('This website is not valid')
  console.log(req.body.link)
  const baseUrl = `${req.protocol}://${req.headers.host}/`
  Urls.findOne({ link: req.body.link }, async (err, url) => {
    if (err) return console.error(err)
    // 如果使用者輸入的網址已存在，會從資料庫回傳別人已發送過的短網址
    if (url) {
      createLinkSuccess = true
      res.render('index', { createLinkSuccess, shortenLink: url.shortenLink, baseUrl })
    } else {
      let shortenLink = randomGenerator(5)
      let shortenLinkIsExist = await urlChecker(shortenLink)
      while (shortenLinkIsExist) {
        // 如果隨機產生的短網址已存在，會重新產生新的
        shortenLink = randomGenerator(5)
        shortenLinkIsExist = await urlChecker(shortenLink)
      }

      // 儲存連結至資料庫
      const urls = new Urls({
        link: req.body.link,
        shortenLink: shortenLink
      }).save((err, url) => {
        if (err) return console.error(err)
        console.log(url)
        createLinkSuccess = true
        res.render('index', { createLinkSuccess, shortenLink: url.shortenLink, baseUrl })
      })
    }
  })
})


app.get('/:id', (req, res) => {
  Urls.findOne({ shortenLink: req.params.id }, (err, url) => {
    if (err) return console.error(err)
    if (!url) {
      // if user type wrong link will warn
      res.render('linkFailure', { failureLink: req.params.id })
    } else {
      res.redirect(`${url.link}`)
    }
  })
})


app.get('*', (req, res) => {
  res.redirect('/')
})



app.listen(process.env.PORT || 3000, () => {
  console.log('app.js is running')
})