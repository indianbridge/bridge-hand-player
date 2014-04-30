/*
 * A class to represent the four hands.
 */
Bridge.Hands = function() {
	this.hands = {};
	this.cardAssignedTo = {};
	this.unAssignAll();
};

Bridge.Hands.prototype.toString = function() {
	var outputString = '';
	for( var direction in Bridge.Directions ) {
		outputString += this.hands[ direction ].toString() + '<br/>';
	}
	if ( this.isValid() ) outputString += '<h4><font color="green">VALID Hands</font></h4>';
	else outputString += '<h4><font color="red">INVALID Hands</font></h4>';
	return outputString;	
};

Bridge.Hands.prototype.isValid = function() {
	for ( var d in this.hands ) {
		if ( this.hands[ d ].getNumCards() !== 13 ) return false;
	}
	return true;
};

Bridge.Hands.prototype.unAssignAll = function() {
	var suitLen = Bridge.CardSuitOrder.length;
	var rankLen = Bridge.RankOrder.length;
	for( var index = 0; index < suitLen; ++index ) {
		var suit = Bridge.CardSuitOrder[ index ];
		this.cardAssignedTo[ suit ] = {};
		for( var j = 0; j < rankLen; ++j ) {
			var rank = Bridge.RankOrder[ j ];
			this.cardAssignedTo[ suit ][ rank ] = null;
		};
	};	
	var dirLen = Bridge.DirectionOrder.length;
	for( var index = 0; index < dirLen; ++index ) {
		var direction = Bridge.DirectionOrder[ index ];
		this.hands[ direction ] = new Bridge.Hand( direction );
	};	
};

// A array random shuffler. Use carefully
Array.prototype.shuffleCards = function () {
    var counter = this.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = this[counter];
        this[counter] = this[index];
        this[index] = temp;
    }

    return this;
};

Bridge.Hands.prototype.assignRest = function( direction ) {
	var unassignedCards = [];
	var suitLen = Bridge.CardSuitOrder.length;
	var rankLen = Bridge.RankOrder.length;
	for( var index = 0; index < suitLen; ++index ) {
		var suit = Bridge.CardSuitOrder[ index ];
		for( var j = 0; j < rankLen; ++j ) {
			var rank = Bridge.RankOrder[ j ];
			if ( this.cardAssignedTo[ suit ][ rank ] ===  null ) {
				unassignedCards.push( suit + rank );
			}			
		};
	};	
	if ( unassignedCards.length > 0 ) {
		unassignedCards.shuffleCards();	
		var len = unassignedCards.length;
		for( var index = 0; index < len; ++index ) {
			var value = unassignedCards[ index ];	
			var suit = value.charAt(0);
			var rank = value.charAt(1);
			this.addUnassignedCard( suit, rank, direction );
		};
	}
};

Bridge.Hands.prototype.addUnassignedCard = function( suit, rank, direction ) {
	var assigned = false;
	if ( direction !== undefined ) {
		this.addCard( suit, rank, direction );
		return;
	}
	for ( var d in this.hands ) {
		if ( this.hands[ d ].getNumCards() < 13 ) {
			this.addCard( suit, rank, d );
			return;
		}
	}
	throw 'Cannot find free hand to assign ' + suit + rank + ' to!';
};

Bridge.Hands.prototype.addCard = function( suit, rank, direction ) {
	Bridge.checkCardSuit( suit );
	Bridge.checkRank( rank );
	Bridge.checkDirection( direction);
	var assignedTo = this.cardAssignedTo[ suit ][ rank ];
	if ( assignedTo !== null ) {
		throw Bridge.getSuitName( suit ) + Bridge.getRankName( rank ) + ' is already assigned to ' + Bridge.getDirectionName( assignedTo ) + '!';
	}
	this.hands[ direction ].addCard( suit, rank );
	this.cardAssignedTo[ suit ][ rank ] = direction;
};

Bridge.Hands.prototype.removeCard = function( suit, rank ) {
	var assignedTo = this.cardAssignedTo[ suit ][ rank ];
	if ( assignedTo === null ) {
		throw Bridge.getSuitName( suit ) + Bridge.getRankName( rank ) + ' is not assigned to anyone!';
	}
	this.hands[ assignedTo ].removeCard( suit, rank );
	this.cardAssignedTo[ suit ][ rank ] = null;
};

Bridge.Hands.prototype.loadNames = function( queryParameters ) {
	if ( ! queryParameters ) return;
	var dirLen = Bridge.DirectionOrder.length;
	for( var index = 0; index < dirLen; ++index ) {
		var direction = Bridge.DirectionOrder[ index ];
		var parameterName = direction + 'n';
		var name = Bridge.getParameterValue( queryParameters, parameterName );
		if ( name ) this.hands[ direction ].setName( name );
	};	
};

Bridge.Hands.prototype.loadHands = function( queryParameters ) {
	if ( ! queryParameters ) {
		return false;
	}
	// A tally of which hands are not specified in the query Parameters
	var unspecifiedHands = [];	
	// Look for hands specified for each direction
	for( var direction in Bridge.Directions ) {
		if ( Bridge.Directions.hasOwnProperty( direction ) ) {
			var handString = Bridge.getParameterValue( queryParameters, direction );
			if ( handString ) {
				// If specified load hand for direction
				this.loadHand( direction, handString );
			}
			else {
				// Hand not specified
				unspecifiedHands.push( direction );
			}
		}
	}
	
	// If 3 hands specified then load fourth hand automatically
	if ( unspecifiedHands.length === 1 ) {
		this.assignRest( unspecifiedHands[ 0 ] );
	}	
};

Bridge.Hands.prototype.loadHand = function( direction, handString) {
	handString = handString.toLowerCase();
	var directionName = Bridge.getDirectionName( direction );
	var currentSuit = '';
	var currentRank = '';
	for( var i = 0; i < handString.length; ++i ) {
		var prefix = 'In hand for ' + directionName + ' at position ' + (i+1) + ' - ';
		// Read the next character specified in hand
		var currentChar = handString.charAt( i );
		switch( currentChar ) {
			// Check if it specifies suit
			case 'c' :				
			case 'd' :
			case 'h' :
			case 's' :	
				currentSuit = currentChar;
				break;	
			
			// Special handing for numeric 10
			case '1' :
				if ( currentSuit === '' ) {
					throw( prefix + currentChar + ' was found when a suit was expected!' );
				}			
				if ( i < handString.length - 1 && handString.charAt( i+1 ) === '0') {
					currentRank = 't';
					i++;
				}
				else {
					throw( prefix + 'a 1 is present without a subsequent 0. Use 10 or t to reprensent the ten.' );
					continue;
				}
				break;
			// All other characters
			default :
				if ( currentSuit === '' ) {
					throw( prefix + currentChar + ' was found when a suit was expected!' );
					continue;
				}
				currentRank = currentChar;
				this.addCard( currentSuit, currentRank, direction );
				break;											
		}	
	}
};

/**
 * Creates an instance of a Hand.
 */
Bridge.Hand = function( direction ) {
	this.cards = {};
	this.name = null;
	this.direction = direction;
	this.numCards = 0;
	this.cardCount = {};
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		this.cards[ suit ] = {};
		this.cardCount[ suit ] = 0;
	}
};

Bridge.Hand.prototype.toString = function() {
	var outputString = Bridge.getDirectionName( this.direction ) + ' ';
	if ( this.name !== null ) outputString += '(' + this.name + ') ';
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		outputString += Bridge.getSuitName( suit );
		if ( this.cardCount[ suit ] < 1 ) outputString += '- ';
		else {
			for( var j = 0; j < Bridge.RankOrder.length; ++j ) {
				var rank = Bridge.RankOrder[ j ];
				if ( rank in this.cards[ suit ] ) {
					outputString += Bridge.getRankName( rank );
				}
			}
			outputString += ' ';
		}
	};	
	return outputString;
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
	this.cards[ suit ][ rank ] = '';
	this.numCards++;
	this.cardCount[ suit ]++;
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
	this.cardCount[ suit ]--;
	this.numCards--;
};

Bridge.Hand.prototype.getLongestSuit = function( ) {
	var longest = 0;	
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		longest = Math.max( longest, this.cardCount[ suit ] );
	}
	return longest;
};