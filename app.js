var express = require('express'),
	stylus = require('stylus'),
	nib = require('nib'),
	mongoose = require('mongoose')

// Configure Mongoose to connect to Mongolab or locally hosted db
var uristring = 
process.env.MONGOLAB_URI || 
process.env.MONGOHQ_URL || 
'mongodb://localhost/quotes'

mongoose.connect(uristring, function (err, res) {
  if (err) { 
  console.log ('ERROR connecting to: ' + uristring + '. ' + err)
  } else {
  console.log ('Succeeded connecting to: ' + uristring)
  }
})

// Set up Mongoose schema
var Schema = mongoose.Schema
var QuoteSchema = new Schema({
	author: String,
	text: String
})

var Quote = mongoose.model('Quote', QuoteSchema)

// Initialise and configure Express
var app = express()

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

// Compile CSS with Stylus
function compile (str, path) {
	return stylus (str)
		.set('filename', path)
		.use(nib())
}

// Choose and display random quote
app.get('/', function (req, res) {
	Quote.find({}, function (err, data) {
		var random = data[Math.floor(Math.random() * data.length)]
		res.render('quote', { title: 'Random quote', q: random })
	})
})

// Display all quotes in the db
app.get('/quote/all', function (req, res) {
	Quote.find({}, function (err, data) {
		res.render('quotes', { title: 'List of all quotes', quotes: data })
	})
})

// Render a form to post a new quote to the db
app.get('/quote/new', function (req, res) {
	res.render('new')
})

// View an individual quote through its MongoDB _ID field
app.get('/quote/:id', function (req, res) {
	Quote.findById(req.params.id, function (err, data) {
		res.render('quote', { title: 'Quote by ' + data.author, q: data } )
	})
})

// View all quotes from a given author
app.get('/author/:id', function (req, res) {
	Quote.find({author: req.params.id}, function (err, data) {
		res.render('quotes', { title: "Quotes by " + req.params.id, quotes: data })
	})
})

// Post form data to the db
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

// Delete a quote from the db via its _ID
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

// Start the app
var port = process.env.PORT || 5000
app.listen(port, function() {
  console.log("Listening on " + port)
})