export const MSTMassage = function (param1, param2) {
	if (typeof param1 !== 'string') {
		throw new Error('MSTErrorInputNotValid');
	}

	if (typeof param2 !== 'string') {
		throw new Error('MSTErrorInputNotValid');
	}

	return _MSTMassageTerminate(_MSTMassageOperations(param2).reduce(function (coll, item) {
		return (item.MSTOperationCallbackIndirect || item.MSTOperationCallback)(coll);
	}, param1));
};

export const _MSTMassageOperations = function (inputData) {
	if (typeof inputData !== 'string') {
		throw new Error('MSTErrorInputNotValid');
	}

	if (!inputData) {
		return [];
	}

	return [].concat.apply([], [inputData.split('.')[0]].concat((inputData.match(/\.(\w+)(\([^]+\))?(\[[^]+\])?/g) || []).map(function (e) {
		const match = e.match(/(\[[^]+\])?$/);
		return [e.slice(0, match.index).split('.').slice(1).join('.')].concat(match[0] || []);
	}))).map(function (operationString) {
		return __MSTMassageOperations().map(function (e) {
			return {
				match: operationString.match(e.MSTOperationPattern),
				operation: e,
			};
		}).filter(function (e) {
			return e.match;
		}).slice(0, 1).map(function (e) {
			if ((e.operation.MSTOperationInputTypes || '').match('Regex')) {
				const callback = e.operation.MSTOperationCallback;
				
				e.operation.MSTOperationCallback = function (inputData) {
					return callback(inputData, new RegExp(e.match[1], e.match[2]));
				};
			} else if (typeof e.match.index !== 'undefined') {
				const callback = e.operation.MSTOperationCallback;
				
				e.operation.MSTOperationCallback = function (inputData) {
					return callback(inputData, e.match[1]);
				};
			};

			return e.operation;
		}).shift();
	});
};

export const __MSTMassageOperations = function () {
	return [{
		MSTOperationPattern: /root/,
		MSTOperationCallback: _MSTOperations._MSTBypass
	}, {
		MSTOperationPattern: /lines/,
		MSTOperationInputTypes: 'String',
		MSTOperationCallback: _MSTOperations.MSTStringLines
	}, {
		MSTOperationPattern: /isMatch\(\/([^]+)\/(\w)?\)/,
		MSTOperationInputTypes: 'String,Regex',
		MSTOperationCallback: _MSTOperations.MSTStringIsMatch,
	}, {
		MSTOperationPattern: /matchArray\(\/([^]+)\/(\w)?\)/,
		MSTOperationInputTypes: 'String,Regex',
		MSTOperationCallback: _MSTOperations.MSTStringMatchArray,
	}, {
		MSTOperationPattern: /first/,
		MSTOperationInputTypes: 'Array',
		MSTOperationCallback: _MSTOperations.MSTArrayFirst,
	}, {
		MSTOperationPattern: /last/,
		MSTOperationInputTypes: 'Array',
		MSTOperationCallback: _MSTOperations.MSTArrayLast,
	}, {
		MSTOperationPattern: /^\[([^]+)\]$/,
		MSTOperationInputTypes: 'Array',
		MSTOperationCallback: _MSTOperations.MSTArrayAccess,
	}];
};

export const _MSTMassageTerminate = function (inputData) {
	return __MSTMassageTerminateFunction(inputData)(inputData);
};

export const __MSTMassageTerminateFunction = function (inputData) {
	if (typeof inputData !== 'string') {
		return JSON.stringify;
	}

	return _MSTOperations._MSTBypass;
};

export const _MSTOperations = {
	
	_MSTBypass (inputData) {
		return inputData;
	},
	
	MSTStringLines (inputData) {
		return inputData.split('\n').filter(function (e) {
			return e.length;
		});
	},
	
	MSTStringIsMatch (param1, param2) {
		if (typeof param1 !== 'string') {
			throw new Error('MSTErrorInputNotValid');
		}

		if (!(param2 instanceof RegExp)) {
			throw new Error('MSTErrorInputNotValid');
		};

		return !!param1.match(param2);
	},
	
	MSTStringMatchArray (param1, param2) {
		if (typeof param1 !== 'string') {
			throw new Error('MSTErrorInputNotValid');
		}

		if (!(param2 instanceof RegExp)) {
			throw new Error('MSTErrorInputNotValid');
		};

		const match = param1.match(param2);

		if (!match) {
			return [];
		};

		if (match.length <= 1) {
			return [];
		};

		return (typeof match.index !== 'undefined' ? [match] : match.map(function (e) {
			return param2.exec(e.match(param2)); // #mysterious result is null unless match is called
		})).map(function (e) {
			return e.reduce(function (coll, item, index) {
				if (index) {
					coll[index] = item;
				};

				return coll;
			}, {})
		});
	},
	
	MSTStringMap (param1, param2) {
		if (typeof param1 !== 'string') {
			throw new Error('MSTErrorInputNotValid');
		}

		if (!(param2 instanceof RegExp)) {
			throw new Error('MSTErrorInputNotValid');
		};

		const match = param1.match(param2);

		if (!match) {
			return {};
		};

		return match.reduce(function (coll, item, index) {
			if (index) {
				coll[index] = item;
			};

			return coll;
		}, {});
	},
	
	MSTArrayAccess (param1, param2) {
		if (!Array.isArray(param1)) {
			throw new Error('MSTErrorInputNotValid');
		}

		return param1[param2];
	},
	
	MSTArrayFirst (inputData) {
		if (!Array.isArray(inputData)) {
			throw new Error('MSTErrorInputNotValid');
		}

		return inputData[0];
	},
	
	MSTArrayLast (inputData) {
		if (!Array.isArray(inputData)) {
			throw new Error('MSTErrorInputNotValid');
		}

		return inputData.slice(-1).pop();
	},

};
