var bootswatchThemes = {};
var disabled = false;
jQuery(function($) {
	$('.cell').responsiveEqualHeightGrid();	
	$( ".cards" ).click(function() {
  		$( this ).addClass( 'disabled btn-default played' ).removeClass( 'not-played btn-primary');
  		playCard( $(this).attr('hand'), $(this).attr('imageIndex') );
  		return false;
  	});
  	
  	manageColorThemes();
  	
  	$('#toggle-north-button').click(function(){
  		changeHandStatus( 'North', disabled?'enable':'disable');
		disabled = ! disabled;
  	});

});

function manageColorThemes() {
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
		bootswatchThemes['default'] = {
			'name' : 'Default',
			'cssCdn' : '//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css',
		};
		
		// Add the retreived bootswatches next
		var themes = data.themes;
		for ( var i = 0; i < themes.length; i++) {
			var themeID = themes[i].name.toLowerCase();
			bootswatchThemes[themeID] = themes[i];
			options += '<li><a class="theme-name" href="javascript:void(0);" id="' + themeID + '">';
			options += '<img width="25" height="25" src="' + themes[i].thumbnail + '" alt="' + themes[i].name + '"></img> ' + themes[i].name;
			options += '</a></li>';
		}  	
		
		// Set the dropdown
		$('#themes').html(options);	
		
		// Add click handler to switch themes
	  	$('.theme-name').click(function() {
	  		var themeID = $(this).attr('id');
	  		var stylesheet = 'http:' + bootswatchThemes[themeID].cssCdn;
	  		$.cookie( 'bootswatch_theme', JSON.stringify(bootswatchThemes[themeID]) );
	  		$('#bootswatch-theme').attr({href : stylesheet});
	  		$('#current-theme').html( bootswatchThemes[themeID].name );
	  	});		
  	});	
};

function changeHandStatus( hand, status ) {
	if ( status === 'enable' ) {
		$('[hand='+hand+'].not-played').removeClass('disabled');
	}
	else if ( status === 'disable' ) {
		$('[hand='+hand+'].not-played').addClass('disabled');
	}
}

function playCard( hand, imageIndex ) {
	//var imageName = 'images/cards/' + card.toLowerCase() + '_of_' + suit.toLowerCase() + '.png';
	var imageName = 'images/cards/' + imageIndex + '.png';
	var id = hand.toLowerCase() + '-played-card';
	$('#'+id).html('<img class="img-responsive" src="' + imageName + '"/>');
}

	