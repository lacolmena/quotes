var express = require('express');
var app = express();

var quotes = [
	{ author : 'Audrey Hepburn', text : "Nothing is impossible, the word itself says 'I'm possible'!", id: 0 },
	{ author : 'Walt Disney', text : "You may not realize it when it happens, but a kick in the teeth may be the best thing in the world for you.", id: 1 },
  	{ author : 'Unknown', text : "Even the greatest was once a beginner. Don't be afraid to take that first step.", id: 2 },
  	{ author : 'Neale Donald Walsch', text : "You are afraid to die, and you're afraid to live. What a way to exist.", id: 3 }
];

app.configure(function(){
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/public'));
});

app.get('/', function (req, res) {
	res.render('quotes', {title: 'Quotes', quotes: quotes});
})

app.get('/quote/random', function (req, res) {
	var id = Math.floor(Math.random() * quotes.length);
	var q = quotes[id];
	res.render('random', { q: q } );
});

app.get('/quote/new', function (req, res) {
	res.render('new');
})

app.get('/quote/:id', function (req, res) {
	if (quotes.length <= req.params.id || req.params.id < 0 ) {
		res.statusCode = 404;
		return res.send('Error 404: No quote found.');
	}

	var q = quotes[req.params.id];
	res.render('quote', { q: q } );
});

app.post('/quote/new', function (req, res) {
	if (!req.body.hasOwnProperty('author') || !req.body.hasOwnProperty('text')) {
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect.');
	}
	var newQuote = {
		author : req.body.author,
		text : req.body.text,
		id: quotes.length
	};
	quotes.push(newQuote);
	res.redirect('/');
});

app.delete('/quote/:id', function (req, res) {
	if(quotes.length <= req.params.id) {
		res.statusCode = 404;
		return res.send('Error 404: No quote found.');
	}
	console.log(req.params.id);
	quotes.splice(req.params.id, 1);
	res.redirect('/');
});

app.listen(process.env.port || 3000, function() {
	console.log("Listening on port 3000 in %s mode.", app.settings.env);
});