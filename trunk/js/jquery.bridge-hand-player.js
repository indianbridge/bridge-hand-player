
// The current deal
var deal;

// Available card image packs
var cardImagePacks = {
	'small' : {
		folder : 'images/cards/small',
		fullWidth : 76,
		fullHeight : 92,
		cardBack: 'b1fv.png',
		percentageWidthShowing: 0.25,
		percentageHeightShowing: 0.5,
	},
};

// All the sizing and styling parameters
var Parameters = {
	scalingFactor: 1,
	cardImages: cardImagePacks[ 'small' ],
	textSize: {
		actualFontSize: 14,
		actualLineHeight: 1,
	},
	tableCardPosition: {},
	manualHashChange: false,
};

// The center table image properties
Parameters.tableImage = {
	id: 'table',
	class: 'table',
	fullWidth: Parameters.cardImages.fullWidth * 5 + 20,
	fullHeight: Parameters.cardImages.fullHeight * 3 + 20,	
};


// the compass image properties
Parameters.compassImage = {
	id: 'compass',
	class: 'compass',
	imageName: 'images/compass.png',
};

// the cards played to the table properties
Parameters.tableCardPosition = {};
for( var direction in Directions ) {
	Parameters.tableCardPosition[ direction ] = {
		top: 0,
		left: 0,	
	};
}

// At initial load or whenever window resizes recompute the scaling factor and all sizes
function computeScaledParameters( ) {
	
	// Get viewport dimensions
	Parameters.viewport = {
		width: jQuery(window).width(),
		height: jQuery(window).height(),
	};
	Parameters.viewport.centerX = Parameters.viewport.width/2;
	Parameters.viewport.centerY = Parameters.viewport.height/2;	
	
	// Compute scaling factor
	var imageHeight = 0.152 * Parameters.viewport.height;
	var imageWidth = 0.084 * Parameters.viewport.width;
	var heightScalingFactor = imageHeight / Parameters.cardImages.fullHeight;
	var widthScalingFactor = imageWidth / Parameters.cardImages.fullWidth;
	Parameters.scalingFactor = Math.min( heightScalingFactor, widthScalingFactor );	
	
	// Card Image dimensions
	Parameters.cardImages.width = Parameters.cardImages.fullWidth * Parameters.scalingFactor;
	Parameters.cardImages.height = Parameters.cardImages.fullHeight * Parameters.scalingFactor;
	Parameters.cardImages.widthShowing = Parameters.cardImages.width * Parameters.cardImages.percentageWidthShowing;
	Parameters.cardImages.heightShowing = Parameters.cardImages.height * Parameters.cardImages.percentageHeightShowing;
	
	// Compute new center table dimensions
	Parameters.tableImage.width = Parameters.tableImage.fullWidth * Parameters.scalingFactor;
	Parameters.tableImage.height = Parameters.tableImage.fullHeight * Parameters.scalingFactor;
	Parameters.tableImage.top = Parameters.viewport.centerY - Parameters.tableImage.height / 2;
	Parameters.tableImage.left = Parameters.viewport.centerX - Parameters.tableImage.width / 2;
	
	// Compute new compass dimensions
	Parameters.compassImage.width = 0.2 * Parameters.tableImage.width;
	Parameters.compassImage.height = Parameters.compassImage.width;	
	Parameters.compassImage.top = Parameters.viewport.centerY - Parameters.compassImage.width / 2;
	Parameters.compassImage.left = Parameters.viewport.centerX - Parameters.compassImage.height / 2;
	
	// The positions of cards played to table
	for( var direction in Directions ) {
		switch ( direction ) {
			case 'n':
				Parameters.tableCardPosition[ direction ] = {
					top: Parameters.tableImage.top,
					left: Parameters.viewport.centerX - Parameters.cardImages.width / 2,
				};				
				break;
			case 's':
				Parameters.tableCardPosition[ direction ] = {
					top: Parameters.tableImage.top + Parameters.tableImage.height - Parameters.cardImages.height,
					left: Parameters.viewport.centerX - Parameters.cardImages.width / 2,
				};			
				break;
			case 'w':
				Parameters.tableCardPosition[ direction ] = {
					top: Parameters.viewport.centerY - Parameters.cardImages.height / 2,
					left: Parameters.tableImage.left,
				};			
				break;
			case 'e':
				Parameters.tableCardPosition[ direction ] = {
					top: Parameters.viewport.centerY - Parameters.cardImages.height / 2,
					left: Parameters.tableImage.left + Parameters.tableImage.width - Parameters.cardImages.width,
				};			
				break;
			default:												
				break;
		}	
	}	
	
	// Font sizes
	Parameters.textSize.fontSize = Parameters.textSize.actualFontSize * Parameters.scalingFactor;
	Parameters.textSize.lineHeight = Parameters.textSize.actualLineHeight * Parameters.scalingFactor;
	var style = '<style>';
	style += 'table.table1 {font-size: ' + Parameters.textSize.fontSize + 'px; line-height: ' + Parameters.textSize.lineHeight + 'em;}';
	style += '.sexybutton.sexysimple.button-text {font-size: ' + Parameters.textSize.fontSize + 'px !important;}';
	style += '</style>';
	$( style ).appendTo( "head" )	
	
	trace( 'After scaling parameters are : ' + JSON.stringify( Parameters ) );		
};	

// Add some rudimentary tracing capability
if(!window.console){ window.console = {log: function(){} }; } 
function trace( message ) {
	console.log( message );	
};

// Directions and utility functions for Directions
var Directions = { 
	'n' : { name : 'North',	layout : 'horizontal',	position : 'top',		index: 0 },
	'e' : { name : 'East',	layout : 'vertical',	position : 'right',		index: 1 },
	's' : { name : 'South',	layout : 'horizontal',	position : 'bottom',	index: 2 },
	'w' : { name : 'West',	layout : 'vertical',	position : 'left',		index: 3 },
};

function getDirectionName( direction ) {
	if ( direction in Directions ) return Directions[ direction ].name;
	return 'Unknown';	
};

// an indexed array of directions in order so that we can find who is next to play
var directionNames = [];
for( var direction in Directions ) directionNames[ Directions[ direction ].index ] = direction;

// Suits and utility functions for Suits
var Suits = { 
	's' : { name : '<font color="000000">&spades;</font>', 	index : 0 }, 
	'h' : { name : '<font color="CB0000">&hearts;</font>', 	index : 1 }, 
	'd' : { name : '<font color="CB0000">&diams;</font>',	index : 2 }, 
	'c' : { name : '<font color="000000">&clubs;</font>', 	index : 3 }, 
	'n' : { name : 'No Trump',								index : 4 },
};

function getSuitName( suit ) {
	if ( suit in Suits ) return Suits[ suit ].name;
	return 'Unknown';	
};

// Ranks and utility functions for Ranks
var Ranks = { 
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

function getRankName( rank ) {
	if ( rank in Ranks ) return Ranks[ rank ].name;
	return 'Unknown';		
};

// Vulnerability 
var Vulnerability = {
	'n' : 'North-South',
	'e' : 'East-West',
	'b' : 'Both',
	'-' : 'None',
};
function getVulnerability( vul ) {
	if ( vul in Vulnerability ) return Vulnerability[ vul ];
	else return 'Unknown';
};

// Given which direction is next to play from current direction
// This can also be used to determine leader give declarer
function getNextToPlay( direction ) {
	if ( direction in Directions ) {
		var index = Directions[ direction ].index;
		index = ( index + 1 ) % 4;
		return directionNames[ index ];
	}
	else return 'Unknown';
};

// Get leader given declarer
function getLeader( declarer ) {
	return getNextToPlay( declarer );
};

function getTableBody( fields ) {
	var html = ''
	for ( var key in fields ) {
		var value = fields[ key ];
		html += '<tr>';
		html += '<th>' + key + '</th>';
		if ( typeof value === 'string' ) {
			html += '<td>' + value + '</td>';
		}
		else {
			if ( 'id' in value ) {
				html += '<td id="' + value.id + '">' + value.value + '</td>';
			}
			else {
				html += '<td>' + value.value + '</td>';
			}
		}
		html += '</tr>';
	}
	return html;
};

/*
 * A namespace for reading and parsing query parameters.
 */
function QueryParameters() {};

/**
 * Parse the query parameters and return as an associative array.
 *
 * @method parse
 * @this {QueryParameters}
 * @param void
 * @return void
 */
QueryParameters.parse = function() {
	var vars, hash;
	// Retrieve the part after the ? in url
	var q = document.URL.split( '?' )[1];
	if( q !== undefined ){
		vars = [];
		// Remove the part after # if it exists
		q = q.split( '#' )[0];
		
		trace( 'Query Parameters are : ' +  q );
		
		// trim the string
		q = q.trim();
		if ( q ) {		
			// Get all the different components
			q = q.split('&');
			for(var i = 0; i < q.length; i++){
				hash = q[i].split('=');
				vars.push(hash[1]);
				vars[hash[0]] = hash[1];
			}
		}
	}
	return vars;	
};

// A single hand
function Hand( direction ) {
	this.direction = direction;
	this.suits = {};	
	this.numCards = 0;
	this.width = 0;
	this.height = 0;
	this.top = 0;
	this.left = 0;
	for( var suit in Suits ) {
		// Ignore n (no trump)
		if ( suit !== 'n' ) {
			this.suits[ suit ] = [];
		}
	}
	this.longest = 0;
};

// Add a card to this hand
Hand.prototype.addCard = function( suit, rank ) {
	var suitToAddTo = this.suits[ suit ];
	if ( suitToAddTo.indexOf( rank ) !== -1 ) return false;
	suitToAddTo.push( rank );
	this.numCards++;
	return false;
};

// Sort this hand and find the length of longest suit
Hand.prototype.sortAndCount = function() {
	this.longest = 0;
	for( var suit in this.suits ) {
		this.suits[ suit ].sort( compareRanks );
		var count = this.suits[ suit ].length;
		if ( count > this.longest ) this.longest = count;
	}
};


// Compare function to sort by ranks (Ace has lower index and so we want ascending order of index)
function compareRanks( rank1, rank2 ) {
	return ( Ranks[ rank1].index - Ranks[ rank2 ].index );
}

// Get width of this hand
Hand.prototype.getWidth = function() {
	var layout = Directions[ this.direction ].layout;
	if ( layout === 'horizontal' ) {
		var suits = this.suits
		var firstSuit = true;
		var width = 0;
		for ( var suit in suits ) {
			if ( suits[ suit ].length > 0) {
				var gutter = Parameters.cardImages.widthShowing;
				width += ( firstSuit ? 0 : gutter ) + ( suits[ suit ].length - 1 ) * gutter + ( Parameters.cardImages.width );
				firstSuit = false;
			}
		}	
		return width;	
	}
	else if ( layout === 'vertical' ) {
		return ( this.longest - 1 ) * Parameters.cardImages.widthShowing + Parameters.cardImages.width;
	}
	else return 0;
};

Hand.prototype.getHeight = function() {
	var layout = Directions[ this.direction ].layout;
	if ( layout === 'horizontal' ) {
		return Parameters.cardImages.height;	
	}
	else if ( layout === 'vertical' ) {
		return 3 * Parameters.cardImages.heightShowing + Parameters.cardImages.height;
	}
	else return 0;	
};

/**
 * Set the width and height, top and left this hand
 *
 * @this {Hand}
 * @param void
 * @return void
 */
Hand.prototype.setHandDimensions = function( ) {
	var hand = this;
	var layout = Directions[ hand.direction ].layout;
	var position = Directions[ hand.direction ].position;
	hand.height = hand.getHeight();
	hand.width = hand.getWidth();
	hand.top = -1000;
	hand.left = -1000;
	if ( layout === 'horizontal' ) {
		if ( position === 'top' ) {
			hand.top = Parameters.viewport.centerY - Parameters.tableImage.height / 2 - 10 - hand.height;		
		}
		else if ( position === 'bottom' ) {
			hand.top = Parameters.viewport.centerY + Parameters.tableImage.height / 2 + 10;			
		}
		hand.left = Parameters.viewport.centerX - hand.width / 2;
		
	}
	else if ( layout === 'vertical' ) {
		hand.top = Parameters.viewport.centerY - hand.height / 2;
		if ( position === 'left' ) {
			hand.left = Parameters.viewport.centerX - Parameters.tableImage.width / 2 - 10 - hand.width;	
		}
		else if ( position === 'right' ) {
			hand.left = Parameters.viewport.centerX + Parameters.tableImage.width / 2 + 10;			
		}		
	}	
};

/**
 * Draw this hand to the screen
 *
 * @this {Hand}
 * @param void
 * @return void
 */
Hand.prototype.show = function() {
	var hand = this;
	var layout = Directions[ hand.direction ].layout;
	hand.setHandDimensions();
	var top = hand.top;
	var left = hand.left;
	var direction = hand.direction;	
	for ( var suit in hand.suits ) {
		for ( var i = 0; i < hand.suits[ suit ].length; ++i ) {	
			var rank = hand.suits[ suit ][ i ];
			showCard( suit, rank, direction, top, left );
			left += Parameters.cardImages.widthShowing;
		}
		if ( layout === 'horizontal' ) {
			left += Parameters.cardImages.width;
		}
		else if ( layout === 'vertical' ) {
			top += Parameters.cardImages.heightShowing;
			left = hand.left;
		}
	}		
};

Hand.prototype.hasCard = function( suit, rank ) {
	var suit = this.suits[ suit ];
	return suit.indexOf( rank ) !== -1;	
};

function getCardID( suit, rank ) {
	return 'card-' + suit + rank;
};

function getTableCardID( direction ) {
	return 'table-card-' + direction;
};

function clearTableCards() {
	for( var direction in Directions ) {
		var id = getTableCardID( direction );
		$( '#' + id ).remove();
	}	
};

// Show a card on screen at specified location
function showCard( suit, rank, direction, top, left ) {
	var container = 'body';	
	var imageID = getCardID( suit, rank );
	var imageName = Parameters.cardImages.folder + '/' + suit + rank + '.png';
	var src = imageName;
	$( container ).append( '<img id="' + imageID + '" class="fixed card"></img>' );
	var image = $( '#' + imageID );
	image.attr( 'src', src );
	image.attr( 'imageName', imageName );
	image.attr( 'status', 'not-played' );
	image.attr( 'suit', suit );
	image.attr( 'rank', rank );
	image.attr( 'direction', direction );
	image.css({
		width: Parameters.cardImages.width,
		height: Parameters.cardImages.height,
		top: top,
		left: left,
	});	
};



/**
 * Creates an instance of a Bridge Position
 *
 * @constructor
 * @this {Position}
 */
function Position( leader, trumpSuit ) {
	this.trumpSuit = trumpSuit;
	this.playNumber = 0;
	this.trickNumber = 0;
	this.trickWinner = null;
	this.tricks = {
		'ns' : 0,
		'ew' : 0,
	};
	this.playedCard = null;
	this.leadSuit = '';
	this.direction = '';
	this.nextTurn = leader;
	this.previousPosition = null;
	this.nextPosition = null;
	this.annotation = null;
};

// Some increment methods
Position.prototype.incrementTrickNumber = function() {
	this.trickNumber++;
};
Position.prototype.incrementNSTricks = function() {
	this.tricks[ 'ns' ]++;
};
Position.prototype.incrementEWTricks = function() {
	this.tricks[ 'ew' ]++;
};

/**
 * Creates an clone of this position
 *
 * @constructor
 * @this {Position}
 * @param void
 * @return void 
 */
Position.prototype.clone = function( suit, rank ) {
	var newPosition = new Position( this.nextTurn, this.trumpSuit );
	
	// Copy trump suit
	newPosition.trumpSuit = this.trumpSuit;
	
	// This is the next play
	newPosition.playNumber = this.playNumber + 1;
	
	//Trick number
	newPosition.trickNumber = this.trickNumber;
	if ( newPosition.playNumber % 4 === 1 ) {
		// The first card to next trick has been played. increment trick number
		newPosition.incrementTrickNumber();
	}
	
	// Update trick winner
	newPosition.trickWinner = {
		direction: this.nextTurn,
		suit: suit,
		rank: rank,
	}	
	if ( this.trickWinner !== null && this.playNumber % 4 !== 0 ) {
		// still old trick winner
		if ( ! doesCard2BestCard1( this, newPosition ) ) {
			for( var value in this.trickWinner ) {
				newPosition.trickWinner[ value ] = this.trickWinner[ value ];
			}
		}
	}
		
	// number of tricks won
	newPosition.tricks = {};
	for( var trick in this.tricks ) {
		 newPosition.tricks[ trick ] = this.tricks[ trick ];
	};
	
	if ( newPosition.playNumber % 4 === 0 ) {
		// Trick completed so who won
		var winner = newPosition.trickWinner.direction;
		if ( winner === 'n' || winner === 's' ) {
			newPosition.incrementNSTricks();
		}
		else if ( winner === 'e' || winner === 'w' ) {
			newPosition.incrementEWTricks();
		}
	}
	
	// Set the played card
	newPosition.playedCard = {
		suit: suit,
		rank: rank,
	};
	
	// set the lead suit
	newPosition.leadSuit = this.leadSuit;
	if ( newPosition.playNumber % 4 === 1 ) {
		// start of New trick so change lead suit to current suit
		newPosition.leadSuit = suit;
	}
		
	// Set the direction of this played card
	newPosition.direction = this.nextTurn;
	// Set next turn
	newPosition.nextTurn = getNextToPlay( this.nextTurn );
	if ( newPosition.playNumber % 4 === 0 ) {	
		// Trick completed so set trick winner on lead
		newPosition.nextTurn = newPosition.trickWinner.direction;
	}
	
	// Set links back and forward
	newPosition.previousPosition = this;
	this.nextPosition = newPosition;
	
	// No new annotation
	this.annotation = null;
	
	return newPosition;	
};

function doesCard2BestCard1( position1, position2 ) {
	var card1 = position1.trickWinner;
	var card2 = position2.trickWinner;
	var trumpSuit = position1.trumpSuit;
	if ( card1.suit !== trumpSuit) {
		if ( card2.suit === trumpSuit ) return true;
		else if ( card1.suit === card2.suit && compareRanks( card1.rank, card2.rank ) > 0 ) return true;
		return false;
	}
	else {
		if ( card1.suit === card2.suit && compareRanks( card1.rank, card2.rank ) > 0 ) return true;
		return false;
	}
	return false;
};




/**
 * Make the play associated with this position
 *
 * @this {Position}
 * @param void
 * @return void
 */
Position.prototype.clickCard = function( suit, rank ) {
	var newPosition = this.clone( suit, rank );
	newPosition.playCard();
	return newPosition;

};

Position.prototype.setAnnotation = function() {
	console.log('Play Number : '+this.playNumber + ' Annotation : '+this.annotation);
}

Position.prototype.playCard = function( animate ) {
	if ( animate === undefined ) animate = true;
	if ( this.playNumber % 4 === 1 ) {
		// Start of next trick so clear table
		clearTableCards();
	}
	if ( this.playedCard !== null ) {

		this.animateTableCard( animate );
	}	
	this.setAnnotation();
	this.setPlayableCards();
	this.updatePositionInformation();
};

Position.prototype.animateTableCard = function( animate ) {
	var direction = this.direction;
	var suit = this.playedCard.suit;
	var rank = this.playedCard.rank;
	var cardImageID = getCardID( suit, rank );
	var tableCardImageID = getTableCardID( direction );	
	var container = 'body';	
	var image = $( '#' + cardImageID );
	var src = image.attr( 'imageName' );
	var fromTop = image.position().top;
	var fromLeft = image.position().left;	
	
	// Create table card
	$( container ).append( '<img id="' + tableCardImageID + '" class="fixed table-card"></img>' );
	var tableCardImage = $( '#' + tableCardImageID );
	tableCardImage.attr( 'src', src );
	// set it initally on top of card
	tableCardImage.css({
		width: Parameters.cardImages.width,
		height: Parameters.cardImages.height,
		top: fromTop,
		left: fromLeft,
	});	
	
	// animate it to its table position
	var toTop = Parameters.tableCardPosition[ direction ].top;
	var toLeft = Parameters.tableCardPosition[ direction ].left;
	tableCardImage.animate({top:toTop,left:toLeft}, 300, function() {});	
	
	// Update original image properties
	image.attr( 'src' , Parameters.cardImages.folder + '/' + Parameters.cardImages.cardBack );
	image.attr( 'status', 'played' );
};

Position.prototype.playTableCard = function() {
	var direction = this.direction;
	var suit = this.playedCard.suit;
	var rank = this.playedCard.rank;
	var imageID = getCardID( suit, rank );
	var tableCardImageID = getTableCardID( direction );	
	$( '#' + tableCardImageID ).remove();
	var container = 'body';	
	var image = $( '#' + imageID );
	var src = image.attr( 'imageName' );
	var top = Parameters.tableCardPosition[ direction ].top;
	var left = Parameters.tableCardPosition[ direction ].left;	
	
	// Create table card
	$( container ).append( '<img id="' + tableCardImageID + '" class="fixed table-card"></img>' );
	var tableCardImage = $( '#' + tableCardImageID );
	tableCardImage.attr( 'src', src );
	// set it initally on top of card
	tableCardImage.css({
		width: Parameters.cardImages.width,
		height: Parameters.cardImages.height,
		top: top,
		left: left,
	});	
};

Position.prototype.setPlayableCards = function() {
	// Remove highlight anc click handler on all cards
	$( '.card' ).unbind( 'click' ).removeClass( 'img-highlight' );
	// Set the playable cards
	var elements = '[direction='+ this.nextTurn + '][status="not-played"]';	
	if ( this.leadSuit !== '' && this.playNumber % 4 !== 0 ) {
		var extendedElements = elements + '[suit="' + this.leadSuit + '"]';
		var numInSuit = $( extendedElements ).length;
		if ( numInSuit > 0 ) elements = extendedElements;
	}
	$( elements ).addClass( 'img-highlight' ).click(function() { 
		deal.cardClicked( this );
	});	
};

Position.prototype.updatePositionInformation = function() {
	$( '#play-number' ).html( this.playNumber );
	$( '#trick-number' ).html( this.trickNumber );
	$( '#ns-tricks' ).html( this.tricks[ 'ns' ] );
	$( '#ew-tricks' ).html( this.tricks[ 'ew' ] );
	this.updateButtonStatus();
}

Position.prototype.updateButtonStatus = function() {
	var prevDisabled = false;
	if ( this.previousPosition === null ) {
		prevDisabled = true;
	}
	$('#rewind').attr( 'disabled', prevDisabled );
	$('#undo-trick').attr( 'disabled', prevDisabled );
	$('#undo-play').attr( 'disabled', prevDisabled );
	var nextDisabled = false;
	if ( this.nextPosition === null ) {
		nextDisabled = true;
	}
	$('#redo-trick').attr( 'disabled', nextDisabled );
	$('#redo-play').attr( 'disabled', nextDisabled );	
	$('#fast-forward').attr( 'disabled', nextDisabled );	
};

Position.prototype.undoTrick = function() {
	if ( this.playNumber === 0 ) {
		$( '#status' ).html( 'At Play 0. Nothing to Undo!' );
		console.log('nothing to undo');
		return this.playNumber;
	}	
	
	var playNumber = this.undoCard();
	if ( playNumber === this.playNumber ) return playNumber;
	var position = this.previousPosition;
	while ( position !== null && position.playNumber % 4 !== 0 ) {
		playNumber = position.undoCard();
		if ( playNumber === position.playNumber ) return playNumber;
		position = position.previousPosition;
	}	
	return position.playNumber;
};

Position.prototype.redoTrick = function() {
	var playNumber = this.redoCard();
	if ( playNumber === this.playNumber ) return playNumber;
	var position = this.nextPosition;
	while ( position !== null && position.playNumber % 4 !== 0 ) {
		playNumber = position.redoCard();
		if ( playNumber === position.playNumber ) return playNumber;
		position = position.nextPosition;
	}	
	return position.playNumber;
};

Position.prototype.changeToPlay = function( playNumber ) {
	if ( this.playNumber < playNumber ) return this.fastForward( playNumber );	
	else if ( this.playNumber > playNumber ) return this.rewind( playNumber );
	else {
		trace( 'Hash changed to ' + playNumber + ' but alread at that play number!' );
	}
	return this.playNumber;
};

Position.prototype.rewind = function( endPlayNumber ) {
	if ( endPlayNumber === undefined ) endPlayNumber = 0;
	if ( this.playNumber === 0 ) {
		$( '#status' ).html( 'At Play 0. Nothing to Undo!' );
		console.log('nothing to undo');
		return this.playNumber;
	}	
	
	var playNumber = this.undoCard();
	if ( playNumber === this.playNumber ) return playNumber;
	var position = this.previousPosition;
	while ( playNumber !== endPlayNumber ) {
		playNumber = position.undoCard();
		if ( playNumber === position.playNumber ) return playNumber;
		position = position.previousPosition;
	}	
	return position.playNumber;
};

Position.prototype.fastForward = function( endPlayNumber ) {
	if ( endPlayNumber === undefined ) endPlayNumber = 100000;
	var playNumber = this.redoCard();
	if ( playNumber === this.playNumber ) return playNumber;
	var position = this;
	while ( position.nextPosition !== null && position.nextPosition.playNumber !== endPlayNumber ) {
		position = position.nextPosition;
		playNumber = position.redoCard();
		if ( playNumber === position.playNumber ) return playNumber;
	}	
	return position.nextPosition.playNumber;
};

Position.prototype.undoCard = function() {
	if ( this.playNumber === 0 ) {
		$( '#status' ).html( 'At Play 0. Nothing to Undo!' );
		console.log('nothing to undo');
		return this.playNumber;
	}
	var direction = this.direction;
	var suit = this.playedCard.suit;
	var rank = this.playedCard.rank;
	
	if ( this.playNumber % 4 === 1 ) {
		clearTableCards();
		var count = 0;
		var position = this.previousPosition;
		while( count < 4 && position.playNumber !== 0 && position !== null ) {
			position.playTableCard();
			count++;
			position = position.previousPosition;
		}
	} 
	else {
		var tableImageID = getTableCardID( direction );	
		$( '#' + tableImageID ).remove();
	}
	var imageID = getCardID( suit, rank );
	var card = $( '#' + imageID );
	card.attr( 'src', card.attr( 'imageName' ) ).attr( 'status', 'not-played' );
	this.previousPosition.setPlayableCards();
	this.previousPosition.updatePositionInformation();
	this.previousPosition.setAnnotation();
	return this.previousPosition.playNumber;
};

Position.prototype.redoCard = function() {
	if ( this.nextPosition === null ) {
		$( '#status' ).html( 'At last Play. Nothing to Redo!' );
		console.log('nothing to redo');
		return this.playNumber;
	}
	this.nextPosition.playCard( false );
	return this.nextPosition.playNumber;
};



/**
 * Creates an instance of a Bridge Deal
 *
 * @constructor
 * @this {Deal}
 * @param {array} queryParameters an associative array of parsed query parameters 
 */
function Deal( queryParameters ) {
	this.queryParameters = queryParameters;
	this.errors = [];	
	this.hands = {};
	this.positions = [];

	for( var direction in Directions ) {
		this.hands[ direction ] = new Hand( direction );	
	};
	
	// Load the hands
	this.loadHands( queryParameters );
	
	// Load other information like dealer, contract etc.
	this.loadDealInformation( queryParameters );
	
	
	// Load initial position
	this.currentPositionIndex = 0;
	this.positions[ 0 ] = new Position( this.leader, this.trumpSuit );	
	
	// Load any plays if specified 
	this.loadPlay( queryParameters );
};

/**
 * Load the play specified in the query parameters
 *
 * @method loadPlay
 * @this {Deal}
 * @param {array} queryParameters an associative array of parsed query parameters 
 * @return void
 */
Deal.prototype.loadPlay = function( queryParameters ) {
	var playString = '';
	if ( queryParameters['p'] !== undefined ) {	
		// Play has been specified
		playString = queryParameters['p'];
	}
	else 	if ( queryParameters['P'] !== undefined ) {	
		// Play has been specified
		playString = queryParameters['P'];
	}
	else {
		// No play specified
		return;	
	}
	var play = playString.toLowerCase();
	var currentIndex = 0;
	for( var i = 0;i < play.length; ++i ) {
		var currentPosition = this.positions[ currentIndex ];
		var prefix = 'In play specified at position ' + (i+1) + ' - ';		
		var suit = play.charAt( i );
		if ( suit === '{' ) {
			var endBraces = play.indexOf( '}', i+1 );
			if ( endBraces === -1 ) {
				this.addError( prefix + ' No closing } found!' );
				return;
			}
			currentPosition.annotation = playString.slice( i+1, endBraces );
			i = endBraces;
			continue;
		}
		if ( ! (suit in Suits) ) {
			this.addError( prefix + suit + ' is not a valid suit ' );
			return;
		}
		i++;
		prefix = 'In play specified at position ' + (i+1) + ' - ';	
		if ( i >= play.length ) {
			this.addError( prefix + ' No rank has been specified for suit ' + suit );
			return;
		}
		var rank = play.charAt( i );
		if ( ! (rank in Ranks) ) {
			this.addError( prefix + rank + ' is not a valid rank ' );
			return;
		}
		var newPosition = currentPosition.clone( suit, rank );
		var direction = newPosition.direction;
		if ( ! this.hands[ direction ].hasCard( suit, rank ) ) {
			this.addError( prefix + ' Card ' + getSuitName( suit ) + getRankName( rank ) + ' does not belong to ' + getDirectionName( direction ) + ' whose turn it is at that point!' );
			return;
		}
		currentIndex++;
		this.positions[ currentIndex ] = newPosition;
	}
};

Deal.prototype.cardClicked = function( card ) {
	
	var suit = $( card ).attr( 'suit' );
	var rank = $( card ).attr( 'rank' );
	var currentPosition = this.positions[ this.currentPositionIndex ];
	this.setPosition( this.currentPositionIndex + 1);
	this.positions[ this.currentPositionIndex ] = currentPosition.clickCard ( suit, rank );
	// Splice elements past current index
	var total = this.positions.length;
	var toBeRemoved = total - this.currentPositionIndex - 1;
	if ( toBeRemoved > 0 )	this.positions.splice( this.currentPositionIndex+1, toBeRemoved );
};

/**
 * Were any errors found when parsing deal?
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.hasErrors = function() {
	return this.errors.length > 0;	
};

/**
 * Add an error
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.addError = function( error ) {
	this.errors.push( error );
};

/**
 * Display all errors found when parsing Deal.
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.showErrors = function() {
	var instructions = $( '#instructions' ).html();
	var container = 'body';
	$( container ).empty().append( '<h1>Errors Found as noted below</h1>' );
	var html = '<ol class="rounded-list"><li><span class="item">';
	html += this.errors.join( '</span></li><li><span class="item">' );
	html += '</span></li></ol>'
	$( container ).append( html );	
	$( container ).append( instructions );	
};

/**
 * Load the hands specified in the query parameters
 *
 * @method loadHands
 * @this {Deal}
 * @param {array} queryParameters an associative array of parsed query parameters 
 * @return void
 */
Deal.prototype.loadHands = function( queryParameters ) {
	// A tally of which hands are not specified in the query Parameters
	var unspecifiedHands = [];
	
	// Keeping track cards that have been assigned as we read query parameters
	this.assigned = {};
	for( var suit in Suits ) {
		// Ignore n (no trump)
		if ( suit !== 'n' ) {
			this.assigned[ suit ] = {};
			for( var rank in Ranks ) {
				this.assigned[suit][rank] = '';
			}
		}	
	};	
	
	// Look for hands specified for each direction
	for( var direction in Directions ) {
		if ( queryParameters [ direction ] !== undefined ) {
			// If specified load hand for direction
			this.loadHand( direction, queryParameters [ direction ] );
		}
		else if ( queryParameters [ direction.toUpperCase() ] !== undefined ) {
			// If specified load hand for direction
			this.loadHand( direction, queryParameters [ direction.toUpperCase() ] );
		}
		else {
			// Hand not specified
			unspecifiedHands.push( direction );
		}
	}
	
	// If 3 hands specified then load fourth hand automatically
	if ( unspecifiedHands.length === 1 ) {
		this.assignRest( unspecifiedHands[ 0 ] );
	}	
	else if ( unspecifiedHands.length > 1 ) {
		var hands = [];
		for( var i = 0;i < unspecifiedHands.length; ++i ) hands.push( getDirectionName( unspecifiedHands[ i ]) );
		var message = hands.join(' and ');
		message += ' hands have not been specified!';
		this.addError( message );
	}
};

/**
 * Assign rest of cards to last unspecified hand
 *
 * @this {Deal}
 * @param {string} direction the hand that has not be assigned yet
 * @return void
 */
Deal.prototype.assignRest = function( direction ) {
	var currentHand = this.hands[ direction ];
	for( var suit in this.assigned ) {
		for( var rank in this.assigned[ suit ] ) {
			if ( this.assigned[ suit ][ rank ] === '' ) {
				currentHand.addCard( suit, rank );
				this.assigned[ suit ][ rank ] = direction;
			}
		}
	}
	currentHand.sortAndCount();
	if ( currentHand.numCards < 1 || currentHand.numCards > 13 ) {
		var message = getDirectionName( direction ) + ' hand had ' + currentHand.numCards + ' cards!';
		this.addError( message );
	}	
};

/**
 * Parse one hand specified in query parameters
 *
 * @this {Deal}
 * @param {string} direction the hand (sitting in the specified direction) to load
 * @param {string} handString the hand specified in the query parameters for this direction
 * @return void
 */
Deal.prototype.loadHand = function( direction, handString) {
	handString = handString.toLowerCase();
	var directionName = getDirectionName( direction );
	var currentHand = this.hands[ direction ];
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
				if ( i < handString.length - 1 && handString.charAt( i+1 ) === '0') {
					currentRank = 't';
					i++;
				}
				else {
					this.addError( prefix + 'a 1 is present without a subsequent 0. Use 10 or t to reprensent the ten.' );
					continue;
				}
			
			// All other characters
			default :
				currentRank = currentChar;
				if ( currentRank in Ranks ) {
					// Valid rank
					if ( this.assigned[ currentSuit ][ currentRank ] !== '' ) {
						this.addError( prefix + getSuitName(currentSuit) + getRankName(currentRank) + ' has already been assigned to ' + getDirectionName( this.assigned[ currentSuit ][ currentRank ]) );
					}
					else {
						currentHand.addCard( currentSuit, currentRank );
						this.assigned[ currentSuit ][ currentRank ] = direction;
					}
				}
				else {
					// Unknown character
					this.addError( prefix + 'character ' + currentRank + ' is not recognized as a card suit or rank!' );
					continue;					
				}
				break;											
		}	
	}
	currentHand.sortAndCount();	
	if ( currentHand.numCards < 1 || currentHand.numCards > 13 ) {
		var message = getDirectionName( direction ) + ' hand had ' + currentHand.numCards + ' cards!';
		this.addError( message );
	}	
};

/**
 * Parse query parameters for other information like auction, dealer etc.
 *
 * @this {Deal}
 * @param {array} queryParameters an associative array of parsed query parameters 
 * @return void
 */
Deal.prototype.loadDealInformation = function( queryParameters ) {
	this.dealInformation = {};
	
	// Optional parameters 
	
	// Load Board Number
	if ( queryParameters['b'] !== undefined ) {
		this.dealInformation[ 'Board' ] = queryParameters['b'].toLowerCase();
	}
	else if ( queryParameters['B'] !== undefined ) {
		this.dealInformation[ 'Board' ] = queryParameters['B'].toLowerCase();
	}
	
	// Load dealer
	if ( queryParameters['d'] !== undefined ) {
		this.dealInformation[ 'Dealer' ] = getDirectionName( queryParameters['d'].toLowerCase() );
	}
	else if ( queryParameters['D'] !== undefined ) {
		this.dealInformation[ 'Dealer' ] = getDirectionName( queryParameters['D'].toLowerCase() );
	}

	// Load vulnerability
	if ( queryParameters['v'] !== undefined ) {
		this.dealInformation[ 'Vulnerability' ] = getVulnerability( queryParameters['v'].toLowerCase() );
	}
	else if ( queryParameters['V'] !== undefined ) {
		this.dealInformation[ 'Vulnerability' ] = getVulnerability( queryParameters['V'].toLowerCase() );
	}
	
	var contractString = '';	
	// Contract or trumps are required
	if ( queryParameters['a'] !== undefined ) {
		var contractString = queryParameters['a'].toLowerCase();
	}
	else if ( queryParameters['A'] !== undefined ) {
		var contractString = queryParameters['A'].toLowerCase();
	}
	if ( contractString !== '' ) {
		if ( contractString.charAt(0) !== '-' ) {
			this.addError( 'Full auctions are not supported. Specify a final contract or trump suit by setting the first character of the a parameter to a minus sign (-) and then specifying contract (a=-4se sets the contract to 4 spades by East) or specifying trump and leader (a=-sc will put South on lead with clubs as trump). ' );
		}
		else {
			var contractLevel = parseInt( contractString.charAt(1) );
			if ( isNaN( contractLevel ) ) {
				// What is trump suit
				this.trumpSuit = contractString.charAt(1);
				this.dealInformation[ 'Trumps' ] = getSuitName( this.trumpSuit );
				if ( !( this.trumpSuit in Suits ) ) {
					this.addError( this.trumpSuit + ' is not a valid trump suit!' );
				}				
				
				// Who is the leader
				this.leader = contractString.charAt(2);
				if ( !( this.leader in Directions ) ) {
					this.addError( this.leader + ' is not a valid leader position' );
				}				
			}
			else {
				// is contract level valid
				if ( this.contractLevel < 1 || this.contractLevel > 7 ) {
					this.addError( this.contractLevel + ' is not a valid contract level!' );
				}
				
				// What is the trump suit
				this.trumpSuit = contractString.charAt(2);
				
				if ( !( this.trumpSuit in Suits ) ) {
					this.addError( this.trumpSuit + ' is not a valid trump suit!' );
				}
				
				// Who is declarer
				var declarer = contractString.charAt(3);
				
				if ( !( declarer in Directions ) ) {
					this.addError( this.declarer + ' is not a valid declarer position' );
				}	
				
				// Who is on lead
				this.leader = getLeader( declarer );
						
				// Determine the contract
				this.dealInformation[ 'Contract' ] = contractLevel + ' ' + getSuitName( this.trumpSuit );	
				this.dealInformation[ 'Declarer' ] = getDirectionName( declarer );		
			}
		}
	}	
	else {
		this.addError( 'No contract has been specified!' );
	}	
};

/**
 * Draw this deal on the screen
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.show = function() {
	var container = 'body';
	
	// Calculate sizes of all elements
	computeScaledParameters();	
	
	// empty the container
	$( container ).empty();
	
	this.showTable();
	
	// Show information about deal
	this.showDealInformation();
	
	// Show information about deal
	this.showPositionInformation();	
	
	// Show the footer
	this.showFooterBar();
	
	// Show the hands
	this.showHands();
	
	// Show 0th position
	this.positions[ 0 ].playCard( false );
	/*for( var i = 0;i <= this.currentPositionIndex; ++i ) {
		this.positions[ i ].playCard( false );
	}*/
}

/**
 * Show the footer bar
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.showFooterBar = function() {
	var footerID = "footer";
	var container = 'body';
	var fields = {
		'rewind' : 		{ name: 'Rewind',				icon: 'first', },
		'undo-trick' :	{ name: 'Undo Previous Trick',	icon: 'rewind', },
		'undo-play' :	{ name: 'Undo Previous Play',	icon: 'prev', },
		'redo-play' :	{ name: 'Redo Next Play',		icon: 'next', },
		'redo-trick' :	{ name: 'Redo Next Trick',		icon: 'forward', },
		'fast-forward' :{ name: 'Fast Forward',			icon: 'last', },		
	};
	var html = '<div id="'+ footerID + '" class=" fixed fbar">';
	//var sizeClass = 'sexysmall';
	var sizeClass = 'button-text';
	//if ( Parameters.scalingFactor < 1 && Parameters.scalingFactor > 0.75 ) sizeClass = 'sexymedium';
	//else if ( Parameters.scalingFactor <= 0.75 ) sizeClass = 'sexysmall';
	for( var field in fields ) {
		html += '<button id="' + field + '" class="sexybutton sexysimple ' + sizeClass + ' sexygreen"><span class="'+ fields[ field ].icon + '">'+ fields[ field ].name + '</span></button>';
	}
	html += '</div>';
	$( container ).append( html );
	var footer = $( '#' + footerID );
	footer.css({
		left:0,
		bottom:0,
		width: Parameters.viewport.width,
	});
	
	$('#undo-play').click(function() {
		deal.undoCard();	
	});
	$('#redo-play').click(function() {
		deal.redoCard();	
	});	
	$('#undo-trick').click(function() {
		deal.undoTrick();	
	});
	$('#redo-trick').click(function() {
		deal.redoTrick();	
	});	
	$('#rewind').click(function() {
		deal.rewind();	
	});
	$('#fast-forward').click(function() {
		deal.fastForward();	
	});		
		
};

/**
 * Show information about the current position.
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.showPositionInformation = function() {
	var tableID = 'position-information';
	var fields = {
		'Play Number' : { value: 0, id : 'play-number', },
		'Trick Number' : { value: 0, id : 'trick-number', },
		'NS Tricks' : { value: 0, id : 'ns-tricks', },
		'EW Tricks' : { value: 0, id : 'ew-tricks', },
	}
	var html = '<table id="' + tableID + '" class="fixed table1">';
	html += '<thead><tr><th colspan=2>Play Information</th></tr></thead><tbody>';
	html += getTableBody( fields );
	//html += '<tr><td><button id="undo">Undo</button><td><button id="redo">Redo</button></tr>';
	html += '<tbody></table>';	
	var container = 'body';
	$( container ).append( html );
	var table = $( '#' + tableID );
	table.css({
		top: 10,
		left: 10,
	});	

};

Deal.prototype.setPosition = function( index, changeHash ) {
	if ( changeHash === undefined ) changeHash = true;
	this.currentPositionIndex = index;
	if ( changeHash ) {
		Parameters.manualHashChange = true;
		window.location.hash = index;	
	}
};

Deal.prototype.changeToPlay = function( playNumber ) {
	if ( playNumber < 0 || playNumber > this.positions.length - 1 ) {
		trace( 'Invalid play number ' +  playNumber + ' specified in url after #.' );
		return;
	}
	this.setPosition( this.positions[ this.currentPositionIndex ].changeToPlay( playNumber ), false );
};

Deal.prototype.undoCard = function() {
	this.setPosition( this.positions[ this.currentPositionIndex ].undoCard() );
};

Deal.prototype.redoCard = function() {
	this.setPosition( this.positions[ this.currentPositionIndex ].redoCard() );
};

Deal.prototype.undoTrick = function() {
	this.setPosition( this.positions[ this.currentPositionIndex ].undoTrick() );
};

Deal.prototype.redoTrick = function() {
	this.setPosition( this.positions[ this.currentPositionIndex ].redoTrick() );
};

Deal.prototype.rewind = function() {
	this.setPosition( this.positions[ this.currentPositionIndex ].rewind() );
};

Deal.prototype.fastForward = function() {
	this.setPosition( this.positions[ this.currentPositionIndex ].fastForward() );
};

/**
 * Show information about the deal.
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.showDealInformation = function() {
	var tableID = 'deal-information';
	var html = '<table id="' + tableID + '" class="fixed table1">'
	html += '<thead><tr><th colspan=2>Deal Information</th></tr></thead>';
	html += getTableBody( this.dealInformation );
	html += '</table>';	
	var container = 'body';
	$( container ).append( html );
	var table = $( '#' + tableID );
	table.css({
		top: 10,
		left: Parameters.viewport.width - table.width() - 10,
	});	
};

/**
 * Draw the table where played cards will be shown
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.showTable = function() {
	var container = 'body';
	
	// Create a rectangular table in center with green background
	var tableID = Parameters.tableImage.id;
	$( container ).append( '<div id="' + tableID + '" class="fixed '+ Parameters.tableImage.class + '"></div>' );
	var tableDimensions = {
		width: Parameters.tableImage.width,
		height: Parameters.tableImage.height,
		top: Parameters.tableImage.top,
		left: Parameters.tableImage.left,
	};
	trace( 'Drawing Table with dimensions ' + JSON.stringify( tableDimensions ) );
	var table = $( '#' + tableID );
	table.css( tableDimensions );
	
	// Show the compass in middle of screen
	var compassID = Parameters.compassImage.id;
	$( container ).append( '<img id="' + compassID + '" class="fixed '+ Parameters.compassImage.class + '"></img>' );
	var compass = $( '#' + compassID );
	var imageName = Parameters.compassImage.imageName;
	compass.attr( 'src' , imageName );
	var compassDimensions = {
		width: Parameters.compassImage.width,
		height: Parameters.compassImage.height,
		top: Parameters.compassImage.top,
		left: Parameters.compassImage.left,
	};
	trace( 'Drawing compass with src ' + imageName + ' with dimensions ' + JSON.stringify( compassDimensions ) );		
	compass.css( compassDimensions );	
};

/**
 * Show information about the deal.
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.showHands = function() {
	for( var direction in this.hands ) {
		// Show each hand in turn
		this.hands[ direction ].show();
	}
};


function processHash() {
	if ( ! Parameters.manualHashChange ) {
		var hash = location.hash.substring(1);
		var playNumber = hash ? parseInt( hash ) : 0;
		deal.changeToPlay( parseInt( playNumber ) );
	}
	Parameters.manualHashChange = false;	
};

jQuery(function($) {
	// The equivalent of the main function
	var queryParameters = QueryParameters.parse();
	
	// Check if any query parameters specified
	if ( queryParameters !== undefined && queryParameters.length > 0 ) {
		// Load the hands into a new deal
		deal = new Deal( queryParameters );
		
		// Check if any errors
		if ( deal.hasErrors() ) {
			// Errors - Show the errors
			deal.showErrors();
		}
		else {
			
			// Show deal information
			deal.show();
			processHash();
			
			// Setup handler to detect window resize and redraw everything
			$(window).resize(function() {
				deal.show();
				processHash();
			});		
			$(window).hashchange( function(){
				processHash();
		  	});					
		}
	}
	else {
		// Will show default instructions page. Nothing to do.
	}
});

