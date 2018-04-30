/// <reference path="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.2-vsdoc.js" />
/// <reference path="http://cdn.kendostatic.com/2012.3.1315/js/kendo.web.min.js" />

/*
Name: cv.css.ui.countrySelect.js
Author: Sean Craig

Dependencies:
    * jQuery
    * Kendo
    * FancyBox
*/

;

(function ($, undefined) {
    var countrySelectWidget = {
        name: "countrySelect",
        extend: "mvvmwidget",

        extendEvents: [],

        options: {
            popupId: "",
            countryCode: "",
            countryDescription: "",

            includeInBrowserHistory: true
        },

        // Called after the widget view is bound to the viewModel.
        viewModelBound: function () {
        },

        _getViewModel: function () {
            var widget = this;

            var viewModel = $.extend(kendo.observable(widget.options), {
                selectedCountryCode: widget.options.countryCode,

                flagClass: function() {
                    return "ico-flag flag-" + widget.viewModel.get("countryCode").toLowerCase();
                },

                confirmClick: function (e) {
                    var countryCode = widget.viewModel.get("selectedCountryCode");

                    //$.fancybox.close();
                    $(e.target).addClass("cv-is-processing");
                    $(e.target.parentElement).find(":input").attr("disabled", true);

                    var params = { countryCode: countryCode };
                    $.cv.util.redirect(window.location.href, params, !widget.options.includeInBrowserHistory);
                },

                cancelClick: function () {
                    $.fancybox.close();
                    widget.viewModel.set("selectedCountryCode", widget.options.countryCode);
                }
            });

            return viewModel;
        }
    };

    // Register the widget.
    $.cv.ui.widget(countrySelectWidget);
})(jQuery);
