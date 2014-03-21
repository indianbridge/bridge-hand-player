var deal;
var Options = {
	showDebug: false,
	showCompass: true,
	compassImage: 'images/compass.png',
	showTraceMessages: true,
};

// Add some rudimentary tracing capability
if(!window.console){ window.console = {log: function(){} }; } 
function trace( message ) {
	if ( Options.showTraceMessages ) {
		console.log( message );	
	}
};

var Parameters = {}
Parameters.showDebug = false;
Parameters.manualHashChange = false;

Parameters.imageFolder = 'images/cards';
Parameters.cardBack = Parameters.imageFolder + '/b1fv.png';
Parameters.scalingFactor = 1;
Parameters.imageDimensions = {
	actualWidth: 76,
	actualHeight: 92,
	//actualWidth: 500,
	//actualHeight: 726,
	percentageWidthShowing: 0.25,
	percentageHeightShowing: 0.5,
};
Parameters.information = {
	actualFontSize: 12,
	actualLineHeight: 1,
};
Parameters.compassDimensions = {
	actualWidth: 85,
	actualHeight: 85,
};
Parameters.tableDimensions = {
	actualWidth: Parameters.imageDimensions.actualWidth * 5 + 20,
	actualHeight: Parameters.imageDimensions.actualHeight * 3 + 20,	
};

function computeScaledDimensions( ) {
	Parameters.viewport = {
		width: jQuery(window).width(),
		height: jQuery(window).height(),
	};	
	Parameters.viewport.centerX = Parameters.viewport.width/2;
	Parameters.viewport.centerY = Parameters.viewport.height/2;	
	var imageHeight = 0.152 * Parameters.viewport.height;
	var imageWidth = 0.084 * Parameters.viewport.width;
	var heightScalingFactor = imageHeight / Parameters.imageDimensions.actualHeight;
	var widthScalingFactor = imageWidth / Parameters.imageDimensions.actualWidth;
	Parameters.scalingFactor = Math.min( heightScalingFactor, widthScalingFactor );
	Parameters.imageDimensions.width = Parameters.imageDimensions.actualWidth * Parameters.scalingFactor;
	Parameters.imageDimensions.height = Parameters.imageDimensions.actualHeight * Parameters.scalingFactor;
	Parameters.imageDimensions.widthShowing = Parameters.imageDimensions.width * Parameters.imageDimensions.percentageWidthShowing;
	Parameters.imageDimensions.heightShowing = Parameters.imageDimensions.height * Parameters.imageDimensions.percentageHeightShowing;
	Parameters.tableDimensions.width = Parameters.tableDimensions.actualWidth * Parameters.scalingFactor;
	Parameters.tableDimensions.height = Parameters.tableDimensions.actualHeight * Parameters.scalingFactor;
	Parameters.tableDimensions.top = Parameters.viewport.centerY - Parameters.tableDimensions.height / 2;
	Parameters.tableDimensions.left = Parameters.viewport.centerX - Parameters.tableDimensions.width / 2;
	Parameters.compassDimensions.width = Parameters.compassDimensions.actualWidth * Parameters.scalingFactor;
	Parameters.compassDimensions.height = Parameters.compassDimensions.actualHeight * Parameters.scalingFactor;	
	Parameters.compassDimensions.top = Parameters.viewport.centerY - Parameters.compassDimensions.width / 2;
	Parameters.compassDimensions.left = Parameters.viewport.centerX - Parameters.compassDimensions.height / 2;
	Parameters.information.fontSize = Parameters.information.actualFontSize * Parameters.scalingFactor;
	Parameters.information.lineHeight = Parameters.information.actualLineHeight * Parameters.scalingFactor;
	var style = '<style>table.table1 {font-size: ' + Parameters.information.fontSize + 'px; line-height: ' + Parameters.information.lineHeight + 'em;}</style>';
	$( style ).appendTo( "head" )	
	
	trace( 'After scaling parameters are : ' + JSON.stringify( Parameters ) );
}

var Directions = { 
	'n' : { name : 'North', id : 'n-hand', layout : 'horizontal', position : 'top', index: 0 },
	'e' : { name : 'East', id : 'e-hand', layout : 'vertical', position : 'right', index: 1 },
	's' : { name : 'South', id : 's-hand', layout : 'horizontal', position : 'bottom', index: 2 },
	'w' : { name : 'West', id : 'w-hand', layout : 'vertical', position : 'left', index: 3 },
};

function getDirectionName( direction ) {
	if ( direction in Directions ) return Directions[ direction ].name;
	return 'Unknown';	
};
 
Parameters.tableCardPosition = {};
for( var direction in Directions ) {
	Parameters.tableCardPosition[ direction ] = {
		top: 0,
		left: 0,
	};
};

var Suits = { 
	's' : { name : '<font color="000000">&spades;</font>', 	index : 0 }, 
	'h' : { name : '<font color="CB0000">&hearts;</font>', 	index : 1 }, 
	'd' : { name : '<font color="CB0000">&diams</font>',	index : 2 }, 
	'c' : { name : '<font color="000000">&clubs;</font>', 		index : 3 }, 
	'n' : { name : 'No Trump',	index : 4 },
};

function getSuitName( suit ) {
	if ( suit in Suits ) return Suits[ suit ].name;
	return 'Unknown';	
};

var Ranks = { 
	'a' : { name : 'Ace', 	index : 0 }, 
	'k' : { name : 'King', 	index : 1 }, 
	'q' : { name : 'Queen',	index : 2 }, 
	'j' : { name : 'Jack', 	index : 3 }, 
	't' : { name : 'Ten', 	index : 4 }, 
	'9' : { name : '9', 	index : 5 }, 
	'8' : { name : '8', 	index : 6 }, 
	'7' : { name : '7', 	index : 7 }, 
	'6' : { name : '6', 	index : 8 }, 
	'5' : { name : '5', 	index : 9 }, 
	'4' : { name : '4', 	index : 10 }, 
	'3' : { name : '3', 	index : 11 }, 
	'2' : { name : '2', 	index : 12 }, 
};

var directionNames = [];
for( var direction in Directions ) directionNames[ Directions[ direction ].index ] = direction;
var suitNames = [];
for( var suit in Suits ) suitNames[ Suits[ suit ].index ] = suit;
var rankNames = [];
for( var rank in Ranks ) rankNames[ Ranks[ rank ].index ] = rank;

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

function getDisplayName( cardIndex ) {
	return getSuit( cardIndex ) + getRank( cardIndex )
}

function getSuit( cardIndex ) {
	return suitNames[ Math.floor( cardIndex / 13 ) ];
};

function getRank ( cardIndex ) {
	return rankNames[ cardIndex % 13 ];
};

function getCardIndex( suit, rank ) {
	return Suits[ suit ].index*13 + Ranks[ rank ].index;
};

function Card( cardIndex ) {
	this.suit = getSuit( cardIndex );
	this.rank = getRank( cardIndex );
	this.belongsTo = '';
	this.status = 'not-played';
};

function Position() {
	this.numCards = 52;	
	this.cards = [];
	this.turn = '';
	this.hands = {};
	this.tableCards = {};
	this.setNSTricks(0);
	this.setEWTricks(0);
	for( var i = 0; i < this.numCards; ++i ) {
		this.cards[ i ] = new Card( i );
	}
};

Position.prototype.setHandDimensions = function( direction ) {
	var hand = this.hands[ direction ];
	if ( Directions [ direction ].layout === 'horizontal' ) {
		hand.height = Parameters.imageDimensions.height;
		hand.width = getHorizontalWidth( hand );
		if ( Directions[ direction ].position === 'top' ) {
			hand.top = Parameters.viewport.centerY - Parameters.tableDimensions.height / 2 - 10 - hand.height;
			Parameters.tableCardPosition[ direction ] = {
				top: Parameters.tableDimensions.top,
				left: Parameters.viewport.centerX - Parameters.imageDimensions.width / 2,
			};			
		}
		else if ( Directions[ direction ].position === 'bottom' ) {
			hand.top = Parameters.viewport.centerY + Parameters.tableDimensions.height / 2 + 10;
			Parameters.tableCardPosition[ direction ] = {
				top: Parameters.tableDimensions.top + Parameters.tableDimensions.height - Parameters.imageDimensions.height,
				left: Parameters.viewport.centerX - Parameters.imageDimensions.width / 2,
			};				
		}
		hand.left = Parameters.viewport.centerX - hand.width / 2;
		
	}
	else if ( Directions [ direction ].layout === 'vertical' ) {
		hand.height = getVerticalHeight( hand );
		hand.width = getVerticalWidth( hand );
		hand.top = Parameters.viewport.centerY - hand.height / 2;
		if ( Directions[ direction ].position === 'left' ) {
			hand.left = Parameters.viewport.centerX - Parameters.tableDimensions.width / 2 - 10 - hand.width;
			Parameters.tableCardPosition[ direction ] = {
				top: Parameters.viewport.centerY - Parameters.imageDimensions.height / 2,
				left: Parameters.tableDimensions.left,
			};			
		}
		else if ( Directions[ direction ].position === 'right' ) {
			hand.left = Parameters.viewport.centerX + Parameters.tableDimensions.width / 2 + 10;
			Parameters.tableCardPosition[ direction ] = {
				top: Parameters.viewport.centerY - Parameters.imageDimensions.height / 2,
				left: Parameters.tableDimensions.left + Parameters.tableDimensions.width - Parameters.imageDimensions.width,
			};				
		}		
	}	
};

Position.prototype.getHand = function( direction ) {
	var hand = {
		longest : 0,
		suits : {},
	};
	for( var suit in Suits ) {
		hand.suits[ suit ] = {
			ranks : [],
			length : 0,
		};
	};
	for( var i = 0; i < this.numCards; ++i ) {
		if ( this.cards[ i ].belongsTo === direction ) {
			var suit = getSuit( i );
			hand.suits[ suit ].ranks.push( this.cards[ i ] );
			hand.suits[ suit ].length++;
			if ( hand.suits[ suit ].length > hand.longest ) {
				hand.longest = hand.suits[ suit ].length;
			}
		}
	}
	return hand;
};

function getHorizontalWidth( hand ) {
	var suits = hand.suits;
	var firstSuit = true;
	var width = 0;
	for ( var suit in suits ) {
		if ( suit !== 'n' && suits[ suit ].ranks.length > 0) {
			var gutter = Parameters.imageDimensions.widthShowing;
			width += ( firstSuit ? 0 : gutter ) + ( suits[ suit ].ranks.length - 1 ) * gutter + ( Parameters.imageDimensions.width );
			firstSuit = false;
		}
	}
	return width;	
};

function getVerticalWidth( hand ) {
	return ( hand.longest - 1 ) * Parameters.imageDimensions.widthShowing + Parameters.imageDimensions.width;
};

function getVerticalHeight( hand ) {
	return 3 * Parameters.imageDimensions.heightShowing + Parameters.imageDimensions.height;
};

Position.prototype.drawPosition = function( ) {
	for( var direction in Directions ) {
		this.setHandDimensions( direction );
		this.drawHand( direction );
	}
	this.updateTableCards();
	this.setPlayableCards();
};

Position.prototype.loadHands = function() {
	for( var direction in Directions ) {
		this.hands[ direction ] = this.getHand( direction );
	}
}

Position.prototype.drawHand = function( direction ) {
	var hand = this.hands[ direction ];
	var id = Directions[ direction ].id;
	$( '#' + id ).empty();
	var width = hand.width;
	var top = hand.top;
	var left = hand.left;
	if ( Directions[ direction ].layout === 'horizontal' ) {
		this.drawHorizontal( hand.suits, top, left );	
	}
	else if ( Directions[ direction ].layout === 'vertical' ) {
		this.drawVertical(  hand.suits, top, left );	
	}
};


/**
 * Add image to window
 *
 * @method addImage
 * @param {object} card the card that is to be added
 * @param {number} top the top coordinate to place the image
 * @param {number} left the left coordinate to place the image
 * @return void
 */
Position.prototype.addImage = function( card, top, left ) {
	var container = 'body';
	var suit = card.suit;
	var rank = card.rank;
	var cardIndex = getCardIndex( suit, rank );
	var status = this.cards[ cardIndex ].status;
	var imageID = 'card-' + suit + rank;
	var imageName = Parameters.imageFolder + '/' + suit + rank + '.png';
	var src = (status === 'played') ? Parameters.cardBack : imageName;
	$( container ).append( '<img id="' + imageID + '" class="fixed card"></img>' );
	var image = $( '#' + imageID );
	image.attr( 'src', src );
	image.attr( 'status', card.status );
	image.attr( 'imageName', imageName );
	image.attr( 'suit', suit );
	image.attr( 'rank', rank );
	image.attr( 'direction', card.belongsTo );
	image.css({
		width: Parameters.imageDimensions.width,
		height: Parameters.imageDimensions.height,
		top: top,
		left: left,
	});
};

/**
 * Draw a hand horiztontally on screen
 *
 * @method drawHorizontal
 * @param {array} suits the cards in each suit for this hand
 * @param {number} top the top coordinate to start placing the hand
 * @param {number} left the left coordinate to start placing the hand
 * @return void
 */
Position.prototype.drawHorizontal = function( suits, top, left ) {
	for ( var suit in suits ) {
		if ( suit !== 'n' ) {
			for ( var i = 0; i < suits[ suit ].ranks.length; ++i ) {			
				this.addImage(suits[ suit ].ranks[ i ], top, left );
				left += Parameters.imageDimensions.widthShowing;
			}
			left += Parameters.imageDimensions.width;
		}
	}	
};

/**
 * Draw a hand vertically on screen
 *
 * @method drawVertical
 * @param {array} suits the cards in each suit for this hand
 * @param {number} top the top coordinate to start placing the hand
 * @param {number} left the left coordinate to start placing the hand
 * @return void
 */
Position.prototype.drawVertical = function( suits, top, left ) {
	var startingLeft = left;
	for ( var suit in suits ) {
		if ( suit !== 'n' ) {
			for ( var i = 0; i < suits[ suit ].ranks.length; ++i ) {
				this.addImage(suits[ suit ].ranks[ i ], top, left );
				left += Parameters.imageDimensions.widthShowing;
			}
			top += Parameters.imageDimensions.heightShowing;
			left = startingLeft;
		}
	}	
};

Position.prototype.setTurn = function( direction ) {
	this.turn = direction;
	$( '#turn' ).html( Directions[ direction ].name );
};

Position.prototype.setNSTricks = function( tricks ) {
	this.nsTricks = tricks;
};

Position.prototype.setEWTricks = function( tricks ) {
	this.ewTricks = tricks;
};

Position.prototype.setCurrentSuit = function( suit ) {
	this.currentSuit = suit;	
};

Position.prototype.setTrickWinner = function( direction ) {
	this.currentTrickWinner = direction;
	if ( direction !== '' ) {
		$( '#trick' ).html( Directions[ direction ].name );
	}
	else {
		$( '#trick' ).html( '' );
	}
};

Position.prototype.setNumCardsPlayed = function( num ) {
	this.numCardsPlayed = num;
	$( '#numcardsplayed' ).html( num );
};

Position.prototype.isAssigned = function ( cardIndex ) {
	return this.cards[ cardIndex ].belongsTo !== '';	
};

Position.prototype.cardBelongsTo = function( cardIndex, direction ) {
	if ( direction === undefined ) {
		return this.cards[ cardIndex ].belongsTo;
	}
	else this.cards[ cardIndex ].belongsTo = direction;
};

Position.prototype.checkValidity = function() {
	var cardCount = [];
	var unassignedCards = [];
	for( var direction in Directions ) {
		cardCount[ direction ] = 0;
	}
	$.each( this.cards, function( index, value ){
	    cardCount[ value.belongsTo ]++;
	    if ( value.belongsTo === '' ) {
			unassignedCards.push( getSuit( index ) + getRank( index ) );
		}
	});		
	var messages = [];
	for( var direction in Directions ) {
		if ( cardCount[ direction ]  !== 13 ) {
			messages.push( Directions[ direction ].name + ' has ' + cardCount[ direction ] + ' cards instead of 13.');
		}
	}
	if ( unassignedCards.length > 0 ) {
		messages.push( 'The following cards are not assigned to anyone : ' + unassignedCards.join() );
	}
	return messages;
};



function getLeader( declarer ) {
	var index = Directions[ declarer ].index;
	index = ( index + 1 ) % 4;
	return directionNames[ index ];
}

Deal.prototype.loadContract = function( queryParameters ) {
	if ( queryParameters['a'] !== undefined ) {
		var contractString = queryParameters['a'];
		if ( contractString.charAt(0) !== '-' ) {
			this.messages.push( 'Full auctions are not supported. Specify a final contract or trump suit by setting the first character of the a parameter to a minus sign (-) and then specifying contract (a=-4se sets the contract to 4 spades by East) or specifying trump and leader (a=-sc will put South on lead with clubs as trump). ' );
		}
		else {
			this.contractLevel = parseInt( contractString.charAt(1) );
			if ( isNaN( this.contractLevel ) ) {
				// trump and leader
				this.trumpSuit = contractString.charAt(1);
				this.dealInformation[ 'Trumps' ].value = getSuitName( this.trumpSuit );
				if ( !( this.trumpSuit in Suits ) ) {
					this.messages.push( this.trumpSuit + ' is not a valid trump suit!' );
				}				
				this.leader = contractString.charAt(2);
				this.dealInformation[ 'On Lead' ].value = getDirectionName( this.leader );
				if ( !( this.leader in Directions ) ) {
					this.messages.push( this.leader + ' is not a valid leader position' );
				}				
				this.contract = 'Unknown';
				this.declarer = 'Unknown';
			}
			else {
				// contract and declarer
				if ( this.contractLevel < 1 || this.contractLevel > 7 ) {
					this.messages.push( this.contractLevel + ' is not a valid contract level!' );
				}
				this.trumpSuit = contractString.charAt(2);
				if ( !( this.trumpSuit in Suits ) ) {
					this.messages.push( this.trumpSuit + ' is not a valid trump suit!' );
				}
				var declarer = contractString.charAt(3);
				this.dealInformation[ 'Declarer' ].value = getDirectionName( declarer );
				if ( !( declarer in Directions ) ) {
					this.messages.push( this.declarer + ' is not a valid declarer position' );
				}	
				if ( this.messages.length > 0 ) return;
						
				this.leader = getLeader( declarer );
				this.dealInformation[ 'On Lead' ].value = getDirectionName( this.leader );
				this.dealInformation[ 'Contract' ].value = this.contractLevel + ' ' + getSuitName( this.trumpSuit );				
				this.dealInformation[ 'Trumps' ].value = getSuitName( this.trumpSuit );
			}
		}
	}	
	else {
		this.messages.push( 'No contract has been specified!' );
	}
	// Load Board Number
	if ( queryParameters['b'] !== undefined ) {
		this.dealInformation[ 'Board' ].value = queryParameters['b'];
	}
	// Load dealer
	if ( queryParameters['d'] !== undefined ) {
		this.dealInformation[ 'Dealer' ].value = getDirectionName( queryParameters['d'] );
	}

	// Load vulnerability
	if ( queryParameters['v'] !== undefined ) {
		this.dealInformation[ 'Vulnerability' ].value = getVulnerability( queryParameters['v'] );
	}		
};





Deal.prototype.animateCard = function( card ) {
	var id = $(card).attr( 'direction' ) + '-played-card';
	var imageID = 'playedcard-' + $(card).attr( 'suit' ) + $(card).attr( 'rank' );
	var html = '<img width="' + $(card).attr( 'width' ) + '" height="' + $(card).attr( 'height' ) + '" id="' + imageID + '"class="played-card" src="' + $(card).attr( 'src' ) + '"></img>';		
	$( '#' + id ).empty().append( html );
	$( '#' + imageID ).css({
		top: $(card).position().top,
		left: $(card).position().left,
	});
	var direction = $( card ).attr( 'direction' );
	var top = Parameters.tableCardPosition[ direction ].top;
	var left = Parameters.tableCardPosition[ direction ].left;
	$( card ).attr( 'src', Parameters.cardBack );
	$( card ).attr( 'status', 'played' );
	$( card ).addClass( 'played' );
	$('#'+imageID).animate({top:top,left:left}, 300, function() {});	
};

Deal.prototype.getNextPosition = function() {
	var currentPosition = this.positions[ this.currentPositionIndex ];	
	this.setPositionIndex( this.currentPositionIndex + 1 );
	Parameters.manualHashChange = true;
	window.location.hash = this.currentPositionIndex
	this.positions[ this.currentPositionIndex ] = $.extend( true, {}, currentPosition );
	return this.positions[ this.currentPositionIndex ];
}

Position.prototype.initializeTrick = function( leader, won ) {
	if ( won === undefined ) won = false;
	this.setTurn( leader );
	if ( won ) {
		if ( leader === 'n' || leader === 's' ) this.setNSTricks( this.nsTricks + 1 );
		else if ( leader === 'e' || leader === 'w' ) this.setEWTricks( this.ewTricks + 1 );
	}
	this.setCurrentSuit( '' );
	this.setTrickWinner( '' );
	this.currentTrumpRank = '';
	//this.tableCards = {};		
};

Position.prototype.setPlayableCards = function() {
	for( var direction in Directions ) {
		var allElements = '[direction='+ direction + ']';
		$( allElements ).unbind( 'click' );
		$( allElements ).removeClass( 'img-highlight' );
	}
	var elements = '[direction='+ this.turn + '][status="not-played"]';
	if ( this.currentSuit !== '' ) {
		var extendedElements = elements + '[suit="' + this.currentSuit + '"]';
		var numInSuit = $( extendedElements ).length;
		if ( numInSuit > 0 ) elements = extendedElements;
	}
	$( elements ).click(function() { deal.playCard ( this ); });
	$( elements ).addClass( 'img-highlight' );
	$( '#on-lead' ).html( getDirectionName( this.turn ) );
	$( '#play-number' ).html( deal.currentPositionIndex );
	$( '#ew-tricks' ).html( this.ewTricks );
	$( '#ns-tricks' ).html( this.nsTricks );
};

Position.prototype.playTableCard = function( card, animate ) {
	if ( typeof animate === undefined ) animate = true;
	var container = 'body';
	var direction = $( card ).attr( 'direction' );
	var suit = card.suit;
	var rank = card.rank;
	var imageID = direction + '-played-card';
	var imageName = $( card ).attr('imageName');
	$( container ).append( '<img id="' + imageID + '" class="fixed played-card"></img>' );
	var image = $( '#' + imageID );
	image.attr( 'src', imageName );
	if ( animate ) {
		var top = $( card ).position().top;
		var left = $( card ).position().left;
	}
	else {
		var top = Parameters.tableCardPosition[ direction ].top;
		var left = Parameters.tableCardPosition[ direction ].left;
	}
	image.css({
		width: Parameters.imageDimensions.width,
		height: Parameters.imageDimensions.height,
		top: top,
		left: left,
	});	
	if ( animate ) {
		var top = Parameters.tableCardPosition[ direction ].top;
		var left = Parameters.tableCardPosition[ direction ].left;
		image.animate({top:top,left:left}, 300, function() {});
	}
	$( card ).attr( 'src', Parameters.cardBack );
	$( card ).attr( 'status', 'played' );
	$( card ).addClass( 'played' );
	
};

Position.prototype.updateTableCards = function() {
	for ( var d in Directions ) {
		$( '#' + d + '-played-card' ).remove();
	}	
	
	for( var d in this.tableCards ) {
		var card = this.tableCards[ d ];
		this.playTableCard( card, false );
	}			
};

Deal.prototype.changeToPlay = function( playNumber ) {
	if ( isNaN( playNumber ) ) {
		alert( playNumber + ' is not a valid play number to return to!' );
		return;
	}
	if ( playNumber > this.positions.length ) {
		alert( 'Cannot advance to play number ' + playNumber + ' since you have made only ' + (this.positions.length) + 'plays!' );
		return;
	}
	else if ( playNumber < 0 ) {
		alert( 'Cannot undo to a negative play number ' + playNumber );
		return;
	}
	if ( playNumber > this.currentPositionIndex ) {
		for( var i = this.currentPositionIndex + 1; i <= playNumber; ++i ) this.redoCard();
	}
	else if ( playNumber < this.currentPositionIndex ) {
		for( var i = this.currentPositionIndex - 1; i >= playNumber; --i ) this.undoCard();
	}
};

Deal.prototype.undoCard = function( ) {
	if ( this.currentPositionIndex === 0 ) {
		alert( 'Nothing to Undo!' );
		return;
	}
	var currentPosition = this.positions[ this.currentPositionIndex ];
	this.setPositionIndex( this.currentPositionIndex - 1);
	var previousPosition = this.positions[ this.currentPositionIndex ];
	var previousCard = currentPosition.tableCards[ previousPosition.turn ];
	$( previousCard ).attr( 'src', $( previousCard ).attr( 'imageName') ).attr( 'status', 'not-played' ).removeClass( 'played' );
	previousPosition.setPlayableCards();
	previousPosition.updateTableCards();
	Parameters.manualHashChange = true;
	window.location.hash = this.currentPositionIndex;
};

Deal.prototype.setUndoButtonsStatus = function() {
	var index = this.currentPositionIndex;
	if ( index < 1 ) {
		$( '#undo' ).prop( 'disabled', true );
	}
	else {
		$( '#undo' ).prop( 'disabled', false );
	}
	if ( index >= this.positions.length - 1 ) {
		$( '#redo' ).prop( 'disabled', true );
	}
	else {
		$( '#redo' ).prop( 'disabled', false );
	}	
}

Deal.prototype.setPositionIndex = function( index ) {
	this.currentPositionIndex = index;
	this.setUndoButtonsStatus();
};

Deal.prototype.redoCard = function( ) {
	if ( this.currentPositionIndex === this.positions.length ) {
		alert( 'Nothing to Redo!' );
		return;
	}
	var currentPosition = this.positions[ this.currentPositionIndex ];
	this.setPositionIndex( this.currentPositionIndex  +  1 );
	var nextPosition = this.positions[ this.currentPositionIndex ];
	var nextCard = nextPosition.tableCards[ currentPosition.turn ];
	$( nextCard ).attr( 'src', Parameters.cardBack ).attr( 'status', 'played' ).addClass( 'played' );
	nextPosition.setPlayableCards();
	nextPosition.updateTableCards();
	Parameters.manualHashChange = true;
	window.location.hash = this.currentPositionIndex;	
};

Deal.prototype.playCard = function( card ) {
	if ( $(card).hasClass( 'played' ) ) return;
	var currentPosition = this.getNextPosition();
	var direction = $( card ).attr( 'direction' );
	var suit = $( card ).attr( 'suit' );
	var rank = $( card ).attr( 'rank' );
	
	var cardIndex = getCardIndex( suit, rank );
	currentPosition.cards[ cardIndex ].status = 'played';

	var tableCards = Object.keys(currentPosition.tableCards).length;
	if ( tableCards  === 4 ) currentPosition.tableCards = {};
	currentPosition.tableCards[ direction ] = card;
	tableCards = Object.keys(currentPosition.tableCards).length;

	if ( tableCards === 1 ) {
		for ( var d in Directions ) {
			$( '#' + d + '-played-card' ).remove();
		}			
	}
	currentPosition.turn = getLeader( currentPosition.turn );	
	if ( currentPosition.currentSuit === '' ) {
		currentPosition.currentSuit = suit;
		if ( suit === this.trumpSuit ) currentPosition.currentTrumpRank = rank;
		currentPosition.setTrickWinner( direction );
		currentPosition.currentRank = rank;
	}
	else {
		if ( currentPosition.currentTrumpRank === '' && suit === currentPosition.currentSuit && Ranks[ rank ].index < Ranks[ currentPosition.currentRank ].index ) {
			currentPosition.setTrickWinner( direction );
			currentPosition.currentRank = rank;
		}
		else if ( suit === this.trumpSuit && ( currentPosition.currentTrumpRank === '' || Ranks[ rank ].index < Ranks[ currentPosition.currentTrumpRank ].index ) ) {
			currentPosition.setTrickWinner( direction );
			currentPosition.currentTrumpRank = rank;
		}			
	}
	if ( tableCards === 4 ) {
		currentPosition.initializeTrick( currentPosition.currentTrickWinner, true );
	}		

	currentPosition.playTableCard( card, true );
	//this.animateCard( card );
	currentPosition.setPlayableCards();
};

/**
 * Show information about the play.
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.drawPositionInformation = function() {
	var tableID = 'position-information';
	var fields = {
		'Play Number' : { value: 0, id : 'play-number', },
		'Trick Number' : { value: 0, id : 'trick-number', },
		'NS Tricks' : { value: 0, id : 'ns-tricks', },
		'EW Tricks' : { value: 0, id : 'ew-tricks', },
	}
	var html = '<table id="' + tableID + '" class="fixed table1">';
	html += '<thead><tr><th colspan=2>Play Information</th></tr></thead>';
	html += getTableBody( fields, true );
	html += '</table>';	
	var container = 'body';
	$( container ).append( html );
	var table = $( '#' + tableID );
	table.css({
		top: 10,
		left: 10,
	});	
	this.setUndoButtonsStatus();
	$('#undo').click(function() {
		deal.undoCard();	
	});
	$('#redo').click(function() {
		deal.redoCard();	
	});
};

function getTableBody( fields, addButtons ) {
	if ( typeof addButtons === undefined ) addButtons = false;
	var html = ''
	html += '<tbody>';
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
	if ( addButtons ) {
		html += '<tr><td><button class="styled-button-13" id="undo">Undo Play</button></td><td><button class="styled-button-13" id="redo">Redo Play</button></td></tr>';
	}
	html += '</tbody>';
	return html;
};

/**
 * Show information about the deal.
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.drawDealInformation = function() {
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
Deal.prototype.drawTable = function() {
	var container = 'body';
	var tableID = 'table';
	
	// Create a rectangular table in center with green background
	$( container ).append( '<div id="' + tableID + '" class="fixed table"></div>' );
	var tableDimensions = {
		width: Parameters.tableDimensions.width,
		height: Parameters.tableDimensions.height,
		top: Parameters.tableDimensions.top,
		left: Parameters.tableDimensions.left,
	};
	trace( 'Drawing Table with dimensions ' + JSON.stringify( tableDimensions ) );
	var table = $( '#' + tableID );
	table.css( tableDimensions );
	
	// Show compass if requested
	if ( Options.showCompass ) {
		// Show the compass in middle of screen
		var compassID = 'compass';
		$( container ).append( '<img id="' + compassID + '" class="fixed compass"></img>' );
		var compass = $( '#' + compassID );
		compass.attr( 'src' , Options.compassImage );
		var compassDimensions = {
			width: Parameters.compassDimensions.width,
			height: Parameters.compassDimensions.height,
			top: Parameters.compassDimensions.top,
			left: Parameters.compassDimensions.left,
		};
		trace( 'Drawing compass with src ' + Options.compassImage + ' with dimensions ' + JSON.stringify( compassDimensions ) );		
		compass.css( compassDimensions );	
	}
};

/**
 * Redraw all elements on the screen
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.reDraw = function() {
	var container = 'body';
	
	// Empty the screen first
	$( container ).empty();
	
	// Recompute size of everything
	computeScaledDimensions();
	
	// Draw the table
	this.drawTable();
	
	// Show deal information
	this.drawDealInformation();
	
	// Show play information
	this.drawPositionInformation();

	// Draw the hands based on current position
	var currentPosition = this.positions[ this.currentPositionIndex ];	
	currentPosition.drawPosition();				
};

/**
 * Were any errors found when parsing deal?
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.hasErrors = function() {
	return this.messages.length > 0;	
};

/**
 * Display all errors found when parsing Deal.
 *
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.showErrors = function() {
	if ( this.showInstructions ) return;
	var container = 'body';
	$( container ).empty().append( '<h1>Errors Found as noted below</h1>' );
	var html = '<ol class="rounded-list"><li><span class="item">';
	html += this.messages.join( '</span></li><li><span class="item">' );
	html += '</span></li></ol>'
	$( container ).append( html );	
};

/**
 * Assign rest of cards to last unspecified hand
 *
 * @this {Position}
 * @param {string} direction the hand that has not be assigned yet
 * @return void
 */
Position.prototype.assignRest = function( direction ) {
	for( var i = 0; i < this.numCards; ++i ) {
		if ( this.cards[ i ].belongsTo === '' ) this.cards[ i ].belongsTo = direction;
	}
};

/**
 * Parse one hand specified in query parameters
 *
 * @this {Position}
 * @param {string} direction the hand (sitting in the specified direction) to load
 * @param {string} handString the hand specified in the query parameters for this direction
 * @return void
 */
Position.prototype.loadHand = function( direction, handString) {
	var position = this;
	var currentSuit = '';
	var currentRank = '';
	for( var i = 0; i < handString.length; ++i ) {
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
					this.messages.push( 'In hand for ' + Directions[ direction ].name + ' at position ' + (i+1) + ' a 1 is present without a subsequent 0. Use 10 or t to reprensent the ten.' );
					continue;
				}
			
			// All other characters
			default :
				currentRank = currentChar;
				if ( currentRank in Ranks ) {
					// Valid rank
					var cardIndex = getCardIndex( currentSuit, currentRank );
					if ( position.isAssigned( cardIndex ) ) {
						this.messages.push( 'In hand for ' + Directions[ direction ].name + ' at position ' + (i+1) + ' card ' + currentSuit + currentRank + ' has already been assigned to ' + Directions[ position.cardBelongsTo( cardIndex ) ].name );					
					}
					else {
						position.cardBelongsTo( cardIndex, direction );
					}
				}
				else {
					// Unknown character
					this.messages.push( 'In hand for ' + Directions[ direction ].name + ' at position ' + (i+1) + ' character ' + currentRank + ' is not recognized as a card suit or rank!' );
					continue;					
				}
				break;											
		}	
	}		
};

/**
 * Based on query parameters load the hands with cards specified
 *
 * @method loadInitialPosition
 * @this {Deal}
 * @param {array} queryParameters an associative array of parsed query parameters 
 * @return {object} position with hands loaded as specified
 */
Deal.prototype.loadInitialPosition = function( queryParameters ) {
	this.unspecifiedHands = [];
	
	// Initialize an empty position
	var position = new Position();
	
	// Look for hands specified for each direction
	for( var direction in Directions ) {
		if ( queryParameters [ direction ] !== undefined ) {
			// If specified load hand for direction
			position.loadHand( direction, queryParameters [ direction ] );
		}
		else {
			// Hand not specified
			this.unspecifiedHands.push( direction );
		}
	}
	
	// If 3 hands specified then load fourth hand automatically
	if ( this.unspecifiedHands.length === 1 ) {
		position.assignRest( this.unspecifiedHands[ 0 ] );
	}	
	return position;
};

/**
 * Parse the query parameters and return as an associative array.
 *
 * @method parseQueryParameters
 * @this {Deal}
 * @param void
 * @return void
 */
Deal.prototype.parseQueryParameters = function() {
	var vars = [], hash;
	// Retrieve the part after the ? in url
	var q = document.URL.split( '?' )[1];
	// Remove the part after # if it exists
	q = q.split( '#' )[0];
	if( q !== undefined ){
		trace( 'Query Parameters are : ' +  q );
		
		// convert to lower case
		q = q.toLowerCase();
		
		// Get all the different components
		q = q.split('&');
		for(var i = 0; i < q.length; i++){
			hash = q[i].split('=');
			vars.push(hash[1]);
			vars[hash[0]] = hash[1];
		}
	}
	return vars;
};

/**
 * Creates an instance of a Bridge Deal
 *
 * @constructor
 * @this {Deal}
 * @param void
 */
function Deal() {
	this.showInstructions = false;
	this.positions = [];
	this.dealInformation = {
		'Board' : { value: 0 },
		'Dealer': { value: 'Unknown' },
		'Vulnerability' : { value: 'Unknown' },
		'Contract' : { value: 'Unknown' },
		'Declarer' : { value: 'Unknown' },
		'Trumps' : { value: 'Unknown' },
		'On Lead' : { value: 'Unknown', id: 'on-lead', },
	};
	
	// Any error messages
	this.messages = [];
	
	// Get the query parameters
	var queryParameters = this.parseQueryParameters();
	if ( queryParameters.length > 0 ) {
		// Parse the query parameters to determine initial Position
		var currentPosition = this.loadInitialPosition( queryParameters );
		
		// Check if position is valid
		var messages = currentPosition.checkValidity();
		if ( messages.length > 0 ) this.messages = this.messages.concat( messages );
		
		// Load the contract 
		this.loadContract( queryParameters );
		
		if ( this.messages.length === 0 ) {
			// No errors
			
			// Set initital position
			this.setPositionIndex( 0 );
			this.positions[ 0 ] = currentPosition;
			
			// Load the hands into intial position
			currentPosition.loadHands();
			
			// Initialize the first (empty) trick and set the turn of the leader
			currentPosition.initializeTrick( this.leader, false );
		}
	}
	else {
		// No query parameters
		var message = 'No hand Specified!!!';
		this.messages.push(message);
		this.showInstructions = true;
		return;
	} 	
};



jQuery(function($) {
	// Create a new deal by parsing query parameters
	deal = new Deal();
	
	if ( deal.hasErrors() ) {
		// Errors - Show the errors
		deal.showErrors();
	}
	else {
		// No errors - draw everything
		deal.reDraw();
		
		// Setup handler to detect window resize and redraw everything
		$(window).resize(function() {
			deal.reDraw();
		});		
		

		
		$(window).hashchange( function(){
			if ( ! Parameters.manualHashChange ) {
		    	var hash = location.hash.substring(1);
		    	var playNumber = hash ? parseInt( hash ) : 0;
		    	deal.changeToPlay( parseInt( playNumber ) );
	    	}
	    	Parameters.manualHashChange = false;
	  	});
  	}
});
