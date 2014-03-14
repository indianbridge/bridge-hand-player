/**
* The class that stores a single deal and performs all necessary operations.
*
* @class Deal
* @constructor default
*/
function Deal() {
	this.newLineCharacter = '\n';
	this.tabLevel = 0;	
	this.errorFound = false;
	this.errors = [];
	this.suitPrefix = '<'
	
	this.suits = { 
		's' : { 'index' : 0, 'name' : 'Spades',		'displayName' : '<span class="lead" style="color:#000000;">&spades;</span>', 'imageIndex' : 1, },
		'h' : { 'index' : 1, 'name' : 'Hearts',		'displayName' : '<span class="lead" style="color:#CB0000;">&hearts;</span>', 'imageIndex' : 2, },
		'd' : { 'index' : 2, 'name' : 'Diamonds',	'displayName' : '<span class="lead" style="color:#CB0000;">&diams;</span>', 'imageIndex' : 3, },
		'c' : { 'index' : 3, 'name' : 'Clubs',		'displayName' : '<span class="lead" style="color:#000000;">&clubs;</span>', 'imageIndex' : 0, },
	};
	this.suitOrder = [];
	for( var suit in this.suits ) {
		this.suitOrder[ this.suits[ suit ].index ] = suit;
	}
	this.numCards = 52;
	this.cardAssignedTo = [];
	for ( var i = 0; i < this.numCards; i++ ) {
		this.cardAssignedTo[ i ] = '';
	}
	this.cards = { 
		'a' : { 'index' : 12, 	'name' : 'Ace',		'displayName' : 'A', 'imageIndex' : 0, }, 
		'k' : { 'index' : 11, 	'name' : 'King',	'displayName' : 'K', 'imageIndex' : 1, },
		'q' : { 'index' : 10, 	'name' : 'Queen',	'displayName' : 'Q', 'imageIndex' : 2, },
		'j' : { 'index' : 9, 	'name' : 'Jack',	'displayName' : 'J', 'imageIndex' : 3, },  
		't' : { 'index' : 8, 	'name' : '10',		'displayName' : 'T', 'imageIndex' : 4, }, 
		'9' : { 'index' : 7, 	'name' : '9',		'displayName' : '9', 'imageIndex' : 5, },  
		'8' : { 'index' : 6, 	'name' : '8',		'displayName' : '8', 'imageIndex' : 6, }, 
		'7' : { 'index' : 5, 	'name' : '7',		'displayName' : '7', 'imageIndex' : 7, }, 
		'6' : { 'index' : 4, 	'name' : '6',		'displayName' : '6', 'imageIndex' :8, },
		'5' : { 'index' : 3, 	'name' : '5',		'displayName' : '5', 'imageIndex' : 9, },
		'4' : { 'index' : 2, 	'name' : '4',		'displayName' : '4', 'imageIndex' : 10, },
		'3' : { 'index' : 1, 	'name' : '3',		'displayName' : '3', 'imageIndex' : 11, },
		'2' : { 'index' : 0, 	'name' : '2',		'displayName' : '2', 'imageIndex' : 12, },
	};
	this.cardOrder = [];
	for ( var card in this.cards ) {
		this.cardOrder[ this.cards[ card ].index ] = card;
	}
	this.hands = {
		'n' : {
			'name' 	: 'North',
			'id'	: 'north',		
		},
		's'	: {
			'name' 	: 'South',
			'id'	: 'south',
		},
		'e'	: {
			'name' 	: 'East',
			'id'	: 'east',
		},
		'w'	: {
			'name' 	: 'West',
			'id'	: 'west',
		}
		
	};
	this.parseQueryParameters();
	this.loadHands();
	if ( this.errorFound ) {
		this.displayErrors();
	}
	else {
		this.displayHands();
		$('#errors').hide();
		$('#main').show().removeClass('hide');
	}
};

/**
 * Parse the query parameters and return as an associative array.
 *
 * @method parseQueryParameters
 * @param void
 * @return void
 */
Deal.prototype.parseQueryParameters = function() {
	var vars = [], hash;
	var q = document.URL.split( '?' )[1];
	if( q !== undefined ){
		q = q.toLowerCase();
		q = q.split('&');
		for(var i = 0; i < q.length; i++){
			hash = q[i].split('=');
			vars.push(hash[1]);
			vars[hash[0]] = hash[1];
		}
	}
	this.queryParameters = vars;
};

/**
 * Loads the 4 hands from parsed query parameters
 *
 * @method parseQueryParameters
 * @param void
 * @return void
 */
Deal.prototype.loadHands = function() {
	var numHandsSpecified = 0;
	for(var direction in this.hands ) {
		if ( this.queryParameters[ direction ] !== undefined ) {
			numHandsSpecified++;
			this.loadHand( direction );
		}
	}
	if ( numHandsSpecified < 3 ) {
		this.errorFound = true;
		this.errors.push( 'You have specified only ' + numHandsSpecified + ' hands. Atleast 3 hands have to specified to continue.');
	}
	else if ( ! this.errorFound && numHandsSpecified === 3 ) {
		this.determineFourthHand();
	}
};

Deal.prototype.determineFourthHand = function() {
	var fourthHand = '';
	for ( direction in this.hands ) {
		if ( ! this.hands[ direction ].loaded ) {
			fourthHand = direction;
			break;
		}
	};
	if ( fourthHand === '' ) {
		this.errorFound = false;
		this.errors.push( 'Three hands specified but unable to determine which is the missing hand!' );
		return;
	}
	var hand = this.hands[ fourthHand ];
	hand.cards = {
		's' : [],
		'h' : [],
		'd' : [],
		'c' : [],		
	};
	var numCards = 0;
	for ( var suit in this.suits ) {
		for ( var card in this.cards ) {
			var cardIndex = this.getCardIndex( suit, card );
			if ( this.cardAssignedTo[ cardIndex ]  === '' ) {
				numCards++;
				this.cardAssignedTo[ cardIndex ] = fourthHand;
				hand.cards[ suit ].push( card );
			}
		}
	}
	if ( numCards !== 13 ) {
		this.errorFound = true;
		hand.errors.push( hand.name + ' has ' + numCards +' cards instead of the requisite 13.' );
	}
	var unassignedCards = '';
	for( var i = 0; i < 52; ++i ) {
		if ( this.cardAssignedTo[ i ] === '' ) {
			var suit = this.getSuit( i );
			var card = this.getCard( i );
			unassignedCards += this.getCardDisplayName( suit, card );
		}
	}
	if ( unassignedCards !== '' ) {
		this.errorFound = true;
		hand.errors.push( 'The following cards are not assigned to any hand : ' + unassignedCards );
	}
};

/**
 * Loads the a single hand from parsed query parameters
 *
 * @method parseQueryParameters
 * @param {String} the direction of hand to load
 * @return void
 */
Deal.prototype.loadHand = function( direction ) {
	var handString = this.queryParameters[ direction ];
	var hand = this.hands[ direction ];
	hand.loaded = true;
	hand.errors = [];
	var suitProcessedAlready = {
		'c' : false,
		'd'	: false,
		'h'	: false,
		's'	: false,
	};
	var currentSuit = '';
	var numCards = 0;
	hand.cards = {
		's' : [],
		'h' : [],
		'd' : [],
		'c' : [],		
	};
	for( var i = 0; i < handString.length; ++i ) {
		var char = handString.charAt( i );
		switch( char ) {
			case 'c' :				
			case 'd' :
			case 'h' :
			case 's' :	
				if ( suitProcessedAlready[ char ] ) {
					this.errorFound = true;
					hand.errors.push( this.suits[ char ].name + ' is repeated for ' + hand.name + '.' );
				} 
				suitProcessedAlready[ char ] = true;
				currentSuit = char;
				break;	
			case '1' :
				if ( i < handString.length - 1 && handString.charAt( i+1 ) === '0') {
					char = 't';
				}
				else {
					this.errorFound = true;
					hand.errors.push( '1 is present without a subsequent 0 for suit ' + this.suits[ char ].name + ' in ' + hand.name + ' hand.' );
					continue
				}
			default :
				if ( ! char in this.cards ) {
					this.errorFound = true;
					hand.errors.push( 'Invalid card ' + char + ' specified in suit ' + this.suits[ char ].name + ' for ' + hand.name + ' hand.' );
					continue;
				}
				var cardIndex = this.getCardIndex( currentSuit, char );
				if ( this.cardAssignedTo[ cardIndex]  !== '' ) {
					this.errorFound = true;
					hand.errors.push( this.getCardDisplayName( currentSuit, char ) + ' specified for ' + hand.name + ' hand has already been assigned to ' + this.hands[ this.cardAssignedTo[ cardIndex ] ].name );
					continue;					
				}
				this.cardAssignedTo[ cardIndex ] = direction;
				hand.cards[ currentSuit ].push( char );
				numCards++;
				break;											
		}		
	}
	if ( numCards !== 13 ) {
		this.errorFound = true;
		hand.errors.push( hand.name + ' has ' + numCards +' instead of the requisite 13.' );		
	}
};

/**
 * Give a suit and card get the display name.
 *
 * @method getCardDisplayName
 * @param {String} the suit of this card
 * @param [String] the demonination of this card
 * @return {String} the html display name of card
 */
Deal.prototype.getCardDisplayName = function( suit, card ) {
	return this.suits[ suit ].displayName + this.cards[ card ].displayName;
};

Deal.prototype.getImageIndex = function ( suit, card ) {
	return this.cards[ card ].imageIndex * 4 + this.suits[ suit ].imageIndex;
};

/**
 * Gets the numeric index of a card in a specified suit
 *
 * @method getCardIndex
 * @param {String} the suit of this card
 * @param [String] the demonination of this card
 * @return {Number} the numeric index of the specified card
 */
Deal.prototype.getCardIndex = function( suit, card ) {
	return this.suits[ suit ].index * 13 + this.cards[ card ].index;	
};

/**
 * Gets the suit for the specified index
 *
 * @method getSuit
 * @param {Number} the index of the card
 * @return {String} the suit
 */
Deal.prototype.getSuit = function( cardIndex ) {
	var suitIndex = ~~(cardIndex / 13);
	return this.suitOrder[ suitIndex ];
};

/**
 * Gets the card for the specified index
 *
 * @method getCard
 * @param {Number} the index of the card
 * @return {String} the denomination
 */
Deal.prototype.getCard = function( cardIndex ) {
	var card = ~~(cardIndex / 4);
	return this.cardOrder[ card ];
};

Deal.prototype.displayErrors = function() {
	var html = '';
	html += this.showErrors( 'General Errors', this.errors );
	for(var direction in this.hands ) {
		html += this.showErrors ( 'Errors in ' + this.hands[ direction ].name + ' hand', this.hands[ direction ].errors );
	}
	$('#errors').html(html);
}

Deal.prototype.showErrors = function( title, errors ) {
	var html = '';
	html += this.write( '<ul class="list-group">', 'opening' );
	html += this.write( '<li class="list-group-item list-group-item-info">' + title + '</li>' );	
	for( var error in errors ) {
		html += this.write( '<li class="list-group-item">' + errors[ error ] + '</li>' );
	}
	html += this.write( '</ul>', 'closing' );	
	return html;
};

Deal.prototype.write = function( message, tagStatus ) {
	if ( tagStatus === 'closing' ) this.tabLevel--;
	var tabs = ( this.tabLevel >= 0 ? this.tabLevel + 1 : 1 );
	if ( tagStatus === 'opening' ) this.tabLevel++;
	return Array( tabs ).join( '\t' ) + message + this.newLineCharacter;
	
};

Deal.prototype.displayHands = function() {
	for( var direction in this.hands ) {
		this.displayHand( direction );
	}	
};

Deal.prototype.displayHand = function( direction ) {
	var hand = this.hands[ direction ];
	/*var html = this.write( '<div class="cell panel panel-primary">', 'opening' );
	html += this.write( '<div class="panel-heading">', 'opening' );
	html += this.write( '<h3 class="panel-title">' + hand.name + '</h3>' );
	html += this.write( '</div>', 'closing' );
	html += this.write( '<div id="' +  hand.id + '-body" class="panel-body">', 'opening' );
	//html += this.getHandHTML( hand.cards, hand.name );
	html += this.write( '</div>', 'closing' );
	html += this.write( '</div>', 'closing' );
	$( '#' + hand.id ).empty().append( html );*/
	this.getHandHTMLText( hand );
};

Deal.prototype.getHandHTMLText = function( hand ) {
	var cards = hand.cards;
	var handName = hand.name;
	var html = '';
	for( var i in this.suitOrder ) {
		var suit = this.suitOrder[ i ];
		var suitID = hand.id + '-' + suit;
		html = this.suits[ suit ].displayName;
	  	cards[ suit ].sort( compareCards( this ) );
	  	for ( var j in cards[ suit ] ) {
	  		var imageIndex = this.getImageIndex( suit, cards[ suit ][ j ] ) + 1;
			var id = suit + '-' + cards[ suit ][ j ];
			//var className = (j == 0 ? '' : 'move-left');
			html += ' <span id="'+ id + '" imageIndex="' + imageIndex + '" hand="' + handName + '" suit="' + this.suits[ suit ].name + '" card="' + this.cards[ cards[ suit ][ j ] ].name;
			html += '" class="btn btn-primary card-absolute1 ' + handName + ' not-played cards">' + this.cards[ cards[ suit ][ j ] ].displayName + '</span>';
		};	  
		$( '#' + suitID ).append(html);	
	}
};

Deal.prototype.getHandHTML = function( hand ) {	
	var cards = hand.cards;
	var handName = hand.name;
	var html = '';
	//var panelID = hand.id + '-body';
	var dummyPanelID = hand.id + '-body';
	//var dummPanelID = 'dealer';
	//$( '#' + dummyPanelID ).empty();
	//html += this.write( '<table class="auto table table-condensed">', 'opening' );
	for( var i in this.suitOrder ) {
		var suit = this.suitOrder[ i ];
		var suitID = hand.id + '-' + suit;
		//$( '#' + dummyPanelID ).append('<div id=' + suitID + '></div>');
		//$( '#' + suitID ).empty();
		var offset = $( '#' + suitID ).position().left;
		//html += this.write( '<tr>', 'opening' );
	  	//html += this.write( '<td>' + this.suits[ suit ].displayName + '</td>' );
	  	cards[ suit ].sort( compareCards( this ) );
	  	//html += this.write( '<td>', 'opening' );
	  	//var offset = -11;
	  	for ( var j in cards[ suit ] ) {
	  		
	  		var imageIndex = this.getImageIndex( suit, cards[ suit ][ j ] ) + 1;
			//html += '<a imageIndex="' + imageIndex + '" hand="' + handName + '" suit="' + this.suits[ suit ].name + '" card="' + this.cards[ cards[ suit ][ j ] ].name;
			//html += '" class="' + handName + ' not-played cards btn btn-primary btn-sm" role="button">' + this.cards[ cards[ suit ][ j ] ].displayName + '</a>';
			var id = suit + '-' + cards[ suit ][ j ];
			//var className = (j == 0 ? '' : 'move-left');
			html = '<img id="'+ id + '" imageIndex="' + imageIndex + '" hand="' + handName + '" suit="' + this.suits[ suit ].name + '" card="' + this.cards[ cards[ suit ][ j ] ].name;
			html += '" class="card-absolute ' + handName + ' not-played cards" src="' + this.getCardImageName( imageIndex ) + '"></img>';
			$( '#' + suitID ).append(html);
			$('#'+id).animate({left:offset,}, 300, function() {});
			offset += 20;
		};	  	
		//html += this.write( '</td>', 'closing' );
		//html += this.write( '</tr>', 'closing' );	
	}
	//html += this.write( '</table>', 'closing' );	
	//$('#' + panelID ).empty().append( $( '#' + dummPanelID ).html() );
};



Deal.prototype.getCardImageName = function( imageIndex ) {
	return 'images/cards/' + imageIndex + '.png';
}

function compareCards(deal) {
    return function( card1, card2 ) {
        return deal.cards[ card2 ].index - deal.cards[ card1 ].index;	
    }
}

var deal = new Deal();
