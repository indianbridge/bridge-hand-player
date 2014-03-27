/**
 * A namespace for function here
 * @namespace BHG
 */
var BHG = {};

// The card images
BHG.cardImageDimensions = {
	folder : 'images/cards/small',
	width : 76,
	height : 92,
	cardBack: 'b1fv.png',
	percentageWidthShowing: 0.5,
	percentageHeightShowing: 0.5,
};

// determine the card id
BHG.getCardID = function( suit, rank, pile ) {
	if ( pile === undefined ) pile = true;
	return 'card-' + ( pile ? 'pile-' : 'assigned-' ) + suit + rank;
};

BHG.showHand = function( direction ) {
	var hand = BHG.deal.getHand( direction );
	// Show hand for this direction
	var container = '#' + direction + '-hand';
	$('#hands a[href="' + container + '"]').tab('show');
	$( container ).empty();
	var cardTop = $( '#assigned' ).position().top + $( container ).position().top + 5;
	var startingLeft = $( '#assigned' ).position().left + $( container ).position().left + 5;
	var width = BHG.cardImageDimensions.width * BHG.scalingFactor;
	var height = BHG.cardImageDimensions.height * BHG.scalingFactor;	
	var numCards = 0;
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		var ranks = hand.cards[ suit ];
		var cardLeft = startingLeft;
		for( var j = 0; j < Bridge.RankOrder.length; ++j ) {
			var rank = Bridge.RankOrder[ j ];
			if ( rank in ranks ) {
				BHG.showCard( container, suit, rank, cardTop, cardLeft, width, height, false );
				numCards++;
				cardLeft += width * BHG.cardImageDimensions.percentageWidthShowing
			}
		}
		cardTop += height * BHG.cardImageDimensions.percentageHeightShowing;
	}	
	var nameContainer = '#' + direction + '-hand-name';
	var html = Bridge.Directions[ direction ].name + '<span class="badge">' + numCards + '</span>';
	$( nameContainer ).empty().append( html );
	// Click handler for assigned card click	
	$( '.card[status="assigned"]' ).click(function() {
		var card = this;
		BHG.unAssignCard( card );
	});	
};

// Unassign a previously assigned card
BHG.unAssignCard = function( card ) {
	try {
		var direction = BHG.activeHand;
		var suit = $( card ).attr( 'suit' );
		var rank = $( card ).attr( 'rank' );	
		BHG.deal.removeCard( suit, rank );
		var cardID = '#' + BHG.getCardID( suit, rank );
		$( cardID ).click(function() {
			var card = this;
			BHG.assignCard( card );
		});	
		$( cardID ).css({
			cursor: 'normal',
		});
		$( cardID ).attr( 'src', $( cardID ).attr( 'imageName' ) ); 
		BHG.showHand( direction );
	}
	catch (err) {
		alert(err);
	}	
};

/**
 * Shows a card at specified location with specified dimensions  
 */
BHG.showCard = function( container, suit, rank, top, left, width, height, pile ) {
	if ( pile === undefined ) pile = true;
	var imageID = BHG.getCardID( suit, rank, pile );
	var imageName = BHG.cardImageDimensions.folder + '/' + suit + rank + '.png';
	var assigned = Bridge.Cards[ suit ][ rank ].getDirection();
	var status = ( assigned !== null ? 'assigned' : 'not-assigned' );
	var src = imageName;
	if ( pile && assigned !== null ) src = BHG.cardImageDimensions.folder + '/' + BHG.cardImageDimensions.cardBack;
	$( container ).append( '<img id="' + imageID + '" class="fixed card"></img>' );
	var image = $( '#' + imageID );
	image.attr( 'src', src );
	image.attr( 'imageName', imageName );
	image.attr( 'status', status );
	image.attr( 'suit', suit );
	image.attr( 'rank', rank );
	//image.attr( 'direction', direction );
	image.css({
		width: width,
		height: height,
		top: top,
		left: left,
	});	
	if ( pile && assigned !== null ) {
		image.css({
			cursor: 'not-allowed',
		});
	}
};

/**
 * Shows the Auction Generator Area.  
 */
BHG.showAuctionGenerator = function() {
	BHG.activeState = 'set-auction';
	
	// Calculate Scaling Factor
	BHG.viewport = {
		width: jQuery(window).width(),
		height: jQuery(window).height(),
	};
	BHG.headerHeight = $( '#header' ).outerHeight();
	BHG.headerBottom = $( '#header' ).position().top + BHG.headerHeight;
	BHG.footerTop = $( '#footer' ).position().top;		
	BHG.containerDimensions = {
		width: ( BHG.viewport.width - 15 ) / 2,
		height: BHG.footerTop - BHG.headerBottom - 10,
	};
	BHG.scalingFactor = BHG.calculateScalingFactor( BHG.cardImageDimensions, BHG.containerDimensions );
	
	BHG.container = '#section';
	$( BHG.container ).empty();
	
	BHG.createDealInformationArea();
	
	BHG.createAuctionArea();
	
	var html = '<button id="create-hands" type="button" class="btn btn-primary navbar-btn">Back to Hand Generator</button>';
	$( '#footer-bar' ).empty().append( html );
	$( '#create-hands' ).click( function() {
		BHG.showHandGenerator();
	});	
};

/**
 * Shows the Hand Generator Area.  
 */
BHG.showHandGenerator = function() {
	
	BHG.activeState = 'set-hands';
	// Calculate Scaling Factor
	BHG.viewport = {
		width: jQuery(window).width(),
		height: jQuery(window).height(),
	};
	BHG.headerHeight = $( '#header' ).outerHeight();
	BHG.headerBottom = $( '#header' ).position().top + BHG.headerHeight;
	BHG.footerTop = $( '#footer' ).position().top;		
	BHG.containerDimensions = {
		width: ( BHG.viewport.width - 15 ) / 2,
		height: BHG.footerTop - BHG.headerBottom - 10,
	};
	BHG.scalingFactor = BHG.calculateScalingFactor( BHG.cardImageDimensions, BHG.containerDimensions );
	
	BHG.container = '#section';
	$( BHG.container ).empty();
	// Set up unassigned card pile
	BHG.createUnassignedArea();
	
	// Setup asigned card pile
	BHG.createAssignedArea();
	for( var i = 0; i < Bridge.DirectionOrder.length; ++i ) {
		var direction = Bridge.DirectionOrder[ i ];
		BHG.showHand( direction );
	}
	var container = '#' + BHG.activeHand + '-hand';
	$('#hands a[href="' + container + '"]').tab('show')
	
	var html = '<button id="assign-rest" type="button" class="btn btn-primary navbar-btn">Assign Remaining Cards Randomly</button>';
	$( '#footer-bar' ).empty().append( html );
	html = '<button id="create-auction" type="button" class="btn btn-primary navbar-btn">Create Auction</button>';
	$( '#footer-bar' ).append( html );
	$( '#assign-rest' ).click( function() {
		BHG.deal.assignRest();
		BHG.showHandGenerator();
	});
	$( '#create-auction' ).click( function() {
		BHG.showAuctionGenerator();
	});	
};

// Create the area to specify dealer etx.
BHG.createDealInformationArea = function() {
	var top = BHG.headerHeight + 5;
	var left = 5;
	var html = '<div id="deal-information" class="fixed well"></div>';
	$( BHG.container ).append( html );
	var pile = $( '#deal-information' );
	pile.css({
		top: top,
		left: left,
		width: BHG.containerDimensions.width,
		height: BHG.containerDimensions.height,
	});		
};

// Create the auction area
BHG.createAuctionArea = function() {
	var top = BHG.headerHeight + 5;
	var left = BHG.viewport.width / 2 + 2.5;
	var html = '<div id="auction-area" class="fixed well"></div>'
	$( BHG.container ).append( html );
	var auctions = $( '#auction-area' );
	auctions.css({
		top: top,
		left: left,
		width: BHG.containerDimensions.width,
		height: BHG.containerDimensions.height,
	});	
	auctions.html( BHG.createAuctionTabs() );
	BHG.createBiddingBox( '#auction' );
	
	// Setup handler for tab change.
	$( 'a[data-toggle="tab"]' ).on( 'shown.bs.tab', function (e) {
		var values = e.target.href.split( '#' );
		BHG.activeAuctionType = values[ 1 ];
	});	
};

// Setup the tabs for auction types
BHG.createAuctionTabs = function( container ) {
	var auctionTypes = [
		{ id: 'auction', name: 'Auction', },
		{ id: 'contract', name: 'Set Contract', },
		{ id: 'trumps', name: 'Set Trumps', },
	];
	if ( BHG.activeAuctionType === undefined ) BHG.activeAuctionType = auctionTypes[ 0 ].id;
	var html = '<ul id="auctions" class="nav nav-pills">';
	for( var i = 0; i < auctionTypes.length; ++i ) {
		var auctionType = auctionTypes[ i ];
		if ( auctionType.id === BHG.activeAuctionType ) html += '<li class="active">';
		else html += '<li>';
		html += '<a id="' + auctionType.id + '-name" href="#' + auctionType.id + '" data-toggle="tab">' + auctionType.name + '</a></li>';
	}
	html += '</ul>';
	html += '<div id="myTabContent" class="tab-content">';
	for( var i = 0; i < auctionTypes.length; ++i ) {
		var auctionType = auctionTypes[ i ];
		if ( auctionType.id === BHG.activeAuctionType ) html += '<div class="tab-pane fade in active" id="' + auctionType.id + '"></div>';
		else html += '<div class="tab-pane fade" id="' + auctionType.id + '"></div>';
	}
	html += '</div>';	
	return html;
};

// Create the bidding box
BHG.createBiddingBox = function( container ) {
	var html = '<table id="bidding-box" class="table table-condensed"><tbody>';
	for( var i = 1; i <= 7; ++i ) {
		html += '<tr>';
		for ( var j = Bridge.BidSuitOrder.length-1; j >= 0; --j ) {
			var suit = Bridge.BidSuitOrder[ j ];
			html += '<td><span class="badge">' + i + Bridge.getSuitName( suit ) + '</span></td>';
		}
		html += '</tr>';
	} 
	html += '<tr><td colspan="5"><button type="button" class="btn btn-primary">Pass</button></td></tr>'
	html += '<tr><td colspan="5"><button type="button" class="btn btn-primary">Double</button></td></tr>'
	html += '<tr><td colspan="5"><button type="button" class="btn btn-primary">Redouble</button></td></tr>'
	$ ( container ).empty().append( html );
	$('td').css({ cursor: 'not-allowed' });
	var table = $( '#bidding-box' );
	table.css({
		width: 'auto',
	});
};


// Create the area with pile of unassigned cards
BHG.createUnassignedArea = function() {
	var top = BHG.headerHeight + 5;
	var left = 5;
	var html = '<div id="pile" class="fixed well"></div>';
	$( BHG.container ).append( html );
	var pile = $( '#pile' );
	pile.css({
		top: top,
		left: left,
		width: BHG.containerDimensions.width,
		height: BHG.containerDimensions.height,
	});	
	
	// Show all cards in unassigned pile
	var cardTop = top + 10;
	var startingLeft = left + 5;
	var width = BHG.cardImageDimensions.width * BHG.scalingFactor;
	var height = BHG.cardImageDimensions.height * BHG.scalingFactor;	
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		var cardLeft = startingLeft;
		for( var j = 0; j < Bridge.RankOrder.length; ++j ) {
			var rank = Bridge.RankOrder[ j ];
			BHG.showCard( pile, suit, rank, cardTop, cardLeft, width, height );
			cardLeft += width * BHG.cardImageDimensions.percentageWidthShowing
		}
		cardTop += height * BHG.cardImageDimensions.percentageHeightShowing;
	}
	
	// Click handler for card click	
	$( '.card[status="not-assigned"]' ).click(function() {
		var card = this;
		BHG.assignCard( card );
	});		
};

BHG.assignCard = function( card ) {
	try {
		var direction = BHG.activeHand;
		var suit = $( card ).attr( 'suit' );
		var rank = $( card ).attr( 'rank' );	
		BHG.deal.addCard( suit, rank, direction );
		$( card ).unbind( 'click' );
		$( card ).css({
			cursor: 'not-allowed',
		});
		$( card ).attr( 'src', BHG.cardImageDimensions.folder + '/' + BHG.cardImageDimensions.cardBack ); 
		BHG.showHand( direction );
	}
	catch (err) {
		alert(err);
	}
};

// Create the assigned card pile
BHG.createAssignedArea = function() {
	var top = BHG.headerHeight + 5;
	var left = BHG.viewport.width / 2 + 2.5;
	var html = '<div id="assigned" class="fixed well"></div>'
	$( BHG.container ).append( html );
	var assigned = $( '#assigned' );
	assigned.css({
		top: top,
		left: left,
		width: BHG.containerDimensions.width,
		height: BHG.containerDimensions.height,
	});	
	assigned.html( BHG.createHandTabs() );
	// Setup handler for tab change.
	$( 'a[data-toggle="tab"]' ).on( 'shown.bs.tab', function (e) {
		var values = e.target.href.split( '#' );
		BHG.activeHand = values[ 1 ][ 0 ];
	});
};

// Setup the tabs for 4 hands
BHG.createHandTabs = function( container ) {
	if ( BHG.activeHand === undefined ) BHG.activeHand = Bridge.DirectionOrder[ 0 ];
	var html = '<ul id="hands" class="nav nav-pills">';
	for( var i = 0; i < Bridge.DirectionOrder.length; ++i ) {
		var direction = Bridge.DirectionOrder[ i ];
		if ( direction === BHG.activeHand ) html += '<li class="active">';
		else html += '<li>';
		html += '<a id="' + direction + '-hand-name" href="#' + direction + '-hand" data-toggle="tab">' + Bridge.Directions[ direction ].name + '</a></li>';
	}
	html += '</ul>';
	html += '<div id="myTabContent" class="tab-content">';
	for( var i = 0; i < Bridge.DirectionOrder.length; ++i ) {
		var direction = Bridge.DirectionOrder[ i ];
		if ( direction === BHG.activeHand ) html += '<div class="tab-pane fade in active" id="' + direction + '-hand"></div>';
		else html += '<div class="tab-pane fade" id="' + direction + '-hand"></div>';
	}
	html += '</div>';	
	return html;
};

/**
 * Calculate the image scaling factor given the image and container dimensions.
 *
 * @param {object} cardIimageDimensions the width and height of image
 * @param {object} containerDimensions the width and height of container   
 * @return {number} the minimum of width and height scaling factors
 */
BHG.calculateScalingFactor = function( cardImageDimensions, containerDimensions ) {
	// 12 cards will be stacked on top of each other. 13th will be shown fully
	var cardsWidth = 12 * cardImageDimensions.width * cardImageDimensions.percentageWidthShowing + cardImageDimensions.width;	
	// 3 rows stacked on top of each other. 4th will be shown fully
	var cardsHeight = 3 * cardImageDimensions.height * cardImageDimensions.percentageHeightShowing + cardImageDimensions.height;
	// Subtract 10 for 5 unit spacing on each side	
	var widthScalingFactor = ( containerDimensions.width - 10 ) / cardsWidth;
	var heightScalingFactor = ( containerDimensions.height - 10 ) / cardsHeight;
	return Math.min( widthScalingFactor, heightScalingFactor );
};



$(function() {
	// A new bridge deal
	BHG.deal = new Bridge.Deal();
	BHG.showHandGenerator();	
	$(window).resize(function() {	
		if ( BHG.activeState === 'set-hands' ) {
			BHG.showHandGenerator();
		}
		else if ( BHG.activeState === 'set-auction' ) {
			BHG.showAuctionGenerator();
		}
	});
});


 
 