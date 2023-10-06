$(function() {
	$('.tool').tooltip({container:'body'});
	for(var i = 0;i < presets.length; ++i) {
		var text = 'A vs B : ' + presets[i][0] + '-' + presets[i][1] + ', ';
		text += 'B vs C : ' + presets[i][2] + '-' + presets[i][3] + ', ';
		text += 'C vs A : ' + presets[i][4] + '-' + presets[i][5];
		$('#presets').append('<li><a href="javascript:void(0);" class="preset-score" index="' + i + '">' + text +'</a></li>');
	}	
	$('.preset-score').click(loadPreset);
	$('#calculate').click( calculateMetrics );
});

function loadPreset() {
	var index = $(this).attr('index');
	$('#ab').val(presets[index][0]);
	$('#ba').val(presets[index][1]);
	$('#bc').val(presets[index][2]);
	$('#cb').val(presets[index][3]);
	$('#ca').val(presets[index][4]);
	$('#ac').val(presets[index][5]);
	calculateMetrics();
}

var presets = [
	[9,1,5,0,9,8],
	[22,20,43,40,63,60],
	[5,0,4,0,5,2],
	[50,0,40,0,49,20],
	[100,80,40,30,0,0],
	[1,2,1,3,1,21]
];
var vps = [10.00, 10.36, 10.71, 11.05, 11.38, 11.70, 12.01, 12.31, 12.61, 12.9, 13.18, 13.45, 13.71, 13.97, 14.22, 14.46, 14.70, 14.93, 15.15, 15.37, 15.58, 15.79, 15.99, 16.18, 16.37, 16.55, 16.73, 16.91, 17.08, 17.24, 17.40, 17.56, 17.71, 17.86, 18.00, 18.14, 18.28, 18.41, 18.54, 18.66, 18.78, 18.90, 19.02, 19.13, 19.24, 19.34, 19.44, 19.54, 19.64, 19.74, 19.83, 19.92, 20.00];
var teamStatic = {
	'a' : { name : 'Team A', matchup : { 'b' : {won:0,lost:0, vp:0}, 'c' : {won:0,lost:0, vp:0} }, won : 0, lost : 0, net : 0, quotient : 0, root: 0, logScore: 0, vp: 0 },
	'b' : { name : 'Team B', matchup : { 'a' : {won:0,lost:0, vp:0}, 'c' : {won:0,lost:0, vp:0} }, won : 0, lost : 0, net : 0, quotient : 0, root: 0, logScore: 0, vp:0 },
	'c' : { name : 'Team C', matchup : { 'b' : {won:0,lost:0, vp:0}, 'a' : {won:0,lost:0, vp:0} }, won : 0, lost : 0, net : 0, quotient : 0, root: 0, logScore: 0, vp: 0 },		
};
var teams;

function getErrorMessage( team1, team2 ) {
	return 'Score for ' + teams[team1].name + ' against ' + teams[team2].name + ' is not a valid IMP number!';	
};

function calculateValues() {
	for(var team in teams ) {
		for( var m in teams[team].matchup ) {
			var imps = teams[team].matchup[m].won - teams[team].matchup[m].lost;
			var abs = Math.abs(imps);
			var vp = 0;
			if ( abs >= vps.length ) vp = 20.00;
			else vp = vps[abs];
			if ( imps >= 0 ) {
				teams[team].matchup[m].vp = vp;
				teams[team].vp += vp;
			}
			else {
				teams[team].matchup[m].vp = 20-vp;
				teams[team].vp += (20-vp);
			}
		}
		teams[team].net = teams[team].won - teams[team].lost;
		teams[team].quotient = teams[team].won * 1.0 / teams[team].lost;
		teams[team].root = Math.sqrt(teams[team].won) - Math.sqrt(teams[team].lost);
		teams[team].logScore = Math.log(teams[team].won) - Math.log(teams[team].lost);
	}	
};

function calculateQualifiers() {
	var scores = [];
	for(var team in teams ) {
		scores.push(teams[team]);
	}
	// By net
	scores.sort(function(team1,team2) {
		return team2.net - team1.net;
	});
	var netWinners = scores[0].name + ', ' + scores[1].name;
	$('#netwinners').html(printOrder(scores));
	
	// By quotient
	scores.sort(function(team1,team2) {
		return team2.quotient - team1.quotient;
	});
	//var quotientWinners = scores[0].name + ', ' + scores[1].name;	
	$('#quotientwinners').html(printOrder(scores));
	
	// By sqrt
	scores.sort(function(team1,team2) {
		return team2.root - team1.root;
	});
	var sqrtWinners = scores[0].name + ', ' + scores[1].name;	
	$('#sqrtwinners').html(printOrder(scores));
	
	// By log
	scores.sort(function(team1,team2) {
		return team2.logScore - team1.logScore;
	});
	var logWinners = scores[0].name + ', ' + scores[1].name;	
	$('#logwinners').html(printOrder(scores));	
	
	// By vp
	scores.sort(function(team1,team2) {
		return team2.vp - team1.vp;
	});
	var vpWinners = scores[0].name + ', ' + scores[1].name;	
	$('#vpwinners').html(printOrder(scores));		
};

function printOrder(scores) {
	return '<strong>' + scores[0].name + '</strong>' + ', ' + '<strong>' + scores[1].name + '</strong>,' + scores[2].name;
}

function calculateMetrics() {
	teams = $.extend(true, {}, teamStatic);
	var errors = [];
	var teamNames = [ 'a', 'b', 'c' ];
	for( var i = 0; i < teamNames.length; ++i) {
		for( var j = 0; j < teamNames.length; ++j) {
			var team1 = teamNames[i];
			var team2 = teamNames[j];
			if ( team1 !== team2 ){
				var matchup = team1 + team2;
				var score = parseInt($('#' + matchup).val());
				if (checkScore(score)) {
					var message = getErrorMessage(team1, team2);
					errors.push(message);
				}
				else {
					teams[team1].matchup[team2].won = score;
					teams[team1].won += score;
					teams[team2].matchup[team1].lost = score
					teams[team2].lost += score;
				}				
			}
		}
	}
	if (errors.length > 0) {
		var errorMessage = errors.join('<br/>');
		$('#modal-errors').html(errorMessage);
		$('#myModal').modal();
		return false;
	}	
	calculateValues();
	for(var team in teams ) {
		$('#' + team +'won').html(teams[team].won);
		$('#' + team +'lost').html(teams[team].lost);
		$('#' + team +'net').html(teams[team].net);
		$('#' + team +'quotient').html(teams[team].quotient);
		$('#' + team +'root').html(teams[team].root);	
		$('#' + team +'log').html(teams[team].logScore);		
		$('#' + team +'vp').html(teams[team].vp);	
	}
	calculateQualifiers();
	return false;
	
};

function checkScore(val) {
	return isNaN(val);
};