/**
 * @type {array}
 * @description an array to hold blacklisted ids which can't send messages to interceptor as external agent
 */
var blacklistedIds = ["none"],

  /**
   * @type {enum}
   * @description for storing postman message types
   */
  postmanMessageTypes = {
    xhrError: "xhrError",
    xhrResponse: "xhrResponse",
    captureStatus: "captureStatus",
    capturedRequest: "capturedRequest"
  },

  /**
   * @type {boolean}
   * @description indicates status of popup connected. Once popup is opened, it's connected and it can start listening
   */
  popupConnected = false,


  /**
   * @description placeholder for the background page port object for transferring log msgs
   */
  BackgroundPort,

  /**
   * @type {object}
   * @description object store to cache captured requests
   */
  requestCache = {},

  /**
   * @type {number}
   * @description storing last N (maxItems) log messages
   */
  maxItems = 10,
  logCache = new Deque(maxItems),

  background = this,

  /**
   * @type {object}
   * @description Options which are shared with Extension Popup.
   */
  appOptions = {
    isCaptureStateEnabled: false,
    filterRequestUrl: '.*'
  },

  /**
   * @type {object}
   * @description options for capturing requests for Postman Native App
   */
  appCaptureRequestOptions = {
    filterRequestUrl: '.*',
    filterRequestMethods: [],
    captureRequestEnabled : false,
    captureResponse: false
  },

  // requestId is a chrome-specific value that we get in the onBeforeSendHeaders handler
  // postman-interceptor-token is a header (X-Postman-Interceptor-Id) that we add in the interceptor code
  requestTokenMap = {}, // map from postman-interceptor-token to postmanMessage and requestId.
  requestIdMap = {}, // map from requestId to postmanMessage and postman-interceptor-token.
  CUSTOM_INTERCEPTOR_HEADER = "X-Postman-Interceptor-Id",

  restrictedChromeHeaders = [
    "ACCEPT-CHARSET",
    "ACCEPT-ENCODING",
    "ACCESS-CONTROL-REQUEST-HEADERS",
    "ACCESS-CONTROL-REQUEST-METHOD",
    "CONTENT-LENGTHNECTION",
    "CONTENT-LENGTH",
    "COOKIE",
    "CONTENT-TRANSFER-ENCODING",
    "DATE",
    "DNT",
    "EXPECT",
    "HOST",
    "KEEP-ALIVE",
    "ORIGIN",
    "REFERER",
    "TE",
    "TRAILER",
    "TRANSFER-ENCODING",
    "UPGRADE",
    "USER-AGENT",
    "VIA"
  ],

  postmanCheckTimeout = null,
  isPostmanOpen = true,
  /**
   * @type {object}
   * @description object to store open port for interceptor bridge.
   */
  nativePort = null,

  nativePortPinger = null,
  lastNativeMessagingErrorMessage,

  /**
   * @type {object}
   * @description cookie sync options (will be fetched from chrome's local storage on each boot)
   */
  appCookieSyncOptions = {
    syncEnabled: false,
    syncDomainList: []
  },

  /**
   * @type {array}
   * @description an array to store the updated cookies while chrome.cookie.onChanged listener is called
   * this is cleared every time the updatedCookies are sent to Postman
   */
  updatedCookies = [],

  /**
   * @type {array}
   * @description an array to store the removed cookies while chrome.cookie.onChanged listener is called
   * this is cleared every time the removedCookies are sent to Postman
   */
  removedCookies = [],

  /**
   * @type {string}
   * @description secret passphrase (key) to be used for encryption/decryption
   * of payloads sent b/w the interceptor and the native app
   */
  secretKey = 'postman_default_key',

  /**
   * @type {boolean}
   * @description used to preserve the state to avoid the multiple logs of KEY_MISMATCH errors
   * It becomes true after first KEY_MISMATCH error occurs to avoid showing further KEY_MISMATCH errors
   */
  postmanAppKeyMismatch = false,

  /**
   * @type {boolean}
   * @description used to avoid showing multiple native messaging host not found error
   */
  nativeHostInstalled = true;

/**
 * @description it is used to log the errors/messages in background page and sends the same to the popup if the port is connected
 */
const interceptor = {
  log: function(msg) {
    console.log(msg)
    // sends the log message to popup.html
    if (BackgroundPort) {
      try {
        BackgroundPort.postMessage({
          type: 'backgroundLog',
          backgroundMessage: msg
        });
      }
      catch (err) {
        // don't care as port might be disconnected
      }
    }
  }
},

/**
 * @description default paylod used for encryption key validation at App and Interceptor
 */
DEFAULT_KEY_VALIDATION_PAYLOAD = {
  type: 'KEY_VALIDATION_STRING',
  message: 'Default key validation string'
};

/**
 *
 * @param {boolean} isOpen true or false
 * @description sets postman open or not
 */
function setPostmanOpenStatus(isOpen) {
  if (isOpen) {
    popupConnected && BackgroundPort.postMessage({
      isPostmanOpen: true
    });
  }
  else {
    popupConnected && BackgroundPort.postMessage({
      isPostmanOpen: false
    });
  }
}
/**
 * @description sets the interceptor icon blue
 */
function setBlueIcon() {
  chrome.browserAction.setIcon({
    path: 'interceptor_48x48_blue.png'
  });
}
/**
 * @description sets the interceptor icon orange
 */
function setOrangeIcon() {
  chrome.browserAction.setIcon({
    path: 'interceptor_48x48.png'
  });
}

/**
 *
 * @param {object} postmanMessage
 * @param {object} error
 * @description sends any errors to postman encountered when XHR was loaded
 */
function sendErrorToPostman(postmanMessage, error) {
  var guid = postmanMessage.guid;

  var customAppId = postmanMessage.postmanAppId;
  if (!customAppId) {
    customAppId = postmanAppId;
  }

  chrome.runtime.sendMessage(
    customAppId,
    {
      "postmanMessage": {
        "guid": guid,
        "type": postmanMessageTypes.xhrError,
        "error": error
      }
    },
    function(response) {
      console.log("Received response", response);
    }
  );
}


/**
 *
 * @param {object} postmanMessage
 * @param {object} response
 * @param {object} cookies
 * @description called after the XHR has loaded. Sends the reponse to Postman
 */

function sendResponseToPostman(postmanMessage, response, cookies) {
  var guid = postmanMessage.guid;

  var customAppId = postmanMessage.postmanAppId;
  if (!customAppId) {
    customAppId = postmanAppId;
  }
  chrome.runtime.sendMessage(
    customAppId,
      {
        "postmanMessage": {
          "guid": guid,
          "type": postmanMessageTypes.xhrResponse,
          "response": response,
          "cookies": cookies
        }
      },
      function(response) {
        // console.log("Received response", response);
    }
  );
}

/**
 * @param {string} cookieHeader - this a single header value (for the Cookie header)
 * @param {string} url - the URL of the request the header was added to
 * @description - This adds cookies from the cookie header (set in Postman) to chrome's cookie store,
 * so that's it's added by Chrome when the request are sent
 */
function setCookiesFromHeader(cookieHeader, url) {
  var cookies = cookieHeader.split(";");
  var numCookies = cookies.length;
  var retVal = [];
  for (var i = 0; i < numCookies; i++) {
    var thisCookie = cookies[i].trim().split("=");
    if (thisCookie.length >= 1) {
      // Added this to allow cookie values to have '='
      // Zendesk 1344
      try {
        var cName = thisCookie.splice(0, 1)[0]; // this is the part before the first =
        var cValue = thisCookie.join("="); // part after the first =
        chrome.cookies.set({
          url: url,
          name: cName,
          value: cValue
        });
      }
      catch (e) {
        console.log("Error setting cookie: " + e);
      }
    }
  }
}

/**
 *
 * @param {object} postmanMessage
 * @description this function sends the XHR on behalf of postman
 */
function sendXhrRequest(postmanMessage) {

  var currentRequest = postmanMessage.request,
    i, len;

  var headers = currentRequest.headers,
    cookies = [],
    xPostmanInterceptorId = postmanMessage.guid;

  // Adds the prefix: Postman- before all restricted headers,
  // so that they can be added to the xhr object now
  // and the prefix modified using chrome's APIs later
  for (i = 0, len = headers.length; i < len; i++) {
    if (!headers[i].hasOwnProperty("name")) {
      headers[i].name = headers[i].key;
    }
    var upperCasedHeader = headers[i].name.toUpperCase();
    if (upperCasedHeader === "COOKIE") {
      // cookies are added directly into chrome's cookie store
      cookies = setCookiesFromHeader(headers[i].value, currentRequest.url);
    }
    else {
      // unsafe headers are wrapped with Postman- temporarily
      var found = restrictedChromeHeaders.indexOf(upperCasedHeader) >= 0;
      if (found) {
        headers[i].name = "Postman-" + headers[i].name;
      }
      else if (upperCasedHeader.indexOf("PROXY-") === 0 || upperCasedHeader.indexOf("SEC-") === 0) {
        headers[i].name = "Postman-" + headers[i].name;
      }
    }
  }

  var url = currentRequest.url;
  var dataMode = currentRequest.dataMode;
  var xhrTimeout = currentRequest.xhrTimeout;

  // bootstrapping XHR and setting up callbacks
  var xhr = new XMLHttpRequest();
  xhr.onload = function(xhr, postmanMessage, xPostmanInterceptorId) {
    return function() {
      if (!requestTokenMap[xPostmanInterceptorId]) {
        // Do not continue if the map entry for this request has been cleared.
        // Could have happened due to the redirect being intercepted
        return;
      }


      // delete both map entries for this request
      // so that this response isn't sent to Postman again
      var requestId = requestTokenMap[xPostmanInterceptorId].requestId;
      delete requestIdMap[requestId];
      delete requestTokenMap[xPostmanInterceptorId];

      var response;
      // RESPONSE HEADERS
      // eslint-disable-next-line no-undef
      var unpackedHeaders = unpackHeaders(xhr.getAllResponseHeaders());
      var rawHeaders = xhr.getAllResponseHeaders();

      if (xhr.responseType === "arraybuffer") {
        response = {
          "readyState": xhr.readyState,
          // eslint-disable-next-line no-undef
          "response": getBase64FromArrayBuffer(xhr.response),
          // "responseText": xhr.responseText,
          "responseType": xhr.responseType,
          "status": xhr.status,
          "statusText": xhr.statusText,
          "timeout": xhr.timeout,
          "withCredentials": xhr.withCredentials,
          "rawHeaders": rawHeaders,
          "headers": unpackedHeaders
        };

        // console.log("Received arraybuffer response", response);
      }
      else {
        // if contenttype is image, there's no need to send the request again, with contenttype=arraybuffer
        response = {
          "readyState": xhr.readyState,
          "response": xhr.response,
          "responseText": xhr.responseText,
          "responseType": xhr.responseType,
          "status": xhr.status,
          "statusText": xhr.statusText,
          "timeout": xhr.timeout,
          "withCredentials": xhr.withCredentials,
          "rawHeaders": rawHeaders,
          "headers": unpackedHeaders
        };
      }

      chrome.cookies.getAll({
        url: url
      }, function(cookies) {
        sendResponseToPostman(postmanMessage, response, cookies);
      });
    }
  }(xhr, postmanMessage, xPostmanInterceptorId);

  xhr.onerror = function(postmanMessage) {
    return function(event) {
      sendErrorToPostman(postmanMessage, {
        "status": event.target.status,
        "statusText": event.target.statusText
      });
    }
  }(postmanMessage);

  xhr.ontimeout = function(postmanMessage) {
    return function(event) {
      sendErrorToPostman(postmanMessage, {
        "status": event.target.status,
        "statusText": event.target.statusText
      });
    }
  }(postmanMessage);

  if (xhrTimeout !== 0) {
    xhr.timeout = xhrTimeout;
  }

  xhr.responseType = currentRequest.responseType;
  xhr.open(currentRequest.method, url, true);

  for (i = 0; i < headers.length; i++) {
    // sets the headers on XHR with Postman- prefix
    // at which point the onBeforeSendHeaders removes the Postman- prefix
    if (headers[i].enabled === false) {
      continue;
    }
    try {
      xhr.setRequestHeader(headers[i].name, headers[i].value);
    }
    catch (e) {
      console.error(e);
      console.log("Continuing after header failure");
    }
  }
  xhr.setRequestHeader(CUSTOM_INTERCEPTOR_HEADER, xPostmanInterceptorId);

  if ("body" in currentRequest) {
    var body = currentRequest.body;
    if (dataMode === "binary") {
      body = ArrayBufferEncoderDecoder.decode(currentRequest.body);
      //console.log("Decoded body", body);
    }
    else if (dataMode === "params") {
      // eslint-disable-next-line no-undef
      body = getFormData(currentRequest.body);
    }
    xhr.send(body);
  } else {
    xhr.send();
  }

  // this is a global map of postmanMessage objects
  // needed to send the redirect response to the correct tab
  requestTokenMap[xPostmanInterceptorId] = {
    postmanMessage: postmanMessage
  }
}


/**
 *
 * @param {object} details
 * @description returns an edited header object with retained postman headers
 */
function onBeforeSendHeaders(details) {
  var hasRestrictedHeader = _.find(details.requestHeaders, function(headerObject) {
      return headerObject.name.indexOf("Postman-") === 0;
    }),
    hasPostmanInterceptorTokenHeader = _.find(details.requestHeaders, function(headerObject) {
      return headerObject.name == CUSTOM_INTERCEPTOR_HEADER
    }),
    requestHeaders = details.requestHeaders,
    index,
    name,
    prefix = "Postman-",
    prefixLength = prefix.length,
    newHeaders = [], // array to hold all headers sent by postman
    n,
    os = [],
    ds = [],
    i = 0,
    j = 0,
    term;

  if (hasPostmanInterceptorTokenHeader && !requestIdMap[details.requestId]) {
    // The request was sent from Postman, and this is the first time
    // requestIdMap is being populated
    requestTokenMap[hasPostmanInterceptorTokenHeader.value].requestId = details.requestId;
    requestIdMap[details.requestId] = {
      postmanMessage: requestTokenMap[hasPostmanInterceptorTokenHeader.value].postmanMessage,
      requestToken: hasPostmanInterceptorTokenHeader.value
    };
  }

  // runs only if a header with a Postman- prefix is present
  // headers with the postman- prefix were modified earlier, and the prefix needs to be stripped out now
  if (hasRestrictedHeader) {
    var len;
    for (i = 0, len = requestHeaders.length; i < len; i++) {
      name = requestHeaders[i].name;

      // for all headers that are being sent by Postman
      if (name.search(prefix) === 0 && name !== "Postman-Token") {
        n = requestHeaders[i].name.substr(prefixLength);

        // push them in newHeaders
        newHeaders.push({
          "name": n,
          "value": requestHeaders[i].value
        });

        // remove from oldheaders
        requestHeaders.splice(i, 1);
        len--;
        i--;
      }
    }

    for (var k = 0; k < newHeaders.length; k++) {
      requestHeaders.push(newHeaders[k]);
    }

    delete requestCache[details.requestId];
  }

  return {
    requestHeaders: requestHeaders
  };
}


/**
 *
 * @param {object} request
 * @param {object} sender
 * @param {object} sendResponse
 * @description responds to a message from postman if sender id is not blacklisted
 */
function onExternalMessage(request, sender, sendResponse) {
  if (sender && (sender.id in blacklistedIds)) {
    sendResponse({
      "result": "sorry, could not process your message"
    });
    return;
  }
  else if (request.postmanMessage) {
    sendResponse({
      "result": "Ok, got your message"
    });

    var type = request.postmanMessage.type;

    if (type === "xhrRequest") {
      sendXhrRequest(request.postmanMessage);
    }
    else if (type === "detectExtension") {
      sendResponse({
        "result": true
      });
    }
  }
  else {
    sendResponse({
      "result": "Oops, I don't understand this message"
    });
  }
}

/**
 *
 * @param {object} request
 * @description filters requests before sending it to postman
 */
function filterCapturedRequestForChromeApp(request) {
  var urlRegex = new RegExp(appOptions.filterRequestUrl, "gi");
  var validRequestTypes = ["xmlhttprequest", "main_frame", "sub_frame"];
  return (_.contains(validRequestTypes, request.type) && request.url.match(urlRegex));
}

/**
 *
 * @param {object} request
 * @description filters requests based on URL, methods (received from Postman Native App) before sending to Postman Native App
 * @returns boolean - whether the given request matches the current filters or not
 */
function filterCapturedRequestForPostmanNativeApp(request) {
  // URL pattern to match against
  var urlRegex = new RegExp(appCaptureRequestOptions.filterRequestUrl, "gi"),

    // list of methods provided by the user in the Postman app
    validRequestMethods = appCaptureRequestOptions.filterRequestMethods.map((method) => {
      return method.toLowerCase();
    }),

    validRequestTypes = ["xmlhttprequest", "main_frame", "sub_frame"];

  return (
    // requests for scripts and stylesheets are excluded
    _.contains(validRequestTypes, request.type)
    &&
    // either there's no method whitelist, or the request matches one of the given methods
    (validRequestMethods.length === 0 || _.contains(validRequestMethods, request.method.toLowerCase()))
    &&
    // the request URL matches the given URL regex, if provided
    (!appCaptureRequestOptions.filterRequestUrl || request.url.match(urlRegex))
  );
}

/**
 *
 * @param {object} request
 * @description whether the request matches either the Chrome App's or Native App's filters
 */
function filterCapturedRequestForEitherApp(request) {
  return filterCapturedRequestForChromeApp(request) || filterCapturedRequestForPostmanNativeApp(request);
}

/**
 *
 * @param {object} details
 * @description fires when a redirect is about to be executed
 */
function onBeforeRedirect(details) {
  // send this response to Postman
  // set request.sendResponse for this request in cache to fals
  var requestId = details.requestId;
  if (!requestIdMap[requestId]) {
    // not there in pending requests
    return;
  }
  var postmanMessage = requestIdMap[requestId].postmanMessage,
    followRedirect = postmanMessage.autoRedirect;

  // If postman had set the auto-follow-redirect to false,
  // we need to intercept the 3xx and send the intermediate response to Postman
  // When interceptor receives the final response, the map won't have the record,
  // so the actual response won't be forwarded
  if (followRedirect === false) {
    // eslint-disable-next-line no-undef
    var responseForPostman = convertRedirectResponse(details);

    // delete the two entries for this request
    delete requestTokenMap[requestIdMap[requestId].requestToken];
    delete requestIdMap[requestId];

    chrome.cookies.getAll({
      url: details.url
    }, function(cookies) {
      console.log("Sending redirect response to Postman", responseForPostman);
      sendResponseToPostman(postmanMessage, responseForPostman, cookies);
    });
  }
}

/**
 *
 * @param {object} details
 * @description  for filtered requests sets a key in requestCache
 */
function onBeforeRequest(details) {
  if (
    filterCapturedRequestForEitherApp(details) && 
    !isPostmanRequest(details) && 
    (appOptions.isCaptureStateEnabled || appCaptureRequestOptions.captureRequestEnabled)
  ) {
    requestCache[details.requestId] = details;
    console.log("Request " + details.requestId + " added to cache");
  }
}


/**
 *
 * @param {object} request recieved by interceptor
 * @returns {boolean}
 * @description returns boolean to indicate whether request is from Postman
 */
function isPostmanRequest(request) {
  return (_.chain(request.requestHeaders)
    .pluck('name')
    .contains(CUSTOM_INTERCEPTOR_HEADER)
    .value());
}

/**
 *
 * @param {object} details
 * @description  for filtered requests it sets the headers on the request in requestcache. It is fired after extension have had a chance to modify the request headers, and presents the final version.
 */
function onSendHeaders(details) {
  // console.log("Checking headers for request: " + details.requestId);
  // console.log(requestCache);
  if (
    // matches 
    filterCapturedRequestForEitherApp(details) &&
    !isPostmanRequest(details) &&
    (appOptions.isCaptureStateEnabled || appCaptureRequestOptions.captureRequestEnabled)
  ) {
    if (requestCache.hasOwnProperty(details.requestId)) {
      var req = requestCache[details.requestId];
      req.requestHeaders = details.requestHeaders;
      sendCapturedRequestToPostman(details.requestId);
    }
    else {
      console.log("Error - Key not found ", details.requestId, details.method, details.url);
      console.log(requestCache);
    }
  }
}

/**
 *
 * @param {number} reqId an unique ID for the request
 * @param {enum} appType chrome/native: what app to send the message to
 * @description  sends the captured request to postman with id as reqId (using the requestCache) then clears the cache
 */
function sendCapturedRequestToPostman(reqId, appType) {
  // eslint-disable-next-line no-undef
  var loggerMsg = "<span class=\"" + addClassForRequest(requestCache[reqId].method) + "\">" + requestCache[reqId].method + "</span><span class=\"captured-request-url\">" + (requestCache[reqId].url).substring(0, 150) + "</span>";

  var request = requestCache[reqId];
  // eslint-disable-next-line no-undef
  var methodWithBody = isMethodWithBody(request.method);
  var requestBodyType;

  if (methodWithBody && request.requestBody) {
    requestBodyType = _.has(request.requestBody, 'formData') ? 'formData' : 'rawData';
    request.requestBodyType = requestBodyType;

    // encode raw data if exists
    if (requestBodyType === "rawData") {
      if (request.requestBody.raw && request.requestBody.raw[0]) {
        // eslint-disable-next-line no-undef
        var rawEncodedData = getBase64FromArrayBuffer(request.requestBody.raw[0].bytes);
        request.requestBody.rawData = rawEncodedData;
        delete request.requestBody.raw; // strip out existing raw requestBody
      }
      else {
        // if no raw data or bytes set rawData as null
        request.requestBody.rawData = null;
      }
    }
  }

  var requestNotReceived = setTimeout(function() {
    showPostmanNotEnabledWarning();
  }, 500);

  // if capture request is enabled then it sends captured requests to Postman chrome app
  if (appOptions.isCaptureStateEnabled && filterCapturedRequestForChromeApp(request)) {
    chrome.runtime.sendMessage(
      postmanAppId,
      {
        "postmanMessage": {
          "reqId": reqId,
          "request": requestCache[reqId],
          "type": postmanMessageTypes.capturedRequest
        }
      },
      function response(resp) {
        console.log("Request sent to postman for request:", reqId);
        sendCapturedRequestToFrontend(loggerMsg);
        delete requestCache[reqId];
        clearTimeout(requestNotReceived);
        hidePostmanNotEnabledWarning();
      }
    );
  }

  // will send captured requests to Postman Native App if capture request is enabled
  if (appCaptureRequestOptions.captureRequestEnabled && filterCapturedRequestForPostmanNativeApp(requestCache[reqId])) {
    var capturedRequest = {
      type: "CAPTURED_REQUEST",
      message: {
        "postmanMessage": {
          "reqId": reqId,
          "request": requestCache[reqId],
          "type": postmanMessageTypes.capturedRequest
        }
      }
    };
    sendSecureMessageToNativeHost(capturedRequest);
  }

}
/**
 * @description it is used to send message to BACKGROUNDCHANNEL that interceptor is enabled in the chrome app.
 */
function showPostmanNotEnabledWarning() {
  if (popupConnected) {
    BackgroundPort.postMessage({
      isPostmanEnabledWarning: true
    });
  }
}
/**
 * @description it is used to send message to BACKGROUNDCHANNEL that interceptor is not enabled in the chrome app.
 */
function hidePostmanNotEnabledWarning() {
  if (popupConnected) {
    BackgroundPort.postMessage({
      isPostmanEnabledWarning: false
    });
  }
}

/**
 *
 * @param {object} loggerObject contains the data to be shown in Popup
 * @description sends the captured request to popup.html
 */
function sendCapturedRequestToFrontend(loggerObject) {
  logCache.push(loggerObject);
  if (popupConnected) {
    BackgroundPort.postMessage({
      logcache: logCache
    });
  }
}

/**
 * @description long-lived connection to the popupchannel (as popup is opened) notifies when popup can start listening
 */
function initializeConnectionWithPopup() {
  chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === 'POPUPCHANNEL');
    BackgroundPort = chrome.runtime.connect({
      name: 'BACKGROUNDCHANNEL'
    });
    popupConnected = true;

    port.onMessage.addListener(function(msg) {
      if (msg.options) {
        appOptions.isCaptureStateEnabled = msg.options.toggleSwitchState;
        if (msg.options.filterRequestUrl === "") {
          appOptions.filterRequestUrl = ".*";
        }
        else {
          appOptions.filterRequestUrl = msg.options.filterRequestUrl || appOptions.filterRequestUrl;
        }

        if (appOptions.isCaptureStateEnabled) {
          setBlueIcon();
        }
        else {
          setOrangeIcon();
        }
      }
      if (msg.reset) {
        logCache.clear();
      }
      if (msg.type === 'setKey') {
        if (msg.secretKey) {
          secretKey = msg.secretKey;
          setSecretKey(secretKey);
          // initiates key validation as secret key is set/updated here
          startKeyValidationFlow();
        }
      }
      else if (msg.type === 'getKey') {
        BackgroundPort.postMessage({
          type: 'secretKey',
          key: secretKey
        })
      }
    });

    BackgroundPort.postMessage({
      options: appOptions
    });
    BackgroundPort.postMessage({
      logcache: logCache
    });
    console.log("Sending isPostman Open: ", isPostmanOpen);
    BackgroundPort.postMessage({
      isPostmanOpen: isPostmanOpen
    });

    // when the popup has been turned off - no longer send messages
    port.onDisconnect.addListener(function() {
      popupConnected = false;
    });

  });

  // adds an event listener to the onBeforeSendHeaders
  chrome.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeaders,
    {
      urls: ["<all_urls>"]
    },
    ["blocking", "requestHeaders"]
  );

  // event listener called when postman sends a request (in the form of a message)
  chrome.runtime.onMessageExternal.addListener(onExternalMessage);

  // event listener called for each request to intercept - used to intercept request data
  chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest,
    {
      urls: ["<all_urls>"]
    },
    ["requestBody"]
  );

  chrome.webRequest.onBeforeRedirect.addListener(onBeforeRedirect,
    {
      urls: ["<all_urls>"]
    },
    ["responseHeaders"]
  );

  // event listener called just before sending - used for getting headers
  chrome.webRequest.onSendHeaders.addListener(onSendHeaders,
    {
      urls: ["<all_urls>"]
    },
    ["requestHeaders"]
  );

  // creates a context menu link to import curl
  chrome.contextMenus.create({
    "title": "Import CURL in Postman",
    "contexts": ["selection"],
    "onclick": function(a, b) {
      var selection = a.selectionText;
      sendToPostman(selection);
    }
  });
}

/**
 *
 * @param {object} msg comes from Interceptor Bridge ~ Postman Native App
 * @description message handler for the native messaging host, handles the received messages based on their type
 */

function hostMessageHandler(msg) {
  // first checks for the acknowledgement from Interceptor Bridge
  if (msg.message === 'AHOY_ACK') {
    interceptor.log('Postman <> Interceptor Connectivity: Established a connection with the bridge');
  }
  else {
    // parse based on type
    if (msg.type === 'UPDATE_CONNECTION_STATUS') {
      if (msg.data.connectedToPostman) {
        interceptor.log('Postman <> Interceptor Connectivity: Connected to Postman');
      }
      else {
        interceptor.log('Postman <> Interceptor Connectivity: Disconnected from Postman');
      }
    }
    else if (msg.type === 'KEY_VALIDATION_RESULT') {
      // validation is true only if there's no key mismatch between interceptor and native app
      // This is the response from the app when the Interceptor asks app to validate key
      if(msg.data.validation) {
        interceptor.log('Postman <> Interceptor: Encryption keys matched successfully');
      }
      else {
        interceptor.log('Postman <> Interceptor: Encryption keys mismatch detected');
      }
    }
    else if (msg.type === 'VALIDATE_KEY') {
      // App asks Interceptor to validate key
      var keyValidationResults = validateInterceptorKey(msg.data);
      if (keyValidationResults.data.validation) {
        interceptor.log('Postman <> Interceptor: Encryption keys matched successfully');
      }
      else {
        interceptor.log('Postman <> Interceptor: Encryption keys mismatch detected');
      }
      sendMessageToNativeHost(keyValidationResults);
    }
    else if (msg.type === 'KEY_MISMATCH') {
      // The app cannot decrypt a payload to JSON
      if (!postmanAppKeyMismatch) {
        interceptor.log('Postman <> Interceptor: Encryption keys mismatch detected');
        postmanAppKeyMismatch = true;
      }
    }
    else if (msg.type === 'INTERCEPTOR_COMMAND') {
      // encrypted commands sent by the app
      // there's always a payload property
      try {
        var decryptedPayload = decrypt(msg.payload, secretKey);
        if (decryptedPayload.type === 'CONFIGURE_COOKIE_SYNC') {
          var payload = {
            type: 'CONFIGURE_COOKIE_SYNC_ACK',
            postmanMessage: decryptedPayload.postmanMessage
          };
          configureCookieSyncToPostman(decryptedPayload.postmanMessage);
          // sending acknowledgement for configure cookie sync
          sendSecureMessageToNativeHost(payload);
          postmanAppKeyMismatch = false;
        }
        else if (decryptedPayload.type === 'FETCH_ALL_COOKIES') {
          var payload = {
            type: 'FETCH_ALL_COOKIES_ACK',
            postmanMessage: decryptedPayload.postmanMessage
          }
          sendAllCookiesToPostman(decryptedPayload.postmanMessage.domain);
          // sending acknowledgement for fetching all cookies
          sendSecureMessageToNativeHost(payload);
          postmanAppKeyMismatch = false;
        }
        else if (decryptedPayload.type === 'ADD_DOMAIN') {
          addDomainToLocalStorage(decryptedPayload.postmanMessage.value);
          // send cookie dump if enabled == true
          if (appCookieSyncOptions.syncEnabled === true) {
            interceptor.log('sending cookies to the app for the domain ' + decryptedPayload.postmanMessage.value);
            sendAllCookiesToPostman(decryptedPayload.postmanMessage.value);
            postmanAppKeyMismatch = false;
          }
        }
        else if (decryptedPayload.type === 'REMOVE_DOMAIN') {
          removeDomainFromLocalStorage(decryptedPayload.postmanMessage.value);
          postmanAppKeyMismatch = false;
        }
        else if (decryptedPayload.type === 'ENABLE_COOKIE_SYNC') {

          // refreshes the sync domain list with the domain list received from native app
          if (decryptedPayload.postmanMessage.syncDomainList) {
            appCookieSyncOptions.syncDomainList = decryptedPayload.postmanMessage.syncDomainList;
          }

          // sends cookie dump for all the domains
          enableCookieSyncWithPostman(decryptedPayload.postmanMessage);
          postmanAppKeyMismatch = false;
        }
        else if (decryptedPayload.type === 'CONFIGURE_REQUEST_CAPTURE') {
          appCaptureRequestOptions.captureRequestEnabled = decryptedPayload.postmanMessage.enabled;
          if (appCaptureRequestOptions.captureRequestEnabled) {
            appCaptureRequestOptions.filterRequestUrl = decryptedPayload.postmanMessage.filters.url;
            
            appCaptureRequestOptions.filterRequestMethods = decryptedPayload.postmanMessage.filters.method;
            if (appCaptureRequestOptions.filterRequestMethods instanceof Array) {
              appCaptureRequestOptions.filterRequestMethods = appCaptureRequestOptions.filterRequestMethods
                .filter(method => method !== '');
            }
            
            appCaptureRequestOptions.captureResponse = decryptedPayload.postmanMessage.captureResponse;
            var payload = {
              type: 'CONFIGURE_REQUEST_CAPTURE_ACK',
              postmanMessage: decryptedPayload.postmanMessage
            };
            sendSecureMessageToNativeHost(payload);
            interceptor.log('Postman <> Interceptor : Capture requests enabled');
          }
          else {
            interceptor.log('Postman <> Interceptor : Capture requests disabled');
          }
          postmanAppKeyMismatch = false;
        }
        else {
          interceptor.log('Postman <> Interceptor: Bad Request. ' + decryptedPayload.type + ' is an invalid command.');
        }
      }
      catch(e) {
        // exception/error is thrown indicates that the keys are not same
        var nativeAppMessage = {
          type: 'KEY_MISMATCH',
          data: {
            message: 'Encryption keys in the Postman App and Interceptor need to match'
          }
        }
        sendMessageToNativeHost(nativeAppMessage);
      }
    }
    else {
      interceptor.log('Postman <> Interceptor: Bad Request. ' + msg.type + ' is an invalid message type.');
    }
  }
}

function startAllPortPingers() {
  if (!nativePortPinger) {
    nativePortPinger = setInterval(refreshNativePortStatus, 5000);
  }
}

function onDisconnectPort(os) {
  // Called when a port is disconnected. Restarts pingers
  if (nativePort) {
    nativePort.onMessage.removeListener(hostMessageHandler);
    nativePort = null;
  }
  startAllPortPingers();
}

function clearPortPinger(os) {
  // Called when a port is connected
  // No need to ping for this port anymore
  clearInterval(nativePortPinger);
  nativePortPinger = null;
}

function refreshNativePortStatus() {
  if (!nativePort) {
    // port does not exist. Attempt to re-ping
    chrome.runtime.sendNativeMessage('com.postman.postmanapp', {
      type: "HELO"
    }, function(response) {
      if (!response) {
        if (chrome.runtime.lastError.message !== lastNativeMessagingErrorMessage) {
          lastNativeMessagingErrorMessage = chrome.runtime.lastError.message;
          console.log(chrome.runtime.lastError.message);
        }
        if (nativeHostInstalled) {
          nativeHostInstalled = false;
          interceptor.log('Postman <> Interceptor Connectivity: Please install the interceptor bridge to connect to the Postman app.');
        }
        return;
      }
      else {
        lastNativeMessagingErrorMessage = null;
        nativeHostInstalled = true;
      }
      try {
        response = JSON.parse(response);
      }
      catch (e) {
        // error parsing. don't care
        return;
      }

      if (response.type == "HELO_ACK") {
        interceptor.log('Host responsive. Creating port...');
        nativePort = chrome.runtime.connectNative('com.postman.postmanapp');
        nativePort.onMessage.addListener(hostMessageHandler);
        nativePort.onDisconnect.addListener(function() {
          return function() {
            interceptor.log('Postman <> Interceptor Connectivity: Disconnected');
          }
        }());
        nativePort.postMessage({
          type: "AHOY"
        });
        clearPortPinger();
        // connection
      }
    });
  }
}

startAllPortPingers();

var sendToPostman = function(selection) {
  if (!selection) {
    return;
  }

  var message = {
    "curlImportMessage": {
      "curlText": selection.trim()
    }
  };

  chrome.runtime.sendMessage(postmanAppId, message, function(extResponse) {});
}

/**
 *
 * @param {string} domain
 * @param {string} pattern
 * @description It matches the domain with the given regex pattern say *.getpostman.com
 */

function matchDomain(domain, pattern) {
  var domainEndPattern = '.' + pattern;
  if (domain === pattern || domain.endsWith(domainEndPattern)) {
    return true;
  }
  return false;
}

/**
 *
 * @param {object} cookie
 * @description converting the browser cookies into the cookie format that postman native app understands
 */
function convertIntoAppFormatCookie(cookie) {
  var appCookie = {};

  appCookie.name = cookie.name;
  appCookie.value = cookie.value;
  appCookie.domain = cookie.domain;
  appCookie.secure = cookie.secure;
  appCookie.httpOnly = cookie.httpOnly;
  appCookie.expirationDate = cookie.expirationDate;
  appCookie.path = cookie.path;

  return appCookie;
}

/**
 *
 * @param {string} domain
 * @description sends all browser cookies to the native app for the given domain
 */
function sendAllCookiesToPostman(domain) {
  var allCookies = [];
  chrome.cookies.getAll({}, function(cookies) {
    for (var i in cookies) {
      if (matchDomain(cookies[i].domain, domain)) {
        allCookies.push(convertIntoAppFormatCookie(cookies[i]));
      }
    }
    var payload = {
      type: "COOKIE_DUMP",
      message: allCookies
    };
    // sending all cookies for first time , later only updated cookies will be sent
    sendSecureMessageToNativeHost(payload);
  });
}

/**
 * @description method to send the updated cookies to native app.
 */

function sendUpdatedCookiesToPostman() {
  if (updatedCookies.length !== 0) {
    var payload = {
      type: "COOKIE_UPDATED",
      message: updatedCookies
    };
    // sending updated cookies to native host
    sendSecureMessageToNativeHost(payload);
    // making this array empty as the updated cookies are already sent. It'll store the newly updated cookies laters
    updatedCookies = [];
  }
}

/**
 * @description method to send the removed/deleted cookies to the native app
 */
function sendRemovedCookiesToPostman() {
  if (removedCookies.length !== 0) {
    var payload = {
      type: "COOKIE_REMOVED",
      message: removedCookies
    };
    // sending removed cookies to the native host
    sendSecureMessageToNativeHost(payload);
    // making this array empty as the removed cookies are already sent to the app
    removedCookies = [];
  }
}

/**
 * @description send updated cookies once in 2 seconds because of performance issues
 */

var sendUpdatedCookiesOnce = _.debounce(sendUpdatedCookiesToPostman, 2000);

/**
 * @description send removed cookies once in 2 seconds because of performance issues
 */
var sendRemovedCookiesOnce = _.debounce(sendRemovedCookiesToPostman, 2000);


/**
 *
 * @param {object} cookie
 * @description it checks if the changed cookie already exists in updatedCookies array and returns index if present else -1
 */
function findExistingUpdatedCookie(cookie) {
  for (var i = 0; i < updatedCookies.length; i++) {
    if (cookie.name === updatedCookies[i].name) {
      return i; // index to be removed
    }
  }
  return -1;
}

/**
 *
 * @param {object} cookie
 * @description it checks for the cookie passed is whether present or not in removedCookies array. It returns index if present else -1
 */
function findExistingRemovedCookie(cookie) {
  for (var i = 0; i < removedCookies.length; i++) {
    if (cookie.name === removedCookies[i].name) {
      return i; // index to be removed
    }
  }
  return -1;
}

/**
 *
 * @param {string} domain
 * @param {array} domainArray
 * @description finds whether the domain/sub domain is present in the given array or not
 */
function matchDomainList(domain, domainArray) {
  for (var i=0;i<domainArray.length;i++) {
    if (matchDomain(domain, domainArray[i])) {
      return true;
    }
  }
  return false;
}

/**
 *
 * @param {cookie} obj this contains the change info i.e. underlying cause for cookie change, removed (true/false) and cookie object
 * @description listener for chrome.cookies.onChanged event. It's called whenever there's any change in the browser cookies.
 */
function cookieChangeListener(obj) {
  // perform actions only when domain list is not empty & enabled is true, otherwise it's not required to send updates to native interceptor bridge
  if (appCookieSyncOptions.syncEnabled === true && appCookieSyncOptions.syncDomainList.length !== 0) {
    // checks for the domains in sync
    if (matchDomainList(obj.cookie.domain, appCookieSyncOptions.syncDomainList)) {
      var index = findExistingUpdatedCookie(obj.cookie);
      // checking for the underlying cause for cookie change
      // cause is explicit when a cookie has been inserted or removed via an explicit call to cookies.remove().
      if (obj.cause === 'explicit' && obj.removed === false) {
        if (index !== -1) {
          // removes the duplicate cookies from updatedCookies array
          updatedCookies.splice(index, 1);
        }
        updatedCookies.push(convertIntoAppFormatCookie(obj.cookie));
        sendUpdatedCookiesOnce();
      }
      // cause will be overwrite if a call to cookies.set() overwrote this cookie with a different one.
      else if (obj.cause !== 'overwrite' && obj.removed === true) {
        if (index !== -1) {
          // removes the duplicate cookies from removedCookies array
          removedCookies.splice(index, 1);
        }
        removedCookies.push(convertIntoAppFormatCookie(obj.cookie));
        sendRemovedCookiesOnce();
      }
    }
  }
  else {
    chrome.cookies.onChanged.removeListener(cookieChangeListener);
    interceptor.log('Stopped syncing cookies');
  }
}

/**
 *
 * @param {object} message this message comes from the postman native app
 * @description it stores cookie sync enabled settings (true/false) into chrome's local storage
 */
function setCookieSyncEnabledToLocalStorage(message) {
  try {
    chrome.storage.local.set({ cookieSyncEnabled : message
      , function() {
        interceptor.log('Updated cookie sync settings');
      }
    });
  }
  catch (err) {
    interceptor.log('Unknown error while storing cookie sync settings: ', err.toString());
  }
}

/**
 * @description it fetches the cookie sync options from local storage i.e. syncEnabled (True/False) and syncDomainList, updates it to global and attaches the listeners
 */
function configureCookieSyncOptionsFromLocalStorage() {
  chrome.storage.local.get(['cookieSyncEnabled'], function(result) {
    try {
      if (result.cookieSyncEnabled) {
        appCookieSyncOptions.syncEnabled = result.cookieSyncEnabled;
        try {
          chrome.storage.local.get(['domainList'], function(result) {
            if (result.domainList) {
              appCookieSyncOptions.syncDomainList = result.domainList;
              if (appCookieSyncOptions.syncDomainList.length !== 0 && appCookieSyncOptions.syncEnabled === true) {
                chrome.cookies.onChanged.addListener(cookieChangeListener);
              }
              else {
                chrome.cookies.onChanged.removeListener(cookieChangeListener);
              }
            }
          });
        }
        catch (err) {
          interceptor.log('Unknown error while registering cookie handlers: ' + err.toString());
        }
      }
    }
    catch (err) {
      interceptor.log('Unknown error while registering cookie handlers: ' + err.toString());
    }
  });
}

/**
 *
 * @param {object} message comes from postman native app which has domain(for the cookie sync) and enabled(true/false)
 * @description it initiates the cookie sync from interceptor to the native app and configures the cookie sync options
 */
function configureCookieSyncToPostman(message) {
  if (message.enabled === true) {
    if (typeof message.domain === 'string') {
      // trimming whitespaces
      message.domain = message.domain.trim();

      // checking for the empty domain
      if (message.domain) {
        sendAllCookiesToPostman(message.domain);
        // attaches a listener if enabled == true
        chrome.cookies.onChanged.addListener(cookieChangeListener);
        interceptor.log('Performed initial cookie synchronization for domain ' + message.domain);
      }
      else {
        interceptor.log('Invalid domain received for cookie synchronization');
      }
    }
  }
  else {
    // removes the listener if enabled == false
    chrome.cookies.onChanged.removeListener(cookieChangeListener);
    interceptor.log('Stopped syncing cookies');
  }

  // persisting the cookie sync options in chrome's local storage
  setCookieSyncEnabledToLocalStorage(message);

  // adding domain to the domain list
  addDomainToLocalStorage(message.domain);

  // updating the configure cookie sync options to global variable
  configureCookieSyncOptionsFromLocalStorage();
}

/**
 *
 * @param {string} domain
 * @description adds domain to the domain list and update the global variable: syncDomainList
 */
function addDomainToLocalStorage(domain) {
  interceptor.log('Updating domain list for cookie syncing');
  var domainList = appCookieSyncOptions.syncDomainList;
  domainList.push(domain);
  var uniqueDomainList = _.uniq(domainList);

  // updating global sync domain array
  appCookieSyncOptions.syncDomainList = uniqueDomainList;

  // sending updated domain list to postman
  var payload = {
    type: 'UPDATED_DOMAIN_LIST',
    postmanMessage: {
      syncDomainList: uniqueDomainList
    }
  }
  sendSecureMessageToNativeHost(payload);
  interceptor.log('Postman <> Interceptor: Updated domain list: ' + uniqueDomainList);

  chrome.storage.local.set({ domainList: appCookieSyncOptions.syncDomainList
    , function() {
      interceptor.log('Updated domain list for cookie syncing');
    }
  });
}

/**
 *
 * @param {string} domain to be added to the domain list
 * @description it adds the domain to the domain list
 */
function addDomainToSyncDomainList(domain) {
  interceptor.log('updating domain list ...');
  var domainList = appCookieSyncOptions.syncDomainList;
  domainList.push(domain);
  var uniqueDomainList = _.uniq(domainList);

  // updating global sync domain array
  appCookieSyncOptions.syncDomainList = uniqueDomainList;

  // sending acknowledgement to postman
  var payload = {
    type: 'ADD_DOMAIN_ACK',
    postmanMessage: {
      domain: domain
    }
  }
  sendSecureMessageToNativeHost(payload);
  interceptor.log('App ~ Interceptor Bridge: Updated domain list : ' + uniqueDomainList);
}

/**
 *
 * @param {string} domain
 * @description it removes domain from the domain list
 */
function removeDomainFromSyncDomainList(domain) {
  interceptor.log('removing '+ domain +' from the list ...');
  var domainList = appCookieSyncOptions.syncDomainList;
  var updatedDomainList = domainList.filter(function(value, index, arr){
    return value !==domain;
  });

  // updating global sync domain array
  appCookieSyncOptions.syncDomainList = updatedDomainList;

  // sending acknowledgement domain list to postman
  var payload = {
    type: 'REMOVE_DOMAIN_ACK',
    postmanMessage: {
      domain: domain,
    }
  }
  sendSecureMessageToNativeHost(payload);
  interceptor.log('App ~ Interceptor Bridge: Updated domain list : ' + updatedDomainList);
}

/**
 *
 * @param {string} domain
 * @description removes the domain from the domainList and stores the updated domain list in chrome's local storage
 */
function removeDomainFromLocalStorage(domain) {
  interceptor.log('Postman <> Interceptor: Removing ' + domain + ' from the list of domains to sync cookies for');
  var domainList = appCookieSyncOptions.syncDomainList;
  var updatedDomainList = domainList.filter(function(value, index, arr){
    return value !==domain;
  });

  // updating global sync domain array
  appCookieSyncOptions.syncDomainList = updatedDomainList;

  // sending updated domain list to postman
  var payload = {
    type: 'UPDATED_DOMAIN_LIST',
    postmanMessage: {
      syncDomainList: updatedDomainList
    }
  }
  sendSecureMessageToNativeHost(payload);

  chrome.storage.local.set({ domainList: updatedDomainList
    , function() {
      interceptor.log('Postman <> Interceptor: Updated domain list: ' + updatedDomainList);
    }
  });
}

/**
 *
 * @param {object} data JSON object to be encrypted
 * @param {string} secretKey key/passphrase used to encrypt
 * @description it encrypts data using secret key. Algorithm used: AES
 */
function encrypt(data, secretKey) {
  try {
    var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey);
    return encrypted.toString();
  }
  catch (err) {
    interceptor.log('Could not encrypt payload. Try using a different encryption key. Error: ' + err);
  }
}

/**
 *
 * @param {object} data
 * @param {string} secretKey key/passphrase used to decrypt
 * @description it decrypt the recieved data using secret key. ALGORITHM used: AES
 */
function decrypt(data, secretKey) {
  try {
    var bytes = CryptoJS.AES.decrypt(data.toString(), secretKey);
    try {
      var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      try {
        decryptedObject = JSON.parse(decryptedData);

        if (
          typeof decryptedObject !== "object" || // primitive
          decryptedObject instanceof Array
        ) {
          interceptor.log('Postman <> Interceptor: Encryption keys mismatch detected');
          throw 'Invalid payload received.';
        }
        else {
          return decryptedObject;
        }
      }
      catch (err) {
        if (!postmanAppKeyMismatch) {
          interceptor.log('Postman <> Interceptor: Encryption keys mismatch detected');
          postmanAppKeyMismatch = true;
        }
        throw err;
      }
    }
    catch (err) {
      if (!postmanAppKeyMismatch) {
        interceptor.log('Postman <> Interceptor: Encryption keys mismatch detected');
        postmanAppKeyMismatch = true;
      }
      throw err;
    }
  }
  catch(err) {
    if (!postmanAppKeyMismatch) {
      interceptor.log('Postman <> Interceptor: Encryption keys mismatch detected');
      postmanAppKeyMismatch = true;
    }
    throw err;
  }
}

/**
 * @description it sets the secret key to the local storage and stores it as global which is used for encryption/decryption
 */
function setSecretKey(key) {
  chrome.storage.local.set({ secretKey: key }, function() {
    secretKey = key;
    interceptor.log('Postman <> Interceptor: Updated encryption key');
  });
}

/**
* @description it fetches the secret key from local storage and stores it as global which is used for encryption/decryption
* if secret key is not set in local storage , it sets the default key i.e. 'postman_default_key' in chrome's local storage
*/
function initializeSecretKey() {
  // tries to fetch the secret key from local storage
  chrome.storage.local.get(['secretKey'], function(result) {
    // if fetched successfully, it stores the key as global i.e. secretKey
    if (result.secretKey) {
      secretKey = result.secretKey;
      interceptor.log('Encryption key loaded');
    }
    else {
      //otherwise it will set default secret key i.e. postman_default_key
      setSecretKey(secretKey);
    }
  });
}

/**
 * @description used to validate secret key(passphrase). It encrypts a default string and sends it to native app
 */
function startKeyValidationFlow() {
  chrome.storage.local.get(['secretKey'], function(result) {
    secretKey = result.secretKey;
    var nativeAppMessage = {
      type: 'VALIDATE_KEY',
      data: encrypt(DEFAULT_KEY_VALIDATION_PAYLOAD, secretKey)
    }
    sendMessageToNativeHost(nativeAppMessage)
  });
}

/**
 *
 * @param {object} msg received from the app
 * @description it is used to check whether the keys are same at interceptor and app or not
 * it decrypts the payload received from the app and compares with the default validation string,
 * if it's same, validation is true otherwise false
 */
function validateInterceptorKey(msg) {
  try {
    var decryptedData = decrypt(msg, secretKey);
  return {
    type: 'KEY_VALIDATION_RESULT',
    data: { 
      validation: ( decryptedData.type === DEFAULT_KEY_VALIDATION_PAYLOAD.type &&
      decryptedData.message === DEFAULT_KEY_VALIDATION_PAYLOAD.message )
      }
    };
  }
  catch (err) {
    return {
      type: 'KEY_VALIDATION_RESULT',
      data: {
        validation: false
      }
    };
  }
}

/**
 *
 * @param {object} message payload to be sent
 * @description used to send message to the connected native messaging host
 */
function sendMessageToNativeHost(message) {
  if (nativePort) {
    try {
      nativePort.postMessage(message);
    }
    catch (err) {
      interceptor.log('Postman <> Interceptor Connectivity: Error occurred while sending a message to the native host' + err.toString());
    }
  }
  else {
    interceptor.log('Postman <> Interceptor Connectivity: Native Messaging Host not connected');
  }
}

/**
 *
 * @param {object} payload message to be sent
 * @description used to send encrypted message to the connected native messaging host
 */
function sendSecureMessageToNativeHost(payload) {
  var message = {
    type: 'FORWARD_TO_APP',
    payload: encrypt(payload, secretKey)
  }
  sendMessageToNativeHost(message);
}

/**
 * @description fetches the domain list from chrome's local storage and updates the global value
 */
function loadDomainListFromLocalStorage()  {
  chrome.storage.local.get(['domainList'], function(result) {
    if (result.domainList) {
      appCookieSyncOptions.syncDomainList = result.domainList;
    }
  });
}

/**
 *
 * @param {object} message
 * @description it sends cookie dump to Postman Native App for all the domains in the syncDomainList
 * updates cookie sync enabled settings into chrome's local storage
 * attaches cookie change listener if enabled == true.
 * removes listener if enabled == false
 */
function enableCookieSyncWithPostman(message) {
  if (message.enabled) {
    for (var i=0;i<appCookieSyncOptions.syncDomainList.length;i++) {
      sendAllCookiesToPostman(appCookieSyncOptions.syncDomainList[i]);
      interceptor.log('sending cookies to the app for the domain ' + appCookieSyncOptions.syncDomainList[i]);
    }
    chrome.cookies.onChanged.addListener(cookieChangeListener);
  }
  else {
    chrome.cookies.onChanged.removeListener(cookieChangeListener);
  }
  setCookieSyncEnabledToLocalStorage(message.enabled);
  appCookieSyncOptions.syncEnabled = message.enabled;
  var payload = {
    type: 'ENABLE_COOKIE_SYNC_ACK',
    postmanMessage: {
      enabled: appCookieSyncOptions.syncEnabled,
      syncDomainList: appCookieSyncOptions.syncDomainList
    }
  };

  // sending ack for enable cookie sync
  sendSecureMessageToNativeHost(payload);
}

/**
 *
 * @param {object} message payload received from Postman Native App
 * @description it sends cookie dump to Postman Native App for the received domain list
 * updates appCookieSyncOptions variable
 * attaches cookie change listener if enabled == true.
 * removes listener if enabled == false
 */
function enableCookieSyncForReceivedDomainList(message) {
  if (message.enabled) {
    for (var i=0;i<message.syncDomainList.length;i++) {
      sendAllCookiesToPostman(message.syncDomainList[i]);
      interceptor.log('sending cookies to the app for the domain ' + message.syncDomainList[i]);
    }
    chrome.cookies.onChanged.addListener(cookieChangeListener);
  }
  else {
    chrome.cookies.onChanged.removeListener(cookieChangeListener);
  }
  setCookieSyncEnabledToLocalStorage(message.enabled);
  appCookieSyncOptions.syncEnabled = message.enabled;
  appCookieSyncOptions.syncDomainList = message.syncDomainList;
  var payload = {
    type: 'ENABLE_COOKIE_SYNC_ACK',
    postmanMessage: {
      enabled: appCookieSyncOptions.syncEnabled,
      syncDomainList: appCookieSyncOptions.syncDomainList
    }
  };

  // sending ack for enable cookie sync
  sendSecureMessageToNativeHost(payload);
}
