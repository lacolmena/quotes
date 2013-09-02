var express = require('express');
var app = express();

var quotes = [
	{ author : 'Marcel Proust', text : "The time which we have at our disposal every day is elastic; the passions we feel expand it, those that we inspire contract it, and habit fills up what remains.", id: 0 },
	{ author : 'Aristotle', text : "We live in deeds, not years; in thoughts not breaths; in feelings, not in figures on a dial. We should count time by heart throbs. He most lives who thinks most, feels the noblest, acts the best.", id: 1 },
  	{ author : 'Muhammad Ali', text : "The fight is won or lost far away from the witnesses, behind the lines, in the gym, and out there on the road; long before I dance under those lights.", id: 2 },
  	{ author : 'Leonardo', text : "Once you have flown, you will walk the earth with your eyes turned skywards, for there you have been, and there you long to return.", id: 3 }
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