/* -----require needed middlewares and others----- */
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const exphbs = require('express-handlebars')
const flash = require('connect-flash')
const bodyParser = require('body-parser')
const randomGenerator = require('./public/javascripts/randomGenerator')

/* -----db connecting----- */
mongoose.connect('mongodb://localhost/url-shortener', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
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

app.get('/', (req, res) => {
  createLinkSuccess = false
  res.render('index', { createLinkSuccess })
})

app.post('/', (req, res) => {
  // prevent postman attack
  const urlReg = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm
  if (!urlReg.test(req.body.link)) return res.send('This website is not valid')

  console.log(req.body.link)
  Urls.findOne({ link: req.body.link }, (err, url) => {
    if (err) return console.error(err)
    if (url) {
      createLinkSuccess = true
      res.render('index', { createLinkSuccess, shortenLink: url.shortenLink })
    } else {
      const urls = new Urls({
        link: req.body.link,
        shortenLink: randomGenerator(5)
      }).save((err, url) => {
        if (err) return console.error(err)
        console.log(url)
        createLinkSuccess = true
        res.render('index', { createLinkSuccess, shortenLink: url.shortenLink })
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