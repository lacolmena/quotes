var express = require('express'),
	stylus = require('stylus'),
	nib = require('nib'),
	mongoose = require('mongoose')

var uristring = 
process.env.MONGOLAB_URI || 
process.env.MONGOHQ_URL || 
'mongodb://heroku_app17969369:f0ffs6s67i4uqkm1ha3p86862v@ds043338.mongolab.com:43338/heroku_app17969369'

mongoose.connect(uristring, function (err, res) {
  if (err) { 
  console.log ('ERROR connecting to: ' + uristring + '. ' + err)
  } else {
  console.log ('Succeeded connecting to: ' + uristring)
  }
})

var Schema = mongoose.Schema
var QuoteSchema = new Schema({
	author: String,
	text: String
})

var Quote = mongoose.model('Quote', QuoteSchema)

var app = express()

function compile (str, path) {
	return stylus (str)
		.set('filename', path)
		.use(nib())
}

app.configure(function(){
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.bodyParser())
app.use(express.methodOverride())
app.use(app.router)
app.use(express.static(__dirname + '/public'))
app.use(stylus.middleware(
	{ src: __dirname + '/public', compile: compile}))
})

app.get('/', function (req, res) {
	Quote.find({}, function (err, data) {
		res.render('quotes', {title: 'List of all quotes', quotes: data})
	})
})

app.get('/quote/new', function (req, res) {
	res.render('new')
})

app.get('/quote/:id', function (req, res) {
	Quote.findById(req.params.id, function (err, data) {
		res.render('quote', {q: data} )
	})
})

app.get('/author/:id', function (req, res) {
	Quote.find({author: req.params.id}, function (err, data) {
		res.render('quotes', {title: "Quotes from " + req.params.id, quotes: data})
	})
})

app.post('/quote/new', function (req, res) {
	if (!req.body.hasOwnProperty('author') || !req.body.hasOwnProperty('text')) {
		res.statusCode = 400
		return res.send('Error 400: Post syntax incorrect.')
	}
	var entryData = {
		author : req.body.author,
		text : req.body.text
	}
	var newQuote = new Quote(entryData)
	newQuote.save(function (err, data) {
		if (err) {
			res.json(err)
		} else {
			res.statusCode = 201
			res.send()
		}
	})
	res.render('added')
})

app.delete('/quote/:id', function (req, res) {
	Quote.findById(req.params.id, function (err, quote) {
		quote.remove(function (err) {
			if (err) {
				res.json(err)
			} else {
				res.send()
			}
		})
	})
	res.render('deleted')
})

app.listen(process.env.port || 5000, function() {
	console.log("Listening on port 5000 in %s mode.", app.settings.env);
})