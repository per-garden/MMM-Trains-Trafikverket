function AJAXrequest(postedData, callback) {
	$.ajax({
		type: "POST",
		contentType: "text/xml",
		url: "http://api.trafikinfo.trafikverket.se/v1/data.json",
		data: postedData,
		dataType: "json",
		success: callback
	});
}
