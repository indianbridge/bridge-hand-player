jQuery(function($) {
	$('#run-scaling').click(function(){
		nIndexZoom = $('#scale').val();
		/*$('#main').css({
	        'transform'                   : 'scale('+nIndexZoom+')',
	        '-webkit-transform'           : 'scale('+nIndexZoom+')',
	        '-webkit-transform-origin'    : '0 0',
	        '-moz-transform'              : 'scale('+nIndexZoom+')',
	        '-moz-transform-origin'       : '0 0',
	        '-o-transform'                : 'scale('+nIndexZoom+')',
	        '-o-transform-origin'         : '0 0',
	        '-ms-transform'               : 'scale('+nIndexZoom+')',
	        '-ms-transform-origin'        : '0 0',
	    }); 		*/
		$('#main').css({
	        'transform'                   : 'scale('+nIndexZoom+')',
	        '-webkit-transform'           : 'scale('+nIndexZoom+')',
	        '-moz-transform'              : 'scale('+nIndexZoom+')',
	        '-o-transform'                : 'scale('+nIndexZoom+')',
	        '-ms-transform'               : 'scale('+nIndexZoom+')',
	    }); 	    
	});
});