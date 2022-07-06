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
___CSS_LOADER_EXPORT___.push([module.id, "/*style.css*/\r\nbody {\r\n    box-sizing: border-box;\r\n    margin: 0;\r\n    padding: 0;\r\n}\r\n\r\n.ball {\r\n    position: absolute;\r\n    width: 15px;\r\n    height: 15px;\r\n    top: 0px;\r\n    left: 0px;\r\n    background-color: #fff;\r\n    border-radius: 50%;\r\n    transition: transform 0.1s linear;\r\n}\r\n\r\n.p1score {\r\n    position: absolute;\r\n    width: 75px;\r\n    height: 15px;\r\n    bottom: 5px;\r\n    left: 10px;\r\n    font-family: Arial;\r\n    font-size: 12px;\r\n    opacity: 0.5;\r\n}\r\n\r\n.p2score {\r\n    position: absolute;\r\n    width: 75px;\r\n    height: 15px;\r\n    bottom: 5px;\r\n    right: 10px;\r\n    font-family: Arial;\r\n    font-size: 12px;\r\n    opacity: 0.5;\r\n}\r\n\r\n.p1 {\r\n    position: absolute;\r\n    width: 10px;\r\n    height: 48px;\r\n    top: 0px;\r\n    left: 0px;\r\n    background-color: #fff;\r\n    transition: transform 0.1s linear;\r\n}\r\n\r\n.p2 {\r\n    position: absolute;\r\n    width: 10px;\r\n    height: 48px;\r\n    top: 0px;\r\n    left: 0px;\r\n    background-color: #fff;\r\n    transition: transform 0.1s linear;\r\n}\r\n\r\n.flex {\r\n    display: flex;\r\n}\r\n\r\n.small_width {\r\n    width: 15%;\r\n}\r\n\r\n.medium_width {\r\n    width: 25%;\r\n}\r\n\r\n.large_width {\r\n    width: 60%;\r\n}\r\n\r\n.spacedEqual {\r\n    justify-content: space-around;\r\n    align-items: center;\r\n}\r\n\r\n.startLeft {\r\n    justify-content: flex-start;\r\n    align-items: center;\r\n}\r\n\r\ninput {\r\n    height: 30px;\r\n}\r\n\r\n.button {\r\n    background-color: #224887;\r\n    border: 1px solid #224887;\r\n    color: white;\r\n    padding: 10px 32px;\r\n    text-align: center;\r\n    text-decoration: none;\r\n    font-size: 16px;\r\n    margin: 15px;\r\n}\r\n\r\n.button:hover {\r\n    background-color: white;\r\n    color: #224887;\r\n}\r\n\r\n.button:disabled {\r\n    background-color: gray;\r\n    color: black;\r\n}\r\n\r\nlabel {\r\n    margin-left: 10px;\r\n    margin-right: 10px;\r\n    width: 50px;\r\n}\r\n\r\n.gameArea {\r\n    position: relative;\r\n    background-color: #000000;\r\n    width: 600px;\r\n    height: 400px;\r\n    margin-top: 15px;\r\n    margin-left: 15px;\r\n    border: none;\r\n    color: white;\r\n    text-align: center;\r\n    text-decoration: none;\r\n    display: inline-block;\r\n    font-size: 16px;\r\n}\r\n\r\n.instructions {\r\n    margin: 15px;\r\n    font-family: Arial;\r\n    font-size: x-large;\r\n    font-weight: bold;\r\n    color: #224887;\r\n}\r\n", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"AAAA,YAAY;AACZ;IACI,sBAAsB;IACtB,SAAS;IACT,UAAU;AACd;;AAEA;IACI,kBAAkB;IAClB,WAAW;IACX,YAAY;IACZ,QAAQ;IACR,SAAS;IACT,sBAAsB;IACtB,kBAAkB;IAClB,iCAAiC;AACrC;;AAEA;IACI,kBAAkB;IAClB,WAAW;IACX,YAAY;IACZ,WAAW;IACX,UAAU;IACV,kBAAkB;IAClB,eAAe;IACf,YAAY;AAChB;;AAEA;IACI,kBAAkB;IAClB,WAAW;IACX,YAAY;IACZ,WAAW;IACX,WAAW;IACX,kBAAkB;IAClB,eAAe;IACf,YAAY;AAChB;;AAEA;IACI,kBAAkB;IAClB,WAAW;IACX,YAAY;IACZ,QAAQ;IACR,SAAS;IACT,sBAAsB;IACtB,iCAAiC;AACrC;;AAEA;IACI,kBAAkB;IAClB,WAAW;IACX,YAAY;IACZ,QAAQ;IACR,SAAS;IACT,sBAAsB;IACtB,iCAAiC;AACrC;;AAEA;IACI,aAAa;AACjB;;AAEA;IACI,UAAU;AACd;;AAEA;IACI,UAAU;AACd;;AAEA;IACI,UAAU;AACd;;AAEA;IACI,6BAA6B;IAC7B,mBAAmB;AACvB;;AAEA;IACI,2BAA2B;IAC3B,mBAAmB;AACvB;;AAEA;IACI,YAAY;AAChB;;AAEA;IACI,yBAAyB;IACzB,yBAAyB;IACzB,YAAY;IACZ,kBAAkB;IAClB,kBAAkB;IAClB,qBAAqB;IACrB,eAAe;IACf,YAAY;AAChB;;AAEA;IACI,uBAAuB;IACvB,cAAc;AAClB;;AAEA;IACI,sBAAsB;IACtB,YAAY;AAChB;;AAEA;IACI,iBAAiB;IACjB,kBAAkB;IAClB,WAAW;AACf;;AAEA;IACI,kBAAkB;IAClB,yBAAyB;IACzB,YAAY;IACZ,aAAa;IACb,gBAAgB;IAChB,iBAAiB;IACjB,YAAY;IACZ,YAAY;IACZ,kBAAkB;IAClB,qBAAqB;IACrB,qBAAqB;IACrB,eAAe;AACnB;;AAEA;IACI,YAAY;IACZ,kBAAkB;IAClB,kBAAkB;IAClB,iBAAiB;IACjB,cAAc;AAClB","sourcesContent":["/*style.css*/\r\nbody {\r\n    box-sizing: border-box;\r\n    margin: 0;\r\n    padding: 0;\r\n}\r\n\r\n.ball {\r\n    position: absolute;\r\n    width: 15px;\r\n    height: 15px;\r\n    top: 0px;\r\n    left: 0px;\r\n    background-color: #fff;\r\n    border-radius: 50%;\r\n    transition: transform 0.1s linear;\r\n}\r\n\r\n.p1score {\r\n    position: absolute;\r\n    width: 75px;\r\n    height: 15px;\r\n    bottom: 5px;\r\n    left: 10px;\r\n    font-family: Arial;\r\n    font-size: 12px;\r\n    opacity: 0.5;\r\n}\r\n\r\n.p2score {\r\n    position: absolute;\r\n    width: 75px;\r\n    height: 15px;\r\n    bottom: 5px;\r\n    right: 10px;\r\n    font-family: Arial;\r\n    font-size: 12px;\r\n    opacity: 0.5;\r\n}\r\n\r\n.p1 {\r\n    position: absolute;\r\n    width: 10px;\r\n    height: 48px;\r\n    top: 0px;\r\n    left: 0px;\r\n    background-color: #fff;\r\n    transition: transform 0.1s linear;\r\n}\r\n\r\n.p2 {\r\n    position: absolute;\r\n    width: 10px;\r\n    height: 48px;\r\n    top: 0px;\r\n    left: 0px;\r\n    background-color: #fff;\r\n    transition: transform 0.1s linear;\r\n}\r\n\r\n.flex {\r\n    display: flex;\r\n}\r\n\r\n.small_width {\r\n    width: 15%;\r\n}\r\n\r\n.medium_width {\r\n    width: 25%;\r\n}\r\n\r\n.large_width {\r\n    width: 60%;\r\n}\r\n\r\n.spacedEqual {\r\n    justify-content: space-around;\r\n    align-items: center;\r\n}\r\n\r\n.startLeft {\r\n    justify-content: flex-start;\r\n    align-items: center;\r\n}\r\n\r\ninput {\r\n    height: 30px;\r\n}\r\n\r\n.button {\r\n    background-color: #224887;\r\n    border: 1px solid #224887;\r\n    color: white;\r\n    padding: 10px 32px;\r\n    text-align: center;\r\n    text-decoration: none;\r\n    font-size: 16px;\r\n    margin: 15px;\r\n}\r\n\r\n.button:hover {\r\n    background-color: white;\r\n    color: #224887;\r\n}\r\n\r\n.button:disabled {\r\n    background-color: gray;\r\n    color: black;\r\n}\r\n\r\nlabel {\r\n    margin-left: 10px;\r\n    margin-right: 10px;\r\n    width: 50px;\r\n}\r\n\r\n.gameArea {\r\n    position: relative;\r\n    background-color: #000000;\r\n    width: 600px;\r\n    height: 400px;\r\n    margin-top: 15px;\r\n    margin-left: 15px;\r\n    border: none;\r\n    color: white;\r\n    text-align: center;\r\n    text-decoration: none;\r\n    display: inline-block;\r\n    font-size: 16px;\r\n}\r\n\r\n.instructions {\r\n    margin: 15px;\r\n    font-family: Arial;\r\n    font-size: x-large;\r\n    font-weight: bold;\r\n    color: #224887;\r\n}\r\n"],"sourceRoot":""}]);
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
        this.appId = "13d6e53c3bb8f9e7064ab0a2c3796c1c98f0a375fdb7b39610191c3f38eda5f8";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixpQkFBaUI7QUFDekM7QUFDQSw0QkFBNEIsT0FBTztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsZ0NBQWdD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cGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9hZGFwdGVycy94aHIuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsVG9rZW4uanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9BeGlvcy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvYnVpbGRGdWxsUGF0aC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9kaXNwYXRjaFJlcXVlc3QuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL21lcmdlQ29uZmlnLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZW52L2RhdGEuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb21iaW5lVVJMcy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBeGlvc0Vycm9yLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvdmFsaWRhdG9yLmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi91dGlscy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy9iaW4tc2VyZGUvbGliL2luZGV4LmpzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvbm9kZV9tb2R1bGVzL3V0ZjgtYnVmZmVyLXNpemUvbWFpbi5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLi4vYXBpL25vZGVfbW9kdWxlcy91dGY4LWJ1ZmZlci9pbmRleC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2luZGV4LmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9heGlvcy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9BeGlvcy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9jcmVhdGVFcnJvci5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL21lcmdlQ29uZmlnLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvdHJhbnNmb3JtRGF0YS5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9lbnYvZGF0YS5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2JpbmQuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9idWlsZFVSTC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0F4aW9zRXJyb3IuanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc1VSTFNhbWVPcmlnaW4uanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvc3ByZWFkLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvdmFsaWRhdG9yLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvYmluLXNlcmRlL2xpYi9pbmRleC5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2dldC1yYW5kb20tdmFsdWVzL2luZGV4LmpzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS9ub2RlX21vZHVsZXMvZ2xvYmFsL3dpbmRvdy5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2lzb21vcnBoaWMtd3MvYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvbm9kZV9tb2R1bGVzL2p3dC1kZWNvZGUvYnVpbGQvand0LWRlY29kZS5lc20uanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy9uZXQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy91dGY4LWJ1ZmZlci1zaXplL21haW4uanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL25vZGVfbW9kdWxlcy91dGY4LWJ1ZmZlci9pbmRleC5qcyIsIndlYnBhY2s6Ly93ZWIvLi9zcmMvc3R5bGUuY3NzIiwid2VicGFjazovL3dlYi8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vd2ViLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vd2ViLy4vbm9kZV9tb2R1bGVzL3BlYXN5LXVpL2Rpc3QvaW5kZXguanMiLCJ3ZWJwYWNrOi8vd2ViLy4vc3JjL3N0eWxlLmNzcz83MTYzIiwid2VicGFjazovL3dlYi8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly93ZWIvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL3dlYi8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly93ZWIvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vd2ViLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vd2ViLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy4uL2FwaS9iYXNlLnRzIiwid2VicGFjazovL3dlYi8uLi8uLi9hcGkvdHlwZXMudHMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL2NsaWVudC50cyIsIndlYnBhY2s6Ly93ZWIvLi4vLmhhdGhvcmEvZmFpbHVyZXMudHMiLCJ3ZWJwYWNrOi8vd2ViLy4uLy5oYXRob3JhL3BhdGNoLnRzIiwid2VicGFjazovL3dlYi8uLi8uaGF0aG9yYS90cmFuc3BvcnQudHMiLCJ3ZWJwYWNrOi8vd2ViL2lnbm9yZWR8QzpcXHByb2dyYW1taW5nXFxQb25nIEhhdGhvcmFQZWFzeVxcY2xpZW50XFwuaGF0aG9yYVxcbm9kZV9tb2R1bGVzXFxnZXQtcmFuZG9tLXZhbHVlc3xjcnlwdG8iLCJ3ZWJwYWNrOi8vd2ViL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dlYi93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly93ZWIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3dlYi93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL3dlYi93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3dlYi93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dlYi93ZWJwYWNrL3J1bnRpbWUvbm9uY2UiLCJ3ZWJwYWNrOi8vd2ViLy4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvYXhpb3MnKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBzZXR0bGUgPSByZXF1aXJlKCcuLy4uL2NvcmUvc2V0dGxlJyk7XG52YXIgY29va2llcyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9jb29raWVzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBidWlsZEZ1bGxQYXRoID0gcmVxdWlyZSgnLi4vY29yZS9idWlsZEZ1bGxQYXRoJyk7XG52YXIgcGFyc2VIZWFkZXJzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL3BhcnNlSGVhZGVycycpO1xudmFyIGlzVVJMU2FtZU9yaWdpbiA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9pc1VSTFNhbWVPcmlnaW4nKTtcbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4uL2NvcmUvY3JlYXRlRXJyb3InKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL0NhbmNlbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG4gICAgdmFyIHJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgdmFyIG9uQ2FuY2VsZWQ7XG4gICAgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnVuc3Vic2NyaWJlKG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29uZmlnLnNpZ25hbCkge1xuICAgICAgICBjb25maWcuc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25DYW5jZWxlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgPyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSA6ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICBmdW5jdGlvbiBvbmxvYWRlbmQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhcmVzcG9uc2VUeXBlIHx8IHJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnIHx8ICByZXNwb25zZVR5cGUgPT09ICdqc29uJyA/XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShmdW5jdGlvbiBfcmVzb2x2ZSh2YWx1ZSkge1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSwgZnVuY3Rpb24gX3JlamVjdChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0sIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCdvbmxvYWRlbmQnIGluIHJlcXVlc3QpIHtcbiAgICAgIC8vIFVzZSBvbmxvYWRlbmQgaWYgYXZhaWxhYmxlXG4gICAgICByZXF1ZXN0Lm9ubG9hZGVuZCA9IG9ubG9hZGVuZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZSB0byBlbXVsYXRlIG9ubG9hZGVuZFxuICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlYWR5c3RhdGUgaGFuZGxlciBpcyBjYWxsaW5nIGJlZm9yZSBvbmVycm9yIG9yIG9udGltZW91dCBoYW5kbGVycyxcbiAgICAgICAgLy8gc28gd2Ugc2hvdWxkIGNhbGwgb25sb2FkZW5kIG9uIHRoZSBuZXh0ICd0aWNrJ1xuICAgICAgICBzZXRUaW1lb3V0KG9ubG9hZGVuZCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0ID8gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyA6ICd0aW1lb3V0IGV4Y2VlZGVkJztcbiAgICAgIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsIHx8IGRlZmF1bHRzLnRyYW5zaXRpb25hbDtcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgdHJhbnNpdGlvbmFsLmNsYXJpZnlUaW1lb3V0RXJyb3IgPyAnRVRJTUVET1VUJyA6ICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKHJlc3BvbnNlVHlwZSAmJiByZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4gfHwgY29uZmlnLnNpZ25hbCkge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgICAgIG9uQ2FuY2VsZWQgPSBmdW5jdGlvbihjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJlamVjdCghY2FuY2VsIHx8IChjYW5jZWwgJiYgY2FuY2VsLnR5cGUpID8gbmV3IENhbmNlbCgnY2FuY2VsZWQnKSA6IGNhbmNlbCk7XG4gICAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgICB9O1xuXG4gICAgICBjb25maWcuY2FuY2VsVG9rZW4gJiYgY29uZmlnLmNhbmNlbFRva2VuLnN1YnNjcmliZShvbkNhbmNlbGVkKTtcbiAgICAgIGlmIChjb25maWcuc2lnbmFsKSB7XG4gICAgICAgIGNvbmZpZy5zaWduYWwuYWJvcnRlZCA/IG9uQ2FuY2VsZWQoKSA6IGNvbmZpZy5zaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBvbkNhbmNlbGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXJlcXVlc3REYXRhKSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gU2VuZCB0aGUgcmVxdWVzdFxuICAgIHJlcXVlc3Quc2VuZChyZXF1ZXN0RGF0YSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xudmFyIEF4aW9zID0gcmVxdWlyZSgnLi9jb3JlL0F4aW9zJyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL2NvcmUvbWVyZ2VDb25maWcnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmYXVsdENvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICogQHJldHVybiB7QXhpb3N9IEEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRDb25maWcpIHtcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXhpb3MoZGVmYXVsdENvbmZpZyk7XG4gIHZhciBpbnN0YW5jZSA9IGJpbmQoQXhpb3MucHJvdG90eXBlLnJlcXVlc3QsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgYXhpb3MucHJvdG90eXBlIHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgQXhpb3MucHJvdG90eXBlLCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGNvbnRleHQgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBjb250ZXh0KTtcblxuICAvLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG4gIGluc3RhbmNlLmNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpbnN0YW5jZUNvbmZpZykge1xuICAgIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhkZWZhdWx0Q29uZmlnLCBpbnN0YW5jZUNvbmZpZykpO1xuICB9O1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcbmF4aW9zLlZFUlNJT04gPSByZXF1aXJlKCcuL2Vudi9kYXRhJykudmVyc2lvbjtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxuLy8gRXhwb3NlIGlzQXhpb3NFcnJvclxuYXhpb3MuaXNBeGlvc0Vycm9yID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzQXhpb3NFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi9DYW5jZWwnKTtcblxuLyoqXG4gKiBBIGBDYW5jZWxUb2tlbmAgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gb3BlcmF0aW9uLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZXhlY3V0b3IgVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBDYW5jZWxUb2tlbihleGVjdXRvcikge1xuICBpZiAodHlwZW9mIGV4ZWN1dG9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXhlY3V0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIHJlc29sdmVQcm9taXNlO1xuXG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHRoaXMucHJvbWlzZS50aGVuKGZ1bmN0aW9uKGNhbmNlbCkge1xuICAgIGlmICghdG9rZW4uX2xpc3RlbmVycykgcmV0dXJuO1xuXG4gICAgdmFyIGk7XG4gICAgdmFyIGwgPSB0b2tlbi5fbGlzdGVuZXJzLmxlbmd0aDtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRva2VuLl9saXN0ZW5lcnNbaV0oY2FuY2VsKTtcbiAgICB9XG4gICAgdG9rZW4uX2xpc3RlbmVycyA9IG51bGw7XG4gIH0pO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHRoaXMucHJvbWlzZS50aGVuID0gZnVuY3Rpb24ob25mdWxmaWxsZWQpIHtcbiAgICB2YXIgX3Jlc29sdmU7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgIHRva2VuLnN1YnNjcmliZShyZXNvbHZlKTtcbiAgICAgIF9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICB9KS50aGVuKG9uZnVsZmlsbGVkKTtcblxuICAgIHByb21pc2UuY2FuY2VsID0gZnVuY3Rpb24gcmVqZWN0KCkge1xuICAgICAgdG9rZW4udW5zdWJzY3JpYmUoX3Jlc29sdmUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfTtcblxuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBTdWJzY3JpYmUgdG8gdGhlIGNhbmNlbCBzaWduYWxcbiAqL1xuXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIGxpc3RlbmVyKHRoaXMucmVhc29uKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAodGhpcy5fbGlzdGVuZXJzKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2xpc3RlbmVycyA9IFtsaXN0ZW5lcl07XG4gIH1cbn07XG5cbi8qKlxuICogVW5zdWJzY3JpYmUgZnJvbSB0aGUgY2FuY2VsIHNpZ25hbFxuICovXG5cbkNhbmNlbFRva2VuLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uIHVuc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gIGlmICghdGhpcy5fbGlzdGVuZXJzKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpbmRleCA9IHRoaXMuX2xpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgIHRoaXMuX2xpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIEludGVyY2VwdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vSW50ZXJjZXB0b3JNYW5hZ2VyJyk7XG52YXIgZGlzcGF0Y2hSZXF1ZXN0ID0gcmVxdWlyZSgnLi9kaXNwYXRjaFJlcXVlc3QnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vbWVyZ2VDb25maWcnKTtcbnZhciB2YWxpZGF0b3IgPSByZXF1aXJlKCcuLi9oZWxwZXJzL3ZhbGlkYXRvcicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHZhbGlkYXRvci52YWxpZGF0b3JzO1xuLyoqXG4gKiBDcmVhdGUgYSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaW5zdGFuY2VDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gQXhpb3MoaW5zdGFuY2VDb25maWcpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IGluc3RhbmNlQ29uZmlnO1xuICB0aGlzLmludGVyY2VwdG9ycyA9IHtcbiAgICByZXF1ZXN0OiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKCksXG4gICAgcmVzcG9uc2U6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKVxuICB9O1xufVxuXG4vKipcbiAqIERpc3BhdGNoIGEgcmVxdWVzdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyBzcGVjaWZpYyBmb3IgdGhpcyByZXF1ZXN0IChtZXJnZWQgd2l0aCB0aGlzLmRlZmF1bHRzKVxuICovXG5BeGlvcy5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnc3RyaW5nJykge1xuICAgIGNvbmZpZyA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcbiAgICBjb25maWcudXJsID0gYXJndW1lbnRzWzBdO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgdmFyIHRyYW5zaXRpb25hbCA9IGNvbmZpZy50cmFuc2l0aW9uYWw7XG5cbiAgaWYgKHRyYW5zaXRpb25hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFsaWRhdG9yLmFzc2VydE9wdGlvbnModHJhbnNpdGlvbmFsLCB7XG4gICAgICBzaWxlbnRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKSxcbiAgICAgIGZvcmNlZEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4pLFxuICAgICAgY2xhcmlmeVRpbWVvdXRFcnJvcjogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKVxuICAgIH0sIGZhbHNlKTtcbiAgfVxuXG4gIC8vIGZpbHRlciBvdXQgc2tpcHBlZCBpbnRlcmNlcHRvcnNcbiAgdmFyIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHZhciBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSB0cnVlO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBpZiAodHlwZW9mIGludGVyY2VwdG9yLnJ1bldoZW4gPT09ICdmdW5jdGlvbicgJiYgaW50ZXJjZXB0b3IucnVuV2hlbihjb25maWcpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyAmJiBpbnRlcmNlcHRvci5zeW5jaHJvbm91cztcblxuICAgIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHByb21pc2U7XG5cbiAgaWYgKCFzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMpIHtcbiAgICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuXG4gICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuYXBwbHkoY2hhaW4sIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluKTtcbiAgICBjaGFpbiA9IGNoYWluLmNvbmNhdChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4pO1xuXG4gICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuICAgIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuXG4gIHZhciBuZXdDb25maWcgPSBjb25maWc7XG4gIHdoaWxlIChyZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5sZW5ndGgpIHtcbiAgICB2YXIgb25GdWxmaWxsZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHZhciBvblJlamVjdGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB0cnkge1xuICAgICAgbmV3Q29uZmlnID0gb25GdWxmaWxsZWQobmV3Q29uZmlnKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgb25SZWplY3RlZChlcnJvcik7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB0cnkge1xuICAgIHByb21pc2UgPSBkaXNwYXRjaFJlcXVlc3QobmV3Q29uZmlnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICB9XG5cbiAgd2hpbGUgKHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpLCByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbkF4aW9zLnByb3RvdHlwZS5nZXRVcmkgPSBmdW5jdGlvbiBnZXRVcmkoY29uZmlnKSB7XG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG4gIHJldHVybiBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplcikucmVwbGFjZSgvXlxcPy8sICcnKTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdvcHRpb25zJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IChjb25maWcgfHwge30pLmRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCwgb3B0aW9ucykge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZCxcbiAgICBzeW5jaHJvbm91czogb3B0aW9ucyA/IG9wdGlvbnMuc3luY2hyb25vdXMgOiBmYWxzZSxcbiAgICBydW5XaGVuOiBvcHRpb25zID8gb3B0aW9ucy5ydW5XaGVuIDogbnVsbFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9DYW5jZWwnKTtcblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5mdW5jdGlvbiB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgY29uZmlnLmNhbmNlbFRva2VuLnRocm93SWZSZXF1ZXN0ZWQoKTtcbiAgfVxuXG4gIGlmIChjb25maWcuc2lnbmFsICYmIGNvbmZpZy5zaWduYWwuYWJvcnRlZCkge1xuICAgIHRocm93IG5ldyBDYW5jZWwoJ2NhbmNlbGVkJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgIGNvbmZpZyxcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgY29uZmlnLFxuICAgICAgcmVzcG9uc2UuZGF0YSxcbiAgICAgIHJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9LCBmdW5jdGlvbiBvbkFkYXB0ZXJSZWplY3Rpb24ocmVhc29uKSB7XG4gICAgaWYgKCFpc0NhbmNlbChyZWFzb24pKSB7XG4gICAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgICBpZiAocmVhc29uICYmIHJlYXNvbi5yZXNwb25zZSkge1xuICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgZXJyb3IuaXNBeGlvc0Vycm9yID0gdHJ1ZTtcblxuICBlcnJvci50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFN0YW5kYXJkXG4gICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAvLyBNaWNyb3NvZnRcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgbnVtYmVyOiB0aGlzLm51bWJlcixcbiAgICAgIC8vIE1vemlsbGFcbiAgICAgIGZpbGVOYW1lOiB0aGlzLmZpbGVOYW1lLFxuICAgICAgbGluZU51bWJlcjogdGhpcy5saW5lTnVtYmVyLFxuICAgICAgY29sdW1uTnVtYmVyOiB0aGlzLmNvbHVtbk51bWJlcixcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLFxuICAgICAgLy8gQXhpb3NcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBjb2RlOiB0aGlzLmNvZGUsXG4gICAgICBzdGF0dXM6IHRoaXMucmVzcG9uc2UgJiYgdGhpcy5yZXNwb25zZS5zdGF0dXMgPyB0aGlzLnJlc3BvbnNlLnN0YXR1cyA6IG51bGxcbiAgICB9O1xuICB9O1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIG1lcmdlRGlyZWN0S2V5cyhwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB2YXIgbWVyZ2VNYXAgPSB7XG4gICAgJ3VybCc6IHZhbHVlRnJvbUNvbmZpZzIsXG4gICAgJ21ldGhvZCc6IHZhbHVlRnJvbUNvbmZpZzIsXG4gICAgJ2RhdGEnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdiYXNlVVJMJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndHJhbnNmb3JtUmVxdWVzdCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RyYW5zZm9ybVJlc3BvbnNlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncGFyYW1zU2VyaWFsaXplcic6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RpbWVvdXQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0aW1lb3V0TWVzc2FnZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3dpdGhDcmVkZW50aWFscyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2FkYXB0ZXInOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdyZXNwb25zZVR5cGUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd4c3JmQ29va2llTmFtZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnb25VcGxvYWRQcm9ncmVzcyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ29uRG93bmxvYWRQcm9ncmVzcyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2RlY29tcHJlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnbWF4Qm9keUxlbmd0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RyYW5zcG9ydCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2h0dHBBZ2VudCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2h0dHBzQWdlbnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdjYW5jZWxUb2tlbic6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3NvY2tldFBhdGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdyZXNwb25zZUVuY29kaW5nJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndmFsaWRhdGVTdGF0dXMnOiBtZXJnZURpcmVjdEtleXNcbiAgfTtcblxuICB1dGlscy5mb3JFYWNoKE9iamVjdC5rZXlzKGNvbmZpZzEpLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSksIGZ1bmN0aW9uIGNvbXB1dGVDb25maWdWYWx1ZShwcm9wKSB7XG4gICAgdmFyIG1lcmdlID0gbWVyZ2VNYXBbcHJvcF0gfHwgbWVyZ2VEZWVwUHJvcGVydGllcztcbiAgICB2YXIgY29uZmlnVmFsdWUgPSBtZXJnZShwcm9wKTtcbiAgICAodXRpbHMuaXNVbmRlZmluZWQoY29uZmlnVmFsdWUpICYmIG1lcmdlICE9PSBtZXJnZURpcmVjdEtleXMpIHx8IChjb25maWdbcHJvcF0gPSBjb25maWdWYWx1ZSk7XG4gIH0pO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICBpZiAoIXJlc3BvbnNlLnN0YXR1cyB8fCAhdmFsaWRhdGVTdGF0dXMgfHwgdmFsaWRhdGVTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICB9IGVsc2Uge1xuICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICdSZXF1ZXN0IGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlICcgKyByZXNwb25zZS5zdGF0dXMsXG4gICAgICByZXNwb25zZS5jb25maWcsXG4gICAgICBudWxsLFxuICAgICAgcmVzcG9uc2UucmVxdWVzdCxcbiAgICAgIHJlc3BvbnNlXG4gICAgKSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGEgcmVxdWVzdCBvciBhIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHRyYW5zZm9ybWVkXG4gKiBAcGFyYW0ge0FycmF5fSBoZWFkZXJzIFRoZSBoZWFkZXJzIGZvciB0aGUgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbn0gZm5zIEEgc2luZ2xlIGZ1bmN0aW9uIG9yIEFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHRpbmcgdHJhbnNmb3JtZWQgZGF0YVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoZGF0YSwgaGVhZGVycywgZm5zKSB7XG4gIHZhciBjb250ZXh0ID0gdGhpcyB8fCBkZWZhdWx0cztcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4uY2FsbChjb250ZXh0LCBkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgbm9ybWFsaXplSGVhZGVyTmFtZSA9IHJlcXVpcmUoJy4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9jb3JlL2VuaGFuY2VFcnJvcicpO1xuXG52YXIgREVGQVVMVF9DT05URU5UX1RZUEUgPSB7XG4gICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJ1xufTtcblxuZnVuY3Rpb24gc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsIHZhbHVlKSB7XG4gIGlmICghdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVycykgJiYgdXRpbHMuaXNVbmRlZmluZWQoaGVhZGVyc1snQ29udGVudC1UeXBlJ10pKSB7XG4gICAgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QWRhcHRlcigpIHtcbiAgdmFyIGFkYXB0ZXI7XG4gIGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gRm9yIGJyb3dzZXJzIHVzZSBYSFIgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy9odHRwJyk7XG4gIH1cbiAgcmV0dXJuIGFkYXB0ZXI7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeVNhZmVseShyYXdWYWx1ZSwgcGFyc2VyLCBlbmNvZGVyKSB7XG4gIGlmICh1dGlscy5pc1N0cmluZyhyYXdWYWx1ZSkpIHtcbiAgICB0cnkge1xuICAgICAgKHBhcnNlciB8fCBKU09OLnBhcnNlKShyYXdWYWx1ZSk7XG4gICAgICByZXR1cm4gdXRpbHMudHJpbShyYXdWYWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUubmFtZSAhPT0gJ1N5bnRheEVycm9yJykge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoZW5jb2RlciB8fCBKU09OLnN0cmluZ2lmeSkocmF3VmFsdWUpO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cbiAgdHJhbnNpdGlvbmFsOiB7XG4gICAgc2lsZW50SlNPTlBhcnNpbmc6IHRydWUsXG4gICAgZm9yY2VkSlNPTlBhcnNpbmc6IHRydWUsXG4gICAgY2xhcmlmeVRpbWVvdXRFcnJvcjogZmFsc2VcbiAgfSxcblxuICBhZGFwdGVyOiBnZXREZWZhdWx0QWRhcHRlcigpLFxuXG4gIHRyYW5zZm9ybVJlcXVlc3Q6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXF1ZXN0KGRhdGEsIGhlYWRlcnMpIHtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdBY2NlcHQnKTtcbiAgICBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsICdDb250ZW50LVR5cGUnKTtcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0FycmF5QnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0J1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNTdHJlYW0oZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzRmlsZShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCbG9iKGRhdGEpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzQXJyYXlCdWZmZXJWaWV3KGRhdGEpKSB7XG4gICAgICByZXR1cm4gZGF0YS5idWZmZXI7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhkYXRhKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD11dGYtOCcpO1xuICAgICAgcmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzT2JqZWN0KGRhdGEpIHx8IChoZWFkZXJzICYmIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID09PSAnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIHJldHVybiBzdHJpbmdpZnlTYWZlbHkoZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICB0cmFuc2Zvcm1SZXNwb25zZTogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlc3BvbnNlKGRhdGEpIHtcbiAgICB2YXIgdHJhbnNpdGlvbmFsID0gdGhpcy50cmFuc2l0aW9uYWwgfHwgZGVmYXVsdHMudHJhbnNpdGlvbmFsO1xuICAgIHZhciBzaWxlbnRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuc2lsZW50SlNPTlBhcnNpbmc7XG4gICAgdmFyIGZvcmNlZEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5mb3JjZWRKU09OUGFyc2luZztcbiAgICB2YXIgc3RyaWN0SlNPTlBhcnNpbmcgPSAhc2lsZW50SlNPTlBhcnNpbmcgJiYgdGhpcy5yZXNwb25zZVR5cGUgPT09ICdqc29uJztcblxuICAgIGlmIChzdHJpY3RKU09OUGFyc2luZyB8fCAoZm9yY2VkSlNPTlBhcnNpbmcgJiYgdXRpbHMuaXNTdHJpbmcoZGF0YSkgJiYgZGF0YS5sZW5ndGgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKHN0cmljdEpTT05QYXJzaW5nKSB7XG4gICAgICAgICAgaWYgKGUubmFtZSA9PT0gJ1N5bnRheEVycm9yJykge1xuICAgICAgICAgICAgdGhyb3cgZW5oYW5jZUVycm9yKGUsIHRoaXMsICdFX0pTT05fUEFSU0UnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICAvKipcbiAgICogQSB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyB0byBhYm9ydCBhIHJlcXVlc3QuIElmIHNldCB0byAwIChkZWZhdWx0KSBhXG4gICAqIHRpbWVvdXQgaXMgbm90IGNyZWF0ZWQuXG4gICAqL1xuICB0aW1lb3V0OiAwLFxuXG4gIHhzcmZDb29raWVOYW1lOiAnWFNSRi1UT0tFTicsXG4gIHhzcmZIZWFkZXJOYW1lOiAnWC1YU1JGLVRPS0VOJyxcblxuICBtYXhDb250ZW50TGVuZ3RoOiAtMSxcbiAgbWF4Qm9keUxlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfSxcblxuICBoZWFkZXJzOiB7XG4gICAgY29tbW9uOiB7XG4gICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKidcbiAgICB9XG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4yNC4wXCJcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWwpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgcmVwbGFjZSgvJTIwL2csICcrJykuXG4gICAgcmVwbGFjZSgvJTVCL2dpLCAnWycpLlxuICAgIHJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCBieSBhcHBlbmRpbmcgcGFyYW1zIHRvIHRoZSBlbmRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBiYXNlIG9mIHRoZSB1cmwgKGUuZy4sIGh0dHA6Ly93d3cuZ29vZ2xlLmNvbSlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcGFyYW1zXSBUaGUgcGFyYW1zIHRvIGJlIGFwcGVuZGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZm9ybWF0dGVkIHVybFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkVVJMKHVybCwgcGFyYW1zLCBwYXJhbXNTZXJpYWxpemVyKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICBpZiAoIXBhcmFtcykge1xuICAgIHJldHVybiB1cmw7XG4gIH1cblxuICB2YXIgc2VyaWFsaXplZFBhcmFtcztcbiAgaWYgKHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zU2VyaWFsaXplcihwYXJhbXMpO1xuICB9IGVsc2UgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykpIHtcbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFyYW1zLnRvU3RyaW5nKCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHBhcnRzID0gW107XG5cbiAgICB1dGlscy5mb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gc2VyaWFsaXplKHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHV0aWxzLmlzQXJyYXkodmFsKSkge1xuICAgICAgICBrZXkgPSBrZXkgKyAnW10nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gW3ZhbF07XG4gICAgICB9XG5cbiAgICAgIHV0aWxzLmZvckVhY2godmFsLCBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcbiAgICAgICAgaWYgKHV0aWxzLmlzRGF0ZSh2KSkge1xuICAgICAgICAgIHYgPSB2LnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QodikpIHtcbiAgICAgICAgICB2ID0gSlNPTi5zdHJpbmdpZnkodik7XG4gICAgICAgIH1cbiAgICAgICAgcGFydHMucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2KSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJ0cy5qb2luKCcmJyk7XG4gIH1cblxuICBpZiAoc2VyaWFsaXplZFBhcmFtcykge1xuICAgIHZhciBoYXNobWFya0luZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcbiAgICBpZiAoaGFzaG1hcmtJbmRleCAhPT0gLTEpIHtcbiAgICAgIHVybCA9IHVybC5zbGljZSgwLCBoYXNobWFya0luZGV4KTtcbiAgICB9XG5cbiAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIH1cblxuICByZXR1cm4gdXJsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIHN1cHBvcnQgZG9jdW1lbnQuY29va2llXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZShuYW1lLCB2YWx1ZSwgZXhwaXJlcywgcGF0aCwgZG9tYWluLCBzZWN1cmUpIHtcbiAgICAgICAgICB2YXIgY29va2llID0gW107XG4gICAgICAgICAgY29va2llLnB1c2gobmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzTnVtYmVyKGV4cGlyZXMpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZXhwaXJlcz0nICsgbmV3IERhdGUoZXhwaXJlcykudG9HTVRTdHJpbmcoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKHBhdGgpKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgncGF0aD0nICsgcGF0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGRvbWFpbikpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdkb21haW49JyArIGRvbWFpbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlY3VyZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3NlY3VyZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZS5qb2luKCc7ICcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQobmFtZSkge1xuICAgICAgICAgIHZhciBtYXRjaCA9IGRvY3VtZW50LmNvb2tpZS5tYXRjaChuZXcgUmVnRXhwKCcoXnw7XFxcXHMqKSgnICsgbmFtZSArICcpPShbXjtdKiknKSk7XG4gICAgICAgICAgcmV0dXJuIChtYXRjaCA/IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFszXSkgOiBudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gICAgICAgICAgdGhpcy53cml0ZShuYW1lLCAnJywgRGF0ZS5ub3coKSAtIDg2NDAwMDAwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnYgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHdyaXRlOiBmdW5jdGlvbiB3cml0ZSgpIHt9LFxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKCkgeyByZXR1cm4gbnVsbDsgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvc1xuICpcbiAqIEBwYXJhbSB7Kn0gcGF5bG9hZCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0F4aW9zRXJyb3IocGF5bG9hZCkge1xuICByZXR1cm4gKHR5cGVvZiBwYXlsb2FkID09PSAnb2JqZWN0JykgJiYgKHBheWxvYWQuaXNBeGlvc0Vycm9yID09PSB0cnVlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFZFUlNJT04gPSByZXF1aXJlKCcuLi9lbnYvZGF0YScpLnZlcnNpb247XG5cbnZhciB2YWxpZGF0b3JzID0ge307XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5bJ29iamVjdCcsICdib29sZWFuJywgJ251bWJlcicsICdmdW5jdGlvbicsICdzdHJpbmcnLCAnc3ltYm9sJ10uZm9yRWFjaChmdW5jdGlvbih0eXBlLCBpKSB7XG4gIHZhbGlkYXRvcnNbdHlwZV0gPSBmdW5jdGlvbiB2YWxpZGF0b3IodGhpbmcpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nID09PSB0eXBlIHx8ICdhJyArIChpIDwgMSA/ICduICcgOiAnICcpICsgdHlwZTtcbiAgfTtcbn0pO1xuXG52YXIgZGVwcmVjYXRlZFdhcm5pbmdzID0ge307XG5cbi8qKlxuICogVHJhbnNpdGlvbmFsIG9wdGlvbiB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7ZnVuY3Rpb258Ym9vbGVhbj99IHZhbGlkYXRvciAtIHNldCB0byBmYWxzZSBpZiB0aGUgdHJhbnNpdGlvbmFsIG9wdGlvbiBoYXMgYmVlbiByZW1vdmVkXG4gKiBAcGFyYW0ge3N0cmluZz99IHZlcnNpb24gLSBkZXByZWNhdGVkIHZlcnNpb24gLyByZW1vdmVkIHNpbmNlIHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gbWVzc2FnZSAtIHNvbWUgbWVzc2FnZSB3aXRoIGFkZGl0aW9uYWwgaW5mb1xuICogQHJldHVybnMge2Z1bmN0aW9ufVxuICovXG52YWxpZGF0b3JzLnRyYW5zaXRpb25hbCA9IGZ1bmN0aW9uIHRyYW5zaXRpb25hbCh2YWxpZGF0b3IsIHZlcnNpb24sIG1lc3NhZ2UpIHtcbiAgZnVuY3Rpb24gZm9ybWF0TWVzc2FnZShvcHQsIGRlc2MpIHtcbiAgICByZXR1cm4gJ1tBeGlvcyB2JyArIFZFUlNJT04gKyAnXSBUcmFuc2l0aW9uYWwgb3B0aW9uIFxcJycgKyBvcHQgKyAnXFwnJyArIGRlc2MgKyAobWVzc2FnZSA/ICcuICcgKyBtZXNzYWdlIDogJycpO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvcHQsIG9wdHMpIHtcbiAgICBpZiAodmFsaWRhdG9yID09PSBmYWxzZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdE1lc3NhZ2Uob3B0LCAnIGhhcyBiZWVuIHJlbW92ZWQnICsgKHZlcnNpb24gPyAnIGluICcgKyB2ZXJzaW9uIDogJycpKSk7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gJiYgIWRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdKSB7XG4gICAgICBkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSA9IHRydWU7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRNZXNzYWdlKFxuICAgICAgICAgIG9wdCxcbiAgICAgICAgICAnIGhhcyBiZWVuIGRlcHJlY2F0ZWQgc2luY2UgdicgKyB2ZXJzaW9uICsgJyBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZWFyIGZ1dHVyZSdcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdG9yID8gdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdHMpIDogdHJ1ZTtcbiAgfTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IG9iamVjdCdzIHByb3BlcnRpZXMgdHlwZVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBzY2hlbWFcbiAqIEBwYXJhbSB7Ym9vbGVhbj99IGFsbG93VW5rbm93blxuICovXG5cbmZ1bmN0aW9uIGFzc2VydE9wdGlvbnMob3B0aW9ucywgc2NoZW1hLCBhbGxvd1Vua25vd24pIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgfVxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9wdGlvbnMpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tID4gMCkge1xuICAgIHZhciBvcHQgPSBrZXlzW2ldO1xuICAgIHZhciB2YWxpZGF0b3IgPSBzY2hlbWFbb3B0XTtcbiAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICB2YXIgdmFsdWUgPSBvcHRpb25zW29wdF07XG4gICAgICB2YXIgcmVzdWx0ID0gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0aW9ucyk7XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiAnICsgb3B0ICsgJyBtdXN0IGJlICcgKyByZXN1bHQpO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChhbGxvd1Vua25vd24gIT09IHRydWUpIHtcbiAgICAgIHRocm93IEVycm9yKCdVbmtub3duIG9wdGlvbiAnICsgb3B0KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzc2VydE9wdGlvbnM6IGFzc2VydE9wdGlvbnMsXG4gIHZhbGlkYXRvcnM6IHZhbGlkYXRvcnNcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUmVhZGVyID0gZXhwb3J0cy5Xcml0ZXIgPSB2b2lkIDA7XG5jb25zdCB1dGY4ID0gcmVxdWlyZShcInV0ZjgtYnVmZmVyXCIpO1xuY29uc3QgdXRmOF9idWZmZXJfc2l6ZV8xID0gcmVxdWlyZShcInV0ZjgtYnVmZmVyLXNpemVcIik7XG5jb25zdCB7IHBhY2ssIHVucGFjayB9ID0gdXRmOC5kZWZhdWx0ID8/IHV0Zjg7XG5jbGFzcyBXcml0ZXIge1xuICAgIHBvcyA9IDA7XG4gICAgdmlldztcbiAgICBieXRlcztcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy52aWV3ID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcig2NCkpO1xuICAgICAgICB0aGlzLmJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkodGhpcy52aWV3LmJ1ZmZlcik7XG4gICAgfVxuICAgIHdyaXRlVUludDgodmFsKSB7XG4gICAgICAgIHRoaXMuZW5zdXJlU2l6ZSgxKTtcbiAgICAgICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMucG9zLCB2YWwpO1xuICAgICAgICB0aGlzLnBvcyArPSAxO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVVSW50MzIodmFsKSB7XG4gICAgICAgIHRoaXMuZW5zdXJlU2l6ZSg0KTtcbiAgICAgICAgdGhpcy52aWV3LnNldFVpbnQzMih0aGlzLnBvcywgdmFsKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlVUludDY0KHZhbCkge1xuICAgICAgICB0aGlzLmVuc3VyZVNpemUoOCk7XG4gICAgICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5wb3MsIHZhbCk7XG4gICAgICAgIHRoaXMucG9zICs9IDg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZVVWYXJpbnQodmFsKSB7XG4gICAgICAgIGlmICh2YWwgPCAweDgwKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoMSk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDgodGhpcy5wb3MsIHZhbCk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCA8IDB4NDAwMCkge1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKDIpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQxNih0aGlzLnBvcywgKHZhbCAmIDB4N2YpIHwgKCh2YWwgJiAweDNmODApIDw8IDEpIHwgMHg4MDAwKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IDI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIDwgMHgyMDAwMDApIHtcbiAgICAgICAgICAgIHRoaXMuZW5zdXJlU2l6ZSgzKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLnBvcywgKHZhbCA+PiAxNCkgfCAweDgwKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50MTYodGhpcy5wb3MgKyAxLCAodmFsICYgMHg3ZikgfCAoKHZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAweDgwMDApO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gMztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgPCAweDEwMDAwMDAwKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoNCk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDMyKHRoaXMucG9zLCAodmFsICYgMHg3ZikgfCAoKHZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAoKHZhbCAmIDB4MWZjMDAwKSA8PCAyKSB8ICgodmFsICYgMHhmZTAwMDAwKSA8PCAzKSB8IDB4ODA4MDgwMDApO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgPCAweDgwMDAwMDAwMCkge1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKDUpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMucG9zLCBNYXRoLmZsb29yKHZhbCAvIE1hdGgucG93KDIsIDI4KSkgfCAweDgwKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50MzIodGhpcy5wb3MgKyAxLCAodmFsICYgMHg3ZikgfCAoKHZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAoKHZhbCAmIDB4MWZjMDAwKSA8PCAyKSB8ICgodmFsICYgMHhmZTAwMDAwKSA8PCAzKSB8IDB4ODA4MDgwMDApO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gNTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgPCAweDQwMDAwMDAwMDAwKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoNik7XG4gICAgICAgICAgICBjb25zdCBzaGlmdGVkVmFsID0gTWF0aC5mbG9vcih2YWwgLyBNYXRoLnBvdygyLCAyOCkpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQxNih0aGlzLnBvcywgKHNoaWZ0ZWRWYWwgJiAweDdmKSB8ICgoc2hpZnRlZFZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAweDgwODApO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQzMih0aGlzLnBvcyArIDIsICh2YWwgJiAweDdmKSB8ICgodmFsICYgMHgzZjgwKSA8PCAxKSB8ICgodmFsICYgMHgxZmMwMDApIDw8IDIpIHwgKCh2YWwgJiAweGZlMDAwMDApIDw8IDMpIHwgMHg4MDgwODAwMCk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSA2O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVmFsdWUgb3V0IG9mIHJhbmdlXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZVZhcmludCh2YWwpIHtcbiAgICAgICAgY29uc3QgYmlndmFsID0gQmlnSW50KHZhbCk7XG4gICAgICAgIHRoaXMud3JpdGVVVmFyaW50KE51bWJlcigoYmlndmFsID4+IDYzbikgXiAoYmlndmFsIDw8IDFuKSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVGbG9hdCh2YWwpIHtcbiAgICAgICAgdGhpcy5lbnN1cmVTaXplKDQpO1xuICAgICAgICB0aGlzLnZpZXcuc2V0RmxvYXQzMih0aGlzLnBvcywgdmFsLCB0cnVlKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlQml0cyhiaXRzKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYml0cy5sZW5ndGg7IGkgKz0gOCkge1xuICAgICAgICAgICAgbGV0IGJ5dGUgPSAwO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA4OyBqKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaSArIGogPT0gYml0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJ5dGUgfD0gKGJpdHNbaSArIGpdID8gMSA6IDApIDw8IGo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLndyaXRlVUludDgoYnl0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlU3RyaW5nKHZhbCkge1xuICAgICAgICBpZiAodmFsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVTaXplID0gKDAsIHV0ZjhfYnVmZmVyX3NpemVfMS5kZWZhdWx0KSh2YWwpO1xuICAgICAgICAgICAgdGhpcy53cml0ZVVWYXJpbnQoYnl0ZVNpemUpO1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKGJ5dGVTaXplKTtcbiAgICAgICAgICAgIHBhY2sodmFsLCB0aGlzLmJ5dGVzLCB0aGlzLnBvcyk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSBieXRlU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMud3JpdGVVSW50OCgwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVCdWZmZXIoYnVmKSB7XG4gICAgICAgIHRoaXMuZW5zdXJlU2l6ZShidWYubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5ieXRlcy5zZXQoYnVmLCB0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zICs9IGJ1Zi5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB0b0J1ZmZlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnl0ZXMuc3ViYXJyYXkoMCwgdGhpcy5wb3MpO1xuICAgIH1cbiAgICBlbnN1cmVTaXplKHNpemUpIHtcbiAgICAgICAgd2hpbGUgKHRoaXMudmlldy5ieXRlTGVuZ3RoIDwgdGhpcy5wb3MgKyBzaXplKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdWaWV3ID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcih0aGlzLnZpZXcuYnl0ZUxlbmd0aCAqIDIpKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0J5dGVzID0gbmV3IFVpbnQ4QXJyYXkobmV3Vmlldy5idWZmZXIpO1xuICAgICAgICAgICAgbmV3Qnl0ZXMuc2V0KHRoaXMuYnl0ZXMpO1xuICAgICAgICAgICAgdGhpcy52aWV3ID0gbmV3VmlldztcbiAgICAgICAgICAgIHRoaXMuYnl0ZXMgPSBuZXdCeXRlcztcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuV3JpdGVyID0gV3JpdGVyO1xuY2xhc3MgUmVhZGVyIHtcbiAgICBwb3MgPSAwO1xuICAgIHZpZXc7XG4gICAgYnl0ZXM7XG4gICAgY29uc3RydWN0b3IoYnVmKSB7XG4gICAgICAgIHRoaXMudmlldyA9IG5ldyBEYXRhVmlldyhidWYuYnVmZmVyLCBidWYuYnl0ZU9mZnNldCwgYnVmLmJ5dGVMZW5ndGgpO1xuICAgICAgICB0aGlzLmJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkodGhpcy52aWV3LmJ1ZmZlciwgYnVmLmJ5dGVPZmZzZXQsIGJ1Zi5ieXRlTGVuZ3RoKTtcbiAgICB9XG4gICAgcmVhZFVJbnQ4KCkge1xuICAgICAgICBjb25zdCB2YWwgPSB0aGlzLnZpZXcuZ2V0VWludDgodGhpcy5wb3MpO1xuICAgICAgICB0aGlzLnBvcyArPSAxO1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZWFkVUludDMyKCkge1xuICAgICAgICBjb25zdCB2YWwgPSB0aGlzLnZpZXcuZ2V0VWludDMyKHRoaXMucG9zKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gNDtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgcmVhZFVJbnQ2NCgpIHtcbiAgICAgICAgY29uc3QgdmFsID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zICs9IDg7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHJlYWRVVmFyaW50KCkge1xuICAgICAgICBsZXQgdmFsID0gMDtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGxldCBieXRlID0gdGhpcy52aWV3LmdldFVpbnQ4KHRoaXMucG9zKyspO1xuICAgICAgICAgICAgaWYgKGJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbCArIGJ5dGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWwgPSAodmFsICsgKGJ5dGUgJiAweDdmKSkgKiAxMjg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVhZFZhcmludCgpIHtcbiAgICAgICAgY29uc3QgdmFsID0gQmlnSW50KHRoaXMucmVhZFVWYXJpbnQoKSk7XG4gICAgICAgIHJldHVybiBOdW1iZXIoKHZhbCA+PiAxbikgXiAtKHZhbCAmIDFuKSk7XG4gICAgfVxuICAgIHJlYWRGbG9hdCgpIHtcbiAgICAgICAgY29uc3QgdmFsID0gdGhpcy52aWV3LmdldEZsb2F0MzIodGhpcy5wb3MsIHRydWUpO1xuICAgICAgICB0aGlzLnBvcyArPSA0O1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZWFkQml0cyhudW1CaXRzKSB7XG4gICAgICAgIGNvbnN0IG51bUJ5dGVzID0gTWF0aC5jZWlsKG51bUJpdHMgLyA4KTtcbiAgICAgICAgY29uc3QgYnl0ZXMgPSB0aGlzLmJ5dGVzLnNsaWNlKHRoaXMucG9zLCB0aGlzLnBvcyArIG51bUJ5dGVzKTtcbiAgICAgICAgY29uc3QgYml0cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGJ5dGUgb2YgYnl0ZXMpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgOCAmJiBiaXRzLmxlbmd0aCA8IG51bUJpdHM7IGkrKykge1xuICAgICAgICAgICAgICAgIGJpdHMucHVzaCgoKGJ5dGUgPj4gaSkgJiAxKSA9PT0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3MgKz0gbnVtQnl0ZXM7XG4gICAgICAgIHJldHVybiBiaXRzO1xuICAgIH1cbiAgICByZWFkU3RyaW5nKCkge1xuICAgICAgICBjb25zdCBsZW4gPSB0aGlzLnJlYWRVVmFyaW50KCk7XG4gICAgICAgIGlmIChsZW4gPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbCA9IHVucGFjayh0aGlzLmJ5dGVzLCB0aGlzLnBvcywgdGhpcy5wb3MgKyBsZW4pO1xuICAgICAgICB0aGlzLnBvcyArPSBsZW47XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHJlYWRCdWZmZXIobnVtQnl0ZXMpIHtcbiAgICAgICAgY29uc3QgYnl0ZXMgPSB0aGlzLmJ5dGVzLnNsaWNlKHRoaXMucG9zLCB0aGlzLnBvcyArIG51bUJ5dGVzKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gbnVtQnl0ZXM7XG4gICAgICAgIHJldHVybiBieXRlcztcbiAgICB9XG4gICAgcmVtYWluaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy52aWV3LmJ5dGVMZW5ndGggLSB0aGlzLnBvcztcbiAgICB9XG59XG5leHBvcnRzLlJlYWRlciA9IFJlYWRlcjtcbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoYykgMjAxOCBSYWZhZWwgZGEgU2lsdmEgUm9jaGEuXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xyXG4gKiBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcclxuICogXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXHJcbiAqIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcclxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXHJcbiAqIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xyXG4gKiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXHJcbiAqIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxyXG4gKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcclxuICogTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcclxuICogTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxyXG4gKiBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXHJcbiAqIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxyXG4gKiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcblxyXG4vKipcclxuICogQGZpbGVvdmVydmlldyBUaGUgdXRmOC1idWZmZXItc2l6ZSBBUEkuXHJcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3JvY2hhcnMvdXRmOC1idWZmZXItc2l6ZVxyXG4gKi9cclxuXHJcbi8qKiBAbW9kdWxlIHV0ZjhCdWZmZXJTaXplICovXHJcblxyXG4vKipcclxuICogUmV0dXJucyBob3cgbWFueSBieXRlcyBhcmUgbmVlZGVkIHRvIHNlcmlhbGl6ZSBhIFVURi04IHN0cmluZy5cclxuICogQHNlZSBodHRwczovL2VuY29kaW5nLnNwZWMud2hhdHdnLm9yZy8jdXRmLTgtZW5jb2RlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdG8gcGFjay5cclxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgbnVtYmVyIG9mIGJ5dGVzIG5lZWRlZCB0byBzZXJpYWxpemUgdGhlIHN0cmluZy5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHV0ZjhCdWZmZXJTaXplKHN0cikge1xyXG4gIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gIGxldCBieXRlcyA9IDA7XHJcbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHN0ci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICBsZXQgY29kZVBvaW50ID0gc3RyLmNvZGVQb2ludEF0KGkpO1xyXG4gICAgaWYgKGNvZGVQb2ludCA8IDEyOCkge1xyXG4gICAgICBieXRlcysrO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGNvZGVQb2ludCA8PSAyMDQ3KSB7XHJcbiAgICAgICAgYnl0ZXMrKztcclxuICAgICAgfSBlbHNlIGlmKGNvZGVQb2ludCA8PSA2NTUzNSkge1xyXG4gICAgICAgIGJ5dGVzKz0yO1xyXG4gICAgICB9IGVsc2UgaWYoY29kZVBvaW50IDw9IDExMTQxMTEpIHtcclxuICAgICAgICBpKys7XHJcbiAgICAgICAgYnl0ZXMrPTM7XHJcbiAgICAgIH1cclxuICAgICAgYnl0ZXMrKztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGJ5dGVzO1xyXG59XHJcbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoYykgMjAxOCBSYWZhZWwgZGEgU2lsdmEgUm9jaGEuXHJcbiAqXHJcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xyXG4gKiBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcclxuICogXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXHJcbiAqIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcclxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXHJcbiAqIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xyXG4gKiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbiAqXHJcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXHJcbiAqIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4gKlxyXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxyXG4gKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcclxuICogTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcclxuICogTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRVxyXG4gKiBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXHJcbiAqIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxyXG4gKiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cclxuICpcclxuICovXHJcblxyXG4vKipcclxuICogQGZpbGVvdmVydmlldyBGdW5jdGlvbnMgdG8gc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBVVEYtOCBzdHJpbmdzLlxyXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9yb2NoYXJzL3V0ZjgtYnVmZmVyXHJcbiAqIEBzZWUgaHR0cHM6Ly9lbmNvZGluZy5zcGVjLndoYXR3Zy5vcmcvI3RoZS1lbmNvZGluZ1xyXG4gKiBAc2VlIGh0dHBzOi8vZW5jb2Rpbmcuc3BlYy53aGF0d2cub3JnLyN1dGYtOC1lbmNvZGVyXHJcbiAqL1xyXG5cclxuLyoqIEBtb2R1bGUgdXRmOC1idWZmZXIgKi9cclxuXHJcbi8qKlxyXG4gKiBSZWFkIGEgc3RyaW5nIG9mIFVURi04IGNoYXJhY3RlcnMgZnJvbSBhIGJ5dGUgYnVmZmVyLlxyXG4gKiBJbnZhbGlkIGNoYXJhY3RlcnMgYXJlIHJlcGxhY2VkIHdpdGggJ1JFUExBQ0VNRU5UIENIQVJBQ1RFUicgKFUrRkZGRCkuXHJcbiAqIEBzZWUgaHR0cHM6Ly9lbmNvZGluZy5zcGVjLndoYXR3Zy5vcmcvI3RoZS1lbmNvZGluZ1xyXG4gKiBAc2VlIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zNDkyNjkxMVxyXG4gKiBAcGFyYW0geyFVaW50OEFycmF5fCFBcnJheTxudW1iZXI+fSBidWZmZXIgQSBieXRlIGJ1ZmZlci5cclxuICogQHBhcmFtIHtudW1iZXI9fSBzdGFydCBUaGUgYnVmZmVyIGluZGV4IHRvIHN0YXJ0IHJlYWRpbmcuXHJcbiAqIEBwYXJhbSB7P251bWJlcj19IGVuZCBUaGUgYnVmZmVyIGluZGV4IHRvIHN0b3AgcmVhZGluZy5cclxuICogICBBc3N1bWVzIHRoZSBidWZmZXIgbGVuZ3RoIGlmIHVuZGVmaW5lZC5cclxuICogQHJldHVybiB7c3RyaW5nfVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHVucGFjayhidWZmZXIsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKSB7XHJcbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXHJcbiAgbGV0IHN0ciA9ICcnO1xyXG4gIGZvcihsZXQgaW5kZXggPSBzdGFydDsgaW5kZXggPCBlbmQ7KSB7XHJcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgIGxldCBsb3dlckJvdW5kYXJ5ID0gMHg4MDtcclxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgbGV0IHVwcGVyQm91bmRhcnkgPSAweEJGO1xyXG4gICAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xyXG4gICAgbGV0IHJlcGxhY2UgPSBmYWxzZTtcclxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgbGV0IGNoYXJDb2RlID0gYnVmZmVyW2luZGV4KytdO1xyXG4gICAgaWYgKGNoYXJDb2RlID49IDB4MDAgJiYgY2hhckNvZGUgPD0gMHg3Rikge1xyXG4gICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyQ29kZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgaWYgKGNoYXJDb2RlID49IDB4QzIgJiYgY2hhckNvZGUgPD0gMHhERikge1xyXG4gICAgICAgIGNvdW50ID0gMTtcclxuICAgICAgfSBlbHNlIGlmIChjaGFyQ29kZSA+PSAweEUwICYmIGNoYXJDb2RlIDw9IDB4RUYgKSB7XHJcbiAgICAgICAgY291bnQgPSAyO1xyXG4gICAgICAgIGlmIChidWZmZXJbaW5kZXhdID09PSAweEUwKSB7XHJcbiAgICAgICAgICBsb3dlckJvdW5kYXJ5ID0gMHhBMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGJ1ZmZlcltpbmRleF0gPT09IDB4RUQpIHtcclxuICAgICAgICAgIHVwcGVyQm91bmRhcnkgPSAweDlGO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChjaGFyQ29kZSA+PSAweEYwICYmIGNoYXJDb2RlIDw9IDB4RjQgKSB7XHJcbiAgICAgICAgY291bnQgPSAzO1xyXG4gICAgICAgIGlmIChidWZmZXJbaW5kZXhdID09PSAweEYwKSB7XHJcbiAgICAgICAgICBsb3dlckJvdW5kYXJ5ID0gMHg5MDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGJ1ZmZlcltpbmRleF0gPT09IDB4RjQpIHtcclxuICAgICAgICAgIHVwcGVyQm91bmRhcnkgPSAweDhGO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXBsYWNlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBjaGFyQ29kZSA9IGNoYXJDb2RlICYgKDEgPDwgKDggLSBjb3VudCAtIDEpKSAtIDE7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgIGlmIChidWZmZXJbaW5kZXhdIDwgbG93ZXJCb3VuZGFyeSB8fCBidWZmZXJbaW5kZXhdID4gdXBwZXJCb3VuZGFyeSkge1xyXG4gICAgICAgICAgcmVwbGFjZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNoYXJDb2RlID0gKGNoYXJDb2RlIDw8IDYpIHwgKGJ1ZmZlcltpbmRleF0gJiAweDNmKTtcclxuICAgICAgICBpbmRleCsrO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChyZXBsYWNlKSB7XHJcbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKTtcclxuICAgICAgfSBcclxuICAgICAgZWxzZSBpZiAoY2hhckNvZGUgPD0gMHhmZmZmKSB7XHJcbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoY2hhckNvZGUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNoYXJDb2RlIC09IDB4MTAwMDA7XHJcbiAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoXHJcbiAgICAgICAgICAoKGNoYXJDb2RlID4+IDEwKSAmIDB4M2ZmKSArIDB4ZDgwMCxcclxuICAgICAgICAgIChjaGFyQ29kZSAmIDB4M2ZmKSArIDB4ZGMwMCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHN0cjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFdyaXRlIGEgc3RyaW5nIG9mIFVURi04IGNoYXJhY3RlcnMgdG8gYSBieXRlIGJ1ZmZlci5cclxuICogQHNlZSBodHRwczovL2VuY29kaW5nLnNwZWMud2hhdHdnLm9yZy8jdXRmLTgtZW5jb2RlclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdG8gcGFjay5cclxuICogQHBhcmFtIHshVWludDhBcnJheXwhQXJyYXk8bnVtYmVyPn0gYnVmZmVyIFRoZSBidWZmZXIgdG8gcGFjayB0aGUgc3RyaW5nIHRvLlxyXG4gKiBAcGFyYW0ge251bWJlcj19IGluZGV4IFRoZSBidWZmZXIgaW5kZXggdG8gc3RhcnQgd3JpdGluZy5cclxuICogQHJldHVybiB7bnVtYmVyfSBUaGUgbmV4dCBpbmRleCB0byB3cml0ZSBpbiB0aGUgYnVmZmVyLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhY2soc3RyLCBidWZmZXIsIGluZGV4PTApIHtcclxuICBmb3IgKGxldCBpID0gMCwgbGVuID0gc3RyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgIGxldCBjb2RlUG9pbnQgPSBzdHIuY29kZVBvaW50QXQoaSk7XHJcbiAgICBpZiAoY29kZVBvaW50IDwgMTI4KSB7XHJcbiAgICAgIGJ1ZmZlcltpbmRleF0gPSBjb2RlUG9pbnQ7XHJcbiAgICAgIGluZGV4Kys7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgICAgbGV0IGNvdW50ID0gMDtcclxuICAgICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgICBpZiAoY29kZVBvaW50IDw9IDB4MDdGRikge1xyXG4gICAgICAgIGNvdW50ID0gMTtcclxuICAgICAgICBvZmZzZXQgPSAweEMwO1xyXG4gICAgICB9IGVsc2UgaWYoY29kZVBvaW50IDw9IDB4RkZGRikge1xyXG4gICAgICAgIGNvdW50ID0gMjtcclxuICAgICAgICBvZmZzZXQgPSAweEUwO1xyXG4gICAgICB9IGVsc2UgaWYoY29kZVBvaW50IDw9IDB4MTBGRkZGKSB7XHJcbiAgICAgICAgY291bnQgPSAzO1xyXG4gICAgICAgIG9mZnNldCA9IDB4RjA7XHJcbiAgICAgICAgaSsrO1xyXG4gICAgICB9XHJcbiAgICAgIGJ1ZmZlcltpbmRleF0gPSAoY29kZVBvaW50ID4+ICg2ICogY291bnQpKSArIG9mZnNldDtcclxuICAgICAgaW5kZXgrKztcclxuICAgICAgd2hpbGUgKGNvdW50ID4gMCkge1xyXG4gICAgICAgIGJ1ZmZlcltpbmRleF0gPSAweDgwIHwgKGNvZGVQb2ludCA+PiAoNiAqIChjb3VudCAtIDEpKSAmIDB4M0YpO1xyXG4gICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgY291bnQtLTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gaW5kZXg7XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvQ2FuY2VsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcbiAgICB2YXIgcmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcbiAgICB2YXIgb25DYW5jZWxlZDtcbiAgICBmdW5jdGlvbiBkb25lKCkge1xuICAgICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgICBjb25maWcuY2FuY2VsVG9rZW4udW5zdWJzY3JpYmUob25DYW5jZWxlZCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjb25maWcuc2lnbmFsKSB7XG4gICAgICAgIGNvbmZpZy5zaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBvbkNhbmNlbGVkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCA/IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIDogJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIGZ1bmN0aW9uIG9ubG9hZGVuZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFyZXNwb25zZVR5cGUgfHwgcmVzcG9uc2VUeXBlID09PSAndGV4dCcgfHwgIHJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nID9cbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKGZ1bmN0aW9uIF9yZXNvbHZlKHZhbHVlKSB7XG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9LCBmdW5jdGlvbiBfcmVqZWN0KGVycikge1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoJ29ubG9hZGVuZCcgaW4gcmVxdWVzdCkge1xuICAgICAgLy8gVXNlIG9ubG9hZGVuZCBpZiBhdmFpbGFibGVcbiAgICAgIHJlcXVlc3Qub25sb2FkZW5kID0gb25sb2FkZW5kO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlIHRvIGVtdWxhdGUgb25sb2FkZW5kXG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVhZHlzdGF0ZSBoYW5kbGVyIGlzIGNhbGxpbmcgYmVmb3JlIG9uZXJyb3Igb3Igb250aW1lb3V0IGhhbmRsZXJzLFxuICAgICAgICAvLyBzbyB3ZSBzaG91bGQgY2FsbCBvbmxvYWRlbmQgb24gdGhlIG5leHQgJ3RpY2snXG4gICAgICAgIHNldFRpbWVvdXQob25sb2FkZW5kKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXQgPyAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnIDogJ3RpbWVvdXQgZXhjZWVkZWQnO1xuICAgICAgdmFyIHRyYW5zaXRpb25hbCA9IGNvbmZpZy50cmFuc2l0aW9uYWwgfHwgZGVmYXVsdHMudHJhbnNpdGlvbmFsO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICB0cmFuc2l0aW9uYWwuY2xhcmlmeVRpbWVvdXRFcnJvciA/ICdFVElNRURPVVQnIDogJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAocmVzcG9uc2VUeXBlICYmIHJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbiB8fCBjb25maWcuc2lnbmFsKSB7XG4gICAgICAvLyBIYW5kbGUgY2FuY2VsbGF0aW9uXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICAgICAgb25DYW5jZWxlZCA9IGZ1bmN0aW9uKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmVqZWN0KCFjYW5jZWwgfHwgKGNhbmNlbCAmJiBjYW5jZWwudHlwZSkgPyBuZXcgQ2FuY2VsKCdjYW5jZWxlZCcpIDogY2FuY2VsKTtcbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH07XG5cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbiAmJiBjb25maWcuY2FuY2VsVG9rZW4uc3Vic2NyaWJlKG9uQ2FuY2VsZWQpO1xuICAgICAgaWYgKGNvbmZpZy5zaWduYWwpIHtcbiAgICAgICAgY29uZmlnLnNpZ25hbC5hYm9ydGVkID8gb25DYW5jZWxlZCgpIDogY29uZmlnLnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIC8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbiAgaW5zdGFuY2UuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGRlZmF1bHRDb25maWcsIGluc3RhbmNlQ29uZmlnKSk7XG4gIH07XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuYXhpb3MuVkVSU0lPTiA9IHJlcXVpcmUoJy4vZW52L2RhdGEnKS52ZXJzaW9uO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG4vLyBFeHBvc2UgaXNBeGlvc0Vycm9yXG5heGlvcy5pc0F4aW9zRXJyb3IgPSByZXF1aXJlKCcuL2hlbHBlcnMvaXNBeGlvc0Vycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG5cbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgdGhpcy5wcm9taXNlLnRoZW4oZnVuY3Rpb24oY2FuY2VsKSB7XG4gICAgaWYgKCF0b2tlbi5fbGlzdGVuZXJzKSByZXR1cm47XG5cbiAgICB2YXIgaTtcbiAgICB2YXIgbCA9IHRva2VuLl9saXN0ZW5lcnMubGVuZ3RoO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdG9rZW4uX2xpc3RlbmVyc1tpXShjYW5jZWwpO1xuICAgIH1cbiAgICB0b2tlbi5fbGlzdGVuZXJzID0gbnVsbDtcbiAgfSk7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgdGhpcy5wcm9taXNlLnRoZW4gPSBmdW5jdGlvbihvbmZ1bGZpbGxlZCkge1xuICAgIHZhciBfcmVzb2x2ZTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgdG9rZW4uc3Vic2NyaWJlKHJlc29sdmUpO1xuICAgICAgX3Jlc29sdmUgPSByZXNvbHZlO1xuICAgIH0pLnRoZW4ob25mdWxmaWxsZWQpO1xuXG4gICAgcHJvbWlzZS5jYW5jZWwgPSBmdW5jdGlvbiByZWplY3QoKSB7XG4gICAgICB0b2tlbi51bnN1YnNjcmliZShfcmVzb2x2ZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9O1xuXG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFN1YnNjcmliZSB0byB0aGUgY2FuY2VsIHNpZ25hbFxuICovXG5cbkNhbmNlbFRva2VuLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiBzdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgbGlzdGVuZXIodGhpcy5yZWFzb24pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0aGlzLl9saXN0ZW5lcnMpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzID0gW2xpc3RlbmVyXTtcbiAgfVxufTtcblxuLyoqXG4gKiBVbnN1YnNjcmliZSBmcm9tIHRoZSBjYW5jZWwgc2lnbmFsXG4gKi9cblxuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24gdW5zdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgaWYgKCF0aGlzLl9saXN0ZW5lcnMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGluZGV4ID0gdGhpcy5fbGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xudmFyIHZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdmFsaWRhdG9yJyk7XG5cbnZhciB2YWxpZGF0b3JzID0gdmFsaWRhdG9yLnZhbGlkYXRvcnM7XG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWdPclVybCwgY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnT3JVcmwgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBjb25maWdPclVybDtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWdPclVybCB8fCB7fTtcbiAgfVxuXG4gIGlmICghY29uZmlnLnVybCkge1xuICAgIHRocm93IG5ldyBFcnJvcignUHJvdmlkZWQgY29uZmlnIHVybCBpcyBub3QgdmFsaWQnKTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgdmFyIHRyYW5zaXRpb25hbCA9IGNvbmZpZy50cmFuc2l0aW9uYWw7XG5cbiAgaWYgKHRyYW5zaXRpb25hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFsaWRhdG9yLmFzc2VydE9wdGlvbnModHJhbnNpdGlvbmFsLCB7XG4gICAgICBzaWxlbnRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKSxcbiAgICAgIGZvcmNlZEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4pLFxuICAgICAgY2xhcmlmeVRpbWVvdXRFcnJvcjogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKVxuICAgIH0sIGZhbHNlKTtcbiAgfVxuXG4gIC8vIGZpbHRlciBvdXQgc2tpcHBlZCBpbnRlcmNlcHRvcnNcbiAgdmFyIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHZhciBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSB0cnVlO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBpZiAodHlwZW9mIGludGVyY2VwdG9yLnJ1bldoZW4gPT09ICdmdW5jdGlvbicgJiYgaW50ZXJjZXB0b3IucnVuV2hlbihjb25maWcpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyAmJiBpbnRlcmNlcHRvci5zeW5jaHJvbm91cztcblxuICAgIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHByb21pc2U7XG5cbiAgaWYgKCFzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMpIHtcbiAgICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuXG4gICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuYXBwbHkoY2hhaW4sIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluKTtcbiAgICBjaGFpbiA9IGNoYWluLmNvbmNhdChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4pO1xuXG4gICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuICAgIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuXG4gIHZhciBuZXdDb25maWcgPSBjb25maWc7XG4gIHdoaWxlIChyZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5sZW5ndGgpIHtcbiAgICB2YXIgb25GdWxmaWxsZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHZhciBvblJlamVjdGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB0cnkge1xuICAgICAgbmV3Q29uZmlnID0gb25GdWxmaWxsZWQobmV3Q29uZmlnKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgb25SZWplY3RlZChlcnJvcik7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB0cnkge1xuICAgIHByb21pc2UgPSBkaXNwYXRjaFJlcXVlc3QobmV3Q29uZmlnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICB9XG5cbiAgd2hpbGUgKHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpLCByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbkF4aW9zLnByb3RvdHlwZS5nZXRVcmkgPSBmdW5jdGlvbiBnZXRVcmkoY29uZmlnKSB7XG4gIGlmICghY29uZmlnLnVybCkge1xuICAgIHRocm93IG5ldyBFcnJvcignUHJvdmlkZWQgY29uZmlnIHVybCBpcyBub3QgdmFsaWQnKTtcbiAgfVxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIG9wdGlvbnMpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWQsXG4gICAgc3luY2hyb25vdXM6IG9wdGlvbnMgPyBvcHRpb25zLnN5bmNocm9ub3VzIDogZmFsc2UsXG4gICAgcnVuV2hlbjogb3B0aW9ucyA/IG9wdGlvbnMucnVuV2hlbiA6IG51bGxcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0Fic29sdXRlVVJMID0gcmVxdWlyZSgnLi4vaGVscGVycy9pc0Fic29sdXRlVVJMJyk7XG52YXIgY29tYmluZVVSTHMgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2NvbWJpbmVVUkxzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBiYXNlVVJMIHdpdGggdGhlIHJlcXVlc3RlZFVSTCxcbiAqIG9ubHkgd2hlbiB0aGUgcmVxdWVzdGVkVVJMIGlzIG5vdCBhbHJlYWR5IGFuIGFic29sdXRlIFVSTC5cbiAqIElmIHRoZSByZXF1ZXN0VVJMIGlzIGFic29sdXRlLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHJlcXVlc3RlZFVSTCB1bnRvdWNoZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVxdWVzdGVkVVJMIEFic29sdXRlIG9yIHJlbGF0aXZlIFVSTCB0byBjb21iaW5lXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgZnVsbCBwYXRoXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRGdWxsUGF0aChiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpIHtcbiAgaWYgKGJhc2VVUkwgJiYgIWlzQWJzb2x1dGVVUkwocmVxdWVzdGVkVVJMKSkge1xuICAgIHJldHVybiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZXF1ZXN0ZWRVUkwpO1xuICB9XG4gIHJldHVybiByZXF1ZXN0ZWRVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi9lbmhhbmNlRXJyb3InKTtcblxuLyoqXG4gKiBDcmVhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIG1lc3NhZ2UsIGNvbmZpZywgZXJyb3IgY29kZSwgcmVxdWVzdCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgVGhlIGVycm9yIG1lc3NhZ2UuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGNyZWF0ZWQgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRXJyb3IobWVzc2FnZSwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHRyYW5zZm9ybURhdGEgPSByZXF1aXJlKCcuL3RyYW5zZm9ybURhdGEnKTtcbnZhciBpc0NhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9pc0NhbmNlbCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMnKTtcbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvQ2FuY2VsJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cblxuICBpZiAoY29uZmlnLnNpZ25hbCAmJiBjb25maWcuc2lnbmFsLmFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgQ2FuY2VsKCdjYW5jZWxlZCcpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICBjb25maWcsXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgIGNvbmZpZyxcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogVXBkYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBjb25maWcsIGVycm9yIGNvZGUsIGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbmhhbmNlRXJyb3IoZXJyb3IsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgZXJyb3IuY29uZmlnID0gY29uZmlnO1xuICBpZiAoY29kZSkge1xuICAgIGVycm9yLmNvZGUgPSBjb2RlO1xuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHJlcXVlc3Q7XG4gIGVycm9yLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gIGVycm9yLmlzQXhpb3NFcnJvciA9IHRydWU7XG5cbiAgZXJyb3IudG9KU09OID0gZnVuY3Rpb24gdG9KU09OKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBTdGFuZGFyZFxuICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxuICAgICAgbmFtZTogdGhpcy5uYW1lLFxuICAgICAgLy8gTWljcm9zb2Z0XG4gICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgIG51bWJlcjogdGhpcy5udW1iZXIsXG4gICAgICAvLyBNb3ppbGxhXG4gICAgICBmaWxlTmFtZTogdGhpcy5maWxlTmFtZSxcbiAgICAgIGxpbmVOdW1iZXI6IHRoaXMubGluZU51bWJlcixcbiAgICAgIGNvbHVtbk51bWJlcjogdGhpcy5jb2x1bW5OdW1iZXIsXG4gICAgICBzdGFjazogdGhpcy5zdGFjayxcbiAgICAgIC8vIEF4aW9zXG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgY29kZTogdGhpcy5jb2RlLFxuICAgICAgc3RhdHVzOiB0aGlzLnJlc3BvbnNlICYmIHRoaXMucmVzcG9uc2Uuc3RhdHVzID8gdGhpcy5yZXNwb25zZS5zdGF0dXMgOiBudWxsXG4gICAgfTtcbiAgfTtcbiAgcmV0dXJuIGVycm9yO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICBmdW5jdGlvbiBnZXRNZXJnZWRWYWx1ZSh0YXJnZXQsIHNvdXJjZSkge1xuICAgIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHRhcmdldCkgJiYgdXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2UodGFyZ2V0LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNQbGFpbk9iamVjdChzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gdXRpbHMubWVyZ2Uoe30sIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc0FycmF5KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2UoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbiAgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBtZXJnZURpcmVjdEtleXMocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKHByb3AgaW4gY29uZmlnMSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIG1lcmdlTWFwID0ge1xuICAgICd1cmwnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdtZXRob2QnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdkYXRhJzogdmFsdWVGcm9tQ29uZmlnMixcbiAgICAnYmFzZVVSTCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RyYW5zZm9ybVJlcXVlc3QnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc2Zvcm1SZXNwb25zZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3BhcmFtc1NlcmlhbGl6ZXInOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0aW1lb3V0JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndGltZW91dE1lc3NhZ2UnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd3aXRoQ3JlZGVudGlhbHMnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdhZGFwdGVyJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VUeXBlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAneHNyZkNvb2tpZU5hbWUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd4c3JmSGVhZGVyTmFtZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ29uVXBsb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdvbkRvd25sb2FkUHJvZ3Jlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdkZWNvbXByZXNzJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnbWF4Q29udGVudExlbmd0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ21heEJvZHlMZW5ndGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0cmFuc3BvcnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwQWdlbnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdodHRwc0FnZW50JzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnY2FuY2VsVG9rZW4nOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdzb2NrZXRQYXRoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncmVzcG9uc2VFbmNvZGluZyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3ZhbGlkYXRlU3RhdHVzJzogbWVyZ2VEaXJlY3RLZXlzXG4gIH07XG5cbiAgdXRpbHMuZm9yRWFjaChPYmplY3Qua2V5cyhjb25maWcxKS5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpLCBmdW5jdGlvbiBjb21wdXRlQ29uZmlnVmFsdWUocHJvcCkge1xuICAgIHZhciBtZXJnZSA9IG1lcmdlTWFwW3Byb3BdIHx8IG1lcmdlRGVlcFByb3BlcnRpZXM7XG4gICAgdmFyIGNvbmZpZ1ZhbHVlID0gbWVyZ2UocHJvcCk7XG4gICAgKHV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZ1ZhbHVlKSAmJiBtZXJnZSAhPT0gbWVyZ2VEaXJlY3RLZXlzKSB8fCAoY29uZmlnW3Byb3BdID0gY29uZmlnVmFsdWUpO1xuICB9KTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICB2YXIgY29udGV4dCA9IHRoaXMgfHwgZGVmYXVsdHM7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuLmNhbGwoY29udGV4dCwgZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vY29yZS9lbmhhbmNlRXJyb3InKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlTYWZlbHkocmF3VmFsdWUsIHBhcnNlciwgZW5jb2Rlcikge1xuICBpZiAodXRpbHMuaXNTdHJpbmcocmF3VmFsdWUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIChwYXJzZXIgfHwgSlNPTi5wYXJzZSkocmF3VmFsdWUpO1xuICAgICAgcmV0dXJuIHV0aWxzLnRyaW0ocmF3VmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgIT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKGVuY29kZXIgfHwgSlNPTi5zdHJpbmdpZnkpKHJhd1ZhbHVlKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXG4gIHRyYW5zaXRpb25hbDoge1xuICAgIHNpbGVudEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGZvcmNlZEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IGZhbHNlXG4gIH0sXG5cbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSB8fCAoaGVhZGVycyAmJiBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXR1cm4gc3RyaW5naWZ5U2FmZWx5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgdmFyIHRyYW5zaXRpb25hbCA9IHRoaXMudHJhbnNpdGlvbmFsIHx8IGRlZmF1bHRzLnRyYW5zaXRpb25hbDtcbiAgICB2YXIgc2lsZW50SlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLnNpbGVudEpTT05QYXJzaW5nO1xuICAgIHZhciBmb3JjZWRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuZm9yY2VkSlNPTlBhcnNpbmc7XG4gICAgdmFyIHN0cmljdEpTT05QYXJzaW5nID0gIXNpbGVudEpTT05QYXJzaW5nICYmIHRoaXMucmVzcG9uc2VUeXBlID09PSAnanNvbic7XG5cbiAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcgfHwgKGZvcmNlZEpTT05QYXJzaW5nICYmIHV0aWxzLmlzU3RyaW5nKGRhdGEpICYmIGRhdGEubGVuZ3RoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChzdHJpY3RKU09OUGFyc2luZykge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgICAgIHRocm93IGVuaGFuY2VFcnJvcihlLCB0aGlzLCAnRV9KU09OX1BBUlNFJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH0sXG5cbiAgaGVhZGVyczoge1xuICAgIGNvbW1vbjoge1xuICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gICAgfVxuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFwidmVyc2lvblwiOiBcIjAuMjUuMFwiXG59OyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkK1xcLS5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zXG4gKlxuICogQHBhcmFtIHsqfSBwYXlsb2FkIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3MsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQXhpb3NFcnJvcihwYXlsb2FkKSB7XG4gIHJldHVybiB1dGlscy5pc09iamVjdChwYXlsb2FkKSAmJiAocGF5bG9hZC5pc0F4aW9zRXJyb3IgPT09IHRydWUpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuLy8gSGVhZGVycyB3aG9zZSBkdXBsaWNhdGVzIGFyZSBpZ25vcmVkIGJ5IG5vZGVcbi8vIGMuZi4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9odHRwLmh0bWwjaHR0cF9tZXNzYWdlX2hlYWRlcnNcbnZhciBpZ25vcmVEdXBsaWNhdGVPZiA9IFtcbiAgJ2FnZScsICdhdXRob3JpemF0aW9uJywgJ2NvbnRlbnQtbGVuZ3RoJywgJ2NvbnRlbnQtdHlwZScsICdldGFnJyxcbiAgJ2V4cGlyZXMnLCAnZnJvbScsICdob3N0JywgJ2lmLW1vZGlmaWVkLXNpbmNlJywgJ2lmLXVubW9kaWZpZWQtc2luY2UnLFxuICAnbGFzdC1tb2RpZmllZCcsICdsb2NhdGlvbicsICdtYXgtZm9yd2FyZHMnLCAncHJveHktYXV0aG9yaXphdGlvbicsXG4gICdyZWZlcmVyJywgJ3JldHJ5LWFmdGVyJywgJ3VzZXItYWdlbnQnXG5dO1xuXG4vKipcbiAqIFBhcnNlIGhlYWRlcnMgaW50byBhbiBvYmplY3RcbiAqXG4gKiBgYGBcbiAqIERhdGU6IFdlZCwgMjcgQXVnIDIwMTQgMDg6NTg6NDkgR01UXG4gKiBDb250ZW50LVR5cGU6IGFwcGxpY2F0aW9uL2pzb25cbiAqIENvbm5lY3Rpb246IGtlZXAtYWxpdmVcbiAqIFRyYW5zZmVyLUVuY29kaW5nOiBjaHVua2VkXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaGVhZGVycyBIZWFkZXJzIG5lZWRpbmcgdG8gYmUgcGFyc2VkXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBIZWFkZXJzIHBhcnNlZCBpbnRvIGFuIG9iamVjdFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhoZWFkZXJzKSB7XG4gIHZhciBwYXJzZWQgPSB7fTtcbiAgdmFyIGtleTtcbiAgdmFyIHZhbDtcbiAgdmFyIGk7XG5cbiAgaWYgKCFoZWFkZXJzKSB7IHJldHVybiBwYXJzZWQ7IH1cblxuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMuc3BsaXQoJ1xcbicpLCBmdW5jdGlvbiBwYXJzZXIobGluZSkge1xuICAgIGkgPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBrZXkgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKDAsIGkpKS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoaSArIDEpKTtcblxuICAgIGlmIChrZXkpIHtcbiAgICAgIGlmIChwYXJzZWRba2V5XSAmJiBpZ25vcmVEdXBsaWNhdGVPZi5pbmRleE9mKGtleSkgPj0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoa2V5ID09PSAnc2V0LWNvb2tpZScpIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSAocGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSA6IFtdKS5jb25jYXQoW3ZhbF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VkW2tleV0gPSBwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldICsgJywgJyArIHZhbCA6IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwYXJzZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFN5bnRhY3RpYyBzdWdhciBmb3IgaW52b2tpbmcgYSBmdW5jdGlvbiBhbmQgZXhwYW5kaW5nIGFuIGFycmF5IGZvciBhcmd1bWVudHMuXG4gKlxuICogQ29tbW9uIHVzZSBjYXNlIHdvdWxkIGJlIHRvIHVzZSBgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5YC5cbiAqXG4gKiAgYGBganNcbiAqICBmdW5jdGlvbiBmKHgsIHksIHopIHt9XG4gKiAgdmFyIGFyZ3MgPSBbMSwgMiwgM107XG4gKiAgZi5hcHBseShudWxsLCBhcmdzKTtcbiAqICBgYGBcbiAqXG4gKiBXaXRoIGBzcHJlYWRgIHRoaXMgZXhhbXBsZSBjYW4gYmUgcmUtd3JpdHRlbi5cbiAqXG4gKiAgYGBganNcbiAqICBzcHJlYWQoZnVuY3Rpb24oeCwgeSwgeikge30pKFsxLCAyLCAzXSk7XG4gKiAgYGBgXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzcHJlYWQoY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoYXJyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFycik7XG4gIH07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL2Vudi9kYXRhJykudmVyc2lvbjtcblxudmFyIHZhbGlkYXRvcnMgPSB7fTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcblsnb2JqZWN0JywgJ2Jvb2xlYW4nLCAnbnVtYmVyJywgJ2Z1bmN0aW9uJywgJ3N0cmluZycsICdzeW1ib2wnXS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUsIGkpIHtcbiAgdmFsaWRhdG9yc1t0eXBlXSA9IGZ1bmN0aW9uIHZhbGlkYXRvcih0aGluZykge1xuICAgIHJldHVybiB0eXBlb2YgdGhpbmcgPT09IHR5cGUgfHwgJ2EnICsgKGkgPCAxID8gJ24gJyA6ICcgJykgKyB0eXBlO1xuICB9O1xufSk7XG5cbnZhciBkZXByZWNhdGVkV2FybmluZ3MgPSB7fTtcblxuLyoqXG4gKiBUcmFuc2l0aW9uYWwgb3B0aW9uIHZhbGlkYXRvclxuICogQHBhcmFtIHtmdW5jdGlvbnxib29sZWFuP30gdmFsaWRhdG9yIC0gc2V0IHRvIGZhbHNlIGlmIHRoZSB0cmFuc2l0aW9uYWwgb3B0aW9uIGhhcyBiZWVuIHJlbW92ZWRcbiAqIEBwYXJhbSB7c3RyaW5nP30gdmVyc2lvbiAtIGRlcHJlY2F0ZWQgdmVyc2lvbiAvIHJlbW92ZWQgc2luY2UgdmVyc2lvblxuICogQHBhcmFtIHtzdHJpbmc/fSBtZXNzYWdlIC0gc29tZSBtZXNzYWdlIHdpdGggYWRkaXRpb25hbCBpbmZvXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gKi9cbnZhbGlkYXRvcnMudHJhbnNpdGlvbmFsID0gZnVuY3Rpb24gdHJhbnNpdGlvbmFsKHZhbGlkYXRvciwgdmVyc2lvbiwgbWVzc2FnZSkge1xuICBmdW5jdGlvbiBmb3JtYXRNZXNzYWdlKG9wdCwgZGVzYykge1xuICAgIHJldHVybiAnW0F4aW9zIHYnICsgVkVSU0lPTiArICddIFRyYW5zaXRpb25hbCBvcHRpb24gXFwnJyArIG9wdCArICdcXCcnICsgZGVzYyArIChtZXNzYWdlID8gJy4gJyArIG1lc3NhZ2UgOiAnJyk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG9wdCwgb3B0cykge1xuICAgIGlmICh2YWxpZGF0b3IgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0TWVzc2FnZShvcHQsICcgaGFzIGJlZW4gcmVtb3ZlZCcgKyAodmVyc2lvbiA/ICcgaW4gJyArIHZlcnNpb24gOiAnJykpKTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiAmJiAhZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0pIHtcbiAgICAgIGRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdID0gdHJ1ZTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdE1lc3NhZ2UoXG4gICAgICAgICAgb3B0LFxuICAgICAgICAgICcgaGFzIGJlZW4gZGVwcmVjYXRlZCBzaW5jZSB2JyArIHZlcnNpb24gKyAnIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5lYXIgZnV0dXJlJ1xuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZGF0b3IgPyB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0cykgOiB0cnVlO1xuICB9O1xufTtcblxuLyoqXG4gKiBBc3NlcnQgb2JqZWN0J3MgcHJvcGVydGllcyB0eXBlXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtvYmplY3R9IHNjaGVtYVxuICogQHBhcmFtIHtib29sZWFuP30gYWxsb3dVbmtub3duXG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0T3B0aW9ucyhvcHRpb25zLCBzY2hlbWEsIGFsbG93VW5rbm93bikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICB9XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob3B0aW9ucyk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0gPiAwKSB7XG4gICAgdmFyIG9wdCA9IGtleXNbaV07XG4gICAgdmFyIHZhbGlkYXRvciA9IHNjaGVtYVtvcHRdO1xuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9wdGlvbnNbb3B0XTtcbiAgICAgIHZhciByZXN1bHQgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRpb25zKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uICcgKyBvcHQgKyAnIG11c3QgYmUgJyArIHJlc3VsdCk7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGFsbG93VW5rbm93biAhPT0gdHJ1ZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gb3B0aW9uICcgKyBvcHQpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXNzZXJ0T3B0aW9uczogYXNzZXJ0T3B0aW9ucyxcbiAgdmFsaWRhdG9yczogdmFsaWRhdG9yc1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJpbmQgPSByZXF1aXJlKCcuL2hlbHBlcnMvYmluZCcpO1xuXG4vLyB1dGlscyBpcyBhIGxpYnJhcnkgb2YgZ2VuZXJpYyBoZWxwZXIgZnVuY3Rpb25zIG5vbi1zcGVjaWZpYyB0byBheGlvc1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXksIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5KHZhbCkge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWwpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIHVuZGVmaW5lZFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB2YWx1ZSBpcyB1bmRlZmluZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICd1bmRlZmluZWQnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0J1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsKSAmJiB2YWwuY29uc3RydWN0b3IgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbC5jb25zdHJ1Y3RvcilcbiAgICAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlcih2YWwpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRm9ybURhdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBGb3JtRGF0YSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRm9ybURhdGEodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZvcm1EYXRhXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKGlzQXJyYXlCdWZmZXIodmFsLmJ1ZmZlcikpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBVUkxTZWFyY2hQYXJhbXNdJztcbn1cblxuLyoqXG4gKiBUcmltIGV4Y2VzcyB3aGl0ZXNwYWNlIG9mZiB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgYSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBTdHJpbmcgdG8gdHJpbVxuICogQHJldHVybnMge1N0cmluZ30gVGhlIFN0cmluZyBmcmVlZCBvZiBleGNlc3Mgd2hpdGVzcGFjZVxuICovXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICByZXR1cm4gc3RyLnRyaW0gPyBzdHIudHJpbSgpIDogc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgd2UncmUgcnVubmluZyBpbiBhIHN0YW5kYXJkIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAqXG4gKiBUaGlzIGFsbG93cyBheGlvcyB0byBydW4gaW4gYSB3ZWIgd29ya2VyLCBhbmQgcmVhY3QtbmF0aXZlLlxuICogQm90aCBlbnZpcm9ubWVudHMgc3VwcG9ydCBYTUxIdHRwUmVxdWVzdCwgYnV0IG5vdCBmdWxseSBzdGFuZGFyZCBnbG9iYWxzLlxuICpcbiAqIHdlYiB3b3JrZXJzOlxuICogIHR5cGVvZiB3aW5kb3cgLT4gdW5kZWZpbmVkXG4gKiAgdHlwZW9mIGRvY3VtZW50IC0+IHVuZGVmaW5lZFxuICpcbiAqIHJlYWN0LW5hdGl2ZTpcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnUmVhY3ROYXRpdmUnXG4gKiBuYXRpdmVzY3JpcHRcbiAqICBuYXZpZ2F0b3IucHJvZHVjdCAtPiAnTmF0aXZlU2NyaXB0JyBvciAnTlMnXG4gKi9cbmZ1bmN0aW9uIGlzU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgKG5hdmlnYXRvci5wcm9kdWN0ID09PSAnUmVhY3ROYXRpdmUnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOYXRpdmVTY3JpcHQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdOUycpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIEFycmF5IG9yIGFuIE9iamVjdCBpbnZva2luZyBhIGZ1bmN0aW9uIGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgYG9iamAgaXMgYW4gQXJyYXkgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBpbmRleCwgYW5kIGNvbXBsZXRlIGFycmF5IGZvciBlYWNoIGl0ZW0uXG4gKlxuICogSWYgJ29iaicgaXMgYW4gT2JqZWN0IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwga2V5LCBhbmQgY29tcGxldGUgb2JqZWN0IGZvciBlYWNoIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBvYmogVGhlIG9iamVjdCB0byBpdGVyYXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIGZvciBlYWNoIGl0ZW1cbiAqL1xuZnVuY3Rpb24gZm9yRWFjaChvYmosIGZuKSB7XG4gIC8vIERvbid0IGJvdGhlciBpZiBubyB2YWx1ZSBwcm92aWRlZFxuICBpZiAob2JqID09PSBudWxsIHx8IHR5cGVvZiBvYmogPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRm9yY2UgYW4gYXJyYXkgaWYgbm90IGFscmVhZHkgc29tZXRoaW5nIGl0ZXJhYmxlXG4gIGlmICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0Jykge1xuICAgIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAgIG9iaiA9IFtvYmpdO1xuICB9XG5cbiAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBhcnJheSB2YWx1ZXNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2ldLCBpLCBvYmopO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgb2JqZWN0IGtleXNcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICBmbi5jYWxsKG51bGwsIG9ialtrZXldLCBrZXksIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWNjZXB0cyB2YXJhcmdzIGV4cGVjdGluZyBlYWNoIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCwgdGhlblxuICogaW1tdXRhYmx5IG1lcmdlcyB0aGUgcHJvcGVydGllcyBvZiBlYWNoIG9iamVjdCBhbmQgcmV0dXJucyByZXN1bHQuXG4gKlxuICogV2hlbiBtdWx0aXBsZSBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUga2V5IHRoZSBsYXRlciBvYmplY3QgaW5cbiAqIHRoZSBhcmd1bWVudHMgbGlzdCB3aWxsIHRha2UgcHJlY2VkZW5jZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgcmVzdWx0ID0gbWVyZ2Uoe2ZvbzogMTIzfSwge2ZvbzogNDU2fSk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQuZm9vKTsgLy8gb3V0cHV0cyA0NTZcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmoxIE9iamVjdCB0byBtZXJnZVxuICogQHJldHVybnMge09iamVjdH0gUmVzdWx0IG9mIGFsbCBtZXJnZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIG1lcmdlKC8qIG9iajEsIG9iajIsIG9iajMsIC4uLiAqLykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QocmVzdWx0W2tleV0pICYmIGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZShyZXN1bHRba2V5XSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBtZXJnZSh7fSwgdmFsKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWwuc2xpY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZm9yRWFjaChhcmd1bWVudHNbaV0sIGFzc2lnblZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEV4dGVuZHMgb2JqZWN0IGEgYnkgbXV0YWJseSBhZGRpbmcgdG8gaXQgdGhlIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIG9iamVjdCB0byBiZSBleHRlbmRlZFxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbVxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNBcmcgVGhlIG9iamVjdCB0byBiaW5kIGZ1bmN0aW9uIHRvXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSByZXN1bHRpbmcgdmFsdWUgb2Ygb2JqZWN0IGFcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKGEsIGIsIHRoaXNBcmcpIHtcbiAgZm9yRWFjaChiLCBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmICh0aGlzQXJnICYmIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFba2V5XSA9IGJpbmQodmFsLCB0aGlzQXJnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYVtrZXldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhO1xufVxuXG4vKipcbiAqIFJlbW92ZSBieXRlIG9yZGVyIG1hcmtlci4gVGhpcyBjYXRjaGVzIEVGIEJCIEJGICh0aGUgVVRGLTggQk9NKVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IHdpdGggQk9NXG4gKiBAcmV0dXJuIHtzdHJpbmd9IGNvbnRlbnQgdmFsdWUgd2l0aG91dCBCT01cbiAqL1xuZnVuY3Rpb24gc3RyaXBCT00oY29udGVudCkge1xuICBpZiAoY29udGVudC5jaGFyQ29kZUF0KDApID09PSAweEZFRkYpIHtcbiAgICBjb250ZW50ID0gY29udGVudC5zbGljZSgxKTtcbiAgfVxuICByZXR1cm4gY29udGVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzQXJyYXk6IGlzQXJyYXksXG4gIGlzQXJyYXlCdWZmZXI6IGlzQXJyYXlCdWZmZXIsXG4gIGlzQnVmZmVyOiBpc0J1ZmZlcixcbiAgaXNGb3JtRGF0YTogaXNGb3JtRGF0YSxcbiAgaXNBcnJheUJ1ZmZlclZpZXc6IGlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc1N0cmluZzogaXNTdHJpbmcsXG4gIGlzTnVtYmVyOiBpc051bWJlcixcbiAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1VuZGVmaW5lZDogaXNVbmRlZmluZWQsXG4gIGlzRGF0ZTogaXNEYXRlLFxuICBpc0ZpbGU6IGlzRmlsZSxcbiAgaXNCbG9iOiBpc0Jsb2IsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIGlzU3RyZWFtOiBpc1N0cmVhbSxcbiAgaXNVUkxTZWFyY2hQYXJhbXM6IGlzVVJMU2VhcmNoUGFyYW1zLFxuICBpc1N0YW5kYXJkQnJvd3NlckVudjogaXNTdGFuZGFyZEJyb3dzZXJFbnYsXG4gIGZvckVhY2g6IGZvckVhY2gsXG4gIG1lcmdlOiBtZXJnZSxcbiAgZXh0ZW5kOiBleHRlbmQsXG4gIHRyaW06IHRyaW0sXG4gIHN0cmlwQk9NOiBzdHJpcEJPTVxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5SZWFkZXIgPSBleHBvcnRzLldyaXRlciA9IHZvaWQgMDtcbmNvbnN0IHV0ZjggPSByZXF1aXJlKFwidXRmOC1idWZmZXJcIik7XG5jb25zdCB1dGY4X2J1ZmZlcl9zaXplXzEgPSByZXF1aXJlKFwidXRmOC1idWZmZXItc2l6ZVwiKTtcbmNvbnN0IHsgcGFjaywgdW5wYWNrIH0gPSB1dGY4LmRlZmF1bHQgPz8gdXRmODtcbmNsYXNzIFdyaXRlciB7XG4gICAgcG9zID0gMDtcbiAgICB2aWV3O1xuICAgIGJ5dGVzO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnZpZXcgPSBuZXcgRGF0YVZpZXcobmV3IEFycmF5QnVmZmVyKDY0KSk7XG4gICAgICAgIHRoaXMuYnl0ZXMgPSBuZXcgVWludDhBcnJheSh0aGlzLnZpZXcuYnVmZmVyKTtcbiAgICB9XG4gICAgd3JpdGVVSW50OCh2YWwpIHtcbiAgICAgICAgdGhpcy5lbnN1cmVTaXplKDEpO1xuICAgICAgICB0aGlzLnZpZXcuc2V0VWludDgodGhpcy5wb3MsIHZhbCk7XG4gICAgICAgIHRoaXMucG9zICs9IDE7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZVVJbnQzMih2YWwpIHtcbiAgICAgICAgdGhpcy5lbnN1cmVTaXplKDQpO1xuICAgICAgICB0aGlzLnZpZXcuc2V0VWludDMyKHRoaXMucG9zLCB2YWwpO1xuICAgICAgICB0aGlzLnBvcyArPSA0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVVSW50NjQodmFsKSB7XG4gICAgICAgIHRoaXMuZW5zdXJlU2l6ZSg4KTtcbiAgICAgICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLnBvcywgdmFsKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gODtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlVVZhcmludCh2YWwpIHtcbiAgICAgICAgaWYgKHZhbCA8IDB4ODApIHtcbiAgICAgICAgICAgIHRoaXMuZW5zdXJlU2l6ZSgxKTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLnBvcywgdmFsKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsIDwgMHg0MDAwKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoMik7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDE2KHRoaXMucG9zLCAodmFsICYgMHg3ZikgfCAoKHZhbCAmIDB4M2Y4MCkgPDwgMSkgfCAweDgwMDApO1xuICAgICAgICAgICAgdGhpcy5wb3MgKz0gMjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWwgPCAweDIwMDAwMCkge1xuICAgICAgICAgICAgdGhpcy5lbnN1cmVTaXplKDMpO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMucG9zLCAodmFsID4+IDE0KSB8IDB4ODApO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQxNih0aGlzLnBvcyArIDEsICh2YWwgJiAweDdmKSB8ICgodmFsICYgMHgzZjgwKSA8PCAxKSB8IDB4ODAwMCk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSAzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCA8IDB4MTAwMDAwMDApIHtcbiAgICAgICAgICAgIHRoaXMuZW5zdXJlU2l6ZSg0KTtcbiAgICAgICAgICAgIHRoaXMudmlldy5zZXRVaW50MzIodGhpcy5wb3MsICh2YWwgJiAweDdmKSB8ICgodmFsICYgMHgzZjgwKSA8PCAxKSB8ICgodmFsICYgMHgxZmMwMDApIDw8IDIpIHwgKCh2YWwgJiAweGZlMDAwMDApIDw8IDMpIHwgMHg4MDgwODAwMCk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSA0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCA8IDB4ODAwMDAwMDAwKSB7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoNSk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDgodGhpcy5wb3MsIE1hdGguZmxvb3IodmFsIC8gTWF0aC5wb3coMiwgMjgpKSB8IDB4ODApO1xuICAgICAgICAgICAgdGhpcy52aWV3LnNldFVpbnQzMih0aGlzLnBvcyArIDEsICh2YWwgJiAweDdmKSB8ICgodmFsICYgMHgzZjgwKSA8PCAxKSB8ICgodmFsICYgMHgxZmMwMDApIDw8IDIpIHwgKCh2YWwgJiAweGZlMDAwMDApIDw8IDMpIHwgMHg4MDgwODAwMCk7XG4gICAgICAgICAgICB0aGlzLnBvcyArPSA1O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbCA8IDB4NDAwMDAwMDAwMDApIHtcbiAgICAgICAgICAgIHRoaXMuZW5zdXJlU2l6ZSg2KTtcbiAgICAgICAgICAgIGNvbnN0IHNoaWZ0ZWRWYWwgPSBNYXRoLmZsb29yKHZhbCAvIE1hdGgucG93KDIsIDI4KSk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDE2KHRoaXMucG9zLCAoc2hpZnRlZFZhbCAmIDB4N2YpIHwgKChzaGlmdGVkVmFsICYgMHgzZjgwKSA8PCAxKSB8IDB4ODA4MCk7XG4gICAgICAgICAgICB0aGlzLnZpZXcuc2V0VWludDMyKHRoaXMucG9zICsgMiwgKHZhbCAmIDB4N2YpIHwgKCh2YWwgJiAweDNmODApIDw8IDEpIHwgKCh2YWwgJiAweDFmYzAwMCkgPDwgMikgfCAoKHZhbCAmIDB4ZmUwMDAwMCkgPDwgMykgfCAweDgwODA4MDAwKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IDY7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWYWx1ZSBvdXQgb2YgcmFuZ2VcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdyaXRlVmFyaW50KHZhbCkge1xuICAgICAgICBjb25zdCBiaWd2YWwgPSBCaWdJbnQodmFsKTtcbiAgICAgICAgdGhpcy53cml0ZVVWYXJpbnQoTnVtYmVyKChiaWd2YWwgPj4gNjNuKSBeIChiaWd2YWwgPDwgMW4pKSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZUZsb2F0KHZhbCkge1xuICAgICAgICB0aGlzLmVuc3VyZVNpemUoNCk7XG4gICAgICAgIHRoaXMudmlldy5zZXRGbG9hdDMyKHRoaXMucG9zLCB2YWwsIHRydWUpO1xuICAgICAgICB0aGlzLnBvcyArPSA0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVCaXRzKGJpdHMpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaXRzLmxlbmd0aDsgaSArPSA4KSB7XG4gICAgICAgICAgICBsZXQgYnl0ZSA9IDA7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDg7IGorKykge1xuICAgICAgICAgICAgICAgIGlmIChpICsgaiA9PSBiaXRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnl0ZSB8PSAoYml0c1tpICsgal0gPyAxIDogMCkgPDwgajtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMud3JpdGVVSW50OChieXRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgd3JpdGVTdHJpbmcodmFsKSB7XG4gICAgICAgIGlmICh2YWwubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgYnl0ZVNpemUgPSAoMCwgdXRmOF9idWZmZXJfc2l6ZV8xLmRlZmF1bHQpKHZhbCk7XG4gICAgICAgICAgICB0aGlzLndyaXRlVVZhcmludChieXRlU2l6ZSk7XG4gICAgICAgICAgICB0aGlzLmVuc3VyZVNpemUoYnl0ZVNpemUpO1xuICAgICAgICAgICAgcGFjayh2YWwsIHRoaXMuYnl0ZXMsIHRoaXMucG9zKTtcbiAgICAgICAgICAgIHRoaXMucG9zICs9IGJ5dGVTaXplO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53cml0ZVVJbnQ4KDApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB3cml0ZUJ1ZmZlcihidWYpIHtcbiAgICAgICAgdGhpcy5lbnN1cmVTaXplKGJ1Zi5sZW5ndGgpO1xuICAgICAgICB0aGlzLmJ5dGVzLnNldChidWYsIHRoaXMucG9zKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gYnVmLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRvQnVmZmVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ieXRlcy5zdWJhcnJheSgwLCB0aGlzLnBvcyk7XG4gICAgfVxuICAgIGVuc3VyZVNpemUoc2l6ZSkge1xuICAgICAgICB3aGlsZSAodGhpcy52aWV3LmJ5dGVMZW5ndGggPCB0aGlzLnBvcyArIHNpemUpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1ZpZXcgPSBuZXcgRGF0YVZpZXcobmV3IEFycmF5QnVmZmVyKHRoaXMudmlldy5ieXRlTGVuZ3RoICogMikpO1xuICAgICAgICAgICAgY29uc3QgbmV3Qnl0ZXMgPSBuZXcgVWludDhBcnJheShuZXdWaWV3LmJ1ZmZlcik7XG4gICAgICAgICAgICBuZXdCeXRlcy5zZXQodGhpcy5ieXRlcyk7XG4gICAgICAgICAgICB0aGlzLnZpZXcgPSBuZXdWaWV3O1xuICAgICAgICAgICAgdGhpcy5ieXRlcyA9IG5ld0J5dGVzO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5Xcml0ZXIgPSBXcml0ZXI7XG5jbGFzcyBSZWFkZXIge1xuICAgIHBvcyA9IDA7XG4gICAgdmlldztcbiAgICBieXRlcztcbiAgICBjb25zdHJ1Y3RvcihidWYpIHtcbiAgICAgICAgdGhpcy52aWV3ID0gbmV3IERhdGFWaWV3KGJ1Zi5idWZmZXIsIGJ1Zi5ieXRlT2Zmc2V0LCBidWYuYnl0ZUxlbmd0aCk7XG4gICAgICAgIHRoaXMuYnl0ZXMgPSBuZXcgVWludDhBcnJheSh0aGlzLnZpZXcuYnVmZmVyLCBidWYuYnl0ZU9mZnNldCwgYnVmLmJ5dGVMZW5ndGgpO1xuICAgIH1cbiAgICByZWFkVUludDgoKSB7XG4gICAgICAgIGNvbnN0IHZhbCA9IHRoaXMudmlldy5nZXRVaW50OCh0aGlzLnBvcyk7XG4gICAgICAgIHRoaXMucG9zICs9IDE7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHJlYWRVSW50MzIoKSB7XG4gICAgICAgIGNvbnN0IHZhbCA9IHRoaXMudmlldy5nZXRVaW50MzIodGhpcy5wb3MpO1xuICAgICAgICB0aGlzLnBvcyArPSA0O1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZWFkVUludDY0KCkge1xuICAgICAgICBjb25zdCB2YWwgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMucG9zKTtcbiAgICAgICAgdGhpcy5wb3MgKz0gODtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgcmVhZFVWYXJpbnQoKSB7XG4gICAgICAgIGxldCB2YWwgPSAwO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgbGV0IGJ5dGUgPSB0aGlzLnZpZXcuZ2V0VWludDgodGhpcy5wb3MrKyk7XG4gICAgICAgICAgICBpZiAoYnl0ZSA8IDB4ODApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsICsgYnl0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbCA9ICh2YWwgKyAoYnl0ZSAmIDB4N2YpKSAqIDEyODtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZWFkVmFyaW50KCkge1xuICAgICAgICBjb25zdCB2YWwgPSBCaWdJbnQodGhpcy5yZWFkVVZhcmludCgpKTtcbiAgICAgICAgcmV0dXJuIE51bWJlcigodmFsID4+IDFuKSBeIC0odmFsICYgMW4pKTtcbiAgICB9XG4gICAgcmVhZEZsb2F0KCkge1xuICAgICAgICBjb25zdCB2YWwgPSB0aGlzLnZpZXcuZ2V0RmxvYXQzMih0aGlzLnBvcywgdHJ1ZSk7XG4gICAgICAgIHRoaXMucG9zICs9IDQ7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHJlYWRCaXRzKG51bUJpdHMpIHtcbiAgICAgICAgY29uc3QgbnVtQnl0ZXMgPSBNYXRoLmNlaWwobnVtQml0cyAvIDgpO1xuICAgICAgICBjb25zdCBieXRlcyA9IHRoaXMuYnl0ZXMuc2xpY2UodGhpcy5wb3MsIHRoaXMucG9zICsgbnVtQnl0ZXMpO1xuICAgICAgICBjb25zdCBiaXRzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgYnl0ZSBvZiBieXRlcykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4ICYmIGJpdHMubGVuZ3RoIDwgbnVtQml0czsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYml0cy5wdXNoKCgoYnl0ZSA+PiBpKSAmIDEpID09PSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBvcyArPSBudW1CeXRlcztcbiAgICAgICAgcmV0dXJuIGJpdHM7XG4gICAgfVxuICAgIHJlYWRTdHJpbmcoKSB7XG4gICAgICAgIGNvbnN0IGxlbiA9IHRoaXMucmVhZFVWYXJpbnQoKTtcbiAgICAgICAgaWYgKGxlbiA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsID0gdW5wYWNrKHRoaXMuYnl0ZXMsIHRoaXMucG9zLCB0aGlzLnBvcyArIGxlbik7XG4gICAgICAgIHRoaXMucG9zICs9IGxlbjtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgcmVhZEJ1ZmZlcihudW1CeXRlcykge1xuICAgICAgICBjb25zdCBieXRlcyA9IHRoaXMuYnl0ZXMuc2xpY2UodGhpcy5wb3MsIHRoaXMucG9zICsgbnVtQnl0ZXMpO1xuICAgICAgICB0aGlzLnBvcyArPSBudW1CeXRlcztcbiAgICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgIH1cbiAgICByZW1haW5pbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZpZXcuYnl0ZUxlbmd0aCAtIHRoaXMucG9zO1xuICAgIH1cbn1cbmV4cG9ydHMuUmVhZGVyID0gUmVhZGVyO1xuIiwidmFyIHdpbmRvdyA9IHJlcXVpcmUoJ2dsb2JhbC93aW5kb3cnKTtcbnZhciBub2RlQ3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG5cbmZ1bmN0aW9uIGdldFJhbmRvbVZhbHVlcyhidWYpIHtcbiAgaWYgKHdpbmRvdy5jcnlwdG8gJiYgd2luZG93LmNyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcbiAgICByZXR1cm4gd2luZG93LmNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYnVmKTtcbiAgfVxuICBpZiAodHlwZW9mIHdpbmRvdy5tc0NyeXB0byA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHdpbmRvdy5tc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gd2luZG93Lm1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcyhidWYpO1xuICB9XG4gIGlmIChub2RlQ3J5cHRvLnJhbmRvbUJ5dGVzKSB7XG4gICAgaWYgKCEoYnVmIGluc3RhbmNlb2YgVWludDhBcnJheSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4cGVjdGVkIFVpbnQ4QXJyYXknKTtcbiAgICB9XG4gICAgaWYgKGJ1Zi5sZW5ndGggPiA2NTUzNikge1xuICAgICAgdmFyIGUgPSBuZXcgRXJyb3IoKTtcbiAgICAgIGUuY29kZSA9IDIyO1xuICAgICAgZS5tZXNzYWdlID0gJ0ZhaWxlZCB0byBleGVjdXRlIFxcJ2dldFJhbmRvbVZhbHVlc1xcJyBvbiBcXCdDcnlwdG9cXCc6IFRoZSAnICtcbiAgICAgICAgJ0FycmF5QnVmZmVyVmlld1xcJ3MgYnl0ZSBsZW5ndGggKCcgKyBidWYubGVuZ3RoICsgJykgZXhjZWVkcyB0aGUgJyArXG4gICAgICAgICdudW1iZXIgb2YgYnl0ZXMgb2YgZW50cm9weSBhdmFpbGFibGUgdmlhIHRoaXMgQVBJICg2NTUzNikuJztcbiAgICAgIGUubmFtZSA9ICdRdW90YUV4Y2VlZGVkRXJyb3InO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgdmFyIGJ5dGVzID0gbm9kZUNyeXB0by5yYW5kb21CeXRlcyhidWYubGVuZ3RoKTtcbiAgICBidWYuc2V0KGJ5dGVzKTtcbiAgICByZXR1cm4gYnVmO1xuICB9XG4gIGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignTm8gc2VjdXJlIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yIGF2YWlsYWJsZS4nKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJhbmRvbVZhbHVlcztcbiIsInZhciB3aW47XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgd2luID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgd2luID0ge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2luO1xuIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL21heG9nZGVuL3dlYnNvY2tldC1zdHJlYW0vYmxvYi80OGRjM2RkZjk0M2U1YWRhNjY4YzMxY2NkOTRlOTE4NmYwMmZhZmJkL3dzLWZhbGxiYWNrLmpzXG5cbnZhciB3cyA9IG51bGxcblxuaWYgKHR5cGVvZiBXZWJTb2NrZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gIHdzID0gV2ViU29ja2V0XG59IGVsc2UgaWYgKHR5cGVvZiBNb3pXZWJTb2NrZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gIHdzID0gTW96V2ViU29ja2V0XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gIHdzID0gZ2xvYmFsLldlYlNvY2tldCB8fCBnbG9iYWwuTW96V2ViU29ja2V0XG59IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIHdzID0gd2luZG93LldlYlNvY2tldCB8fCB3aW5kb3cuTW96V2ViU29ja2V0XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuICB3cyA9IHNlbGYuV2ViU29ja2V0IHx8IHNlbGYuTW96V2ViU29ja2V0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd3NcbiIsImZ1bmN0aW9uIGUoZSl7dGhpcy5tZXNzYWdlPWV9ZS5wcm90b3R5cGU9bmV3IEVycm9yLGUucHJvdG90eXBlLm5hbWU9XCJJbnZhbGlkQ2hhcmFjdGVyRXJyb3JcIjt2YXIgcj1cInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93JiZ3aW5kb3cuYXRvYiYmd2luZG93LmF0b2IuYmluZCh3aW5kb3cpfHxmdW5jdGlvbihyKXt2YXIgdD1TdHJpbmcocikucmVwbGFjZSgvPSskLyxcIlwiKTtpZih0Lmxlbmd0aCU0PT0xKXRocm93IG5ldyBlKFwiJ2F0b2InIGZhaWxlZDogVGhlIHN0cmluZyB0byBiZSBkZWNvZGVkIGlzIG5vdCBjb3JyZWN0bHkgZW5jb2RlZC5cIik7Zm9yKHZhciBuLG8sYT0wLGk9MCxjPVwiXCI7bz10LmNoYXJBdChpKyspO35vJiYobj1hJTQ/NjQqbitvOm8sYSsrJTQpP2MrPVN0cmluZy5mcm9tQ2hhckNvZGUoMjU1Jm4+PigtMiphJjYpKTowKW89XCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvPVwiLmluZGV4T2Yobyk7cmV0dXJuIGN9O2Z1bmN0aW9uIHQoZSl7dmFyIHQ9ZS5yZXBsYWNlKC8tL2csXCIrXCIpLnJlcGxhY2UoL18vZyxcIi9cIik7c3dpdGNoKHQubGVuZ3RoJTQpe2Nhc2UgMDpicmVhaztjYXNlIDI6dCs9XCI9PVwiO2JyZWFrO2Nhc2UgMzp0Kz1cIj1cIjticmVhaztkZWZhdWx0OnRocm93XCJJbGxlZ2FsIGJhc2U2NHVybCBzdHJpbmchXCJ9dHJ5e3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHIoZSkucmVwbGFjZSgvKC4pL2csKGZ1bmN0aW9uKGUscil7dmFyIHQ9ci5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO3JldHVybiB0Lmxlbmd0aDwyJiYodD1cIjBcIit0KSxcIiVcIit0fSkpKX0odCl9Y2F0Y2goZSl7cmV0dXJuIHIodCl9fWZ1bmN0aW9uIG4oZSl7dGhpcy5tZXNzYWdlPWV9ZnVuY3Rpb24gbyhlLHIpe2lmKFwic3RyaW5nXCIhPXR5cGVvZiBlKXRocm93IG5ldyBuKFwiSW52YWxpZCB0b2tlbiBzcGVjaWZpZWRcIik7dmFyIG89ITA9PT0ocj1yfHx7fSkuaGVhZGVyPzA6MTt0cnl7cmV0dXJuIEpTT04ucGFyc2UodChlLnNwbGl0KFwiLlwiKVtvXSkpfWNhdGNoKGUpe3Rocm93IG5ldyBuKFwiSW52YWxpZCB0b2tlbiBzcGVjaWZpZWQ6IFwiK2UubWVzc2FnZSl9fW4ucHJvdG90eXBlPW5ldyBFcnJvcixuLnByb3RvdHlwZS5uYW1lPVwiSW52YWxpZFRva2VuRXJyb3JcIjtleHBvcnQgZGVmYXVsdCBvO2V4cG9ydHtuIGFzIEludmFsaWRUb2tlbkVycm9yfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWp3dC1kZWNvZGUuZXNtLmpzLm1hcFxuIiwiLypcbkNvcHlyaWdodCAyMDEzIFNsZWVwbGVzcyBTb2Z0d2FyZSBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvXG5kZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZVxucmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yXG5zZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkdcbkZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1NcbklOIFRIRSBTT0ZUV0FSRS4gXG4qL1xuXG4vLyB5ZXMsIEkga25vdyB0aGlzIHNlZW1zIHN0dXBpZCwgYnV0IEkgaGF2ZSBteSByZWFzb25zLlxuXG52YXIgbmV0ID0gcmVxdWlyZShcIm5ldFwiKVxuZm9yKGsgaW4gbmV0KVxuXHRnbG9iYWxba10gPSBuZXRba11cblxuIiwiLypcclxuICogQ29weXJpZ2h0IChjKSAyMDE4IFJhZmFlbCBkYSBTaWx2YSBSb2NoYS5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXHJcbiAqIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxyXG4gKiBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcclxuICogd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxyXG4gKiBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cclxuICogcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXHJcbiAqIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcclxuICogaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXHJcbiAqIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxyXG4gKiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxyXG4gKiBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFXHJcbiAqIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cclxuICogT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXHJcbiAqIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IFRoZSB1dGY4LWJ1ZmZlci1zaXplIEFQSS5cclxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vcm9jaGFycy91dGY4LWJ1ZmZlci1zaXplXHJcbiAqL1xyXG5cclxuLyoqIEBtb2R1bGUgdXRmOEJ1ZmZlclNpemUgKi9cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGhvdyBtYW55IGJ5dGVzIGFyZSBuZWVkZWQgdG8gc2VyaWFsaXplIGEgVVRGLTggc3RyaW5nLlxyXG4gKiBAc2VlIGh0dHBzOi8vZW5jb2Rpbmcuc3BlYy53aGF0d2cub3JnLyN1dGYtOC1lbmNvZGVyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgVGhlIHN0cmluZyB0byBwYWNrLlxyXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBudW1iZXIgb2YgYnl0ZXMgbmVlZGVkIHRvIHNlcmlhbGl6ZSB0aGUgc3RyaW5nLlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdXRmOEJ1ZmZlclNpemUoc3RyKSB7XHJcbiAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgbGV0IGJ5dGVzID0gMDtcclxuICBmb3IgKGxldCBpID0gMCwgbGVuID0gc3RyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgIGxldCBjb2RlUG9pbnQgPSBzdHIuY29kZVBvaW50QXQoaSk7XHJcbiAgICBpZiAoY29kZVBvaW50IDwgMTI4KSB7XHJcbiAgICAgIGJ5dGVzKys7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoY29kZVBvaW50IDw9IDIwNDcpIHtcclxuICAgICAgICBieXRlcysrO1xyXG4gICAgICB9IGVsc2UgaWYoY29kZVBvaW50IDw9IDY1NTM1KSB7XHJcbiAgICAgICAgYnl0ZXMrPTI7XHJcbiAgICAgIH0gZWxzZSBpZihjb2RlUG9pbnQgPD0gMTExNDExMSkge1xyXG4gICAgICAgIGkrKztcclxuICAgICAgICBieXRlcys9MztcclxuICAgICAgfVxyXG4gICAgICBieXRlcysrO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gYnl0ZXM7XHJcbn1cclxuIiwiLypcclxuICogQ29weXJpZ2h0IChjKSAyMDE4IFJhZmFlbCBkYSBTaWx2YSBSb2NoYS5cclxuICpcclxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXHJcbiAqIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxyXG4gKiBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcclxuICogd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxyXG4gKiBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cclxuICogcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXHJcbiAqIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcclxuICpcclxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcclxuICogaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcbiAqXHJcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXHJcbiAqIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxyXG4gKiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORFxyXG4gKiBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFXHJcbiAqIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT05cclxuICogT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OXHJcbiAqIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxyXG4gKlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBAZmlsZW92ZXJ2aWV3IEZ1bmN0aW9ucyB0byBzZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIFVURi04IHN0cmluZ3MuXHJcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3JvY2hhcnMvdXRmOC1idWZmZXJcclxuICogQHNlZSBodHRwczovL2VuY29kaW5nLnNwZWMud2hhdHdnLm9yZy8jdGhlLWVuY29kaW5nXHJcbiAqIEBzZWUgaHR0cHM6Ly9lbmNvZGluZy5zcGVjLndoYXR3Zy5vcmcvI3V0Zi04LWVuY29kZXJcclxuICovXHJcblxyXG4vKiogQG1vZHVsZSB1dGY4LWJ1ZmZlciAqL1xyXG5cclxuLyoqXHJcbiAqIFJlYWQgYSBzdHJpbmcgb2YgVVRGLTggY2hhcmFjdGVycyBmcm9tIGEgYnl0ZSBidWZmZXIuXHJcbiAqIEludmFsaWQgY2hhcmFjdGVycyBhcmUgcmVwbGFjZWQgd2l0aCAnUkVQTEFDRU1FTlQgQ0hBUkFDVEVSJyAoVStGRkZEKS5cclxuICogQHNlZSBodHRwczovL2VuY29kaW5nLnNwZWMud2hhdHdnLm9yZy8jdGhlLWVuY29kaW5nXHJcbiAqIEBzZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM0OTI2OTExXHJcbiAqIEBwYXJhbSB7IVVpbnQ4QXJyYXl8IUFycmF5PG51bWJlcj59IGJ1ZmZlciBBIGJ5dGUgYnVmZmVyLlxyXG4gKiBAcGFyYW0ge251bWJlcj19IHN0YXJ0IFRoZSBidWZmZXIgaW5kZXggdG8gc3RhcnQgcmVhZGluZy5cclxuICogQHBhcmFtIHs/bnVtYmVyPX0gZW5kIFRoZSBidWZmZXIgaW5kZXggdG8gc3RvcCByZWFkaW5nLlxyXG4gKiAgIEFzc3VtZXMgdGhlIGJ1ZmZlciBsZW5ndGggaWYgdW5kZWZpbmVkLlxyXG4gKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdW5wYWNrKGJ1ZmZlciwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpIHtcclxuICAvKiogQHR5cGUge3N0cmluZ30gKi9cclxuICBsZXQgc3RyID0gJyc7XHJcbiAgZm9yKGxldCBpbmRleCA9IHN0YXJ0OyBpbmRleCA8IGVuZDspIHtcclxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgbGV0IGxvd2VyQm91bmRhcnkgPSAweDgwO1xyXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICBsZXQgdXBwZXJCb3VuZGFyeSA9IDB4QkY7XHJcbiAgICAvKiogQHR5cGUge2Jvb2xlYW59ICovXHJcbiAgICBsZXQgcmVwbGFjZSA9IGZhbHNlO1xyXG4gICAgLyoqIEB0eXBlIHtudW1iZXJ9ICovXHJcbiAgICBsZXQgY2hhckNvZGUgPSBidWZmZXJbaW5kZXgrK107XHJcbiAgICBpZiAoY2hhckNvZGUgPj0gMHgwMCAmJiBjaGFyQ29kZSA8PSAweDdGKSB7XHJcbiAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoYXJDb2RlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICBpZiAoY2hhckNvZGUgPj0gMHhDMiAmJiBjaGFyQ29kZSA8PSAweERGKSB7XHJcbiAgICAgICAgY291bnQgPSAxO1xyXG4gICAgICB9IGVsc2UgaWYgKGNoYXJDb2RlID49IDB4RTAgJiYgY2hhckNvZGUgPD0gMHhFRiApIHtcclxuICAgICAgICBjb3VudCA9IDI7XHJcbiAgICAgICAgaWYgKGJ1ZmZlcltpbmRleF0gPT09IDB4RTApIHtcclxuICAgICAgICAgIGxvd2VyQm91bmRhcnkgPSAweEEwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYnVmZmVyW2luZGV4XSA9PT0gMHhFRCkge1xyXG4gICAgICAgICAgdXBwZXJCb3VuZGFyeSA9IDB4OUY7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKGNoYXJDb2RlID49IDB4RjAgJiYgY2hhckNvZGUgPD0gMHhGNCApIHtcclxuICAgICAgICBjb3VudCA9IDM7XHJcbiAgICAgICAgaWYgKGJ1ZmZlcltpbmRleF0gPT09IDB4RjApIHtcclxuICAgICAgICAgIGxvd2VyQm91bmRhcnkgPSAweDkwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYnVmZmVyW2luZGV4XSA9PT0gMHhGNCkge1xyXG4gICAgICAgICAgdXBwZXJCb3VuZGFyeSA9IDB4OEY7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlcGxhY2UgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGNoYXJDb2RlID0gY2hhckNvZGUgJiAoMSA8PCAoOCAtIGNvdW50IC0gMSkpIC0gMTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGJ1ZmZlcltpbmRleF0gPCBsb3dlckJvdW5kYXJ5IHx8IGJ1ZmZlcltpbmRleF0gPiB1cHBlckJvdW5kYXJ5KSB7XHJcbiAgICAgICAgICByZXBsYWNlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2hhckNvZGUgPSAoY2hhckNvZGUgPDwgNikgfCAoYnVmZmVyW2luZGV4XSAmIDB4M2YpO1xyXG4gICAgICAgIGluZGV4Kys7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHJlcGxhY2UpIHtcclxuICAgICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpO1xyXG4gICAgICB9IFxyXG4gICAgICBlbHNlIGlmIChjaGFyQ29kZSA8PSAweGZmZmYpIHtcclxuICAgICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyQ29kZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2hhckNvZGUgLT0gMHgxMDAwMDtcclxuICAgICAgICBzdHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShcclxuICAgICAgICAgICgoY2hhckNvZGUgPj4gMTApICYgMHgzZmYpICsgMHhkODAwLFxyXG4gICAgICAgICAgKGNoYXJDb2RlICYgMHgzZmYpICsgMHhkYzAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gc3RyO1xyXG59XHJcblxyXG4vKipcclxuICogV3JpdGUgYSBzdHJpbmcgb2YgVVRGLTggY2hhcmFjdGVycyB0byBhIGJ5dGUgYnVmZmVyLlxyXG4gKiBAc2VlIGh0dHBzOi8vZW5jb2Rpbmcuc3BlYy53aGF0d2cub3JnLyN1dGYtOC1lbmNvZGVyXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgVGhlIHN0cmluZyB0byBwYWNrLlxyXG4gKiBAcGFyYW0geyFVaW50OEFycmF5fCFBcnJheTxudW1iZXI+fSBidWZmZXIgVGhlIGJ1ZmZlciB0byBwYWNrIHRoZSBzdHJpbmcgdG8uXHJcbiAqIEBwYXJhbSB7bnVtYmVyPX0gaW5kZXggVGhlIGJ1ZmZlciBpbmRleCB0byBzdGFydCB3cml0aW5nLlxyXG4gKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBuZXh0IGluZGV4IHRvIHdyaXRlIGluIHRoZSBidWZmZXIuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFjayhzdHIsIGJ1ZmZlciwgaW5kZXg9MCkge1xyXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgbGV0IGNvZGVQb2ludCA9IHN0ci5jb2RlUG9pbnRBdChpKTtcclxuICAgIGlmIChjb2RlUG9pbnQgPCAxMjgpIHtcclxuICAgICAgYnVmZmVyW2luZGV4XSA9IGNvZGVQb2ludDtcclxuICAgICAgaW5kZXgrKztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xyXG4gICAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgICAvKiogQHR5cGUge251bWJlcn0gKi9cclxuICAgICAgbGV0IG9mZnNldCA9IDA7XHJcbiAgICAgIGlmIChjb2RlUG9pbnQgPD0gMHgwN0ZGKSB7XHJcbiAgICAgICAgY291bnQgPSAxO1xyXG4gICAgICAgIG9mZnNldCA9IDB4QzA7XHJcbiAgICAgIH0gZWxzZSBpZihjb2RlUG9pbnQgPD0gMHhGRkZGKSB7XHJcbiAgICAgICAgY291bnQgPSAyO1xyXG4gICAgICAgIG9mZnNldCA9IDB4RTA7XHJcbiAgICAgIH0gZWxzZSBpZihjb2RlUG9pbnQgPD0gMHgxMEZGRkYpIHtcclxuICAgICAgICBjb3VudCA9IDM7XHJcbiAgICAgICAgb2Zmc2V0ID0gMHhGMDtcclxuICAgICAgICBpKys7XHJcbiAgICAgIH1cclxuICAgICAgYnVmZmVyW2luZGV4XSA9IChjb2RlUG9pbnQgPj4gKDYgKiBjb3VudCkpICsgb2Zmc2V0O1xyXG4gICAgICBpbmRleCsrO1xyXG4gICAgICB3aGlsZSAoY291bnQgPiAwKSB7XHJcbiAgICAgICAgYnVmZmVyW2luZGV4XSA9IDB4ODAgfCAoY29kZVBvaW50ID4+ICg2ICogKGNvdW50IC0gMSkpICYgMHgzRik7XHJcbiAgICAgICAgaW5kZXgrKztcclxuICAgICAgICBjb3VudC0tO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBpbmRleDtcclxufVxyXG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIi8qc3R5bGUuY3NzKi9cXHJcXG5ib2R5IHtcXHJcXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXHJcXG4gICAgbWFyZ2luOiAwO1xcclxcbiAgICBwYWRkaW5nOiAwO1xcclxcbn1cXHJcXG5cXHJcXG4uYmFsbCB7XFxyXFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXHJcXG4gICAgd2lkdGg6IDE1cHg7XFxyXFxuICAgIGhlaWdodDogMTVweDtcXHJcXG4gICAgdG9wOiAwcHg7XFxyXFxuICAgIGxlZnQ6IDBweDtcXHJcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXHJcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcclxcbiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4xcyBsaW5lYXI7XFxyXFxufVxcclxcblxcclxcbi5wMXNjb3JlIHtcXHJcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgICB3aWR0aDogNzVweDtcXHJcXG4gICAgaGVpZ2h0OiAxNXB4O1xcclxcbiAgICBib3R0b206IDVweDtcXHJcXG4gICAgbGVmdDogMTBweDtcXHJcXG4gICAgZm9udC1mYW1pbHk6IEFyaWFsO1xcclxcbiAgICBmb250LXNpemU6IDEycHg7XFxyXFxuICAgIG9wYWNpdHk6IDAuNTtcXHJcXG59XFxyXFxuXFxyXFxuLnAyc2NvcmUge1xcclxcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxuICAgIHdpZHRoOiA3NXB4O1xcclxcbiAgICBoZWlnaHQ6IDE1cHg7XFxyXFxuICAgIGJvdHRvbTogNXB4O1xcclxcbiAgICByaWdodDogMTBweDtcXHJcXG4gICAgZm9udC1mYW1pbHk6IEFyaWFsO1xcclxcbiAgICBmb250LXNpemU6IDEycHg7XFxyXFxuICAgIG9wYWNpdHk6IDAuNTtcXHJcXG59XFxyXFxuXFxyXFxuLnAxIHtcXHJcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgICB3aWR0aDogMTBweDtcXHJcXG4gICAgaGVpZ2h0OiA0OHB4O1xcclxcbiAgICB0b3A6IDBweDtcXHJcXG4gICAgbGVmdDogMHB4O1xcclxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcclxcbiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4xcyBsaW5lYXI7XFxyXFxufVxcclxcblxcclxcbi5wMiB7XFxyXFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXHJcXG4gICAgd2lkdGg6IDEwcHg7XFxyXFxuICAgIGhlaWdodDogNDhweDtcXHJcXG4gICAgdG9wOiAwcHg7XFxyXFxuICAgIGxlZnQ6IDBweDtcXHJcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXHJcXG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMXMgbGluZWFyO1xcclxcbn1cXHJcXG5cXHJcXG4uZmxleCB7XFxyXFxuICAgIGRpc3BsYXk6IGZsZXg7XFxyXFxufVxcclxcblxcclxcbi5zbWFsbF93aWR0aCB7XFxyXFxuICAgIHdpZHRoOiAxNSU7XFxyXFxufVxcclxcblxcclxcbi5tZWRpdW1fd2lkdGgge1xcclxcbiAgICB3aWR0aDogMjUlO1xcclxcbn1cXHJcXG5cXHJcXG4ubGFyZ2Vfd2lkdGgge1xcclxcbiAgICB3aWR0aDogNjAlO1xcclxcbn1cXHJcXG5cXHJcXG4uc3BhY2VkRXF1YWwge1xcclxcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcXHJcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXHJcXG59XFxyXFxuXFxyXFxuLnN0YXJ0TGVmdCB7XFxyXFxuICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcXHJcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXHJcXG59XFxyXFxuXFxyXFxuaW5wdXQge1xcclxcbiAgICBoZWlnaHQ6IDMwcHg7XFxyXFxufVxcclxcblxcclxcbi5idXR0b24ge1xcclxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjI0ODg3O1xcclxcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMjI0ODg3O1xcclxcbiAgICBjb2xvcjogd2hpdGU7XFxyXFxuICAgIHBhZGRpbmc6IDEwcHggMzJweDtcXHJcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcclxcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxyXFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXHJcXG4gICAgbWFyZ2luOiAxNXB4O1xcclxcbn1cXHJcXG5cXHJcXG4uYnV0dG9uOmhvdmVyIHtcXHJcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxyXFxuICAgIGNvbG9yOiAjMjI0ODg3O1xcclxcbn1cXHJcXG5cXHJcXG4uYnV0dG9uOmRpc2FibGVkIHtcXHJcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogZ3JheTtcXHJcXG4gICAgY29sb3I6IGJsYWNrO1xcclxcbn1cXHJcXG5cXHJcXG5sYWJlbCB7XFxyXFxuICAgIG1hcmdpbi1sZWZ0OiAxMHB4O1xcclxcbiAgICBtYXJnaW4tcmlnaHQ6IDEwcHg7XFxyXFxuICAgIHdpZHRoOiA1MHB4O1xcclxcbn1cXHJcXG5cXHJcXG4uZ2FtZUFyZWEge1xcclxcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxyXFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDAwMDA7XFxyXFxuICAgIHdpZHRoOiA2MDBweDtcXHJcXG4gICAgaGVpZ2h0OiA0MDBweDtcXHJcXG4gICAgbWFyZ2luLXRvcDogMTVweDtcXHJcXG4gICAgbWFyZ2luLWxlZnQ6IDE1cHg7XFxyXFxuICAgIGJvcmRlcjogbm9uZTtcXHJcXG4gICAgY29sb3I6IHdoaXRlO1xcclxcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxyXFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXHJcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcclxcbiAgICBmb250LXNpemU6IDE2cHg7XFxyXFxufVxcclxcblxcclxcbi5pbnN0cnVjdGlvbnMge1xcclxcbiAgICBtYXJnaW46IDE1cHg7XFxyXFxuICAgIGZvbnQtZmFtaWx5OiBBcmlhbDtcXHJcXG4gICAgZm9udC1zaXplOiB4LWxhcmdlO1xcclxcbiAgICBmb250LXdlaWdodDogYm9sZDtcXHJcXG4gICAgY29sb3I6ICMyMjQ4ODc7XFxyXFxufVxcclxcblwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9zdHlsZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUEsWUFBWTtBQUNaO0lBQ0ksc0JBQXNCO0lBQ3RCLFNBQVM7SUFDVCxVQUFVO0FBQ2Q7O0FBRUE7SUFDSSxrQkFBa0I7SUFDbEIsV0FBVztJQUNYLFlBQVk7SUFDWixRQUFRO0lBQ1IsU0FBUztJQUNULHNCQUFzQjtJQUN0QixrQkFBa0I7SUFDbEIsaUNBQWlDO0FBQ3JDOztBQUVBO0lBQ0ksa0JBQWtCO0lBQ2xCLFdBQVc7SUFDWCxZQUFZO0lBQ1osV0FBVztJQUNYLFVBQVU7SUFDVixrQkFBa0I7SUFDbEIsZUFBZTtJQUNmLFlBQVk7QUFDaEI7O0FBRUE7SUFDSSxrQkFBa0I7SUFDbEIsV0FBVztJQUNYLFlBQVk7SUFDWixXQUFXO0lBQ1gsV0FBVztJQUNYLGtCQUFrQjtJQUNsQixlQUFlO0lBQ2YsWUFBWTtBQUNoQjs7QUFFQTtJQUNJLGtCQUFrQjtJQUNsQixXQUFXO0lBQ1gsWUFBWTtJQUNaLFFBQVE7SUFDUixTQUFTO0lBQ1Qsc0JBQXNCO0lBQ3RCLGlDQUFpQztBQUNyQzs7QUFFQTtJQUNJLGtCQUFrQjtJQUNsQixXQUFXO0lBQ1gsWUFBWTtJQUNaLFFBQVE7SUFDUixTQUFTO0lBQ1Qsc0JBQXNCO0lBQ3RCLGlDQUFpQztBQUNyQzs7QUFFQTtJQUNJLGFBQWE7QUFDakI7O0FBRUE7SUFDSSxVQUFVO0FBQ2Q7O0FBRUE7SUFDSSxVQUFVO0FBQ2Q7O0FBRUE7SUFDSSxVQUFVO0FBQ2Q7O0FBRUE7SUFDSSw2QkFBNkI7SUFDN0IsbUJBQW1CO0FBQ3ZCOztBQUVBO0lBQ0ksMkJBQTJCO0lBQzNCLG1CQUFtQjtBQUN2Qjs7QUFFQTtJQUNJLFlBQVk7QUFDaEI7O0FBRUE7SUFDSSx5QkFBeUI7SUFDekIseUJBQXlCO0lBQ3pCLFlBQVk7SUFDWixrQkFBa0I7SUFDbEIsa0JBQWtCO0lBQ2xCLHFCQUFxQjtJQUNyQixlQUFlO0lBQ2YsWUFBWTtBQUNoQjs7QUFFQTtJQUNJLHVCQUF1QjtJQUN2QixjQUFjO0FBQ2xCOztBQUVBO0lBQ0ksc0JBQXNCO0lBQ3RCLFlBQVk7QUFDaEI7O0FBRUE7SUFDSSxpQkFBaUI7SUFDakIsa0JBQWtCO0lBQ2xCLFdBQVc7QUFDZjs7QUFFQTtJQUNJLGtCQUFrQjtJQUNsQix5QkFBeUI7SUFDekIsWUFBWTtJQUNaLGFBQWE7SUFDYixnQkFBZ0I7SUFDaEIsaUJBQWlCO0lBQ2pCLFlBQVk7SUFDWixZQUFZO0lBQ1osa0JBQWtCO0lBQ2xCLHFCQUFxQjtJQUNyQixxQkFBcUI7SUFDckIsZUFBZTtBQUNuQjs7QUFFQTtJQUNJLFlBQVk7SUFDWixrQkFBa0I7SUFDbEIsa0JBQWtCO0lBQ2xCLGlCQUFpQjtJQUNqQixjQUFjO0FBQ2xCXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIi8qc3R5bGUuY3NzKi9cXHJcXG5ib2R5IHtcXHJcXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXHJcXG4gICAgbWFyZ2luOiAwO1xcclxcbiAgICBwYWRkaW5nOiAwO1xcclxcbn1cXHJcXG5cXHJcXG4uYmFsbCB7XFxyXFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXHJcXG4gICAgd2lkdGg6IDE1cHg7XFxyXFxuICAgIGhlaWdodDogMTVweDtcXHJcXG4gICAgdG9wOiAwcHg7XFxyXFxuICAgIGxlZnQ6IDBweDtcXHJcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXHJcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcclxcbiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4xcyBsaW5lYXI7XFxyXFxufVxcclxcblxcclxcbi5wMXNjb3JlIHtcXHJcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgICB3aWR0aDogNzVweDtcXHJcXG4gICAgaGVpZ2h0OiAxNXB4O1xcclxcbiAgICBib3R0b206IDVweDtcXHJcXG4gICAgbGVmdDogMTBweDtcXHJcXG4gICAgZm9udC1mYW1pbHk6IEFyaWFsO1xcclxcbiAgICBmb250LXNpemU6IDEycHg7XFxyXFxuICAgIG9wYWNpdHk6IDAuNTtcXHJcXG59XFxyXFxuXFxyXFxuLnAyc2NvcmUge1xcclxcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxyXFxuICAgIHdpZHRoOiA3NXB4O1xcclxcbiAgICBoZWlnaHQ6IDE1cHg7XFxyXFxuICAgIGJvdHRvbTogNXB4O1xcclxcbiAgICByaWdodDogMTBweDtcXHJcXG4gICAgZm9udC1mYW1pbHk6IEFyaWFsO1xcclxcbiAgICBmb250LXNpemU6IDEycHg7XFxyXFxuICAgIG9wYWNpdHk6IDAuNTtcXHJcXG59XFxyXFxuXFxyXFxuLnAxIHtcXHJcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcclxcbiAgICB3aWR0aDogMTBweDtcXHJcXG4gICAgaGVpZ2h0OiA0OHB4O1xcclxcbiAgICB0b3A6IDBweDtcXHJcXG4gICAgbGVmdDogMHB4O1xcclxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xcclxcbiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4xcyBsaW5lYXI7XFxyXFxufVxcclxcblxcclxcbi5wMiB7XFxyXFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXHJcXG4gICAgd2lkdGg6IDEwcHg7XFxyXFxuICAgIGhlaWdodDogNDhweDtcXHJcXG4gICAgdG9wOiAwcHg7XFxyXFxuICAgIGxlZnQ6IDBweDtcXHJcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjtcXHJcXG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMXMgbGluZWFyO1xcclxcbn1cXHJcXG5cXHJcXG4uZmxleCB7XFxyXFxuICAgIGRpc3BsYXk6IGZsZXg7XFxyXFxufVxcclxcblxcclxcbi5zbWFsbF93aWR0aCB7XFxyXFxuICAgIHdpZHRoOiAxNSU7XFxyXFxufVxcclxcblxcclxcbi5tZWRpdW1fd2lkdGgge1xcclxcbiAgICB3aWR0aDogMjUlO1xcclxcbn1cXHJcXG5cXHJcXG4ubGFyZ2Vfd2lkdGgge1xcclxcbiAgICB3aWR0aDogNjAlO1xcclxcbn1cXHJcXG5cXHJcXG4uc3BhY2VkRXF1YWwge1xcclxcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWFyb3VuZDtcXHJcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXHJcXG59XFxyXFxuXFxyXFxuLnN0YXJ0TGVmdCB7XFxyXFxuICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcXHJcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXHJcXG59XFxyXFxuXFxyXFxuaW5wdXQge1xcclxcbiAgICBoZWlnaHQ6IDMwcHg7XFxyXFxufVxcclxcblxcclxcbi5idXR0b24ge1xcclxcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjI0ODg3O1xcclxcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjMjI0ODg3O1xcclxcbiAgICBjb2xvcjogd2hpdGU7XFxyXFxuICAgIHBhZGRpbmc6IDEwcHggMzJweDtcXHJcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcclxcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxyXFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXHJcXG4gICAgbWFyZ2luOiAxNXB4O1xcclxcbn1cXHJcXG5cXHJcXG4uYnV0dG9uOmhvdmVyIHtcXHJcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XFxyXFxuICAgIGNvbG9yOiAjMjI0ODg3O1xcclxcbn1cXHJcXG5cXHJcXG4uYnV0dG9uOmRpc2FibGVkIHtcXHJcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogZ3JheTtcXHJcXG4gICAgY29sb3I6IGJsYWNrO1xcclxcbn1cXHJcXG5cXHJcXG5sYWJlbCB7XFxyXFxuICAgIG1hcmdpbi1sZWZ0OiAxMHB4O1xcclxcbiAgICBtYXJnaW4tcmlnaHQ6IDEwcHg7XFxyXFxuICAgIHdpZHRoOiA1MHB4O1xcclxcbn1cXHJcXG5cXHJcXG4uZ2FtZUFyZWEge1xcclxcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxyXFxuICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDAwMDA7XFxyXFxuICAgIHdpZHRoOiA2MDBweDtcXHJcXG4gICAgaGVpZ2h0OiA0MDBweDtcXHJcXG4gICAgbWFyZ2luLXRvcDogMTVweDtcXHJcXG4gICAgbWFyZ2luLWxlZnQ6IDE1cHg7XFxyXFxuICAgIGJvcmRlcjogbm9uZTtcXHJcXG4gICAgY29sb3I6IHdoaXRlO1xcclxcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxyXFxuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXHJcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcclxcbiAgICBmb250LXNpemU6IDE2cHg7XFxyXFxufVxcclxcblxcclxcbi5pbnN0cnVjdGlvbnMge1xcclxcbiAgICBtYXJnaW46IDE1cHg7XFxyXFxuICAgIGZvbnQtZmFtaWx5OiBBcmlhbDtcXHJcXG4gICAgZm9udC1zaXplOiB4LWxhcmdlO1xcclxcbiAgICBmb250LXdlaWdodDogYm9sZDtcXHJcXG4gICAgY29sb3I6ICMyMjQ4ODc7XFxyXFxufVxcclxcblwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTsgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07IC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cblxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuXG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblxuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuXG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2sgPSAwOyBfayA8IG1vZHVsZXMubGVuZ3RoOyBfaysrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19rXSk7XG5cbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgdmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIHJldHVybiBcIi8qIyBzb3VyY2VVUkw9XCIuY29uY2F0KGNzc01hcHBpbmcuc291cmNlUm9vdCB8fCBcIlwiKS5jb25jYXQoc291cmNlLCBcIiAqL1wiKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCIoKCk9PntcInVzZSBzdHJpY3RcIjt2YXIgZT17ZDoodCxpKT0+e2Zvcih2YXIgcyBpbiBpKWUubyhpLHMpJiYhZS5vKHQscykmJk9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LHMse2VudW1lcmFibGU6ITAsZ2V0Omlbc119KX0sbzooZSx0KT0+T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUsdCkscjplPT57XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFN5bWJvbCYmU3ltYm9sLnRvU3RyaW5nVGFnJiZPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxTeW1ib2wudG9TdHJpbmdUYWcse3ZhbHVlOlwiTW9kdWxlXCJ9KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KX19LHQ9e307ZS5yKHQpLGUuZCh0LHtVSTooKT0+bixVSVZpZXc6KCk9Pml9KTtjbGFzcyBpe2NvbnN0cnVjdG9yKCl7dGhpcy5zdGF0ZT1cImNyZWF0ZWRcIix0aGlzLmJpbmRpbmdzPVtdLHRoaXMuYW5pbWF0aW9ucz1bXSx0aGlzLmFuaW1hdGlvblF1ZXVlPVtdLHRoaXMuZGVzdHJveWVkPVwiXCIsdGhpcy5tb3ZlZD1cIlwifXN0YXRpYyBjcmVhdGUoZSx0LHM9e30sbz17cGFyZW50Om51bGwscHJlcGFyZTohMCxzaWJsaW5nOm51bGx9KXt2YXIgcjtjb25zdCBsPW5ldyBpO3JldHVybiBsLm1vZGVsPXMsbC5lbGVtZW50PXQsbC5iaW5kaW5ncy5wdXNoKC4uLm4ucGFyc2UobC5lbGVtZW50LHMsbCkpLGwucGFyZW50RWxlbWVudD1lLGwuc2libGluZz1vLnNpYmxpbmcsbC5wYXJlbnQ9bnVsbCE9PShyPW8ucGFyZW50KSYmdm9pZCAwIT09cj9yOm4sbC5hdHRhY2hlZD1uZXcgUHJvbWlzZSgoZT0+e2wuYXR0YWNoUmVzb2x2ZT1lfSkpLGx9ZGVzdHJveSgpe3RoaXMuZGVzdHJveWVkPVwicXVldWVcIixuLmRlc3Ryb3llZC5wdXNoKHRoaXMpfXRlcm1pbmF0ZSgpe1Byb21pc2UuYWxsKHRoaXMuZWxlbWVudC5nZXRBbmltYXRpb25zKHtzdWJ0cmVlOiEwfSkubWFwKChlPT5lLmZpbmlzaGVkKSkpLnRoZW4oKCgpPT57dmFyIGU7bnVsbD09PShlPXRoaXMuZWxlbWVudC5wYXJlbnRFbGVtZW50KXx8dm9pZCAwPT09ZXx8ZS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpLHRoaXMuYmluZGluZ3MuZm9yRWFjaCgoZT0+ZS51bmJpbmQoKSkpO2NvbnN0IHQ9dGhpcy5wYXJlbnQudmlld3MuZmluZEluZGV4KChlPT5lPT09dGhpcykpO3Q+LTEmJnRoaXMucGFyZW50LnZpZXdzLnNwbGljZSh0LDEpfSkpLHRoaXMuZGVzdHJveWVkPVwiZGVzdHJveWVkXCJ9bW92ZShlKXt0aGlzLm1vdmVkPVwicXVldWVcIix0aGlzLnNpYmxpbmc9ZX1wbGF5KGUsdCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGUmJihlPXRoaXMuYW5pbWF0aW9ucy5maW5kKCh0PT50Lm5hbWU9PT1lKSkuY2xvbmUoKSksZS5lbGVtZW50PXQsZS5zdGF0ZT1cInBlbmRpbmdcIix0aGlzLmFuaW1hdGlvblF1ZXVlLnB1c2goZSksdGhpcy51cGRhdGVBbmltYXRpb25zKHBlcmZvcm1hbmNlLm5vdygpKSxlfXVwZGF0ZUZyb21VSSgpe3RoaXMuYmluZGluZ3MuZm9yRWFjaCgoZT0+ZS51cGRhdGVGcm9tVUkoKSkpfXVwZGF0ZVRvVUkoKXt2YXIgZTt0aGlzLmJpbmRpbmdzLmZvckVhY2goKGU9PmUudXBkYXRlVG9VSSgpKSksXCJjcmVhdGVkXCI9PT10aGlzLnN0YXRlJiYodGhpcy5wYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZSh0aGlzLmVsZW1lbnQsbnVsbD09PShlPXRoaXMuc2libGluZyl8fHZvaWQgMD09PWU/dm9pZCAwOmUubmV4dFNpYmxpbmcpLHRoaXMuYXR0YWNoUmVzb2x2ZSgpLHRoaXMuc3RhdGU9XCJhdHRhY2hlZFwiKX11cGRhdGVBdEV2ZW50cygpe3RoaXMuYmluZGluZ3MuZm9yRWFjaCgoZT0+ZS51cGRhdGVBdEV2ZW50cygpKSl9dXBkYXRlQW5pbWF0aW9ucyhlKXtmb3IodmFyIHQsaTtudWxsIT09KGk9XCJmaW5pc2hlZFwiPT09KG51bGw9PT0odD10aGlzLmFuaW1hdGlvblF1ZXVlWzBdKXx8dm9pZCAwPT09dD92b2lkIDA6dC5zdGF0ZSkpJiZ2b2lkIDAhPT1pJiZpOyl0aGlzLmFuaW1hdGlvblF1ZXVlLnNoaWZ0KCkuZGVzdHJveSgpO2ZvcihsZXQgdD0wO3Q8dGhpcy5hbmltYXRpb25RdWV1ZS5sZW5ndGg7dCsrKXtjb25zdCBpPXRoaXMuYW5pbWF0aW9uUXVldWVbdF07XCJwZW5kaW5nXCI9PT1pLnN0YXRlJiYoaS5pc0Jsb2NrZWQoZSl8fChpLnN0YXRlPVwicGxheWluZ1wiLGkuc3RhcnRUaW1lPWUsaS5hbmltYXRpb249aS5lbGVtZW50LmFuaW1hdGUoaS5rZXlmcmFtZXMsaS5vcHRpb25zKSxpLmZpbmlzaGVkPWkuYW5pbWF0aW9uLmZpbmlzaGVkLGkuZmluaXNoZWQudGhlbigoKCk9PntpLnN0YXRlPVwiZmluaXNoZWRcIix0aGlzLnVwZGF0ZUFuaW1hdGlvbnMocGVyZm9ybWFuY2Uubm93KCkpfSkpKSl9fXVwZGF0ZU1vdmUoKXtzd2l0Y2godGhpcy5tb3ZlZCl7Y2FzZVwicXVldWVcIjp0aGlzLm1vdmVkPVwibW92ZVwiO2JyZWFrO2Nhc2VcIm1vdmVcIjowPT09dGhpcy5lbGVtZW50LmdldEFuaW1hdGlvbnMoe3N1YnRyZWU6ITB9KS5sZW5ndGgmJih0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodGhpcy5lbGVtZW50LHRoaXMuc2libGluZy5uZXh0U2libGluZyksdGhpcy5tb3ZlZD1cIlwiLHRoaXMuc2libGluZz12b2lkIDApfXRoaXMuYmluZGluZ3MuZm9yRWFjaCgoZT0+ZS51cGRhdGVNb3ZlKCkpKX19Y2xhc3Mgc3tjb25zdHJ1Y3Rvcigpe3RoaXMuZnJvbVVJPSExLHRoaXMudG9VST0hMCx0aGlzLmF0RXZlbnQ9ITEsdGhpcy5vbmVUaW1lPSExLHRoaXMudmlld3M9W10sdGhpcy5maXJzdFVwZGF0ZT0hMCx0aGlzLmV2ZW50cz1bXSx0aGlzLnRyaWdnZXJBdEV2ZW50PWU9Pnt0aGlzLmV2ZW50cy5wdXNoKGUpfSx0aGlzLmlkPSsrbi5pZH1nZXQgZWxlbWVudCgpe3JldHVybiBudWxsPT10aGlzLiRlbGVtZW50JiYodGhpcy4kZWxlbWVudD10aGlzLnNlbGVjdG9yIGluc3RhbmNlb2YgRWxlbWVudHx8dGhpcy5zZWxlY3RvciBpbnN0YW5jZW9mIFRleHR8fHRoaXMuc2VsZWN0b3IgaW5zdGFuY2VvZiBDb21tZW50P3RoaXMuc2VsZWN0b3I6dGhpcy5jb250ZXh0LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcikpLHRoaXMuJGVsZW1lbnR9c2V0IGVsZW1lbnQoZSl7dGhpcy4kZWxlbWVudD1lfXN0YXRpYyBjcmVhdGUoZSl7dmFyIHQsaSxvLHIsbCxhLGgsdSxkO2NvbnN0IHA9bmV3IHM7cmV0dXJuIHAub2JqZWN0PVwiJG1vZGVsXCJpbiBlLm9iamVjdD9lLm9iamVjdDp7JG1vZGVsOmUub2JqZWN0fSxwLnByb3BlcnR5PWUucHJvcGVydHkscC5jb250ZXh0PW51bGwhPT0odD1lLmNvbnRleHQpJiZ2b2lkIDAhPT10P3Q6ZG9jdW1lbnQscC5zZWxlY3Rvcj1lLnNlbGVjdG9yLHAuYXR0cmlidXRlPW51bGwhPT0oaT1lLmF0dHJpYnV0ZSkmJnZvaWQgMCE9PWk/aTpcImlubmVyVGV4dFwiLHAudmFsdWU9bnVsbCE9PShvPWUudmFsdWUpJiZ2b2lkIDAhPT1vP286cC52YWx1ZSxwLnRlbXBsYXRlPW51bGwhPT0ocj1lLnRlbXBsYXRlKSYmdm9pZCAwIT09cj9yOnAudGVtcGxhdGUscC5mcm9tVUk9bnVsbCE9PShsPWUuZnJvbVVJKSYmdm9pZCAwIT09bD9sOnAuZnJvbVVJLHAudG9VST1udWxsIT09KGE9ZS50b1VJKSYmdm9pZCAwIT09YT9hOnAudG9VSSxwLmF0RXZlbnQ9bnVsbCE9PShoPWUuYXRFdmVudCkmJnZvaWQgMCE9PWg/aDpwLmF0RXZlbnQscC5vbmVUaW1lPW51bGwhPT0odT1lLm9uZVRpbWUpJiZ2b2lkIDAhPT11P3U6cC5vbmVUaW1lLHAucGFyZW50PW51bGwhPT0oZD1lLnBhcmVudCkmJnZvaWQgMCE9PWQ/ZDpuLHAuYWRkTGlzdGVuZXIoKSxcImJvb2xlYW5cIiE9dHlwZW9mIHAuZnJvbVVJJiYocC5mcm9tVUk9cC5mcm9tVUkuYmluZChwKSksXCJib29sZWFuXCIhPXR5cGVvZiBwLnRvVUkmJihwLnRvVUk9cC50b1VJLmJpbmQocCkpLHB9ZGVzdHJveSgpe3RoaXMuZWxlbWVudD1udWxsLHRoaXMucmVtb3ZlTGlzdGVuZXIoKSx0aGlzLnZpZXdzLmZvckVhY2goKGU9PmUuZGVzdHJveSgpKSl9dW5iaW5kKCl7bi51bmJpbmQodGhpcyl9YWRkTGlzdGVuZXIoKXt0aGlzLmF0RXZlbnQmJih0aGlzLnRvVUk9ITEsdGhpcy5mcm9tVUk9ITEsdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodGhpcy5hdHRyaWJ1dGUsdGhpcy50cmlnZ2VyQXRFdmVudCkpfXJlbW92ZUxpc3RlbmVyKCl7dGhpcy5hdEV2ZW50JiZ0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLmF0dHJpYnV0ZSx0aGlzLnRyaWdnZXJBdEV2ZW50KX11cGRhdGVGcm9tVUkoKXtpZighMT09PXRoaXMuZnJvbVVJfHx0aGlzLmZpcnN0VXBkYXRlKXJldHVybiB0aGlzLmZpcnN0VXBkYXRlPSExLHZvaWQgdGhpcy52aWV3cy5mb3JFYWNoKChlPT5lLnVwZGF0ZUZyb21VSSgpKSk7Y29uc3R7dGFyZ2V0OmUscHJvcGVydHk6dH09bi5yZXNvbHZlUHJvcGVydHkodGhpcy5lbGVtZW50LHRoaXMuYXR0cmlidXRlKSxpPWVbdF07aWYoaSE9PXRoaXMubGFzdFVJVmFsdWUpe2xldCBlPSEwIT09dGhpcy5mcm9tVUk/dGhpcy5mcm9tVUkoaSx0aGlzLmxhc3RVSVZhbHVlLHRoaXMucHJvcGVydHksdGhpcy5vYmplY3QpOmk7aWYodGhpcy5sYXN0VUlWYWx1ZT1pLHZvaWQgMCE9PWUmJmUhPT10aGlzLmxhc3RWYWx1ZSl7dGhpcy5sYXN0VmFsdWU9ZTtjb25zdHt0YXJnZXQ6dCxwcm9wZXJ0eTppfT1uLnJlc29sdmVQcm9wZXJ0eSh0aGlzLm9iamVjdCx0aGlzLnByb3BlcnR5KTtcIm51bWJlclwiIT09bi5yZXNvbHZlVmFsdWUodGhpcy5vYmplY3QsdGhpcy5wcm9wZXJ0eSl8fGlzTmFOKGUpfHwoZT0rZSksdFtpXT1lfWVsc2UgdGhpcy5sYXN0VmFsdWU9ZX10aGlzLnZpZXdzLmZvckVhY2goKGU9PmUudXBkYXRlRnJvbVVJKCkpKX11cGRhdGVUb1VJKCl7dmFyIGUsdCxzLG8scixsO2lmKCExPT09dGhpcy50b1VJKXJldHVybiB2b2lkIHRoaXMudmlld3MuZm9yRWFjaCgoZT0+ZS51cGRhdGVUb1VJKCkpKTtsZXQgYT1uLnJlc29sdmVWYWx1ZSh0aGlzLm9iamVjdCx0aGlzLnByb3BlcnR5KSxoPSExO2lmKG51bGwhPXRoaXMudGVtcGxhdGUpaWYoXCJib29sZWFuXCI9PXR5cGVvZiB0aGlzLmF0dHJpYnV0ZSl7aWYoYSE9PXRoaXMubGFzdFZhbHVlKXtjb25zdCBlPSEwIT09dGhpcy50b1VJP3RoaXMudG9VSShhLHRoaXMubGFzdFZhbHVlLHRoaXMucHJvcGVydHksdGhpcy5vYmplY3QpOmE7aWYodm9pZCAwIT09ZSYmZSE9PXRoaXMubGFzdFVJVmFsdWUpe2lmKGU9PT10aGlzLmF0dHJpYnV0ZSl0aGlzLnZpZXdzLnB1c2goaS5jcmVhdGUodGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQsdGhpcy50ZW1wbGF0ZS5jbG9uZU5vZGUoITApLHRoaXMub2JqZWN0LHtwYXJlbnQ6dGhpcyxwcmVwYXJlOiExLHNpYmxpbmc6dGhpcy5lbGVtZW50fSkpO2Vsc2V7Y29uc3QgZT10aGlzLnZpZXdzLnBvcCgpO251bGw9PWV8fGUuZGVzdHJveSgpfXRoaXMubGFzdFZhbHVlPWEsdGhpcy5sYXN0VUlWYWx1ZT1lfX19ZWxzZXtudWxsPT1hJiYoYT1bXSk7Y29uc3Qgbj1udWxsIT09KGU9dGhpcy5sYXN0VmFsdWUpJiZ2b2lkIDAhPT1lP2U6W107aWYoYS5sZW5ndGghPT1uLmxlbmd0aCloPSEwO2Vsc2UgZm9yKGxldCBlPTAsdD1hLmxlbmd0aDtlPHQ7ZSsrKWlmKGFbZV0hPT1uW2VdKXtoPSEwO2JyZWFrfWlmKCFoKXJldHVybiB0aGlzLnZpZXdzLmZvckVhY2goKGU9PmUudXBkYXRlVG9VSSgpKSksdm9pZCh0aGlzLm9uZVRpbWUmJnRoaXMub25lVGltZURvbmUoKSk7Y29uc3QgdT0hMCE9PXRoaXMudG9VST90aGlzLnRvVUkoYSxuLHRoaXMucHJvcGVydHksdGhpcy5vYmplY3QpOmE7aWYobnVsbD09dSlyZXR1cm4gdGhpcy52aWV3cy5mb3JFYWNoKChlPT5lLnVwZGF0ZVRvVUkoKSkpLHZvaWQodGhpcy5vbmVUaW1lJiZ0aGlzLm9uZVRpbWVEb25lKCkpO2NvbnN0IGQ9bnVsbCE9PSh0PXRoaXMubGFzdFVJVmFsdWUpJiZ2b2lkIDAhPT10P3Q6W107bGV0IHA9MDtmb3IobGV0IGU9MCx0PXUubGVuZ3RoLGk9MDtlPHQmJnVbZV09PT1kW2ldO2UrKyxpKyspcCsrO2lmKHA9PT11Lmxlbmd0aCYmdS5sZW5ndGg9PT1kLmxlbmd0aClyZXR1cm4gdGhpcy52aWV3cy5mb3JFYWNoKChlPT5lLnVwZGF0ZVRvVUkoKSkpLHZvaWQodGhpcy5vbmVUaW1lJiZ0aGlzLm9uZVRpbWVEb25lKCkpO2NvbnN0IGM9dGhpcy52aWV3cy5zcGxpY2UoMCxwKTtmb3IobGV0IGU9cCx0PXUubGVuZ3RoLG49cDtlPHQ7ZSsrLG4rKyl7Y29uc3QgdD11W2VdO1wic3RyaW5nXCIhPXR5cGVvZiB0JiYodC4kaW5kZXg9ZSk7Y29uc3Qgbj1jW2MubGVuZ3RoLTFdLGE9dGhpcy52aWV3cy5zaGlmdCgpO2lmKG51bGw9PWEpe2NvbnN0IGU9eyRtb2RlbDp7W3RoaXMuYXR0cmlidXRlXTp0fSwkcGFyZW50OnRoaXMub2JqZWN0fTtjLnB1c2goaS5jcmVhdGUodGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQsdGhpcy50ZW1wbGF0ZS5jbG9uZU5vZGUoITApLGUse3BhcmVudDp0aGlzLHByZXBhcmU6ITEsc2libGluZzpudWxsIT09KHM9bnVsbD09bj92b2lkIDA6bi5lbGVtZW50KSYmdm9pZCAwIT09cz9zOnRoaXMuZWxlbWVudH0pKTtjb250aW51ZX1pZih0PT09KG51bGw9PWE/dm9pZCAwOmEubW9kZWwuJG1vZGVsW3RoaXMuYXR0cmlidXRlXSkpe2MucHVzaChhKSxhLm1vdmUobnVsbCE9PShvPW51bGw9PW4/dm9pZCAwOm4uZWxlbWVudCkmJnZvaWQgMCE9PW8/bzp0aGlzLmVsZW1lbnQpO2NvbnRpbnVlfWNvbnN0IGg9bnVsbD09YT92b2lkIDA6YS5tb2RlbC4kbW9kZWxbdGhpcy5hdHRyaWJ1dGVdO2lmKCF1LnNsaWNlKGUpLmluY2x1ZGVzKGgpKXthLmRlc3Ryb3koKSxlLS07Y29udGludWV9dGhpcy52aWV3cy51bnNoaWZ0KGEpO2xldCBkPSExO2ZvcihsZXQgZT0wLGk9dGhpcy52aWV3cy5sZW5ndGg7ZTxpO2UrKyl7Y29uc3QgaT10aGlzLnZpZXdzW2VdO2lmKHQ9PT0obnVsbD09aT92b2lkIDA6aS5tb2RlbC4kbW9kZWxbdGhpcy5hdHRyaWJ1dGVdKSl7Yy5wdXNoKC4uLnRoaXMudmlld3Muc3BsaWNlKGUsMSkpLGkubW92ZShudWxsIT09KHI9bnVsbD09bj92b2lkIDA6bi5lbGVtZW50KSYmdm9pZCAwIT09cj9yOnRoaXMuZWxlbWVudCksZD0hMDticmVha319aWYoIWQpe2NvbnN0IGU9eyRtb2RlbDp7W3RoaXMuYXR0cmlidXRlXTp0fSwkcGFyZW50OnRoaXMub2JqZWN0fTtjLnB1c2goaS5jcmVhdGUodGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnQsdGhpcy50ZW1wbGF0ZS5jbG9uZU5vZGUoITApLGUse3BhcmVudDp0aGlzLHByZXBhcmU6ITEsc2libGluZzpudWxsIT09KGw9bnVsbD09bj92b2lkIDA6bi5lbGVtZW50KSYmdm9pZCAwIT09bD9sOnRoaXMuZWxlbWVudH0pKX19dGhpcy52aWV3cy5mb3JFYWNoKChlPT5lLmRlc3Ryb3koKSkpLHRoaXMudmlld3M9Yyx0aGlzLmxhc3RWYWx1ZT1bLi4uYV0sdGhpcy5sYXN0VUlWYWx1ZT1bLi4udV19ZWxzZSBpZihhIT09dGhpcy5sYXN0VmFsdWUpe2NvbnN0IGU9ITAhPT10aGlzLnRvVUk/dGhpcy50b1VJKGEsdGhpcy5sYXN0VmFsdWUsdGhpcy5wcm9wZXJ0eSx0aGlzLm9iamVjdCk6YTtpZih2b2lkIDAhPT1lJiZlIT09dGhpcy5sYXN0VUlWYWx1ZSl7Y29uc3R7dGFyZ2V0OnQscHJvcGVydHk6aX09bi5yZXNvbHZlUHJvcGVydHkodGhpcy5lbGVtZW50LHRoaXMuYXR0cmlidXRlKTt0W2ldPWUsdGhpcy5sYXN0VmFsdWU9YSx0aGlzLmxhc3RVSVZhbHVlPWV9fXRoaXMudmlld3MuZm9yRWFjaCgoZT0+ZS51cGRhdGVUb1VJKCkpKSx0aGlzLm9uZVRpbWUmJnRoaXMub25lVGltZURvbmUoKX1vbmVUaW1lRG9uZSgpe3RoaXMudG9VST0hMSx0aGlzLmZyb21VST0hMX11cGRhdGVBdEV2ZW50cygpe2xldCBlPXRoaXMuZXZlbnRzLnNoaWZ0KCk7Zm9yKDtudWxsIT1lOyluLnJlc29sdmVWYWx1ZSh0aGlzLm9iamVjdCx0aGlzLnByb3BlcnR5KShlLHRoaXMub2JqZWN0LiRtb2RlbCx0aGlzLmVsZW1lbnQsdGhpcy5hdHRyaWJ1dGUsdGhpcy5vYmplY3QpLGU9dGhpcy5ldmVudHMuc2hpZnQoKTt0aGlzLnZpZXdzLmZvckVhY2goKGU9PmUudXBkYXRlQXRFdmVudHMoKSkpfXVwZGF0ZU1vdmUoKXt0aGlzLnZpZXdzLmZvckVhY2goKGU9PmUudXBkYXRlTW92ZSgpKSl9fWNsYXNzIG57c3RhdGljIGNyZWF0ZShlLHQscz17fSxvPXtwYXJlbnQ6bnVsbCxwcmVwYXJlOiEwLHNpYmxpbmc6bnVsbH0pe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXtjb25zdCBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7ZS5pbm5lckhUTUw9by5wcmVwYXJlP24ucHJlcGFyZSh0KTp0LHQ9ZS5maXJzdEVsZW1lbnRDaGlsZH1jb25zdCByPWkuY3JlYXRlKGUsdCxzLG8pO3JldHVybiByLnBhcmVudD09PW4mJm4udmlld3MucHVzaChyKSxyfXN0YXRpYyBwbGF5KGUsdCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGU/KGU9dGhpcy5nbG9iYWxzLmFuaW1hdGlvbnMuZmluZCgodD0+dC5uYW1lPT09ZSkpLmNsb25lKCkpLnBsYXkodCk6ZS5wbGF5KCl9c3RhdGljIHBhcnNlKGUsdCxpPW51bGwpe3ZhciBzLG8scjtjb25zdCBsPVtdO2lmKDM9PT1lLm5vZGVUeXBlKXtsZXQgcz1lLnRleHRDb250ZW50LG89cy5tYXRjaChuLnJlZ2V4VmFsdWUpO2Zvcig7bnVsbCE9bzspe2NvbnN0IHI9b1sxXTtsZXQgYT1vWzJdO3M9b1szXTtsZXQgaD0hMTthLnN0YXJ0c1dpdGgoXCJ8XCIpJiYoaD0hMCxhPWEuc2xpY2UoMSkudHJpbVN0YXJ0KCkpO2xldCB1PWUuY2xvbmVOb2RlKCk7ZS50ZXh0Q29udGVudD1yLGUucGFyZW50RWxlbWVudC5pbnNlcnRCZWZvcmUodSxlLm5leHRTaWJsaW5nKSxsLnB1c2gobi5iaW5kKHtzZWxlY3Rvcjp1LGF0dHJpYnV0ZTpcInRleHRDb250ZW50XCIsb2JqZWN0OnQscHJvcGVydHk6YSxwYXJlbnQ6aSxvbmVUaW1lOmh9KSksdT0oZT11KS5jbG9uZU5vZGUoKSx1LnRleHRDb250ZW50PXMsZS5wYXJlbnRFbGVtZW50Lmluc2VydEJlZm9yZSh1LGUubmV4dFNpYmxpbmcpLGU9dSxvPXMubWF0Y2gobi5yZWdleFZhbHVlKX19ZWxzZXtpZihsLnB1c2goLi4uT2JqZWN0LmtleXMobnVsbCE9PShzPWUuYXR0cmlidXRlcykmJnZvaWQgMCE9PXM/czpbXSkucmV2ZXJzZSgpLm1hcCgocz0+e2NvbnN0IG89W107aWYoZSBpbnN0YW5jZW9mIENvbW1lbnQpcmV0dXJuW107Y29uc3Qgcj1lLmF0dHJpYnV0ZXNbc107aWYoci5uYW1lLnN0YXJ0c1dpdGgoXCJwdWkuXCIpKXtjb25zdCBzPXIudmFsdWUubWF0Y2gobi5yZWdleEF0dHJpYnV0ZSk7bGV0IG8sbCxbYSxoLHUsZCxwXT1zLGM9ITE7aWYoXCJAXCIhPT11KXtjb25zdCBpPWgubWF0Y2goL14nKC4qPyknJC8pO2lmKG51bGwhPWkpbz1pWzFdLGUuc2V0QXR0cmlidXRlKFwidmFsdWVcIixvKSxoPVwib3B0aW9uXCI9PT1lLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk/XCJzZWxlY3RlZFwiOlwiY2hlY2tlZFwiLGQ9ZT0+ZT9vOnZvaWQgMCx1PWU9PmU9PT1vO2Vsc2UgaWYoXCJcIj09PWgpe2lmKFwiPlwiPT09ZCl7Y29uc3R7dGFyZ2V0OmkscHJvcGVydHk6c309bi5yZXNvbHZlUHJvcGVydHkodCxwKTtyZXR1cm4gaVtzXT1lLFtdfXtjb25zdCB0PWRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoci5uYW1lKTtlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHQsZSksZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGUpLGUucmVtb3ZlQXR0cmlidXRlKHIubmFtZSksbD1lLGU9dCxoPVwiPVwiPT09dSx1PSEwLFwifFwiPT09ZCYmKGM9ITApfX1lbHNlIGlmKFwiKlwiPT09ZCl7Y29uc3QgdD1kb2N1bWVudC5jcmVhdGVDb21tZW50KHIubmFtZSk7ZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0LGUpLGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlKSxlLnJlbW92ZUF0dHJpYnV0ZShyLm5hbWUpLGw9ZSxlPXR9ZWxzZVwifFwiPT09ZD9jPSEwOlwiY2hlY2tlZFwiIT09aCYmZS5zZXRBdHRyaWJ1dGUoaCxcIlwiKX1yZXR1cm5bbi5iaW5kKHtzZWxlY3RvcjplLGF0dHJpYnV0ZTpoLHZhbHVlOm8sb2JqZWN0OnQscHJvcGVydHk6cCx0ZW1wbGF0ZTpsLHRvVUk6XCJzdHJpbmdcIj09dHlwZW9mIHU/XCI8XCI9PT11OnUsZnJvbVVJOlwic3RyaW5nXCI9PXR5cGVvZiBkP1wiPlwiPT09ZDpkLGF0RXZlbnQ6XCJAXCI9PT11LHBhcmVudDppLG9uZVRpbWU6Y30pXX1jb25zdCBsPVtyLnZhbHVlXTtsZXQgYT0wLGg9bFthXS5tYXRjaChuLnJlZ2V4VmFsdWUpO2Zvcig7bnVsbCE9aDspe2xldHtiZWZvcmU6cyxwcm9wZXJ0eTp1LGFmdGVyOmR9PWguZ3JvdXBzLHA9ITE7dS5zdGFydHNXaXRoKFwifFwiKSYmKHA9ITAsdT11LnNsaWNlKDEpLnRyaW1TdGFydCgpKSxvLnB1c2gobi5iaW5kKHtzZWxlY3RvcjplLGF0dHJpYnV0ZTpyLm5hbWUsb2JqZWN0OnQscHJvcGVydHk6dSxvbmVUaW1lOnAsdG9VSSh0LGkscyxvKXtpZih0aGlzLm9uZVRpbWUpe2NvbnN0IGU9bC5pbmRleE9mKHMpO2U+LTEmJihsW2VdPW4ucmVzb2x2ZVZhbHVlKG8scyksbFtlLTFdKz1sW2VdK2xbZSsxXSxsLnNwbGljZShlLDIpKX1jb25zdCBhPWwubWFwKCgoZSx0KT0+dCUyPT0wP2U6bi5yZXNvbHZlVmFsdWUobyxlKSkpLmpvaW4oXCJcIik7ZS5zZXRBdHRyaWJ1dGUoci5uYW1lLGEpfSxwYXJlbnQ6aX0pKSxsW2ErK109cyxsW2ErK109dSxsW2FdPWQsaD1sW2FdLm1hdGNoKG4ucmVnZXhWYWx1ZSl9cmV0dXJuIG99KSkuZmxhdCgpKSxlIGluc3RhbmNlb2YgQ29tbWVudClyZXR1cm4gbC5maWx0ZXIoKGU9Pm51bGwhPWUudGVtcGxhdGV8fChlLnVuYmluZCgpLCExKSkpO2lmKCFuLmxlYXZlQXR0cmlidXRlcylmb3IobGV0IHQ9T2JqZWN0LmtleXMobnVsbCE9PShvPWUuYXR0cmlidXRlcykmJnZvaWQgMCE9PW8/bzpbXSkubGVuZ3RoLTE7dD49MDt0LS0pe2NvbnN0IGk9ZS5hdHRyaWJ1dGVzW09iamVjdC5rZXlzKG51bGwhPT0ocj1lLmF0dHJpYnV0ZXMpJiZ2b2lkIDAhPT1yP3I6W10pW3RdXTtpLm5hbWUuc3RhcnRzV2l0aChcInB1aS5cIikmJmUucmVtb3ZlQXR0cmlidXRlKGkubmFtZSl9bC5wdXNoKC4uLkFycmF5LmZyb20oZS5jaGlsZE5vZGVzKS5tYXAoKGU9Pm4ucGFyc2UoZSx0LGkpKSkuZmxhdCgpKX1yZXR1cm4gbH1zdGF0aWMgYmluZChlKXtyZXR1cm4gcy5jcmVhdGUoZSl9c3RhdGljIHVuYmluZChlKXtpZihlLmRlc3Ryb3koKSxlLnBhcmVudCE9PW4pe2NvbnN0IHQ9ZS5wYXJlbnQuYmluZGluZ3MsaT10LmluZGV4T2YoZSk7aT4tMSYmdC5zcGxpY2UoaSwxKX19c3RhdGljIHVwZGF0ZSgpe3RoaXMudmlld3MuZm9yRWFjaCgoZT0+ZS51cGRhdGVGcm9tVUkoKSkpLHRoaXMudmlld3MuZm9yRWFjaCgoZT0+ZS51cGRhdGVUb1VJKCkpKSx0aGlzLnZpZXdzLmZvckVhY2goKGU9PmUudXBkYXRlQXRFdmVudHMoKSkpO2NvbnN0IGU9cGVyZm9ybWFuY2Uubm93KCk7Wy4uLnRoaXMudmlld3MsdGhpcy5nbG9iYWxzXS5mb3JFYWNoKCh0PT50LnVwZGF0ZUFuaW1hdGlvbnMoZSkpKSx0aGlzLnZpZXdzLmZvckVhY2goKGU9PntlLnVwZGF0ZU1vdmUoKX0pKSx0aGlzLmRlc3Ryb3llZC5mb3JFYWNoKChlPT57c3dpdGNoKGUuZGVzdHJveWVkKXtjYXNlXCJxdWV1ZVwiOmUuZGVzdHJveWVkPVwiZGVzdHJveVwiO2JyZWFrO2Nhc2VcImRlc3Ryb3lcIjp7ZS50ZXJtaW5hdGUoKTtjb25zdCB0PXRoaXMuZGVzdHJveWVkLmZpbmRJbmRleCgodD0+ZT09PXQpKTt0Pi0xJiZ0aGlzLmRlc3Ryb3llZC5zcGxpY2UodCwxKX19fSkpfXN0YXRpYyByZXNvbHZlUHJvcGVydHkoZSx0KXtjb25zdCBpPSh0PXQucmVwbGFjZShcIltcIixcIi5cIikucmVwbGFjZShcIl1cIixcIi5cIikpLnNwbGl0KFwiLlwiKS5maWx0ZXIoKGU9PihudWxsIT1lP2U6XCJcIikubGVuZ3RoPjApKTtsZXQgcz1cIiRtb2RlbFwiaW4gZT9lLiRtb2RlbDplO2Zvcig7aS5sZW5ndGg+MTspcz1zW2kuc2hpZnQoKV07cmV0dXJue3RhcmdldDpzLHByb3BlcnR5OmlbMF19fXN0YXRpYyByZXNvbHZlVmFsdWUoZSx0KXtsZXQgaT0wO2Rve2NvbnN0e3RhcmdldDppLHByb3BlcnR5OnN9PW4ucmVzb2x2ZVByb3BlcnR5KGUsdCk7aWYocyBpbiBpKXJldHVybiBpW3NdO2U9ZS4kcGFyZW50fXdoaWxlKG51bGwhPWUmJmkrKzwxZTMpfXN0YXRpYyBwcmVwYXJlKGUpe2xldCB0PWU7ZT1cIlwiO2xldCBpPXQubWF0Y2gobi5yZWdleFJlcGxhY2UpO2Zvcig7bnVsbCE9aTspe2NvbnN0W3MsbyxyLGxdPWk7ZSs9YCR7b30gUFVJLiR7bi5iaW5kaW5nQ291bnRlcisrfT1cIiR7cn1cIiBgLHQ9bCxpPXQubWF0Y2gobi5yZWdleFJlcGxhY2UpfXJldHVybiBlK3R9fW4uaWQ9MCxuLnZpZXdzPVtdLG4uZGVzdHJveWVkPVtdLG4uZ2xvYmFscz1uZXcgaSxuLmxlYXZlQXR0cmlidXRlcz0hMSxuLnJlZ2V4UmVwbGFjZT0vKFtcXFNcXHNdKj8pXFwkXFx7KFtefV0qP1s8PUAhXT1bKj0+fF1bXn1dKj8pXFx9KFtcXFNcXHNdKikvbSxuLnJlZ2V4QXR0cmlidXRlPS9eXFxzKihcXFMqPylcXHMqKFs8PUAhXSk9KFsqPT58XSlcXHMqKFxcUyo/KVxccyokLyxuLnJlZ2V4VmFsdWU9Lyg/PGJlZm9yZT5bXFxTXFxzXSo/KVxcJFxce1xccyooPzxwcm9wZXJ0eT5bXFxzXFxTXSo/KVxccypcXH0oPzxhZnRlcj5bXFxTXFxzXSopL20sbi5iaW5kaW5nQ291bnRlcj0wO3ZhciBvPWV4cG9ydHM7Zm9yKHZhciByIGluIHQpb1tyXT10W3JdO3QuX19lc01vZHVsZSYmT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSl9KSgpOyIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc3R5bGVzSW5ET00gPSBbXTtcblxuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG5cbiAgICBpZiAoaW5kZXhCeUlkZW50aWZpZXIgIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHVwZGF0ZXIgPSBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKTtcbiAgICAgIG9wdGlvbnMuYnlJbmRleCA9IGk7XG4gICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoaSwgMCwge1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiB1cGRhdGVyLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuXG5mdW5jdGlvbiBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBhcGkgPSBvcHRpb25zLmRvbUFQSShvcHRpb25zKTtcbiAgYXBpLnVwZGF0ZShvYmopO1xuXG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB1cGRhdGVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuXG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuXG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuXG4gICAgICBpZiAoc3R5bGVzSW5ET01bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRE9NW19pbmRleF0udXBkYXRlcigpO1xuXG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTsgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcblxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuXG4gIHJldHVybiBtZW1vW3RhcmdldF07XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuXG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuXG4gIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcblxuICBpZiAobm9uY2UpIHtcbiAgICBzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgbm9uY2UpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpO1xuICB9XG5cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuXG4gIGNzcyArPSBvYmouY3NzO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfSAvLyBGb3Igb2xkIElFXG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuXG5cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCJpbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5pbXBvcnQgKiBhcyBUIGZyb20gXCIuL3R5cGVzXCI7XG5cbmV4cG9ydCBjb25zdCBDT09SRElOQVRPUl9IT1NUID0gcHJvY2Vzcy5lbnYuQ09PUkRJTkFUT1JfSE9TVCE7XG5leHBvcnQgY29uc3QgTUFUQ0hNQUtFUl9IT1NUID0gcHJvY2Vzcy5lbnYuTUFUQ0hNQUtFUl9IT1NUITtcblxuZXhwb3J0IGNvbnN0IE5PX0RJRkYgPSBTeW1ib2woXCJOT0RJRkZcIik7XG5leHBvcnQgdHlwZSBEZWVwUGFydGlhbDxUPiA9IFQgZXh0ZW5kcyBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgdW5kZWZpbmVkXG4gID8gVFxuICA6IFQgZXh0ZW5kcyBBcnJheTxpbmZlciBBcnJheVR5cGU+XG4gID8gQXJyYXk8RGVlcFBhcnRpYWw8QXJyYXlUeXBlPiB8IHR5cGVvZiBOT19ESUZGPiB8IHR5cGVvZiBOT19ESUZGXG4gIDogVCBleHRlbmRzIHsgdHlwZTogc3RyaW5nOyB2YWw6IGFueSB9XG4gID8geyB0eXBlOiBUW1widHlwZVwiXTsgdmFsOiBEZWVwUGFydGlhbDxUW1widmFsXCJdIHwgdHlwZW9mIE5PX0RJRkY+IH1cbiAgOiB7IFtLIGluIGtleW9mIFRdOiBEZWVwUGFydGlhbDxUW0tdPiB8IHR5cGVvZiBOT19ESUZGIH07XG5cbmV4cG9ydCBlbnVtIE1ldGhvZCB7XG4gIFVQREFURV9QTEFZRVJfVkVMT0NJVFksXG4gIFNUQVJUX1JPVU5ELFxuICBKT0lOX0dBTUUsXG4gIFNUQVJUX0dBTUUsXG59XG5cbmV4cG9ydCB0eXBlIE9rUmVzcG9uc2UgPSB7IHR5cGU6IFwib2tcIiB9O1xuZXhwb3J0IHR5cGUgRXJyb3JSZXNwb25zZSA9IHsgdHlwZTogXCJlcnJvclwiOyBlcnJvcjogc3RyaW5nIH07XG5leHBvcnQgdHlwZSBSZXNwb25zZSA9IE9rUmVzcG9uc2UgfCBFcnJvclJlc3BvbnNlO1xuZXhwb3J0IGNvbnN0IFJlc3BvbnNlOiB7IG9rOiAoKSA9PiBPa1Jlc3BvbnNlOyBlcnJvcjogKGVycm9yOiBzdHJpbmcpID0+IEVycm9yUmVzcG9uc2UgfSA9IHtcbiAgb2s6ICgpID0+ICh7IHR5cGU6IFwib2tcIiB9KSxcbiAgZXJyb3I6IChlcnJvcikgPT4gKHsgdHlwZTogXCJlcnJvclwiLCBlcnJvciB9KSxcbn07XG5cbmV4cG9ydCB0eXBlIFJlc3BvbnNlTWVzc2FnZSA9IHsgdHlwZTogXCJyZXNwb25zZVwiOyBtc2dJZDogbnVtYmVyOyByZXNwb25zZTogUmVzcG9uc2UgfTtcbmV4cG9ydCB0eXBlIEV2ZW50TWVzc2FnZSA9IHsgdHlwZTogXCJldmVudFwiOyBldmVudDogc3RyaW5nIH07XG5leHBvcnQgdHlwZSBNZXNzYWdlID0gUmVzcG9uc2VNZXNzYWdlIHwgRXZlbnRNZXNzYWdlO1xuZXhwb3J0IGNvbnN0IE1lc3NhZ2U6IHtcbiAgcmVzcG9uc2U6IChtc2dJZDogbnVtYmVyLCByZXNwb25zZTogUmVzcG9uc2UpID0+IFJlc3BvbnNlTWVzc2FnZTtcbiAgZXZlbnQ6IChldmVudDogc3RyaW5nKSA9PiBFdmVudE1lc3NhZ2U7XG59ID0ge1xuICByZXNwb25zZTogKG1zZ0lkLCByZXNwb25zZSkgPT4gKHsgdHlwZTogXCJyZXNwb25zZVwiLCBtc2dJZCwgcmVzcG9uc2UgfSksXG4gIGV2ZW50OiAoZXZlbnQpID0+ICh7IHR5cGU6IFwiZXZlbnRcIiwgZXZlbnQgfSksXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIEFub255bW91c1VzZXJEYXRhIHtcbiAgdHlwZTogXCJhbm9ueW1vdXNcIjtcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xufVxuZXhwb3J0IHR5cGUgVXNlckRhdGEgPSBBbm9ueW1vdXNVc2VyRGF0YTtcblxuZXhwb3J0IGZ1bmN0aW9uIGxvb2t1cFVzZXIodXNlcklkOiBULlVzZXJJZCk6IFByb21pc2U8VXNlckRhdGE+IHtcbiAgcmV0dXJuIGF4aW9zLmdldDxVc2VyRGF0YT4oYGh0dHBzOi8vJHtDT09SRElOQVRPUl9IT1NUfS91c2Vycy8ke3VzZXJJZH1gKS50aGVuKChyZXMpID0+IHJlcy5kYXRhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFVzZXJEaXNwbGF5TmFtZSh1c2VyOiBVc2VyRGF0YSkge1xuICBzd2l0Y2ggKHVzZXIudHlwZSkge1xuICAgIGNhc2UgXCJhbm9ueW1vdXNcIjpcbiAgICAgIHJldHVybiB1c2VyLm5hbWU7XG4gIH1cbn1cbiIsImltcG9ydCB7IFdyaXRlciBhcyBfV3JpdGVyLCBSZWFkZXIgYXMgX1JlYWRlciB9IGZyb20gXCJiaW4tc2VyZGVcIjtcbmltcG9ydCB7XG4gIE5PX0RJRkYgYXMgX05PX0RJRkYsXG4gIERlZXBQYXJ0aWFsIGFzIF9EZWVwUGFydGlhbCxcbiAgUmVzcG9uc2UgYXMgX1Jlc3BvbnNlLFxuICBNZXNzYWdlIGFzIF9NZXNzYWdlLFxuICBSZXNwb25zZU1lc3NhZ2UgYXMgX1Jlc3BvbnNlTWVzc2FnZSxcbiAgRXZlbnRNZXNzYWdlIGFzIF9FdmVudE1lc3NhZ2UsXG59IGZyb20gXCIuL2Jhc2VcIjtcblxuZXhwb3J0IGVudW0gR2FtZVN0YXRlcyB7XG4gIElkbGUsXG4gIFBsYXllcnNKb2luaW5nLFxuICBXYWl0aW5nVG9TdGFydEdhbWUsXG4gIFdhaXRpbmdUb1N0YXJ0Um91bmQsXG4gIEluUHJvZ3Jlc3MsXG4gIEdhbWVPdmVyLFxufVxuZXhwb3J0IHR5cGUgVmVjdG9yID0ge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbn07XG5leHBvcnQgdHlwZSBCYWxsID0ge1xuICBwb3NpdGlvbjogVmVjdG9yO1xuICB2ZWxvY2l0eTogVmVjdG9yO1xuICByYWRpdXM6IG51bWJlcjtcbiAgaXNDb2xsaWRpbmc6IGJvb2xlYW47XG59O1xuZXhwb3J0IHR5cGUgUGxheWVyID0ge1xuICBpZDogVXNlcklkO1xuICBsaXZlczogbnVtYmVyO1xuICBwb3NpdGlvbjogVmVjdG9yO1xuICBzaXplOiBWZWN0b3I7XG4gIHZlbG9jaXR5OiBWZWN0b3I7XG4gIGlzQ29sbGlkaW5nOiBib29sZWFuO1xufTtcbmV4cG9ydCB0eXBlIFNlcnZlclN0YXRlID0ge1xuICBQbGF5ZXJzOiBQbGF5ZXJbXTtcbiAgQmFsbHM6IEJhbGxbXTtcbiAgZ2FtZVN0YXRlOiBHYW1lU3RhdGVzO1xufTtcbmV4cG9ydCB0eXBlIFBsYXllclN0YXRlID0ge1xuICBwbGF5ZXIxcG9zaXRpb246IFZlY3RvcjtcbiAgcGxheWVyMnBvc2l0aW9uOiBWZWN0b3I7XG4gIGJhbGxwb3NpdGlvbjogVmVjdG9yO1xuICBwbGF5ZXIxTGl2ZXM6IG51bWJlcjtcbiAgcGxheWVyMkxpdmVzOiBudW1iZXI7XG59O1xuZXhwb3J0IHR5cGUgVXNlcklkID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgSVVwZGF0ZVBsYXllclZlbG9jaXR5UmVxdWVzdCA9IHtcbiAgdmVsb2NpdHk6IFZlY3Rvcjtcbn07XG5leHBvcnQgdHlwZSBJU3RhcnRSb3VuZFJlcXVlc3QgPSB7XG59O1xuZXhwb3J0IHR5cGUgSUpvaW5HYW1lUmVxdWVzdCA9IHtcbn07XG5leHBvcnQgdHlwZSBJU3RhcnRHYW1lUmVxdWVzdCA9IHtcbn07XG5leHBvcnQgdHlwZSBJSW5pdGlhbGl6ZVJlcXVlc3QgPSB7XG59O1xuXG5leHBvcnQgY29uc3QgVmVjdG9yID0ge1xuICBkZWZhdWx0KCk6IFZlY3RvciB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IDAuMCxcbiAgICAgIHk6IDAuMCxcbiAgICB9O1xuICB9LFxuICB2YWxpZGF0ZShvYmo6IFZlY3Rvcikge1xuICAgIGlmICh0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICByZXR1cm4gW2BJbnZhbGlkIFZlY3RvciBvYmplY3Q6ICR7b2JqfWBdXG4gICAgfVxuICAgIGxldCB2YWxpZGF0aW9uRXJyb3JzOiBzdHJpbmdbXTtcblxuICAgIHZhbGlkYXRpb25FcnJvcnMgPSB2YWxpZGF0ZVByaW1pdGl2ZSh0eXBlb2Ygb2JqLnggPT09IFwibnVtYmVyXCIsIGBJbnZhbGlkIGZsb2F0OiAkeyBvYmoueCB9YCk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IFZlY3Rvci54XCIpO1xuICAgIH1cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gdmFsaWRhdGVQcmltaXRpdmUodHlwZW9mIG9iai55ID09PSBcIm51bWJlclwiLCBgSW52YWxpZCBmbG9hdDogJHsgb2JqLnkgfWApO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQga2V5OiBWZWN0b3IueVwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycztcbiAgfSxcbiAgZW5jb2RlKG9iajogVmVjdG9yLCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgd3JpdGVGbG9hdChidWYsIG9iai54KTtcbiAgICB3cml0ZUZsb2F0KGJ1Ziwgb2JqLnkpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGVuY29kZURpZmYob2JqOiBfRGVlcFBhcnRpYWw8VmVjdG9yPiwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIGNvbnN0IHRyYWNrZXI6IGJvb2xlYW5bXSA9IFtdO1xuICAgIHRyYWNrZXIucHVzaChvYmoueCAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmoueSAhPT0gX05PX0RJRkYpO1xuICAgIGJ1Zi53cml0ZUJpdHModHJhY2tlcik7XG4gICAgaWYgKG9iai54ICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVGbG9hdChidWYsIG9iai54KTtcbiAgICB9XG4gICAgaWYgKG9iai55ICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVGbG9hdChidWYsIG9iai55KTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IFZlY3RvciB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHBhcnNlRmxvYXQoc2IpLFxuICAgICAgeTogcGFyc2VGbG9hdChzYiksXG4gICAgfTtcbiAgfSxcbiAgZGVjb2RlRGlmZihidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBfRGVlcFBhcnRpYWw8VmVjdG9yPiB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgY29uc3QgdHJhY2tlciA9IHNiLnJlYWRCaXRzKDIpO1xuICAgIHJldHVybiB7XG4gICAgICB4OiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUZsb2F0KHNiKSA6IF9OT19ESUZGLFxuICAgICAgeTogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VGbG9hdChzYikgOiBfTk9fRElGRixcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBCYWxsID0ge1xuICBkZWZhdWx0KCk6IEJhbGwge1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogVmVjdG9yLmRlZmF1bHQoKSxcbiAgICAgIHZlbG9jaXR5OiBWZWN0b3IuZGVmYXVsdCgpLFxuICAgICAgcmFkaXVzOiAwLFxuICAgICAgaXNDb2xsaWRpbmc6IGZhbHNlLFxuICAgIH07XG4gIH0sXG4gIHZhbGlkYXRlKG9iajogQmFsbCkge1xuICAgIGlmICh0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICByZXR1cm4gW2BJbnZhbGlkIEJhbGwgb2JqZWN0OiAke29ian1gXVxuICAgIH1cbiAgICBsZXQgdmFsaWRhdGlvbkVycm9yczogc3RyaW5nW107XG5cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gVmVjdG9yLnZhbGlkYXRlKG9iai5wb3NpdGlvbik7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IEJhbGwucG9zaXRpb25cIik7XG4gICAgfVxuICAgIHZhbGlkYXRpb25FcnJvcnMgPSBWZWN0b3IudmFsaWRhdGUob2JqLnZlbG9jaXR5KTtcbiAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycy5jb25jYXQoXCJJbnZhbGlkIGtleTogQmFsbC52ZWxvY2l0eVwiKTtcbiAgICB9XG4gICAgdmFsaWRhdGlvbkVycm9ycyA9IHZhbGlkYXRlUHJpbWl0aXZlKE51bWJlci5pc0ludGVnZXIob2JqLnJhZGl1cyksIGBJbnZhbGlkIGludDogJHsgb2JqLnJhZGl1cyB9YCk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IEJhbGwucmFkaXVzXCIpO1xuICAgIH1cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gdmFsaWRhdGVQcmltaXRpdmUodHlwZW9mIG9iai5pc0NvbGxpZGluZyA9PT0gXCJib29sZWFuXCIsIGBJbnZhbGlkIGJvb2xlYW46ICR7IG9iai5pc0NvbGxpZGluZyB9YCk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IEJhbGwuaXNDb2xsaWRpbmdcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnM7XG4gIH0sXG4gIGVuY29kZShvYmo6IEJhbGwsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBWZWN0b3IuZW5jb2RlKG9iai5wb3NpdGlvbiwgYnVmKTtcbiAgICBWZWN0b3IuZW5jb2RlKG9iai52ZWxvY2l0eSwgYnVmKTtcbiAgICB3cml0ZUludChidWYsIG9iai5yYWRpdXMpO1xuICAgIHdyaXRlQm9vbGVhbihidWYsIG9iai5pc0NvbGxpZGluZyk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZW5jb2RlRGlmZihvYmo6IF9EZWVwUGFydGlhbDxCYWxsPiwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIGNvbnN0IHRyYWNrZXI6IGJvb2xlYW5bXSA9IFtdO1xuICAgIHRyYWNrZXIucHVzaChvYmoucG9zaXRpb24gIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLnZlbG9jaXR5ICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5yYWRpdXMgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLmlzQ29sbGlkaW5nICE9PSBfTk9fRElGRik7XG4gICAgYnVmLndyaXRlQml0cyh0cmFja2VyKTtcbiAgICBpZiAob2JqLnBvc2l0aW9uICE9PSBfTk9fRElGRikge1xuICAgICAgVmVjdG9yLmVuY29kZURpZmYob2JqLnBvc2l0aW9uLCBidWYpO1xuICAgIH1cbiAgICBpZiAob2JqLnZlbG9jaXR5ICE9PSBfTk9fRElGRikge1xuICAgICAgVmVjdG9yLmVuY29kZURpZmYob2JqLnZlbG9jaXR5LCBidWYpO1xuICAgIH1cbiAgICBpZiAob2JqLnJhZGl1cyAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlSW50KGJ1Ziwgb2JqLnJhZGl1cyk7XG4gICAgfVxuICAgIGlmIChvYmouaXNDb2xsaWRpbmcgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUJvb2xlYW4oYnVmLCBvYmouaXNDb2xsaWRpbmcpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBkZWNvZGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogQmFsbCB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiBWZWN0b3IuZGVjb2RlKHNiKSxcbiAgICAgIHZlbG9jaXR5OiBWZWN0b3IuZGVjb2RlKHNiKSxcbiAgICAgIHJhZGl1czogcGFyc2VJbnQoc2IpLFxuICAgICAgaXNDb2xsaWRpbmc6IHBhcnNlQm9vbGVhbihzYiksXG4gICAgfTtcbiAgfSxcbiAgZGVjb2RlRGlmZihidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBfRGVlcFBhcnRpYWw8QmFsbD4ge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIGNvbnN0IHRyYWNrZXIgPSBzYi5yZWFkQml0cyg0KTtcbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246IHRyYWNrZXIuc2hpZnQoKSA/IFZlY3Rvci5kZWNvZGVEaWZmKHNiKSA6IF9OT19ESUZGLFxuICAgICAgdmVsb2NpdHk6IHRyYWNrZXIuc2hpZnQoKSA/IFZlY3Rvci5kZWNvZGVEaWZmKHNiKSA6IF9OT19ESUZGLFxuICAgICAgcmFkaXVzOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUludChzYikgOiBfTk9fRElGRixcbiAgICAgIGlzQ29sbGlkaW5nOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUJvb2xlYW4oc2IpIDogX05PX0RJRkYsXG4gICAgfTtcbiAgfSxcbn07XG5leHBvcnQgY29uc3QgUGxheWVyID0ge1xuICBkZWZhdWx0KCk6IFBsYXllciB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBcIlwiLFxuICAgICAgbGl2ZXM6IDAsXG4gICAgICBwb3NpdGlvbjogVmVjdG9yLmRlZmF1bHQoKSxcbiAgICAgIHNpemU6IFZlY3Rvci5kZWZhdWx0KCksXG4gICAgICB2ZWxvY2l0eTogVmVjdG9yLmRlZmF1bHQoKSxcbiAgICAgIGlzQ29sbGlkaW5nOiBmYWxzZSxcbiAgICB9O1xuICB9LFxuICB2YWxpZGF0ZShvYmo6IFBsYXllcikge1xuICAgIGlmICh0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICByZXR1cm4gW2BJbnZhbGlkIFBsYXllciBvYmplY3Q6ICR7b2JqfWBdXG4gICAgfVxuICAgIGxldCB2YWxpZGF0aW9uRXJyb3JzOiBzdHJpbmdbXTtcblxuICAgIHZhbGlkYXRpb25FcnJvcnMgPSB2YWxpZGF0ZVByaW1pdGl2ZSh0eXBlb2Ygb2JqLmlkID09PSBcInN0cmluZ1wiLCBgSW52YWxpZCBVc2VySWQ6ICR7IG9iai5pZCB9YCk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IFBsYXllci5pZFwiKTtcbiAgICB9XG4gICAgdmFsaWRhdGlvbkVycm9ycyA9IHZhbGlkYXRlUHJpbWl0aXZlKE51bWJlci5pc0ludGVnZXIob2JqLmxpdmVzKSwgYEludmFsaWQgaW50OiAkeyBvYmoubGl2ZXMgfWApO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQga2V5OiBQbGF5ZXIubGl2ZXNcIik7XG4gICAgfVxuICAgIHZhbGlkYXRpb25FcnJvcnMgPSBWZWN0b3IudmFsaWRhdGUob2JqLnBvc2l0aW9uKTtcbiAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycy5jb25jYXQoXCJJbnZhbGlkIGtleTogUGxheWVyLnBvc2l0aW9uXCIpO1xuICAgIH1cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gVmVjdG9yLnZhbGlkYXRlKG9iai5zaXplKTtcbiAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycy5jb25jYXQoXCJJbnZhbGlkIGtleTogUGxheWVyLnNpemVcIik7XG4gICAgfVxuICAgIHZhbGlkYXRpb25FcnJvcnMgPSBWZWN0b3IudmFsaWRhdGUob2JqLnZlbG9jaXR5KTtcbiAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycy5jb25jYXQoXCJJbnZhbGlkIGtleTogUGxheWVyLnZlbG9jaXR5XCIpO1xuICAgIH1cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gdmFsaWRhdGVQcmltaXRpdmUodHlwZW9mIG9iai5pc0NvbGxpZGluZyA9PT0gXCJib29sZWFuXCIsIGBJbnZhbGlkIGJvb2xlYW46ICR7IG9iai5pc0NvbGxpZGluZyB9YCk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IFBsYXllci5pc0NvbGxpZGluZ1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycztcbiAgfSxcbiAgZW5jb2RlKG9iajogUGxheWVyLCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgd3JpdGVTdHJpbmcoYnVmLCBvYmouaWQpO1xuICAgIHdyaXRlSW50KGJ1Ziwgb2JqLmxpdmVzKTtcbiAgICBWZWN0b3IuZW5jb2RlKG9iai5wb3NpdGlvbiwgYnVmKTtcbiAgICBWZWN0b3IuZW5jb2RlKG9iai5zaXplLCBidWYpO1xuICAgIFZlY3Rvci5lbmNvZGUob2JqLnZlbG9jaXR5LCBidWYpO1xuICAgIHdyaXRlQm9vbGVhbihidWYsIG9iai5pc0NvbGxpZGluZyk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZW5jb2RlRGlmZihvYmo6IF9EZWVwUGFydGlhbDxQbGF5ZXI+LCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgY29uc3QgdHJhY2tlcjogYm9vbGVhbltdID0gW107XG4gICAgdHJhY2tlci5wdXNoKG9iai5pZCAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmoubGl2ZXMgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLnBvc2l0aW9uICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5zaXplICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai52ZWxvY2l0eSAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouaXNDb2xsaWRpbmcgIT09IF9OT19ESUZGKTtcbiAgICBidWYud3JpdGVCaXRzKHRyYWNrZXIpO1xuICAgIGlmIChvYmouaWQgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZVN0cmluZyhidWYsIG9iai5pZCk7XG4gICAgfVxuICAgIGlmIChvYmoubGl2ZXMgIT09IF9OT19ESUZGKSB7XG4gICAgICB3cml0ZUludChidWYsIG9iai5saXZlcyk7XG4gICAgfVxuICAgIGlmIChvYmoucG9zaXRpb24gIT09IF9OT19ESUZGKSB7XG4gICAgICBWZWN0b3IuZW5jb2RlRGlmZihvYmoucG9zaXRpb24sIGJ1Zik7XG4gICAgfVxuICAgIGlmIChvYmouc2l6ZSAhPT0gX05PX0RJRkYpIHtcbiAgICAgIFZlY3Rvci5lbmNvZGVEaWZmKG9iai5zaXplLCBidWYpO1xuICAgIH1cbiAgICBpZiAob2JqLnZlbG9jaXR5ICE9PSBfTk9fRElGRikge1xuICAgICAgVmVjdG9yLmVuY29kZURpZmYob2JqLnZlbG9jaXR5LCBidWYpO1xuICAgIH1cbiAgICBpZiAob2JqLmlzQ29sbGlkaW5nICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVCb29sZWFuKGJ1Ziwgb2JqLmlzQ29sbGlkaW5nKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IFBsYXllciB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBwYXJzZVN0cmluZyhzYiksXG4gICAgICBsaXZlczogcGFyc2VJbnQoc2IpLFxuICAgICAgcG9zaXRpb246IFZlY3Rvci5kZWNvZGUoc2IpLFxuICAgICAgc2l6ZTogVmVjdG9yLmRlY29kZShzYiksXG4gICAgICB2ZWxvY2l0eTogVmVjdG9yLmRlY29kZShzYiksXG4gICAgICBpc0NvbGxpZGluZzogcGFyc2VCb29sZWFuKHNiKSxcbiAgICB9O1xuICB9LFxuICBkZWNvZGVEaWZmKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IF9EZWVwUGFydGlhbDxQbGF5ZXI+IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICBjb25zdCB0cmFja2VyID0gc2IucmVhZEJpdHMoNik7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZVN0cmluZyhzYikgOiBfTk9fRElGRixcbiAgICAgIGxpdmVzOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUludChzYikgOiBfTk9fRElGRixcbiAgICAgIHBvc2l0aW9uOiB0cmFja2VyLnNoaWZ0KCkgPyBWZWN0b3IuZGVjb2RlRGlmZihzYikgOiBfTk9fRElGRixcbiAgICAgIHNpemU6IHRyYWNrZXIuc2hpZnQoKSA/IFZlY3Rvci5kZWNvZGVEaWZmKHNiKSA6IF9OT19ESUZGLFxuICAgICAgdmVsb2NpdHk6IHRyYWNrZXIuc2hpZnQoKSA/IFZlY3Rvci5kZWNvZGVEaWZmKHNiKSA6IF9OT19ESUZGLFxuICAgICAgaXNDb2xsaWRpbmc6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlQm9vbGVhbihzYikgOiBfTk9fRElGRixcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBTZXJ2ZXJTdGF0ZSA9IHtcbiAgZGVmYXVsdCgpOiBTZXJ2ZXJTdGF0ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIFBsYXllcnM6IFtdLFxuICAgICAgQmFsbHM6IFtdLFxuICAgICAgZ2FtZVN0YXRlOiAwLFxuICAgIH07XG4gIH0sXG4gIHZhbGlkYXRlKG9iajogU2VydmVyU3RhdGUpIHtcbiAgICBpZiAodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIikge1xuICAgICAgcmV0dXJuIFtgSW52YWxpZCBTZXJ2ZXJTdGF0ZSBvYmplY3Q6ICR7b2JqfWBdXG4gICAgfVxuICAgIGxldCB2YWxpZGF0aW9uRXJyb3JzOiBzdHJpbmdbXTtcblxuICAgIHZhbGlkYXRpb25FcnJvcnMgPSB2YWxpZGF0ZUFycmF5KG9iai5QbGF5ZXJzLCAoeCkgPT4gUGxheWVyLnZhbGlkYXRlKHgpKTtcbiAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycy5jb25jYXQoXCJJbnZhbGlkIGtleTogU2VydmVyU3RhdGUuUGxheWVyc1wiKTtcbiAgICB9XG4gICAgdmFsaWRhdGlvbkVycm9ycyA9IHZhbGlkYXRlQXJyYXkob2JqLkJhbGxzLCAoeCkgPT4gQmFsbC52YWxpZGF0ZSh4KSk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IFNlcnZlclN0YXRlLkJhbGxzXCIpO1xuICAgIH1cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gdmFsaWRhdGVQcmltaXRpdmUob2JqLmdhbWVTdGF0ZSBpbiBHYW1lU3RhdGVzLCBgSW52YWxpZCBHYW1lU3RhdGVzOiAkeyBvYmouZ2FtZVN0YXRlIH1gKTtcbiAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycy5jb25jYXQoXCJJbnZhbGlkIGtleTogU2VydmVyU3RhdGUuZ2FtZVN0YXRlXCIpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzO1xuICB9LFxuICBlbmNvZGUob2JqOiBTZXJ2ZXJTdGF0ZSwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHdyaXRlQXJyYXkoYnVmLCBvYmouUGxheWVycywgKHgpID0+IFBsYXllci5lbmNvZGUoeCwgYnVmKSk7XG4gICAgd3JpdGVBcnJheShidWYsIG9iai5CYWxscywgKHgpID0+IEJhbGwuZW5jb2RlKHgsIGJ1ZikpO1xuICAgIHdyaXRlVUludDgoYnVmLCBvYmouZ2FtZVN0YXRlKTtcbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBlbmNvZGVEaWZmKG9iajogX0RlZXBQYXJ0aWFsPFNlcnZlclN0YXRlPiwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIGNvbnN0IHRyYWNrZXI6IGJvb2xlYW5bXSA9IFtdO1xuICAgIHRyYWNrZXIucHVzaChvYmouUGxheWVycyAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmouQmFsbHMgIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLmdhbWVTdGF0ZSAhPT0gX05PX0RJRkYpO1xuICAgIGJ1Zi53cml0ZUJpdHModHJhY2tlcik7XG4gICAgaWYgKG9iai5QbGF5ZXJzICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVBcnJheURpZmYoYnVmLCBvYmouUGxheWVycywgKHgpID0+IFBsYXllci5lbmNvZGVEaWZmKHgsIGJ1ZikpO1xuICAgIH1cbiAgICBpZiAob2JqLkJhbGxzICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVBcnJheURpZmYoYnVmLCBvYmouQmFsbHMsICh4KSA9PiBCYWxsLmVuY29kZURpZmYoeCwgYnVmKSk7XG4gICAgfVxuICAgIGlmIChvYmouZ2FtZVN0YXRlICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVVSW50OChidWYsIG9iai5nYW1lU3RhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmO1xuICB9LFxuICBkZWNvZGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogU2VydmVyU3RhdGUge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIHJldHVybiB7XG4gICAgICBQbGF5ZXJzOiBwYXJzZUFycmF5KHNiLCAoKSA9PiBQbGF5ZXIuZGVjb2RlKHNiKSksXG4gICAgICBCYWxsczogcGFyc2VBcnJheShzYiwgKCkgPT4gQmFsbC5kZWNvZGUoc2IpKSxcbiAgICAgIGdhbWVTdGF0ZTogcGFyc2VVSW50OChzYiksXG4gICAgfTtcbiAgfSxcbiAgZGVjb2RlRGlmZihidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBfRGVlcFBhcnRpYWw8U2VydmVyU3RhdGU+IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICBjb25zdCB0cmFja2VyID0gc2IucmVhZEJpdHMoMyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIFBsYXllcnM6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlQXJyYXlEaWZmKHNiLCAoKSA9PiBQbGF5ZXIuZGVjb2RlRGlmZihzYikpIDogX05PX0RJRkYsXG4gICAgICBCYWxsczogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VBcnJheURpZmYoc2IsICgpID0+IEJhbGwuZGVjb2RlRGlmZihzYikpIDogX05PX0RJRkYsXG4gICAgICBnYW1lU3RhdGU6IHRyYWNrZXIuc2hpZnQoKSA/IHBhcnNlVUludDgoc2IpIDogX05PX0RJRkYsXG4gICAgfTtcbiAgfSxcbn07XG5leHBvcnQgY29uc3QgUGxheWVyU3RhdGUgPSB7XG4gIGRlZmF1bHQoKTogUGxheWVyU3RhdGUge1xuICAgIHJldHVybiB7XG4gICAgICBwbGF5ZXIxcG9zaXRpb246IFZlY3Rvci5kZWZhdWx0KCksXG4gICAgICBwbGF5ZXIycG9zaXRpb246IFZlY3Rvci5kZWZhdWx0KCksXG4gICAgICBiYWxscG9zaXRpb246IFZlY3Rvci5kZWZhdWx0KCksXG4gICAgICBwbGF5ZXIxTGl2ZXM6IDAsXG4gICAgICBwbGF5ZXIyTGl2ZXM6IDAsXG4gICAgfTtcbiAgfSxcbiAgdmFsaWRhdGUob2JqOiBQbGF5ZXJTdGF0ZSkge1xuICAgIGlmICh0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICByZXR1cm4gW2BJbnZhbGlkIFBsYXllclN0YXRlIG9iamVjdDogJHtvYmp9YF1cbiAgICB9XG4gICAgbGV0IHZhbGlkYXRpb25FcnJvcnM6IHN0cmluZ1tdO1xuXG4gICAgdmFsaWRhdGlvbkVycm9ycyA9IFZlY3Rvci52YWxpZGF0ZShvYmoucGxheWVyMXBvc2l0aW9uKTtcbiAgICBpZiAodmFsaWRhdGlvbkVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycy5jb25jYXQoXCJJbnZhbGlkIGtleTogUGxheWVyU3RhdGUucGxheWVyMXBvc2l0aW9uXCIpO1xuICAgIH1cbiAgICB2YWxpZGF0aW9uRXJyb3JzID0gVmVjdG9yLnZhbGlkYXRlKG9iai5wbGF5ZXIycG9zaXRpb24pO1xuICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB2YWxpZGF0aW9uRXJyb3JzLmNvbmNhdChcIkludmFsaWQga2V5OiBQbGF5ZXJTdGF0ZS5wbGF5ZXIycG9zaXRpb25cIik7XG4gICAgfVxuICAgIHZhbGlkYXRpb25FcnJvcnMgPSBWZWN0b3IudmFsaWRhdGUob2JqLmJhbGxwb3NpdGlvbik7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IFBsYXllclN0YXRlLmJhbGxwb3NpdGlvblwiKTtcbiAgICB9XG4gICAgdmFsaWRhdGlvbkVycm9ycyA9IHZhbGlkYXRlUHJpbWl0aXZlKE51bWJlci5pc0ludGVnZXIob2JqLnBsYXllcjFMaXZlcyksIGBJbnZhbGlkIGludDogJHsgb2JqLnBsYXllcjFMaXZlcyB9YCk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IFBsYXllclN0YXRlLnBsYXllcjFMaXZlc1wiKTtcbiAgICB9XG4gICAgdmFsaWRhdGlvbkVycm9ycyA9IHZhbGlkYXRlUHJpbWl0aXZlKE51bWJlci5pc0ludGVnZXIob2JqLnBsYXllcjJMaXZlcyksIGBJbnZhbGlkIGludDogJHsgb2JqLnBsYXllcjJMaXZlcyB9YCk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBrZXk6IFBsYXllclN0YXRlLnBsYXllcjJMaXZlc1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdGlvbkVycm9ycztcbiAgfSxcbiAgZW5jb2RlKG9iajogUGxheWVyU3RhdGUsIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBWZWN0b3IuZW5jb2RlKG9iai5wbGF5ZXIxcG9zaXRpb24sIGJ1Zik7XG4gICAgVmVjdG9yLmVuY29kZShvYmoucGxheWVyMnBvc2l0aW9uLCBidWYpO1xuICAgIFZlY3Rvci5lbmNvZGUob2JqLmJhbGxwb3NpdGlvbiwgYnVmKTtcbiAgICB3cml0ZUludChidWYsIG9iai5wbGF5ZXIxTGl2ZXMpO1xuICAgIHdyaXRlSW50KGJ1Ziwgb2JqLnBsYXllcjJMaXZlcyk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZW5jb2RlRGlmZihvYmo6IF9EZWVwUGFydGlhbDxQbGF5ZXJTdGF0ZT4sIHdyaXRlcj86IF9Xcml0ZXIpIHtcbiAgICBjb25zdCBidWYgPSB3cml0ZXIgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgICBjb25zdCB0cmFja2VyOiBib29sZWFuW10gPSBbXTtcbiAgICB0cmFja2VyLnB1c2gob2JqLnBsYXllcjFwb3NpdGlvbiAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmoucGxheWVyMnBvc2l0aW9uICE9PSBfTk9fRElGRik7XG4gICAgdHJhY2tlci5wdXNoKG9iai5iYWxscG9zaXRpb24gIT09IF9OT19ESUZGKTtcbiAgICB0cmFja2VyLnB1c2gob2JqLnBsYXllcjFMaXZlcyAhPT0gX05PX0RJRkYpO1xuICAgIHRyYWNrZXIucHVzaChvYmoucGxheWVyMkxpdmVzICE9PSBfTk9fRElGRik7XG4gICAgYnVmLndyaXRlQml0cyh0cmFja2VyKTtcbiAgICBpZiAob2JqLnBsYXllcjFwb3NpdGlvbiAhPT0gX05PX0RJRkYpIHtcbiAgICAgIFZlY3Rvci5lbmNvZGVEaWZmKG9iai5wbGF5ZXIxcG9zaXRpb24sIGJ1Zik7XG4gICAgfVxuICAgIGlmIChvYmoucGxheWVyMnBvc2l0aW9uICE9PSBfTk9fRElGRikge1xuICAgICAgVmVjdG9yLmVuY29kZURpZmYob2JqLnBsYXllcjJwb3NpdGlvbiwgYnVmKTtcbiAgICB9XG4gICAgaWYgKG9iai5iYWxscG9zaXRpb24gIT09IF9OT19ESUZGKSB7XG4gICAgICBWZWN0b3IuZW5jb2RlRGlmZihvYmouYmFsbHBvc2l0aW9uLCBidWYpO1xuICAgIH1cbiAgICBpZiAob2JqLnBsYXllcjFMaXZlcyAhPT0gX05PX0RJRkYpIHtcbiAgICAgIHdyaXRlSW50KGJ1Ziwgb2JqLnBsYXllcjFMaXZlcyk7XG4gICAgfVxuICAgIGlmIChvYmoucGxheWVyMkxpdmVzICE9PSBfTk9fRElGRikge1xuICAgICAgd3JpdGVJbnQoYnVmLCBvYmoucGxheWVyMkxpdmVzKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IFBsYXllclN0YXRlIHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgICAgcGxheWVyMXBvc2l0aW9uOiBWZWN0b3IuZGVjb2RlKHNiKSxcbiAgICAgIHBsYXllcjJwb3NpdGlvbjogVmVjdG9yLmRlY29kZShzYiksXG4gICAgICBiYWxscG9zaXRpb246IFZlY3Rvci5kZWNvZGUoc2IpLFxuICAgICAgcGxheWVyMUxpdmVzOiBwYXJzZUludChzYiksXG4gICAgICBwbGF5ZXIyTGl2ZXM6IHBhcnNlSW50KHNiKSxcbiAgICB9O1xuICB9LFxuICBkZWNvZGVEaWZmKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IF9EZWVwUGFydGlhbDxQbGF5ZXJTdGF0ZT4ge1xuICAgIGNvbnN0IHNiID0gQXJyYXlCdWZmZXIuaXNWaWV3KGJ1ZikgPyBuZXcgX1JlYWRlcihidWYpIDogYnVmO1xuICAgIGNvbnN0IHRyYWNrZXIgPSBzYi5yZWFkQml0cyg1KTtcbiAgICByZXR1cm4ge1xuICAgICAgcGxheWVyMXBvc2l0aW9uOiB0cmFja2VyLnNoaWZ0KCkgPyBWZWN0b3IuZGVjb2RlRGlmZihzYikgOiBfTk9fRElGRixcbiAgICAgIHBsYXllcjJwb3NpdGlvbjogdHJhY2tlci5zaGlmdCgpID8gVmVjdG9yLmRlY29kZURpZmYoc2IpIDogX05PX0RJRkYsXG4gICAgICBiYWxscG9zaXRpb246IHRyYWNrZXIuc2hpZnQoKSA/IFZlY3Rvci5kZWNvZGVEaWZmKHNiKSA6IF9OT19ESUZGLFxuICAgICAgcGxheWVyMUxpdmVzOiB0cmFja2VyLnNoaWZ0KCkgPyBwYXJzZUludChzYikgOiBfTk9fRElGRixcbiAgICAgIHBsYXllcjJMaXZlczogdHJhY2tlci5zaGlmdCgpID8gcGFyc2VJbnQoc2IpIDogX05PX0RJRkYsXG4gICAgfTtcbiAgfSxcbn07XG5leHBvcnQgY29uc3QgSVVwZGF0ZVBsYXllclZlbG9jaXR5UmVxdWVzdCA9IHtcbiAgZGVmYXVsdCgpOiBJVXBkYXRlUGxheWVyVmVsb2NpdHlSZXF1ZXN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgdmVsb2NpdHk6IFZlY3Rvci5kZWZhdWx0KCksXG4gICAgfTtcbiAgfSxcbiAgZW5jb2RlKG9iajogSVVwZGF0ZVBsYXllclZlbG9jaXR5UmVxdWVzdCwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIFZlY3Rvci5lbmNvZGUob2JqLnZlbG9jaXR5LCBidWYpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBJVXBkYXRlUGxheWVyVmVsb2NpdHlSZXF1ZXN0IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgICAgdmVsb2NpdHk6IFZlY3Rvci5kZWNvZGUoc2IpLFxuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IElTdGFydFJvdW5kUmVxdWVzdCA9IHtcbiAgZGVmYXVsdCgpOiBJU3RhcnRSb3VuZFJlcXVlc3Qge1xuICAgIHJldHVybiB7XG4gICAgfTtcbiAgfSxcbiAgZW5jb2RlKG9iajogSVN0YXJ0Um91bmRSZXF1ZXN0LCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IElTdGFydFJvdW5kUmVxdWVzdCB7XG4gICAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gICAgcmV0dXJuIHtcbiAgICB9O1xuICB9LFxufTtcbmV4cG9ydCBjb25zdCBJSm9pbkdhbWVSZXF1ZXN0ID0ge1xuICBkZWZhdWx0KCk6IElKb2luR2FtZVJlcXVlc3Qge1xuICAgIHJldHVybiB7XG4gICAgfTtcbiAgfSxcbiAgZW5jb2RlKG9iajogSUpvaW5HYW1lUmVxdWVzdCwgd3JpdGVyPzogX1dyaXRlcikge1xuICAgIGNvbnN0IGJ1ZiA9IHdyaXRlciA/PyBuZXcgX1dyaXRlcigpO1xuICAgIHJldHVybiBidWY7XG4gIH0sXG4gIGRlY29kZShidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpOiBJSm9pbkdhbWVSZXF1ZXN0IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IElTdGFydEdhbWVSZXF1ZXN0ID0ge1xuICBkZWZhdWx0KCk6IElTdGFydEdhbWVSZXF1ZXN0IHtcbiAgICByZXR1cm4ge1xuICAgIH07XG4gIH0sXG4gIGVuY29kZShvYmo6IElTdGFydEdhbWVSZXF1ZXN0LCB3cml0ZXI/OiBfV3JpdGVyKSB7XG4gICAgY29uc3QgYnVmID0gd3JpdGVyID8/IG5ldyBfV3JpdGVyKCk7XG4gICAgcmV0dXJuIGJ1ZjtcbiAgfSxcbiAgZGVjb2RlKGJ1ZjogQXJyYXlCdWZmZXJWaWV3IHwgX1JlYWRlcik6IElTdGFydEdhbWVSZXF1ZXN0IHtcbiAgICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgICByZXR1cm4ge1xuICAgIH07XG4gIH0sXG59O1xuZXhwb3J0IGNvbnN0IElJbml0aWFsaXplUmVxdWVzdCA9IHtcbiAgZGVmYXVsdCgpOiBJSW5pdGlhbGl6ZVJlcXVlc3Qge1xuICAgIHJldHVybiB7fTtcbiAgfSxcbiAgZW5jb2RlKHg6IElJbml0aWFsaXplUmVxdWVzdCwgYnVmPzogX1dyaXRlcikge1xuICAgIHJldHVybiBidWYgPz8gbmV3IF9Xcml0ZXIoKTtcbiAgfSxcbiAgZGVjb2RlKHNiOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKTogSUluaXRpYWxpemVSZXF1ZXN0IHtcbiAgICByZXR1cm4ge307XG4gIH0sXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlU3RhdGVTbmFwc2hvdCh4OiBQbGF5ZXJTdGF0ZSkge1xuICBjb25zdCBidWYgPSBuZXcgX1dyaXRlcigpO1xuICBidWYud3JpdGVVSW50OCgwKTtcbiAgUGxheWVyU3RhdGUuZW5jb2RlKHgsIGJ1Zik7XG4gIHJldHVybiBidWYudG9CdWZmZXIoKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVTdGF0ZVVwZGF0ZShcbiAgeDogX0RlZXBQYXJ0aWFsPFBsYXllclN0YXRlPiB8IHVuZGVmaW5lZCxcbiAgY2hhbmdlZEF0RGlmZjogbnVtYmVyLFxuICBtZXNzYWdlczogX01lc3NhZ2VbXVxuKSB7XG4gIGNvbnN0IGJ1ZiA9IG5ldyBfV3JpdGVyKCk7XG4gIGJ1Zi53cml0ZVVJbnQ4KDEpO1xuICBidWYud3JpdGVVVmFyaW50KGNoYW5nZWRBdERpZmYpO1xuICBjb25zdCByZXNwb25zZXMgPSBtZXNzYWdlcy5mbGF0TWFwKChtc2cpID0+IChtc2cudHlwZSA9PT0gXCJyZXNwb25zZVwiID8gbXNnIDogW10pKTtcbiAgYnVmLndyaXRlVVZhcmludChyZXNwb25zZXMubGVuZ3RoKTtcbiAgcmVzcG9uc2VzLmZvckVhY2goKHsgbXNnSWQsIHJlc3BvbnNlIH0pID0+IHtcbiAgICBidWYud3JpdGVVSW50MzIoTnVtYmVyKG1zZ0lkKSk7XG4gICAgd3JpdGVPcHRpb25hbChidWYsIHJlc3BvbnNlLnR5cGUgPT09IFwiZXJyb3JcIiA/IHJlc3BvbnNlLmVycm9yIDogdW5kZWZpbmVkLCAoeCkgPT4gd3JpdGVTdHJpbmcoYnVmLCB4KSk7XG4gIH0pO1xuICBjb25zdCBldmVudHMgPSBtZXNzYWdlcy5mbGF0TWFwKChtc2cpID0+IChtc2cudHlwZSA9PT0gXCJldmVudFwiID8gbXNnIDogW10pKTtcbiAgYnVmLndyaXRlVVZhcmludChldmVudHMubGVuZ3RoKTtcbiAgZXZlbnRzLmZvckVhY2goKHsgZXZlbnQgfSkgPT4gYnVmLndyaXRlU3RyaW5nKGV2ZW50KSk7XG4gIGlmICh4ICE9PSB1bmRlZmluZWQpIHtcbiAgICBQbGF5ZXJTdGF0ZS5lbmNvZGVEaWZmKHgsIGJ1Zik7XG4gIH1cbiAgcmV0dXJuIGJ1Zi50b0J1ZmZlcigpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZVN0YXRlRXJyb3IoKSB7XG4gIGNvbnN0IGJ1ZiA9IG5ldyBfV3JpdGVyKCk7XG4gIGJ1Zi53cml0ZVVJbnQ4KDIpO1xuICByZXR1cm4gYnVmLnRvQnVmZmVyKCk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU3RhdGVVcGRhdGUoYnVmOiBBcnJheUJ1ZmZlclZpZXcgfCBfUmVhZGVyKToge1xuICBzdGF0ZURpZmY/OiBfRGVlcFBhcnRpYWw8UGxheWVyU3RhdGU+O1xuICBjaGFuZ2VkQXREaWZmOiBudW1iZXI7XG4gIHJlc3BvbnNlczogX1Jlc3BvbnNlTWVzc2FnZVtdO1xuICBldmVudHM6IF9FdmVudE1lc3NhZ2VbXTtcbn0ge1xuICBjb25zdCBzYiA9IEFycmF5QnVmZmVyLmlzVmlldyhidWYpID8gbmV3IF9SZWFkZXIoYnVmKSA6IGJ1ZjtcbiAgY29uc3QgY2hhbmdlZEF0RGlmZiA9IHNiLnJlYWRVVmFyaW50KCk7XG4gIGNvbnN0IHJlc3BvbnNlcyA9IFsuLi5BcnJheShzYi5yZWFkVVZhcmludCgpKV0ubWFwKCgpID0+IHtcbiAgICBjb25zdCBtc2dJZCA9IHNiLnJlYWRVSW50MzIoKTtcbiAgICBjb25zdCBtYXliZUVycm9yID0gcGFyc2VPcHRpb25hbChzYiwgKCkgPT4gcGFyc2VTdHJpbmcoc2IpKTtcbiAgICByZXR1cm4gX01lc3NhZ2UucmVzcG9uc2UobXNnSWQsIG1heWJlRXJyb3IgPT09IHVuZGVmaW5lZCA/IF9SZXNwb25zZS5vaygpIDogX1Jlc3BvbnNlLmVycm9yKG1heWJlRXJyb3IpKTtcbiAgfSk7XG4gIGNvbnN0IGV2ZW50cyA9IFsuLi5BcnJheShzYi5yZWFkVVZhcmludCgpKV0ubWFwKCgpID0+IF9NZXNzYWdlLmV2ZW50KHNiLnJlYWRTdHJpbmcoKSkpO1xuICBjb25zdCBzdGF0ZURpZmYgPSBzYi5yZW1haW5pbmcoKSA/IFBsYXllclN0YXRlLmRlY29kZURpZmYoc2IpIDogdW5kZWZpbmVkO1xuICByZXR1cm4geyBzdGF0ZURpZmYsIGNoYW5nZWRBdERpZmYsIHJlc3BvbnNlcywgZXZlbnRzIH07XG59XG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlU3RhdGVTbmFwc2hvdChidWY6IEFycmF5QnVmZmVyVmlldyB8IF9SZWFkZXIpIHtcbiAgY29uc3Qgc2IgPSBBcnJheUJ1ZmZlci5pc1ZpZXcoYnVmKSA/IG5ldyBfUmVhZGVyKGJ1ZikgOiBidWY7XG4gIHJldHVybiBQbGF5ZXJTdGF0ZS5kZWNvZGUoc2IpO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVByaW1pdGl2ZShpc1ZhbGlkOiBib29sZWFuLCBlcnJvck1lc3NhZ2U6IHN0cmluZykge1xuICByZXR1cm4gaXNWYWxpZCA/IFtdIDogW2Vycm9yTWVzc2FnZV07XG59XG5mdW5jdGlvbiB2YWxpZGF0ZU9wdGlvbmFsPFQ+KHZhbDogVCB8IHVuZGVmaW5lZCwgaW5uZXJWYWxpZGF0ZTogKHg6IFQpID0+IHN0cmluZ1tdKSB7XG4gIGlmICh2YWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBpbm5lclZhbGlkYXRlKHZhbCk7XG4gIH1cbiAgcmV0dXJuIFtdO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVBcnJheTxUPihhcnI6IFRbXSwgaW5uZXJWYWxpZGF0ZTogKHg6IFQpID0+IHN0cmluZ1tdKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgcmV0dXJuIFtcIkludmFsaWQgYXJyYXk6IFwiICsgYXJyXTtcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHZhbGlkYXRpb25FcnJvcnMgPSBpbm5lclZhbGlkYXRlKGFycltpXSk7XG4gICAgaWYgKHZhbGlkYXRpb25FcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHZhbGlkYXRpb25FcnJvcnMuY29uY2F0KFwiSW52YWxpZCBhcnJheSBpdGVtIGF0IGluZGV4IFwiICsgaSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBbXTtcbn1cblxuZnVuY3Rpb24gd3JpdGVVSW50OChidWY6IF9Xcml0ZXIsIHg6IG51bWJlcikge1xuICBidWYud3JpdGVVSW50OCh4KTtcbn1cbmZ1bmN0aW9uIHdyaXRlQm9vbGVhbihidWY6IF9Xcml0ZXIsIHg6IGJvb2xlYW4pIHtcbiAgYnVmLndyaXRlVUludDgoeCA/IDEgOiAwKTtcbn1cbmZ1bmN0aW9uIHdyaXRlSW50KGJ1ZjogX1dyaXRlciwgeDogbnVtYmVyKSB7XG4gIGJ1Zi53cml0ZVZhcmludCh4KTtcbn1cbmZ1bmN0aW9uIHdyaXRlRmxvYXQoYnVmOiBfV3JpdGVyLCB4OiBudW1iZXIpIHtcbiAgYnVmLndyaXRlRmxvYXQoeCk7XG59XG5mdW5jdGlvbiB3cml0ZVN0cmluZyhidWY6IF9Xcml0ZXIsIHg6IHN0cmluZykge1xuICBidWYud3JpdGVTdHJpbmcoeCk7XG59XG5mdW5jdGlvbiB3cml0ZU9wdGlvbmFsPFQ+KGJ1ZjogX1dyaXRlciwgeDogVCB8IHVuZGVmaW5lZCwgaW5uZXJXcml0ZTogKHg6IFQpID0+IHZvaWQpIHtcbiAgd3JpdGVCb29sZWFuKGJ1ZiwgeCAhPT0gdW5kZWZpbmVkKTtcbiAgaWYgKHggIT09IHVuZGVmaW5lZCkge1xuICAgIGlubmVyV3JpdGUoeCk7XG4gIH1cbn1cbmZ1bmN0aW9uIHdyaXRlQXJyYXk8VD4oYnVmOiBfV3JpdGVyLCB4OiBUW10sIGlubmVyV3JpdGU6ICh4OiBUKSA9PiB2b2lkKSB7XG4gIGJ1Zi53cml0ZVVWYXJpbnQoeC5sZW5ndGgpO1xuICBmb3IgKGNvbnN0IHZhbCBvZiB4KSB7XG4gICAgaW5uZXJXcml0ZSh2YWwpO1xuICB9XG59XG5mdW5jdGlvbiB3cml0ZUFycmF5RGlmZjxUPihidWY6IF9Xcml0ZXIsIHg6IChUIHwgdHlwZW9mIF9OT19ESUZGKVtdLCBpbm5lcldyaXRlOiAoeDogVCkgPT4gdm9pZCkge1xuICBidWYud3JpdGVVVmFyaW50KHgubGVuZ3RoKTtcbiAgY29uc3QgdHJhY2tlcjogYm9vbGVhbltdID0gW107XG4gIHguZm9yRWFjaCgodmFsKSA9PiB7XG4gICAgdHJhY2tlci5wdXNoKHZhbCAhPT0gX05PX0RJRkYpO1xuICB9KTtcbiAgYnVmLndyaXRlQml0cyh0cmFja2VyKTtcbiAgeC5mb3JFYWNoKCh2YWwpID0+IHtcbiAgICBpZiAodmFsICE9PSBfTk9fRElGRikge1xuICAgICAgaW5uZXJXcml0ZSh2YWwpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVUludDgoYnVmOiBfUmVhZGVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIGJ1Zi5yZWFkVUludDgoKTtcbn1cbmZ1bmN0aW9uIHBhcnNlQm9vbGVhbihidWY6IF9SZWFkZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGJ1Zi5yZWFkVUludDgoKSA+IDA7XG59XG5mdW5jdGlvbiBwYXJzZUludChidWY6IF9SZWFkZXIpOiBudW1iZXIge1xuICByZXR1cm4gYnVmLnJlYWRWYXJpbnQoKTtcbn1cbmZ1bmN0aW9uIHBhcnNlRmxvYXQoYnVmOiBfUmVhZGVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIGJ1Zi5yZWFkRmxvYXQoKTtcbn1cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKGJ1ZjogX1JlYWRlcik6IHN0cmluZyB7XG4gIHJldHVybiBidWYucmVhZFN0cmluZygpO1xufVxuZnVuY3Rpb24gcGFyc2VPcHRpb25hbDxUPihidWY6IF9SZWFkZXIsIGlubmVyUGFyc2U6IChidWY6IF9SZWFkZXIpID0+IFQpOiBUIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHBhcnNlQm9vbGVhbihidWYpID8gaW5uZXJQYXJzZShidWYpIDogdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gcGFyc2VBcnJheTxUPihidWY6IF9SZWFkZXIsIGlubmVyUGFyc2U6ICgpID0+IFQpOiBUW10ge1xuICBjb25zdCBsZW4gPSBidWYucmVhZFVWYXJpbnQoKTtcbiAgY29uc3QgYXJyID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBhcnIucHVzaChpbm5lclBhcnNlKCkpO1xuICB9XG4gIHJldHVybiBhcnI7XG59XG5mdW5jdGlvbiBwYXJzZUFycmF5RGlmZjxUPihidWY6IF9SZWFkZXIsIGlubmVyUGFyc2U6ICgpID0+IFQpOiAoVCB8IHR5cGVvZiBfTk9fRElGRilbXSB7XG4gIGNvbnN0IGxlbiA9IGJ1Zi5yZWFkVVZhcmludCgpO1xuICBjb25zdCB0cmFja2VyID0gYnVmLnJlYWRCaXRzKGxlbik7XG4gIGNvbnN0IGFyciA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKHRyYWNrZXIuc2hpZnQoKSkge1xuICAgICAgYXJyLnB1c2goaW5uZXJQYXJzZSgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJyLnB1c2goX05PX0RJRkYpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyO1xufVxuIiwiaW1wb3J0IGp3dERlY29kZSBmcm9tIFwiand0LWRlY29kZVwiO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IGdldFJhbmRvbVZhbHVlcyBmcm9tIFwiZ2V0LXJhbmRvbS12YWx1ZXNcIjtcbmltcG9ydCB7IFJlYWRlciwgV3JpdGVyIH0gZnJvbSBcImJpbi1zZXJkZVwiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuXG5pbXBvcnQge1xuICBkZWNvZGVTdGF0ZVNuYXBzaG90LFxuICBkZWNvZGVTdGF0ZVVwZGF0ZSxcbiAgUGxheWVyU3RhdGUgYXMgVXNlclN0YXRlLFxuICBJSW5pdGlhbGl6ZVJlcXVlc3QsXG4gIElVcGRhdGVQbGF5ZXJWZWxvY2l0eVJlcXVlc3QsXG4gIElTdGFydFJvdW5kUmVxdWVzdCxcbiAgSUpvaW5HYW1lUmVxdWVzdCxcbiAgSVN0YXJ0R2FtZVJlcXVlc3QsXG59IGZyb20gXCIuLi8uLi9hcGkvdHlwZXNcIjtcbmltcG9ydCB7IFVzZXJEYXRhLCBSZXNwb25zZSwgTWV0aG9kLCBDT09SRElOQVRPUl9IT1NULCBNQVRDSE1BS0VSX0hPU1QgfSBmcm9tIFwiLi4vLi4vYXBpL2Jhc2VcIjtcblxuaW1wb3J0IHsgSGF0aG9yYVRyYW5zcG9ydCwgVENQSGF0aG9yYVRyYW5zcG9ydCwgVHJhbnNwb3J0VHlwZSwgV2ViU29ja2V0SGF0aG9yYVRyYW5zcG9ydCB9IGZyb20gXCIuL3RyYW5zcG9ydFwiO1xuaW1wb3J0IHsgY29tcHV0ZVBhdGNoIH0gZnJvbSBcIi4vcGF0Y2hcIjtcbmltcG9ydCB7IENvbm5lY3Rpb25GYWlsdXJlLCB0cmFuc2Zvcm1Db29yZGluYXRvckZhaWx1cmUgfSBmcm9tIFwiLi9mYWlsdXJlc1wiO1xuXG5leHBvcnQgdHlwZSBTdGF0ZUlkID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgVXBkYXRlQXJncyA9IHsgc3RhdGVJZDogU3RhdGVJZDsgc3RhdGU6IFVzZXJTdGF0ZTsgdXBkYXRlZEF0OiBudW1iZXI7IGV2ZW50czogc3RyaW5nW10gfTtcbmV4cG9ydCB0eXBlIFVwZGF0ZUNhbGxiYWNrID0gKHVwZGF0ZUFyZ3M6IFVwZGF0ZUFyZ3MpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBFcnJvckNhbGxiYWNrID0gKGVycm9yOiBDb25uZWN0aW9uRmFpbHVyZSkgPT4gdm9pZDtcblxuZXhwb3J0IGNsYXNzIEhhdGhvcmFDbGllbnQge1xuICBwdWJsaWMgYXBwSWQgPSBcIjEzZDZlNTNjM2JiOGY5ZTcwNjRhYjBhMmMzNzk2YzFjOThmMGEzNzVmZGI3YjM5NjEwMTkxYzNmMzhlZGE1ZjhcIjtcblxuICBwdWJsaWMgc3RhdGljIGdldFVzZXJGcm9tVG9rZW4odG9rZW46IHN0cmluZyk6IFVzZXJEYXRhIHtcbiAgICByZXR1cm4gand0RGVjb2RlKHRva2VuKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBsb2dpbkFub255bW91cygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zLnBvc3QoYGh0dHBzOi8vJHtDT09SRElOQVRPUl9IT1NUfS8ke3RoaXMuYXBwSWR9L2xvZ2luL2Fub255bW91c2ApO1xuICAgIHJldHVybiByZXMuZGF0YS50b2tlbjtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjcmVhdGUodG9rZW46IHN0cmluZywgcmVxdWVzdDogSUluaXRpYWxpemVSZXF1ZXN0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBheGlvcy5wb3N0KFxuICAgICAgYGh0dHBzOi8vJHtDT09SRElOQVRPUl9IT1NUfS8ke3RoaXMuYXBwSWR9L2NyZWF0ZWAsXG4gICAgICBJSW5pdGlhbGl6ZVJlcXVlc3QuZW5jb2RlKHJlcXVlc3QpLnRvQnVmZmVyKCksXG4gICAgICB7IGhlYWRlcnM6IHsgQXV0aG9yaXphdGlvbjogdG9rZW4sIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIgfSB9XG4gICAgKTtcbiAgICByZXR1cm4gcmVzLmRhdGEuc3RhdGVJZDtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb25uZWN0KFxuICAgIHRva2VuOiBzdHJpbmcsXG4gICAgc3RhdGVJZDogU3RhdGVJZCxcbiAgICBvblVwZGF0ZT86IFVwZGF0ZUNhbGxiYWNrLFxuICAgIG9uRXJyb3I/OiBFcnJvckNhbGxiYWNrLFxuICAgIHRyYW5zcG9ydFR5cGU/OiBUcmFuc3BvcnRUeXBlXG4gICk6IFByb21pc2U8SGF0aG9yYUNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBjb25uZWN0aW9uID0gbmV3IEhhdGhvcmFDb25uZWN0aW9uKHRoaXMuYXBwSWQsIHN0YXRlSWQsIHRva2VuLCBvblVwZGF0ZSwgb25FcnJvciwgdHJhbnNwb3J0VHlwZSk7XG4gICAgYXdhaXQgY29ubmVjdGlvbi5jb25uZWN0KCk7XG4gICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZmluZE1hdGNoKFxuICAgIHRva2VuOiBzdHJpbmcsXG4gICAgcmVxdWVzdDogSUluaXRpYWxpemVSZXF1ZXN0LFxuICAgIG51bVBsYXllcnM6IG51bWJlcixcbiAgICBvblVwZGF0ZTogKHBsYXllcnNGb3VuZDogbnVtYmVyKSA9PiB2b2lkXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc29ja2V0ID0gbmV3IFdlYlNvY2tldChgd3NzOi8vJHtNQVRDSE1BS0VSX0hPU1R9LyR7dGhpcy5hcHBJZH1gKTtcbiAgICAgIHNvY2tldC5iaW5hcnlUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xuICAgICAgc29ja2V0Lm9uY2xvc2UgPSByZWplY3Q7XG4gICAgICBzb2NrZXQub25vcGVuID0gKCkgPT5cbiAgICAgICAgc29ja2V0LnNlbmQoXG4gICAgICAgICAgbmV3IFdyaXRlcigpXG4gICAgICAgICAgICAud3JpdGVTdHJpbmcodG9rZW4pXG4gICAgICAgICAgICAud3JpdGVVVmFyaW50KG51bVBsYXllcnMpXG4gICAgICAgICAgICAud3JpdGVCdWZmZXIoSUluaXRpYWxpemVSZXF1ZXN0LmVuY29kZShyZXF1ZXN0KS50b0J1ZmZlcigpKVxuICAgICAgICAgICAgLnRvQnVmZmVyKClcbiAgICAgICAgKTtcbiAgICAgIHNvY2tldC5vbm1lc3NhZ2UgPSAoeyBkYXRhIH0pID0+IHtcbiAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IFJlYWRlcihuZXcgVWludDhBcnJheShkYXRhIGFzIEFycmF5QnVmZmVyKSk7XG4gICAgICAgIGNvbnN0IHR5cGUgPSByZWFkZXIucmVhZFVJbnQ4KCk7XG4gICAgICAgIGlmICh0eXBlID09PSAwKSB7XG4gICAgICAgICAgb25VcGRhdGUocmVhZGVyLnJlYWRVVmFyaW50KCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09IDEpIHtcbiAgICAgICAgICByZXNvbHZlKHJlYWRlci5yZWFkU3RyaW5nKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbmtub3duIG1lc3NhZ2UgdHlwZVwiLCB0eXBlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSGF0aG9yYUNvbm5lY3Rpb24ge1xuICBwcml2YXRlIGNhbGxiYWNrczogUmVjb3JkPHN0cmluZywgKHJlc3BvbnNlOiBSZXNwb25zZSkgPT4gdm9pZD4gPSB7fTtcbiAgcHJpdmF0ZSBjaGFuZ2VkQXQgPSAwO1xuICBwcml2YXRlIHVwZGF0ZUxpc3RlbmVyczogVXBkYXRlQ2FsbGJhY2tbXSA9IFtdO1xuICBwcml2YXRlIGVycm9yTGlzdGVuZXJzOiBFcnJvckNhbGxiYWNrW10gPSBbXTtcbiAgcHJpdmF0ZSB0cmFuc3BvcnQ6IEhhdGhvcmFUcmFuc3BvcnQ7XG4gIHByaXZhdGUgaW50ZXJuYWxTdGF0ZTogVXNlclN0YXRlIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgYXBwSWQ6IHN0cmluZyxcbiAgICBwcml2YXRlIHN0YXRlSWQ6IFN0YXRlSWQsXG4gICAgcHJpdmF0ZSB0b2tlbjogc3RyaW5nLFxuICAgIG9uVXBkYXRlPzogVXBkYXRlQ2FsbGJhY2ssXG4gICAgb25FcnJvcj86IEVycm9yQ2FsbGJhY2ssXG4gICAgdHJhbnNwb3J0VHlwZT86IFRyYW5zcG9ydFR5cGVcbiAgKSB7XG4gICAgdGhpcy5zdGF0ZUlkID0gc3RhdGVJZDtcbiAgICB0aGlzLnRva2VuID0gdG9rZW47XG5cbiAgICBpZiAodHJhbnNwb3J0VHlwZSA9PT0gdW5kZWZpbmVkIHx8IHRyYW5zcG9ydFR5cGUgPT09IFRyYW5zcG9ydFR5cGUuV2ViU29ja2V0KSB7XG4gICAgICB0aGlzLnRyYW5zcG9ydCA9IG5ldyBXZWJTb2NrZXRIYXRob3JhVHJhbnNwb3J0KGFwcElkKTtcbiAgICB9IGVsc2UgaWYgKHRyYW5zcG9ydFR5cGUgPT09IFRyYW5zcG9ydFR5cGUuVENQKSB7XG4gICAgICB0aGlzLnRyYW5zcG9ydCA9IG5ldyBUQ1BIYXRob3JhVHJhbnNwb3J0KGFwcElkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB0cmFuc3BvcnQgdHlwZVwiKTtcbiAgICB9XG5cbiAgICBpZiAob25VcGRhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5vblVwZGF0ZShvblVwZGF0ZSk7XG4gICAgfVxuICAgIGlmIChvbkVycm9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMub25FcnJvcihvbkVycm9yKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY29ubmVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnRyYW5zcG9ydC5jb25uZWN0KHRoaXMuc3RhdGVJZCwgdGhpcy50b2tlbiwgdGhpcy5oYW5kbGVEYXRhLCB0aGlzLmhhbmRsZUNsb3NlKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc3RhdGUoKTogVXNlclN0YXRlIHtcbiAgICBpZiAodGhpcy5pbnRlcm5hbFN0YXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk11c3Qgd2FpdCBvbiBIYXRob3JhQ29ubmVjdGlvbi5jb25uZWN0KCkgYmVmb3JlIGxvb2tpbmcgdXAgc3RhdGVcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmludGVybmFsU3RhdGU7XG4gIH1cblxuICBwdWJsaWMgb25VcGRhdGUobGlzdGVuZXI6IFVwZGF0ZUNhbGxiYWNrKSB7XG4gICAgdGhpcy51cGRhdGVMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gIH1cblxuICBwdWJsaWMgb25FcnJvcihsaXN0ZW5lcjogRXJyb3JDYWxsYmFjaykge1xuICAgIHRoaXMuZXJyb3JMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gIH1cblxuICBwdWJsaWMgcmVtb3ZlQWxsTGlzdGVuZXJzKCkge1xuICAgIHRoaXMudXBkYXRlTGlzdGVuZXJzID0gW107XG4gICAgdGhpcy5lcnJvckxpc3RlbmVycyA9IFtdO1xuICB9XG5cbiAgcHVibGljIHVwZGF0ZVBsYXllclZlbG9jaXR5KHJlcXVlc3Q6IElVcGRhdGVQbGF5ZXJWZWxvY2l0eVJlcXVlc3QpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZChNZXRob2QuVVBEQVRFX1BMQVlFUl9WRUxPQ0lUWSwgSVVwZGF0ZVBsYXllclZlbG9jaXR5UmVxdWVzdC5lbmNvZGUocmVxdWVzdCkudG9CdWZmZXIoKSk7XG4gIH1cblxuICBwdWJsaWMgc3RhcnRSb3VuZChyZXF1ZXN0OiBJU3RhcnRSb3VuZFJlcXVlc3QpOiBQcm9taXNlPFJlc3BvbnNlPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZChNZXRob2QuU1RBUlRfUk9VTkQsIElTdGFydFJvdW5kUmVxdWVzdC5lbmNvZGUocmVxdWVzdCkudG9CdWZmZXIoKSk7XG4gIH1cblxuICBwdWJsaWMgam9pbkdhbWUocmVxdWVzdDogSUpvaW5HYW1lUmVxdWVzdCk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKE1ldGhvZC5KT0lOX0dBTUUsIElKb2luR2FtZVJlcXVlc3QuZW5jb2RlKHJlcXVlc3QpLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgcHVibGljIHN0YXJ0R2FtZShyZXF1ZXN0OiBJU3RhcnRHYW1lUmVxdWVzdCk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKE1ldGhvZC5TVEFSVF9HQU1FLCBJU3RhcnRHYW1lUmVxdWVzdC5lbmNvZGUocmVxdWVzdCkudG9CdWZmZXIoKSk7XG4gIH1cblxuICBwdWJsaWMgZGlzY29ubmVjdChjb2RlPzogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy50cmFuc3BvcnQuZGlzY29ubmVjdChjb2RlKTtcbiAgfVxuXG4gIHByaXZhdGUgY2FsbE1ldGhvZChtZXRob2Q6IE1ldGhvZCwgcmVxdWVzdDogVWludDhBcnJheSk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnRyYW5zcG9ydC5pc1JlYWR5KCkpIHtcbiAgICAgICAgcmVqZWN0KFwiQ29ubmVjdGlvbiBub3Qgb3BlblwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG1zZ0lkOiBVaW50OEFycmF5ID0gZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDQpKTtcbiAgICAgICAgdGhpcy50cmFuc3BvcnQud3JpdGUobmV3IFVpbnQ4QXJyYXkoWy4uLm5ldyBVaW50OEFycmF5KFttZXRob2RdKSwgLi4ubXNnSWQsIC4uLnJlcXVlc3RdKSk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzW25ldyBEYXRhVmlldyhtc2dJZC5idWZmZXIpLmdldFVpbnQzMigwKV0gPSByZXNvbHZlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVEYXRhID0gKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgIGNvbnN0IHJlYWRlciA9IG5ldyBSZWFkZXIobmV3IFVpbnQ4QXJyYXkoZGF0YSBhcyBBcnJheUJ1ZmZlcikpO1xuICAgIGNvbnN0IHR5cGUgPSByZWFkZXIucmVhZFVJbnQ4KCk7XG4gICAgaWYgKHR5cGUgPT09IDApIHtcbiAgICAgIHRoaXMuaW50ZXJuYWxTdGF0ZSA9IGRlY29kZVN0YXRlU25hcHNob3QocmVhZGVyKTtcbiAgICAgIHRoaXMuY2hhbmdlZEF0ID0gMDtcbiAgICAgIHRoaXMudXBkYXRlTGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PlxuICAgICAgICBsaXN0ZW5lcih7XG4gICAgICAgICAgc3RhdGVJZDogdGhpcy5zdGF0ZUlkLFxuICAgICAgICAgIHN0YXRlOiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuaW50ZXJuYWxTdGF0ZSkpLFxuICAgICAgICAgIHVwZGF0ZWRBdDogMCxcbiAgICAgICAgICBldmVudHM6IFtdLFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IDEpIHtcbiAgICAgIGNvbnN0IHsgc3RhdGVEaWZmLCBjaGFuZ2VkQXREaWZmLCByZXNwb25zZXMsIGV2ZW50cyB9ID0gZGVjb2RlU3RhdGVVcGRhdGUocmVhZGVyKTtcbiAgICAgIGlmIChzdGF0ZURpZmYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmludGVybmFsU3RhdGUgPSBjb21wdXRlUGF0Y2godGhpcy5pbnRlcm5hbFN0YXRlISwgc3RhdGVEaWZmKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2hhbmdlZEF0ICs9IGNoYW5nZWRBdERpZmY7XG4gICAgICB0aGlzLnVwZGF0ZUxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT5cbiAgICAgICAgbGlzdGVuZXIoe1xuICAgICAgICAgIHN0YXRlSWQ6IHRoaXMuc3RhdGVJZCxcbiAgICAgICAgICBzdGF0ZTogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmludGVybmFsU3RhdGUpKSxcbiAgICAgICAgICB1cGRhdGVkQXQ6IHRoaXMuY2hhbmdlZEF0LFxuICAgICAgICAgIGV2ZW50czogZXZlbnRzLm1hcCgoZSkgPT4gZS5ldmVudCksXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgICAgcmVzcG9uc2VzLmZvckVhY2goKHsgbXNnSWQsIHJlc3BvbnNlIH0pID0+IHtcbiAgICAgICAgaWYgKG1zZ0lkIGluIHRoaXMuY2FsbGJhY2tzKSB7XG4gICAgICAgICAgdGhpcy5jYWxsYmFja3NbbXNnSWRdKHJlc3BvbnNlKTtcbiAgICAgICAgICBkZWxldGUgdGhpcy5jYWxsYmFja3NbbXNnSWRdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IDIpIHtcbiAgICAgIHRoaXMudHJhbnNwb3J0LmRpc2Nvbm5lY3QoNDAwNCk7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSAzKSB7XG4gICAgICB0aGlzLnRyYW5zcG9ydC5wb25nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbmtub3duIG1lc3NhZ2UgdHlwZVwiLCB0eXBlKTtcbiAgICB9XG4gIH07XG5cbiAgcHJpdmF0ZSBoYW5kbGVDbG9zZSA9IChlOiB7IGNvZGU6IG51bWJlcjsgcmVhc29uOiBzdHJpbmcgfSkgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJDb25uZWN0aW9uIGNsb3NlZFwiLCBlKTtcbiAgICB0aGlzLmVycm9yTGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiBsaXN0ZW5lcih0cmFuc2Zvcm1Db29yZGluYXRvckZhaWx1cmUoZSkpKTtcbiAgfTtcbn1cbiIsImV4cG9ydCBlbnVtIENvbm5lY3Rpb25GYWlsdXJlVHlwZSB7XG4gIFNUQVRFX05PVF9GT1VORCA9IFwiU1RBVEVfTk9UX0ZPVU5EXCIsXG4gIE5PX0FWQUlMQUJMRV9TVE9SRVMgPSBcIk5PX0FWQUlMQUJMRV9TVE9SRVNcIixcbiAgSU5WQUxJRF9VU0VSX0RBVEEgPSBcIklOVkFMSURfVVNFUl9EQVRBXCIsXG4gIElOVkFMSURfU1RBVEVfSUQgPSBcIklOVkFMSURfU1RBVEVfSURcIixcbiAgR0VORVJJQ19GQUlMVVJFID0gXCJHRU5FUklDX0ZBSUxVUkVcIixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb25uZWN0aW9uRmFpbHVyZSB7XG4gIHR5cGU6IENvbm5lY3Rpb25GYWlsdXJlVHlwZSxcbiAgbWVzc2FnZTogc3RyaW5nO1xufVxuXG5leHBvcnQgY29uc3QgdHJhbnNmb3JtQ29vcmRpbmF0b3JGYWlsdXJlID0gKGU6IHtjb2RlOiBudW1iZXIsIHJlYXNvbjogc3RyaW5nfSk6IENvbm5lY3Rpb25GYWlsdXJlICA9PiB7XG4gIHJldHVybiB7XG4gICAgbWVzc2FnZTogZS5yZWFzb24sXG4gICAgdHlwZTogKGZ1bmN0aW9uKGNvZGUpIHtcbiAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICBjYXNlIDQwMDA6XG4gICAgICAgICAgcmV0dXJuIENvbm5lY3Rpb25GYWlsdXJlVHlwZS5TVEFURV9OT1RfRk9VTkQ7XG4gICAgICAgIGNhc2UgNDAwMTpcbiAgICAgICAgICByZXR1cm4gQ29ubmVjdGlvbkZhaWx1cmVUeXBlLk5PX0FWQUlMQUJMRV9TVE9SRVM7XG4gICAgICAgIGNhc2UgNDAwMjpcbiAgICAgICAgICByZXR1cm4gQ29ubmVjdGlvbkZhaWx1cmVUeXBlLklOVkFMSURfVVNFUl9EQVRBO1xuICAgICAgICBjYXNlIDQwMDM6XG4gICAgICAgICAgcmV0dXJuIENvbm5lY3Rpb25GYWlsdXJlVHlwZS5JTlZBTElEX1NUQVRFX0lEO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBDb25uZWN0aW9uRmFpbHVyZVR5cGUuR0VORVJJQ19GQUlMVVJFO1xuICAgICAgfVxuICAgIH0pKGUuY29kZSlcbiAgfTtcbn1cbiIsImltcG9ydCB7IERlZXBQYXJ0aWFsLCBOT19ESUZGIH0gZnJvbSBcIi4uLy4uL2FwaS9iYXNlXCI7XG5pbXBvcnQgKiBhcyBUIGZyb20gXCIuLi8uLi9hcGkvdHlwZXNcIjtcblxuZnVuY3Rpb24gcGF0Y2hWZWN0b3Iob2JqOiBULlZlY3RvciwgcGF0Y2g6IERlZXBQYXJ0aWFsPFQuVmVjdG9yPikge1xuICBpZiAocGF0Y2gueCAhPT0gTk9fRElGRikge1xuICAgIG9iai54ID0gcGF0Y2gueDtcbiAgfVxuICBpZiAocGF0Y2gueSAhPT0gTk9fRElGRikge1xuICAgIG9iai55ID0gcGF0Y2gueTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBwYXRjaEJhbGwob2JqOiBULkJhbGwsIHBhdGNoOiBEZWVwUGFydGlhbDxULkJhbGw+KSB7XG4gIGlmIChwYXRjaC5wb3NpdGlvbiAhPT0gTk9fRElGRikge1xuICAgIG9iai5wb3NpdGlvbiA9IHBhdGNoVmVjdG9yKG9iai5wb3NpdGlvbiwgcGF0Y2gucG9zaXRpb24pO1xuICB9XG4gIGlmIChwYXRjaC52ZWxvY2l0eSAhPT0gTk9fRElGRikge1xuICAgIG9iai52ZWxvY2l0eSA9IHBhdGNoVmVjdG9yKG9iai52ZWxvY2l0eSwgcGF0Y2gudmVsb2NpdHkpO1xuICB9XG4gIGlmIChwYXRjaC5yYWRpdXMgIT09IE5PX0RJRkYpIHtcbiAgICBvYmoucmFkaXVzID0gcGF0Y2gucmFkaXVzO1xuICB9XG4gIGlmIChwYXRjaC5pc0NvbGxpZGluZyAhPT0gTk9fRElGRikge1xuICAgIG9iai5pc0NvbGxpZGluZyA9IHBhdGNoLmlzQ29sbGlkaW5nO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIHBhdGNoUGxheWVyKG9iajogVC5QbGF5ZXIsIHBhdGNoOiBEZWVwUGFydGlhbDxULlBsYXllcj4pIHtcbiAgaWYgKHBhdGNoLmlkICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLmlkID0gcGF0Y2guaWQ7XG4gIH1cbiAgaWYgKHBhdGNoLmxpdmVzICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLmxpdmVzID0gcGF0Y2gubGl2ZXM7XG4gIH1cbiAgaWYgKHBhdGNoLnBvc2l0aW9uICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLnBvc2l0aW9uID0gcGF0Y2hWZWN0b3Iob2JqLnBvc2l0aW9uLCBwYXRjaC5wb3NpdGlvbik7XG4gIH1cbiAgaWYgKHBhdGNoLnNpemUgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouc2l6ZSA9IHBhdGNoVmVjdG9yKG9iai5zaXplLCBwYXRjaC5zaXplKTtcbiAgfVxuICBpZiAocGF0Y2gudmVsb2NpdHkgIT09IE5PX0RJRkYpIHtcbiAgICBvYmoudmVsb2NpdHkgPSBwYXRjaFZlY3RvcihvYmoudmVsb2NpdHksIHBhdGNoLnZlbG9jaXR5KTtcbiAgfVxuICBpZiAocGF0Y2guaXNDb2xsaWRpbmcgIT09IE5PX0RJRkYpIHtcbiAgICBvYmouaXNDb2xsaWRpbmcgPSBwYXRjaC5pc0NvbGxpZGluZztcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBwYXRjaFNlcnZlclN0YXRlKG9iajogVC5TZXJ2ZXJTdGF0ZSwgcGF0Y2g6IERlZXBQYXJ0aWFsPFQuU2VydmVyU3RhdGU+KSB7XG4gIGlmIChwYXRjaC5QbGF5ZXJzICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLlBsYXllcnMgPSBwYXRjaEFycmF5KG9iai5QbGF5ZXJzLCBwYXRjaC5QbGF5ZXJzLCAoYSwgYikgPT4gcGF0Y2hQbGF5ZXIoYSwgYikpO1xuICB9XG4gIGlmIChwYXRjaC5CYWxscyAhPT0gTk9fRElGRikge1xuICAgIG9iai5CYWxscyA9IHBhdGNoQXJyYXkob2JqLkJhbGxzLCBwYXRjaC5CYWxscywgKGEsIGIpID0+IHBhdGNoQmFsbChhLCBiKSk7XG4gIH1cbiAgaWYgKHBhdGNoLmdhbWVTdGF0ZSAhPT0gTk9fRElGRikge1xuICAgIG9iai5nYW1lU3RhdGUgPSBwYXRjaC5nYW1lU3RhdGU7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gcGF0Y2hQbGF5ZXJTdGF0ZShvYmo6IFQuUGxheWVyU3RhdGUsIHBhdGNoOiBEZWVwUGFydGlhbDxULlBsYXllclN0YXRlPikge1xuICBpZiAocGF0Y2gucGxheWVyMXBvc2l0aW9uICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLnBsYXllcjFwb3NpdGlvbiA9IHBhdGNoVmVjdG9yKG9iai5wbGF5ZXIxcG9zaXRpb24sIHBhdGNoLnBsYXllcjFwb3NpdGlvbik7XG4gIH1cbiAgaWYgKHBhdGNoLnBsYXllcjJwb3NpdGlvbiAhPT0gTk9fRElGRikge1xuICAgIG9iai5wbGF5ZXIycG9zaXRpb24gPSBwYXRjaFZlY3RvcihvYmoucGxheWVyMnBvc2l0aW9uLCBwYXRjaC5wbGF5ZXIycG9zaXRpb24pO1xuICB9XG4gIGlmIChwYXRjaC5iYWxscG9zaXRpb24gIT09IE5PX0RJRkYpIHtcbiAgICBvYmouYmFsbHBvc2l0aW9uID0gcGF0Y2hWZWN0b3Iob2JqLmJhbGxwb3NpdGlvbiwgcGF0Y2guYmFsbHBvc2l0aW9uKTtcbiAgfVxuICBpZiAocGF0Y2gucGxheWVyMUxpdmVzICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLnBsYXllcjFMaXZlcyA9IHBhdGNoLnBsYXllcjFMaXZlcztcbiAgfVxuICBpZiAocGF0Y2gucGxheWVyMkxpdmVzICE9PSBOT19ESUZGKSB7XG4gICAgb2JqLnBsYXllcjJMaXZlcyA9IHBhdGNoLnBsYXllcjJMaXZlcztcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBwYXRjaEFycmF5PFQ+KGFycjogVFtdLCBwYXRjaDogKHR5cGVvZiBOT19ESUZGIHwgYW55KVtdLCBpbm5lclBhdGNoOiAoYTogVCwgYjogRGVlcFBhcnRpYWw8VD4pID0+IFQpIHtcbiAgcGF0Y2guZm9yRWFjaCgodmFsLCBpKSA9PiB7XG4gICAgaWYgKHZhbCAhPT0gTk9fRElGRikge1xuICAgICAgaWYgKGkgPj0gYXJyLmxlbmd0aCkge1xuICAgICAgICBhcnIucHVzaCh2YWwgYXMgVCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcnJbaV0gPSBpbm5lclBhdGNoKGFycltpXSwgdmFsKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBpZiAocGF0Y2gubGVuZ3RoIDwgYXJyLmxlbmd0aCkge1xuICAgIGFyci5zcGxpY2UocGF0Y2gubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufVxuXG5mdW5jdGlvbiBwYXRjaE9wdGlvbmFsPFQ+KG9iajogVCB8IHVuZGVmaW5lZCwgcGF0Y2g6IGFueSwgaW5uZXJQYXRjaDogKGE6IFQsIGI6IERlZXBQYXJ0aWFsPFQ+KSA9PiBUKSB7XG4gIGlmIChwYXRjaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIGlmIChvYmogPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBwYXRjaCBhcyBUO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBpbm5lclBhdGNoKG9iaiwgcGF0Y2gpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlUGF0Y2goc3RhdGU6IFQuUGxheWVyU3RhdGUsIHBhdGNoOiBEZWVwUGFydGlhbDxULlBsYXllclN0YXRlPikge1xuICByZXR1cm4gcGF0Y2hQbGF5ZXJTdGF0ZShzdGF0ZSwgcGF0Y2gpO1xufVxuIiwiaW1wb3J0IHsgUmVhZGVyLCBXcml0ZXIgfSBmcm9tIFwiYmluLXNlcmRlXCI7XG5pbXBvcnQgbmV0IGZyb20gXCJuZXRcIjtcbmltcG9ydCB7IENPT1JESU5BVE9SX0hPU1QgfSBmcm9tIFwiLi4vLi4vYXBpL2Jhc2VcIjtcbmltcG9ydCBXZWJTb2NrZXQgZnJvbSBcImlzb21vcnBoaWMtd3NcIjtcblxuZXhwb3J0IGVudW0gVHJhbnNwb3J0VHlwZSB7XG4gIFdlYlNvY2tldCxcbiAgVENQLFxuICBVRFAsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGF0aG9yYVRyYW5zcG9ydCB7XG4gIGNvbm5lY3QoXG4gICAgc3RhdGVJZDogc3RyaW5nLFxuICAgIHRva2VuOiBzdHJpbmcsXG4gICAgb25EYXRhOiAoZGF0YTogQnVmZmVyKSA9PiB2b2lkLFxuICAgIG9uQ2xvc2U6IChlOiB7IGNvZGU6IG51bWJlcjsgcmVhc29uOiBzdHJpbmcgfSkgPT4gdm9pZFxuICApOiBQcm9taXNlPHZvaWQ+O1xuICBkaXNjb25uZWN0KGNvZGU/OiBudW1iZXIpOiB2b2lkO1xuICBwb25nKCk6IHZvaWQ7XG4gIGlzUmVhZHkoKTogYm9vbGVhbjtcbiAgd3JpdGUoZGF0YTogVWludDhBcnJheSk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJTb2NrZXRIYXRob3JhVHJhbnNwb3J0IGltcGxlbWVudHMgSGF0aG9yYVRyYW5zcG9ydCB7XG4gIHByaXZhdGUgc29ja2V0OiBXZWJTb2NrZXQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBhcHBJZDogc3RyaW5nKSB7XG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KGB3c3M6Ly8ke0NPT1JESU5BVE9SX0hPU1R9LyR7YXBwSWR9YCk7XG4gIH1cblxuICBwdWJsaWMgY29ubmVjdChcbiAgICBzdGF0ZUlkOiBzdHJpbmcsXG4gICAgdG9rZW46IHN0cmluZyxcbiAgICBvbkRhdGE6IChkYXRhOiBCdWZmZXIpID0+IHZvaWQsXG4gICAgb25DbG9zZTogKGU6IHsgY29kZTogbnVtYmVyOyByZWFzb246IHN0cmluZyB9KSA9PiB2b2lkXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnNvY2tldC5iaW5hcnlUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xuICAgICAgdGhpcy5zb2NrZXQub25jbG9zZSA9IG9uQ2xvc2U7XG4gICAgICB0aGlzLnNvY2tldC5vbm9wZW4gPSAoKSA9PlxuICAgICAgICB0aGlzLnNvY2tldC5zZW5kKFxuICAgICAgICAgIG5ldyBXcml0ZXIoKVxuICAgICAgICAgICAgLndyaXRlVUludDgoMClcbiAgICAgICAgICAgIC53cml0ZVN0cmluZyh0b2tlbilcbiAgICAgICAgICAgIC53cml0ZVVJbnQ2NChbLi4uc3RhdGVJZF0ucmVkdWNlKChyLCB2KSA9PiByICogMzZuICsgQmlnSW50KHBhcnNlSW50KHYsIDM2KSksIDBuKSlcbiAgICAgICAgICAgIC50b0J1ZmZlcigpXG4gICAgICAgICk7XG4gICAgICB0aGlzLnNvY2tldC5vbm1lc3NhZ2UgPSAoeyBkYXRhIH0pID0+IHtcbiAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IFJlYWRlcihuZXcgVWludDhBcnJheShkYXRhIGFzIEFycmF5QnVmZmVyKSk7XG4gICAgICAgIGNvbnN0IHR5cGUgPSByZWFkZXIucmVhZFVJbnQ4KCk7XG4gICAgICAgIGlmICh0eXBlID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5zb2NrZXQub25tZXNzYWdlID0gKHsgZGF0YSB9KSA9PiBvbkRhdGEoZGF0YSBhcyBCdWZmZXIpO1xuICAgICAgICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSBvbkNsb3NlO1xuICAgICAgICAgIG9uRGF0YShkYXRhIGFzIEJ1ZmZlcik7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlamVjdChcIlVuZXhwZWN0ZWQgbWVzc2FnZSB0eXBlOiBcIiArIHR5cGUpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIGRpc2Nvbm5lY3QoY29kZT86IG51bWJlciB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICAgIGlmIChjb2RlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSAoKSA9PiB7fTtcbiAgICB9XG4gICAgdGhpcy5zb2NrZXQuY2xvc2UoY29kZSk7XG4gIH1cblxuICBwdWJsaWMgaXNSZWFkeSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zb2NrZXQucmVhZHlTdGF0ZSA9PT0gdGhpcy5zb2NrZXQuT1BFTjtcbiAgfVxuXG4gIHB1YmxpYyB3cml0ZShkYXRhOiBVaW50OEFycmF5KTogdm9pZCB7XG4gICAgdGhpcy5zb2NrZXQuc2VuZChkYXRhKTtcbiAgfVxuXG4gIHB1YmxpYyBwb25nKCkge1xuICAgIHRoaXMuc29ja2V0LnBpbmcoKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVENQSGF0aG9yYVRyYW5zcG9ydCBpbXBsZW1lbnRzIEhhdGhvcmFUcmFuc3BvcnQge1xuICBwcml2YXRlIHNvY2tldDogbmV0LlNvY2tldDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFwcElkOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBuZXQuU29ja2V0KCk7XG4gIH1cblxuICBwdWJsaWMgY29ubmVjdChcbiAgICBzdGF0ZUlkOiBzdHJpbmcsXG4gICAgdG9rZW46IHN0cmluZyxcbiAgICBvbkRhdGE6IChkYXRhOiBCdWZmZXIpID0+IHZvaWQsXG4gICAgb25DbG9zZTogKGU6IHsgY29kZTogbnVtYmVyOyByZWFzb246IHN0cmluZyB9KSA9PiB2b2lkXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnNvY2tldC5jb25uZWN0KDcxNDgsIENPT1JESU5BVE9SX0hPU1QpO1xuICAgICAgdGhpcy5zb2NrZXQub24oXCJjb25uZWN0XCIsICgpID0+XG4gICAgICAgIHRoaXMuc29ja2V0LndyaXRlKFxuICAgICAgICAgIG5ldyBXcml0ZXIoKVxuICAgICAgICAgICAgLndyaXRlU3RyaW5nKHRva2VuKVxuICAgICAgICAgICAgLndyaXRlU3RyaW5nKHRoaXMuYXBwSWQpXG4gICAgICAgICAgICAud3JpdGVVSW50NjQoWy4uLnN0YXRlSWRdLnJlZHVjZSgociwgdikgPT4gciAqIDM2biArIEJpZ0ludChwYXJzZUludCh2LCAzNikpLCAwbikpXG4gICAgICAgICAgICAudG9CdWZmZXIoKVxuICAgICAgICApXG4gICAgICApO1xuICAgICAgdGhpcy5zb2NrZXQub25jZShcImRhdGFcIiwgKGRhdGE6IEJ1ZmZlcikgPT4ge1xuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgUmVhZGVyKG5ldyBVaW50OEFycmF5KGRhdGEgYXMgQXJyYXlCdWZmZXIpKTtcbiAgICAgICAgY29uc3QgdHlwZSA9IHJlYWRlci5yZWFkVUludDgoKTtcbiAgICAgICAgaWYgKHR5cGUgPT09IDApIHtcbiAgICAgICAgICB0aGlzLnJlYWRUQ1BEYXRhKG9uRGF0YSk7XG4gICAgICAgICAgdGhpcy5zb2NrZXQub24oXCJjbG9zZVwiLCBvbkNsb3NlKTtcbiAgICAgICAgICBvbkRhdGEoZGF0YSBhcyBCdWZmZXIpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QoXCJVbmtub3duIG1lc3NhZ2UgdHlwZTogXCIgKyB0eXBlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgd3JpdGUoZGF0YTogVWludDhBcnJheSkge1xuICAgIHRoaXMuc29ja2V0LndyaXRlKFxuICAgICAgbmV3IFdyaXRlcigpXG4gICAgICAgIC53cml0ZVVJbnQzMihkYXRhLmxlbmd0aCArIDEpXG4gICAgICAgIC53cml0ZVVJbnQ4KDApXG4gICAgICAgIC53cml0ZUJ1ZmZlcihkYXRhKVxuICAgICAgICAudG9CdWZmZXIoKVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgZGlzY29ubmVjdChjb2RlPzogbnVtYmVyIHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gICAgdGhpcy5zb2NrZXQuZGVzdHJveSgpO1xuICB9XG5cbiAgcHVibGljIGlzUmVhZHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc29ja2V0LnJlYWR5U3RhdGUgPT09IFwib3BlblwiO1xuICB9XG5cbiAgcHVibGljIHBvbmcoKTogdm9pZCB7XG4gICAgdGhpcy5zb2NrZXQud3JpdGUobmV3IFdyaXRlcigpLndyaXRlVUludDMyKDEpLndyaXRlVUludDgoMSkudG9CdWZmZXIoKSk7XG4gIH1cblxuICBwcml2YXRlIHJlYWRUQ1BEYXRhKG9uRGF0YTogKGRhdGE6IEJ1ZmZlcikgPT4gdm9pZCkge1xuICAgIGxldCBidWYgPSBCdWZmZXIuYWxsb2MoMCk7XG4gICAgdGhpcy5zb2NrZXQub24oXCJkYXRhXCIsIChkYXRhKSA9PiB7XG4gICAgICBidWYgPSBCdWZmZXIuY29uY2F0KFtidWYsIGRhdGFdKTtcbiAgICAgIHdoaWxlIChidWYubGVuZ3RoID49IDQpIHtcbiAgICAgICAgY29uc3QgYnVmTGVuID0gYnVmLnJlYWRVSW50MzJCRSgpO1xuICAgICAgICBpZiAoYnVmLmxlbmd0aCA8IDQgKyBidWZMZW4pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgb25EYXRhKGJ1Zi5zbGljZSg0LCA0ICsgYnVmTGVuKSk7XG4gICAgICAgIGJ1ZiA9IGJ1Zi5zbGljZSg0ICsgYnVmTGVuKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIiwiLyogKGlnbm9yZWQpICovIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5uYyA9IHVuZGVmaW5lZDsiLCJpbXBvcnQgJy4vc3R5bGUuY3NzJztcclxuaW1wb3J0IHsgVUksIFVJVmlldyB9IGZyb20gJ3BlYXN5LXVpJztcclxuaW1wb3J0IHsgSGF0aG9yYUNsaWVudCwgSGF0aG9yYUNvbm5lY3Rpb24sIFVwZGF0ZUFyZ3MgfSBmcm9tICcuLi8uLi8uaGF0aG9yYS9jbGllbnQnO1xyXG5pbXBvcnQgeyBBbm9ueW1vdXNVc2VyRGF0YSB9IGZyb20gJy4uLy4uLy4uL2FwaS9iYXNlJztcclxuXHJcbmNvbnN0IG15QXBwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ215QXBwJyk7XHJcbmxldCBpbnRlcnZhbElEOiBOb2RlSlMuVGltZXI7XHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gKiBIYXRob3JhIENsaWVudCB2YXJpYWJsZXNcclxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuY29uc3QgY2xpZW50ID0gbmV3IEhhdGhvcmFDbGllbnQoKTtcclxubGV0IHRva2VuOiBzdHJpbmc7XHJcbmxldCB1c2VyOiBBbm9ueW1vdXNVc2VyRGF0YTtcclxubGV0IG15Q29ubmVjdGlvbjogSGF0aG9yYUNvbm5lY3Rpb247XHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gKiBIYXRob3JhOiBCcm9hZGNhc3QgRXZlbnRzIGZyb20gc2VydmVyXHJcbiAqIFRoZSBzZXJ2ZXIgY2FuIGJyb2FkY2FzdCwgb3Igc2VuZCBzcGVjaWZpYyB1c2VycyBldmVudHNcclxuICogRm9yIHRoaXMgZ2FtZSwgdGhlcmUgYXJlIGZvdXIgZXZlbnRzIHRoYXQgdGhlIHNlcnZlclxyXG4gKiB0cmlnZ2VycywgUDEvUDIgam9pbmluZywgQmFsbCBhcnJpdmluZywgYW5kIEdhbWUgT3ZlclxyXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICogSGF0aG9yYTogdXBkYXRlU3RhdGUgaXMgcmFuIGZyb20gd2hlbiB0aGUgc2VydmVyIGhhcyBhIGNoYW5nZSBpblxyXG4gKiBzdGF0ZSwgYW5kIHRoZSBzZXJ2ZXIgbmVlZHMgdG8gc3luY2ggaXRzIGRhdGEgdG8gdGhlXHJcbiAqIGNsaWVudFxyXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxubGV0IHVwZGF0ZVN0YXRlID0gKHVwZGF0ZTogVXBkYXRlQXJncykgPT4ge1xyXG4gICAgLy91cGRhdGluZyBzdGF0ZVxyXG4gICAgbW9kZWwucGxheWVyMXBvcyA9IHVwZGF0ZS5zdGF0ZS5wbGF5ZXIxcG9zaXRpb247XHJcbiAgICBtb2RlbC5wbGF5ZXIycG9zID0gdXBkYXRlLnN0YXRlLnBsYXllcjJwb3NpdGlvbjtcclxuICAgIG1vZGVsLmJhbGwgPSB1cGRhdGUuc3RhdGUuYmFsbHBvc2l0aW9uO1xyXG4gICAgbW9kZWwucDFMaXZlcyA9IHVwZGF0ZS5zdGF0ZS5wbGF5ZXIxTGl2ZXM7XHJcbiAgICBtb2RlbC5wMkxpdmVzID0gdXBkYXRlLnN0YXRlLnBsYXllcjJMaXZlcztcclxuICAgIC8vcHJvY2VzcyBldmVudHNcclxuICAgIGlmICh1cGRhdGUuZXZlbnRzLmxlbmd0aCkge1xyXG4gICAgICAgIHVwZGF0ZS5ldmVudHMuZm9yRWFjaChldmVudCA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ1AyJzpcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5wbGF5ZXIySm9pbmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5wbGF5ZXIxSm9pbmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5zdGFydEJ1dHRvbkRpc2FibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ1AxJzpcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5wbGF5ZXIxSm9pbmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ0JhbGwnOlxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLmJhbGx2aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5zdGFydEJ1dHRvbkRpc2FibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnR2FtZSBPdmVyJzpcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5iYWxsdmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLnBsYXllcjJKb2luZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5wbGF5ZXIxSm9pbmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ0dhbWUgT3ZlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gKiBiaW5kS2V5Ym9hcmRFdmVudHNcclxuICogY3JlYXRlcyB0aGUga2V5IHVwIGFuZCBrZXkgZG93biBldmVudHMgZm9yIHRoZSB1cCBhcnJvdyxcclxuICogdGhlIGRvd24gYXJyb3csIGFuZCB0aGUgc3BhY2ViYXJcclxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuY29uc3QgYmluZEtleWJvYXJkRXZlbnRzID0gKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGUgPT4ge1xyXG4gICAgICAgIHN3aXRjaCAoZS5rZXkpIHtcclxuICAgICAgICAgICAgY2FzZSAnQXJyb3dVcCc6XHJcbiAgICAgICAgICAgICAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgICAgICAgICAgICogSGF0aG9yYTogcmVtb3RlIHByb2NlZHVyZSBjYWxsIChSUEMpXHJcbiAgICAgICAgICAgICAgICAgKiBydW5zIHRoZSB1cGRhdGVQbGF5ZXJWZWxvY2l0eSBtZXRob2QgdGhhdCdzIG9uIHRoZSBzZXJ2ZXJcclxuICAgICAgICAgICAgICAgICAqIGFuZCBwYXNzZXMgYSB2ZWxvY2l0eSBWZWN0b3IgdG8gdGhlIG1ldGhvZFxyXG4gICAgICAgICAgICAgICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgICAgICAgICAgICAgIG15Q29ubmVjdGlvbi51cGRhdGVQbGF5ZXJWZWxvY2l0eSh7IHZlbG9jaXR5OiB7IHg6IDAsIHk6IC0xNSB9IH0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6XHJcbiAgICAgICAgICAgICAgICAvL2RpdHRvXHJcbiAgICAgICAgICAgICAgICBteUNvbm5lY3Rpb24udXBkYXRlUGxheWVyVmVsb2NpdHkoeyB2ZWxvY2l0eTogeyB4OiAwLCB5OiAxNSB9IH0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJyAnOlxyXG4gICAgICAgICAgICAgICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAgICAgICAgICAqIEhhdGhvcmE6IHJlbW90ZSBwcm9jZWR1cmUgY2FsbCAoUlBDKVxyXG4gICAgICAgICAgICAgICAgICogcnVucyB0aGUgc3RhcnRSb3VuZCBtZXRob2QgdGhhdCdzIG9uIHRoZSBzZXJ2ZXJcclxuICAgICAgICAgICAgICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbiAgICAgICAgICAgICAgICBteUNvbm5lY3Rpb24uc3RhcnRSb3VuZCh7fSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBlID0+IHtcclxuICAgICAgICBzd2l0Y2ggKGUua2V5KSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxyXG4gICAgICAgICAgICAgICAgLy9kaXR0b1xyXG4gICAgICAgICAgICAgICAgbXlDb25uZWN0aW9uLnVwZGF0ZVBsYXllclZlbG9jaXR5KHsgdmVsb2NpdHk6IHsgeDogMCwgeTogMCB9IH0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6XHJcbiAgICAgICAgICAgICAgICAvL2RpdHRvXHJcbiAgICAgICAgICAgICAgICBteUNvbm5lY3Rpb24udXBkYXRlUGxheWVyVmVsb2NpdHkoeyB2ZWxvY2l0eTogeyB4OiAwLCB5OiAwIH0gfSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAqIFBlYXN5LVVJOiBjcmVhdGUgVUkgU3RyaW5nIFRlbXBsYXRlXHJcbiAqIHRoaXMgdGVtcGxhdGUgc3RyaW5nIGZvcm1zIHRoZSBpbmplY3RlZCBIVE1MIHRlbXBsYXRlXHJcbiAqIHRoYXQgUGVhc3ktVUkgdXNlcy4gIFRoaXMgaXMgcGFyc2VkLCBhbG9uZyB3aXRoIHRoZVxyXG4gKiBkYXRhIGFuZCBldmVudCBiaW5kaW5ncyBjYWxsZWQgb3V0XHJcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5jb25zdCB0ZW1wbGF0ZSA9IGBcclxuICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImluc3RydWN0aW9uc1wiPlBvbmcgPHNwYW4gXFwkez09PXNob3dJRH0+IC0+IEdhbWUgSUQ6IFxcJHtnYW1lSUR9PC9zcGFuPiA8c3BhbiBcXCR7PT09c2hvd1VzZXJ9PiAtPiBVc2VyOiBcXCR7dXNlcm5hbWV9PC9zcGFuPjwvZGl2PlxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBzbWFsbF93aWR0aFwiPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiYnRuTG9naW5cIiBjbGFzcz1cImJ1dHRvblwiIFxcJHtjbGlja0A9PmxvZ2lufSBcXCR7ZGlzYWJsZWQgPD09IGxvZ2luQnV0dG9uRGlzYWJsZX0+TG9naW48L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IHN0YXJ0TGVmdCBsYXJnZV93aWR0aFwiPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiYnRuQ3JlYXRlR2FtZVwiIGNsYXNzPVwiYnV0dG9uXCIgXFwke2NsaWNrQD0+Y3JlYXRlfSBcXCR7ZGlzYWJsZWQgPD09IGNyZWF0ZUJ1dHRvbkRpc2FibGV9PkNyZWF0ZSBHYW1lPC9idXR0b24+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJidG5Db25uZWN0R2FtZVwiIGNsYXNzPVwiYnV0dG9uXCIgXFwke2NsaWNrQD0+Y29ubmVjdH0gXFwke2Rpc2FibGVkIDw9PSBjb25uZWN0QnV0dG9uRGlzYWJsZX0+Q29ubmVjdCBHYW1lPC9idXR0b24+XHJcbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJnYW1lSm9pbklEXCI+R2FtZSBJRDwvbGFiZWw+XHJcbiAgICAgICAgICAgIDxpbnB1dCBpZD1cImdhbWVKb2luSURcIiB0eXBlPVwidGV4dFwiIFxcJHt2YWx1ZSA8PT4gZ2FtZUlEfT48L2lucHV0PlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwiYnRuQ29weVwiIGNsYXNzPVwiYnV0dG9uXCIgXFwke2NsaWNrQD0+Y29weX0gfT5Db3B5PC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBzdGFydExlZnQgbGFyZ2Vfd2lkdGhcIj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImJ0bkpvaW5HYW1lXCIgY2xhc3M9XCJidXR0b25cIiBcXCR7Y2xpY2tAPT5qb2lufSBcXCR7ZGlzYWJsZWQgPD09IGpvaW5CdXR0b25EaXNhYmxlfT5Kb2luIEdhbWU8L2J1dHRvbj5cclxuICAgICAgICAgICAgPGJ1dHRvbiBpZD1cImJ0blN0YXJ0R2FtZVwiICBjbGFzcz1cImJ1dHRvblwiIFxcJHtjbGlja0A9PnN0YXJ0fSBcXCR7ZGlzYWJsZWQgPD09IHN0YXJ0QnV0dG9uRGlzYWJsZX0+U3RhcnQgR2FtZTwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImluc3RydWN0aW9uc1wiPlVwL0Rvd24gYXJyb3dzIG1vdmUgcGFkZGxlLCBzcGFjZWJhciBsYXVuY2hlcyBiYWxsPC9kaXY+XHJcblxyXG4gICAgICAgICAgPGRpdiBpZD0ncGxheUFyZWEnIGNsYXNzPVwiZ2FtZUFyZWFcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAxc2NvcmVcIiBcXCR7ID09PSBwbGF5ZXIxSm9pbmVkfSA+UDE6IExpdmVzOiBcXCR7cDFMaXZlc308L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAyc2NvcmVcIiBcXCR7ID09PSBwbGF5ZXIySm9pbmVkfT5QMjogTGl2ZXM6IFxcJHtwMkxpdmVzfTwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGlkPVwicDFcIiBcXCR7ID09PSBwbGF5ZXIxSm9pbmVkfSBjbGFzcz1cInAxXCIgc3R5bGU9XCJ0cmFuc2Zvcm06IHRyYW5zbGF0ZShcXCR7cGxheWVyMXBvcy54fXB4LFxcJHtwbGF5ZXIxcG9zLnl9cHgpXCI+PC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgaWQ9XCJwMlwiIFxcJHsgPT09IHBsYXllcjJKb2luZWR9IGNsYXNzPVwicDJcIiBzdHlsZT1cInRyYW5zZm9ybTogdHJhbnNsYXRlKFxcJHtwbGF5ZXIycG9zLnh9cHgsXFwke3BsYXllcjJwb3MueX1weClcIj48L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBpZD1cImJhbGxcIiBcXCR7ID09PSBiYWxsdmlzaWJsZX0gY2xhc3M9XCJiYWxsXCIgc3R5bGU9XCJ0cmFuc2Zvcm06IHRyYW5zbGF0ZShcXCR7YmFsbC54fXB4LFxcJHtiYWxsLnl9cHgpXCI+PC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgYDtcclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAqIFBlYXN5LVVJOiBkYXRhIG1vZGVsIG9iamVjdFxyXG4gKiB0aGlzIG9iamVjdCBvdXRsaW5lcyBhbGwgdGhlIG1vbml0b3JlZCBkYXRhIGJpbmRpbmdzXHJcbiAqIGFuZCBldmVudHMgZm9yIHRoZSBzdHJpbmcgdGVtcGxhdGVcclxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuY29uc3QgbW9kZWwgPSB7XHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICogSGF0aG9yYTogbG9naW5Bbm9ueW1vdXMoKSBhbmQgZ2V0VXNlckZyb21Ub2tlbigpIG1ldGhvZHNcclxuICAgICAqIHRoaXMgdXNlcyBzZXNzaW9uU3RvcmFnZSBmb3IgdGhlIGJyb3dzZXIgdG8gc3RvcmUgdG9rZW5cclxuICAgICAqIGlmIHRva2VuIGRvZXNuJ3QgZXhpc3QsIGl0IGxvZ3MgaW50byBIYXRob3JhIGNvb3JkaW5hdG9yXHJcbiAgICAgKiBhbmQgY3JlYXRlcyBuZXcgYWNjZXNzIHRva2VuXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgbG9naW46IGFzeW5jIChldmVudCwgbW9kZWwpID0+IHtcclxuICAgICAgICBpZiAoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCd0b2tlbicsIGF3YWl0IGNsaWVudC5sb2dpbkFub255bW91cygpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdG9rZW4gPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpO1xyXG4gICAgICAgIHVzZXIgPSBIYXRob3JhQ2xpZW50LmdldFVzZXJGcm9tVG9rZW4odG9rZW4pO1xyXG4gICAgICAgIG1vZGVsLnVzZXJuYW1lID0gdXNlci5uYW1lO1xyXG4gICAgICAgIG1vZGVsLmNyZWF0ZUJ1dHRvbkRpc2FibGUgPSBmYWxzZTtcclxuICAgICAgICBtb2RlbC5jb25uZWN0QnV0dG9uRGlzYWJsZSA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKiBIYXRob3JhOiBjcmVhdGUoKSBhbmQgY29ubmVjdCgpIG1ldGhvZHNcclxuICAgICAqIHRoaXMgaXMgY2FsbGVkIHdoZW4gdGhlIGNyZWF0ZSBuZXcgZ2FtZSBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAgICogYW5kIGNyZWF0ZXMgYSBuZXcgZ2FtZSBpbnN0YW5jZSBmcm9tIHRoZSBIYXRob3JhIHNlcnZlclxyXG4gICAgICogdGhlbiBzdWJzZXF1ZW50bHkgcnVucyB0aGUgY29ubmVjdCBtZXRob2QsIGVzdGFibGlzaGluZ1xyXG4gICAgICogdGhlIG15Q29ubmVjdGlvbiBvYmplY3QsIHdoaWNoIHdlIHVzZSB0byBjb21tdW5pY2F0ZVxyXG4gICAgICogYmV0d2VlbiB0aGUgY2xpZW50IGFuZCB0aGUgc2VydmVyXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgY3JlYXRlOiBhc3luYyAoZXZlbnQsIG1vZGVsKSA9PiB7XHJcbiAgICAgICAgbW9kZWwuZ2FtZUlEID0gYXdhaXQgY2xpZW50LmNyZWF0ZSh0b2tlbiwge30pO1xyXG4gICAgICAgIG1vZGVsLnRpdGxlID0gbW9kZWwuZ2FtZUlEO1xyXG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCAnJywgYC8ke21vZGVsLmdhbWVJRH1gKTtcclxuICAgICAgICBteUNvbm5lY3Rpb24gPSBhd2FpdCBjbGllbnQuY29ubmVjdCh0b2tlbiwgbW9kZWwuZ2FtZUlEKTtcclxuXHJcbiAgICAgICAgbXlDb25uZWN0aW9uLm9uVXBkYXRlKHVwZGF0ZVN0YXRlKTtcclxuICAgICAgICBteUNvbm5lY3Rpb24ub25FcnJvcihjb25zb2xlLmVycm9yKTtcclxuICAgICAgICAvL21hbmFnZSBVSSBhY2Nlc3NcclxuICAgICAgICBtb2RlbC5qb2luQnV0dG9uRGlzYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIG1vZGVsLmNyZWF0ZUJ1dHRvbkRpc2FibGUgPSB0cnVlO1xyXG4gICAgICAgIG1vZGVsLmNvbm5lY3RCdXR0b25EaXNhYmxlID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICogSGF0aG9yYTogY29ubmVjdCgpIG1ldGhvZHNcclxuICAgICAqIHJ1bnMgdGhlIGNvbm5lY3QgbWV0aG9kLCBlc3RhYmxpc2hpbmdcclxuICAgICAqIHRoZSBteUNvbm5lY3Rpb24gb2JqZWN0LCB3aGljaCB3ZSB1c2UgdG8gY29tbXVuaWNhdGVcclxuICAgICAqIGJldHdlZW4gdGhlIGNsaWVudCBhbmQgdGhlIHNlcnZlclxyXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICAgIGNvbm5lY3Q6IGFzeW5jIChldmVudCwgbW9kZWwpID0+IHtcclxuICAgICAgICBteUNvbm5lY3Rpb24gPSBhd2FpdCBjbGllbnQuY29ubmVjdCh0b2tlbiwgbW9kZWwuZ2FtZUlEKTtcclxuXHJcbiAgICAgICAgbW9kZWwudGl0bGUgPSBgLT4gR2FtZSBJRDogJHttb2RlbC5nYW1lSUR9YDtcclxuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgJycsIGAvJHttb2RlbC5nYW1lSUR9YCk7XHJcbiAgICAgICAgbXlDb25uZWN0aW9uLm9uVXBkYXRlKHVwZGF0ZVN0YXRlKTtcclxuICAgICAgICBteUNvbm5lY3Rpb24ub25FcnJvcihjb25zb2xlLmVycm9yKTtcclxuICAgICAgICAvL21hbmFnZSBVSSBhY2Nlc3NcclxuICAgICAgICBtb2RlbC5qb2luQnV0dG9uRGlzYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIG1vZGVsLmNyZWF0ZUJ1dHRvbkRpc2FibGUgPSB0cnVlO1xyXG4gICAgICAgIG1vZGVsLmNvbm5lY3RCdXR0b25EaXNhYmxlID0gdHJ1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqIEhhdGhvcmE6IHJlbW90ZSBwcm9jZWR1cmUgY2FsbCAoUlBDKVxyXG4gICAgICogcnVucyB0aGUgam9pbkdhbWUgbWV0aG9kIHRoYXQncyBvbiB0aGUgc2VydmVyXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgam9pbjogKGV2ZW50LCBtb2RlbCkgPT4ge1xyXG4gICAgICAgIG15Q29ubmVjdGlvbi5qb2luR2FtZSh7fSk7XHJcbiAgICAgICAgYmluZEtleWJvYXJkRXZlbnRzKCk7XHJcbiAgICAgICAgLy9tYW5hZ2UgVUkgYWNjZXNzXHJcbiAgICAgICAgbW9kZWwuam9pbkJ1dHRvbkRpc2FibGUgPSB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICogSGF0aG9yYTogcmVtb3RlIHByb2NlZHVyZSBjYWxsIChSUEMpXHJcbiAgICAgKiBydW5zIHRoZSBzdGFydEdhbWUgbWV0aG9kIHRoYXQncyBvbiB0aGUgc2VydmVyXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgc3RhcnQ6IChldmVudCwgbW9kZWwpID0+IHtcclxuICAgICAgICBteUNvbm5lY3Rpb24uc3RhcnRHYW1lKHt9KTtcclxuICAgICAgICAvL21hbmFnZSBVSSBhY2Nlc3NcclxuICAgICAgICBtb2RlbC5zdGFydEJ1dHRvbkRpc2FibGUgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIC8vY29waWVzIGlucHV0IHRleHQgdG8gY2xpcGJvYXJkXHJcbiAgICBjb3B5OiAoKSA9PiB7XHJcbiAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQobW9kZWwuZ2FtZUlEKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqIFBlYXN5LVVJOiBkYXRhIGJpbmRpbmdzXHJcbiAgICAgKiB0aGVzZSB2YWx1ZXMgYXJlIHRpZWQgaW50byB0aGUgVUkgc3BlY2lmaWNhbGx5XHJcbiAgICAgKiBlaXRoZXIgZGF0YSBmaWVsZHMgbGlrZSB0aXRsZSwgcDFMaXZlcywgYW5kIGdhbWVJRFxyXG4gICAgICogb3IgQ1NTIHZhbHVlcywgbGlrZSBwbGF5ZXIycG9zXHJcbiAgICAgKiBvciBhdHRyaWJ1dGVzIGZvciB2aXNpYmlsaXR5IGFuZCBkaXNhYmxlZCBvZiB0aGUgVUlcclxuICAgICAqIGJ1dHRvbnMuICBBbHNvIHNob3duIGlzIHRoZSBhYmlsaXR5IHRvIGFic3RyYWN0IHRoZVxyXG4gICAgICogZXZhbHVhdGlvbiBvZiB0aGUgYm9vbGVhbnMgdXNpbmcgYSBnZXR0ZXIsIHN1Y2ggYXMgdGhlXHJcbiAgICAgKiBsb2dpbiBidXR0b24gZGlzYWJsZSBjb2RlIGJlbG93XHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gICAgdGl0bGU6ICcnLFxyXG4gICAgZ2FtZUlEOiAnJyxcclxuICAgIHVzZXJuYW1lOiAnJyxcclxuICAgIHBsYXllcjFwb3M6IHsgeDogMTUsIHk6IDEwIH0sXHJcbiAgICBwbGF5ZXIycG9zOiB7IHg6IDU3NSwgeTogMTAgfSxcclxuICAgIGJhbGw6IHsgeDogMjUsIHk6IDI1IH0sXHJcbiAgICBwMUxpdmVzOiAzLFxyXG4gICAgcDJMaXZlczogMyxcclxuICAgIGdldCBsb2dpbkJ1dHRvbkRpc2FibGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXNlcm5hbWUubGVuZ3RoID4gMDtcclxuICAgIH0sXHJcbiAgICBnZXQgc2hvd0lEKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVJRC5sZW5ndGggPiAwO1xyXG4gICAgfSxcclxuICAgIGdldCBzaG93VXNlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy51c2VybmFtZS5sZW5ndGggPiAwO1xyXG4gICAgfSxcclxuICAgIGNyZWF0ZUJ1dHRvbkRpc2FibGU6IHRydWUsXHJcbiAgICBjb25uZWN0QnV0dG9uRGlzYWJsZTogdHJ1ZSxcclxuICAgIGpvaW5CdXR0b25EaXNhYmxlOiB0cnVlLFxyXG4gICAgc3RhcnRCdXR0b25EaXNhYmxlOiB0cnVlLFxyXG4gICAgcGxheWVyMUpvaW5lZDogZmFsc2UsXHJcbiAgICBwbGF5ZXIySm9pbmVkOiBmYWxzZSxcclxuICAgIGJhbGx2aXNpYmxlOiBmYWxzZSxcclxufTtcclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAqIENyZWF0ZSBVSSBWaWV3LCBhbmQgbW91bnQgdGhlIGluamVjdGVkIEhUTUxcclxuICogeW91IHBhc3MgdGhlIHBhcmVudCBlbGVtZW50LCB0aGUgc3RyaW5nIHRlbXBsYXRlLCBhbmRcclxuICogdGhlIGRhdGEgbW9kZWwgb2JqZWN0IHRvIFVJLmNyZWF0ZSgpXHJcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbmxldCBteVVJOiBVSVZpZXc7XHJcbm15VUkgPSBVSS5jcmVhdGUobXlBcHAsIHRlbXBsYXRlLCBtb2RlbCk7XHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gKiBQZWFzeS1VSTogVUkudXBkYXRlKClcclxuICogVGhpcyBtZXRob2QgdHJpZ2dlcnMgdGhlIGZyYW1ld29yayB0byBtb25pdG9yIGZvclxyXG4gKiBjaGFuZ2VzIGluIHN0YXRlIGFuZCB0aGVuIGF1dG9tYXRpY2FsbHkgdXBkYXRlcyB0aGUgVUlcclxuICogd2l0aCB0aGUgbmV3IGRhdGEsIHJlY29tbWVuZWQgdG8gYmUgY2FsbGVkIG9uIGludGVydmFsXHJcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcbmludGVydmFsSUQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICBVSS51cGRhdGUoKTtcclxufSwgMTAwMCAvIDYwKTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9