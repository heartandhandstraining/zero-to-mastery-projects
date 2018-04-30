/*
    cv.ajax.js
    
    Description:
        Core library for setup and execution of dynamic services web methods.

    Usage:
        Just include the file. Setup will be done automatically. 

        If you need to pass in a proxy or timeoutRedirectUrl or change the 
        url then you will need to call $.cv.ajax.setup() with the required
        options IMMEDIATELY after this file is included.

    Dependencies:
        cv.util.js
        jquery
            In Script folder or http://jquery.com/

        jquery.cookie
            In Script folder or https://github.com/carhartl/jquery-cookie

*/

;

(function ($, undefined) {

    $.cv = $.cv || {};

    // $.cv.ajax object definition
    //
    $.cv.ajax = $.cv.ajax || {};

    // You can set things on 'setting' and they will be overridden but non-overridden
    // settings will be retained!
    $.cv.ajax.settings = {};

    $.cv.ajax.setup = function (wssettings) {
        var wsopts = $.extend({}, $.cv.ajax.settings, {
            url: '/service',
            ajaxSettings: null,
            proxy: null,
            timeoutPreRedirectFunction: $.cv.ajax.timeoutPreRedirectFunction,
            timeoutRedirectUrl: '',
            timeoutRedirectMessage: '',
			timeoutRedirectUrlQueryString:'',
			enableTimeOutLoginRedirect:false,
            cvApplicationType: 'cssnet' // cssnet | maf | unknown,
        }, wssettings);

        // Store settings
        this.settings = wsopts;

        var ajaxopts = $.extend({
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            error: function (xhr, status, errorthrown) {
                window.alert('AJAX Error: ' + status + ' ' + errorthrown);
            }
        }, wsopts.ajaxSettings);

        // Setup Ajax
        $.ajaxSetup(ajaxopts);
    };

    $.cv.ajax.call = function (method, ajaxsettings) {
        var wsurl = this.settings.url + "/",
            params = {},
            paramobj,
            valFromCookie = null;

        if (this.settings.proxy) {  // add random fix for ios6 safari caching ajax posts
            wsurl = this.settings.proxy + "?rand=" + ($.now()) + "&wsurl=" + this.settings.url + "&method=";
        }
               
        if (ajaxsettings.parameters) {
            // turn the parameters into a data string
            params = (typeof (ajaxsettings.parameters) == "function") ? ajaxsettings.parameters() : ajaxsettings.parameters;

            if ($.cookie) {
                // current session id to request
                valFromCookie = $.cookie("dynamicServiceSessionId");
                if (valFromCookie) {
                    params._sessionId = valFromCookie;
                }
            }

            // before stringify adjust utc time
            if ($.cv.util) {
                params = $.cv.util.parseDates(params, true);
            }
        } else if (!ajaxsettings.data) {
            if ($.cookie) {
                // current session id to request
                valFromCookie = $.cookie("dynamicServiceSessionId");
                if (valFromCookie) {
                    params._sessionId = valFromCookie;
                }
            }
        }

        // WARNING: This can be used to add any special params on for all requests.
        if (this.settings && this.settings.additionalParams) {
            for (var extra in this.settings.additionalParams) {
                if (Object.prototype.hasOwnProperty.call(this.settings.additionalParams, extra)) {
                    params[extra] = this.settings.additionalParams[extra];
                }
            }
        }

        // Specify the application type so that server-side code
        // can destinguish and act accordingly.
        if (this.settings.cvApplicationType) {
            params._applicationType = this.settings.cvApplicationType;
        }

        paramobj = {
            data: JSON.stringify(params)
        };

        $.extend(ajaxsettings, paramobj);
        
        wsurl = wsurl + method;

        var queryStringAppended = false;
        // Add random fix for ios6 safari caching ajax posts
        if (!this.settings.proxy) {
            wsurl += "?rand=" + ($.now());
            queryStringAppended = true;
        }

        var queryString = ajaxsettings.queryStringParam;
        if (queryString) {
            var qsToAppend = queryString.startsWith("?") ? queryString.substring(1) : queryString;
            wsurl += queryStringAppended ? ("&" + qsToAppend) : ("?" + qsToAppend);
            queryStringAppended = true;
        }

        var opts = $.extend(ajaxsettings, { url: wsurl });

        // handle session timeout messages
        var error = opts.error;
        opts.error = function (data) {
            var response = null;

            try {
                // If server error this will fail!
                response = data.xhr ? $.parseJSON(data.xhr.responseText) : $.parseJSON(data.responseText);
            } catch (e) {}

            if (response && response.sessionHasTimedOut) {
                $.cv.ajax.redirectFromTimeout();
            } else {
                if (error) {
                    error(data);
                }
            }

            if (data.status && data.status == 400) {
                $.cv.css.received400 = true;
            }
        };

        var success = opts.success;
        opts.success = function(data) {
            if (data.sessionHasTimedOut) {
                 $.cv.ajax.redirectFromTimeout();
            }
            else {
                // set any dates correctly if needed
                if ($.cv.util) {
                    data = $.cv.util.parseMessageDates(data);
                }
                // Do whatever needs to be done here.
                if(success)
                    success(data);
            }
        };

        return $.ajax(opts);
    };

    $.cv.ajax.redirectFromTimeout = function () {
        var _this = this, redirectUrl = _this.settings.timeoutRedirectUrl;
        if (_this.settings.timeoutRedirectUrl) {
            var def1 = $.Deferred(), p1 = def1.promise();
            if ($.isFunction(_this.settings.timeoutPreRedirectFunction)) {
                $.cv.css.bind($.cv.css.eventnames.localOrderChanged, function () {
                    def1.resolve();
                });
                _this.settings.timeoutPreRedirectFunction.apply(this, arguments);
                $.cv.css.trigger($.cv.css.eventnames.refreshOrderData);
            } else {
                def1.resolve();
            }
            $.when(p1).done(function () {
				if(_this.settings.enableTimeOutLoginRedirect && location.pathname.length>0){
					redirectUrl += "?R=" +location.pathname.replace(/^.*\/([^/]*)/, "$1") + location.search.replace("?","&");				
				}

                if (_this.settings.timeoutRedirectMessage.length > 0) {
                    redirectUrl += redirectUrl.indexOf("?") === -1 ? "?" : "&";
                    redirectUrl += "message=" + _this.settings.timeoutRedirectMessage;
                }
                window.location.href = redirectUrl;
            });
        }
    };

    $.cv.ajax.timeoutPreRedirectFunction = function () {
        $.cv.css.clearLocalStorage();
    };

    // For parsing Deferred.fail() ajax request response data to parse the error message
    $.cv.ajax.getFailResponseText = function (response) {
        // :op - have to parse the responseText in fail scenario???
        try {
            response = JSON.parse(response.responseText);
        } catch (d) { };

        return response;
    };

    // Setup
    //

    /**
     * NOTE: If the defaults are not appropriate just call $.cv.ajax.setup() immediately
     * after this file is included in the page. Otherwise you never need to worry about calling it.
    **/
    $.cv.ajax.setup();

})(jQuery);

