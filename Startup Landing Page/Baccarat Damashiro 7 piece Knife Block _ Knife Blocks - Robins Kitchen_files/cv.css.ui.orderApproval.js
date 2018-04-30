
/**
    Widget:
        Order Approval

    Description:
        Shows and updates users available and selected approver(s) respectively

    Features:
        - Shows list of approval options in different modes
        - Allows selection of approval which automatically

    Documentation:
        http://confluence.commercevision.com.au/x/AQH3B

    Author:
        Justin Wishart: 2014-08-01
        Call: 70507
**/

;

(function ($) {

    // Constants
    //

    var NO_SELECTION = "NO_SELECTION",
        SINGLE_SELECTION = "SINGLE_SELECTION",
        MULTIPLE_SELECTION = "MULTIPLE_SELECTION",

        OPTIONS = 'OPTIONS',
        GROUPS  = 'GROUPS',

        // EVENT NAMES
        APPROVERS_BOUND = 'approversBound';


    // Widget Definition
    //

    var orderApproval = {
        name: "orderApproval",
        extend: "mvvmwidget",


        // Options
        //

        options: {
            modeBindings: {
                'MPA'   : NO_SELECTION,     // Multi Person Auto Selected
                'MPANG' : NO_SELECTION,     // Multi Person Auto Selected No Group
                'MPAS'  : NO_SELECTION,     // Multi Person Auto Single
                'H'     : NO_SELECTION,     // Heirarchical
                'SPA'   : NO_SELECTION,     // Single Person Auto Selected
                'HC'    : NO_SELECTION,     // Hierarchical Customer Budget
                'HAL'   : NO_SELECTION,     // Hierarchical Approval Limits

                'MPU'   : MULTIPLE_SELECTION,    // Multi Person User Selected

                'ADV'   : SINGLE_SELECTION, // Advanced
                'SPU'   : SINGLE_SELECTION, // Single Person User Selected
                'SPUL'  : SINGLE_SELECTION  // Single Person User List
            },

            doNotClearExistingApprovals: false,

            multiSelectThrottleTimeout: 1000, // 1 second by default
            
            // Messages
            //

            noApproverFound: 'Your order cannot be submitted - there is no approver with the authority for an order of this value.',
            genericErrorSettingApprover: 'Unable to set the approver for this order.',
            singleApproverAutoSelected: 'The approver for this order has been automatically selected.',
            noSelectionAutoSelected: 'The approver(s) for this order have been automatically selected.',
            groupAutoSelectMessage: 'The approval group for this order has been automatically selected.'
        },


        // Events
        //

        extendEvents: [
            APPROVERS_BOUND
        ],


        // Methods
        //

        initialise: function () {
            var widget = this,
                vm = widget.viewModel,
                opts = widget.options;

            widget._fetchApprovalOptions();

            // Create throttled version of _setApprovers()
            widget._setApproversThrottled = _.debounce(function() {
                widget._setApprovers(vm.get('selectedApprovers'));
            }, opts.multiSelectThrottleTimeout);
        },

        _triggerSimpleError: function(error) {
            $.cv.css.trigger($.cv.css.eventnames.approvalError, {
                errorMessage: error
            });
        },

        _fetchApprovalOptions: function() {
            var widget = this,
                vm = widget.viewModel,
                opts = widget.options;

            // Reset the Widget
            widget._reset();

            vm.set('isProcessing', true);

            $.cv.css.orderApproval.getApproverOptions({
                doNotClearExisting: opts.doNotDeleteExistingApprovals
            }).done(function(response) {
                var data = response.data;

                // Success
                if (data) {
                    // Extract Values 
                    var willRequireApprovalIfSubmitted = data.WillRequireApprovalIfSubmitted,
                        canBeApproved   = data.CanBeApproved,
                        approvalType    = data.ApprovalType,
                        approvalOptions = data.ApproverOptions,
                        approvalGroups  = data.ApprovalGroups,
                        errorMessage    = data.ErrorMessage,
                        singleResult    = approvalOptions.length === 1;

                    widget._augmentApprovalOptions(approvalOptions);

                    // Assign Data
                    vm.set('isApprovalRequired', willRequireApprovalIfSubmitted || false);

                    if(willRequireApprovalIfSubmitted === true && canBeApproved === false) {
                        vm.set('errorMessage', opts.noApproverFound);

                        widget._triggerSimpleError(opts.noApproverFound);
                    } else if ($.cv.util.hasValue(errorMessage)) {
                        vm.set('errorMessage', errorMessage);

                        widget._triggerSimpleError(errorMessage);
                    } else {
                        vm.set('approvalType', approvalType);

                        // Set DataSource
                        if ($.cv.util.hasValue(approvalOptions) && approvalOptions.length > 0) {
                            // Auto-select single result as no point in getting the user to do it manually
                            if (singleResult) {
                                vm.set('approverAutoSelected', true);
                                vm.set('autoSelectedMessage', opts.singleApproverAutoSelected);

                                widget._setApprovers([approvalOptions[0].ID]);
                            }

                            // Auto-select all approvers as no selection is allowed
                            if (vm.mode() === NO_SELECTION) {
                                vm.set('approverAutoSelected', true);
                                vm.set('autoSelectedMessage', opts.noSelectionAutoSelected);

                                widget._setApprovers(_.map(approvalOptions, function(item) {
                                    return item.ID;
                                }));
                            }

                            // Ensure 'Please Select ..' Message in dropdown modes
                            if (!singleResult && vm.mode() === SINGLE_SELECTION) {
                                approvalOptions.unshift({ID: '', displayValue: 'Please Select ..', FirstName: "", Surname: "", UserId: ""});
                            }

                            // Bind Approval Options
                            vm.set('approvalOptions', approvalOptions);

                            widget.trigger(APPROVERS_BOUND, widget);
                        } else if ($.cv.util.hasValue(approvalGroups) && approvalGroups.length > 0){
                            // Approval Group is automatically selected
                            vm.set('approvalGroups', approvalGroups);

                            vm.set('approverAutoSelected', true);
                            vm.set('autoSelectedMessage', opts.groupAutoSelectMessage);

                            widget._setApprovers(_.map(approvalGroups, function(item) {
                                return item.GroupID;
                            }));
                        }
                    }
                }

                vm.set('isProcessing', false);
            }).fail(function(response) {
                widget._handleFailedDynamicServiceResponse(response);
            });
        },

        _handleFailedDynamicServiceResponse: function(response) {
            var widget = this,
                opts = widget.options,
                vm = widget.viewModel;

            // :o( - have to parse the responseText in fail scenario???
            try {
                response = JSON.parse(response.responseText);

                var errorMessage = opts.errorRetrievingResults + ': ' + response.errorMessage;

                $.cv.css.trigger($.cv.css.eventnames.approvalError, {
                    message: errorMessage
                });
            } catch (d) {}

            vm.set('isProcessing', false);
            widget._isBinding = false;
        },

        _augmentApprovalOptions: function(approvalOptions) {
            var widget = this,
                opts   = widget.options,
                vm     = widget.viewModel;

            if ($.cv.util.hasValue(approvalOptions)) {
                return _.each(approvalOptions, function(opt) {
                    opt.displayValue = opt.FirstName + " " + opt.Surname + " (" + opt.UserId + ")";
                    opt.isSelected = false; // multi-select use.
                });
            }

            return approvalOptions; // Just return what we were sent.
        },

        _setApprovers: function(selectedApproversArray) {
            var widget = this,
                opts = widget.options,
                vm = widget.viewModel,
                areApproversSet = true,
                approversCleared = {}; // $.when() automatically resolves below

            // Preparation: if we have 'Please Select ..' for single selection or 
            // no selected item in Multi-select then we will send an empty approver
            // list and notify the user and other widgets that no approever
            // is selected (payment options for example)
            if ($.cv.util.hasValue(selectedApproversArray) &&
                 (selectedApproversArray.length === 0 ||
                  selectedApproversArray[0] === ''))
            {
                selectedApproversArray = []; // Remove 'Please Select ..' value i.e. ''
                areApproversSet = false;
            }

            // Send the approvers
            $.cv.css.orderApproval.setApproverOptions({
                approverOrGroupIds: selectedApproversArray.join(',')
            }).done(function(response) {
                var data = response.data,
                    approvalError = opts.genericErrorSettingApprover;

                // Success!
                if (data && data.IsSetOk) {
                    $.cv.css.trigger($.cv.css.eventnames.approvalConfirmed);

                    return;
                }

                // No Selected Approvers:
                if (areApproversSet === false) {
                    // NOTE: approversCleared is an empty object by default, $.when() will
                    // consider it like a resolved promise so it will just execute the done
                    // unless we override it with result of _deleteSalesOrderApprovalRecords()
                    $.when(approversCleared).done(function() {
                        $.cv.css.trigger($.cv.css.eventnames.approvalNotSpecified);
                    });

                    return;
                }

                // Error: Specified in the response
                if (data.Message && data.Message.length > 0) {
                    approvalError = data.Message;
                }

                // Notify messages widget and global subscribers.
                $.cv.util.notify(vm, approvalError, $.cv.css.messageTypes.error);

                $.cv.css.trigger($.cv.css.eventnames.approvalError, {
                    message: approvalError
                });
            }).fail(function(response) {
                widget._handleFailedDynamicServiceResponse(response);
            });
        },

        // See the initialisation() method of the widget, this is set to call
        // _setApprovers, but is throttled
        _setApproversThrottled: $.noop,

        _reset: function() {
            var widget = this,
                opts = widget.options,
                vm = widget.viewModel;

            vm.set('approvalType', '');

            vm.set('approvalOptions', []);
            vm.set('approvalGroups',  []);
            vm.set('selectedApprovers', []);

            vm.set('isApprovalRequired', false);

            vm.set('approverAutoSelected', false);
            vm.set('autoSelectedMessage', '');

            vm.set('errorMessage', '');
        },


        // View Model
        //

        _getViewModel: function () {
            var widget = this,
                opts = widget.options;

            var viewModel = kendo.observable($.extend({}, widget.options, {
                isProcessing: false,

                // Data
                approvalType:       '',

                isApprovalRequired: false, // WARNING: Use isVisible() for widget visibility!!!

                approvalOptions:    [],
                approvalGroups:     [],

                // Selected Approver(s)
                selectedApprovers:  [],     // Multiple Selection
                singleSelectedApprover: '', // Single Selection

                approverAutoSelected: false,
                autoSelectedMessage: '',

                errorMessage: '',


                // WARNING: use showNoSelectionSection etc.. for section visibility... NOT this
                // Gets the mode based on the approval type
                // @returns NO_SELECTION | SINGLE_SELECTION | MULTIPLE_SELECTION constant values
                //          depending on the approval type.
                mode: function () {
                    var result = opts.modeBindings[this.get('approvalType')];

                    if ($.cv.util.hasValue(result) === false) {
                        return null;
                    }

                    return result;
                },

                selectApprover: function (e) {
                    var vm = this,
                        approver = e.data,
                        selectedApprovers = vm.get('selectedApprovers');

                    if (vm.mode() === MULTIPLE_SELECTION) {
                        // Multiple Selection
                        // - throttled 
                        // - can add and remove approvers

                        if (approver.isSelected === true) {
                            // Add Approver
                            selectedApprovers.push(approver.ID);
                        } else {
                            // Remove approver
                            selectedApprovers = _.without(selectedApprovers, approver.ID);
                            vm.set('selectedApprovers', selectedApprovers);
                        }

                        widget._setApproversThrottled(selectedApprovers);
                    } else {
                        // Single Selection. Just set the selected approver
                        selectedApprovers = [];
                        selectedApprovers.push(this.get('singleSelectedApprover')); // Might be unset i.e. ''
                        vm.set('selectedApprovers', selectedApprovers);

                        widget._setApprovers(selectedApprovers);
                    }
                },


                // Visibility Related
                //

                isVisible: function() {
                    return this.get('isApprovalRequired') === true ||
                           this.get('errorMessage'); // must be non-empty string
                },


                // Section Visibility
                //

                showNoSelectionSection: function() {
                    var onlyOneOption       = this.get('approverAutoSelected') === true;
                    var haveNoSelectionMode = this.mode() === NO_SELECTION;
                    var haveGroups          = this.shouldDisplayGroups() === true;

                    return onlyOneOption || haveNoSelectionMode || haveGroups;
                },

                showSingleSelectionSection: function() {
                    return this.showNoSelectionSection() === false &&
                           this.mode() === SINGLE_SELECTION;
                },

                showMultipleSelectionSection: function (){
                    return this.showNoSelectionSection() === false &&
                           this.mode() === MULTIPLE_SELECTION;
                },


                // Options or Groups being Displayed?
                //

                shouldDisplayOptions: function () {
                    var options = this.get('approvalOptions');
                    return options && options.length > 0;
                },

                shouldDisplayGroups: function () {
                    var options = this.get('approvalGroups');
                    return options && options.length > 0;
                }
            }));

            return viewModel;
        }
    };

    // Register
    $.cv.ui.widget(orderApproval);

})(jQuery);
