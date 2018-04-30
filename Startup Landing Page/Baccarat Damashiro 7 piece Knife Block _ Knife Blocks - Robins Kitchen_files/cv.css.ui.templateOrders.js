/**
    Widget:
        Template Orders

    Description:
        Allows view, management and use of Template Orders

    Features:
        - Lists Template Orders available to the user
        - Allowed viewing and management of lines on the template orders
        - Functionality like adding to your current order, resequencing lines, repricing etc.
        
    Documentation:
        http://confluence.commercevision.com.au/x/BwSzB

    Author:
        Justin Wishart: 2014-03-10
        Call: 66645
**/

;

(function ($) {

    // Constants
    //

    var WIDGET_MODE_ORDERS = "orders",
        WIDGET_MODE_LINES = "lines";

    // Event specific constants
    var LOADING = "loading",
        LOADING_COMPLETE = "loadingComplete",
        TEMPLATE_ORDERS_UPDATED = "templateOrdersUpdated",
        BEFORE_VIEW_LINES = "beforeViewLines",
        AFTER_VIEW_LINES = "afterViewLines",
        BEFORE_BACK = "beforeBack",
        AFTER_BACK = "afterBack",
        BEFORE_PRINT_OPENED = "beforePrintOpened",
        BEFORE_ADD_TO_TEMPLATE_ORDER = "beforeAddToTemplateOrder",
        AFTER_ADD_TO_TEMPLATE_ORDER = "afterAddToTemplateOrder",
        BEFORE_REPRICE = "beforeReprice",
        AFTER_REPRICE = "afterReprice",
        BEFORE_DELETE_ORDER = "beforeDeleteOrder",
        AFTER_DELETE_ORDER = "afterDeleteOrder",
        BEFORE_REMOVE_ALL_LINES = "beforeRemoveAllLines",
        AFTER_REMOVE_ALL_LINES = "afterRemoveAllLines",
        BEFORE_UPDATE_TEMPLATE_ORDER = "beforeUpdateTemplateOrder",
        AFTER_UPDATE_TEMPLATE_ORDER = "afterUpdateTemplateOrder",
        BEFORE_ADD_LINES_TO_CART = "beforeAddLinesToCart",
        AFTER_ADD_LINES_TO_CART = "afterAddLinesToCart",
        AFTER_RESEQUENCE = "afterResequence";


    // Widget Definition
    //

    var templateOrders = {
        name: "templateOrders",
        extend: "mvvmwidget",


        // Options
        //

        options: {
            // DataSource Configuration
            dataSource: [],
            autoBind: true,

            // Message Options
            triggerMessages: true, // Allows SetMessage to work with Message Widget
            recordsPerPage: 10,
            clearWidgetMessages: true,
            allowDecimals: false,
            canEditCurrentOrder: false,
            allowCreationOfCompanyOrderTemplates: false,
            allowCreationOfRoleOrderTemplates: false,
            usePleaseSelectForTemplateNames: false,
            enableImmediateTemplateReprice: false,
            hasOrderLines: false,
            isMobile: false,
            autoScrollToTop: true,
            showCostCentreSelectList: false,
            costCentres: [],
            scrollContainer: "body",
            scrollTarget: "html,body",

            // Resources
            confirmDeleteMessage: "Are you sure you want to delete the '{0}' template?",
            confirmDeleteAllMessage: "Are you sure you want to delete ALL templates?",

            deleteOrderTemplateSuccessMessage: "The '{0}' template was successfully deleted.",
            deleteOrderTemplateFailureMessage: "Unable to delete the '{0}' template.",

            immediateRepriceNotEnabledMessage: "Pricing for products on the '{0}' template may have changed. Please click the [Re-Price] button to update pricing.",
            repriceOrderTemplateSuccessMessage: "Pricing for the '{0}' template was successfully updated.",
            repriceOrderTemplateFailureMessage: "Unable to re-price the '{0}' template.",

            addProductSuccessMessage: "Product '{0}' has been added to the template.",
            addProductFailureMessage: "Unable to add product '{0}' to the template - ",
            addProductErrorMessage: "We're sorry. There was an error adding product '{0}' to the template. Please try again.",
            addProductRequiredSearchTerm: "Please enter either a search term, or a product code to add to the template.",

            viewOrder_LoadErrorMessage: "We're sorry. There was an error loading the '{0}' template. Please try again.",
            orderTemplateContainsNoLines: "The '{0}' template has no lines to display",

            confirmRemoveAllLinesMessage: "Are you sure you want to remove all lines from the \'{0}\' template?",
            removeAllLinesSuccessMessage: "All lines were successfully removed from the \'{0}\' template.",
            removeAllLinesFailureMessage: "Unable to remove all lines from the \'{0}\' template.",

            unsavedChangesReversedMessage: "All unsaved changes have now been reversed.",

            updateTemplateOrderSuccessMessage: "The \'{0}\' template has been successfully updated.",
            updateTemplateOrderFailureMessage: "We're sorry. There was an error updating the \'{0}\' template. Please try again.",

            addLinesToCartSuccessMessage: "The products from the \'{0}\' template have now been added to your cart.",
            addLinesToCartSuccessMessageNoItems: "",
            successMessageAndReturnMessageSpacer: "<br /><br />",
            noItemsAddedReturnMessage: "No items have been added to your cart.",
            addLinesToCartFailureMessage: "We're sorry. There was an error copying products from the \'{0}\' template to your cart. Please try again.",

            backToOrdersDoYouWantToSaveYourOrderMessage: "Your \'{0}\' template contains unsaved changes. Would you like to save them before returning to the Order Template List?",

            loadUserTemplatesFailureMessage: "We're sorry. There was an error loading eligible templates to Append or Overwrite. Please try again.",
            templateNameInvalidMessage: "The Template Name is either missing or invalid. Please correct and try again.",
            selectedTemplateInvalidMessage: "The template you selected is either missing or invalid. Please try another.",
            createUserTemplatesFailureMessage: "Unable to save the template. {0}",
            confirmClearQuantitiesMessage: "Are you sure you want to reset all line quantities to zero?",

            requestQuoteUrl: "/OrderComplete.aspx?type=quote",

            itemsResequenced: "Line sequence updated",

            // Print Order Line Options
            printOrderUri: '/PrintOrder.aspx?DisplayOrder={0}&OrderSuffix={1}&popup=1',
            openPrintOrderPage: function (orderNo, orderSuffix) {
                if (orderNo) {
                    // SoBoSuffix Might Not Exist
                    if (orderSuffix == null) {
                        orderSuffix = '';
                    }

                    // Just in case for some odd reason a space is given for the suffix
                    // (i.e. from pronto)
                    if ($.type(orderSuffix) === 'string' && $.trim(orderSuffix) === '') {
                        orderSuffix = '';
                    }

                    var uri = $.cv.util.string.format(this.printOrderUri, orderNo, orderSuffix);
                    window.open(uri);
                }
            },

            setQtyAutomatically: true, // Whether server will determine the best qty on add to order
            // if false, then you MUST bind the addProductQuantity
            // ViewModel value to a quantity box in the View.
            // or have a default add product quantity > 0
            defaultAddProductQuantity: 1,

            showCostCentreEntryField: false, // ** SEE: WidgetSettings.templateOrders.showCostCentreEntryField
            // Allows Hiding/Showing of Cost Centres,

            // Generic Confirm method
            // Context contains:
            // - widget - a reference to the widget
            // - viewModel - a reference to the view model
            // - message - the message to show
            // - scenario - a string indicating what context the confirm is for 
            //   *** NOTE: the scenario ought to matc hthe confirmHandlers key! ***
            confirm: function (context) {
                return this.confirmHandlers[context.scenario](context);
            },

            // Confirm Handlers - DEFAULT IMPLEMENTATION
            // These likely need to be overridden in normal implementation, this is just
            // here as default/fallback behaviour.. see below for how to customize
            confirmHandlers: {
                "deleteOrder": function (context) {
                    var p = $.Deferred();
                    p.resolve(window.confirm(context.message));
                    return p.promise();
                },
                "removeAllLines": function (context) {
                    var p = $.Deferred();
                    p.resolve(window.confirm(context.message));
                    return p.promise();
                },
                "returnToOrderList": function (context) {
                    var p = $.Deferred();
                    p.resolve(window.confirm(context.message));
                    return p.promise();
                },
                "clearLineQuantities": function (context) {
                    var p = $.Deferred();
                    p.resolve(window.confirm(context.message));
                    return p.promise();
                }
            }

            // Below is an example of html that might be used to provide 
            // some form of confirmation dialog (note that this is REALLY simple
            // and just to show how this works)
            // 
            // The HTML would be: 
            //  <div id="confirm" style="display: none; position: absolute; top: 500px; left: 500px;  border: 1px solid gold; background: #369; color: white; padding: 50px;">
            //      <span id="confirm-message"></span>
            //       <div>
            //           <a class="btn cv-ico-general-checkmark green small search" id="confirm" href="javascript:void(0);">Yup</a>
            //           <a class="btn cv-ico-general-cross red small search" id="deny" href="javascript:void(0);">NOOOOOO!</a>
            //       </div>
            //  </div>
            // 
            // When you would override the confirmHandlers like this:
            // Note: that the THERE_ALL_THE_SAME key is just used to
            // keep the code in one place, but you could provide individual
            // implementation if you needed to for each scenario.
            // 
            // confirmHandlers: {
            //     "THERE_ALL_THE_SAME": function (context) {
            //         var p = $.Deferred();
            // 
            //         var confirm = $("#confirm");
            //         confirm.show();
            //         confirm.find("#confirm-message").html(context.message);
            // 
            //         confirm.find("#confirm").click(function () {
            //             confirm.hide();
            //             p.resolve(true);
            //         });
            // 
            //         confirm.find("#deny").click(function () {
            //             confirm.hide();
            //             p.resolve(false);
            //         });
            // 
            //         return p.promise();
            //     },
            //     "deleteOrder": function (context) {
            //         return this["THERE_ALL_THE_SAME"](context);
            //     },
            //     "removeAllLines": function (context) {
            //         return this["THERE_ALL_THE_SAME"](context);
            //     },
            //     "returnToOrderList": function (context) {
            //         return this["THERE_ALL_THE_SAME"](context);
            //     }
            // }
        },


        // Events
        //

        extendEvents: [
            LOADING,
            LOADING_COMPLETE,

            // Template Orders
            TEMPLATE_ORDERS_UPDATED,

            BEFORE_VIEW_LINES,
            AFTER_VIEW_LINES,

            // Lines
            BEFORE_BACK,
            AFTER_BACK,

            BEFORE_ADD_TO_TEMPLATE_ORDER,
            AFTER_ADD_TO_TEMPLATE_ORDER,

            BEFORE_REPRICE,
            AFTER_REPRICE,

            BEFORE_DELETE_ORDER,
            AFTER_DELETE_ORDER,

            BEFORE_PRINT_OPENED,

            BEFORE_REMOVE_ALL_LINES,
            AFTER_REMOVE_ALL_LINES,

            BEFORE_UPDATE_TEMPLATE_ORDER,
            AFTER_UPDATE_TEMPLATE_ORDER,

            BEFORE_ADD_LINES_TO_CART,
            AFTER_ADD_LINES_TO_CART,

            AFTER_RESEQUENCE
        ],


        // Widget State
        //

        _mode: WIDGET_MODE_ORDERS,


        // Methods
        //

        initDataSource: function () {
            var widget = this,
                vm = widget.viewModel;

            // Par Value Mode?
            // Change headers and columns on lines.
            var isParValueMode = $.cv.util.queryStringValue("ParValueOrderMode") === "true";

            vm.set("isParValueMode", isParValueMode);

            // Setup any DataSources and load Cost Centres
            widget._setupTemplateOrderDataSource(isParValueMode);
            widget._setupProductSearchDataSource();
            //widget._setupAvailableCostCentres();
        },


        // Private Methods
        //

        // Setup Product Search DataSource used on lines for autocomplete add to template functionality
        _setupProductSearchDataSource: function () {
            var widget = this,
                vm = widget.viewModel,
                dataSource = $.cv.data.dataSource({
                    method: "products/productSearch",
                    params: widget._constructProductSearchParamsFunction()
                });

            vm.set("productSearchDataSource", dataSource);
        },

        _constructProductSearchParamsFunction: function () {
            var widget = this,
                vm = widget.viewModel;

            return (function (options, type) {
                // This function is called whenever the service is called with
                // options set at that point

                /******************************************************
                 * We take the filter.filters[0].value which the autocomplete 
                 * widget sets as we can't get the value from the VM as it
                 * has not been set yet. We then clear the filters so that
                 * EXTRA filtering doesn't occur after the search, but instead 
                 * the service method just does a search.
                 *******************************************************/
                var val = options.filter.filters[0].value;

                val = $.trim(val); // prevents sending of whitespace which breaks the search

                var result = {
                    searchString: val,
                    searchType: 'contains',

                    skipArg: 0,
                    takeArg: 10
                };

                // Delete filters as we just want to do a search.
                delete options.filter;

                return result;
            });
        },

        // Setup Template Orders Data Source (ACTUAL WIDGET DATA SOURCE!)
        _setupTemplateOrderDataSource: function (isParValueMode) {
            var widget = this,
                serviceMethod = isParValueMode === true ?
                                    'orderTemplate/GetParValueOrderTemplatesForUser' :
                                    'orderTemplate/GetOrderTemplatesForUser';

            var dataSource = $.cv.data.dataSource({
                method: serviceMethod,
                params: widget._constructOrderParamsFunction(),
                pageSize: widget.options.recordsPerPage
            });

            dataSource.bind("requestStart", widget.viewModel.dataSourceBinding);
            dataSource.bind("requestEnd", widget.viewModel.dataSourceBound);

            widget.setDataSource(dataSource);
        },

        _constructOrderParamsFunction: function () {
            var widget = this,
                vm = widget.viewModel;

            var order = $.cv.util.queryStringValue("order");
            if (order && order.length > 0) {
                $.cv.util.clearNotifications(vm);
                vm._viewOrder_Internal(order);
            }

            return (function () {
                // This function is called whenever the service is called with
                // options set at that point
                var role = $.cv.util.queryStringValue("role");
                var orderFilter = vm.get("orderFilter");
                var sortColumn = vm.get("sortColumn");
                var sortDirection = vm.get("sortDirection");
                var result = {
                    filter: {
                        filters: []
                    },
                    sort: [
                        { field: sortColumn, dir: sortDirection }
                    ]
                };

                if (orderFilter.trim().length > 0) {
                    result.filter.filters.push({ field: "SoCustReference", operator: "contains", value: orderFilter });
                }

                if ($.cv.util.hasValue(role)) {
                    result.filter.filters.push({ field: "UserRoleWhenOrderTemplate", operator: "contains", value: role });
                }

                if (result.filter.filters.length > 1) {
                    result.filter.logic = "and";
                }

                return result;
            });
        },

        // Massage line data before binding. Does 2 things:
        // - assigns all note lines for a given line to the relevant stock line.
        // - removes non-stock lines (like note lines)
        _preBindingLineModification: function (vm, lines) {
            // Extract Line Notes! (as opposed to note lines which stay there!)
            var notes = _.filter(lines, function (d) {
                return d.LineType &&
                       d.LineType === "DN" &&
                       d.LineSeq % 1 !== 0 &&  // <- only get note lines, i.e. not real number line sequences..
                       d.Description &&
                       d.Description.length > 0;
            });

            // Map them into simple objects
            notes = _.map(notes, function (d) {
                return {
                    LineSeq: parseInt(d.LineSeq, 10), // All items will have the same LineSeq now for parent line
                    Description: d.Description
                };
            });

            // Reduce them to sequence with description accumulated
            notes = _.groupBy(notes, 'LineSeq');

            // After the following map&reduce we ought to have an array 
            // with items structured like this...
            // {
            //    LineSeq: 1,
            //    Description: "concatenated notes for all DN lines for product line with sequence 1"
            // }
            // ... where there is only one item per product line and the Descriptions have been
            // concatenated together.
            notes = _.map(notes, function (groupItems) {
                return _.reduce(groupItems, function (result, value) {
                    result.LineSeq = value.LineSeq;

                    if (result.Description == null) {
                        result.Description = '';
                    }

                    result.Description += " " + value.Description;

                    return result;
                }, {});
            });

            // Ensure lines only contains stock lines... (bar Note Lines which are allowed!)
            lines = _.filter(lines, function (d) {
                return d.LineType &&
                       // Note Line
                       (d.LineType === "DN" && d.LineSeq % 1 === 0) ||
                       // Stock Line
                       (d.LineType === "SN" &&
                        d.Product &&
                        $.type(d.Product) === 'array' &&
                        d.Product.length === 1);
            });

            var isParValueMode = vm.get("isParValueMode");
            // Put concatenated note lines into Extended Line Description field related product lines
            _.each(lines, function (d, index) {
                d.index = index;
                d.disableView = false;
                // find note entry for this line
                var notesEntry = _.find(notes, function (n) {
                    return n.LineSeq === d.LineSeq;
                });

                if (notesEntry != null) {
                    d.ExtendedLineDescription = $.trim(notesEntry.Description);
                }

                d.isParValueTemplateOrder = isParValueMode;
                // For deletion and resequence bindings...
                d.isDeleteChecked = false;
                d.newLineSeq = d.LineSeq;
                d.prevLineSeq = d.LineSeq; // Used for resequencing as we can't get old value... needs to be kept up to date..

                d.toggleDeleted = function (e) {
                    $.cv.util.toggleCvCheckboxValue(e, this, "isDeleteChecked");
                };
                d.lastValidQuantity = d.OrderedQty;

                d.packQuantityTarget = "Product[0].PackQty",
                d.quantityTarget = "OrderedQty",

                d.increaseQty = function () {
                    $.cv.util.kendoNumericTextBoxIncrease(this);
                };

                d.decreaseQty = function () {
                    $.cv.util.kendoNumericTextBoxDecrease(this, 0);
                };

                d.increaseQtyOnHand = function () {
                    $.cv.util.kendoNumericTextBoxIncrease(this, "qtyOnHand");
                };

                d.decreaseQtyOnHand = function () {
                    $.cv.util.kendoNumericTextBoxDecrease(this, 0, "qtyOnHand");
                };

                d.changeExtendedLineDescription = function (e) {
                    vm.changeExtendedLineDescription(e);
                };
                
                d.qtyOnHand = "";
            });

            return lines;
        },

        _constructLineParamsFunction: function () {
            var widget = this,
                vm = widget.viewModel;

            return (function () {
                // This function is called whenever the service is called with
                // options set at that point
                var result = {
                    sort: [
                        { field: 'LineSeq', dir: "asc" }
                    ],
                    take: 5000, // need to make this paged with an option

                    soOrderNo: vm.get("orderNo")
                };
                return result;
            });
        },

        _generateResequenceOptions: function (lines) {
            // We need data to bind to select element used 
            // for resequencing lines. This generates the correct number of options
            // for binding.
            var lineCount = lines.length,
                response = [],
                i;

            for (i = 0; i < lineCount; i += 1) {
                response.push({
                    Option: i + 1
                });
            }

            return response;
        },

        _scrollPage: function () {
            var widget = this,
                scrollContainer = widget.options.scrollContainer.length > 0 ? widget.options.scrollContainer : widget.options.replaceContainer;
            if (widget.options.autoScrollToTop && scrollContainer != "") {
                $(widget.options.scrollTarget).animate({ scrollTop: $(scrollContainer).offset().top }, widget.options.scrollSpeed);
            }
        },

        // View Model
        //

        _getViewModel: function () {
            var widget = this;
            return widget._getDefaultViewModel();
        },

        _getDefaultViewModel: function () {
            var widget = this;

            var getDataView = function () {
                if (!widget.dataSource)
                    return [];

                var data = widget.dataSource.data();

                $.each(data, function (idx, item) {
                    // _.each can iterate all fields on an object... so this is ok....
                    item.index = idx;
                    item._isLastRow = false;
                    item.isLoadingOrderLine = false;
                    item.viewOrder = function () {
                        viewModel.viewOrder(item);
                    };
                });

                // ... but we can't use _.last() because object has no
                // "last" item as such... have to do this more manually.
                if (data.length > 0 && data[data.length - 1] != null) {
                    data[data.length - 1].set("_isLastRow", true); // Used for Styling
                }

                return data;
            };

            var viewModel = kendo.observable($.extend({}, widget.options, {

                // State Information
                //

                mode: WIDGET_MODE_ORDERS,

                isOrdersMode: function () {
                    return this.get("mode") === WIDGET_MODE_ORDERS;
                },

                isLinesMode: function () {
                    return this.get("mode") === WIDGET_MODE_LINES;
                },

                isProcessingOrderTemplates: function () {
                    return this.get("isFilteringOrders") === true ||
                           this.get("isClearingFilter") === true ||
                           this.get("isLoadingOrderLines") === true ||
                           this.get("isDeletingOrder") === true ||
                           this.get("isRemovingAllLines") === true ||
                           this.get("isResequencingLines") === true ||
                           this.get("isRepricingOrder") === true ||
                           this.get("isAddingProduct") === true ||
                           this.get("isAddingLinesToCart") === true ||
                           this.get("isSavingOrder") === true ||
                           this.get("isDataSourceBinding") === true ||
                           this.get("isSavingTemplate") === true ||
                           this.get("isUndoing") === true ||
                           this.get("isClearingQtys") === true ||
                           this.get("isSortingOrders") === true;
                },

                isFilteringOrders: false,
                isClearingFilter: false,
                isLoadingOrderLines: false,
                isDeletingOrder: false,
                isRemovingAllLines: false,
                isResequencingLines: false,
                isRepricingOrder: false,
                isAddingProduct: false,
                isAddingLinesToCart: false,
                isSavingOrder: false,
                isSavingTemplate: false,
                isUndoing: false,
                isClearingQtys: false,

                actionIsSave: false,
                saveTemplateType: "",
                saveTypeValue: "create",
                saveTypeIsCreate: function () { return this.get("saveTypeValue") === "create"; },
                saveTypeIsAppend: function () { return this.get("saveTypeValue") === "append"; },
                saveTypeIsOverwrite: function () { return this.get("saveTypeValue") === "overwrite"; },
                saveTemplateName: "",
                saveIsCompanyTemplate: false,
                saveIsRoleTemplate: false,
                saveTemplateList: [],
                saveTemplateListValue: "",
                saveTemplateNameInvalid: false,
                saveSelectedTemplateInvalid: false,

                isDataSourceBinding: false,

                dataSourceBinding: function () {
                    viewModel.set("isDataSourceBinding", true);
                },

                dataSourceBound: function () {
                    viewModel.set("isDataSourceBinding", false);
                    viewModel.set("isSortingOrders", false);
                },

                changeExtendedLineDescription: function(e) {
                    var vm = this;
                    if (e.srcElement.value !== e.data.ExtendedLineDescription) {
                        e.data.ExtendedLineDescription = e.srcElement.value;
                        vm.set("isLineDataDirty", true);
                    }
                },

                saveButtonClick: function (e) {
                    var vm = this;

                    // Validate.
                    vm.set("isSavingTemplate", true);
                    var ok = this._actionValidate();
                    if (ok) {
                        var params = {
                            saveMode: vm.get("saveTypeValue"),
                            templateName: vm.get("saveTemplateName"),
                            isCompanyTemplate: vm.get("saveIsCompanyTemplate"),
                            isRoleTemplate: vm.get("saveIsRoleTemplate"),
                            templateType: vm.get("saveTemplateType"),
                            selectedTemplate: vm.get("saveTemplateListValue")
                        };

                        $.cv.css.orderTemplate.createNewTemplateForUser(params).done(function (response) {
                            if (response.data.Success) {
                                $.cv.util.notify(vm, response.data.Message, $.cv.css.messageTypes.success);
                                widget.dataSource.fetch();
                                vm.set("actionIsSave", false);
                            } else {
                                var message = $.cv.util.string.format(widget.options.createUserTemplatesFailureMessage, response.data.Message);
                                $.cv.util.notify(vm, message, $.cv.css.messageTypes.error);
                            }
                            vm.set("isSavingTemplate", false);
                        }).fail(function () {
                            var message = $.cv.util.string.format(widget.options.createUserTemplatesFailureMessage, "call failed");
                            $.cv.util.notify(vm, message, $.cv.css.messageTypes.error);
                            vm.set("isSavingTemplate", false);
                        });
                    } else {
                        vm.set("isSavingTemplate", false);
                    }
                },

                _actionValidate: function () {
                    var ok = true;

                    this.set("saveTemplateNameInvalid", false);
                    this.set("saveSelectedTemplateInvalid", false);

                    if (this.saveTypeIsCreate() == true) {
                        // Make sure 'template name' is filled in.
                        if (this.get("saveTemplateName") == "") {
                            $.cv.util.notify(viewModel, widget.options.templateNameInvalidMessage, $.cv.css.messageTypes.error);
                            this.set("saveTemplateNameInvalid", true);
                            ok = false;
                        }
                    } else {
                        // Make sure a template has been selected.
                        if (this.get("saveTemplateListValue") == "") {
                            $.cv.util.notify(viewModel, widget.options.selectedTemplateInvalidMessage, $.cv.css.messageTypes.error);
                            this.set("saveSelectedTemplateInvalid", true);
                            ok = false;
                        }
                    }

                    return ok;
                },

                requestQuote: function (e) {
                    var p = this.addAllLinesToCart(e);
                    $.when(p).done(function (response) {
                        if (response.data.message != widget.options.noItemsAddedReturnMessage) {
                            $.cv.util.redirect(widget.options.requestQuoteUrl);
                        }
                    });
                },

                // Data Source Handling
                //

                updateViewModelFromDataSource: function () {
                    // Only called for WIDGET_MODE_ORDERS...
                    var data = getDataView();

                    this.set("orderData", data);

                    widget.trigger(TEMPLATE_ORDERS_UPDATED, { data: data });
                },


                // Orders
                //

                orderFilter: '',
                orderData: [],

                isSortingOrders: false,
                sortColumn: "TemplateName",
                sortDirection: "asc",

                // (DATA)
                // The template orders or filtered results thereof
                orders: function () {
                    var vm = this,
                        data = vm.get("orderData");

                    if (data == null) {
                        data = [];
                    }

                    return data;
                },

                canEditAnyOrders: function () {
                    var vm = this,
                        data = vm.get("orderData"),
                        items,
                        canEditAnyOrders = false;

                    if (data == null) {
                        data = [];
                    }

                    // Add Calculated Fields/Methods to each item.
                    if (data && data.length > 0) {
                        items = data;
                        canEditAnyOrders = _.filter(items, function (item) { return item.IsTemplateOrderThisUserCanModify; }).length > 0;
                    }
                    return canEditAnyOrders;
                },

                // (EVENT HANDLER) 
                // Triggers filtering of available template orders
                filterOrders: function () {
                    var dataSource = this.get("dataSource");

                    if (this.get("orderFilter").length > 0) {
                        this.set("isFilteringOrders", true);
                    } else {
                        this.set("isClearingFilter", true);
                    }

                    dataSource.page(1);
                    dataSource.fetch(function () {
                        viewModel.set("isFilteringOrders", false);
                        viewModel.set("isClearingFilter", false);
                    });
                },

                // (EVENT HANDLER)
                // Clears the filter and triggers re-load of orders with empty filter.
                clearOrderFilter: function () {
                    this.set("orderFilter", "");

                    this.filterOrders();
                },

                setDisableView: function (value) {
                    var widget = this;

                    if (widget.dataSource) {
                        $.each(widget.dataSource.view(), function (idx, item) {
                            item.set("disableView", value);
                        });
                    }
                },

                // (EVENT HANDLER) 
                // Moves from order view to lines view... viewing the lines for the selected order.
                viewOrder: function (item) {
                    var vm = this;
                    vm.setDisableView(true);
                    $.cv.util.clearNotifications(vm);
                    vm._viewOrder_Internal(item.SoOrderNo, item.TemplateName, item);
                },

                onChange: function (e) {
                    var newIndex = e.newIndex,
                        oldIndex = e.oldIndex,
                        length = widget.viewModel.lines.length,
                        lnAtIndex;

                    widget.viewModel.set("PROCESSING_LINE_SEQUENCES", true);

                    // get the lines
                    var lines = widget.viewModel.get("lines");
                    // clone the lines so that the "splice" method doesn't interfere with the viewModel lines
                    var linesClone = _.map(lines, _.clone);
                    // remove the line
                    var lineToMove = linesClone.splice(oldIndex, 1)[0];
                    // insert back the line
                    linesClone.splice(newIndex, 0, lineToMove);
                    // set the lines
                    widget.viewModel.set("lines", linesClone);
                    // reset the lineSeq for each line
                    for (var j = 0; j < length; j++) {
                        lnAtIndex = widget.viewModel.lines[j];
                        lnAtIndex.set("newLineSeq", j + 1);
                    }

                    widget.viewModel.set("isResequencingLines", false);
                    widget.viewModel.set("PROCESSING_LINE_SEQUENCES", false);
                    widget.viewModel.set("isLineDataDirty", true);
                },

                viewTemplateName: "",

                // (PRIVATE) 
                // Moves from order view to lines view... viewing the lines for the specified order number
                _viewOrder_Internal: function (orderNo, templateName, item) {
                    var vm = this;

                    vm.set("orderNo", orderNo);
                    vm.set("viewTemplateName", templateName);
                    widget.trigger(BEFORE_VIEW_LINES);

                    var orderNoOrtemplateName = !$.cv.util.isNullOrWhitespace(templateName) ? templateName : orderNo;
                    _.extend($.cv.css._proxyMeta, { templateName: orderNoOrtemplateName }, $.cv.util.getBaseProxyMeta(widget));
                   
                    // Load the order 
                    return $.cv.css.orderTemplate.getTemplateOrder({
                        soOrderNo: orderNo,
                        soBoSuffix: '',
                        restrictToParValueOrders: vm.get("isParValueMode") === true
                    }).done(function (response) {
                        vm.set("currentOrder", response.data[0]);
                        vm.set("canEditCurrentOrder", response.data[0].IsTemplateOrderThisUserCanModify);

                        if ($.cv.util.hasValue(item)) {
                            item.set("isLoadingOrderLine", true);
                        }
                        // trigger a fetch based on above order number.
                        $.cv.css.orderTemplate.loadOrderTemplateLines({
                            orderNo: vm.get("orderNo")
                        }).done(function (msg) {
                            var message;
                            vm.set("mode", WIDGET_MODE_LINES);
                            vm._linesDataSource = msg.data;
                            var lines = msg.data;
                            vm.set("hasOrderLines", lines && lines.length > 0);
                            lines = widget._preBindingLineModification(vm, lines);
                            lines = new kendo.data.ObservableArray(lines);

                            _.each(lines, function (list, index) {
                                list.bind("change", function(e) {
                                    if (e.field == "OrderedQty" && !vm.isQuantityValid(list) && list.get("quantityReset")) {
                                        list.set("quantityReset", false);
                                    }
                                });
                            });

                            vm.set("lines", lines);
                            vm.set("isLineDataDirty", false);
                            lines.bind("change", function () {
                                vm.set("isLineDataDirty", true);
                            });

                            for (var i = 0; i < widget.dataSource._data.length; i++) {
                                widget.dataSource._data[i].set("isLoadingOrderLine", false);
                            }

                            var sortable = widget.element.find('.cv-sortable').data('kendoSortable');
                            if (sortable != null) {
                                sortable.destroy();
                            }

                            widget.element.find('.cv-sortable').kendoSortable({
                                data: viewModel.lines,
                                change: viewModel.onChange,
                                ignore: "input",
                                hint: function (element) {
                                    return element.clone().addClass("hint");
                                },
                                placeholder: function (element) {
                                    return element.clone().addClass("placeholder").text("Place Here");
                                },
                                cursorOffset: {
                                    top: -10,
                                    left: -230
                                }
                            });

                            if (widget.options.enableImmediateTemplateReprice !== true && !widget.viewModel.get("isRepricingOrder") && !widget.viewModel.get("isSavingOrder")) {
                                message = $.cv.util.string.format(widget.options.immediateRepriceNotEnabledMessage, orderNoOrtemplateName);
                                $.cv.util.notify(widget.viewModel, message, $.cv.css.messageTypes.warning);
                            }

                            widget.trigger(AFTER_VIEW_LINES);
                            widget._scrollPage();
                        }).fail(function () {
                            var message = $.cv.util.string.format(widget.options.viewOrder_LoadErrorMessage, orderNoOrtemplateName);
                            $.cv.util.notify(widget.viewModel, message, $.cv.css.messageTypes.error);
                            vm.setDisableView(false);
                        }).always(function () {
                            if ($.cv.util.hasValue(item)) {
                                item.set("isLoadingOrderLine", false);
                            }
                        });
                    }).fail(function () {
                        var message = $.cv.util.string.format(widget.options.viewOrder_LoadErrorMessage, orderNoOrtemplateName);
                        $.cv.util.notify(widget.viewModel, message, $.cv.css.messageTypes.error);
                        vm.setDisableView(false);
                    }).always(function () {
                        vm.set("isLoadingOrderLines", false);
                    });
                },

                // (EVENT HANDLER) 
                // Deletes an individual template order
                deleteOrder: function (e) {
                    var vm = this;

                    e.preventDefault();
                    e.stopPropagation();

                    var order = e.data,
                        wasDeleted = false;

                    var confirmDelete = widget.options.confirm({
                        widget: widget,
                        viewModel: vm,
                        message: widget.options.confirmDeleteMessage.replace("\{0\}", e.data.TemplateName),
                        scenario: "deleteOrder"
                    });

                    confirmDelete.done(function (doDelete) {
                        if (true === doDelete) {
                            vm.set("isDeletingOrder", true);
                            e.data.set("isDeletingSingleOrder", true);
                            widget.trigger(BEFORE_DELETE_ORDER, order);

                            $.cv.css.orderTemplate.deleteOrderTemplate({
                                soOrderNo: order.SoOrderNo,
                                soBoSuffix: order.SoBoSuffix != null ? order.SoBoSuffix : ''
                            }).done(function (response) {
                                if (response.data && $.type(response.data) === 'string' && response.data.indexOf("Error!") !== -1) {
                                    $.cv.util.notify(vm, response.data, $.cv.css.messageTypes.error);
                                    return;
                                }
                                var message = $.cv.util.string.format(widget.options.deleteOrderTemplateSuccessMessage, e.data.TemplateName);
                                $.cv.util.notify(vm, message, $.cv.css.messageTypes.success);

                                // Re-fetch the Template Orders
                                widget.dataSource.fetch();
                            }).fail(function (response) {
                                var message = $.cv.util.string.format(widget.options.deleteOrderTemplateFailureMessage, e.data.TemplateName);
                                $.cv.util.notify(vm, message, $.cv.css.messageTypes.error);
                            }).always(function () {
                                vm.set("isDeletingOrder", false);
                                e.data.set("isDeletingSingleOrder", false);

                                widget.trigger(AFTER_DELETE_ORDER, {
                                    Order: order,
                                    WasDeleted: wasDeleted
                                });
                            });
                        }
                    });

                    return false;
                },


                // Lines
                //

                orderNo: 0,
                currentOrder: null,
                lines: [],
                isLineDataDirty: false,
                lineResequenceOptions: [],
                productSearchTerm: '',
                addProductQuantity: widget.options.defaultAddProductQuantity,
                productSearchDataSource: [],

                //availableCostCentres: [],


                // (PRIVATE) 
                // Gets any data relevant to saving changes to an order template lines
                // in a structure specific to the service for saving.
                _getLineChanges: function () {
                    var lines = this.get("lines"),
                        i,
                        length = lines.length,
                        changes = [],
                        currentLine;

                    for (i = 0; i < length; i += 1) {
                        currentLine = lines[i];

                        changes.push({
                            // Data
                            LineSeq: currentLine.LineSeq,
                            Description: currentLine.Description, // ONLY UPDATES NOTE LINES! Non-Stock-Line DN note
                            StockCode: currentLine.ProductCode,
                            ExtendedLineDescription: currentLine.ExtendedLineDescription,
                            Qty: currentLine.OrderedQty,
                            Resequence: currentLine.newLineSeq,
                            CostCentreCode: currentLine.CostCentreCode,

                            // Meta
                            Delete: currentLine.isDeleteChecked === true
                        });
                    }

                    return changes;
                },

                isAllowedToChangeAndIsDirty: function () {
                    var can = this.get("canEditCurrentOrder");
                    var dirty = this.get("isLineDataDirty");

                    return (can && dirty);
                },

                _getLineQuantities: function () {
                    var lines = this.get("lines"),
                        i,
                        length = lines.length,
                        quantities = [],
                        lineSeq,
                        currentLine,
                        qtyToOrder,
                        qtyOnHand, // used for par value orders only
                        isParValueMode = this.get("isParValueMode") === true;

                    for (i = 0; i < length; i += 1) {
                        currentLine = lines[i];
                        lineSeq = currentLine.LineSeq;
                        qtyToOrder = currentLine.OrderedQty;
                        qtyOnHand = (currentLine.get("qtyOnHand") === undefined || currentLine.get("qtyOnHand") === null || currentLine.get("qtyOnHand") === '') ? qtyToOrder : currentLine.get("qtyOnHand");

                        if (isParValueMode) {
                            // Calculate Qty to get upto Par...
                            if (qtyOnHand != null && qtyOnHand >= 0 && qtyOnHand <= qtyToOrder) {
                                qtyToOrder = qtyToOrder - qtyOnHand; // Required Qty - In Stock Qty = To Order Qty.
                            }
                            else if (qtyOnHand >= qtyToOrder) {
                                qtyToOrder = 0;
                            }
                            quantities.push({
                                LineSeq: lineSeq,
                                Qty: qtyToOrder
                            });
                        } else {
                            quantities.push({
                                LineSeq: lineSeq,
                                Qty: qtyToOrder
                            });
                        }

                    }

                    return quantities;
                },

                isQuantityValid: function (item) {
                    var valid = true, quantity = item.OrderedQty;

                    if (isNaN(quantity) || (!widget.options.allowDecimals && quantity % 1 != 0) || quantity < 0) {
                        valid = false;
                    }
                    if (!valid) {
                        item.set("quantityReset", true);
                        item.set("OrderedQty", item.get("lastValidQuantity"));
                    } else {
                        item.set("lastValidQuantity", quantity);
                    }
                    return valid;
                },

                // (PRIVATE)
                // Prompts the user to update the order if required
                _checkUpdateRequiredBeforeReturnToOrderList: function () {
                    var result = $.Deferred(),
                        vm = this;

                    // If lines are dirty, we need to ask the user to 
                    // confirm that they want to update the order or
                    // just discard changes
                    if (vm.isAllowedToChangeAndIsDirty()) {
                        widget.options.confirm({
                            widget: widget,
                            viewModel: vm,
                            message: $.cv.util.string.format(widget.options.backToOrdersDoYouWantToSaveYourOrderMessage, vm.get("viewTemplateName")),
                            scenario: "returnToOrderList"
                        }).done(function (doSave) {
                            if (true === doSave) {
                                vm._saveOrderLineChanges_Internal(false).always(function() {
                                    result.resolve();
                                });
                            } else {
                                result.resolve();
                            }
                        });
                    } else {
                        result.resolve();
                    }

                    return result.promise();
                },

                // (EVENT HANDLER)
                // Moves from Lines view to Order Template views modes.
                backToOrders: function (e) {
                    var vm = this;

                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    vm._checkUpdateRequiredBeforeReturnToOrderList().done(function () {
                        widget.trigger(BEFORE_BACK);

                        // Change Visibility: Hide orders, show lines
                        vm.set("mode", WIDGET_MODE_ORDERS);

                        // Clear messages
                        $.cv.util.clearNotifications(vm);

                        widget.dataSource.fetch();

                        widget.trigger(AFTER_BACK);
                    });

                    return false;
                },

                // (EVENT HANDLER)
                // Adds the product code for the product into the template order
                addProductToTemplate: function (e) {
                    var vm = this,
                        order = vm.currentOrder,
                        productCode = this.get("productSearchTerm");

                    e.preventDefault();
                    e.stopPropagation();
                 
                    // Clear messages
                    $.cv.util.clearNotifications(vm);

                    // Save the changes
                    if (vm.get("isLineDataDirty") === true) {
                        //vm._saveOrderLineChanges_Internal();
                    }

                    if ($.trim(productCode) === "") {
                        $.cv.util.notify(vm, widget.options.addProductRequiredSearchTerm, $.cv.css.messageTypes.error);
                        return;
                    }

                    vm.set("isAddingProduct", true);
                    widget.trigger(BEFORE_ADD_TO_TEMPLATE_ORDER, productCode);
                    $.cv.util.clearNotifications(vm);

                    // Add the line
                    $.cv.css.orderTemplate.addLineToTemplateOrder({
                        productCode: productCode,
                        orderNo: order.SoOrderNo,
                        quantity: this.get("addProductQuantity"), // Allows binding to input field
                        setQtyAutomatically: widget.options.setQtyAutomatically // No quantity required if true. Server will determine the best qty.
                    }).done(function (response) {
                        var message = $.cv.util.string.format(widget.options.addProductSuccessMessage, productCode);

                        if (response.data.editOrderOk === false) {                            
                            message = $.cv.util.string.format(widget.options.addProductFailureMessage, productCode);

                            $.cv.util.notify(vm, message + response.data.message, $.cv.css.messageTypes.error, {
                                clearExisting: false // Ensure we DONT clear just added saving changes message if it was added
                            });
                        } else {
                           $.cv.util.notify(vm, message, $.cv.css.messageTypes.success, {
                                clearExisting: false // Ensure we DONT clear just added saving changes message if it was added
                            });
                        }
                    }).fail(function () {
                        var message = $.cv.util.string.format(widget.options.addProductErrorMessage, productCode);

                        $.cv.util.notify(vm, message + response.data.message, $.cv.css.messageTypes.error, {
                            clearExisting: false // Ensure we DONT clear just added saving changes message if it was added
                        });
                    }).always(function () {
                        vm.set("isAddingProduct", false);
                        widget.trigger(AFTER_ADD_TO_TEMPLATE_ORDER, productCode);

                        // Re-Bind the order
                        vm._viewOrder_Internal(order.SoOrderNo);
                    });

                    return false;
                },

                // (EVENT HANDLER)
                // Triggers a reprice of the order in it's current state on the server.
                repriceOrder: function (e) {
                    var vm = this,
                        order = vm.currentOrder;

                    e.preventDefault();
                    e.stopPropagation();

                    vm.set("isRepricingOrder", true);
                    widget.trigger(BEFORE_REPRICE, order);
                    $.cv.util.clearNotifications(vm);
                    $.cv.css.orderTemplate.repriceOrder({
                        soOrderNo: order.SoOrderNo,
                        soBoSuffix: order.SoBoSuffix != null ? order.SoBoSuffix : ''
                    }).done(function () {
                        var message = $.cv.util.string.format(widget.options.repriceOrderTemplateSuccessMessage, order.TemplateName);
                        $.cv.util.notify(vm, message, $.cv.css.messageTypes.success);               
                    }).fail(function () {
                        var message = $.cv.util.string.format(widget.options.repriceOrderTemplateFailureMessage, order.TemplateName);
                        $.cv.util.notify(vm, message, $.cv.css.messageTypes.error);
                    }).always(function () {
                        widget.trigger(AFTER_REPRICE, order);
                        // Re-Bind the order
                        vm._viewOrder_Internal(order.SoOrderNo);
                        // We don't want the reprice message to display again after doing a reprice, so wait until the order is reloaded to set isRepricingOrder to false
                        widget.unbind("afterViewLines").bind("afterViewLines", function () {
                            vm.set("isRepricingOrder", false);
                        });
                    });

                    return false;
                },

                // (EVENT HANDLER)
                // Sets all line quantities for all lines to zero on client side only
                clearLineQuantities: function (e) {
                    var vm = this;
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        var confirmClear = widget.options.confirm({
                            widget: widget,
                            viewModel: vm,
                            message: widget.options.confirmClearQuantitiesMessage,
                            scenario: "clearLineQuantities"
                        });

                        confirmClear.done(function (doClear) {
                            if (doClear === true) {
                                vm._clearLineQuantities_Internal();
                            }
                        });
                    } else {
                        vm._clearLineQuantities_Internal();
                    }
                },

                _clearLineQuantities_Internal: function () {
                    viewModel.set("isClearingQtys", true);
                    var lines = this.get("lines"),
                        i,
                        currentLine,
                        length = lines.length;

                    for (i = 0; i < length; i += 1) {
                        currentLine = lines[i];
                        if (currentLine.get("LineType").toUpperCase() === "SN") {
                            if (this.get("isParValueMode") === true) {
                                currentLine.set("qtyOnHand", '');
                            } else {
                                currentLine.set("OrderedQty", 0);
                            }
                        }
                    }
                    viewModel.set("isClearingQtys", false);
                },

                // (EVENT HANDLER)
                // Removes all lines from the order.
                removeAllLines: function (e) {
                    var vm = this,
                        order = vm.currentOrder;

                    e.preventDefault();
                    e.stopPropagation();
                    $.cv.util.clearNotifications(vm);

                    var confirmDelete = widget.options.confirm({
                        widget: widget,
                        viewModel: vm,
                        message: widget.options.confirmRemoveAllLinesMessage.replace("\{0\}", order.TemplateName),
                        scenario: "removeAllLines"
                    });
                    
                    confirmDelete.done(function (doDelete) {
                        if (doDelete === true) {
                            vm.set("isRemovingAllLines", true);
                            widget.trigger(BEFORE_REMOVE_ALL_LINES, order);

                            $.cv.css.orderTemplate.removeAllLines({
                                soOrderNo: order.SoOrderNo
                            }).done(function () {
                                var message = $.cv.util.string.format(widget.options.removeAllLinesSuccessMessage, order.TemplateName);
                                $.cv.util.notify(vm, message, $.cv.css.messageTypes.success);
                            }).fail(function () {
                                var message = $.cv.util.string.format(widget.options.removeAllLinesFailureMessage, order.TemplateName);
                                $.cv.util.notify(vm, message, $.cv.css.messageTypes.error);
                            }).always(function () {
                                vm.set("isRemovingAllLines", false);
                                widget.trigger(AFTER_REMOVE_ALL_LINES, order);

                                // Re-Bind the order
                                vm._viewOrder_Internal(order.SoOrderNo);
                            });
                        }
                    });

                    return false;
                },

                // (EVENT HANDLER)
                // Adds the lines on the template order to the cart.
                addAllLinesToCart: function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var vm = this,
                        currentOrder = vm.currentOrder,
                        lineQuantities = vm._getLineQuantities(),
                        allLineUpdates = vm._getLineChanges();

                    vm.set("isAddingLinesToCart", true);
                    var sendObj;
                    if (vm.get("isLineDataDirty") === true) {
                        sendObj = {
                            soOrderNo: currentOrder.get("SoOrderNo"),
                            soBoSuffix: currentOrder.get("SoBoSuffix"),
                            lineQtys: lineQuantities,
                            lineUpdates: allLineUpdates,
                            isParValueMode: vm.get("isParValueMode") === true
                        }
                    } else {
                        sendObj = {
                            soOrderNo: currentOrder.get("SoOrderNo"),
                            soBoSuffix: currentOrder.get("SoBoSuffix"),
                            lineQtys: lineQuantities,
                            isParValueMode: vm.get("isParValueMode") === true
                        }
                    }

                    widget.trigger(BEFORE_ADD_LINES_TO_CART, currentOrder);
                    $.cv.css.trigger($.cv.css.eventnames.cartItemsChanging);
                    return $.cv.css.orderTemplate.addAllProductsToCart(sendObj).done(function (response) {
                        if (response.data.message == widget.options.noItemsAddedReturnMessage) {
                            var message = $.cv.util.string.format(widget.options.addLinesToCartSuccessMessageNoItems, currentOrder.TemplateName);
                        } else {
                            var message = $.cv.util.string.format(widget.options.addLinesToCartSuccessMessage, currentOrder.TemplateName);
                        }
                        if ($.type(response.data.message) === 'string' && response.data.message.length > 0) {
                            message = message.length > 0 ? message + widget.options.successMessageAndReturnMessageSpacer + response.data.message : response.data.message;
                        }
                        if (response.data.message == widget.options.noItemsAddedReturnMessage) {
                            $.cv.util.notify(vm, message, $.cv.css.messageTypes.warning);
                        } else {
                            $.cv.util.notify(vm, message, $.cv.css.messageTypes.success);
                        }
                    }).fail(function () {
                        var message = $.cv.util.string.format(widget.options.addLinesToCartFailureMessage, currentOrder.TemplateName);
                        $.cv.util.notify(vm, message, $.cv.css.messageTypes.error);
                    }).always(function () {
                        vm.set("isAddingLinesToCart", false);
                        $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                        if (vm.get("isParValueMode") === true) {
                            widget.viewModel.clearLineQuantities();
                        }
                        widget.trigger(AFTER_ADD_LINES_TO_CART, currentOrder);
                    });
                },

                // (EVENT HANDLER)
                // Saves any changes to the template order
                saveOrderLineChanges: function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    this._saveOrderLineChanges_Internal();

                    return false;
                },

                // (PRIVATE)
                // Saves any changes to the template order
                _saveOrderLineChanges_Internal: function (doReload) {
                    var vm = this,
                        currentOrder = vm.currentOrder,
                        changes = vm._getLineChanges();

                    // Default is to always do reload unless told otherwise
                    if (doReload == null) {
                        doReload = true;
                    }

                    vm.set("isSavingOrder", true);
                    widget.trigger(BEFORE_UPDATE_TEMPLATE_ORDER, currentOrder);
                    $.cv.util.clearNotifications(vm);
                    return $.cv.css.orderTemplate.saveChanges({
                        soOrderNo: currentOrder.get("SoOrderNo"),
                        soBoSuffix: currentOrder.get("SoBoSuffix"),
                        changes: changes
                    }).done(function () {
                        widget.viewModel.set("isLineDataDirty", false);
                        var message = $.cv.util.string.format(widget.options.updateTemplateOrderSuccessMessage, currentOrder.TemplateName);
                        $.cv.util.notify(vm, message, $.cv.css.messageTypes.success);
                    }).fail(function () {
                        var message = $.cv.util.string.format(widget.options.updateTemplateOrderFailureMessage, currentOrder.TemplateName);
                        $.cv.util.notify(vm, message, $.cv.css.messageTypes.error);
                    }).always(function () {
                        vm.set("isSavingOrder", false);
                        widget.trigger(AFTER_UPDATE_TEMPLATE_ORDER, currentOrder);
                        // Re-Bind the order
                        if (doReload === true) {
                            vm._viewOrder_Internal(currentOrder.SoOrderNo, currentOrder.TemplateName);
                            // We don't want the reprice message to display again after doing an update, so wait until the order is reloaded to set isSavingOrder to false
                            widget.unbind("afterViewLines").bind("afterViewLines", function () {
                                vm.set("isSavingOrder", false);
                            });
                        } else {
                            vm.set("isSavingOrder", false);
                        }
                    });
                },

                // (EVENT HANDLER)
                // Re-loads the order and lines
                undoLineChanged: function (e) {
                    var vm = this,
                        orderNo = vm.get("orderNo");

                    e.preventDefault();
                    e.stopPropagation();
                    vm.set("isUndoing", true);
                    $.cv.util.clearNotifications(vm);
                    vm._viewOrder_Internal(orderNo).done(function () {
                        var message = $.cv.util.string.format(widget.options.unsavedChangesReversedMessage, orderNo);
                        $.cv.util.notify(vm, message, $.cv.css.messageTypes.success);
                        vm.set("isUndoing", false);
                    });
                },

                // (EVENT HANDLER)
                // Triggers opening of external window which allows printing of the order
                // without the normal window baggage.
                printOrder: function (e) {
                    var vm = this;

                    e.preventDefault();
                    e.stopPropagation();

                    widget.trigger(BEFORE_PRINT_OPENED);

                    if (widget.options.openPrintOrderPage) {
                        widget.options.openPrintOrderPage(vm.get("currentOrder.SoOrderNo")
                                                        , vm.get("currentOrder.SoBoSuffix"));
                    }

                    return false;
                },

                sortByColumn: function (e, newSortColumn) {
                    if (e) {
                        var vm = this;
                        vm.set("isSortingOrders", true);
                        var currentSortColumn = vm.get("sortColumn");
                        var currentSortDirection = vm.get("sortDirection");
                        var sortDirection = (newSortColumn === currentSortColumn)
                            ? (currentSortDirection === $.cv.css.sortColumnAsc ? $.cv.css.sortColumnDesc : $.cv.css.sortColumnAsc)
                            : $.cv.css.sortColumnAsc;

                        // clear all sorting classes then set the sort class on the clicked column
                        $.cv.util.setColumnSortClass(e, sortDirection);

                        vm.set("sortColumn", newSortColumn);
                        vm.set("sortDirection", sortDirection);
                        $.cv.css.trigger($.cv.css.eventnames.sortByOrderTemplateColumn, { sortColumn: newSortColumn, sortDirection: sortDirection });
                    }
                }
            }));

            var action = $.cv.util.queryStringValue("action");
            if (action && action.toLowerCase() == "save") {
                viewModel.set("actionIsSave", true);

                $.cv.css.orderTemplate.getOrderTemplatesForUser({ take: 9999 }).done(function (response) {
                    var datasource = [];
                    if (widget.options.usePleaseSelectForTemplateNames) {
                        datasource.push({ TemplateID: "", TemplateName: "Please Select..." });
                    } else {
                        datasource.push({ TemplateName: "" });
                    }

                    var items = response.data;
                    $.each(items, function (index, item) {
                        if (item.IsTemplateOrderThisUserCanModify) {
                            item["TemplateID"] = item.TemplateName;
                            datasource.push(item);
                        }
                    });

                    viewModel.set("saveTemplateList", datasource);
                }).fail(function () {
                    $.cv.util.notify(viewModel, widget.options.loadUserTemplatesFailureMessage, $.cv.css.messageTypes.error);
                });

                var saveTemplateType = $.cv.util.queryStringValue("TemplateType").toLowerCase(); // "order" or "catalogue".
                switch (saveTemplateType) {
                    case "order":
                        viewModel.set("saveTemplateType", saveTemplateType);
                        break;

                    case "catalogue":
                        viewModel.set("saveTemplateType", saveTemplateType);
                        break;
                }
            }

            return viewModel;
        }
    };

    // Register
    $.cv.ui.widget(templateOrders);

})(jQuery);
