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
app.get('/', (req, res) => {
  res.render('index')
})

app.post('/', (req, res) => {
  console.log(req.body.link)
  const urls = new Urls({
    link: req.body.link,
    shortenLink: randomGenerator(5)
  }).save(err => {
    if (err) return console.error(err)
    res.redirect('/')
  })
})

app.listen(process.env.PORT || 3000, () => {
  console.log('app.js is running')
})