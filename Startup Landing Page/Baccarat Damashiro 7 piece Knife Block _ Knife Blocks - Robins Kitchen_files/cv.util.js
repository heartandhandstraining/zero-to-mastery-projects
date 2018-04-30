
;

// Fixes ----------------------------------------------------------------------
//

// Date.now
if (!Date.now) {
    Date.now = function now() {
        return new Date().valueOf();
    };
}

// console.log
if (typeof console === "undefined") {
    var console = {
        log: function () { },
        info: function () { },
        warn: function () { },
        error: function () { }
    };
}


// String Prototype Extension (moved over from CSSGenericInclusions.js)
//

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (txt, ignoreCase) {
        var rgx;

        if (ignoreCase) {
            rgx = new RegExp(txt + '$', 'i');
        } else {
            rgx = new RegExp(txt + '$');
        }

        return this.match(rgx) != null;
    }
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (prefix) {
        return (this.substr(0, prefix.length) === prefix);
    }
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
    };
}


// cv.util.js -----------------------------------------------------------------
// 

(function ($, undefined) {
    $.cv = $.cv || {};
    $.cv.util = $.cv.util || {};

    $.cv.util.toDate = function (value) {
        if ($.type(value) === "date")
            return value;
        var dateRegExp = /^\/Date\((.*?)\)\/$/;
        var date = dateRegExp.exec(value);
        var d = new Date(parseInt(date[1]));

        //return d;
        var localOffset = new Date().getTimezoneOffset();
        var auOffset = -600;//+10 is server time
        // if UTC date just add the local offset (ie when loading json stringified data fron local storage)
        var adjustedTime = new Date(d.getTime() + (d.getTimezoneOffset() == 0 ? (localOffset * 60000) : ((localOffset - auOffset) * 60000)));

        return adjustedTime;
    };

    $.cv.util.dateToServerDate = function (value) {
        var localOffset = new Date().getTimezoneOffset();
        var auOffset = -600;//+10 is server time
        // add extra localoffset value as this is taken off on json/kendo.stringify and server only adjusts by +10
        var adjustedTime = new Date(value.getTime() - ((localOffset - auOffset) * 60000));
        return adjustedTime;
    };

    // some kendo widgets have pop windows and other DOM mess that it leaves lying around
    $.cv.util.destroyKendoWidgets = function (target) {
        target.find("select, input")
            .each(function () {
                var dropdown = $(this).data("kendoDropDownList");
                if (dropdown) {
                    dropdown.element.remove();
                    dropdown.popup.element.unbind().remove();
                }
                var autoc = $(this).data("kendoAutoComplete");
                if (autoc) {
                    autoc.popup.element.unbind().remove();
                }
                var cbox = $(this).data("kendoComboBox");
                if (cbox) {
                    cbox.element.remove();
                    cbox.popup.element.unbind().remove();
                }
            });
    };

    // can be used after field dynamically created to automatically bind kendo widgets
    $.cv.util.bindKendoWidgets = function (target) {
        $.cv.util.bindKendoDropDownWidgets(target);
        $.cv.util.bindKendoUploadWidgets(target);
    };

    $.cv.util.bindKendoDropDownWidgets = function (target) {
        target.find("select")
            .each(function () {
                var k = $(this).data("kendoDropDownList");
                if (k == undefined) {
                    $(this).kendoDropDownList();
                }
            });
    };
    $.cv.util.kendoUploadWidgetSelect = function (e, validFiles, notificationName, triggerMessages) {
        $.cv.util.notify({
            triggerMessages: triggerMessages,
            source: notificationName,
            message: "",
            type: "",
            clearExisting: true
        });
        $.each(e.files, function (index, value) {
            if (validFiles.length > 0 && !_.contains(validFiles, value.extension.toLowerCase())) {
                e.preventDefault();
                $.cv.util.notify({
                    triggerMessages: triggerMessages,
                    source: notificationName,
                    message: String.format("Invalid upload type, please only upload files of type {0}", validFiles.join(",")),
                    type: $.cv.css.messageTypes.error
                });
            }
        });
    };
    $.cv.util.bindKendoUploadWidgets = function (target) {
        target.find("input[type='file']")
            .each(function () {
                var $this = $(this);
                var k = $this.data("kendoUpload");
                if (k == undefined) {
                    var validFiles = $.cv.util.hasValue($this.data("validFiles")) ? $this.data("validFiles").split(",") : [],
                        data = target.data(),
                        widget = $.cv.util.hasValue(data) && $.cv.util.hasValue(target.data("role")) ? data[_.find(_.keys(data), function(key) { return key.toLowerCase() === target.data("role"); })] : null,
                        notificationName = $.cv.util.hasValue(widget) && $.cv.util.hasValue(widget.name) ? widget.name : "kendoUpload",
                        triggerMessages = $.cv.util.hasValue(widget) && $.cv.util.hasValue(widget.options) && $.cv.util.hasValue(widget.options.triggerMessages) ? widget.options.triggerMessages : true,
                        widgetSettings = $.extend({}, $this.data(), { select: function(e) { $.cv.util.kendoUploadWidgetSelect(e, validFiles, notificationName, triggerMessages) } });
                    $this.kendoUpload(widgetSettings);
                }
            });
    };

    /*  
        Returns value for a Query String Parameter 
        Parsed once on initial call.
    */
    $.cv.util.queryStringValue = function queryStringValue(key, options) {
        var opts = $.extend({
            decode: true
        }, options);

        if (_queryStringParameters == null) {
            _queryStringParameters = {};

            var kvPairs = window.location.search.substring(1).split("&");

            for (var i = 0; i < kvPairs.length; i++) {
                var kv = kvPairs[i].split("=");

                if (kv.length != 2) continue;

                _queryStringParameters[kv[0].toLowerCase()] = kv[1];
            }
        }

        var rawResult = _queryStringParameters[key.toLowerCase()];

        // Return Raw Encoded Value as we've been asked not to decode it
        if (options != null && options.decode != null && options.decode !== true) {
            return rawResult;
        }

        if (rawResult != null && rawResult !== "%") {
            return decodeURIComponent(rawResult.replace(/\+/g, " "));
        }
    };

    /*  
        Required for IE8 as it does not have Object.keys
    */
    if (!Object.keys) {
        Object.keys = function (obj) {
            var keys = [];

            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    keys.push(i);
                }
            }

            return keys;
        };
    }

    var _queryStringParameters = null;


    /*  
        Returns the redirect page including query string parameters
    */
    $.cv.util.queryStringRedirectValue = function queryStringRedirectValue(redirectKey, options) {
        if (_queryStringParameters == null) {
            //populate if it is null
            $.cv.util.queryStringValue("");
        }

        if (typeof _queryStringParameters[redirectKey.toLowerCase()] !== "undefined") {
            var rawResult = _queryStringParameters[redirectKey.toLowerCase()].toString();
            var queryStringParams = [];

            //get the query string parameters
            if (rawResult != null && Object.keys(_queryStringParameters).length > 1) {
                for (var propertyName in _queryStringParameters) {
                    if (propertyName !== "undefined" && propertyName !== redirectKey.toLowerCase()) {
                        var hasExcludedParams = options && $.cv.util.hasValue(options.excludedParams);
                        var foundParam = hasExcludedParams && _.find(options.excludedParams, function (param) { return param === propertyName.toString(); });
                        if (!options || !foundParam ) {
                            queryStringParams.push(propertyName.toString() + "=" + _queryStringParameters[propertyName.toLowerCase()].toString());
                        }
                    }
                }
            }

            //append the params to the redirect url
            if (queryStringParams.length > 0) {
                rawResult += "?" + queryStringParams.join("&");
            }

            // Return Raw Encoded Value as we've been asked not to decode it
            if (options != null && options.decode != null && options.decode !== true) {
                return rawResult;
            }

            if (rawResult != null) {
                return decodeURIComponent(rawResult.replace(/\+/g, " "));
            }
        }
        else {
            return "";
        }
    };

    /**
     * WARNING: Array items are Unions. Each item in that
     * array index is then the filter option for that union.
    **/
    $.cv.util.getFilterFeatures = function (options) {
        var opts = $.extend({
            ignoreUnions: false
        }, options);


        // Helpers
        //

        function startNewItem() {
            newItem = { Key: '', Condition: '', Value: '', RawValue: '' };
            key = "Value";
        }

        function addFilter() {
            newItem.RawValue = newItem.Value;
            newItem.Value = decodeURIComponent(
                newItem.RawValue.replace(/\+/g, ' ')
                                .replace('_(', '(')
                                .replace('_)', ')')
                                .replace('__', '_'));

            orFilters[0].unshift(newItem);
            startNewItem();
        }

        function switchKey() {
            if (key == 'Value') { key = 'Condition'; return; }
            if (key == 'Condition') { key = 'Key'; return; }

            throw new Error("Can't Switch Key when on the Key");
        }

        function addChar() {
            newItem[key] = c + newItem[key];
        }

        var theN = String.fromCharCode(241);

        function decode(value) {
            return value.replace(/%C3%B1/gi, theN)
                        .replace(/%7C/gi,    '|')
                        .replace(/%2C/gi,    ',')
                        .replace(/%3A/gi,    ':');
        }


        // Process
        //

        var value = $.cv.util.queryStringValue('filterfeature', { decode: false });
        var results = []; // <-- Union Array
        var orFilters = [[]];
        var newItem = null;
        var key = 'Value';
        var c = null;

        if (value) {
            // Decode the uri first so we are actually handling a simple clear expected uri, no encoded charactesr
            // to deal with.
            value = decode(value);

            // If url was encoded first look for encoded version of "ñ" union separator  (i.e. String.fromCharCode(241)
            _.each(value.split(theN), function (section) {
                if ($.trim(section).length === 0) return;

                startNewItem();

                for (var i = section.length - 1; i >= 0; i--) {
                    c = section[i];

                    var isPipe = c === '|';
                    var isComma = c === ',';
                    var isColon = c === ':';

                    var isEscaped = i > 0 ? section[i - 1] === '_' : false;
                    var parsingValue = key === 'Value';

                    // | - start new group of or conditions...
                    if (isPipe && !isEscaped) {
                        addFilter();
                        orFilters.unshift([]);
                        continue;
                    }

                    // , - starting a new filter (anded against others)
                    if (isComma && !isEscaped && !parsingValue) {
                        addFilter();
                        continue;
                    }

                    // : - switch key
                    if (isColon && !isEscaped) {
                        switchKey();
                        continue;
                    }

                    addChar();
                }

                addFilter();

                if (orFilters.length == 1) {
                    results.push(orFilters[0]);
                } else {
                    results.push(orFilters);
                }

                orFilters = [[]];
            });
        }

        if (results.length > 0 && opts.ignoreUnions === true) {
            results = _.flatten(results, true); // <- true means flatten one level only
        }

        return results;
    };

    $.cv.util.encodeFilterFeatureValue = function (value) {
        var result = value.replace('_', '__') // Escape underscores (two underscores achieves this).
                          .replace('(', '_(') // We also want to escape parenthesis and colons.
                          .replace(')', '_)')
                          .replace(':', '_:');

        return encodeURIComponent(result);
    };

    $.cv.util.getLocation = function (href) {
        var a = document.createElement("a");
        a.href = href;
        // IE doesn't populate all link properties when setting .href with a relative URL,
        // however .href will return an absolute URL which then can be used on itself
        // to populate these additional fields.
        // Reference: http://stackoverflow.com/questions/10755943/ie-forgets-an-a-tags-hostname-after-changing-href
        if (a.host === "") {
            a.href = location.href;
        }

        return a;
    }

    // Ridirect only after the notification disappears
    $.cv.util.redirectAfterNotification = function(url, params, replace, is3rdParty) {
        if ($.cv.css.nonconfirmedMessageBeingShown) {
            // check the flag every 0.5 second.
            setTimeout(function() {
                    $.cv.util.redirectAfterNotification(url, params, replace, is3rdParty);
                },
                500);
        } else {
            $.cv.util.redirect(url, params, replace, is3rdParty);
        }
    };

    // redirect to same page replacing some querystring parameters
    // set replace=true to exclude new request from browser history

    $.cv.util.redirect = function (url, params, replace, is3rdParty) {
        // check whether the hostname of the passed in URL to redirect to is the same as the hostname of the current URL, 
        // if not redirect to the current hostname as we NEVER want to redirect away from the site
        if (($.cv.util.getLocation(url).hostname != $.cv.util.getLocation(window.location.href).hostname) && !is3rdParty) {
            window.location.href = "/";
            return;
        }

        url = url || window.location.href || '';
        url = url.match(/\?/) ? url : url + '?';

        for (var key in params) {
            var re = RegExp(';?' + key + '=?[^&;]*', 'g');
            url = url.replace(re, '');
            if (params[key] != '')
                url += (url.charAt(url.length - 1) == '&' ? '' : '&') + key + '=' + params[key];
        }
        // cleanup url 
        url = url.replace(/[;&]$/, '');
        url = url.replace(/\?[;&]+/, '?');
        url = url.replace(/[&]{2,3}/g, '&');
        url = url.replace(/[;]{2}/g, ';');
        if (url.substr(url.length - 1) == '?')
            url = url.substr(0, url.length - 1);
        if (replace) {
            window.location.replace(url);
        }
        else {
            $(location).attr('href', url);
        }
    };

    // cast dates on ajax msg
    $.cv.util.parseMessageDates = function (data, setUtcForSend) {
        // check for string object that needs casting to javascript object
        data.data = $.cv.util.parseDates(data.data, setUtcForSend);

        return data;
    };

    // OBSOLETE: use parseDates()
    $.cv.util.parseDate = function (index, item, data, setUtcForSend) {
        // Note: old parseDate() would not deal with data that WAS a date or string
        // and though parseDates() does we can't (and don't need to) modify vallers
        // reference. 
        //
        // Short Version: parseDates() covers previous functionality. Therefore use it!
        //

        $.cv.util.parseDates(data, setUtcForSend);
    };

    $.cv.util.parseDates = function (value, setUtcForSend) {
        if (value == null)
            return value;

        // Convert dates to /Date(***)/ format
        if ($.type(value) === 'date' && setUtcForSend === true) {
            return $.cv.util.dateToServerDate(value);
        }

        // Convrt formatted strings from /Date(***)/ format to Date object
        if ($.type(value) === 'string') {
            var plus = value.indexOf('+');
            if (plus == -1) plus = value.indexOf(')');
            if (value.length > 6 && value.substr(0, 6) == '/Date(' && plus != -1) {
                return $.cv.util.toDate(value);
            }
        }

        if ($.type(value) === 'array' || $.type(value) === 'object') {
            $.each(value, function (i, item) {
                value[i] = $.cv.util.parseDates(item, setUtcForSend);
            });
        }

        return value;
    };

    // assign object keys and another data to batch data calls
    $.cv.util.setupBatchData = function (batchData, objectKey) {
        // need to set objectkey on each batch data call
        $.each(batchData, function (index, item) {
            if (!item["_objectKey"]) {
                item._objectKey = objectKey;
            }
        });
        return batchData;
    };

    $.cv.util.getFieldDisplayFromType = function (fieldType, lookup) {
        var display = "";
        switch (fieldType) {
            case "label":
                display = "Label";
                break;
            case "varchar":
                display = lookup ? "DropDown" : "TextBox";
                break;
            case "email":
                display = "Email";
                break;
            case "webaddress":
                display = "TextBox";
                break;
            case "bool":
                display = "CheckBox";
                break;
            case "checklist":
                display = "CheckBoxList";
                break;
            case "date":
                display = "DatePicker";
                break;
            case "money":
                display = lookup ? "DropDown" : "Money";
                break;
            case "double":
                display = lookup ? "DropDown" : "NumericTextBox";
                break;
            case "list":
                display = "DropDown";
                break;
            case "password":
                display = "Password";
                break;
            case "int":
                display = lookup ? "DropDown" : "NumericIntTextBox";
                break;
            case "datetime":
                display = "DateTimePicker";
                break;
            case "radio":
                display = "Radio";
                break;
            case "text":
                display = "TextArea";
                break;
            case "suburb":
                display = lookup ? "DropDown" : "TextBox";
                break;
        }
        return display;
    };

    function _getEditPrompt(field) {
        return $.cv.css.usePlaceHolders && field.prompt ? field.prompt : '';
    };

    $.cv.util.fieldEditTemplates =
    {
        Label: function (field, add) {
            return "";
        },
        Email: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input type="email" class="form-email" placeholder="'
                    + _getEditPrompt(field)
                    + '" data-value-update="keyup change" data-bind="'
                    + ($.cv.util.hasValue(field.disablePaste) && field.disablePaste ? '' : 'paste: true, ')
                    + 'events: { change: dataChanged'
                    + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                    + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                    + ' },value:'
                    + field.fieldName
                    + ', enabled:'
                    + field.fieldName
                    + '_isEnabled" name="'
                    + field.fieldName
                    + '" '
                    + (field.mandatory ? 'required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : ' ')
                    + (field.readonly ? 'readonly="readonly"' : ' ')
                    + (field.length ? ('maxlength="' + field.length + '"') : '') + ' ' + field.customAttributes + ' />';
            else
                return check;
        },
        URL: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input type="url" class="form-url" placeholder="'
                    + _getEditPrompt(field)
                    + '" data-value-update="keyup change" data-bind="'
                    + ($.cv.util.hasValue(field.disablePaste) && field.disablePaste ? '' : 'paste: true, ')
                    + 'events: { change: dataChanged'
                    + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                    + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                    + ' },value:'
                    + field.fieldName
                    + ', enabled:'
                    + field.fieldName
                    + '_isEnabled" name="'
                    + field.fieldName
                    + '" '
                    + (field.mandatory ? 'required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : ' ')
                    + (field.readonly ? 'readonly="readonly"' : ' ')
                    + (field.length ? ('maxlength="' + field.length + '"') : '') + ' ' + field.customAttributes + ' />';
            else
                return check;
        },
        TextBox: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input type="text" class="form-text" placeholder="'
                    + _getEditPrompt(field)
                    + '" data-value-update="keyup change" data-bind="'
                    + ($.cv.util.hasValue(field.disablePaste) && field.disablePaste ? '' : 'paste: true, ')
                    + 'events: { change: dataChanged'
                    + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                    + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                    + ' },value:'
                    + field.fieldName
                    + ', enabled:'
                    + field.fieldName
                    + '_isEnabled" name="'
                    + field.fieldName
                    + '" '
                    + (field.mandatory ? 'required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : ' ')
                    + (field.readonly ? 'readonly="readonly"' : ' ')
                    + (field.length ? ('maxlength="' + field.length + '"') : '') + ' ' + field.customAttributes + ' />';
            else
                return check;
        },
        TextArea: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<textarea class="form-textarea"'
                    + '" data-value-update="keyup change" data-bind="'
                    + ($.cv.util.hasValue(field.disablePaste) && field.disablePaste ? '' : 'paste: true, ')
                    + 'events: { change: dataChanged'
                    + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                    + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                    + ' },value:'
                    + field.fieldName
                    + ', enabled:'
                    + field.fieldName
                    + '_isEnabled" name="'
                    + field.fieldName + '" '
                    + (field.mandatory ? 'required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : ' ')
                    + (field.readonly ? 'readonly="readonly"' : ' ') + ' ' + field.customAttributes + ' ></textarea>';
            else
                return check;
        },
        CheckBoxList: function(field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0 && field.Lookup.length > 0) {
                var checkList = "";
                var minCheckedNum = field.Validation;
                var guid = $.cv.util.hasValue(field.guid) ? field.guid : "";
                _.each(field.Lookup, function(item) {
                    if (item.Text.toLowerCase().indexOf("please select") === -1) {
                        checkList += '<input type="checkbox" class="form-checkboxlist" id="' + item.Value + guid + '" name="'
                            +  field.fieldName 
                            + '" data-value-update="keyup change"  data-bind="events: {change: dataChanged '
                            + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                            + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                            + '" },checked:'
                            + field.fieldName
                            + ' value="'
                            + item.Value + '"' +
                            ($.isNumeric(minCheckedNum)
                                ? ' data-min-selections="' + minCheckedNum + '"' + ' required="required" data-required-msg="Please select at least ' + minCheckedNum + ' option(s)"'
                                : ' ')
                            + ' ' + (field.readonly ? 'readonly="readonly"' : ' ')
                            + ' ' + field.customAttributes
                            + ' />'
                            + '<label for="' + item.Value + guid + '" >' + item.Text + '</label>';
                    }
                });
                return checkList;
            } else
                return check;
        },
        CheckBox: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            var guid = $.cv.util.hasValue(field.guid) ? field.guid : "";
            if (check.length == 0)
                return '<input type="checkbox" class="form-checkbox" id="' + guid + '" name="'
                    + field.fieldName
                    + '"  data-value-update="keyup change"'
                    + ' data-bind="events: {change: dataChanged'
                    + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                    + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                    + ' },checked:'
                    + field.fieldName
                    + ', enabled:'
                    + field.fieldName
                    // NOTE(jwwishart): value is set on mandatory as otherwise kendo validates this field as being invalid...
                    + '_isEnabled" '
                    + (field.mandatory ? 'required="required" data-required-msg="Checkbox Required" ' : ' ')
                    + (field.readonly ? 'readonly="readonly"' : ' ') + ' ' + field.customAttributes + ' />';
            else
                return check;
        },
        DatePicker: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);

            if (check.length == 0) {
                if ($.cv.css.browser().isIE === true && $.cv.css.browser().version < 8) {
                    return '<input            type="text" class="form-datepicker" name="'
                        + field.fieldName
                        + '" data-value-update="keyup change"  data-bind="events: {change: dataChanged'
                        + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                        + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                        + ' },value: '
                        + field.fieldName
                        + ', enabled:'
                        + field.fieldName
                        + '_isEnabled" '
                        + (field.mandatory ? ' required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : '')
                        + (field.readonly ? ' readonly="readonly" ' : ' ') + ' ' + field.customAttributes + ' />';
                } else {
                    return '<input data-role="datepicker" class="form-datepicker" name="'
                        + field.fieldName
                        + '" data-value-update="keyup change"  data-bind="events: {change: dataChanged'
                        + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                        + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                        + ' },value: '
                        + field.fieldName
                        + ', enabled:'
                        + field.fieldName
                        + '_isEnabled" '
                        + (field.mandatory ? ' required="required" ' : '')
                        + (field.readonly ? ' readonly="readonly" ' : ' ') + ' ' + field.customAttributes + ' />';
                }
            } else {
                return check;
            }
        },
        TimePicker: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);

            if (check.length == 0) {
                if ($.cv.css.browser().isIE === true && $.cv.css.browser().version < 8) {
                    return '<input type="text" class="form-timepicker" name="'
                        + field.fieldName
                        + '" data-value-update="keyup change"  data-bind="events: {change: dataChanged'
                        + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                        + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                        + ' },value: '
                        + field.fieldName
                        + ', enabled:'
                        + field.fieldName
                        + '_isEnabled" '
                        + (field.mandatory ? ' required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : '')
                        + (field.readonly ? ' readonly="readonly" ' : ' ') + ' ' + field.customAttributes + ' />';
                } else {
                    return '<input data-role="timepicker" class="form-timepicker" name="'
                        + field.fieldName
                        + '" data-value-update="keyup change"  data-bind="events: {change: dataChanged'
                        + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                        + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                        + ' },value: '
                        + field.fieldName
                        + ', enabled:'
                        + field.fieldName
                        + '_isEnabled" '
                        + (field.mandatory ? ' required="required" ' : '')
                        + (field.readonly ? ' readonly="readonly" ' : ' ') + ' ' + field.customAttributes + ' />';
                }
            } else {
                return check;
            }
        },
        DateTimePicker: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);

            if (check.length == 0) {
                if ($.cv.css.browser().isIE === true && $.cv.css.browser().version < 8) {
                    return '<input type="text" class="form-datetimepicker" name="'
                        + field.fieldName
                        + '" data-value-update="keyup change"  data-bind="events: {change: dataChanged'
                        + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                        + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                        + ' },value: '
                        + field.fieldName
                        + ', enabled:'
                        + field.fieldName
                        + '_isEnabled" '
                        + (field.mandatory ? ' required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : '')
                        + (field.readonly ? ' readonly="readonly" ' : ' ') + ' ' + field.customAttributes + ' />';
                } else {
                    return '<input data-role="datetimepicker" class="form-datetimepicker" name="'
                        + field.fieldName
                        + '" data-value-update="keyup change"  data-bind="events: {change: dataChanged'
                        + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                        + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                        + ' },value: '
                        + field.fieldName
                        + ', enabled:'
                        + field.fieldName
                        + '_isEnabled" '
                        + (field.mandatory ? ' required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : '')
                        + (field.readonly ? ' readonly="readonly" ' : ' ') + ' ' + field.customAttributes + ' />';
                }
            } else {
                return check;
            }
        },
        NumericTextBox: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return ($.cv.css.isBpd ? '<span class="cv-numeric-input">' : '')
                    + '<input data-role="numerictextbox" class="form-numerictextbox"'
                    + ' name="'
                    + field.fieldName
                    + '" data-format="n'
                    + (field.length ? field.length : 2)
                    + '" data-value-update="keyup change" data-bind="events: {change: dataChanged'
                    + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                    + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                    + ' },value: '
                    + field.fieldName
                    + ', enabled:'
                    + field.fieldName
                    + '_isEnabled" '
                    + (field.mandatory ? 'required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : '')
                    + (field.readonly ? 'readonly="readonly"' : ' ') + ' ' + field.customAttributes + ' />'
                    + ($.cv.css.isBpd ? '<span class="form-number-plus-minus">'
                        + '<span class="cv-link form-number-plus" title="Increase value">'
                        + '<span class="form-number-plus"><span>Increase value</span></span>'
                        + '</span>'
                        + '<span class="cv-link form-number-minus" title="Decrease value">'
                        + '<span class="form-number-minus"><span>Decrease value</span></span>'
                        + '</span>'
                        + '</span>' : '');
            else
                return check;
        },
        NumericIntTextBox: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input data-step="1" class="form-numericinttextbox" placeholder="'
                    + _getEditPrompt(field)
                    + '" data-format="n0" name="'
                    + field.fieldName
                    + '" data-value-update="keyup change" data-bind="'
                    + ($.cv.util.hasValue(field.disablePaste) && field.disablePaste ? '' : 'paste: true, ')
                    + 'events: { change: dataChanged'
                    + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                    + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                    + ' },value: '
                    + field.fieldName
                    + ', enabled:'
                    + field.fieldName
                    + '_isEnabled" '
                    + (field.mandatory ? 'required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : '')
                    + (field.readonly ? 'readonly="readonly"' : ' ') + ' ' + field.customAttributes + ' />';
            else
                return check;
        },
        Html: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<textarea id="editor" class="form-html"  name="'
                    + field.fieldName
                    + '" rows="' + (field.rows ? field.rows : 5)
                    + '" data-value-update="keyup change"  cols="' + (field.cols ? field.cols : 30)
                    + '" data-bind="'
                    + ($.cv.util.hasValue(field.disablePaste) && field.disablePaste ? '' : 'paste: true, ')
                    + 'events: { change: dataChanged'
                    + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                    + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                    + ' },value:'
                    + field.fieldName
                    + ', enabled:'
                    + field.fieldName
                    + '_isEnabled" '
                    + (field.mandatory ? 'required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : '')
                    + (field.readonly ? 'readonly="readonly"' : ' ') + ' ' + field.customAttributes + ' />';
            else
                return check;
        },
        Password: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input data-value-update="keyup change" class="form-password" placeholder="'
                    + _getEditPrompt(field)
                    + '" data-bind="'
                    + ($.cv.util.hasValue(field.disablePaste) && field.disablePaste ? '' : 'paste: true, ')
                    + 'events: { change: dataChanged'
                    + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                    + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                    + ' },value:'
                    + field.fieldName
                    + ', enabled:'
                    + field.fieldName
                    + '_isEnabled" name="'
                    + field.fieldName
                    + '" type="password" '
                    + (field.mandatory ? 'required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : '')
                    + (field.readonly ? 'readonly="readonly"' : ' ')
                    + (field.length ? ('maxlength="' + field.length + '"') : '') + ' ' + field.customAttributes + ' />';
            else
                return check;
        },
        Money: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input data-step="0.01" class="form-money" placeholder="'
                    + _getEditPrompt(field)
                    + '" data-decimals="2" data-value-update="keyup change" data-format="n2" name="'
                    + field.fieldName
                    + '" data-bind="'
                    + ($.cv.util.hasValue(field.disablePaste) && field.disablePaste ? '' : 'paste: true, ')
                    + 'events: { change: dataChanged'
                    + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                    + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                    + ' },value: '
                    + field.fieldName
                    + ', enabled:'
                    + field.fieldName
                    + '_isEnabled" '
                    + (field.mandatory ? 'required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : '')
                    + (field.readonly ? 'readonly="readonly"' : ' ') + ' ' + field.customAttributes + ' />';
            else
                return check;
        },
        DropDown: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length === 0) {
                var id = $.cv.css.guid();
                field.selectFixID = id;

                var input = '<select class="form-select select-fix-' + field.selectFixID + '" data-text-field="Text" data-value-field="Value" data-value-update="keyup change" name="'
                    + field.fieldName
                    + '" data-bind="events: {change: dataChanged'
                    + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                    + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                    + ' },value: '
                    + field.fieldName
                    + ', enabled:'
                    + field.fieldName
                    + '_isEnabled, source:'
                    + field.fieldName + '_lookup" '
                    + (field.mandatory ? 'required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : '')
                    + (field.readonly ? 'readonly="readonly"' : ' ');

                // Inject a special wireup script which executes after the fields are rendered so 
                // as to wireup a fix for the autocomplete issue with dropdowns
                // Note that this is a kendo-ified dropdownlist specific fix.
                $($.cv.util._autocompleteSelectFix(field)).appendTo($("body"));

                input += ' ' + field.customAttributes;

                input += "></select>";

                return input;
            } else
                return check;
        },
        Radio: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0 && field.Lookup.length > 0) {
                var radioList = "";
                $.each(field.Lookup, function (index, item) {
                    radioList += '<label class="radioLabel form-label">'
                        + item.Text
                        + '<input type="radio" class="form-radio" name="'
                        + field.fieldName
                        + '"  data-bind="events: {click: dataChanged, blur: dataChanged'
                        + (field.addKeyupEvent ? ", keyup: dataKeyup" : "")
                        + (field.addKeydownEvent ? ", keydown: dataKeydown" : "")
                        + ' }, checked:'
                        + field.fieldName
                        + ', enabled:'
                        + field.fieldName
                        + '_isEnabled" value="'
                        + item.Value + '"'
                        + (field.mandatory ? 'required="required" data-required-msg="' + _getEditPrompt(field) + ' is required" ' : '')
                        + (field.readonly ? 'readonly="readonly"' : ' ') + ' ' + field.customAttributes + ' /></label>';
                });
                return radioList;
            } else
                return check;
        }
    };

    $.cv.util._autocompleteSelectFix = function (field) {
        if ($.cv.util.hasValue(field.customAttributes) && field.customAttributes.indexOf('autocomplete=') && $.cv.util.hasValue(field.selectFixID) && field.selectFixID >= 0) {
            return [
                '<script>',
                '    (function() {',
                '        setTimeout(function() {' +
                '            var original = $("select.select-fix-' + field.selectFixID + '[data-role=dropdownlist]");', // kendo-ified select elements only please...
                '',
                '',

                // Attribute Cleanup
                //

                '            var autoCompleteValue = original.attr("autocomplete");',
                '            original.removeAttr("autocomplete");',
                '            var autoCompleteHost;',
                '',
                '',
                '            function makeCopy() {',
                '               if (autoCompleteHost) autoCompleteHost.remove();',
                '',
                '               autoCompleteHost = original.clone();',
                '               autoCompleteHost.val("");',
                '               autoCompleteHost.attr("name", "' + field.fieldName + field.selectFixID + '" + $.cv.css.guid().toString())',
                '               autoCompleteHost.attr("autocomplete", autoCompleteValue);',
                '               autoCompleteHost.removeAttr("data-bind")',
                '               autoCompleteHost.removeAttr("disabled")',
                '               autoCompleteHost.removeAttr("data-role")',
                '',


                // Style Changes
                // The copy of the hidden select element MUST be visible for the autocomplete functionality in the browser to work... therefore we 
                // make it visible but push it off the screen!
                // I'm not putting this in a css file as this is functional logic, and not user visiable stuff... this should all be together to make clear what is going on also me thinks.
                //

                '               autoCompleteHost.css("display", "block");',
                '               autoCompleteHost.css("position", "absolute");',
                '               autoCompleteHost.css("left", "-10000000px");',
                '               autoCompleteHost.removeClass("form-select");',
                '               autoCompleteHost.change(function() {',
                '                  var value = autoCompleteHost.val();',
                '',
                '                  if (original.val() !== value) {', // Prevent infinite loop through original setting copy, copy setting original, original setting copy.... etc.
                '                      original.val(value);',
                '                  }',
                '',
                '                  var kendoList = original.data("kendoDropDownList");',
                '',
                '                  if (kendoList) {',
                '                     kendoList.value(value);',
                '                     kendoList.refresh();',
                '                  }',
                '',
                '                  var target = original.get(0).kendoBindingTarget;',
                '                  if (target) {',
                '                      var source = target.source;',
                '                      if (source) {',
                '                          source.set("' + field.fieldName + '", value);',
                '                          source.dataChanged.call(source, { data: source });',
                '                      }',
                '                  }',
                '                  makeCopy();',
                '                });',
                '',
                '                autoCompleteHost.appendTo($("form"));',
                '            }',
                '',
                '            makeCopy();',
                '        },4);', // End Timeout.
                '    }());',
                '</script>'
            ].join('\n');
        }

        return '';
    };

    $.cv.util.string = $.cv.util.string || {};

    $.cv.util.string.endsWith = function (data, txt, ignoreCase) {
        var rgx;
        if (ignoreCase) {
            rgx = new RegExp(txt + '$', 'i');
        } else {
            rgx = new RegExp(txt + '$');
        }
        return data.match(rgx) != null;
    };

    $.cv.util.string.startsWith = function (data, prefix) {
        return (data.substr(0, prefix.length) === prefix);
    };

    $.cv.util.string.format = function (data) {
        var args = Array.prototype.slice.call(arguments, 0);
        args = args.slice(1);
        return data.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
    };

    $.cv.util.string.capitaliseFirstLetter = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    $.cv.util.stripHtml = function (html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText;
    };

    $.cv.util.buildArrayFromJson = function (options) {
        var opts = $.extend({
            obj: null,
            elementProperty: 'property',
            addKeyAsPrompt: false
        }, options);
        if (opts == null)
            return opts.obj;
        var array = new Array();
        array = [];
        if (typeof opts.obj != 'object')
            return [];
        for (key in opts.obj) {
            if (opts.obj.hasOwnProperty(key)) {
                var el = {};
                el[opts.elementProperty] = opts.obj[key];
                if (opts.addKeyAsPrompt)
                    el["keyPrompt"] = key;
                array.push(el);
            }
        }
        return array;
    };

    $.cv.util.convertArrayToObjectArray = function (array) {
        var objArray = [];
        var count = array.length;
        for (var i = 0; i < count ; i++) {
            objArray.push({ value: array[i].toString().replace(/'/g, "&#39;"), index: i, count: count });
        }
        return objArray;
    };

    $.cv.util.convertFieldsToProperties = function (object, skipKeys, priceForOneShowNettPrice) {
        var properties = "", skipKeysArray = skipKeys.split(",");
        for (key in object) {
            if (object.hasOwnProperty(key) && _.indexOf(skipKeysArray, key) === -1) {
                if (object[key] != null) {
                    if (key.toLowerCase() === "priceforone" && priceForOneShowNettPrice === true && _.has(object, "NettPriceForOne")) {
                        properties += " data-" +
                            key.replace(/([A-Z]+)/g, function(_, letter) { return "-" + letter.toLowerCase() }).replace(/-/, "") +
                            "=\"" + object["NettPriceForOne"] + "\"";
                    } else {
                        properties += " data-" +
                            key.replace(/([A-Z]+)/g, function(_, letter) { return "-" + letter.toLowerCase() }).replace(/-/, "") +
                            "=" + $.cv.util.parseFieldValue(object[key]);
                    }
                }
            }
        }
        return properties;
    };

    $.cv.util.parseFieldValue = function (productFieldValue) {
        if (productFieldValue) {
            if (Array.isArray(productFieldValue)) {
                var parsedProductField = JSON.stringify(productFieldValue);
                return "\'" + parsedProductField + "\'";
            }
            return "\"" + productFieldValue.toString() + "\"";
        }
        return "\"\"";
    };

    $.cv.util.convertFieldsToJSON = function (object, skipKeys) {
        var properties = {};
        var skipKeysArray = skipKeys.split(",");

        for (key in object) {
            if (object.hasOwnProperty(key) && _.indexOf(skipKeysArray, key) === -1) {
                if (object[key] != null) {
                    properties[key] = object[key];
                }
            }
        }
        return JSON.stringify(properties);
    };

    /*
        Allows wireup of a variety of elements (inputs) to force clicking
        of a button(target) on pressing enter in the source elements

        selectorsArray : jQuery selectors in an array. All selectors will be 
            queried and keypressed events added to all matching elements
        target : id of the element to click when enter is pressed in any
            of the matching source elemetns
     */
    $.cv.util.clickTargetOnEnter = function (selectorsArray, target) {
        $.each(selectorsArray, function (i, selector) {
            $(selector).keypress(function (event) {
                return _clickTargetOnEnterKeyPressed(event.originalEvent, target);
            });
        });
    };

    // Internal function
    function _clickTargetOnEnterKeyPressed(event, target) {
        if (event.keyCode == 13) {
            var src = event.srcElement || event.target;
            if (src &&
				((src.tagName.toLowerCase() == 'input') &&
					(src.type.toLowerCase() == 'submit' || src.type.toLowerCase() == 'button')) ||
				((src.tagName.toLowerCase() == 'a') &&
					(src.href != null) && (src.href != '')) ||
				(src.tagName.toLowerCase() == 'textarea')) {
                return true;
            }
            var defaultButton;
            if (__nonMSDOMBrowser) {
                defaultButton = document.getElementById(target);
            }
            else {
                defaultButton = document.all[target];
            }
            if (defaultButton && typeof (defaultButton.click) != 'undefined') {
                defaultButton.click();
                event.cancelBubble = true;
                if (event.stopPropagation) event.stopPropagation();
                return false;
            }
        }
        return true;
    };

    $.cv.util.filterEscaper = function (value) {
        var retVal = value.replace(/_/g, "__");
        retVal = retVal.replace(/:/g, "_:");
        retVal = retVal.replace(/\)/g, "_)");
        retVal = retVal.replace(/\(/g, "_(");
        return retVal;
    };

    $.cv.util.getValueFromKeyValueArray = function (variable, objectContainingArray) {
        for (var i = 0; i < objectContainingArray.length; i++) {
            if (variable == objectContainingArray[i].Key) {
                return objectContainingArray[i].Value;
            }
        }
        return null;
    };

    $.cv.util.validateField = function (data, fieldType) {
        // validation regexs
        var date1 = new RegExp(/^\d{1,2}-\d{1,2}-\d{4}$/);
        var date2 = new RegExp(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
        var email = new RegExp(/^((([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
        var url = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);
        var valid = true;

        if (fieldType === "date") {
            if (!(data instanceof Date) && !date1.test(data) && !date2.test(data) && data != "") {
                valid = false;
            }
        } else if (fieldType === "email") {
            if (!email.test(data) && data != "") {
                valid = false;
            }
        } else if (fieldType === "money" || fieldType === "double") {
            if (data != null && data.toString().search(/^\$?[\d,]+(\.\d*)?$/) < 0) {
                valid = false;
            }
        } else if (fieldType === "webaddress") {
            if (!url.test(data) && data != "") {
                valid = false;
            }
        }
        return valid;
    };

    $.cv.util.getFieldItemData = function (field) {
        var fieldItem = $.extend({ addKeyupEvent: false, addKeyDownEvent: false }, field, { canEdit: true });
        fieldItem.fieldName = field.FieldName;
        fieldItem.errorMessage = "";
        // to make backwards compatible with delivery and orderCompleteFields widget
        fieldItem.inputErrorClass = "";
        fieldItem.hasNonFieldValidMessage = false;

        fieldItem.guid = "guid-" + $.cv.css.guid();

        // Prompt
        // The Placeholder property will override the placeholder attribute of an input tag without changing the label (the original Prompt)
        if (field.Placeholder)
            fieldItem.prompt = field.Placeholder;
        else if (field.Prompt != undefined)
            fieldItem.prompt = field.Prompt;
        else
            fieldItem.prompt = "";

        // Mandatory
        if (field.Mandatory != undefined)
            fieldItem.mandatory = field.Mandatory;
        else
            fieldItem.mandatory = false;

        // Mandatory message
        if (field.MandatoryMessage != undefined) {
            fieldItem.mandatoryMessage = $.cv.util.string.format(
                field.MandatoryMessage, fieldItem.prompt);
        } else {
            fieldItem.mandatoryMessage = $.cv.util.string.format(
                $.cv.css.mandatoryFieldIncompleteMessage, fieldItem.prompt);
        }

        // Readonly
        if (field.Readonly != undefined)
            fieldItem.readonly = field.Readonly;
        else
            fieldItem.readonly = false;

        // Help
        if (field.Help != null)
            fieldItem.help = field.Help;
        else
            fieldItem.help = "";

        // Protected
        fieldItem["protected"] = field.Protected;

        // Hidden
        fieldItem.hidden = field.Hidden;

        // Custom element Html Attributes
        fieldItem.customAttributes = field.CustomAttributes || '';

        // Has error
        if (field.HasError != undefined)
            fieldItem.hasError = field.HasError;
        else
            fieldItem.hasError = false;

        // Input error class
        if (field.ClassForErrors != undefined)
            fieldItem.classForErrors = field.ClassForErrors;
        else
            fieldItem.classForErrors = $.cv.css.inputError;

        // Length - INFO: Length for decimals is no. decimal places.
        // 50 is a fallback
        fieldItem.length = field.Length ? field.Length : 50;

        // Rows and Cols - TextArea
        fieldItem.rows = (field.Rows && field.Rows > 0) ? field.Rows : 5;
        fieldItem.cols = (field.Columns && field.Columns > 0) ? field.Columns : 30;

        // determine Type
        var display = $.cv.util.getFieldDisplayFromType(field.FieldType, (_.size(field.Lookup) > 0 && field.Lookup["regex"] == undefined));

        var dataItem = { prompt: field.Prompt, fieldItem: fieldItem };
        if (field.Value != null && (field.FieldType === "date" || field.FieldType === "datetime")) {
            field.Value = kendo.toString($.cv.util.toDate(field.Value), "dd/MM/yyyy");
        }

        dataItem[fieldItem.fieldName] = dataItem["value"] = field.Value;
        dataItem[fieldItem.fieldName + "_isEnabled"] = true;
        
        // indicate if prompt is empty
        dataItem.emptyPrompt = dataItem.prompt == '';

        // add lookup item to order field
        if (field.Lookup !== null) {

            var lookupToUse = [];
            if (field.Lookup["regex"] != undefined) {
                dataItem["regex"] = field.Lookup["regex"];
            } else {
                dataItem["regex"] = $.cv.util.getDefaultRegexForType(fieldItem);
            }
            if (_.size(field.Lookup) > 0 && field.Lookup["regex"] == undefined) {
                $.each(field.Lookup, function (index, item) {
                    // filter out any null values or functions causing the lookup binding on mobile to render strange results
                    if (!$.isFunction(item) && item != null) {
                        lookupToUse.push({ Value: index, Text: item });
                    }
                });
            }

            dataItem[fieldItem.fieldName + "_lookup"] = lookupToUse;
            // set lookup for field data, needed to generate radio buttons in template
            if ((!dataItem["value"] || dataItem["value"] == "") && lookupToUse.length > 0) {
                dataItem["value"] = lookupToUse[0].Value;
                dataItem[fieldItem.fieldName] = lookupToUse[0].Value;
            }
            fieldItem.Lookup = lookupToUse;

            if ($.cv.css.addPleaseSelectToLookup && fieldItem.Lookup.length > 1) {
                // a lot of widgets may have added their own "please select..." default selection with the value '' or ' ', in that case, don't add again.
                var hasDefaultValue = false;
                var fieldDefault = fieldItem.DefaultValue;
                $.each(fieldItem.Lookup, function (idx, item) {
                    if (item.Value === '' || item.Value === ' ' || item.Value === fieldDefault) {
                        hasDefaultValue = true;
                        return false;
                    }
                });

                if (!hasDefaultValue) {
                    var defaultValue = '';
                    fieldItem.Lookup.unshift({ Text: $.cv.css.pleaseSelectText, Value: defaultValue });
                    if (!field.Value) {
                        dataItem[dataItem.fieldItem.fieldName] = defaultValue;
                    }
                }
            }
        } else {
            dataItem[fieldItem.fieldName + "_lookup"] = [];
        }

        // parse template
        dataItem.fieldTemplate = $.cv.util.fieldEditTemplates[display](fieldItem);

        // field validation function, to be triggered from data change function
        dataItem.fieldValid = function (e, displayMessages) {
            var fieldItem = e.data["fieldItem"];
            var isCheckList = fieldItem.FieldType === "checklist";

            var value = e.data[fieldItem.fieldName] == null
                ? ""
                : (e.data[fieldItem.fieldName] instanceof Date
                    ? kendo.toString(e.data[fieldItem.fieldName], "dd/MM/yyyy")
                    : e.data[fieldItem.fieldName].toString().trim()); // trim off any empty spaces

            var isMandatory = isCheckList ? false : fieldItem.mandatory;
            var valid;
            if (isCheckList) {
                valid = $.cv.util.validateCheckList($(e.target));
            } else {
                valid = $.cv.util.testRegEx(eval(dataItem.regex), value, !isMandatory);
            }

            var invalidMessage = "";
            var inputErrorClass = "";
            displayMessages = typeof displayMessages !== 'undefined' ? displayMessages : (fieldItem.get("hasNonFieldValidMessage") !== undefined ? !fieldItem.get("hasNonFieldValidMessage") : true);
            if (!valid) {
                inputErrorClass = fieldItem.classForErrors;
                if (isMandatory && value.length == 0) {
                    if (fieldItem.FieldType != "date" || (fieldItem.FieldType == "date" && e.data[fieldItem.fieldName] != null)) {
                        invalidMessage = fieldItem.mandatoryMessage;
                    } else {
                        invalidMessage = $.cv.util.getInvalidMessageForType(fieldItem, value);
                    }
                } else {
                    invalidMessage = $.cv.util.getInvalidMessageForType(fieldItem, value);
                }
            }
            if (displayMessages) {
                dataItem.setError(fieldItem, invalidMessage, inputErrorClass);
            }
            return valid;
        };

        dataItem.setError = function (fieldItem, message, errorClass) {
            fieldItem.set("errorMessage", message);
            fieldItem.set("hasError", message.length > 0);
            fieldItem.set("inputErrorClass", errorClass);
        };

        // change event for the fields as some use keyup, others use click/blur etc
        // to be overridden / implemented by the widget using these fields
        dataItem.dataChanged = function (e) {
            dataItem.fieldValid(e);
        };

        return dataItem;
    };

    /*
        Useful in templateing engines to encode strings that contain quotes (i.e. ' or ")
        that would break the element attribute thus stuffing up rendering.
    */
    $.cv.util.attrEnc = function (text) {
        if (text === undefined || text === null)
            return '';

        var newText = text.replace(new RegExp("'", 'g'), "&#39;")
                    .replace(new RegExp('"', 'g'), "&#34;");
        return newText;
    };

    // Util parseTemplate registration
    //

    $.cv.util.parseTemplate = function (template, data) {
        return kendo.template(template)(data);
    };

    /*
     * Kendo validator validates hidden fields. To get around this we will
     * wrap each of the default rules functions for the different validation types
     * and only execute the original function ONLY IF the field is actually
     * visible. There seems to be no other way to turn this off at the moment.
    **/
    $.cv.util.preventHiddenFieldValidation = function (kendoValidator) {
        if (kendoValidator && kendoValidator.options && kendoValidator.options.rules) {
            var cache = kendoValidator.options.rules;

            // Wrap current functions and assign back to reference
            if (cache.date)
                cache.date = wrapRule(cache.date);
            if (cache.email)
                cache.email = wrapRule(cache.email);
            if (cache.max)
                cache.max = wrapRule(cache.max);
            if (cache.min)
                cache.min = wrapRule(cache.min);
            if (cache.pattern)
                cache.pattern = wrapRule(cache.pattern);
            if (cache.required)
                cache.required = wrapRule(cache.required);
            if (cache.step)
                cache.step = wrapRule(cache.step);
            if (cache.url)
                cache.url = wrapRule(cache.url);
        }
    };

    $.cv.util.consoleMessage = function (data) {
        var display = $.cookie &&
                      $.cookie("CVBUNDLEDEBUG") != undefined &&
                      $.cookie("CVBUNDLEDEBUG").toLowerCase() === 'true';
        if (display) {
            switch (data.options.type) {
                case $.cv.css.messageTypes.error:
                    console.error(data.options);
                    break;
                case $.cv.css.messageTypes.warning:
                    console.warn(data.options);
                    break;
                case $.cv.css.messageTypes.info:
                    console.info(data.options);
                    break;
                default:
                    console.log(data.options);
                    break;
            }
        }
    };

    $.cv.util.notify = function (vmOrAllOptions, message, type, options) {
        var result = $.Deferred(),
            resultData = {
                viewModelMessageSet: false,
                publishResult: null
            },
            opts;

        // ************************
        // *** Method Overloads ***
        // ************************
        if (kendo && (vmOrAllOptions instanceof kendo.Observable)) {
            // Example:
            // $.cv.util.notify(viewModel, message, type);
            opts = $.extend({}, $.cv.util.notify._defaults, options);
            opts.viewModel = vmOrAllOptions;
            opts.message = message;
            opts.type = type;
        } else {
            // Example:
            // $.cv.util.notify({
            //   viewModel: vm,
            //   message: 'sdfskf'.
            //   type: 'error'
            // });
            opts = $.extend({}, $.cv.util.notify._defaults, vmOrAllOptions);
        }

        // Does View Model require us to trigger messages or not?
        if (opts.viewModel != null && opts.triggerMessages == null) {
            opts.triggerMessages = opts.viewModel.get("triggerMessages");
        }

        // Get values from VM if needed
        if (opts.viewModel != null && opts.clearExisting == null) {
            opts.clearExisting = opts.viewModel.get("clearWidgetMessages");
        }

        // Set Message on ViewModel if Present
        if (opts.viewModel != null) {
            if (opts.viewModel.name != null) {
                opts.source = opts.viewModel.name;
            }

            opts.viewModel.set("message", opts.message);
            opts.viewModel.set("type", opts.type);

            resultData.viewModelMessageSet = true;
        }

        resultData.options = opts;

        // Trigger it!
        if (opts.triggerMessages === true) {
            $.cv.css.trigger($.cv.css.eventnames.message, {
                message: opts.message,
                type: opts.type,
                messageGroup: opts.messageGroup,
                source: opts.source,
                clearExisting: opts.clearExisting
            }).done(function (triggerResult) {
                resultData.publishResult = triggerResult;

                result.resolve(resultData);
            });
        } else {
            result.resolve(resultData);
        }

        $.cv.util.consoleMessage(resultData);

        return result.promise();
    };

    $.cv.util.notify._defaults = {
        viewModel: null,

        message: "",
        type: "",
        messageGroup: "",       // used to clear specific messages from a widget. 
        source: "",

        triggerMessages: null,  // true/false, we will set from VM if not passed in
        clearExisting: null     // true/false, we will set from VM if not passed in
    }

    /* @viewModel could be extended to potentially be options later as needed */
    $.cv.util.clearNotifications = function (vmOrAllOptions, triggerMessagesOverride) {
        var opts;

        // ************************
        // *** Method Overloads ***
        // ************************
        if (kendo && (vmOrAllOptions instanceof kendo.Observable)) {
            // Example:
            // $.cv.util.clearNotifications(viewModel);
            opts = $.extend({}, $.cv.util.notify._defaults);
            opts.viewModel = vmOrAllOptions; /* < View Model here */
            opts.messageGroup = "";
        } else {
            // Example:
            // $.cv.util.notify({
            //   viewModel: vm,
            //   triggerMessages: true // we might not ever or very rarely actually manually set this! Just an example!
            // });
            opts = $.extend({}, $.cv.util.notify._defaults, vmOrAllOptions /* < options here */);
        }

        if (opts.viewModel == null)
            return;

        opts.viewModel.set("message", "");

        if (($.cv.util.hasValue(triggerMessagesOverride) && triggerMessagesOverride === true)
            || opts.viewModel.get("triggerMessages")) {
            $.cv.css.trigger($.cv.css.eventnames.message, {
                message: "",
                type: "",
                messageGroup: opts.messageGroup,
                source: opts.viewModel.name,
                clearExisting: true
            });
        }
    };

    // DEPRICATED: used $.cv.util.notify
    $.cv.util.setMessage = function (message, type) {
        if (message == null || type == undefined)
            return;

        $.cv.util.notify(this, message, type);
    };

    // DEPRICATED: used $.cv.util.clearNotifications;
    $.cv.util.clearMessage = function () {
        this.set("message", "");
        if (this.get("triggerMessages"))
            $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: this.name, clearExisting: true });
    };

    $.cv.util.testRegEx = function (regExString, testString, allowEmpty) {
        var regEx = new RegExp(regExString);
        if ($.trim(testString) === "" && allowEmpty) {
            return true;
        } else if (!regEx.test(testString) || $.trim(testString) === "") {
            return false;
        } else {
            return true;
        }
    };

    function wrapRule(currentValidateFunction) {
        // a is jquery object that contains the element that needs validation by kendo validator.
        return function (a) {
            if (a.is(":visible"))
                return currentValidateFunction(a);

            return true; // Field is valid if hidden
        };
    };

    $.cv.util.getInvalidMessageForType = function (fieldItem, value) {
        var invalidMessage = "", fieldName = (fieldItem.prompt && fieldItem.prompt.trim().length > 0) ? fieldItem.prompt : "Field";
        invalidMessage = $.cv.util.string.format($.cv.css.invalidFieldMessage, fieldName);
        return invalidMessage;
    };

    $.cv.util.getDefaultRegexForType = function (fieldItem) {
        var regex = "";
        switch (fieldItem.FieldType) {
            case "date":
                regex = /^([1-9]|0[1-9]|[12][0-9]|3[01])[- /.]([1-9]|0[1-9]|1[012])[- /.](19|20|30)\d\d$/; // allows formats dd/mm/yyyy or d/m/yyyy with separators -/. or space
                break;
            case "email":
                regex = /^((([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
                break;
            case "webaddress":
                regex = /^[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?$/gi;
                break;
            case "money":
            case "double":
                regex = /^\$?[\d,]+(\.\d*)?$/;
                break;
            case "int":
                regex = /^-?\d*$/;
                break;
            default:
                regex = "";
        }
        return regex;
    };

    // jQuery Ajax Converter: converts the result of a service call
    // where the underlying method returns a simple boolean value... this
    // converts it to an actual boolean instead of keeping the serialized string.
    $.cv.util._booleanResponseConverter = function (response) {
        var result = jQuery.parseJSON(response);
        var data = result.data;

        if (data && $.type(data) === 'string') {
            result.data = data === "True";
        }

        return result;
    };

    // Gets the function from it's string path or if it is a function just returns it.
    $.cv.util.getFunctionFromString = function (value) {
        if ($.type(value) === 'string') {
            return (new Function("return " + value))();
        }

        if ($.type(value) === 'function') {
            return value;
        }
    };

    $.cv.util.whiteSpaceAndNullReplacer = function (invar) {
        if (invar == "null" || $.trim(invar) == "" || invar == null) {
            return "&#8203;"; // like &nbsp; doesn't collapse the container, but also doesn't put a space in the container
        }

        return invar;
    };

    $.cv.util.isDeclared = function (ref) {
        return typeof(ref) !== 'undefined';
    };

    // Returns true if passed in 'thing' is not null and not undefined!
    // @path takes a path relative to the reference object/array.
    //       path should not be used when ref is a literal or anything bar object/array.
    //       RETURNS: false if it can't evaluate the path... True if it can
    //       and the value is non null/undefined.
    //       Examples:
    //          $.cv.util.hasValue({ thingy:false }, 'thingy')  >> returns true;
    //          $.cv.util.hasValue([false], '[0]')              >> returns true;
    // UNIT TESTS AVAILABLE /scripts/Tests/cv.util-spec.js
    // NOTE: Essentially evaluating.. Don't use path from user input obviosly... if we want to
    // eventually we will need to parse the path manually and check each part manually
    $.cv.util.hasValue = function (ref, path) {
        if (path !== undefined && $.type(path) === 'string' && $.trim(path) !== '') {
            // Invariant/Shortcut
            if (ref === null || ref === undefined) return false;

            // Evaluate the path.
            try {
                var isArray = path[0] === '[';
                var evaluate = new Function("ref", "return ref" + (isArray ? '' : '.') + path);
                var result = evaluate(ref);

                return result !== null && result !== undefined;
            } catch (error) {
                window.DEBUG && console.error(error);
                return false;
            }
        }

        return ref !== null && ref !== undefined;
    };

    $.cv.util.isNotDeclaredOrNullOrWhitespace = function (ref) {
        // Check if the ref has been declared
        if (!$.cv.util.isDeclared(ref)) return true;
        // Check if the ref has a value assigned.
        return $.cv.util.isNullOrWhitespace(ref);
    };

    $.cv.util.isNullOrWhitespace = function (str) {
        if (!$.cv.util.hasValue(str)) return true;

        if ($.type(str) === 'string') {
            return $.trim(str).length === 0;
        } else {
            // Anything that is not a string: ex: 15 (number) {} an object, [] and empty array
            // should not be considered to be null or whitespace
            return false;
        }
    };

    // Return the string represerntation of a number with any trailing decimal point and 00 removed.
    $.cv.util.removeTrailingZeroes = function (value) {
        // Return a the string representation minus any trailing zero decimal value based on the type of 
        // value. We handle string and number. All other types we return the original value unprocessed.
        if (!$.cv.util.hasValue(value)) {
            return value;
        }

        return value.toString().replace(/\.00$/, "");
    };

    $.cv.util.htmlEncode = function (value) {
        // Bail Conditions
        if ($.cv.util.hasValue(value) === false || $.type(value) !== 'string') {
            return '';
        }

        // Replace 
        return value.toString()
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");
    };

    $.cv.util.htmlEncodeEquals = function (value) {
        // Bail Conditions
        if ($.cv.util.hasValue(value) === false || $.type(value) !== "string") {
            return "";
        }

        // Replace 
        return value.toString().replace("=", "%3D");
    };

    // html encodes a string then replaces newlines with br tags
    // the result should be rendered as html not as text!!!
    $.cv.util.stringToFormattedHtml = function (str) {
        // Encode first because we will be replacing things with html tags
        // and this text would just be rendered unencoded
        var result = $.cv.util.htmlEncode(str);
        return result.replace(/\n/g, function (str, match) { return '<br>'; });

        // Note:
        // We don't do tabs because at least in the current situationj
        // we don't allow tabs to be entered (it will just move to the next field
        //.replace(/\t/g, function(str, match) { return '&nbsp;&nbsp;&nbsp;&nbsp;'; })
        //
        // We don't replace spaces as this prevents the text from wrapping... we don't 
        // want it to go off the screen
        //.replace(/\s/g, function(str, match) { return '&nbsp;'; });
    };

    $.cv.util.toggleCvCheckboxValue = function (e, vm, vmProperty) {
        var target = $(e.target);
        if (target.is("input[type='checkbox']")) {
            return;
        }
        var boolVal = vm.get(vmProperty);
        if (!$.cv.util.hasValue(boolVal)) {
            boolVal = false;
        }
        vm.set(vmProperty, !boolVal);
    };

    $.cv.util.bindNonVmKendoTextBox = function() {
        $("body").on("click", $.cv.css.kendoNumericTextContainer, function(el) {

            var src = $(el.srcElement)[0];

            // if the clicked element has a data-bind, it is a viewModel based widget so we don't want to do the extra processing
            // bail out
            if($.cv.util.hasValue($(src).data("bind"))) {
                return;
            }

            // get the current target
            var currentTarget = $(el.currentTarget);

            // get the plus and minus elements
            var plusEl = currentTarget.find($.cv.css.kendoNumericTextBoxPlus)[0];
            var minusEl = currentTarget.find($.cv.css.kendoNumericTextBoxMinus)[0];

            // if the source element that triggered the click event was NOT the plus or minus element, bail out
            if(src !== plusEl && src !== minusEl) {
                return;
            }

            // try and get the kendo numeric input (using a contains search to detect various numeric widgets)
            var input = currentTarget.find("input[data-role*='numeric']");

            // we don't have a kendo widget so bail out
            if(input.length === 0) {
                return;
            }

            // get the kendo widget name from the data role
            var role = input.data("role");

            // to get access to the kendo widget itself we need to have the correct casing form the data role
            var mapObj = {
                numeric:"Numeric",
                text:"Text",
                box: "Box"
            };
            var kendoInputType = role.replace(/numeric|text|box/gi, function(matched) {
                return mapObj[matched];
            });

            // get the kendo widget
            var kendoObj = input.data("kendo" + kendoInputType);

            if($.cv.util.hasValue(kendoObj)) {

                // we have a kendo widget so we can access and update values accordingly
                var currentQty = kendoObj.value();
                currentQty = $.cv.util.isNullOrWhitespace(currentQty) ? 0 : currentQty;
                var min = $.cv.util.hasValue(kendoObj.min()) ? kendoObj.min() : -9999999999999;
                var newValue = $.cv.util.kendoNumericTextGetStepValue(currentQty, src === plusEl ? "increase" : "decrease", min, null, 1);

                kendoObj.value(newValue); 
            }
        });
    };

    $.cv.util.kendoNumericTextGetStepValue = function (qty, mode, minValue, vm, vmPackQuantityOverride) {
        // Optional Params
        minValue = $.cv.util.hasValue(minValue) ? minValue : 0;
        // Get target property to modify.
        vmPackQuantityOverride = $.cv.util.hasValue(vmPackQuantityOverride)
            ? vmPackQuantityOverride :
            vm.get("packQuantityTarget");

        // Bail out if missing needed data.
        if (!$.cv.util.hasValue(qty) || !$.cv.util.hasValue(mode)) {
            return 1;
        }

        // Local var
        var movementValue,
            remainder,
            vmIsPassedIn = $.cv.util.hasValue(vm),
            vmForcePackQty = vmIsPassedIn && vm.get("forceOrderPackQty"),
            vmPackQty = vmIsPassedIn ? vm.get(vmPackQuantityOverride) : 1,
            vmForcePackQtyIsTrue = vmForcePackQty === "true" || vmForcePackQty === true;

        // Check if vm is passed in and we have a pack qty.
        if (vmForcePackQtyIsTrue && vmPackQty !== 0) {
            movementValue = eval(vmPackQty);
        }

        movementValue = !$.cv.util.hasValue(movementValue) || movementValue === 0 ? 1 : movementValue;

        if (mode === "increase") {
            qty += movementValue;
        } else {
            qty -= movementValue;
        }

        remainder = qty % movementValue;
        if (remainder !== 0) {
            qty = qty - remainder;
        }

        return qty < minValue ? minValue : qty;
    };

    $.cv.util.kendoNumericTextBoxIncrease = function (vm, vmCurrentQtyPropertyOverride, vmPackQuantityOverride) {
        // Local vars
        var quantityTarget = $.cv.util.hasValue(vmCurrentQtyPropertyOverride)
                ? vmCurrentQtyPropertyOverride 
                : vm.get("quantityTarget"),
            currentQty = vm.get(quantityTarget);

        // If Quantity is not set can't increment. set to 0
        if (!$.cv.util.hasValue(currentQty) || $.cv.util.isNullOrWhitespace(currentQty)) {
            currentQty = 0;
        }

        // Get and Set the new value
        vm.set(quantityTarget, $.cv.util.kendoNumericTextGetStepValue(currentQty, "increase", 0, vm, vmPackQuantityOverride));
    };

    $.cv.util.kendoNumericTextBoxDecrease = function (vm, minValue, vmCurrentQtyPropertyOverride, vmPackQuantityOverride) {
        // Local vars
        var quantityTarget = $.cv.util.hasValue(vmCurrentQtyPropertyOverride)
                ? vmCurrentQtyPropertyOverride
                : vm.get("quantityTarget"),
            currentQty = vm.get(quantityTarget);

        // If Quantity is not set can't increment. return
        if (!$.cv.util.hasValue(currentQty)) {
            return;
        }

        // Get and Set the new value
        vm.set(quantityTarget, $.cv.util.kendoNumericTextGetStepValue(currentQty, "decrease", minValue, vm, vmPackQuantityOverride));
    };

    $.cv.util.kendoNumericTextBoxVars = function(el) {
        var kendoNumericTextContainer = $(el.element)
                .closest($.cv.css.kendoNumericTextContainer);

        var parentVm = $.cv.util.hasValue(kendoNumericTextContainer, '[0].kendoBindingTarget.source') ?
                kendoNumericTextContainer
                .find($.cv.css.kendoNumericTextBoxPlus)[0]
                .kendoBindingTarget
                .source : null

        var vmExists = $.cv.util.hasValue(parentVm);
        var vmForcePackQty = vmExists ? parentVm.get("forceOrderPackQty") : false

        return {
            parentVm: parentVm,
            vmExists: vmExists,
            vmForcePackQty: vmForcePackQty,
            useStep: $(el.element[0]).attr("force-step") || $(el.element[0]).attr("force-step-change"),
            step: el.options.step,
            newValue: el.value(),
            oldValue: el._old
        };
    }

    $.cv.util.kendoNumericTextBoxChange = function (el) {
        var vars = $.cv.util.kendoNumericTextBoxVars(el);

        if (vars.vmForcePackQty === "true" || vars.vmForcePackQty === true) {
            if (vars.oldValue === vars.newValue) {
                // Ensure we are at pack qty
                $.cv.util.kendoNumericTextBoxIncrease(vars.parentVm);
                $.cv.util.kendoNumericTextBoxDecrease(vars.parentVm);
            } else if (oldValue < newValue) {
                $.cv.util.kendoNumericTextBoxIncrease(vars.parentVm);
                return;
            } else {
                $.cv.util.kendoNumericTextBoxDecrease(vars.parentVm);
                return;
            }
        }

        // Fallback to old way
        if (vars.useStep) {
            var value = el.value(), remainder = value % vars.step;
            if (remainder !== 0) {
                value = value - remainder;
                $(el.element[0]).val(value);
            }
        }
    };

    $.cv.util.kendoNumericTextBoxSpin = function(el) {
        var vars = $.cv.util.kendoNumericTextBoxVars(el);

        if (vars.vmForcePackQty === "true" || vars.vmForcePackQty === true) {
            if (vars.oldValue === vars.newValue) {
                // Ensure we are at pack qty
                $.cv.util.kendoNumericTextBoxIncrease(vars.parentVm);
                $.cv.util.kendoNumericTextBoxDecrease(vars.parentVm);
                return;
            } else if (vars.oldValue < vars.newValue) {
                $.cv.util.kendoNumericTextBoxIncrease(vars.parentVm);
                return;
            } else {
                $.cv.util.kendoNumericTextBoxDecrease(vars.parentVm);
                return;
            }
        }

        // Fallback to old way
        if (vars.useStep) {
            var value = el.value(), remainder = value % vars.step;
            if (remainder !== 0) {
                value = value - remainder;
                $(el.element[0]).val(value);
            }
        }
    }

    $.cv.util.kendoNumericTextBox = function (el) {
        var k = $(el).data("kendoNumericTextBox");
        if (k == undefined) {
            k = $(el).kendoNumericTextBox({
                change: function () {
                    $.cv.util.kendoNumericTextBoxChange(this);
                },
                spin: function () {
                    $.cv.util.kendoNumericTextBoxSpin(this);
                }
            }).data("kendoNumericTextBox");
        } else {
            if (k.options.spin == undefined) {
                k.bind("spin", function () {
                    $.cv.util.kendoNumericTextBoxSpin(this);
                });
            }
            if (k.options.change == undefined) {
                k.bind("change", function () {
                    $.cv.util.kendoNumericTextBoxChange(this);
                });
            }
        }

        // bail if on IE9 or lower
        if ($.cv.css.browser().isIE === true && $.cv.css.browser().version < 10) return;

        // set to force the numeric keypad to display on mobile devices
        k.wrapper.children().find(".form-number")
            .prop("type", "tel")
            .attr("pattern", "[0-9]*");
        
    };

    $.cv.util.afterOWLinitProductSlider = function() {
        var slider = this.$elem[0];
        $(slider).find(".cv-add-to-cart").click(function () {
            $(this).parentsUntil("[data-role='product']").parent().find("[data-bind*='quantity']").blur();
        });
    };

    $.cv.util.sliderSelector = ".k-slider";
    $.cv.util.tickSelector = ".k-tick";
    $.cv.util.largeTickClass = "k-tick-large";
    $.cv.util.ticklabelClass = "k-label";
    $.cv.util.setRangeSliderTicks = function (el) {
        $(el).find($.cv.util.sliderSelector).each(function (sliderIndex, slider) {
            var $ticks = $(slider).find($.cv.util.tickSelector);
            var hasLabels = $ticks.find("." + $.cv.util.ticklabelClass).length > 0;
            if (!hasLabels) {
                var largeTicks = _.filter($ticks, function (tick, index) {
                    return (index + 1) % 2 === 0;
                });
                $.each(largeTicks, function (index, tick) {
                    $(tick).addClass($.cv.util.largeTickClass).html("<span class='" + $.cv.util.ticklabelClass + "'>" + $(tick).attr("title") + "</span>");
                });
            }
        });
    };

    // Replaces the method on the context
    //
    // @context: the object with the method we want to proxy
    // @methodName: the name of the method as a string that we want to proxy.
    // @options: contains preCall and postCall fields for method assignment as callbacks
    //   preCall take the called method arguments only
    //   postCall takes the response object from the called method and then all the arguments
    //     from the called method
    //     from the called method
    $.cv.util.proxy = function(context, methodName, options) {
        var method = context[methodName];

        var opts = $.extend({
            preCall: null,
            postCall: null
        }, options);

        var proxyMeta = null;
        var proxy = function () {
            proxyMeta = _.extend({ isProxyMeta: true }, $.cv.css._proxyMeta);
            $.cv.css._proxyMeta = {};

            var passedArgs = [];
            for (var i = 0; i < arguments.length; i++) {
                passedArgs.push(arguments[i]);
            }

            passedArgs.push(proxyMeta);

            if (opts.preCall) {
                opts.preCall.apply(context, passedArgs);
            }

            var response = method.apply(context, passedArgs);

            if (opts.postCall) {
                opts.postCall.apply(context, _.union([response], passedArgs));
            }

            return response;
        };

        for (var field in method) {
            if (Object.prototype.hasOwnProperty.call(method, field) && !proxy[field]) {
                proxy[field] = method[field];
            }
        }
        context[methodName] = proxy;

        return proxy;
    };

    $.cv.util.getBaseProxyMeta = function(widget) {
        return _.extend({ jsWidgetName: widget.name }, $.cv.util.getRazorWidgetDetails(widget));
    };

    $.cv.util.getRazorWidgetDetails = function(widget) {
        var classNames = widget.element[0].className.split(/\s+/);
        var widgetName = _.find(classNames, function(name) {
            return name.indexOf("widget-") !== -1;
        });
        if (!$.cv.util.hasValue(widgetName)) {
            var closestWidget = widget.element.closest("[class^=widget-]");
            if (closestWidget.length > 0) {
                classNames = closestWidget[0].className.split(/\s+/);
                widgetName = _.find(classNames, function (name) {
                    return name.indexOf("widget-") !== -1;
                });
            }
        }
        if ($.cv.util.hasValue(widgetName)) {
            widgetName = widgetName.replace("widget-", "");
        } else {
            widgetName = "";
        }
        return { widgetName: widgetName, widgetElement: widget.element };
    };

    $.cv.util.getObjectValByString = function(obj, str) {
        str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        str = str.replace(/^\./, ''); // strip a leading dot
        var a = str.split(".");
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in obj) {
                obj = obj[k];
            } else {
                return;
            }
        }
        return obj;
    };

    $.cv.util.setObjectValByString = function(obj, prop, value) {
        if (typeof prop === "string")
            prop = prop.split(".");

        if (prop.length > 1) {
            var e = prop.shift();
            $.cv.util.setObjectValByString(obj[e] =
                Object.prototype.toString.call(obj[e]) === "[object Object]"
                ? obj[e]
                : {},
                prop,
                value);
        } else
            obj[prop[0]] = value;
    };

    $.cv.util.setColumnCountClass = function(obj) {
        var $obj = obj instanceof jQuery ? obj : $(obj);
        var colCount = $obj.find($.cv.css.columnCountElement).length,
            colCountClass = $.cv.css.columnCountClassPrefix + colCount,
            currClassNameString = $obj.attr("class"),
            currClassNameArray = $.cv.util.hasValue(currClassNameString) ? currClassNameString.split(" ") : [],
            newClassNameArray = _.filter(currClassNameArray, function (className) { return className.indexOf($.cv.css.columnCountClassPrefix) === -1; });

        if (!$.cv.util.hasValue(newClassNameArray)) {
            newClassNameArray = [];
        } else if (!_.isArray(newClassNameArray)) {
            newClassNameArray = [newClassNameArray];
        }
        newClassNameArray.push(colCountClass);
        $obj.attr("class", newClassNameArray.join(" "));
    };

    $.cv.util.kendoValidatorRules = {
        rules: {
            required: function(input) {
                if ((input.filter("[type=radio]").length > 0) && input.attr("required")) {
                    var fields = $("form").find("[name=" + input.attr("name") + "]");
                    for (var i = 0; i < fields.length; i++) {
                        if ($(fields[i]).is(":checked")) {
                            return $(fields[i]).val().length > 0;
                        }
                    }
                    return true;
                } else {
                    var isCheckbox = input.filter("[type=checkbox]").length > 0;
                    if (isCheckbox) {
                        if (input.attr('data-min-selections')) {
                            // check box list
                            return $.cv.util.validateCheckList(input);
                        } else {
                            // normal check box
                            return !(input.attr("required") != null && !input.is(":checked"));
                        }
                    } else {
                        return !(input.attr("required") != null && !input.val());
                    }
                }
            }
        }
    };

    $.cv.util.validateCheckList = function ($target) {
        var minNum = $target.attr('data-min-selections');
        var checkedNum = $('[name=' + $target.attr('name') + ']:checkbox:checked').length;
        return minNum === undefined || checkedNum >= minNum;
    };

    $.cv.util.setColumnSortClass = function (element, sortDirection) {
        var previous = element.closest($.cv.css.sortColumnContainer).find($.cv.css.sortColumn);
        $.each(previous, function (idx, item) {
            $(item).removeClass($.cv.css.sortColumnAsc).removeClass($.cv.css.sortColumnDesc);
        });
        element.addClass(sortDirection);
    };

    $.cv.util.parseLookup = function(lookup) {
        // Bail Conditions
        if ($.cv.util.hasValue(lookup) === false) return [];
        if ($.type(lookup) !== 'string') return [];
        if ($.trim(lookup).length === 0) return [];
        
        var parts = lookup.split(';');
        var results = [];
        var key = '';
        var value = '';
        var kv = [];
        var i;
        var length = parts.length;
        
        for (i = 0; i < length; i++) {
            if ($.trim(parts[i]).length > 0) { // Skip empty entries
                kv = $.trim(parts[i]).split('=');
                
                key = value = kv[0];
                    
                if (kv.length === 2) {
                    key = kv[0];
                    value = kv[1];
                }
                
                if ($.trim(key).length === 0) {
                    continue;
                }
                
                results.push({
                    key: key,
                    value: value
                });
            }
        } 

        return results;
    }
    
    $.cv.util.resolvedPromise = function() {
        return $.cv.util.resolvedPromise._deferred.promise();
    }
    $.cv.util.resolvedPromise._deferred = $.Deferred();
    $.cv.util.resolvedPromise._deferred.resolve();

    $.cv.util.toTitleCase = function (value) {

        if (!$.cv.util.hasValue(value)) {
            return '';
        }

        if ($.type(value) !== 'string') {
            return '';
        }

        return value.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    //
    // !!!!!!!!!! *** MUST BE CALLED BEFORE kendo.init() *** !!!!!!!!!!
    //
    $.cv.util.fixHtmlEncodingInKendoTemplates = function () {
        // Fix issue with encoding in razor templates, which breaks Kendo templates
        // (e.g. "It's ok" would be encoded to "It&#39;s ok" but we need "It&\#39;s ok").
        // If the # isn't escaped the Kendo template will break.
        // write by justin
        $("script[type='text/x-kendo-template']").each(function () {
            var $el = $(this);
            var html = $el.html();

            // Matches on &#nnnn; (decimal variation) and &#xhhhh; (hexadecimal variation).
            var re = /&#(\d+|x[\da-fA-F]+);/g;

            var found = html.match(re);
            if (found) {
                $el.html(html.replace(re, "&\\#$1;"));
            }
        });
    }

})(jQuery);
