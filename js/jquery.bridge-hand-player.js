
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

var BootstrapParameters = {
	tableHeaderClass: 'info',
	tableRowKeyClass: 'active',
	tableRowValueClass: '',
	flashOnLead: false,
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
	class: 'card-table',
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
	style += 'table.table {font-size: ' + Parameters.textSize.fontSize + 'px; line-height: ' + Parameters.textSize.lineHeight + 'em;}';
	style += '.panel {font-size: ' + Parameters.textSize.fontSize + 'px; line-height: ' + Parameters.textSize.lineHeight + 'em;}';
	style += '.text-size {font-size: ' + Parameters.textSize.fontSize + 'px !important;}';
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
	'n' : { name : 'NT',									index : 4 },
	's' : { name : '<font color="000000">&spades;</font>', 	index : 3 },
	'h' : { name : '<font color="CB0000">&hearts;</font>', 	index : 2 },
	'd' : { name : '<font color="CB0000">&diams;</font>',	index : 1 },
	'c' : { name : '<font color="000000">&clubs;</font>', 	index : 0 },
};

function getSuitName( suit ) {
	if ( suit in Suits ) return Suits[ suit ].name;
	return 'Unknown';
};

function getSuitIndex( suit ) {
	if ( suit in Suits ) return Suits[ suit ].index;
	return -1;
}

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
	var rowValueClass = 'class="' + BootstrapParameters.tableRowValueClass + '"';
	for ( var key in fields ) {
		var value = fields[ key ];
		html += '<tr>';
		html += '<th class="text-right ' + BootstrapParameters.tableRowKeyClass + '">' + key + '</th>';
		if ( typeof value === 'string' ) {
			html += '<td ' + rowValueClass + ' >' + value + '</td>';
		}
		else {
			if ( 'id' in value ) {
				html += '<td ' + rowValueClass + ' id="' + value.id + '">' + value.value + '</td>';
			}
			else {
				html += '<td ' + rowValueClass + '>' + value.value + '</td>';
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
	//this.name = getDirectionName( direction );
	this.name = null;
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
		var suits = this.suits;
		var numSuits = 0;
		for ( var suit in suits ) {
			if ( suits[ suit ].length > 0) {
				numSuits++;
			}
		}
		return ( numSuits - 1 ) * Parameters.cardImages.heightShowing + Parameters.cardImages.height;
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
Hand.prototype.show = function( declarer ) {
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
		if ( layout === 'horizontal' && hand.suits[ suit ].length > 0 ) {
			left += Parameters.cardImages.width;
		}
		else if ( layout === 'vertical' && hand.suits[ suit ].length > 0 ) {
			top += Parameters.cardImages.heightShowing;
			left = hand.left;
		}
	}

	var container = 'body';
	var id = hand.direction + '-name-details';
	var headerID = id + '-header';
	var bodyID = id + '-body';
	var html = '<div id="'+ id + '" class="fixed panel panel-default">';
	html += '<div id="' + headerID + '" class="panel-heading">';
	html += hand.getName();
	html += '</div>';
	html += '<div id="' + bodyID + '" class="panel-body">'
   	html += '</div>';
   	html += '</div>';
   	$( container ).append( html );
   	var headerHeight = $( '#' + headerID ).height();
	var nameElement = $( '#' + id );
	nameElement.css({
		left: hand.left-4,
		top: hand.top - headerHeight - 25,
		width: hand.width + 10,
		zIndex: -1,
	});
	var bodyElement = 	$( '#' + bodyID );
	bodyElement.css({
		height: hand.height + 5,
	});
	// Show name
	/*var declarerText = '';
	if ( declarer in Directions ) {
		if ( hand.direction === declarer ) declarerText = 'Declarer';
		else if ( ! areOppositeDirections( hand.direction, declarer ) ) declarerText = 'Dummy';
	}
	var id = hand.direction + '-name-details';
	var nameID = hand.direction + '-name';
	var annotationID = hand.direction + '-annotation';
	var leadID = hand.direction + '-lead-text';
	var html = '<span id="'+ id + '" class="text-size fixed name-inactive"><span id="' + nameID + '" >' + hand.getName() + '</span> <span id="' + annotationID + '">' + declarerText + '</span> <span id="' + leadID + '"></span></span>';
	var container = 'body';
	$( container ).append( html );
	var nameElement = $( '#' + id);
	nameElement.css({
		left: hand.left,
		bottom: Parameters.viewport.height - hand.top + 5,
	});*/
};

Hand.prototype.getName = function() {
	var name = getDirectionName( this.direction );
	if ( this.name ) name += ' (' + this.name + ')';
	return name;
}

var intervalID = null;
function setActiveHand( activeDirection ) {
	for( var direction in Directions ) {
		var nameID = direction + '-name-details';
		var nameElement = $( '#' + nameID );
		var leadID = direction + '-lead-text';
		if ( direction === activeDirection ) {
			if ( BootstrapParameters.flashOnLead ) {
				if ( intervalID ) clearInterval( intervalID );
				intervalID = setInterval( function() {
					var name = $( '#' + activeDirection + '-name-details' );
					if ( name.hasClass( 'panel-default' ) ) {
						name.removeClass( 'panel-default' ).addClass( 'panel-info' );
					}
					else {
						name.removeClass( 'panel-info' ).addClass( 'panel-default' );
					}
				}, 500 );
			}
			else {
				nameElement.removeClass( 'panel-default' ).addClass( 'panel-info' );
			}
			//$( '#' + nameID ).removeClass( 'name-inactive' ).addClass( 'name-active' );
			//$( '#' + leadID ).html( '(On Lead)' );
		}
		else {
			nameElement.removeClass( 'panel-info' ).addClass( 'panel-default' );
			//$( '#' + nameID ).removeClass( 'name-active' ).addClass( 'name-inactive' );
			//$( '#' + leadID ).empty();
		}
	}
};

Hand.prototype.hasCard = function( suit, rank ) {
	var suit = this.suits[ suit ];
	return suit.indexOf( rank ) !== -1;
};

Hand.prototype.getHandString = function() {
	var hand = this;
	var str = hand.direction + '=';
	for ( var suit in hand.suits ) {
		if ( hand.suits[ suit ].length > 0 ) {
			str += suit;
			for ( var i = 0; i < hand.suits[ suit ].length; ++i ) {
				str += hand.suits[ suit ][ i ];
			}
		}
	}
	return str;
}

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

Position.prototype.getCardString = function() {
	if ( this.playedCard ) return this.playedCard.suit + this.playedCard.rank;
	else return '';
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

	// Start with no annotation
	newPosition.annotation = null;

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
	$( '#status' ).empty().append( getDirectionName( this.nextTurn) + ' to play<br/>' );
	if ( this.annotation !== null ) {
		$( '#status' ).append( unescape( this.annotation ) );
	}
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

	//var imageHighlightClass = 'thumbnail';
	var imageHighlightClass = 'img-highlight';
	// Remove highlight anc click handler on all cards
	$( '.card' ).unbind( 'click' ).removeClass( imageHighlightClass ).addClass( 'cursor-not-allowed' );
	// Set the playable cards
	var elements = '[direction='+ this.nextTurn + '][status="not-played"]';
	if ( this.leadSuit !== '' && this.playNumber % 4 !== 0 ) {
		var extendedElements = elements + '[suit="' + this.leadSuit + '"]';
		var numInSuit = $( extendedElements ).length;
		if ( numInSuit > 0 ) elements = extendedElements;
	}
	$( elements ).addClass( imageHighlightClass ).removeClass( 'cursor-not-allowed' ).click(function() {
		deal.cardClicked( this );
	});
	setActiveHand( this.nextTurn );
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

function updateStatus( message ) {
	$( '#status' ).html( message );
};

Position.prototype.undoTrick = function() {
	if ( this.playNumber === 0 ) {
		trace( 'Nothing to Undo' );
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
		trace( 'At Play 0. Nothing to Undo!' );
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
		trace( 'At Play 0. Nothing to Undo!' );
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
		trace( 'At last Play. Nothing to Redo!' );
		return this.playNumber;
	}
	this.nextPosition.playCard( false );
	return this.nextPosition.playNumber;
};

function Bid( direction, level, suit, annotation ) {
	if ( annotation === undefined ) annotation = null;
	this.direction = direction;
	this.level = level;
	this.suit = suit;
	this.annotation = annotation;
};

Bid.prototype.toString = function() {
	var bidString = ''
	if ( this.suit === 'x' ) bidString = '<font color="red">X</font>';
	else if ( this.suit === 'r' ) bidString = '<font color="blue">XX<font>';
	else if ( this.suit === 'p' ) bidString = '<font color="green">Pass</font>';
	else if ( this.suit in Suits ) {
		bidString = this.level + getSuitName( this.suit );
	}
	else bidString = 'Unknown';
	if ( this.annotation === null ) return bidString;
	else return '<span data-toggle="tooltip" class="bg-info bid-annotation" title="' + unescape( this.annotation ) +'">' + bidString + '</span>';
};

Bid.prototype.getString = function() {
	var bidString = ''
	if ( this.suit === 'x' ) bidString = 'x';
	else if ( this.suit === 'r' ) bidString = 'r';
	else if ( this.suit === 'p' ) bidString = 'p';
	else if ( this.suit in Suits ) {
		bidString = this.level + this.suit;
	}
	else bidString = 'u';
	if ( this.annotation ) bidString += '{' + this.annotation + '}';
	return bidString;
}



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
	this.auction = [];

	for( var direction in Directions ) {
		this.hands[ direction ] = new Hand( direction );
	};

	// Load the hands
	this.loadHands( queryParameters );

	// Load other information like dealer, contract etc.
	this.loadDealInformation( queryParameters );

	// Load the auction
	this.loadAuction( queryParameters );

	// Load names of players
	this.loadNames( queryParameters );

	// Load initial position
	this.currentPositionIndex = 0;
	this.positions[ 0 ] = new Position( this.leader, this.trumpSuit );

	// Load any plays if specified
	this.loadPlay( queryParameters );
};

/**
 * Dump the deal up to the current position into a handviewer url
 *
 * @method createHandViewerURL
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.createHandViewerURL = function( ) {

	// URL
	var url = 'https://www.bridgebase.com/tools/handviewer.html?';

	// Get the hands and names
	var hands = [];
	var names = '';
	for( var direction in Directions ) {
		var hand = this.hands[ direction ];
		if ( hand.name ) {
			names += '&' + direction + 'n=' + hand.name;
		}
		hands.push( this.hands[ direction ].getHandString() );
	}
	url += hands.join( '&' );
	url += names;

	// Get the auction
	url += '&a=';
	if ( this.auction.length >  0 ) {
		for( var i = 0; i < this.auction.length; ++i ) {
			url += this.auction[ i ].getString();
		}
	}
	else {
		url += this.auctionString;
	}

	// Get the vulnerability if it exists
	if ( this.vulnerability ) url += '&v=' + this.vulnerability;

	// Get the dealer
	if ( this.dealer ) url += '&d=' + this.dealer;

	// Get the board
	if ( this.board ) url += '&b=' + this.board;

	// Get the played cards upto current position
	if ( this.currentPositionIndex > 0 ) {
		url += '&p=';
		for( var i = 1; i <= this.currentPositionIndex; ++i ) {
			url += this.positions[ i ].getCardString();
		}
	}

	return url;
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
	var html = '<div class="container"><h1>Errors Found as noted below</h1>';
	html += '<ol class="list-group"><li class="list-group-item list-group-item-warning"><span class="item">';
	html += this.errors.join( '</span></li><li class="list-group-item list-group-item-warning"><span class="item">' );
	html += '</span></li></ol>'
	html += instructions;
	html += '</div>';
	$( container ).empty().append( html );
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
				if ( currentSuit === '' ) {
					this.addError( prefix + currentChar + ' was found when a suit was expected!' );
					continue
				}
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
				if ( currentSuit === '' ) {
					this.addError( prefix + currentChar + ' was found when a suit was expected!' );
					continue
				}
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

function getParameterValue( queryParameters, parameterName ) {
	if ( queryParameters[ parameterName ] !== undefined ) {
		return queryParameters[ parameterName ];
	}
	else if ( queryParameters[ parameterName.toUpperCase() ] !== undefined ) {
		return queryParameters[ parameterName.toUpperCase() ];
	}
	return null;
}

/**
 * Parse query parameters for player names
 *
 * @this {Deal}
 * @param {array} queryParameters an associative array of parsed query parameters
 * @return void
 */
Deal.prototype.loadNames = function( queryParameters ) {
	for( var direction in Directions ) {
		var parameterName = direction + 'n';
		var name = getParameterValue( queryParameters, parameterName );
		if ( name ) this.hands[ direction ].name = name;
	}
};

function areOppositeDirections( direction1, direction2 ) {
	return ( (direction1 === 'n' || direction1 === 's') && (direction2 === 'e' || direction2 === 'w') )	||
	( (direction1 === 'e' || direction1 === 'w') && (direction2 === 'n' || direction2 === 's') );
};

/**
 * Parse query parameters to load auction
 *
 * @this {Deal}
 * @param {array} queryParameters an associative array of parsed query parameters
 * @return void
 */
Deal.prototype.loadAuction = function( queryParameters ) {

	var parameterName = 'a';
	var contractString = getParameterValue( queryParameters, parameterName );
	if ( contractString === null ) {
		this.addError( 'No auction or contract or trumps and leader has been specified!' );
		return;
	}
	var originalString = contractString;
	contractString = contractString.toLowerCase();
	if ( contractString.charAt(0) !== '-' ) {
		// Parse the auction stopping on errors
		var numPasses = -1;
		var currentLevel = 0;
		var currentSuit = '';
		var firstCalledBy = {};
		var bids = {};
		for( var suit in Suits ) {
			firstCalledBy[ suit ] = '';
			bids[ suit ] = [];
		}
		var lastCall = '';
		var lastCallBy = '';
		var currentDirection = 'n';
		if ( this.dealer !== undefined ) currentDirection = this.dealer;
		var bid = null;
		for( var i = 0;i < contractString.length; ++i ) {

			var prefix = 'In auction specified at position ' + (i+1) + ' - ';
			if ( numPasses >= 3 ) {
				this.addError( prefix + '3 passes already but more characters in auction!' );
				return;
			}
			var currentChar = contractString.charAt( i );
			if ( currentChar === '{' ) {
				var endBraces = contractString.indexOf( '}', i+1 );
				if ( endBraces === -1 ) {
					this.addError( prefix + ' No closing } found!' );
					return;
				}
				if ( bid !== null ) bid.annotation = originalString.slice( i+1, endBraces );
				i = endBraces;
				continue;
			}
			else if ( currentChar === 'd' || currentChar === 'x' ) {
				if ( lastCall === '' || lastCall === 'd' || lastCall === 'r' || ! areOppositeDirections( lastCallBy, currentDirection ) ) {
					this.addError( prefix + 'Double is not allowed at this position!' );
					return;
				}
				bid = new Bid( currentDirection, currentLevel, 'x', null );
				this.auction.push(bid);
				lastCall = 'd';
				lastCallBy = currentDirection;
				numPasses = 0;
			}
			else if ( currentChar === 'r' ) {
				if ( lastCall !== 'd' && ! areOppositeDirections( lastCallBy, currentDirection ) ) {
					this.addError( 'Redouble not allowed at this position!' );
					return;
				}
				bid = new Bid( currentDirection, currentLevel, 'r', null );
				this.auction.push(bid);
				lastCall = 'r';
				lastCallBy = currentDirection;
				numPasses = 0;
			}
			else if ( currentChar === 'p' ) {
				numPasses++;
				bid = new Bid( currentDirection, currentLevel, 'p', null );
				this.auction.push(bid);
			}
			else {
				// First should be number
				var level = parseInt( currentChar );
				if ( isNaN( level ) || level < 1 || level > 7 ) {
					this.addError( prefix + currentChar + ' is an Invalid level!');
					return;
				}
				i++;
				var suit = contractString.charAt( i );
				if ( ! ( suit in Suits ) ) {
					this.addError( prefix + suit + ' is an Invalid Suit!');
					return;
				}
				if ( level < currentLevel || ( level === currentLevel && getSuitIndex( suit ) < getSuitIndex( currentSuit ) ) ) {
					this.addError( prefix + level + suit + ' bid is at lower level than last bid!' );
					return;
				}
				bid = new Bid( currentDirection, level, suit, null );
				bids[ suit ].push( currentDirection );
				this.auction.push(bid);
				lastCall = 'b';
				lastCallBy = currentDirection;
				numPasses = 0;
				currentLevel = level;
				currentSuit = suit;
				if ( firstCalledBy[ suit ] === '' ) firstCalledBy[ suit ] = currentDirection;
			}
			currentDirection = getNextToPlay( currentDirection );
		}
		if ( numPasses !== 3 ) {
			this.addError( prefix + ' auction has not ended with 3 passes!' );
			return;
		}
		this.trumpSuit = currentSuit;
		var declarer = '';
		// Deteremine the declarer
		for( var i = 0; i < bids[ currentSuit ].length; ++i ) {
			if ( ! areOppositeDirections( lastCallBy, bids[ currentSuit ][ i ] ) ) {
				declarer = bids[ currentSuit ][ i ];
				break;
			}
		}

		//var declarer = firstCalledBy[ currentSuit ];
		// Determine the contract
		this.dealInformation[ 'Contract' ] = currentLevel + getSuitName( this.trumpSuit );
		if ( lastCall === 'd' ) this.dealInformation[ 'Contract' ] += 'X';
		else if ( lastCall === 'r' ) this.dealInformation[ 'Contract' ] += 'XX';
		this.dealInformation[ 'Declarer' ] = getDirectionName( declarer );
		this.declarer = declarer;
		this.leader = getLeader( declarer );
	}
	else {
		this.auctionString = contractString;
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
			this.declarer = '';
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
			this.declarer = contractString.charAt(3);

			if ( !( this.declarer in Directions ) ) {
				this.addError( this.declarer + ' is not a valid declarer position' );
			}

			// Who is on lead
			this.leader = getLeader( this.declarer );

			// Determine the contract
			this.dealInformation[ 'Contract' ] = contractLevel + ' ' + getSuitName( this.trumpSuit );
			this.dealInformation[ 'Declarer' ] = getDirectionName( this.declarer );
		}
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
	this.board = getParameterValue( queryParameters, 'b' );
	if ( this.board ) {
		this.dealInformation[ 'Board' ] = this.board;
	}

	// Load dealer
	this.dealer = getParameterValue( queryParameters, 'd' );
	if ( this.dealer ) {
		this.dealer = this.dealer.toLowerCase();
		this.dealInformation[ 'Dealer' ] = getDirectionName( this.dealer );
	}

	// Load vulnerability
	this.vulnerability = getParameterValue( queryParameters, 'v' );
	if ( this.vulnerability ) {
		this.dealInformation[ 'Vulnerability' ] = getVulnerability( this.vulnerability.toLowerCase() );
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

	var instructions = $( '#instructions' ).html();

	// empty the container
	$( container ).empty();

	this.showTable();

	// Show information about deal
	this.showDealInformation();


	// Show the footer
	this.showFooterBar();

	// Show information about deal
	this.showPositionInformation();

	// Show the auction
	this.showAuction();

	// Bootstrap tooltip
	$( '.bid-annotation' ).tooltip();


	// Show the hands
	this.showHands();

	// The textbox in the bottom right to show text annotations, status etc.
	this.showStatusInformation();

	// Show 0th position
	this.positions[ 0 ].playCard( false );
	this.currentPositionIndex = 0;
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
		'rewind' : 		{ name: 'Rewind',				icon: 'step-backward', iconAfter: false, },
		'undo-trick' :	{ name: 'Undo Previous Trick',	icon: 'backward', iconAfter: false, },
		'undo-play' :	{ name: 'Undo Previous Play',	icon: 'chevron-left', iconAfter: false, },
		'redo-play' :	{ name: 'Redo Next Play',		icon: 'chevron-right', iconAfter: true, },
		'redo-trick' :	{ name: 'Redo Next Trick',		icon: 'forward', iconAfter: true, },
		'fast-forward' :{ name: 'Fast Forward',			icon: 'step-forward', iconAfter: true, },
	};
	var sizeClass = 'btn-group-lg';
	var html = '';
	html += '<div id="'+ footerID + '" class="fixed btn-group ' + sizeClass + '">';
	for( var field in fields ) {
		html += '<button type="button" id="' + field + '" class="btn btn-primary">';
		var iconHtml = '<span class="glyphicon glyphicon-'+ fields[ field ].icon + '"></span>';
		if ( ! fields[ field ].iconAfter ){
			html += iconHtml + ' ';
		}
		html += fields[ field ].name;
		if ( fields[ field ].iconAfter ){
			html += ' ' + iconHtml;
		}
		html += '</button>';
	}
	html += '</div>';
	$( container ).append( html );
	var footer = $( '#' + footerID );
	if ( footer.width() >= Parameters.viewport.width ) {
		footer.removeClass( 'btn-group-lg' );
	}
	if ( footer.width() >= Parameters.viewport.width ) {
		footer.addClass( 'btn-group-sm' );
	}
	if ( footer.width() >= Parameters.viewport.width ) {
		footer.removeClass( 'btn-group-sm' ).addClass( 'btn-group-xs' );
	}
	//alert(Parameters.viewport.width + ' ' + footer.width());
	var left = Parameters.viewport.centerX - footer.width() / 2;
	footer.css({
		left: left,
		bottom:0,
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
 * Show Play annotation and other messages.
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.showStatusInformation = function() {
	var id = 'status-information';
	var html = '<div id="' + id + '" class="fixed panel panel-info">';
	html += '<div id="status-header" class="panel-heading"><span class="panel-title1">Play Annotations and Other Information</span></div>';
	html += '<div id="status" class="fixed status panel-body">test</div>';
	html += '</div>';
	var container = 'body';
	$( container ).append( html );
	var table = $( '#' + id );
	var width = Parameters.viewport.width - (this.hands[ 's' ].left + this.hands[ 's' ].width) - 10;
	var height = Parameters.viewport.height - $( '#footer' ).height() + 5 - (this.hands[ 'e' ].top + this.hands[ 'e' ].height) - 15;
	table.css({
		bottom: $( '#footer' ).height() - 15,
		right: 5,
		width: width,
		height: height,
	});
	var status = $( '#status' );
	var height = $( '#footer' ).position().top - status.position().top - 5;
	status.css({
		height: height,
		width: width,
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
	var html = '<table id="' + tableID + '" class="fixed table table-bordered table-condensed">';
	html += '<thead><tr class="' + BootstrapParameters.tableHeaderClass + '"><th class="text-center" colspan=2>Play Information</th></tr></thead><tbody>';
	html += getTableBody( fields );
	html += '<tr><td><button id="hand-viewer">HandViewer URL</button><td></td></tr>';
	html += '<tbody></table>';
	var container = 'body';
	$( container ).append( html );
	var table = $( '#' + tableID );
	table.css({
		width: 'auto',
		bottom: $( '#footer' ).height() + 5,
		left: 5,
	});
	var self = this;
	$( '#hand-viewer' ).click( function() {
		var url = self.createHandViewerURL();
		alert( url );
		$('#status').append(url);
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
	var html = '<table id="' + tableID + '" class="fixed table table-bordered table-condensed">'
	html += '<thead><tr class="' + BootstrapParameters.tableHeaderClass + '"><th class="text-center" colspan=2>Deal Information</th></tr></thead><tbody>';
	html += getTableBody( this.dealInformation );
	html += '</tbody></table>';
	var container = 'body';
	$( container ).append( html );
	var table = $( '#' + tableID );
	table.css({
		width: 'auto',
		top: 5,
		left: 5,
	});
};

Deal.prototype.showAuction = function() {
	if ( this.auction.length > 0 ) {
		var tableID = 'auction';
		var html = '<table id="' + tableID + '" class="fixed table table-bordered table-condensed">'
		html += '<thead><tr class="' + BootstrapParameters.tableHeaderClass + '"><th class="text-center" colspan=4>Auction</th></tr></thead>';
		html += '<tbody>';
		html += '<tr class="' + BootstrapParameters.tableHeaderClass + '"><th class="text-center">West</th><th class="text-center">North</th><th class="text-center">East</th><th class="text-center">South</th></tr>';
		var firstBid = this.auction[ 0 ];
		var currentDirection = 'w';
		html += '<tr class="text-center ' + BootstrapParameters.tableRowValueClass + '">';
		var count = 0;
		while ( firstBid.direction !== currentDirection ) {
			html += '<td>-</td>';
			count++;
			if ( currentDirection === 's' ) html += '</tr>';
			currentDirection = getNextToPlay( currentDirection );
		}
		for ( var i = 0; i < this.auction.length; ++i ) {
			var bid = this.auction[ i ];
			if ( bid.direction !== currentDirection ) {
				alert( 'Something went wrong in setting up auction!' );
				return;
			}
			if ( bid.direction === 'w' ) html += '<tr class="text-center ' + BootstrapParameters.tableRowValueClass + '">';
			html += '<td>' + bid.toString() + '</td>';
			if ( currentDirection === 's' ) html += '</tr>';
			currentDirection = getNextToPlay( currentDirection );
		}
		// Fill up with tds for rest
		while( currentDirection !== 'w' ) {
			html += '<td></td>';
			if ( currentDirection === 's' ) html += '</tr>';
			currentDirection = getNextToPlay( currentDirection );
		}
		html += '</tbody></table>';
		var container = 'body';
		$( container ).append( html );
		var table = $( '#' + tableID );
		table.css({
			width:'auto',
			top: 5,
			right: 5,
		});
	}
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
	var vul = this.vulnerability;
	if ( vul !== null ) {
		if ( vul === 'b' || vul === 'n' ) {
			table.addClass( 'ns-vul' );
		}
		if ( vul === 'b' || vul === 'e' ) {
			table.addClass( 'ew-vul' );
		}
	}

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
	//trace( 'Drawing compass with src ' + imageName + ' with dimensions ' + JSON.stringify( compassDimensions ) );
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
		this.hands[ direction ].show( this.declarer );
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
		try  {
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
		catch(err) {
			// Unexpected Error
			var instructions = $( '#instructions' ).html();
			var container = 'body';
			$( container ).empty().append( '<h1>Following Unexpected error occurred. Please send a report to <span class="codedirection">moc.oohay@17marirsn</span></h1>' );
			var html = '<ol class="rounded-list"><li><span class="item">';
			html += err;
			html += '</span></li></ol>'
			$( container ).append( html );
			$( container ).append( instructions );
		}
	}
	else {
		// Will show default instructions page. Nothing to do.
	}
});
