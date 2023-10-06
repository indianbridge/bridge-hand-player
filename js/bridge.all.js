"use strict";

// jQuery and Lodash are required. So check they have been loaded.
if (typeof jQuery === "undefined") {
	throw new Error("jQuery is not loaded. jQuery is required for Bridge Javascript Library to work.");
}
if (typeof _ === "undefined") {
	throw new Error("Lodash is not loaded. Lodash is required for Bridge Javascript Library to work.");
}

/**
 * Bridge Namespace
 * @namespace
 * @property {object} directions - The compass directions
 * @property {array} directionOrder - directions in order they should be presented
 * @property {object} suits - The suits of cards
 * @property {array} suitOrder - The suits in order of priority
 * @property {object} ranks - The ranks of cards
 * @property {array} rankOrder - The ranks in order of priority
 * @property {object} vulnerabilities - The list of possible vulnerabilities
 */
var Bridge = {
	directions: {
		'n': { name: 'North', lho: 'e', rho: 'w', cho: 's', index: 1, html: 'north' },
		'e': { name: 'East', lho: 's', rho: 'n', cho: 'w', index: 2, html: 'east' },
		's': { name: 'South', lho: 'w', rho: 'e', cho: 'n', index: 3, html: 'south' },
		'w': { name: 'West', lho: 'n', rho: 's', cho: 'e', index: 0, html: 'west' }
	},
	directionOrder: [],

	suits: {
		's': { name: 'Spades', index: 0, text: 'spades', html: '&spades;' },
		'h': { name: 'Hearts', index: 1, text: 'hearts', html: '&hearts;' },
		'd': { name: 'Diamonds', index: 2, text: 'diamonds', html: '&diams;' },
		'c': { name: 'Clubs', index: 3, text: 'clubs', html: '&clubs;' }
	},
	suitOrder: [],

	calls: {
		'n': { name: 'No Trump', index: 0, isStrain: true, bid: true, text: "notrump", html: 'NT' },
		's': { name: 'Spades', index: 1, isStrain: true, bid: true, text: "spades", html: '&spades;' },
		'h': { name: 'Hearts', index: 2, isStrain: true, bid: true, text: "hearts", html: '&hearts;' },
		'd': { name: 'Diamonds', index: 3, isStrain: true, bid: true, text: "diamonds", html: '&diams;' },
		'c': { name: 'Clubs', index: 4, isStrain: true, bid: true, text: "clubs", html: '&clubs;' },
		'p': { name: 'Pass', index: 5, isStrain: false, bid: false, text: "pass", html: 'p' },
		'x': { name: 'Double', index: 6, isStrain: false, bid: false, text: "double", html: 'x' },
		'r': { name: 'Redouble', index: 7, isStrain: false, bid: false, text: "redouble", html: 'xx' }
	},
	callOrder: [],

	ranks: {
		'a': { name: 'Ace', index: 0, html: 'a' },
		'k': { name: 'King', index: 1, html: 'k' },
		'q': { name: 'Queen', index: 2, html: 'q' },
		'j': { name: 'Jack', index: 3, html: 'j' },
		't': { name: 'Ten', index: 4, html: 't' },
		'9': { name: 'Nine', index: 5, html: '9' },
		'8': { name: 'Eight', index: 6, html: '8' },
		'7': { name: 'Seven', index: 7, html: '7' },
		'6': { name: 'Six', index: 8, html: '6' },
		'5': { name: 'Five', index: 9, html: '5' },
		'4': { name: 'Four', index: 10, html: '4' },
		'3': { name: 'Three', index: 11, html: '3' },
		'2': { name: 'Two', index: 12, html: '2' }
	},
	rankOrder: [],

	vulnerabilities: {
		'-': { name: 'None', index: 0, html: 'None' },
		'n': { name: 'NS', index: 0, html: 'Us' },
		'e': { name: 'EW', index: 0, html: 'Them' },
		'b': { name: 'Both', index: 0, html: 'Both' }
	}
};

/**
 * Adds a key field to enumeration (stored as an object)
 * @param {string} list - The enumeration
 * @private
 */
Bridge._addKey = function (list) {
	for (var item in list) {
		list[item].key = item;
	}
};

/**
 * Use the index field to create an array (from keys) in order of index
 * @param {string} list - The list to convert into array
 * @private
 */
Bridge._createIndexArray = function (list) {
	var returnArray = [];
	for (var item in list) {
		returnArray[list[item].index] = item;
	}
	return returnArray;
};

/**
 * Check to see if a symbol belongs to a list and throw an exception if not.
 * @param {string} element - The element whose membership is being checked
 * @param {string} list - The list whose membership is checked
 * @param {string} listName - The string name of the list whose membership is checked
 * @param {string} [context] - The context ( for example the method ) of this call
 * @private
 * @throws element does not belong to the list
 */
Bridge._checkListMembership = function (element, list, listName, context) {
	if (!_.has(list, element)) {
		var message = element + ' is not a valid ' + listName;
		Bridge._reportError(message, context);
	}
};

/**
 * Check to see if a symbol belongs to a list and return false if not
 * @param {string} element - The element whose membership is being checked
 * @param {string} list - The list whose membership is checked
 * @private
 * @return {boolean} true is element belongs, false if not
 */
Bridge._belongsTo = function (element, list) {
	return _.has(list, element);
};

/**
 * Check to see if a required argument is provided
 * @param {*} value - The reuired argument
 * @param {string} name - The name of the argument for printing
 * @param {string} [context] - The context ( for example the method ) of this call
 * @private
 * @throws {Error} required value is not specified
 */
Bridge._checkRequiredArgument = function (value, name, context) {
	if (!value && value !== '') {
		Bridge._reportError('Required argument ' + name + ' has not been specified', context);
	}
};

Bridge._addKey(Bridge.directions);
Bridge._addKey(Bridge.suits);
Bridge._addKey(Bridge.calls);
Bridge._addKey(Bridge.ranks);
Bridge._addKey(Bridge.vulnerabilities);

Bridge.directionOrder = Bridge._createIndexArray(Bridge.directions);
Bridge.suitOrder = Bridge._createIndexArray(Bridge.suits);
Bridge.callOrder = Bridge._createIndexArray(Bridge.calls);
Bridge.rankOrder = Bridge._createIndexArray(Bridge.ranks);

/**
 * Convenience enums to use instead of string/number constants.
 */
Bridge.enums = {
	directions: {
		NORTH: 'n',
		SOUTH: 's',
		EAST: 'e',
		WEST: 'w'
	},
	suits: {
		SPADES: 's',
		SPADE: 's',
		HEARTS: 'h',
		HEART: 'h',
		DIAMONDS: 'd',
		DIAMOND: 'd',
		CLUBS: 'c',
		CLUB: 'c'
	}
};

/**
 * Configuration options object.
 * Use this to store all options you might use to configure stuff.
 */
Bridge.options = {
	// Should error message include context?
	useContextInErrorMessage: false
};

/**
 * Does the first rank beat the second rank?
 * @param {string} rank1 - the first rank
 * @param {string} rank2 - the second rank
 * @return {boolean} true if rank1 is higher than rank2
 */
Bridge.isHigherRank = function (rank1, rank2) {
	return Bridge.ranks[rank1].index < Bridge.ranks[rank2].index;
};

/**
 * Is this direction North or South?
 * @param {string} direction - the direction to check
 * @return {boolean} true if direction is north or south, false otherwise.
 */
Bridge.isNorthSouth = function (direction) {
	return direction === 'n' || direction === 's';
};

/**
 * Is this direction East or west?
 * @param {string} direction - the direction to check
 * @return {boolean} true if direction is east or west, false otherwise.
 */
Bridge.isEastWest = function (direction) {
	return direction === 'e' || direction === 'w';
};

/**
 * Get the LHO of the specified direction.
 * No check is performed since it is assumed caller will check this is a valid direction.
 * @param {string} direction - the direction whose LHO is needed.
 * @return {string} the lho of specified direction
 */
Bridge.getLHO = function (direction) {
	return Bridge.directions[direction].lho;
};

/**
 * Get the LHO of the specified direction.
 * No check is performed since it is assumed caller will check this is a valid direction.
 * @param {string} direction - the direction whose LHO is needed.
 * @return {string} the lho of specified direction
 */
Bridge.getRHO = function (direction) {
	return Bridge.directions[direction].rho;
};

/**
 * Get the partner of the specified direction.
 * No check is performed since it is assumed caller will check this is a valid direction.
 * @param {string} direction - the direction whose LHO is needed.
 * @return {string} the lho of specified direction
 */
Bridge.getPartner = function (direction) {
	return Bridge.directions[direction].cho;
};

/**
 * Check if two directions are opponents.
 * No check is performed since it is assumed caller will check this is a valid direction.
 * @param {string} direction1 - the first direction
 * @param {string} direction2 - the second direction
 * @return true if direction1 and direction2 are opponents, false otherwise
 */
Bridge.areOpponents = function (direction1, direction2) {
	return Bridge.getLHO(direction1) === direction2 || Bridge.getRHO(direction1) === direction2;
};

/**
 * Check if two directions are partners.
 * No check is performed since it is assumed caller will check this is a valid direction.
 * @param {string} direction1 - the first direction
 * @param {string} direction2 - the second direction
 * @return true if direction1 and direction2 are opponents, false otherwise
 */
Bridge.arePartners = function (direction1, direction2) {
	return Bridge.getPartner(direction1) === direction2;
};

/**
 * Get the 4 directions starting from specified start direction.
 * @param {string} startDirection the optional direction to start from. Defaults to w.
 * @return {array of string} the order of directions in which bidding will/has proceed.
 **/
Bridge.getDirectionOrder = function getDirectionOrder(startDirection) {
	startDirection = startDirection || 'w';
	var directions = [];
	var direction = startDirection;
	for (var i = 0; i < 4; ++i) {
		directions.push(direction);
		direction = Bridge.getLHO(direction);
	}
	return directions;
};

/**
 * Assign a default value to variable if it is not defined.
 * @param {mixed} variable - the variable to check
 * @param {mixed} value - the default value to assign
 * @return the variable value if assigned else the default value
 */
Bridge.assignDefault = function (variable, value) {
	if (typeof variable === 'undefined') return value;
	return variable;
};

/**
 * Parse the hash in the url and return as an associative array of paramters.
 * @param {string} delimiter - any delimiter that should be stripped
 * @return {object} an associative array of parameter values
 */
Bridge.getHash = function (delimiter) {
	return Bridge._getParameters(location.hash, '#', delimiter);
};

/**
 * Parse the query string in the url and return as an associative array of paramters.
 * @param {string} delimiter - any delimiter that should be stripped
 * @return {object} an associative array of parameter values
 */
Bridge.getQuery = function (delimiter) {
	return Bridge._getQuery(document.URL, delimiter);
};

// This is just to test Bridge.getQuery since we dont want to change document.URL
Bridge._getQuery = function (text, delimiter) {
	return Bridge._getParameters(text, '?', delimiter);
};

//
// Some utilities. Internal only.
//

/**
 * Generate a random GUID like string.
 * @return {string} a random GUID string.
 */
Bridge._generateID = function (parent) {
	if (parent && parent.id) return parent.id;
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
	});
	return uuid;
};

/**
 * Parse the string and return as an associative array of parameters based on specified delimiters
 * @param {string} text - the text containing parameter values
 * @param {string} delimiter1 - the delimiter separating parameters
 * @param {string} delimiter2 - the delimiter separating parameter from value
 * @return {object} an associative array of parameter values
 */
Bridge._getParameters = function (text, delimiter1, delimiter2) {
	var values = text.split(delimiter1);
	if (values.length < 2) return {};
	var queryString = values[1];
	if (delimiter2) {
		queryString = queryString.split(delimiter2)[0];
	}
	return Bridge._parseParameterValues(queryString, '&', '=');
};

/**
 * Parse a string with parameter value entries separated by delimiters
 * into an associative array.
 * @param {string} text - the text containing parameter values
 * @param {string} delimiter1 - the delimiter separating parameters
 * @param {string} delimiter2 - the delimiter separating parameter from value
 * @return {object} an associative array of parameter value pairs
 */
Bridge._parseParameterValues = function (text, delimiter1, delimiter2) {
	delimiter1 = Bridge.assignDefault(delimiter1, '&');
	delimiter2 = Bridge.assignDefault(delimiter2, '=');
	var parameters = {};
	text = text.trim();
	if (!text) return parameters;
	var pairs = text.split(delimiter1);
	for (var i = 0; i < pairs.length; ++i) {
		var values = pairs[i].split(delimiter2);
		if (values.length < 2) parameters[values] = true;else parameters[values[0]] = values[1];
	}
	return parameters;
};

/**
 * Parse string to get text between delimiters.
 * @param {string} the text string to parse
 * @param {number} the position of starting delimiter
 * @param {string} the ending delimiter
 * @return associative array with contained text and position after ending delimiter
 */
Bridge._parseContainedText = function (text, start, delimiter, context) {
	var returnValue = {};
	returnValue.position = text.indexOf(delimiter, start);
	if (returnValue.position === -1) {
		Bridge._reportError('Ending delimiter ' + delimiter + ' not found in ' + text, context);
	}
	returnValue.text = text.slice(start + 1, returnValue.position);
	return returnValue;
};

/**
 * What to do when an error is seen?
 * Default if to throw an exception.
 * @param {string} message - The error message
 * @param {string} [context] - The context ( for example the method ) of the Error
 * @throws Error with message context + message
 */
Bridge._reportError = function (message, context) {
	if (!Bridge.options.useContextInErrorMessage) throw new Error(message);
	throw new Error((context ? context + " - " : '') + message);
};

//
// Checks on some parameters. Internal only.
//

/**
 * Check to see if direction is a valid direction
 * @param {string} direction - The direction to check
 * @param {string} [context] - The context ( for example the method ) of this call
 * @throws direction is not a valid direction
 */
Bridge._checkDirection = function (direction, context) {
	Bridge._checkListMembership(direction, Bridge.directions, 'Direction', context);
};

/**
 * Check to see if direction is a valid direction
 * @param {string} direction - The direction to check
 * @return {boolean} true if valid, false if not
 */
Bridge.isDirection = function (direction) {
	return Bridge._belongsTo(direction, Bridge.directions);
};

/**
 * Check to see if suit is a valid suit
 * @param {string} suit - The suit to check
 * @param {string} [context] - The context ( for example the method ) of this call
 * @throws suit is not a valid suit
 */
Bridge._checkSuit = function (suit, context) {
	Bridge._checkListMembership(suit, Bridge.suits, 'Suit', context);
};

/**
 * Check to see if suit is a valid suit
 * @param {string} suit - The suit to check
 * @return {boolean} true if valid, false if not
 */
Bridge.isSuit = function (suit) {
	return Bridge._belongsTo(suit, Bridge.suits);
};

/**
 * Check to see if strain is a valid strain
 * @param {string} strain - The strain to check
 * @param {string} [context] - The context ( for example the method ) of this call
 * @throws strain is not a valid suit
 */
Bridge._checkStrain = function (strain, context) {
	Bridge._checkListMembership(strain, Bridge.calls, 'Strain', context);
	if (!Bridge.calls[strain].isStrain) {
		Bridge._reportError("Strain " + strain + " is not a valid strain!", context);
	}
};

/**
 * Check if suit is a strain ( not pass double or redouble )
 * @param {string} suit - the suit of the call
 * @return true if it is a strain
 */
Bridge.isStrain = function (suit) {
	return _.has(Bridge.calls, suit) && Bridge.calls[suit].isStrain;
};

/**
 * Check to see if card is a valid card
 * @param {string} card - The card to check
 * @param {string} [context] - The context ( for example the method ) of this call
 * @throws card is not a valid card
 */
Bridge._checkCard = function (card, context) {
	if (!card || card.length !== 2) {
		Bridge._reportError("Card " + card + " does not have length 2", context);
	}
	var suit = card[0];
	Bridge._checkSuit(suit, context);
	var rank = card[1];
	Bridge._checkRank(rank, context);
};

/**
 * Check to see if card is a valid card
 * @param {string} card - The card to check
 * @return {boolean} true if valid, false if not
 */
Bridge.isCard = function (card) {
	if (!card || card.length !== 2) return false;
	var suit = card[0];
	var rank = card[1];
	return Bridge.isSuit(suit) && Bridge.isRank(rank);
};

/**
 * Check to see if suit of a call is a valid
 * @param {string} call - The call to check
 * @param {string} [context] - The context ( for example the method ) of this call
 * @throws suit is not a valid call
 */
Bridge._checkCall = function (call, context) {
	Bridge._checkListMembership(call, Bridge.calls, 'Call', context);
};

/**
 * Check to see if suit of a call is a valid
 * @param {string} call - The call to check
 * @return {boolean} true if valid, false if not
 */
Bridge.isCall = function (call) {
	return Bridge._belongsTo(call, Bridge.calls);
};

/**
 * Check to see if level of a call is valid
 * @param {string} level - The level to check
 * @param {string} [context] - The context ( for example the method ) of this call
 * @throws level is not a valid level
 */
Bridge._checkLevel = function (level, context) {
	var levelNum = parseInt(level);
	if (isNaN(levelNum) || String(levelNum) !== String(level) || levelNum < 1 || levelNum > 7) {
		Bridge._reportError(level + ' is not a valid level', context);
	}
};

/**
 * Check to see if level of a call is valid
 * @param {string} level - The level to check
 * @return {boolean} true if valid, false if not
 */
Bridge.isLevel = function (level) {
	var levelNum = parseInt(level);
	if (isNaN(levelNum) || String(levelNum) !== String(level) || levelNum < 1 || levelNum > 7) {
		return false;
	}
	return true;
};

/**
 * Check to see if bid is valid
 * @param {string} bid - the bid as single character or 2 characters
 * @param {string} [context] - The context ( for example the method ) of this call
 * @throws bid is not a valid bid
 */
Bridge._checkBid = function (bid, context) {
	if (bid.length < 1 || bid.length > 2) {
		Bridge._reportError("Bid " + bid + " does not have length 1 or 2", context);
	}
	if (bid.length === 1) {
		var suit = bid[0];
		Bridge._checkCall(suit, context);
		if (Bridge.isStrain(suit)) {
			Bridge._reportError("Invalid bid " + bid, context);
		}
		return;
	}
	var level = bid[0];
	var suit = bid[1];
	Bridge._checkCall(suit, context);
	if (!Bridge.isStrain(suit)) {
		Bridge._reportError("Invalid bid " + bid, context);
	}
	Bridge._checkLevel(level, context);
};

/**
 * Check to see if bid is valid
 * @param {string} bid - the bid as single character or 2 characters
 * @return {boolean} true if valid, false if not
 */
Bridge.isBid = function (bid) {
	if (bid.length < 1 || bid.length > 2) {
		return false;
	}
	if (bid.length === 1) {
		var suit = bid[0];
		return Bridge.isCall(suit) && !Bridge.isStrain(suit);
	}
	var level = bid[0];
	var suit = bid[1];
	return Bridge.isLevel(level) && Bridge.isCall(suit) && Bridge.isStrain(suit);
};

/**
 * Check to see if rank is a valid rank
 * @param {string} rank - The rank to check
 * @param {string} [context] - The context ( for example the method ) of this call
 * @throws rank is not a valid rank
 */
Bridge._checkRank = function (rank, context) {
	Bridge._checkListMembership(rank, Bridge.ranks, 'Rank', context);
};

/**
 * Check to see if rank is a valid rank
 * @param {string} rank - The rank to check
 * @return {boolean} true if valid, false if not
 */
Bridge.isRank = function (rank) {
	return Bridge._belongsTo(rank, Bridge.ranks);
};

/**
 * Check to see if vulnerability is a valid vulnerability
 * @param {string} vulnerability - The vulnerability to check
 * @param {string} [context] - The context ( for example the method ) of this call
 * @throws vulnerability is not a valid vulnerability
 */
Bridge._checkVulnerability = function (vulnerability, context) {
	Bridge._checkListMembership(vulnerability, Bridge.vulnerabilities, 'Vulnerability', context);
};

/**
 * Check to see if vulnerability is a valid vulnerability
 * @param {string} vulnerability - The vulnerability to check
 * @return {boolean} true if valid, false if not
 */
Bridge.isVulnerability = function (vulnerability) {
	return Bridge._belongsTo(vulnerability, Bridge.vulnerabilities);
};

/**
 * Utility to check if array has the specified element.
 * @param {array} items - the array to check
 * @param {number} index - the index to check for existence
 * @param {string} [context] - The context ( for example the method ) of this call
 * @throws items does not have index
 */
Bridge._checkIndex = function (items, index, context) {
	if (index >= items.length) {
		Bridge._reportError("array does not have item at index " + index, context);
	}
};

/**
 * Maintains a list of unique IDs and generates a new (unique) one on demand.
 */
Bridge.IDManager = new function () {
	this.IDs = {};
	/**
  * Generate a new ID.
  * Check if an id exists and throw an exception if it does
  * @param {string} id - a string identifier.
  * @return {string} a new id if none already specified.
  * @throws id already exists
  */
	this.generateID = function (id) {
		if (!id) {
			var date = new Date();
			var base_id = date.toJSON();
			id = this.makeIdentifier_(base_id);
			var counter = 1;
			while (id in this.IDs) {
				id = this.makeIdentifier_(base_id + '-' + counter);
				counter++;
			}
			this.IDs[id] = true;
			return id;
		}
		var prefix = "In Bridge.IDManager.generateID";
		if (id in this.IDs) {
			Bridge._reportError(id + " is an already existing ID.", prefix);
		}
		return id;
	};

	/**
  * Convert text to a valid identifier.
  * @param {string} text - the text to make an identifier
  * @return {string} the text stripped of invalid id characters
  */
	this.makeIdentifier_ = function (text) {
		return text.trim().replace(/[^a-zA-Z0-9]+/g, '_');
	};
}();

/**
 * Rudimentary logging mechanism.
 */
Bridge.logging = new function () {
	this.enabled = {
		"event": true,
		"debug": true,
		"info": true,
		"error": true,
		"warn": true
	};
	this.enable = function (logClass) {
		this[logClass] = true;
	};
	this.disable = function () {
		this[logClass] = false;
	};
	this.log = function (message, logClass) {
		if (logClass in this.enabled && this.enabled[logClass]) {
			var fullMessage = logClass ? logClass + " : " + message : message;
			if (window.console) console.log(fullMessage);
		}
	};
	this.event = function (message) {
		var logClass = "event";
		if (logClass in this.enabled && this.enabled[logClass]) {
			if (window.console) console.debug("Event - " + message);
		}
	};
	this.debug = function (message) {
		var logClass = "debug";
		if (logClass in this.enabled && this.enabled[logClass]) {
			if (window.console) console.debug(message);
		}
	};
	this.info = function (message) {
		var logClass = "info";
		if (logClass in this.enabled && this.enabled[logClass]) {
			if (window.console) console.info(message);
		}
	};
	this.error = function (message) {
		var logClass = "error";
		if (logClass in this.enabled && this.enabled[logClass]) {
			if (window.console) console.error(message);
		}
	};
	this.warn = function (message) {
		var logClass = "warn";
		if (logClass in this.enabled && this.enabled[logClass]) {
			if (window.console) console.warn(message);
		}
	};
}();

/**
 * Defines Deal class and all methods associated with it.
 */

// Get Namespace.
var Bridge = Bridge || {};

/**
 * Creates a new Bridge Deal.
 * @constructor
 * @memberof Bridge
 */
Bridge.Deal = function (id) {

	/**
  * Optional Unique id to identify this deal.
  * @member {string}
  */
	this.id = Bridge.IDManager.generateID(id);

	/**
  * The type of this object.
  * @member {string}
  */
	this.type = "Deal";

	/**
  * The 52 card objects
  * @member {object}
  */
	this.cards = {};
	for (var suit in Bridge.suits) {
		this.cards[suit] = {};
		for (var rank in Bridge.ranks) {
			this.cards[suit][rank] = new Bridge.Card(suit, rank);
		}
	}

	/**
  * The 4 hands in this deal
  * @member {object}
  */
	this.hands = {};
	for (var direction in Bridge.directions) {
		this.hands[direction] = new Bridge.Hand(direction, this);
	}

	/**
  * The dealer of this deal.
  * @member {string}
  */
	this.dealer = 'n';
	/**
  * The auction associated with this deal.
  * @member {object}
  */
	this.auction = new Bridge.Auction(this);

	/**
  * The play associated with this deal
  * @member {object}
  */
	this.play = new Bridge.Play(this);

	// callbacks to called when things change.
	this.callbacks = {
		"": []
	};

	// Initialize default values.
	this.init();
};

/**
 * Setup default values for all properties.
 */
Bridge.Deal.prototype.init = function init() {
	this.eventTriggersEnabled = false;
	/** The currently active hand. */
	this.setActiveHand('n');

	/**
  * The board number of this deal.
  * @member {number}
  */
	this.setBoard(1);

	/**
  * The vulnerability of this deal.
  * @member {string}
  */
	this.setVulnerability('-');

	/**
  * The form of scoring for this deal.
  * @member {string}
  */
	this.setScoring("KO");

	/**
  * The type of problem (if any) this deal is about.
  * @member {string}
  */
	this.setProblemType("Bidding");

	/**
  * Any notes associated with this deal.
  * @member {string}
  */
	this.setNotes("");
	this.eventTriggersEnabled = true;
};

// Register a callback.
Bridge.Deal.prototype.registerCallback = function (callback, operation) {
	operation = operation || "";
	if ($.isArray(operation)) {
		var self = this;
		_.each(operation, function (op) {
			self.addCallback(callback, op);
		});
		return;
	}
	this.addCallback(callback, operation);
};

// Add a callback.
Bridge.Deal.prototype.addCallback = function addCallback(callback, operation) {
	if (!(operation in this.callbacks)) {
		this.callbacks[operation] = [];
	}
	this.callbacks[operation].push(callback);
};

//
// Getters and Setters
//

/**
 * Get the hand for the specified direction
 * @param {string} direction - the direction whose hand is needed
 * @return {object} the hand object.
 */
Bridge.Deal.prototype.getHand = function (direction) {
	Bridge._checkDirection(direction);
	return this.hands[direction];
};

/**
 * Get the active hand of this deal.
 * @return {string} the active hand.
 */
Bridge.Deal.prototype.getActiveHand = function () {
	return this._activeHand;
};

/**
 * Set the active hand for this deal.
 * @param {string} direction - the active hand
 */
Bridge.Deal.prototype.setActiveHand = function setActiveHand(direction) {
	if (_.isObject(direction)) {
		direction = direction.direction;
	}
	Bridge._checkDirection(direction);
	if (this.getActiveHand()) {
		this.getHand(this.getActiveHand()).makeInactive();
	}
	this._activeHand = direction;
	this.getHand(direction).makeActive();
	this.onChange("setActiveHand", direction);
};

/**
 * Get the board number of this deal.
 * @return {number} the board number.
 */
Bridge.Deal.prototype.getBoard = function () {
	return this.board;
};

/**
 * Set the board number for this deal.
 * @param {string|number} board - the board number as a string or number
 */
Bridge.Deal.prototype.setBoard = function (board) {
	var boardNum = parseInt(board);
	if (isNaN(boardNum) || String(boardNum) !== String(board) || boardNum < 1) {
		Bridge._reportError(board + " is not a valid board number", "In setBoard");
	}
	this.board = boardNum;
	this.onChange("setBoard", this.board);
};

/**
 * Get the dealer of this deal.
 * @return {string} the dealer.
 */
Bridge.Deal.prototype.getDealer = function () {
	return this.dealer;
};

/**
 * Set the dealer for this deal.
 * @param {string} dealer - the dealer
 */
Bridge.Deal.prototype.setDealer = function (dealer) {
	if (_.isObject(dealer)) {
		dealer = dealer.dealer;
	}
	dealer = dealer.toLowerCase();
	Bridge._checkDirection(dealer);
	while (this.getDealer() !== dealer) {
		this.rotateClockwise();
	}
	//On change event will be generated by auction.
};

/**
 * Get the vulnerability of this deal.
 * @return {string} the vulnerability.
 */
Bridge.Deal.prototype.getVulnerability = function () {
	return this.vulnerability;
};

/**
 * Set the vulnerability for this deal.
 * @param {string} vulnerability - the vulnerability
 */
Bridge.Deal.prototype.setVulnerability = function (vulnerability) {
	if (_.isObject(vulnerability)) {
		vulnerability = vulnerability.vulnerability;
	}
	vulnerability = vulnerability.toLowerCase();
	if (vulnerability === "0") vulnerability = "-";
	Bridge._checkVulnerability(vulnerability);
	this.vulnerability = vulnerability;
	this.getAuction().setVulnerability(vulnerability);
	//On change event will be generated by auction.
};

/**
 * Get the scoring of this deal.
 * @return {string} the scoring.
 */
Bridge.Deal.prototype.getScoring = function () {
	return this.scoring;
};

/**
 * Set the scoring for this deal.
 * @param {string} scoring - the scoring
 */
Bridge.Deal.prototype.setScoring = function (scoring) {
	if (_.isObject(scoring)) {
		scoring = scoring.scoring;
	}
	Bridge._checkRequiredArgument(scoring);
	this.scoring = scoring;
	this.onChange("setScoring", scoring);
};

/**
 * Get the problem type of this deal.
 * @return {string} the problem type.
 */
Bridge.Deal.prototype.getProblemType = function () {
	return this.problemType;
};

/**
 * Set the problem type for this deal.
 * @param {string} problemType - the problem type
 */
Bridge.Deal.prototype.setProblemType = function (problemType) {
	if (_.isObject(problemType)) {
		problemType = problemType.type;
	}
	Bridge._checkRequiredArgument(problemType);
	this.problemType = problemType;
	this.onChange("setProblemType", problemType);
};

/**
 * Set a unique id
 * @param {string} id - a unique identifier
 */
Bridge.Deal.prototype.setID = function (id) {
	Bridge._checkRequiredArgument(id);
	this.id = id;
};

/**
 * Get the unique id
 * @return {string} the id in string format
 */
Bridge.Deal.prototype.getID = function () {
	return this.id;
};

/**
 * Get the notes of this deal.
 * @return {string} the notes.
 */
Bridge.Deal.prototype.getNotes = function () {
	return this.notes;
};

/**
 * Set the notes for this deal.
 * @param {string} notes - the notes
 */
Bridge.Deal.prototype.setNotes = function (notes) {
	Bridge._checkRequiredArgument(notes);
	this.notes = notes;
	this.onChange("setNotes", notes);
};

/**
 * Get the auction associated with this deal
 * @return {object} the auction object
 */
Bridge.Deal.prototype.getAuction = function () {
	return this.auction;
};

/**
 * Get the play associated with this deal
 * @return {object} the play object
 */
Bridge.Deal.prototype.getPlay = function () {
	return this.play;
};

/**
 * Add a card to specified hand.
 * @param {Object} parameters the object containing direction, suit and rank for adding card.
 */
Bridge.Deal.prototype.addCard = function (parameters) {
	this.getHand(parameters.direction).addCard(parameters.suit, parameters.rank);
};

/**
 * Remove a card from specified hand.
 * @param {Object} parameters the object containing direction, suit and rank for adding card.
 */
Bridge.Deal.prototype.removeCard = function (parameters) {
	this.getHand(parameters.direction).removeCard(parameters.suit, parameters.rank);
};

/**
 * Check if a direction is vulnerable.
 */
Bridge.Deal.prototype.isVulnerable = function (direction) {
	Bridge._checkDirection(direction);
	var vul = this.getVulnerability();
	return vul === 'b' || vul === direction || vul === Bridge.getPartner(direction);
};

/**
 * Rotate the deal clockwise.
 * North hand is moved to East, East to South and so on.
 * Auction is also adjusted accordingly.
 */
Bridge.Deal.prototype.rotateClockwise = function (parameters) {
	parameters = parameters || {};
	_.defaults(parameters, {
		"rotateHands": false,
		"rotateVulnerability": true,
		"rotateDealer": true,
		"rotateAuction": true
	});
	// Rotate Hands.
	var directions = {
		'n': 'e',
		'e': 's',
		's': 'w',
		'w': 'n'
	};
	// Rotate hands if asked.
	if (parameters["rotateHands"]) {
		var hands = {};
		for (var direction in directions) {
			var hand = this.getHand(direction);
			hands[direction] = hand.getHand();
			hand.clearCards();
		}
		for (var direction in directions) {
			this.getHand(directions[direction]).setHand(hands[direction]);
		}
	}
	// Rotate Vulnerability if asked.
	if (parameters["rotateVulnerability"]) {
		var rotateVulnerabilities = {
			'-': '-',
			'n': 'e',
			'e': 'n',
			'b': 'b'
		};
		this.setVulnerability(rotateVulnerabilities[this.getVulnerability()]);
	}
	// Rotate dealer if asked.
	if (parameters["rotateDealer"]) {
		var newDealer = Bridge.getLHO(this.getDealer());
		this.dealer = newDealer;
	}

	// Rotate auction if asked.
	if (parameters["rotateAuction"]) {
		var auction = this.getAuction();
		auction.rotateClockwise();
	}
};

/**
 * Set a property in this deal.
 * The properties that can be set are as follows<br/>
 * board - number - board number<br/>
 * vulnerability - character [ - n e b ] - the vulnerability<br/>
 * dealer - character [ n e s w ] - the dealer <br/>
 * scoring - string the scoring type for this deal in free format <br/>
 * notes - string - Any notes for this deal <br/>
 * @param {string} property - the property whose value should be set
 * @param {*} value - the value to set for property
 */
Bridge.Deal.prototype.set = function (property, value) {
	var prefix = "In Bridge.Deal.prototype.set";
	Bridge._checkRequiredArgument(property, "Property", prefix);
	Bridge._checkRequiredArgument(value, "Value for Property " + property, prefix);
	switch (property) {
		case "board":
			this.setBoard(value);
			break;
		case "vulnerability":
			this.setVulnerability(value);
			break;
		case "dealer":
			this.setDealer(value);
			break;
		case "scoring":
			this.setScoring(value);
			break;
		case "problemType":
			this.setProblemType(value);
			break;
		case "notes":
			this.setNotes(value);
			break;
		case "id":
			this.setID(value);
		default:
			Bridge._reportError("Unknown deal property " + property, prefix);
	}
};

/**
 * Get value of a property .
 * See {@link Bridge.Deal#set} for list of properties
 * @param {string} property - the property to get
 * @return {*} the value of requested property
 */
Bridge.Deal.prototype.get = function (property) {
	var prefix = "In Bridge.Deal.prototype.get - ";
	Bridge._checkRequiredArgument(property, "Property", prefix);
	switch (property) {
		case "board":
			return this.getBoard();
		case "vulnerability":
			return this.getVulnerability();
		case "dealer":
			return this.getDealer();
		case "scoring":
			return this.getScoring();
		case "problemType":
			return this.getProblemType();
		case "notes":
			return this.getNotes();
		case "auction":
			return this.getAuction();
		case "play":
			return this.getPlay();
		case "id":
			return this.getID();
		default:
			Bridge._reportError("Unknown deal property " + property, prefix);
	}
};

/**
 * Assign the rest of the unassigned cards.
 */
Bridge.Deal.prototype.assignRest = function () {
	/** Get the unassigned cards and shuffle them. */
	var unassigned = [];
	for (var suit in Bridge.suits) {
		for (var rank in Bridge.ranks) {
			if (!this.cards[suit][rank].isAssigned()) {
				unassigned.push(suit + rank);
			}
		}
	}
	if (_.isEmpty(unassigned)) return;
	unassigned = _.shuffle(unassigned);
	var assignedCardCount = 0;
	var direction = "n";
	var fullDirection = null;
	_.each(unassigned, function (card) {
		while (this.getHand(direction).getCount() === 13) {
			if (!fullDirection) fullDirection = direction;
			direction = Bridge.getLHO(direction);
			if (fullDirection === direction) {
				Bridge._reportError("Unable to assign remaining cards");
			}
		}
		this.getHand(direction).addCard(card[0], card[1]);
	}, this);
	this.onChange("assignRest", unassigned);
};

/**
 * Load this deal from BBO Handviewer like string format
 * @param {string} deal - the deal in string format
 */
Bridge.Deal.prototype.fromString = function (deal) {
	var parameters = {};
	_.each(deal.split('&'), function (pairs) {
		var values = pairs.split('=');
		parameters[values[0]] = decodeURIComponent(values[1]);
	});
	var numHandsSpecified = 0;
	_.each(parameters, function (value, key) {
		switch (key) {
			case 'b':
				this.set('board', value);
				break;
			case 'd':
				this.set('dealer', value);
				break;
			case 'v':
				this.set('vulnerability', value);
				break;
			case 't':
				this.set('notes', value);
				break;
			case 'a':
				var auction = this.getAuction();
				if (value[0] === '-') {
					auction.setContract(value.slice(1));
				} else {
					auction.setAuction(value);
				}
				break;
			case 'p':
				this.getPlay().fromString(value);
				break;
			case 'n':
			case 'e':
			case 's':
			case 'w':
				var hand = this.getHand(key);
				hand.setHand(value);
				if (hand.getCount() === 13) {
					numHandsSpecified++;
				}
				break;
			case 'nn':
			case 'en':
			case 'sn':
			case 'wn':
				var hand = this.getHand(key[0]);
				hand.setName(value);
				break;
			default:
				break;
		}
	}, this);
	if (numHandsSpecified === 3) {
		this.assignRest();
	}
	// Set up trump and leader for play
	this.getPlay().initialize();
	// Load the play after auction.
	_.each(parameters, function (value, key) {
		switch (key) {
			case 'p':
				this.getPlay().fromString(value);
				break;
			default:
				break;
		}
	}, this);
	this.onChange("setDeal", deal);
};

/**
 * Generate a string display of this deal.
 * @param {boolean} should expanded format used by Bridge Hand Player be used?
 * @return {string} string representation of this deal.
 */
Bridge.Deal.prototype.toString = function (expandedFormat) {
	expandedFormat = Bridge.assignDefault(expandedFormat, false);
	var output = "";
	var items = [];
	if (this.board) items.push("b=" + this.getBoard());
	if (this.dealer) items.push("d=" + this.getDealer());
	if (this.vulnerability) items.push("v=" + this.getVulnerability());
	if (expandedFormat && this.notes) items.push("t=" + this.getNotes());
	for (var direction in Bridge.directions) {
		var hand = this.getHand(direction);
		var handString = hand.toString();
		if (hand) items.push(direction + "=" + hand);
		items.push(direction + "n=" + hand.getName());
	};
	var auctionString = this.getAuction().toString();
	if (auctionString) items.push("a=" + auctionString);
	var playString = this.getPlay().toString();
	if (playString) items.push("p=" + playString);
	return items.join("&");
};

/**
 * Generate a JSON representation of this deal.
 * @return {object} json representation of this deal.
 */
Bridge.Deal.prototype.toJSON = function () {
	var output = {};
	output.version = "1.0";
	var fields = ['board', 'dealer', 'vulnerability', 'scoring', 'problemType', 'notes'];
	_.each(fields, function (field) {
		output[field] = this.get(field);
	}, this);
	output.hands = {};
	for (var direction in Bridge.directions) {
		var hand = this.getHand(direction);
		output.hands[direction] = hand.toJSON();
	};
	output.auction = this.getAuction().toJSON();
	output.play = this.getPlay().toJSON();
	return output;
};

/**
 * Load the deal from a json representation
 * @param {object} the json representation of this deal.
 */
Bridge.Deal.prototype.fromJSON = function (json) {
	var fields = ['board', 'dealer', 'vulnerability', 'scoring', 'problemType', 'notes'];
	_.each(fields, function (field) {
		if (_.has(json, field)) this.set(field, json[field]);
	}, this);
	if (_.has(json, "hands")) {
		for (var direction in Bridge.directions) {
			if (_.has(json.hands, direction)) {
				var hand = this.getHand(direction);
				hand.fromJSON(json.hands[direction]);
			}
		};
	}
	if (_.has(json, "auction")) this.getAuction().fromJSON(json.auction);
	// Set up trump and leader for play
	this.getPlay().initialize();
	if (_.has(json, "play")) this.getPlay().fromJSON(json.play);
	this.onChange("setDeal", this.toString());
};

/**
 * Load the deal from BBO lin representation
 * @param {string} the lin representation of deal
 */
Bridge.Deal.prototype.fromLIN = function (lin) {
	var prefix = "In Bridge.Deal.fromLin - ";
	var tokens = lin.split('|');
	var directions = ['s', 'w', 'n', 'e'];
	for (var i = 0; i < tokens.length; ++i) {
		if (_.startsWith(tokens[i].toLowerCase(), "board")) {
			this.setBoard(tokens[i].trim().slice(5).trim());
		}
		switch (tokens[i].toLowerCase()) {
			case "pn":
				Bridge._checkIndex(tokens, i + 1, prefix + "processing pn - ");
				var names = tokens[i + 1].split(',');
				for (var j = 0; j < directions.length; ++j) {
					if (j < names.length) {
						var direction = directions[j];
						var name = names[j];
						if (_.startsWith(name, "~~")) name = "Robot";
						this.getHand(direction).setName(name);
					}
				}
				break;
			case "md":
				Bridge._checkIndex(tokens, i + 1, prefix + "processing md - ");
				var hands = tokens[i + 1].split(',');
				var directionNumbers = {
					'1': 's',
					'2': 'w',
					'3': 'n',
					'4': 'e'
				};
				var dealer = directionNumbers[hands[0][0]];
				this.setDealer(dealer);
				var hand = hands[0].slice(1);
				var direction = 's';
				this.getHand(direction).setHand(hand);
				for (var j = 1; j < hands.length; ++j) {
					var direction = Bridge.getLHO(direction);
					var hand = hands[j];
					this.getHand(direction).setHand(hand);
				}
				this.assignRest();
				break;
			case "mb":
				Bridge._checkIndex(tokens, i + 1, prefix + "processing mb - ");
				var bid = tokens[i + 1].split("!")[0].slice(0, 2).toLowerCase();
				if (bid === 'd') bid = 'x';
				var annotation = null;
				if (i + 2 < tokens.length && tokens[i + 2].toLowerCase() === "an") {
					var annotation = tokens[i + 3];
					annotation = annotation.replace('(', '');
					annotation = annotation.replace(')', '');
				}
				this.getAuction().addCall(bid, null, annotation);
				break;
			case "sv":
				Bridge._checkIndex(tokens, i + 1, prefix + "processing sv - ");
				var vulnerability = tokens[i + 1];
				if (vulnerability === 'o') vulnerability = '-';
				this.setVulnerability(vulnerability);
			default:
				break;
		}
	}
	// Set up trump and leader for play
	this.getPlay().initialize();
	// Load the play after auction.
	for (var i = 0; i < tokens.length; ++i) {
		if (_.startsWith(tokens[i].toLowerCase(), "board")) {
			this.setBoard(tokens[i].trim().slice(5).trim());
		}
		switch (tokens[i].toLowerCase()) {
			case "pc":
				Bridge._checkIndex(tokens, i + 1, prefix + "processing pc - ");
				var play = tokens[i + 1].slice(0, 2);
				this.getPlay().addCard(play[0], play[1]);
				break;
			default:
				break;
		}
	}
	this.onChange("setDeal", this.toString());
};

Bridge.Deal.prototype.runCallbacks = function runCallbacks(operation, parameter) {
	if (operation in this.callbacks) {
		_.each(this.callbacks[operation], function (callback) {
			callback(operation, parameter);
		});
	}
	_.each(this.callbacks[""], function (callback) {
		callback(operation, parameter);
	});
};

/**
 * Something in this deal has changed.
 * Run callbacks.
 */
Bridge.Deal.prototype.onChange = function (operation, parameter) {
	this.runCallbacks(operation, parameter);
};

/**
 * Defines Card class and all methods associated with it.
 */

// Get Namespace.
var Bridge = Bridge || {};

/**
 * Creates a new Bridge Card.
 * @constructor
 * @memberof Bridge
 * @param {string} suit - the suit of this card
 * @param {string} rank - the rank of this card
 */
Bridge.Card = function (suit, rank) {
	var prefix = "In Bridge.Card constructor";

	// Suit
	Bridge._checkSuit(suit);
	this.suit = suit;

	// Rank
	Bridge._checkRank(rank);
	this.rank = rank;

	this.direction = null;

	// Has this card been played
	this.played = false;
};

// 
// Getters and Setters

/**
 * Get the suit of this card
 * @return {string} the suit
 */
Bridge.Card.prototype.getSuit = function () {
	return this.suit;
};

/**
 * Get the rank of this card
 * @return {string} the rank
 */
Bridge.Card.prototype.getRank = function () {
	return this.rank;
};

/**
 * Get the direction that has this card
 * @return {string} direction of hand that has this card
 */
Bridge.Card.prototype.getDirection = function () {
	return this.direction;
};

/**
 * Set the direction that has this card
 * @param {string} direction of hand that has this card
 */
Bridge.Card.prototype.setDirection = function (direction) {
	Bridge._checkDirection(direction);
	this.direction = direction;
};

/**
 * Assign this card to a direction.
 * @param {string} direction of hand that has this card
 */
Bridge.Card.prototype.assign = function (direction) {
	this.setDirection(direction);
};

/**
 * Unassign this card.
 */
Bridge.Card.prototype.unAssign = function () {
	this.direction = null;
};

/** 
 * Is this card assigned to a direction?
 * @return {boolean} true if card is assigned to a direction, false otherwise
 */
Bridge.Card.prototype.isAssigned = function () {
	return this.direction !== null;
};

/**
 * Play this card
 * @param {string} direction - whose turn is to play
 */
Bridge.Card.prototype.play = function (direction) {
	var prefix = "In Card.play";
	if (!this.direction) {
		Bridge._reportError("Cannot play card : " + this.getSuit() + this.getRank() + " since it is not assigned to any direction", prefix);
	}
	if (direction !== this.direction) {
		Bridge._reportError("Cannot play card : " + this.getSuit() + this.getRank() + " since it is does not belong to " + direction, prefix);
	}
	if (this.played) {
		Bridge._reportError("Cannot play card : " + this.getSuit() + this.getRank() + " since it is already played", prefix);
	}
	this.played = true;
};

/**
 * Get a property from card.
 * The properties that can be got are as follows<br/>
 * suit - string - the suit of this card<br/>
 * rank - string - the rank of this card<br/>
 * direction - string - direction of hand that played this card<br/>
 * @param {string} property - the property to get
 */
Bridge.Card.prototype.get = function (property) {
	var prefix = "In Card.get";
	Bridge._checkRequiredArgument(property, "Property", prefix);
	switch (property) {
		case "suit":
			return this.getSuit();
			break;
		case "rank":
			return this.getRank();
			break;
		case "direction":
			return this.getDirection();
			break;
		default:
			Bridge._reportError("Unknown property " + property, prefix);
	}
};

/**
 * Set a property in this card.
 * The properties that can be set are as follows<br/>
 * direction - string - direction of hand that played this card<br/>
 * @param {string} property - the property to set
 * @param {string} value - the value to set the property to
 */
Bridge.Card.prototype.set = function (property, value) {
	var prefix = "In Card.set";
	Bridge._checkRequiredArgument(property, "Property", prefix);
	Bridge._checkRequiredArgument(value, "Value for Property " + property, prefix);
	switch (property) {
		case "direction":
			return this.setDirection(value);
			break;
		default:
			Bridge._reportError("Unknown property " + property, prefix);
	}
};

/**
 * Generate a string display of this card.
 * @return {string} string representation of this card.
 */
Bridge.Card.prototype.toString = function () {
	return this.suit + this.rank;
};

/**
 * Defines Hand class and all methods associated with it.
 */

// Get Namespace.
var Bridge = Bridge || {};

/**
 * Creates a new Bridge Hand.
 * @constructor
 * @memberof Bridge
 * @param {string} direction - The direction this hand is sitting
 * @param {object} [deal] - the optional deal that this hand belongs to
 */
Bridge.Hand = function (direction, deal) {
	Bridge._checkDirection(direction);

	/**
  * The deal that this hand belongs to.
  * @member {object}
  */
	this.deal = deal;
	this.parent = deal;

	/**
  * Optional Unique id to identify this hand.
  * @member {string}
  */
	this.id = deal ? deal.id : Bridge.IDManager.generateID();

	/**
  * The type of this object.
  * @member {string}
  */
	this.type = "Hand";

	/**
  * The direction of this hand
  * @member {string}
  */
	this.direction = direction;

	/**
  * The name of person holding this hand
  * @member {string}
  */
	this.name = Bridge.directions[direction].name;

	/**
  * The actual cards in this hand
  * @member {object}
  */
	this.cards = {};
	for (var suit in Bridge.suits) {
		this.cards[suit] = {};
		for (var rank in Bridge.ranks) {
			this.cards[suit][rank] = false;
		}
	}

	/**
  * Whether the card should be show as x or not
  */
	this.showAsX = {};
	for (var suit in Bridge.suits) {
		this.showAsX[suit] = {};
		for (var rank in Bridge.ranks) {
			this.showAsX[suit][rank] = false;
		}
	}

	/**
  * The number of cards this hand has
  * @member {number}
  */
	this.numCards = { "all": 0 };
	for (var suit in Bridge.suits) {
		this.numCards[suit] = 0;
	} /** Is this the active hand? */
	this._isActive = false;

	/** A card that has been selected to be played if any. */
	this.selectedCard = null;

	// callbacks to called when things change.
	this.callbacks = {
		"": []
	};
};

// Register a callback.
Bridge.Hand.prototype.registerCallback = function (callback, operation) {
	operation = operation || "";
	if (!(operation in this.callbacks)) {
		this.callbacks[operation] = [];
	}
	this.callbacks[operation].push(callback);
};

Bridge.Hand.prototype.setSelectedCard = function selectCard(suit, rank) {
	if (_.isObject(suit)) {
		rank = suit.rank;
		suit = suit.suit;
	}
	Bridge._checkSuit(suit);
	var prefix = "In Hand.selectCard";
	if (rank !== 'x' && rank !== 'X') {
		Bridge._checkRank(rank);
		if (!this.cards[suit][rank]) {
			Bridge._reportError(suit + rank + " is not assigned to " + this.direction + ". Cannot select", prefix);
		}
	} else {
		if (!this.hasX(suit)) {
			Bridge._reportError(suit + " does not have an " + rank + " in " + this.direction + ". Cannot select", prefix);
		}
	}

	this.selectedCard = suit + rank;
	this.onChange("setSelectedCard", this.selectedCard);
};

Bridge.Hand.prototype.isSelectedCard = function isSelectedCard(suit, rank) {
	return suit + rank === this.getSelectedCard();
};

Bridge.Hand.prototype.getSelectedCard = function getSelectedCard() {
	return this.selectedCard;
};

//
// Getters and Setters
//

/** Call set active hand on the parent deal. */
Bridge.Hand.prototype.setActiveHand = function setActiveHand() {
	if (this.deal) {
		this.deal.setActiveHand(this.getDirection());
	}
};

/** Make this the active hand. */
Bridge.Hand.prototype.makeActive = function () {
	this._isActive = true;
	this.onChange("makeActive");
};

/** Make this hand inactive. */
Bridge.Hand.prototype.makeInactive = function () {
	this._isActive = false;
	this.onChange("makeInactive");
};

/**
 * Get the direction of this hand
 * @return {string} the direction of this hand
 */
Bridge.Hand.prototype.getDirection = function () {
	return this.direction;
};

/**
 * Set the name of the player holding this hand.
 * @param {string} name - the name of player
 */
Bridge.Hand.prototype.setName = function (name) {
	if (_.isObject(name)) name = name.name;
	Bridge._checkRequiredArgument(name);
	this.name = name;
	this.onChange("setName", name);
};

/**
 * Get the name of the player holding this hand.
 * @return {string} the name of the player
 */
Bridge.Hand.prototype.getName = function () {
	return this.name;
};

/**
 * Get the count of number of cards in this hand
 * @param {string} suit optional suit to get count for
 * @return {number} the number of cards held by this hand
 */
Bridge.Hand.prototype.getCount = function (suit) {
	if (suit) {
		Bridge._checkSuit(suit);
		return this.numCards[suit];
	}
	return this.numCards["all"];
};

/**
 * Set the hand from a BBO handviewer style string
 * @param {string} hand - the hand in string format
 */
Bridge.Hand.prototype.setHand = function (hand) {
	if (_.isObject(hand)) hand = hand.hand;
	Bridge._checkRequiredArgument(hand);
	this.fromString(hand);
};

/**
 * Get the hand in BBO handviewer style string format
 * @return {string} the hand in string format
 */
Bridge.Hand.prototype.getHand = function () {
	return this.toString();
};

/**
 * Get the unique id
 * @return {string} the id in string format
 */
Bridge.Hand.prototype.getID = function () {
	return this.id;
};

/**
 * Is this hand active?
 * @return {boolean} true if this hand is active, false otherwise
 */
Bridge.Hand.prototype.isActive = function () {
	return this._isActive;
};

/**
 * Get the cards in a specific suit
 * @return {string} the cards in string format
 */
Bridge.Hand.prototype.getCardsInSuit = function (suit) {
	Bridge._checkSuit(suit);
	var output = "";
	_.each(Bridge.rankOrder, function (rank) {
		if (this.cards[suit][rank]) {
			if (this.showAsX[suit][rank]) output += 'x';else output += rank;
		}
	}, this);
	return output;
};

Bridge.Hand.prototype.hasX = function (suit) {
	Bridge._checkSuit(suit);
	for (var rank in Bridge.ranks) {
		if (this.showAsX[suit][rank]) {
			return true;
		}
	}
	return false;
};

/**
 * Add a card to this hand.
 * @param {string} suit - The suit of this card
 * @param {string} rank - The rank of this card
 */
Bridge.Hand.prototype.addCard = function (suit, rank) {
	if (_.isObject(suit)) {
		rank = suit.rank;
		suit = suit.suit;
	}
	var prefix = "In addCard";
	Bridge._checkSuit(suit, prefix);
	var showAsX = false;
	if (typeof rank === "string" && rank.toLowerCase() === 'x') {
		for (var i = Bridge.rankOrder.length - 1; i >= 0; --i) {
			var newRank = Bridge.rankOrder[i];
			if (this.deal) {
				var card = this.deal.cards[suit][newRank];
				if (!card.isAssigned()) {
					rank = newRank;
					showAsX = true;
					i = -1;
				}
			} else {
				if (!this.cards[suit][newRank]) {
					rank = newRank;
					showAsX = true;
					i = -1;
				}
			}
		}
	}
	Bridge._checkRank(rank, prefix);
	if (this.getCount() === 13) {
		Bridge._reportError(this.name + "'s Hand : already has 13 cards. Cannot add " + suit + rank, prefix);
	}
	if (this.cards[suit][rank]) {
		Bridge._reportError(suit + rank + " is already assigned to " + this.direction + ". Cannot add again", prefix);
	}
	// If deal is specified then check if this card has been assigned
	if (this.deal) {
		var card = this.deal.cards[suit][rank];
		if (card.isAssigned()) {
			Bridge._reportError(suit + rank + " is already assigned to " + card.getDirection() + ". Cannot add again", prefix);
		}
	}
	this.cards[suit][rank] = true;
	this.showAsX[suit][rank] = showAsX;
	if (this.deal) {
		this.deal.cards[suit][rank].assign(this.direction);
	}
	this.numCards["all"]++;
	this.numCards[suit]++;
	this.onChange("addCard", {
		"suit": suit,
		"rank": rank
	});
};

/**
 * Remove a card from this hand.
 * @param {string} suit - The suit of this card
 * @param {string} rank - The rank of this card
 */
Bridge.Hand.prototype.removeCard = function (suit, rank) {
	if (_.isObject(suit)) {
		rank = suit.rank;
		if (rank == 'x' || rank == 'X') {
			rank = suit.concreteRank;
		}
		suit = suit.suit;
	}
	var prefix = "In removeCard";
	Bridge._checkSuit(suit, prefix);
	Bridge._checkRank(rank, prefix);
	// If deal is specified then check if this card has been assigned
	if (this.deal) {
		var card = this.deal.cards[suit][rank];
		if (!card.isAssigned()) {
			Bridge._reportError(suit + rank + " is not assigned to " + this.direction + ". Cannot remove", prefix);
		}
	}
	if (!this.cards[suit][rank]) {
		Bridge._reportError(suit + rank + " is not assigned to " + this.direction + ". Cannot remove", prefix);
	}
	this.cards[suit][rank] = false;
	this.numCards["all"]--;
	this.numCards[suit]--;
	if (this.deal) {
		this.deal.cards[suit][rank].unAssign();
	}
	this.onChange("removeCard", {
		"suit": suit,
		"rank": rank
	});
};

/**
 * Check if this hand has a card.
 * @param {string} suit - The suit of this card
 * @param {string} rank - The rank of this card
 * @return {boolean} Does this hand have the specified card?
 */
Bridge.Hand.prototype.hasCard = function (suit, rank) {
	var prefix = "In hasCard";
	Bridge._checkSuit(suit, prefix);
	Bridge._checkRank(rank, prefix);
	return this.cards[suit][rank];
};

/**
 * Remove all cards from this hand
 */
Bridge.Hand.prototype.clearCards = function () {
	for (var suit in Bridge.suits) {
		for (var rank in Bridge.ranks) {
			if (this.cards[suit][rank]) this.removeCard(suit, rank);
		}
	}
};

/**
 * Set a property in this hand.
 * The properties that can be set are as follows<br/>
 * name - string - name of player holding this hand<br/>
 * hand - string - hand in BBO Handviewer string format<br/>
 * id - string - unique id for this hand<br/>
 * active - boolean - is this hand active<br/>
 * @param {string} property - the property to set
 * @param {string} value - the value to set the property to
 */
Bridge.Hand.prototype.set = function (property, value) {
	var prefix = "In Hand.set";
	Bridge._checkRequiredArgument(property, "Property", prefix);
	Bridge._checkRequiredArgument(value, "Value for Property " + property, prefix);
	switch (property) {
		case "name":
			this.setName(value);
			break;
		case "hand":
			this.setHand(value);
			break;
		case "active":
			value ? this.makeActive() : this.makeInactive();
			break;
		default:
			Bridge._reportError("Unknown property " + property, prefix);
	}
};

/**
 * Get value of a property .
 * The properties that can be got are as follows<br/>
 * direction - string - the direction of this hand
 * name - string - name of player holding this hand<br/>
 * id - string - a unique id for this hand<br/>
 * count - number - the number of cards this hand has<br/>
 * hand - string - hand in BBO Handviewer string format<br/>
 * active - boolean - is this hand active<br/>
 * @param {string} property - the property to get
 * @return {string} the value of requested property
 * @throws unknown property
 */
Bridge.Hand.prototype.get = function (property) {
	var prefix = "In Hand.get";
	Bridge._checkRequiredArgument(property, "Property", prefix);
	switch (property) {
		case "direction":
			return this.getDirection();
			break;
		case "name":
			return this.getName();
			break;
		case "id":
			return this.getID();
			break;
		case "count":
			return this.getCount();
			break;
		case "hand":
			return this.getHand();
			break;
		case "active":
			return this.isActive();
			break;
		default:
			Bridge._reportError("Unknown property " + property, prefix);
	}
};

/**
 * Generate a string display of this hand.
 * @return {string} string representation of this hand.
 */
Bridge.Hand.prototype.toString = function () {
	var output = "";
	_.each(Bridge.suitOrder, function (suit) {
		var item = "";
		_.each(Bridge.rankOrder, function (rank) {
			if (this.cards[suit][rank]) {
				if (this.showAsX[suit][rank]) item += 'x';else item += rank;
			}
		}, this);
		if (item) output += suit + item;
	}, this);
	return output;
};

/**
 * Parse a hand given as BBO handviewer string format.
 * @param {string} handString - the hand in string format
 */
Bridge.Hand.prototype.fromString = function (handString) {
	Bridge._checkRequiredArgument(handString);
	this.clearCards();
	var seenSuits = {};
	for (var direction in Bridge.directions) {
		seenSuits[direction] = false;
	}
	handString = handString.toLowerCase();
	var currentSuit = '';
	var currentRank = '';
	for (var i = 0; i < handString.length; ++i) {
		var prefix = 'In hand for ' + this.direction + ' at position ' + (i + 1);
		// Read the next character specified in hand
		var currentChar = handString.charAt(i);
		switch (currentChar) {
			// Check if it specifies suit
			case 'c':
			case 'd':
			case 'h':
			case 's':
				currentSuit = currentChar;
				if (seenSuits[currentSuit]) {
					Bridge._reportError(' suit ' + currentSuit + ' has already been seen before!', prefix);
				}
				seenSuits[currentSuit] = true;
				break;

			// Special handing for numeric 10
			case '1':
				if (currentSuit === '') {
					Bridge._reportError(currentChar + ' was found when a suit was expected!', prefix);
				}
				if (i < handString.length - 1 && handString.charAt(i + 1) === '0') {
					currentRank = 't';
					i++;
				} else {
					Bridge._reportError('a 1 is present without a subsequent 0. Use 10 or t to reprensent the ten.', prefix);
					continue;
				}
				this.addCard(currentSuit, currentRank);
				break;
			// All other characters
			default:
				if (currentSuit === '') {
					Bridge._reportError(currentChar + ' was found when a suit was expected!', prefix);
					continue;
				}
				currentRank = currentChar;
				this.addCard(currentSuit, currentRank);
				break;
		}
	}
	this.onChange("setHand", handString);
};

/**
 * Does this hand have any cards in the given suit?
 * @param {string} suit the suit to check cards in
 * @return {boolean} true if this hand has cards in the given suit
 */
Bridge.Hand.prototype.hasCards = function (suit) {
	return this.numCards[suit] > 0;
};

/**
 * Get the ranks in this hand for a given suit.
 * @param { string } suit the suit whose ranks are to be returned.
 * @return {array} an array of objects with ranks and html for ranks.
 */
Bridge.Hand.prototype.getRanks = function (suit) {
	if (this.getCount(suit) <= 0) return [{ "rank": '-', "html": '- ' }];
	var out = [];
	_.each(Bridge.rankOrder, function (actualRank) {
		if (this.cards[suit][actualRank]) {
			var rank = this.showAsX[suit][actualRank] ? 'x' : actualRank;
			var rankHTML = this.showAsX[suit][actualRank] ? 'x' : Bridge.ranks[rank].html;
			out.push({ "rank": rank, "html": rankHTML });
		}
	}, this);
	return out;
};

/**
 * Get the cards in this hand in suit and rank order.
 * @return {int} the card number.
 */
Bridge.Hand.prototype.getCards = function () {
	var out = [];
	_.each(this.getSuits( /*alternating=*/true), function (suit) {
		_.each(Bridge.rankOrder, function (actualRank) {
			if (this.cards[suit][actualRank]) {
				var rank = this.showAsX[suit][actualRank] ? 'x' : actualRank;
				var rankHTML = this.showAsX[suit][actualRank] ? 'x' : Bridge.ranks[rank].html;
				out.push({ "suit": suit, "rank": rank, "html": rankHTML, "concreteRank": actualRank });
			}
		}, this);
	}, this);
	return out;
};

/**
 * Get the suit in order for this hand.
 * @param { bool } alternating should the color suits be alternated.
 * @return {array} an array of suits in alternating color order if requested
 */
Bridge.Hand.prototype.getSuits = function (alternating) {
	if (!alternating) return Bridge.suitOrder;
	var numSuits = 0;
	_.each(Bridge.suitOrder, function (suit) {
		if (this.hasCards(suit)) numSuits++;
	}, this);
	if (numSuits < 3) return Bridge.suitOrder;
	if (numSuits === 4) return ['s', 'h', 'c', 'd'];
	if (this.hasCards('s') && this.hasCards('c')) return Bridge.suitOrder;else return ['h', 's', 'c', 'd'];
};

/**
 * Generate a json format of this hand
 * @return {object} json representation of this hand.
 */
Bridge.Hand.prototype.toJSON = function () {
	var output = {};
	output.direction = this.direction;
	output.name = this.name;
	output.hand = this.getHand();
	return output;
};

/**
* Parse a hand given in json format
* @param {object} hand - the hand in json format
*/
Bridge.Hand.prototype.fromJSON = function (handString) {
	Bridge._checkRequiredArgument(handString);
	// direction should not be set
	this.name = handString.name;
	this.setHand(handString.hand);
};

/**
 * Something in this hand has changed.
 * Run all callbacks.
 */
Bridge.Hand.prototype.onChange = function (operation, parameter) {
	if (operation in this.callbacks) {
		_.each(this.callbacks[operation], function (callback) {
			callback(operation, parameter);
		});
	}
	_.each(this.callbacks[""], function (callback) {
		callback(operation, parameter);
	});
	if (this.deal) {
		this.deal.runCallbacks(operation, parameter);
	}
};

/**
 * Defines Call class and all methods associated with it.
 */

// Get Namespace.
var Bridge = Bridge || {};

/**
 * Creates a new Bridge Call.
 * @constructor
 * @memberof Bridge
 * @param {string} call  - a one character or two character string representing call
 * @param {string} direction - the direction of hand that makes this call
 */
Bridge.Call = function (call, direction) {
	Bridge._checkBid(call);
	Bridge._checkDirection(direction);
	this.call = call;
	this.direction = direction;
	this.annotation = "";
	this.explanation = "";
};

//
// Getters and Setters
/**
 * Get the call in this call object
 * @return {string} the call string
 */
Bridge.Call.prototype.getCall = function () {
	return this.call;
};

/**
 * Get the level of this call
 * @return {string} the level
 */
Bridge.Call.prototype.getLevel = function () {
	if (this.call.length === 1) return 0;else return _.parseInt(this.call[0]);
};

/**
 * Get the suit of this call
 * @return {string} the level
 */
Bridge.Call.prototype.getSuit = function () {
	if (this.call.length === 1) return this.call[0];else return this.call[1];
};

/**
 * Set the direction for who made this call
 * @param {string} direction - of hand that made this call
 */
Bridge.Call.prototype.setDirection = function (direction) {
	Bridge._checkDirection(direction);
	this.direction = direction;
};

/**
 * Get the direction who made this call
 * @return {string} direction of hand that made this call
 */
Bridge.Call.prototype.getDirection = function () {
	return this.direction;
};

/**
 * Get the annotation associated with this call
 * @return {string} annotation
 */
Bridge.Call.prototype.getAnnotation = function () {
	return this.annotation;
};

/**
 * Set the annotation associated with this call
 * @param {string} annotation - the annotation to set to
 */
Bridge.Call.prototype.setAnnotation = function (annotation) {
	Bridge._checkRequiredArgument(annotation);
	this.annotation = annotation;
};

/**
 * Get the explanation associated with this call
 * @return {string} explanation
 */
Bridge.Call.prototype.getExplanation = function () {
	return this.explanation;
};

/**
 * Set the explanation associated with this call
 * @param {string} explanation - the explanation to set to
 */
Bridge.Call.prototype.setExplanation = function (explanation) {
	Bridge._checkRequiredArgument(explanation);
	this.explanation = explanation;
};

/**
 * Set a property in this hand.
 * The properties that can be got are as follows<br/>
 * direction - string - hand in BBO Handviewer string format<br/>
 * annotation - string - annotation associated with this call<br/>
 * explanation - string - explanation associated with this call<br/>
 * @param {string} property - the property to get
 * @param {string} value - the value to set the property to.
 */
Bridge.Call.prototype.set = function (property, value) {
	var prefix = "In Call.set";
	Bridge._checkRequiredArgument(property, "Property", prefix);
	Bridge._checkRequiredArgument(value, "Value for Property " + property, prefix);
	switch (property) {
		case "direction":
			this.setDirection(value);
			break;
		case "annotation":
			this.setAnnotation(value);
			break;
		case "explanation":
			this.setExplanation(value);
			break;
		default:
			Bridge._reportError("Unknown property " + property, prefix);
	}
};

/**
 * Get a property from hand.
 * The properties that can be got are as follows<br/>
 * call - string - name of player holding this hand<br/>
 * direction - string - hand in BBO Handviewer string format<br/>
 * annotation - string - annotation associated with this call<br/>
 * explanation - string - explanation associated with this call<br/>
 * @param {string} property - the property to get
 */
Bridge.Call.prototype.get = function (property) {
	var prefix = "In Call.get";
	Bridge._checkRequiredArgument(property, "Property", prefix);
	switch (property) {
		case "call":
			return this.getCall();
			break;
		case "direction":
			return this.getDirection();
			break;
		case "annotation":
			return this.getAnnotation();
			break;
		case "explanation":
			return this.getExplanation();
			break;
		default:
			Bridge._reportError("Unknown property " + property, prefix);
	}
};

/**
 * Generate a string display of this call.
 * @return {string} string representation of this call.
 */
Bridge.Call.prototype.toString = function () {
	var output = "";
	output += this.call;
	if (this.explanation) {
		output += "(" + this.explanation + ")";
	}
	if (this.annotation) {
		output += "{" + this.annotation + "}";
	}
	return output;
};

/**
 * Defines Auction class and all methods associated with it.
 */

// Define namespace if necessary
var Bridge = Bridge || {};

/**
 * Creates a new Bridge Auction.
 * @constructor
 * @memberof Bridge
 * @param {object} deal - The deal that this auction belongs to.
 */
Bridge.Auction = function (deal) {

	/**
  * The deal that this play belongs to.
  * @member {object}
  */
	this.deal = deal;
	this.parent = deal;

	/**
  * A unique id to identify this auction.
  * @member {string}
  */
	this.id = deal ? deal.id : Bridge.IDManager.generateID();

	/**
  * The type of this object.
  * @member {string}
  */
	this.type = "Auction";

	/**
  * The dealer for this auction.
  * @member {string}
  */
	this.dealer = deal ? deal.getDealer() : "n";

	/**
  * The vulnerability for this auction.
  * @member {string}
  */
	this.vulnerability = deal ? deal.getVulnerability() : "-";

	/**
  * Who is next to call?
  * @member {string}
  */
	this.nextToCall = this.dealer;

	// these two should be in sync
	/**
  * The calls in this auction
  * @member {array}
  */
	this.calls = [];

	/**
  * The contracts at end of corresponding call.
  * @member {array}
  */
	this.contracts = [];

	// If the bidding box uses a split level and suit then we select level first
	/**
  * The currently selected level in bidding box.
  * @member {object}
  * @todo This probably does not belong in this class.
  */
	this.selectedLevel = 0;
	this.selectedBid = '';
	this.selectedCall = '';

	/**
  * The current call index when trying to step through the auction.
  * @member {number}
  */
	this.currentAuctionIndex = -1;

	// callbacks to called when things change.
	this.callbacks = {
		"": []
	};
};

// Register a callback.
Bridge.Auction.prototype.registerCallback = function (callback, operation) {
	operation = operation || "";
	if (!(operation in this.callbacks)) {
		this.callbacks[operation] = [];
	}
	this.callbacks[operation].push(callback);
};

//
// Getters and Setters
//

/**
 * Get the direction who is next to call
 * @return {string} the direction that is next to call
 */
Bridge.Auction.prototype.getNextToCall = function () {
	return this.nextToCall;
};

/**
 * Get the dealer of this auction
 * @return {string} the dealer
 */
Bridge.Auction.prototype.getDealer = function () {
	return this.dealer;
};

Bridge.Auction.prototype.rotateClockwise = function () {
	var newDealer = Bridge.getLHO(this.getDealer());
	this.dealer = newDealer;
	var direction = newDealer;
	_.each(this.calls, function (call) {
		call.setDirection(direction);
		direction = Bridge.getLHO(direction);
	}, this);
	this.nextToCall = direction;
	_.each(this.contracts, function (contract) {
		contract.rotateClockwise();
	});
	this.onChange("setDealer", newDealer);
};

/**
 * Set the dealer for this auction.
 * If calls exist then propagate the change.
 * @param {string} dealer - the new dealer
 */
Bridge.Auction.prototype.setDealer = function (dealer) {
	if (_.isObject(dealer)) dealer = dealer.dealer;
	Bridge._checkDirection(dealer);
	while (this.getDealer() !== dealer.toLowerCase()) {
		this.rotateClockwise();
	}
};

/**
 * Get the vulnerability of this auction
 * @return {string} the vulnerability
 */
Bridge.Auction.prototype.getVulnerability = function () {
	return this.vulnerability;
};

/**
 * Is the given direction vulnerable?
 * @param {string} direction the direction to check.
 * @return {boolean} true if direction is vulnerable, false otherwise.
 */
Bridge.Auction.prototype.isVulnerable = function isVulnerable(direction) {
	var vul = this.getVulnerability();
	return vul === 'b' || vul === direction || vul === Bridge.getPartner(direction);
};

/**
 * Set the vulnerability for this auction.
 * @param {string} vulnerability - the new vulnerability
 */
Bridge.Auction.prototype.setVulnerability = function (vulnerability) {
	if (_.isObject(vulnerability)) vulnerability = vulnerability.vulnerability;
	Bridge._checkVulnerability(vulnerability);
	this.vulnerability = vulnerability;
	this.onChange("setVulnerability", vulnerability);
};

/**
 * Get the selected level of this auction
 * @return {number} the selected level
 */
Bridge.Auction.prototype.getSelectedLevel = function () {
	return this.selectedLevel;
};

/**
 * Set the selected level for this auction.
 * @param {number} level - the new selected level
 */
Bridge.Auction.prototype.setSelectedLevel = function (level) {
	if (_.isObject(level)) level = level.level;
	Bridge._checkLevel(level);
	this.selectedLevel = level;
	this.selectedCall = '';
	this.selectedBid = '';
	this.onChange("setSelectedLevel", level);
};

Bridge.Auction.prototype.setSelectedCall = function setSelectedCall(call, bid) {
	if (_.isObject(call)) {
		bid = call.bid;
		call = call.call;
	}
	Bridge._checkCall(call);
	Bridge._checkBid(bid);
	if (bid === call) {
		this.selectedLevel = 0;
	}
	this.selectedBid = bid;
	this.selectedCall = call;
	this.onChange("setSelectedCall", call);
};

Bridge.Auction.prototype.getSelectedBid = function () {
	return this.selectedBid;
};

Bridge.Auction.prototype.getSelectedCall = function () {
	return this.selectedCall;
};

/**
 * Unset the selected level
 */
Bridge.Auction.prototype.unsetSelectedLevel = function () {
	this.selectedLevel = null;
	this.onChange("setSelectedLevel", this.selectedLevel);
};

/**
 * Set this auction from a BBO handviewer like string
 * @param {string} auction - the auction in string format
 */
Bridge.Auction.prototype.setAuction = function (auction) {
	if (_.isObject(auction)) auction = auction.auction;
	Bridge._checkRequiredArgument(auction);
	this.fromString(auction);
	this.onChange("setAuction", auction);
};

/**
 * Get this auction in a BBO handviewer like string
 * @return {string} the auction in string format
 */
Bridge.Auction.prototype.getAuction = function () {
	return this.toString();
};

/**
 * Get the name of person sitting in this direction.
 * @param {string} direction the direction whose name is needed.
 * @return {string} the name of person.
 **/
Bridge.Auction.prototype.getName = function getName(direction) {
	var names = {
		'n': 'North',
		'e': 'East',
		's': 'South',
		'w': 'West'
	};
	if (this.deal) {
		return this.deal.getHand(direction).getName();
	}
	return names[direction];
};

/**
 * Get the calls in this auction.
 * @param {string} startDirection the optional direction to start from. Defaults to w.
 * @param {bool} addQuestionMark should a question mark be added at the end if the auction is not complete.
 * @return {array of Bridge.Call} the calls.
 **/
Bridge.Auction.prototype.getCalls = function getCalls(startDirection, addQuestionMark) {
	startDirection = startDirection || 'w';
	addQuestionMark = addQuestionMark || false;
	var calls = [];
	var direction = startDirection;
	while (this.dealer !== direction) {
		calls.push('-');
		direction = Bridge.getLHO(direction);
	}
	calls = calls.concat(this.calls);
	if (!this.getContract().isComplete && addQuestionMark) {
		calls.push('?');
	}
	while (calls.length % 4 !== 0) {
		calls.push('');
	}
	return _.chunk(calls, 4);
};

/**
 * Set the contract (and generate an auction ) from a specified contract string
 * @param {string} contract - the contract in string format
 */
Bridge.Auction.prototype.setContract = function (contract) {
	if (_.isObject(contract)) contract = contract.contract;
	Bridge._checkRequiredArgument(contract);
	var prefix = "In Bridge.setContract";
	var charIndex = 0;
	if (contract.length < charIndex + 1) {
		Bridge._reportError('Contract string ' + contract + ' does not specify level!', prefix);
	}
	var level = _.parseInt(contract[charIndex++]);
	if (contract.length < charIndex + 1) {
		Bridge._reportError('Contract string ' + contract + ' does not specify suit!', prefix);
	}
	var suit = contract[charIndex++].toLowerCase();
	Bridge._checkBid(level + suit, prefix);
	if (!Bridge.isStrain(suit)) {
		Bridge._reportError('Contract string ' + contract + ' does not specify a valid suit!', prefix);
	}
	var doubled = false;
	var redoubled = false;
	if (contract.length > charIndex && contract[charIndex].toLowerCase() === 'x') {
		doubled = true;
		charIndex++;
		if (contract.length > charIndex && contract[charIndex].toLowerCase() === 'x') {
			redoubled = true;
			charIndex++;
		}
	}
	if (contract.length < charIndex + 1) {
		Bridge._reportError('Contract string ' + contract + ' does not specify declarer!', prefix);
	}
	var declarer = contract[charIndex].toLowerCase();
	Bridge._checkDirection(declarer);
	this.clearCalls();
	while (this.nextToCall !== declarer) {
		this.addCall('p');
	}
	this.addCall(level + suit);
	if (doubled) this.addCall('x');
	if (redoubled) this.addCall('r');
	this.addCall('p');
	this.addCall('p');
	this.addCall('p');
	this.onChange("setContract", contract);
	this.onChange("setAuction", this.getAuction());
};

/**
 * Get the final or latest contract
 * @return {object} the contract
 */
Bridge.Auction.prototype.getContract = function () {
	var numCalls = this.calls.length;
	if (numCalls === 0) return new Bridge.Contract();
	return this.contracts[numCalls - 1];
};

/**
 * Is the auction complete?
 */
Bridge.Auction.prototype.isComplete = function () {
	this.getContract().isComplete;
};

/**
 * Get the unique id
 * @return {string} the id in string format
 */
Bridge.Auction.prototype.getID = function () {
	return this.id;
};

/**
 * Get a property in this auction.
 * The properties that can be got are as follows<br/>
 * dealer - character [ n e s w ] - the dealer for this auction<br/>
 * vulnerability - character [ - n e b ] - the vulnerability for this deal<br/>
 * level - number between 1 and 7 the selected level
 * contract - string - a prespecified contract <br/>
 * auction - string - the auction as a string <br/>
 * @param {string} property - the property to set<br/>
 * @return {mixed} the value of requested property
 * @throws unknown property
 */
Bridge.Auction.prototype.get = function (property) {
	var prefix = 'In Auction.get';
	Bridge._checkRequiredArgument(property, 'Property', prefix);
	switch (property) {
		case 'dealer':
			return this.getDealer();
			break;
		case 'vulnerability':
			return this.getVulnerability();
			break;
		case "level":
			return this.getSelectedLevel();
			break;
		case 'contract':
			return this.getContract();
			break;
		case 'auction':
			return this.getAuction();
			break;
		case 'id':
			return this.getID();
			break;
		default:
			Bridge._reportError('Unknown deal property ' + property, prefix);
	}
};

/**
 * Set a property in this auction.
 * The properties that can be set are as follows<br/>
 * dealer - character [ n e s w ] - the dealer for this auction<br/>
 * level - number between 1 and 7 the selected level
 * vulnerability - character [ - n e b ] - the vulnerability for this deal<br/>
 * contract - string - a prespecified contract <br/>
 * auction - string - the auction as a string <br/>
 * @param {string} property - the property to set<br/>
 * @param {string} value - the value to set the property to
 * @return {boolean} true if property was set, false otherwise
 * @throws unknown property
 */
Bridge.Auction.prototype.set = function (property, value) {
	var prefix = 'In Auction.set';
	Bridge._checkRequiredArgument(property, 'Property', prefix);
	Bridge._checkRequiredArgument(value, 'Value for Property ' + property, prefix);
	switch (property) {
		case 'dealer':
			this.setDealer(value);
			break;
		case 'vulnerability':
			this.setVulnerability(value);
			break;
		case "level":
			this.setSelectedLevel(value);
		case 'contract':
			this.setContract(value);
			break;
		case 'auction':
			this.setAuction(value);
			break;
		default:
			Bridge._reportError('Unknown deal property ' + property, prefix);
	}
};

/**
 * Add a call to the auction.
 * @param {string} call - The call as a single character (p, x, r) or as two characters
 * representing level and suit.
 * @param {string} [explanation] - optional explanation for this call
 * @param {string} [annotation] - optional annotation for this call
 */
Bridge.Auction.prototype.addCall = function (call, explanation, annotation) {
	if (_.isObject(call)) {
		explanation = call.explanation;
		annotation = call.annotation;
		call = call.call;
	}
	var prefix = 'In Auction.addCall';
	call = call.toLowerCase();
	Bridge._checkBid(call, prefix);
	var call = new Bridge.Call(call, this.nextToCall);
	if (annotation) call.setAnnotation(annotation);
	if (explanation) call.setExplanation(explanation);
	if (this.calls.length === 0) var contract = new Bridge.Contract();else {
		var contract = this.getContract().clone();
	}
	contract.update(call);
	this.calls.push(call);
	this.contracts.push(contract);
	this.nextToCall = Bridge.getLHO(this.nextToCall);
	this.selectedLevel = 0;
	this.onChange("addCall", {
		"call": call,
		"contract": this.getContract()
	});
	if (this.getContract().isComplete) {
		this.onChange("auctionComplete", {
			"call": call,
			"contract": this.getContract()
		});
	}
};

/**
 * Add passes to complete the auction
 */
Bridge.Auction.prototype.addAllPass = function () {
	while (!this.getContract().isComplete) {
		this.addCall('p');
	}
};

/**
 * Clear all calls in this auction
 */
Bridge.Auction.prototype.clearCalls = function () {
	while (this.calls.length > 0) {
		this.removeCall();
	}
};

/**
 * Abstain was called.
 * Just raise an event and do not do anything.
 */
Bridge.Auction.prototype.abstain = function () {
	this.onChange("abstained", {});
};

/**
 * Removes the last call from the auction.
 */
Bridge.Auction.prototype.removeCall = function () {
	if (this.calls.length > 0) {
		var call = this.calls[this.calls.length - 1];
		this.calls.pop();
		this.contracts.pop();
		this.nextToCall = Bridge.getRHO(this.nextToCall);
		this.selectedLevel = 0;
		this.onChange("removeCall", call.getCall());
	}
};

/**
 * Advances the auction till the specified index
 * @param {number} index - The call number to advance to.
 */
Bridge.Auction.prototype.advanceAuctionTillIndex_ = function (index) {
	var prefix = "In Bridge.Auction.advanceAuctionTillIndex_";
	if (index < 0 || index >= this.calls.length) {
		Bridge._reportError("Cannot advance because specified call number " + index + " is invalid", prefix);
	}
	if (this.currentAuctionIndex >= index) {
		Bridge._reportError("Cannot advance because current call number is at or greater than specified call number " + index, prefix);
	}
	while (this.currentAuctionIndex < index) {
		this.currentAuctionIndex++;
		var call = this.calls[this.currentAuctionIndex];

		// Trigger events if enabled
		this.onChange("advanceAuction", call);
	}
	this.onChange("advanceAuctionCompleted", call);
};

/**
 * Advance the auction by one call
 */
Bridge.Auction.prototype.advanceAuction = function () {
	this.advanceAuctionTillIndex_(this.currentAuctionIndex + 1);
};

/**
 * Advance the auction to the end.
 */
Bridge.Auction.prototype.advanceAuctionAll = function () {
	var index = this.calls.length - 1;
	this.advanceAuctionTillIndex_(index);
};

/**
 * Rewind the auction till the specified index.
 * @param {number} index - The play number to rewind to.
 */
Bridge.Auction.prototype.rewindAuctionTillIndex_ = function (index) {
	var prefix = "In Bridge.Auction.rewindAuctionTillIndex_";
	if (index < -1 || index >= this.calls.length - 1) {
		Bridge._reportError("Cannot rewind because specified call number " + index + " is invalid", prefix);
	}
	if (this.currentAuctionIndex <= index) {
		Bridge._reportError("Cannot rewind because current call number is at or lesser than specified call number " + index, prefix);
	}
	while (this.currentAuctionIndex > index) {
		var call = this.calls[this.currentAuctionIndex];
		this.currentAuctionIndex--;

		// Trigger events if enabled
		this.onChange("rewindAuction", call);
	}
	this.onChange("rewindAuctionCompleted", call);
};

/**
 * Rewind the auction by one call.
 */
Bridge.Auction.prototype.rewindAuction = function () {
	this.rewindAuctionTillIndex_(this.currentAuctionIndex - 1);
};

/**
 * Rewind the auction to the start.
 */
Bridge.Auction.prototype.rewindAuctionAll = function () {
	var index = -1;
	this.rewindAuctionTillIndex_(index);
};
Bridge.Auction.prototype.rewind = Bridge.Auction.prototype.rewindAuctionAll;

/**
 * Load the auction from a string format of auction
 * @param {string} auction - the auction in string format
 */
Bridge.Auction.prototype.fromString = function (auction) {
	this.clearCalls();
	var prefix = 'In Auction.fromString';
	var charIndex = 0;
	while (charIndex < auction.length) {
		var nextChar = auction[charIndex++].toLowerCase();
		if (nextChar === 'd') nextChar = 'x';
		if (_.has(Bridge.calls, nextChar) && !Bridge.isStrain(nextChar)) {
			var call = nextChar;
		} else {
			var call = nextChar + auction[charIndex++].toLowerCase();
		}
		var explanation = null;
		var annotation = null;
		while (charIndex < auction.length && (auction[charIndex] === '(' || auction[charIndex] === '{')) {
			if (auction[charIndex] === '(') {
				var endChar = ')';
				var returnValue = Bridge._parseContainedText(auction, charIndex, endChar, prefix);
				explanation = returnValue.text;
			} else {
				var endChar = '}';
				var returnValue = Bridge._parseContainedText(auction, charIndex, endChar, prefix);
				annotation = returnValue.text;
			}
			charIndex = returnValue.position + 1;
		}
		this.addCall(call, explanation, annotation);
	}
};

/**
 * Load auction from a json representation of this auction.
 * json is just a string
 * @param {object} json - json representation of this auction.
 */
Bridge.Auction.prototype.fromJSON = function (json) {
	return this.fromString(json);
};

/**
 * Generate a string display of this auction.
 * @return {string} string representation of this auction.
 */
Bridge.Auction.prototype.toString = function () {
	var output = '';
	for (var i = 0; i < this.calls.length; ++i) {
		output += this.calls[i].toString();
	}
	return output;
};

/**
 * Generate a json representation of this auction.
 * This is just the string represntation
 * @return {object} json representation of this auction.
 */
Bridge.Auction.prototype.toJSON = function () {
	return this.toString();
};

/**
 * Something in this auction has changed.
 * Run callbacks.
 */
Bridge.Auction.prototype.onChange = function (operation, parameter) {
	if (operation in this.callbacks) {
		_.each(this.callbacks[operation], function (callback) {
			callback(operation, parameter);
		});
	}
	_.each(this.callbacks[""], function (callback) {
		callback(operation, parameter);
	});
	if (this.deal) {
		this.deal.runCallbacks(operation, parameter);
	}
};

/**
 * Defines Contract class and all methods associated with it.
 */

// Get Namespace.
var Bridge = Bridge || {};

/**
 * Creates a new Bridge Contract.
 * @constructor
 * @memberof Bridge
 * @param {number} level - The level of the contract
 * @param {string} suit - the suit of the contract
 * @param {string} direction - the direction making this bid
 */
Bridge.Contract = function () {
	this.level = null;
	this.suit = null;
	this.doubled = false;
	this.redoubled = false;
	this.declarer = null;
	this.firstToBid = {};
	for (var call in Bridge.calls) {
		if (Bridge.isStrain(call)) {
			this.firstToBid[call] = {};
			for (var direction in Bridge.directions) {
				this.firstToBid[call][direction] = null;
			}
		}
	}
	this.numPasses = 0;
	this.isComplete = false;
};

Bridge.Contract.prototype.rotateClockwise = function () {
	if (this.getDeclarer()) {
		this.declarer = Bridge.getLHO(this.getDeclarer());
	}
	for (var call in Bridge.calls) {
		if (Bridge.isStrain(call)) {
			for (var direction in Bridge.directions) {
				if (this.firstToBid[call][direction]) {
					this.firstToBid[call][direction] = Bridge.getLHO(this.firstToBid[call][direction]);
				}
				this.firstToBid[call][direction] = null;
			}
		}
	}
};

/**
 * Get the suit of this contract
 * @return {string} the suit
 */
Bridge.Contract.prototype.getSuit = function () {
	return this.suit;
};

/**
 * Get the declarer of this contract
 * @return {string} the declarer
 */
Bridge.Contract.prototype.getDeclarer = function () {
	return this.declarer;
};

/**
 * Get the leader is this becomes contract
 * @return {string} the leader
 */
Bridge.Contract.prototype.getLeader = function () {
	return Bridge.getLHO(this.declarer);
};

/**
 * Determine what bids are allowed next for specified direction.
 * @param {string} direction the direction whose bids are being checked
 * @return {object} parameters indicating what bids are allowed
 * @private
 */
Bridge.Contract.prototype.allowedCalls = function (direction) {
	Bridge._checkDirection(direction);
	var output = {};
	output["p"] = !this.isComplete;
	output["ap"] = output["p"];
	output["x"] = false;
	output["r"] = false;
	for (var i = 1; i <= 7; ++i) {
		for (var call in Bridge.calls) {
			if (Bridge.isStrain(call)) {
				output[i + call] = !this.isComplete;
			}
		}
	}
	output["u"] = !(this.suit === null && this.numPasses === 0);
	output["minimum_level"] = 8;
	if (this.suit === null || this.isComplete) {
		if (!this.isComplete) output["minimum_level"] = 1;
		return output;
	}

	for (var i = 1; i <= 7; ++i) {
		for (var call in Bridge.calls) {
			if (Bridge.isStrain(call)) {
				if (i > this.level || i === this.level && Bridge.calls[call].index < Bridge.calls[this.suit].index) {
					output[i + call] = true;
					if (i < output["minimum_level"]) output["minimum_level"] = i;
				} else {
					output[i + call] = false;
				}
			}
		}
	}
	output["p"] = true;
	output["x"] = !this.doubled && !this.redoubled && Bridge.areOpponents(direction, this.declarer);
	output["r"] = this.doubled && !this.redoubled && !Bridge.areOpponents(direction, this.declarer);
	return output;
};

/**
 * Make a clone of this contract.
 * @return a clone of the contract.
 */
Bridge.Contract.prototype.clone = function () {
	var contract = new Bridge.Contract();
	var fields = ['level', 'suit', 'doubled', 'redoubled', 'declarer', 'numPasses', 'isComplete'];
	_.each(fields, function (field) {
		contract[field] = this[field];
	}, this);
	contract.firstToBid = _.cloneDeep(this.firstToBid);
	return contract;
};

/**
 * Update contract after a call.
 * @param {string} call - the call to use to update contract
 */
Bridge.Contract.prototype.update = function (call) {
	if (this.isComplete) {
		Bridge._reportError('Auction is already complete. Cannot make another call');
	}
	var level = call.getLevel();
	var suit = call.getSuit();
	var direction = call.getDirection();
	switch (suit) {
		case 'p':
			this.numPasses++;
			if (this.declarer && this.numPasses === 3 || this.numPasses === 4) {
				this.isComplete = true;
			}
			break;
		case 'x':
			if (!this.declarer || !Bridge.areOpponents(this.declarer, direction) || this.redoubled || this.doubled) {
				Bridge._reportError('Double is not allowed at this point in the auction');
			}
			this.doubled = true;
			this.numPasses = 0;
			break;
		case 'r':
			if (!this.doubled || Bridge.areOpponents(this.declarer, direction) || this.redoubled) {
				Bridge._reportError('ReDouble is not allowed at this point in the auction');
			}
			this.redoubled = true;
			this.numPasses = 0;
			break;
		default:

			if (level < this.level || level === this.level && Bridge.calls[suit].index >= Bridge.calls[this.suit].index) {
				Bridge._reportError(call.toString() + ' is not allowed at this point in the auction');
			}
			this.doubled = false;
			this.redoubled = false;
			this.numPasses = 0;
			if (!this.firstToBid[suit][direction]) {
				this.firstToBid[suit][direction] = direction;
				this.firstToBid[suit][Bridge.getPartner(direction)] = direction;
			}
			this.declarer = this.firstToBid[suit][direction];
			this.suit = suit;
			this.level = level;
			break;
	}
};

/**
 * Generate a string display of this contract.
 * @return {string} string representation of this contract.
 */
Bridge.Contract.prototype.toString = function () {
	var output = "";
	if (this.level) {
		output += this.level;
		output += this.suit;
		if (this.redoubled) output += "xx";else if (this.doubled) output += "x";
		output += this.declarer;
	}
	return output;
};

/**
 * Defines Play class and all methods associated with it.
 */

// Get Namespace.
var Bridge = Bridge || {};

/**
 * Creates a new Bridge Play.
 * @constructor
 * @memberof Bridge
 * @param {object} [deal] - the optional deal that this play belongs to
 */
Bridge.Play = function (deal) {

	/**
  * The deal that this play belongs to.
  * @member {object}
  */
	this.deal = deal;

	/**
  * A unique id to identify this play.
  * @member {string}
  */
	this.id = deal ? deal.id : Bridge.IDManager.generateID();

	/**
  * The type of this object.
  * @member {string}
  */
	this.type = "Play";

	/**
  * The cards that are in this play
  * @member {array}
  */
	this.plays = [];
	for (var i = 0; i <= 52; ++i) {
		this.plays.push(null);
	} /**
    * The last added play to this play sequence.
    * @member {number}
    */
	this.lastPlayIndex = -1;

	/**
  * The current play index when trying to play out the hand.
  * @member {number}
  */
	this.currentPlayIndex = 0;

	/**
  * Which cards have been added to the play
  * @member {object}
  */
	this.cardAdded = {};
	for (var suit in Bridge.suits) {
		this.cardAdded[suit] = {};
		for (var rank in Bridge.ranks) {
			this.cardAdded[suit][rank] = false;
		}
	}

	/**
  * Which cards have been played in the play
  * @member {object}
  */
	this.cardPlayed = {};
	for (var suit in Bridge.suits) {
		this.cardPlayed[suit] = {};
		for (var rank in Bridge.ranks) {
			this.cardPlayed[suit][rank] = false;
		}
	}

	/**
  * Who is the leader (to the first trick)?
  * @member {string}
  */
	this.leader = 'w';

	/**
  * What is the trump suit?
  * @member {string}
  */
	this.trump = 'n';

	this.initialize();

	// callbacks to called when things change.
	this.callbacks = {
		"": []
	};
};

// Register a callback.
Bridge.Play.prototype.registerCallback = function (callback, operation) {
	operation = operation || "";
	if (!(operation in this.callbacks)) {
		this.callbacks[operation] = [];
	}
	this.callbacks[operation].push(callback);
};

/**
 * Set a unique id
 * @param {string} id - a unique identifier
 */
Bridge.Play.prototype.setID = function (id) {
	Bridge._checkRequiredArgument(id);
	this.id = id;
};

/**
 * Get the unique id
 * @return {string} the id in string format
 */
Bridge.Play.prototype.getID = function () {
	return this.id;
};

/**
 * Set the trump
 * @param {string} trump - the new trump suit
 */
Bridge.Play.prototype.setTrump = function (trump) {
	Bridge._checkRequiredArgument(trump);
	Bridge._checkStrain(trump);
	this.trump = trump;
	this.plays[0].setTrump(trump);
};

/**
 * Get the trump suit
 * @return {string} the trump suit
 */
Bridge.Play.prototype.getTrump = function () {
	return this.trump;
};

/**
 * Set the leader
 * @param {string} leader - the new leader
 */
Bridge.Play.prototype.setLeader = function (leader) {
	Bridge._checkRequiredArgument(leader);
	Bridge._checkDirection(leader);
	this.leader = leader;
	this.plays[0].setLeader(leader);
};

/**
 * Get the leader
 * @return {string} the leader
 */
Bridge.Play.prototype.getLeader = function () {
	return this.leader;
};

/**
 * Set the play from string
 * @param {string} play - the play in string format
 */
Bridge.Play.prototype.setPlay = function (play) {
	Bridge._checkRequiredArgument(play);
	this.fromString(play);
};

/**
 * Get the play in string format
 * @return {string} the play in string format
 */
Bridge.Play.prototype.getPlay = function () {
	return this.toString();
};

/**
 * Get a property in this auction.
 * The properties that can be got are as follows<br/>
 * id - string - an unique id for this play<br/>
 * trump - character [ n s h d c] -  the trump for this play<br/>
 * leader - character [ n e s w ] - the leader for this deal<br/>
 * play - string - play as a stirng<br/>
 * @param {string} property - the property to set<br/>
 * @return {mixed} the value of requested property
 * @throws unknown property
 */
Bridge.Play.prototype.get = function (property) {
	var prefix = 'In Play.get';
	Bridge._checkRequiredArgument(property, 'Property', prefix);
	switch (property) {
		case 'id':
			return this.getID();
			break;
		case 'trump':
			return this.getTrump();
			break;
		case "leader":
			return this.getLeader();
			break;
		case 'play':
			return this.getPlay();
			break;
		default:
			Bridge._reportError('Unknown deal property ' + property, prefix);
	}
};

/**
 * Set a property in this play.
 * The properties that can be set are as follows<br/>
 * id - string - an unique id for this play<br/>
 * trump - character [ n s h d c] -  the trump for this play<br/>
 * leader - character [ n e s w ] - the leader for this deal<br/>
 * play - string - play as a stirng<br/>
 * @param {string} property - the property to set<br/>
 * @param {string} value - the value to set the property to
 * @return {boolean} true if property was set, false otherwise
 * @throws unknown property
 */
Bridge.Play.prototype.set = function (property, value) {
	var prefix = 'In Play.set';
	Bridge._checkRequiredArgument(property, 'Property', prefix);
	Bridge._checkRequiredArgument(value, 'Value for Property ' + property, prefix);
	switch (property) {
		case 'id':
			this.setID(value);
			break;
		case 'trump':
			this.setTrump(value);
			break;
		case "leader":
			this.setLeader(value);
		case 'play':
			this.setPlay(value);
			break;
		default:
			Bridge._reportError('Unknown deal property ' + property, prefix);
	}
};

/**
 * Contract is complete, initialize the play
 */
Bridge.Play.prototype.initialize = function () {
	var prefix = "Bridge.Play initialize";
	if (!this.deal) return;
	var contract = this.deal.getAuction().getContract();
	if (!contract.isComplete || contract.numPasses === 4) return;
	this.trump = contract.getSuit();
	this.leader = contract.getLeader();
	this.plays[0] = new Bridge.PlayedCard(0, this.trump, this.leader);
	this.lastPlayIndex = 0;
};

/**
 * Who is next to play?
 * @return {string} nextToPlay
 */
Bridge.Play.prototype.getNextToPlay = function () {
	var prefix = "Bridge.Play getNextToPlay";
	if (this.lastPlayIndex === -1) {
		Bridge._reportError("No play entries have been added. Cannot get next to play", prefix);
	}
	return this.plays[this.lastPlayIndex].getNextToPlay();
};

/**
 * Add a card to this play.
 * @param {string} suit - The suit of this card
 * @param {string} rank - The rank of this card
 * @param {string} [annotation] - optional annotation for this play
 */
Bridge.Play.prototype.addCard = function (suit, rank, annotation) {

	// Identify the card
	var prefix = "In Bridge.Play.addCard";
	suit = suit.toLowerCase();
	rank = rank.toLowerCase();
	Bridge._checkSuit(suit, prefix);
	Bridge._checkRank(rank, prefix);
	var card = this.deal ? this.deal.cards[suit][rank] : new Bridge.Card(suit, rank);

	// Find whose turn it is to play
	var direction = this.getNextToPlay();
	if (this.deal && !this.deal.getHand(direction).hasCard(suit, rank)) {
		Bridge._reportError(suit + rank + " does not belong to " + direction, prefix);
	}
	if (this.cardAdded[suit][rank]) {
		Bridge._reportError(suit + rank + " is already part of play", prefix);
	}

	// Get previous card to determine who wins the trick so far
	var playNumber = this.lastPlayIndex + 1;
	var previousCard = this.plays[this.lastPlayIndex];

	// Create a new play card and add it to play
	var playedCard = new Bridge.PlayedCard(playNumber, card, previousCard, annotation);
	this.plays[this.lastPlayIndex + 1] = playedCard;
	this.lastPlayIndex++;

	// Mark card as played
	this.cardAdded[suit][rank] = true;

	// Trigger events if enabled
	this.onChange("addCard", playedCard);
};

/**
 * Removes the last played card from the play
 */
Bridge.Play.prototype.removeCard = function () {
	var prefix = "In Bridge.Play.removeCard";
	if (this.lastPlayIndex > 0) {

		// Remove the card
		var playedCard = this.plays[this.lastPlayIndex];
		this.plays[this.lastPlayIndex] = null;
		this.lastPlayIndex--;
		if (this.currentPlayIndex > this.lastPlayIndex) {
			this.currentPlayIndex = this.lastPlayIndex;
		}

		// Mark the card as unplayed
		this.cardAdded[playedCard.getSuit()][playedCard.getRank()] = false;

		// Trigger events if enabled
		this.onChange("removeCard", playedCard);
	} else {
		Bridge._reportError("No more plays to remove", prefix);
	}
};

/**
 * Advances the play till the specified index.
 * @param {number} index - The play number to advance to.
 */
Bridge.Play.prototype.playCardTillIndex_ = function (index) {
	var prefix = "In Bridge.Play.playCardTillIndex_";
	if (index < 1 || index > this.lastPlayIndex) {
		Bridge._reportError("Cannot advance because specified play number " + index + " is invalid", prefix);
	}
	if (this.currentPlayIndex >= index) {
		Bridge._reportError("Cannot advance because current play number is at or greater than specified play number " + index, prefix);
	}
	while (this.currentPlayIndex < index) {
		this.currentPlayIndex++;
		var playedCard = this.plays[this.currentPlayIndex];
		this.cardPlayed[play.getSuit()][play.getRank()] = true;

		// Trigger events if enabled
		this.onChange("playCard", playedCard);
	}
	this.onChange("playCardCompleted", playedCard);
};

/**
 * Advance the play by one card.
 */
Bridge.Play.prototype.playCard = function () {
	this.playCardTillIndex_(this.currentPlayIndex + 1);
};

/**
 * Advance the play by one trick.
 */
Bridge.Play.prototype.playTrick = function () {
	var index = this.currentPlayIndex + 1;
	while (index % 4 !== 0) {
		index++;
	}this.playCardTillIndex_(index);
};

/**
 * Advance the play to the end.
 */
Bridge.Play.prototype.playAll = function () {
	var index = this.lastPlayIndex;
	this.playCardTillIndex_(index);
};

/**
 * Rewind the play till the specified index.
 * @param {number} index - The play number to rewind to.
 */
Bridge.Play.prototype.undoPlayCardTillIndex_ = function (index) {
	var prefix = "In Bridge.Play.unplayCardTillIndex_";
	if (index < 0 || index >= this.lastPlayIndex) {
		Bridge._reportError("Cannot rewind because specified play number " + index + " is invalid", prefix);
	}
	if (this.currentPlayIndex <= index) {
		Bridge._reportError("Cannot rewind because current play number is at or lesser than specified play number " + index, prefix);
	}
	while (this.currentPlayIndex > index) {
		var playedCard = this.plays[this.currentPlayIndex];
		this.currentPlayIndex--;
		this.cardPlayed[play.getSuit()][play.getRank()] = false;

		// Trigger events if enabled
		this.onChange("undoPlayCard", playedCard);
	}
	this.onChange("undoPlayCardCompleted", playedCard);
};

/**
 * Undo the play by one card.
 */
Bridge.Play.prototype.undoPlayCard = function () {
	this.undoPlayCardTillIndex_(this.currentPlayIndex - 1);
};

/**
 * Undo the play by one trick.
 */
Bridge.Play.prototype.undoPlayTrick = function () {
	var index = this.currentPlayIndex - 1;
	while (index % 4 !== 0) {
		index--;
	}this.undoPlayCardTillIndex_(index);
};

/**
 * Undo the play all the way to the start.
 */
Bridge.Play.prototype.undoPlayAll = function () {
	var index = 0;
	this.undoPlayCardTillIndex_(index);
};
Bridge.Play.prototype.rewind = Bridge.Play.prototype.undoPlayAll;

/**
 * Remove all added cards in this play
 */
Bridge.Play.prototype.clearCards = function () {
	while (this.lastPlayIndex > 0) {
		this.removeCard();
	}
};

/**
 * Load the play from a string format of play
 * @param {string} play - the play in string format
 */
Bridge.Play.prototype.fromString = function (play) {
	this.clearCards();
	var prefix = 'In Play.fromString';
	var charIndex = 0;
	while (charIndex < play.length) {
		var suit = play[charIndex++].toLowerCase();
		if (charIndex >= play.length) {
			Bridge._reportError("Play ends unexpectedly on suit with no rank", prefix);
		}
		var rank = play[charIndex++].toLowerCase();
		var annotation = null;
		if (play[charIndex] === '{') {
			var endChar = '}';
			var returnValue = Bridge._parseContainedText(play, charIndex, endChar, prefix);
			annotation = returnValue.text;
			charIndex = returnValue.position + 1;
		}
		this.addCard(suit, rank, annotation);
	}
};

/**
 * Load play from a json representation of this play.
 * json is just a string
 * @param {object} json - json representation of this play.
 */
Bridge.Play.prototype.fromJSON = function (json) {
	return this.fromString(json);
};

/**
 * Generate a string display of this play.
 * @return {string} string representation of this play.
 */
Bridge.Play.prototype.toString = function () {
	var output = '';
	for (var i = 1; i <= this.lastPlayIndex; ++i) {
		output += this.plays[i].toString();
	}
	return output;
};

/**
 * Generate a json representation of this play.
 * This is just the string representation
 * @return {object} json representation of this play.
 */
Bridge.Play.prototype.toJSON = function () {
	return this.toString();
};

/**
 * Something in this play has changed.
 * run callbacks.
 */
Bridge.Play.prototype.onChange = function (operation, parameter) {
	if (operation in this.callbacks) {
		_.each(this.callbacks[operation], function (callback) {
			callback(operation, parameter);
		});
	}
	_.each(this.callbacks[""], function (callback) {
		callback(operation, parameter);
	});
	if (this.deal) {
		this.deal.runCallbacks(operation, parameter);
	}
};

/**
 * Defines Played Card class and all methods associated with it.
 */

// Get Namespace.
var Bridge = Bridge || {};

/**
 * Creates a new Bridge Trick.
 * @constructor
 * @memberof Bridge
 * @param {number} playNumber - the number of this play
 * @param {Bridge.Card} card - the current played card
 * @param {Bridge.PlayedCard/string} previousCard - the previous card
 * @param {string} [annotation] - optional annotation for this call
 */
Bridge.PlayedCard = function (playNumber, card, previousCard, annotation) {
	var prefix = "In Bridge.PlayedCard constructor";

	// Playnumber
	var intPlayNumber = _.parseInt(playNumber);
	if (_.isNaN(intPlayNumber) || intPlayNumber < 0 || intPlayNumber > 52) {
		Bridge._reportError("Playnumber : " + playNumber + " is not valid!", prefix);
	}
	if (intPlayNumber > 0 && intPlayNumber !== previousCard.getPlayNumber() + 1) {
		Bridge._reportError("Playnumber : " + playNumber + " does not follow previous playNumber :" + previousCard.getPlayNumber() + "!", prefix);
	}

	/**
  * The number of this play between 0 and 52.
  * @member {number}
  */
	this.playNumber = intPlayNumber;

	// Set some defaults and override them in update function
	/**
  * Who plays next? Based on play number and winning card.
  * @member {string}
  */
	this.nextToPlay = null;

	/**
  * The winning card to this trick after this card has been played.
  * @member {Bridge.PlayedCard}
  */
	this.winningCard = null;

	/**
  * The card that was lead on this trick.
  * @member {Bridge.PlayedCard}
  */
	this.leadCard = null;

	/**
  * The annotation if any associated with this play.
  * @member {string}
  */
	this.annotation = annotation;

	// Special case when playNumber is 0
	if (intPlayNumber === 0) {
		Bridge._checkStrain(card);
		this.trump = card;
		Bridge._checkDirection(previousCard);
		this.leader = previousCard;
		this.nextToPlay = this.leader;
		this.direction = null;
		this.nsTricks = 0;
		this.ewTricks = 0;
		this.clearTableCards_();
		return;
	}

	/**
  * The cards currently played on the table.
  * @member {object}
  */
	this.tableCards = _.clone(previousCard.tableCards);

	/**
  * Num tricks won by north south so far.
  * @member {number}
  */
	this.nsTricks = previousCard.getNSTricks();

	/**
  * Num tricks won by east west so far.
  * @member {number}
  */
	this.ewTricks = previousCard.getEWTricks();

	if (!(card instanceof Bridge.Card) || !(previousCard instanceof Bridge.PlayedCard)) {
		Bridge._reportError("Invalid card or previousCard!", prefix);
	}

	/**
  * The card that has been played.
  * @member {Bridge.Card}
  */
	this.card = card;

	/**
  * The card (possibly null) that was played previously.
  * @member {Bridge.Card}
  */
	this.previousCard = previousCard;

	/**
  * The trump suit
  * @member {string}
  */
	this.trump = this.previousCard.trump;

	/**
  * The original leader for this play
  * @member {string}
  */
	this.leader = this.previousCard.leader;

	/**
  * The direction of this played card
  * @member {string}
  */
	this.direction = this.previousCard.nextToPlay;

	// Update the defaults with correct values
	this.updateInformation_();
};

// 
// Getters and Setters
/**
 * Get the card in this playedcard object
 * @return {object} the card object
 */
Bridge.PlayedCard.prototype.getCard = function () {
	return this.card;
};

/**
 * Get the play number
 * @return {number} the play number
 */
Bridge.PlayedCard.prototype.getPlayNumber = function () {
	return this.playNumber;
};

/**
 * Get the trump
 * @return {string} the trump
 */
Bridge.PlayedCard.prototype.getTrump = function () {
	return this.trump;
};

/**
 * Set the trump
 * Allowed only for dummy play number 0
 * @param {string} trump - the new trump suit
 */
Bridge.PlayedCard.prototype.setTrump = function (trump) {
	var prefix = "In PlayedCard.setTrump";
	Bridge._checkRequiredArgument(trump);
	Bridge._checkStrain(trump);
	if (this.getPlayNumber() !== 0) {
		Bridge._reportError("Cannot update trump for Playnumber : " + this.getPlayNumber() + " ", prefix);
	}
	this.trump = trump;
};

/**
 * Get the leader
 * @return {string} the leade
 */
Bridge.PlayedCard.prototype.getLeader = function () {
	return this.leader;
};

/**
 * Set the leader
 * @param {string} leader - the new leader
 */
Bridge.PlayedCard.prototype.setLeader = function (leader) {
	var prefix = "In PlayedCard.setLeader";
	Bridge._checkRequiredArgument(leader);
	Bridge._checkDirection(leader);
	if (this.getPlayNumber() !== 0) {
		Bridge._reportError("Cannot update leader for Playnumber : " + this.getPlayNumber() + " ", prefix);
	}
	this.leader = leader;
	this.nextToPlay = leader;
};

/**
 * Get the suit of this card
 * @return {string} the suit
 */
Bridge.PlayedCard.prototype.getSuit = function () {
	return this.card.getSuit();
};

/**
 * Get the rank of this card
 * @return {string} the rank
 */
Bridge.PlayedCard.prototype.getRank = function () {
	return this.card.getRank();
};

/**
 * Get the direction who played this card
 * @return {string} direction of hand that played this card
 */
Bridge.PlayedCard.prototype.getDirection = function () {
	return this.direction;
};

/**
 * Get the direction that is next to play
 * @return {string} direction that is next to play
 */
Bridge.PlayedCard.prototype.getNextToPlay = function () {
	return this.nextToPlay;
};

/**
 * Get the winning card after this play
 * @return {object} the winning card
 */
Bridge.PlayedCard.prototype.getWinningCard = function () {
	return this.winningCard;
};

/**
 * Get the lead card for this trick
 * @return {object} the lead card
 */
Bridge.PlayedCard.prototype.getLeadCard = function () {
	return this.leadCard;
};

/**
 * Get the num tricks won by ns
 * @return {number} the num tricks won by ns
 */
Bridge.PlayedCard.prototype.getNSTricks = function () {
	return this.nsTricks;
};

/**
 * Get the num tricks won by ew
 * @return {number} the num tricks won by ew
 */
Bridge.PlayedCard.prototype.getEWTricks = function () {
	return this.ewTricks;
};

/**
 * Clear the cards played to the table.
 */
Bridge.PlayedCard.prototype.clearTableCards_ = function () {
	this.tableCards = {};
	for (var direction in Bridge.directions) {
		this.tableCards[direction] = null;
	}
};

/**
 * Get a property from hand.
 * The properties that can be got are as follows<br/>
 * play_number - number - the play number <br/>
 * trump - string - the strain indicating trump <br/>
 * leader - string - the direction of original leader <br/>
 * card - string - the card of this play<br/>
 * suit - string - the suit of this card<br/>
 * rank - string - the rank of this card<br/>
 * direction - string - direction of hand that played this card<br/>
 * winning_card - Bridge.PlayedCard - the card winning after this play<br/>
 * lead_card - Bridge.PlayedCard - the card lead to this trick<br/>
 * ns_tricks - number - the number of tricks won by ns so far<br/>
 * ew_tricks - number - the number of tricks won by ew so far<br/>
 * next_to_play - string - who is next to play<br/>
 * @param {string} property - the property to get
 */
Bridge.PlayedCard.prototype.get = function (property) {
	var prefix = "In Call.get";
	Bridge._checkRequiredArgument(property, "Property", prefix);
	switch (property) {
		case "play_number":
			return this.getPlayNumber();
			break;
		case "trump":
			return this.getTrump();
			break;
		case "leader":
			return this.getLeader();
			break;
		case "card":
			return this.getCard();
			break;
		case "suit":
			return this.getSuit();
			break;
		case "rank":
			return this.getRank();
			break;
		case "direction":
			return this.getDirection();
			break;
		case "winning_card":
			return this.getWinningCard();
			break;
		case "lead_card":
			return this.getLeadCard();
			break;
		case "ns_tricks":
			return this.getNSTricks();
			break;
		case "ew_tricks":
			return this.getEWTricks();
			break;
		case "next_to_play":
			return this.getNextToPlay();
			break;
		default:
			Bridge._reportError("Unknown property " + property, prefix);
	}
};

/**
 * Update information like lead, winning card, num tricks based previous and current card.
 */
Bridge.PlayedCard.prototype.updateInformation_ = function () {
	// Set to next to play to be lho. Will be changed if this is last card to trick.
	this.nextToPlay = this.previousCard ? Bridge.getLHO(this.getDirection()) : Bridge.getLHO(this.leader);
	// Update table cards
	if (this.playNumber % 4 === 1) {
		this.clearTableCards_();
	}
	this.tableCards[this.direction] = this.card;
	// Start of a new trick
	if (this.playNumber % 4 === 1) {
		this.winningCard = this;
		this.leadCard = this;
		return;
	}

	var winningCard = this.previousCard.winningCard;
	// Set lead to be same as previous card as this is same trick
	this.leadCard = winningCard.getLeadCard();
	var winningSuit = winningCard.getSuit();
	var winningRank = winningCard.getRank();
	var suit = this.getSuit();
	var rank = this.getRank();
	// Set winning card based on trump and rank of this card
	var trump = this.trump;
	if (winningSuit === trump) {
		if (suit === trump && Bridge.isHigherRank(rank, winningRank)) this.winningCard = this;else this.winningCard = winningCard;
	} else {
		if (suit === trump || suit === winningSuit && Bridge.isHigherRank(rank, winningRank)) this.winningCard = this;else this.winningCard = winningCard;
	}
	if (this.playNumber % 4 === 0) {
		// Last card to the trick. Update num tricks and next to play.
		var direction = this.winningCard.getDirection();
		if (Bridge.isNorthSouth(direction)) this.nsTricks++;else this.ewTricks++;
		this.nextToPlay = direction;
	}
};

/**
 * Generate a string display of this card.
 * @return {string} string representation of this card.
 */
Bridge.PlayedCard.prototype.toString = function () {
	var output = "";
	output += this.card.toString();
	if (this.annotation) {
		output += "{" + this.annotation + "}";
	}
	return output;
};

/**
 * @fileOverview UI methods for display of bridge entities.
 * @author Sriram Narasimhan
 * @version 1.0.0
 */

/**
 * Define template registry in lodash/underscore.
 */
var templateRegistry = function () {
	var templateCache = {};

	var mixin = {
		declareTemplate: function declareTemplate(name, template) {
			templateCache[name] = _.template(template);
		},
		renderTemplate: function renderTemplate(name, data) {
			if (templateCache.hasOwnProperty(name)) {
				return templateCache[name](data);
			} else {
				return "No template with name " + name + " was found!";
			}
		}
	};

	return mixin;
}();
_.mixin(templateRegistry);

// Get Namespace.
var Bridge = Bridge || {};

Bridge.getCardHTML = function (card) {
	return "<suit data-suit='" + card[0].toLowerCase() + "'>" + Bridge.suits[card[0].toLowerCase()].html + "</suit><rank data-rank='" + card[1] + "'>" + card[1] + "</rank>";
};

Bridge.getBidHTML = function (bid) {
	if (bid.length < 2) {
		if (bid == "r" || bid == "R") return "XX";
		return bid;
	}
	return bid[0] + "<suit data-suit='" + bid[1].toLowerCase() + "'>" + Bridge.calls[bid[1].toLowerCase()].html + "</suit>";
};

Bridge.getSuitHTML = function (suit) {
	suit = suit.toLowerCase();
	return "<suit data-suit='" + suit + "'>" + Bridge.suits[suit].html + "</suit>";
};

Bridge.replaceSuitSymbolsHTML = function (text) {
	_.each(Bridge.suits, function (suitData, suit) {
		var re = new RegExp('!' + suit, "gi");
		text = text.replace(re, Bridge.getSuitHTML(suit));
	});
	return text;
};

/**
 * Render a template.
 */
Bridge.toHTML = function toHTML(self, config, parameters, operation) {
	config = Bridge._cloneConfig(config);
	_.defaults(config, {
		registerClickHandlers: true,
		registerChangeHandlers: true
	});
	var html = _.renderTemplate(config.template, parameters);
	var wrapperID = Bridge.IDManager.generateID();
	html = "<section id='" + wrapperID + "'>" + html + "</section>";
	if (config.container) {
		var container = $(config.container);
		if (container.length) {
			container.empty().append(html);
			if (config.registerChangeHandlers) {
				self.registerCallback(function () {
					var wrapper = $('#' + wrapperID);
					if (wrapper.length) {
						var html = _.renderTemplate(config.template, parameters);
						wrapper.empty().append(html);
					}
				}, operation);
			}
			if (config.registerClickHandlers) {
				// Register a  click callback handler.
				var selector = '#' + wrapperID + ' [data-operation].enabled';
				$(document).on("click", selector, function () {
					self[$(this).data("operation")]($(this).data());
				});
			}
		}
	}
	return html;
};

/**
 * Render a deal template.
 */
Bridge.Deal.prototype.toHTML = function toHTML(config, operation) {
	return Bridge.toHTML(this, config, { "deal": this, "config": config }, operation);
};

/**
 * Generate html to show dealer and vulnerability based on configuration options.
 * If nothing is specified defaults are used.
 * @param {string} container the container css selector to embed html in
 * @param {object} config the configuration options to use
 * @return {string} html display of this deal's card deck using the passed template.
 */
Bridge.Deal.prototype.showDealerAndVulnerability = function showDealerAndVulnerability(container, config) {
	config = config || {};
	_.defaults(config, {
		container: container,
		template: "deal.dealer_and_vulnerability"
	});
	return this.toHTML(config, ["setVulnerability", "setDealer"]);
};

/**
 * Generate html to show card deck based on configuration options.
 * If nothing is specified defaults are used.
 * @param {string} container the container css selector to embed html in
 * @param {object} config the configuration options to use
 * @return {string} html display of this deal's card deck using the passed template.
 */
Bridge.Deal.prototype.showCardDeck = function showCardDeck(container, config) {
	config = config || {};
	_.defaults(config, {
		container: container,
		template: "deal.card-deck.rows"
	});
	return this.toHTML(config);
};

/**
 * Generate html to show vulnerability info based on configuration options.
 * If nothing is specified defaults are used.
 * @param {string} container the container css selector to embed html in
 * @param {object} config the configuration options to use
 * @return {string} html display of this deal's vulnerability using the passed template.
 */
Bridge.Deal.prototype.showVulnerability = function showVulnerability(container, config) {
	config = config || {};
	_.defaults(config, {
		container: container,
		template: "deal.vulnerability"
	});
	return this.toHTML(config, "setVulnerability");
};

/*
 * Generate html to show dealer info based on configuration options.
 * If nothing is specified defaults are used.
 * @param {string} container the container css selector to embed html in
 * @param {object} config the configuration options to use
 * @return {string} html display of this deal's dealer using the passed template.
 */
Bridge.Deal.prototype.showDealer = function showDealer(container, config) {
	config = config || {};
	_.defaults(config, {
		container: container,
		template: "deal.dealer"
	});
	return this.toHTML(config, "setDealer");
};

/*
 * Generate html to show scoring info based on configuration options.
 * If nothing is specified defaults are used.
 * @param {string} container the container css selector to embed html in
 * @param {object} config the configuration options to use
 * @return {string} html display of this deal's scoring type using the passed template.
 */
Bridge.Deal.prototype.showScoring = function showScoring(container, config) {
	config = config || {};
	_.defaults(config, {
		container: container,
		template: "deal.scoring",
		scoringTypes: ["MPs", "IMPs", "BAM", "Total"]
	});
	return this.toHTML(config, "setScoring");
};

/*
 * Generate html to show problem type info based on configuration options.
 * If nothing is specified defaults are used.
 * @param {string} container the container css selector to embed html in
 * @param {object} config the configuration options to use
 * @return {string} html display of this deal's problem type using the passed template.
 */
Bridge.Deal.prototype.showProblemType = function showProblemType(container, config) {
	config = config || {};
	_.defaults(config, {
		container: container,
		template: "deal.problemType",
		problemTypes: ["Bidding", "Lead"]
	});
	return this.toHTML(config, "setProblemType");
};

/**
 * Render a hand template.
 */
Bridge.Hand.prototype.toHTML = function toHTML(config, operation) {
	return Bridge.toHTML(this, config, { "hand": this, "config": config }, operation);
};

/**
 * Generate html to show hand based on passed template name (which should be registered) and config.
 * If nothing is specified defaults are used.
 * @param {string} container the container css selector to embed html in
 * @param {object} config the configuration options to use
 * @return {string} html display of this hand using the passed template.
 */
Bridge.Hand.prototype.showHand = function showHand(container, config) {
	config = config || {};
	_.defaults(config, {
		container: container,
		template: "hand.cards"
	});
	return this.toHTML(config);
};

/**
 * Generate html to show hand that is on leadbased on passed template name (which should be registered) and config.
 * If nothing is specified defaults are used.
 * @param {string} container the container css selector to embed html in
 * @param {object} config the configuration options to use
 * @return {string} html display of this hand using the passed template.
 */
Bridge.Hand.prototype.showLead = function showHand(container, config) {
	config = config || {};
	_.defaults(config, {
		container: container,
		template: "hand.lead"
	});
	return this.toHTML(config);
};

/**
 * Render a auction template.
 */
Bridge.Auction.prototype.toHTML = function toHTML(config, operation) {
	return Bridge.toHTML(this, config, { "auction": this, "config": config }, operation);
};

/**
 * Generate html to show auction based on passed template name (which should be registered) and config.
 * If nothing is specified defaults are used.
 * @param {string} container the container css selector to embed html in
 * @param {object} config the configuration options to use
 * @return {string} html display of this auction using the passed template.
 */
Bridge.Auction.prototype.showAuction = function showAuction(container, config) {
	config = config || {};
	_.defaults(config, {
		container: container,
		template: "auction.full",
		"addQuestionMark": true
	});
	return this.toHTML(config);
};

/**
 * Generate html to show bidding box based on configuration options.
 * If nothing is specified defaults are used.
 * @param {string} container the container css selector to embed html in
 * @param {object} config the configuration options to use
 * @return {string} html display of this auction's bidding box using the passed template.
 */
Bridge.Auction.prototype.showBiddingBox = function showBiddingBox(container, config) {
	config = config || {};
	_.defaults(config, {
		container: container,
		template: "auction.bidding-box.concise"
	});
	return this.toHTML(config);
};

/**
 * Make a deep copy of the config.
 * @param {Object} config the config to clone.
 * @return a clone of the config.
 */
Bridge._cloneConfig = function _cloneConfig(config) {
	if (config) return _.cloneDeep(config);else return {};
};

/** HAND TEMPLATES */

_.declareTemplate("deal.dealer_and_vulnerability", "<vulnerabilities><%\n  var currentVulnerability = deal.getVulnerability();\n  var names = {\n    '-': \"None\",\n    'n': \"Us\",\n    'e': \"Them\",\n    'b': \"Both\",\n  };\n  if (Bridge.isEastWest(deal.getActiveHand())) {\n    names['n'] = \"Them\";\n    names['e'] = \"Us\";\n  }\n  _.each(Bridge.vulnerabilities, function(item, vulnerability) {\n    %><vulnerability data-operation=\"setVulnerability\" data-vulnerability=<%=vulnerability%> <%\n    if (vulnerability != currentVulnerability) {\n      %>class=\"enabled\" <%\n    } else {\n      %>class=\"disabled current\" <%\n    }\n    %>><%=names[vulnerability]%></vulnerability><%\n  });\n  %></vulnerabilities>");

_.declareTemplate("deal.vulnerability", "<vulnerabilities><%\n  var currentVulnerability = deal.getVulnerability();\n  var names = {\n    '-': \"None\",\n    'n': \"Us\",\n    'e': \"Them\",\n    'b': \"Both\",\n  };\n  if (Bridge.isEastWest(deal.getActiveHand())) {\n    names['n'] = \"Them\";\n    names['e'] = \"Us\";\n  }\n  _.each(Bridge.vulnerabilities, function(item, vulnerability) {\n    %><vulnerability data-operation=\"setVulnerability\" data-vulnerability=<%=vulnerability%> <%\n    if (vulnerability != currentVulnerability) {\n      %>class=\"enabled\" <%\n    } else {\n      %>class=\"disabled current\" <%\n    }\n    %>><%=names[vulnerability]%></vulnerability><%\n  });\n  %></vulnerabilities>");

_.declareTemplate("deal.scoring", "<scoringtypes><%\n  var currentScoring = deal.getScoring();\n  _.each(config.scoringTypes, function(scoringType) {\n    %><scoringtype data-operation=\"setScoring\" data-scoring=\"<%=scoringType%>\" <%\n    if (scoringType != currentScoring) {\n      %>class=\"enabled\" <%\n    } else {\n      %>class=\"disabled current\" <%\n    }\n    %>><%=scoringType%></scoringtype><%\n  });\n  %></scoringtypes>");

_.declareTemplate("deal.problemType", "<problemtypes><%\n    var currentProblemType = deal.getProblemType();\n    _.each(config.problemTypes, function(problemType) {\n      %><problemtype data-operation=\"setProblemType\" data-type=\"<%=problemType%>\" <%\n      if (problemType != currentProblemType) {\n        %>class=\"enabled\" <%\n      } else {\n        %>class=\"disabled current\" <%\n      }\n      %>><%=problemType%></problemtype><%\n    });\n    %></problemtypes>");

_.declareTemplate("deal.dealer", "<directions><%\n  var currentDealer = deal.getDealer();\n  var activeHand = deal.getActiveHand();\n  var dealers = {};\n  dealers[activeHand] = \"Me\";\n  dealers[Bridge.getLHO(activeHand)] = \"LHO\";\n  dealers[Bridge.getRHO(activeHand)] = \"RHO\";\n  dealers[Bridge.getPartner(activeHand)] = \"Partner\";\n  _.each(Bridge.getDirectionOrder(Bridge.getLHO(activeHand)), function(direction) {\n    %><direction data-operation=\"setDealer\" data-dealer=<%=direction%> <%\n    if (direction != currentDealer) {\n      %>class=\"enabled\" <%\n    } else {\n      %>class=\"disabled current\" <%\n    }\n    %>><%=dealers[direction]%></direction><%\n  });\n  %></directions>");

_.declareTemplate("deal.card-deck.rows", "<card-deck><%\n  var activeHand = deal.getActiveHand();\n  var count = 0;\n  %><content><%\n  _.each(Bridge.suitOrder, function(suit) {\n    %><row data-suit=<%=suit%>><%\n    _.each(Bridge.rankOrder, function(rank) {\n      var assignedTo = deal.cards[suit][rank].getDirection();\n      count++;\n      %><card data-card-number=\"<%=count%>\" <% if (assignedTo) {\n        if (assignedTo === activeHand) {\n          %>class=\"enabled assigned\" data-operation=removeCard data-direction=<%=activeHand%> <%\n        } else {\n          %>class=\"disabled assigned\" <%\n        }\n        %>data-assigned=<%=assignedTo%> <%\n      } else {\n        if (deal.getHand(activeHand).getCount() < 13) {\n          %> class=\"enabled unassigned\" data-operation=addCard data-direction=<%=activeHand%> <%\n        } else {\n          %> class=\"disabled unassigned\" data-operation=addCard data-direction=<%=activeHand%> <%\n        }\n        %> class=\"enabled unassigned\" data-operation=addCard data-direction=<%=activeHand%> <%\n      }\n      %>data-suit=<%=suit%> data-rank=<%=rank%>></card><%\n    });\n    count++;\n    %><card data-card-number=\"<%=count%>\" class=\"enabled unassigned\" data-operation=addCard data-direction=<%=activeHand%> data-suit=<%=suit%> data-rank=x></card></row><%\n  });\n  %></content></card-deck>");

/** HAND TEMPLATES */
_.declareTemplate("hand.concise", "<cards><%\n\t_.each(Bridge.suitOrder, function(suit) {\n    %><row><suit data-suit=\"<%=suit%>\"><%=Bridge.suits[ suit ].html%></suit><%\n\t\t_.each( hand.getRanks(suit), function( item ) {\n\t\t\t\t%><rank data-suit=\"<%=suit%>\" data-rank=\"<%=item.rank%>\"><%=item.html%></rank><%\n\t\t});\n    %></row><%\n\t});\n%></cards>");
_.declareTemplate("hand.cards", "<hand><content><%\n    var cards = hand.getCards();\n    var count = 0;\n    _.each(cards, function(card) {\n      count++;\n      %><card class=\"enabled<%\n      if (hand.isSelectedCard(card.suit, card.rank)) {\n        %> selected<%\n      }\n      %>\" data-operation=\"removeCard\" data-card-number=\"<%=count%>\" data-suit=\"<%=card.suit%>\" data-concrete-rank=\"<%=card.concreteRank%>\" data-rank=\"<%=card.rank%>\"></card><%\n    });\n    while (count < 13) {\n  \t\tcount++;\n  \t\t%><card data-card-number=\"<%=count%>\" class=\"unassigned\"></card><%\n  \t}\n\t%></content></hand>");

_.declareTemplate("hand.lead", "<hand><content><%\n    var cards = hand.getCards();\n    var count = 0;\n    _.each(cards, function(card) {\n      count++;\n      %><card class=\"enabled<%\n      if (hand.isSelectedCard(card.suit, card.rank)) {\n        %> selected<%\n      }\n      %>\" data-operation=\"setSelectedCard\" data-card-number=\"<%=count%>\" data-suit=\"<%=card.suit%>\" data-rank=\"<%=card.rank%>\"></card><%\n    });\n    while (count < 13) {\n  \t\tcount++;\n  \t\t%><card data-card-number=\"<%=count%>\" class=\"unassigned\"></card><%\n  \t}\n\t%></content></hand>");

/** AUCTION TEMPLATES */
_.declareTemplate("auction.directions", "\n\t<directions><%\n\t\t_.each(Bridge.getDirectionOrder(config.startDirection), function(direction) {\n\t\t\tvar name = auction.getName(direction);\n      %><direction <% if (auction.isVulnerable(direction)) {%>data-vulnerable<%}\n      %> data-direction=\"<%=direction%>\"><%=name%></direction><%\n\t\t});\n\t%></directions>");

_.declareTemplate("call", "<call data-call=\"<%=call.toString()%>\"><%\n    if (call.call.length === 1) {\n      html = Bridge.calls[call.call].html;\n      %><%=html%><%\n    }\n    else {\n      %><level data-level=\"<%=call.getLevel()%>\"><%=call.call[0]%></level><%\n      %><suit data-suit=\"<%=call.getSuit()%>\"><%=Bridge.calls[call.call[1]].html%></suit><%\n    }\n  %></call>");

_.declareTemplate("auction.calls", "\n  <calls><%\n    _.each(auction.getCalls(config.startDirection, config.addQuestionMark), function(callRow) {\n      %><row><%\n        _.each(callRow, function(call) {\n          if (call instanceof Bridge.Call) {\n            html = _.renderTemplate(\"call\", {\"call\": call});\n            %><%=html%><%\n          }\n          else {\n            %><call data-level=\"0\" data-bid=\"<%=call%>\" data-suit=\"<%=call%>\"><%=call%></call><%\n          }\n        });\n      %></row>\n      <%\n    });\n  %></calls>\n");

_.declareTemplate("auction.full", "<auction><header><%\n    html = _.renderTemplate(\"auction.directions\", {\"auction\": auction, \"config\": config});\n  %><%=html%></header><content><%\n\t  html = _.renderTemplate(\"auction.calls\", {\"auction\": auction, \"config\": config});\n\t%><%=html%></content></auction>");

_.declareTemplate("auction.bidding-box.levels", "<levels><%\n  var selectedLevel = auction.getSelectedLevel();\n  var allowedCalls = auction.getContract().allowedCalls(auction.nextToCall);\n  var minimumAllowedLevel = allowedCalls[\"minimum_level\"];\n  _.each( _.range( 1, 8 ), function(level) {\n    %><level data-operation=setSelectedLevel data-level=<%=level%> class=\"<%\n\t\tif (level === selectedLevel) {%> selected<%}\n\t\tif (level >= minimumAllowedLevel) {%> enabled<%} else {%> disabled<%}\n\t\t%>\"><%=level%></level><%\n  });\n  %></levels>");

_.declareTemplate("auction.bidding-box.calls", "<calls><%\n  var selectedCall = auction.getSelectedCall();\n  var selectedLevel = auction.getSelectedLevel();\n  var allowedCalls = auction.getContract().allowedCalls(auction.nextToCall);\n\tvar pass = ['p'];\n\tvar double = allowedCalls['r'] ? ['r'] : ['x'];\n  var callOrder = pass.concat(double, ['c', 'd', 'h', 's', 'n']);\n  _.each(callOrder, function(call) {\n    var bid = ( Bridge.isStrain(call) ? selectedLevel + call : call );\n    %><call data-operation=\"setSelectedCall\" data-call=<%=call%> data-bid=<%=bid%> class=\"<%\n\t\tif (allowedCalls[bid]) {%> enabled<%} else {%> disabled<%}\n    if (selectedCall == call) {%> selected<%}\n\t\t%>\"><suit data-suit=\"<%=call%>\"><%=Bridge.calls[call].html%></suit></call><%\n  });\n  %></calls>");

_.declareTemplate("auction.bidding-box.concise", "<bidding-box class=\"concise\"><content><%\n    html = _.renderTemplate(\"auction.bidding-box.levels\", {\"auction\": auction, \"config\": config});\n  %><%=html%><%\n    html = _.renderTemplate(\"auction.bidding-box.calls\", {\"auction\": auction, \"config\": config});\n  %><%=html%></content></bidding-box>");

_.declareTemplate("auction.bidding-box.full", "<bidding-box class=\"full\"><content><calls><%\n  var selectedLevel = auction.getSelectedLevel();\n  var allowedCalls = auction.getContract().allowedCalls(auction.nextToCall);\n  var minimumAllowedLevel = allowedCalls[\"minimum_level\"];\n  _.each( _.range( 1, 8 ), function(level) {\n    %><row data-level=\"<%=level%>\"><%\n    var callOrder = ['c', 'd', 'h', 's', 'n'];\n    _.each(callOrder, function(suit) {\n      var call = level + suit;\n      %><call data-operation=\"addCall\" data-call=<%=call%> class=\"<%\n\t\t\tif (allowedCalls[call]) {%> enabled<%} else {%> disabled<%}\n\t\t\t%>\"><%\n      %><level data-level=\"<%=level%>\"><%=level%></level><%\n      %><suit data-suit=\"<%=suit%>\"><%=Bridge.calls[suit].html%></suit></call><%\n    });\n    %></row><%\n  });\n  %></calls></content></bidding-box>");

_.declareTemplate("auction.bidding-box.special_calls", "<row><%\n  var allowedCalls = auction.getContract().allowedCalls(auction.nextToCall);\n  %><call data-operation=\"removeCall\" data-call=\"u\" class=\"<%\n  if (allowedCalls[\"u\"]) {%> enabled<%} else {%> disabled<%}\n  %>\"><suit data-suit=\"u\">Undo</suit></call><%\n  if (allowedCalls['r']) {\n  %><call data-operation=\"addCall\" data-call=\"r\" class=\"<%\n  if (allowedCalls[\"r\"]) {%> enabled<%} else {%> disabled<%}\n  %>\">Redouble</call><%\n  } else {\n  %><call data-operation=\"addCall\" data-call=\"x\" class=\"<%\n  if (allowedCalls[\"x\"]) {%> enabled<%} else {%> disabled<%}\n  %>\">Double</call><%\n  }\n  %><call data-operation=\"addCall\" data-call=\"p\" class=\"<%\n  if (allowedCalls[\"p\"]) {%> enabled<%} else {%> disabled<%}\n  %>\">Pass</call></row>");