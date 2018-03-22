/* global Module */

/* Magic Mirror
 * Module: Trains Trafikverket
 *
 * By Per Gärden, per.garden@avaloninnovation.com
 * MIT Licensed.
 *
 * Based on:
 *  - https://github.com/roramirez/MagicMirror-Module-Template
 *  - https://github.com/Bangee44/MMM-TrainConnections
 *  - http://api.trafikinfo.trafikverket.se/API
 */

Module.register("MMM-Trains-Trafikverket", {

	defaults: {
		// Max number of departures returned from getDepartures call
		count: 5,
		// Retry while loading data every 5 s
		retryDelay: 5 * 1000,
		// Update every 2 minutes
		updateInterval:  2 * 60 * 1000,
	},

	// Required version of MagicMirror
	requiresVersion: "2.1.0",

	start: function() {
		xmlRequest = "<REQUEST>" +
			"<LOGIN authenticationkey='" + this.config.key + "'/>" +
			"<QUERY objecttype='TrainStation'>" +
				"<FILTER/>" +
				"<INCLUDE>CountryCode</INCLUDE>" +
				"<INCLUDE>AdvertisedLocationName</INCLUDE>" +
				"<INCLUDE>LocationSignature</INCLUDE>" +
			"</QUERY>" +
		"</REQUEST>";
		stationList = [];
		module = this;
		module["departureList"] = [];
		updateInterval = this.config.updateInterval;
		AJAXrequest(xmlRequest, function (response) {
			if (response != null) {
				try {
					$(response.RESPONSE.RESULT[0].TrainStation).each(function (iterator, item)
					{
						stationList.push({ country: item.CountryCode, label: item.AdvertisedLocationName, value: item.LocationSignature });
					});
					module.getData(module);
					setInterval(function() {
						module.getData(module);
					}, updateInterval);
				}
				catch (e) { Log.error(e.message); }
			}
		});
	},

	/** Load departures for (official Trafikverket) station name. **/
	getData: function(module) {
		key = module.config.key;
		name = module.config.name;
		departureList = [];
		sign = getSign(name);
		// Trafikverket server appears to be using UTC
		startHour = (new Date()).getTimezoneOffset() / 60;
		stopHour = startHour + 1;
		// We need strings (OK, so this only works with 9 < offset...)
		startHour = startHour < 0 ? "-" + preZero(startHour.toString()[1]) : startHour.toString();
		stopHour = stopHour < 0 ? "-" + preZero(stopHour.toString()[1]) : stopHour.toString();
		if (sign != null && 0 < sign.length) {
			xmlRequest = "<REQUEST version='1.0'>" +
				"<LOGIN authenticationkey='" + key + "'/>" +
				"<QUERY objecttype='TrainAnnouncement' " +
				"orderby='AdvertisedTimeAtLocation' >" +
				"<FILTER>" +
				"<AND>" +
					"<OR>" +
						"<AND>" +
							"<GT name='AdvertisedTimeAtLocation' " +
								"value='$dateadd(" + startHour + ":15:00)' />" +
							"<LT name='AdvertisedTimeAtLocation' " +
								"value='$dateadd(" + stopHour + ":00:00)' />" +
						"</AND>" +
						"<GT name='EstimatedTimeAtLocation' value='$now' />" +
					"</OR>" +
					"<EQ name='LocationSignature' value='" + sign + "' />" +
					"<EQ name='ActivityType' value='Avgang' />" +
				"</AND>" +
				"</FILTER>" +
				// Just include wanted fields to reduce response size.
				"<INCLUDE>InformationOwner</INCLUDE>" +
				"<INCLUDE>AdvertisedTimeAtLocation</INCLUDE>" +
				"<INCLUDE>EstimatedTimeAtLocation</INCLUDE>" +
				"<INCLUDE>TrackAtLocation</INCLUDE>" +
				"<INCLUDE>FromLocation</INCLUDE>" +
				"<INCLUDE>ToLocation</INCLUDE>" +
				"<INCLUDE>Canceled</INCLUDE>" +
			"</QUERY>" +
			"</REQUEST>";
			AJAXrequest(xmlRequest, function (response) {
				if (response != null) {
					try {
						now = (new Date()).getTime();
						$(response.RESPONSE.RESULT[0].TrainAnnouncement).each(function (iterator, item)
						{
							if (!item.canceled) {
								time = new Date(item.AdvertisedTimeAtLocation);
								etime = new Date(item.EstimatedTimeAtLocation);
								delayed = false;
								isNaN(etime.getTime()) ? etime = time : delayed = time < etime;
								// Skip already departed trains
								if (now < time && now < etime) {
									departure = {};
									departure['destination'] = getStations(item.ToLocation);
									departure['delayed'] = delayed;
									departure['ehour'] = preZero(etime.getHours().toString());
									departure['eminute'] = preZero(etime.getMinutes().toString());
									departure['track'] = item.TrackAtLocation;
									departure['operator'] = item.InformationOwner;
									departureList.push(departure);
								}
							}
						});
						module.departureList = departureList;
						module.updateDom();
					}
					catch (e) { Log.error(e.message); }
				}
			});
		} // if (sign != null && 0 < sign.length)
	},

	getDom: function() {
		departures = this.departureList;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		if (departures && 0 < departures.length) {
			table = document.createElement("table");
			for (i = 0; i < this.config.count && i < departures.length; i++) { 
				row = document.createElement("tr");
				cell = document.createElement("td");
				departures[i].delayed ? cell.className = "delayed" : null;
				cell.innerHTML = departures[i].ehour + ":" + departures[i].eminute;
				row.appendChild(cell);
				cell = document.createElement("td");
				cell.innerHTML = departures[i].destination;
				row.appendChild(cell);
				cell = document.createElement("td");
				cell.innerHTML = departures[i].track;
				row.appendChild(cell);
				cell = document.createElement("td");
				cell.innerHTML = departures[i].operator;
				row.appendChild(cell);
				table.appendChild(row);
			}
			wrapper.appendChild(table);
		}

		return wrapper;
	},

	getScripts: function() {
		return ["https://code.jquery.com/jquery-3.3.1.js", "ajax.js", "station.js"];
		// return ["jquery-3.3.1.js", "ajax.js", "station.js"];
	},

	getStyles: function () {
		return [
			"MMM-Trains-Trafikverket.css",
		];
	},
});
