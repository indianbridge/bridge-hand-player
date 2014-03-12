jQuery(function($) {
	$('.cell').responsiveEqualHeightGrid();	
	$( ".cards" ).click(function() {
  		$( this ).addClass( 'disabled btn-default' ).removeClass( 'btn-primary');
  	});	
});

	