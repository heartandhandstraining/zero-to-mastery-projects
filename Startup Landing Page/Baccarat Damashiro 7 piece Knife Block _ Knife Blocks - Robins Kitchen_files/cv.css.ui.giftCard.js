/**
    Widget:
        gift card

    Description:
        Management of gift cards on an order.

    Features:
        - Add and remove gift cards
        - Viewing of gift cards on the order
        - Order Total with gift cards applied.

    Documentation: http://confluence/x/vQGoAw

    Tests:
        A test runner for tests for this widget can be found here:
        http://localhost:49900/Scripts/widgets/Tests/cv.css.ui.giftCard.spec-runner.html

        The specification code:
        http://localhost:49900/Scripts/widgets/Tests/cv.css.ui.giftCard.spec.js

        Runner & Spec Language: Jasmin

    Author:
        Justin Wishart: 2013-07-31.
        Call: 58559
**/

;

(function ($, undefined) {

    var ADDING_GIFT_CARD          = 'addingGiftCard',
        ADDING_GIFT_CARD_FAILED   = 'addingGiftCardFailed',
        ADDED_GIFT_CARD           = 'addedGiftCard',
        REMOVING_GIFT_CARD        = 'removingGiftCard',
        REMOVING_GIFT_CARD_FAILED = 'removingGiftCardFailed',
        REMOVED_GIFT_CARD         = 'removedGiftCard';

    var giftCardWidget = {
        name:   "giftCard",
        extend: "mvvmwidget",

        options: {
            // Events
            itemTemplate: '',
            defaultSummaryViewVisible: false,
            triggerGlobalMessages: false,

            // Default function for getting the total amount of the order that the gift cards, if 
            // the total gift cards equals or exceeds, then the summary view will be the only
            // view that shows.
            extractOrderTotal: function (order) {
                return order.OrderTotalAmount;
            },

            validationOptions: {}
        },

        extendEvents: [
            ADDING_GIFT_CARD,
            ADDING_GIFT_CARD_FAILED,
            ADDED_GIFT_CARD,
            REMOVING_GIFT_CARD,
            REMOVING_GIFT_CARD_FAILED,
            REMOVED_GIFT_CARD
        ],


        // MVVM Support
        //

        viewModelBound: function () {
            var widget = this;
            var vm = widget.viewModel;

            vm.refreshViewVisibility();

            $.cv.css.bind($.cv.css.eventnames.giftCardsChanged, $.proxy(vm.refreshViewVisibility, vm));
            $.cv.css.bind($.cv.css.eventnames.giftCardRemoved, $.proxy(vm.removeGiftCard, vm));
        },


        // Private function
        //

        _getCurrentCards: function() {
            var widget = this;

            // Generates function to call when item is removed
            var generateRemoveGiftCard = function (cardNo) {
                return function () {
                    widget.viewModel.removeGiftCard(cardNo);
                };
            };
            
            var currentOrder = $.cv.css.localGetCurrentOrder(),
                cards = [];
                
            if (currentOrder) {
                var tempCards = currentOrder.GiftCards || [];

                // Add remove event to each card...
                // MAP to an array instead of leaving as an object also!
                $.each(tempCards, function(i, c) {
                    c.removeGiftCard = generateRemoveGiftCard(c.CardNumber);
                    cards.push(c);
                });
            }

            return cards;
        },

        _getViewModel: function () {
            var widget = this,
                $el = $(widget.element);

            // Determine the type of widget mode/views we have
            var notifyViewExists  = $el.find(".notify-view").length > 0;
            var entryViewExists   = $el.find(".entry-view").length > 0;
            var summaryViewExists = $el.find(".summary-view").length > 0;
            var cards = widget._getCurrentCards();

            var viewModel = kendo.observable({
                // Notify View
                //

                isNotifyViewVisible: notifyViewExists && true,
                doesNotifyViewExist: notifyViewExists,

                showEntryView: function () {
                    viewModel.clearEntryView();

                    viewModel.set('isNotifyViewVisible', false);
                    viewModel.set('isEntryViewVisible', true);
                },


                // Entry View
                //

                isEntryViewVisible: (entryViewExists && !notifyViewExists), // entry view should show by default if not notify view exists
                doesEntryViewExist: entryViewExists,

                // Gift Card Information
                giftCardNumber: '',
                giftCardPin:    '',
                useTotalAmount: false,
                amountToUse: 0,
                isProcessing: false,


                // Event Handlers/Methods
                addGiftCardKeyUp: function (event) {
                    if (event.which == 13) {
                        // stops the form from submitting when using the widget on a page that has form submit buttons
                        event.preventDefault();
                        event.stopPropagation();
                        this.addGiftCard();
                    }
                },

                addGiftCard: function () {
                    var prom = $.Deferred();
                    
                    viewModel.validate();

                    viewModel.set("messages", []);

                    // Only progress if the form is valid.
                    if (viewModel.get('isValid') === true) {
                        $.cv.css.trigger($.cv.css.eventnames.processingGiftCard, { isProcessingGiftCard: true });
                        widget.trigger(ADDING_GIFT_CARD, {cardNumber: viewModel.get('giftCardNumber')});

                        var cardInfo = {
                            cardNumber: viewModel.get('giftCardNumber'),
                            pinNumber: viewModel.get('giftCardPin'),
                            useAllAmount: viewModel.get('useTotalAmount'),
                            amountToUse: viewModel.get('amountToUse')
                        };
                        viewModel.set("isProcessing", true);
                        var addProm = $.cv.css.giftCard.addGiftCard(cardInfo);

                        addProm.done(function (response) {
                            viewModel.set("isProcessing", false);
                            if (response.data.Success === false) {
                                var messages = $.map(response.data.Messages, function (item) {
                                    return {
                                        type: 'error',
                                        message: item
                                    };
                                });

                                viewModel.set('messages', messages);
                                $.each(response.data.Messages, function(idx, item) {
                                    viewModel.setMessage(item, $.cv.css.messageTypes.error);
                                });

                                widget.trigger(ADDING_GIFT_CARD_FAILED, {cardNumber: viewModel.get('giftCardNumber')});
                                $.cv.css.trigger($.cv.css.eventnames.processingGiftCard, { isProcessingGiftCard: false });
                                prom.resolve();
                                return;
                            }

                            // Adjust view model.
                            viewModel.refreshViewVisibility().done(function() {
                                viewModel.clearEntryView();

                                // Trigger Events
                                widget.trigger(ADDED_GIFT_CARD, {cardNumber: viewModel.get('giftCardNumber')});

                                $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                                $.cv.css.trigger($.cv.css.eventnames.giftCardsChanged, {
                                    cardNumber: cardInfo.cardNumber,
                                    changeType: 'add'
                                });

                                // Messages
                                if (widget.options.triggerGlobalMessages) {
                                    $.cv.css.trigger($.cv.css.eventnames.message, {
                                        message: "Gift card added",
                                        type: 'success',
                                        source: 'giftCard',
                                        clearExisting: true
                                    });
                                }

                                viewModel.set('messages', [{ type: 'success', message: 'Gift card added' }]);
                                $.cv.css.trigger($.cv.css.eventnames.processingGiftCard, { isProcessingGiftCard: false });
                                prom.resolve();
                            });
                        });

                        addProm.fail(function () {
                            viewModel.set("isProcessing", false);
                            viewModel.set('messages', [{ type: 'error', value: 'Unknown error while adding gift card' }]);

                            if (widget.options.triggerGlobalMessages) {
                                $.cv.css.trigger($.cv.css.eventnames.message, {
                                    message: "Unknown error while adding gift card",
                                    type: 'error',
                                    source: 'giftCard',
                                    clearExisting: true
                                });
                            }

                            widget.trigger(ADDING_GIFT_CARD_FAILED, {cardNumber: viewModel.get('giftCardNumber')});
                            $.cv.css.trigger($.cv.css.eventnames.processingGiftCard, { isProcessingGiftCard: false });
                            prom.reject();
                        });
                    } else {
                        // Validation messages should show as is.
                        prom.reject();
                    }

                    return prom.promise();
                },

                cancelEntry: function () {
                    viewModel.clearEntryView();

                    viewModel.set('isNotifyViewVisible', true);
                    viewModel.set('isEntryViewVisible', false);
                    viewModel.set('messages', []);
                },

                clearEntryView: function () {
                    viewModel.set('giftCardNumber', '');
                    viewModel.set('giftCardPin', '');
                    viewModel.set('useTotalAmount', false);
                    viewModel.set('amountToUse', 0);
                },


                // Summary View
                //

                isSummaryViewVisible: widget.options.defaultSummaryViewVisible,
                doesSummaryViewExist: summaryViewExists,

                removeGiftCard: function (cardNumber) {
                    var prom = $.Deferred();

                    widget.trigger(REMOVING_GIFT_CARD, {cardNumber: cardNumber});

                    var removeProm = $.cv.css.giftCard.removeGiftCard({cardNumber: cardNumber});

                    removeProm.done(function (response) {
                        if (response.data.Success === false) {
                            var messages = $.map(response.data.Messages, function (item) {
                                return {
                                    type: 'error',
                                    message: item
                                };
                            });

                            viewModel.set('messages', messages);

                            prom.resolve();

                            widget.trigger(REMOVING_GIFT_CARD_FAILED, {cardNumber: cardNumber});

                            return;
                        }

                        viewModel.refreshViewVisibility().done(function() {
                            viewModel.set('messages', [{ type: 'success', message: 'Gift card removed' }]);

                            widget.trigger(REMOVED_GIFT_CARD);

                            $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                            $.cv.css.trigger($.cv.css.eventnames.giftCardsChanged, {
                                cardNumber: cardNumber,
                                changeType: 'remove'
                            });

                            if (widget.options.triggerGlobalMessages) {
                                $.cv.css.trigger($.cv.css.eventnames.message, {
                                    message: "Gift card removed",
                                    type: 'success',
                                    source: 'giftCard',
                                    clearExisting: true
                                });
                            }

                            prom.resolve();
                        });
                    });
                    
                    removeProm.fail(function () {
                        viewModel.set('messages', [{ type: 'error', message: 'Unknown error while removing the gift card' }]);

                        if (widget.options.triggerGlobalMessages) {
                            $.cv.css.trigger($.cv.css.eventnames.message, {
                                message: "Unknown error while adding gift card",
                                type: 'error',
                                source: 'giftCard',
                                clearExisting: true
                            });
                        }

                        widget.trigger(REMOVING_GIFT_CARD_FAILED, {cardNumber: cardNumber});

                        prom.reject();
                    });

                    return prom.promise();
                },

                giftCards: cards,

                orderTotal: 0,
                orderTotalAfterGiftCards: 0,


                // Validation
                //

                isValid: true,

                validate: function () {
                    // Ensure we have validation setup
                    var validator = $el.data("kendoValidator");
                    if (!validator) {
                        $el.kendoValidator(widget.options.validationOptions);
                        validator = $el.data("kendoValidator");

                        // Turn off validation of hidden fields on rules
                        $.cv.util.preventHiddenFieldValidation(validator);
                    }

                    // Validate
                    var isValid = validator.validate();
                    viewModel.set('isValid', isValid);

                    return isValid;
                },


                // General
                //

                messages: [],

                setMessage: function (message, type, triggerMessageOverride) {
                    var triggerMessages = typeof triggerMessageOverride !== 'undefined' ? triggerMessageOverride : widget.options.triggerGlobalMessages;
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: triggerMessages,
                        source: widget.name
                    });
                },

                ensureOrder: function(reload) {
                    var vm = this;
                    var currentOrder = $.cv.css.localGetCurrentOrder();

                    // Reload Order if:
                    // 1. We don't have one stored in Local Storage
                    // 2. If we are asked to (reload = true)
                    var orderExists = $.Deferred();
                    
                    if (!currentOrder || reload) {
                        $.cv.css.getCurrentOrder().done(function() {
                            orderExists.resolve();
                        });
                    } else {
                        orderExists.resolve();
                    }

                    orderExists.done(function() {
                        var currentOrder = $.cv.css.localGetCurrentOrder();
                        var gcs = widget._getCurrentCards();
                        var orderTotal = widget.options.extractOrderTotal(currentOrder);

                        vm.set('giftCards', gcs);
                        vm.set('orderTotal', orderTotal);

                        if (gcs.length > 0) {
                            vm.set('orderTotalAfterGiftCards', currentOrder.TotalPaymentBalanceAfterEnteredGiftCards);
                        } else {
                            vm.set('orderTotalAfterGiftCards', orderTotal);
                        }
                    });

                    return orderExists.promise();
                },

                refreshViewVisibility: function () {
                    var vm = this;
                    var prom = $.Deferred();
                    
                    vm.ensureOrder(true).done(function() {
                        var giftCards = widget._getCurrentCards();
                        var totalAfterGiftCards = viewModel.get('orderTotalAfterGiftCards');

                        var notifyViewExists  = $el.find(".notify-view").length > 0;
                        var entryViewExists   = $el.find(".entry-view").length > 0;
                        var summaryViewExists = $el.find(".summary-view").length > 0;

                        // Total may adjust visibility of notify or edit views
                        if (totalAfterGiftCards <= 0) {
                            viewModel.set('wasNotifyViewLastVisible',viewModel.get('isNotifyViewVisible'));
                            viewModel.set('isNotifyViewVisible', false);
                            viewModel.set('isEntryViewVisible', false);
                        } else {
                            var notify = viewModel.get('wasNotifyViewLastVisible');

                            if (notify != null) {
                                viewModel.set('isNotifyViewVisible', notify);
                                viewModel.set('isEntryViewVisible', !notify);

                                if (!notify) {
                                    viewModel.set("messages", []);
                                }
                            }
                        }

                        viewModel.set('isSummaryViewVisible', 
                            summaryViewExists && (widget.options.defaultSummaryViewVisible === true 
                                                  || (giftCards && giftCards.length > 0)));

                        prom.resolve();
                    });

                    return prom;
                }

            });

            viewModel.bind("change", function (e) {
                if (e.field === 'useTotalAmount') {
                    viewModel.set("amountToUse", 0);
                }
            });

            $.cv.css.bind($.cv.css.eventnames.orderChanged, function (order) {
                if (order === true) {
                    viewModel.ensureOrder(true);
                    viewModel.refreshViewVisibility();
                    return;
                }
                
                if (order == null) {
                    return;
                }

                var gcs = widget._getCurrentCards();
                if (gcs.length > 0) {
                    viewModel.set("orderTotalAfterGiftCards", order.TotalPaymentBalanceAfterEnteredGiftCards);
                } else {
                    viewModel.set("orderTotalAfterGiftCards", order.OrderTotalAmount);
                }
            });

            return viewModel;
        },

        _buildViewTemplate: function () {
            var widget = this;
            widget.viewTemplate = "";
        }

    };

    // register the widget
    $.cv.ui.widget(giftCardWidget);

})(jQuery);
