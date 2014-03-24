/**
 * The Bridge namespace.
 * @namespace Bridge
 */
var Bridge = {};

// The suits for cards as well as bidding
Bridge.Suits = { 
	'n' : { name : 'NT'},
	's' : { name : '<font color="000000">&spades;</font>' }, 
	'h' : { name : '<font color="CB0000">&hearts;</font>' }, 
	'd' : { name : '<font color="CB0000">&diams;</font>' }, 
	'c' : { name : '<font color="000000">&clubs;</font>' }, 
};	

// Suits for bidding. Add NT
Bridge.CardSuitOrder = [ 's', 'h', 'd', 'c' ];
Bridge.BidSuitOrder = [ 'n', 's', 'h', 'd', 'c' ];

// The bridge ranks
Bridge.Ranks = { 
	'a' : { name : 'A', 	index : 0 }, 
	'k' : { name : 'K', 	index : 1 }, 
	'q' : { name : 'Q',		index : 2 }, 
	'j' : { name : 'J', 	index : 3 }, 
	't' : { name : 'T', 	index : 4 }, 
	'9' : { name : '9', 	index : 5 }, 
	'8' : { name : '8', 	index : 6 }, 
	'7' : { name : '7', 	index : 7 }, 
	'6' : { name : '6', 	index : 8 }, 
	'5' : { name : '5', 	index : 9 }, 
	'4' : { name : '4', 	index : 10 }, 
	'3' : { name : '3', 	index : 11 }, 
	'2' : { name : '2', 	index : 12 }, 
};

// The order of ranks
Bridge.RankOrder = [ 'a', 'k', 'q', 'j', 't', '9', '8', '7', '6', '5', '4', '3', '2' ];


// The compass directions
Bridge.Directions = { 
	'n' : { name : 'North',	layout : 'horizontal',	position : 'top',		index: 0 },
	'e' : { name : 'East',	layout : 'vertical',	position : 'right',		index: 1 },
	's' : { name : 'South',	layout : 'horizontal',	position : 'bottom',	index: 2 },
	'w' : { name : 'West',	layout : 'vertical',	position : 'left',		index: 3 },
};

// The order of Directions
Bridge.DirectionOrder = [ 'n', 'e', 's', 'w' ];

/**
 * Creates an instance of a Playing Card.
 *
 * @constructor
 * @this {Bridge.Card}
 * @param {string} suit a character representing the suit of this card
 * @param {string} rank a character representing the rank of this card
 * @param {string} direction a character representing the direction this card is assigned to (optional)
 */
Bridge.Card = function( suit, rank, direction ) {
	if ( Bridge.CardSuitOrder.indexOf( suit ) !== -1 )	this.suit = suit;
	else throw 'In Bridge.Card constructor ' + suit + ' is a not valid suit!';
	if ( rank in Bridge.Ranks ) this.rank = rank;
	else throw 'In Bridge.Card constructor ' + rank + ' is a not valid rank!';
	if ( direction === undefined ) {
		this.direction = null;
	}
	else {
		if ( direction in Bridge.Directions ) this.direction = direction;
		else throw 'In Bridge.Card constructor ' + direction + ' is a not valid direction!';
	}
};

// The set of all bridge cards
Bridge.Cards = {};
for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
	var suit = Bridge.CardSuitOrder[ i ];
	Bridge.Cards[ suit ] = {};
	for ( var rank in Bridge.Ranks ) {
		Bridge.Cards[ suit ][ rank ] = new Bridge.Card( suit, rank );
	}
}

/**
 * Creates an instance of a Bid.
 *
 * @constructor
 * @this {Bridge.Bid}
 * @param {number} level a number indicating level of this bid (ignored for pass, double and redouble)
 * @param {string} suit a character representing the suit of this bid
 * @param {string} madeBy a character represemting the direction that made this bid (optional)
 */
Bridge.Bid = function( level, suit, direction ) {
	if ( suit === 'p' || suit === 'x' || suit === 'r' ) {
		this.suit = suit;
	}
	else {
		if ( Bridge.BidSuitOrder.indexOf( suit ) !== -1 ) this.suit = suit;
		else throw 'In Bridge.Bid constructor ' + suit + ' is a not valid suit!';
		if ( isNaN( level ) || level < 0 || level > 7 ) {
			throw 'In Bridge.Bid constructor ' + level + ' is a not valid level!';
		}
		else this.level = level;
	}
	if ( direction === undefined ) {
		this.direction = null;
	}
	else {
		if ( direction in Bridge.Directions ) this.direction = direction;
		else throw 'In Bridge.Card constructor ' + direction + ' is a not valid direction!';
	}
	
};

/**
 * Creates an instance of a Hand.
 *
 * @constructor
 * @this {Bridge.Hand}
 * @param void
 */
Bridge.Hand = function() {
	this.cards = {};
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		this.cards[ suit ] = {};
	}	
};

/**
 * Creates an instance of a Bridge Deal.
 *
 * @constructor
 * @this {Bridge.Deal}
 * @param void
 */
Bridge.Deal = function() {
	this.hands = {};
	for( var direction in Bridge.Directions ) {
		this.hands[ direction ] = new Bridge.Hand();
	}
	this.auction = [];	
};



