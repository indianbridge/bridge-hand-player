/*
 * A class to represent a contract.
 */ 
Bridge.Contract = function( level, suit, declarer, doubled, redoubled ) {
	Bridge.checkLevel( level );
	this.level = level;
	Bridge.checkBidSuit( suit );
	this.suit = suit;
	Bridge.checkDirection( declarer );
	this.declarer = declarer;
	Bridge.checkBoolean( doubled );
	this.doubled = doubled;
	Bridge.checkBoolean( redoubled );
	this.redoubled = redoubled;
};

// Get a string representation of the contract
Bridge.Contract.prototype.toString = function() {
	var html = this.level + Bridge.getSuitName( this.suit );
	if ( this.redoubled ) html += '<font color="blue">XX</font>';
	else if ( this.doubled ) html += '<font color="red">X</font>';
	return html;	
};

/*
 * A class to represent an Auction
 */
Bridge.Auction = function( auctionName, dealer ) {
	this.name = auctionName;
	this.dealer = dealer;
	this.currentDirection = dealer;
	this.bids = [];
	this.lastBid = {
		level: 0,
		suit: '',
		direction: '',
		doubled: false,
		redoubled: false		
	}
	this.isComplete = false;
	this.contract = null;
};

Bridge.Auction.prototype.toString = function() {
	var outputString = '';
	if ( this.contract ) outputString += 'Contract : ' + this.contract.toString() + '<br/>';
	outputString += 'Auction : ';
	var bidsLen = this.bids.length;
	for( var i = 0;i < bidsLen; ++i ) {
		outputString += this.bids[ i ].toString();
	}
	outputString += ' (';
	if ( this.isComplete ) outputString += '<font color="green">COMPLETE Auction</font>';
	else outputString += '<font color="red">INCOMPLETE Auction</font>';	
	outputString += ')<br/>';
	return outputString;
};

// Get the last made bid
Bridge.Auction.prototype.getLastBid = function() {
	if ( this.bids.length < 1 ) return null;
	else return this.bids[ this.bids.length - 1 ];
};

Bridge.Auction.prototype.parseContractString = function() {
	var contractString = this.auctionString.toLowerCase();
	var trumpSuit, doubled, redoubled, declarer;
	var level = parseInt( contractString.charAt(1) );
	if ( isNaN( level ) ) {
		trumpSuit = contractString.charAt(1);	
		doubled = false;
		redoubled = false;
		var leader = contractString.charAt(2);
		if ( leader === 'd' || leader === 'x' || leader === 'r' ) {
			redoubled = ( leader === 'r' );
			doubled = !redoubled;
			leader = contractString.charAt(3);
		}
		declarer = Bridge.getRHO( leader );
		level = 1;			
	}
	else {
		trumpSuit = contractString.charAt(2);
		declarer = contractString.charAt(3);
		doubled = false;
		redoubled = false;	
		if ( declarer === 'd' || declarer === 'x' || declarer === 'r' ) {
			redoubled = ( declarer === 'r' );
			doubled = !redoubled;
			declarer = contractString.charAt(4);
		}			
	}
	var currentBidder = dealer;
	while ( currentBidder !== declarer ) {
		this.addBid( 1, 'p' );
		currentBidder = Bridge.getLHO( currentBidder );
	}
	this.addBid( level, trumpSuit );
	if ( doubled ) {
		this.addBid( level, 'x' );
	}
	else if ( redoubled ) {
		this.addBid( level, 'x' );
		this.addBid( level, 'r' );
	}
	this.addBid( level, 'p' );
	this.addBid( level, 'p' );
	this.addBid( level, 'p' );
};

Bridge.Auction.prototype.parseAuctionString = function( auctionString ) {
	this.auctionString = auctionString;
	contractString = this.auctionString.toLowerCase();
	if ( contractString.charAt(0) !== '-' ) {
		for( var i = 0;i < contractString.length; ++i ) {
			var prefix = 'In auction specified at position ' + (i+1) + ' - ';							
			var currentChar = contractString.charAt( i );
			var level = 1;
			var suit = '';
			var annotation = null, explanation = null;			
			if ( currentChar === 'd' || currentChar === 'x'  ) {
				suit = 'x';
			}
			else if ( currentChar === 'p' || currentChar === 'r' ) {
				suit = currentChar;
			}
			else {
				// First should be number
				level = parseInt( currentChar );
				i++;
				suit = contractString.charAt( i );
			}
			// Check if there is an explanation or ignore annotation
			var nextChar = contractString.charAt( i + 1 );
			var endChar = '';
			var value = '';
			if ( nextChar === '('  || nextChar === '{' ) {  
				endChar = nextChar === '(' ? ')' : '}';
				value = Bridge.parseAnnotation( this.auctionString, i + 1, endChar );
				if ( ! value ) {
					throw prefix + ' No closing ) found!';	
				}
				if ( nextChar === '(' ) {	
					explanation = value.annotation;
				}
				else {
					annotation = value.annotation;
				}
				i = value.endBracePosition;			
			}
			// Check if there is an explanation or ignore annotation
			nextChar = contractString.charAt( i + 1 );
			if ( nextChar === '('  || nextChar === '{' ) {  
				endChar = nextChar === '(' ? ')' : '}';
				value = Bridge.parseAnnotation( this.auctionString, i + 1, endChar );
				if ( ! value ) {
					throw prefix + ' No closing ) found!' ;	
				}
				if ( nextChar === '(' ) {	
					explanation = value.annotation;
				}
				else {
					annotation = value.annotation;
				}
				i = value.endBracePosition;			
			}		
			this.addBid( level, suit, explanation, annotation );
		}
	}
	else {
		this.parseContractString();
	}	
	
};

// add a bid
Bridge.Auction.prototype.addBid = function( level, suit, explanation, annotation ) {
	if ( annotation === undefined ) annotation = null;
	if ( explanation === undefined ) explanation = null;
	if ( this.isComplete ) {
		throw 'Auction ' + this.name + ' is already completed! Cannot add more bids.';
	}
	Bridge.checkLevel( level );
	if ( suit !== 'p' && suit !== 'x' && suit !== 'r' ) Bridge.checkBidSuit( suit );
	var lastBid = this.getLastBid();
	if ( ! this.isValidBid( level, suit ) ) {
		if ( suit === 'p' || suit === 'x' || suit === 'r' ) {
			var errorMessage = suit + ' is not a valid next bid in auction ' + this.name;
		}
		else {
			var errorMessage = level + suit + ' is not a valid next bid in auction ' + this.name;
		}
		throw errorMessage;
	}
	var bid = new Bridge.Bid( level, suit, this.currentDirection, explanation, annotation );
	this.bids.push( bid );
	this.updateLastBid( level, suit );
	this.currentDirection = Bridge.getLHO( this.currentDirection );
	this.checkCompleteness();
};

Bridge.Auction.prototype.updateLastBid = function( level, suit ) {
	if ( suit === 'p' ) return;
	else if ( suit === 'r' ) {
		this.lastBid.redoubled = true;
		return;
	}	
	else if ( suit === 'x' ) {
		this.lastBid.doubled = true;
		return;
	}
	else {
		this.lastBid.doubled = false;
		this.lastBid.redoubled = false;
		this.lastBid.level = level;
		this.lastBid.suit = suit;
		this.lastBid.direction = this.currentDirection;
	}
	
};

Bridge.Auction.prototype.isValidBid = function( level, suit ) {
	if ( suit === 'p' ) return true;
	else if ( suit === 'x' ) {
		if ( this.lastBid.doubled || this.lastBid.redoubled || ! Bridge.areOppositeDirections( this.currentDirection, this.lastBid.direction ) ) return false;
	}	
	else if ( suit === 'r' ) {
		if ( ! this.lastBid.doubled || this.lastBid.redoubled || Bridge.areOppositeDirections( this.currentDirection, this.lastBid.direction ) ) return false;		
	}
	else {
		if ( level < this.lastBid.level || ( level === this.lastBid.level && Bridge.isGreaterBidSuit( suit, this.lastBid.suit ) ) ) return false;
	}
	return true;
};

Bridge.Auction.prototype._skipPasses = function( index ) {
	var i = index;
	while( i >= 0 && this.bids[ i ].getSuit() === 'p' ) --i;
	return i;
};

// Determined the contract and declarer
Bridge.Auction.prototype.determineDeclarer = function() {
	var level = 0, suit = '', declarer = '', doubled = false, redoubled = false;
	if ( ! this.isComplete ) {
		throw 'Cannot determine declarer because auction : ' + this.auctionName + ' is not completed!';
	}
	var index = this.bids.length - 1;
	index = this._skipPasses( index );
	if ( index < 0 ) throw 'Unable to determine declarer!';
	if ( this.bids[ index ].getSuit() === 'r' ) {
		redoubled = true;
		index--;
	}
	index = this._skipPasses( index );
	if ( index < 0 ) throw 'Unable to determine declarer!';
	if ( this.bids[ index ].getSuit() === 'x' ) {
		doubled = true;
		index--;
	}
	index = this._skipPasses( index );
	if ( index < 0 ) throw 'Unable to determine declarer!';
	suit = this.bids[ index ].getSuit();
	level = this.bids[ index ].getLevel();
	declarer = this.bids[ index ].getDirection();
	for( var i = 0; i < this.bids.length; ++i ) {
		var direction = this.bids[ i ].getDirection();
		if ( this.bids[ i ]. getSuit() === suit &&  ! Bridge.areOppositeDirections( declarer, direction ) ) {
			declarer = direction;
			break;
		}
	}
	this.contract = new Bridge.Contract( level, suit, declarer, doubled, redoubled );
};

// Check if auction is complete
Bridge.Auction.prototype.checkCompleteness = function() {
	if ( this.bids.length < 4 ) {
		this.isComplete = false;
		this.contract = null;
	}
	var numPasses = 0;
	var i = this.bids.length - 1;
	while( i >= 0 && this.bids[ i ].getSuit() === 'p' ) {
		numPasses++;
		i--;
	}
	if ( ( numPasses === 4 && this.bids.length === 4 ) ||  numPasses === 3 ) {
		this.isComplete = true;
		this.determineDeclarer();
		return;
	}
	this.isComplete = false;
	this.contract = null;
};

// remove last bid
Bridge.Auction.prototype.removeLastBid = function() {
	if ( this.bids.length < 1 ) {
		throw 'There are not bids to remove in the auction ' + this.auctionName;
	}
	this.bids.pop();
	this.isComplete = false;
	this.contract = null;
};


Bridge.Bid = function( level, suit, direction, explanation, annotation ) {
	if ( annotation === undefined ) annotation = null;
	if ( explanation === undefined ) explanation = null;
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
	this.explanation = explanation;
	this.previousBid = null;
	this.nextBid = null;
	this.lastBid = {
		level: 0,
		suit: '',
		direction: '',
		doubled: false,
		redoubled: false		
	}
};

Bridge.Bid.prototype.toString = function() {
	var bidString = '';
	if ( this.suit === 'x' ) bidString = '<font color="red">X</font>';
	else if ( this.suit === 'r' ) bidString = '<font color="blue">XX<font>';
	else if ( this.suit === 'p' ) bidString = '<font color="green">P</font>';
	else if ( this.suit in Bridge.Suits ) {
		bidString = this.level + Bridge.getSuitName( this.suit );
	}	
	else bidString = 'Unknown';
	if ( this.explanation ) return '<span title="' + unescape(this.explanation) + '">' + bidString + '</span>';
	else return bidString;	
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
		bid : bidString,
		annotation : this.annotation,
		explanation : this.explanation
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

Bridge.Bid.prototype.getExplanation = function() {
	return this.explanation;
};

Bridge.Bid.prototype.setExplanation = function( explanation ) {
	this.explanation = explanation;
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