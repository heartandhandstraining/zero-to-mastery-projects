/// <reference path="/Scripts/jquery-1.8.3.min.js" />

/*
Name: cv.css.ui.copyFavourites.js (use .min.js version for deployment)
Author: Sean Craig

Dependencies:
    <script type="text/javascript" src="/Scripts/jquery-1.8.3.min.js"></script>
    <script type="text/javascript" src="/Scripts/kendo.web-2013.1.319.min.js"></script>

Params:
    Option | Type | Default Value | Notes
*/
;
(function ($, undefined) {
    var ON_BEFORE_COPY = "beforeCopy";
    var ON_AFTER_COPY = "afterCopy";
    
    var copyFavouritesWidget = {
        name: "copyFavourites",
        extend: "mvvmwidget",
        extendEvents: [ON_BEFORE_COPY, ON_AFTER_COPY],

        options: {
            copyTypeControlId: "copyType",
            fromControlId: "from",
            toControlId: "to",
            
            isSiteAdmin: false
        },
        
        // Called after the widget view is bound to the viewModel.
        viewModelBound: function () {
            var widget = this;
        },
        
        _getViewModel: function() {
            var widget = this;

            var viewModel = kendo.observable($.extend(widget.options, {
                copyType: "User",
                from: "",
                to: "",
                
                showValidationErrors: false,

                fromIsInvalid: function () {
                    return viewModel.get("showValidationErrors") ? viewModel.get("from").length == 0 : false;
                },
                
                toIsInvalid: function () {
                    return viewModel.get("showValidationErrors") ? viewModel.get("to").length == 0 : false;
                },
                
                // Functions.
                doCopy: function (e) {
                    e.preventDefault();

                    viewModel.set("showValidationErrors", true);
                    if (viewModel._isFormInvalid()) {
                        return;
                    }

                    widget.trigger(ON_BEFORE_COPY);
                    
                    var p = $.cv.css.copyFavourites.doCopy({
                        copyType: viewModel.get("copyType"),
                        from: viewModel.get("from"),
                        to: viewModel.get("to")
                    });
                    $.when(p).done(function (data) {
                        if (data.data.errorMessage) {
                            viewModel._showMessage({ Type: $.cv.css.messageTypes.error, Message: data.data.errorMessage }, true);
                        } else {
                            viewModel._showMessage({ Type: $.cv.css.messageTypes.success, Message: "Favourites successfully copied." }, true);
                        }
                        
                        widget.trigger(ON_AFTER_COPY);
                    });
                },
                
                // Private functions.
                _showMessage: function (message, clearExisting) {
                    var result = $.cv.css.trigger($.cv.css.eventnames.message, { type: message.Type, message: message.Message, source: widget.name, clearExisting: clearExisting });
                    if (result.handlerCount == 0) {
                        // No widget handled message - display alert.
                        alert(message.Message);
                    }
                },

                _clearMessages: function () {
                    $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: "", source: widget.name, clearExisting: true });
                },
                
                _isFormInvalid: function () {
                    return viewModel._isFormValid() == false;
                },

                _isFormValid: function () {
                    return viewModel.fromIsInvalid() == false &&
						viewModel.toIsInvalid() == false;
                }
            }));

            return viewModel;
        },
        
        _buildViewTemplate: function () {
            var widget = this;
        }
    };

    // Register the widget.
    $.cv.ui.widget(copyFavouritesWidget);
})(jQuery);
