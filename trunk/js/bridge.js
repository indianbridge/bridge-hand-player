$ = jQuery;
var Parameters = {}
Parameters.viewport = {
	width: jQuery(window).width(),
	height: jQuery(window).height(),
};
Parameters.imageFolder = 'images/cards';
Parameters.cardBack = Parameters.imageFolder + '/b1fv.png';
Parameters.viewport.centerX = Parameters.viewport.width/2;
Parameters.viewport.centerY = Parameters.viewport.height/2;
Parameters.scalingFactor = 1;
Parameters.imageDimensions = {
	actualWidth: 76,
	actualHeight: 92,
	//actualWidth: 500,
	//actualHeight: 726,
	percentageWidthShowing: 0.25,
	percentageHeightShowing: 0.5,
};
Parameters.tableDimensions = {
	actualWidth: Parameters.imageDimensions.actualWidth * 5 + 20,
	actualHeight: Parameters.imageDimensions.actualHeight * 3 + 20,	
};

function computeScaledDimensions( ) {
	Parameters.imageDimensions.width = Parameters.imageDimensions.actualWidth * Parameters.scalingFactor;
	Parameters.imageDimensions.height = Parameters.imageDimensions.actualHeight * Parameters.scalingFactor;
	Parameters.imageDimensions.widthShowing = Parameters.imageDimensions.width * Parameters.imageDimensions.percentageWidthShowing;
	Parameters.imageDimensions.heightShowing = Parameters.imageDimensions.height * Parameters.imageDimensions.percentageHeightShowing;
	Parameters.tableDimensions.width = Parameters.tableDimensions.actualWidth * Parameters.scalingFactor;
	Parameters.tableDimensions.height = Parameters.tableDimensions.actualHeight * Parameters.scalingFactor;
	Parameters.tableDimensions.top = Parameters.viewport.centerY - Parameters.tableDimensions.height / 2;
	Parameters.tableDimensions.left = Parameters.viewport.centerX - Parameters.tableDimensions.width / 2;	
}

var Directions = { 
	'n' : { name : 'North', id : 'n-hand', layout : 'horizontal', position : 'top' },
	's' : { name : 'South', id : 's-hand', layout : 'horizontal', position : 'bottom' },
	'e' : { name : 'East', id : 'e-hand', layout : 'vertical', position : 'right' },
	'w' : { name : 'West', id : 'w-hand', layout : 'vertical', position : 'left' },
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
	this.belongsTo = ''; 	// Who owns this card
	this.played = false;	// Has this card been played?
};

function Position() {
	this.numCards = 52;	
	this.cards = [];
	this.turn = '';
	this.tableCards = {};
	for( var direction in Directions )
	this.tableCards[ direction ] = ''; 
	for( var i = 0; i < this.numCards; ++i ) {
		this.cards[ i ] = new Card( i );
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
	var dimensions = getViewPortSize();
	drawTable( );
	for( var direction in Directions ) {
		this.drawHand( direction );
	}
	var self = this;
	$( ".card" ).click(function() {
		self.playCard ( this, dimensions );
	});
	$('body').on( 'mouseover', '.played', function() {
		$( this ).attr( 'src', $( this ).attr('imageName') );
	});
	$('body').on( 'mouseout', '.played', function() {
		$( this ).attr( 'src', Parameters.cardBack );
	});	
};

Position.prototype.drawHand = function( direction ) {
	var hand = this.getHand( direction );
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

Position.prototype.playCard = function( card, dimensions ) {
	if ( $(card).hasClass( 'played' ) ) return;
	var id = $(card).attr( 'direction' ) + '-played-card';
	var imageID = 'playedcard-' + $(card).attr( 'suit' ) + $(card).attr( 'rank' );
	var html = '<img width="' + $(card).attr( 'width' ) + '" height="' + $(card).attr( 'height' ) + '" id="' + imageID + '"class="played-card" src="' + $(card).attr( 'src' ) + '"></img>';		
	$('#'+id).empty().append( html );
	$('#'+imageID).css({
		top: $(card).position().top,
		left: $(card).position().left,
	});
	var direction = $( card ).attr( 'direction' );
	var top = Parameters.tableCardPosition[ direction ].top;
	var left = Parameters.tableCardPosition[ direction ].left;
	$( card ).attr( 'src', Parameters.cardBack );
	$( card ).addClass( 'played' );
	$('#'+imageID).animate({top:top,left:left}, 300, function() {});	
}

function drawTable(  ) {
	$('#table').css({
		'background-color':'green',
		position:'fixed',
		width: Parameters.tableDimensions.width,
		height: Parameters.tableDimensions.height,
		top: Parameters.tableDimensions.top,
		left: Parameters.tableDimensions.left,
	});
	$('#table').html('width : '+Parameters.tableDimensions.width+' height : '+Parameters.tableDimensions.height);
}

function addImage( card, id, top, left ) {
	var suit = card.suit;
	var rank = card.rank;
	var imageID = 'card-' + suit + rank;
	var width = Parameters.imageDimensions.width;
	var height = Parameters.imageDimensions.height;
	var imageName = Parameters.imageFolder + '/' + suit + rank + '.png';
	var html = '<img imageName="'+ imageName + '" width="' + width + '" height="' + height + '" suit="' + suit + '" rank="' + rank + '" direction="' + card.belongsTo + '" id="' + imageID + '"class="card" src="' + imageName + '"></img>';
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
	switch ( declarer ) {
		case 'n' :
			return 'e';
			break;
		case 's' : 
			return 'w';
			break;
		case 'e' :
			return 's';
			break;
		case 'w' :
			return 'n';
			break;
		default:
			return '';
			break;
	}
	return '';
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

function Deal() {
	this.positions = [];
	this.errorFound = false;
	this.messages = [];
	var queryParameters = parseQueryParameters();
	if ( queryParameters.length > 0 ) {
		this.positions[ 0 ] = this.loadInitialPosition( queryParameters );
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
			$( '#messages' ).append( '<h1>Valid Deal</h1>' );
			$( '#messages' ).append( '<h2>Contract : ' + this.contract + '</h2>');
			$( '#messages' ).append( '<h2>Trumps : ' + Suits[ this.trumpSuit ].name + '</h2>');
			$( '#messages' ).append( '<h2>Declarer : ' + this.declarer + '</h2>');			
			$( '#messages' ).append( '<h2>On Lead : ' + Directions[ this.leader ].name + '</h2>');
			this.positions[ 0 ].setTurn( this.leader );
			this.positions[ 0 ].drawPosition();
		}
	}
	else {
		var message = 'No hand Specified!!!';
		$( '#messages' ).append( '<h1>' + message + '</h1>' );
		return null;
	} 	
};

jQuery(function($) {
	computeScaledDimensions();
	//alert(JSON.stringify(Parameters));
	var deal = new Deal();
	
});