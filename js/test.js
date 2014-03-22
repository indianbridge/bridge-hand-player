// Available card image packs
var cardImagePacks = {
	'small' : {
		folder : 'images/cards/small',
		fullWidth : 76,
		fullHeight : 92,
		cardBack: 'b1fv.png',
		percentageWidthShowing: 1,
		percentageHeightShowing: 1.25,
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

function getDirectionName( direction ) {
	if ( direction in Directions ) return Directions[ direction ].name;
	return 'Unknown';	
};

// an indexed array of directions in order so that we can find who is next to play
var directionNames = [];
for( var direction in Directions ) directionNames[ Directions[ direction ].index ] = direction;

// Suits and utility functions for Suits
var Suits = { 
	'n' : { name : 'NT',									index : 4 },
	's' : { name : '<font color="000000">&spades;</font>', 	index : 3 }, 
	'h' : { name : '<font color="CB0000">&hearts;</font>', 	index : 2 }, 
	'd' : { name : '<font color="CB0000">&diams;</font>',	index : 1 }, 
	'c' : { name : '<font color="000000">&clubs;</font>', 	index : 0 }, 
};

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
function showCard( suit, rank, top, left ) {
	var container = 'body';	
	var imageID = getCardID( suit, rank );
	var imageName = Parameters.cardImages.folder + '/' + suit + rank + '.png';
	var src = imageName;
	$( container ).append( '<img id="' + imageID + '" class="fixed card"></img>' );
	var image = $( '#' + imageID );
	image.attr( 'src', src );
	image.attr( 'imageName', imageName );
	image.attr( 'status', 'not-played' );
	image.attr( 'suit', suit );
	image.attr( 'rank', rank );
	//image.attr( 'direction', direction );
	image.css({
		width: Parameters.cardImages.width,
		height: Parameters.cardImages.height,
		top: top,
		left: left,
	});	
};

function getCardID( suit, rank ) {
	return 'card-' + suit + rank;
};



$(function() {
	var container = $( 'body' );
   	var html = '<div id="switcher" class="fixed"></div>';
   	container.append( html );
   	var switcher = $( '#switcher' );
	switcher.themeswitcher({
		imgpath: "js/images/",
		loadTheme: "cupertino"
	});
	switcher.css({
		top : 5,
		right : 5,
	});
	
	computeScaledParameters();
	// Draw cards on screen
	var top = 5;
	for ( var suit in Suits ) {
		var left = 5;
		if ( suit !== 'n' ) {
			for ( var rank in Ranks ) {
				showCard( suit, rank, top, left );
				left += Parameters.cardImages.widthShowing;
			}
			top += Parameters.cardImages.heightShowing;
		}
	}
	
 });
 
 