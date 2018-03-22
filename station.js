/** Load official sign for (official Trafikverket) station name. **/
function getSign(name) {
	sign = "";
	stations = stationList.filter((station) => { return station.label === name });
	(stations != null && stations[0] != null) ? sign = stations[0].value : null;
	return sign;
}

/** String of station names from array of station signs **/
function getStations(signs) {
	stations = "";
	// So why the heck doesn't default param empty array work in junk script?
	if (signs != null) {
		for (i = 0; i < signs.length; ++i) {
			station = stationList.filter((station) => { return station.value === signs[i] })[0];
			station != null ? stations = stations + station.label : null;
			// Comma and space unless last sign
			signs[i+1] != null ? stations = stations + ", " : null;
		}
	}
	return stations;
}

/** Preclude one digit number string with zero. **/
function preZero(n) {
	return n.length < 2 ? "0" + n : n;
}
