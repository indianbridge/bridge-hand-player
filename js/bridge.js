var deal;
var Parameters = {}
Parameters.showDebug = false;
Parameters.manualHashChange = false;
Parameters.viewport = {
	width: jQuery(window).width(),
	height: jQuery(window).height(),
};
Parameters.imageFolder = 'images/cards';
Parameters.cardBack = Parameters.imageFolder + '/b1fv.png';
Parameters.viewport.centerX = Parameters.viewport.width/2;
Parameters.viewport.centerY = Parameters.viewport.height/2;
Parameters.scalingFactor = 1.4;
Parameters.imageDimensions = {
	actualWidth: 76,
	actualHeight: 92,
	//actualWidth: 500,
	//actualHeight: 726,
	percentageWidthShowing: 0.25,
	percentageHeightShowing: 0.5,
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
}

var Directions = { 
	'n' : { name : 'North', id : 'n-hand', layout : 'horizontal', position : 'top', index: 0 },
	'e' : { name : 'East', id : 'e-hand', layout : 'vertical', position : 'right', index: 1 },
	's' : { name : 'South', id : 's-hand', layout : 'horizontal', position : 'bottom', index: 2 },
	'w' : { name : 'West', id : 'w-hand', layout : 'vertical', position : 'left', index: 3 },
};
 
Parameters.tableCardPosition = {};
for( var direction in Directions ) {
	Parameters.tableCardPosition[ direction ] = {
		top: 0,
		left: 0,
	};
};

var Suits = { 
	's' : { name : 'Spade', 	index : 0 }, 
	'h' : { name : 'Heart', 	index : 1 }, 
	'd' : { name : 'Diamond',	index : 2 }, 
	'c' : { name : 'Club', 		index : 3 }, 
	'n' : { name : 'No Trump',	index : 4 },
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
		drawHorizontal( direction, hand.suits, id, top, left );	
	}
	else if ( Directions[ direction ].layout === 'vertical' ) {
		drawVertical( direction, hand.suits, id, top, left );	
	}
};

function drawTable(  ) {
	$('#table').css({
		'background-color':'green',
		position:'fixed',
		width: Parameters.tableDimensions.width,
		height: Parameters.tableDimensions.height,
		top: Parameters.tableDimensions.top,
		left: Parameters.tableDimensions.left,
	});
	var html = '<img class="compass" id="compass" src="images/compass.png" width="' + Parameters.compassDimensions.width + '" height="' + Parameters.compassDimensions.height + '"></img>';
	
	$( '#table' ).html(html);
	$( '#compass' ).css( {
		top: Parameters.compassDimensions.top,
		left: Parameters.compassDimensions.left,
	});
}

function addImage( card, id, top, left ) {
	var suit = card.suit;
	var rank = card.rank;
	var status = card.status;
	var imageID = 'card-' + suit + rank;
	var width = Parameters.imageDimensions.width;
	var height = Parameters.imageDimensions.height;
	var imageName = Parameters.imageFolder + '/' + suit + rank + '.png';
	var html = '<img status="' + status + '" imageName="'+ imageName + '" width="' + width + '" height="' + height + '" suit="' + suit + '" rank="' + rank + '" direction="' + card.belongsTo + '" id="' + imageID + '"class="card" src="' + imageName + '"></img>';
	$( '#' + id ).append(html);
	$( '#' + imageID ).animate({top:top,left:left}, 300, function() {});
};

function drawHorizontal( direction, suits, id, top, left ) {
	for ( var suit in suits ) {
		if ( suit !== 'n' ) {
			for ( var i = 0; i < suits[ suit ].ranks.length; ++i ) {			
				addImage(suits[ suit ].ranks[ i ], id, top, left );
				left += Parameters.imageDimensions.widthShowing;
			}
			left += Parameters.imageDimensions.width;
		}
	}	
};


function drawVertical( direction, suits, id, top, left ) {
	var startingLeft = left;
	for ( var suit in suits ) {
		if ( suit !== 'n' ) {
			for ( var i = 0; i < suits[ suit ].ranks.length; ++i ) {
				addImage(suits[ suit ].ranks[ i ], id, top, left );
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
	if ( suit !== '' ) {
		$( '#suit' ).html( Suits[ suit ].name );
	}
	else {
		$( '#suit' ).html( '' );
	}
	
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

Position.prototype.assignRest = function( direction ) {
	for( var i = 0; i < this.numCards; ++i ) {
		if ( this.cards[ i ].belongsTo === '' ) this.cards[ i ].belongsTo = direction;
	}
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


function parseQueryParameters() {
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
	return vars;
};




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
				if ( !( this.trumpSuit in Suits ) ) {
					this.messages.push( this.trumpSuit + ' is not a valid trump suit!' );
				}				
				this.leader = contractString.charAt(2);
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
				if ( !( declarer in Directions ) ) {
					this.messages.push( this.declarer + ' is not a valid declarer position' );
				}	
				else {
					this.declarer = Directions[ declarer ].name;
				}
				if ( this.messages.length > 0 ) return;
						
				this.leader = getLeader( declarer );
				this.contract = this.contractLevel + ' ' + Suits[ this.trumpSuit ].name + ' by ' + this.declarer;
			}
		}
	}	
	else {
		this.messages.push( 'No contract has been specified!' );
	}
};



Deal.prototype.loadInitialPosition = function( queryParameters ) {
	this.unspecifiedHands = [];
	var position = new Position();
	for( var direction in Directions ) {
		if ( queryParameters [ direction ] !== undefined ) {
			this.loadHand( direction, queryParameters [ direction ], position );
		}
		else {
			this.unspecifiedHands.push( direction );
		}
	}
	if ( this.unspecifiedHands.length === 1 ) {
		position.assignRest( this.unspecifiedHands[ 0 ] );
	}	
	return position;
};

Deal.prototype.loadHand = function( direction, handString, position ) {
	var currentSuit = '';
	var currentRank = '';
	for( var i = 0; i < handString.length; ++i ) {
		var currentChar = handString.charAt( i );
		switch( currentChar ) {
			case 'c' :				
			case 'd' :
			case 'h' :
			case 's' :	
				currentSuit = currentChar;
				break;	
			case '1' :
				if ( i < handString.length - 1 && handString.charAt( i+1 ) === '0') {
					currentRank = 't';
					i++;
				}
				else {
					this.messages.push( 'In hand for ' + Directions[ direction ].name + ' at position ' + (i+1) + ' a 1 is present without a subsequent 0. Use 10 or t to reprensent the ten.' );
					continue
				}
			default :
				currentRank = currentChar;
				var cardIndex = getCardIndex( currentSuit, currentRank );
				if ( position.isAssigned( cardIndex ) ) {
					this.messages.push( 'In hand for ' + Directions[ direction ].name + ' at position ' + (i+1) + ' card ' + currentSuit + currentRank + ' has already been assigned to ' + Directions[ position.cardBelongsTo( cardIndex ) ].name );					
				}
				else {
					position.cardBelongsTo( cardIndex, direction );
				}
				break;											
		}	
	}		
}

function getViewPortSize() {
	return {
		width: jQuery(window).width(),
		height: jQuery(window).height(),
	};
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
	$( '#ew-tricks' ).html( this.ewTricks );
	$( '#ns-tricks' ).html( this.nsTricks );
};

Position.prototype.updateTableCards = function() {
	for ( var d in Directions ) {
		$( '#' + d + '-played-card' ).empty();
	}	
	
	for( var d in this.tableCards ) {
		var card = this.tableCards[ d ];
		var id = $(card).attr( 'direction' ) + '-played-card';
		var imageID = 'playedcard-' + $(card).attr( 'suit' ) + $(card).attr( 'rank' );
		var html = '<img width="' + $(card).attr( 'width' ) + '" height="' + $(card).attr( 'height' ) + '" id="' + imageID + '"class="played-card" src="' + $(card).attr( 'imageName' ) + '"></img>';		
		$( '#' + id ).empty().append( html );
		var direction = $( card ).attr( 'direction' );
		$( '#' + imageID ).css({
			top: Parameters.tableCardPosition[ direction ].top,
			left: Parameters.tableCardPosition[ direction ].left,
		});
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

Deal.prototype.setPositionIndex = function( index ) {
	this.currentPositionIndex = index;
	$( '#play-number' ).html( this.currentPositionIndex );
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
};

Deal.prototype.redoCard = function( ) {
	if ( this.currentPositionIndex === this.positions.length-1 ) {
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

	var tableCards = Object.keys(currentPosition.tableCards).length;
	if ( tableCards  === 4 ) currentPosition.tableCards = {};
	currentPosition.tableCards[ direction ] = card;
	tableCards = Object.keys(currentPosition.tableCards).length;

	if ( tableCards === 1 ) {
		for ( var d in Directions ) {
			$( '#' + d + '-played-card' ).empty();
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

	this.animateCard( card );
	currentPosition.setPlayableCards();
};

Deal.prototype.reDraw = function() {
	computeScaledDimensions();
	drawTable();
	var currentPosition = this.positions[ this.currentPositionIndex ];	
	currentPosition.drawPosition();
	
			/*$( '#messages' ).append( '<h1>Valid Deal</h1>' );
			$( '#messages' ).append( '<h2>Contract : ' + this.contract + '</h2>');
			$( '#messages' ).append( '<h2>Trumps : ' + Suits[ this.trumpSuit ].name + '</h2>');
			$( '#messages' ).append( '<h2>Declarer : ' + this.declarer + '</h2>');			
			$( '#messages' ).append( '<h2>On Lead : ' + Directions[ this.leader ].name + '</h2>');*/
				
};

function Deal() {
	this.positions = [];
	this.errorFound = false;
	this.messages = [];
	var queryParameters = parseQueryParameters();
	if ( queryParameters.length > 0 ) {
		this.setPositionIndex( 0 );
		this.positions[ 0 ] = this.loadInitialPosition( queryParameters );
		var currentPosition = this.positions[ 0 ];
		var messages = this.positions[ 0 ].checkValidity();
		this.loadContract( queryParameters );
		if ( messages.length > 0 ) this.messages = this.messages.concat( messages );
		if ( this.messages.length > 0 ) {
			$( '#messages' ).append( '<h1>Errors Found as noted below</h1>' );
			var html = '<ol><li>';
			html += this.messages.join( '</li><li>' );
			html += '</li></ol>'
			$( '#messages' ).append( html );
		}
		else {
			currentPosition.loadHands();
			currentPosition.initializeTrick( this.leader, false );
		}
	}
	else {
		var message = 'No hand Specified!!!';
		$( '#messages' ).append( '<h1>' + message + '</h1>' );
		return null;
	} 	
};



jQuery(function($) {

	
	deal = new Deal();
	deal.reDraw();
	
	if ( Parameters.showDebug ) $( '#debug-information' ).show();
	else $( '#debug-information' ).hide();	
	$('#undo').click(function() {
		deal.undoCard();	
	});
	$('#redo').click(function() {
		deal.redoCard();	
	});	
	$(window).keypress(function(e) {	
		var key = e.which;
		if ( key === 100 ) {
			Parameters.showDebug = ! Parameters.showDebug;
			if ( Parameters.showDebug ) $( '#debug-information' ).show();
			else $( '#debug-information' ).hide();			
		}
	});
	
	$(window).hashchange( function(){
		if ( ! Parameters.manualHashChange ) {
	    	var hash = location.hash.substring(1);
	    	deal.changeToPlay( parseInt( hash ) );
    	}
    	Parameters.manualHashChange = false;
  	});
});
