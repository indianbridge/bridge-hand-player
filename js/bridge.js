
var Directions = { 
	'n' : { name : 'North', id : 'n-hand', layout : 'horizontal' },
	's' : { name : 'South', id : 's-hand', layout : 'horizontal' },
	'e' : { name : 'East', id : 'e-hand', layout : 'vertical' },
	'w' : { name : 'West', id : 'w-hand', layout : 'vertical' },
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

function Card() {
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
		this.cards[ i ] = new Card();
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
			hand.suits[ suit ].ranks.push( getRank( i ) );
			hand.suits[ suit ].length++;
			if ( hand.suits[ suit ].length > hand.longest ) {
				hand.longest = hand.suits[ suit ].length;
			}
		}
	}
	return hand;
};

Position.prototype.drawPosition = function( ) {
	var dimensions = getViewPortSize();
	drawTable( dimensions );
	this.drawNorth( dimensions );
	this.drawSouth( dimensions );
	this.drawEast( dimensions );
	this.drawWest( dimensions );
};

function drawTable( dimensions ) {
	var width = 200;
	var height = 200;
	var top = dimensions.height/2 - height/2;
	var left = dimensions.width/2 - width/2;
	$('#table').css({
		'background-color':'green',
		position:'fixed',
		width:width,
		height:height,
		top:top,
		left:left,
	});
	$('#table').html('width : '+dimensions.width+' height : '+dimensions.height);
}

function drawHorizontal( suits, id, top, left, percentage ) {
	if ( percentage === undefined ) percentage = 1;
	for ( var suit in suits ) {
		if ( suit !== 'n' ) {
			for ( var i = 0; i < suits[ suit ].ranks.length; ++i ) {
				var rank = suits[ suit ].ranks[ i ];
				var imageID = 'card-' + suit + rank;
				html = '<img id="' + imageID + '"class="card" src="images/cards/' + suit + rank + '.png"></img>';
				$( '#' + id ).append(html);
				$('#'+imageID).animate({top:top,left:left}, 300, function() {});
				left += 20*percentage;
			}
			left += 72*percentage;
		}
	}	
};

function calculateHeightHorizontal( percentage ) {
	return 96 * percentage;
};

function calculateWidthHorizontal( suits, percentage ) {
	var firstSuit = true;
	var width = 0;
	for ( var suit in suits ) {
		if ( suit !== 'n' && suits[ suit ].ranks.length > 0) {
			width += ( firstSuit ? 0 : 20*percentage ) + ( suits[ suit ].ranks.length - 1 ) * ( 20*percentage ) + ( 72*percentage );
			firstSuit = false
		}
	}
	return width;	
};

function calculateHeightVertical( percentage ) {
	return 4 * 96 * percentage + 12;
};

function calculateWidthVertical( longest, percentage ) {
	return ( longest - 1 ) * ( 20 * percentage ) + ( 72*percentage );	
};

function drawVertical( suits, id, top, left, percentage ) {
	if ( percentage === undefined ) percentage = 1;
	var startingLeft = left;
	for ( var suit in suits ) {
		if ( suit !== 'n' ) {
			for ( var i = 0; i < suits[ suit ].ranks.length; ++i ) {
				var rank = suits[ suit ].ranks[ i ];
				var imageID = 'card-' + suit + rank;
				html = '<img id="' + imageID + '"class="card" src="images/cards/' + suit + rank + '.png"></img>';
				$( '#' + id ).append(html);
				$('#'+imageID).animate({top:top,left:left}, 300, function() {});
				left += 20*percentage;
			}
			top += 96*percentage + 4;
			left = startingLeft;
		}
	}	
};

Position.prototype.drawNorth = function( dimensions ) {
	var direction = 'n';
	var percentage = 1;
	var hand = this.getHand( direction );
	var id = Directions[ direction ].id;
	$( '#' + id ).empty();
	var width = calculateWidthHorizontal( hand.suits, percentage );
	var top = 10;
	var left = dimensions.width/2 - width/2;
	drawHorizontal( hand.suits, id, top, left );
};

Position.prototype.drawSouth = function( dimensions ) {
	var direction = 's';
	var percentage = 1;
	var hand = this.getHand( direction );
	var id = Directions[ direction ].id;
	$( '#' + id ).empty();
	var width = calculateWidthHorizontal( hand.suits, percentage );
	var height = calculateHeightHorizontal( percentage );
	var top = dimensions.height - height - 10;
	var left = dimensions.width/2 - width/2;
	drawHorizontal( hand.suits, id, top, left );
};

Position.prototype.drawEast = function( dimensions ) {
	var direction = 'e';
	var percentage = 1;
	var hand = this.getHand( direction );
	var id = Directions[ direction ].id;
	$( '#' + id ).empty();
	var width = calculateWidthVertical( hand.longest, percentage );
	var height = calculateHeightVertical( percentage );	
	var top = dimensions.height/2 - height/2;
	var left = dimensions.width - width - 10;
	drawVertical( hand.suits, id, top, left );
};

Position.prototype.drawWest = function( dimensions ) {
	var direction = 'w';
	var percentage = 1;
	var hand = this.getHand( direction );
	var id = Directions[ direction ].id;
	$( '#' + id ).empty();
	var height = calculateHeightVertical( percentage );	
	var top = dimensions.height/2 - height/2;
	var left = 10;
	drawVertical( hand.suits, id, top, left );
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
			//this.positions[ 0 ].getHandHTML( 'n' );
			/*for ( var direction in Directions ) {
				this.positions[ 0 ].getHandHTML( direction );
			}*/
		}
	}
	else {
		var message = 'No hand Specified!!!';
		$( '#messages' ).append( '<h1>' + message + '</h1>' );
		return null;
	} 	
};

jQuery(function($) {
	var deal = new Deal();
});