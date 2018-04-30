/*
    See confluence page: XXX
*/

;
(function ($, undefined) {

    var mailingListWidget = {

        // Standard Variables

        // widget name
        name: "mailingList",

        // widget extension
        extend: "mvvmwidget",

        // default widget options
        options: {
            // viewModel defaults
            emailAddress: "",
            listId: "",
            // viewModel flags
            autoBind: true,
            // view flags
            triggerMessages: true,
            clearWidgetMessages: true,
            // view text defaults
            subscribeSuccess: "Thank you for signing up",
            unsubscribeSuccess: "We have removed you from our list",
            emailAddressIsEmpty: "Please enter an email address",
            invalidEmailAddress: "{0} is not a valid email",
            errorSubscribing: "We can't sign you up at the moment, please contact us directly if this issue persists",
            errorUnsubscribing: "We can't unsubscribe you up at the moment, please contact us directly if this issue persists"
        },

        // MVVM Support

        // private functions
        _getViewModel: function () {
            var widget = this;
            return widget._getDefaultViewModel();
        },

        _getDefaultViewModel: function () {
            var widget = this;

            var viewModel = kendo.observable($.extend(widget.options, {

                // Properties for UI elements

                emailAddress: widget.options.emailAddress,

                listId: widget.options.listId,
                
                // Private properties

                // UI Element state

                isSubscribing: false,

                isUnsubscribing: false,

                // functions for UI events

                subscribeOnEnter: function (event) {
                    if (event.which == 13) {
                        // stops the form from submitting when using the widget on a page that has form submit buttons
                        event.preventDefault();
                        event.stopPropagation();
                        this.subscribe();
                    }
                },

                /*
                    This calls the subscribe service
                */
                subscribe: function () {
                    var vm = this;
                    if (!vm.get("isSubscribing") && !vm.get("isUnsubscribing")) {
                        if (vm._isEmailComplete()) {
                            vm.set("isSubscribing", true);
                            $.cv.css.mailingList.subscribe({
                                listID: vm.get("listId"),
                                emailAddress: vm.get("emailAddress")
                            }).done(function (msg) {
                                vm._processReturnData(msg, vm.get("subscribeSuccess"), vm.get("errorSubscribing"), "isSubscribing");
                            }).fail(function (data) {
                                $.cv.util.notify(widget.viewModel, vm.get("errorSubscribing"), $.cv.css.messageTypes.error);
                                vm.set("isSubscribing", false);
                            });
                        }
                    }
                },

                /*
                    This calls the unsubscribe service
                */
                unsubscribe: function () {
                    var vm = this;
                    if (!vm.get("isSubscribing") && !vm.get("isUnsubscribing")) {
                        if (vm._isEmailComplete()) {
                            vm.set("isUnsubscribing", true);
                            $.cv.css.mailingList.unsubscribe({
                                listID: vm.get("listId"),
                                emailAddress: vm.get("emailAddress")
                            }).done(function (msg) {
                                vm._processReturnData(msg, vm.get("unsubscribeSuccess"), vm.get("errorUnsubscribing"), "isUnsubscribing");
                            }).fail(function (data) {
                                $.cv.util.notify(widget.viewModel, vm.get("errorUnsubscribing"), $.cv.css.messageTypes.error);
                                vm.set("isUnsubscribing", false);
                            });
                        }
                    }
                },

                /*
                    This processed the returned responses
                */

                _processReturnData: function (msg, successMessage, errorMessage, processingProperty) {
                    var vm = this,
                        data = msg.data,
                        messageType = $.cv.css.messageTypes.success;
                    if (data && data.Success) {
                        $.cv.util.notify(widget.viewModel, successMessage, $.cv.css.messageTypes.success);
                        vm.set("emailAddress", "");
                    } else {
                        $.cv.util.notify(widget.viewModel, errorMessage, $.cv.css.messageTypes.error);
                        messageType = $.cv.css.messageTypes.error;
                    }
                    if (data && data.Messages) {
                        vm._showMessages(data.Messages, messageType);
                    }
                    vm.set(processingProperty, false);
                },

                /*
                    This checks if the entered email address is valid
                */

                _isEmailComplete: function () {
                    var vm = this,
                        valid = true;
                    if (!vm._isValidEmail() || vm.get("emailAddress").length == 0) {
                        vm.get("emailAddress").length == 0 ?
                            $.cv.util.notify(widget.viewModel, vm.get("emailAddressIsEmpty"), $.cv.css.messageTypes.error) :
                            $.cv.util.notify(widget.viewModel, vm.get("invalidEmailAddress").format(vm.get("emailAddress")), $.cv.css.messageTypes.error);
                        valid = false;
                    }
                    return valid;
                },

                /*
                    This checks if the entered email address is valid
                */

                _isValidEmail: function () {
                    var vm = this;
                    return $.cv.util.validateField(vm.get("emailAddress"), "email");
                },

                /*
                    This shows the returned messages
                */

                _showMessages: function (messageArray, messageType) {
                    var vm = this,
                        message = "";
                    $.each(messageArray, function (idx, item) {
                        message += ("<div>" + item + "</div>");
                    });
                    if (message.length > 0) {
                        $.cv.util.notify(widget.viewModel, message, messageType);
                    }
                }

            }));

            viewModel.bind("change", function (e) {
                
            });

            return viewModel;
        },

        _buildViewTemplate: function () {
            var widget = this;
            // future widgets will not use view templates
        }

    };

    // register the widget
    $.cv.ui.widget(mailingListWidget);

})(jQuery);