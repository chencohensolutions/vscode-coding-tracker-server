//@ts-check
/// <reference path="../index.d.ts" />
/// <reference path="../echarts.d.ts" />

let Utils = {
	expandGroupByDaysObject: (obj, startDate, endDate) => {
		startDate = new Date(startDate);
		if (startDate.getTime() > endDate.getTime())
			throw new Error('startDate could not bigger than endDate');
		var endDateString = getYYYYMMDD(endDate),
			cursorDateString = '';
		var result = {};
		do {
			cursorDateString = getYYYYMMDD(startDate)
			result[cursorDateString] = obj[cursorDateString] || getEmptyCodingWatchingObject();
			startDate.setDate(startDate.getDate() + 1);
		} while (endDateString > cursorDateString);
		return result;
	},

	expandAndShortGroupByHoursObject: (obj, endDate) => {
		var result = {}, i = 24,
			cursorDate = new Date(endDate),
			cursorDateString = '';
		while (i--) {
			cursorDateString = getYYYYMMDD_HHMM(cursorDate);
			result[cursorDateString] = obj[cursorDateString] || getEmptyCodingWatchingObject();
			cursorDate.setHours(cursorDate.getHours() - 1);
		}
		return result;
	},

	orderByName,
	orderByWatchingTime,

	object2array,

	convertUnit2Hour,
	convertUnit2Minutes,

	getEachFieldToFixed2,
	generateChartOption,

	merge,
	getShortProjectName,

	getReadableTimeString,
	getReadableTimeStringFromMap,

	getYYYYMMDD, getMMDD, getHH00,
	getChartDom,

	basename
};
module.exports = Utils;

function basename(path = '', ext = '') {
	let index = path.lastIndexOf('/');
	path = index < 0 ? path : path.slice(index + 1);
	if (ext && path.endsWith(ext))
		path = path.slice(0, -ext.length);
	return path;
}


/**
 * @param {string} chartId
 * @param {JQuery} [parentJqDom]
 */
function getChartDom(chartId, parentJqDom) {
	return (parentJqDom || $(document)).find(`[data-chart="${chartId}"]`);
}

function getEmptyCodingWatchingObject() { return { coding: 0, watching: 0 }; }

/**
 * @param {string} projectName
 * @returns  {string}
 */
function getShortProjectName(projectName) { return (projectName.match(/.*(^|[\\/])(.+)$/) || [])[2] || projectName }


/** @param {string|number} num */
function to2(num) { return num == 0 ? '00' : num < 10 ? `0${num}` : `${num}` }

/** @param {Date} date */
function getYYYYMMDD(date){ return `${date.getFullYear()}-${to2(date.getMonth() + 1)}-${to2(date.getDate())}`}

/** @param {Date} date */
function getYYYYMMDD_HHMM(date) { return `${getYYYYMMDD(date)} ${to2(date.getHours())}:00` }

/** @param {Date} date */
function getMMDD(date) { return `${to2(date.getMonth() + 1)}-${to2(date.getDate())}`}

/** @param {Date} date */
function getHH00(date) { return `${to2(date.getHours())}:00`}

/**
 * @param {any[]} array
 * @param {boolean} [desc]
 * @returns {any[]}
 */
function orderByName(array, desc) {
	let v0 = desc ? -1 : 1, v1 = -v0;
	array.sort((a, b) => a.name > b.name ? v0 : v1);
	return array;
}
/**
 * @param {any[]} array
 * @param {boolean} [desc]
 * @returns {any[]}
 */
function orderByWatchingTime(array, desc) {
	array.sort(desc ? (a, b) => b.watching - a.watching : (a, b) => a.watching - b.watching);
	return array;
}
/**
 * convert object to array. each array item has a "name" field
 * @param {Object} object
 * @returns Object[]
 */
function object2array(object) {
	return Object.keys(object).map(name => { object[name].name = name; return object[name]; });
}

/**
 * Get each field of item in the array. and .toFixed(2)
 * @param {any[]} array
 * @param {string} fieldName
 */
function getEachFieldToFixed2(array, fieldName) {
	return array.map(it => Number(it[fieldName]).toFixed(2));
}

/**
 * @param {string} name
 * @param {'line'|'pie'|'bar'} type
 * @param {any} data
 * @param {any[]} options
 * @returns {EChartOption}
 */
function generateChartOption(name, type, data, ...options) {
	//@ts-ignore
	return $.extend(true, {}, { name, type, data }, ...options);
}

/**
 * @template T
 * @param {T} data
 * @returns {T}
 */
function convertUnit2Hour(data) {
	return convertTimeUnits(data, 3600 * 1000);
}
/**
 * @template T
 * @param {T} data
 * @returns {T}
 */
function convertUnit2Minutes(data) {
	return convertTimeUnits(data, 60 * 1000);
}
/**
 * convert each value in data(object) coding/watching time unit from ms to minValue.
 * such as 120 × 1000 => 2 (minValue=60 × 1000)
 * @template T
 * @param {T} data
 * @param {number} minValue
 * @returns {T}
 */
function convertTimeUnits(data, minValue) {
	let result = Array.isArray(data) ? [] : {};
	for (let key in data) {
		/** @type {WatchingCodingObject} */
		//@ts-ignore
		let it = data[key];
		result[key] = Object.assign({}, data[key], {
			coding: it.coding / minValue,
			watching: it.watching / minValue
		});
	}
	//@ts-ignore
	return result;
}
/**
 * @param {any[]} objects
 * @returns any
 */
function merge(...objects) {
	return $.extend(true, {}, ...objects);
}
/**
 * convert a decimal hour value in a hour minute format
 * such as 1.3 => 1h 18m
 * @param {number} hoursAsFloat
 * @returns {string}
 */
function getReadableTimeString(hoursAsFloat) {
	let hoursAsInt = Math.floor(hoursAsFloat),
		minutesAsInt = Math.floor((hoursAsFloat - hoursAsInt) * 60);
	let hoursString = hoursAsInt ? `${hoursAsInt}h ` : '';
	return `${hoursString}${minutesAsInt}m`;
}

/**
 * convert a decimal data(object) coding/watching time unit in a hour minute format
 * such as 1.3 => 1h 18m
 * @param {CodingWatchingMap} hoursData
 * @returns {CodingWatchingMap}
 */
function getReadableTimeStringFromMap(hoursData) {
	let result = {};
	for (let key in hoursData) {
		let it = hoursData[key];
		result[key] = {
			coding: getReadableTimeString(it.coding),
			watching: getReadableTimeString(it.watching)
		};
	}
	return result;
}
