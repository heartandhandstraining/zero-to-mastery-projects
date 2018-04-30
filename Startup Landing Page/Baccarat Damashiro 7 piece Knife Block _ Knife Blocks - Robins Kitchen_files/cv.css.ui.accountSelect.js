/* Name: account select
 * Author: Aidan Thomas
 * Created: 20130220 
 *
 * Dependencies:    
 *          --- Third Party ---
 *          jquery.js 
 *          kendo.web.js
 *          --- CSS ---
 *          /Scripts/cv.widget.kendo.js
 *          /Scripts/cv.data.kendo.js
 *          /Scripts/cv.ajax.js      
 *          /Scripts/Widgets/cv.ui.cvGrid.js
 * Params:  
 *          accountSearchPageSize - size for the paging or dataSource
 *          all standard cvgrid/kendogrid params
**/

;

(function ($, undefined) {
    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        SELECTED = "selected",
        SUCCESS = "success",
        // Account select modes
        ACCOUNTSELECT = "accountSelectMode",
        ORDERACCOUNTSWITCH = "orderAccountSwitch",
        // Order Merger Options
        HOLD = "Hold",
        MERGE = "Merge",
        DELETE = "Delete",

        qsFilter = $.cv.util.queryStringValue('FilterAccount') || '',

        accountSelect = {
            name: "accountSelect",
            extend: "cvGrid",
            events: [DATABINDING, DATABOUND, SELECTED, SUCCESS],

            options: {
                // Data
                dataSource: $.cv.data.dataSource({
                    method: "customer/accountsearch",
                    params: {
                        searchString: "",
                        queryStringfilter: qsFilter
                    }
                }),

                // View Section Visibility
                // Note: options are included in viewmodel automatically.
                showAccountSelect: true,
                showEnhancedOrderSwitchPrompt: false,
                showConfirmation: false,

                // Events
                selected: function(item) {
                    var widget = this,
                        vm = widget.viewModel,
                        dSetOrderAccount = $.Deferred(),
                        existingAccountCode,
                        codeToChangeTo;

                    vm.set("isProcessing", true);
                    vm.set("isConfirming", true);
                    vm.set("RequiresEnhancedOrderSwitching", false);

                    existingAccountCode =
                        $.cv.css.localGetCurrentAccount() != null ? $.cv.css.localGetCurrentAccount().Code : "";

                    codeToChangeTo = item.Code;

                    vm.set("existingAccountCode", existingAccountCode);
                    vm.set("codeToChangeTo", codeToChangeTo);

                    widget._triggerReload = false;

                    if (widget.options.mode == ORDERACCOUNTSWITCH) {
                        widget._triggerReload = true;
                        // call change order
                        dSetOrderAccount = $.cv.css.orders.changeOrderAccount(codeToChangeTo);
                    } else {
                        // not setting order account, just resolve
                        dSetOrderAccount.resolve();
                    }

                    dSetOrderAccount.done(function (result) {
                        // check data for enhanced handling
                        if (widget.options.mode == ORDERACCOUNTSWITCH) {
                            widget.viewModel.set("isProcessing", false);
                            widget.viewModel.set("isConfirming", false);
                            if (result.data.AdditionalData.RequiresEnhancedOrderSwitching) {
                                var order = result.data.AdditionalData.OldOrderNo,
                                    enhancedSwitchTemplate = 
                                        result.data.AdditionalData.EnhancedOrderSwitchingTemplate;

                                vm.set("RequiresEnhancedOrderSwitching", true);
                                vm.set("order", order);
                                vm.set("enhancedSwitchTemplate", enhancedSwitchTemplate);

                                // append buttons with functions
                                var vModel = new kendo.Observable();
                                vModel.confirm = function () {
                                    vm.set("isProcessing", true);
                                    vm.confirm().done(function() {
                                        vm.set("isProcessing", false);
                                    });
                                };

                                vModel.mergeOrder = function () {
                                    vm.set("selectedOption", MERGE);
                                    this.confirm();
                                };
                                vModel.holdOrder = function () {
                                    vm.set("selectedOption", HOLD);
                                    this.confirm();
                                };
                                // IE < 9 has issues with properties called delete
                                vModel.deleteOrder = function () {
                                    vm.set("selectedOption", DELETE);
                                    this.confirm();
                                };
                                vModel.holdReason = '';

                                vModel.cancelOrder = function () {
                                    // set suffix for success message
                                    $.cv.css.localSetOrderSummaryMessages([widget.options.textOrderAccountSwitchFailureMessage]);
                                    // remove markup/ hide dialog
                                    widget._setAccount(existingAccountCode);
                                };
                                vModel.isProcessing = function () {
                                    return vm.get("isProcessing");
                                };

                                vModel.selectedOption = "";

                                vModel.options = [HOLD,MERGE,DELETE];

                                vModel.selectedOptionIsHold = function() {
                                    return this.get("selectedOption") == HOLD;
                                }

                                // add resources to viewmodel
                                vModel.markup = enhancedSwitchTemplate;
                                vModel.textButtonDelete = widget.options.textButtonDelete;
                                vModel.textButtonCancel = widget.options.textButtonCancel;
                                vModel.textButtonMerge = widget.options.textButtonMerge;
                                vModel.textButtonHold = widget.options.textButtonHold;
                                vModel.bind("change", function (e) {
                                    if (e.field == "selectedOption") {
                                        vm.set("selectedOption", this.get("selectedOption"));
                                    }
                                    if (e.field == "holdReason") {
                                        vm.set("holdReason", this.get("holdReason"));
                                    }
                                });

                                var selectionprompt = widget._formView.find('.enhancedOrderSwitchPrompt');
                                kendo.bind(selectionprompt, vModel);
                            }
                            if (result.data.AdditionalData.RequiresConfirmation) {
                                // Auto-Confirm if enableConfirmation is false... not breaking
                                // previous functioning
                                if (widget.options.enableConfirmation === false) {
                                    vm.confirmChange();

                                    return;
                                }

                                // Explicity Confirmation in Widget
                                vm.set("NotPermittedOnNewAccount", result.data.AdditionalData.NotPermittedOnNewAccount);

                                vm.set("showAccountSelect", false);
                                vm.set("showConfirmation", true);
                            } else {
                                if (result.data.AdditionalData.RequiresEnhancedOrderSwitching) {
                                    vm.set("showAccountSelect", false);
                                    vm.set("showEnhancedOrderSwitchPrompt", true);
                                } else {
                                    vm.confirmChange();
                                }
                            }
                        } else {
                            widget._setAccount(codeToChangeTo);
                        }
                    }).fail(function () {
                        vm.set("isProcessing", false);
                        vm.set("isConfirming", false);
                        vm.setMessage(widget.options.textOrderAccountSwitchFailureMessage,$.cv.css.messageTypes.info);
                    });
                },

                cancelChange: function () {
                    var vm = this;

                    vm.set("showAccountSelect", true);
                    vm.set("showConfirmation", false);
                    vm.set("isProcessing", false);
                },

                NotPermittedOnNewAccount: [],
                RequiresEnhancedOrderSwitching: false,

                // Column Config
                columns: [
                    { field: 'Code', title: 'Code', sortable: true },
                    { field: 'Name', title: 'Name', sortable: true },
                    { field: 'Address1', title: 'Address1', sortable: true }
                ],
                selectOnRowClick: true,

                // Misc. Config
                redirectOnLogin: true,
                redirectUrl: '',
                enableConfirmation: false,
                searchFields: null,
            
                // Modes: Account or order Account...
                modes: { ACCOUNTSELECT: ACCOUNTSELECT, ORDERACCOUNTSWITCH: ORDERACCOUNTSWITCH },
                mode: ACCOUNTSELECT,

                // Heading text to use when in switch order mode
                // ??? OBSOLETE ???
                showAccountSwitchHeading: function () {
                    return _this.options.mode == ORDERACCOUNTSWITCH;
                },

                // Messaging
                clearExistingMessages: false,
                triggerMessages: true,
                setMessage: function (message, type) {
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name
                    });
                },

                // Resources
                textButtonCancel: 'Cancel',
                textButtonMerge: 'Merge',
                textButtonHold: 'Hold',
                textButtonDelete: 'Replace',

                textOrderAccountSwitchMessage: 'The Order has been reassigned to the selected Customer Account.',
                textOrderAccountSwitchFailureMessage: 'The Order is still assigned to the original Customer Account.'
            },

        initialise: function(el, o) {
            var self = this;
            //widget = $(el);
            self._formView = $(el);

        },

        // OVERRIDE: override cvGrid _getViewMode() to 
        // allow widget specific VM items.
        _getViewModel: function () {
            var widget = this,
                vm = $.extend(widget._getDefaultViewModel(), {
                popupClose: function () {
                    vm.set("isProcessing", true);
                    vm.set("isCanceling", true);
                    if (widget._triggerReload) {

                        var existingAccountCode =
                            $.cv.css.localGetCurrentAccount() != null ? $.cv.css.localGetCurrentAccount().Code : "";
                        widget._setAccount(existingAccountCode);
                    } else {
                        $.fancybox.close();

                        vm.set("showAccountSelect", true);
                        vm.set("showConfirmation", false);
                        vm.set("showEnhancedOrderSwitchPrompt", false);
                        vm.set("isProcessing", false);
                        vm.set("isCanceling", false);
                    }
                }
            });

            // Why? Because we need to access _setAccount().... Which we can't from options.
            // in this scenario :o(
            vm.set("confirmChange", function () {
                var code = vm.get("codeToChangeTo");
                // Set isProcessing to stop the buttons being spammed
                vm.set("isProcessing", true);
                vm.set("isConfirming", true);

                if (vm.get("RequiresEnhancedOrderSwitching")) {
                    vm.set("showAccountSelect", false);
                    vm.set("showConfirmation", false);
                    vm.set("showEnhancedOrderSwitchPrompt", true);
                } else {
                    $.cv.css.orders.changeOrderAccount({
                        customerCode: code,
                        confirmChangeCustomer: true
                    }).done(function () {
                        widget._setAccount(code);
                    }).fail(function () {
                        vm.set("isProcessing", false);
                        vm.set("isConfirming", false);
                        vm.setMessage(widget.options.textOrderAccountSwitchFailureMessage,
                            $.cv.css.messageTypes.info);
                    });
                }
            });

            vm.set("confirm",
                function() {
                    var vm = this,
                        action = vm.get("selectedOption"),
                        order = vm.get("order"),
                        existingAccountCode = vm.get("existingAccountCode"),
                        codeToChangeTo = vm.get("codeToChangeTo"),
                        paramsToSend,
                        res = $.Deferred();

                    // Bail out if we have no action or we are missing data.
                    if ($.cv.util.isNotDeclaredOrNullOrWhitespace(action) ||
                        $.cv.util.isNotDeclaredOrNullOrWhitespace(order) ||
                        $.cv.util.isNotDeclaredOrNullOrWhitespace(existingAccountCode) ||
                        $.cv.util.isNotDeclaredOrNullOrWhitespace(codeToChangeTo))
                        return res.resolve();
                    
                    // Set isProcessing to stop the buttons being spammed
                    vm.set("isProcessing", true);
                    vm.set("isConfirming", true);
                    
                    // Populate the param obj
                    paramsToSend = {
                        oldOrderNo: order,
                        oldCustomerCode: existingAccountCode,
                        targetCustomerCode: codeToChangeTo
                    };

                    if (action === HOLD)
                        paramsToSend.reference = this.get('holdReason');
                    
                    res = $.cv.css.orders.enhancedChangeOrderAccount(
                        // For backwards compatability use toLowerCase.
                        action.toLowerCase(),
                        paramsToSend
                    );

                    res.done(function(msg) {
                        if (!msg.errorMessage || msg.errorMessage.length == 0) {
                            // set suffix for success message
                            $.cv.css.localSetOrderSummaryMessages([widget.options.textOrderAccountSwitchMessage]);
                            widget._setAccount(codeToChangeTo);

                            if (!widget.options.redirectOnLogin) {
                                vm.set("isProcessing", false);
                                vm.set("isConfirming", false);
                            }
                        } else {
                            // need to display error, user can cancel or try again
                            widget.viewModel.setMessage(msg.errorMessage, $.cv.css.messageTypes.warning);
                            
                            vm.set("isProcessing", false);
                            vm.set("isConfirming", false);
                        }
                    });

                    // For chaining.
                    return res.promise();
                });

            return vm;
        },

        _triggerReload: false,


        // triggered when about to display the account select widget
        openView: function(mode) {
            var widget = this;
            var vm = widget.viewModel;

            vm.set("showAccountSelect", true);
            vm.set("showConfirmation", false);
            vm.set("isProcessing", false);

                // set mode, if nothing, set account select mode
            if (mode != undefined)
                this.options.mode = mode;
            else
                this.options.mode = ACCOUNTSELECT;
        },

        _setAccount: function (accountCode) {
            var widget = this, localOrderChangedDef = $.Deferred();

            // the set account triggers a get account, 
            // then refreshes the local order data wait for this refresh before redirecting
            $.cv.css.bind($.cv.css.eventnames.localOrderChanged, function() {
                localOrderChangedDef.resolve();
            });

            widget.viewModel.set("isProcessing", true);
            var d1 = $.cv.css.setCurrentAccount(accountCode);
            d1.done(function () {
                // wait on these deferred items then run triggers
                if (widget.options.redirectOnLogin) {
                    $.when(localOrderChangedDef).done(function () {
                        if (widget._triggerReload) {
                            location.reload();
                        } else {
                            if (widget.options.redirectUrl == '')
                                $.cv.util.redirect($(location).attr('href'), null, false);
                            else
                                $.cv.util.redirect(widget.options.redirectUrl, null, false);
                        }
                    });
                } else {
                    var d2 = $.cv.css.getCurrentOrder();
                    var d3 = $.cv.css.getCurrentOrderLines();
                    $.when(d2, d3).always(function (x) {
                        item.parent().trigger(SUCCESS, item);
                        widget.trigger(SUCCESS, item);
                    });
                }
            }).fail(function () {
                widget.viewModel("isProcessing", false);
                widget.viewModel("isConfirming", truefalse);
            });
        }
    };

    $.cv.ui.widget(accountSelect);

})(jQuery);