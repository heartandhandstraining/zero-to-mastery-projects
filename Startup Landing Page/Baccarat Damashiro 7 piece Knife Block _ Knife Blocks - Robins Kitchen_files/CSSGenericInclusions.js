// Window opening functions
function open_window(url)
{var left = (screen.availWidth - 600) / 2; if(left < 0) left = 0;
var top = (screen.availHeight - 400) / 2; if(top < 0) top = 0;
lw = window.open(url + '&popup=1', 'lw', 'resizable=yes,top=' + top + ',left=' + left + ',height=400,width=600,toolbar=no,status=no,scrollbars=yes');
if(lw)
{lw.focus();}
}
function open_report_window(url) {
repw = window.open(url + '&popup=1','repw');
if(repw){repw.focus();}
}
function open_large_window(url) 
{var left = (screen.availWidth - 800) / 2; if(left < 0) left = 0;
var top = (screen.availHeight - 500) / 2; if(top < 0) top = 0;
llw = window.open(url + '&popup=1','llw','resizable=yes,top='+top+',left='+left+',height=500,width=800,toolbar=no,status=yes,scrollbars=yes');
if (llw) { llw.focus(); }
}
function open_large_window2(url) {
var left = (screen.availWidth - 800) / 2; if(left < 0) left = 0;
var top = (screen.availHeight - 500) / 2; if(top < 0) top = 0;
llw2 = window.open(url + '&popup=1','llw2','resizable=yes,top='+top+',left='+left+',height=500,width=800,toolbar=no,status=yes,scrollbars=yes');
if(llw2){llw2.focus();}
}
// field definition functions
function _lookup(field,lookup) {
open_window('/zlookup.aspx?popup=1&field=' + field + '&sqlookup=' + lookup);
}

function _lookupdate(field) {
    var button = this,
        inputField = window[field],
        $ = window.jQuery;

    // jQuery UI
    // ... fallback to jQuery UI if present...
    if ($ && $.ui && $.ui.datepicker && !window.kendo) {
        var supported = _lookupdate._cv_enable_client_side_date_popup;
        var $inputField = $(inputField);

        if (supported === true) {
            // Setup the DatePicker if not already wired up... it should
            // be it is done on document ready! Just in case...
            if ($inputField.data('datepicker') == null) {
                $inputField.datepicker({
                    showOn: button,
                    dateFormat: 'dd-M-yy'
                });
            }

            // Show it!
            $inputField.datepicker("show");

            return;
        }
    }

    // ... otherwise fallback to the zCalendar.aspx Popup
    // WARNING: I think this is SUPPOSED to be GLOBAL!
    dlw = window.open('/zCalendar.aspx?popup=1&field=' + field, 'lw', 'resizable=no,top=200,left=400,height=280,width=250,toolbar=no,status=no,scrollbars=no');

    if (dlw) {
        dlw.focus();
    }
}

// Check if Browser can Support jQuery UI (IE 6 cannot as of jQuery UI 1.10+)
// Kendo UI doesn't support IE6 full stop.
(function () {
    // Kudos: https://gist.github.com/padolsey/527683
    var ieVersion = (function() {
        var undef, v = 3, div = document.createElement('div'), all = div.getElementsByTagName('i');
        while (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[0]);
        return v > 4 ? v : undef;
    }());

    // Supported till proven guilty
    _lookupdate._cv_enable_client_side_date_popup = true;

    // Don't support IE 6...
    if (ieVersion && ieVersion <= 6) {
        _lookupdate._cv_enable_client_side_date_popup = false;
    }
})();

// Kendo UI Date Picker Wireup...
window.jQuery && window.jQuery(function () {
    if (_lookupdate._cv_enable_client_side_date_popup === true && window.kendo) {
        $(".cv-server-date-picker").each(function (i, el) {
            var $el = $(el);

            // Wireup Date Pickers
            if ($el.is("[type=text]")) {
                // Kendo
                if (window.kendo && $el.kendoDatePicker) {
                    var datePicker = $el.data('kendoDatePicker');
                    if (datePicker == null) {
                        $el.kendoDatePicker({
                            format: 'dd-MMM-yyyy'
                        });
                    }
                }
            }

            // Hide the Lookup Button as kendo enhancement results in
            // a button sorta anyway and we really don't need one anyway...
            if ($el.is("[type=button]") || $el.is("[type=submit]")) {
                $el.hide();
            }
        });
    }
});

function MultiSelectLookup(field,lookup,controlid) {
open_window('/zlookup.aspx?popup=1&field=' + field + '&sqlookup=' + lookup + '&multiselect=1&multiselectpostbackcontrolid=' + controlid);
}

//The javascript function that can be called clientside to locate nested server controls that may have different prepended portions
// as part of there final Id when rendered, due to INamingContainer. e.g. usage: var x = GetElementByIdEndsWith("input","tbName").
// Pass in the tagname e.g. 'input' for textboxes, and the control.ClientId
function GetElementByIdEndsWith(tagName, endsWith) {
    var elements = document.getElementsByTagName(tagName);
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].id.endsWith(endsWith)) {
            return elements[i];
        }
    }
    return null;
}
String.prototype.endsWith = function (txt, ignoreCase)
{var rgx;
if (ignoreCase) {
        rgx = new RegExp(txt + '$', 'i');
    }
    else {
        rgx = new RegExp(txt + '$');
    }
    return this.match(rgx) != null;
}

String.prototype.startsWith = function (prefix) {
    return (this.substr(0, prefix.length) === prefix);
}

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
};

