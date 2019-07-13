/**
 * 
 * @param {object} responseData
 * @description converts ArrayBuffer to a base64 string which needs to be used on a multipart post. 
 */
function getBase64FromArrayBuffer(responseData) {
	var uInt8Array = new Uint8Array(responseData),
	i = uInt8Array.length,
	binaryString = new Array(i);
    while (i--){
		binaryString[i] = String.fromCharCode(uInt8Array[i]);
	}
    var data = binaryString.join(''),
		base64 = window.btoa(data);
    return base64;
}

/**
 * 
 * @param {object} data 
 * @description returns a request header object from the recieved header string
 */
function unpackHeaders(data) {
	
    if (data === null || data === "") {
        return [];
    }
    var vars = {}, hash;
    var hashes = data.split('\n');
    var header;

    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i];
        if (!hash) {
            continue;
        }

        var loc = hash.search(':');

        if (loc !== -1) {
			var name = hash.substr(0, loc).trim(),
			value = hash.substr(loc + 1).trim();
            vars[name] = value;
        }
    }

    return vars;
}

/**
 * 
 * @param {object} headers object containing all the headers
 * @returns {boolean} true or false
 * @description returns true if Content-Type header has image in multipart/form-data
 */

function isContentTypeImage(headers) {
	if ("Content-Type" in headers) {
		var contentType = headers["Content-Type"];
		return (contentType.search(/image/i) >= 0);
	}
	return false;
}


/**
 * 
 * @param {array} myArray an array
 * @param {string} searchTerm value to search
 * @param {string} property given key
 * @returns {number}
 * @description return index if found else -1. Usage arrayObjectIndexOf(items, "Washington", "city");
 */
function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}


/**
 * 
 * @param {object} body contains the data sent through via form
 * @description  it returns set of key/value pairs representing form fields and their values, which can then be easily sent using the XMLHttpRequest.send() method. 
 */
function getFormData(body) {
	var paramsBodyData = new FormData();
	for(var i = 0, len = body.length; i < len; i++) {
		if (body[i].enabled === false) {
			continue;
		}
		if(!body[i].hasOwnProperty("name") && body[i].hasOwnProperty("key")) {
			body[i].name = body[i].key;
		}
		if (body[i].type === "text") {
			paramsBodyData.append(body[i].name, body[i].value);
		}
		else if (body[i].type === "file") {
			var files = body[i].value;
			var fileName = body[i].fileName;
			var newBuffer;
			var buffers = [];
			for(var j = 0; j < files.length; j++) {
				newBuffer = ArrayBufferEncoderDecoder.decode(files[j]);
				buffers.push(newBuffer);
			}

			//Zendesk 2322 - Interceptor not respecting mime types of files
			var blobs = null;
			if(body[i].hasOwnProperty("mimeType")) {
				blobs = new Blob(buffers, {type: body[i].mimeType});
			}
			else {
				blobs = new Blob(buffers);
			}

			paramsBodyData.append(body[i].name, blobs, fileName);
		}
		else {
			//no type specified
			//assume text
			paramsBodyData.append(body[i].name, body[i].value);
		}

	}
	return paramsBodyData;
}
 
/**
 * 
 * @param {object} headers 
 * @param {string} name 
 * @description finds a header with a name in an array of headers
 */
function getHeader(headers, name) {
	for(var i = 0; i < headers.length; i++) {
		if (headers[i].name.toUpperCase() === name.toUpperCase()) {
			return i;
		}
	}
	return -1;
}
/**
 * 
 * @param {object} headerArray
 * @description returns an object containing raw headers (string) and header object
 */

function getHeadersObjectAndStringFromArray(headerArray) {
	var numHeaders = headerArray.length;
	var rawHeaders = "";
	var headers = {};
	for(var i=0;i<numHeaders;i++) {
		rawHeaders += headerArray[i].name+": "+headerArray[i].value+"\n";
		headers[headerArray[i].name] = headerArray[i].value;
	}
	return {
		"raw": rawHeaders,
		"obj": headers
	};
}

/**
 * 
 * @param {object} details
 * @description returns response object
 */

function convertRedirectResponse(details) {
	var headerTypes = getHeadersObjectAndStringFromArray(details.responseHeaders);
	var response = {
		headers: headerTypes.obj,
		rawHeaders: headerTypes.raw,
		readyState: 4,
		response: "",
		responseText: "",
		status: details.statusCode,
		statusText: details.statusLine.split(" ").slice(2).join(" "), //or take from a map
		timeout: 0,
		withCredentials: false
	};
	return response;
}

// TODO : need to include the body if captured requests are sent to native apps
/**
 * 
 * @param {string} method 
 * @returns {boolean} checks whether the method is valid or not
 */
function isMethodWithBody(method) {
    var methodsWithBody = ["POST", "PUT", "PATCH", "DELETE", "LINK", "UNLINK", "LOCK", "PROPFIND", "OPTIONS"];
    method = method.toUpperCase();
    return methodsWithBody.indexOf(method)!==-1;
}

/**
 * 
 * @param {string} methods GET, POST, DELETE etc.
 * @returns {string} label (different css classes) for different methods 
 * @description returns a string represeting class for the span tag for styling in popup
 */
function addClassForRequest(methods) {
	var color = '';
	switch (methods) {
		case "GET":
			color = " label-success";
			break;
		case "POST":
			color = " label-warning";
			break;
		case "PUT":
			color = " label-primary";
			break;
		case "DELETE":
			color = " label-danger";
			break;
		default:
			color = " label-default";
			break;
	}
	return 'label' + color;
}