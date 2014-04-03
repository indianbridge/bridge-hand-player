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
	'c' : { name : '<font color="000000">&clubs;</font>' }
};
Bridge.getSuitName = function( suit ) { 
	return Bridge.Suits[ suit ].name; 
};

// Suits for bidding. Add NT
Bridge.CardSuitOrder = [ 's', 'h', 'd', 'c' ];
Bridge.checkCardSuit = function( suit ) {
	if ( Bridge.CardSuitOrder.indexOf( suit ) === -1 ) {
		throw suit + ' is not a valid Card Suit!';
	}
};

Bridge.BidSuitOrder = [ 'n', 's', 'h', 'd', 'c' ];
Bridge.checkBidSuit = function( suit ) {
	if ( Bridge.BidSuitOrder.indexOf( suit ) === -1 ) {
		throw suit + ' is not a valid Bid Suit!';
	}	
};

// The bridge ranks
Bridge.Ranks = { 
	'a' : { name : 'A',	index : 0 }, 
	'k' : { name : 'K',	index : 1 }, 
	'q' : { name : 'Q',	index : 2 }, 
	'j' : { name : 'J',	index : 3 }, 
	't' : { name : 'T',	index : 4 }, 
	'9' : { name : '9',	index : 5 }, 
	'8' : { name : '8',	index : 6 }, 
	'7' : { name : '7',	index : 7 }, 
	'6' : { name : '6',	index : 8 }, 
	'5' : { name : '5',	index : 9 }, 
	'4' : { name : '4',	index : 10 }, 
	'3' : { name : '3',	index : 11 }, 
	'2' : { name : '2',	index : 12 }
};

Bridge.getRankName = function( rank ) {
	return Bridge.Ranks[ rank ].name;
};

// The order of ranks
Bridge.RankOrder = [ 'a', 'k', 'q', 'j', 't', '9', '8', '7', '6', '5', '4', '3', '2' ];
Bridge.checkRank = function( rank ) {
	if( ! ( rank in Bridge.Ranks ) ) {
		throw rank + ' is not a valid Rank!';
	}
	return true;
};
Bridge.isGreaterRank = function( rank1, rank2 ) {
	var index1 = Bridge.RankOrder.indexOf( rank1 );
	var index2 = Bridge.RankOrder.indexOf( rank2 );
	return  index1 < index2;
};

// The compass directions
Bridge.Directions = { 
	'n' : { name : 'North', layout : 'horizontal', position : 'top', lho: 'e', rho: 'w' },
	'e' : { name : 'East', layout : 'vertical', position : 'right', lho: 's', rho: 'n' },
	's' : { name : 'South', layout : 'horizontal', position : 'bottom', lho: 'w', rho: 'e' },
	'w' : { name : 'West', layout : 'vertical', position : 'left', lho: 'n', rho: 's' }
};

Bridge.getDirectionName = function( direction ) {
	return Bridge.Directions[ direction ].name;
};

// The order of Directions
Bridge.DirectionOrder = [ 'n', 'e', 's', 'w' ];
Bridge.checkDirection = function( direction ) {
	if ( ! ( direction in Bridge.Directions ) ) {
		throw direction + ' is not a valid direction!';
	}
	return true;
};

Bridge.areOppositeDirections = function( direction1, direction2 ) {
	return ( (direction1 === 'n' || direction1 === 's') && (direction2 === 'e' || direction2 === 'w') )	|| 
	( (direction1 === 'e' || direction1 === 'w') && (direction2 === 'n' || direction2 === 's') );
};

// Check bid level
Bridge.checkLevel = function( level ) {
	if ( isNaN( level ) || level < 1 || level > 7 ) {
		throw level + ' is a not a valid bidding level!';
	}
};

// Check is vulnerability is valid
Bridge.checkVulnerability = function( vul ) {
	if ( ! ( vul in Bridge.Vulnerability ) ) {
		throw vul + ' is not a valid Vulnerability!';
	}
};

// Who is sitting to the left
Bridge.getLHO = function( direction ) {
	Bridge.checkDirection( direction );
	return Bridge.Directions[ direction ].lho;
};

// Who is sitting to the right
Bridge.getRHO = function( direction ) {
	Bridge.checkDirection( direction );
	return Bridge.Directions[ direction ].rho;
};

// vulnerability
Bridge.Vulnerability = {
	'-' : { name : 'None' },
	'n' : { name : 'North-South' },
	'e' : { name : 'East-West' },
	'b' : { name : 'Both' }
};

Bridge.getVulnerabilityName = function( vul ) {
	return Bridge.Vulnerability[ vul ].name;
};

/**
 * Creates an instance of a Playing Card.
 */
Bridge.Card = function( suit, rank, direction ) {
	Bridge.checkCardSuit( suit );
	this.suit = suit;
	Bridge.checkRank( rank );
	this.rank = rank;
	if ( direction === undefined ) {
		this.direction = null;
	}
	else {
		Bridge.checkDirection( direction );
		this.direction = direction;
	}
	this.played = false;
};

/**
 * Set the status of this card to played.
 */
Bridge.Card.prototype.play = function() {
	if ( this.played ) throw Bridge.getSuitName( this.suit ) + Bridge.getRankName( this.rank ) + ' has already been played!';
	this.played = true;
};

/**
 * Reset the status of this card to unplayed.
 */
Bridge.Card.prototype.reset = function() {
	this.played = false;
};

/**
 * Set the status of this card to unplayed.
 */
Bridge.Card.prototype.undo = function() {
	if ( ! this.played ) throw Bridge.getSuitName( this.suit ) + Bridge.getRankName( this.rank ) + ' has not been played!';
	this.played = false;
};

/**
 * Who is this card assigned To?
 */
Bridge.Card.prototype.getDirection = function() {
	return this.direction;
};

/**
 * Assign this card to a direction.
 */
Bridge.Card.prototype.setDirection = function( direction ) {
	this.direction = direction;	
};

// The set of all bridge cards
Bridge.Cards = {};
for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
	var suit = Bridge.CardSuitOrder[ i ];
	Bridge.Cards[ suit ] = {};
	for ( var rank in Bridge.Ranks ) {
		if ( Bridge.Ranks.hasOwnProperty( rank ) ) {
			Bridge.Cards[ suit ][ rank ] = new Bridge.Card( suit, rank );
		}
	}
}

Bridge.Cards.isAssigned = function( suit, rank ) {
	Bridge.checkCardSuit( suit );
	Bridge.checkRank( rank );
	return Bridge.Cards[ suit ][ rank ].getDirection() !== null;	
};

Bridge.Cards.reset = function() {
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		for ( var rank in Bridge.Ranks ) {
			if ( Bridge.Ranks.hasOwnProperty( rank ) ) {
				Bridge.Cards[ suit ][ rank ].reset();
			}
		}
	}	
};

// The set of played cards on this Deal
Bridge.PlayedCard = function( suit, rank, direction, annotation ) {
	if ( annotation === undefined ) annotation = null;
	Bridge.checkCardSuit( suit );
	Bridge.checkRank( rank );
	Bridge.checkDirection( direction );
	this.suit = suit;
	this.rank = rank;
	this.direction = direction;
	this.annotation = annotation;
	this.nextPlayedCard = null;
	this.previousPlayedCard = null;
	this.playNumber = 0;
	this.trickWinner = null;
	this.ledCard = null;
	this.ewTricks = 0;
	this.nsTricks = 0;
};

// Do we beat the trick winner so far
Bridge.PlayedCard.prototype.winTrick = function( trumpSuit ) {
	if ( this.playNumber % 4 === 1 ) return true;
	var trickWinner = this.getTrickWinner();
	var suit2 = trickWinner.getSuit();
	var rank2 = trickWinner.getRank();
	if ( this.suit !== trumpSuit) {
		if ( suit2 === trumpSuit ) return false;
		else if ( this.suit === suit2 && Bridge.isGreaterRank( this.rank, rank2 ) ) return true;
		return false;
	}
	else {
		if ( suit2 !== trumpSuit || Bridge.isGreaterRank( this.rank, rank2 ) ) return true;
		return false;
	}
};

// Who plays next
Bridge.PlayedCard.prototype.getNextToPlay = function() {
	if ( this.playNumber % 4 === 0 ) {
		return this.trickWinner.direction;
	}
	else return Bridge.getLHO( this.direction );	
};

// Which suit was led
Bridge.PlayedCard.prototype.getSuitLed = function() {
	if ( this.playNumber % 4 === 0 ) return null;
	else {
		var play = this;
		while ( play.getPlayNumber() % 4 !== 1 ) play = play.getPreviousCard();
		return play.getSuit();
	}	
};


// Getters and Setters

Bridge.PlayedCard.prototype.setNSTricks = function( nsTricks ) {
	this.nsTricks = nsTricks;	
};

Bridge.PlayedCard.prototype.setEWTricks = function( ewTricks ) {
	this.ewTricks = ewTricks;	
};

Bridge.PlayedCard.prototype.getNSTricks = function() {
	return this.nsTricks;
};

Bridge.PlayedCard.prototype.getEWTricks = function() {
	return this.ewTricks;	
};

Bridge.PlayedCard.prototype.incrementNSTricks = function() {
	this.nsTricks++;	
};

Bridge.PlayedCard.prototype.incrementEWTricks = function() {
	this.ewTricks++;	
};

Bridge.PlayedCard.prototype.getAnnotation = function() {
	return this.annotation;
};

Bridge.PlayedCard.prototype.setAnnotation = function( annotation ) {
	this.annotation = annotation;
};

Bridge.PlayedCard.prototype.getDirection = function() {
	return this.direction;
};

Bridge.PlayedCard.prototype.setDirection = function( direction ) {
	this.direction = direction;	
};

Bridge.PlayedCard.prototype.getTrickWinner = function() {
	return this.trickWinner;
};

Bridge.PlayedCard.prototype.setTrickWinner = function( trickWinner ) {
	this.trickWinner = trickWinner;	
};

Bridge.PlayedCard.prototype.getPlayNumber = function() {
	return this.playNumber;	
};

Bridge.PlayedCard.prototype.setPlayNumber = function( playNumber ) {
	this.playNumber = playNumber;	
};

Bridge.PlayedCard.prototype.getPreviousCard = function() {
	return this.previousPlayedCard;
};

Bridge.PlayedCard.prototype.getNextCard = function() {
	return this.nextPlayedCard;	
};

Bridge.PlayedCard.prototype.getSuit = function() {
	return this.suit;
};

Bridge.PlayedCard.prototype.getRank = function() {
	return this.rank;
};

Bridge.PlayedCard.prototype.setNextCard = function( card ) {
	this.nextPlayedCard = card;
};

Bridge.PlayedCard.prototype.setPreviousCard = function( card ) {
	this.previousPlayedCard = card;
};

/**
 * Creates an instance of a Bid.
 *
 * @constructor
 * @this {Bridge.Bid}
 * @param {number} level a number indicating level of this bid (ignored for pass, double and redouble)
 * @param {string} suit a character representing the suit of this bid
 * @param {string} annotation any annotation added to this bid
 */
Bridge.Bid = function( level, suit, direction, annotation ) {
	if ( annotation === undefined ) annotation = null;
	if ( suit === 'p' || suit === 'x' || suit === 'r' ) {
		this.suit = suit;
	}
	else {
		Bridge.checkBidSuit( suit );
		this.suit = suit;
		Bridge.checkLevel( level );
		this.level = level;
	}
	Bridge.checkDirection( direction );
	this.direction = direction;
	this.annotation = annotation;
	this.previousBid = null;
	this.nextBid = null;
};

//Get the string representation of this bid
Bridge.Bid.prototype.getString = function() {
	var bidString = '';
	if ( this.suit === 'x' ) bidString = '<font color="red">X</font>';
	else if ( this.suit === 'r' ) bidString = '<font color="blue">XX<font>';
	else if ( this.suit === 'p' ) bidString = '<font color="green">P</font>';
	else if ( this.suit in Bridge.Suits ) {
		bidString = this.level + Bridge.getSuitName( this.suit );
	}	
	else bidString = 'Unknown';
	return {
		bid: bidString,
		annotation: this.annotation
	};
};

// Some getters & setters for Bid
Bridge.Bid.prototype.getLevel = function() {
	return this.level;
};

Bridge.Bid.prototype.getSuit = function() {
	return this.suit;	
};

Bridge.Bid.prototype.getDirection = function() {
	return this.direction;
};

Bridge.Bid.prototype.getAnnotation = function() {
	return this.annotation;
};

Bridge.Bid.prototype.setAnnotation = function( annotation ) {
	this.annotation = annotation;
};

Bridge.Bid.prototype.getNextBid = function() {
	return this.nextBid;
};

Bridge.Bid.prototype.setNextBid = function( bid ) {
	this.nextBid = bid;
};

Bridge.Bid.prototype.getPreviousBid = function() {
	return this.previousBid;
};

Bridge.Bid.prototype.setPreviousBid = function( bid ) {
	this.previousBid = bid;
};

// Count number of consecutive passed before this bid including this bid
Bridge.Bid.prototype.countPasses = function() {
	var bid = this;
	var count = 0;
	if ( bid.getSuit() === 'p' ) count++;
	while( bid.getSuit() === 'p' && bid.getPreviousBid() !== null ) {
		bid = bid.getPreviousBid();
		if ( bid.getSuit() === 'p' ) count++;
	}	
	return count;
};

/**
 * Creates an instance of a Hand.
 */
Bridge.Hand = function( direction ) {
	this.cards = {};
	this.name = null;
	this.direction = direction;
	this.numCards = 0;
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		this.cards[ suit ] = {};
	}
};

/**
 * Does this hand have the specified card?
 */
Bridge.Hand.prototype.hasCard = function( suit, rank ) {
	if ( ! ( suit in this.cards ) ) {
		return false;
	}	
	if ( ! ( rank in this.cards[ suit ] ) ) return false;
	return true;
};

/**
 * Set the name of the person holding this hand
 */
Bridge.Hand.prototype.setName = function( name ) {
	this.name = name;
};

/**
 * Get the name of person holding this hand
 */
Bridge.Hand.prototype.getName = function() {
	return this.name;	
};

/**
 * How many cards does this hand have?
 */
Bridge.Hand.prototype.getNumCards = function() {
	return this.numCards;
};

/**
 * Add a card to this hand.
 */
Bridge.Hand.prototype.addCard = function( suit, rank ) {
	Bridge.checkCardSuit( suit );
	Bridge.checkRank( rank );
	this.cards[ suit ][ rank ] = Bridge.Cards[ suit ][ rank ];
	this.numCards++;
};
 
 /**
 * Remove a card from this hand.
 */
Bridge.Hand.prototype.removeCard = function( suit, rank ) {
	Bridge.checkCardSuit( suit );
	Bridge.checkRank( rank );
	if ( this.cards[ suit ][ rank ] === undefined ) {
		throw 'In Bridge.Hand.removeCard ' + Bridge.getSuitName( suit ) + Bridge.getRankName( rank ) + ' is not found!';
	}
	delete this.cards[ suit ][ rank ];
	this.numCards--;
};


/**
 * Creates an instance of a Bridge Deal.
 */
Bridge.Deal = function() {
	// hand related
	this.hands = {};
	for( var direction in Bridge.Directions ) {
		if ( Bridge.Directions.hasOwnProperty( direction ) ) {
			this.hands[ direction ] = new Bridge.Hand( direction );
		}
	}
	
	// auction related
	this.firstBid = null;
	this.lastBid = null;
	this.currentLevels = {
		level: 0,
		suit: '',
		direction: '',
		doubled: false,
		redoubled: false
	};
	
	// Deal information
	this.board = 1;
	this.dealer = 'n';
	this.vulnerability = '-';
	this.trumpSuit = null;
	this.leader = null;
	this.contract = null;
	this.notes = null;
	
	
	//play related
	this.firstPlayedCard = null;
	this.lastPlayedCard = null;
	this.currentPlayedCard = null;
	this.savedPlays = {};
	this.loadedPlay = null;
};

Bridge.Deal.prototype.isAtBeginning = function() {
	return this.currentPlayedCard === null;
};

Bridge.Deal.prototype.isAtEnd = function() {
	return this.currentPlayedCard === this.lastPlayedCard;
};

/**
 * Is this a valid play number?
 */
Bridge.Deal.prototype.isValidPlayNumber = function( playNumber ) {
	if ( isNaN( playNumber) || playNumber < 0 ) return false;
	if ( this.lastPlayedCard === null ) {
		return playNumber === 0;
	}
	else {
		return playNumber <= this.lastPlayedCard.getPlayNumber();
	}
};

/**
 * Get the play number of the currently played card
 */
Bridge.Deal.prototype.getPlayNumber = function() {
	if ( this.currentPlayedCard === null ) return 0; 
	else return this.currentPlayedCard.getPlayNumber();
};

/** 
 * Is the current play at the specified play number?
 */
Bridge.Deal.prototype.isAtPlayNumber = function( playNumber ) {
	if ( this.currentPlayedCard === null ) return false; 
	else return this.currentPlayedCard.getPlayNumber() === playNumber;
};

Bridge.Deal.prototype.isNewTrick = function() {
	if ( this.currentPlayedCard === null || this.currentPlayedCard.getPlayNumber() % 4 === 1 ) return true;
	return false;
};

Bridge.Deal.prototype.isEndOfTrick = function() {
	if ( this.currentPlayedCard === null || this.currentPlayedCard.getPlayNumber() % 4 === 0 ) return true;
	return false;
};

Bridge.Deal.prototype.getTableCards = function() {
	var card = this.currentPlayedCard;
	var cards = [];
	if ( card === null ) return cards;
	cards.push({ suit: card.getSuit(), rank: card.getRank() });
	card = card.getPreviousCard();
	while( card !== null && card.getPlayNumber() % 4 !== 0 ) {
		cards.push({ suit: card.getSuit(), rank: card.getRank() });
		card = card.getPreviousCard();
	}	
	return cards;
};

Bridge.Deal.prototype.playCard = function( suit, rank, direction, annotation ) {
	if ( direction === undefined || direction === null ) {
		if ( this.currentPlayedCard === null ) {
			direction = this.leader;
		}
		else {
			direction = this.currentPlayedCard.getNextToPlay();
		}
	}
	if ( annotation === undefined ) annotation = null;
	var card = new Bridge.PlayedCard( suit, rank, direction, annotation );
	if ( ! this.hands[ direction ].hasCard( suit, rank ) ) {
		throw Bridge.getDirectionName( direction ) + ' does not have ' + Bridge.getSuitName( suit ) + Bridge.getRankName( rank ) + '!';
	}
	if ( this.currentPlayedCard !== null ) {
		this.currentPlayedCard.setNextCard( card );
		card.setPlayNumber( this.currentPlayedCard.getPlayNumber() + 1 );
		card.setPreviousCard( this.currentPlayedCard );
		this.lastPlayedCard = card;
		card.setTrickWinner( this.currentPlayedCard.getTrickWinner() );
		if ( card.winTrick( this.trumpSuit ) ) {
			card.setTrickWinner( card );
		}
		card.setEWTricks( this.currentPlayedCard.getEWTricks() );
		card.setNSTricks( this.currentPlayedCard.getNSTricks() );
	}
	else {	
		this.firstPlayedCard = card;
		this.lastPlayedCard = card;
		card.setPlayNumber( 1 );
		card.setTrickWinner( card );
	}
	this.currentPlayedCard = card;
	if ( this.currentPlayedCard.getPlayNumber() % 4 === 0 ) {
		var winner = this.currentPlayedCard.getTrickWinner().getDirection();
		if ( winner === 'n' || winner === 's' ) this.currentPlayedCard.incrementNSTricks();
		else this.currentPlayedCard.incrementEWTricks();
	}
	this.loadedPlay = null;
	Bridge.Cards[ suit ][ rank ].play();
};

Bridge.Deal.prototype.hasUnsavedPlay = function() {
	return this.loadedPlay === null;	
};

/** 
 * Add annotation to play involing specified card
 */
Bridge.Deal.prototype.setAnnotationForCard = function( suit, rank, annotation ) {
	var card = this.firstPlayedCard;
	while( card !== null ) {
		if ( card.getSuit() === suit && card.getRank() === rank ) {
			card.setAnnotation( annotation );
			return;
		}
		card = card.getNextCard();
	}
	throw 'Card ' + suit + rank + ' was not found when trying to add annotation!';
};

Bridge.Deal.prototype.setAnnotationForBid = function( bidNumber, annotation ) {
	var bid = this.firstBid;
	var count = 0;
	while( bid !== null && count !== bidNumber ) {
		bid = bid.getNextBid();
		count++;
	}
	if ( bid !== null ) bid.setAnnotation( annotation );
	else {
		throw 'Bid was not found when trying to add annotation!';
	}
};

/** 
 * Get annotation for specified card
 */
Bridge.Deal.prototype.getAnnotationForCard = function( suit, rank ) {
	var card = this.firstPlayedCard;
	while( card !== null ) {
		if ( card.getSuit() === suit && card.getRank() === rank ) {
			return card.getAnnotation();
		}
		card = card.getNextCard();
	}
	throw 'Card ' + suit + rank + ' was not found when trying to add annotation!';
};

/** 
 * Get annotation for specified bid
 */
Bridge.Deal.prototype.getAnnotationForBid = function( bidNumber ) {
	var bid = this.firstBid;
	var count = 0;
	while( bid !== null && count !== bidNumber ) {
		bid = bid.getNextBid();
		count++;
	}
	if ( bid !== null ) return bid.getAnnotation();
	else {
		throw 'Bid was not found when trying to add annotation!';
	}
};

Bridge.Deal.prototype.resetPlayedCardIndex = function() {
	this.currentPlayedCard = null;
	Bridge.Cards.reset();
};

Bridge.Deal.prototype.resetAll = function() {
	this.currentPlayedCard = null;
	this.firstPlayedCard = null;
	this.lastPlayedCard = null;
	Bridge.Cards.reset();
};

Bridge.Deal.prototype.deletePlays = function() {
	this.currentPlayedCard = null;
	this.firstPlayedCard = null;
	this.lastPlayedCard = null;
	this.loadedPlay = null;
	this.savedPlays = [];
	Bridge.Cards.reset();
};

Bridge.Deal.prototype.savePlay = function( playName ) {
	if ( playName in this.savedPlays ) {
		throw 'There is already a saved play with name ' + playName + '. Please use a different name.';	
	}
	var playNumber = 0;
	if ( this.currentPlayedCard !== null ) playNumber = this.currentPlayedCard.getPlayNumber();
	this.savedPlays[ playName ] = {
		firstPlayedCard: this.firstPlayedCard,
		currentPlayNumber: playNumber,
		lastPlayedCard: this.lastPlayedCard
	};
	this.loadedPlay = playName;
};

Bridge.Deal.prototype.getSavedPlayNumber = function() {
	return this.savedPlays.length;
};

Bridge.Deal.prototype.getSavedPlayNames = function() {
	var playNames = [];
	for( var playName in this.savedPlays ) {
		if ( this.savedPlays.hasOwnProperty( playName ) ) {
			playNames.push(playName);
		}
	}
	return playNames;
};

Bridge.Deal.prototype.loadPlay = function( playName ) {
	if ( ! ( playName in this.savedPlays) ) {
		alert( playName + ' is not a valid saved line of play!' );
		return null;
	}	
	var play = this.savedPlays[ playName ];
	this.firstPlayedCard = play.firstPlayedCard;
	this.lastPlayedCard = play.lastPlayedCard;
	this.loadedPlay = playName;
	return play.currentPlayNumber;
};

Bridge.Deal.prototype.undoCard = function() {
	if ( this.currentPlayedCard === null ) {
		//throw 'No Plays to Undo!';
		return null;
	}
	else {
		var card = {
			suit: this.currentPlayedCard.getSuit(),
			rank: this.currentPlayedCard.getRank(),
			direction: this.currentPlayedCard.getDirection()
		};
		this.currentPlayedCard = this.currentPlayedCard.getPreviousCard();
		Bridge.Cards[ card.suit ][ card.rank ].undo();
		return card;
	}
};

Bridge.Deal.prototype.redoCard = function() {
	if ( this.currentPlayedCard === null ) {
		if ( this.firstPlayedCard === null ) {
			//throw 'No plays made yet. Nothing to Redo!';
			return null;
		}
		else this.currentPlayedCard = this.firstPlayedCard;
	}
	else {
		var nextCard = this.currentPlayedCard.getNextCard();
		if ( nextCard === null ) {
			//throw 'Nothing to Redo!';
			return null;
		}
		else {
			this.currentPlayedCard = nextCard;
		}
	}
	var card = {
		suit: this.currentPlayedCard.getSuit(),
		rank: this.currentPlayedCard.getRank(),
		direction: this.currentPlayedCard.getDirection()
	};
	Bridge.Cards[ card.suit ][ card.rank ].play();
	return card;	
};

/**
 * Who plays next
 */
Bridge.Deal.prototype.getNextToPlay = function() {
	if ( this.currentPlayedCard !== null ) return this.currentPlayedCard.getNextToPlay();
	else return this.leader;
};

/**
 * Which suit was led
 */
Bridge.Deal.prototype.getSuitLed = function() {
	if ( this.currentPlayedCard !== null ) return this.currentPlayedCard.getSuitLed();
	else return null;	
};

Bridge.Deal.prototype.hasBids = function() {
	return this.lastBid !== null;
};

/**
 * From the auciton determine what is contract and who is declarer
 */
Bridge.Deal.prototype.determineDeclarer = function() {
	var contract = {
		level: 0,
		suit: '',
		doubled: false,
		redoubled: false,
		declarer: ''
	};
	
	// Check if three passes
	var numPasses = this.numPasses();
	if ( numPasses !== 3 ) {
		throw 'Auction ends with ' + numPasses + ' passes instead of 3 passes!';
	}
	var bid = this.lastBid;
	while ( bid !== null && bid.getSuit() === 'p' ) {
		bid = bid.getPreviousBid();
	}
	if ( bid === null ) {
		throw 'Unable to determine declarer!';
	}
	if ( bid.getSuit() === 'r' ) {
		contract.redoubled = true;
		bid = bid.getPreviousBid();
	}
	while ( bid !== null && bid.getSuit() === 'p' ) {
		bid = bid.getPreviousBid();
	}	
	if ( bid === null ) {
		throw 'Unable to determine declarer!';
	}
	if ( bid.getSuit() === 'x' ) {
		if ( ! contract.redoubled ) contract.doubled = true;	
		bid = bid.getPreviousBid();
	}
	if ( bid === null ) {
		throw 'Unable to determine declarer!';
	}
	while ( bid !== null && bid.getSuit() === 'p' ) {
		bid = bid.getPreviousBid();
	}		
	if ( bid === null ) {
		throw 'Unable to determine declarer!';
	}
	contract.suit = bid.getSuit();
	contract.level = bid.getLevel();
	var declarer = bid.getDirection();
	bid = bid.getPreviousBid();
	while ( bid !== null ) {
		var direction = bid.getDirection();
		var suit = bid.getSuit();
		if ( suit === contract.suit && ! ( Bridge.areOppositeDirections( direction, declarer ) ) ) {
			declarer = direction;
		}
		bid = bid.getPreviousBid();
	}
	contract.declarer = declarer;
	this.setContract( contract.level, contract.suit, contract.declarer, contract.doubled, contract.redoubled );
};

/**
 * Check if auction ends in 3 passes
 */
Bridge.Deal.prototype.numPasses = function() {
	var numPasses = 0;
	var bid = this.lastBid;
	while ( bid !== null && bid.getSuit() === 'p' ) {
		bid = bid.getPreviousBid();
		numPasses++;
	}
	return numPasses;
};

/**
 * Add a bid to the auction at the end.
 */ 
Bridge.Deal.prototype.addBid = function( level, suit, annotation ) {
	if ( annotation === undefined ) annotation = null;
	var direction = this.dealer;
	if ( this.lastBid !== null ) {
		direction = Bridge.getLHO( this.lastBid.getDirection() );
	}
	if ( suit === 'r' && ( this.currentLevels.suits === '' || ! this.currentLevels.doubled || ! Bridge.areOppositeDirections( direction, this.currentLevels.direction ) ) ) {
		throw 'Invalid Redouble!';
	}
	if ( suit === 'x' && ( this.currentLevels.suits === '' || this.currentLevels.doubled || this.currentLevels.redoubled || ! Bridge.areOppositeDirections( direction, this.currentLevels.direction  ) ) ) {
		throw 'Invalid Double!';
	}	
	if ( suit === 'p' && this.lastBid !== null && this.lastBid.countPasses() > 2 ) {
		throw 'Invalid Pass!';
	}
	if ( suit !== 'p' && suit !== 'x' && suit !== 'r' ) {
		if ( this.currentLevels !== null ) {
			if ( level < this.currentLevels.level || ( level === this.currentLevels.level && Bridge.BidSuitOrder.indexOf(suit) > Bridge.BidSuitOrder.indexOf( this.currentLevels.suit ) ) ) {
				throw 'Invalid Bid ' + level + suit + '!';
			}
		}
	}
	var bid = new Bridge.Bid( level, suit, direction, annotation );
	if ( suit === 'x' ) {
		this.currentLevels.doubled = true;
		this.currentLevels.redoubled = false;
		this.currentLevels.direction = direction;
	}
	else if ( suit === 'r' ) {
		this.currentLevels.doubled = false;
		this.currentLevels.redoubled = true;
		this.currentLevels.direction = direction;
	}
	else if ( suit !== 'p' ) {
		this.currentLevels.doubled = false;
		this.currentLevels.redoubled = false;
		this.currentLevels.direction = direction;	
		this.currentLevels.level = level;
		this.currentLevels.suit = suit;	
	}
	if ( this.firstBid === null ) {
		this.firstBid = bid;
		this.lastBid = bid;
	}
	else {
		this.lastBid.setNextBid( bid );
		bid.setPreviousBid( this.lastBid );
		this.lastBid = bid;
	}
};

Bridge.Deal.prototype.isDoubleAllowed = function() {
	if ( this.lastBid === null ) return false;
	var direction = Bridge.getLHO( this.lastBid.getDirection() );
	if ( this.currentLevels.suits === '' || this.currentLevels.doubled || this.currentLevels.redoubled || ! Bridge.areOppositeDirections( direction, this.currentLevels.direction  ) ) return false;
	return true;	
};

Bridge.Deal.prototype.isRedoubleAllowed = function() {
	if ( this.lastBid === null ) return false;
	var direction = Bridge.getLHO( this.lastBid.getDirection() );
	if ( this.currentLevels.suits === '' || ! this.currentLevels.doubled || ! Bridge.areOppositeDirections( direction, this.currentLevels.direction ) ) return false;
	return true;	
};

Bridge.Deal.prototype.undoAllBids = function() {
	this.firstBid = null;
	this.lastBid = null;
	this.resetCurrentLevels();
};

/**
 * Remove the last bid
 */ 
Bridge.Deal.prototype.undoLastBid = function() {
	if ( this.lastBid === null ) return;
	var previousBid = this.lastBid.getPreviousBid();
	if ( previousBid === null ) {
		this.lastBid = null;
		this.firstBid = null;
	}
	else {
		this.lastBid = previousBid;
		this.lastBid.setNextBid( null );
	}
	this.resetCurrentLevels();
};

Bridge.Deal.prototype.getCurrentLevels = function() {
	return this.currentLevels;
};

Bridge.Deal.prototype.resetCurrentLevels = function() {
	this.currentLevels = {
		level: 0,
		suit: '',
		direction: '',
		doubled: false,
		redoubled: false
	};	
	var bid = this.lastBid;
	while ( bid !== null ) {
		var suit = bid.getSuit();
		if ( suit === 'r' ) this.currentLevels.redoubled = true;
		else if ( suit === 'x' ) this.currentLevels.doubled = true;
		else if ( suit !== 'p' ) {
			this.currentLevels.level = bid.getLevel();
			this.currentLevels.suit = suit;
			this.currentLevels.direction = bid.getDirection();
			return;
		}
		bid = bid.getPreviousBid();
	}
};

/**
 * Set the board number for this deal.
 */
Bridge.Deal.prototype.setBoard = function( board ) {
	this.board = board;
};

/**
 * Get the board number for this deal.
 */
Bridge.Deal.prototype.getBoard = function() {
	return this.board;	
};

/**
 * Set the dealer for this deal.
 */
Bridge.Deal.prototype.setDealer = function( dealer ) {
	if ( dealer !== this.dealer ) {
		Bridge.checkDirection( dealer );
		this.dealer = dealer;
		// Clear out the auction
		this.lastBid = null;
		this.firstBid = null;
		this.resetCurrentLevels();
	}
};

/**
 * GEt the dealer for this deal.
 */
Bridge.Deal.prototype.getDealer = function() {
	return this.dealer;	
};

/**
 * Set the vulnerability for this deal.
 */
Bridge.Deal.prototype.setVulnerability = function( vulnerability ) {
	Bridge.checkVulnerability( vulnerability );
	this.vulnerability = vulnerability;
};

/**
 * Get the vulnerability for this deal.
 */
Bridge.Deal.prototype.getVulnerability = function() {
	return this.vulnerability;	
};

/**
 * Set the notes for this deal.
 */
Bridge.Deal.prototype.setNotes = function( notes ) {
	this.notes = notes;
};

/**
 * Get the vulnerability for this deal.
 */
Bridge.Deal.prototype.getNotes = function() {
	return this.notes;	
};

/**
 * Set the trump suit for this deal.
 */
Bridge.Deal.prototype.setTrumpSuit = function( suit ) {
	Bridge.checkBidSuit( suit );	
	this.trumpSuit = suit;
};

Bridge.Deal.prototype.areHandsValid = function() {
	for( var direction in Bridge.Directions ) {
		if ( this.hands[ direction ].getNumCards() !== 13 ) {
			return false;
		}
	}	
	return true;
};

Bridge.Deal.prototype.isAuctionValid = function() {
	var bid = this.lastBid;
	if (bid === null || bid.getSuit() !== 'p' ) return false;
	bid = bid.getPreviousBid();
	if (bid === null || bid.getSuit() !== 'p' ) return false;
	bid = bid.getPreviousBid();
	if (bid === null || bid.getSuit() !== 'p' ) return false;
	bid = bid.getPreviousBid();
	if (bid === null) return false;
	if ( bid.getSuit() === 'p' && bid.getPreviousBid() !== null ) return false;
	return true;
};

/**
 * Set the leader for this deal.
 */
Bridge.Deal.prototype.setLeader = function( leader ) {
	Bridge.checkDirection( leader );
	this.leader = leader;
};


/**
 * Set the contract for this deal.
 */
Bridge.Deal.prototype.setContract = function( level, suit, declarer, doubled, redoubled ) {
	Bridge.checkLevel( level );
	Bridge.checkBidSuit( suit );
	Bridge.checkDirection( declarer );	
	this.contract = {
		level: level,
		trumpSuit: suit,
		declarer: declarer,
		doubled: doubled,
		redoubled: redoubled
	};
	this.setTrumpSuit( suit );
	this.setLeader( Bridge.getLHO( declarer ) );
};

Bridge.Deal.prototype.getContract = function() {
	var html = this.contract.level + Bridge.getSuitName( this.contract.trumpSuit );
	if ( this.contract.redoubled ) html += '<font color="blue">XX<font>';
	else if ( this.contract.doubled ) html += '<font color="red">X</font>';
	return html;		
};

Bridge.Deal.prototype.getDeclarer = function() {
	return Bridge.getDirectionName( this.contract.declarer );	
};

/**
 * Add a card to a hand specified by direction.
 */
Bridge.Deal.prototype.addCard = function( suit, rank, direction ) {
	Bridge.checkCardSuit( suit );
	Bridge.checkRank( rank );
	Bridge.checkDirection( direction);
	var card = Bridge.Cards[ suit ][ rank ];
	var assignedTo = card.getDirection();
	if ( assignedTo !== null ) {
		throw Bridge.getSuitName( suit ) + Bridge.getRankName( rank ) + ' is already assigned to ' + Bridge.getDirectionName( assignedTo ) + '!';
	}
	this.hands[ direction ].addCard( suit, rank );
	card.setDirection( direction );
};

Bridge.Deal.prototype.getSavedPlaysList = function() {
	var playNames = [];
	for( var playName in this.savedPlays ) {
		if ( this.savedPlays.hasOwnProperty( playName ) ) {
			playNames.push( playName );
		}
	}
	return playNames;
};

Bridge.Deal.prototype.getPlayStrings = function( all ) {
	var output, card, annotation;
	if ( all === undefined ) all = false;
	if ( ! all || this.loadedPlay === null ) {
		if ( this.firstPlayedCard === null ) return '';
		output = '&p=';
		card = this.firstPlayedCard;
		while( card !== null ) {
			output += card.getSuit() + card.getRank();
			annotation = card.getAnnotation();
			if ( annotation !== null )
			output += '{' + annotation + '}';
			card = card.getNextCard();
		}
	}
	if ( all ) {
		for( var playName in this.savedPlays ) {
			if( this.savedPlays.hasOwnProperty( playName ) ) {
				output += '&p' + playName + '=';
				card = this.savedPlays[ playName ].firstPlayedCard;
				while( card !== null ) {
					output += card.getSuit() + card.getRank();
					annotation = card.getAnnotation();
					if ( annotation !== null )
					output += '{' + annotation + '}';				
					card = card.getNextCard();
				}
			}
		}
	}
	return output;
};


/**
 * Remove a card from assigned hand.
 */
Bridge.Deal.prototype.removeCard = function( suit, rank ) {
	var card = Bridge.Cards[ suit ][ rank ];
	var assignedTo = card.getDirection();
	if ( assignedTo === null ) {
		throw Bridge.getSuitName( suit ) + Bridge.getRankName( rank ) + ' is not assigned to anyone!';
	}
	this.hands[ assignedTo ].removeCard( suit, rank );
	card.setDirection( null );
};

/**
 * Get the hand for the specified direction.
 */
Bridge.Deal.prototype.getHand = function( direction ) {
	Bridge.checkDirection( direction );	
	return this.hands[ direction ];
 };
 
/**
 * Set the name for a specific hand.
 */
Bridge.Deal.prototype.setName = function( name, direction ) {
	Bridge.checkDirection( direction );	
	this.hands[ direction ].setName( name );
};

Bridge.Deal.prototype.getNSTricks = function() {
	if ( this.currentPlayedCard === null ) return 0;
	else return this.currentPlayedCard.getNSTricks();	
};

Bridge.Deal.prototype.getEWTricks = function() {
	if ( this.currentPlayedCard === null ) return 0;
	else return this.currentPlayedCard.getEWTricks();	
};

/**
 * Get the name for a specified hand.
 */
Bridge.Deal.prototype.getName = function( direction ) {
	Bridge.checkDirection( direction );
	return this.hands[ direction ].getName();
};
 
/**
 * Assign rest of the cards randomly.
 */
Bridge.Deal.prototype.assignRest = function() {
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		for ( var rank in Bridge.Ranks ) {
			if ( Bridge.Ranks.hasOwnProperty( rank ) ) {
				var card = Bridge.Cards[ suit ][ rank ];
				if ( card.getDirection() === null ) {
					for( var direction in Bridge.Directions ) {
						if ( this.hands[ direction ].getNumCards() < 13 ) {
							this.addCard( suit, rank, direction );
							break;
						}
					}
				}
			}
		}
	}		
};

/**
 * Unassign all assigned cards
 */
Bridge.Deal.prototype.unAssignAll = function() {
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		for ( var rank in Bridge.Ranks ) {
			if ( Bridge.Ranks.hasOwnProperty( rank ) ) {
				var card = Bridge.Cards[ suit ][ rank ];
				if ( card.getDirection() !== null ) {
					this.removeCard( suit, rank );
				}
			}
		}
	}		
};

/**
 * Assign rest of the cards to one hand.
 */
Bridge.Deal.prototype.assignFourthHand = function( direction ) {
	Bridge.checkDirection( direction );			
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		for ( var rank in Bridge.Ranks ) {
			if ( Bridge.Ranks.hasOwnProperty( rank ) ) {
				var card = Bridge.Cards[ suit ][ rank ];
				if ( card.getDirection() === null ) {
					this.addCard( suit, rank, direction );
				}
			}
		}
	}		
};

/**
 * Get number of cards in specified hand.
 */
Bridge.Deal.prototype.getNumCards = function( direction ) {
	return this.hands[ direction ].getNumCards();
};

/**
 * Retreive the auction as a an Array.
 */
Bridge.Deal.prototype.getAuction = function() {
	var auction = [];
	var bid = this.firstBid;
	while( bid !== null ) {
		auction.push( bid );
		bid = bid.getNextBid();
	}
	return auction;
};

/**
 * Get the annotation for the current played Card.
 */
Bridge.Deal.prototype.getAnnotation = function() {
	if( this.currentPlayedCard === null ) return '';
	var annotation = this.currentPlayedCard.getAnnotation();
	return annotation === null ? '' : unescape( annotation );
};



