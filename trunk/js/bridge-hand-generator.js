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
BHG.getCardID = function( suit, rank ) {
	return 'card-' + suit + rank;
};

/**
 * Shows a card at specified location with specified dimensions  
 */
BHG.showCard = function( container, suit, rank, top, left, width, height ) {
	var imageID = BHG.getCardID( suit, rank );
	var imageName = BHG.cardImageDimensions.folder + '/' + suit + rank + '.png';
	var src = imageName;
	$( container ).append( '<img id="' + imageID + '" class="fixed card" status="not-assigned"></img>' );
	var image = $( '#' + imageID );
	image.attr( 'src', src );
	image.attr( 'imageName', imageName );
	image.attr( 'status', 'not-played' );
	image.attr( 'suit', suit );
	image.attr( 'rank', rank );
	//image.attr( 'direction', direction );
	image.css({
		width: width,
		height: height,
		top: top,
		left: left,
	});	
};

/**
 * Shows the Hand Generator Area.  
 */
BHG.showHandGenerator = function() {
	
	// Calculate Scaling Factor
	var viewport = {
		width: jQuery(window).width(),
		height: jQuery(window).height(),
	};
	var headerHeight = $( '#header' ).outerHeight();
	var headerBottom = $( '#header' ).position().top + headerHeight;
	var footerTop = $( '#footer' ).position().top;		
	var containerDimensions = {
		width: ( viewport.width - 15 ) / 2,
		height: footerTop - headerBottom - 10,
	};
	var scalingFactor = BHG.calculateScalingFactor( BHG.cardImageDimensions, containerDimensions );
	
	var container = '#section';
	// Set up unassigned card pile
	BHG.createUnassignedArea( container, containerDimensions, headerHeight + 5, 5, scalingFactor );
	
	// Setup asigned card pile
	var left = viewport.width / 2 + 2.5;
	BHG.createAssignedArea( container, containerDimensions, headerHeight + 5, left, scalingFactor );
};

BHG.createUnassignedArea = function( container, containerDimensions, top, left, scalingFactor ) {
	var html = '<div id="pile" class="fixed well"></div>';
	$( container ).append( html );
	var pile = $( '#pile' );
	pile.css({
		top: top,
		left: left,
		width: containerDimensions.width,
		height: containerDimensions.height,
	});	
	
	// Show all cards in unassigned pile
	var cardTop = top + 5;
	var startingLeft = 10;
	var width = BHG.cardImageDimensions.width * scalingFactor;
	var height = BHG.cardImageDimensions.height * scalingFactor;	
	for( var i = 0; i < Bridge.CardSuitOrder.length; ++i ) {
		var suit = Bridge.CardSuitOrder[ i ];
		var cardLeft = startingLeft;
		for( var j = 0; j < Bridge.RankOrder.length; ++j ) {
			var rank = Bridge.RankOrder[ j ];
			BHG.showCard( container, suit, rank, cardTop, cardLeft, width, height );
			cardLeft += width * BHG.cardImageDimensions.percentageWidthShowing
		}
		cardTop += height * BHG.cardImageDimensions.percentageHeightShowing;
	}
	
	// Click handler for card click	
	$('.card').click(function(){
		var html = '<img src="' + $(this).attr('src') + '" width="' + $(this).attr('width') + '" height="' + $(this).attr('height') + '"></img>';
		var container = '#' + BHG.activeHand + '-hand';
		$( container ).append( html );
	});		
};

// Create the assigned card pile
BHG.createAssignedArea = function( container, containerDimensions, top, left ) {
	var html = '<div id="assigned" class="fixed well"></div>'
	$( container ).append( html );
	var assigned = $( '#assigned' );
	assigned.css({
		top: top,
		left: left,
		width: containerDimensions.width,
		height: containerDimensions.height,
	});	
	assigned.html( BHG.createHandTabs() );
	// Setup handler for tab change.
	$( 'a[data-toggle="tab"]' ).on( 'shown.bs.tab', function (e) {
		var values = e.target.href.split( '#' );
		BHG.activeHand = values[ 1 ][ 0 ];
		alert(BHG.activeHand);
	});
};

// Setup the tabs for 4 hands
BHG.createHandTabs = function( container ) {
	BHG.activeHand = Bridge.DirectionOrder[ 0 ];
	var html = '<ul id="hands" class="nav nav-pills">';
	for( var i = 0; i < Bridge.DirectionOrder.length; ++i ) {
		var direction = Bridge.DirectionOrder[ i ];
		if ( i == 0 ) html += '<li class="active">';
		else html += '<li>';
		html += '<a href="#' + direction + '-hand" data-toggle="tab">' + Bridge.Directions[ direction ].name + '</a></li>';
	}
	html += '</ul>';
	html += '<div id="myTabContent" class="tab-content">';
	for( var i = 0; i < Bridge.DirectionOrder.length; ++i ) {
		var direction = Bridge.DirectionOrder[ i ];
		if ( i == 0 ) html += '<div class="tab-pane fade in active" id="' + direction + '-hand"></div>';
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
});


 
 