/**
 * The Bridge namespace.
 * @namespace Bridge
 */
var Bridge = {};

Bridge.checkBoolean = function( variable ) {
	if ( $.type( variable ) !== 'boolean' ) {
		throw 'Is not a valid boolean!';
	}	
};

// The suits for cards as well as bidding
Bridge.Suits = {
	'n' : { name : 'NT'},
	's' : { name : '<font color="000000">&spades;</font>' }, 
	'h' : { name : '<font color="CB0000">&hearts;</font>' }, 
	'd' : { name : '<font color="CB0000">&diams;</font>' }, 
	'c' : { name : '<font color="000000">&clubs;</font>' }
};
Bridge.getSuitName = function( suit ) { 
	return Bridge.Suits[ suit ].name; 
};

// Suits for bidding. Add NT
Bridge.CardSuitOrder = [ 's', 'h', 'd', 'c' ];
Bridge.checkCardSuit = function( suit ) {
	if ( Bridge.CardSuitOrder.indexOf( suit ) === -1 ) {
		throw suit + ' is not a valid Card Suit!';
	}
};

Bridge.BidSuitOrder = [ 'n', 's', 'h', 'd', 'c' ];
Bridge.checkBidSuit = function( suit ) {
	if ( Bridge.BidSuitOrder.indexOf( suit ) === -1 ) {
		throw suit + ' is not a valid Bid Suit!';
	}	
};

Bridge.isGreaterBidSuit = function( suit1, suit2 ) {
	return Bridge.BidSuitOrder.indexOf( suit1 ) > Bridge.BidSuitOrder.indexOf( suit2 );	
};

// The bridge ranks
Bridge.Ranks = { 
	'a' : { name : 'A',	index : 0 }, 
	'k' : { name : 'K',	index : 1 }, 
	'q' : { name : 'Q',	index : 2 }, 
	'j' : { name : 'J',	index : 3 }, 
	't' : { name : 'T',	index : 4 }, 
	'9' : { name : '9',	index : 5 }, 
	'8' : { name : '8',	index : 6 }, 
	'7' : { name : '7',	index : 7 }, 
	'6' : { name : '6',	index : 8 }, 
	'5' : { name : '5',	index : 9 }, 
	'4' : { name : '4',	index : 10 }, 
	'3' : { name : '3',	index : 11 }, 
	'2' : { name : '2',	index : 12 }
};

Bridge.getRankName = function( rank ) {
	return Bridge.Ranks[ rank ].name;
};

// The order of ranks
Bridge.RankOrder = [ 'a', 'k', 'q', 'j', 't', '9', '8', '7', '6', '5', '4', '3', '2' ];
Bridge.checkRank = function( rank ) {
	if( ! ( rank in Bridge.Ranks ) ) {
		throw rank + ' is not a valid Rank!';
	}
	return true;
};
Bridge.isGreaterRank = function( rank1, rank2 ) {
	var index1 = Bridge.RankOrder.indexOf( rank1 );
	var index2 = Bridge.RankOrder.indexOf( rank2 );
	return  index1 < index2;
};

// The compass directions
Bridge.Directions = { 
	'n' : { name : 'North', layout : 'horizontal', position : 'top', lho: 'e', rho: 'w' },
	'e' : { name : 'East', layout : 'vertical', position : 'right', lho: 's', rho: 'n' },
	's' : { name : 'South', layout : 'horizontal', position : 'bottom', lho: 'w', rho: 'e' },
	'w' : { name : 'West', layout : 'vertical', position : 'left', lho: 'n', rho: 's' }
};

Bridge.getDirectionName = function( direction ) {
	return Bridge.Directions[ direction ].name;
};

// The order of Directions
Bridge.DirectionOrder = [ 'n', 'e', 's', 'w' ];
Bridge.checkDirection = function( direction ) {
	if ( ! ( direction in Bridge.Directions ) ) {
		throw direction + ' is not a valid direction!';
	}
	return true;
};

Bridge.areOppositeDirections = function( direction1, direction2 ) {
	return ( (direction1 === 'n' || direction1 === 's') && (direction2 === 'e' || direction2 === 'w') )	|| 
	( (direction1 === 'e' || direction1 === 'w') && (direction2 === 'n' || direction2 === 's') );
};

// Check bid level
Bridge.checkLevel = function( level ) {
	if ( isNaN( level ) || level < 1 || level > 7 ) {
		throw level + ' is a not a valid bidding level!';
	}
};

// Check is vulnerability is valid
Bridge.checkVulnerability = function( vul ) {
	if ( ! ( vul in Bridge.Vulnerability ) ) {
		throw vul + ' is not a valid Vulnerability!';
	}
};

// Who is sitting to the left
Bridge.getLHO = function( direction ) {
	Bridge.checkDirection( direction );
	return Bridge.Directions[ direction ].lho;
};

// Who is sitting to the right
Bridge.getRHO = function( direction ) {
	Bridge.checkDirection( direction );
	return Bridge.Directions[ direction ].rho;
};

// vulnerability
Bridge.Vulnerability = {
	'-' : { name : 'None' },
	'n' : { name : 'North-South' },
	'e' : { name : 'East-West' },
	'b' : { name : 'Both' }
};

Bridge.getVulnerabilityName = function( vul ) {
	return Bridge.Vulnerability[ vul ].name;
};

Bridge.getQueryString = function( url ) {
	var questionMarkIndex = url.indexOf( '?' );
	if ( questionMarkIndex === -1 || questionMarkIndex === url.length - 1 ) return null;
	else return url.slice( questionMarkIndex + 1 );
};

// Read the query parameters
Bridge.readQueryParameters = function() {
	var vars, hash;
	// Retrieve the part after the ? in url
	var q = Bridge.getQueryString( document.URL );
	if( q !== undefined && q !== null && q ){
		vars = [];
		// Remove the part after # if it exists
		q = q.split( '#' )[0];
		
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

// Retreive a query parameter
Bridge.getParameterValue = function( queryParameters, parameterName ) {
	if ( queryParameters[ parameterName ] !== undefined ) {
		return queryParameters[ parameterName ];
	}
	else if ( queryParameters[ parameterName.toUpperCase() ] !== undefined ) {
		return queryParameters[ parameterName.toUpperCase() ];
	}	
	return null;
};

// Parse an annotation or explanation
Bridge.parseAnnotation = function( originalString, startBracePosition, endBraceCharacter ) {
	if ( endBraceCharacter === undefined ) endBraceCharacter = '}';
	var endBracePosition = originalString.indexOf( endBraceCharacter, startBracePosition + 1 );
	if ( endBracePosition === -1 ) {
		return null;
	}
	var annotation = originalString.slice( startBracePosition + 1, endBracePosition );
	return {
		annotation: annotation,
		endBracePosition: endBracePosition
	};
};
