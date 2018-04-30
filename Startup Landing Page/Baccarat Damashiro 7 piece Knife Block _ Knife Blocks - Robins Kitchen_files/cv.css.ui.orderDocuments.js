/// <reference path="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.2-vsdoc.js" />
/// <reference path="http://cdn.kendostatic.com/2012.3.1315/js/kendo.web.min.js" />

/*
Name: cv.css.ui.orderDocuments.js
Author: Sean Craig

Dependencies:
    * jQuery
    * Kendo

Params:
	|| Option || Type || Default Value || Notes ||
*/

;

(function ($, undefined) {
    var orderDocumentsWidget = {
        name: "orderDocuments",
        extend: "mvvmwidget",

        extendEvents: [],

        options: {
            validFileTypes: "",
            triggerMessages: true
        },

        // Called after the widget view is bound to the viewModel.
        viewModelBound: function () {
            var widget = this;
        },

        _getViewModel: function () {
            var widget = this;

            var viewModel = $.extend(kendo.observable(widget.options), {
                fileTypeList: $.grep(widget.options.validFileTypes.toLowerCase().split(","), function (item) { return item !== ""; }),

                onSelect: function (e) {
                    // No file type restrictions.
                    if (this.get("fileTypeList").length === 0) {
                        return;
                    }

                    // Check file extension is allowed.
                    $.each(e.files, function (index, value) {
                        if ($.inArray(value.extension.toLowerCase(), widget.viewModel.get("fileTypeList")) === -1) {
                            e.preventDefault();
                            $.cv.util.notify({
                                triggerMessages: widget.options.triggerMessages,
                                source: widget.name,
                                message: String.format("Invalid file type '{0}', please only upload files of type {1}.", value.extension, widget.options.validFileTypes),
                                type: $.cv.css.messageTypes.error
                            });
                        }
                    });
                }
            });

            return viewModel;
        }
    }

    // Register the widget.
    $.cv.ui.widget(orderDocumentsWidget);
})(jQuery);
