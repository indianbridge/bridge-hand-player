// Available card image packs
var cardImagePacks = {
	'small' : {
		folder : 'images/cards/small',
		fullWidth : 76,
		fullHeight : 92,
		cardBack: 'b1fv.png',
		percentageWidthShowing: 0.5,
		percentageHeightShowing: 0.5,
	},
};

// All the sizing and styling parameters
var Parameters = {
	scalingFactor: 1,
	cardImages: cardImagePacks[ 'small' ],
	textSize: {
		actualFontSize: 14,
	},
	manualHashChange: false,
};

function computeScaledParameters( ) {
	
	// Get viewport dimensions
	Parameters.viewport = {
		width: jQuery(window).width(),
		height: jQuery(window).height(),
	};
	Parameters.viewport.centerX = Parameters.viewport.width/2;
	Parameters.viewport.centerY = Parameters.viewport.height/2;	
	
	// Compute scaling factor
	var imageHeight = 0.152 * Parameters.viewport.height;
	var imageWidth = 0.084 * Parameters.viewport.width;
	var heightScalingFactor = imageHeight / Parameters.cardImages.fullHeight;
	var widthScalingFactor = imageWidth / Parameters.cardImages.fullWidth;
	Parameters.scalingFactor = Math.min( heightScalingFactor, widthScalingFactor );	
	
	// Card Image dimensions
	Parameters.cardImages.width = Parameters.cardImages.fullWidth * Parameters.scalingFactor;
	Parameters.cardImages.height = Parameters.cardImages.fullHeight * Parameters.scalingFactor;
	Parameters.cardImages.widthShowing = Parameters.cardImages.width * Parameters.cardImages.percentageWidthShowing;
	Parameters.cardImages.heightShowing = Parameters.cardImages.height * Parameters.cardImages.percentageHeightShowing;	
	
	// Font sizes
	Parameters.textSize.fontSize = Parameters.textSize.actualFontSize * Parameters.scalingFactor;	
};	


// Directions and utility functions for Directions
var Directions = { 
	'n' : { name : 'North',	layout : 'horizontal',	position : 'top',		index: 0 },
	'e' : { name : 'East',	layout : 'vertical',	position : 'right',		index: 1 },
	's' : { name : 'South',	layout : 'horizontal',	position : 'bottom',	index: 2 },
	'w' : { name : 'West',	layout : 'vertical',	position : 'left',		index: 3 },
};
var DirectionOrder = [ 'n', 'e', 's', 'w' ];

function getDirectionName( direction ) {
	if ( direction in Directions ) return Directions[ direction ].name;
	return 'Unknown';	
};

// an indexed array of directions in order so that we can find who is next to play
var directionNames = [];
for( var direction in Directions ) directionNames[ Directions[ direction ].index ] = direction;

// Suits and utility functions for Suits
var Suits = { 
	'n' : { name : 'NT',									index : 0 },
	's' : { name : '<font color="000000">&spades;</font>', 	index : 1 }, 
	'h' : { name : '<font color="CB0000">&hearts;</font>', 	index : 2 }, 
	'd' : { name : '<font color="CB0000">&diams;</font>',	index : 3 }, 
	'c' : { name : '<font color="000000">&clubs;</font>', 	index : 4 }, 
};
var cardSuitOrder = [ 's', 'h', 'd', 'c' ];
var bidSuitOrder = [ 'n' ];

function getSuitName( suit ) {
	if ( suit in Suits ) return Suits[ suit ].name;
	return 'Unknown';	
};

function getSuitIndex( suit ) {
	if ( suit in Suits ) return Suits[ suit ].index;
	return -1;	
}

// Ranks and utility functions for Ranks
var Ranks = { 
	'a' : { name : 'A', 	index : 0 }, 
	'k' : { name : 'K', 	index : 1 }, 
	'q' : { name : 'Q',		index : 2 }, 
	'j' : { name : 'J', 	index : 3 }, 
	't' : { name : 'T', 	index : 4 }, 
	'9' : { name : '9', 	index : 5 }, 
	'8' : { name : '8', 	index : 6 }, 
	'7' : { name : '7', 	index : 7 }, 
	'6' : { name : '6', 	index : 8 }, 
	'5' : { name : '5', 	index : 9 }, 
	'4' : { name : '4', 	index : 10 }, 
	'3' : { name : '3', 	index : 11 }, 
	'2' : { name : '2', 	index : 12 }, 
};

function getRankName( rank ) {
	if ( rank in Ranks ) return Ranks[ rank ].name;
	return 'Unknown';		
};

// an indexed array of directions in order so that we can find who is next to play
var rankNames = [];
for( var rank in Ranks ) rankNames[ Ranks[ rank ].index ] = rank;

// Show a card on screen at specified location
function showCard( container, suit, rank, top, left, width, height ) {
	var imageID = getCardID( suit, rank );
	var imageName = Parameters.cardImages.folder + '/' + suit + rank + '.png';
	var src = imageName;
	$( container ).append( '<img id="' + imageID + '" class="absolute card" status="not-assigned"></img>' );
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

function getCardID( suit, rank ) {
	return 'card-' + suit + rank;
};

function createHandTabs() {
	var html = '<ul id="hands" class="nav nav-pills">';
	for( var i = 0; i < DirectionOrder.length; ++i ) {
		var direction = DirectionOrder[ i ];
		if ( i == 0 ) html += '<li class="active">';
		else html += '<li>';
		html += '<a href="#' + direction + '-hand" data-toggle="tab">' + Directions[ direction ].name + '</a></li>';
	}
	html += '</ul>';
	html += '<div id="myTabContent" class="tab-content">';
	for( var i = 0; i < DirectionOrder.length; ++i ) {
		var direction = DirectionOrder[ i ];
		if ( i == 0 ) html += '<div class="tab-pane fade in active" id="' + direction + '-hand"></div>';
		else html += '<div class="tab-pane fade" id="' + direction + '-hand"></div>';
	}
	html += '</div>';
	return html;	
}


var activeHand = 'north';
$(function() {
	//computeScaledParameters();	
	var headerHeight = $( '#header' ).outerHeight();
	console.log( 'header height = ' + headerHeight );
	var footerHeight = $( '#footer' ).outerHeight();
	console.log( 'footer height = ' + footerHeight );
	//style = '<style> body { padding-top: ' + (headerHeight + 5) + 'px; }</style>';
	//$( style ).appendTo( "head" );
	var viewport = {
		width: jQuery(window).width(),
		height: jQuery(window).height(),
	};
	var html = '<div id="pile" class="fixed well"></div>';
	$( 'body' ).append( html );
	var pile = $( '#pile' );
	var headerBottom = $( '#header' ).position().top + headerHeight;
	var footerTop = $( '#footer' ).position().top;
	var sectionHeight = footerTop - headerBottom - 10;	
	pile.css({
		top: headerHeight + 5,
		left: 5,
		width: viewport.width / 2 - 10,
		height: sectionHeight,
	});
	html = '<div id="assigned" class="fixed well"></div>'
	$( 'body' ).append( html );
	var assigned = $( '#assigned' );
	var sectionWidth = viewport.width / 2 - 10;
	assigned.css({
		top: headerHeight + 5,
		left: viewport.width / 2 + 5,
		width: sectionWidth,
		height: sectionHeight,
	});
	assigned.html( createHandTabs() );
	console.log( 'section height = ' +  sectionHeight );
	var top = headerHeight + 10;
	var startingLeft = 10;
	var cardsWidth = 12 * Parameters.cardImages.fullWidth * Parameters.cardImages.percentageWidthShowing + Parameters.cardImages.fullWidth;
	var scalingFactor = ( sectionWidth - 10 ) / cardsWidth;
	var width = Parameters.cardImages.fullWidth * scalingFactor;
	var height = Parameters.cardImages.fullHeight * scalingFactor;
	for( var i = 0; i < cardSuitOrder.length; ++i ) {
		var suit = cardSuitOrder[ i ];
		var left = startingLeft;
		for( var j = 0; j < rankNames.length; ++j ) {
			var rank = rankNames[ j ];
			showCard( 'body', suit, rank, top, left, width, height );
			left += width * Parameters.cardImages.percentageWidthShowing
		}
		top += height * Parameters.cardImages.percentageHeightShowing;
	}
	
	
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	var values = e.target.href.split( '#' );
	activeHand = values[ 1 ];
	//alert(activeHand);
})	

$('.card').click(function(){
	var html = '<h1>' + $( this ).attr('suit') + ' ' + $( this ).attr('rank') + '; </h1>';
	alert(html);
	alert($('#'+activeHand).html());
	$('#'+activeHand).empty().append( html );
	alert($('#'+activeHand).html());
});
 });
 
 