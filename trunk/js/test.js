var bootswatchThemes = {};
$(function() { 
	manageColorThemes();
});

function manageColorThemes() {
	// Retreive theme cookie if it exists and set the stylesheet accordingly
	var themeCookie = $.cookie( 'bootswatch_theme' );
	if ( themeCookie !== undefined ) {
		var theme = JSON.parse( themeCookie );
		var name = theme.name;	
		$('#bootswatch').remove();
		var html = '<link id="bootswatch" href="' + theme.cssCdn + '" rel="stylesheet">';
		$( 'head' ).append( html );
		$('#bootswatch').on( 'load', function() {
				alert('theme load');
			});				
	}
	// Populate dropdown with bootswatch themes
	$.get( "http://api.bootswatch.com/3/", function( data ) {
		// Add the default bootstrap theme first
		var options = '<li><a class="theme-name" href="javascript:void(0);" id="default">Default</a></li>';
		bootswatchThemes['default'] = {
			'name' : 'Default',
			'cssCdn' : '//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css'
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
			$.cookie( 'bootswatch_theme', JSON.stringify( bootswatchThemes[themeID]) );
			$('#bootswatch').remove();
			var html = '<link id="bootswatch" href="' + stylesheet + '" rel="stylesheet">';
			$( 'head' ).append( html );	
			$('#bootswatch').on( 'load', function() {
				alert('theme load');
			});		
		});		
	});	
};