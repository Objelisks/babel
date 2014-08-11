Object.defineProperty(Array.prototype, 'each', {
  value: Array.prototype.forEach,
  enumerable: false,
});

Object.defineProperty(Object.prototype, 'keys', {
  value: function() { return Object.keys(this); },
  enumerable: false,
});

// Load JSON text from server hosted file and return JSON parsed object
function loadJSON(filePath) {
  // Load json file;
  var json = loadTextFileAjaxSync(filePath, "application/json");
  // Parse json
  return JSON.parse(json);
}

// Load JSON text from server hosted file and return JSON parsed object
function loadJSONAsync(filePath, callback, errorCallback) {
  // Load json file;
  loadTextFileAjaxAsync(filePath, "application/json", function(file) {
    // Parse json
    callback(JSON.parse(file));
  }, errorCallback);
}

// Load text with Ajax synchronously: takes path to file and optional MIME type
function loadTextFileAjaxSync(filePath, mimeType) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  if (mimeType != null) {
    if (xmlhttp.overrideMimeType) {
      xmlhttp.overrideMimeType(mimeType);
    }
  }
  xmlhttp.send();
  if (xmlhttp.status === 200) {
    return xmlhttp.responseText;
  }
  else {
    throw { message: 'Unable to get file', name: 'FileError' }
  }
}

// Load text with Ajax asynchronously: takes path to file and optional MIME type
function loadTextFileAjaxAsync(filePath, mimeType, callback, errorCallback) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  if (mimeType != null) {
    if (xmlhttp.overrideMimeType) {
      xmlhttp.overrideMimeType(mimeType);
    }
  }

  xmlhttp.addEventListener('load', function(e) {
    if(xmlhttp.status === 404) {
      //xmlhttp.abort();
      errorCallback();
    } else {
      callback(xmlhttp.responseText);
    }
  });

  try {
    xmlhttp.send();
  } catch(e) {
    console.log(e);
  }
}

function sendJsonToServer(server, json) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open('POST', server);
  xmlhttp.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
  xmlhttp.send(JSON.stringify(json));
}