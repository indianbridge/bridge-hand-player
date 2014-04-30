/**
 * Creates an instance of a Bridge Sequence of plays
 */
Bridge.Play = function( playName, hands ) {
	this.name = playName;
	this.hands = hands;
	this.currentPlayNumber = 0;
	this.playedCards = [];
};

Bridge.Play.prototype.toString = function() {
	var outputString = '';
	outputString += '<h4>Play : ' + this.name + '</h4>';
	var playLen = this.playedCards.length;
	for( var i = 0;i < playLen; ++i ) {
		outputString += this.playedCards[ i ].toString();
	}
	return outputString;	
};

Bridge.Play.prototype.parsePlayString( playString ) {
	var play = playString.toLowerCase();
	for( var i = 0;i < play.length; ++i ) {
		var annotation = null;
		var suit = play.charAt( i );
		Bridge.checkCardSuit( suit );
		i++;
		var prefix = 'In play ' + playName +' at position ' + (i+1) + ' - ';	
		if ( i >= play.length ) {
			throw prefix + ' No rank has been specified for suit ' + suit;
		}
		var rank = play.charAt( i );
		Bridge.checkRank( rank );
		if (  play.charAt( i + 1 ) === '{' ) {
			var value = Bridge.parseAnnotation( playString, i + 1 );
			if ( ! value ) {
				throw prefix + ' No closing } found!';	
			}	
			annotation = value.annotation;
			i = value.endBracePosition;		
		}	
		this.playCard( suit, rank, null, annotation );	
	}	
};

/**
 * Creates an instance of a Bridge Deal.
 */
Bridge.Deal = function() {
	// The hands
	this.hands = new Bridge.Hands();
	
	// the auctions
	this.auctions = {};
	
	// the plays
	this.plays = {};
	
	// Deal information
	this.board = 1;
	this.dealer = 'n';
	this.vulnerability = '-';
	this.trumpSuit = null;
	this.leader = null;
	this.contract = null;
	this.notes = null;	
};

Bridge.Deal.prototype.toString = function() {
	var outputString = '';
	outputString += '<h3>Deal Information</h3>';
	outputString += 'Board : ' + this.board + '<br/>';
	outputString += 'Dealer : ' + Bridge.getDirectionName( this.dealer ) + '<br/>';
	outputString += 'Vulnerability : ' + Bridge.getVulnerabilityName( this.vulnerability ) + '<br/>';
	outputString += 'Notes : ' + this.notes + '<br/>';
	outputString += '<h3>Hands</h3>';
	outputString += this.hands.toString();
	outputString += '<h3>Auctions</h3>';
	for( var auctionName in this.auctions ) {
		outputString += '<h4>' + auctionName + '</h4>';
		outputString += this.auctions[ auctionName ].toString();	
	};
	return outputString;
};

Bridge.Deal.prototype.parseQueryParameters = function() {
	var queryParameters = Bridge.readQueryParameters();	
	this.loadDealInformation( queryParameters );
	this.hands.loadHands( queryParameters );
	this.hands.loadNames( queryParameters );
	this.loadAuctions( queryParameters );
};

Bridge.Deal.prototype.loadAuctions = function( queryParameters ) {
	if ( ! queryParameters ) return false;
	for( var parameterName in queryParameters ) {
		if ( queryParameters.hasOwnProperty( parameterName ) ) {
			var firstChar = parameterName.charAt( 0 ).toLowerCase();
			if ( firstChar === 'a' ){
				var auctionName = parameterName.substr( 1 );
				if ( !auctionName ) auctionName = 'Default';
				var auctionString = queryParameters[ parameterName ];
				auctionName = unescape( auctionName );
				this.addAuction( auctionName, auctionString );
			}
		}
	}	
};

Bridge.Deal.prototype.addAuction = function( auctionName, auctionString ) {
	if ( auctionName in this.auctions ) {
		throw 'An auction with name : ' + auctionName + ' already exists! Please specify a different name.';
	}
	var auction = new Bridge.Auction( auctionName, this.dealer );
	auction.parseAuctionString( auctionString );
	this.auctions[ auctionName ] = auction;
};

Bridge.Deal.prototype.loadDealInformation = function( queryParameters ) {
	
	if ( ! queryParameters ) return;
	// Optional parameters 
	
	// Load Board Number
	var board = Bridge.getParameterValue( queryParameters, 'b' );
	if ( board ) {
		this.board = board;
	}
	
	// Load dealer
	var dealer = Bridge.getParameterValue( queryParameters, 'd' );
	if ( dealer && dealer in Bridge.Directions ) {
		this.dealer = dealer;
	}
	
	// Load vulnerability
	var vulnerability = Bridge.getParameterValue( queryParameters, 'v' );
	if ( vulnerability && vulnerability in Bridge.Vulnerability ) {
		this.vulnerability = vulnerability;	
	}	
	
	// General notes 
	var notes = Bridge.getParameterValue( queryParameters, 't' );
	if ( notes ) {
		this.notes = unescape(notes);	
	}		

};

Bridge.Deal.prototype.addCard = function( suit, rank, direction ) {
	this.hands.addCard( suit, rank, direction );	
};

Bridge.Deal.prototype.removeCard = function( suit, rank, direction ) {
	this.hands.removeCard( suit, rank );	
};

Bridge.Deal.prototype.assignRest = function() {
	this.hands.assignRest();	
};

Bridge.Deal.prototype.unAssignAll = function() {
	this.hands.unAssignAll();	
};