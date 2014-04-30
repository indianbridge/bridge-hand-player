$(function() {
	try {
		
		randomHandsTest();
		queryParametersTest();
	}
	catch( err ) {
		alert( err );
	}
});

function queryParametersTest() {
	$( '#output' ).append('<h2>Query Parameters Test</h2>');
	var deal = new Bridge.Deal();
	deal.parseQueryParameters();
	var outputString = deal.toString();
	$( '#output' ).append(outputString);
};

function randomHandsTest() {
	$( '#output' ).append('<h2>Random Hands Test</h2>');
	var deal = new Bridge.Deal();
	deal.assignRest();
	var outputString = deal.toString();
	$( '#output' ).append(outputString);
	deal.removeCard( 's', 'a' );
	outputString = deal.toString();
	$( '#output' ).append(outputString);
	deal.unAssignAll();
	outputString = deal.toString();
	$( '#output' ).append(outputString);
	deal.assignRest();
	outputString = deal.toString();
	$( '#output' ).append(outputString);	
};

