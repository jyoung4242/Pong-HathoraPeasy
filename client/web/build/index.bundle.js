/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../api/node_modules/axios/index.js":
/*!*********************************************!*\
  !*** ../../api/node_modules/axios/index.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "../../api/node_modules/axios/lib/axios.js");

/***/ }),

/***/ "../../api/node_modules/axios/lib/adapters/xhr.js":
/*!********************************************************!*\
  !*** ../../api/node_modules/axios/lib/adapters/xhr.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "../../api/node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "../../api/node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "../../api/node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "../../api/node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "../../api/node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "../../api/node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "../../api/node_modules/axios/lib/core/createError.js");
var defaults = __webpack_require__(/*! ../defaults */ "../../api/node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "../../api/node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || defaults.transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/axios.js":
/*!*************************************************!*\
  !*** ../../api/node_modules/axios/lib/axios.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "../../api/node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "../../api/node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "../../api/node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "../../api/node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "../../api/node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "../../api/node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "../../api/node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "../../api/node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "../../api/node_modules/axios/lib/env/data.js").version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "../../api/node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "../../api/node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "../../api/node_modules/axios/lib/cancel/Cancel.js":
/*!*********************************************************!*\
  !*** ../../api/node_modules/axios/lib/cancel/Cancel.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "../../api/node_modules/axios/lib/cancel/CancelToken.js":
/*!**************************************************************!*\
  !*** ../../api/node_modules/axios/lib/cancel/CancelToken.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "../../api/node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "../../api/node_modules/axios/lib/cancel/isCancel.js":
/*!***********************************************************!*\
  !*** ../../api/node_modules/axios/lib/cancel/isCancel.js ***!
  \***********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/Axios.js":
/*!******************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/Axios.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "../../api/node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "../../api/node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "../../api/node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "../../api/node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "../../api/node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/InterceptorManager.js":
/*!*******************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/InterceptorManager.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/buildFullPath.js":
/*!**************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/buildFullPath.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "../../api/node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "../../api/node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/createError.js":
/*!************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/createError.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "../../api/node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/dispatchRequest.js":
/*!****************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/dispatchRequest.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "../../api/node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "../../api/node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "../../api/node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "../../api/node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/enhanceError.js":
/*!*************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/enhanceError.js ***!
  \*************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/mergeConfig.js":
/*!************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/mergeConfig.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../../api/node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/settle.js":
/*!*******************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/settle.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "../../api/node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/core/transformData.js":
/*!**************************************************************!*\
  !*** ../../api/node_modules/axios/lib/core/transformData.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "../../api/node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/defaults.js":
/*!****************************************************!*\
  !*** ../../api/node_modules/axios/lib/defaults.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "../../api/node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "../../api/node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "../../api/node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "../../api/node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "../../api/node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "../../api/node_modules/axios/lib/env/data.js":
/*!****************************************************!*\
  !*** ../../api/node_modules/axios/lib/env/data.js ***!
  \****************************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.24.0"
};

/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/bind.js":
/*!********************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/bind.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/buildURL.js":
/*!************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/buildURL.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/combineURLs.js":
/*!***************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/combineURLs.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/cookies.js":
/*!***********************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/cookies.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*****************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*****************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/isAxiosError.js":
/*!****************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/isAxiosError.js ***!
  \****************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!*******************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***********************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../../api/node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/parseHeaders.js":
/*!****************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/parseHeaders.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../../api/node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/spread.js":
/*!**********************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/spread.js ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/helpers/validator.js":
/*!*************************************************************!*\
  !*** ../../api/node_modules/axios/lib/helpers/validator.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "../../api/node_modules/axios/lib/env/data.js").version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "../../api/node_modules/axios/lib/utils.js":
/*!*************************************************!*\
  !*** ../../api/node_modules/axios/lib/utils.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "../../api/node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "../../api/node_modules/bin-serde/lib/index.js":
/*!*****************************************************!*\
  !*** ../../api/node_modules/bin-serde/lib/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Reader = exports.Writer = void 0;
const utf8 = __webpack_require__(/*! utf8-buffer */ "../../api/node_modules/utf8-buffer/index.js");
const utf8_buffer_size_1 = __webpack_require__(/*! utf8-buffer-size */ "../../api/node_modules/utf8-buffer-size/main.js");
const { pack, unpack } = utf8.default ?? utf8;
class Writer {
    pos = 0;
    view;
    bytes;
    constructor() {
        this.view = new DataView(new ArrayBuffer(64));
        this.bytes = new Uint8Array(this.view.buffer);
    }
    writeUInt8(val) {
        this.ensureSize(1);
        this.view.setUint8(this.pos, val);
        this.pos += 1;
        return this;
    }
    writeUInt32(val) {
        this.ensureSize(4);
        this.view.setUint32(this.pos, val);
        this.pos += 4;
        return this;
    }
    writeUInt64(val) {
        this.ensureSize(8);
        this.view.setBigUint64(this.pos, val);
        this.pos += 8;
        return this;
    }
    writeUVarint(val) {
        if (val < 0x80) {
            this.ensureSize(1);
            this.view.setUint8(this.pos, val);
            this.pos += 1;
        }
        else if (val < 0x4000) {
            this.ensureSize(2);
            this.view.setUint16(this.pos, (val & 0x7f) | ((val & 0x3f80) << 1) | 0x8000);
            this.pos += 2;
        }
        else if (val < 0x200000) {
            this.ensureSize(3);
            this.view.setUint8(this.pos, (val >> 14) | 0x80);
            this.view.setUint16(this.pos + 1, (val & 0x7f) | ((val & 0x3f80) << 1) | 0x8000);
            this.pos += 3;
        }
        else if (val < 0x10000000) {
            this.ensureSize(4);
            this.view.setUint32(this.pos, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 4;
        }
        else if (val < 0x800000000) {
            this.ensureSize(5);
            this.view.setUint8(this.pos, Math.floor(val / Math.pow(2, 28)) | 0x80);
            this.view.setUint32(this.pos + 1, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 5;
        }
        else if (val < 0x40000000000) {
            this.ensureSize(6);
            const shiftedVal = Math.floor(val / Math.pow(2, 28));
            this.view.setUint16(this.pos, (shiftedVal & 0x7f) | ((shiftedVal & 0x3f80) << 1) | 0x8080);
            this.view.setUint32(this.pos + 2, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 6;
        }
        else {
            throw new Error("Value out of range");
        }
        return this;
    }
    writeVarint(val) {
        const bigval = BigInt(val);
        this.writeUVarint(Number((bigval >> 63n) ^ (bigval << 1n)));
        return this;
    }
    writeFloat(val) {
        this.ensureSize(4);
        this.view.setFloat32(this.pos, val, true);
        this.pos += 4;
        return this;
    }
    writeBits(bits) {
        for (let i = 0; i < bits.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                if (i + j == bits.length) {
                    break;
                }
                byte |= (bits[i + j] ? 1 : 0) << j;
            }
            this.writeUInt8(byte);
        }
        return this;
    }
    writeString(val) {
        if (val.length > 0) {
            const byteSize = (0, utf8_buffer_size_1.default)(val);
            this.writeUVarint(byteSize);
            this.ensureSize(byteSize);
            pack(val, this.bytes, this.pos);
            this.pos += byteSize;
        }
        else {
            this.writeUInt8(0);
        }
        return this;
    }
    writeBuffer(buf) {
        this.ensureSize(buf.length);
        this.bytes.set(buf, this.pos);
        this.pos += buf.length;
        return this;
    }
    toBuffer() {
        return this.bytes.subarray(0, this.pos);
    }
    ensureSize(size) {
        while (this.view.byteLength < this.pos + size) {
            const newView = new DataView(new ArrayBuffer(this.view.byteLength * 2));
            const newBytes = new Uint8Array(newView.buffer);
            newBytes.set(this.bytes);
            this.view = newView;
            this.bytes = newBytes;
        }
    }
}
exports.Writer = Writer;
class Reader {
    pos = 0;
    view;
    bytes;
    constructor(buf) {
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        this.bytes = new Uint8Array(this.view.buffer, buf.byteOffset, buf.byteLength);
    }
    readUInt8() {
        const val = this.view.getUint8(this.pos);
        this.pos += 1;
        return val;
    }
    readUInt32() {
        const val = this.view.getUint32(this.pos);
        this.pos += 4;
        return val;
    }
    readUInt64() {
        const val = this.view.getBigUint64(this.pos);
        this.pos += 8;
        return val;
    }
    readUVarint() {
        let val = 0;
        while (true) {
            let byte = this.view.getUint8(this.pos++);
            if (byte < 0x80) {
                return val + byte;
            }
            val = (val + (byte & 0x7f)) * 128;
        }
    }
    readVarint() {
        const val = BigInt(this.readUVarint());
        return Number((val >> 1n) ^ -(val & 1n));
    }
    readFloat() {
        const val = this.view.getFloat32(this.pos, true);
        this.pos += 4;
        return val;
    }
    readBits(numBits) {
        const numBytes = Math.ceil(numBits / 8);
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        const bits = [];
        for (const byte of bytes) {
            for (let i = 0; i < 8 && bits.length < numBits; i++) {
                bits.push(((byte >> i) & 1) === 1);
            }
        }
        this.pos += numBytes;
        return bits;
    }
    readString() {
        const len = this.readUVarint();
        if (len === 0) {
            return "";
        }
        const val = unpack(this.bytes, this.pos, this.pos + len);
        this.pos += len;
        return val;
    }
    readBuffer(numBytes) {
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        this.pos += numBytes;
        return bytes;
    }
    remaining() {
        return this.view.byteLength - this.pos;
    }
}
exports.Reader = Reader;


/***/ }),

/***/ "../../api/node_modules/utf8-buffer-size/main.js":
/*!*******************************************************!*\
  !*** ../../api/node_modules/utf8-buffer-size/main.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ utf8BufferSize)
/* harmony export */ });
/*
 * Copyright (c) 2018 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @fileoverview The utf8-buffer-size API.
 * @see https://github.com/rochars/utf8-buffer-size
 */

/** @module utf8BufferSize */

/**
 * Returns how many bytes are needed to serialize a UTF-8 string.
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 * @param {string} str The string to pack.
 * @return {number} The number of bytes needed to serialize the string.
 */
function utf8BufferSize(str) {
  /** @type {number} */
  let bytes = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    /** @type {number} */
    let codePoint = str.codePointAt(i);
    if (codePoint < 128) {
      bytes++;
    } else {
      if (codePoint <= 2047) {
        bytes++;
      } else if(codePoint <= 65535) {
        bytes+=2;
      } else if(codePoint <= 1114111) {
        i++;
        bytes+=3;
      }
      bytes++;
    }
  }
  return bytes;
}


/***/ }),

/***/ "../../api/node_modules/utf8-buffer/index.js":
/*!***************************************************!*\
  !*** ../../api/node_modules/utf8-buffer/index.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pack": () => (/* binding */ pack),
/* harmony export */   "unpack": () => (/* binding */ unpack)
/* harmony export */ });
/*
 * Copyright (c) 2018 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @fileoverview Functions to serialize and deserialize UTF-8 strings.
 * @see https://github.com/rochars/utf8-buffer
 * @see https://encoding.spec.whatwg.org/#the-encoding
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 */

/** @module utf8-buffer */

/**
 * Read a string of UTF-8 characters from a byte buffer.
 * Invalid characters are replaced with 'REPLACEMENT CHARACTER' (U+FFFD).
 * @see https://encoding.spec.whatwg.org/#the-encoding
 * @see https://stackoverflow.com/a/34926911
 * @param {!Uint8Array|!Array<number>} buffer A byte buffer.
 * @param {number=} start The buffer index to start reading.
 * @param {?number=} end The buffer index to stop reading.
 *   Assumes the buffer length if undefined.
 * @return {string}
 */
function unpack(buffer, start=0, end=buffer.length) {
  /** @type {string} */
  let str = '';
  for(let index = start; index < end;) {
    /** @type {number} */
    let lowerBoundary = 0x80;
    /** @type {number} */
    let upperBoundary = 0xBF;
    /** @type {boolean} */
    let replace = false;
    /** @type {number} */
    let charCode = buffer[index++];
    if (charCode >= 0x00 && charCode <= 0x7F) {
      str += String.fromCharCode(charCode);
    } else {
      /** @type {number} */
      let count = 0;
      if (charCode >= 0xC2 && charCode <= 0xDF) {
        count = 1;
      } else if (charCode >= 0xE0 && charCode <= 0xEF ) {
        count = 2;
        if (buffer[index] === 0xE0) {
          lowerBoundary = 0xA0;
        }
        if (buffer[index] === 0xED) {
          upperBoundary = 0x9F;
        }
      } else if (charCode >= 0xF0 && charCode <= 0xF4 ) {
        count = 3;
        if (buffer[index] === 0xF0) {
          lowerBoundary = 0x90;
        }
        if (buffer[index] === 0xF4) {
          upperBoundary = 0x8F;
        }
      } else {
        replace = true;
      }
      charCode = charCode & (1 << (8 - count - 1)) - 1;
      for (let i = 0; i < count; i++) {
        if (buffer[index] < lowerBoundary || buffer[index] > upperBoundary) {
          replace = true;
        }
        charCode = (charCode << 6) | (buffer[index] & 0x3f);
        index++;
      }
      if (replace) {
        str += String.fromCharCode(0xFFFD);
      } 
      else if (charCode <= 0xffff) {
        str += String.fromCharCode(charCode);
      } else {
        charCode -= 0x10000;
        str += String.fromCharCode(
          ((charCode >> 10) & 0x3ff) + 0xd800,
          (charCode & 0x3ff) + 0xdc00);
      }
    }
  }
  return str;
}

/**
 * Write a string of UTF-8 characters to a byte buffer.
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 * @param {string} str The string to pack.
 * @param {!Uint8Array|!Array<number>} buffer The buffer to pack the string to.
 * @param {number=} index The buffer index to start writing.
 * @return {number} The next index to write in the buffer.
 */
function pack(str, buffer, index=0) {
  for (let i = 0, len = str.length; i < len; i++) {
    /** @type {number} */
    let codePoint = str.codePointAt(i);
    if (codePoint < 128) {
      buffer[index] = codePoint;
      index++;
    } else {
      /** @type {number} */
      let count = 0;
      /** @type {number} */
      let offset = 0;
      if (codePoint <= 0x07FF) {
        count = 1;
        offset = 0xC0;
      } else if(codePoint <= 0xFFFF) {
        count = 2;
        offset = 0xE0;
      } else if(codePoint <= 0x10FFFF) {
        count = 3;
        offset = 0xF0;
        i++;
      }
      buffer[index] = (codePoint >> (6 * count)) + offset;
      index++;
      while (count > 0) {
        buffer[index] = 0x80 | (codePoint >> (6 * (count - 1)) & 0x3F);
        index++;
        count--;
      }
    }
  }
  return index;
}


/***/ }),

/***/ "../.hathora/node_modules/axios/index.js":
/*!***********************************************!*\
  !*** ../.hathora/node_modules/axios/index.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "../.hathora/node_modules/axios/lib/axios.js");

/***/ }),

/***/ "../.hathora/node_modules/axios/lib/adapters/xhr.js":
/*!**********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/adapters/xhr.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "../.hathora/node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "../.hathora/node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "../.hathora/node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "../.hathora/node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "../.hathora/node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "../.hathora/node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "../.hathora/node_modules/axios/lib/core/createError.js");
var defaults = __webpack_require__(/*! ../defaults */ "../.hathora/node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "../.hathora/node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || defaults.transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/axios.js":
/*!***************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/axios.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "../.hathora/node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "../.hathora/node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "../.hathora/node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "../.hathora/node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "../.hathora/node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "../.hathora/node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "../.hathora/node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "../.hathora/node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "../.hathora/node_modules/axios/lib/env/data.js").version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "../.hathora/node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "../.hathora/node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/cancel/Cancel.js":
/*!***********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/cancel/Cancel.js ***!
  \***********************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/cancel/CancelToken.js":
/*!****************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/cancel/CancelToken.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "../.hathora/node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/cancel/isCancel.js":
/*!*************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/cancel/isCancel.js ***!
  \*************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/Axios.js":
/*!********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/Axios.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "../.hathora/node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "../.hathora/node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "../.hathora/node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "../.hathora/node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "../.hathora/node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  if (!config.url) {
    throw new Error('Provided config url is not valid');
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  if (!config.url) {
    throw new Error('Provided config url is not valid');
  }
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/InterceptorManager.js":
/*!*********************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/InterceptorManager.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/buildFullPath.js":
/*!****************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/buildFullPath.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "../.hathora/node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "../.hathora/node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/createError.js":
/*!**************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/createError.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "../.hathora/node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/dispatchRequest.js":
/*!******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/dispatchRequest.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "../.hathora/node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "../.hathora/node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "../.hathora/node_modules/axios/lib/defaults.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "../.hathora/node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/enhanceError.js":
/*!***************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/enhanceError.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/mergeConfig.js":
/*!**************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/mergeConfig.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../.hathora/node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/settle.js":
/*!*********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/settle.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "../.hathora/node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/core/transformData.js":
/*!****************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/core/transformData.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ./../defaults */ "../.hathora/node_modules/axios/lib/defaults.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/defaults.js":
/*!******************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/defaults.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "../.hathora/node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "../.hathora/node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ./core/enhanceError */ "../.hathora/node_modules/axios/lib/core/enhanceError.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "../.hathora/node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "../.hathora/node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/env/data.js":
/*!******************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/env/data.js ***!
  \******************************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.25.0"
};

/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/bind.js":
/*!**********************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/bind.js ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/buildURL.js":
/*!**************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/buildURL.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/combineURLs.js":
/*!*****************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/combineURLs.js ***!
  \*****************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/cookies.js":
/*!*************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/cookies.js ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*******************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/isAxiosError.js":
/*!******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/isAxiosError.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!*********************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!*************************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "../.hathora/node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/parseHeaders.js":
/*!******************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/parseHeaders.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "../.hathora/node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/spread.js":
/*!************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/spread.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/helpers/validator.js":
/*!***************************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/helpers/validator.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "../.hathora/node_modules/axios/lib/env/data.js").version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "../.hathora/node_modules/axios/lib/utils.js":
/*!***************************************************!*\
  !*** ../.hathora/node_modules/axios/lib/utils.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "../.hathora/node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return toString.call(val) === '[object FormData]';
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return toString.call(val) === '[object URLSearchParams]';
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "../.hathora/node_modules/bin-serde/lib/index.js":
/*!*******************************************************!*\
  !*** ../.hathora/node_modules/bin-serde/lib/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Reader = exports.Writer = void 0;
const utf8 = __webpack_require__(/*! utf8-buffer */ "../.hathora/node_modules/utf8-buffer/index.js");
const utf8_buffer_size_1 = __webpack_require__(/*! utf8-buffer-size */ "../.hathora/node_modules/utf8-buffer-size/main.js");
const { pack, unpack } = utf8.default ?? utf8;
class Writer {
    pos = 0;
    view;
    bytes;
    constructor() {
        this.view = new DataView(new ArrayBuffer(64));
        this.bytes = new Uint8Array(this.view.buffer);
    }
    writeUInt8(val) {
        this.ensureSize(1);
        this.view.setUint8(this.pos, val);
        this.pos += 1;
        return this;
    }
    writeUInt32(val) {
        this.ensureSize(4);
        this.view.setUint32(this.pos, val);
        this.pos += 4;
        return this;
    }
    writeUInt64(val) {
        this.ensureSize(8);
        this.view.setBigUint64(this.pos, val);
        this.pos += 8;
        return this;
    }
    writeUVarint(val) {
        if (val < 0x80) {
            this.ensureSize(1);
            this.view.setUint8(this.pos, val);
            this.pos += 1;
        }
        else if (val < 0x4000) {
            this.ensureSize(2);
            this.view.setUint16(this.pos, (val & 0x7f) | ((val & 0x3f80) << 1) | 0x8000);
            this.pos += 2;
        }
        else if (val < 0x200000) {
            this.ensureSize(3);
            this.view.setUint8(this.pos, (val >> 14) | 0x80);
            this.view.setUint16(this.pos + 1, (val & 0x7f) | ((val & 0x3f80) << 1) | 0x8000);
            this.pos += 3;
        }
        else if (val < 0x10000000) {
            this.ensureSize(4);
            this.view.setUint32(this.pos, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 4;
        }
        else if (val < 0x800000000) {
            this.ensureSize(5);
            this.view.setUint8(this.pos, Math.floor(val / Math.pow(2, 28)) | 0x80);
            this.view.setUint32(this.pos + 1, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 5;
        }
        else if (val < 0x40000000000) {
            this.ensureSize(6);
            const shiftedVal = Math.floor(val / Math.pow(2, 28));
            this.view.setUint16(this.pos, (shiftedVal & 0x7f) | ((shiftedVal & 0x3f80) << 1) | 0x8080);
            this.view.setUint32(this.pos + 2, (val & 0x7f) | ((val & 0x3f80) << 1) | ((val & 0x1fc000) << 2) | ((val & 0xfe00000) << 3) | 0x80808000);
            this.pos += 6;
        }
        else {
            throw new Error("Value out of range");
        }
        return this;
    }
    writeVarint(val) {
        const bigval = BigInt(val);
        this.writeUVarint(Number((bigval >> 63n) ^ (bigval << 1n)));
        return this;
    }
    writeFloat(val) {
        this.ensureSize(4);
        this.view.setFloat32(this.pos, val, true);
        this.pos += 4;
        return this;
    }
    writeBits(bits) {
        for (let i = 0; i < bits.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                if (i + j == bits.length) {
                    break;
                }
                byte |= (bits[i + j] ? 1 : 0) << j;
            }
            this.writeUInt8(byte);
        }
        return this;
    }
    writeString(val) {
        if (val.length > 0) {
            const byteSize = (0, utf8_buffer_size_1.default)(val);
            this.writeUVarint(byteSize);
            this.ensureSize(byteSize);
            pack(val, this.bytes, this.pos);
            this.pos += byteSize;
        }
        else {
            this.writeUInt8(0);
        }
        return this;
    }
    writeBuffer(buf) {
        this.ensureSize(buf.length);
        this.bytes.set(buf, this.pos);
        this.pos += buf.length;
        return this;
    }
    toBuffer() {
        return this.bytes.subarray(0, this.pos);
    }
    ensureSize(size) {
        while (this.view.byteLength < this.pos + size) {
            const newView = new DataView(new ArrayBuffer(this.view.byteLength * 2));
            const newBytes = new Uint8Array(newView.buffer);
            newBytes.set(this.bytes);
            this.view = newView;
            this.bytes = newBytes;
        }
    }
}
exports.Writer = Writer;
class Reader {
    pos = 0;
    view;
    bytes;
    constructor(buf) {
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        this.bytes = new Uint8Array(this.view.buffer, buf.byteOffset, buf.byteLength);
    }
    readUInt8() {
        const val = this.view.getUint8(this.pos);
        this.pos += 1;
        return val;
    }
    readUInt32() {
        const val = this.view.getUint32(this.pos);
        this.pos += 4;
        return val;
    }
    readUInt64() {
        const val = this.view.getBigUint64(this.pos);
        this.pos += 8;
        return val;
    }
    readUVarint() {
        let val = 0;
        while (true) {
            let byte = this.view.getUint8(this.pos++);
            if (byte < 0x80) {
                return val + byte;
            }
            val = (val + (byte & 0x7f)) * 128;
        }
    }
    readVarint() {
        const val = BigInt(this.readUVarint());
        return Number((val >> 1n) ^ -(val & 1n));
    }
    readFloat() {
        const val = this.view.getFloat32(this.pos, true);
        this.pos += 4;
        return val;
    }
    readBits(numBits) {
        const numBytes = Math.ceil(numBits / 8);
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        const bits = [];
        for (const byte of bytes) {
            for (let i = 0; i < 8 && bits.length < numBits; i++) {
                bits.push(((byte >> i) & 1) === 1);
            }
        }
        this.pos += numBytes;
        return bits;
    }
    readString() {
        const len = this.readUVarint();
        if (len === 0) {
            return "";
        }
        const val = unpack(this.bytes, this.pos, this.pos + len);
        this.pos += len;
        return val;
    }
    readBuffer(numBytes) {
        const bytes = this.bytes.slice(this.pos, this.pos + numBytes);
        this.pos += numBytes;
        return bytes;
    }
    remaining() {
        return this.view.byteLength - this.pos;
    }
}
exports.Reader = Reader;


/***/ }),

/***/ "../.hathora/node_modules/get-random-values/index.js":
/*!***********************************************************!*\
  !*** ../.hathora/node_modules/get-random-values/index.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var window = __webpack_require__(/*! global/window */ "../.hathora/node_modules/global/window.js");
var nodeCrypto = __webpack_require__(/*! crypto */ "?5d12");

function getRandomValues(buf) {
  if (window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(buf);
  }
  if (typeof window.msCrypto === 'object' && typeof window.msCrypto.getRandomValues === 'function') {
    return window.msCrypto.getRandomValues(buf);
  }
  if (nodeCrypto.randomBytes) {
    if (!(buf instanceof Uint8Array)) {
      throw new TypeError('expected Uint8Array');
    }
    if (buf.length > 65536) {
      var e = new Error();
      e.code = 22;
      e.message = 'Failed to execute \'getRandomValues\' on \'Crypto\': The ' +
        'ArrayBufferView\'s byte length (' + buf.length + ') exceeds the ' +
        'number of bytes of entropy available via this API (65536).';
      e.name = 'QuotaExceededError';
      throw e;
    }
    var bytes = nodeCrypto.randomBytes(buf.length);
    buf.set(bytes);
    return buf;
  }
  else {
    throw new Error('No secure random number generator available.');
  }
}

module.exports = getRandomValues;


/***/ }),

/***/ "../.hathora/node_modules/global/window.js":
/*!*************************************************!*\
  !*** ../.hathora/node_modules/global/window.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof __webpack_require__.g !== "undefined") {
    win = __webpack_require__.g;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;


/***/ }),

/***/ "../.hathora/node_modules/isomorphic-ws/browser.js":
/*!*********************************************************!*\
  !*** ../.hathora/node_modules/isomorphic-ws/browser.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// https://github.com/maxogden/websocket-stream/blob/48dc3ddf943e5ada668c31ccd94e9186f02fafbd/ws-fallback.js

var ws = null

if (typeof WebSocket !== 'undefined') {
  ws = WebSocket
} else if (typeof MozWebSocket !== 'undefined') {
  ws = MozWebSocket
} else if (typeof __webpack_require__.g !== 'undefined') {
  ws = __webpack_require__.g.WebSocket || __webpack_require__.g.MozWebSocket
} else if (typeof window !== 'undefined') {
  ws = window.WebSocket || window.MozWebSocket
} else if (typeof self !== 'undefined') {
  ws = self.WebSocket || self.MozWebSocket
}

module.exports = ws


/***/ }),

/***/ "../.hathora/node_modules/jwt-decode/build/jwt-decode.esm.js":
/*!*******************************************************************!*\
  !*** ../.hathora/node_modules/jwt-decode/build/jwt-decode.esm.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "InvalidTokenError": () => (/* binding */ n),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function e(e){this.message=e}e.prototype=new Error,e.prototype.name="InvalidCharacterError";var r="undefined"!=typeof window&&window.atob&&window.atob.bind(window)||function(r){var t=String(r).replace(/=+$/,"");if(t.length%4==1)throw new e("'atob' failed: The string to be decoded is not correctly encoded.");for(var n,o,a=0,i=0,c="";o=t.charAt(i++);~o&&(n=a%4?64*n+o:o,a++%4)?c+=String.fromCharCode(255&n>>(-2*a&6)):0)o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(o);return c};function t(e){var t=e.replace(/-/g,"+").replace(/_/g,"/");switch(t.length%4){case 0:break;case 2:t+="==";break;case 3:t+="=";break;default:throw"Illegal base64url string!"}try{return function(e){return decodeURIComponent(r(e).replace(/(.)/g,(function(e,r){var t=r.charCodeAt(0).toString(16).toUpperCase();return t.length<2&&(t="0"+t),"%"+t})))}(t)}catch(e){return r(t)}}function n(e){this.message=e}function o(e,r){if("string"!=typeof e)throw new n("Invalid token specified");var o=!0===(r=r||{}).header?0:1;try{return JSON.parse(t(e.split(".")[o]))}catch(e){throw new n("Invalid token specified: "+e.message)}}n.prototype=new Error,n.prototype.name="InvalidTokenError";/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (o);
//# sourceMappingURL=jwt-decode.esm.js.map


/***/ }),

/***/ "../.hathora/node_modules/net/index.js":
/*!*********************************************!*\
  !*** ../.hathora/node_modules/net/index.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/*
Copyright 2013 Sleepless Software Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE. 
*/

// yes, I know this seems stupid, but I have my reasons.

var net = __webpack_require__(/*! net */ "../.hathora/node_modules/net/index.js")
for(k in net)
	__webpack_require__.g[k] = net[k]



/***/ }),

/***/ "../.hathora/node_modules/utf8-buffer-size/main.js":
/*!*********************************************************!*\
  !*** ../.hathora/node_modules/utf8-buffer-size/main.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ utf8BufferSize)
/* harmony export */ });
/*
 * Copyright (c) 2018 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @fileoverview The utf8-buffer-size API.
 * @see https://github.com/rochars/utf8-buffer-size
 */

/** @module utf8BufferSize */

/**
 * Returns how many bytes are needed to serialize a UTF-8 string.
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 * @param {string} str The string to pack.
 * @return {number} The number of bytes needed to serialize the string.
 */
function utf8BufferSize(str) {
  /** @type {number} */
  let bytes = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    /** @type {number} */
    let codePoint = str.codePointAt(i);
    if (codePoint < 128) {
      bytes++;
    } else {
      if (codePoint <= 2047) {
        bytes++;
      } else if(codePoint <= 65535) {
        bytes+=2;
      } else if(codePoint <= 1114111) {
        i++;
        bytes+=3;
      }
      bytes++;
    }
  }
  return bytes;
}


/***/ }),

/***/ "../.hathora/node_modules/utf8-buffer/index.js":
/*!*****************************************************!*\
  !*** ../.hathora/node_modules/utf8-buffer/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "pack": () => (/* binding */ pack),
/* harmony export */   "unpack": () => (/* binding */ unpack)
/* harmony export */ });
/*
 * Copyright (c) 2018 Rafael da Silva Rocha.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @fileoverview Functions to serialize and deserialize UTF-8 strings.
 * @see https://github.com/rochars/utf8-buffer
 * @see https://encoding.spec.whatwg.org/#the-encoding
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 */

/** @module utf8-buffer */

/**
 * Read a string of UTF-8 characters from a byte buffer.
 * Invalid characters are replaced with 'REPLACEMENT CHARACTER' (U+FFFD).
 * @see https://encoding.spec.whatwg.org/#the-encoding
 * @see https://stackoverflow.com/a/34926911
 * @param {!Uint8Array|!Array<number>} buffer A byte buffer.
 * @param {number=} start The buffer index to start reading.
 * @param {?number=} end The buffer index to stop reading.
 *   Assumes the buffer length if undefined.
 * @return {string}
 */
function unpack(buffer, start=0, end=buffer.length) {
  /** @type {string} */
  let str = '';
  for(let index = start; index < end;) {
    /** @type {number} */
    let lowerBoundary = 0x80;
    /** @type {number} */
    let upperBoundary = 0xBF;
    /** @type {boolean} */
    let replace = false;
    /** @type {number} */
    let charCode = buffer[index++];
    if (charCode >= 0x00 && charCode <= 0x7F) {
      str += String.fromCharCode(charCode);
    } else {
      /** @type {number} */
      let count = 0;
      if (charCode >= 0xC2 && charCode <= 0xDF) {
        count = 1;
      } else if (charCode >= 0xE0 && charCode <= 0xEF ) {
        count = 2;
        if (buffer[index] === 0xE0) {
          lowerBoundary = 0xA0;
        }
        if (buffer[index] === 0xED) {
          upperBoundary = 0x9F;
        }
      } else if (charCode >= 0xF0 && charCode <= 0xF4 ) {
        count = 3;
        if (buffer[index] === 0xF0) {
          lowerBoundary = 0x90;
        }
        if (buffer[index] === 0xF4) {
          upperBoundary = 0x8F;
        }
      } else {
        replace = true;
      }
      charCode = charCode & (1 << (8 - count - 1)) - 1;
      for (let i = 0; i < count; i++) {
        if (buffer[index] < lowerBoundary || buffer[index] > upperBoundary) {
          replace = true;
        }
        charCode = (charCode << 6) | (buffer[index] & 0x3f);
        index++;
      }
      if (replace) {
        str += String.fromCharCode(0xFFFD);
      } 
      else if (charCode <= 0xffff) {
        str += String.fromCharCode(charCode);
      } else {
        charCode -= 0x10000;
        str += String.fromCharCode(
          ((charCode >> 10) & 0x3ff) + 0xd800,
          (charCode & 0x3ff) + 0xdc00);
      }
    }
  }
  return str;
}

/**
 * Write a string of UTF-8 characters to a byte buffer.
 * @see https://encoding.spec.whatwg.org/#utf-8-encoder
 * @param {string} str The string to pack.
 * @param {!Uint8Array|!Array<number>} buffer The buffer to pack the string to.
 * @param {number=} index The buffer index to start writing.
 * @return {number} The next index to write in the buffer.
 */
function pack(str, buffer, index=0) {
  for (let i = 0, len = str.length; i < len; i++) {
    /** @type {number} */
    let codePoint = str.codePointAt(i);
    if (codePoint < 128) {
      buffer[index] = codePoint;
      index++;
    } else {
      /** @type {number} */
      let count = 0;
      /** @type {number} */
      let offset = 0;
      if (codePoint <= 0x07FF) {
        count = 1;
        offset = 0xC0;
      } else if(codePoint <= 0xFFFF) {
        count = 2;
        offset = 0xE0;
      } else if(codePoint <= 0x10FFFF) {
        count = 3;
        offset = 0xF0;
        i++;
      }
      buffer[index] = (codePoint >> (6 * count)) + offset;
      index++;
      while (count > 0) {
        buffer[index] = 0x80 | (codePoint >> (6 * (count - 1)) & 0x3F);
        index++;
        count--;
      }
    }
  }
  return index;
}


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/style.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/style.css ***!
  \*************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "/*style.css*/\nbody {\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n}\n\n.ball {\n    position: absolute;\n    width: 15px;\n    height: 15px;\n    top: 0px;\n    left: 0px;\n    background-color: #fff;\n    border-radius: 50%;\n    transition: transform 0.1s linear;\n}\n\n.p1score {\n    position: absolute;\n    width: 75px;\n    height: 15px;\n    bottom: 5px;\n    left: 10px;\n    font-family: Arial;\n    font-size: 12px;\n    opacity: 0.5;\n}\n\n.p2score {\n    position: absolute;\n    width: 75px;\n    height: 15px;\n    bottom: 5px;\n    right: 10px;\n    font-family: Arial;\n    font-size: 12px;\n    opacity: 0.5;\n}\n\n.p1 {\n    position: absolute;\n    width: 10px;\n    height: 48px;\n    top: 0px;\n    left: 0px;\n    background-color: #fff;\n    transition: transform 0.1s linear;\n}\n\n.p2 {\n    position: absolute;\n    width: 10px;\n    height: 48px;\n    top: 0px;\n    left: 0px;\n    background-color: #fff;\n    transition: transform 0.1s linear;\n}\n\n.flex {\n    display: flex;\n}\n\n.small_width {\n    width: 15%;\n}\n\n.medium_width {\n    width: 25%;\n}\n\n.large_width {\n    width: 60%;\n}\n\n.spacedEqual {\n    justify-content: space-around;\n    align-items: center;\n}\n\n.startLeft {\n    justify-content: flex-start;\n    align-items: center;\n}\n\ninput {\n    height: 30px;\n}\n\n.button {\n    background-color: #224887;\n    border: 1px solid #224887;\n    color: white;\n    padding: 10px 32px;\n    text-align: center;\n    text-decoration: none;\n    font-size: 16px;\n    margin: 15px;\n}\n\n.button:hover {\n    background-color: white;\n    color: #224887;\n}\n\n.button:disabled {\n    background-color: gray;\n    color: black;\n}\n\nlabel {\n    margin-left: 10px;\n    margin-right: 10px;\n    width: 50px;\n}\n\n.gameArea {\n    position: relative;\n    background-color: #000000;\n    width: 600px;\n    height: 400px;\n    margin-top: 15px;\n    margin-left: 15px;\n    border: none;\n    color: white;\n    text-align: center;\n    text-decoration: none;\n    display: inline-block;\n    font-size: 16px;\n}\n\n.instructions {\n    margin: 15px;\n    font-family: Arial;\n    font-size: x-large;\n    font-weight: bold;\n    color: #224887;\n}\n", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"AAAA,YAAY;AACZ;IACI,sBAAsB;IACtB,SAAS;IACT,UAAU;AACd;;AAEA;IACI,kBAAkB;IAClB,WAAW;IACX,YAAY;IACZ,QAAQ;IACR,SAAS;IACT,sBAAsB;IACtB,kBAAkB;IAClB,iCAAiC;AACrC;;AAEA;IACI,kBAAkB;IAClB,WAAW;IACX,YAAY;IACZ,WAAW;IACX,UAAU;IACV,kBAAkB;IAClB,eAAe;IACf,YAAY;AAChB;;AAEA;IACI,kBAAkB;IAClB,WAAW;IACX,YAAY;IACZ,WAAW;IACX,WAAW;IACX,kBAAkB;IAClB,eAAe;IACf,YAAY;AAChB;;AAEA;IACI,kBAAkB;IAClB,WAAW;IACX,YAAY;IACZ,QAAQ;IACR,SAAS;IACT,sBAAsB;IACtB,iCAAiC;AACrC;;AAEA;IACI,kBAAkB;IAClB,WAAW;IACX,YAAY;IACZ,QAAQ;IACR,SAAS;IACT,sBAAsB;IACtB,iCAAiC;AACrC;;AAEA;IACI,aAAa;AACjB;;AAEA;IACI,UAAU;AACd;;AAEA;IACI,UAAU;AACd;;AAEA;IACI,UAAU;AACd;;AAEA;IACI,6BAA6B;IAC7B,mBAAmB;AACvB;;AAEA;IACI,2BAA2B;IAC3B,mBAAmB;AACvB;;AAEA;IACI,YAAY;AAChB;;AAEA;IACI,yBAAyB;IACzB,yBAAyB;IACzB,YAAY;IACZ,kBAAkB;IAClB,kBAAkB;IAClB,qBAAqB;IACrB,eAAe;IACf,YAAY;AAChB;;AAEA;IACI,uBAAuB;IACvB,cAAc;AAClB;;AAEA;IACI,sBAAsB;IACtB,YAAY;AAChB;;AAEA;IACI,iBAAiB;IACjB,kBAAkB;IAClB,WAAW;AACf;;AAEA;IACI,kBAAkB;IAClB,yBAAyB;IACzB,YAAY;IACZ,aAAa;IACb,gBAAgB;IAChB,iBAAiB;IACjB,YAAY;IACZ,YAAY;IACZ,kBAAkB;IAClB,qBAAqB;IACrB,qBAAqB;IACrB,eAAe;AACnB;;AAEA;IACI,YAAY;IACZ,kBAAkB;IAClB,kBAAkB;IAClB,iBAAiB;IACjB,cAAc;AAClB","sourcesContent":["/*style.css*/\nbody {\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n}\n\n.ball {\n    position: absolute;\n    width: 15px;\n    height: 15px;\n    top: 0px;\n    left: 0px;\n    background-color: #fff;\n    border-radius: 50%;\n    transition: transform 0.1s linear;\n}\n\n.p1score {\n    position: absolute;\n    width: 75px;\n    height: 15px;\n    bottom: 5px;\n    left: 10px;\n    font-family: Arial;\n    font-size: 12px;\n    opacity: 0.5;\n}\n\n.p2score {\n    position: absolute;\n    width: 75px;\n    height: 15px;\n    bottom: 5px;\n    right: 10px;\n    font-family: Arial;\n    font-size: 12px;\n    opacity: 0.5;\n}\n\n.p1 {\n    position: absolute;\n    width: 10px;\n    height: 48px;\n    top: 0px;\n    left: 0px;\n    background-color: #fff;\n    transition: transform 0.1s linear;\n}\n\n.p2 {\n    position: absolute;\n    width: 10px;\n    height: 48px;\n    top: 0px;\n    left: 0px;\n    background-color: #fff;\n    transition: transform 0.1s linear;\n}\n\n.flex {\n    display: flex;\n}\n\n.small_width {\n    width: 15%;\n}\n\n.medium_width {\n    width: 25%;\n}\n\n.large_width {\n    width: 60%;\n}\n\n.spacedEqual {\n    justify-content: space-around;\n    align-items: center;\n}\n\n.startLeft {\n    justify-content: flex-start;\n    align-items: center;\n}\n\ninput {\n    height: 30px;\n}\n\n.button {\n    background-color: #224887;\n    border: 1px solid #224887;\n    color: white;\n    padding: 10px 32px;\n    text-align: center;\n    text-decoration: none;\n    font-size: 16px;\n    margin: 15px;\n}\n\n.button:hover {\n    background-color: white;\n    color: #224887;\n}\n\n.button:disabled {\n    background-color: gray;\n    color: black;\n}\n\nlabel {\n    margin-left: 10px;\n    margin-right: 10px;\n    width: 50px;\n}\n\n.gameArea {\n    position: relative;\n    background-color: #000000;\n    width: 600px;\n    height: 400px;\n    margin-top: 15px;\n    margin-left: 15px;\n    border: none;\n    color: white;\n    text-align: center;\n    text-decoration: none;\n    display: inline-block;\n    font-size: 16px;\n}\n\n.instructions {\n    margin: 15px;\n    font-family: Arial;\n    font-size: x-large;\n    font-weight: bold;\n    color: #224887;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/peasy-ui/dist/index.js":
/*!*********************************************!*\
  !*** ./node_modules/peasy-ui/dist/index.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {

(()=>{"use strict";var e={d:(t,i)=>{for(var s in i)e.o(i,s)&&!e.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:i[s]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{UI:()=>n,UIView:()=>i});class i{constructor(){this.state="created",this.bindings=[],this.animations=[],this.animationQueue=[],this.destroyed="",this.moved=""}static create(e,t,s={},o={parent:null,prepare:!0,sibling:null}){var r;const l=new i;return l.model=s,l.element=t,l.bindings.push(...n.parse(l.element,s,l)),l.parentElement=e,l.sibling=o.sibling,l.parent=null!==(r=o.parent)&&void 0!==r?r:n,l.attached=new Promise((e=>{l.attachResolve=e})),l}destroy(){this.destroyed="queue",n.destroyed.push(this)}terminate(){Promise.all(this.element.getAnimations({subtree:!0}).map((e=>e.finished))).then((()=>{var e;null===(e=this.element.parentElement)||void 0===e||e.removeChild(this.element),this.bindings.forEach((e=>e.unbind()));const t=this.parent.views.findIndex((e=>e===this));t>-1&&this.parent.views.splice(t,1)})),this.destroyed="destroyed"}move(e){this.moved="queue",this.sibling=e}play(e,t){return"string"==typeof e&&(e=this.animations.find((t=>t.name===e)).clone()),e.element=t,e.state="pending",this.animationQueue.push(e),this.updateAnimations(performance.now()),e}updateFromUI(){this.bindings.forEach((e=>e.updateFromUI()))}updateToUI(){var e;this.bindings.forEach((e=>e.updateToUI())),"created"===this.state&&(this.parentElement.insertBefore(this.element,null===(e=this.sibling)||void 0===e?void 0:e.nextSibling),this.attachResolve(),this.state="attached")}updateAtEvents(){this.bindings.forEach((e=>e.updateAtEvents()))}updateAnimations(e){for(var t,i;null!==(i="finished"===(null===(t=this.animationQueue[0])||void 0===t?void 0:t.state))&&void 0!==i&&i;)this.animationQueue.shift().destroy();for(let t=0;t<this.animationQueue.length;t++){const i=this.animationQueue[t];"pending"===i.state&&(i.isBlocked(e)||(i.state="playing",i.startTime=e,i.animation=i.element.animate(i.keyframes,i.options),i.finished=i.animation.finished,i.finished.then((()=>{i.state="finished",this.updateAnimations(performance.now())}))))}}updateMove(){switch(this.moved){case"queue":this.moved="move";break;case"move":0===this.element.getAnimations({subtree:!0}).length&&(this.element.parentElement.insertBefore(this.element,this.sibling.nextSibling),this.moved="",this.sibling=void 0)}this.bindings.forEach((e=>e.updateMove()))}}class s{constructor(){this.fromUI=!1,this.toUI=!0,this.atEvent=!1,this.oneTime=!1,this.views=[],this.firstUpdate=!0,this.events=[],this.triggerAtEvent=e=>{this.events.push(e)},this.id=++n.id}get element(){return null==this.$element&&(this.$element=this.selector instanceof Element||this.selector instanceof Text||this.selector instanceof Comment?this.selector:this.context.querySelector(this.selector)),this.$element}set element(e){this.$element=e}static create(e){var t,i,o,r,l,a,h,u,d;const p=new s;return p.object="$model"in e.object?e.object:{$model:e.object},p.property=e.property,p.context=null!==(t=e.context)&&void 0!==t?t:document,p.selector=e.selector,p.attribute=null!==(i=e.attribute)&&void 0!==i?i:"innerText",p.value=null!==(o=e.value)&&void 0!==o?o:p.value,p.template=null!==(r=e.template)&&void 0!==r?r:p.template,p.fromUI=null!==(l=e.fromUI)&&void 0!==l?l:p.fromUI,p.toUI=null!==(a=e.toUI)&&void 0!==a?a:p.toUI,p.atEvent=null!==(h=e.atEvent)&&void 0!==h?h:p.atEvent,p.oneTime=null!==(u=e.oneTime)&&void 0!==u?u:p.oneTime,p.parent=null!==(d=e.parent)&&void 0!==d?d:n,p.addListener(),"boolean"!=typeof p.fromUI&&(p.fromUI=p.fromUI.bind(p)),"boolean"!=typeof p.toUI&&(p.toUI=p.toUI.bind(p)),p}destroy(){this.element=null,this.removeListener(),this.views.forEach((e=>e.destroy()))}unbind(){n.unbind(this)}addListener(){this.atEvent&&(this.toUI=!1,this.fromUI=!1,this.element.addEventListener(this.attribute,this.triggerAtEvent))}removeListener(){this.atEvent&&this.element.removeEventListener(this.attribute,this.triggerAtEvent)}updateFromUI(){if(!1===this.fromUI||this.firstUpdate)return this.firstUpdate=!1,void this.views.forEach((e=>e.updateFromUI()));const{target:e,property:t}=n.resolveProperty(this.element,this.attribute),i=e[t];if(i!==this.lastUIValue){let e=!0!==this.fromUI?this.fromUI(i,this.lastUIValue,this.property,this.object):i;if(this.lastUIValue=i,void 0!==e&&e!==this.lastValue){this.lastValue=e;const{target:t,property:i}=n.resolveProperty(this.object,this.property);"number"!==n.resolveValue(this.object,this.property)||isNaN(e)||(e=+e),t[i]=e}else this.lastValue=e}this.views.forEach((e=>e.updateFromUI()))}updateToUI(){var e,t,s,o,r,l;if(!1===this.toUI)return void this.views.forEach((e=>e.updateToUI()));let a=n.resolveValue(this.object,this.property),h=!1;if(null!=this.template)if("boolean"==typeof this.attribute){if(a!==this.lastValue){const e=!0!==this.toUI?this.toUI(a,this.lastValue,this.property,this.object):a;if(void 0!==e&&e!==this.lastUIValue){if(e===this.attribute)this.views.push(i.create(this.element.parentElement,this.template.cloneNode(!0),this.object,{parent:this,prepare:!1,sibling:this.element}));else{const e=this.views.pop();null==e||e.destroy()}this.lastValue=a,this.lastUIValue=e}}}else{null==a&&(a=[]);const n=null!==(e=this.lastValue)&&void 0!==e?e:[];if(a.length!==n.length)h=!0;else for(let e=0,t=a.length;e<t;e++)if(a[e]!==n[e]){h=!0;break}if(!h)return this.views.forEach((e=>e.updateToUI())),void(this.oneTime&&this.oneTimeDone());const u=!0!==this.toUI?this.toUI(a,n,this.property,this.object):a;if(null==u)return this.views.forEach((e=>e.updateToUI())),void(this.oneTime&&this.oneTimeDone());const d=null!==(t=this.lastUIValue)&&void 0!==t?t:[];let p=0;for(let e=0,t=u.length,i=0;e<t&&u[e]===d[i];e++,i++)p++;if(p===u.length&&u.length===d.length)return this.views.forEach((e=>e.updateToUI())),void(this.oneTime&&this.oneTimeDone());const c=this.views.splice(0,p);for(let e=p,t=u.length,n=p;e<t;e++,n++){const t=u[e];"string"!=typeof t&&(t.$index=e);const n=c[c.length-1],a=this.views.shift();if(null==a){const e={$model:{[this.attribute]:t},$parent:this.object};c.push(i.create(this.element.parentElement,this.template.cloneNode(!0),e,{parent:this,prepare:!1,sibling:null!==(s=null==n?void 0:n.element)&&void 0!==s?s:this.element}));continue}if(t===(null==a?void 0:a.model.$model[this.attribute])){c.push(a),a.move(null!==(o=null==n?void 0:n.element)&&void 0!==o?o:this.element);continue}const h=null==a?void 0:a.model.$model[this.attribute];if(!u.slice(e).includes(h)){a.destroy(),e--;continue}this.views.unshift(a);let d=!1;for(let e=0,i=this.views.length;e<i;e++){const i=this.views[e];if(t===(null==i?void 0:i.model.$model[this.attribute])){c.push(...this.views.splice(e,1)),i.move(null!==(r=null==n?void 0:n.element)&&void 0!==r?r:this.element),d=!0;break}}if(!d){const e={$model:{[this.attribute]:t},$parent:this.object};c.push(i.create(this.element.parentElement,this.template.cloneNode(!0),e,{parent:this,prepare:!1,sibling:null!==(l=null==n?void 0:n.element)&&void 0!==l?l:this.element}))}}this.views.forEach((e=>e.destroy())),this.views=c,this.lastValue=[...a],this.lastUIValue=[...u]}else if(a!==this.lastValue){const e=!0!==this.toUI?this.toUI(a,this.lastValue,this.property,this.object):a;if(void 0!==e&&e!==this.lastUIValue){const{target:t,property:i}=n.resolveProperty(this.element,this.attribute);t[i]=e,this.lastValue=a,this.lastUIValue=e}}this.views.forEach((e=>e.updateToUI())),this.oneTime&&this.oneTimeDone()}oneTimeDone(){this.toUI=!1,this.fromUI=!1}updateAtEvents(){let e=this.events.shift();for(;null!=e;)n.resolveValue(this.object,this.property)(e,this.object.$model,this.element,this.attribute,this.object),e=this.events.shift();this.views.forEach((e=>e.updateAtEvents()))}updateMove(){this.views.forEach((e=>e.updateMove()))}}class n{static create(e,t,s={},o={parent:null,prepare:!0,sibling:null}){if("string"==typeof t){const e=document.createElement("div");e.innerHTML=o.prepare?n.prepare(t):t,t=e.firstElementChild}const r=i.create(e,t,s,o);return r.parent===n&&n.views.push(r),r}static play(e,t){return"string"==typeof e?(e=this.globals.animations.find((t=>t.name===e)).clone()).play(t):e.play()}static parse(e,t,i=null){var s,o,r;const l=[];if(3===e.nodeType){let s=e.textContent,o=s.match(n.regexValue);for(;null!=o;){const r=o[1];let a=o[2];s=o[3];let h=!1;a.startsWith("|")&&(h=!0,a=a.slice(1).trimStart());let u=e.cloneNode();e.textContent=r,e.parentElement.insertBefore(u,e.nextSibling),l.push(n.bind({selector:u,attribute:"textContent",object:t,property:a,parent:i,oneTime:h})),u=(e=u).cloneNode(),u.textContent=s,e.parentElement.insertBefore(u,e.nextSibling),e=u,o=s.match(n.regexValue)}}else{if(l.push(...Object.keys(null!==(s=e.attributes)&&void 0!==s?s:[]).reverse().map((s=>{const o=[];if(e instanceof Comment)return[];const r=e.attributes[s];if(r.name.startsWith("pui.")){const s=r.value.match(n.regexAttribute);let o,l,[a,h,u,d,p]=s,c=!1;if("@"!==u){const i=h.match(/^'(.*?)'$/);if(null!=i)o=i[1],e.setAttribute("value",o),h="option"===e.nodeName.toLowerCase()?"selected":"checked",d=e=>e?o:void 0,u=e=>e===o;else if(""===h){if(">"===d){const{target:i,property:s}=n.resolveProperty(t,p);return i[s]=e,[]}{const t=document.createComment(r.name);e.parentNode.insertBefore(t,e),e.parentNode.removeChild(e),e.removeAttribute(r.name),l=e,e=t,h="="===u,u=!0,"|"===d&&(c=!0)}}else if("*"===d){const t=document.createComment(r.name);e.parentNode.insertBefore(t,e),e.parentNode.removeChild(e),e.removeAttribute(r.name),l=e,e=t}else"|"===d?c=!0:"checked"!==h&&e.setAttribute(h,"")}return[n.bind({selector:e,attribute:h,value:o,object:t,property:p,template:l,toUI:"string"==typeof u?"<"===u:u,fromUI:"string"==typeof d?">"===d:d,atEvent:"@"===u,parent:i,oneTime:c})]}const l=[r.value];let a=0,h=l[a].match(n.regexValue);for(;null!=h;){let{before:s,property:u,after:d}=h.groups,p=!1;u.startsWith("|")&&(p=!0,u=u.slice(1).trimStart()),o.push(n.bind({selector:e,attribute:r.name,object:t,property:u,oneTime:p,toUI(t,i,s,o){if(this.oneTime){const e=l.indexOf(s);e>-1&&(l[e]=n.resolveValue(o,s),l[e-1]+=l[e]+l[e+1],l.splice(e,2))}const a=l.map(((e,t)=>t%2==0?e:n.resolveValue(o,e))).join("");e.setAttribute(r.name,a)},parent:i})),l[a++]=s,l[a++]=u,l[a]=d,h=l[a].match(n.regexValue)}return o})).flat()),e instanceof Comment)return l.filter((e=>null!=e.template||(e.unbind(),!1)));if(!n.leaveAttributes)for(let t=Object.keys(null!==(o=e.attributes)&&void 0!==o?o:[]).length-1;t>=0;t--){const i=e.attributes[Object.keys(null!==(r=e.attributes)&&void 0!==r?r:[])[t]];i.name.startsWith("pui.")&&e.removeAttribute(i.name)}l.push(...Array.from(e.childNodes).map((e=>n.parse(e,t,i))).flat())}return l}static bind(e){return s.create(e)}static unbind(e){if(e.destroy(),e.parent!==n){const t=e.parent.bindings,i=t.indexOf(e);i>-1&&t.splice(i,1)}}static update(){this.views.forEach((e=>e.updateFromUI())),this.views.forEach((e=>e.updateToUI())),this.views.forEach((e=>e.updateAtEvents()));const e=performance.now();[...this.views,this.globals].forEach((t=>t.updateAnimations(e))),this.views.forEach((e=>{e.updateMove()})),this.destroyed.forEach((e=>{switch(e.destroyed){case"queue":e.destroyed="destroy";break;case"destroy":{e.terminate();const t=this.destroyed.findIndex((t=>e===t));t>-1&&this.destroyed.splice(t,1)}}}))}static resolveProperty(e,t){const i=(t=t.replace("[",".").replace("]",".")).split(".").filter((e=>(null!=e?e:"").length>0));let s="$model"in e?e.$model:e;for(;i.length>1;)s=s[i.shift()];return{target:s,property:i[0]}}static resolveValue(e,t){let i=0;do{const{target:i,property:s}=n.resolveProperty(e,t);if(s in i)return i[s];e=e.$parent}while(null!=e&&i++<1e3)}static prepare(e){let t=e;e="";let i=t.match(n.regexReplace);for(;null!=i;){const[s,o,r,l]=i;e+=`${o} PUI.${n.bindingCounter++}="${r}" `,t=l,i=t.match(n.regexReplace)}return e+t}}n.id=0,n.views=[],n.destroyed=[],n.globals=new i,n.leaveAttributes=!1,n.regexReplace=/([\S\s]*?)\$\{([^}]*?[<=@!]=[*=>|][^}]*?)\}([\S\s]*)/m,n.regexAttribute=/^\s*(\S*?)\s*([<=@!])=([*=>|])\s*(\S*?)\s*$/,n.regexValue=/(?<before>[\S\s]*?)\$\{\s*(?<property>[\s\S]*?)\s*\}(?<after>[\S\s]*)/m,n.bindingCounter=0;var o=exports;for(var r in t)o[r]=t[r];t.__esModule&&Object.defineProperty(o,"__esModule",{value:!0})})();

/***/ }),

/***/ "./src/style.css":
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./src/style.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "../../api/base.ts":
/*!*************************!*\
  !*** ../../api/base.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "COORDINATOR_HOST": () => (/* binding */ COORDINATOR_HOST),
/* harmony export */   "MATCHMAKER_HOST": () => (/* binding */ MATCHMAKER_HOST),
/* harmony export */   "Message": () => (/* binding */ Message),
/* harmony export */   "Method": () => (/* binding */ Method),
/* harmony export */   "NO_DIFF": () => (/* binding */ NO_DIFF),
/* harmony export */   "Response": () => (/* binding */ Response),
/* harmony export */   "getUserDisplayName": () => (/* binding */ getUserDisplayName),
/* harmony export */   "lookupUser": () => (/* binding */ lookupUser)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "../../api/node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);

const COORDINATOR_HOST = "coordinator.hathora.dev";
const MATCHMAKER_HOST = "matchmaker.hathora.com";
const NO_DIFF = Symbol("NODIFF");
var Method;
(function (Method) {
    Method[Method["UPDATE_PLAYER_VELOCITY"] = 0] = "UPDATE_PLAYER_VELOCITY";
    Method[Method["START_ROUND"] = 1] = "START_ROUND";
    Method[Method["JOIN_GAME"] = 2] = "JOIN_GAME";
    Method[Method["START_GAME"] = 3] = "START_GAME";
})(Method || (Method = {}));
const Response = {
    ok: () => ({ type: "ok" }),
    error: (error) => ({ type: "error", error }),
};
const Message = {
    response: (msgId, response) => ({ type: "response", msgId, response }),
    event: (event) => ({ type: "event", event }),
};
function lookupUser(userId) {
    return axios__WEBPACK_IMPORTED_MODULE_0___default().get(`https://${COORDINATOR_HOST}/users/${userId}`).then((res) => res.data);
}
function getUserDisplayName(user) {
    switch (user.type) {
        case "anonymous":
            return user.name;
    }
}


/***/ }),

/***/ "../../api/types.ts":
/*!**************************!*\
  !*** ../../api/types.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Ball": () => (/* binding */ Ball),
/* harmony export */   "GameStates": () => (/* binding */ GameStates),
/* harmony export */   "IInitializeRequest": () => (/* binding */ IInitializeRequest),
/* harmony export */   "IJoinGameRequest": () => (/* binding */ IJoinGameRequest),
/* harmony export */   "IStartGameRequest": () => (/* binding */ IStartGameRequest),
/* harmony export */   "IStartRoundRequest": () => (/* binding */ IStartRoundRequest),
/* harmony export */   "IUpdatePlayerVelocityRequest": () => (/* binding */ IUpdatePlayerVelocityRequest),
/* harmony export */   "Player": () => (/* binding */ Player),
/* harmony export */   "PlayerState": () => (/* binding */ PlayerState),
/* harmony export */   "ServerState": () => (/* binding */ ServerState),
/* harmony export */   "Vector": () => (/* binding */ Vector),
/* harmony export */   "decodeStateSnapshot": () => (/* binding */ decodeStateSnapshot),
/* harmony export */   "decodeStateUpdate": () => (/* binding */ decodeStateUpdate),
/* harmony export */   "encodeStateError": () => (/* binding */ encodeStateError),
/* harmony export */   "encodeStateSnapshot": () => (/* binding */ encodeStateSnapshot),
/* harmony export */   "encodeStateUpdate": () => (/* binding */ encodeStateUpdate)
/* harmony export */ });
/* harmony import */ var bin_serde__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bin-serde */ "../../api/node_modules/bin-serde/lib/index.js");
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base */ "../../api/base.ts");


var GameStates;
(function (GameStates) {
    GameStates[GameStates["Idle"] = 0] = "Idle";
    GameStates[GameStates["PlayersJoining"] = 1] = "PlayersJoining";
    GameStates[GameStates["WaitingToStartGame"] = 2] = "WaitingToStartGame";
    GameStates[GameStates["WaitingToStartRound"] = 3] = "WaitingToStartRound";
    GameStates[GameStates["InProgress"] = 4] = "InProgress";
    GameStates[GameStates["GameOver"] = 5] = "GameOver";
})(GameStates || (GameStates = {}));
const Vector = {
    default() {
        return {
            x: 0.0,
            y: 0.0,
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid Vector object: ${obj}`];
        }
        let validationErrors;
        validationErrors = validatePrimitive(typeof obj.x === "number", `Invalid float: ${obj.x}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Vector.x");
        }
        validationErrors = validatePrimitive(typeof obj.y === "number", `Invalid float: ${obj.y}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Vector.y");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeFloat(buf, obj.x);
        writeFloat(buf, obj.y);
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.x !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.y !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.x !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeFloat(buf, obj.x);
        }
        if (obj.y !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeFloat(buf, obj.y);
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            x: parseFloat(sb),
            y: parseFloat(sb),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(2);
        return {
            x: tracker.shift() ? parseFloat(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            y: tracker.shift() ? parseFloat(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const Ball = {
    default() {
        return {
            position: Vector.default(),
            velocity: Vector.default(),
            radius: 0,
            isColliding: false,
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid Ball object: ${obj}`];
        }
        let validationErrors;
        validationErrors = Vector.validate(obj.position);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Ball.position");
        }
        validationErrors = Vector.validate(obj.velocity);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Ball.velocity");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.radius), `Invalid int: ${obj.radius}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Ball.radius");
        }
        validationErrors = validatePrimitive(typeof obj.isColliding === "boolean", `Invalid boolean: ${obj.isColliding}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Ball.isColliding");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        Vector.encode(obj.position, buf);
        Vector.encode(obj.velocity, buf);
        writeInt(buf, obj.radius);
        writeBoolean(buf, obj.isColliding);
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.position !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.velocity !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.radius !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.isColliding !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.position !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            Vector.encodeDiff(obj.position, buf);
        }
        if (obj.velocity !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            Vector.encodeDiff(obj.velocity, buf);
        }
        if (obj.radius !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.radius);
        }
        if (obj.isColliding !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeBoolean(buf, obj.isColliding);
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            position: Vector.decode(sb),
            velocity: Vector.decode(sb),
            radius: parseInt(sb),
            isColliding: parseBoolean(sb),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(4);
        return {
            position: tracker.shift() ? Vector.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            velocity: tracker.shift() ? Vector.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            radius: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            isColliding: tracker.shift() ? parseBoolean(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const Player = {
    default() {
        return {
            id: "",
            lives: 0,
            position: Vector.default(),
            size: Vector.default(),
            velocity: Vector.default(),
            isColliding: false,
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid Player object: ${obj}`];
        }
        let validationErrors;
        validationErrors = validatePrimitive(typeof obj.id === "string", `Invalid UserId: ${obj.id}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.id");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.lives), `Invalid int: ${obj.lives}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.lives");
        }
        validationErrors = Vector.validate(obj.position);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.position");
        }
        validationErrors = Vector.validate(obj.size);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.size");
        }
        validationErrors = Vector.validate(obj.velocity);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.velocity");
        }
        validationErrors = validatePrimitive(typeof obj.isColliding === "boolean", `Invalid boolean: ${obj.isColliding}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: Player.isColliding");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeString(buf, obj.id);
        writeInt(buf, obj.lives);
        Vector.encode(obj.position, buf);
        Vector.encode(obj.size, buf);
        Vector.encode(obj.velocity, buf);
        writeBoolean(buf, obj.isColliding);
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.lives !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.position !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.size !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.velocity !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.isColliding !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.id !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeString(buf, obj.id);
        }
        if (obj.lives !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.lives);
        }
        if (obj.position !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            Vector.encodeDiff(obj.position, buf);
        }
        if (obj.size !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            Vector.encodeDiff(obj.size, buf);
        }
        if (obj.velocity !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            Vector.encodeDiff(obj.velocity, buf);
        }
        if (obj.isColliding !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeBoolean(buf, obj.isColliding);
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            id: parseString(sb),
            lives: parseInt(sb),
            position: Vector.decode(sb),
            size: Vector.decode(sb),
            velocity: Vector.decode(sb),
            isColliding: parseBoolean(sb),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(6);
        return {
            id: tracker.shift() ? parseString(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            lives: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            position: tracker.shift() ? Vector.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            size: tracker.shift() ? Vector.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            velocity: tracker.shift() ? Vector.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            isColliding: tracker.shift() ? parseBoolean(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const ServerState = {
    default() {
        return {
            Players: [],
            Balls: [],
            gameState: 0,
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid ServerState object: ${obj}`];
        }
        let validationErrors;
        validationErrors = validateArray(obj.Players, (x) => Player.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: ServerState.Players");
        }
        validationErrors = validateArray(obj.Balls, (x) => Ball.validate(x));
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: ServerState.Balls");
        }
        validationErrors = validatePrimitive(obj.gameState in GameStates, `Invalid GameStates: ${obj.gameState}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: ServerState.gameState");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        writeArray(buf, obj.Players, (x) => Player.encode(x, buf));
        writeArray(buf, obj.Balls, (x) => Ball.encode(x, buf));
        writeUInt8(buf, obj.gameState);
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.Players !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.Balls !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.gameState !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.Players !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.Players, (x) => Player.encodeDiff(x, buf));
        }
        if (obj.Balls !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeArrayDiff(buf, obj.Balls, (x) => Ball.encodeDiff(x, buf));
        }
        if (obj.gameState !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeUInt8(buf, obj.gameState);
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            Players: parseArray(sb, () => Player.decode(sb)),
            Balls: parseArray(sb, () => Ball.decode(sb)),
            gameState: parseUInt8(sb),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(3);
        return {
            Players: tracker.shift() ? parseArrayDiff(sb, () => Player.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            Balls: tracker.shift() ? parseArrayDiff(sb, () => Ball.decodeDiff(sb)) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            gameState: tracker.shift() ? parseUInt8(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const PlayerState = {
    default() {
        return {
            player1position: Vector.default(),
            player2position: Vector.default(),
            ballposition: Vector.default(),
            player1Lives: 0,
            player2Lives: 0,
        };
    },
    validate(obj) {
        if (typeof obj !== "object") {
            return [`Invalid PlayerState object: ${obj}`];
        }
        let validationErrors;
        validationErrors = Vector.validate(obj.player1position);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: PlayerState.player1position");
        }
        validationErrors = Vector.validate(obj.player2position);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: PlayerState.player2position");
        }
        validationErrors = Vector.validate(obj.ballposition);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: PlayerState.ballposition");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.player1Lives), `Invalid int: ${obj.player1Lives}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: PlayerState.player1Lives");
        }
        validationErrors = validatePrimitive(Number.isInteger(obj.player2Lives), `Invalid int: ${obj.player2Lives}`);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid key: PlayerState.player2Lives");
        }
        return validationErrors;
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        Vector.encode(obj.player1position, buf);
        Vector.encode(obj.player2position, buf);
        Vector.encode(obj.ballposition, buf);
        writeInt(buf, obj.player1Lives);
        writeInt(buf, obj.player2Lives);
        return buf;
    },
    encodeDiff(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        const tracker = [];
        tracker.push(obj.player1position !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.player2position !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.ballposition !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.player1Lives !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        tracker.push(obj.player2Lives !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        buf.writeBits(tracker);
        if (obj.player1position !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            Vector.encodeDiff(obj.player1position, buf);
        }
        if (obj.player2position !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            Vector.encodeDiff(obj.player2position, buf);
        }
        if (obj.ballposition !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            Vector.encodeDiff(obj.ballposition, buf);
        }
        if (obj.player1Lives !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.player1Lives);
        }
        if (obj.player2Lives !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            writeInt(buf, obj.player2Lives);
        }
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            player1position: Vector.decode(sb),
            player2position: Vector.decode(sb),
            ballposition: Vector.decode(sb),
            player1Lives: parseInt(sb),
            player2Lives: parseInt(sb),
        };
    },
    decodeDiff(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        const tracker = sb.readBits(5);
        return {
            player1position: tracker.shift() ? Vector.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            player2position: tracker.shift() ? Vector.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            ballposition: tracker.shift() ? Vector.decodeDiff(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            player1Lives: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
            player2Lives: tracker.shift() ? parseInt(sb) : _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF,
        };
    },
};
const IUpdatePlayerVelocityRequest = {
    default() {
        return {
            velocity: Vector.default(),
        };
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        Vector.encode(obj.velocity, buf);
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {
            velocity: Vector.decode(sb),
        };
    },
};
const IStartRoundRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IJoinGameRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IStartGameRequest = {
    default() {
        return {};
    },
    encode(obj, writer) {
        const buf = writer ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
        return buf;
    },
    decode(buf) {
        const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
        return {};
    },
};
const IInitializeRequest = {
    default() {
        return {};
    },
    encode(x, buf) {
        return buf ?? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
    },
    decode(sb) {
        return {};
    },
};
function encodeStateSnapshot(x) {
    const buf = new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
    buf.writeUInt8(0);
    PlayerState.encode(x, buf);
    return buf.toBuffer();
}
function encodeStateUpdate(x, changedAtDiff, messages) {
    const buf = new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
    buf.writeUInt8(1);
    buf.writeUVarint(changedAtDiff);
    const responses = messages.flatMap((msg) => (msg.type === "response" ? msg : []));
    buf.writeUVarint(responses.length);
    responses.forEach(({ msgId, response }) => {
        buf.writeUInt32(Number(msgId));
        writeOptional(buf, response.type === "error" ? response.error : undefined, (x) => writeString(buf, x));
    });
    const events = messages.flatMap((msg) => (msg.type === "event" ? msg : []));
    buf.writeUVarint(events.length);
    events.forEach(({ event }) => buf.writeString(event));
    if (x !== undefined) {
        PlayerState.encodeDiff(x, buf);
    }
    return buf.toBuffer();
}
function encodeStateError() {
    const buf = new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer();
    buf.writeUInt8(2);
    return buf.toBuffer();
}
function decodeStateUpdate(buf) {
    const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
    const changedAtDiff = sb.readUVarint();
    const responses = [...Array(sb.readUVarint())].map(() => {
        const msgId = sb.readUInt32();
        const maybeError = parseOptional(sb, () => parseString(sb));
        return _base__WEBPACK_IMPORTED_MODULE_1__.Message.response(msgId, maybeError === undefined ? _base__WEBPACK_IMPORTED_MODULE_1__.Response.ok() : _base__WEBPACK_IMPORTED_MODULE_1__.Response.error(maybeError));
    });
    const events = [...Array(sb.readUVarint())].map(() => _base__WEBPACK_IMPORTED_MODULE_1__.Message.event(sb.readString()));
    const stateDiff = sb.remaining() ? PlayerState.decodeDiff(sb) : undefined;
    return { stateDiff, changedAtDiff, responses, events };
}
function decodeStateSnapshot(buf) {
    const sb = ArrayBuffer.isView(buf) ? new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(buf) : buf;
    return PlayerState.decode(sb);
}
function validatePrimitive(isValid, errorMessage) {
    return isValid ? [] : [errorMessage];
}
function validateOptional(val, innerValidate) {
    if (val !== undefined) {
        return innerValidate(val);
    }
    return [];
}
function validateArray(arr, innerValidate) {
    if (!Array.isArray(arr)) {
        return ["Invalid array: " + arr];
    }
    for (let i = 0; i < arr.length; i++) {
        const validationErrors = innerValidate(arr[i]);
        if (validationErrors.length > 0) {
            return validationErrors.concat("Invalid array item at index " + i);
        }
    }
    return [];
}
function writeUInt8(buf, x) {
    buf.writeUInt8(x);
}
function writeBoolean(buf, x) {
    buf.writeUInt8(x ? 1 : 0);
}
function writeInt(buf, x) {
    buf.writeVarint(x);
}
function writeFloat(buf, x) {
    buf.writeFloat(x);
}
function writeString(buf, x) {
    buf.writeString(x);
}
function writeOptional(buf, x, innerWrite) {
    writeBoolean(buf, x !== undefined);
    if (x !== undefined) {
        innerWrite(x);
    }
}
function writeArray(buf, x, innerWrite) {
    buf.writeUVarint(x.length);
    for (const val of x) {
        innerWrite(val);
    }
}
function writeArrayDiff(buf, x, innerWrite) {
    buf.writeUVarint(x.length);
    const tracker = [];
    x.forEach((val) => {
        tracker.push(val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
    });
    buf.writeBits(tracker);
    x.forEach((val) => {
        if (val !== _base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF) {
            innerWrite(val);
        }
    });
}
function parseUInt8(buf) {
    return buf.readUInt8();
}
function parseBoolean(buf) {
    return buf.readUInt8() > 0;
}
function parseInt(buf) {
    return buf.readVarint();
}
function parseFloat(buf) {
    return buf.readFloat();
}
function parseString(buf) {
    return buf.readString();
}
function parseOptional(buf, innerParse) {
    return parseBoolean(buf) ? innerParse(buf) : undefined;
}
function parseArray(buf, innerParse) {
    const len = buf.readUVarint();
    const arr = [];
    for (let i = 0; i < len; i++) {
        arr.push(innerParse());
    }
    return arr;
}
function parseArrayDiff(buf, innerParse) {
    const len = buf.readUVarint();
    const tracker = buf.readBits(len);
    const arr = [];
    for (let i = 0; i < len; i++) {
        if (tracker.shift()) {
            arr.push(innerParse());
        }
        else {
            arr.push(_base__WEBPACK_IMPORTED_MODULE_1__.NO_DIFF);
        }
    }
    return arr;
}


/***/ }),

/***/ "../.hathora/client.ts":
/*!*****************************!*\
  !*** ../.hathora/client.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HathoraClient": () => (/* binding */ HathoraClient),
/* harmony export */   "HathoraConnection": () => (/* binding */ HathoraConnection)
/* harmony export */ });
/* harmony import */ var jwt_decode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jwt-decode */ "../.hathora/node_modules/jwt-decode/build/jwt-decode.esm.js");
/* harmony import */ var get_random_values__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! get-random-values */ "../.hathora/node_modules/get-random-values/index.js");
/* harmony import */ var get_random_values__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(get_random_values__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var bin_serde__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bin-serde */ "../.hathora/node_modules/bin-serde/lib/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! axios */ "../.hathora/node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _api_types__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../api/types */ "../../api/types.ts");
/* harmony import */ var _api_base__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../api/base */ "../../api/base.ts");
/* harmony import */ var _transport__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./transport */ "../.hathora/transport.ts");
/* harmony import */ var _patch__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./patch */ "../.hathora/patch.ts");
/* harmony import */ var _failures__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./failures */ "../.hathora/failures.ts");

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore








class HathoraClient {
    constructor() {
        this.appId = "44e298fc0a5bccb88bdd70723f72b986f73ea3a70b580def7ba7da3fba061f96";
    }
    static getUserFromToken(token) {
        return (0,jwt_decode__WEBPACK_IMPORTED_MODULE_0__["default"])(token);
    }
    async loginAnonymous() {
        const res = await axios__WEBPACK_IMPORTED_MODULE_3___default().post(`https://${_api_base__WEBPACK_IMPORTED_MODULE_5__.COORDINATOR_HOST}/${this.appId}/login/anonymous`);
        return res.data.token;
    }
    async create(token, request) {
        const res = await axios__WEBPACK_IMPORTED_MODULE_3___default().post(`https://${_api_base__WEBPACK_IMPORTED_MODULE_5__.COORDINATOR_HOST}/${this.appId}/create`, _api_types__WEBPACK_IMPORTED_MODULE_4__.IInitializeRequest.encode(request).toBuffer(), { headers: { Authorization: token, "Content-Type": "application/octet-stream" } });
        return res.data.stateId;
    }
    async connect(token, stateId, onUpdate, onError, transportType) {
        const connection = new HathoraConnection(this.appId, stateId, token, onUpdate, onError, transportType);
        await connection.connect();
        return connection;
    }
    async findMatch(token, request, numPlayers, onUpdate) {
        return new Promise((resolve, reject) => {
            const socket = new WebSocket(`wss://${_api_base__WEBPACK_IMPORTED_MODULE_5__.MATCHMAKER_HOST}/${this.appId}`);
            socket.binaryType = "arraybuffer";
            socket.onclose = reject;
            socket.onopen = () => socket.send(new bin_serde__WEBPACK_IMPORTED_MODULE_2__.Writer()
                .writeString(token)
                .writeUVarint(numPlayers)
                .writeBuffer(_api_types__WEBPACK_IMPORTED_MODULE_4__.IInitializeRequest.encode(request).toBuffer())
                .toBuffer());
            socket.onmessage = ({ data }) => {
                const reader = new bin_serde__WEBPACK_IMPORTED_MODULE_2__.Reader(new Uint8Array(data));
                const type = reader.readUInt8();
                if (type === 0) {
                    onUpdate(reader.readUVarint());
                }
                else if (type === 1) {
                    resolve(reader.readString());
                }
                else {
                    console.error("Unknown message type", type);
                }
            };
        });
    }
}
class HathoraConnection {
    constructor(appId, stateId, token, onUpdate, onError, transportType) {
        this.appId = appId;
        this.stateId = stateId;
        this.token = token;
        this.callbacks = {};
        this.changedAt = 0;
        this.updateListeners = [];
        this.errorListeners = [];
        this.handleData = (data) => {
            const reader = new bin_serde__WEBPACK_IMPORTED_MODULE_2__.Reader(new Uint8Array(data));
            const type = reader.readUInt8();
            if (type === 0) {
                this.internalState = (0,_api_types__WEBPACK_IMPORTED_MODULE_4__.decodeStateSnapshot)(reader);
                this.changedAt = 0;
                this.updateListeners.forEach((listener) => listener({
                    stateId: this.stateId,
                    state: JSON.parse(JSON.stringify(this.internalState)),
                    updatedAt: 0,
                    events: [],
                }));
            }
            else if (type === 1) {
                const { stateDiff, changedAtDiff, responses, events } = (0,_api_types__WEBPACK_IMPORTED_MODULE_4__.decodeStateUpdate)(reader);
                if (stateDiff !== undefined) {
                    this.internalState = (0,_patch__WEBPACK_IMPORTED_MODULE_7__.computePatch)(this.internalState, stateDiff);
                }
                this.changedAt += changedAtDiff;
                this.updateListeners.forEach((listener) => listener({
                    stateId: this.stateId,
                    state: JSON.parse(JSON.stringify(this.internalState)),
                    updatedAt: this.changedAt,
                    events: events.map((e) => e.event),
                }));
                responses.forEach(({ msgId, response }) => {
                    if (msgId in this.callbacks) {
                        this.callbacks[msgId](response);
                        delete this.callbacks[msgId];
                    }
                });
            }
            else if (type === 2) {
                this.transport.disconnect(4004);
            }
            else if (type === 3) {
                this.transport.pong();
            }
            else {
                console.error("Unknown message type", type);
            }
        };
        this.handleClose = (e) => {
            console.error("Connection closed", e);
            this.errorListeners.forEach((listener) => listener((0,_failures__WEBPACK_IMPORTED_MODULE_8__.transformCoordinatorFailure)(e)));
        };
        this.stateId = stateId;
        this.token = token;
        if (transportType === undefined || transportType === _transport__WEBPACK_IMPORTED_MODULE_6__.TransportType.WebSocket) {
            this.transport = new _transport__WEBPACK_IMPORTED_MODULE_6__.WebSocketHathoraTransport(appId);
        }
        else if (transportType === _transport__WEBPACK_IMPORTED_MODULE_6__.TransportType.TCP) {
            this.transport = new _transport__WEBPACK_IMPORTED_MODULE_6__.TCPHathoraTransport(appId);
        }
        else {
            throw new Error("Unknown transport type");
        }
        if (onUpdate !== undefined) {
            this.onUpdate(onUpdate);
        }
        if (onError !== undefined) {
            this.onError(onError);
        }
    }
    async connect() {
        await this.transport.connect(this.stateId, this.token, this.handleData, this.handleClose);
    }
    get state() {
        if (this.internalState === undefined) {
            throw new Error("Must wait on HathoraConnection.connect() before looking up state");
        }
        return this.internalState;
    }
    onUpdate(listener) {
        this.updateListeners.push(listener);
    }
    onError(listener) {
        this.errorListeners.push(listener);
    }
    removeAllListeners() {
        this.updateListeners = [];
        this.errorListeners = [];
    }
    updatePlayerVelocity(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.UPDATE_PLAYER_VELOCITY, _api_types__WEBPACK_IMPORTED_MODULE_4__.IUpdatePlayerVelocityRequest.encode(request).toBuffer());
    }
    startRound(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.START_ROUND, _api_types__WEBPACK_IMPORTED_MODULE_4__.IStartRoundRequest.encode(request).toBuffer());
    }
    joinGame(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.JOIN_GAME, _api_types__WEBPACK_IMPORTED_MODULE_4__.IJoinGameRequest.encode(request).toBuffer());
    }
    startGame(request) {
        return this.callMethod(_api_base__WEBPACK_IMPORTED_MODULE_5__.Method.START_GAME, _api_types__WEBPACK_IMPORTED_MODULE_4__.IStartGameRequest.encode(request).toBuffer());
    }
    disconnect(code) {
        this.transport.disconnect(code);
    }
    callMethod(method, request) {
        return new Promise((resolve, reject) => {
            if (!this.transport.isReady()) {
                reject("Connection not open");
            }
            else {
                const msgId = get_random_values__WEBPACK_IMPORTED_MODULE_1___default()(new Uint8Array(4));
                this.transport.write(new Uint8Array([...new Uint8Array([method]), ...msgId, ...request]));
                this.callbacks[new DataView(msgId.buffer).getUint32(0)] = resolve;
            }
        });
    }
}


/***/ }),

/***/ "../.hathora/failures.ts":
/*!*******************************!*\
  !*** ../.hathora/failures.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ConnectionFailureType": () => (/* binding */ ConnectionFailureType),
/* harmony export */   "transformCoordinatorFailure": () => (/* binding */ transformCoordinatorFailure)
/* harmony export */ });
var ConnectionFailureType;
(function (ConnectionFailureType) {
    ConnectionFailureType["STATE_NOT_FOUND"] = "STATE_NOT_FOUND";
    ConnectionFailureType["NO_AVAILABLE_STORES"] = "NO_AVAILABLE_STORES";
    ConnectionFailureType["INVALID_USER_DATA"] = "INVALID_USER_DATA";
    ConnectionFailureType["INVALID_STATE_ID"] = "INVALID_STATE_ID";
    ConnectionFailureType["GENERIC_FAILURE"] = "GENERIC_FAILURE";
})(ConnectionFailureType || (ConnectionFailureType = {}));
const transformCoordinatorFailure = (e) => {
    return {
        message: e.reason,
        type: (function (code) {
            switch (code) {
                case 4000:
                    return ConnectionFailureType.STATE_NOT_FOUND;
                case 4001:
                    return ConnectionFailureType.NO_AVAILABLE_STORES;
                case 4002:
                    return ConnectionFailureType.INVALID_USER_DATA;
                case 4003:
                    return ConnectionFailureType.INVALID_STATE_ID;
                default:
                    return ConnectionFailureType.GENERIC_FAILURE;
            }
        })(e.code)
    };
};


/***/ }),

/***/ "../.hathora/patch.ts":
/*!****************************!*\
  !*** ../.hathora/patch.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "computePatch": () => (/* binding */ computePatch)
/* harmony export */ });
/* harmony import */ var _api_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../api/base */ "../../api/base.ts");

function patchVector(obj, patch) {
    if (patch.x !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.x = patch.x;
    }
    if (patch.y !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.y = patch.y;
    }
    return obj;
}
function patchBall(obj, patch) {
    if (patch.position !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.position = patchVector(obj.position, patch.position);
    }
    if (patch.velocity !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.velocity = patchVector(obj.velocity, patch.velocity);
    }
    if (patch.radius !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.radius = patch.radius;
    }
    if (patch.isColliding !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.isColliding = patch.isColliding;
    }
    return obj;
}
function patchPlayer(obj, patch) {
    if (patch.id !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.id = patch.id;
    }
    if (patch.lives !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.lives = patch.lives;
    }
    if (patch.position !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.position = patchVector(obj.position, patch.position);
    }
    if (patch.size !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.size = patchVector(obj.size, patch.size);
    }
    if (patch.velocity !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.velocity = patchVector(obj.velocity, patch.velocity);
    }
    if (patch.isColliding !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.isColliding = patch.isColliding;
    }
    return obj;
}
function patchServerState(obj, patch) {
    if (patch.Players !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Players = patchArray(obj.Players, patch.Players, (a, b) => patchPlayer(a, b));
    }
    if (patch.Balls !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.Balls = patchArray(obj.Balls, patch.Balls, (a, b) => patchBall(a, b));
    }
    if (patch.gameState !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.gameState = patch.gameState;
    }
    return obj;
}
function patchPlayerState(obj, patch) {
    if (patch.player1position !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.player1position = patchVector(obj.player1position, patch.player1position);
    }
    if (patch.player2position !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.player2position = patchVector(obj.player2position, patch.player2position);
    }
    if (patch.ballposition !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.ballposition = patchVector(obj.ballposition, patch.ballposition);
    }
    if (patch.player1Lives !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.player1Lives = patch.player1Lives;
    }
    if (patch.player2Lives !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
        obj.player2Lives = patch.player2Lives;
    }
    return obj;
}
function patchArray(arr, patch, innerPatch) {
    patch.forEach((val, i) => {
        if (val !== _api_base__WEBPACK_IMPORTED_MODULE_0__.NO_DIFF) {
            if (i >= arr.length) {
                arr.push(val);
            }
            else {
                arr[i] = innerPatch(arr[i], val);
            }
        }
    });
    if (patch.length < arr.length) {
        arr.splice(patch.length);
    }
    return arr;
}
function patchOptional(obj, patch, innerPatch) {
    if (patch === undefined) {
        return undefined;
    }
    else if (obj === undefined) {
        return patch;
    }
    else {
        return innerPatch(obj, patch);
    }
}
function computePatch(state, patch) {
    return patchPlayerState(state, patch);
}


/***/ }),

/***/ "../.hathora/transport.ts":
/*!********************************!*\
  !*** ../.hathora/transport.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TCPHathoraTransport": () => (/* binding */ TCPHathoraTransport),
/* harmony export */   "TransportType": () => (/* binding */ TransportType),
/* harmony export */   "WebSocketHathoraTransport": () => (/* binding */ WebSocketHathoraTransport)
/* harmony export */ });
/* harmony import */ var bin_serde__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bin-serde */ "../.hathora/node_modules/bin-serde/lib/index.js");
/* harmony import */ var net__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! net */ "../.hathora/node_modules/net/index.js");
/* harmony import */ var net__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(net__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _api_base__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../api/base */ "../../api/base.ts");
/* harmony import */ var isomorphic_ws__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! isomorphic-ws */ "../.hathora/node_modules/isomorphic-ws/browser.js");
/* harmony import */ var isomorphic_ws__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(isomorphic_ws__WEBPACK_IMPORTED_MODULE_3__);




var TransportType;
(function (TransportType) {
    TransportType[TransportType["WebSocket"] = 0] = "WebSocket";
    TransportType[TransportType["TCP"] = 1] = "TCP";
    TransportType[TransportType["UDP"] = 2] = "UDP";
})(TransportType || (TransportType = {}));
class WebSocketHathoraTransport {
    constructor(appId) {
        this.appId = appId;
        this.socket = new (isomorphic_ws__WEBPACK_IMPORTED_MODULE_3___default())(`wss://${_api_base__WEBPACK_IMPORTED_MODULE_2__.COORDINATOR_HOST}/${appId}`);
    }
    connect(stateId, token, onData, onClose) {
        return new Promise((resolve, reject) => {
            this.socket.binaryType = "arraybuffer";
            this.socket.onclose = onClose;
            this.socket.onopen = () => this.socket.send(new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer()
                .writeUInt8(0)
                .writeString(token)
                .writeUInt64([...stateId].reduce((r, v) => r * 36n + BigInt(parseInt(v, 36)), 0n))
                .toBuffer());
            this.socket.onmessage = ({ data }) => {
                const reader = new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(new Uint8Array(data));
                const type = reader.readUInt8();
                if (type === 0) {
                    this.socket.onmessage = ({ data }) => onData(data);
                    this.socket.onclose = onClose;
                    onData(data);
                    resolve();
                }
                else {
                    reject("Unexpected message type: " + type);
                }
            };
        });
    }
    disconnect(code) {
        if (code === undefined) {
            this.socket.onclose = () => { };
        }
        this.socket.close(code);
    }
    isReady() {
        return this.socket.readyState === this.socket.OPEN;
    }
    write(data) {
        this.socket.send(data);
    }
    pong() {
        this.socket.ping();
    }
}
class TCPHathoraTransport {
    constructor(appId) {
        this.appId = appId;
        this.socket = new (net__WEBPACK_IMPORTED_MODULE_1___default().Socket)();
    }
    connect(stateId, token, onData, onClose) {
        return new Promise((resolve, reject) => {
            this.socket.connect(7148, _api_base__WEBPACK_IMPORTED_MODULE_2__.COORDINATOR_HOST);
            this.socket.on("connect", () => this.socket.write(new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer()
                .writeString(token)
                .writeString(this.appId)
                .writeUInt64([...stateId].reduce((r, v) => r * 36n + BigInt(parseInt(v, 36)), 0n))
                .toBuffer()));
            this.socket.once("data", (data) => {
                const reader = new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Reader(new Uint8Array(data));
                const type = reader.readUInt8();
                if (type === 0) {
                    this.readTCPData(onData);
                    this.socket.on("close", onClose);
                    onData(data);
                    resolve();
                }
                else {
                    reject("Unknown message type: " + type);
                }
            });
        });
    }
    write(data) {
        this.socket.write(new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer()
            .writeUInt32(data.length + 1)
            .writeUInt8(0)
            .writeBuffer(data)
            .toBuffer());
    }
    disconnect(code) {
        this.socket.destroy();
    }
    isReady() {
        return this.socket.readyState === "open";
    }
    pong() {
        this.socket.write(new bin_serde__WEBPACK_IMPORTED_MODULE_0__.Writer().writeUInt32(1).writeUInt8(1).toBuffer());
    }
    readTCPData(onData) {
        let buf = Buffer.alloc(0);
        this.socket.on("data", (data) => {
            buf = Buffer.concat([buf, data]);
            while (buf.length >= 4) {
                const bufLen = buf.readUInt32BE();
                if (buf.length < 4 + bufLen) {
                    return;
                }
                onData(buf.slice(4, 4 + bufLen));
                buf = buf.slice(4 + bufLen);
            }
        });
    }
}


/***/ }),

/***/ "?5d12":
/*!************************!*\
  !*** crypto (ignored) ***!
  \************************/
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.css */ "./src/style.css");
/* harmony import */ var peasy_ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! peasy-ui */ "./node_modules/peasy-ui/dist/index.js");
/* harmony import */ var peasy_ui__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(peasy_ui__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _hathora_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../.hathora/client */ "../.hathora/client.ts");



const myApp = document.getElementById('myApp');
let intervalID;
/**********************************************************
 * Hathora Client variables
 *********************************************************/
const client = new _hathora_client__WEBPACK_IMPORTED_MODULE_2__.HathoraClient();
let token;
let user;
let myConnection;
/**********************************************************
 * Hathora: Broadcast Events from server
 * The server can broadcast, or send specific users events
 * For this game, there are four events that the server
 * triggers, P1/P2 joining, Ball arriving, and Game Over
 *********************************************************/
/**********************************************************
 * Hathora: updateState is ran from when the server has a change in
 * state, and the server needs to synch its data to the
 * client
 *********************************************************/
let updateState = (update) => {
    //updating state
    model.player1pos = update.state.player1position;
    model.player2pos = update.state.player2position;
    model.ball = update.state.ballposition;
    model.p1Lives = update.state.player1Lives;
    model.p2Lives = update.state.player2Lives;
    //process events
    if (update.events.length) {
        update.events.forEach(event => {
            switch (event) {
                case 'P2':
                    model.player2Joined = true;
                    model.player1Joined = true;
                    model.startButtonDisable = false;
                    break;
                case 'P1':
                    model.player1Joined = true;
                    break;
                case 'Ball':
                    model.ballvisible = true;
                    model.startButtonDisable = true;
                    break;
                case 'Game Over':
                    model.ballvisible = false;
                    model.player2Joined = false;
                    model.player1Joined = false;
                    alert('Game Over');
                    break;
            }
        });
    }
};
/**********************************************************
 * bindKeyboardEvents
 * creates the key up and key down events for the up arrow,
 * the down arrow, and the spacebar
 *********************************************************/
const bindKeyboardEvents = () => {
    document.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp':
                /**********************************************************
                 * Hathora: remote procedure call (RPC)
                 * runs the updatePlayerVelocity method that's on the server
                 * and passes a velocity Vector to the method
                 *********************************************************/
                myConnection.updatePlayerVelocity({ velocity: { x: 0, y: -15 } });
                break;
            case 'ArrowDown':
                //ditto
                myConnection.updatePlayerVelocity({ velocity: { x: 0, y: 15 } });
                break;
            case ' ':
                /**********************************************************
                 * Hathora: remote procedure call (RPC)
                 * runs the startRound method that's on the server
                 *********************************************************/
                myConnection.startRound({});
                break;
            default:
                break;
        }
    });
    document.addEventListener('keyup', e => {
        switch (e.key) {
            case 'ArrowUp':
                //ditto
                myConnection.updatePlayerVelocity({ velocity: { x: 0, y: 0 } });
                break;
            case 'ArrowDown':
                //ditto
                myConnection.updatePlayerVelocity({ velocity: { x: 0, y: 0 } });
                break;
            default:
                break;
        }
    });
};
/**********************************************************
 * Peasy-UI: create UI String Template
 * this template string forms the injected HTML template
 * that Peasy-UI uses.  This is parsed, along with the
 * data and event bindings called out
 **********************************************************/
const template = `
        <div>
          <div class="instructions">Pong <span \${===showID}> -> Game ID: \${gameID}</span> <span \${===showUser}> -> User: \${username}</span></div>
          
          <div class="flex small_width">
            <button id="btnLogin" class="button" \${click@=>login} \${disabled <== loginButtonDisable}>Login</button>
          </div>

          <div class="flex startLeft large_width">
            <button id="btnCreateGame" class="button" \${click@=>create} \${disabled <== createButtonDisable}>Create Game</button>
            <button id="btnConnectGame" class="button" \${click@=>connect} \${disabled <== connectButtonDisable}>Connect Game</button>
            <label for="gameJoinID">Game ID</label>
            <input id="gameJoinID" type="text" \${value <=> gameID}></input>
            <button id="btnCopy" class="button" \${click@=>copy} }>Copy</button>
          </div>

          <div class="flex startLeft large_width">
            <button id="btnJoinGame" class="button" \${click@=>join} \${disabled <== joinButtonDisable}>Join Game</button>
            <button id="btnStartGame"  class="button" \${click@=>start} \${disabled <== startButtonDisable}>Start Game</button>
          </div>

          <div class="instructions">Up/Down arrows move paddle, spacebar launches ball</div>

          <div id='playArea' class="gameArea">
            <div class="p1score" \${ === player1Joined} >P1: Lives: \${p1Lives}</div>
            <div class="p2score" \${ === player2Joined}>P2: Lives: \${p2Lives}</div>
            <div id="p1" \${ === player1Joined} class="p1" style="transform: translate(\${player1pos.x}px,\${player1pos.y}px)"></div>
            <div id="p2" \${ === player2Joined} class="p2" style="transform: translate(\${player2pos.x}px,\${player2pos.y}px)"></div>
            <div id="ball" \${ === ballvisible} class="ball" style="transform: translate(\${ball.x}px,\${ball.y}px)"></div>
          </div>
        </div>
      `;
/**********************************************************
 * Peasy-UI: data model object
 * this object outlines all the monitored data bindings
 * and events for the string template
 *********************************************************/
const model = {
    /**********************************************************
     * Hathora: loginAnonymous() and getUserFromToken() methods
     * this uses sessionStorage for the browser to store token
     * if token doesn't exist, it logs into Hathora coordinator
     * and creates new access token
     *********************************************************/
    login: async (event, model) => {
        if (sessionStorage.getItem('token') === null) {
            sessionStorage.setItem('token', await client.loginAnonymous());
        }
        token = sessionStorage.getItem('token');
        user = _hathora_client__WEBPACK_IMPORTED_MODULE_2__.HathoraClient.getUserFromToken(token);
        model.username = user.name;
        model.createButtonDisable = false;
        model.connectButtonDisable = false;
    },
    /**********************************************************
     * Hathora: create() and connect() methods
     * this is called when the create new game button is pressed
     * and creates a new game instance from the Hathora server
     * then subsequently runs the connect method, establishing
     * the myConnection object, which we use to communicate
     * between the client and the server
     *********************************************************/
    create: async (event, model) => {
        model.gameID = await client.create(token, {});
        model.title = model.gameID;
        history.pushState({}, '', `/${model.gameID}`);
        myConnection = await client.connect(token, model.gameID);
        myConnection.onUpdate(updateState);
        myConnection.onError(console.error);
        //manage UI access
        model.joinButtonDisable = false;
        model.createButtonDisable = true;
        model.connectButtonDisable = true;
    },
    /**********************************************************
     * Hathora: connect() methods
     * runs the connect method, establishing
     * the myConnection object, which we use to communicate
     * between the client and the server
     *********************************************************/
    connect: async (event, model) => {
        myConnection = await client.connect(token, model.gameID);
        model.title = `-> Game ID: ${model.gameID}`;
        history.pushState({}, '', `/${model.gameID}`);
        myConnection.onUpdate(updateState);
        myConnection.onError(console.error);
        //manage UI access
        model.joinButtonDisable = false;
        model.createButtonDisable = true;
        model.connectButtonDisable = true;
    },
    /**********************************************************
     * Hathora: remote procedure call (RPC)
     * runs the joinGame method that's on the server
     *********************************************************/
    join: (event, model) => {
        myConnection.joinGame({});
        bindKeyboardEvents();
        //manage UI access
        model.joinButtonDisable = true;
    },
    /**********************************************************
     * Hathora: remote procedure call (RPC)
     * runs the startGame method that's on the server
     *********************************************************/
    start: (event, model) => {
        myConnection.startGame({});
        //manage UI access
        model.startButtonDisable = true;
    },
    //copies input text to clipboard
    copy: () => {
        navigator.clipboard.writeText(model.gameID);
    },
    /**********************************************************
     * Peasy-UI: data bindings
     * these values are tied into the UI specifically
     * either data fields like title, p1Lives, and gameID
     * or CSS values, like player2pos
     * or attributes for visibility and disabled of the UI
     * buttons.  Also shown is the ability to abstract the
     * evaluation of the booleans using a getter, such as the
     * login button disable code below
     *********************************************************/
    title: '',
    gameID: '',
    username: '',
    player1pos: { x: 15, y: 10 },
    player2pos: { x: 575, y: 10 },
    ball: { x: 25, y: 25 },
    p1Lives: 3,
    p2Lives: 3,
    get loginButtonDisable() {
        return this.username.length > 0;
    },
    get showID() {
        return this.gameID.length > 0;
    },
    get showUser() {
        return this.username.length > 0;
    },
    createButtonDisable: true,
    connectButtonDisable: true,
    joinButtonDisable: true,
    startButtonDisable: true,
    player1Joined: false,
    player2Joined: false,
    ballvisible: false,
};
/**********************************************************
 * Create UI View, and mount the injected HTML
 * you pass the parent element, the string template, and
 * the data model object to UI.create()
 *********************************************************/
let myUI;
myUI = peasy_ui__WEBPACK_IMPORTED_MODULE_1__.UI.create(myApp, template, model);
/**********************************************************
 * Peasy-UI: UI.update()
 * This method triggers the framework to monitor for
 * changes in state and then automatically updates the UI
 * with the new data, recommened to be called on interval
 *********************************************************/
intervalID = setInterval(() => {
    peasy_ui__WEBPACK_IMPORTED_MODULE_1__.UI.update();
}, 1000 / 60);

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLG9HQUF1Qzs7Ozs7Ozs7Ozs7QUNBMUI7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLDZEQUFZO0FBQ2hDLGFBQWEsbUJBQU8sQ0FBQyx5RUFBa0I7QUFDdkMsY0FBYyxtQkFBTyxDQUFDLGlGQUFzQjtBQUM1QyxlQUFlLG1CQUFPLENBQUMsbUZBQXVCO0FBQzlDLG9CQUFvQixtQkFBTyxDQUFDLHFGQUF1QjtBQUNuRCxtQkFBbUIsbUJBQU8sQ0FBQywyRkFBMkI7QUFDdEQsc0JBQXNCLG1CQUFPLENBQUMsaUdBQThCO0FBQzVELGtCQUFrQixtQkFBTyxDQUFDLGlGQUFxQjtBQUMvQyxlQUFlLG1CQUFPLENBQUMsaUVBQWE7QUFDcEMsYUFBYSxtQkFBTyxDQUFDLDJFQUFrQjs7QUFFdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw2Q0FBNkM7QUFDN0M7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7Ozs7Ozs7Ozs7OztBQ25OYTs7QUFFYixZQUFZLG1CQUFPLENBQUMsMERBQVM7QUFDN0IsV0FBVyxtQkFBTyxDQUFDLHdFQUFnQjtBQUNuQyxZQUFZLG1CQUFPLENBQUMsb0VBQWM7QUFDbEMsa0JBQWtCLG1CQUFPLENBQUMsZ0ZBQW9CO0FBQzlDLGVBQWUsbUJBQU8sQ0FBQyxnRUFBWTs7QUFFbkM7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxlQUFlLG1CQUFPLENBQUMsMEVBQWlCO0FBQ3hDLG9CQUFvQixtQkFBTyxDQUFDLG9GQUFzQjtBQUNsRCxpQkFBaUIsbUJBQU8sQ0FBQyw4RUFBbUI7QUFDNUMsZ0JBQWdCLCtGQUE2Qjs7QUFFN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1CQUFPLENBQUMsNEVBQWtCOztBQUV6QztBQUNBLHFCQUFxQixtQkFBTyxDQUFDLHdGQUF3Qjs7QUFFckQ7O0FBRUE7QUFDQSx5QkFBc0I7Ozs7Ozs7Ozs7OztBQ3hEVDs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsU0FBUztBQUNwQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7Ozs7Ozs7Ozs7OztBQ2xCYTs7QUFFYixhQUFhLG1CQUFPLENBQUMsbUVBQVU7O0FBRS9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7OztBQ3RIYTs7QUFFYjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ0phOztBQUViLFlBQVksbUJBQU8sQ0FBQyw2REFBWTtBQUNoQyxlQUFlLG1CQUFPLENBQUMsaUZBQXFCO0FBQzVDLHlCQUF5QixtQkFBTyxDQUFDLHlGQUFzQjtBQUN2RCxzQkFBc0IsbUJBQU8sQ0FBQyxtRkFBbUI7QUFDakQsa0JBQWtCLG1CQUFPLENBQUMsMkVBQWU7QUFDekMsZ0JBQWdCLG1CQUFPLENBQUMsbUZBQXNCOztBQUU5QztBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0Q7QUFDaEQ7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QixLQUFLO0FBQ0w7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxDQUFDOztBQUVEOzs7Ozs7Ozs7Ozs7QUNuSmE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLDZEQUFZOztBQUVoQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCLFdBQVcsVUFBVTtBQUNyQjtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7Ozs7Ozs7Ozs7O0FDckRhOztBQUViLG9CQUFvQixtQkFBTyxDQUFDLDJGQUEwQjtBQUN0RCxrQkFBa0IsbUJBQU8sQ0FBQyx1RkFBd0I7O0FBRWxEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDbkJhOztBQUViLG1CQUFtQixtQkFBTyxDQUFDLDZFQUFnQjs7QUFFM0M7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDakJhOztBQUViLFlBQVksbUJBQU8sQ0FBQyw2REFBWTtBQUNoQyxvQkFBb0IsbUJBQU8sQ0FBQywrRUFBaUI7QUFDN0MsZUFBZSxtQkFBTyxDQUFDLCtFQUFvQjtBQUMzQyxlQUFlLG1CQUFPLENBQUMsaUVBQWE7QUFDcEMsYUFBYSxtQkFBTyxDQUFDLDJFQUFrQjs7QUFFdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsK0JBQStCO0FBQy9CLHVDQUF1QztBQUN2QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7Ozs7Ozs7Ozs7OztBQ3RGYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDMUNhOztBQUViLFlBQVksbUJBQU8sQ0FBQywyREFBVTs7QUFFOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTiwyQkFBMkI7QUFDM0IsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7Ozs7Ozs7Ozs7O0FDbEdhOztBQUViLGtCQUFrQixtQkFBTyxDQUFDLDJFQUFlOztBQUV6QztBQUNBO0FBQ0E7QUFDQSxXQUFXLFVBQVU7QUFDckIsV0FBVyxVQUFVO0FBQ3JCLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDeEJhOztBQUViLFlBQVksbUJBQU8sQ0FBQyw2REFBWTtBQUNoQyxlQUFlLG1CQUFPLENBQUMsbUVBQWU7O0FBRXRDO0FBQ0E7QUFDQTtBQUNBLFdBQVcsZUFBZTtBQUMxQixXQUFXLE9BQU87QUFDbEIsV0FBVyxnQkFBZ0I7QUFDM0IsYUFBYSxHQUFHO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7Ozs7Ozs7Ozs7O0FDckJhOztBQUViLFlBQVksbUJBQU8sQ0FBQywwREFBUztBQUM3QiwwQkFBMEIsbUJBQU8sQ0FBQyxzR0FBK0I7QUFDakUsbUJBQW1CLG1CQUFPLENBQUMsa0ZBQXFCOztBQUVoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsbUJBQU8sQ0FBQyx3RUFBZ0I7QUFDdEMsSUFBSTtBQUNKO0FBQ0EsY0FBYyxtQkFBTyxDQUFDLHlFQUFpQjtBQUN2QztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdFQUF3RTtBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQSxDQUFDOztBQUVEOzs7Ozs7Ozs7OztBQ3JJQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDRmE7O0FBRWI7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGlCQUFpQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNWYTs7QUFFYixZQUFZLG1CQUFPLENBQUMsNkRBQVk7O0FBRWhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsSUFBSTtBQUNKOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7O0FDckVhOztBQUViO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDYmE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLDZEQUFZOztBQUVoQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsMkNBQTJDO0FBQzNDLFNBQVM7O0FBRVQ7QUFDQSw0REFBNEQsd0JBQXdCO0FBQ3BGO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDO0FBQ2xDLGdDQUFnQyxjQUFjO0FBQzlDO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7Ozs7Ozs7Ozs7OztBQ3BEYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNiYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQSxXQUFXLEdBQUc7QUFDZCxhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ1ZhOztBQUViLFlBQVksbUJBQU8sQ0FBQyw2REFBWTs7QUFFaEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYyxRQUFRO0FBQ3RCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsUUFBUTtBQUN0QixnQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7Ozs7Ozs7Ozs7OztBQ25FYTs7QUFFYixZQUFZLG1CQUFPLENBQUMsMkRBQVU7O0FBRTlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7Ozs7Ozs7Ozs7O0FDWGE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLDZEQUFZOztBQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCOztBQUVsQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOzs7Ozs7Ozs7Ozs7QUNwRGE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQzFCYTs7QUFFYixjQUFjLGdHQUE4Qjs7QUFFNUM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7O0FBRUE7QUFDQTtBQUNBLFdBQVcsbUJBQW1CO0FBQzlCLFdBQVcsU0FBUztBQUNwQixXQUFXLFNBQVM7QUFDcEIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxVQUFVO0FBQ3JCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNqRmE7O0FBRWIsV0FBVyxtQkFBTyxDQUFDLHdFQUFnQjs7QUFFbkM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixZQUFZLFNBQVM7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsY0FBYztBQUN6QixXQUFXLFVBQVU7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9DQUFvQyxPQUFPO0FBQzNDO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixTQUFTLEdBQUcsU0FBUztBQUM1Qyw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOLDRCQUE0QjtBQUM1QixNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBLHdDQUF3QyxPQUFPO0FBQy9DO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDNVZhO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELGNBQWMsR0FBRyxjQUFjO0FBQy9CLGFBQWEsbUJBQU8sQ0FBQyxnRUFBYTtBQUNsQywyQkFBMkIsbUJBQU8sQ0FBQyx5RUFBa0I7QUFDckQsUUFBUSxlQUFlO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixpQkFBaUI7QUFDekM7QUFDQSw0QkFBNEIsT0FBTztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsZ0NBQWdD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ZHVsZXMvYXhpb3MvaW5kZXguanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYXhpb3MuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL2lzQ2FuY2VsLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9idWlsZEZ1bGxQYXRoLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9lbmhhbmNlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9lbnYvZGF0YS5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J1aWxkVVJMLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2Nvb2tpZXMuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0F4aW9zRXJyb3IuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3NwcmVhZC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy92YWxpZGF0b3IuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2Jpbi1zZXJkZS9saWIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvdXRmOC1idWZmZXItc2l6ZS9tYWluLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL3V0ZjgtYnVmZmVyL2luZGV4LmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvaW5kZXguanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWwuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0F4aW9zLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvYnVpbGRGdWxsUGF0aC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2NyZWF0ZUVycm9yLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZGlzcGF0Y2hSZXF1ZXN0LmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9zZXR0bGUuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2RlZmF1bHRzLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2Vudi9kYXRhLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J1aWxkVVJMLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQXhpb3NFcnJvci5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9wYXJzZUhlYWRlcnMuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy92YWxpZGF0b3IuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9iaW4tc2VyZGUvbGliL2luZGV4LmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvZ2V0LXJhbmRvbS12YWx1ZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9nbG9iYWwvd2luZG93LmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvaXNvbW9ycGhpYy13cy9icm93c2VyLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvand0LWRlY29kZS9idWlsZC9qd3QtZGVjb2RlLmVzbS5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL25ldC9pbmRleC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL3V0ZjgtYnVmZmVyLXNpemUvbWFpbi5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL3V0ZjgtYnVmZmVyL2luZGV4LmpzIiwid2VicGFjazovL3dlYi8uL3NyYy9zdHlsZS5jc3MiLCJ3ZWJwYWNrOi8vd2ViLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly93ZWIvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly93ZWIvLi9ub2RlX21vZHVsZXMvcGVhc3ktdWkvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly93ZWIvLi9zcmMvc3R5bGUuY3NzPzcxNjMiLCJ3ZWJwYWNrOi8vd2ViLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL3dlYi8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vd2ViLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL3dlYi8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly93ZWIvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly93ZWIvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL2Jhc2UudHMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS90eXBlcy50cyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvY2xpZW50LnRzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9mYWlsdXJlcy50cyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvcGF0Y2gudHMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL3RyYW5zcG9ydC50cyIsIndlYnBhY2s6Ly93ZWIvaWdub3JlZHxDOlxccHJvZ3JhbW1pbmdcXHBvbmdcXGNsaWVudFxcLmhhdGhvcmFcXG5vZGVfbW9kdWxlc1xcZ2V0LXJhbmRvbS12YWx1ZXN8Y3J5cHRvIiwid2VicGFjazovL3dlYi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWIvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vd2ViL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly93ZWIvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly93ZWIvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly93ZWIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly93ZWIvd2VicGFjay9ydW50aW1lL25vbmNlIiwid2VicGFjazovL3dlYi8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2F4aW9zJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9DYW5jZWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB4aHJBZGFwdGVyKGNvbmZpZykge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZGlzcGF0Y2hYaHJSZXF1ZXN0KHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IGNvbmZpZy5kYXRhO1xuICAgIHZhciByZXF1ZXN0SGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzO1xuICAgIHZhciByZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIHZhciBvbkNhbmNlbGVkO1xuICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi51bnN1YnNjcmliZShvbkNhbmNlbGVkKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbmZpZy5zaWduYWwpIHtcbiAgICAgICAgY29uZmlnLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkZW5kKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIXJlc3BvbnNlVHlwZSB8fCByZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAgcmVzcG9uc2VUeXBlID09PSAnanNvbicgP1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUoZnVuY3Rpb24gX3Jlc29sdmUodmFsdWUpIHtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0sIGZ1bmN0aW9uIF9yZWplY3QoZXJyKSB7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICgnb25sb2FkZW5kJyBpbiByZXF1ZXN0KSB7XG4gICAgICAvLyBVc2Ugb25sb2FkZW5kIGlmIGF2YWlsYWJsZVxuICAgICAgcmVxdWVzdC5vbmxvYWRlbmQgPSBvbmxvYWRlbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGUgdG8gZW11bGF0ZSBvbmxvYWRlbmRcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWFkeXN0YXRlIGhhbmRsZXIgaXMgY2FsbGluZyBiZWZvcmUgb25lcnJvciBvciBvbnRpbWVvdXQgaGFuZGxlcnMsXG4gICAgICAgIC8vIHNvIHdlIHNob3VsZCBjYWxsIG9ubG9hZGVuZCBvbiB0aGUgbmV4dCAndGljaydcbiAgICAgICAgc2V0VGltZW91dChvbmxvYWRlbmQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dCA/ICd0aW1lb3V0IG9mICcgKyBjb25maWcudGltZW91dCArICdtcyBleGNlZWRlZCcgOiAndGltZW91dCBleGNlZWRlZCc7XG4gICAgICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbCB8fCBkZWZhdWx0cy50cmFuc2l0aW9uYWw7XG4gICAgICBpZiAoY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlO1xuICAgICAgfVxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIHRyYW5zaXRpb25hbC5jbGFyaWZ5VGltZW91dEVycm9yID8gJ0VUSU1FRE9VVCcgOiAnRUNPTk5BQk9SVEVEJyxcbiAgICAgICAgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgLy8gVGhpcyBpcyBvbmx5IGRvbmUgaWYgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnQuXG4gICAgLy8gU3BlY2lmaWNhbGx5IG5vdCBpZiB3ZSdyZSBpbiBhIHdlYiB3b3JrZXIsIG9yIHJlYWN0LW5hdGl2ZS5cbiAgICBpZiAodXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSkge1xuICAgICAgLy8gQWRkIHhzcmYgaGVhZGVyXG4gICAgICB2YXIgeHNyZlZhbHVlID0gKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMgfHwgaXNVUkxTYW1lT3JpZ2luKGZ1bGxQYXRoKSkgJiYgY29uZmlnLnhzcmZDb29raWVOYW1lID9cbiAgICAgICAgY29va2llcy5yZWFkKGNvbmZpZy54c3JmQ29va2llTmFtZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICh4c3JmVmFsdWUpIHtcbiAgICAgICAgcmVxdWVzdEhlYWRlcnNbY29uZmlnLnhzcmZIZWFkZXJOYW1lXSA9IHhzcmZWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgaGVhZGVycyB0byB0aGUgcmVxdWVzdFxuICAgIGlmICgnc2V0UmVxdWVzdEhlYWRlcicgaW4gcmVxdWVzdCkge1xuICAgICAgdXRpbHMuZm9yRWFjaChyZXF1ZXN0SGVhZGVycywgZnVuY3Rpb24gc2V0UmVxdWVzdEhlYWRlcih2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHJlcXVlc3REYXRhID09PSAndW5kZWZpbmVkJyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ2NvbnRlbnQtdHlwZScpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgQ29udGVudC1UeXBlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBoZWFkZXIgdG8gdGhlIHJlcXVlc3RcbiAgICAgICAgICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBZGQgd2l0aENyZWRlbnRpYWxzIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcud2l0aENyZWRlbnRpYWxzKSkge1xuICAgICAgcmVxdWVzdC53aXRoQ3JlZGVudGlhbHMgPSAhIWNvbmZpZy53aXRoQ3JlZGVudGlhbHM7XG4gICAgfVxuXG4gICAgLy8gQWRkIHJlc3BvbnNlVHlwZSB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmIChyZXNwb25zZVR5cGUgJiYgcmVzcG9uc2VUeXBlICE9PSAnanNvbicpIHtcbiAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgcHJvZ3Jlc3MgaWYgbmVlZGVkXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25Eb3dubG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgLy8gTm90IGFsbCBicm93c2VycyBzdXBwb3J0IHVwbG9hZCBldmVudHNcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzID09PSAnZnVuY3Rpb24nICYmIHJlcXVlc3QudXBsb2FkKSB7XG4gICAgICByZXF1ZXN0LnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vblVwbG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnLmNhbmNlbFRva2VuIHx8IGNvbmZpZy5zaWduYWwpIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gICAgICBvbkNhbmNlbGVkID0gZnVuY3Rpb24oY2FuY2VsKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZWplY3QoIWNhbmNlbCB8fCAoY2FuY2VsICYmIGNhbmNlbC50eXBlKSA/IG5ldyBDYW5jZWwoJ2NhbmNlbGVkJykgOiBjYW5jZWwpO1xuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfTtcblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuICYmIGNvbmZpZy5jYW5jZWxUb2tlbi5zdWJzY3JpYmUob25DYW5jZWxlZCk7XG4gICAgICBpZiAoY29uZmlnLnNpZ25hbCkge1xuICAgICAgICBjb25maWcuc2lnbmFsLmFib3J0ZWQgPyBvbkNhbmNlbGVkKCkgOiBjb25maWcuc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25DYW5jZWxlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuICBpbnN0YW5jZS5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgICByZXR1cm4gY3JlYXRlSW5zdGFuY2UobWVyZ2VDb25maWcoZGVmYXVsdENvbmZpZywgaW5zdGFuY2VDb25maWcpKTtcbiAgfTtcblxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbi8vIENyZWF0ZSB0aGUgZGVmYXVsdCBpbnN0YW5jZSB0byBiZSBleHBvcnRlZFxudmFyIGF4aW9zID0gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdHMpO1xuXG4vLyBFeHBvc2UgQXhpb3MgY2xhc3MgdG8gYWxsb3cgY2xhc3MgaW5oZXJpdGFuY2VcbmF4aW9zLkF4aW9zID0gQXhpb3M7XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5heGlvcy5WRVJTSU9OID0gcmVxdWlyZSgnLi9lbnYvZGF0YScpLnZlcnNpb247XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQSBgQ2FuY2VsYCBpcyBhbiBvYmplY3QgdGhhdCBpcyB0aHJvd24gd2hlbiBhbiBvcGVyYXRpb24gaXMgY2FuY2VsZWQuXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge3N0cmluZz19IG1lc3NhZ2UgVGhlIG1lc3NhZ2UuXG4gKi9cbmZ1bmN0aW9uIENhbmNlbChtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkNhbmNlbC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuICdDYW5jZWwnICsgKHRoaXMubWVzc2FnZSA/ICc6ICcgKyB0aGlzLm1lc3NhZ2UgOiAnJyk7XG59O1xuXG5DYW5jZWwucHJvdG90eXBlLl9fQ0FOQ0VMX18gPSB0cnVlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcblxuICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiBwcm9taXNlRXhlY3V0b3IocmVzb2x2ZSkge1xuICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgfSk7XG5cbiAgdmFyIHRva2VuID0gdGhpcztcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICB0aGlzLnByb21pc2UudGhlbihmdW5jdGlvbihjYW5jZWwpIHtcbiAgICBpZiAoIXRva2VuLl9saXN0ZW5lcnMpIHJldHVybjtcblxuICAgIHZhciBpO1xuICAgIHZhciBsID0gdG9rZW4uX2xpc3RlbmVycy5sZW5ndGg7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0b2tlbi5fbGlzdGVuZXJzW2ldKGNhbmNlbCk7XG4gICAgfVxuICAgIHRva2VuLl9saXN0ZW5lcnMgPSBudWxsO1xuICB9KTtcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICB0aGlzLnByb21pc2UudGhlbiA9IGZ1bmN0aW9uKG9uZnVsZmlsbGVkKSB7XG4gICAgdmFyIF9yZXNvbHZlO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICB0b2tlbi5zdWJzY3JpYmUocmVzb2x2ZSk7XG4gICAgICBfcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgfSkudGhlbihvbmZ1bGZpbGxlZCk7XG5cbiAgICBwcm9taXNlLmNhbmNlbCA9IGZ1bmN0aW9uIHJlamVjdCgpIHtcbiAgICAgIHRva2VuLnVuc3Vic2NyaWJlKF9yZXNvbHZlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH07XG5cbiAgZXhlY3V0b3IoZnVuY3Rpb24gY2FuY2VsKG1lc3NhZ2UpIHtcbiAgICBpZiAodG9rZW4ucmVhc29uKSB7XG4gICAgICAvLyBDYW5jZWxsYXRpb24gaGFzIGFscmVhZHkgYmVlbiByZXF1ZXN0ZWRcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2tlbi5yZWFzb24gPSBuZXcgQ2FuY2VsKG1lc3NhZ2UpO1xuICAgIHJlc29sdmVQcm9taXNlKHRva2VuLnJlYXNvbik7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbkNhbmNlbFRva2VuLnByb3RvdHlwZS50aHJvd0lmUmVxdWVzdGVkID0gZnVuY3Rpb24gdGhyb3dJZlJlcXVlc3RlZCgpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgdGhyb3cgdGhpcy5yZWFzb247XG4gIH1cbn07XG5cbi8qKlxuICogU3Vic2NyaWJlIHRvIHRoZSBjYW5jZWwgc2lnbmFsXG4gKi9cblxuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICBsaXN0ZW5lcih0aGlzLnJlYXNvbik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHRoaXMuX2xpc3RlbmVycykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBbbGlzdGVuZXJdO1xuICB9XG59O1xuXG4vKipcbiAqIFVuc3Vic2NyaWJlIGZyb20gdGhlIGNhbmNlbCBzaWduYWxcbiAqL1xuXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudW5zdWJzY3JpYmUgPSBmdW5jdGlvbiB1bnN1YnNjcmliZShsaXN0ZW5lcikge1xuICBpZiAoIXRoaXMuX2xpc3RlbmVycykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaW5kZXggPSB0aGlzLl9saXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQ2FuY2VsKHZhbHVlKSB7XG4gIHJldHVybiAhISh2YWx1ZSAmJiB2YWx1ZS5fX0NBTkNFTF9fKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG52YXIgdmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy92YWxpZGF0b3InKTtcblxudmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0b3IudmFsaWRhdG9ycztcbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgY29uZmlnLnVybCA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsO1xuXG4gIGlmICh0cmFuc2l0aW9uYWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbGlkYXRvci5hc3NlcnRPcHRpb25zKHRyYW5zaXRpb25hbCwge1xuICAgICAgc2lsZW50SlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiksXG4gICAgICBmb3JjZWRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKSxcbiAgICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbilcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IHNraXBwZWQgaW50ZXJjZXB0b3JzXG4gIHZhciByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB2YXIgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gdHJ1ZTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgaWYgKHR5cGVvZiBpbnRlcmNlcHRvci5ydW5XaGVuID09PSAnZnVuY3Rpb24nICYmIGludGVyY2VwdG9yLnJ1bldoZW4oY29uZmlnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3Iuc3luY2hyb25vdXM7XG5cbiAgICByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlO1xuXG4gIGlmICghc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzKSB7XG4gICAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcblxuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGNoYWluLCByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbik7XG4gICAgY2hhaW4gPSBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIG9wdGlvbnMpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWQsXG4gICAgc3luY2hyb25vdXM6IG9wdGlvbnMgPyBvcHRpb25zLnN5bmNocm9ub3VzIDogZmFsc2UsXG4gICAgcnVuV2hlbjogb3B0aW9ucyA/IG9wdGlvbnMucnVuV2hlbiA6IG51bGxcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvQ2FuY2VsJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cblxuICBpZiAoY29uZmlnLnNpZ25hbCAmJiBjb25maWcuc2lnbmFsLmFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgQ2FuY2VsKCdjYW5jZWxlZCcpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICBjb25maWcsXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgIGNvbmZpZyxcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlLFxuICAgICAgc3RhdHVzOiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc3RhdHVzID8gdGhpcy5yZXNwb25zZS5zdGF0dXMgOiBudWxsXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURpcmVjdEtleXMocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIG1lcmdlTWFwID0ge1xuICAgICd1cmwnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdtZXRob2QnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdkYXRhJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnYmFzZVVSTCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RyYW5zZm9ybVJlcXVlc3QnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc2Zvcm1SZXNwb25zZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3BhcmFtc1NlcmlhbGl6ZXInOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0aW1lb3V0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndGltZW91dE1lc3NhZ2UnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd3aXRoQ3JlZGVudGlhbHMnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdhZGFwdGVyJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VUeXBlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAneHNyZkNvb2tpZU5hbWUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd4c3JmSGVhZGVyTmFtZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ29uVXBsb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdvbkRvd25sb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdkZWNvbXByZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnbWF4Q29udGVudExlbmd0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ21heEJvZHlMZW5ndGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc3BvcnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwQWdlbnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwc0FnZW50JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnY2FuY2VsVG9rZW4nOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdzb2NrZXRQYXRoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VFbmNvZGluZyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3ZhbGlkYXRlU3RhdHVzJzogbWVyZ2VEaXJlY3RLZXlzXG4gIH07XG5cbiAgdXRpbHMuZm9yRWFjaChPYmplY3Qua2V5cyhjb25maWcxKS5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpLCBmdW5jdGlvbiBjb21wdXRlQ29uZmlnVmFsdWUocHJvcCkge1xuICAgIHZhciBtZXJnZSA9IG1lcmdlTWFwW3Byb3BdIHx8IG1lcmdlRGVlcFByb3BlcnRpZXM7XG4gICAgdmFyIGNvbmZpZ1ZhbHVlID0gbWVyZ2UocHJvcCk7XG4gICAgKHV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZ1ZhbHVlKSAmJiBtZXJnZSAhPT0gbWVyZ2VEaXJlY3RLZXlzKSB8fCAoY29uZmlnW3Byb3BdID0gY29uZmlnVmFsdWUpO1xuICB9KTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICB2YXIgY29udGV4dCA9IHRoaXMgfHwgZGVmYXVsdHM7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuLmNhbGwoY29udGV4dCwgZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vY29yZS9lbmhhbmNlRXJyb3InKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlTYWZlbHkocmF3VmFsdWUsIHBhcnNlciwgZW5jb2Rlcikge1xuICBpZiAodXRpbHMuaXNTdHJpbmcocmF3VmFsdWUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIChwYXJzZXIgfHwgSlNPTi5wYXJzZSkocmF3VmFsdWUpO1xuICAgICAgcmV0dXJuIHV0aWxzLnRyaW0ocmF3VmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgIT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKGVuY29kZXIgfHwgSlNPTi5zdHJpbmdpZnkpKHJhd1ZhbHVlKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXG4gIHRyYW5zaXRpb25hbDoge1xuICAgIHNpbGVudEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGZvcmNlZEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IGZhbHNlXG4gIH0sXG5cbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSB8fCAoaGVhZGVycyAmJiBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXR1cm4gc3RyaW5naWZ5U2FmZWx5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgdmFyIHRyYW5zaXRpb25hbCA9IHRoaXMudHJhbnNpdGlvbmFsIHx8IGRlZmF1bHRzLnRyYW5zaXRpb25hbDtcbiAgICB2YXIgc2lsZW50SlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLnNpbGVudEpTT05QYXJzaW5nO1xuICAgIHZhciBmb3JjZWRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuZm9yY2VkSlNPTlBhcnNpbmc7XG4gICAgdmFyIHN0cmljdEpTT05QYXJzaW5nID0gIXNpbGVudEpTT05QYXJzaW5nICYmIHRoaXMucmVzcG9uc2VUeXBlID09PSAnanNvbic7XG5cbiAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcgfHwgKGZvcmNlZEpTT05QYXJzaW5nICYmIHV0aWxzLmlzU3RyaW5nKGRhdGEpICYmIGRhdGEubGVuZ3RoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChzdHJpY3RKU09OUGFyc2luZykge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgICAgIHRocm93IGVuaGFuY2VFcnJvcihlLCB0aGlzLCAnRV9KU09OX1BBUlNFJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH0sXG5cbiAgaGVhZGVyczoge1xuICAgIGNvbW1vbjoge1xuICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gICAgfVxuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwidmVyc2lvblwiOiBcIjAuMjQuMFwiXG59OyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBWRVJTSU9OID0gcmVxdWlyZSgnLi4vZW52L2RhdGEnKS52ZXJzaW9uO1xuXG52YXIgdmFsaWRhdG9ycyA9IHt9O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuWydvYmplY3QnLCAnYm9vbGVhbicsICdudW1iZXInLCAnZnVuY3Rpb24nLCAnc3RyaW5nJywgJ3N5bWJvbCddLmZvckVhY2goZnVuY3Rpb24odHlwZSwgaSkge1xuICB2YWxpZGF0b3JzW3R5cGVdID0gZnVuY3Rpb24gdmFsaWRhdG9yKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gdHlwZSB8fCAnYScgKyAoaSA8IDEgPyAnbiAnIDogJyAnKSArIHR5cGU7XG4gIH07XG59KTtcblxudmFyIGRlcHJlY2F0ZWRXYXJuaW5ncyA9IHt9O1xuXG4vKipcbiAqIFRyYW5zaXRpb25hbCBvcHRpb24gdmFsaWRhdG9yXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufGJvb2xlYW4/fSB2YWxpZGF0b3IgLSBzZXQgdG8gZmFsc2UgaWYgdGhlIHRyYW5zaXRpb25hbCBvcHRpb24gaGFzIGJlZW4gcmVtb3ZlZFxuICogQHBhcmFtIHtzdHJpbmc/fSB2ZXJzaW9uIC0gZGVwcmVjYXRlZCB2ZXJzaW9uIC8gcmVtb3ZlZCBzaW5jZSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZz99IG1lc3NhZ2UgLSBzb21lIG1lc3NhZ2Ugd2l0aCBhZGRpdGlvbmFsIGluZm9cbiAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAqL1xudmFsaWRhdG9ycy50cmFuc2l0aW9uYWwgPSBmdW5jdGlvbiB0cmFuc2l0aW9uYWwodmFsaWRhdG9yLCB2ZXJzaW9uLCBtZXNzYWdlKSB7XG4gIGZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2Uob3B0LCBkZXNjKSB7XG4gICAgcmV0dXJuICdbQXhpb3MgdicgKyBWRVJTSU9OICsgJ10gVHJhbnNpdGlvbmFsIG9wdGlvbiBcXCcnICsgb3B0ICsgJ1xcJycgKyBkZXNjICsgKG1lc3NhZ2UgPyAnLiAnICsgbWVzc2FnZSA6ICcnKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0LCBvcHRzKSB7XG4gICAgaWYgKHZhbGlkYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXRNZXNzYWdlKG9wdCwgJyBoYXMgYmVlbiByZW1vdmVkJyArICh2ZXJzaW9uID8gJyBpbiAnICsgdmVyc2lvbiA6ICcnKSkpO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uICYmICFkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSkge1xuICAgICAgZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0gPSB0cnVlO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0TWVzc2FnZShcbiAgICAgICAgICBvcHQsXG4gICAgICAgICAgJyBoYXMgYmVlbiBkZXByZWNhdGVkIHNpbmNlIHYnICsgdmVyc2lvbiArICcgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmVhciBmdXR1cmUnXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRvciA/IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRzKSA6IHRydWU7XG4gIH07XG59O1xuXG4vKipcbiAqIEFzc2VydCBvYmplY3QncyBwcm9wZXJ0aWVzIHR5cGVcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge29iamVjdH0gc2NoZW1hXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBhbGxvd1Vua25vd25cbiAqL1xuXG5mdW5jdGlvbiBhc3NlcnRPcHRpb25zKG9wdGlvbnMsIHNjaGVtYSwgYWxsb3dVbmtub3duKSB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgYW4gb2JqZWN0Jyk7XG4gIH1cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvcHRpb25zKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSA+IDApIHtcbiAgICB2YXIgb3B0ID0ga2V5c1tpXTtcbiAgICB2YXIgdmFsaWRhdG9yID0gc2NoZW1hW29wdF07XG4gICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgdmFyIHZhbHVlID0gb3B0aW9uc1tvcHRdO1xuICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdGlvbnMpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gJyArIG9wdCArICcgbXVzdCBiZSAnICsgcmVzdWx0KTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoYWxsb3dVbmtub3duICE9PSB0cnVlKSB7XG4gICAgICB0aHJvdyBFcnJvcignVW5rbm93biBvcHRpb24gJyArIG9wdCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3NlcnRPcHRpb25zOiBhc3NlcnRPcHRpb25zLFxuICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlJlYWRlciA9IGV4cG9ydHMuV3JpdGVyID0gdm9pZCAwO1xuY29uc3QgdXRmOCA9IHJlcXVpcmUoXCJ1dGY4LWJ1ZmZlclwiKTtcbmNvbnN0IHV0ZjhfYnVmZmVyX3NpemVfMSA9IHJlcXVpcmUoXCJ1dGY4LWJ1ZmZlci1zaXplXCIpO1xuY29uc3QgeyBwYWNrLCB1bnBhY2sgfSA9IHV0ZjguZGVmYXVsdCA/PyB1dGY4O1xuY2xhc3MgV3JpdGVyIHtcbiAgICBwb3MgPSAwO1xuICAgIHZpZXc7XG4gICAgYnl0ZXM7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudmlldyA9IG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIoNjQpKTtcbiAgICAgICAgdGhpcy5ieXRlcyA9IG5ldyBVaW50OEFycmF5KHRoaXMudmlldy5idWZmZXIpO1xuICAgIH1cbiAgICB3cml0ZVVJbnQ4KHZhbCkge1xuICAgICAgICB0aGlzLmVuc3VyZVNpemUoMSk7XG4gICAgICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLnBvcywgdmFsKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gMTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlVUludDMyKHZhbCkge1xuICAgICAgICB0aGlzLmVuc3VyZVNpemUoNCk7XG4gICAgICAgIHRoaXMudmlldy5zZXRVaW50MzIodGhpcy5wb3MsIHZhbCk7XG4gICAgICAgIHRoaXMucG9zICs9IDQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZVVJbnQ2NCh2YWwpIHtcbiAgICAgICAgdGhpcy5lbnN1cmVTaXplKDgpO1xuICAgICAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMucG9zLCB2YWwpO1xuICAgICAgICB0aGlzLnBvcyArPSA4O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVVVmFyaW50KHZhbCkge1xuICAgICAgICBpZiAodmFsIDwgMHg4MCkge1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKDEpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMucG9zLCB2YWwpO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgPCAweDQwMDApIHtcbiAgICAgICAgICAgIHRoaXMuZW5zdXJlU2l6ZSgyKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50MTYodGhpcy5wb3MsICh2YWwgJiAweDdmKSB8ICgodmFsICYgMHgzZjgwKSA8PCAxKSB8IDB4ODAwMCk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSAyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCA8IDB4MjAwMDAwKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoMyk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDgodGhpcy5wb3MsICh2YWwgPj4gMTQpIHwgMHg4MCk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDE2KHRoaXMucG9zICsgMSwgKHZhbCAmIDB4N2YpIHwgKCh2YWwgJiAweDNmODApIDw8IDEpIHwgMHg4MDAwKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IDM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIDwgMHgxMDAwMDAwMCkge1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKDQpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQzMih0aGlzLnBvcywgKHZhbCAmIDB4N2YpIHwgKCh2YWwgJiAweDNmODApIDw8IDEpIHwgKCh2YWwgJiAweDFmYzAwMCkgPDwgMikgfCAoKHZhbCAmIDB4ZmUwMDAwMCkgPDwgMykgfCAweDgwODA4MDAwKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IDQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIDwgMHg4MDAwMDAwMDApIHtcbiAgICAgICAgICAgIHRoaXMuZW5zdXJlU2l6ZSg1KTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLnBvcywgTWF0aC5mbG9vcih2YWwgLyBNYXRoLnBvdygyLCAyOCkpIHwgMHg4MCk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDMyKHRoaXMucG9zICsgMSwgKHZhbCAmIDB4N2YpIHwgKCh2YWwgJiAweDNmODApIDw8IDEpIHwgKCh2YWwgJiAweDFmYzAwMCkgPDwgMikgfCAoKHZhbCAmIDB4ZmUwMDAwMCkgPDwgMykgfCAweDgwODA4MDAwKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IDU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIDwgMHg0MDAwMDAwMDAwMCkge1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKDYpO1xuICAgICAgICAgICAgY29uc3Qgc2hpZnRlZFZhbCA9IE1hdGguZmxvb3IodmFsIC8gTWF0aC5wb3coMiwgMjgpKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50MTYodGhpcy5wb3MsIChzaGlmdGVkVmFsICYgMHg3ZikgfCAoKHNoaWZ0ZWRWYWwgJiAweDNmODApIDw8IDEpIHwgMHg4MDgwKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50MzIodGhpcy5wb3MgKyAyLCAodmFsICYgMHg3ZikgfCAoKHZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAoKHZhbCAmIDB4MWZjMDAwKSA8PCAyKSB8ICgodmFsICYgMHhmZTAwMDAwKSA8PCAzKSB8IDB4ODA4MDgwMDApO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gNjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlZhbHVlIG91dCBvZiByYW5nZVwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVWYXJpbnQodmFsKSB7XG4gICAgICAgIGNvbnN0IGJpZ3ZhbCA9IEJpZ0ludCh2YWwpO1xuICAgICAgICB0aGlzLndyaXRlVVZhcmludChOdW1iZXIoKGJpZ3ZhbCA+PiA2M24pIF4gKGJpZ3ZhbCA8PCAxbikpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlRmxvYXQodmFsKSB7XG4gICAgICAgIHRoaXMuZW5zdXJlU2l6ZSg0KTtcbiAgICAgICAgdGhpcy52aWV3LnNldEZsb2F0MzIodGhpcy5wb3MsIHZhbCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMucG9zICs9IDQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZUJpdHMoYml0cykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpdHMubGVuZ3RoOyBpICs9IDgpIHtcbiAgICAgICAgICAgIGxldCBieXRlID0gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgODsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgKyBqID09IGJpdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBieXRlIHw9IChiaXRzW2kgKyBqXSA/IDEgOiAwKSA8PCBqO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy53cml0ZVVJbnQ4KGJ5dGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZVN0cmluZyh2YWwpIHtcbiAgICAgICAgaWYgKHZhbC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBieXRlU2l6ZSA9ICgwLCB1dGY4X2J1ZmZlcl9zaXplXzEuZGVmYXVsdCkodmFsKTtcbiAgICAgICAgICAgIHRoaXMud3JpdGVVVmFyaW50KGJ5dGVTaXplKTtcbiAgICAgICAgICAgIHRoaXMuZW5zdXJlU2l6ZShieXRlU2l6ZSk7XG4gICAgICAgICAgICBwYWNrKHZhbCwgdGhpcy5ieXRlcywgdGhpcy5wb3MpO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gYnl0ZVNpemU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLndyaXRlVUludDgoMCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlQnVmZmVyKGJ1Zikge1xuICAgICAgICB0aGlzLmVuc3VyZVNpemUoYnVmLmxlbmd0aCk7XG4gICAgICAgIHRoaXMuYnl0ZXMuc2V0KGJ1ZiwgdGhpcy5wb3MpO1xuICAgICAgICB0aGlzLnBvcyArPSBidWYubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdG9CdWZmZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ5dGVzLnN1YmFycmF5KDAsIHRoaXMucG9zKTtcbiAgICB9XG4gICAgZW5zdXJlU2l6ZShzaXplKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLnZpZXcuYnl0ZUxlbmd0aCA8IHRoaXMucG9zICsgc2l6ZSkge1xuICAgICAgICAgICAgY29uc3QgbmV3VmlldyA9IG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIodGhpcy52aWV3LmJ5dGVMZW5ndGggKiAyKSk7XG4gICAgICAgICAgICBjb25zdCBuZXdCeXRlcyA9IG5ldyBVaW50OEFycmF5KG5ld1ZpZXcuYnVmZmVyKTtcbiAgICAgICAgICAgIG5ld0J5dGVzLnNldCh0aGlzLmJ5dGVzKTtcbiAgICAgICAgICAgIHRoaXMudmlldyA9IG5ld1ZpZXc7XG4gICAgICAgICAgICB0aGlzLmJ5dGVzID0gbmV3Qnl0ZXM7XG4gICAgICAgIH1cbiAgICB9XG59XG5leHBvcnRzLldyaXRlciA9IFdyaXRlcjtcbmNsYXNzIFJlYWRlciB7XG4gICAgcG9zID0gMDtcbiAgICB2aWV3O1xuICAgIGJ5dGVzO1xuICAgIGNvbnN0cnVjdG9yKGJ1Zikge1xuICAgICAgICB0aGlzLnZpZXcgPSBuZXcgRGF0YVZpZXcoYnVmLmJ1ZmZlciwgYnVmLmJ5dGVPZmZzZXQsIGJ1Zi5ieXRlTGVuZ3RoKTtcbiAgICAgICAgdGhpcy5ieXRlcyA9IG5ldyBVaW50OEFycmF5KHRoaXMudmlldy5idWZmZXIsIGJ1Zi5ieXRlT2Zmc2V0LCBidWYuYnl0ZUxlbmd0aCk7XG4gICAgfVxuICAgIHJlYWRVSW50OCgpIHtcbiAgICAgICAgY29uc3QgdmFsID0gdGhpcy52aWV3LmdldFVpbnQ4KHRoaXMucG9zKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gMTtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgcmVhZFVJbnQzMigpIHtcbiAgICAgICAgY29uc3QgdmFsID0gdGhpcy52aWV3LmdldFVpbnQzMih0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zICs9IDQ7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHJlYWRVSW50NjQoKSB7XG4gICAgICAgIGNvbnN0IHZhbCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5wb3MpO1xuICAgICAgICB0aGlzLnBvcyArPSA4O1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZWFkVVZhcmludCgpIHtcbiAgICAgICAgbGV0IHZhbCA9IDA7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBsZXQgYnl0ZSA9IHRoaXMudmlldy5nZXRVaW50OCh0aGlzLnBvcysrKTtcbiAgICAgICAgICAgIGlmIChieXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgKyBieXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsID0gKHZhbCArIChieXRlICYgMHg3ZikpICogMTI4O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlYWRWYXJpbnQoKSB7XG4gICAgICAgIGNvbnN0IHZhbCA9IEJpZ0ludCh0aGlzLnJlYWRVVmFyaW50KCkpO1xuICAgICAgICByZXR1cm4gTnVtYmVyKCh2YWwgPj4gMW4pIF4gLSh2YWwgJiAxbikpO1xuICAgIH1cbiAgICByZWFkRmxvYXQoKSB7XG4gICAgICAgIGNvbnN0IHZhbCA9IHRoaXMudmlldy5nZXRGbG9hdDMyKHRoaXMucG9zLCB0cnVlKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgcmVhZEJpdHMobnVtQml0cykge1xuICAgICAgICBjb25zdCBudW1CeXRlcyA9IE1hdGguY2VpbChudW1CaXRzIC8gOCk7XG4gICAgICAgIGNvbnN0IGJ5dGVzID0gdGhpcy5ieXRlcy5zbGljZSh0aGlzLnBvcywgdGhpcy5wb3MgKyBudW1CeXRlcyk7XG4gICAgICAgIGNvbnN0IGJpdHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBieXRlIG9mIGJ5dGVzKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDggJiYgYml0cy5sZW5ndGggPCBudW1CaXRzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBiaXRzLnB1c2goKChieXRlID4+IGkpICYgMSkgPT09IDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9zICs9IG51bUJ5dGVzO1xuICAgICAgICByZXR1cm4gYml0cztcbiAgICB9XG4gICAgcmVhZFN0cmluZygpIHtcbiAgICAgICAgY29uc3QgbGVuID0gdGhpcy5yZWFkVVZhcmludCgpO1xuICAgICAgICBpZiAobGVuID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWwgPSB1bnBhY2sodGhpcy5ieXRlcywgdGhpcy5wb3MsIHRoaXMucG9zICsgbGVuKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gbGVuO1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZWFkQnVmZmVyKG51bUJ5dGVzKSB7XG4gICAgICAgIGNvbnN0IGJ5dGVzID0gdGhpcy5ieXRlcy5zbGljZSh0aGlzLnBvcywgdGhpcy5wb3MgKyBudW1CeXRlcyk7XG4gICAgICAgIHRoaXMucG9zICs9IG51bUJ5dGVzO1xuICAgICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfVxuICAgIHJlbWFpbmluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmlldy5ieXRlTGVuZ3RoIC0gdGhpcy5wb3M7XG4gICAgfVxufVxuZXhwb3J0cy5SZWFkZXIgPSBSZWFkZXI7XG4iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggUmFmYWVsIGRhIFNpbHZhIFJvY2hhLlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcclxuICogYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXHJcbiAqIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xyXG4gKiB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXHJcbiAqIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xyXG4gKiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cclxuICogdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxyXG4gKiBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcclxuICogRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXHJcbiAqIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXHJcbiAqIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcclxuICogTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxyXG4gKiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cclxuICogV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgVGhlIHV0ZjgtYnVmZmVyLXNpemUgQVBJLlxyXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9yb2NoYXJzL3V0ZjgtYnVmZmVyLXNpemVcclxuICovXHJcblxyXG4vKiogQG1vZHVsZSB1dGY4QnVmZmVyU2l6ZSAqL1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgaG93IG1hbnkgYnl0ZXMgYXJlIG5lZWRlZCB0byBzZXJpYWxpemUgYSBVVEYtOCBzdHJpbmcuXHJcbiAqIEBzZWUgaHR0cHM6Ly9lbmNvZGluZy5zcGVjLndoYXR3Zy5vcmcvI3V0Zi04LWVuY29kZXJcclxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBUaGUgc3RyaW5nIHRvIHBhY2suXHJcbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG51bWJlciBvZiBieXRlcyBuZWVkZWQgdG8gc2VyaWFsaXplIHRoZSBzdHJpbmcuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB1dGY4QnVmZmVyU2l6ZShzdHIpIHtcclxuICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICBsZXQgYnl0ZXMgPSAwO1xyXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgbGV0IGNvZGVQb2ludCA9IHN0ci5jb2RlUG9pbnRBdChpKTtcclxuICAgIGlmIChjb2RlUG9pbnQgPCAxMjgpIHtcclxuICAgICAgYnl0ZXMrKztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChjb2RlUG9pbnQgPD0gMjA0Nykge1xyXG4gICAgICAgIGJ5dGVzKys7XHJcbiAgICAgIH0gZWxzZSBpZihjb2RlUG9pbnQgPD0gNjU1MzUpIHtcclxuICAgICAgICBieXRlcys9MjtcclxuICAgICAgfSBlbHNlIGlmKGNvZGVQb2ludCA8PSAxMTE0MTExKSB7XHJcbiAgICAgICAgaSsrO1xyXG4gICAgICAgIGJ5dGVzKz0zO1xyXG4gICAgICB9XHJcbiAgICAgIGJ5dGVzKys7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBieXRlcztcclxufVxyXG4iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggUmFmYWVsIGRhIFNpbHZhIFJvY2hhLlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcclxuICogYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXHJcbiAqIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xyXG4gKiB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXHJcbiAqIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xyXG4gKiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cclxuICogdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxyXG4gKiBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcclxuICogRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXHJcbiAqIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXHJcbiAqIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcclxuICogTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxyXG4gKiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cclxuICogV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXHJcbiAqXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEBmaWxlb3ZlcnZpZXcgRnVuY3Rpb25zIHRvIHNlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgVVRGLTggc3RyaW5ncy5cclxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vcm9jaGFycy91dGY4LWJ1ZmZlclxyXG4gKiBAc2VlIGh0dHBzOi8vZW5jb2Rpbmcuc3BlYy53aGF0d2cub3JnLyN0aGUtZW5jb2RpbmdcclxuICogQHNlZSBodHRwczovL2VuY29kaW5nLnNwZWMud2hhdHdnLm9yZy8jdXRmLTgtZW5jb2RlclxyXG4gKi9cclxuXHJcbi8qKiBAbW9kdWxlIHV0ZjgtYnVmZmVyICovXHJcblxyXG4vKipcclxuICogUmVhZCBhIHN0cmluZyBvZiBVVEYtOCBjaGFyYWN0ZXJzIGZyb20gYSBieXRlIGJ1ZmZlci5cclxuICogSW52YWxpZCBjaGFyYWN0ZXJzIGFyZSByZXBsYWNlZCB3aXRoICdSRVBMQUNFTUVOVCBDSEFSQUNURVInIChVK0ZGRkQpLlxyXG4gKiBAc2VlIGh0dHBzOi8vZW5jb2Rpbmcuc3BlYy53aGF0d2cub3JnLyN0aGUtZW5jb2RpbmdcclxuICogQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzQ5MjY5MTFcclxuICogQHBhcmFtIHshVWludDhBcnJheXwhQXJyYXk8bnVtYmVyPn0gYnVmZmVyIEEgYnl0ZSBidWZmZXIuXHJcbiAqIEBwYXJhbSB7bnVtYmVyPX0gc3RhcnQgVGhlIGJ1ZmZlciBpbmRleCB0byBzdGFydCByZWFkaW5nLlxyXG4gKiBAcGFyYW0gez9udW1iZXI9fSBlbmQgVGhlIGJ1ZmZlciBpbmRleCB0byBzdG9wIHJlYWRpbmcuXHJcbiAqICAgQXNzdW1lcyB0aGUgYnVmZmVyIGxlbmd0aCBpZiB1bmRlZmluZWQuXHJcbiAqIEByZXR1cm4ge3N0cmluZ31cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1bnBhY2soYnVmZmVyLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aCkge1xyXG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xyXG4gIGxldCBzdHIgPSAnJztcclxuICBmb3IobGV0IGluZGV4ID0gc3RhcnQ7IGluZGV4IDwgZW5kOykge1xyXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICBsZXQgbG93ZXJCb3VuZGFyeSA9IDB4ODA7XHJcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgIGxldCB1cHBlckJvdW5kYXJ5ID0gMHhCRjtcclxuICAgIC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cclxuICAgIGxldCByZXBsYWNlID0gZmFsc2U7XHJcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgIGxldCBjaGFyQ29kZSA9IGJ1ZmZlcltpbmRleCsrXTtcclxuICAgIGlmIChjaGFyQ29kZSA+PSAweDAwICYmIGNoYXJDb2RlIDw9IDB4N0YpIHtcclxuICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICAgIGlmIChjaGFyQ29kZSA+PSAweEMyICYmIGNoYXJDb2RlIDw9IDB4REYpIHtcclxuICAgICAgICBjb3VudCA9IDE7XHJcbiAgICAgIH0gZWxzZSBpZiAoY2hhckNvZGUgPj0gMHhFMCAmJiBjaGFyQ29kZSA8PSAweEVGICkge1xyXG4gICAgICAgIGNvdW50ID0gMjtcclxuICAgICAgICBpZiAoYnVmZmVyW2luZGV4XSA9PT0gMHhFMCkge1xyXG4gICAgICAgICAgbG93ZXJCb3VuZGFyeSA9IDB4QTA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChidWZmZXJbaW5kZXhdID09PSAweEVEKSB7XHJcbiAgICAgICAgICB1cHBlckJvdW5kYXJ5ID0gMHg5RjtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAoY2hhckNvZGUgPj0gMHhGMCAmJiBjaGFyQ29kZSA8PSAweEY0ICkge1xyXG4gICAgICAgIGNvdW50ID0gMztcclxuICAgICAgICBpZiAoYnVmZmVyW2luZGV4XSA9PT0gMHhGMCkge1xyXG4gICAgICAgICAgbG93ZXJCb3VuZGFyeSA9IDB4OTA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChidWZmZXJbaW5kZXhdID09PSAweEY0KSB7XHJcbiAgICAgICAgICB1cHBlckJvdW5kYXJ5ID0gMHg4RjtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVwbGFjZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgY2hhckNvZGUgPSBjaGFyQ29kZSAmICgxIDw8ICg4IC0gY291bnQgLSAxKSkgLSAxO1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcclxuICAgICAgICBpZiAoYnVmZmVyW2luZGV4XSA8IGxvd2VyQm91bmRhcnkgfHwgYnVmZmVyW2luZGV4XSA+IHVwcGVyQm91bmRhcnkpIHtcclxuICAgICAgICAgIHJlcGxhY2UgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjaGFyQ29kZSA9IChjaGFyQ29kZSA8PCA2KSB8IChidWZmZXJbaW5kZXhdICYgMHgzZik7XHJcbiAgICAgICAgaW5kZXgrKztcclxuICAgICAgfVxyXG4gICAgICBpZiAocmVwbGFjZSkge1xyXG4gICAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCk7XHJcbiAgICAgIH0gXHJcbiAgICAgIGVsc2UgaWYgKGNoYXJDb2RlIDw9IDB4ZmZmZikge1xyXG4gICAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXJDb2RlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjaGFyQ29kZSAtPSAweDEwMDAwO1xyXG4gICAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKFxyXG4gICAgICAgICAgKChjaGFyQ29kZSA+PiAxMCkgJiAweDNmZikgKyAweGQ4MDAsXHJcbiAgICAgICAgICAoY2hhckNvZGUgJiAweDNmZikgKyAweGRjMDApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBzdHI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBXcml0ZSBhIHN0cmluZyBvZiBVVEYtOCBjaGFyYWN0ZXJzIHRvIGEgYnl0ZSBidWZmZXIuXHJcbiAqIEBzZWUgaHR0cHM6Ly9lbmNvZGluZy5zcGVjLndoYXR3Zy5vcmcvI3V0Zi04LWVuY29kZXJcclxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBUaGUgc3RyaW5nIHRvIHBhY2suXHJcbiAqIEBwYXJhbSB7IVVpbnQ4QXJyYXl8IUFycmF5PG51bWJlcj59IGJ1ZmZlciBUaGUgYnVmZmVyIHRvIHBhY2sgdGhlIHN0cmluZyB0by5cclxuICogQHBhcmFtIHtudW1iZXI9fSBpbmRleCBUaGUgYnVmZmVyIGluZGV4IHRvIHN0YXJ0IHdyaXRpbmcuXHJcbiAqIEByZXR1cm4ge251bWJlcn0gVGhlIG5leHQgaW5kZXggdG8gd3JpdGUgaW4gdGhlIGJ1ZmZlci5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYWNrKHN0ciwgYnVmZmVyLCBpbmRleD0wKSB7XHJcbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHN0ci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICBsZXQgY29kZVBvaW50ID0gc3RyLmNvZGVQb2ludEF0KGkpO1xyXG4gICAgaWYgKGNvZGVQb2ludCA8IDEyOCkge1xyXG4gICAgICBidWZmZXJbaW5kZXhdID0gY29kZVBvaW50O1xyXG4gICAgICBpbmRleCsrO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgICBsZXQgb2Zmc2V0ID0gMDtcclxuICAgICAgaWYgKGNvZGVQb2ludCA8PSAweDA3RkYpIHtcclxuICAgICAgICBjb3VudCA9IDE7XHJcbiAgICAgICAgb2Zmc2V0ID0gMHhDMDtcclxuICAgICAgfSBlbHNlIGlmKGNvZGVQb2ludCA8PSAweEZGRkYpIHtcclxuICAgICAgICBjb3VudCA9IDI7XHJcbiAgICAgICAgb2Zmc2V0ID0gMHhFMDtcclxuICAgICAgfSBlbHNlIGlmKGNvZGVQb2ludCA8PSAweDEwRkZGRikge1xyXG4gICAgICAgIGNvdW50ID0gMztcclxuICAgICAgICBvZmZzZXQgPSAweEYwO1xyXG4gICAgICAgIGkrKztcclxuICAgICAgfVxyXG4gICAgICBidWZmZXJbaW5kZXhdID0gKGNvZGVQb2ludCA+PiAoNiAqIGNvdW50KSkgKyBvZmZzZXQ7XHJcbiAgICAgIGluZGV4Kys7XHJcbiAgICAgIHdoaWxlIChjb3VudCA+IDApIHtcclxuICAgICAgICBidWZmZXJbaW5kZXhdID0gMHg4MCB8IChjb2RlUG9pbnQgPj4gKDYgKiAoY291bnQgLSAxKSkgJiAweDNGKTtcclxuICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgIGNvdW50LS07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGluZGV4O1xyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL0NhbmNlbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG4gICAgdmFyIHJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgdmFyIG9uQ2FuY2VsZWQ7XG4gICAgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnVuc3Vic2NyaWJlKG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29uZmlnLnNpZ25hbCkge1xuICAgICAgICBjb25maWcuc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25DYW5jZWxlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgPyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSA6ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICBmdW5jdGlvbiBvbmxvYWRlbmQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhcmVzcG9uc2VUeXBlIHx8IHJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnIHx8ICByZXNwb25zZVR5cGUgPT09ICdqc29uJyA/XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShmdW5jdGlvbiBfcmVzb2x2ZSh2YWx1ZSkge1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSwgZnVuY3Rpb24gX3JlamVjdChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0sIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCdvbmxvYWRlbmQnIGluIHJlcXVlc3QpIHtcbiAgICAgIC8vIFVzZSBvbmxvYWRlbmQgaWYgYXZhaWxhYmxlXG4gICAgICByZXF1ZXN0Lm9ubG9hZGVuZCA9IG9ubG9hZGVuZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZSB0byBlbXVsYXRlIG9ubG9hZGVuZFxuICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlYWR5c3RhdGUgaGFuZGxlciBpcyBjYWxsaW5nIGJlZm9yZSBvbmVycm9yIG9yIG9udGltZW91dCBoYW5kbGVycyxcbiAgICAgICAgLy8gc28gd2Ugc2hvdWxkIGNhbGwgb25sb2FkZW5kIG9uIHRoZSBuZXh0ICd0aWNrJ1xuICAgICAgICBzZXRUaW1lb3V0KG9ubG9hZGVuZCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0ID8gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyA6ICd0aW1lb3V0IGV4Y2VlZGVkJztcbiAgICAgIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsIHx8IGRlZmF1bHRzLnRyYW5zaXRpb25hbDtcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgdHJhbnNpdGlvbmFsLmNsYXJpZnlUaW1lb3V0RXJyb3IgPyAnRVRJTUVET1VUJyA6ICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKHJlc3BvbnNlVHlwZSAmJiByZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4gfHwgY29uZmlnLnNpZ25hbCkge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgICAgIG9uQ2FuY2VsZWQgPSBmdW5jdGlvbihjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJlamVjdCghY2FuY2VsIHx8IChjYW5jZWwgJiYgY2FuY2VsLnR5cGUpID8gbmV3IENhbmNlbCgnY2FuY2VsZWQnKSA6IGNhbmNlbCk7XG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9O1xuXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4gJiYgY29uZmlnLmNhbmNlbFRva2VuLnN1YnNjcmliZShvbkNhbmNlbGVkKTtcbiAgICAgIGlmIChjb25maWcuc2lnbmFsKSB7XG4gICAgICAgIGNvbmZpZy5zaWduYWwuYWJvcnRlZCA/IG9uQ2FuY2VsZWQoKSA6IGNvbmZpZy5zaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBvbkNhbmNlbGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICAvLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG4gIGluc3RhbmNlLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICAgIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhkZWZhdWx0Q29uZmlnLCBpbnN0YW5jZUNvbmZpZykpO1xuICB9O1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcbmF4aW9zLlZFUlNJT04gPSByZXF1aXJlKCcuL2Vudi9kYXRhJykudmVyc2lvbjtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxuLy8gRXhwb3NlIGlzQXhpb3NFcnJvclxuYXhpb3MuaXNBeGlvc0Vycm9yID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzQXhpb3NFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuXG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHRoaXMucHJvbWlzZS50aGVuKGZ1bmN0aW9uKGNhbmNlbCkge1xuICAgIGlmICghdG9rZW4uX2xpc3RlbmVycykgcmV0dXJuO1xuXG4gICAgdmFyIGk7XG4gICAgdmFyIGwgPSB0b2tlbi5fbGlzdGVuZXJzLmxlbmd0aDtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRva2VuLl9saXN0ZW5lcnNbaV0oY2FuY2VsKTtcbiAgICB9XG4gICAgdG9rZW4uX2xpc3RlbmVycyA9IG51bGw7XG4gIH0pO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHRoaXMucHJvbWlzZS50aGVuID0gZnVuY3Rpb24ob25mdWxmaWxsZWQpIHtcbiAgICB2YXIgX3Jlc29sdmU7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgIHRva2VuLnN1YnNjcmliZShyZXNvbHZlKTtcbiAgICAgIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICB9KS50aGVuKG9uZnVsZmlsbGVkKTtcblxuICAgIHByb21pc2UuY2FuY2VsID0gZnVuY3Rpb24gcmVqZWN0KCkge1xuICAgICAgdG9rZW4udW5zdWJzY3JpYmUoX3Jlc29sdmUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfTtcblxuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBTdWJzY3JpYmUgdG8gdGhlIGNhbmNlbCBzaWduYWxcbiAqL1xuXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIGxpc3RlbmVyKHRoaXMucmVhc29uKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAodGhpcy5fbGlzdGVuZXJzKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2xpc3RlbmVycyA9IFtsaXN0ZW5lcl07XG4gIH1cbn07XG5cbi8qKlxuICogVW5zdWJzY3JpYmUgZnJvbSB0aGUgY2FuY2VsIHNpZ25hbFxuICovXG5cbkNhbmNlbFRva2VuLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uIHVuc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gIGlmICghdGhpcy5fbGlzdGVuZXJzKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpbmRleCA9IHRoaXMuX2xpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcbnZhciB2YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3ZhbGlkYXRvcicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHZhbGlkYXRvci52YWxpZGF0b3JzO1xuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnT3JVcmwsIGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZ09yVXJsID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgICBjb25maWcudXJsID0gY29uZmlnT3JVcmw7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnT3JVcmwgfHwge307XG4gIH1cblxuICBpZiAoIWNvbmZpZy51cmwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3ZpZGVkIGNvbmZpZyB1cmwgaXMgbm90IHZhbGlkJyk7XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsO1xuXG4gIGlmICh0cmFuc2l0aW9uYWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbGlkYXRvci5hc3NlcnRPcHRpb25zKHRyYW5zaXRpb25hbCwge1xuICAgICAgc2lsZW50SlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiksXG4gICAgICBmb3JjZWRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKSxcbiAgICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbilcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IHNraXBwZWQgaW50ZXJjZXB0b3JzXG4gIHZhciByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB2YXIgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gdHJ1ZTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgaWYgKHR5cGVvZiBpbnRlcmNlcHRvci5ydW5XaGVuID09PSAnZnVuY3Rpb24nICYmIGludGVyY2VwdG9yLnJ1bldoZW4oY29uZmlnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3Iuc3luY2hyb25vdXM7XG5cbiAgICByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlO1xuXG4gIGlmICghc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzKSB7XG4gICAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcblxuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGNoYWluLCByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbik7XG4gICAgY2hhaW4gPSBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBpZiAoIWNvbmZpZy51cmwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3ZpZGVkIGNvbmZpZyB1cmwgaXMgbm90IHZhbGlkJyk7XG4gIH1cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkLCBvcHRpb25zKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkLFxuICAgIHN5bmNocm9ub3VzOiBvcHRpb25zID8gb3B0aW9ucy5zeW5jaHJvbm91cyA6IGZhbHNlLFxuICAgIHJ1bldoZW46IG9wdGlvbnMgPyBvcHRpb25zLnJ1bldoZW4gOiBudWxsXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL0NhbmNlbCcpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5zaWduYWwgJiYgY29uZmlnLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgdGhyb3cgbmV3IENhbmNlbCgnY2FuY2VsZWQnKTtcbiAgfVxufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdCB0byB0aGUgc2VydmVyIHVzaW5nIHRoZSBjb25maWd1cmVkIGFkYXB0ZXIuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHRoYXQgaXMgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3RcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB0byBiZSBmdWxmaWxsZWRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkaXNwYXRjaFJlcXVlc3QoY29uZmlnKSB7XG4gIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAvLyBFbnN1cmUgaGVhZGVycyBleGlzdFxuICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gIC8vIFRyYW5zZm9ybSByZXF1ZXN0IGRhdGFcbiAgY29uZmlnLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgY29uZmlnLFxuICAgIGNvbmZpZy5kYXRhLFxuICAgIGNvbmZpZy5oZWFkZXJzLFxuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XG4gICk7XG5cbiAgLy8gRmxhdHRlbiBoZWFkZXJzXG4gIGNvbmZpZy5oZWFkZXJzID0gdXRpbHMubWVyZ2UoXG4gICAgY29uZmlnLmhlYWRlcnMuY29tbW9uIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzW2NvbmZpZy5tZXRob2RdIHx8IHt9LFxuICAgIGNvbmZpZy5oZWFkZXJzXG4gICk7XG5cbiAgdXRpbHMuZm9yRWFjaChcbiAgICBbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdwb3N0JywgJ3B1dCcsICdwYXRjaCcsICdjb21tb24nXSxcbiAgICBmdW5jdGlvbiBjbGVhbkhlYWRlckNvbmZpZyhtZXRob2QpIHtcbiAgICAgIGRlbGV0ZSBjb25maWcuaGVhZGVyc1ttZXRob2RdO1xuICAgIH1cbiAgKTtcblxuICB2YXIgYWRhcHRlciA9IGNvbmZpZy5hZGFwdGVyIHx8IGRlZmF1bHRzLmFkYXB0ZXI7XG5cbiAgcmV0dXJuIGFkYXB0ZXIoY29uZmlnKS50aGVuKGZ1bmN0aW9uIG9uQWRhcHRlclJlc29sdXRpb24ocmVzcG9uc2UpIHtcbiAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgIHJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICBjb25maWcsXG4gICAgICByZXNwb25zZS5kYXRhLFxuICAgICAgcmVzcG9uc2UuaGVhZGVycyxcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICk7XG5cbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH0sIGZ1bmN0aW9uIG9uQWRhcHRlclJlamVjdGlvbihyZWFzb24pIHtcbiAgICBpZiAoIWlzQ2FuY2VsKHJlYXNvbikpIHtcbiAgICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICAgIGlmIChyZWFzb24gJiYgcmVhc29uLnJlc3BvbnNlKSB7XG4gICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSxcbiAgICAgICAgICByZWFzb24ucmVzcG9uc2UuaGVhZGVycyxcbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QocmVhc29uKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZSxcbiAgICAgIHN0YXR1czogdGhpcy5yZXNwb25zZSAmJiB0aGlzLnJlc3BvbnNlLnN0YXR1cyA/IHRoaXMucmVzcG9uc2Uuc3RhdHVzIDogbnVsbFxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbi8qKlxuICogQ29uZmlnLXNwZWNpZmljIG1lcmdlLWZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYSBuZXcgY29uZmlnLW9iamVjdFxuICogYnkgbWVyZ2luZyB0d28gY29uZmlndXJhdGlvbiBvYmplY3RzIHRvZ2V0aGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcxXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMlxuICogQHJldHVybnMge09iamVjdH0gTmV3IG9iamVjdCByZXN1bHRpbmcgZnJvbSBtZXJnaW5nIGNvbmZpZzIgdG8gY29uZmlnMVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1lcmdlQ29uZmlnKGNvbmZpZzEsIGNvbmZpZzIpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIGNvbmZpZzIgPSBjb25maWcyIHx8IHt9O1xuICB2YXIgY29uZmlnID0ge307XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzFbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gbWVyZ2VEaXJlY3RLZXlzKHByb3ApIHtcbiAgICBpZiAocHJvcCBpbiBjb25maWcyKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIHZhciBtZXJnZU1hcCA9IHtcbiAgICAndXJsJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnbWV0aG9kJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnZGF0YSc6IHZhbHVlRnJvbUNvbmZpZzIsXG4gICAgJ2Jhc2VVUkwnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc2Zvcm1SZXF1ZXN0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndHJhbnNmb3JtUmVzcG9uc2UnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdwYXJhbXNTZXJpYWxpemVyJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndGltZW91dCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RpbWVvdXRNZXNzYWdlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnd2l0aENyZWRlbnRpYWxzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnYWRhcHRlcic6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3Jlc3BvbnNlVHlwZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3hzcmZDb29raWVOYW1lJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAneHNyZkhlYWRlck5hbWUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdvblVwbG9hZFByb2dyZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnb25Eb3dubG9hZFByb2dyZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnZGVjb21wcmVzcyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdtYXhCb2R5TGVuZ3RoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndHJhbnNwb3J0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnaHR0cEFnZW50JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnaHR0cHNBZ2VudCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2NhbmNlbFRva2VuJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnc29ja2V0UGF0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3Jlc3BvbnNlRW5jb2RpbmcnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd2YWxpZGF0ZVN0YXR1cyc6IG1lcmdlRGlyZWN0S2V5c1xuICB9O1xuXG4gIHV0aWxzLmZvckVhY2goT2JqZWN0LmtleXMoY29uZmlnMSkuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKSwgZnVuY3Rpb24gY29tcHV0ZUNvbmZpZ1ZhbHVlKHByb3ApIHtcbiAgICB2YXIgbWVyZ2UgPSBtZXJnZU1hcFtwcm9wXSB8fCBtZXJnZURlZXBQcm9wZXJ0aWVzO1xuICAgIHZhciBjb25maWdWYWx1ZSA9IG1lcmdlKHByb3ApO1xuICAgICh1dGlscy5pc1VuZGVmaW5lZChjb25maWdWYWx1ZSkgJiYgbWVyZ2UgIT09IG1lcmdlRGlyZWN0S2V5cykgfHwgKGNvbmZpZ1twcm9wXSA9IGNvbmZpZ1ZhbHVlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgdmFyIGNvbnRleHQgPSB0aGlzIHx8IGRlZmF1bHRzO1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbi5jYWxsKGNvbnRleHQsIGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2NvcmUvZW5oYW5jZUVycm9yJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5U2FmZWx5KHJhd1ZhbHVlLCBwYXJzZXIsIGVuY29kZXIpIHtcbiAgaWYgKHV0aWxzLmlzU3RyaW5nKHJhd1ZhbHVlKSkge1xuICAgIHRyeSB7XG4gICAgICAocGFyc2VyIHx8IEpTT04ucGFyc2UpKHJhd1ZhbHVlKTtcbiAgICAgIHJldHVybiB1dGlscy50cmltKHJhd1ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lICE9PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChlbmNvZGVyIHx8IEpTT04uc3RyaW5naWZ5KShyYXdWYWx1ZSk7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblxuICB0cmFuc2l0aW9uYWw6IHtcbiAgICBzaWxlbnRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBmb3JjZWRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBjbGFyaWZ5VGltZW91dEVycm9yOiBmYWxzZVxuICB9LFxuXG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkgfHwgKGhlYWRlcnMgJiYgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPT09ICdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgcmV0dXJuIHN0cmluZ2lmeVNhZmVseShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIHZhciB0cmFuc2l0aW9uYWwgPSB0aGlzLnRyYW5zaXRpb25hbCB8fCBkZWZhdWx0cy50cmFuc2l0aW9uYWw7XG4gICAgdmFyIHNpbGVudEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5zaWxlbnRKU09OUGFyc2luZztcbiAgICB2YXIgZm9yY2VkSlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLmZvcmNlZEpTT05QYXJzaW5nO1xuICAgIHZhciBzdHJpY3RKU09OUGFyc2luZyA9ICFzaWxlbnRKU09OUGFyc2luZyAmJiB0aGlzLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nO1xuXG4gICAgaWYgKHN0cmljdEpTT05QYXJzaW5nIHx8IChmb3JjZWRKU09OUGFyc2luZyAmJiB1dGlscy5pc1N0cmluZyhkYXRhKSAmJiBkYXRhLmxlbmd0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcpIHtcbiAgICAgICAgICBpZiAoZS5uYW1lID09PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgICAgICB0aHJvdyBlbmhhbmNlRXJyb3IoZSwgdGhpcywgJ0VfSlNPTl9QQVJTRScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIC8qKlxuICAgKiBBIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIHRvIGFib3J0IGEgcmVxdWVzdC4gSWYgc2V0IHRvIDAgKGRlZmF1bHQpIGFcbiAgICogdGltZW91dCBpcyBub3QgY3JlYXRlZC5cbiAgICovXG4gIHRpbWVvdXQ6IDAsXG5cbiAgeHNyZkNvb2tpZU5hbWU6ICdYU1JGLVRPS0VOJyxcbiAgeHNyZkhlYWRlck5hbWU6ICdYLVhTUkYtVE9LRU4nLFxuXG4gIG1heENvbnRlbnRMZW5ndGg6IC0xLFxuICBtYXhCb2R5TGVuZ3RoOiAtMSxcblxuICB2YWxpZGF0ZVN0YXR1czogZnVuY3Rpb24gdmFsaWRhdGVTdGF0dXMoc3RhdHVzKSB7XG4gICAgcmV0dXJuIHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICB9LFxuXG4gIGhlYWRlcnM6IHtcbiAgICBjb21tb246IHtcbiAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICAgIH1cbiAgfVxufTtcblxudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB7fTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICBkZWZhdWx0cy5oZWFkZXJzW21ldGhvZF0gPSB1dGlscy5tZXJnZShERUZBVUxUX0NPTlRFTlRfVFlQRSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcInZlcnNpb25cIjogXCIwLjI1LjBcIlxufTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdmFyIGhhc2htYXJrSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNobWFya0luZGV4ICE9PSAtMSkge1xuICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGhhc2htYXJrSW5kZXgpO1xuICAgIH1cblxuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIHJlbGF0aXZlVVJMXG4gICAgPyBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICA6IGJhc2VVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZCtcXC0uXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvc1xuICpcbiAqIEBwYXJhbSB7Kn0gcGF5bG9hZCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0F4aW9zRXJyb3IocGF5bG9hZCkge1xuICByZXR1cm4gdXRpbHMuaXNPYmplY3QocGF5bG9hZCkgJiYgKHBheWxvYWQuaXNBeGlvc0Vycm9yID09PSB0cnVlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFZFUlNJT04gPSByZXF1aXJlKCcuLi9lbnYvZGF0YScpLnZlcnNpb247XG5cbnZhciB2YWxpZGF0b3JzID0ge307XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5bJ29iamVjdCcsICdib29sZWFuJywgJ251bWJlcicsICdmdW5jdGlvbicsICdzdHJpbmcnLCAnc3ltYm9sJ10uZm9yRWFjaChmdW5jdGlvbih0eXBlLCBpKSB7XG4gIHZhbGlkYXRvcnNbdHlwZV0gPSBmdW5jdGlvbiB2YWxpZGF0b3IodGhpbmcpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nID09PSB0eXBlIHx8ICdhJyArIChpIDwgMSA/ICduICcgOiAnICcpICsgdHlwZTtcbiAgfTtcbn0pO1xuXG52YXIgZGVwcmVjYXRlZFdhcm5pbmdzID0ge307XG5cbi8qKlxuICogVHJhbnNpdGlvbmFsIG9wdGlvbiB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7ZnVuY3Rpb258Ym9vbGVhbj99IHZhbGlkYXRvciAtIHNldCB0byBmYWxzZSBpZiB0aGUgdHJhbnNpdGlvbmFsIG9wdGlvbiBoYXMgYmVlbiByZW1vdmVkXG4gKiBAcGFyYW0ge3N0cmluZz99IHZlcnNpb24gLSBkZXByZWNhdGVkIHZlcnNpb24gLyByZW1vdmVkIHNpbmNlIHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gbWVzc2FnZSAtIHNvbWUgbWVzc2FnZSB3aXRoIGFkZGl0aW9uYWwgaW5mb1xuICogQHJldHVybnMge2Z1bmN0aW9ufVxuICovXG52YWxpZGF0b3JzLnRyYW5zaXRpb25hbCA9IGZ1bmN0aW9uIHRyYW5zaXRpb25hbCh2YWxpZGF0b3IsIHZlcnNpb24sIG1lc3NhZ2UpIHtcbiAgZnVuY3Rpb24gZm9ybWF0TWVzc2FnZShvcHQsIGRlc2MpIHtcbiAgICByZXR1cm4gJ1tBeGlvcyB2JyArIFZFUlNJT04gKyAnXSBUcmFuc2l0aW9uYWwgb3B0aW9uIFxcJycgKyBvcHQgKyAnXFwnJyArIGRlc2MgKyAobWVzc2FnZSA/ICcuICcgKyBtZXNzYWdlIDogJycpO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvcHQsIG9wdHMpIHtcbiAgICBpZiAodmFsaWRhdG9yID09PSBmYWxzZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdE1lc3NhZ2Uob3B0LCAnIGhhcyBiZWVuIHJlbW92ZWQnICsgKHZlcnNpb24gPyAnIGluICcgKyB2ZXJzaW9uIDogJycpKSk7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gJiYgIWRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdKSB7XG4gICAgICBkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSA9IHRydWU7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRNZXNzYWdlKFxuICAgICAgICAgIG9wdCxcbiAgICAgICAgICAnIGhhcyBiZWVuIGRlcHJlY2F0ZWQgc2luY2UgdicgKyB2ZXJzaW9uICsgJyBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZWFyIGZ1dHVyZSdcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdG9yID8gdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdHMpIDogdHJ1ZTtcbiAgfTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IG9iamVjdCdzIHByb3BlcnRpZXMgdHlwZVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBzY2hlbWFcbiAqIEBwYXJhbSB7Ym9vbGVhbj99IGFsbG93VW5rbm93blxuICovXG5cbmZ1bmN0aW9uIGFzc2VydE9wdGlvbnMob3B0aW9ucywgc2NoZW1hLCBhbGxvd1Vua25vd24pIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgfVxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9wdGlvbnMpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tID4gMCkge1xuICAgIHZhciBvcHQgPSBrZXlzW2ldO1xuICAgIHZhciB2YWxpZGF0b3IgPSBzY2hlbWFbb3B0XTtcbiAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICB2YXIgdmFsdWUgPSBvcHRpb25zW29wdF07XG4gICAgICB2YXIgcmVzdWx0ID0gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0aW9ucyk7XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiAnICsgb3B0ICsgJyBtdXN0IGJlICcgKyByZXN1bHQpO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChhbGxvd1Vua25vd24gIT09IHRydWUpIHtcbiAgICAgIHRocm93IEVycm9yKCdVbmtub3duIG9wdGlvbiAnICsgb3B0KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzc2VydE9wdGlvbnM6IGFzc2VydE9wdGlvbnMsXG4gIHZhbGlkYXRvcnM6IHZhbGlkYXRvcnNcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGb3JtRGF0YV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmIChpc0FycmF5QnVmZmVyKHZhbC5idWZmZXIpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKHZhbCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpO1xuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgVVJMU2VhcmNoUGFyYW1zXSc7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUmVhZGVyID0gZXhwb3J0cy5Xcml0ZXIgPSB2b2lkIDA7XG5jb25zdCB1dGY4ID0gcmVxdWlyZShcInV0ZjgtYnVmZmVyXCIpO1xuY29uc3QgdXRmOF9idWZmZXJfc2l6ZV8xID0gcmVxdWlyZShcInV0ZjgtYnVmZmVyLXNpemVcIik7XG5jb25zdCB7IHBhY2ssIHVucGFjayB9ID0gdXRmOC5kZWZhdWx0ID8/IHV0Zjg7XG5jbGFzcyBXcml0ZXIge1xuICAgIHBvcyA9IDA7XG4gICAgdmlldztcbiAgICBieXRlcztcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy52aWV3ID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcig2NCkpO1xuICAgICAgICB0aGlzLmJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkodGhpcy52aWV3LmJ1ZmZlcik7XG4gICAgfVxuICAgIHdyaXRlVUludDgodmFsKSB7XG4gICAgICAgIHRoaXMuZW5zdXJlU2l6ZSgxKTtcbiAgICAgICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMucG9zLCB2YWwpO1xuICAgICAgICB0aGlzLnBvcyArPSAxO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVVSW50MzIodmFsKSB7XG4gICAgICAgIHRoaXMuZW5zdXJlU2l6ZSg0KTtcbiAgICAgICAgdGhpcy52aWV3LnNldFVpbnQzMih0aGlzLnBvcywgdmFsKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlVUludDY0KHZhbCkge1xuICAgICAgICB0aGlzLmVuc3VyZVNpemUoOCk7XG4gICAgICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5wb3MsIHZhbCk7XG4gICAgICAgIHRoaXMucG9zICs9IDg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZVVWYXJpbnQodmFsKSB7XG4gICAgICAgIGlmICh2YWwgPCAweDgwKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoMSk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDgodGhpcy5wb3MsIHZhbCk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCA8IDB4NDAwMCkge1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKDIpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQxNih0aGlzLnBvcywgKHZhbCAmIDB4N2YpIHwgKCh2YWwgJiAweDNmODApIDw8IDEpIHwgMHg4MDAwKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IDI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIDwgMHgyMDAwMDApIHtcbiAgICAgICAgICAgIHRoaXMuZW5zdXJlU2l6ZSgzKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLnBvcywgKHZhbCA+PiAxNCkgfCAweDgwKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50MTYodGhpcy5wb3MgKyAxLCAodmFsICYgMHg3ZikgfCAoKHZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAweDgwMDApO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gMztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgPCAweDEwMDAwMDAwKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoNCk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDMyKHRoaXMucG9zLCAodmFsICYgMHg3ZikgfCAoKHZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAoKHZhbCAmIDB4MWZjMDAwKSA8PCAyKSB8ICgodmFsICYgMHhmZTAwMDAwKSA8PCAzKSB8IDB4ODA4MDgwMDApO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgPCAweDgwMDAwMDAwMCkge1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKDUpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMucG9zLCBNYXRoLmZsb29yKHZhbCAvIE1hdGgucG93KDIsIDI4KSkgfCAweDgwKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50MzIodGhpcy5wb3MgKyAxLCAodmFsICYgMHg3ZikgfCAoKHZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAoKHZhbCAmIDB4MWZjMDAwKSA8PCAyKSB8ICgodmFsICYgMHhmZTAwMDAwKSA8PCAzKSB8IDB4ODA4MDgwMDApO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gNTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgPCAweDQwMDAwMDAwMDAwKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoNik7XG4gICAgICAgICAgICBjb25zdCBzaGlmdGVkVmFsID0gTWF0aC5mbG9vcih2YWwgLyBNYXRoLnBvdygyLCAyOCkpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQxNih0aGlzLnBvcywgKHNoaWZ0ZWRWYWwgJiAweDdmKSB8ICgoc2hpZnRlZFZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAweDgwODApO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQzMih0aGlzLnBvcyArIDIsICh2YWwgJiAweDdmKSB8ICgodmFsICYgMHgzZjgwKSA8PCAxKSB8ICgodmFsICYgMHgxZmMwMDApIDw8IDIpIHwgKCh2YWwgJiAweGZlMDAwMDApIDw8IDMpIHwgMHg4MDgwODAwMCk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSA2O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVmFsdWUgb3V0IG9mIHJhbmdlXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZVZhcmludCh2YWwpIHtcbiAgICAgICAgY29uc3QgYmlndmFsID0gQmlnSW50KHZhbCk7XG4gICAgICAgIHRoaXMud3JpdGVVVmFyaW50KE51bWJlcigoYmlndmFsID4+IDYzbikgXiAoYmlndmFsIDw8IDFuKSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVGbG9hdCh2YWwpIHtcbiAgICAgICAgdGhpcy5lbnN1cmVTaXplKDQpO1xuICAgICAgICB0aGlzLnZpZXcuc2V0RmxvYXQzMih0aGlzLnBvcywgdmFsLCB0cnVlKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlQml0cyhiaXRzKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYml0cy5sZW5ndGg7IGkgKz0gOCkge1xuICAgICAgICAgICAgbGV0IGJ5dGUgPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA4OyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaSArIGogPT0gYml0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJ5dGUgfD0gKGJpdHNbaSArIGpdID8gMSA6IDApIDw8IGo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLndyaXRlVUludDgoYnl0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlU3RyaW5nKHZhbCkge1xuICAgICAgICBpZiAodmFsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVTaXplID0gKDAsIHV0ZjhfYnVmZmVyX3NpemVfMS5kZWZhdWx0KSh2YWwpO1xuICAgICAgICAgICAgdGhpcy53cml0ZVVWYXJpbnQoYnl0ZVNpemUpO1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKGJ5dGVTaXplKTtcbiAgICAgICAgICAgIHBhY2sodmFsLCB0aGlzLmJ5dGVzLCB0aGlzLnBvcyk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSBieXRlU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMud3JpdGVVSW50OCgwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVCdWZmZXIoYnVmKSB7XG4gICAgICAgIHRoaXMuZW5zdXJlU2l6ZShidWYubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5ieXRlcy5zZXQoYnVmLCB0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zICs9IGJ1Zi5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB0b0J1ZmZlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnl0ZXMuc3ViYXJyYXkoMCwgdGhpcy5wb3MpO1xuICAgIH1cbiAgICBlbnN1cmVTaXplKHNpemUpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMudmlldy5ieXRlTGVuZ3RoIDwgdGhpcy5wb3MgKyBzaXplKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdWaWV3ID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcih0aGlzLnZpZXcuYnl0ZUxlbmd0aCAqIDIpKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0J5dGVzID0gbmV3IFVpbnQ4QXJyYXkobmV3Vmlldy5idWZmZXIpO1xuICAgICAgICAgICAgbmV3Qnl0ZXMuc2V0KHRoaXMuYnl0ZXMpO1xuICAgICAgICAgICAgdGhpcy52aWV3ID0gbmV3VmlldztcbiAgICAgICAgICAgIHRoaXMuYnl0ZXMgPSBuZXdCeXRlcztcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuV3JpdGVyID0gV3JpdGVyO1xuY2xhc3MgUmVhZGVyIHtcbiAgICBwb3MgPSAwO1xuICAgIHZpZXc7XG4gICAgYnl0ZXM7XG4gICAgY29uc3RydWN0b3IoYnVmKSB7XG4gICAgICAgIHRoaXMudmlldyA9IG5ldyBEYXRhVmlldyhidWYuYnVmZmVyLCBidWYuYnl0ZU9mZnNldCwgYnVmLmJ5dGVMZW5ndGgpO1xuICAgICAgICB0aGlzLmJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkodGhpcy52aWV3LmJ1ZmZlciwgYnVmLmJ5dGVPZmZzZXQsIGJ1Zi5ieXRlTGVuZ3RoKTtcbiAgICB9XG4gICAgcmVhZFVJbnQ4KCkge1xuICAgICAgICBjb25zdCB2YWwgPSB0aGlzLnZpZXcuZ2V0VWludDgodGhpcy5wb3MpO1xuICAgICAgICB0aGlzLnBvcyArPSAxO1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZWFkVUludDMyKCkge1xuICAgICAgICBjb25zdCB2YWwgPSB0aGlzLnZpZXcuZ2V0VWludDMyKHRoaXMucG9zKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgcmVhZFVJbnQ2NCgpIHtcbiAgICAgICAgY29uc3QgdmFsID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zICs9IDg7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHJlYWRVVmFyaW50KCkge1xuICAgICAgICBsZXQgdmFsID0gMDtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCBieXRlID0gdGhpcy52aWV3LmdldFVpbnQ4KHRoaXMucG9zKyspO1xuICAgICAgICAgICAgaWYgKGJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbCArIGJ5dGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWwgPSAodmFsICsgKGJ5dGUgJiAweDdmKSkgKiAxMjg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVhZFZhcmludCgpIHtcbiAgICAgICAgY29uc3QgdmFsID0gQmlnSW50KHRoaXMucmVhZFVWYXJpbnQoKSk7XG4gICAgICAgIHJldHVybiBOdW1iZXIoKHZhbCA+PiAxbikgXiAtKHZhbCAmIDFuKSk7XG4gICAgfVxuICAgIHJlYWRGbG9hdCgpIHtcbiAgICAgICAgY29uc3QgdmFsID0gdGhpcy52aWV3LmdldEZsb2F0MzIodGhpcy5wb3MsIHRydWUpO1xuICAgICAgICB0aGlzLnBvcyArPSA0O1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZWFkQml0cyhudW1CaXRzKSB7XG4gICAgICAgIGNvbnN0IG51bUJ5dGVzID0gTWF0aC5jZWlsKG51bUJpdHMgLyA4KTtcbiAgICAgICAgY29uc3QgYnl0ZXMgPSB0aGlzLmJ5dGVzLnNsaWNlKHRoaXMucG9zLCB0aGlzLnBvcyArIG51bUJ5dGVzKTtcbiAgICAgICAgY29uc3QgYml0cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGJ5dGUgb2YgYnl0ZXMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgOCAmJiBiaXRzLmxlbmd0aCA8IG51bUJpdHM7IGkrKykge1xuICAgICAgICAgICAgICAgIGJpdHMucHVzaCgoKGJ5dGUgPj4gaSkgJiAxKSA9PT0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3MgKz0gbnVtQnl0ZXM7XG4gICAgICAgIHJldHVybiBiaXRzO1xuICAgIH1cbiAgICByZWFkU3RyaW5nKCkge1xuICAgICAgICBjb25zdCBsZW4gPSB0aGlzLnJlYWRVVmFyaW50KCk7XG4gICAgICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbCA9IHVucGFjayh0aGlzLmJ5dGVzLCB0aGlzLnBvcywgdGhpcy5wb3MgKyBsZW4pO1xuICAgICAgICB0aGlzLnBvcyArPSBsZW47XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHJlYWRCdWZmZXIobnVtQnl0ZXMpIHtcbiAgICAgICAgY29uc3QgYnl0ZXMgPSB0aGlzLmJ5dGVzLnNsaWNlKHRoaXMucG9zLCB0aGlzLnBvcyArIG51bUJ5dGVzKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gbnVtQnl0ZXM7XG4gICAgICAgIHJldHVybiBieXRlcztcbiAgICB9XG4gICAgcmVtYWluaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy52aWV3LmJ5dGVMZW5ndGggLSB0aGlzLnBvcztcbiAgICB9XG59XG5leHBvcnRzLlJlYWRlciA9IFJlYWRlcjtcbiIsInZhciB3aW5kb3cgPSByZXF1aXJlKCdnbG9iYWwvd2luZG93Jyk7XG52YXIgbm9kZUNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuXG5mdW5jdGlvbiBnZXRSYW5kb21WYWx1ZXMoYnVmKSB7XG4gIGlmICh3aW5kb3cuY3J5cHRvICYmIHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGJ1Zik7XG4gIH1cbiAgaWYgKHR5cGVvZiB3aW5kb3cubXNDcnlwdG8gPT09ICdvYmplY3QnICYmIHR5cGVvZiB3aW5kb3cubXNDcnlwdG8uZ2V0UmFuZG9tVmFsdWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5tc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMoYnVmKTtcbiAgfVxuICBpZiAobm9kZUNyeXB0by5yYW5kb21CeXRlcykge1xuICAgIGlmICghKGJ1ZiBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleHBlY3RlZCBVaW50OEFycmF5Jyk7XG4gICAgfVxuICAgIGlmIChidWYubGVuZ3RoID4gNjU1MzYpIHtcbiAgICAgIHZhciBlID0gbmV3IEVycm9yKCk7XG4gICAgICBlLmNvZGUgPSAyMjtcbiAgICAgIGUubWVzc2FnZSA9ICdGYWlsZWQgdG8gZXhlY3V0ZSBcXCdnZXRSYW5kb21WYWx1ZXNcXCcgb24gXFwnQ3J5cHRvXFwnOiBUaGUgJyArXG4gICAgICAgICdBcnJheUJ1ZmZlclZpZXdcXCdzIGJ5dGUgbGVuZ3RoICgnICsgYnVmLmxlbmd0aCArICcpIGV4Y2VlZHMgdGhlICcgK1xuICAgICAgICAnbnVtYmVyIG9mIGJ5dGVzIG9mIGVudHJvcHkgYXZhaWxhYmxlIHZpYSB0aGlzIEFQSSAoNjU1MzYpLic7XG4gICAgICBlLm5hbWUgPSAnUXVvdGFFeGNlZWRlZEVycm9yJztcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICAgIHZhciBieXRlcyA9IG5vZGVDcnlwdG8ucmFuZG9tQnl0ZXMoYnVmLmxlbmd0aCk7XG4gICAgYnVmLnNldChieXRlcyk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfVxuICBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHNlY3VyZSByYW5kb20gbnVtYmVyIGdlbmVyYXRvciBhdmFpbGFibGUuJyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRSYW5kb21WYWx1ZXM7XG4iLCJ2YXIgd2luO1xuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHdpbiA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHdpbiA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIHdpbiA9IHNlbGY7XG59IGVsc2Uge1xuICAgIHdpbiA9IHt9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbjtcbiIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXhvZ2Rlbi93ZWJzb2NrZXQtc3RyZWFtL2Jsb2IvNDhkYzNkZGY5NDNlNWFkYTY2OGMzMWNjZDk0ZTkxODZmMDJmYWZiZC93cy1mYWxsYmFjay5qc1xuXG52YXIgd3MgPSBudWxsXG5cbmlmICh0eXBlb2YgV2ViU29ja2V0ICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IFdlYlNvY2tldFxufSBlbHNlIGlmICh0eXBlb2YgTW96V2ViU29ja2V0ICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IE1veldlYlNvY2tldFxufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IGdsb2JhbC5XZWJTb2NrZXQgfHwgZ2xvYmFsLk1veldlYlNvY2tldFxufSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IHdpbmRvdy5XZWJTb2NrZXQgfHwgd2luZG93Lk1veldlYlNvY2tldFxufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgd3MgPSBzZWxmLldlYlNvY2tldCB8fCBzZWxmLk1veldlYlNvY2tldFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdzXG4iLCJmdW5jdGlvbiBlKGUpe3RoaXMubWVzc2FnZT1lfWUucHJvdG90eXBlPW5ldyBFcnJvcixlLnByb3RvdHlwZS5uYW1lPVwiSW52YWxpZENoYXJhY3RlckVycm9yXCI7dmFyIHI9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdyYmd2luZG93LmF0b2ImJndpbmRvdy5hdG9iLmJpbmQod2luZG93KXx8ZnVuY3Rpb24ocil7dmFyIHQ9U3RyaW5nKHIpLnJlcGxhY2UoLz0rJC8sXCJcIik7aWYodC5sZW5ndGglND09MSl0aHJvdyBuZXcgZShcIidhdG9iJyBmYWlsZWQ6IFRoZSBzdHJpbmcgdG8gYmUgZGVjb2RlZCBpcyBub3QgY29ycmVjdGx5IGVuY29kZWQuXCIpO2Zvcih2YXIgbixvLGE9MCxpPTAsYz1cIlwiO289dC5jaGFyQXQoaSsrKTt+byYmKG49YSU0PzY0Km4rbzpvLGErKyU0KT9jKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDI1NSZuPj4oLTIqYSY2KSk6MClvPVwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cIi5pbmRleE9mKG8pO3JldHVybiBjfTtmdW5jdGlvbiB0KGUpe3ZhciB0PWUucmVwbGFjZSgvLS9nLFwiK1wiKS5yZXBsYWNlKC9fL2csXCIvXCIpO3N3aXRjaCh0Lmxlbmd0aCU0KXtjYXNlIDA6YnJlYWs7Y2FzZSAyOnQrPVwiPT1cIjticmVhaztjYXNlIDM6dCs9XCI9XCI7YnJlYWs7ZGVmYXVsdDp0aHJvd1wiSWxsZWdhbCBiYXNlNjR1cmwgc3RyaW5nIVwifXRyeXtyZXR1cm4gZnVuY3Rpb24oZSl7cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyKGUpLnJlcGxhY2UoLyguKS9nLChmdW5jdGlvbihlLHIpe3ZhciB0PXIuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtyZXR1cm4gdC5sZW5ndGg8MiYmKHQ9XCIwXCIrdCksXCIlXCIrdH0pKSl9KHQpfWNhdGNoKGUpe3JldHVybiByKHQpfX1mdW5jdGlvbiBuKGUpe3RoaXMubWVzc2FnZT1lfWZ1bmN0aW9uIG8oZSxyKXtpZihcInN0cmluZ1wiIT10eXBlb2YgZSl0aHJvdyBuZXcgbihcIkludmFsaWQgdG9rZW4gc3BlY2lmaWVkXCIpO3ZhciBvPSEwPT09KHI9cnx8e30pLmhlYWRlcj8wOjE7dHJ5e3JldHVybiBKU09OLnBhcnNlKHQoZS5zcGxpdChcIi5cIilbb10pKX1jYXRjaChlKXt0aHJvdyBuZXcgbihcIkludmFsaWQgdG9rZW4gc3BlY2lmaWVkOiBcIitlLm1lc3NhZ2UpfX1uLnByb3RvdHlwZT1uZXcgRXJyb3Isbi5wcm90b3R5cGUubmFtZT1cIkludmFsaWRUb2tlbkVycm9yXCI7ZXhwb3J0IGRlZmF1bHQgbztleHBvcnR7biBhcyBJbnZhbGlkVG9rZW5FcnJvcn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1qd3QtZGVjb2RlLmVzbS5qcy5tYXBcbiIsIi8qXG5Db3B5cmlnaHQgMjAxMyBTbGVlcGxlc3MgU29mdHdhcmUgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0b1xuZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGVcbnJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vclxuc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HXG5GUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTXG5JTiBUSEUgU09GVFdBUkUuIFxuKi9cblxuLy8geWVzLCBJIGtub3cgdGhpcyBzZWVtcyBzdHVwaWQsIGJ1dCBJIGhhdmUgbXkgcmVhc29ucy5cblxudmFyIG5ldCA9IHJlcXVpcmUoXCJuZXRcIilcbmZvcihrIGluIG5ldClcblx0Z2xvYmFsW2tdID0gbmV0W2tdXG5cbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoYykgMjAxOCBSYWZhZWwgZGEgU2lsdmEgUm9jaGEuXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xyXG4gKiBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcclxuICogXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXHJcbiAqIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcclxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXHJcbiAqIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xyXG4gKiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXHJcbiAqIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxyXG4gKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcclxuICogTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcclxuICogTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxyXG4gKiBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXHJcbiAqIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxyXG4gKiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcblxyXG4vKipcclxuICogQGZpbGVvdmVydmlldyBUaGUgdXRmOC1idWZmZXItc2l6ZSBBUEkuXHJcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3JvY2hhcnMvdXRmOC1idWZmZXItc2l6ZVxyXG4gKi9cclxuXHJcbi8qKiBAbW9kdWxlIHV0ZjhCdWZmZXJTaXplICovXHJcblxyXG4vKipcclxuICogUmV0dXJucyBob3cgbWFueSBieXRlcyBhcmUgbmVlZGVkIHRvIHNlcmlhbGl6ZSBhIFVURi04IHN0cmluZy5cclxuICogQHNlZSBodHRwczovL2VuY29kaW5nLnNwZWMud2hhdHdnLm9yZy8jdXRmLTgtZW5jb2RlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdG8gcGFjay5cclxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGJ5dGVzIG5lZWRlZCB0byBzZXJpYWxpemUgdGhlIHN0cmluZy5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHV0ZjhCdWZmZXJTaXplKHN0cikge1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIGxldCBieXRlcyA9IDA7XHJcbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHN0ci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICBsZXQgY29kZVBvaW50ID0gc3RyLmNvZGVQb2ludEF0KGkpO1xyXG4gICAgaWYgKGNvZGVQb2ludCA8IDEyOCkge1xyXG4gICAgICBieXRlcysrO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGNvZGVQb2ludCA8PSAyMDQ3KSB7XHJcbiAgICAgICAgYnl0ZXMrKztcclxuICAgICAgfSBlbHNlIGlmKGNvZGVQb2ludCA8PSA2NTUzNSkge1xyXG4gICAgICAgIGJ5dGVzKz0yO1xyXG4gICAgICB9IGVsc2UgaWYoY29kZVBvaW50IDw9IDExMTQxMTEpIHtcclxuICAgICAgICBpKys7XHJcbiAgICAgICAgYnl0ZXMrPTM7XHJcbiAgICAgIH1cclxuICAgICAgYnl0ZXMrKztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGJ5dGVzO1xyXG59XHJcbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoYykgMjAxOCBSYWZhZWwgZGEgU2lsdmEgUm9jaGEuXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xyXG4gKiBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcclxuICogXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXHJcbiAqIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcclxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXHJcbiAqIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xyXG4gKiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXHJcbiAqIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxyXG4gKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcclxuICogTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcclxuICogTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxyXG4gKiBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXHJcbiAqIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxyXG4gKiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcblxyXG4vKipcclxuICogQGZpbGVvdmVydmlldyBGdW5jdGlvbnMgdG8gc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBVVEYtOCBzdHJpbmdzLlxyXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9yb2NoYXJzL3V0ZjgtYnVmZmVyXHJcbiAqIEBzZWUgaHR0cHM6Ly9lbmNvZGluZy5zcGVjLndoYXR3Zy5vcmcvI3RoZS1lbmNvZGluZ1xyXG4gKiBAc2VlIGh0dHBzOi8vZW5jb2Rpbmcuc3BlYy53aGF0d2cub3JnLyN1dGYtOC1lbmNvZGVyXHJcbiAqL1xyXG5cclxuLyoqIEBtb2R1bGUgdXRmOC1idWZmZXIgKi9cclxuXHJcbi8qKlxyXG4gKiBSZWFkIGEgc3RyaW5nIG9mIFVURi04IGNoYXJhY3RlcnMgZnJvbSBhIGJ5dGUgYnVmZmVyLlxyXG4gKiBJbnZhbGlkIGNoYXJhY3RlcnMgYXJlIHJlcGxhY2VkIHdpdGggJ1JFUExBQ0VNRU5UIENIQVJBQ1RFUicgKFUrRkZGRCkuXHJcbiAqIEBzZWUgaHR0cHM6Ly9lbmNvZGluZy5zcGVjLndoYXR3Zy5vcmcvI3RoZS1lbmNvZGluZ1xyXG4gKiBAc2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zNDkyNjkxMVxyXG4gKiBAcGFyYW0geyFVaW50OEFycmF5fCFBcnJheTxudW1iZXI+fSBidWZmZXIgQSBieXRlIGJ1ZmZlci5cclxuICogQHBhcmFtIHtudW1iZXI9fSBzdGFydCBUaGUgYnVmZmVyIGluZGV4IHRvIHN0YXJ0IHJlYWRpbmcuXHJcbiAqIEBwYXJhbSB7P251bWJlcj19IGVuZCBUaGUgYnVmZmVyIGluZGV4IHRvIHN0b3AgcmVhZGluZy5cclxuICogICBBc3N1bWVzIHRoZSBidWZmZXIgbGVuZ3RoIGlmIHVuZGVmaW5lZC5cclxuICogQHJldHVybiB7c3RyaW5nfVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVucGFjayhidWZmZXIsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKSB7XHJcbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXHJcbiAgbGV0IHN0ciA9ICcnO1xyXG4gIGZvcihsZXQgaW5kZXggPSBzdGFydDsgaW5kZXggPCBlbmQ7KSB7XHJcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgIGxldCBsb3dlckJvdW5kYXJ5ID0gMHg4MDtcclxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgbGV0IHVwcGVyQm91bmRhcnkgPSAweEJGO1xyXG4gICAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xyXG4gICAgbGV0IHJlcGxhY2UgPSBmYWxzZTtcclxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgbGV0IGNoYXJDb2RlID0gYnVmZmVyW2luZGV4KytdO1xyXG4gICAgaWYgKGNoYXJDb2RlID49IDB4MDAgJiYgY2hhckNvZGUgPD0gMHg3Rikge1xyXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyQ29kZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgaWYgKGNoYXJDb2RlID49IDB4QzIgJiYgY2hhckNvZGUgPD0gMHhERikge1xyXG4gICAgICAgIGNvdW50ID0gMTtcclxuICAgICAgfSBlbHNlIGlmIChjaGFyQ29kZSA+PSAweEUwICYmIGNoYXJDb2RlIDw9IDB4RUYgKSB7XHJcbiAgICAgICAgY291bnQgPSAyO1xyXG4gICAgICAgIGlmIChidWZmZXJbaW5kZXhdID09PSAweEUwKSB7XHJcbiAgICAgICAgICBsb3dlckJvdW5kYXJ5ID0gMHhBMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGJ1ZmZlcltpbmRleF0gPT09IDB4RUQpIHtcclxuICAgICAgICAgIHVwcGVyQm91bmRhcnkgPSAweDlGO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChjaGFyQ29kZSA+PSAweEYwICYmIGNoYXJDb2RlIDw9IDB4RjQgKSB7XHJcbiAgICAgICAgY291bnQgPSAzO1xyXG4gICAgICAgIGlmIChidWZmZXJbaW5kZXhdID09PSAweEYwKSB7XHJcbiAgICAgICAgICBsb3dlckJvdW5kYXJ5ID0gMHg5MDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGJ1ZmZlcltpbmRleF0gPT09IDB4RjQpIHtcclxuICAgICAgICAgIHVwcGVyQm91bmRhcnkgPSAweDhGO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBjaGFyQ29kZSA9IGNoYXJDb2RlICYgKDEgPDwgKDggLSBjb3VudCAtIDEpKSAtIDE7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgIGlmIChidWZmZXJbaW5kZXhdIDwgbG93ZXJCb3VuZGFyeSB8fCBidWZmZXJbaW5kZXhdID4gdXBwZXJCb3VuZGFyeSkge1xyXG4gICAgICAgICAgcmVwbGFjZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNoYXJDb2RlID0gKGNoYXJDb2RlIDw8IDYpIHwgKGJ1ZmZlcltpbmRleF0gJiAweDNmKTtcclxuICAgICAgICBpbmRleCsrO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChyZXBsYWNlKSB7XHJcbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKTtcclxuICAgICAgfSBcclxuICAgICAgZWxzZSBpZiAoY2hhckNvZGUgPD0gMHhmZmZmKSB7XHJcbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNoYXJDb2RlIC09IDB4MTAwMDA7XHJcbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoXHJcbiAgICAgICAgICAoKGNoYXJDb2RlID4+IDEwKSAmIDB4M2ZmKSArIDB4ZDgwMCxcclxuICAgICAgICAgIChjaGFyQ29kZSAmIDB4M2ZmKSArIDB4ZGMwMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHN0cjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFdyaXRlIGEgc3RyaW5nIG9mIFVURi04IGNoYXJhY3RlcnMgdG8gYSBieXRlIGJ1ZmZlci5cclxuICogQHNlZSBodHRwczovL2VuY29kaW5nLnNwZWMud2hhdHdnLm9yZy8jdXRmLTgtZW5jb2RlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdG8gcGFjay5cclxuICogQHBhcmFtIHshVWludDhBcnJheXwhQXJyYXk8bnVtYmVyPn0gYnVmZmVyIFRoZSBidWZmZXIgdG8gcGFjayB0aGUgc3RyaW5nIHRvLlxyXG4gKiBAcGFyYW0ge251bWJlcj19IGluZGV4IFRoZSBidWZmZXIgaW5kZXggdG8gc3RhcnQgd3JpdGluZy5cclxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgbmV4dCBpbmRleCB0byB3cml0ZSBpbiB0aGUgYnVmZmVyLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhY2soc3RyLCBidWZmZXIsIGluZGV4PTApIHtcclxuICBmb3IgKGxldCBpID0gMCwgbGVuID0gc3RyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgIGxldCBjb2RlUG9pbnQgPSBzdHIuY29kZVBvaW50QXQoaSk7XHJcbiAgICBpZiAoY29kZVBvaW50IDwgMTI4KSB7XHJcbiAgICAgIGJ1ZmZlcltpbmRleF0gPSBjb2RlUG9pbnQ7XHJcbiAgICAgIGluZGV4Kys7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgICBpZiAoY29kZVBvaW50IDw9IDB4MDdGRikge1xyXG4gICAgICAgIGNvdW50ID0gMTtcclxuICAgICAgICBvZmZzZXQgPSAweEMwO1xyXG4gICAgICB9IGVsc2UgaWYoY29kZVBvaW50IDw9IDB4RkZGRikge1xyXG4gICAgICAgIGNvdW50ID0gMjtcclxuICAgICAgICBvZmZzZXQgPSAweEUwO1xyXG4gICAgICB9IGVsc2UgaWYoY29kZVBvaW50IDw9IDB4MTBGRkZGKSB7XHJcbiAgICAgICAgY291bnQgPSAzO1xyXG4gICAgICAgIG9mZnNldCA9IDB4RjA7XHJcbiAgICAgICAgaSsrO1xyXG4gICAgICB9XHJcbiAgICAgIGJ1ZmZlcltpbmRleF0gPSAoY29kZVBvaW50ID4+ICg2ICogY291bnQpKSArIG9mZnNldDtcclxuICAgICAgaW5kZXgrKztcclxuICAgICAgd2hpbGUgKGNvdW50ID4gMCkge1xyXG4gICAgICAgIGJ1ZmZlcltpbmRleF0gPSAweDgwIHwgKGNvZGVQb2ludCA+PiAoNiAqIChjb3VudCAtIDEpKSAmIDB4M0YpO1xyXG4gICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgY291bnQtLTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gaW5kZXg7XHJcbn1cclxuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIvKnN0eWxlLmNzcyovXFxuYm9keSB7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIG1hcmdpbjogMDtcXG4gICAgcGFkZGluZzogMDtcXG59XFxuXFxuLmJhbGwge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHdpZHRoOiAxNXB4O1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxuICAgIHRvcDogMHB4O1xcbiAgICBsZWZ0OiAwcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMXMgbGluZWFyO1xcbn1cXG5cXG4ucDFzY29yZSB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgd2lkdGg6IDc1cHg7XFxuICAgIGhlaWdodDogMTVweDtcXG4gICAgYm90dG9tOiA1cHg7XFxuICAgIGxlZnQ6IDEwcHg7XFxuICAgIGZvbnQtZmFtaWx5OiBBcmlhbDtcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcbiAgICBvcGFjaXR5OiAwLjU7XFxufVxcblxcbi5wMnNjb3JlIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB3aWR0aDogNzVweDtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICBib3R0b206IDVweDtcXG4gICAgcmlnaHQ6IDEwcHg7XFxuICAgIGZvbnQtZmFtaWx5OiBBcmlhbDtcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcbiAgICBvcGFjaXR5OiAwLjU7XFxufVxcblxcbi5wMSB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgd2lkdGg6IDEwcHg7XFxuICAgIGhlaWdodDogNDhweDtcXG4gICAgdG9wOiAwcHg7XFxuICAgIGxlZnQ6IDBweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMXMgbGluZWFyO1xcbn1cXG5cXG4ucDIge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHdpZHRoOiAxMHB4O1xcbiAgICBoZWlnaHQ6IDQ4cHg7XFxuICAgIHRvcDogMHB4O1xcbiAgICBsZWZ0OiAwcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjFzIGxpbmVhcjtcXG59XFxuXFxuLmZsZXgge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbn1cXG5cXG4uc21hbGxfd2lkdGgge1xcbiAgICB3aWR0aDogMTUlO1xcbn1cXG5cXG4ubWVkaXVtX3dpZHRoIHtcXG4gICAgd2lkdGg6IDI1JTtcXG59XFxuXFxuLmxhcmdlX3dpZHRoIHtcXG4gICAgd2lkdGg6IDYwJTtcXG59XFxuXFxuLnNwYWNlZEVxdWFsIHtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbi5zdGFydExlZnQge1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbmlucHV0IHtcXG4gICAgaGVpZ2h0OiAzMHB4O1xcbn1cXG5cXG4uYnV0dG9uIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzIyNDg4NztcXG4gICAgYm9yZGVyOiAxcHggc29saWQgIzIyNDg4NztcXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgICBwYWRkaW5nOiAxMHB4IDMycHg7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBmb250LXNpemU6IDE2cHg7XFxuICAgIG1hcmdpbjogMTVweDtcXG59XFxuXFxuLmJ1dHRvbjpob3ZlciB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcbiAgICBjb2xvcjogIzIyNDg4NztcXG59XFxuXFxuLmJ1dHRvbjpkaXNhYmxlZCB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IGdyYXk7XFxuICAgIGNvbG9yOiBibGFjaztcXG59XFxuXFxubGFiZWwge1xcbiAgICBtYXJnaW4tbGVmdDogMTBweDtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxMHB4O1xcbiAgICB3aWR0aDogNTBweDtcXG59XFxuXFxuLmdhbWVBcmVhIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwMDAwO1xcbiAgICB3aWR0aDogNjAwcHg7XFxuICAgIGhlaWdodDogNDAwcHg7XFxuICAgIG1hcmdpbi10b3A6IDE1cHg7XFxuICAgIG1hcmdpbi1sZWZ0OiAxNXB4O1xcbiAgICBib3JkZXI6IG5vbmU7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gICAgZm9udC1zaXplOiAxNnB4O1xcbn1cXG5cXG4uaW5zdHJ1Y3Rpb25zIHtcXG4gICAgbWFyZ2luOiAxNXB4O1xcbiAgICBmb250LWZhbWlseTogQXJpYWw7XFxuICAgIGZvbnQtc2l6ZTogeC1sYXJnZTtcXG4gICAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxuICAgIGNvbG9yOiAjMjI0ODg3O1xcbn1cXG5cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvc3R5bGUuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBLFlBQVk7QUFDWjtJQUNJLHNCQUFzQjtJQUN0QixTQUFTO0lBQ1QsVUFBVTtBQUNkOztBQUVBO0lBQ0ksa0JBQWtCO0lBQ2xCLFdBQVc7SUFDWCxZQUFZO0lBQ1osUUFBUTtJQUNSLFNBQVM7SUFDVCxzQkFBc0I7SUFDdEIsa0JBQWtCO0lBQ2xCLGlDQUFpQztBQUNyQzs7QUFFQTtJQUNJLGtCQUFrQjtJQUNsQixXQUFXO0lBQ1gsWUFBWTtJQUNaLFdBQVc7SUFDWCxVQUFVO0lBQ1Ysa0JBQWtCO0lBQ2xCLGVBQWU7SUFDZixZQUFZO0FBQ2hCOztBQUVBO0lBQ0ksa0JBQWtCO0lBQ2xCLFdBQVc7SUFDWCxZQUFZO0lBQ1osV0FBVztJQUNYLFdBQVc7SUFDWCxrQkFBa0I7SUFDbEIsZUFBZTtJQUNmLFlBQVk7QUFDaEI7O0FBRUE7SUFDSSxrQkFBa0I7SUFDbEIsV0FBVztJQUNYLFlBQVk7SUFDWixRQUFRO0lBQ1IsU0FBUztJQUNULHNCQUFzQjtJQUN0QixpQ0FBaUM7QUFDckM7O0FBRUE7SUFDSSxrQkFBa0I7SUFDbEIsV0FBVztJQUNYLFlBQVk7SUFDWixRQUFRO0lBQ1IsU0FBUztJQUNULHNCQUFzQjtJQUN0QixpQ0FBaUM7QUFDckM7O0FBRUE7SUFDSSxhQUFhO0FBQ2pCOztBQUVBO0lBQ0ksVUFBVTtBQUNkOztBQUVBO0lBQ0ksVUFBVTtBQUNkOztBQUVBO0lBQ0ksVUFBVTtBQUNkOztBQUVBO0lBQ0ksNkJBQTZCO0lBQzdCLG1CQUFtQjtBQUN2Qjs7QUFFQTtJQUNJLDJCQUEyQjtJQUMzQixtQkFBbUI7QUFDdkI7O0FBRUE7SUFDSSxZQUFZO0FBQ2hCOztBQUVBO0lBQ0kseUJBQXlCO0lBQ3pCLHlCQUF5QjtJQUN6QixZQUFZO0lBQ1osa0JBQWtCO0lBQ2xCLGtCQUFrQjtJQUNsQixxQkFBcUI7SUFDckIsZUFBZTtJQUNmLFlBQVk7QUFDaEI7O0FBRUE7SUFDSSx1QkFBdUI7SUFDdkIsY0FBYztBQUNsQjs7QUFFQTtJQUNJLHNCQUFzQjtJQUN0QixZQUFZO0FBQ2hCOztBQUVBO0lBQ0ksaUJBQWlCO0lBQ2pCLGtCQUFrQjtJQUNsQixXQUFXO0FBQ2Y7O0FBRUE7SUFDSSxrQkFBa0I7SUFDbEIseUJBQXlCO0lBQ3pCLFlBQVk7SUFDWixhQUFhO0lBQ2IsZ0JBQWdCO0lBQ2hCLGlCQUFpQjtJQUNqQixZQUFZO0lBQ1osWUFBWTtJQUNaLGtCQUFrQjtJQUNsQixxQkFBcUI7SUFDckIscUJBQXFCO0lBQ3JCLGVBQWU7QUFDbkI7O0FBRUE7SUFDSSxZQUFZO0lBQ1osa0JBQWtCO0lBQ2xCLGtCQUFrQjtJQUNsQixpQkFBaUI7SUFDakIsY0FBYztBQUNsQlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCIvKnN0eWxlLmNzcyovXFxuYm9keSB7XFxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAgIG1hcmdpbjogMDtcXG4gICAgcGFkZGluZzogMDtcXG59XFxuXFxuLmJhbGwge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHdpZHRoOiAxNXB4O1xcbiAgICBoZWlnaHQ6IDE1cHg7XFxuICAgIHRvcDogMHB4O1xcbiAgICBsZWZ0OiAwcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMXMgbGluZWFyO1xcbn1cXG5cXG4ucDFzY29yZSB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgd2lkdGg6IDc1cHg7XFxuICAgIGhlaWdodDogMTVweDtcXG4gICAgYm90dG9tOiA1cHg7XFxuICAgIGxlZnQ6IDEwcHg7XFxuICAgIGZvbnQtZmFtaWx5OiBBcmlhbDtcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcbiAgICBvcGFjaXR5OiAwLjU7XFxufVxcblxcbi5wMnNjb3JlIHtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB3aWR0aDogNzVweDtcXG4gICAgaGVpZ2h0OiAxNXB4O1xcbiAgICBib3R0b206IDVweDtcXG4gICAgcmlnaHQ6IDEwcHg7XFxuICAgIGZvbnQtZmFtaWx5OiBBcmlhbDtcXG4gICAgZm9udC1zaXplOiAxMnB4O1xcbiAgICBvcGFjaXR5OiAwLjU7XFxufVxcblxcbi5wMSB7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgd2lkdGg6IDEwcHg7XFxuICAgIGhlaWdodDogNDhweDtcXG4gICAgdG9wOiAwcHg7XFxuICAgIGxlZnQ6IDBweDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMXMgbGluZWFyO1xcbn1cXG5cXG4ucDIge1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHdpZHRoOiAxMHB4O1xcbiAgICBoZWlnaHQ6IDQ4cHg7XFxuICAgIHRvcDogMHB4O1xcbiAgICBsZWZ0OiAwcHg7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNmZmY7XFxuICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjFzIGxpbmVhcjtcXG59XFxuXFxuLmZsZXgge1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbn1cXG5cXG4uc21hbGxfd2lkdGgge1xcbiAgICB3aWR0aDogMTUlO1xcbn1cXG5cXG4ubWVkaXVtX3dpZHRoIHtcXG4gICAgd2lkdGg6IDI1JTtcXG59XFxuXFxuLmxhcmdlX3dpZHRoIHtcXG4gICAgd2lkdGg6IDYwJTtcXG59XFxuXFxuLnNwYWNlZEVxdWFsIHtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1hcm91bmQ7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbi5zdGFydExlZnQge1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbmlucHV0IHtcXG4gICAgaGVpZ2h0OiAzMHB4O1xcbn1cXG5cXG4uYnV0dG9uIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzIyNDg4NztcXG4gICAgYm9yZGVyOiAxcHggc29saWQgIzIyNDg4NztcXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgICBwYWRkaW5nOiAxMHB4IDMycHg7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgICBmb250LXNpemU6IDE2cHg7XFxuICAgIG1hcmdpbjogMTVweDtcXG59XFxuXFxuLmJ1dHRvbjpob3ZlciB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xcbiAgICBjb2xvcjogIzIyNDg4NztcXG59XFxuXFxuLmJ1dHRvbjpkaXNhYmxlZCB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IGdyYXk7XFxuICAgIGNvbG9yOiBibGFjaztcXG59XFxuXFxubGFiZWwge1xcbiAgICBtYXJnaW4tbGVmdDogMTBweDtcXG4gICAgbWFyZ2luLXJpZ2h0OiAxMHB4O1xcbiAgICB3aWR0aDogNTBweDtcXG59XFxuXFxuLmdhbWVBcmVhIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDAwMDAwO1xcbiAgICB3aWR0aDogNjAwcHg7XFxuICAgIGhlaWdodDogNDAwcHg7XFxuICAgIG1hcmdpbi10b3A6IDE1cHg7XFxuICAgIG1hcmdpbi1sZWZ0OiAxNXB4O1xcbiAgICBib3JkZXI6IG5vbmU7XFxuICAgIGNvbG9yOiB3aGl0ZTtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gICAgZm9udC1zaXplOiAxNnB4O1xcbn1cXG5cXG4uaW5zdHJ1Y3Rpb25zIHtcXG4gICAgbWFyZ2luOiAxNXB4O1xcbiAgICBmb250LWZhbWlseTogQXJpYWw7XFxuICAgIGZvbnQtc2l6ZTogeC1sYXJnZTtcXG4gICAgZm9udC13ZWlnaHQ6IGJvbGQ7XFxuICAgIGNvbG9yOiAjMjI0ODg3O1xcbn1cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuXG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgXCJcIikuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiKCgpPT57XCJ1c2Ugc3RyaWN0XCI7dmFyIGU9e2Q6KHQsaSk9Pntmb3IodmFyIHMgaW4gaSllLm8oaSxzKSYmIWUubyh0LHMpJiZPYmplY3QuZGVmaW5lUHJvcGVydHkodCxzLHtlbnVtZXJhYmxlOiEwLGdldDppW3NdfSl9LG86KGUsdCk9Pk9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLHQpLHI6ZT0+e1widW5kZWZpbmVkXCIhPXR5cGVvZiBTeW1ib2wmJlN5bWJvbC50b1N0cmluZ1RhZyYmT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsU3ltYm9sLnRvU3RyaW5nVGFnLHt2YWx1ZTpcIk1vZHVsZVwifSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSl9fSx0PXt9O2Uucih0KSxlLmQodCx7VUk6KCk9Pm4sVUlWaWV3OigpPT5pfSk7Y2xhc3MgaXtjb25zdHJ1Y3Rvcigpe3RoaXMuc3RhdGU9XCJjcmVhdGVkXCIsdGhpcy5iaW5kaW5ncz1bXSx0aGlzLmFuaW1hdGlvbnM9W10sdGhpcy5hbmltYXRpb25RdWV1ZT1bXSx0aGlzLmRlc3Ryb3llZD1cIlwiLHRoaXMubW92ZWQ9XCJcIn1zdGF0aWMgY3JlYXRlKGUsdCxzPXt9LG89e3BhcmVudDpudWxsLHByZXBhcmU6ITAsc2libGluZzpudWxsfSl7dmFyIHI7Y29uc3QgbD1uZXcgaTtyZXR1cm4gbC5tb2RlbD1zLGwuZWxlbWVudD10LGwuYmluZGluZ3MucHVzaCguLi5uLnBhcnNlKGwuZWxlbWVudCxzLGwpKSxsLnBhcmVudEVsZW1lbnQ9ZSxsLnNpYmxpbmc9by5zaWJsaW5nLGwucGFyZW50PW51bGwhPT0ocj1vLnBhcmVudCkmJnZvaWQgMCE9PXI/cjpuLGwuYXR0YWNoZWQ9bmV3IFByb21pc2UoKGU9PntsLmF0dGFjaFJlc29sdmU9ZX0pKSxsfWRlc3Ryb3koKXt0aGlzLmRlc3Ryb3llZD1cInF1ZXVlXCIsbi5kZXN0cm95ZWQucHVzaCh0aGlzKX10ZXJtaW5hdGUoKXtQcm9taXNlLmFsbCh0aGlzLmVsZW1lbnQuZ2V0QW5pbWF0aW9ucyh7c3VidHJlZTohMH0pLm1hcCgoZT0+ZS5maW5pc2hlZCkpKS50aGVuKCgoKT0+e3ZhciBlO251bGw9PT0oZT10aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudCl8fHZvaWQgMD09PWV8fGUucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KSx0aGlzLmJpbmRpbmdzLmZvckVhY2goKGU9PmUudW5iaW5kKCkpKTtjb25zdCB0PXRoaXMucGFyZW50LnZpZXdzLmZpbmRJbmRleCgoZT0+ZT09PXRoaXMpKTt0Pi0xJiZ0aGlzLnBhcmVudC52aWV3cy5zcGxpY2UodCwxKX0pKSx0aGlzLmRlc3Ryb3llZD1cImRlc3Ryb3llZFwifW1vdmUoZSl7dGhpcy5tb3ZlZD1cInF1ZXVlXCIsdGhpcy5zaWJsaW5nPWV9cGxheShlLHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBlJiYoZT10aGlzLmFuaW1hdGlvbnMuZmluZCgodD0+dC5uYW1lPT09ZSkpLmNsb25lKCkpLGUuZWxlbWVudD10LGUuc3RhdGU9XCJwZW5kaW5nXCIsdGhpcy5hbmltYXRpb25RdWV1ZS5wdXNoKGUpLHRoaXMudXBkYXRlQW5pbWF0aW9ucyhwZXJmb3JtYW5jZS5ub3coKSksZX11cGRhdGVGcm9tVUkoKXt0aGlzLmJpbmRpbmdzLmZvckVhY2goKGU9PmUudXBkYXRlRnJvbVVJKCkpKX11cGRhdGVUb1VJKCl7dmFyIGU7dGhpcy5iaW5kaW5ncy5mb3JFYWNoKChlPT5lLnVwZGF0ZVRvVUkoKSkpLFwiY3JlYXRlZFwiPT09dGhpcy5zdGF0ZSYmKHRoaXMucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodGhpcy5lbGVtZW50LG51bGw9PT0oZT10aGlzLnNpYmxpbmcpfHx2b2lkIDA9PT1lP3ZvaWQgMDplLm5leHRTaWJsaW5nKSx0aGlzLmF0dGFjaFJlc29sdmUoKSx0aGlzLnN0YXRlPVwiYXR0YWNoZWRcIil9dXBkYXRlQXRFdmVudHMoKXt0aGlzLmJpbmRpbmdzLmZvckVhY2goKGU9PmUudXBkYXRlQXRFdmVudHMoKSkpfXVwZGF0ZUFuaW1hdGlvbnMoZSl7Zm9yKHZhciB0LGk7bnVsbCE9PShpPVwiZmluaXNoZWRcIj09PShudWxsPT09KHQ9dGhpcy5hbmltYXRpb25RdWV1ZVswXSl8fHZvaWQgMD09PXQ/dm9pZCAwOnQuc3RhdGUpKSYmdm9pZCAwIT09aSYmaTspdGhpcy5hbmltYXRpb25RdWV1ZS5zaGlmdCgpLmRlc3Ryb3koKTtmb3IobGV0IHQ9MDt0PHRoaXMuYW5pbWF0aW9uUXVldWUubGVuZ3RoO3QrKyl7Y29uc3QgaT10aGlzLmFuaW1hdGlvblF1ZXVlW3RdO1wicGVuZGluZ1wiPT09aS5zdGF0ZSYmKGkuaXNCbG9ja2VkKGUpfHwoaS5zdGF0ZT1cInBsYXlpbmdcIixpLnN0YXJ0VGltZT1lLGkuYW5pbWF0aW9uPWkuZWxlbWVudC5hbmltYXRlKGkua2V5ZnJhbWVzLGkub3B0aW9ucyksaS5maW5pc2hlZD1pLmFuaW1hdGlvbi5maW5pc2hlZCxpLmZpbmlzaGVkLnRoZW4oKCgpPT57aS5zdGF0ZT1cImZpbmlzaGVkXCIsdGhpcy51cGRhdGVBbmltYXRpb25zKHBlcmZvcm1hbmNlLm5vdygpKX0pKSkpfX11cGRhdGVNb3ZlKCl7c3dpdGNoKHRoaXMubW92ZWQpe2Nhc2VcInF1ZXVlXCI6dGhpcy5tb3ZlZD1cIm1vdmVcIjticmVhaztjYXNlXCJtb3ZlXCI6MD09PXRoaXMuZWxlbWVudC5nZXRBbmltYXRpb25zKHtzdWJ0cmVlOiEwfSkubGVuZ3RoJiYodGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRoaXMuZWxlbWVudCx0aGlzLnNpYmxpbmcubmV4dFNpYmxpbmcpLHRoaXMubW92ZWQ9XCJcIix0aGlzLnNpYmxpbmc9dm9pZCAwKX10aGlzLmJpbmRpbmdzLmZvckVhY2goKGU9PmUudXBkYXRlTW92ZSgpKSl9fWNsYXNzIHN7Y29uc3RydWN0b3IoKXt0aGlzLmZyb21VST0hMSx0aGlzLnRvVUk9ITAsdGhpcy5hdEV2ZW50PSExLHRoaXMub25lVGltZT0hMSx0aGlzLnZpZXdzPVtdLHRoaXMuZmlyc3RVcGRhdGU9ITAsdGhpcy5ldmVudHM9W10sdGhpcy50cmlnZ2VyQXRFdmVudD1lPT57dGhpcy5ldmVudHMucHVzaChlKX0sdGhpcy5pZD0rK24uaWR9Z2V0IGVsZW1lbnQoKXtyZXR1cm4gbnVsbD09dGhpcy4kZWxlbWVudCYmKHRoaXMuJGVsZW1lbnQ9dGhpcy5zZWxlY3RvciBpbnN0YW5jZW9mIEVsZW1lbnR8fHRoaXMuc2VsZWN0b3IgaW5zdGFuY2VvZiBUZXh0fHx0aGlzLnNlbGVjdG9yIGluc3RhbmNlb2YgQ29tbWVudD90aGlzLnNlbGVjdG9yOnRoaXMuY29udGV4dC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3IpKSx0aGlzLiRlbGVtZW50fXNldCBlbGVtZW50KGUpe3RoaXMuJGVsZW1lbnQ9ZX1zdGF0aWMgY3JlYXRlKGUpe3ZhciB0LGksbyxyLGwsYSxoLHUsZDtjb25zdCBwPW5ldyBzO3JldHVybiBwLm9iamVjdD1cIiRtb2RlbFwiaW4gZS5vYmplY3Q/ZS5vYmplY3Q6eyRtb2RlbDplLm9iamVjdH0scC5wcm9wZXJ0eT1lLnByb3BlcnR5LHAuY29udGV4dD1udWxsIT09KHQ9ZS5jb250ZXh0KSYmdm9pZCAwIT09dD90OmRvY3VtZW50LHAuc2VsZWN0b3I9ZS5zZWxlY3RvcixwLmF0dHJpYnV0ZT1udWxsIT09KGk9ZS5hdHRyaWJ1dGUpJiZ2b2lkIDAhPT1pP2k6XCJpbm5lclRleHRcIixwLnZhbHVlPW51bGwhPT0obz1lLnZhbHVlKSYmdm9pZCAwIT09bz9vOnAudmFsdWUscC50ZW1wbGF0ZT1udWxsIT09KHI9ZS50ZW1wbGF0ZSkmJnZvaWQgMCE9PXI/cjpwLnRlbXBsYXRlLHAuZnJvbVVJPW51bGwhPT0obD1lLmZyb21VSSkmJnZvaWQgMCE9PWw/bDpwLmZyb21VSSxwLnRvVUk9bnVsbCE9PShhPWUudG9VSSkmJnZvaWQgMCE9PWE/YTpwLnRvVUkscC5hdEV2ZW50PW51bGwhPT0oaD1lLmF0RXZlbnQpJiZ2b2lkIDAhPT1oP2g6cC5hdEV2ZW50LHAub25lVGltZT1udWxsIT09KHU9ZS5vbmVUaW1lKSYmdm9pZCAwIT09dT91OnAub25lVGltZSxwLnBhcmVudD1udWxsIT09KGQ9ZS5wYXJlbnQpJiZ2b2lkIDAhPT1kP2Q6bixwLmFkZExpc3RlbmVyKCksXCJib29sZWFuXCIhPXR5cGVvZiBwLmZyb21VSSYmKHAuZnJvbVVJPXAuZnJvbVVJLmJpbmQocCkpLFwiYm9vbGVhblwiIT10eXBlb2YgcC50b1VJJiYocC50b1VJPXAudG9VSS5iaW5kKHApKSxwfWRlc3Ryb3koKXt0aGlzLmVsZW1lbnQ9bnVsbCx0aGlzLnJlbW92ZUxpc3RlbmVyKCksdGhpcy52aWV3cy5mb3JFYWNoKChlPT5lLmRlc3Ryb3koKSkpfXVuYmluZCgpe24udW5iaW5kKHRoaXMpfWFkZExpc3RlbmVyKCl7dGhpcy5hdEV2ZW50JiYodGhpcy50b1VJPSExLHRoaXMuZnJvbVVJPSExLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHRoaXMuYXR0cmlidXRlLHRoaXMudHJpZ2dlckF0RXZlbnQpKX1yZW1vdmVMaXN0ZW5lcigpe3RoaXMuYXRFdmVudCYmdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5hdHRyaWJ1dGUsdGhpcy50cmlnZ2VyQXRFdmVudCl9dXBkYXRlRnJvbVVJKCl7aWYoITE9PT10aGlzLmZyb21VSXx8dGhpcy5maXJzdFVwZGF0ZSlyZXR1cm4gdGhpcy5maXJzdFVwZGF0ZT0hMSx2b2lkIHRoaXMudmlld3MuZm9yRWFjaCgoZT0+ZS51cGRhdGVGcm9tVUkoKSkpO2NvbnN0e3RhcmdldDplLHByb3BlcnR5OnR9PW4ucmVzb2x2ZVByb3BlcnR5KHRoaXMuZWxlbWVudCx0aGlzLmF0dHJpYnV0ZSksaT1lW3RdO2lmKGkhPT10aGlzLmxhc3RVSVZhbHVlKXtsZXQgZT0hMCE9PXRoaXMuZnJvbVVJP3RoaXMuZnJvbVVJKGksdGhpcy5sYXN0VUlWYWx1ZSx0aGlzLnByb3BlcnR5LHRoaXMub2JqZWN0KTppO2lmKHRoaXMubGFzdFVJVmFsdWU9aSx2b2lkIDAhPT1lJiZlIT09dGhpcy5sYXN0VmFsdWUpe3RoaXMubGFzdFZhbHVlPWU7Y29uc3R7dGFyZ2V0OnQscHJvcGVydHk6aX09bi5yZXNvbHZlUHJvcGVydHkodGhpcy5vYmplY3QsdGhpcy5wcm9wZXJ0eSk7XCJudW1iZXJcIiE9PW4ucmVzb2x2ZVZhbHVlKHRoaXMub2JqZWN0LHRoaXMucHJvcGVydHkpfHxpc05hTihlKXx8KGU9K2UpLHRbaV09ZX1lbHNlIHRoaXMubGFzdFZhbHVlPWV9dGhpcy52aWV3cy5mb3JFYWNoKChlPT5lLnVwZGF0ZUZyb21VSSgpKSl9dXBkYXRlVG9VSSgpe3ZhciBlLHQscyxvLHIsbDtpZighMT09PXRoaXMudG9VSSlyZXR1cm4gdm9pZCB0aGlzLnZpZXdzLmZvckVhY2goKGU9PmUudXBkYXRlVG9VSSgpKSk7bGV0IGE9bi5yZXNvbHZlVmFsdWUodGhpcy5vYmplY3QsdGhpcy5wcm9wZXJ0eSksaD0hMTtpZihudWxsIT10aGlzLnRlbXBsYXRlKWlmKFwiYm9vbGVhblwiPT10eXBlb2YgdGhpcy5hdHRyaWJ1dGUpe2lmKGEhPT10aGlzLmxhc3RWYWx1ZSl7Y29uc3QgZT0hMCE9PXRoaXMudG9VST90aGlzLnRvVUkoYSx0aGlzLmxhc3RWYWx1ZSx0aGlzLnByb3BlcnR5LHRoaXMub2JqZWN0KTphO2lmKHZvaWQgMCE9PWUmJmUhPT10aGlzLmxhc3RVSVZhbHVlKXtpZihlPT09dGhpcy5hdHRyaWJ1dGUpdGhpcy52aWV3cy5wdXNoKGkuY3JlYXRlKHRoaXMuZWxlbWVudC5wYXJlbnRFbGVtZW50LHRoaXMudGVtcGxhdGUuY2xvbmVOb2RlKCEwKSx0aGlzLm9iamVjdCx7cGFyZW50OnRoaXMscHJlcGFyZTohMSxzaWJsaW5nOnRoaXMuZWxlbWVudH0pKTtlbHNle2NvbnN0IGU9dGhpcy52aWV3cy5wb3AoKTtudWxsPT1lfHxlLmRlc3Ryb3koKX10aGlzLmxhc3RWYWx1ZT1hLHRoaXMubGFzdFVJVmFsdWU9ZX19fWVsc2V7bnVsbD09YSYmKGE9W10pO2NvbnN0IG49bnVsbCE9PShlPXRoaXMubGFzdFZhbHVlKSYmdm9pZCAwIT09ZT9lOltdO2lmKGEubGVuZ3RoIT09bi5sZW5ndGgpaD0hMDtlbHNlIGZvcihsZXQgZT0wLHQ9YS5sZW5ndGg7ZTx0O2UrKylpZihhW2VdIT09bltlXSl7aD0hMDticmVha31pZighaClyZXR1cm4gdGhpcy52aWV3cy5mb3JFYWNoKChlPT5lLnVwZGF0ZVRvVUkoKSkpLHZvaWQodGhpcy5vbmVUaW1lJiZ0aGlzLm9uZVRpbWVEb25lKCkpO2NvbnN0IHU9ITAhPT10aGlzLnRvVUk/dGhpcy50b1VJKGEsbix0aGlzLnByb3BlcnR5LHRoaXMub2JqZWN0KTphO2lmKG51bGw9PXUpcmV0dXJuIHRoaXMudmlld3MuZm9yRWFjaCgoZT0+ZS51cGRhdGVUb1VJKCkpKSx2b2lkKHRoaXMub25lVGltZSYmdGhpcy5vbmVUaW1lRG9uZSgpKTtjb25zdCBkPW51bGwhPT0odD10aGlzLmxhc3RVSVZhbHVlKSYmdm9pZCAwIT09dD90OltdO2xldCBwPTA7Zm9yKGxldCBlPTAsdD11Lmxlbmd0aCxpPTA7ZTx0JiZ1W2VdPT09ZFtpXTtlKyssaSsrKXArKztpZihwPT09dS5sZW5ndGgmJnUubGVuZ3RoPT09ZC5sZW5ndGgpcmV0dXJuIHRoaXMudmlld3MuZm9yRWFjaCgoZT0+ZS51cGRhdGVUb1VJKCkpKSx2b2lkKHRoaXMub25lVGltZSYmdGhpcy5vbmVUaW1lRG9uZSgpKTtjb25zdCBjPXRoaXMudmlld3Muc3BsaWNlKDAscCk7Zm9yKGxldCBlPXAsdD11Lmxlbmd0aCxuPXA7ZTx0O2UrKyxuKyspe2NvbnN0IHQ9dVtlXTtcInN0cmluZ1wiIT10eXBlb2YgdCYmKHQuJGluZGV4PWUpO2NvbnN0IG49Y1tjLmxlbmd0aC0xXSxhPXRoaXMudmlld3Muc2hpZnQoKTtpZihudWxsPT1hKXtjb25zdCBlPXskbW9kZWw6e1t0aGlzLmF0dHJpYnV0ZV06dH0sJHBhcmVudDp0aGlzLm9iamVjdH07Yy5wdXNoKGkuY3JlYXRlKHRoaXMuZWxlbWVudC5wYXJlbnRFbGVtZW50LHRoaXMudGVtcGxhdGUuY2xvbmVOb2RlKCEwKSxlLHtwYXJlbnQ6dGhpcyxwcmVwYXJlOiExLHNpYmxpbmc6bnVsbCE9PShzPW51bGw9PW4/dm9pZCAwOm4uZWxlbWVudCkmJnZvaWQgMCE9PXM/czp0aGlzLmVsZW1lbnR9KSk7Y29udGludWV9aWYodD09PShudWxsPT1hP3ZvaWQgMDphLm1vZGVsLiRtb2RlbFt0aGlzLmF0dHJpYnV0ZV0pKXtjLnB1c2goYSksYS5tb3ZlKG51bGwhPT0obz1udWxsPT1uP3ZvaWQgMDpuLmVsZW1lbnQpJiZ2b2lkIDAhPT1vP286dGhpcy5lbGVtZW50KTtjb250aW51ZX1jb25zdCBoPW51bGw9PWE/dm9pZCAwOmEubW9kZWwuJG1vZGVsW3RoaXMuYXR0cmlidXRlXTtpZighdS5zbGljZShlKS5pbmNsdWRlcyhoKSl7YS5kZXN0cm95KCksZS0tO2NvbnRpbnVlfXRoaXMudmlld3MudW5zaGlmdChhKTtsZXQgZD0hMTtmb3IobGV0IGU9MCxpPXRoaXMudmlld3MubGVuZ3RoO2U8aTtlKyspe2NvbnN0IGk9dGhpcy52aWV3c1tlXTtpZih0PT09KG51bGw9PWk/dm9pZCAwOmkubW9kZWwuJG1vZGVsW3RoaXMuYXR0cmlidXRlXSkpe2MucHVzaCguLi50aGlzLnZpZXdzLnNwbGljZShlLDEpKSxpLm1vdmUobnVsbCE9PShyPW51bGw9PW4/dm9pZCAwOm4uZWxlbWVudCkmJnZvaWQgMCE9PXI/cjp0aGlzLmVsZW1lbnQpLGQ9ITA7YnJlYWt9fWlmKCFkKXtjb25zdCBlPXskbW9kZWw6e1t0aGlzLmF0dHJpYnV0ZV06dH0sJHBhcmVudDp0aGlzLm9iamVjdH07Yy5wdXNoKGkuY3JlYXRlKHRoaXMuZWxlbWVudC5wYXJlbnRFbGVtZW50LHRoaXMudGVtcGxhdGUuY2xvbmVOb2RlKCEwKSxlLHtwYXJlbnQ6dGhpcyxwcmVwYXJlOiExLHNpYmxpbmc6bnVsbCE9PShsPW51bGw9PW4/dm9pZCAwOm4uZWxlbWVudCkmJnZvaWQgMCE9PWw/bDp0aGlzLmVsZW1lbnR9KSl9fXRoaXMudmlld3MuZm9yRWFjaCgoZT0+ZS5kZXN0cm95KCkpKSx0aGlzLnZpZXdzPWMsdGhpcy5sYXN0VmFsdWU9Wy4uLmFdLHRoaXMubGFzdFVJVmFsdWU9Wy4uLnVdfWVsc2UgaWYoYSE9PXRoaXMubGFzdFZhbHVlKXtjb25zdCBlPSEwIT09dGhpcy50b1VJP3RoaXMudG9VSShhLHRoaXMubGFzdFZhbHVlLHRoaXMucHJvcGVydHksdGhpcy5vYmplY3QpOmE7aWYodm9pZCAwIT09ZSYmZSE9PXRoaXMubGFzdFVJVmFsdWUpe2NvbnN0e3RhcmdldDp0LHByb3BlcnR5Oml9PW4ucmVzb2x2ZVByb3BlcnR5KHRoaXMuZWxlbWVudCx0aGlzLmF0dHJpYnV0ZSk7dFtpXT1lLHRoaXMubGFzdFZhbHVlPWEsdGhpcy5sYXN0VUlWYWx1ZT1lfX10aGlzLnZpZXdzLmZvckVhY2goKGU9PmUudXBkYXRlVG9VSSgpKSksdGhpcy5vbmVUaW1lJiZ0aGlzLm9uZVRpbWVEb25lKCl9b25lVGltZURvbmUoKXt0aGlzLnRvVUk9ITEsdGhpcy5mcm9tVUk9ITF9dXBkYXRlQXRFdmVudHMoKXtsZXQgZT10aGlzLmV2ZW50cy5zaGlmdCgpO2Zvcig7bnVsbCE9ZTspbi5yZXNvbHZlVmFsdWUodGhpcy5vYmplY3QsdGhpcy5wcm9wZXJ0eSkoZSx0aGlzLm9iamVjdC4kbW9kZWwsdGhpcy5lbGVtZW50LHRoaXMuYXR0cmlidXRlLHRoaXMub2JqZWN0KSxlPXRoaXMuZXZlbnRzLnNoaWZ0KCk7dGhpcy52aWV3cy5mb3JFYWNoKChlPT5lLnVwZGF0ZUF0RXZlbnRzKCkpKX11cGRhdGVNb3ZlKCl7dGhpcy52aWV3cy5mb3JFYWNoKChlPT5lLnVwZGF0ZU1vdmUoKSkpfX1jbGFzcyBue3N0YXRpYyBjcmVhdGUoZSx0LHM9e30sbz17cGFyZW50Om51bGwscHJlcGFyZTohMCxzaWJsaW5nOm51bGx9KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdCl7Y29uc3QgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2UuaW5uZXJIVE1MPW8ucHJlcGFyZT9uLnByZXBhcmUodCk6dCx0PWUuZmlyc3RFbGVtZW50Q2hpbGR9Y29uc3Qgcj1pLmNyZWF0ZShlLHQscyxvKTtyZXR1cm4gci5wYXJlbnQ9PT1uJiZuLnZpZXdzLnB1c2gocikscn1zdGF0aWMgcGxheShlLHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBlPyhlPXRoaXMuZ2xvYmFscy5hbmltYXRpb25zLmZpbmQoKHQ9PnQubmFtZT09PWUpKS5jbG9uZSgpKS5wbGF5KHQpOmUucGxheSgpfXN0YXRpYyBwYXJzZShlLHQsaT1udWxsKXt2YXIgcyxvLHI7Y29uc3QgbD1bXTtpZigzPT09ZS5ub2RlVHlwZSl7bGV0IHM9ZS50ZXh0Q29udGVudCxvPXMubWF0Y2gobi5yZWdleFZhbHVlKTtmb3IoO251bGwhPW87KXtjb25zdCByPW9bMV07bGV0IGE9b1syXTtzPW9bM107bGV0IGg9ITE7YS5zdGFydHNXaXRoKFwifFwiKSYmKGg9ITAsYT1hLnNsaWNlKDEpLnRyaW1TdGFydCgpKTtsZXQgdT1lLmNsb25lTm9kZSgpO2UudGV4dENvbnRlbnQ9cixlLnBhcmVudEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHUsZS5uZXh0U2libGluZyksbC5wdXNoKG4uYmluZCh7c2VsZWN0b3I6dSxhdHRyaWJ1dGU6XCJ0ZXh0Q29udGVudFwiLG9iamVjdDp0LHByb3BlcnR5OmEscGFyZW50Omksb25lVGltZTpofSkpLHU9KGU9dSkuY2xvbmVOb2RlKCksdS50ZXh0Q29udGVudD1zLGUucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodSxlLm5leHRTaWJsaW5nKSxlPXUsbz1zLm1hdGNoKG4ucmVnZXhWYWx1ZSl9fWVsc2V7aWYobC5wdXNoKC4uLk9iamVjdC5rZXlzKG51bGwhPT0ocz1lLmF0dHJpYnV0ZXMpJiZ2b2lkIDAhPT1zP3M6W10pLnJldmVyc2UoKS5tYXAoKHM9Pntjb25zdCBvPVtdO2lmKGUgaW5zdGFuY2VvZiBDb21tZW50KXJldHVybltdO2NvbnN0IHI9ZS5hdHRyaWJ1dGVzW3NdO2lmKHIubmFtZS5zdGFydHNXaXRoKFwicHVpLlwiKSl7Y29uc3Qgcz1yLnZhbHVlLm1hdGNoKG4ucmVnZXhBdHRyaWJ1dGUpO2xldCBvLGwsW2EsaCx1LGQscF09cyxjPSExO2lmKFwiQFwiIT09dSl7Y29uc3QgaT1oLm1hdGNoKC9eJyguKj8pJyQvKTtpZihudWxsIT1pKW89aVsxXSxlLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsbyksaD1cIm9wdGlvblwiPT09ZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpP1wic2VsZWN0ZWRcIjpcImNoZWNrZWRcIixkPWU9PmU/bzp2b2lkIDAsdT1lPT5lPT09bztlbHNlIGlmKFwiXCI9PT1oKXtpZihcIj5cIj09PWQpe2NvbnN0e3RhcmdldDppLHByb3BlcnR5OnN9PW4ucmVzb2x2ZVByb3BlcnR5KHQscCk7cmV0dXJuIGlbc109ZSxbXX17Y29uc3QgdD1kb2N1bWVudC5jcmVhdGVDb21tZW50KHIubmFtZSk7ZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0LGUpLGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlKSxlLnJlbW92ZUF0dHJpYnV0ZShyLm5hbWUpLGw9ZSxlPXQsaD1cIj1cIj09PXUsdT0hMCxcInxcIj09PWQmJihjPSEwKX19ZWxzZSBpZihcIipcIj09PWQpe2NvbnN0IHQ9ZG9jdW1lbnQuY3JlYXRlQ29tbWVudChyLm5hbWUpO2UucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodCxlKSxlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZSksZS5yZW1vdmVBdHRyaWJ1dGUoci5uYW1lKSxsPWUsZT10fWVsc2VcInxcIj09PWQ/Yz0hMDpcImNoZWNrZWRcIiE9PWgmJmUuc2V0QXR0cmlidXRlKGgsXCJcIil9cmV0dXJuW24uYmluZCh7c2VsZWN0b3I6ZSxhdHRyaWJ1dGU6aCx2YWx1ZTpvLG9iamVjdDp0LHByb3BlcnR5OnAsdGVtcGxhdGU6bCx0b1VJOlwic3RyaW5nXCI9PXR5cGVvZiB1P1wiPFwiPT09dTp1LGZyb21VSTpcInN0cmluZ1wiPT10eXBlb2YgZD9cIj5cIj09PWQ6ZCxhdEV2ZW50OlwiQFwiPT09dSxwYXJlbnQ6aSxvbmVUaW1lOmN9KV19Y29uc3QgbD1bci52YWx1ZV07bGV0IGE9MCxoPWxbYV0ubWF0Y2gobi5yZWdleFZhbHVlKTtmb3IoO251bGwhPWg7KXtsZXR7YmVmb3JlOnMscHJvcGVydHk6dSxhZnRlcjpkfT1oLmdyb3VwcyxwPSExO3Uuc3RhcnRzV2l0aChcInxcIikmJihwPSEwLHU9dS5zbGljZSgxKS50cmltU3RhcnQoKSksby5wdXNoKG4uYmluZCh7c2VsZWN0b3I6ZSxhdHRyaWJ1dGU6ci5uYW1lLG9iamVjdDp0LHByb3BlcnR5OnUsb25lVGltZTpwLHRvVUkodCxpLHMsbyl7aWYodGhpcy5vbmVUaW1lKXtjb25zdCBlPWwuaW5kZXhPZihzKTtlPi0xJiYobFtlXT1uLnJlc29sdmVWYWx1ZShvLHMpLGxbZS0xXSs9bFtlXStsW2UrMV0sbC5zcGxpY2UoZSwyKSl9Y29uc3QgYT1sLm1hcCgoKGUsdCk9PnQlMj09MD9lOm4ucmVzb2x2ZVZhbHVlKG8sZSkpKS5qb2luKFwiXCIpO2Uuc2V0QXR0cmlidXRlKHIubmFtZSxhKX0scGFyZW50Oml9KSksbFthKytdPXMsbFthKytdPXUsbFthXT1kLGg9bFthXS5tYXRjaChuLnJlZ2V4VmFsdWUpfXJldHVybiBvfSkpLmZsYXQoKSksZSBpbnN0YW5jZW9mIENvbW1lbnQpcmV0dXJuIGwuZmlsdGVyKChlPT5udWxsIT1lLnRlbXBsYXRlfHwoZS51bmJpbmQoKSwhMSkpKTtpZighbi5sZWF2ZUF0dHJpYnV0ZXMpZm9yKGxldCB0PU9iamVjdC5rZXlzKG51bGwhPT0obz1lLmF0dHJpYnV0ZXMpJiZ2b2lkIDAhPT1vP286W10pLmxlbmd0aC0xO3Q+PTA7dC0tKXtjb25zdCBpPWUuYXR0cmlidXRlc1tPYmplY3Qua2V5cyhudWxsIT09KHI9ZS5hdHRyaWJ1dGVzKSYmdm9pZCAwIT09cj9yOltdKVt0XV07aS5uYW1lLnN0YXJ0c1dpdGgoXCJwdWkuXCIpJiZlLnJlbW92ZUF0dHJpYnV0ZShpLm5hbWUpfWwucHVzaCguLi5BcnJheS5mcm9tKGUuY2hpbGROb2RlcykubWFwKChlPT5uLnBhcnNlKGUsdCxpKSkpLmZsYXQoKSl9cmV0dXJuIGx9c3RhdGljIGJpbmQoZSl7cmV0dXJuIHMuY3JlYXRlKGUpfXN0YXRpYyB1bmJpbmQoZSl7aWYoZS5kZXN0cm95KCksZS5wYXJlbnQhPT1uKXtjb25zdCB0PWUucGFyZW50LmJpbmRpbmdzLGk9dC5pbmRleE9mKGUpO2k+LTEmJnQuc3BsaWNlKGksMSl9fXN0YXRpYyB1cGRhdGUoKXt0aGlzLnZpZXdzLmZvckVhY2goKGU9PmUudXBkYXRlRnJvbVVJKCkpKSx0aGlzLnZpZXdzLmZvckVhY2goKGU9PmUudXBkYXRlVG9VSSgpKSksdGhpcy52aWV3cy5mb3JFYWNoKChlPT5lLnVwZGF0ZUF0RXZlbnRzKCkpKTtjb25zdCBlPXBlcmZvcm1hbmNlLm5vdygpO1suLi50aGlzLnZpZXdzLHRoaXMuZ2xvYmFsc10uZm9yRWFjaCgodD0+dC51cGRhdGVBbmltYXRpb25zKGUpKSksdGhpcy52aWV3cy5mb3JFYWNoKChlPT57ZS51cGRhdGVNb3ZlKCl9KSksdGhpcy5kZXN0cm95ZWQuZm9yRWFjaCgoZT0+e3N3aXRjaChlLmRlc3Ryb3llZCl7Y2FzZVwicXVldWVcIjplLmRlc3Ryb3llZD1cImRlc3Ryb3lcIjticmVhaztjYXNlXCJkZXN0cm95XCI6e2UudGVybWluYXRlKCk7Y29uc3QgdD10aGlzLmRlc3Ryb3llZC5maW5kSW5kZXgoKHQ9PmU9PT10KSk7dD4tMSYmdGhpcy5kZXN0cm95ZWQuc3BsaWNlKHQsMSl9fX0pKX1zdGF0aWMgcmVzb2x2ZVByb3BlcnR5KGUsdCl7Y29uc3QgaT0odD10LnJlcGxhY2UoXCJbXCIsXCIuXCIpLnJlcGxhY2UoXCJdXCIsXCIuXCIpKS5zcGxpdChcIi5cIikuZmlsdGVyKChlPT4obnVsbCE9ZT9lOlwiXCIpLmxlbmd0aD4wKSk7bGV0IHM9XCIkbW9kZWxcImluIGU/ZS4kbW9kZWw6ZTtmb3IoO2kubGVuZ3RoPjE7KXM9c1tpLnNoaWZ0KCldO3JldHVybnt0YXJnZXQ6cyxwcm9wZXJ0eTppWzBdfX1zdGF0aWMgcmVzb2x2ZVZhbHVlKGUsdCl7bGV0IGk9MDtkb3tjb25zdHt0YXJnZXQ6aSxwcm9wZXJ0eTpzfT1uLnJlc29sdmVQcm9wZXJ0eShlLHQpO2lmKHMgaW4gaSlyZXR1cm4gaVtzXTtlPWUuJHBhcmVudH13aGlsZShudWxsIT1lJiZpKys8MWUzKX1zdGF0aWMgcHJlcGFyZShlKXtsZXQgdD1lO2U9XCJcIjtsZXQgaT10Lm1hdGNoKG4ucmVnZXhSZXBsYWNlKTtmb3IoO251bGwhPWk7KXtjb25zdFtzLG8scixsXT1pO2UrPWAke299IFBVSS4ke24uYmluZGluZ0NvdW50ZXIrK309XCIke3J9XCIgYCx0PWwsaT10Lm1hdGNoKG4ucmVnZXhSZXBsYWNlKX1yZXR1cm4gZSt0fX1uLmlkPTAsbi52aWV3cz1bXSxuLmRlc3Ryb3llZD1bXSxuLmdsb2JhbHM9bmV3IGksbi5sZWF2ZUF0dHJpYnV0ZXM9ITEsbi5yZWdleFJlcGxhY2U9LyhbXFxTXFxzXSo/KVxcJFxceyhbXn1dKj9bPD1AIV09Wyo9PnxdW159XSo/KVxcfShbXFxTXFxzXSopL20sbi5yZWdleEF0dHJpYnV0ZT0vXlxccyooXFxTKj8pXFxzKihbPD1AIV0pPShbKj0+fF0pXFxzKihcXFMqPylcXHMqJC8sbi5yZWdleFZhbHVlPS8oPzxiZWZvcmU+W1xcU1xcc10qPylcXCRcXHtcXHMqKD88cHJvcGVydHk+W1xcc1xcU10qPylcXHMqXFx9KD88YWZ0ZXI+W1xcU1xcc10qKS9tLG4uYmluZGluZ0NvdW50ZXI9MDt2YXIgbz1leHBvcnRzO2Zvcih2YXIgciBpbiB0KW9bcl09dFtyXTt0Ll9fZXNNb2R1bGUmJk9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pfSkoKTsiLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5cbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cblxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcblxuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdXBkYXRlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cblxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcblxuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cblxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG5cbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuXG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cblxuICBjc3MgKz0gb2JqLmNzcztcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH0gLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuaW1wb3J0ICogYXMgVCBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgY29uc3QgQ09PUkRJTkFUT1JfSE9TVCA9IHByb2Nlc3MuZW52LkNPT1JESU5BVE9SX0hPU1QhO1xuZXhwb3J0IGNvbnN0IE1BVENITUFLRVJfSE9TVCA9IHByb2Nlc3MuZW52Lk1BVENITUFLRVJfSE9TVCE7XG5cbmV4cG9ydCBjb25zdCBOT19ESUZGID0gU3ltYm9sKFwiTk9ESUZGXCIpO1xuZXhwb3J0IHR5cGUgRGVlcFBhcnRpYWw8VD4gPSBUIGV4dGVuZHMgc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IHVuZGVmaW5lZFxuICA/IFRcbiAgOiBUIGV4dGVuZHMgQXJyYXk8aW5mZXIgQXJyYXlUeXBlPlxuICA/IEFycmF5PERlZXBQYXJ0aWFsPEFycmF5VHlwZT4gfCB0eXBlb2YgTk9fRElGRj4gfCB0eXBlb2YgTk9fRElGRlxuICA6IFQgZXh0ZW5kcyB7IHR5cGU6IHN0cmluZzsgdmFsOiBhbnkgfVxuICA/IHsgdHlwZTogVFtcInR5cGVcIl07IHZhbDogRGVlcFBhcnRpYWw8VFtcInZhbFwiXSB8IHR5cGVvZiBOT19ESUZGPiB9XG4gIDogeyBbSyBpbiBrZXlvZiBUXTogRGVlcFBhcnRpYWw8VFtLXT4gfCB0eXBlb2YgTk9fRElGRiB9O1xuXG5leHBvcnQgZW51bSBNZXRob2Qge1xuICBVUERBVEVfUExBWUVSX1ZFTE9DSVRZLFxuICBTVEFSVF9ST1VORCxcbiAgSk9JTl9HQU1FLFxuICBTVEFSVF9HQU1FLFxufVxuXG5leHBvcnQgdHlwZSBPa1Jlc3BvbnNlID0geyB0eXBlOiBcIm9rXCIgfTtcbmV4cG9ydCB0eXBlIEVycm9yUmVzcG9uc2UgPSB7IHR5cGU6IFwiZXJyb3JcIjsgZXJyb3I6IHN0cmluZyB9O1xuZXhwb3J0IHR5cGUgUmVzcG9uc2UgPSBPa1Jlc3BvbnNlIHwgRXJyb3JSZXNwb25zZTtcbmV4cG9ydCBjb25zdCBSZXNwb25zZTogeyBvazogKCkgPT4gT2tSZXNwb25zZTsgZXJyb3I6IChlcnJvcjogc3RyaW5nKSA9PiBFcnJvclJlc3BvbnNlIH0gPSB7XG4gIG9rOiAoKSA9PiAoeyB0eXBlOiBcIm9rXCIgfSksXG4gIGVycm9yOiAoZXJyb3IpID0+ICh7IHR5cGU6IFwiZXJyb3JcIiwgZXJyb3IgfSksXG59O1xuXG5leHBvcnQgdHlwZSBSZXNwb25zZU1lc3NhZ2UgPSB7IHR5cGU6IFwicmVzcG9uc2VcIjsgbXNnSWQ6IG51bWJlcjsgcmVzcG9uc2U6IFJlc3BvbnNlIH07XG5leHBvcnQgdHlwZSBFdmVudE1lc3NhZ2UgPSB7IHR5cGU6IFwiZXZlbnRcIjsgZXZlbnQ6IHN0cmluZyB9O1xuZXhwb3J0IHR5cGUgTWVzc2FnZSA9IFJlc3BvbnNlTWVzc2FnZSB8IEV2ZW50TWVzc2FnZTtcbmV4cG9ydCBjb25zdCBNZXNzYWdlOiB7XG4gIHJlc3BvbnNlOiAobXNnSWQ6IG51bWJlciwgcmVzcG9uc2U6IFJlc3BvbnNlKSA9PiBSZXNwb25zZU1lc3NhZ2U7XG4gIGV2ZW50OiAoZXZlbnQ6IHN0cmluZykgPT4gRXZlbnRNZXNzYWdlO1xufSA9IHtcbiAgcmVzcG9uc2U6IChtc2dJZCwgcmVzcG9uc2UpID0+ICh7IHR5cGU6IFwicmVzcG9uc2VcIiwgbXNnSWQsIHJlc3BvbnNlIH0pLFxuICBldmVudDogKGV2ZW50KSA9PiAoeyB0eXBlOiBcImV2ZW50XCIsIGV2ZW50IH0pLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBBbm9ueW1vdXNVc2VyRGF0YSB7XG4gIHR5cGU6IFwiYW5vbnltb3VzXCI7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbn1cbmV4cG9ydCB0eXBlIFVzZXJEYXRhID0gQW5vbnltb3VzVXNlckRhdGE7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb29rdXBVc2VyKHVzZXJJZDogVC5Vc2VySWQpOiBQcm9taXNlPFVzZXJEYXRhPiB7XG4gIHJldHVybiBheGlvcy5nZXQ8VXNlckRhdGE+KGBodHRwczovLyR7Q09PUkRJTkFUT1JfSE9TVH0vdXNlcnMvJHt1c2VySWR9YCkudGhlbigocmVzKSA9PiByZXMuZGF0YSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VyRGlzcGxheU5hbWUodXNlcjogVXNlckRhdGEpIHtcbiAgc3dpdGNoICh1c2VyLnR5cGUpIHtcbiAgICBjYXNlIFwiYW5vbnltb3VzXCI6XG4gICAgICByZXR1cm4gdXNlci5uYW1lO1xuICB9XG59XG4iLCJpbXBvcnQgeyBXcml0ZXIgYXMgX1dyaXRlciwgUmVhZGVyIGFzIF9SZWFkZXIgfSBmcm9tIFwiYmluLXNlcmRlXCI7XG5pbXBvcnQge1xuICBOT19ESUZGIGFzIF9OT19ESUZGLFxuICBEZWVwUGFydGlhbCBhcyBfRGVlcFBhcnRpYWwsXG4gIFJlc3BvbnNlIGFzIF9SZXNwb25zZSxcbiAgTWVzc2FnZSBhcyBfTWVzc2FnZSxcbiAgUmVzcG9uc2VNZXNzYWdlIGFzIF9SZXNwb25zZU1lc3NhZ2UsXG4gIEV2ZW50TWVzc2FnZSBhcyBfRXZlbnRNZXNzYWdlLFxufSBmcm9tIFwiLi9iYXNlXCI7XG5cbmV4cG9ydCBlbnVtIEdhbWVTdGF0ZXMge1xuICBJZGxlLFxuICBQbGF5ZXJzSm9pbmluZyxcbiAgV2FpdGluZ1RvU3RhcnRHYW1lLFxuICBXYWl0aW5nVG9TdGFydFJvdW5kLFxuICBJblByb2dyZXNzLFxuICBHYW1lT3Zlcixcbn1cbmV4cG9ydCB0eXBlIFZlY3RvciA9IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG59O1xuZXhwb3J0IHR5cGUgQmFsbCA9IHtcbiAgcG9zaXRpb246IFZlY3RvcjtcbiAgdmVsb2NpdHk6IFZlY3RvcjtcbiAgcmFkaXVzOiBudW1iZXI7XG4gIGlzQ29sbGlkaW5nOiBib29sZWFuO1xufTtcbmV4cG9ydCB0eXBlIFBsYXllciA9IHtcbiAgaWQ6IFVzZXJJZDtcbiAgbGl2ZXM6IG51bWJlcjtcbiAgcG9zaXRpb246IFZlY3RvcjtcbiAgc2l6ZTogVmVjdG9yO1xuICB2ZWxvY2l0eTogVmVjdG9yO1xuICBpc0NvbGxpZGluZzogYm9vbGVhbjtcbn07XG5leHBvcnQgdHlwZSBTZXJ2ZXJTdGF0ZSA9IHtcbiAgUGxheWVyczogUGxheWVyW107XG4gIEJhbGxzOiBCYWxsW107XG4gIGdhbWVTdGF0ZTogR2FtZVN0YXRlcztcbn07XG5leHBvcnQgdHlwZSBQbGF5ZXJTdGF0ZSA9IHtcbiAgcGxheWVyMXBvc2l0aW9uOiBWZWN0b3I7XG4gIHBsYXllcjJwb3NpdGlvbjogVmVjdG9yO1xuICBiYWxscG9zaXRpb246IFZlY3RvcjtcbiAgcGxheWVyMUxpdmVzOiBudW1iZXI7XG4gIHBsYXllcjJMaXZlczogbnVtYmVyO1xufTtcbmV4cG9ydCB0eXBlIFVzZXJJZCA9IHN0cmluZztcbmV4cG9ydCB0eXBlIElVcGRhdGVQbGF5ZXJWZWxvY2l0eVJlcXVlc3QgPSB7XG4gIHZlbG9jaXR5OiBWZWN0b3I7XG59O1xuZXhwb3J0IHR5cGUgSVN0YXJ0Um91bmRSZXF1ZXN0ID0ge1xufTtcbmV4cG9ydCB0eXBlIElKb2luR2FtZVJlcXVlc3QgPSB7XG59O1xuZXhwb3J0IHR5cGUgSVN0YXJ0R2FtZVJlcXVlc3QgPSB7XG59O1xuZXhwb3J0IHR5cGUgSUluaXRpYWxpemVSZXF1ZXN0ID0ge1xufTtcblxuZXhwb3J0IGNvbnN0IFZlY3RvciA9IHtcbiAgZGVmYXVsdCgpOiBWZWN0b3Ige1xuICAgIHJldHVybiB7XG4gICAgICB4OiAwLjAsXG4gICAgICB5OiAwLjAsXG4gICAgfTtcbiAgfSxcbiAgdmFsaWRhdGUob2JqOiBWZWN0b3IpIHtcbiAgICBpZiAodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuICAgICAgcmV0dXJuIFtgSW52YWxpZCBWZWN0b3Igb2JqZWN0OiAke29ian1gXVxuICAgIH1cbiAgICBsZXQgdmFsaWRhdGlvbkVycm9yczogc3RyaW5nW107XG5cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gdmFsaWRhdGVQcmltaXRpdmUodHlwZW9mIG9iai54ID09PSBcIm51bWJlclwiLCBgSW52YWxpZCBmbG9hdDogJHsgb2JqLnggfWApO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQga2V5OiBWZWN0b3IueFwiKTtcbiAgICB9XG4gICAgdmFsaWRhdGlvbkVycm9ycyA9IHZhbGlkYXRlUHJpbWl0aXZlKHR5cGVvZiBvYmoueSA9PT0gXCJudW1iZXJcIiwgYEludmFsaWQgZmxvYXQ6ICR7IG9iai55IH1gKTtcbiAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycy5jb25jYXQoXCJJbnZhbGlkIGtleTogVmVjdG9yLnlcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnM7XG4gIH0sXG4gIGVuY29kZShvYmo6IFZlY3Rvciwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHdyaXRlRmxvYXQoYnVmLCBvYmoueCk7XG4gICAgd3JpdGVGbG9hdChidWYsIG9iai55KTtcbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBlbmNvZGVEaWZmKG9iajogX0RlZXBQYXJ0aWFsPFZlY3Rvcj4sIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBjb25zdCB0cmFja2VyOiBib29sZWFuW10gPSBbXTtcbiAgICB0cmFja2VyLnB1c2gob2JqLnggIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLnkgIT09IF9OT19ESUZGKTtcbiAgICBidWYud3JpdGVCaXRzKHRyYWNrZXIpO1xuICAgIGlmIChvYmoueCAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlRmxvYXQoYnVmLCBvYmoueCk7XG4gICAgfVxuICAgIGlmIChvYmoueSAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlRmxvYXQoYnVmLCBvYmoueSk7XG4gICAgfVxuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBWZWN0b3Ige1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgICB4OiBwYXJzZUZsb2F0KHNiKSxcbiAgICAgIHk6IHBhcnNlRmxvYXQoc2IpLFxuICAgIH07XG4gIH0sXG4gIGRlY29kZURpZmYoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogX0RlZXBQYXJ0aWFsPFZlY3Rvcj4ge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIGNvbnN0IHRyYWNrZXIgPSBzYi5yZWFkQml0cygyKTtcbiAgICByZXR1cm4ge1xuICAgICAgeDogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VGbG9hdChzYikgOiBfTk9fRElGRixcbiAgICAgIHk6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlRmxvYXQoc2IpIDogX05PX0RJRkYsXG4gICAgfTtcbiAgfSxcbn07XG5leHBvcnQgY29uc3QgQmFsbCA9IHtcbiAgZGVmYXVsdCgpOiBCYWxsIHtcbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246IFZlY3Rvci5kZWZhdWx0KCksXG4gICAgICB2ZWxvY2l0eTogVmVjdG9yLmRlZmF1bHQoKSxcbiAgICAgIHJhZGl1czogMCxcbiAgICAgIGlzQ29sbGlkaW5nOiBmYWxzZSxcbiAgICB9O1xuICB9LFxuICB2YWxpZGF0ZShvYmo6IEJhbGwpIHtcbiAgICBpZiAodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuICAgICAgcmV0dXJuIFtgSW52YWxpZCBCYWxsIG9iamVjdDogJHtvYmp9YF1cbiAgICB9XG4gICAgbGV0IHZhbGlkYXRpb25FcnJvcnM6IHN0cmluZ1tdO1xuXG4gICAgdmFsaWRhdGlvbkVycm9ycyA9IFZlY3Rvci52YWxpZGF0ZShvYmoucG9zaXRpb24pO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQga2V5OiBCYWxsLnBvc2l0aW9uXCIpO1xuICAgIH1cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gVmVjdG9yLnZhbGlkYXRlKG9iai52ZWxvY2l0eSk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IEJhbGwudmVsb2NpdHlcIik7XG4gICAgfVxuICAgIHZhbGlkYXRpb25FcnJvcnMgPSB2YWxpZGF0ZVByaW1pdGl2ZShOdW1iZXIuaXNJbnRlZ2VyKG9iai5yYWRpdXMpLCBgSW52YWxpZCBpbnQ6ICR7IG9iai5yYWRpdXMgfWApO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQga2V5OiBCYWxsLnJhZGl1c1wiKTtcbiAgICB9XG4gICAgdmFsaWRhdGlvbkVycm9ycyA9IHZhbGlkYXRlUHJpbWl0aXZlKHR5cGVvZiBvYmouaXNDb2xsaWRpbmcgPT09IFwiYm9vbGVhblwiLCBgSW52YWxpZCBib29sZWFuOiAkeyBvYmouaXNDb2xsaWRpbmcgfWApO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQga2V5OiBCYWxsLmlzQ29sbGlkaW5nXCIpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzO1xuICB9LFxuICBlbmNvZGUob2JqOiBCYWxsLCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgVmVjdG9yLmVuY29kZShvYmoucG9zaXRpb24sIGJ1Zik7XG4gICAgVmVjdG9yLmVuY29kZShvYmoudmVsb2NpdHksIGJ1Zik7XG4gICAgd3JpdGVJbnQoYnVmLCBvYmoucmFkaXVzKTtcbiAgICB3cml0ZUJvb2xlYW4oYnVmLCBvYmouaXNDb2xsaWRpbmcpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGVuY29kZURpZmYob2JqOiBfRGVlcFBhcnRpYWw8QmFsbD4sIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBjb25zdCB0cmFja2VyOiBib29sZWFuW10gPSBbXTtcbiAgICB0cmFja2VyLnB1c2gob2JqLnBvc2l0aW9uICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai52ZWxvY2l0eSAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmoucmFkaXVzICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5pc0NvbGxpZGluZyAhPT0gX05PX0RJRkYpO1xuICAgIGJ1Zi53cml0ZUJpdHModHJhY2tlcik7XG4gICAgaWYgKG9iai5wb3NpdGlvbiAhPT0gX05PX0RJRkYpIHtcbiAgICAgIFZlY3Rvci5lbmNvZGVEaWZmKG9iai5wb3NpdGlvbiwgYnVmKTtcbiAgICB9XG4gICAgaWYgKG9iai52ZWxvY2l0eSAhPT0gX05PX0RJRkYpIHtcbiAgICAgIFZlY3Rvci5lbmNvZGVEaWZmKG9iai52ZWxvY2l0eSwgYnVmKTtcbiAgICB9XG4gICAgaWYgKG9iai5yYWRpdXMgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUludChidWYsIG9iai5yYWRpdXMpO1xuICAgIH1cbiAgICBpZiAob2JqLmlzQ29sbGlkaW5nICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVCb29sZWFuKGJ1Ziwgb2JqLmlzQ29sbGlkaW5nKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IEJhbGwge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogVmVjdG9yLmRlY29kZShzYiksXG4gICAgICB2ZWxvY2l0eTogVmVjdG9yLmRlY29kZShzYiksXG4gICAgICByYWRpdXM6IHBhcnNlSW50KHNiKSxcbiAgICAgIGlzQ29sbGlkaW5nOiBwYXJzZUJvb2xlYW4oc2IpLFxuICAgIH07XG4gIH0sXG4gIGRlY29kZURpZmYoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogX0RlZXBQYXJ0aWFsPEJhbGw+IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICBjb25zdCB0cmFja2VyID0gc2IucmVhZEJpdHMoNCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiB0cmFja2VyLnNoaWZ0KCkgPyBWZWN0b3IuZGVjb2RlRGlmZihzYikgOiBfTk9fRElGRixcbiAgICAgIHZlbG9jaXR5OiB0cmFja2VyLnNoaWZ0KCkgPyBWZWN0b3IuZGVjb2RlRGlmZihzYikgOiBfTk9fRElGRixcbiAgICAgIHJhZGl1czogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VJbnQoc2IpIDogX05PX0RJRkYsXG4gICAgICBpc0NvbGxpZGluZzogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VCb29sZWFuKHNiKSA6IF9OT19ESUZGLFxuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IFBsYXllciA9IHtcbiAgZGVmYXVsdCgpOiBQbGF5ZXIge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogXCJcIixcbiAgICAgIGxpdmVzOiAwLFxuICAgICAgcG9zaXRpb246IFZlY3Rvci5kZWZhdWx0KCksXG4gICAgICBzaXplOiBWZWN0b3IuZGVmYXVsdCgpLFxuICAgICAgdmVsb2NpdHk6IFZlY3Rvci5kZWZhdWx0KCksXG4gICAgICBpc0NvbGxpZGluZzogZmFsc2UsXG4gICAgfTtcbiAgfSxcbiAgdmFsaWRhdGUob2JqOiBQbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuICAgICAgcmV0dXJuIFtgSW52YWxpZCBQbGF5ZXIgb2JqZWN0OiAke29ian1gXVxuICAgIH1cbiAgICBsZXQgdmFsaWRhdGlvbkVycm9yczogc3RyaW5nW107XG5cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gdmFsaWRhdGVQcmltaXRpdmUodHlwZW9mIG9iai5pZCA9PT0gXCJzdHJpbmdcIiwgYEludmFsaWQgVXNlcklkOiAkeyBvYmouaWQgfWApO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQga2V5OiBQbGF5ZXIuaWRcIik7XG4gICAgfVxuICAgIHZhbGlkYXRpb25FcnJvcnMgPSB2YWxpZGF0ZVByaW1pdGl2ZShOdW1iZXIuaXNJbnRlZ2VyKG9iai5saXZlcyksIGBJbnZhbGlkIGludDogJHsgb2JqLmxpdmVzIH1gKTtcbiAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycy5jb25jYXQoXCJJbnZhbGlkIGtleTogUGxheWVyLmxpdmVzXCIpO1xuICAgIH1cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gVmVjdG9yLnZhbGlkYXRlKG9iai5wb3NpdGlvbik7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IFBsYXllci5wb3NpdGlvblwiKTtcbiAgICB9XG4gICAgdmFsaWRhdGlvbkVycm9ycyA9IFZlY3Rvci52YWxpZGF0ZShvYmouc2l6ZSk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IFBsYXllci5zaXplXCIpO1xuICAgIH1cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gVmVjdG9yLnZhbGlkYXRlKG9iai52ZWxvY2l0eSk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IFBsYXllci52ZWxvY2l0eVwiKTtcbiAgICB9XG4gICAgdmFsaWRhdGlvbkVycm9ycyA9IHZhbGlkYXRlUHJpbWl0aXZlKHR5cGVvZiBvYmouaXNDb2xsaWRpbmcgPT09IFwiYm9vbGVhblwiLCBgSW52YWxpZCBib29sZWFuOiAkeyBvYmouaXNDb2xsaWRpbmcgfWApO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQga2V5OiBQbGF5ZXIuaXNDb2xsaWRpbmdcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnM7XG4gIH0sXG4gIGVuY29kZShvYmo6IFBsYXllciwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHdyaXRlU3RyaW5nKGJ1Ziwgb2JqLmlkKTtcbiAgICB3cml0ZUludChidWYsIG9iai5saXZlcyk7XG4gICAgVmVjdG9yLmVuY29kZShvYmoucG9zaXRpb24sIGJ1Zik7XG4gICAgVmVjdG9yLmVuY29kZShvYmouc2l6ZSwgYnVmKTtcbiAgICBWZWN0b3IuZW5jb2RlKG9iai52ZWxvY2l0eSwgYnVmKTtcbiAgICB3cml0ZUJvb2xlYW4oYnVmLCBvYmouaXNDb2xsaWRpbmcpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGVuY29kZURpZmYob2JqOiBfRGVlcFBhcnRpYWw8UGxheWVyPiwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIGNvbnN0IHRyYWNrZXI6IGJvb2xlYW5bXSA9IFtdO1xuICAgIHRyYWNrZXIucHVzaChvYmouaWQgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLmxpdmVzICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5wb3NpdGlvbiAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouc2l6ZSAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmoudmVsb2NpdHkgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLmlzQ29sbGlkaW5nICE9PSBfTk9fRElGRik7XG4gICAgYnVmLndyaXRlQml0cyh0cmFja2VyKTtcbiAgICBpZiAob2JqLmlkICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVTdHJpbmcoYnVmLCBvYmouaWQpO1xuICAgIH1cbiAgICBpZiAob2JqLmxpdmVzICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVJbnQoYnVmLCBvYmoubGl2ZXMpO1xuICAgIH1cbiAgICBpZiAob2JqLnBvc2l0aW9uICE9PSBfTk9fRElGRikge1xuICAgICAgVmVjdG9yLmVuY29kZURpZmYob2JqLnBvc2l0aW9uLCBidWYpO1xuICAgIH1cbiAgICBpZiAob2JqLnNpemUgIT09IF9OT19ESUZGKSB7XG4gICAgICBWZWN0b3IuZW5jb2RlRGlmZihvYmouc2l6ZSwgYnVmKTtcbiAgICB9XG4gICAgaWYgKG9iai52ZWxvY2l0eSAhPT0gX05PX0RJRkYpIHtcbiAgICAgIFZlY3Rvci5lbmNvZGVEaWZmKG9iai52ZWxvY2l0eSwgYnVmKTtcbiAgICB9XG4gICAgaWYgKG9iai5pc0NvbGxpZGluZyAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlQm9vbGVhbihidWYsIG9iai5pc0NvbGxpZGluZyk7XG4gICAgfVxuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBQbGF5ZXIge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgICBpZDogcGFyc2VTdHJpbmcoc2IpLFxuICAgICAgbGl2ZXM6IHBhcnNlSW50KHNiKSxcbiAgICAgIHBvc2l0aW9uOiBWZWN0b3IuZGVjb2RlKHNiKSxcbiAgICAgIHNpemU6IFZlY3Rvci5kZWNvZGUoc2IpLFxuICAgICAgdmVsb2NpdHk6IFZlY3Rvci5kZWNvZGUoc2IpLFxuICAgICAgaXNDb2xsaWRpbmc6IHBhcnNlQm9vbGVhbihzYiksXG4gICAgfTtcbiAgfSxcbiAgZGVjb2RlRGlmZihidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBfRGVlcFBhcnRpYWw8UGxheWVyPiB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgY29uc3QgdHJhY2tlciA9IHNiLnJlYWRCaXRzKDYpO1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VTdHJpbmcoc2IpIDogX05PX0RJRkYsXG4gICAgICBsaXZlczogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VJbnQoc2IpIDogX05PX0RJRkYsXG4gICAgICBwb3NpdGlvbjogdHJhY2tlci5zaGlmdCgpID8gVmVjdG9yLmRlY29kZURpZmYoc2IpIDogX05PX0RJRkYsXG4gICAgICBzaXplOiB0cmFja2VyLnNoaWZ0KCkgPyBWZWN0b3IuZGVjb2RlRGlmZihzYikgOiBfTk9fRElGRixcbiAgICAgIHZlbG9jaXR5OiB0cmFja2VyLnNoaWZ0KCkgPyBWZWN0b3IuZGVjb2RlRGlmZihzYikgOiBfTk9fRElGRixcbiAgICAgIGlzQ29sbGlkaW5nOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUJvb2xlYW4oc2IpIDogX05PX0RJRkYsXG4gICAgfTtcbiAgfSxcbn07XG5leHBvcnQgY29uc3QgU2VydmVyU3RhdGUgPSB7XG4gIGRlZmF1bHQoKTogU2VydmVyU3RhdGUge1xuICAgIHJldHVybiB7XG4gICAgICBQbGF5ZXJzOiBbXSxcbiAgICAgIEJhbGxzOiBbXSxcbiAgICAgIGdhbWVTdGF0ZTogMCxcbiAgICB9O1xuICB9LFxuICB2YWxpZGF0ZShvYmo6IFNlcnZlclN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIpIHtcbiAgICAgIHJldHVybiBbYEludmFsaWQgU2VydmVyU3RhdGUgb2JqZWN0OiAke29ian1gXVxuICAgIH1cbiAgICBsZXQgdmFsaWRhdGlvbkVycm9yczogc3RyaW5nW107XG5cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gdmFsaWRhdGVBcnJheShvYmouUGxheWVycywgKHgpID0+IFBsYXllci52YWxpZGF0ZSh4KSk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IFNlcnZlclN0YXRlLlBsYXllcnNcIik7XG4gICAgfVxuICAgIHZhbGlkYXRpb25FcnJvcnMgPSB2YWxpZGF0ZUFycmF5KG9iai5CYWxscywgKHgpID0+IEJhbGwudmFsaWRhdGUoeCkpO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQga2V5OiBTZXJ2ZXJTdGF0ZS5CYWxsc1wiKTtcbiAgICB9XG4gICAgdmFsaWRhdGlvbkVycm9ycyA9IHZhbGlkYXRlUHJpbWl0aXZlKG9iai5nYW1lU3RhdGUgaW4gR2FtZVN0YXRlcywgYEludmFsaWQgR2FtZVN0YXRlczogJHsgb2JqLmdhbWVTdGF0ZSB9YCk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IFNlcnZlclN0YXRlLmdhbWVTdGF0ZVwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycztcbiAgfSxcbiAgZW5jb2RlKG9iajogU2VydmVyU3RhdGUsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICB3cml0ZUFycmF5KGJ1Ziwgb2JqLlBsYXllcnMsICh4KSA9PiBQbGF5ZXIuZW5jb2RlKHgsIGJ1ZikpO1xuICAgIHdyaXRlQXJyYXkoYnVmLCBvYmouQmFsbHMsICh4KSA9PiBCYWxsLmVuY29kZSh4LCBidWYpKTtcbiAgICB3cml0ZVVJbnQ4KGJ1Ziwgb2JqLmdhbWVTdGF0ZSk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZW5jb2RlRGlmZihvYmo6IF9EZWVwUGFydGlhbDxTZXJ2ZXJTdGF0ZT4sIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBjb25zdCB0cmFja2VyOiBib29sZWFuW10gPSBbXTtcbiAgICB0cmFja2VyLnB1c2gob2JqLlBsYXllcnMgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLkJhbGxzICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5nYW1lU3RhdGUgIT09IF9OT19ESUZGKTtcbiAgICBidWYud3JpdGVCaXRzKHRyYWNrZXIpO1xuICAgIGlmIChvYmouUGxheWVycyAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlQXJyYXlEaWZmKGJ1Ziwgb2JqLlBsYXllcnMsICh4KSA9PiBQbGF5ZXIuZW5jb2RlRGlmZih4LCBidWYpKTtcbiAgICB9XG4gICAgaWYgKG9iai5CYWxscyAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlQXJyYXlEaWZmKGJ1Ziwgb2JqLkJhbGxzLCAoeCkgPT4gQmFsbC5lbmNvZGVEaWZmKHgsIGJ1ZikpO1xuICAgIH1cbiAgICBpZiAob2JqLmdhbWVTdGF0ZSAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlVUludDgoYnVmLCBvYmouZ2FtZVN0YXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IFNlcnZlclN0YXRlIHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgICAgUGxheWVyczogcGFyc2VBcnJheShzYiwgKCkgPT4gUGxheWVyLmRlY29kZShzYikpLFxuICAgICAgQmFsbHM6IHBhcnNlQXJyYXkoc2IsICgpID0+IEJhbGwuZGVjb2RlKHNiKSksXG4gICAgICBnYW1lU3RhdGU6IHBhcnNlVUludDgoc2IpLFxuICAgIH07XG4gIH0sXG4gIGRlY29kZURpZmYoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogX0RlZXBQYXJ0aWFsPFNlcnZlclN0YXRlPiB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgY29uc3QgdHJhY2tlciA9IHNiLnJlYWRCaXRzKDMpO1xuICAgIHJldHVybiB7XG4gICAgICBQbGF5ZXJzOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUFycmF5RGlmZihzYiwgKCkgPT4gUGxheWVyLmRlY29kZURpZmYoc2IpKSA6IF9OT19ESUZGLFxuICAgICAgQmFsbHM6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlQXJyYXlEaWZmKHNiLCAoKSA9PiBCYWxsLmRlY29kZURpZmYoc2IpKSA6IF9OT19ESUZGLFxuICAgICAgZ2FtZVN0YXRlOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZVVJbnQ4KHNiKSA6IF9OT19ESUZGLFxuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IFBsYXllclN0YXRlID0ge1xuICBkZWZhdWx0KCk6IFBsYXllclN0YXRlIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGxheWVyMXBvc2l0aW9uOiBWZWN0b3IuZGVmYXVsdCgpLFxuICAgICAgcGxheWVyMnBvc2l0aW9uOiBWZWN0b3IuZGVmYXVsdCgpLFxuICAgICAgYmFsbHBvc2l0aW9uOiBWZWN0b3IuZGVmYXVsdCgpLFxuICAgICAgcGxheWVyMUxpdmVzOiAwLFxuICAgICAgcGxheWVyMkxpdmVzOiAwLFxuICAgIH07XG4gIH0sXG4gIHZhbGlkYXRlKG9iajogUGxheWVyU3RhdGUpIHtcbiAgICBpZiAodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuICAgICAgcmV0dXJuIFtgSW52YWxpZCBQbGF5ZXJTdGF0ZSBvYmplY3Q6ICR7b2JqfWBdXG4gICAgfVxuICAgIGxldCB2YWxpZGF0aW9uRXJyb3JzOiBzdHJpbmdbXTtcblxuICAgIHZhbGlkYXRpb25FcnJvcnMgPSBWZWN0b3IudmFsaWRhdGUob2JqLnBsYXllcjFwb3NpdGlvbik7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IFBsYXllclN0YXRlLnBsYXllcjFwb3NpdGlvblwiKTtcbiAgICB9XG4gICAgdmFsaWRhdGlvbkVycm9ycyA9IFZlY3Rvci52YWxpZGF0ZShvYmoucGxheWVyMnBvc2l0aW9uKTtcbiAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycy5jb25jYXQoXCJJbnZhbGlkIGtleTogUGxheWVyU3RhdGUucGxheWVyMnBvc2l0aW9uXCIpO1xuICAgIH1cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gVmVjdG9yLnZhbGlkYXRlKG9iai5iYWxscG9zaXRpb24pO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQga2V5OiBQbGF5ZXJTdGF0ZS5iYWxscG9zaXRpb25cIik7XG4gICAgfVxuICAgIHZhbGlkYXRpb25FcnJvcnMgPSB2YWxpZGF0ZVByaW1pdGl2ZShOdW1iZXIuaXNJbnRlZ2VyKG9iai5wbGF5ZXIxTGl2ZXMpLCBgSW52YWxpZCBpbnQ6ICR7IG9iai5wbGF5ZXIxTGl2ZXMgfWApO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQga2V5OiBQbGF5ZXJTdGF0ZS5wbGF5ZXIxTGl2ZXNcIik7XG4gICAgfVxuICAgIHZhbGlkYXRpb25FcnJvcnMgPSB2YWxpZGF0ZVByaW1pdGl2ZShOdW1iZXIuaXNJbnRlZ2VyKG9iai5wbGF5ZXIyTGl2ZXMpLCBgSW52YWxpZCBpbnQ6ICR7IG9iai5wbGF5ZXIyTGl2ZXMgfWApO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQga2V5OiBQbGF5ZXJTdGF0ZS5wbGF5ZXIyTGl2ZXNcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnM7XG4gIH0sXG4gIGVuY29kZShvYmo6IFBsYXllclN0YXRlLCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgVmVjdG9yLmVuY29kZShvYmoucGxheWVyMXBvc2l0aW9uLCBidWYpO1xuICAgIFZlY3Rvci5lbmNvZGUob2JqLnBsYXllcjJwb3NpdGlvbiwgYnVmKTtcbiAgICBWZWN0b3IuZW5jb2RlKG9iai5iYWxscG9zaXRpb24sIGJ1Zik7XG4gICAgd3JpdGVJbnQoYnVmLCBvYmoucGxheWVyMUxpdmVzKTtcbiAgICB3cml0ZUludChidWYsIG9iai5wbGF5ZXIyTGl2ZXMpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGVuY29kZURpZmYob2JqOiBfRGVlcFBhcnRpYWw8UGxheWVyU3RhdGU+LCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgY29uc3QgdHJhY2tlcjogYm9vbGVhbltdID0gW107XG4gICAgdHJhY2tlci5wdXNoKG9iai5wbGF5ZXIxcG9zaXRpb24gIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLnBsYXllcjJwb3NpdGlvbiAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouYmFsbHBvc2l0aW9uICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5wbGF5ZXIxTGl2ZXMgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLnBsYXllcjJMaXZlcyAhPT0gX05PX0RJRkYpO1xuICAgIGJ1Zi53cml0ZUJpdHModHJhY2tlcik7XG4gICAgaWYgKG9iai5wbGF5ZXIxcG9zaXRpb24gIT09IF9OT19ESUZGKSB7XG4gICAgICBWZWN0b3IuZW5jb2RlRGlmZihvYmoucGxheWVyMXBvc2l0aW9uLCBidWYpO1xuICAgIH1cbiAgICBpZiAob2JqLnBsYXllcjJwb3NpdGlvbiAhPT0gX05PX0RJRkYpIHtcbiAgICAgIFZlY3Rvci5lbmNvZGVEaWZmKG9iai5wbGF5ZXIycG9zaXRpb24sIGJ1Zik7XG4gICAgfVxuICAgIGlmIChvYmouYmFsbHBvc2l0aW9uICE9PSBfTk9fRElGRikge1xuICAgICAgVmVjdG9yLmVuY29kZURpZmYob2JqLmJhbGxwb3NpdGlvbiwgYnVmKTtcbiAgICB9XG4gICAgaWYgKG9iai5wbGF5ZXIxTGl2ZXMgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUludChidWYsIG9iai5wbGF5ZXIxTGl2ZXMpO1xuICAgIH1cbiAgICBpZiAob2JqLnBsYXllcjJMaXZlcyAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlSW50KGJ1Ziwgb2JqLnBsYXllcjJMaXZlcyk7XG4gICAgfVxuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBQbGF5ZXJTdGF0ZSB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBsYXllcjFwb3NpdGlvbjogVmVjdG9yLmRlY29kZShzYiksXG4gICAgICBwbGF5ZXIycG9zaXRpb246IFZlY3Rvci5kZWNvZGUoc2IpLFxuICAgICAgYmFsbHBvc2l0aW9uOiBWZWN0b3IuZGVjb2RlKHNiKSxcbiAgICAgIHBsYXllcjFMaXZlczogcGFyc2VJbnQoc2IpLFxuICAgICAgcGxheWVyMkxpdmVzOiBwYXJzZUludChzYiksXG4gICAgfTtcbiAgfSxcbiAgZGVjb2RlRGlmZihidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBfRGVlcFBhcnRpYWw8UGxheWVyU3RhdGU+IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICBjb25zdCB0cmFja2VyID0gc2IucmVhZEJpdHMoNSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBsYXllcjFwb3NpdGlvbjogdHJhY2tlci5zaGlmdCgpID8gVmVjdG9yLmRlY29kZURpZmYoc2IpIDogX05PX0RJRkYsXG4gICAgICBwbGF5ZXIycG9zaXRpb246IHRyYWNrZXIuc2hpZnQoKSA/IFZlY3Rvci5kZWNvZGVEaWZmKHNiKSA6IF9OT19ESUZGLFxuICAgICAgYmFsbHBvc2l0aW9uOiB0cmFja2VyLnNoaWZ0KCkgPyBWZWN0b3IuZGVjb2RlRGlmZihzYikgOiBfTk9fRElGRixcbiAgICAgIHBsYXllcjFMaXZlczogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VJbnQoc2IpIDogX05PX0RJRkYsXG4gICAgICBwbGF5ZXIyTGl2ZXM6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlSW50KHNiKSA6IF9OT19ESUZGLFxuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IElVcGRhdGVQbGF5ZXJWZWxvY2l0eVJlcXVlc3QgPSB7XG4gIGRlZmF1bHQoKTogSVVwZGF0ZVBsYXllclZlbG9jaXR5UmVxdWVzdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlbG9jaXR5OiBWZWN0b3IuZGVmYXVsdCgpLFxuICAgIH07XG4gIH0sXG4gIGVuY29kZShvYmo6IElVcGRhdGVQbGF5ZXJWZWxvY2l0eVJlcXVlc3QsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBWZWN0b3IuZW5jb2RlKG9iai52ZWxvY2l0eSwgYnVmKTtcbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBkZWNvZGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogSVVwZGF0ZVBsYXllclZlbG9jaXR5UmVxdWVzdCB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlbG9jaXR5OiBWZWN0b3IuZGVjb2RlKHNiKSxcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBJU3RhcnRSb3VuZFJlcXVlc3QgPSB7XG4gIGRlZmF1bHQoKTogSVN0YXJ0Um91bmRSZXF1ZXN0IHtcbiAgICByZXR1cm4ge1xuICAgIH07XG4gIH0sXG4gIGVuY29kZShvYmo6IElTdGFydFJvdW5kUmVxdWVzdCwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBJU3RhcnRSb3VuZFJlcXVlc3Qge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgfTtcbiAgfSxcbn07XG5leHBvcnQgY29uc3QgSUpvaW5HYW1lUmVxdWVzdCA9IHtcbiAgZGVmYXVsdCgpOiBJSm9pbkdhbWVSZXF1ZXN0IHtcbiAgICByZXR1cm4ge1xuICAgIH07XG4gIH0sXG4gIGVuY29kZShvYmo6IElKb2luR2FtZVJlcXVlc3QsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBkZWNvZGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogSUpvaW5HYW1lUmVxdWVzdCB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBJU3RhcnRHYW1lUmVxdWVzdCA9IHtcbiAgZGVmYXVsdCgpOiBJU3RhcnRHYW1lUmVxdWVzdCB7XG4gICAgcmV0dXJuIHtcbiAgICB9O1xuICB9LFxuICBlbmNvZGUob2JqOiBJU3RhcnRHYW1lUmVxdWVzdCwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBJU3RhcnRHYW1lUmVxdWVzdCB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBJSW5pdGlhbGl6ZVJlcXVlc3QgPSB7XG4gIGRlZmF1bHQoKTogSUluaXRpYWxpemVSZXF1ZXN0IHtcbiAgICByZXR1cm4ge307XG4gIH0sXG4gIGVuY29kZSh4OiBJSW5pdGlhbGl6ZVJlcXVlc3QsIGJ1Zj86IF9Xcml0ZXIpIHtcbiAgICByZXR1cm4gYnVmID8/IG5ldyBfV3JpdGVyKCk7XG4gIH0sXG4gIGRlY29kZShzYjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IElJbml0aWFsaXplUmVxdWVzdCB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZVN0YXRlU25hcHNob3QoeDogUGxheWVyU3RhdGUpIHtcbiAgY29uc3QgYnVmID0gbmV3IF9Xcml0ZXIoKTtcbiAgYnVmLndyaXRlVUludDgoMCk7XG4gIFBsYXllclN0YXRlLmVuY29kZSh4LCBidWYpO1xuICByZXR1cm4gYnVmLnRvQnVmZmVyKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlU3RhdGVVcGRhdGUoXG4gIHg6IF9EZWVwUGFydGlhbDxQbGF5ZXJTdGF0ZT4gfCB1bmRlZmluZWQsXG4gIGNoYW5nZWRBdERpZmY6IG51bWJlcixcbiAgbWVzc2FnZXM6IF9NZXNzYWdlW11cbikge1xuICBjb25zdCBidWYgPSBuZXcgX1dyaXRlcigpO1xuICBidWYud3JpdGVVSW50OCgxKTtcbiAgYnVmLndyaXRlVVZhcmludChjaGFuZ2VkQXREaWZmKTtcbiAgY29uc3QgcmVzcG9uc2VzID0gbWVzc2FnZXMuZmxhdE1hcCgobXNnKSA9PiAobXNnLnR5cGUgPT09IFwicmVzcG9uc2VcIiA/IG1zZyA6IFtdKSk7XG4gIGJ1Zi53cml0ZVVWYXJpbnQocmVzcG9uc2VzLmxlbmd0aCk7XG4gIHJlc3BvbnNlcy5mb3JFYWNoKCh7IG1zZ0lkLCByZXNwb25zZSB9KSA9PiB7XG4gICAgYnVmLndyaXRlVUludDMyKE51bWJlcihtc2dJZCkpO1xuICAgIHdyaXRlT3B0aW9uYWwoYnVmLCByZXNwb25zZS50eXBlID09PSBcImVycm9yXCIgPyByZXNwb25zZS5lcnJvciA6IHVuZGVmaW5lZCwgKHgpID0+IHdyaXRlU3RyaW5nKGJ1ZiwgeCkpO1xuICB9KTtcbiAgY29uc3QgZXZlbnRzID0gbWVzc2FnZXMuZmxhdE1hcCgobXNnKSA9PiAobXNnLnR5cGUgPT09IFwiZXZlbnRcIiA/IG1zZyA6IFtdKSk7XG4gIGJ1Zi53cml0ZVVWYXJpbnQoZXZlbnRzLmxlbmd0aCk7XG4gIGV2ZW50cy5mb3JFYWNoKCh7IGV2ZW50IH0pID0+IGJ1Zi53cml0ZVN0cmluZyhldmVudCkpO1xuICBpZiAoeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgUGxheWVyU3RhdGUuZW5jb2RlRGlmZih4LCBidWYpO1xuICB9XG4gIHJldHVybiBidWYudG9CdWZmZXIoKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVTdGF0ZUVycm9yKCkge1xuICBjb25zdCBidWYgPSBuZXcgX1dyaXRlcigpO1xuICBidWYud3JpdGVVSW50OCgyKTtcbiAgcmV0dXJuIGJ1Zi50b0J1ZmZlcigpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZVN0YXRlVXBkYXRlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IHtcbiAgc3RhdGVEaWZmPzogX0RlZXBQYXJ0aWFsPFBsYXllclN0YXRlPjtcbiAgY2hhbmdlZEF0RGlmZjogbnVtYmVyO1xuICByZXNwb25zZXM6IF9SZXNwb25zZU1lc3NhZ2VbXTtcbiAgZXZlbnRzOiBfRXZlbnRNZXNzYWdlW107XG59IHtcbiAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gIGNvbnN0IGNoYW5nZWRBdERpZmYgPSBzYi5yZWFkVVZhcmludCgpO1xuICBjb25zdCByZXNwb25zZXMgPSBbLi4uQXJyYXkoc2IucmVhZFVWYXJpbnQoKSldLm1hcCgoKSA9PiB7XG4gICAgY29uc3QgbXNnSWQgPSBzYi5yZWFkVUludDMyKCk7XG4gICAgY29uc3QgbWF5YmVFcnJvciA9IHBhcnNlT3B0aW9uYWwoc2IsICgpID0+IHBhcnNlU3RyaW5nKHNiKSk7XG4gICAgcmV0dXJuIF9NZXNzYWdlLnJlc3BvbnNlKG1zZ0lkLCBtYXliZUVycm9yID09PSB1bmRlZmluZWQgPyBfUmVzcG9uc2Uub2soKSA6IF9SZXNwb25zZS5lcnJvcihtYXliZUVycm9yKSk7XG4gIH0pO1xuICBjb25zdCBldmVudHMgPSBbLi4uQXJyYXkoc2IucmVhZFVWYXJpbnQoKSldLm1hcCgoKSA9PiBfTWVzc2FnZS5ldmVudChzYi5yZWFkU3RyaW5nKCkpKTtcbiAgY29uc3Qgc3RhdGVEaWZmID0gc2IucmVtYWluaW5nKCkgPyBQbGF5ZXJTdGF0ZS5kZWNvZGVEaWZmKHNiKSA6IHVuZGVmaW5lZDtcbiAgcmV0dXJuIHsgc3RhdGVEaWZmLCBjaGFuZ2VkQXREaWZmLCByZXNwb25zZXMsIGV2ZW50cyB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZVN0YXRlU25hcHNob3QoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKSB7XG4gIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICByZXR1cm4gUGxheWVyU3RhdGUuZGVjb2RlKHNiKTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVQcmltaXRpdmUoaXNWYWxpZDogYm9vbGVhbiwgZXJyb3JNZXNzYWdlOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGlzVmFsaWQgPyBbXSA6IFtlcnJvck1lc3NhZ2VdO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVPcHRpb25hbDxUPih2YWw6IFQgfCB1bmRlZmluZWQsIGlubmVyVmFsaWRhdGU6ICh4OiBUKSA9PiBzdHJpbmdbXSkge1xuICBpZiAodmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gaW5uZXJWYWxpZGF0ZSh2YWwpO1xuICB9XG4gIHJldHVybiBbXTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlQXJyYXk8VD4oYXJyOiBUW10sIGlubmVyVmFsaWRhdGU6ICh4OiBUKSA9PiBzdHJpbmdbXSkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgIHJldHVybiBbXCJJbnZhbGlkIGFycmF5OiBcIiArIGFycl07XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3JzID0gaW5uZXJWYWxpZGF0ZShhcnJbaV0pO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQgYXJyYXkgaXRlbSBhdCBpbmRleCBcIiArIGkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIHdyaXRlVUludDgoYnVmOiBfV3JpdGVyLCB4OiBudW1iZXIpIHtcbiAgYnVmLndyaXRlVUludDgoeCk7XG59XG5mdW5jdGlvbiB3cml0ZUJvb2xlYW4oYnVmOiBfV3JpdGVyLCB4OiBib29sZWFuKSB7XG4gIGJ1Zi53cml0ZVVJbnQ4KHggPyAxIDogMCk7XG59XG5mdW5jdGlvbiB3cml0ZUludChidWY6IF9Xcml0ZXIsIHg6IG51bWJlcikge1xuICBidWYud3JpdGVWYXJpbnQoeCk7XG59XG5mdW5jdGlvbiB3cml0ZUZsb2F0KGJ1ZjogX1dyaXRlciwgeDogbnVtYmVyKSB7XG4gIGJ1Zi53cml0ZUZsb2F0KHgpO1xufVxuZnVuY3Rpb24gd3JpdGVTdHJpbmcoYnVmOiBfV3JpdGVyLCB4OiBzdHJpbmcpIHtcbiAgYnVmLndyaXRlU3RyaW5nKHgpO1xufVxuZnVuY3Rpb24gd3JpdGVPcHRpb25hbDxUPihidWY6IF9Xcml0ZXIsIHg6IFQgfCB1bmRlZmluZWQsIGlubmVyV3JpdGU6ICh4OiBUKSA9PiB2b2lkKSB7XG4gIHdyaXRlQm9vbGVhbihidWYsIHggIT09IHVuZGVmaW5lZCk7XG4gIGlmICh4ICE9PSB1bmRlZmluZWQpIHtcbiAgICBpbm5lcldyaXRlKHgpO1xuICB9XG59XG5mdW5jdGlvbiB3cml0ZUFycmF5PFQ+KGJ1ZjogX1dyaXRlciwgeDogVFtdLCBpbm5lcldyaXRlOiAoeDogVCkgPT4gdm9pZCkge1xuICBidWYud3JpdGVVVmFyaW50KHgubGVuZ3RoKTtcbiAgZm9yIChjb25zdCB2YWwgb2YgeCkge1xuICAgIGlubmVyV3JpdGUodmFsKTtcbiAgfVxufVxuZnVuY3Rpb24gd3JpdGVBcnJheURpZmY8VD4oYnVmOiBfV3JpdGVyLCB4OiAoVCB8IHR5cGVvZiBfTk9fRElGRilbXSwgaW5uZXJXcml0ZTogKHg6IFQpID0+IHZvaWQpIHtcbiAgYnVmLndyaXRlVVZhcmludCh4Lmxlbmd0aCk7XG4gIGNvbnN0IHRyYWNrZXI6IGJvb2xlYW5bXSA9IFtdO1xuICB4LmZvckVhY2goKHZhbCkgPT4ge1xuICAgIHRyYWNrZXIucHVzaCh2YWwgIT09IF9OT19ESUZGKTtcbiAgfSk7XG4gIGJ1Zi53cml0ZUJpdHModHJhY2tlcik7XG4gIHguZm9yRWFjaCgodmFsKSA9PiB7XG4gICAgaWYgKHZhbCAhPT0gX05PX0RJRkYpIHtcbiAgICAgIGlubmVyV3JpdGUodmFsKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBwYXJzZVVJbnQ4KGJ1ZjogX1JlYWRlcik6IG51bWJlciB7XG4gIHJldHVybiBidWYucmVhZFVJbnQ4KCk7XG59XG5mdW5jdGlvbiBwYXJzZUJvb2xlYW4oYnVmOiBfUmVhZGVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBidWYucmVhZFVJbnQ4KCkgPiAwO1xufVxuZnVuY3Rpb24gcGFyc2VJbnQoYnVmOiBfUmVhZGVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIGJ1Zi5yZWFkVmFyaW50KCk7XG59XG5mdW5jdGlvbiBwYXJzZUZsb2F0KGJ1ZjogX1JlYWRlcik6IG51bWJlciB7XG4gIHJldHVybiBidWYucmVhZEZsb2F0KCk7XG59XG5mdW5jdGlvbiBwYXJzZVN0cmluZyhidWY6IF9SZWFkZXIpOiBzdHJpbmcge1xuICByZXR1cm4gYnVmLnJlYWRTdHJpbmcoKTtcbn1cbmZ1bmN0aW9uIHBhcnNlT3B0aW9uYWw8VD4oYnVmOiBfUmVhZGVyLCBpbm5lclBhcnNlOiAoYnVmOiBfUmVhZGVyKSA9PiBUKTogVCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBwYXJzZUJvb2xlYW4oYnVmKSA/IGlubmVyUGFyc2UoYnVmKSA6IHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIHBhcnNlQXJyYXk8VD4oYnVmOiBfUmVhZGVyLCBpbm5lclBhcnNlOiAoKSA9PiBUKTogVFtdIHtcbiAgY29uc3QgbGVuID0gYnVmLnJlYWRVVmFyaW50KCk7XG4gIGNvbnN0IGFyciA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgYXJyLnB1c2goaW5uZXJQYXJzZSgpKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufVxuZnVuY3Rpb24gcGFyc2VBcnJheURpZmY8VD4oYnVmOiBfUmVhZGVyLCBpbm5lclBhcnNlOiAoKSA9PiBUKTogKFQgfCB0eXBlb2YgX05PX0RJRkYpW10ge1xuICBjb25zdCBsZW4gPSBidWYucmVhZFVWYXJpbnQoKTtcbiAgY29uc3QgdHJhY2tlciA9IGJ1Zi5yZWFkQml0cyhsZW4pO1xuICBjb25zdCBhcnIgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGlmICh0cmFja2VyLnNoaWZ0KCkpIHtcbiAgICAgIGFyci5wdXNoKGlubmVyUGFyc2UoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyci5wdXNoKF9OT19ESUZGKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycjtcbn1cbiIsImltcG9ydCBqd3REZWNvZGUgZnJvbSBcImp3dC1kZWNvZGVcIjtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCBnZXRSYW5kb21WYWx1ZXMgZnJvbSBcImdldC1yYW5kb20tdmFsdWVzXCI7XG5pbXBvcnQgeyBSZWFkZXIsIFdyaXRlciB9IGZyb20gXCJiaW4tc2VyZGVcIjtcbmltcG9ydCBheGlvcyBmcm9tIFwiYXhpb3NcIjtcblxuaW1wb3J0IHtcbiAgZGVjb2RlU3RhdGVTbmFwc2hvdCxcbiAgZGVjb2RlU3RhdGVVcGRhdGUsXG4gIFBsYXllclN0YXRlIGFzIFVzZXJTdGF0ZSxcbiAgSUluaXRpYWxpemVSZXF1ZXN0LFxuICBJVXBkYXRlUGxheWVyVmVsb2NpdHlSZXF1ZXN0LFxuICBJU3RhcnRSb3VuZFJlcXVlc3QsXG4gIElKb2luR2FtZVJlcXVlc3QsXG4gIElTdGFydEdhbWVSZXF1ZXN0LFxufSBmcm9tIFwiLi4vLi4vYXBpL3R5cGVzXCI7XG5pbXBvcnQgeyBVc2VyRGF0YSwgUmVzcG9uc2UsIE1ldGhvZCwgQ09PUkRJTkFUT1JfSE9TVCwgTUFUQ0hNQUtFUl9IT1NUIH0gZnJvbSBcIi4uLy4uL2FwaS9iYXNlXCI7XG5cbmltcG9ydCB7IEhhdGhvcmFUcmFuc3BvcnQsIFRDUEhhdGhvcmFUcmFuc3BvcnQsIFRyYW5zcG9ydFR5cGUsIFdlYlNvY2tldEhhdGhvcmFUcmFuc3BvcnQgfSBmcm9tIFwiLi90cmFuc3BvcnRcIjtcbmltcG9ydCB7IGNvbXB1dGVQYXRjaCB9IGZyb20gXCIuL3BhdGNoXCI7XG5pbXBvcnQgeyBDb25uZWN0aW9uRmFpbHVyZSwgdHJhbnNmb3JtQ29vcmRpbmF0b3JGYWlsdXJlIH0gZnJvbSBcIi4vZmFpbHVyZXNcIjtcblxuZXhwb3J0IHR5cGUgU3RhdGVJZCA9IHN0cmluZztcbmV4cG9ydCB0eXBlIFVwZGF0ZUFyZ3MgPSB7IHN0YXRlSWQ6IFN0YXRlSWQ7IHN0YXRlOiBVc2VyU3RhdGU7IHVwZGF0ZWRBdDogbnVtYmVyOyBldmVudHM6IHN0cmluZ1tdIH07XG5leHBvcnQgdHlwZSBVcGRhdGVDYWxsYmFjayA9ICh1cGRhdGVBcmdzOiBVcGRhdGVBcmdzKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgRXJyb3JDYWxsYmFjayA9IChlcnJvcjogQ29ubmVjdGlvbkZhaWx1cmUpID0+IHZvaWQ7XG5cbmV4cG9ydCBjbGFzcyBIYXRob3JhQ2xpZW50IHtcbiAgcHVibGljIGFwcElkID0gXCI0NGUyOThmYzBhNWJjY2I4OGJkZDcwNzIzZjcyYjk4NmY3M2VhM2E3MGI1ODBkZWY3YmE3ZGEzZmJhMDYxZjk2XCI7XG5cbiAgcHVibGljIHN0YXRpYyBnZXRVc2VyRnJvbVRva2VuKHRva2VuOiBzdHJpbmcpOiBVc2VyRGF0YSB7XG4gICAgcmV0dXJuIGp3dERlY29kZSh0b2tlbik7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgbG9naW5Bbm9ueW1vdXMoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBheGlvcy5wb3N0KGBodHRwczovLyR7Q09PUkRJTkFUT1JfSE9TVH0vJHt0aGlzLmFwcElkfS9sb2dpbi9hbm9ueW1vdXNgKTtcbiAgICByZXR1cm4gcmVzLmRhdGEudG9rZW47XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY3JlYXRlKHRva2VuOiBzdHJpbmcsIHJlcXVlc3Q6IElJbml0aWFsaXplUmVxdWVzdCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgYXhpb3MucG9zdChcbiAgICAgIGBodHRwczovLyR7Q09PUkRJTkFUT1JfSE9TVH0vJHt0aGlzLmFwcElkfS9jcmVhdGVgLFxuICAgICAgSUluaXRpYWxpemVSZXF1ZXN0LmVuY29kZShyZXF1ZXN0KS50b0J1ZmZlcigpLFxuICAgICAgeyBoZWFkZXJzOiB7IEF1dGhvcml6YXRpb246IHRva2VuLCBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiIH0gfVxuICAgICk7XG4gICAgcmV0dXJuIHJlcy5kYXRhLnN0YXRlSWQ7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY29ubmVjdChcbiAgICB0b2tlbjogc3RyaW5nLFxuICAgIHN0YXRlSWQ6IFN0YXRlSWQsXG4gICAgb25VcGRhdGU/OiBVcGRhdGVDYWxsYmFjayxcbiAgICBvbkVycm9yPzogRXJyb3JDYWxsYmFjayxcbiAgICB0cmFuc3BvcnRUeXBlPzogVHJhbnNwb3J0VHlwZVxuICApOiBQcm9taXNlPEhhdGhvcmFDb25uZWN0aW9uPiB7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IG5ldyBIYXRob3JhQ29ubmVjdGlvbih0aGlzLmFwcElkLCBzdGF0ZUlkLCB0b2tlbiwgb25VcGRhdGUsIG9uRXJyb3IsIHRyYW5zcG9ydFR5cGUpO1xuICAgIGF3YWl0IGNvbm5lY3Rpb24uY29ubmVjdCgpO1xuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGZpbmRNYXRjaChcbiAgICB0b2tlbjogc3RyaW5nLFxuICAgIHJlcXVlc3Q6IElJbml0aWFsaXplUmVxdWVzdCxcbiAgICBudW1QbGF5ZXJzOiBudW1iZXIsXG4gICAgb25VcGRhdGU6IChwbGF5ZXJzRm91bmQ6IG51bWJlcikgPT4gdm9pZFxuICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoYHdzczovLyR7TUFUQ0hNQUtFUl9IT1NUfS8ke3RoaXMuYXBwSWR9YCk7XG4gICAgICBzb2NrZXQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcbiAgICAgIHNvY2tldC5vbmNsb3NlID0gcmVqZWN0O1xuICAgICAgc29ja2V0Lm9ub3BlbiA9ICgpID0+XG4gICAgICAgIHNvY2tldC5zZW5kKFxuICAgICAgICAgIG5ldyBXcml0ZXIoKVxuICAgICAgICAgICAgLndyaXRlU3RyaW5nKHRva2VuKVxuICAgICAgICAgICAgLndyaXRlVVZhcmludChudW1QbGF5ZXJzKVxuICAgICAgICAgICAgLndyaXRlQnVmZmVyKElJbml0aWFsaXplUmVxdWVzdC5lbmNvZGUocmVxdWVzdCkudG9CdWZmZXIoKSlcbiAgICAgICAgICAgIC50b0J1ZmZlcigpXG4gICAgICAgICk7XG4gICAgICBzb2NrZXQub25tZXNzYWdlID0gKHsgZGF0YSB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBSZWFkZXIobmV3IFVpbnQ4QXJyYXkoZGF0YSBhcyBBcnJheUJ1ZmZlcikpO1xuICAgICAgICBjb25zdCB0eXBlID0gcmVhZGVyLnJlYWRVSW50OCgpO1xuICAgICAgICBpZiAodHlwZSA9PT0gMCkge1xuICAgICAgICAgIG9uVXBkYXRlKHJlYWRlci5yZWFkVVZhcmludCgpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVhZFN0cmluZygpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVW5rbm93biBtZXNzYWdlIHR5cGVcIiwgdHlwZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEhhdGhvcmFDb25uZWN0aW9uIHtcbiAgcHJpdmF0ZSBjYWxsYmFja3M6IFJlY29yZDxzdHJpbmcsIChyZXNwb25zZTogUmVzcG9uc2UpID0+IHZvaWQ+ID0ge307XG4gIHByaXZhdGUgY2hhbmdlZEF0ID0gMDtcbiAgcHJpdmF0ZSB1cGRhdGVMaXN0ZW5lcnM6IFVwZGF0ZUNhbGxiYWNrW10gPSBbXTtcbiAgcHJpdmF0ZSBlcnJvckxpc3RlbmVyczogRXJyb3JDYWxsYmFja1tdID0gW107XG4gIHByaXZhdGUgdHJhbnNwb3J0OiBIYXRob3JhVHJhbnNwb3J0O1xuICBwcml2YXRlIGludGVybmFsU3RhdGU6IFVzZXJTdGF0ZSB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGFwcElkOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSBzdGF0ZUlkOiBTdGF0ZUlkLFxuICAgIHByaXZhdGUgdG9rZW46IHN0cmluZyxcbiAgICBvblVwZGF0ZT86IFVwZGF0ZUNhbGxiYWNrLFxuICAgIG9uRXJyb3I/OiBFcnJvckNhbGxiYWNrLFxuICAgIHRyYW5zcG9ydFR5cGU/OiBUcmFuc3BvcnRUeXBlXG4gICkge1xuICAgIHRoaXMuc3RhdGVJZCA9IHN0YXRlSWQ7XG4gICAgdGhpcy50b2tlbiA9IHRva2VuO1xuXG4gICAgaWYgKHRyYW5zcG9ydFR5cGUgPT09IHVuZGVmaW5lZCB8fCB0cmFuc3BvcnRUeXBlID09PSBUcmFuc3BvcnRUeXBlLldlYlNvY2tldCkge1xuICAgICAgdGhpcy50cmFuc3BvcnQgPSBuZXcgV2ViU29ja2V0SGF0aG9yYVRyYW5zcG9ydChhcHBJZCk7XG4gICAgfSBlbHNlIGlmICh0cmFuc3BvcnRUeXBlID09PSBUcmFuc3BvcnRUeXBlLlRDUCkge1xuICAgICAgdGhpcy50cmFuc3BvcnQgPSBuZXcgVENQSGF0aG9yYVRyYW5zcG9ydChhcHBJZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVua25vd24gdHJhbnNwb3J0IHR5cGVcIik7XG4gICAgfVxuXG4gICAgaWYgKG9uVXBkYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMub25VcGRhdGUob25VcGRhdGUpO1xuICAgIH1cbiAgICBpZiAob25FcnJvciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLm9uRXJyb3Iob25FcnJvcik7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbm5lY3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy50cmFuc3BvcnQuY29ubmVjdCh0aGlzLnN0YXRlSWQsIHRoaXMudG9rZW4sIHRoaXMuaGFuZGxlRGF0YSwgdGhpcy5oYW5kbGVDbG9zZSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHN0YXRlKCk6IFVzZXJTdGF0ZSB7XG4gICAgaWYgKHRoaXMuaW50ZXJuYWxTdGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNdXN0IHdhaXQgb24gSGF0aG9yYUNvbm5lY3Rpb24uY29ubmVjdCgpIGJlZm9yZSBsb29raW5nIHVwIHN0YXRlXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbFN0YXRlO1xuICB9XG5cbiAgcHVibGljIG9uVXBkYXRlKGxpc3RlbmVyOiBVcGRhdGVDYWxsYmFjaykge1xuICAgIHRoaXMudXBkYXRlTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICB9XG5cbiAgcHVibGljIG9uRXJyb3IobGlzdGVuZXI6IEVycm9yQ2FsbGJhY2spIHtcbiAgICB0aGlzLmVycm9yTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICB9XG5cbiAgcHVibGljIHJlbW92ZUFsbExpc3RlbmVycygpIHtcbiAgICB0aGlzLnVwZGF0ZUxpc3RlbmVycyA9IFtdO1xuICAgIHRoaXMuZXJyb3JMaXN0ZW5lcnMgPSBbXTtcbiAgfVxuXG4gIHB1YmxpYyB1cGRhdGVQbGF5ZXJWZWxvY2l0eShyZXF1ZXN0OiBJVXBkYXRlUGxheWVyVmVsb2NpdHlSZXF1ZXN0KTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoTWV0aG9kLlVQREFURV9QTEFZRVJfVkVMT0NJVFksIElVcGRhdGVQbGF5ZXJWZWxvY2l0eVJlcXVlc3QuZW5jb2RlKHJlcXVlc3QpLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgcHVibGljIHN0YXJ0Um91bmQocmVxdWVzdDogSVN0YXJ0Um91bmRSZXF1ZXN0KTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoTWV0aG9kLlNUQVJUX1JPVU5ELCBJU3RhcnRSb3VuZFJlcXVlc3QuZW5jb2RlKHJlcXVlc3QpLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgcHVibGljIGpvaW5HYW1lKHJlcXVlc3Q6IElKb2luR2FtZVJlcXVlc3QpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZChNZXRob2QuSk9JTl9HQU1FLCBJSm9pbkdhbWVSZXF1ZXN0LmVuY29kZShyZXF1ZXN0KS50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGFydEdhbWUocmVxdWVzdDogSVN0YXJ0R2FtZVJlcXVlc3QpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZChNZXRob2QuU1RBUlRfR0FNRSwgSVN0YXJ0R2FtZVJlcXVlc3QuZW5jb2RlKHJlcXVlc3QpLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgcHVibGljIGRpc2Nvbm5lY3QoY29kZT86IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMudHJhbnNwb3J0LmRpc2Nvbm5lY3QoY29kZSk7XG4gIH1cblxuICBwcml2YXRlIGNhbGxNZXRob2QobWV0aG9kOiBNZXRob2QsIHJlcXVlc3Q6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICghdGhpcy50cmFuc3BvcnQuaXNSZWFkeSgpKSB7XG4gICAgICAgIHJlamVjdChcIkNvbm5lY3Rpb24gbm90IG9wZW5cIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBtc2dJZDogVWludDhBcnJheSA9IGdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSg0KSk7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0LndyaXRlKG5ldyBVaW50OEFycmF5KFsuLi5uZXcgVWludDhBcnJheShbbWV0aG9kXSksIC4uLm1zZ0lkLCAuLi5yZXF1ZXN0XSkpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrc1tuZXcgRGF0YVZpZXcobXNnSWQuYnVmZmVyKS5nZXRVaW50MzIoMCldID0gcmVzb2x2ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlRGF0YSA9IChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICBjb25zdCByZWFkZXIgPSBuZXcgUmVhZGVyKG5ldyBVaW50OEFycmF5KGRhdGEgYXMgQXJyYXlCdWZmZXIpKTtcbiAgICBjb25zdCB0eXBlID0gcmVhZGVyLnJlYWRVSW50OCgpO1xuICAgIGlmICh0eXBlID09PSAwKSB7XG4gICAgICB0aGlzLmludGVybmFsU3RhdGUgPSBkZWNvZGVTdGF0ZVNuYXBzaG90KHJlYWRlcik7XG4gICAgICB0aGlzLmNoYW5nZWRBdCA9IDA7XG4gICAgICB0aGlzLnVwZGF0ZUxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT5cbiAgICAgICAgbGlzdGVuZXIoe1xuICAgICAgICAgIHN0YXRlSWQ6IHRoaXMuc3RhdGVJZCxcbiAgICAgICAgICBzdGF0ZTogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmludGVybmFsU3RhdGUpKSxcbiAgICAgICAgICB1cGRhdGVkQXQ6IDAsXG4gICAgICAgICAgZXZlbnRzOiBbXSxcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAxKSB7XG4gICAgICBjb25zdCB7IHN0YXRlRGlmZiwgY2hhbmdlZEF0RGlmZiwgcmVzcG9uc2VzLCBldmVudHMgfSA9IGRlY29kZVN0YXRlVXBkYXRlKHJlYWRlcik7XG4gICAgICBpZiAoc3RhdGVEaWZmICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5pbnRlcm5hbFN0YXRlID0gY29tcHV0ZVBhdGNoKHRoaXMuaW50ZXJuYWxTdGF0ZSEsIHN0YXRlRGlmZik7XG4gICAgICB9XG4gICAgICB0aGlzLmNoYW5nZWRBdCArPSBjaGFuZ2VkQXREaWZmO1xuICAgICAgdGhpcy51cGRhdGVMaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+XG4gICAgICAgIGxpc3RlbmVyKHtcbiAgICAgICAgICBzdGF0ZUlkOiB0aGlzLnN0YXRlSWQsXG4gICAgICAgICAgc3RhdGU6IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5pbnRlcm5hbFN0YXRlKSksXG4gICAgICAgICAgdXBkYXRlZEF0OiB0aGlzLmNoYW5nZWRBdCxcbiAgICAgICAgICBldmVudHM6IGV2ZW50cy5tYXAoKGUpID0+IGUuZXZlbnQpLFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICAgIHJlc3BvbnNlcy5mb3JFYWNoKCh7IG1zZ0lkLCByZXNwb25zZSB9KSA9PiB7XG4gICAgICAgIGlmIChtc2dJZCBpbiB0aGlzLmNhbGxiYWNrcykge1xuICAgICAgICAgIHRoaXMuY2FsbGJhY2tzW21zZ0lkXShyZXNwb25zZSk7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuY2FsbGJhY2tzW21zZ0lkXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAyKSB7XG4gICAgICB0aGlzLnRyYW5zcG9ydC5kaXNjb25uZWN0KDQwMDQpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gMykge1xuICAgICAgdGhpcy50cmFuc3BvcnQucG9uZygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiVW5rbm93biBtZXNzYWdlIHR5cGVcIiwgdHlwZSk7XG4gICAgfVxuICB9O1xuXG4gIHByaXZhdGUgaGFuZGxlQ2xvc2UgPSAoZTogeyBjb2RlOiBudW1iZXI7IHJlYXNvbjogc3RyaW5nIH0pID0+IHtcbiAgICBjb25zb2xlLmVycm9yKFwiQ29ubmVjdGlvbiBjbG9zZWRcIiwgZSk7XG4gICAgdGhpcy5lcnJvckxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4gbGlzdGVuZXIodHJhbnNmb3JtQ29vcmRpbmF0b3JGYWlsdXJlKGUpKSk7XG4gIH07XG59XG4iLCJleHBvcnQgZW51bSBDb25uZWN0aW9uRmFpbHVyZVR5cGUge1xuICBTVEFURV9OT1RfRk9VTkQgPSBcIlNUQVRFX05PVF9GT1VORFwiLFxuICBOT19BVkFJTEFCTEVfU1RPUkVTID0gXCJOT19BVkFJTEFCTEVfU1RPUkVTXCIsXG4gIElOVkFMSURfVVNFUl9EQVRBID0gXCJJTlZBTElEX1VTRVJfREFUQVwiLFxuICBJTlZBTElEX1NUQVRFX0lEID0gXCJJTlZBTElEX1NUQVRFX0lEXCIsXG4gIEdFTkVSSUNfRkFJTFVSRSA9IFwiR0VORVJJQ19GQUlMVVJFXCIsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29ubmVjdGlvbkZhaWx1cmUge1xuICB0eXBlOiBDb25uZWN0aW9uRmFpbHVyZVR5cGUsXG4gIG1lc3NhZ2U6IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybUNvb3JkaW5hdG9yRmFpbHVyZSA9IChlOiB7Y29kZTogbnVtYmVyLCByZWFzb246IHN0cmluZ30pOiBDb25uZWN0aW9uRmFpbHVyZSAgPT4ge1xuICByZXR1cm4ge1xuICAgIG1lc3NhZ2U6IGUucmVhc29uLFxuICAgIHR5cGU6IChmdW5jdGlvbihjb2RlKSB7XG4gICAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgICAgY2FzZSA0MDAwOlxuICAgICAgICAgIHJldHVybiBDb25uZWN0aW9uRmFpbHVyZVR5cGUuU1RBVEVfTk9UX0ZPVU5EO1xuICAgICAgICBjYXNlIDQwMDE6XG4gICAgICAgICAgcmV0dXJuIENvbm5lY3Rpb25GYWlsdXJlVHlwZS5OT19BVkFJTEFCTEVfU1RPUkVTO1xuICAgICAgICBjYXNlIDQwMDI6XG4gICAgICAgICAgcmV0dXJuIENvbm5lY3Rpb25GYWlsdXJlVHlwZS5JTlZBTElEX1VTRVJfREFUQTtcbiAgICAgICAgY2FzZSA0MDAzOlxuICAgICAgICAgIHJldHVybiBDb25uZWN0aW9uRmFpbHVyZVR5cGUuSU5WQUxJRF9TVEFURV9JRDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gQ29ubmVjdGlvbkZhaWx1cmVUeXBlLkdFTkVSSUNfRkFJTFVSRTtcbiAgICAgIH1cbiAgICB9KShlLmNvZGUpXG4gIH07XG59XG4iLCJpbXBvcnQgeyBEZWVwUGFydGlhbCwgTk9fRElGRiB9IGZyb20gXCIuLi8uLi9hcGkvYmFzZVwiO1xuaW1wb3J0ICogYXMgVCBmcm9tIFwiLi4vLi4vYXBpL3R5cGVzXCI7XG5cbmZ1bmN0aW9uIHBhdGNoVmVjdG9yKG9iajogVC5WZWN0b3IsIHBhdGNoOiBEZWVwUGFydGlhbDxULlZlY3Rvcj4pIHtcbiAgaWYgKHBhdGNoLnggIT09IE5PX0RJRkYpIHtcbiAgICBvYmoueCA9IHBhdGNoLng7XG4gIH1cbiAgaWYgKHBhdGNoLnkgIT09IE5PX0RJRkYpIHtcbiAgICBvYmoueSA9IHBhdGNoLnk7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gcGF0Y2hCYWxsKG9iajogVC5CYWxsLCBwYXRjaDogRGVlcFBhcnRpYWw8VC5CYWxsPikge1xuICBpZiAocGF0Y2gucG9zaXRpb24gIT09IE5PX0RJRkYpIHtcbiAgICBvYmoucG9zaXRpb24gPSBwYXRjaFZlY3RvcihvYmoucG9zaXRpb24sIHBhdGNoLnBvc2l0aW9uKTtcbiAgfVxuICBpZiAocGF0Y2gudmVsb2NpdHkgIT09IE5PX0RJRkYpIHtcbiAgICBvYmoudmVsb2NpdHkgPSBwYXRjaFZlY3RvcihvYmoudmVsb2NpdHksIHBhdGNoLnZlbG9jaXR5KTtcbiAgfVxuICBpZiAocGF0Y2gucmFkaXVzICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLnJhZGl1cyA9IHBhdGNoLnJhZGl1cztcbiAgfVxuICBpZiAocGF0Y2guaXNDb2xsaWRpbmcgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouaXNDb2xsaWRpbmcgPSBwYXRjaC5pc0NvbGxpZGluZztcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBwYXRjaFBsYXllcihvYmo6IFQuUGxheWVyLCBwYXRjaDogRGVlcFBhcnRpYWw8VC5QbGF5ZXI+KSB7XG4gIGlmIChwYXRjaC5pZCAhPT0gTk9fRElGRikge1xuICAgIG9iai5pZCA9IHBhdGNoLmlkO1xuICB9XG4gIGlmIChwYXRjaC5saXZlcyAhPT0gTk9fRElGRikge1xuICAgIG9iai5saXZlcyA9IHBhdGNoLmxpdmVzO1xuICB9XG4gIGlmIChwYXRjaC5wb3NpdGlvbiAhPT0gTk9fRElGRikge1xuICAgIG9iai5wb3NpdGlvbiA9IHBhdGNoVmVjdG9yKG9iai5wb3NpdGlvbiwgcGF0Y2gucG9zaXRpb24pO1xuICB9XG4gIGlmIChwYXRjaC5zaXplICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLnNpemUgPSBwYXRjaFZlY3RvcihvYmouc2l6ZSwgcGF0Y2guc2l6ZSk7XG4gIH1cbiAgaWYgKHBhdGNoLnZlbG9jaXR5ICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLnZlbG9jaXR5ID0gcGF0Y2hWZWN0b3Iob2JqLnZlbG9jaXR5LCBwYXRjaC52ZWxvY2l0eSk7XG4gIH1cbiAgaWYgKHBhdGNoLmlzQ29sbGlkaW5nICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLmlzQ29sbGlkaW5nID0gcGF0Y2guaXNDb2xsaWRpbmc7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gcGF0Y2hTZXJ2ZXJTdGF0ZShvYmo6IFQuU2VydmVyU3RhdGUsIHBhdGNoOiBEZWVwUGFydGlhbDxULlNlcnZlclN0YXRlPikge1xuICBpZiAocGF0Y2guUGxheWVycyAhPT0gTk9fRElGRikge1xuICAgIG9iai5QbGF5ZXJzID0gcGF0Y2hBcnJheShvYmouUGxheWVycywgcGF0Y2guUGxheWVycywgKGEsIGIpID0+IHBhdGNoUGxheWVyKGEsIGIpKTtcbiAgfVxuICBpZiAocGF0Y2guQmFsbHMgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouQmFsbHMgPSBwYXRjaEFycmF5KG9iai5CYWxscywgcGF0Y2guQmFsbHMsIChhLCBiKSA9PiBwYXRjaEJhbGwoYSwgYikpO1xuICB9XG4gIGlmIChwYXRjaC5nYW1lU3RhdGUgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouZ2FtZVN0YXRlID0gcGF0Y2guZ2FtZVN0YXRlO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIHBhdGNoUGxheWVyU3RhdGUob2JqOiBULlBsYXllclN0YXRlLCBwYXRjaDogRGVlcFBhcnRpYWw8VC5QbGF5ZXJTdGF0ZT4pIHtcbiAgaWYgKHBhdGNoLnBsYXllcjFwb3NpdGlvbiAhPT0gTk9fRElGRikge1xuICAgIG9iai5wbGF5ZXIxcG9zaXRpb24gPSBwYXRjaFZlY3RvcihvYmoucGxheWVyMXBvc2l0aW9uLCBwYXRjaC5wbGF5ZXIxcG9zaXRpb24pO1xuICB9XG4gIGlmIChwYXRjaC5wbGF5ZXIycG9zaXRpb24gIT09IE5PX0RJRkYpIHtcbiAgICBvYmoucGxheWVyMnBvc2l0aW9uID0gcGF0Y2hWZWN0b3Iob2JqLnBsYXllcjJwb3NpdGlvbiwgcGF0Y2gucGxheWVyMnBvc2l0aW9uKTtcbiAgfVxuICBpZiAocGF0Y2guYmFsbHBvc2l0aW9uICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLmJhbGxwb3NpdGlvbiA9IHBhdGNoVmVjdG9yKG9iai5iYWxscG9zaXRpb24sIHBhdGNoLmJhbGxwb3NpdGlvbik7XG4gIH1cbiAgaWYgKHBhdGNoLnBsYXllcjFMaXZlcyAhPT0gTk9fRElGRikge1xuICAgIG9iai5wbGF5ZXIxTGl2ZXMgPSBwYXRjaC5wbGF5ZXIxTGl2ZXM7XG4gIH1cbiAgaWYgKHBhdGNoLnBsYXllcjJMaXZlcyAhPT0gTk9fRElGRikge1xuICAgIG9iai5wbGF5ZXIyTGl2ZXMgPSBwYXRjaC5wbGF5ZXIyTGl2ZXM7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gcGF0Y2hBcnJheTxUPihhcnI6IFRbXSwgcGF0Y2g6ICh0eXBlb2YgTk9fRElGRiB8IGFueSlbXSwgaW5uZXJQYXRjaDogKGE6IFQsIGI6IERlZXBQYXJ0aWFsPFQ+KSA9PiBUKSB7XG4gIHBhdGNoLmZvckVhY2goKHZhbCwgaSkgPT4ge1xuICAgIGlmICh2YWwgIT09IE5PX0RJRkYpIHtcbiAgICAgIGlmIChpID49IGFyci5sZW5ndGgpIHtcbiAgICAgICAgYXJyLnB1c2godmFsIGFzIFQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJyW2ldID0gaW5uZXJQYXRjaChhcnJbaV0sIHZhbCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgaWYgKHBhdGNoLmxlbmd0aCA8IGFyci5sZW5ndGgpIHtcbiAgICBhcnIuc3BsaWNlKHBhdGNoLmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGFycjtcbn1cblxuZnVuY3Rpb24gcGF0Y2hPcHRpb25hbDxUPihvYmo6IFQgfCB1bmRlZmluZWQsIHBhdGNoOiBhbnksIGlubmVyUGF0Y2g6IChhOiBULCBiOiBEZWVwUGFydGlhbDxUPikgPT4gVCkge1xuICBpZiAocGF0Y2ggPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0gZWxzZSBpZiAob2JqID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gcGF0Y2ggYXMgVDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gaW5uZXJQYXRjaChvYmosIHBhdGNoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZVBhdGNoKHN0YXRlOiBULlBsYXllclN0YXRlLCBwYXRjaDogRGVlcFBhcnRpYWw8VC5QbGF5ZXJTdGF0ZT4pIHtcbiAgcmV0dXJuIHBhdGNoUGxheWVyU3RhdGUoc3RhdGUsIHBhdGNoKTtcbn1cbiIsImltcG9ydCB7IFJlYWRlciwgV3JpdGVyIH0gZnJvbSBcImJpbi1zZXJkZVwiO1xuaW1wb3J0IG5ldCBmcm9tIFwibmV0XCI7XG5pbXBvcnQgeyBDT09SRElOQVRPUl9IT1NUIH0gZnJvbSBcIi4uLy4uL2FwaS9iYXNlXCI7XG5pbXBvcnQgV2ViU29ja2V0IGZyb20gXCJpc29tb3JwaGljLXdzXCI7XG5cbmV4cG9ydCBlbnVtIFRyYW5zcG9ydFR5cGUge1xuICBXZWJTb2NrZXQsXG4gIFRDUCxcbiAgVURQLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEhhdGhvcmFUcmFuc3BvcnQge1xuICBjb25uZWN0KFxuICAgIHN0YXRlSWQ6IHN0cmluZyxcbiAgICB0b2tlbjogc3RyaW5nLFxuICAgIG9uRGF0YTogKGRhdGE6IEJ1ZmZlcikgPT4gdm9pZCxcbiAgICBvbkNsb3NlOiAoZTogeyBjb2RlOiBudW1iZXI7IHJlYXNvbjogc3RyaW5nIH0pID0+IHZvaWRcbiAgKTogUHJvbWlzZTx2b2lkPjtcbiAgZGlzY29ubmVjdChjb2RlPzogbnVtYmVyKTogdm9pZDtcbiAgcG9uZygpOiB2b2lkO1xuICBpc1JlYWR5KCk6IGJvb2xlYW47XG4gIHdyaXRlKGRhdGE6IFVpbnQ4QXJyYXkpOiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgV2ViU29ja2V0SGF0aG9yYVRyYW5zcG9ydCBpbXBsZW1lbnRzIEhhdGhvcmFUcmFuc3BvcnQge1xuICBwcml2YXRlIHNvY2tldDogV2ViU29ja2V0O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgYXBwSWQ6IHN0cmluZykge1xuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChgd3NzOi8vJHtDT09SRElOQVRPUl9IT1NUfS8ke2FwcElkfWApO1xuICB9XG5cbiAgcHVibGljIGNvbm5lY3QoXG4gICAgc3RhdGVJZDogc3RyaW5nLFxuICAgIHRva2VuOiBzdHJpbmcsXG4gICAgb25EYXRhOiAoZGF0YTogQnVmZmVyKSA9PiB2b2lkLFxuICAgIG9uQ2xvc2U6IChlOiB7IGNvZGU6IG51bWJlcjsgcmVhc29uOiBzdHJpbmcgfSkgPT4gdm9pZFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5zb2NrZXQuYmluYXJ5VHlwZSA9IFwiYXJyYXlidWZmZXJcIjtcbiAgICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSBvbkNsb3NlO1xuICAgICAgdGhpcy5zb2NrZXQub25vcGVuID0gKCkgPT5cbiAgICAgICAgdGhpcy5zb2NrZXQuc2VuZChcbiAgICAgICAgICBuZXcgV3JpdGVyKClcbiAgICAgICAgICAgIC53cml0ZVVJbnQ4KDApXG4gICAgICAgICAgICAud3JpdGVTdHJpbmcodG9rZW4pXG4gICAgICAgICAgICAud3JpdGVVSW50NjQoWy4uLnN0YXRlSWRdLnJlZHVjZSgociwgdikgPT4gciAqIDM2biArIEJpZ0ludChwYXJzZUludCh2LCAzNikpLCAwbikpXG4gICAgICAgICAgICAudG9CdWZmZXIoKVxuICAgICAgICApO1xuICAgICAgdGhpcy5zb2NrZXQub25tZXNzYWdlID0gKHsgZGF0YSB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBSZWFkZXIobmV3IFVpbnQ4QXJyYXkoZGF0YSBhcyBBcnJheUJ1ZmZlcikpO1xuICAgICAgICBjb25zdCB0eXBlID0gcmVhZGVyLnJlYWRVSW50OCgpO1xuICAgICAgICBpZiAodHlwZSA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuc29ja2V0Lm9ubWVzc2FnZSA9ICh7IGRhdGEgfSkgPT4gb25EYXRhKGRhdGEgYXMgQnVmZmVyKTtcbiAgICAgICAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gb25DbG9zZTtcbiAgICAgICAgICBvbkRhdGEoZGF0YSBhcyBCdWZmZXIpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QoXCJVbmV4cGVjdGVkIG1lc3NhZ2UgdHlwZTogXCIgKyB0eXBlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBkaXNjb25uZWN0KGNvZGU/OiBudW1iZXIgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgICBpZiAoY29kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gKCkgPT4ge307XG4gICAgfVxuICAgIHRoaXMuc29ja2V0LmNsb3NlKGNvZGUpO1xuICB9XG5cbiAgcHVibGljIGlzUmVhZHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IHRoaXMuc29ja2V0Lk9QRU47XG4gIH1cblxuICBwdWJsaWMgd3JpdGUoZGF0YTogVWludDhBcnJheSk6IHZvaWQge1xuICAgIHRoaXMuc29ja2V0LnNlbmQoZGF0YSk7XG4gIH1cblxuICBwdWJsaWMgcG9uZygpIHtcbiAgICB0aGlzLnNvY2tldC5waW5nKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRDUEhhdGhvcmFUcmFuc3BvcnQgaW1wbGVtZW50cyBIYXRob3JhVHJhbnNwb3J0IHtcbiAgcHJpdmF0ZSBzb2NrZXQ6IG5ldC5Tb2NrZXQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBhcHBJZDogc3RyaW5nKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgbmV0LlNvY2tldCgpO1xuICB9XG5cbiAgcHVibGljIGNvbm5lY3QoXG4gICAgc3RhdGVJZDogc3RyaW5nLFxuICAgIHRva2VuOiBzdHJpbmcsXG4gICAgb25EYXRhOiAoZGF0YTogQnVmZmVyKSA9PiB2b2lkLFxuICAgIG9uQ2xvc2U6IChlOiB7IGNvZGU6IG51bWJlcjsgcmVhc29uOiBzdHJpbmcgfSkgPT4gdm9pZFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5zb2NrZXQuY29ubmVjdCg3MTQ4LCBDT09SRElOQVRPUl9IT1NUKTtcbiAgICAgIHRoaXMuc29ja2V0Lm9uKFwiY29ubmVjdFwiLCAoKSA9PlxuICAgICAgICB0aGlzLnNvY2tldC53cml0ZShcbiAgICAgICAgICBuZXcgV3JpdGVyKClcbiAgICAgICAgICAgIC53cml0ZVN0cmluZyh0b2tlbilcbiAgICAgICAgICAgIC53cml0ZVN0cmluZyh0aGlzLmFwcElkKVxuICAgICAgICAgICAgLndyaXRlVUludDY0KFsuLi5zdGF0ZUlkXS5yZWR1Y2UoKHIsIHYpID0+IHIgKiAzNm4gKyBCaWdJbnQocGFyc2VJbnQodiwgMzYpKSwgMG4pKVxuICAgICAgICAgICAgLnRvQnVmZmVyKClcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICAgIHRoaXMuc29ja2V0Lm9uY2UoXCJkYXRhXCIsIChkYXRhOiBCdWZmZXIpID0+IHtcbiAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IFJlYWRlcihuZXcgVWludDhBcnJheShkYXRhIGFzIEFycmF5QnVmZmVyKSk7XG4gICAgICAgIGNvbnN0IHR5cGUgPSByZWFkZXIucmVhZFVJbnQ4KCk7XG4gICAgICAgIGlmICh0eXBlID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5yZWFkVENQRGF0YShvbkRhdGEpO1xuICAgICAgICAgIHRoaXMuc29ja2V0Lm9uKFwiY2xvc2VcIiwgb25DbG9zZSk7XG4gICAgICAgICAgb25EYXRhKGRhdGEgYXMgQnVmZmVyKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KFwiVW5rbm93biBtZXNzYWdlIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIHdyaXRlKGRhdGE6IFVpbnQ4QXJyYXkpIHtcbiAgICB0aGlzLnNvY2tldC53cml0ZShcbiAgICAgIG5ldyBXcml0ZXIoKVxuICAgICAgICAud3JpdGVVSW50MzIoZGF0YS5sZW5ndGggKyAxKVxuICAgICAgICAud3JpdGVVSW50OCgwKVxuICAgICAgICAud3JpdGVCdWZmZXIoZGF0YSlcbiAgICAgICAgLnRvQnVmZmVyKClcbiAgICApO1xuICB9XG5cbiAgcHVibGljIGRpc2Nvbm5lY3QoY29kZT86IG51bWJlciB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICAgIHRoaXMuc29ja2V0LmRlc3Ryb3koKTtcbiAgfVxuXG4gIHB1YmxpYyBpc1JlYWR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNvY2tldC5yZWFkeVN0YXRlID09PSBcIm9wZW5cIjtcbiAgfVxuXG4gIHB1YmxpYyBwb25nKCk6IHZvaWQge1xuICAgIHRoaXMuc29ja2V0LndyaXRlKG5ldyBXcml0ZXIoKS53cml0ZVVJbnQzMigxKS53cml0ZVVJbnQ4KDEpLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSByZWFkVENQRGF0YShvbkRhdGE6IChkYXRhOiBCdWZmZXIpID0+IHZvaWQpIHtcbiAgICBsZXQgYnVmID0gQnVmZmVyLmFsbG9jKDApO1xuICAgIHRoaXMuc29ja2V0Lm9uKFwiZGF0YVwiLCAoZGF0YSkgPT4ge1xuICAgICAgYnVmID0gQnVmZmVyLmNvbmNhdChbYnVmLCBkYXRhXSk7XG4gICAgICB3aGlsZSAoYnVmLmxlbmd0aCA+PSA0KSB7XG4gICAgICAgIGNvbnN0IGJ1ZkxlbiA9IGJ1Zi5yZWFkVUludDMyQkUoKTtcbiAgICAgICAgaWYgKGJ1Zi5sZW5ndGggPCA0ICsgYnVmTGVuKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG9uRGF0YShidWYuc2xpY2UoNCwgNCArIGJ1ZkxlbikpO1xuICAgICAgICBidWYgPSBidWYuc2xpY2UoNCArIGJ1Zkxlbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiIsIi8qIChpZ25vcmVkKSAqLyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubmMgPSB1bmRlZmluZWQ7IiwiaW1wb3J0ICcuL3N0eWxlLmNzcyc7XG5pbXBvcnQgeyBVSSwgVUlWaWV3IH0gZnJvbSAncGVhc3ktdWknO1xuaW1wb3J0IHsgSGF0aG9yYUNsaWVudCwgSGF0aG9yYUNvbm5lY3Rpb24sIFVwZGF0ZUFyZ3MgfSBmcm9tICcuLi8uLi8uaGF0aG9yYS9jbGllbnQnO1xuaW1wb3J0IHsgQW5vbnltb3VzVXNlckRhdGEgfSBmcm9tICcuLi8uLi8uLi9hcGkvYmFzZSc7XG5cbmNvbnN0IG15QXBwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ215QXBwJyk7XG5sZXQgaW50ZXJ2YWxJRDogTm9kZUpTLlRpbWVyO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogSGF0aG9yYSBDbGllbnQgdmFyaWFibGVzXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuY29uc3QgY2xpZW50ID0gbmV3IEhhdGhvcmFDbGllbnQoKTtcbmxldCB0b2tlbjogc3RyaW5nO1xubGV0IHVzZXI6IEFub255bW91c1VzZXJEYXRhO1xubGV0IG15Q29ubmVjdGlvbjogSGF0aG9yYUNvbm5lY3Rpb247XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBIYXRob3JhOiBCcm9hZGNhc3QgRXZlbnRzIGZyb20gc2VydmVyXG4gKiBUaGUgc2VydmVyIGNhbiBicm9hZGNhc3QsIG9yIHNlbmQgc3BlY2lmaWMgdXNlcnMgZXZlbnRzXG4gKiBGb3IgdGhpcyBnYW1lLCB0aGVyZSBhcmUgZm91ciBldmVudHMgdGhhdCB0aGUgc2VydmVyXG4gKiB0cmlnZ2VycywgUDEvUDIgam9pbmluZywgQmFsbCBhcnJpdmluZywgYW5kIEdhbWUgT3ZlclxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIEhhdGhvcmE6IHVwZGF0ZVN0YXRlIGlzIHJhbiBmcm9tIHdoZW4gdGhlIHNlcnZlciBoYXMgYSBjaGFuZ2UgaW5cbiAqIHN0YXRlLCBhbmQgdGhlIHNlcnZlciBuZWVkcyB0byBzeW5jaCBpdHMgZGF0YSB0byB0aGVcbiAqIGNsaWVudFxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxubGV0IHVwZGF0ZVN0YXRlID0gKHVwZGF0ZTogVXBkYXRlQXJncykgPT4ge1xuICAgIC8vdXBkYXRpbmcgc3RhdGVcbiAgICBtb2RlbC5wbGF5ZXIxcG9zID0gdXBkYXRlLnN0YXRlLnBsYXllcjFwb3NpdGlvbjtcbiAgICBtb2RlbC5wbGF5ZXIycG9zID0gdXBkYXRlLnN0YXRlLnBsYXllcjJwb3NpdGlvbjtcbiAgICBtb2RlbC5iYWxsID0gdXBkYXRlLnN0YXRlLmJhbGxwb3NpdGlvbjtcbiAgICBtb2RlbC5wMUxpdmVzID0gdXBkYXRlLnN0YXRlLnBsYXllcjFMaXZlcztcbiAgICBtb2RlbC5wMkxpdmVzID0gdXBkYXRlLnN0YXRlLnBsYXllcjJMaXZlcztcbiAgICAvL3Byb2Nlc3MgZXZlbnRzXG4gICAgaWYgKHVwZGF0ZS5ldmVudHMubGVuZ3RoKSB7XG4gICAgICAgIHVwZGF0ZS5ldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnUDInOlxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5wbGF5ZXIySm9pbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwucGxheWVyMUpvaW5lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLnN0YXJ0QnV0dG9uRGlzYWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdQMSc6XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLnBsYXllcjFKb2luZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdCYWxsJzpcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwuYmFsbHZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBtb2RlbC5zdGFydEJ1dHRvbkRpc2FibGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdHYW1lIE92ZXInOlxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5iYWxsdmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBtb2RlbC5wbGF5ZXIySm9pbmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLnBsYXllcjFKb2luZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ0dhbWUgT3ZlcicpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIGJpbmRLZXlib2FyZEV2ZW50c1xuICogY3JlYXRlcyB0aGUga2V5IHVwIGFuZCBrZXkgZG93biBldmVudHMgZm9yIHRoZSB1cCBhcnJvdyxcbiAqIHRoZSBkb3duIGFycm93LCBhbmQgdGhlIHNwYWNlYmFyXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuY29uc3QgYmluZEtleWJvYXJkRXZlbnRzID0gKCkgPT4ge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBlID0+IHtcbiAgICAgICAgc3dpdGNoIChlLmtleSkge1xuICAgICAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgICAgICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICAgICAgICAgKiBIYXRob3JhOiByZW1vdGUgcHJvY2VkdXJlIGNhbGwgKFJQQylcbiAgICAgICAgICAgICAgICAgKiBydW5zIHRoZSB1cGRhdGVQbGF5ZXJWZWxvY2l0eSBtZXRob2QgdGhhdCdzIG9uIHRoZSBzZXJ2ZXJcbiAgICAgICAgICAgICAgICAgKiBhbmQgcGFzc2VzIGEgdmVsb2NpdHkgVmVjdG9yIHRvIHRoZSBtZXRob2RcbiAgICAgICAgICAgICAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgICAgICAgICAgICAgIG15Q29ubmVjdGlvbi51cGRhdGVQbGF5ZXJWZWxvY2l0eSh7IHZlbG9jaXR5OiB7IHg6IDAsIHk6IC0xNSB9IH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICAvL2RpdHRvXG4gICAgICAgICAgICAgICAgbXlDb25uZWN0aW9uLnVwZGF0ZVBsYXllclZlbG9jaXR5KHsgdmVsb2NpdHk6IHsgeDogMCwgeTogMTUgfSB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJyAnOlxuICAgICAgICAgICAgICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgICAgICAgICAgICogSGF0aG9yYTogcmVtb3RlIHByb2NlZHVyZSBjYWxsIChSUEMpXG4gICAgICAgICAgICAgICAgICogcnVucyB0aGUgc3RhcnRSb3VuZCBtZXRob2QgdGhhdCdzIG9uIHRoZSBzZXJ2ZXJcbiAgICAgICAgICAgICAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgICAgICAgICAgICAgIG15Q29ubmVjdGlvbi5zdGFydFJvdW5kKHt9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGUgPT4ge1xuICAgICAgICBzd2l0Y2ggKGUua2V5KSB7XG4gICAgICAgICAgICBjYXNlICdBcnJvd1VwJzpcbiAgICAgICAgICAgICAgICAvL2RpdHRvXG4gICAgICAgICAgICAgICAgbXlDb25uZWN0aW9uLnVwZGF0ZVBsYXllclZlbG9jaXR5KHsgdmVsb2NpdHk6IHsgeDogMCwgeTogMCB9IH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICAvL2RpdHRvXG4gICAgICAgICAgICAgICAgbXlDb25uZWN0aW9uLnVwZGF0ZVBsYXllclZlbG9jaXR5KHsgdmVsb2NpdHk6IHsgeDogMCwgeTogMCB9IH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogUGVhc3ktVUk6IGNyZWF0ZSBVSSBTdHJpbmcgVGVtcGxhdGVcbiAqIHRoaXMgdGVtcGxhdGUgc3RyaW5nIGZvcm1zIHRoZSBpbmplY3RlZCBIVE1MIHRlbXBsYXRlXG4gKiB0aGF0IFBlYXN5LVVJIHVzZXMuICBUaGlzIGlzIHBhcnNlZCwgYWxvbmcgd2l0aCB0aGVcbiAqIGRhdGEgYW5kIGV2ZW50IGJpbmRpbmdzIGNhbGxlZCBvdXRcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuY29uc3QgdGVtcGxhdGUgPSBgXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImluc3RydWN0aW9uc1wiPlBvbmcgPHNwYW4gXFwkez09PXNob3dJRH0+IC0+IEdhbWUgSUQ6IFxcJHtnYW1lSUR9PC9zcGFuPiA8c3BhbiBcXCR7PT09c2hvd1VzZXJ9PiAtPiBVc2VyOiBcXCR7dXNlcm5hbWV9PC9zcGFuPjwvZGl2PlxuICAgICAgICAgIFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IHNtYWxsX3dpZHRoXCI+XG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiYnRuTG9naW5cIiBjbGFzcz1cImJ1dHRvblwiIFxcJHtjbGlja0A9PmxvZ2lufSBcXCR7ZGlzYWJsZWQgPD09IGxvZ2luQnV0dG9uRGlzYWJsZX0+TG9naW48L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IHN0YXJ0TGVmdCBsYXJnZV93aWR0aFwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImJ0bkNyZWF0ZUdhbWVcIiBjbGFzcz1cImJ1dHRvblwiIFxcJHtjbGlja0A9PmNyZWF0ZX0gXFwke2Rpc2FibGVkIDw9PSBjcmVhdGVCdXR0b25EaXNhYmxlfT5DcmVhdGUgR2FtZTwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImJ0bkNvbm5lY3RHYW1lXCIgY2xhc3M9XCJidXR0b25cIiBcXCR7Y2xpY2tAPT5jb25uZWN0fSBcXCR7ZGlzYWJsZWQgPD09IGNvbm5lY3RCdXR0b25EaXNhYmxlfT5Db25uZWN0IEdhbWU8L2J1dHRvbj5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJnYW1lSm9pbklEXCI+R2FtZSBJRDwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgaWQ9XCJnYW1lSm9pbklEXCIgdHlwZT1cInRleHRcIiBcXCR7dmFsdWUgPD0+IGdhbWVJRH0+PC9pbnB1dD5cbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJidG5Db3B5XCIgY2xhc3M9XCJidXR0b25cIiBcXCR7Y2xpY2tAPT5jb3B5fSB9PkNvcHk8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IHN0YXJ0TGVmdCBsYXJnZV93aWR0aFwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImJ0bkpvaW5HYW1lXCIgY2xhc3M9XCJidXR0b25cIiBcXCR7Y2xpY2tAPT5qb2lufSBcXCR7ZGlzYWJsZWQgPD09IGpvaW5CdXR0b25EaXNhYmxlfT5Kb2luIEdhbWU8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJidG5TdGFydEdhbWVcIiAgY2xhc3M9XCJidXR0b25cIiBcXCR7Y2xpY2tAPT5zdGFydH0gXFwke2Rpc2FibGVkIDw9PSBzdGFydEJ1dHRvbkRpc2FibGV9PlN0YXJ0IEdhbWU8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbnN0cnVjdGlvbnNcIj5VcC9Eb3duIGFycm93cyBtb3ZlIHBhZGRsZSwgc3BhY2ViYXIgbGF1bmNoZXMgYmFsbDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBpZD0ncGxheUFyZWEnIGNsYXNzPVwiZ2FtZUFyZWFcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwMXNjb3JlXCIgXFwkeyA9PT0gcGxheWVyMUpvaW5lZH0gPlAxOiBMaXZlczogXFwke3AxTGl2ZXN9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicDJzY29yZVwiIFxcJHsgPT09IHBsYXllcjJKb2luZWR9PlAyOiBMaXZlczogXFwke3AyTGl2ZXN9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGlkPVwicDFcIiBcXCR7ID09PSBwbGF5ZXIxSm9pbmVkfSBjbGFzcz1cInAxXCIgc3R5bGU9XCJ0cmFuc2Zvcm06IHRyYW5zbGF0ZShcXCR7cGxheWVyMXBvcy54fXB4LFxcJHtwbGF5ZXIxcG9zLnl9cHgpXCI+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGlkPVwicDJcIiBcXCR7ID09PSBwbGF5ZXIySm9pbmVkfSBjbGFzcz1cInAyXCIgc3R5bGU9XCJ0cmFuc2Zvcm06IHRyYW5zbGF0ZShcXCR7cGxheWVyMnBvcy54fXB4LFxcJHtwbGF5ZXIycG9zLnl9cHgpXCI+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGlkPVwiYmFsbFwiIFxcJHsgPT09IGJhbGx2aXNpYmxlfSBjbGFzcz1cImJhbGxcIiBzdHlsZT1cInRyYW5zZm9ybTogdHJhbnNsYXRlKFxcJHtiYWxsLnh9cHgsXFwke2JhbGwueX1weClcIj48L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICBgO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogUGVhc3ktVUk6IGRhdGEgbW9kZWwgb2JqZWN0XG4gKiB0aGlzIG9iamVjdCBvdXRsaW5lcyBhbGwgdGhlIG1vbml0b3JlZCBkYXRhIGJpbmRpbmdzXG4gKiBhbmQgZXZlbnRzIGZvciB0aGUgc3RyaW5nIHRlbXBsYXRlXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuY29uc3QgbW9kZWwgPSB7XG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgKiBIYXRob3JhOiBsb2dpbkFub255bW91cygpIGFuZCBnZXRVc2VyRnJvbVRva2VuKCkgbWV0aG9kc1xuICAgICAqIHRoaXMgdXNlcyBzZXNzaW9uU3RvcmFnZSBmb3IgdGhlIGJyb3dzZXIgdG8gc3RvcmUgdG9rZW5cbiAgICAgKiBpZiB0b2tlbiBkb2Vzbid0IGV4aXN0LCBpdCBsb2dzIGludG8gSGF0aG9yYSBjb29yZGluYXRvclxuICAgICAqIGFuZCBjcmVhdGVzIG5ldyBhY2Nlc3MgdG9rZW5cbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIGxvZ2luOiBhc3luYyAoZXZlbnQsIG1vZGVsKSA9PiB7XG4gICAgICAgIGlmIChzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpID09PSBudWxsKSB7XG4gICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd0b2tlbicsIGF3YWl0IGNsaWVudC5sb2dpbkFub255bW91cygpKTtcbiAgICAgICAgfVxuICAgICAgICB0b2tlbiA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJyk7XG4gICAgICAgIHVzZXIgPSBIYXRob3JhQ2xpZW50LmdldFVzZXJGcm9tVG9rZW4odG9rZW4pO1xuICAgICAgICBtb2RlbC51c2VybmFtZSA9IHVzZXIubmFtZTtcbiAgICAgICAgbW9kZWwuY3JlYXRlQnV0dG9uRGlzYWJsZSA9IGZhbHNlO1xuICAgICAgICBtb2RlbC5jb25uZWN0QnV0dG9uRGlzYWJsZSA9IGZhbHNlO1xuICAgIH0sXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgKiBIYXRob3JhOiBjcmVhdGUoKSBhbmQgY29ubmVjdCgpIG1ldGhvZHNcbiAgICAgKiB0aGlzIGlzIGNhbGxlZCB3aGVuIHRoZSBjcmVhdGUgbmV3IGdhbWUgYnV0dG9uIGlzIHByZXNzZWRcbiAgICAgKiBhbmQgY3JlYXRlcyBhIG5ldyBnYW1lIGluc3RhbmNlIGZyb20gdGhlIEhhdGhvcmEgc2VydmVyXG4gICAgICogdGhlbiBzdWJzZXF1ZW50bHkgcnVucyB0aGUgY29ubmVjdCBtZXRob2QsIGVzdGFibGlzaGluZ1xuICAgICAqIHRoZSBteUNvbm5lY3Rpb24gb2JqZWN0LCB3aGljaCB3ZSB1c2UgdG8gY29tbXVuaWNhdGVcbiAgICAgKiBiZXR3ZWVuIHRoZSBjbGllbnQgYW5kIHRoZSBzZXJ2ZXJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIGNyZWF0ZTogYXN5bmMgKGV2ZW50LCBtb2RlbCkgPT4ge1xuICAgICAgICBtb2RlbC5nYW1lSUQgPSBhd2FpdCBjbGllbnQuY3JlYXRlKHRva2VuLCB7fSk7XG4gICAgICAgIG1vZGVsLnRpdGxlID0gbW9kZWwuZ2FtZUlEO1xuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgJycsIGAvJHttb2RlbC5nYW1lSUR9YCk7XG4gICAgICAgIG15Q29ubmVjdGlvbiA9IGF3YWl0IGNsaWVudC5jb25uZWN0KHRva2VuLCBtb2RlbC5nYW1lSUQpO1xuXG4gICAgICAgIG15Q29ubmVjdGlvbi5vblVwZGF0ZSh1cGRhdGVTdGF0ZSk7XG4gICAgICAgIG15Q29ubmVjdGlvbi5vbkVycm9yKGNvbnNvbGUuZXJyb3IpO1xuICAgICAgICAvL21hbmFnZSBVSSBhY2Nlc3NcbiAgICAgICAgbW9kZWwuam9pbkJ1dHRvbkRpc2FibGUgPSBmYWxzZTtcbiAgICAgICAgbW9kZWwuY3JlYXRlQnV0dG9uRGlzYWJsZSA9IHRydWU7XG4gICAgICAgIG1vZGVsLmNvbm5lY3RCdXR0b25EaXNhYmxlID0gdHJ1ZTtcbiAgICB9LFxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICogSGF0aG9yYTogY29ubmVjdCgpIG1ldGhvZHNcbiAgICAgKiBydW5zIHRoZSBjb25uZWN0IG1ldGhvZCwgZXN0YWJsaXNoaW5nXG4gICAgICogdGhlIG15Q29ubmVjdGlvbiBvYmplY3QsIHdoaWNoIHdlIHVzZSB0byBjb21tdW5pY2F0ZVxuICAgICAqIGJldHdlZW4gdGhlIGNsaWVudCBhbmQgdGhlIHNlcnZlclxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgY29ubmVjdDogYXN5bmMgKGV2ZW50LCBtb2RlbCkgPT4ge1xuICAgICAgICBteUNvbm5lY3Rpb24gPSBhd2FpdCBjbGllbnQuY29ubmVjdCh0b2tlbiwgbW9kZWwuZ2FtZUlEKTtcblxuICAgICAgICBtb2RlbC50aXRsZSA9IGAtPiBHYW1lIElEOiAke21vZGVsLmdhbWVJRH1gO1xuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgJycsIGAvJHttb2RlbC5nYW1lSUR9YCk7XG4gICAgICAgIG15Q29ubmVjdGlvbi5vblVwZGF0ZSh1cGRhdGVTdGF0ZSk7XG4gICAgICAgIG15Q29ubmVjdGlvbi5vbkVycm9yKGNvbnNvbGUuZXJyb3IpO1xuICAgICAgICAvL21hbmFnZSBVSSBhY2Nlc3NcbiAgICAgICAgbW9kZWwuam9pbkJ1dHRvbkRpc2FibGUgPSBmYWxzZTtcbiAgICAgICAgbW9kZWwuY3JlYXRlQnV0dG9uRGlzYWJsZSA9IHRydWU7XG4gICAgICAgIG1vZGVsLmNvbm5lY3RCdXR0b25EaXNhYmxlID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgKiBIYXRob3JhOiByZW1vdGUgcHJvY2VkdXJlIGNhbGwgKFJQQylcbiAgICAgKiBydW5zIHRoZSBqb2luR2FtZSBtZXRob2QgdGhhdCdzIG9uIHRoZSBzZXJ2ZXJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIGpvaW46IChldmVudCwgbW9kZWwpID0+IHtcbiAgICAgICAgbXlDb25uZWN0aW9uLmpvaW5HYW1lKHt9KTtcbiAgICAgICAgYmluZEtleWJvYXJkRXZlbnRzKCk7XG4gICAgICAgIC8vbWFuYWdlIFVJIGFjY2Vzc1xuICAgICAgICBtb2RlbC5qb2luQnV0dG9uRGlzYWJsZSA9IHRydWU7XG4gICAgfSxcblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICogSGF0aG9yYTogcmVtb3RlIHByb2NlZHVyZSBjYWxsIChSUEMpXG4gICAgICogcnVucyB0aGUgc3RhcnRHYW1lIG1ldGhvZCB0aGF0J3Mgb24gdGhlIHNlcnZlclxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgc3RhcnQ6IChldmVudCwgbW9kZWwpID0+IHtcbiAgICAgICAgbXlDb25uZWN0aW9uLnN0YXJ0R2FtZSh7fSk7XG4gICAgICAgIC8vbWFuYWdlIFVJIGFjY2Vzc1xuICAgICAgICBtb2RlbC5zdGFydEJ1dHRvbkRpc2FibGUgPSB0cnVlO1xuICAgIH0sXG4gICAgLy9jb3BpZXMgaW5wdXQgdGV4dCB0byBjbGlwYm9hcmRcbiAgICBjb3B5OiAoKSA9PiB7XG4gICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KG1vZGVsLmdhbWVJRCk7XG4gICAgfSxcblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICogUGVhc3ktVUk6IGRhdGEgYmluZGluZ3NcbiAgICAgKiB0aGVzZSB2YWx1ZXMgYXJlIHRpZWQgaW50byB0aGUgVUkgc3BlY2lmaWNhbGx5XG4gICAgICogZWl0aGVyIGRhdGEgZmllbGRzIGxpa2UgdGl0bGUsIHAxTGl2ZXMsIGFuZCBnYW1lSURcbiAgICAgKiBvciBDU1MgdmFsdWVzLCBsaWtlIHBsYXllcjJwb3NcbiAgICAgKiBvciBhdHRyaWJ1dGVzIGZvciB2aXNpYmlsaXR5IGFuZCBkaXNhYmxlZCBvZiB0aGUgVUlcbiAgICAgKiBidXR0b25zLiAgQWxzbyBzaG93biBpcyB0aGUgYWJpbGl0eSB0byBhYnN0cmFjdCB0aGVcbiAgICAgKiBldmFsdWF0aW9uIG9mIHRoZSBib29sZWFucyB1c2luZyBhIGdldHRlciwgc3VjaCBhcyB0aGVcbiAgICAgKiBsb2dpbiBidXR0b24gZGlzYWJsZSBjb2RlIGJlbG93XG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICB0aXRsZTogJycsXG4gICAgZ2FtZUlEOiAnJyxcbiAgICB1c2VybmFtZTogJycsXG4gICAgcGxheWVyMXBvczogeyB4OiAxNSwgeTogMTAgfSxcbiAgICBwbGF5ZXIycG9zOiB7IHg6IDU3NSwgeTogMTAgfSxcbiAgICBiYWxsOiB7IHg6IDI1LCB5OiAyNSB9LFxuICAgIHAxTGl2ZXM6IDMsXG4gICAgcDJMaXZlczogMyxcbiAgICBnZXQgbG9naW5CdXR0b25EaXNhYmxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51c2VybmFtZS5sZW5ndGggPiAwO1xuICAgIH0sXG4gICAgZ2V0IHNob3dJRCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZUlELmxlbmd0aCA+IDA7XG4gICAgfSxcbiAgICBnZXQgc2hvd1VzZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVzZXJuYW1lLmxlbmd0aCA+IDA7XG4gICAgfSxcbiAgICBjcmVhdGVCdXR0b25EaXNhYmxlOiB0cnVlLFxuICAgIGNvbm5lY3RCdXR0b25EaXNhYmxlOiB0cnVlLFxuICAgIGpvaW5CdXR0b25EaXNhYmxlOiB0cnVlLFxuICAgIHN0YXJ0QnV0dG9uRGlzYWJsZTogdHJ1ZSxcbiAgICBwbGF5ZXIxSm9pbmVkOiBmYWxzZSxcbiAgICBwbGF5ZXIySm9pbmVkOiBmYWxzZSxcbiAgICBiYWxsdmlzaWJsZTogZmFsc2UsXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogQ3JlYXRlIFVJIFZpZXcsIGFuZCBtb3VudCB0aGUgaW5qZWN0ZWQgSFRNTFxuICogeW91IHBhc3MgdGhlIHBhcmVudCBlbGVtZW50LCB0aGUgc3RyaW5nIHRlbXBsYXRlLCBhbmRcbiAqIHRoZSBkYXRhIG1vZGVsIG9iamVjdCB0byBVSS5jcmVhdGUoKVxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmxldCBteVVJOiBVSVZpZXc7XG5teVVJID0gVUkuY3JlYXRlKG15QXBwLCB0ZW1wbGF0ZSwgbW9kZWwpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogUGVhc3ktVUk6IFVJLnVwZGF0ZSgpXG4gKiBUaGlzIG1ldGhvZCB0cmlnZ2VycyB0aGUgZnJhbWV3b3JrIHRvIG1vbml0b3IgZm9yXG4gKiBjaGFuZ2VzIGluIHN0YXRlIGFuZCB0aGVuIGF1dG9tYXRpY2FsbHkgdXBkYXRlcyB0aGUgVUlcbiAqIHdpdGggdGhlIG5ldyBkYXRhLCByZWNvbW1lbmVkIHRvIGJlIGNhbGxlZCBvbiBpbnRlcnZhbFxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbmludGVydmFsSUQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgVUkudXBkYXRlKCk7XG59LCAxMDAwIC8gNjApO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9