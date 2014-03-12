function Deal( handString ) {
	this.handString = handString;
	this.newLineCharacter = '\n';
	this.tabLevel = 0;
	this.hands = {
		'north' : {
			'name' 	: 'North',
			'id'	: 'north',
			'cards'	: [ [], [] , [], [] ],			
		},
		'south'	: {
			'name' 	: 'South',
			'id'	: 'south',
			'cards'	: [ [], [] , [], [] ],
		},
		'east'	: {
			'name' 	: 'East',
			'id'	: 'east',
			'cards'	: [ [], [] , [], [] ],
		},
		'west'	: {
			'name' 	: 'West',
			'id'	: 'west',
			'cards'	: [ [], [] , [], [] ],
		}
		
	};
};

Deal.prototype.setHands = function( queryParameters ) {
	this.queryParameters = queryParameters;
	var directions = {
		'n' : 'north',
		's' : 'south',
		'e' : 'east',
		'w' : 'west',
	}
	for(var direction in directions ) {
		if ( vars[ direction ] !== undefined ) {
			deal.setHand( directions[ direction ], vars[ direction ] );
		}
	}
};

Deal.prototype.setHand = function( direction, handString ) {
	handString = handString.toLowerCase();
	this. suitProcessed = {
		'c' : false,
		'd'	: false,
		'h'	: false,
		's'	: false,
	};
	this.currentDirection = direction;
	this.currentSuit = -1;
	var numCards = 0;
	this.hands[ this.currentDirection ].cards = [ [], [] , [], [] ];
	for( var i = 0; i < handString.length; ++i ) {
		var char = handString.charAt( i );
		switch( char ) {
			case 'c' :				
			case 'd' :
			case 'h' :
			case 's' :	
				if ( ! this.checkSuit( char ) ) {
					return;		
				}
				break;	
			case '1' :
				i++;
				if ( handString.charAt( i ) === '0') {
					char = 't';
				}
				else {
					alert( '1 is present without a subsequent 0' );
					return;
				}
			default :
				if ( ! this.checkCard( char ) ) return;
				break;											
		}
	}
		
};

Deal.prototype.checkSuit = function( char ) {
	if ( this.suitProcessed[ char ] ) {
		alert( char + ' already specified' );
		return false;
	}
	this.suitProcessed[ char ] = true;
	this.currentSuit = suitIndex[ char ];
	return true;
}

Deal.prototype.checkCard = function( char ) {
	if ( char in cardIndex ) {
		this.hands[ this.currentDirection ].cards[ this.currentSuit ].push( cardIndex[ char ] );
		return true;
	}
	else {
		alert( 'Invalid card' + char );
		return false;
	}
}

Deal.prototype.write = function( message, tagStatus ) {
	if ( tagStatus === 'closing' ) this.tabLevel--;
	var tabs = ( this.tabLevel >= 0 ? this.tabLevel + 1 : 1 );
	if ( tagStatus === 'opening' ) this.tabLevel++;
	return Array( tabs ).join( '\t' ) + message + this.newLineCharacter;
	
};


Deal.prototype.parseHand = function( handString ) {
	if ( typeof object === 'string'	) {
		this.handString = handString;
	}
};

Deal.prototype.displayHands = function() {
	for( var hand in this.hands ) {
		this.displayHand( hand );
	}	
};

Deal.prototype.displayHand = function( handName ) {
	var hand = this.hands[ handName ];
	var html = this.write( '<div class="cell panel panel-primary">', 'opening' );
	html += this.write( '<div class="panel-heading">', 'opening' );
	html += this.write( '<h3 class="panel-title">' + hand.name + '</h3>' );
	html += this.write( '</div>', 'closing' );
	html += this.write( '<div class="panel-body">', 'opening' );
	html += this.getHandHTML( hand.cards );
	html += this.write( '</div>', 'closing' );
	html += this.write( '</div>', 'closing' );
	$( '#' + hand.id ).empty().append( html );
};

Deal.prototype.getHandHTML = function( cards ) {
	var html = '';
	for( var suitIndex = 0; suitIndex < cards.length; ++suitIndex ) {
		html += this.write( '<div class="input-group1">', 'opening' );
	  	html += this.write( '<code>' + displaySuit[  suitIndex ] + '</code>' );
	  	cards[suitIndex].sort( 
	  		function( a, b ) {
	  			return b-a;
	  		}
	  	);
		for( var cardIndex = 0; cardIndex < cards[ suitIndex ].length; ++cardIndex ) {
			html += '<a class="cards btn btn-primary btn-xs" role="button">' + displayCard[ cards[ suitIndex ][ cardIndex ] ] + '</a>';
		};	  	
		html += this.write( '</div>', 'closing' );	
	}
	return html;
};

var displayCard = [ '', '' , '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A' ];
var displaySuit = [ 
	'<span style="color:#000000;">&spades;</span>',
	'<span style="color:#CB0000;">&hearts;</span>',
	'<span style="color:#CB0000;">&diams;</span>',
	'<span style="color:#000000;">&clubs;</span>',
];

var suitIndex = { 's' : 0, 'h' : 1, 'd' : 2, 'c' : 3 };
var cardIndex = { 'a' : 14, 'k' : 13, 'q' : 12, 'j' : 11, 't' : 10,
					'9' : 9, '8' : 8, '7' : 7, '6' : 6, '5' : 5, '4' : 4, '3' : 3, '2' : 2 };

function parseQueryParameters() {
	var vars = [], hash;
	var q = document.URL.split( '?' )[1];
	if( q !== undefined ){
		q = q.split('&');
		for(var i = 0; i < q.length; i++){
			hash = q[i].split('=');
			vars.push(hash[1]);
			vars[hash[0]] = hash[1];
		}
	}
	return vars;
};

var deal = new Deal();
var vars = parseQueryParameters();
deal.setHands( vars );
deal.displayHands();
