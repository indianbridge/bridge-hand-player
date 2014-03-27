/**
 * A namespace for function here
 * @namespace BHG
 */
var BHP = {};

// The card images
BHP.cardImageDimensions = {
	folder : 'images/cards/small',
	width : 76,
	height : 92,
	cardBackImage: 'images/cards/small/b1fv.png',
	percentageWidthShowing: 0.5,
	percentageHeightShowing: 0.5,
};

BHP.BootstrapClass = 'success';
BHP.bootswatchThemes = {};
BHP.gutter = 5;
BHP.fontSize = 14;
BHP.manualHashChange = true;
BHP.savePlayCount = 0;

// Read the query parameters
BHP.readQueryParameters = function() {
	BHP.queryParameters = null;
	var vars, hash;
	// Retrieve the part after the ? in url
	var q = document.URL.split( '?' )[1];
	if( q !== undefined ){
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
	BHP.queryParameters = vars;	
};

// Retreive a query parameter
BHP.getParameterValue = function( queryParameters, parameterName ) {
	if ( queryParameters[ parameterName ] !== undefined ) {
		return queryParameters[ parameterName ];
	}
	else if ( queryParameters[ parameterName.toUpperCase() ] !== undefined ) {
		return queryParameters[ parameterName.toUpperCase() ];
	}	
	return null;
}

/**
 * Parse query parameters for other information like board, dealer etc.
 *
 * @param {array} queryParameters an associative array of parsed query parameters 
 * @return void
 */
BHP.loadDealInformation = function( ) {
	
	// Optional parameters 
	
	// Load Board Number
	var board = BHP.getParameterValue( BHP.queryParameters, 'b' );
	if ( board ) {
		BHP.deal.setBoard( board );
	}
	
	// Load dealer
	var dealer = BHP.getParameterValue( BHP.queryParameters, 'd' );
	if ( dealer ) {
		try {
			BHP.deal.setDealer( dealer );
		}
		catch ( err ) {
			BHP.addError( err );
		}
	}
	
	// Load vulnerability
	var vulnerability = BHP.getParameterValue( BHP.queryParameters, 'v' );
	if ( vulnerability ) {
		try {
			BHP.deal.setVulnerability( vulnerability );
		}
		catch ( err ) {
			BHP.addError( err );
		}		
	}	

};

/**
 * Parse query parameters for player names
 *
 * @param {array} queryParameters an associative array of parsed query parameters 
 * @return void
 */
BHP.loadNames = function() {
	for( var direction in Bridge.Directions ) {
		var parameterName = direction + 'n';
		var name = BHP.getParameterValue( BHP.queryParameters, parameterName );
		if ( name ) BHP.deal.setName( name, direction );
	}
};

/**
 * Load the hands specified in the query parameters
 *
 * @method loadHands
 * @param void 
 * @return void
 */
BHP.loadHands = function( ) {
	// A tally of which hands are not specified in the query Parameters
	var unspecifiedHands = [];	
	
	// Look for hands specified for each direction
	for( var direction in Bridge.Directions ) {
		var handString = BHP.getParameterValue( BHP.queryParameters, direction );
		if ( handString ) {
			// If specified load hand for direction
			BHP.loadHand( direction, handString );
		}
		else {
			// Hand not specified
			unspecifiedHands.push( direction );
		}
	}
	
	// If 3 hands specified then load fourth hand automatically
	if ( unspecifiedHands.length === 1 ) {
		BHP.deal.assignFourthHand( unspecifiedHands[ 0 ] );
		for( var direction in Bridge.Directions ) {
			var numCards = BHP.deal.getNumCards( direction );
			if ( numCards !== 13 ) {
				BHP.addError( Bridge.getDirectionName( direction ) + ' has ' + numCards + '!' );
			}
		}
	}	
	else if ( unspecifiedHands.length > 1 ) {
		var hands = [];
		for( var i = 0;i < unspecifiedHands.length; ++i ) hands.push( getDirectionName( unspecifiedHands[ i ]) );
		var message = hands.join(' and ');
		message += ' hands have not been specified!';
		BHP.addError( message );
	}
};

/**
 * Parse one hand specified in query parameters
 *
 * @param {string} direction the hand (sitting in the specified direction) to load
 * @param {string} handString the hand specified in the query parameters for this direction
 * @return void
 */
BHP.loadHand = function( direction, handString) {
	handString = handString.toLowerCase();
	var directionName = Bridge.getDirectionName( direction );
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
					BHP.addError( prefix + currentChar + ' was found when a suit was expected!' );
					continue
				}			
				if ( i < handString.length - 1 && handString.charAt( i+1 ) === '0') {
					currentRank = 't';
					i++;
				}
				else {
					BHP.addError( prefix + 'a 1 is present without a subsequent 0. Use 10 or t to reprensent the ten.' );
					continue;
				}
			
			// All other characters
			default :
				if ( currentSuit === '' ) {
					BHP.addError( prefix + currentChar + ' was found when a suit was expected!' );
					continue
				}
				currentRank = currentChar;
				try {
				BHP.deal.addCard( currentSuit, currentRank, direction );
				}
				catch ( err ) {
					BHP.addError( err );
				}
				break;											
		}	
	}
};

/**
 * Parse the auction specifies as final contract or trumps only.
 */
BHP.loadContract = function( contractString ) {
	var contractLevel = parseInt( contractString.charAt(1) );
	if ( isNaN( contractLevel ) ) {
		// What is trump suit
		var trumpSuit = contractString.charAt(1);	
		var doubled = false;
		var redoubled = false;
		// Who is the leader
		var leader = contractString.charAt(2);
		if ( leader === 'd' || leader === 'x' || leader === 'r' ) {
			redoubled = ( leader === 'r' );
			doubled = !redoubled;
			leader = contractString.charAt(3);
		}
		var declarer = Bridge.getRHO( leader );
		try {
			BHP.deal.setContract( 1, trumpSuit, declarer, doubled, redoubled );
		}
		catch ( err ) {
			BHP.addError( err );
		}			
	}
	else {
		var trumpSuit = contractString.charAt(2);
		var declarer = contractString.charAt(3);
		var doubled = false;
		var redoubled = false;	
		if ( declarer === 'd' || declarer === 'x' || declarer === 'r' ) {
			redoubled = ( declarer === 'r' );
			doubled = !redoubled;
			declarer = contractString.charAt(4);
		}			
		try {
			BHP.deal.setContract( contractLevel, trumpSuit, declarer, doubled, redoubled );
		}
		catch ( err ) {
			BHP.addError( err );
		}			
	}	
};

/**
 * Parse the play string or bid string for annotations
 */
BHP.parseAnnotation = function( originalString, startBracePosition ) {
	var endBracePosition = originalString.indexOf( '}', startBracePosition + 1 );
	if ( endBracePosition === -1 ) {
		return null;
	}
	var annotation = originalString.slice( startBracePosition + 1, endBracePosition );
	return {
		annotation: annotation,
		endBracePosition: endBracePosition,
	}
};

/**
 * Parse query parameters to load auction
 */
BHP.loadAuction = function() {
	
	var parameterName = 'a';
	var contractString = BHP.getParameterValue( BHP.queryParameters, parameterName );
	if ( ! contractString ) {
		BHP.addError( 'No auction or contract or trumps and leader has been specified!' );
	}
	var originalString = contractString;
	contractString = contractString.toLowerCase();
	if ( contractString.charAt(0) !== '-' ) {
		for( var i = 0;i < contractString.length; ++i ) {
			var prefix = 'In auction specified at position ' + (i+1) + ' - ';							
			var currentChar = contractString.charAt( i );
			var level = 1;
			var suit = '';
			var annotation = null;
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
			else 
			if ( currentChar === 'd' || currentChar === 'x'  ) {
				suit = 'x'
			}
			else if ( currentChar === 'p' || currentChar === 'r' ) {
				suit = currentChar;
			}
			else {
				// First should be number
				level = parseInt( currentChar );
				i++;
				suit = contractString.charAt( i );
			}
			// Check if there is an annotation
			if ( contractString.charAt( i + 1 ) === '{' ) {  
				var value = BHP.parseAnnotation( originalString, i + 1 );
				if ( ! value ) {
					BHP.addError( prefix + ' No closing } found!' );	
					return;
				}	
				annotation = value.annotation;
				i = value.endBracePosition;			
			}
			try {
				BHP.deal.addBid( level, suit, annotation );
			}
			catch ( err ) {
				BHP.addError( err );
				return;
			}
		}
		try {		
			var contract = BHP.deal.determineDeclarer();
		}
		catch ( err ) {
			BHP.addError( err );
			return;
		}
	}
	else {
		BHP.loadContract( contractString );
	}
		
};

// Display the auction
BHP.drawAuction = function() {
	var auction = BHP.deal.getAuction();
	if ( auction.length > 0 ) {
		var tableID = 'auction-table';
		var html = '<table id="' + tableID + '" class="table table-bordered table-condensed table-striped">'
		html += '<tbody>';
		html += '<tr class="' + BHP.BootstrapClass + '"><th class="text-center">W</th><th class="text-center">N</th><th class="text-center">E</th><th class="text-center">S</th></tr>';
		var firstBid = auction[ 0 ];
		var currentDirection = 'w';
		html += '<tr class="text-center">';
		var count = 0;
		while ( firstBid.direction !== currentDirection ) {
			html += '<td>-</td>';
			count++;
			if ( currentDirection === 's' ) html += '</tr>';
			currentDirection = Bridge.getLHO( currentDirection );
		}
		for ( var i = 0; i < auction.length; ++i ) {
			var bid = auction[ i ];
			if ( bid.direction !== currentDirection ) {
				alert( 'Something went wrong in setting up auction!' );
				return;
			}
			if ( bid.direction === 'w' ) html += '<tr class="text-center">';
			var bidString = bid.getString();
			var bidHTML = '';
			if ( bidString.annotation === null ) {
				bidHTML = bidString.bid;
			}
			else {
					bidHTML = '<span data-toggle="tooltip" class="bg-' + BHP.BootstrapClass + ' bid-annotation" title="' + unescape( bidString.annotation ) +'">' + bidString.bid + '</span>';
			}
			html += '<td>' + bidHTML + '</td>';
			if ( currentDirection === 's' ) html += '</tr>';
			currentDirection = Bridge.getLHO( currentDirection );
		}
		// Fill up with tds for rest
		while( currentDirection !== 'w' ) {
			html += '<td></td>';
			if ( currentDirection === 's' ) html += '</tr>';
			currentDirection = Bridge.getLHO( currentDirection );			
		}
		html += '</tbody></table>';	
		var container = '#auction';
		$( container ).empty().append( html );
	}
	
	// Bootstrap tooltip
	$( '.bid-annotation' ).tooltip();   	
};

BHP.drawDealInformation = function() {
var auction = BHP.deal.getAuction();
		var tableID = 'deal-information-table';
		var size = 25*BHP.scalingFactor;
		var html = '<table id="' + tableID + '" class="table table-no-border table-condensed" style="width:auto;">'
		html += '<tbody>';
		html += '<tr style="height:' + size + 'px;"><td></td><td height="10px" id="n-vul" class="well middle"></td><td></td></tr>';
		html += '<tr><td style="width:' + size + 'px;" id="w-vul" class="well middle" rowspan=3 ></td><td id="board" class="middle ' + BHP.BootstrapClass + '"></td><td style="width:' + size + 'px;" id="e-vul" class="well middle" rowspan=3 ></td></tr>';
		html += '<tr><td id="contract" class="middle ' + BHP.BootstrapClass + '"></td></tr>';
		html += '<tr><td id="declarer" class="middle ' + BHP.BootstrapClass + '"></td></tr>';
		html += '<tr><td></td><td height="' + size + 'px;" id="s-vul" class="well middle"></td><td></td></tr>';
		
		html += '</tbody></table>';	
		var container = '#deal-information';
		$( container ).empty().append( html );
		
		// Set vulnerability
		var vul = BHP.deal.getVulnerability();
		if ( vul === 'n' || vul === 'b' ) {
			$( '#n-vul' ).addClass( 'vulnerable' );
			$( '#s-vul' ).addClass( 'vulnerable' );
		}
		if ( vul === 'e' || vul === 'b' ) {
			$( '#e-vul' ).addClass( 'vulnerable' );
			$( '#w-vul' ).addClass( 'vulnerable' );
		}
		
		// Set Dealer
		var dealer = BHP.deal.getDealer();
		if ( dealer != null ) {
			var dealerID = '#' + dealer + '-vul';
			$( dealerID ).html( 'D' );
		}
		
		// Set board, contract and declarer
		var board = BHP.deal.getBoard();
		if ( board === null ) board = 1;
		$( '#board' ).html( 'Board : ' + board );
		var contractString = BHP.deal.getContract();
		$( '#contract' ).html( 'Contract: ' + contractString );
		var declarer = BHP.deal.getDeclarer();
		if ( declarer === null ) declarer = '';
		$( '#declarer' ).html( 'Declarer: ' + declarer );
};

/**
 * Add an error.
 */
BHP.addError = function( error ) {
	BHP.errors.push( error );	
};

/**
 * Display all errors found when parsing Deal.
 */
BHP.showErrors = function() {
	var container = '#section';
	$( container ).addClass( 'padding-top' );
	var html = '<div class="container"><h1>Errors Found as noted below</h1>';
	html += '<ol class="list-group"><li class="list-group-item list-group-item-warning"><span class="item">';
	html += BHP.errors.join( '</span></li><li class="list-group-item list-group-item-warning"><span class="item">' );
	html += '</span></li></ol>';
	html += '</div>';
	//html += BHP.instructions;
	$( container ).empty().append( html );	
	$( container ).append( BHP.instructions );
};

/**
 * Show the footer bar
 */
BHP.drawFooter = function() {
	var footerID = "footer-menu-bar";
	var container = 'body';
	var fields = {
		'rewind' : 		{ name: 'Rewind',				icon: 'step-backward', iconAfter: false, },
		'undo-trick' :	{ name: 'Undo Previous Trick',	icon: 'backward', iconAfter: false, },
		'undo-play' :	{ name: 'Undo Previous Play',	icon: 'chevron-left', iconAfter: false, },
		'redo-play' :	{ name: 'Redo Next Play',		icon: 'chevron-right', iconAfter: true, },
		'redo-trick' :	{ name: 'Redo Next Trick',		icon: 'forward', iconAfter: true, },
		'fast-forward' :{ name: 'Fast Forward',			icon: 'step-forward', iconAfter: true, },		
	};
	var sizeClass = 'btn-group-sm';
	var html = '';
	html += '<div id="'+ footerID + '" class="fixed btn-group ' + sizeClass + '">';
	for( var field in fields ) {
		html += '<button type="button" id="' + field + '" class="btn btn-' + BHP.BootstrapClass + '">';
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
	BHP.footer = $( '#' + footerID );
	var left = BHP.viewport.width / 2 - BHP.footer.width() / 2;
	BHP.footer.css({
		left: left,
		bottom:0,
	});		
	
	$('#undo-play').click(function() {
		BHP.undoCard();
		BHP.setHash();	
	});
	$('#redo-play').click(function() {
		BHP.redoCard();	
		BHP.setHash();	
	});	
	$('#undo-trick').click(function() {
		BHP.undoTrick();
		BHP.setHash();		
	});
	$('#redo-trick').click(function() {
		BHP.redoTrick();
		BHP.setHash();		
	});	
	$('#rewind').click(function() {
		BHP.rewind();	
		BHP.setHash();	
	});
	$('#fast-forward').click(function() {
		BHP.fastForward();
		BHP.setHash();		
	});		
};

BHP.rewind = function() {
	BHP.undoCard();
	while ( ! BHP.deal.isAtBeginning() )	{
		BHP.undoCard();
	}
};

BHP.undoTrick = function() {
	BHP.undoCard();
	while ( ! BHP.deal.isAtBeginning() && ! BHP.deal.isEndOfTrick() )	{
		BHP.undoCard();
	}
};

BHP.fastForward = function() {
	BHP.redoCard();
	while ( ! BHP.deal.isAtEnd() )	{
		BHP.redoCard();
	}
};

BHP.redoTrick = function() {
	BHP.redoCard();
	while ( ! BHP.deal.isAtEnd() && ! BHP.deal.isEndOfTrick() )	{
		BHP.redoCard();
	}
};

BHP.redoCard = function() {
	var redoneCard = BHP.deal.redoCard();	
	var card = '#' + BHP.getCardID( redoneCard.suit, redoneCard.rank );
	var image = $( card );
	var suit = image.attr( 'suit' );
	var rank = image.attr( 'rank' );
	var direction = image.attr( 'direction' );
	image.attr( 'status', 'played' );
	image.addClass( 'cursor-not-allowed' );
	image.attr( 'src', BHP.cardImageDimensions.cardBackImage );
	if ( BHP.deal.isNewTrick() ) {
		BHP.clearTableCards();
	}
	BHP.playTableCard( $( card ) );
	BHP.setPlayableCards();	
};

BHP.undoCard = function() {
	var card = BHP.deal.undoCard();	
	var cardID = '#card-' + card.suit + card.rank;
	var tableCardID = '#played-' + cardID;
	$( cardID ).attr( 'src', $( cardID). attr( 'imageName' ) );
	$( cardID ).attr( 'status', 'not-played' );
	var tableHolder = card.direction + '-played-card';
	$( '#' + tableHolder ).empty();
	if ( BHP.deal.isEndOfTrick() ) {
		var tableCards = BHP.deal.getTableCards();
		for( var i = 0;i < tableCards.length; ++i ) {
			var tableCard = tableCards[ i ];
			var card = '#'+BHP.getCardID( tableCard.suit, tableCard.rank );
			BHP.playTableCard( $( card ) );
		}
		
	}
	BHP.setPlayableCards();
};

// determine the card id
BHP.getCardID = function( suit, rank ) {
	return 'card-' + suit + rank;
};

/**
 * Shows a card at specified location with specified dimensions  
 */
BHP.showCard = function( container, suit, rank, direction, top, left, width, height ) {
	var imageID = BHP.getCardID( suit, rank );
	var imageName = BHP.cardImageDimensions.folder + '/' + suit + rank + '.png';
	var status = 'not-played';
	var src = imageName;
	$( container ).append( '<img id="' + imageID + '" class="fixed card"></img>' );
	var image = $( '#' + imageID );
	image.attr( 'src', src );
	image.attr( 'imageName', imageName );
	image.attr( 'status', status );
	image.attr( 'suit', suit );
	image.attr( 'rank', rank );
	image.attr( 'direction', direction );
	image.css({
		width: width,
		height: height,
		top: top,
		left: left,
	});	

};

// Draw the four hands
BHP.drawHands = function() {
	BHP.getHands();
	BHP.computeScalingFactor();	
	for( var direction in Bridge.Directions ) {
		if ( direction === 'n' || direction === 's' ) {
			BHP.drawHorizontal( direction );
		}
		else {
			BHP.drawVertical( direction );
		}

	}
	BHP.setPlayableCards();
};

/**
 * Show the names of the hands.
 */
BHP.drawNames = function( direction, bottom, left ) {
	var name = BHP.deal.getName( direction );
	var nameID = direction + '-name';
	var html = '<span id="' + nameID + '"  class="text-size fixed label label-' + BHP.BootstrapClass + '">' + name + '</span>';
	var container = '#' + direction + '-hand';
	$( container ).append( html ); 
	var nameObject = $( '#' + nameID );
	nameObject.css({
		top: bottom - nameObject.outerHeight() - BHP.gutter,
		left: left,
	});	
};

/**
 * Show a played card on the table.
 */
BHP.playTableCard = function( card ) {
	var image = card.clone();
	var id = 'played-' + image.attr( 'id' );
	image.attr( 'id' , id);
	image.attr( 'src', image.attr( 'imageName' ) );
	var direction = image.attr( 'direction' );
	var id = direction + '-played-card';
	image.removeClass( 'fixed' ).removeClass( 'card' ).removeClass('img-highlight');
	$( '#' + id ).empty().append(image);
	var annotationArea = '#annotation-area';
	$( annotationArea ).html( BHP.deal.getAnnotation() );
};

/**
 * Handle a click event on a card in hand
 */
BHP.cardClicked = function( card ) {
	var image = $( card );
	var suit = image.attr( 'suit' );
	var rank = image.attr( 'rank' );
	var direction = image.attr( 'direction' );
	BHP.deal.playCard( suit, rank, direction );
	image.attr( 'status', 'played' );
	image.addClass( 'cursor-not-allowed' );
	image.attr( 'src', BHP.cardImageDimensions.cardBackImage );
	if ( BHP.deal.isNewTrick() ) {
		BHP.clearTableCards();
	}
	BHP.playTableCard( $( card ) );
	BHP.setPlayableCards();
	BHP.setHash();
};

/**
 * This is when a hand is on lead.
 */
BHP.setActiveHand = function( activeDirection ) {
	for( var direction in Bridge.Directions ) {
		var nameID = direction + '-name';
		var nameObject = $( '#' + nameID );
		if ( direction === activeDirection ) {
			nameObject.removeClass( 'label-' + BHP.BootstrapClass ).addClass( 'label-primary' );	
		}	
		else {
			nameObject.addClass( 'label-' + BHP.BootstrapClass ).removeClass( 'label-primary' );
		}
	}
};

/**
 * Update the status of the back and forward buttons based on current play.
 */
BHP.updateButtonStatus = function() {
	var prevDisabled = BHP.deal.isAtBeginning();
	$('#rewind').attr( 'disabled', prevDisabled );
	$('#undo-trick').attr( 'disabled', prevDisabled );
	$('#undo-play').attr( 'disabled', prevDisabled );
	var nextDisabled = BHP.deal.isAtEnd();
	$('#redo-trick').attr( 'disabled', nextDisabled );
	$('#redo-play').attr( 'disabled', nextDisabled );	
	$('#fast-forward').attr( 'disabled', nextDisabled );	
};

/**
 * Identify which cards are playable at next turn and highlight them and make them clickable.
 */
BHP.setPlayableCards = function() {
	var imageHighlightClass = 'img-highlight';
	// Remove highlight anc click handler on all cards
	$( '.card' ).unbind( 'click' ).removeClass( imageHighlightClass ).addClass( 'cursor-not-allowed' );
	// Set the playable cards
	var nextTurn = BHP.deal.getNextToPlay();
	var elements = '[direction='+ nextTurn + '][status="not-played"]';	
	var nextSuit = BHP.deal.getSuitLed();
	if ( nextSuit !== null ) {
		var extendedElements = elements + '[suit="' + nextSuit + '"]';
		var numInSuit = $( extendedElements ).length;
		if ( numInSuit > 0 ) elements = extendedElements;
	}
	$( elements ).addClass( imageHighlightClass ).removeClass( 'cursor-not-allowed' ).click(function() { 
		BHP.cardClicked( this );
	});	
	BHP.setActiveHand( nextTurn );
	BHP.updateButtonStatus();
};



/**
 * Draw north and south hands in horizontal fashion.
 */
BHP.drawHorizontal = function( direction ) {
	var container = '#' + direction + '-hand';
	$( container ).empty();
	var width = BHP.cardImageDimensions.width * BHP.scalingFactor;
	var height = BHP.cardImageDimensions.height * BHP.scalingFactor;	
	var fullHeight = height;
	var fullWidth = 12 * width * BHP.cardImageDimensions.percentageWidthShowing + width;
	var top = $( container ).position().top + $( container ).outerHeight() / 2 - fullHeight / 2;
	var left = $( container ).position().left + $( container ).outerWidth() / 2 - fullWidth / 2;
	BHP.drawNames( direction, top, left );	
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		var ranks = BHP.hands[ direction ].cards[ suit ];
		if ( ranks.length > 0 ) {
			for( var j = 0; j < ranks.length; ++j ) {
				var rank = ranks[ j ];
				BHP.showCard( 'body', suit, rank, direction, top, left, width, height );
				left += width * BHP.cardImageDimensions.percentageWidthShowing;
			}
		}
	}	
	
};

/**
 * Draw east and west hands in vertical fashion.
 */
BHP.drawVertical = function( direction ) {
	var container = '#' + direction + '-hand';
	$( container ).empty();
	var width = BHP.cardImageDimensions.width * BHP.scalingFactor;
	var height = BHP.cardImageDimensions.height * BHP.scalingFactor;	
	var fullHeight = 3 * height * BHP.cardImageDimensions.percentageHeightShowing + height;
	var fullWidth = ( BHP.hands[ direction ].longest - 1 ) * width * BHP.cardImageDimensions.percentageWidthShowing + width;
	var top = $( container ).position().top + $( container ).outerHeight() / 2 - fullHeight / 2;
	var startingLeft = $( container ).position().left + $( container ).outerWidth() / 2 - fullWidth / 2;
	BHP.drawNames( direction, top, startingLeft );	
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var left = startingLeft;
		var suit = Bridge.CardSuitOrder[ i ];
		var ranks = BHP.hands[ direction ].cards[ suit ];
		for( var j = 0; j < ranks.length; ++j ) {
			var rank = ranks[ j ];
			BHP.showCard( container, suit, rank, direction, top, left, width, height );
			left += width * BHP.cardImageDimensions.percentageWidthShowing;
		}
		top += height * BHP.cardImageDimensions.percentageHeightShowing;
	}	
};

BHP.getHorizontalWidth = function( direction ) {
	var hand = BHP.hands[ direction ];
	//var firstSuit = true;
	var width = 0;
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		if ( hand.cards[ suit ].length > 0 ) {
			//if ( ! firstSuit ) width += BHP.gutter;
			width += ( hand.cards[ suit ].length - 1 ) * BHP.cardImageDimensions.width * BHP.cardImageDimensions.percentageWidthShowing + BHP.cardImageDimensions.width;
			firstSuit = false;
		}
	}
	return width;
};

BHP.getVerticalWidth = function( direction ) {
	var hand = BHP.hands[ direction ];
	return ( hand.longest - 1 ) * BHP.cardImageDimensions.width * BHP.cardImageDimensions.percentageWidthShowing + BHP.cardImageDimensions.width;
};

BHP.getHorizontalHeight = function( direction ) {
	var hand = BHP.hands[ direction ];
	return BHP.cardImageDimensions.height;
};

BHP.getVerticalHeight = function( direction ) {
	var hand = BHP.hands[ direction ];
	var numSuits = 0;
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		if ( hand.cards[ suit ].length > 0 ) numSuits++;
	}
	return ( numSuits - 1 ) * BHP.cardImageDimensions.height * BHP.cardImageDimensions.percentageHeightShowing + BHP.cardImageDimensions.height;
};

BHP.getHands = function() {
	BHP.hands = {};
	for( var direction in Bridge.Directions ) {
		var hand = BHP.deal.getHand( direction );		
		BHP.hands[ direction ] = {};
		BHP.hands[ direction ].count = {};
		BHP.hands[ direction ].cards = {};
		for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
			var suit = Bridge.CardSuitOrder[ i ];
			BHP.hands[ direction ].cards[ suit ] = [];
			BHP.hands[ direction ].count[ suit ] = 0;
			for( var j = 0; j < Bridge.RankOrder.length; ++j ) {
				var rank = Bridge.RankOrder[ j ];
				if ( rank in hand.cards[ suit ] ) {
					BHP.hands[ direction ].count[ suit ]++;
					BHP.hands[ direction ].cards[ suit ].push( rank );
				}
			}
		}
		BHP.hands[ direction ].longest = Math.max( BHP.hands[ direction ].count[ 's' ], BHP.hands[ direction ].count[ 'h' ], BHP.hands[ direction ].count[ 'd' ], BHP.hands[ direction ].count[ 'c' ] );		
		if ( direction === 'n' || direction === 's' ) {
			BHP.hands[ direction ].height = BHP.getHorizontalHeight( direction );
			BHP.hands[ direction ].width = BHP.getHorizontalWidth( direction );
		}
		else {
			BHP.hands[ direction ].height = BHP.getVerticalHeight( direction );
			BHP.hands[ direction ].width = BHP.getVerticalWidth( direction );			
		}
	}
};

BHP.computeScalingFactor = function() {
	BHP.scalingFactor = 100;
	for( var direction in Bridge.Directions ) {
		var container = '#' + direction + '-hand';
		var hand = BHP.hands[ direction ];
		var cWidth = $( container ).outerWidth() - 2 * BHP.gutter;
		var cHeight = $( container ).outerHeight() - 2 * BHP.gutter;
		var wScalingFactor = cWidth / hand.width;
		var hScalingFactor = cHeight / hand.height;
		BHP.scalingFactor = Math.min( BHP.scalingFactor, wScalingFactor, hScalingFactor );	
		var style = '<style>';
		style += 'table.table {font-size: ' + BHP.fontSize * BHP.scalingFactor + 'px;}';
		style += '.text-size {font-size: ' + BHP.fontSize * BHP.scalingFactor + 'px;}';
		style += '</style>';
		$( style ).appendTo( "head" )	
		
	}
};

// Draw the playing table
BHP.drawPlayingTable = function() {
	var table = $( '#playing-table' );
	table.addClass( 'card-table' );
	
	// Draw compass
	var compassID = 'compass-area';
	var html = '<img id="' + compassID + '" class="fixed"></img>'
	table.append( html );
	var compass = $( '#' + compassID );
	compass.attr( 'src' , 'images/compass.png' );
	var width = 0.2 * table.outerWidth();
	var height = width;
	var top = table.position().top + table.outerHeight() / 2 - height / 2;
	var left = table.position().left + table.outerWidth() / 2 - width / 2;
	var compassDimensions = {
		width: width,
		height: height,
		top: top,
		left: left,
	};
	
	//trace( 'Drawing compass with src ' + imageName + ' with dimensions ' + JSON.stringify( compassDimensions ) );		
	compass.css( compassDimensions );		
	// Add regions for played cards
	var id = 'n-played-card';
	var html = '<div id="' + id + '" class="fixed"></div>';
	table.append( html );
	var area = $( '#' + id );
	var top = table.position().top;
	var left = table.position().left + table.outerWidth() / 2 - BHP.cardImageDimensions.width * BHP.scalingFactor / 2;
	var width = BHP.cardImageDimensions.width * BHP.scalingFactor;
	var height = BHP.cardImageDimensions.height * BHP.scalingFactor;
	area.css({
		left: left,
		top: top,
		width: width,
		height: height,
	});
	
	var id = 'e-played-card';
	var html = '<div id="' + id + '" class="fixed"></div>';
	table.append( html );
	var area = $( '#' + id );
	var top = table.position().top + table.outerHeight() / 2 - BHP.cardImageDimensions.height * BHP.scalingFactor / 2;
	var width = BHP.cardImageDimensions.width * BHP.scalingFactor;
	var height = BHP.cardImageDimensions.height * BHP.scalingFactor;
	var left = table.position().left + table.outerWidth() - width;
	area.css({
		left: left,
		top: top,
		width: width,
		height: height,
	});			
	
	var id = 's-played-card';
	var html = '<div id="' + id + '" class="fixed"></div>';
	table.append( html );
	var area = $( '#' + id );
	var left = table.position().left + table.outerWidth() / 2 - BHP.cardImageDimensions.width * BHP.scalingFactor / 2;
	var width = BHP.cardImageDimensions.width * BHP.scalingFactor;
	var height = BHP.cardImageDimensions.height * BHP.scalingFactor;
	var top = table.position().top + table.outerHeight() - height;
	area.css({
		left: left,
		top: top,
		width: width,
		height: height,
	});
	
	var id = 'w-played-card';
	var html = '<div id="' + id + '" class="fixed"></div>';
	table.append( html );
	var area = $( '#' + id );
	var top = table.position().top + table.outerHeight() / 2 - BHP.cardImageDimensions.height * BHP.scalingFactor / 2;
	var left = table.position().left ;
	var width = BHP.cardImageDimensions.width * BHP.scalingFactor;
	var height = BHP.cardImageDimensions.height * BHP.scalingFactor;
	area.css({
		left: left,
		top: top,
		width: width,
		height: height,
	});	
	
	BHP.clearTableCards();		
};

/**
 * Clear all the cards played on the table
 */
BHP.clearTableCards = function() {
	for( var direction in Bridge.Directions ) {
		var id = direction + '-played-card';
		$( '#' + id ).empty();
	}	
};

// Draw the main sections
BHP.drawMainSection = function() {
	var cells = [
		{ id: 'deal-information',name: 'Cell 0 0', height: 3, width: 3, class: 'status', left: 0, top: 0, widthGutters: 1, heightGutters: 1, },
		{ id: 'n-hand',name: 'Cell 0 0', height: 3, width: 6, class: 'alert', left: 3, top: 0, widthGutters: 2, heightGutters: 1, },
		{ id: 'auction',name: 'Cell 0 0', height: 3, width: 3, class: 'status', left: 9, top: 0, widthGutters: 3, heightGutters: 1, },
		{ id: 'w-hand',name: 'Cell 0 0', height: 6, width: 4, class: 'alert', left: 0, top: 3, widthGutters: 1, heightGutters: 2, },
		{ id: 'playing-table',name: 'Cell 0 0', height: 6, width: 4, class: 'well', left: 4, top: 3, widthGutters: 2, heightGutters: 2, },
		{ id: 'e-hand',name: 'Cell 0 0', height: 6, width: 4, class: 'alert', left: 8, top: 3, widthGutters: 3, heightGutters: 2, },
		{ id: 'general-messages',name: 'Cell 0 0', height: 3, width: 3, class: 'status alert alert-' + BHP.BootstrapClass, left: 0, top: 9, widthGutters: 1, heightGutters: 3, },
		{ id: 's-hand',name: 'Cell 0 0', height: 3, width: 6, class: 'alert', left: 3, top: 9, widthGutters: 2, heightGutters: 3, },
		{ id: 'annotation-area',name: 'Cell 0 0', height: 3, width: 3, class: 'status alert alert-' + BHP.BootstrapClass, left: 9, top: 9, widthGutters: 3, heightGutters: 3, },
	];
	BHP.header = $('#header');
	var totalHeight = BHP.footer.position().top - BHP.header.position().top - BHP.header.height();
	var totalWidth = BHP.viewport.width;
	var unitHeight = ( totalHeight - 4 * BHP.gutter ) / 12;
	var unitWidth = ( totalWidth - 4 * BHP.gutter ) / 12;
	//var sectionHeight = ( totalHeight - 20 ) / 4;
	//var sectionWidth = ( totalWidth - 20 ) / 4;
	var container = '#section';
	var top = BHP.header.position().top + BHP.header.height();
	var left = 0;
	for( var i = 0; i < cells.length; ++ i ) {
		var cell = cells[ i ];
		var cellTop = top + cell.heightGutters * BHP.gutter + cell.top * unitHeight;
		var cellLeft = left + cell.widthGutters * BHP.gutter + cell.left * unitWidth;
		var cellHeight = cell.height * unitHeight;
		var cellWidth = cell.width * unitWidth;
		var html = '<div id="' + cell.id + '" class="' + cell.class + ' fixed"></div>';
		$( container ).append( html );
		var cell = $( '#' + cell.id );
		cell.css({
			top: cellTop,
			left: cellLeft,
			width: cellWidth,
			height: cellHeight,
		});		
	}
	
};

BHP.drawTitles = function() {
	var container = '#section';
	var name = 'Play Annotations'
	var nameID = 'annotation-area-title';
	var html = '<span id="' + nameID + '"  class="text-size fixed label label-' + BHP.BootstrapClass + '">' + name + '</span>';
	var area = '#annotation-area';
	$( container ).append( html ); 
	var nameObject = $( '#' + nameID );
	nameObject.css({
		top: $( area ).position().top - nameObject.outerHeight() - BHP.gutter,
		left: $( area ).position().left,
	});	
	
	var name = 'General Messages'
	var nameID = 'general-messages-title';
	var html = '<span id="' + nameID + '"  class="text-size fixed label label-' + BHP.BootstrapClass + '">' + name + '</span>';
	var area = '#general-messages';
	$( container ).append( html ); 
	var nameObject = $( '#' + nameID );
	nameObject.css({
		top: $( area ).position().top - nameObject.outerHeight() - BHP.gutter,
		left: $( area ).position().left,
	});	
};

/**
 * Draw or Redraw everything.
 */
BHP.drawAll = function() {
	BHP.viewport = {
		width: jQuery(window).width(),
		height: jQuery(window).height(),
	};	
	
	var container = '#section';
	$( container ).empty();
	
	// First draw footer.
	BHP.drawFooter();
	
	// Draw the main section
	BHP.drawMainSection();
	
	BHP.drawHands();
	
	BHP.drawPlayingTable();	
	
	BHP.drawAuction();
	
	BHP.drawDealInformation();
	
	BHP.drawTitles();
	
	BHP.deal.resetPlayedCardIndex();
	
	BHP.manualHashChange = false;
	
	BHP.processHash();
	
};

BHP.loadPlayByName = function( playString, playName ) {
	try {
		BHP.deal.resetAll();
		var play = playString.toLowerCase();
		for( var i = 0;i < play.length; ++i ) {
			var annotation = null;
			var suit = play.charAt( i );
			Bridge.checkCardSuit( suit );
			i++;
			prefix = 'In play ' + playName +' at position ' + (i+1) + ' - ';	
			if ( i >= play.length ) {
				throw prefix + ' No rank has been specified for suit ' + suit;
			}
			var rank = play.charAt( i );
			Bridge.checkRank( rank );
			if (  play.charAt( i + 1 ) === '{' ) {
				var value = BHP.parseAnnotation( playString, i + 1 );
				if ( ! value ) {
					throw prefix + ' No closing } found!';	
				}	
				annotation = value.annotation;
				i = value.endBracePosition;		
			}	
			BHP.deal.playCard( suit, rank, null, annotation );	
		}
		BHP.rewind();
		BHP.deal.savePlay( playName );
		var list = $( '#lines' );
		var index = BHP.savedPlayCount;
		BHP.savedPlayCount++;
		var lineID = 'line-' + index;
		var html = '<li><a class="cursor-hand" id="' + lineID +'">' + playName + '</a></li>';
		list.append(html);
		$( '#' + lineID ).click(function(){
			BHP.loadSavedPlay( this );
		});
	}
	catch( err ) {
		BHP.addError( err );
	}	
};

BHP.loadSavedPlay = function( list ) {
	var name = $( list ).html();
	BHP.rewind();
	BHP.deal.loadPlay( name );
};

/**
 * Load the play specified in the query parameters
 */
BHP.loadPlay = function() {
	var firstName = null;
	try {
		for( var parameterName in BHP.queryParameters ) {
			var firstChar = parameterName.charAt( 0 ).toLowerCase();
			if ( firstChar === 'p' ){
				var name = parameterName.substr( 1 );
				if ( !name ) name = 'Default';
				if ( firstName === null ) firstName = name;
				var playString = BHP.queryParameters[ parameterName ];
				BHP.loadPlayByName( playString, name );
			}
		}
		if ( firstName !== null ) {
			BHP.deal.loadPlay( firstName );
		}
	}
		catch( err ) {
		BHP.addError( err );
	}
};


BHP.manageColorThemes = function() {
	// Retreive theme cookie if it exists and set the stylesheet accordingly
	var themeCookie = $.cookie( 'bootswatch_theme' );
	if ( themeCookie !== undefined ) {
		var theme = JSON.parse( themeCookie );
		$('#bootswatch-theme').attr({href : theme.cssCdn});
		$('#current-theme').html( theme.name );
	}
	// Populate dropdown with bootswatch themes
  	$.get( "http://api.bootswatch.com/3/", function( data ) {
  		// Add the default bootstrap theme first
		var options = '<li><a class="theme-name" href="javascript:void(0);" id="default">Default</a></li>';
		BHP.bootswatchThemes['default'] = {
			'name' : 'Default',
			'cssCdn' : '//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css',
		};
		
		// Add the retreived bootswatches next
		var themes = data.themes;
		for ( var i = 0; i < themes.length; i++) {
			var themeID = themes[i].name.toLowerCase();
			BHP.bootswatchThemes[themeID] = themes[i];
			options += '<li><a class="theme-name" href="javascript:void(0);" id="' + themeID + '">';
			options += '<img width="25" height="25" src="' + themes[i].thumbnail + '" alt="' + themes[i].name + '"></img> ' + themes[i].name;
			options += '</a></li>';
		}  	
		
		// Set the dropdown
		$('#themes').html(options);	
		
		// Add click handler to switch themes
	  	$('.theme-name').click(function() {
	  		var themeID = $(this).attr('id');
	  		var stylesheet = 'http:' + BHP.bootswatchThemes[themeID].cssCdn;
	  		$.cookie( 'bootswatch_theme', JSON.stringify( BHP.bootswatchThemes[themeID]) );
	  		$('#bootswatch-theme').attr({href : stylesheet});
	  		$('#current-theme').html( BHP.bootswatchThemes[themeID].name );
	  	});		
  	});	
};

BHP.changeToPlay = function( playNumber ) {
	if ( ! BHP.deal.isValidPlayNumber( playNumber ) ) {
		alert( playNumber + ' is not a valid play number!' );
		return false;
	}	
	var current = BHP.deal.getPlayNumber();
	if ( playNumber < current ) {
		while ( ! BHP.deal.isAtBeginning() && ! BHP.deal.isAtPlayNumber( playNumber ) ) {
			BHP.undoCard();
		}
	}
	else if ( playNumber > current ) {
		while ( ! BHP.deal.isAtEnd() && ! BHP.deal.isAtPlayNumber( playNumber ) ) {
			BHP.redoCard();
		}		
	}
	return true;
};

/**
 * Parse any hash value and process it as play Number
 */
BHP.processHash = function() {
	if ( ! BHP.manualHashChange ) {
		var hash = location.hash.substring(1);
		var playNumber = hash ? parseInt( hash ) : 0;
		return BHP.changeToPlay( playNumber );
	}
	BHP.manualHashChange = false;	
}; 

/**
 * Set tha hash to current play number.
 */
BHP.setHash = function() {
	BHP.manualHashChange = true;
	window.location.hash = BHP.deal.getPlayNumber();
};


$(function() {
	// A new bridge deal
	BHP.deal = new Bridge.Deal();	
	
	BHP.manageColorThemes();
	
	BHP.errors = [];

	// Parse the query Parameters
	BHP.readQueryParameters();
	
	if ( BHP.queryParameters ) {
		BHP.instructions = $( '#instructions' ).html();
		$( '#instructions' ).remove();
		
		// Load Deal Information
		BHP.loadDealInformation();
		
		// Load names
		BHP.loadNames();
		
		// Load the hands
		BHP.loadHands();
		
		// Load the Auction if specified
		BHP.loadAuction();
		
		// Load the play
		BHP.loadPlay();
		
		if ( BHP.errors.length > 0 ) {
			BHP.showErrors();
			return;
		}
		else {
			BHP.drawAll();
			// Setup handler to detect window resize and redraw everything
			$(window).resize(function() {
				BHP.drawAll();
			});	
			// Hash change handler
			$(window).hashchange( function(){
				BHP.processHash();
		  	});						
		}
		
	}
});


 
 