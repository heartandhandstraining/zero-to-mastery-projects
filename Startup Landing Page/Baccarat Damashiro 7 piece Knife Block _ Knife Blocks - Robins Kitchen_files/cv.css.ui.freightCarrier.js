/* Name: Freight carrier
* Author: Aidan Thomas 
* Created: 20130220
*
* Dependencies:    
*          --- Third Party ---
*          jquery.js 
*          kendo.web.js
*           --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.css.js
*          /Scripts/cv.util.js
*          /Scripts/cv.css.freightCarrier.js
* Params:  
*           dataSource: 
*           pleaseSelectText:
*           freightOptionsTextField: 
*           freightOptionsValueField: 
*           clearExistingMessages:
*           autoBind: 
*           triggerMessages:
*           textErrorSettingFreight:
*           viewTemplate: kendo template id for the main view
*/

// TODO: Current only works with Standard Freight, Live Freight and Delivery Methods. The other methods still need to be implemented
;
(function ($, undefined) {

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        FREIGHTSELECTED = "freightSelected",
        FREIGHTSELECTEDINITIALOWNCARRIER = "freightSelectedInitialOwnCarrier",
        FREIGHTSELECTEDOWNCARRIER = "freightSelectedOwnCarrier",
        PICKUPWAREHOUSESLOADED = "pickupWarehousesLoaded";

    var freightCarrierWidget = {
        // widget name
        name: "freightCarrier",
        dataInitialising: undefined,

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            freightOptionsTextField: "CarrierDescription",
            freightOptionsValueField: "ID",
            clearExistingMessages: true,
            isFreightCalculator: false,
            getDataOnInit: true,
            validatePostcode: false,
            enableWarehouseGroupFreight: false,
            isThirdPartyDeliveryInUse: false,
            isDeliveryMethodsInUse: false,
            isDeliveryMethodSetOnOrder: false,


            // viewModel flags
            autoBind: true,
            triggerMessages: true,
            preventSetFreightOnGetFreightUpdateOfDataSource: false, // This should be used when widget is used for Freight Estimator i.e. In Cart View, as opposed to determining freight at checkout.
            usingAddressValidation: false,
            // events
            // view flags
            // view text defaults
            textErrorSettingFreight: 'There was an error setting the freight',
            textPostCodeRequired: "Please enter a postcode",
            textPostCodeInWrongFormat: "Postcode is in the wrong format",
            textNoFreightFoundDefaultMessage: "No freight could be found for your entered details",
            textNoOwnCarrierNameMessage: "Please select one of your own carriers",
            textNoOwnCarrierAccountMessage: "Please enter your Freight Account Number",
            textNoNormalCarrierMessage: "Please select one freight option on order",
            textPleaseSelectWarehouse: "Please select...",
            freightOptionNotSelected: "Please select a freight option",
            multipleFreightOptionsNotSelected: "Please select a freight option from each group",
            warehouseNotSelected: "Please select a pickup location",
            freightAccountNoNotProvided: "Please provide an account number to charge to",
            // widget settings
            currentOrderPostcode: "",
            currentOrderCountry: { Code: "Australia", Description: "Australia" },
            defaultCountry: "Australia",
            availableCountries: [{ Code: "Australia", Description: "Australia" }],
            storeName: "",

            // view Template
            viewTemplate: null // Treat these as IDs, remove the last one.
        },

        events: [DATABINDING, DATABOUND, FREIGHTSELECTED, FREIGHTSELECTEDINITIALOWNCARRIER, FREIGHTSELECTEDOWNCARRIER, PICKUPWAREHOUSESLOADED],

        viewModel: null,

        view: null,

        // private property
        _viewAppended: false,

        initialise: function (el, o) {
            var widget = this;
            
            // Register Widget so we can determine when they are all completed loading
            $.cv.css.trigger($.cv.css.eventnames.orderCompleteLoadRegistration, { name: widget.name }); // MAF USE ONLY

            //var view = null;
            // check for an internal view
            var internalView = $(el).children(":first");
            if (internalView.data("view")) {
                widget.view = internalView.html();
            } else {
                // setup grid view
                widget._viewAppended = true;
                // get template text and parse it with the options
                var templateText = widget.options.viewTemplate ? $("#" + widget.options.viewTemplate).html() : widget._getDefaultViewTemplate();
                var viewTemplate = kendo.template(templateText);
                widget.view = viewTemplate(widget.options);
                widget.element.html(widget.view);
            }
            // now MMVM bind
            widget.viewModel = widget._getViewModel();
            // bind view to viewModel
            var target = widget.element.children(":first");
            kendo.bind(target, widget.viewModel);
            $.cv.css.bind($.cv.css.eventnames.addressChanged, $.proxy(widget.viewModel.addressChanged, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.addressBeingEdited, $.proxy(widget.viewModel.addressBeingEdited, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.addressValidationUpdated, $.proxy(widget.viewModel.addressValidationUpdated, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.deliveryMethodSetOnOrder, $.proxy(widget.viewModel.deliveryMethodSetOnOrder, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.deliveryMethodClearedFromOrder, $.proxy(widget.viewModel.deliveryMethodClearedFromOrder, widget.viewModel));
            $.cv.css.trigger($.cv.css.eventnames.deliveryMethodLoadedCheck, { widgetName: widget.name });
        },

        destroy: function () {
            var widget = this;
            // remove the data element
            widget.element.removeData(widget.name);
            // clean up the DOM
            if (widget._viewAppended) {
                $.cv.util.destroyKendoWidgets(widget.element);
                widget.element.empty();
            }
        },

        validateInputFields: function (showMessages) {
            var widget = this;
            widget.viewModel.validateInputFields(showMessages);
        },

        _getViewModel: function () {
            var widget = this;

            var initDataSource = function (showMessages) {
                widget.dataInitialising = $.Deferred();

                if (!widget.options.isFreightCalculator && !viewModel.get("showWarehousesForPickup") && !viewModel.get("showWarehousesForPickupOrIsLoading")) {
                    if (widget.options.storeName.length > 0) {
                        viewModel.getWarehousesForPickup(widget.options.storeName);
                    }
                    if (widget.options.isDeliveryMethodsInUse) {
                        viewModel.set("isDisabled", true);
                    }
                    var d1 = $.cv.css.freightCarrier.getFreightForCurrentOrder();
                    $.when(d1).done(function (msg) {
                        viewModel.set("showFreightSelector", msg.data.ShowFreightSelector);

                        if (msg.data.ShowFreightSelector) {
                            var freightGroups = [];

                            if (msg.data.OptionGroups.length > 0) {
                                widget.options.dataSource = msg.data.OptionGroups; // [0].FreightOptions;

                                if (msg.data.OptionGroups[0].TemplateName != "" && msg.data.OptionGroups[0].TemplateName != null) {
                                    viewModel.setFreightTemplateHtml(msg.data.OptionGroups[0].TemplateName);
                                }

                                // Warehouse groups.
                                if (widget.options.enableWarehouseGroupFreight === true) {

                                    var lines = $.cv.css.localGetCurrentOrderLines();

                                    if (lines) {
                                        $.each(msg.data.OptionGroups, function(freightGroupsIndex, freightGroupsItem) {
                                            var freightGroup = {
                                                name: freightGroupsItem.Name,
                                                freightOptionLines: [],
                                                freightOptionsList: [],
                                                selectedID: null
                                            };

                                            // Add products in freight group.
                                            var isFirstItem = true;
                                            $.each(lines, function(linesIndex, linesItem) {
                                                if (linesItem.LineType === "SN" && linesItem.Product.length === 1 && linesItem.Product[0].WarehouseProductGroup === freightGroup.name) {
                                                    var freightOptionLine = {
                                                        Code: linesItem.StockCode,
                                                        Title: linesItem.Description,
                                                        Qty: linesItem.OrderedQty,
                                                        IsFirstItem: isFirstItem,
                                                        ProductUnitDescription: linesItem.Product[0].UnitDescription,
                                                        UnitDescription: linesItem.UnitDescription
                                                    };
                                                    freightGroup.freightOptionLines.push(freightOptionLine);

                                                    isFirstItem = false;
                                                }
                                            });

                                            // Add freight options.
                                            $.each(freightGroupsItem.FreightOptions, function(freightOptionsIndex, freightOptionsItem) {
                                                var freightOption = {
                                                    AmountIncTax: freightOptionsItem.AmountIncTax,
                                                    AmountExTax: freightOptionsItem.AmountExTax,
                                                    ChargeDescription: freightOptionsItem.ChargeDescription,
                                                    FreightGroupName: freightGroup.name,
                                                    ID: freightOptionsItem.ID
                                                };
                                                freightGroup.freightOptionsList.push(freightOption);
                                            });

                                            freightGroups.push(freightGroup);
                                        });
                                    }

                                    viewModel.set("freightGroups", freightGroups);
                                    viewModel.set("isSelectingMultipleOptionGroupFreight", false);
                                }

                                // Need to remove the Store Pickup option from the normal freight options list as it would already have been shown if available in the first selection list
                                // that was shown to user where could choose if wanted to use own carriers or not. It would be confusing to have it listed in both locations  
                                var index = -1;
                                $.each(msg.data.OptionGroups[0].FreightOptions, function(idx, item) {
                                    if (item.IsStorePickup) {
                                        index = idx;
                                        viewModel.set("isStorePickupAvailable", true);
                                        viewModel.set("storePickupCarrierCode", item.CarrierCode);
                                        return false;
                                    }
                                });

                                // Set if Own Carriers available, will make normal freight selection initially not visible
                                // instead first showing the choice for user if they want to use own carriers or normal freight.
                                if (msg.data.IsFreightOwnCarriersAvailable) {
                                    viewModel.set("isFreightOwnCarriersAvailable", true);
                                    viewModel.set("isFreightNormalCarriersVisisble", false);

                                    if (index > -1)
                                        msg.data.OptionGroups[0].FreightOptions.splice(index, 1);
                                } else {
                                    // If only have one freight option and it is store pickup (i.e. not a real carrier) this means no real freight found.
                                    // So if there is also the config to allow feright quote submission then make this visible from the get go.
                                    if (viewModel.get("isProntoFreightQuoteEnabled")
                                        && (msg.data.OptionGroups.length == 0 || msg.data.OptionGroups[0].FreightOptions.length == 0
                                            || (msg.data.OptionGroups[0].FreightOptions.length == 1 && viewModel.get("isStorePickupAvailable")))) {
                                        viewModel.set("isFreightQuoteInstructsVisisble", true);
                                    }
                                }
                            } else {
                                widget.options.dataSource = [];

                                if (widget.options.enableWarehouseGroupFreight === true) {
                                    viewModel.set("freightGroups", freightGroups);
                                }
                            }
                        } else {
                            widget.options.dataSource = [];
                        }

                        if (showMessages && msg.data.Messages.length > 0) {
                            widget.viewModel.clearMessage();

                            $.each(msg.data.Messages, function (idx, item) {
                                viewModel.setMessage(item, $.cv.css.messageTypes.error);
                            });
                        }

                        setDataSource();
                        viewModel.set("isInitialLoad", false);
                        if (widget.options.isDeliveryMethodsInUse) {
                            viewModel.set("isDisabled", false);
                        }
                        widget.options.storeName = "";
                        //we are done initialising the widget with data so resolve the deferred.
                        widget.dataInitialising.resolve();
                    });
                }

                return widget.dataInitialising.promise();
            };

            // returns the carrier code from the current order
            var getSoCarrierCode = function () {
                var order = $.cv.css.localGetCurrentOrder();
                if (order != null) {
                    if (order.CarrierCode)
                        return order.CarrierCode;
                    else
                        return '';
                } else {
                    return '';
                }
            };

            // returns the OwnCarrierName from the current order
            var getOwnCarrierName = function () {
                var order = $.cv.css.localGetCurrentOrder();
                if (order != null) {
                    if (order.OwnCarrierName)
                        return order.OwnCarrierName;
                    else
                        return '';
                } else {
                    return '';
                }
            };

            // returns the OwnCarrierNameOwnCarrierAccount  from the current order
            var getOwnCarrierAccount = function () {
                var order = $.cv.css.localGetCurrentOrder();
                if (order != null) {
                    if (order.OwnCarrierAccount)
                        return order.OwnCarrierAccount;
                    else
                        return '';
                } else {
                    return '';
                }
            };

            /// returns if the order has a freight charge that needs a quote for the carrier.
            var getHasFreightChargeLineRequiresQuote = function () {
                var order = $.cv.css.localGetCurrentOrder();
                if (order != null) {
                    if ($.cv.util.hasValue(order.HasFreightChargeLineRequiresQuote) === true
                        && order.HasFreightChargeLineRequiresQuote === true) {
                        return true;
                    }
                }
                return false;
            };

            var setDataSource = function () {
                widget.dataSource = kendo.data.DataSource.create(widget.options.dataSource);

                if (widget.options.autoBind)
                    widget.dataSource.fetch();

                viewModel.updateItemList();
                viewModel.updateItemListInitialOwnCarriers();
                viewModel.updateItemListOwnCarriers();

                // check the carrier code on the current order, if populated update the view model to use this value
                var soCarrierCode = getSoCarrierCode();
                var dSourceView = widget.dataSource.view();

                // If ShowFreightSelector was false in the data that came back from $.cv.css.freightCarrier.getFreightForCurrentOrder() in initDataSource()
                // then there won't be any FreightOptions on the widget.dataSource.view() at this point so need to check! Also, don't do any of this if a
                // call to _selectMinimFreight() might have been just triggered before as could be the case at start of setDataSource() when it called viewModel.updateItemList();
                if (dSourceView && dSourceView.length > 0 
                    && !viewModel.get("showWarehousesForPickup") 
                    && !viewModel.get("showWarehousesForPickupOrIsLoading") 
                    && !viewModel.get("isSelectMinimumFreightRan")) {
                  
                    var ownCarrierName = getOwnCarrierName();

                    var freightOptions = !$.cv.util.isNullOrWhitespace(ownCarrierName)
                        ? $.grep(dSourceView, function(item) { return item.Name === "FreightOwnCarrier" })[0]
                        : dSourceView[0];

                    var result = $.grep(freightOptions.FreightOptions, function (e) { return e.CarrierCode == soCarrierCode; });
                    if (result.length > 0) {
                        if (viewModel.get("currentFreightID") == result[0].ID && !viewModel.get("isInitialLoad")) {
                            viewModel.freightSelected();
                            viewModel.validateInputFields();
                        } else {
                            viewModel.set("currentFreightID", result[0].ID);
                        }

                        // Handle own carriers options preselection that normal carriers selected
                        if (!result[0].IsStorePickup) {
                            if ($.cv.util.isNullOrWhitespace(ownCarrierName)) {
                                normalFreightCarrierSelected = true;
                                viewModel.set("currentFreightUseOwnCarrier", "UseNormalFreightCarriers");
                            }
                            viewModel.freightSelectedInitialOwnCarrier();
                        }
                    } else {
                        _selectMinimFreight(true);
                    }
                }

                //
                // Handle own carriers options preselection
                //

                // If StorePickup chosen set viewmodel that this option chosen
                if(soCarrierCode.length > 0 && soCarrierCode == viewModel.get("storePickupCarrierCode")) {
                    var isAlreadySP = viewModel.get("currentFreightUseOwnCarrier") == soCarrierCode; // store if current value is the same
                    viewModel.set("currentFreightUseOwnCarrier", soCarrierCode); // if it was different the binding event on this viewmodel property will trigger the change event

                    // if it was the same then it won't have got triggered so do it manually as must ensure it is called, otherwise the freight may not have been set.
                    if (isAlreadySP)
                        viewModel.freightSelectedInitialOwnCarrier();
                }

                if (!$.cv.util.isNullOrWhitespace(ownCarrierName)) {
                    var isAlreadyOC = viewModel.get("currentFreightUseOwnCarrier") == "UseFreightOwnCarriers"; // store if current value is the same
                    viewModel.set("currentFreightUseOwnCarrier", "UseFreightOwnCarriers");  // if it was different the binding event on this viewmodel property will trigger the change event

                    // if it was the same then it won't have got triggered so do it manually as must ensure it is called, otherwise may not show correct options
                    if (isAlreadyOC)
                        viewModel.freightSelectedInitialOwnCarrier();
                }

                
            };

            var _selectMinimFreight = function (triggerFreightSelected) {

                //Check pre conditions before attempting to select minimum freight.
                if (!widget.dataSource || viewModel.get("showWarehousesForPickup") || viewModel.get("showWarehousesForPickupOrIsLoading") || viewModel.get("preventSetFreightOnGetFreightUpdateOfDataSource")) {
                    return;
                }

                var array = [],
                    minAmount = 0,
                    minIndex = 0,
                    dview = widget.dataSource.view();

                // If the option preventSetFreightOnGetFreightUpdateOfDataSource is true, which it should be if this just being used as a freight 
                // calculator / estimator i.e. in cart view, as opposed to being used for setting freight at checkout, then do not want to cause 
                // any setting of freight once callculator has gotten freight options.
                triggerFreightSelected =  viewModel.get("preventSetFreightOnGetFreightUpdateOfDataSource") === true 
                                            ? false
                                            : typeof triggerFreightSelected !== 'undefined'
                                                ? triggerFreightSelected
                                                : false;
                
                if (dview.length > 0 && dview[0].FreightOptions) {
                    var nonOwnCarriersOptionGrp = dview[0].FreightOptions; // Always first group will not be the one not for Own Carriers
                    if (nonOwnCarriersOptionGrp.length > 0)
                        minAmount = nonOwnCarriersOptionGrp[0].AmountIncTax;
                    $.each(nonOwnCarriersOptionGrp, function (idx, item) {
                        // add standard commands
                        item.Index = idx;
                        if (item.AmountIncTax < minAmount) {
                            minAmount = item.AmountIncTax;
                            minIndex = idx;
                        }
                        array.push(item);
                    });
                }

                // Don't do an initial call to set freight when can choose from an own carrier
                var isOwnCarriersAvailable = viewModel.get("isFreightOwnCarriersAvailable");

                // Possible as address details change for subsequent freight options to reuse option id's but actually have different carriers (e.g. Live Freight can do this)
                var isSameOptionIDButHasDiffCarrier = $.cv.util.hasValue(array) && array.length > 0 ? viewModel.get("currentFreightID") === array[minIndex].ID && viewModel.get("currentCarrierCode") !== array[minIndex].CarrierCode : false;

                if (!isOwnCarriersAvailable && array.length > 0
                   && (viewModel.get("currentFreightID") === ""
                       || viewModel.get("currentFreightID") !== array[minIndex].ID // Earlier calls to get freight may have set a currentFreightID (e..g no charge when couldn't determine live freight) but then address changes so options change too to a new set.
                       || isSameOptionIDButHasDiffCarrier) // Possible as address details change for subsequent freight options to reuse option id's but actually have different carriers (e.g. Live Freight can do this)
                   && widget.options.storeName.length === 0) {
                    // Setting the currentFreightID on the viewModel will trigger freightSelected() and validateInputFields() after anyway as it set via binding for change event in viewModel.bind("change") in this widget But it will only do this if the value 
                    // we are setting it to is changing! So if it is the same option ID as already set but the carrier code changed for that option, then must call the freightSelected() and validateInputFields() manually.
                    viewModel.set("currentFreightID", array[minIndex].ID);
                    viewModel.set("isSelectMinimumFreightRan", true); // Set this so any continued processing during initialisation won't trigger another call to get freight!

                    // Trigger manually as binding change event won't fire when just called viewModel.set("currentFreightID") as Id is the same!
                    if (isSameOptionIDButHasDiffCarrier) {
                        viewModel.freightSelected();
                    }

                } else if (!isOwnCarriersAvailable && array.length > 0 && triggerFreightSelected && viewModel.get("currentFreightID") != '' && viewModel.get("currentFreightID") == array[minIndex].ID) {
                    viewModel.freightSelected();
                    viewModel.set("isSelectMinimumFreightRan", true); // Set this so any continued processing during initialisation won't trigger another call to get freight!
                }

                viewModel.validateInputFields();
            };

            var getDataView = function () {
                // check if ds is initialised
                if (!widget.dataSource)
                    return [];
                var array = [];
                
                var dview = widget.dataSource.view();
                if (dview.length > 0 && dview[0].FreightOptions) {
                    var nonOwnCarriersOptionGrp = dview[0].FreightOptions; // Always first group will not be the one not for Own Carriers
                    array = nonOwnCarriersOptionGrp;
                }
                _selectMinimFreight();
                return array;
            };

            var getDataViewUseOwnCarriers = function () {
                // check if ds is initialised
                if (!widget.dataSource)
                    return [];

                if (viewModel.get("isFreightOwnCarriersAvailable") == false)
                    return [];

                var array = [];
                // Iterate the OptionGroups, the data source should be list of them, and find the Own Carriers one (should be not the first if present)
                var dview = widget.dataSource.view();
                $.each(dview, function (idx, item) {
                    if (item.Name == "FreightOwnCarrier") {
                        $.each(item.FreightOptionsUseOwnCariers, function (idx2, uocItem) {
                            array.push(uocItem);
                        });
                        return false;
                    }
                });

                return array;
            };

            var getDataViewOwnCarriers = function () {
                // check if ds is initialised
                if (!widget.dataSource)
                    return [];

                if (viewModel.get("isFreightOwnCarriersAvailable") == false)
                    return [];

                var array = [];
                // Iterate the OptionGroups, the data source should be list of them, and find the Own Carriers one (should be not the first if present)
                var dview = widget.dataSource.view();
                $.each(dview, function (idx, item) {
                    if (item.Name == "FreightOwnCarrier") {
                        $.each(item.FreightOptions, function (idx2, ocItem) {
                            array.push(ocItem);
                        });
                        return false;
                    }
                });

                return array;
            };
            var viewModel = kendo.observable({

                // Properties for UI elements
                dataSource: widget.options.dataSource,

                message: '',

                currentFreightID: '',
                previousFreightID: '',
                currentFreightUseOwnCarrier: '',
                currentFreightOwnCarrierName: getOwnCarrierName(),
                currentFreightOwnCarrierAccount: getOwnCarrierAccount(),
                currentCarrierCode: getSoCarrierCode(),
                storePickupCarrierCode: '',

                freightTemplateHtml: "",

                freightOptionTemplateHtml: "",

                clearExistingMessages: widget.options.clearExistingMessages,

                calculatorPostcode: widget.options.currentOrderPostcode,

                calculatorCountryCode: widget.options.currentOrderCountry != null ? widget.options.currentOrderCountry.Code : '',

                calculatorCountryDescription: widget.options.currentOrderCountry != null ? widget.options.currentOrderCountry.Description : '',

                calculatorAvailableCountries: widget.options.availableCountries,

                // This should be used when widget is used for Freight Estimator (calculator) i.e. In Cart View, as opposed to determining freight at checkout.
                preventSetFreightOnGetFreightUpdateOfDataSource: widget.options.preventSetFreightOnGetFreightUpdateOfDataSource,
                
                isProntoFreightQuoteEnabled: widget.options.isProntoFreightQuoteEnabled != null ? widget.options.isProntoFreightQuoteEnabled : false,

                isThirdPartyDeliveryInUse: widget.options.isThirdPartyDeliveryInUse,

                isDeliveryMethodsInUse: widget.options.isDeliveryMethodsInUse,

                isDeliveryMethodSetOnOrder: widget.options.isDeliveryMethodSetOnOrder,

                showDeliveryView: function () {
                    var vm = this;

                    if (vm.get('showFreightSelector') === false) {
                        return false;
                    }

                    if (vm.get("isThirdPartyDeliveryInUse") || vm.get("showWarehousesForPickupOrIsLoading")) {
                        return false;
                    }

                    if (vm.get("isDeliveryMethodsInUse") && !vm.get("isDeliveryMethodSetOnOrder")) {
                        return false;
                    }

                    return true;
                },

                storeLocationDataLoaded: false,
                storeLocationData: [{ StoreName: widget.options.textPleaseSelectWarehouse, WarehouseCode: "" }],
                showWarehousesForPickup: false,
                showWarehousesForPickupOrIsLoading: false,
                warehouseLoadedFromOrder: false,
                selectedWarehouse: null,
                selectedWarehouseValue: function () {
                    var value = "", selectedWarehouse = this.get("selectedWarehouse");
                    if (selectedWarehouse) {
                        // whne bound to a kendo drop down list
                        if (typeof selectedWarehouse == "object") {
                            value = selectedWarehouse.WarehouseCode;
                        } else {
                            value = selectedWarehouse;
                        }
                    }
                    return value;
                },

                // UI Element state
                isDisabled: widget.options.usingAddressValidation,
                isInitialLoad: true,

                hasFreightOptions: false,
                hasFreightOptionsOrCanSubmitForFreightQuote: false, // used for when binding visibility in case no freight options available but can still submit for freight quote.

                isFreightOwnCarriersAvailable: false,
                isFreightUseOwnCarriersVisisble: false, // initially don't show
                isFreightNormalCarriersVisisble: true, // initially default to showing if don't have any own carriers.
                isFreightNormalCarriersLabelVisisble: false, // Only show this with normal freight option choice when have own carriers available but choose to use normal freight.
                isFreightQuoteInstructsVisisble: false, // Sets to true when not have any freight and can submit for freight quote instead to show msg about this.
                isFreightQuoteSelected: false, // Gets set if user chooses wish to submit as a quote to get freight quote.
                isStorePickupAvailable: false,

                // On initial load the call to function _selectMinimFreight() can be called from a few places. Once done and before user interaction don't want other locations after 
                // this to trigger a secondary call set freight again for either the same or a different freight option id so can use this to safeguard. 
                isSelectMinimumFreightRan: false,

                isSingleFreightOption: false,

                showFreightSelector: false,

                isProcessing: false,

                isLoadingWarehouses: false,

                isMultiFreightGroupsProcessing: function () {
                    return this.get("isProcessing") && this.get("freightGroups").length > 1;
                },

                // functions for UI events

                clearMessage: function () {
                    var clearExistingMessages = this.get("clearExistingMessages");
                    this.set("clearExistingMessages", true);
                    this.set("message", "");
                    if (widget.options.triggerMessages)
                        $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: 'freightCarrier', clearExisting: this.get("clearExistingMessages") });
                    this.set("clearExistingMessages", clearExistingMessages);
                },

                setMessage: function (message, type) {
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name
                    });
                },

                updateItemList: function () {
                    var dataView = getDataView();
                    this.set("itemList", dataView);
                    this.set("hasFreightOptions", dataView.length > 0);
                    this.set("hasFreightOptionsOrCanSubmitForFreightQuote", dataView.length > 0 || this.get("isProntoFreightQuoteEnabled"));
                    this.set("isSingleFreightOption", dataView.length == 1);
                },

                updateItemListInitialOwnCarriers: function () {
                    var dataView = getDataViewUseOwnCarriers();
                    this.set("itemListInitialOwnCarriers", dataView);
                    this.set("isFreightOwnCarriersAvailable", dataView.length > 0);
                },

                updateItemListOwnCarriers: function () {
                    var dataView = getDataViewOwnCarriers();
                    this.set("itemListOwnCarriers", dataView);
                },

                itemListIsEmpty: function() {
                    return this.get("itemList").length === 0;
                },

                // Holds the list of normal freight options to choose from, i.e. not own carriers
                itemList: getDataView(),

                // Used for list where can select if want to use Own Carriers or go with normal freight on order
                itemListInitialOwnCarriers: getDataViewUseOwnCarriers(),

                // Has the actaul list of Own Carriers available
                itemListOwnCarriers: getDataViewOwnCarriers(),

                addressValidationUpdated: function (data) {
                    this.set("isDisabled", !data.valid);
                },

                addressChanged: function () {
                    this.set("isAddressBeingEdited", false);
                    initDataSource(true);
                },

                isAddressBeingEdited: false,
                addressBeingEdited: function () {
                    this.set("isAddressBeingEdited", true);
                    $.cv.css.addRemovePageValidationError(false, widget.name);
                    if (widget.options.usingAddressValidation) {
                        this.set("isDisabled", true);
                    }
                },

                deliveryMethodSetOnOrder: function (msg) {
                    // only run this method if the event trigger was forced by this widget or it was generally triggered by the delivery methods widget
                    if ($.cv.util.hasValue(msg.widgetName) && msg.widgetName !== widget.name) {
                        return;
                    }

                    var vm = this,
                        triggerMessages = widget.options.triggerMessages;

                    // Clear the current freight ID so that when it is re-initialised by the address changed event it sets a new freight options based on the return values
                    widget.options.triggerMessages = false;
                    vm.set("currentFreightID", "");
                    widget.options.triggerMessages = triggerMessages;

                    if (widget.options.isDeliveryMethodsInUse) {
                        // Set disabled here, the initialise will clear it again after it is finished
                        viewModel.set("isDisabled", true);
                    }

                    //Note because we are using delivery methods the "address changed" event will trigger off a data initialise, so don't do it here otherwise we get duplicate service calls
                    vm.set("isDeliveryMethodSetOnOrder", true);
                },

                deliveryMethodClearedFromOrder: function (msg) {
                    // only run this method if the event trigger was forced by this widget or it was generally triggered by the delivery methods widget
                    if ($.cv.util.hasValue(msg.widgetName) && msg.widgetName !== widget.name) {
                        return;
                    }
                    var vm = this;

                    vm.set("isDeliveryMethodSetOnOrder", false);
                },

                setFreightTemplateHtml: function (templateName) {
                    var _this = this;
                    if (templateName != "" && templateName != null) {
                        var d1 = $.cv.css.getParsedTemplate({ templateName: templateName });
                        $.when(d1).done(function (msg) {
                            var data = msg.data;
                            _this.set("freightTemplateHtml", data);
                        }).fail(function () {

                        });
                    } else {
                        _this.set("freightOptionTemplateHtml", "");
                    }
                },

                freightSelected: function () {
                    var _this = viewModel;

                    if (widget.options.enableWarehouseGroupFreight) {
                        var freightOptionIDs = $.map(this.get("freightGroups"), function (item, index) { return item.selectedID });
                        this.setFreight(freightOptionIDs);
                        return;
                    }

                    var currentFreightID = this.get("currentFreightID");
                    if ((currentFreightID != undefined && currentFreightID != "") || currentFreightID == 0) {
                        var option = $.grep(this.get("itemList"), function (item, idx) { return (item.ID == currentFreightID); });
                        if (option.length > 0) {
                            // check if a template name exists for the current selected freight option, parse and insert the template, otherwise empty the freight option HTML
                            if (option[0].TemplateName != "" && option[0].TemplateName != null) {
                                var d1 = $.cv.css.getParsedTemplate({ templateName: option[0].TemplateName });
                                $.when(d1).done(function (msg) {
                                    var data = msg.data;
                                    _this.set("freightOptionTemplateHtml", data);
                                }).fail(function () {

                                });
                            } else {
                                _this.set("freightOptionTemplateHtml", "");
                            }
                        }

                        this.setFreight();
                    }
                },

                freightSelectedInitialOwnCarrier: function () {
                    var _this = viewModel;
                    var currFrghtUseOwnCarrier = _this.get("currentFreightUseOwnCarrier");
                    if ((currFrghtUseOwnCarrier != undefined && currFrghtUseOwnCarrier != "")) {
                        var option = $.grep(_this.get("itemListInitialOwnCarriers"), function (item, idx) { return (item.CarrierCode == currFrghtUseOwnCarrier); });
                        if (option.length > 0) {
                            var currentIsFghtQuoteSel = _this.get("isFreightQuoteSelected");
                            
                            if (option[0].IsStorePickup) {
                                _this.set("isFreightNormalCarriersVisisble", false);
                                _this.set("isFreightUseOwnCarriersVisisble", false);
                                _this.set("isFreightNormalCarriersLabelVisisble", false);
                                // Clear these as will now have store pickup set
                                _this.set("currentFreightOwnCarrierName", '');
                                _this.set("currentFreightOwnCarrierAccount", '');
                                _this.set("isFreightQuoteInstructsVisisble", false);

                                // Change to not set if was previously set
                                if(currentIsFghtQuoteSel) {
                                    _this.set("isFreightQuoteSelected",false);
                                }

                                // Let it be known what selection state is: Show the payment options
                                $.cv.css.trigger($.cv.css.eventnames.freightQuoteInstructsVisisble, { isVisible: false });
                                $.cv.css.trigger($.cv.css.eventnames.freightQuoteSelected, { isSelected: false });
                                
                                // Handle setting freight for pickup
                                this.set("currentFreightID", option[0].ID); // this will trigger setFreight()
                            }
                            else if (option[0].CarrierCode == "UseNormalFreightCarriers") {
                                // Handle making normal freight selection now visible
                                this.set("isFreightUseOwnCarriersVisisble", false);
                                // Clear these as will not now set
                                _this.set("currentFreightOwnCarrierName", '');
                                _this.set("currentFreightOwnCarrierAccount", '');

                                if (!_this.get("hasFreightOptions") && _this.get("isProntoFreightQuoteEnabled")) {
                                    _this.set("isFreightQuoteInstructsVisisble", true);

                                    // Let it be known what selection state is: Hide the payment options
                                    $.cv.css.trigger($.cv.css.eventnames.freightQuoteInstructsVisisble, { isVisible: true });
                                    $.cv.css.trigger($.cv.css.eventnames.freightQuoteSelected, { isSelected: false });
                                } else {
                                    _this.set("isFreightNormalCarriersVisisble", true);
                                    _this.set("isFreightNormalCarriersLabelVisisble", true);
                                }

                            }
                            else if (option[0].CarrierCode == "UseFreightOwnCarriers") {
                                // Handle making own freightcarriers actual list of carriers now visible for selection 
                                _this.set("isFreightUseOwnCarriersVisisble", true);
                                _this.set("isFreightNormalCarriersVisisble", false);
                                _this.set("isFreightNormalCarriersLabelVisisble", false);
                                _this.set("isFreightQuoteInstructsVisisble", false);
                                     
                                // Change to not set if was previously set
                                if (currentIsFghtQuoteSel) {
                                    _this.set("isFreightQuoteSelected", false);
                                }

                                // Let it be known what selection state is: Show the payment options
                                $.cv.css.trigger($.cv.css.eventnames.freightQuoteInstructsVisisble, { isVisible: false });
                                $.cv.css.trigger($.cv.css.eventnames.freightQuoteSelected, { isSelected: false });
                            }
                        }
                    }
                },
                
                setFreightQuoteSelected: function () {

                    var _this = viewModel;

                    // Need this hack for firefox to give a delay so that whenthis chekced function is called, the view model has chance to be updated otherwise gets opposite value.
                    window.setTimeout(_this.setFreightQuoteSelectedDoWork, 10);
                },

                setFreightQuoteSelectedDoWork: function () {

                    var _this = viewModel;
                    var isFghtQuoteSel = _this.get("isFreightQuoteSelected");

                    if (isFghtQuoteSel) {
                        var currFrghtId = _this.get("currentFreightID");
                        _this.set("previousFreightID", currFrghtId); // Store temp in case need to restore if unselect quote option
                        _this.set("currentFreightID", 0); // this will trigger setFreight() and clear.
                        _this.set("isFreightNormalCarriersVisisble", false); // Hide the Normal Carrier options if visible
                        _this.set("isFreightNormalCarriersLabelVisisble", false);
                    } else {
                        if (_this.get("hasFreightOptions") && !_this.get("isFreightOwnCarriersAvailable")) {
                            var prevFrghtId = _this.get("previousFreightID");
                            _this.set("currentFreightID", prevFrghtId); // Restore prev slection this will trigger setFreight()
                            _this.set("isFreightNormalCarriersVisisble", true); // make visible again
                            _this.set("isFreightNormalCarriersLabelVisisble", true);
                        }
                    }

                    // Let it be known what slection state is
                    $.cv.css.trigger($.cv.css.eventnames.freightQuoteSelected, { isSelected: isFghtQuoteSel });
                },


                setFreightOwnCarrier: function () {
                    var fw = $("#freight-wrapper");
                    var validator = fw.data("kendoValidator");

                    if (!validator && fw.kendoValidator) {
                        fw.kendoValidator(widget.options.validationOptions);
                        validator = fw.data("kendoValidator");
                    }

                    // Validate: Return if not valid so user forced to enter valid values.
                    if (validator && !validator.validate()) {
                        return;
                    }

                    var _this = viewModel;
                    var ownCarrierName = this.get("currentFreightOwnCarrierName");
                    var ownCarrierAccount = this.get("currentFreightOwnCarrierAccount");

                    if ((ownCarrierName == undefined || ownCarrierName == "")) {
                        _this.setMessage(widget.options.textNoOwnCarrierNameMessage, $.cv.css.messageTypes.error);
                        return;
                    }

                    if ((ownCarrierAccount == undefined || ownCarrierAccount == "")) {
                        _this.setMessage(widget.options.textNoOwnCarrierAccountMessage, $.cv.css.messageTypes.error);
                        return;
                    }

                    var option = $.grep(this.get("itemListOwnCarriers"), function (item, idx) { return (item.CarrierCode == ownCarrierName); });
                    if (option.length > 0) {
                        // Handle setting freight using selected own carrier, will need to set the currentFreightId for passing into to dyn serv call
                        this.set("currentFreightID", option[0].ID); // this will trigger setFreight()
                    }
                },

                setFreight: function (freightOptionIDs) {
                    var _this = this;

                    _this.clearMessage();

                    // Store if the user had a freight line that needed a quote for the carrier
                    var prevHasFrhtChgeLnReqeQuoteForCarrier = getHasFreightChargeLineRequiresQuote();

                    freightOptionIDs = freightOptionIDs || [];
                    if (freightOptionIDs.length === 0) {
                        var currFrghtId = this.get("currentFreightID");

                        // Note: isFreightQuoteSelected is for when no freight is available and there is an option to get a freight quote. 
                        // This is quite different to where individual freight options themselves have the "requires quote" detemined for the 
                        // carrier which is due to bulky items on the order and the carrier / zone option configured for needing a quote in such a case.
                        if (currFrghtId != null && currFrghtId !== "" && currFrghtId !== '' && currFrghtId >= 0 && !_this.get("isFreightQuoteSelected") && !_this.get("isLoadingWarehouses"))
                            freightOptionIDs.push(currFrghtId);

                        // clear out any empty strings
                        freightOptionIDs = $.grep(freightOptionIDs, function (data) {
                            return (data !== null && data !== "" && data !== '');
                        });
                    }

                    var warehouseCode = _this.get("showWarehousesForPickup") || _this.get("isLoadingWarehouses") ? _this.selectedWarehouseValue() : "";
                    
                    var ownCarrierAccount = _this.get("currentFreightOwnCarrierAccount");
                    var ownCarrierName = _this.get("currentFreightOwnCarrierName");

                    if (freightOptionIDs.length >= 0 || warehouseCode) {

                        // if ownCarrierName has value, meaning it's in a own freight carrier mode, the account must be provided. Otherwise a 
                        // server side error message will be received
                        if (!$.cv.util.isNullOrWhitespace(ownCarrierName) &&
                            $.cv.util.isNullOrWhitespace(ownCarrierAccount)) {
                            return;
                        }

                        _this.set("isProcessing", true);
                        _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget), { itemList: this.get("itemList") });

                        $.cv.css.trigger($.cv.css.eventnames.updateFreightStatusChanged, true);
                        var d1 = $.cv.css.freightCarrier.setFreightForCurrentOrder({ freightOptionIDs: freightOptionIDs, warehouseCode: warehouseCode, ownCarrierAccount: ownCarrierAccount });
                        $.when(d1).done(function (msg) {
                            _this.set("isProcessing", false);
                            var data = msg.data;
                            if (data.result) {
                                //$.cv.css.getCurrentOrder(); // reload the current order after successfully setting the freight
                                widget.trigger(FREIGHTSELECTED);

                                // If the order previously had a charge line for freight for selected carrier that needed a a quote for the amount
                                // but now doesn't need to trigger an event to payment options so can refresh it's datasource of payment options.
                                // The same goes for the opposite situation.
                                var currHasFrhtChgeLnReqeQuoteForCarrier = getHasFreightChargeLineRequiresQuote();

                                if ((prevHasFrhtChgeLnReqeQuoteForCarrier && !currHasFrhtChgeLnReqeQuoteForCarrier)
                                    || (!prevHasFrhtChgeLnReqeQuoteForCarrier && currHasFrhtChgeLnReqeQuoteForCarrier)) {
                                    $.cv.css.trigger($.cv.css.eventnames.freightQuoteSelected, { isSelected: currHasFrhtChgeLnReqeQuoteForCarrier, refreshPaymentOptionsDataSoure: true });
                                }

                            } else
                                _this.setMessage(data.errorMessage, $.cv.css.messageTypes.error);
                        }).fail(function () {
                            _this.set("isProcessing", false);
                            _this.setMessage(widget.options.textErrorSettingFreight, $.cv.css.messageTypes.error);
                        }).always(function() {
                            $.cv.css.trigger($.cv.css.eventnames.updateFreightStatusChanged, false);
                        });
                    }
                },

                estimateFreightOnEnter: function(event) {
                    if (event.which == 13) {
                        // stops the form from submitting when using the widget on a page that has form submit buttons
                        event.preventDefault();
                        event.stopPropagation();
                        this.calculateFreight();
                    }
                },

                calculateFreight: function () {
                    var _this = this, opts = {};
                    _this.clearMessage();
                    widget.options.dataSource = [];
                    setDataSource();
                    if (_this.get("calculatorPostcode") == "") {
                        _this.setMessage(widget.options.textPostCodeRequired, $.cv.css.messageTypes.error);
                    } else {
                        if (widget.options.validatePostcode && !$.cv.util.testRegEx(/^\d{4}$/, _this.get("calculatorPostcode"), false)) {
                            _this.setMessage(widget.options.textPostCodeInWrongFormat, $.cv.css.messageTypes.error);
                            return;
                        }
                        opts.postCode = _this.get("calculatorPostcode");
                        if (_this.get("calculatorCountryCode") != "")
                            opts.countryCode = _this.get("calculatorCountryCode");
                        _this.set("isProcessing", true);
                        var d1 = $.cv.css.freightCarrier.getFreightEstimateForCurrentOrder(opts);
                        $.when(d1).done(function (msg) {
                            _this.set("isProcessing", false);
                            if (msg.data.OptionGroups.length > 0) {
                                widget.options.dataSource = msg.data.OptionGroups; // [0].FreightOptions; Now using all freight groups as datasource, widget has been adjusted to cater for this.
                            }
                            else {
                                widget.options.dataSource = [];
                                _this.setMessage(widget.options.textNoFreightFoundDefaultMessage, $.cv.css.messageTypes.error);
                            }
                            setDataSource();
                        });
                    }
                },

                // A warehouse is selected from the drop-down list.
                pickupWarehouseChanged: function (e) {
                    this.setWarehouse();
                },

                flagSelectedWarehouse: function () {
                    var _this = this, selectedWarehouse = _this.selectedWarehouseValue();
                    $.each(_this.get("storeLocationData"), function (index, item) {
                        if (this.WarehouseCode && this.WarehouseCode == selectedWarehouse) {
                            item.set("isSelected", true);
                        } else {
                            item.set("isSelected", false);
                        }
                    });
                },

                setWarehouse: function () {
                    this.setFreight();
                    $.cv.css.trigger($.cv.css.eventnames.pickupWarehouseChanged, { warehouse: this.selectedWarehouseValue() });
                },

                validateInputFields: function (showMessages) {
                    // Ensure you can't checkout without selecting a freight option or pickup warehouse.

                    // Clear messages.
                    widget.viewModel.clearMessage();

                    var freightCarrierValid = true;
                    var errorMessage = "";

                    if (this.get("isAddressBeingEdited")) {
                        freightCarrierValid = false;
                    } else {
                        if (!this.get("showWarehousesForPickup") && !this.get("showWarehousesForPickupOrIsLoading") && this.get("showFreightSelector")) {
                            if (widget.options.enableWarehouseGroupFreight) {
                                if (!this.get("isProcessing")) {
                                    // Validate each freight group - make sure a freight option is selected from each group.
                                    var freightGroups = this.get("freightGroups");

                                    if (freightGroups.length === 0) {
                                        freightCarrierValid = false;
                                        errorMessage = widget.options.textNoFreightFoundDefaultMessage;
                                    } else {
                                        var invalid = $.grep(freightGroups, function (item, index) { return item.selectedID === null });
                                        if (invalid.length > 0) {
                                            switch (freightGroups.length) {
                                                case 1:
                                                    freightCarrierValid = false;
                                                    errorMessage = widget.options.freightOptionNotSelected;
                                                    break;

                                                default:
                                                    freightCarrierValid = false;
                                                    errorMessage = widget.options.multipleFreightOptionsNotSelected;
                                                    break;
                                            }
                                        }
                                    }
                                }
                            } else {
                                if (!(this.get("currentFreightID") != null && this.get("currentFreightID").toString() != "")) {
                                    freightCarrierValid = false;
                                    errorMessage = widget.options.freightOptionNotSelected;
                                }

                                if (this.get("currentFreightUseOwnCarrier") === 'UseFreightOwnCarriers') {

                                    if ($.cv.util.isNullOrWhitespace(this.get("currentFreightOwnCarrierAccount"))) {
                                        freightCarrierValid = false;
                                        errorMessage = widget.options.freightAccountNoNotProvided;
                                    }

                                    if($.cv.util.isNullOrWhitespace(this.get("currentFreightOwnCarrierName"))) {
                                        freightCarrierValid = false;
                                        errorMessage = widget.options.textNoOwnCarrierNameMessage;
                                    }
                                }

                                if ((this.get("currentFreightUseOwnCarrier") === 'UseNormalFreightCarriers') && !normalFreightCarrierSelected) {
                                    freightCarrierValid = false;
                                    errorMessage = widget.options.textNoNormalCarrierMessage;
                                }
                            }
                        }

                        if (this.get("showWarehousesForPickup") && this.get("selectedWarehouse") == null) {
                            freightCarrierValid = false;
                            errorMessage = widget.options.warehouseNotSelected;
                        }

                        if (!this.get("isInitialLoad") && errorMessage.length > 0) {
                            this.setMessage(errorMessage, $.cv.css.messageTypes.error);
                        }
                    }

                    $.cv.css.addRemovePageValidationError(freightCarrierValid, widget.name);
                    $.cv.css.trigger($.cv.css.eventnames.freightValidated);
                },

                ownFreightOptionClicked: function() {
                    normalFreightCarrierSelected = false;
                },

                ownFreightOptionCarrierClicked: function() {
                    normalFreightCarrierSelected = true;
                },

                getWarehousesForPickup: function (storeName) {
                    var vm = this;
                    // remove any freight that may have been previosuly selected
                    vm.set("isInitialLoad", true);
                    vm.set("showWarehousesForPickupOrIsLoading", true);
                    if (vm.get("storeLocationDataLoaded") == false) {
                        // Load store locations.
                        vm.set("isLoadingWarehouses", true);
                        var p = $.cv.css.storeLocator.getWarehousesForPickup();
                        $.when(p).done(function (data) {
                            $.each(data.data, function (idx, item) {
                                item.selectWarehouse = function () {
                                    vm.set("selectedWarehouse", item);
                                };
                            });
                            vm.set("storeLocationData", $.merge([{ StoreName: widget.options.textPleaseSelectWarehouse, WarehouseCode: "" }], data.data));
                            if (storeName.length > 0) {
                                $.each(data.data, function (idx, item) {
                                    vm.set("warehouseLoadedFromOrder", true);
                                    if (item.StoreName == storeName) {
                                        vm.set("selectedWarehouse", item);
                                    }
                                    vm.set("warehouseLoadedFromOrder", false);
                                });
                            }
                            if (vm.get("selectedWarehouse") == null) {
                                $.each(data.data, function (idx, item) {
                                    if (item.IsDefaultWarehouse) {
                                        vm.set("selectedWarehouse", item);
                                    }
                                });
                            }

                            vm.set("storeLocationDataLoaded", true);
                            widget.trigger(PICKUPWAREHOUSESLOADED);
                            // Show warehouse dropdown list.
                            vm.set("showWarehousesForPickup", true);
                            vm.set("isLoadingWarehouses", false);
                            vm.set("currentFreightID", "");
                            vm.validateInputFields();
                            vm.set("isInitialLoad", false);
                        });
                    } else {
                        vm.set("showWarehousesForPickup", true);
                        vm.set("currentFreightID", "");
                        if (vm.get("selectedWarehouse") != null) {
                            vm.pickupWarehouseChanged();
                        }
                        vm.validateInputFields();
                        vm.set("isInitialLoad", false);
                    }
                },

                // Freight groups.
                freightGroups: []
            });

            // "Delivery address mode changed" event.
            $.cv.css.bind($.cv.css.eventnames.deliveryAddressModeChanged,
                function(msg) {
                    switch (msg.message) {
                    case "Delivery":
                        // Hide warehouse dropdown list.
                        viewModel.set("showWarehousesForPickup", false);
                        viewModel.set("showWarehousesForPickupOrIsLoading", false);
                        viewModel.set("isInitialLoad", true);
                        break;

                    case "Pickup":
                        viewModel.getWarehousesForPickup("");
                        break;
                    }
                });


            var normalFreightCarrierSelected = false;

            viewModel.bind("change", function (e) {
                var ownCarrierName = this.get("currentFreightOwnCarrierName");
                var ownCarrierAccount = this.get("currentFreightOwnCarrierAccount");

                if (e.field === "freightGroups" &&
                    !widget.options.isFreightCalculator &&
                    !viewModel.get("showWarehousesForPickup") &&
                    !viewModel.get("showWarehousesForPickupOrIsLoading")) {                    
                    viewModel.validateInputFields();
                    viewModel.freightSelected();
                }
                else if (e.field == "currentFreightID" && !widget.options.isFreightCalculator && !viewModel.get("showWarehousesForPickup") && !viewModel.get("showWarehousesForPickupOrIsLoading")) {

                    viewModel.validateInputFields();
                    viewModel.freightSelected();
                }
                else if (e.field == "currentFreightUseOwnCarrier" && !widget.options.isFreightCalculator) {
                    viewModel.freightSelectedInitialOwnCarrier();
                }
                else if (e.field === 'currentFreightOwnCarrierName' || e.field === 'currentFreightOwnCarrierAccount') {

                    var option = $.grep(this.get("itemListOwnCarriers"), function (item) { return (item.CarrierCode == ownCarrierName); });
                    if (option.length > 0 && !$.cv.util.isNullOrWhitespace(ownCarrierAccount)) {
                        this.set("currentFreightID", option[0].ID); // this will trigger setFreight()

                        if (e.field === 'currentFreightOwnCarrierAccount') {
                            viewModel.setFreight();
                        }
                    }
                }
                if (e.field == "selectedWarehouse") {
                    $.cv.css.localSetcurrentPickupAddress(viewModel.get("selectedWarehouse"));
                    viewModel.flagSelectedWarehouse();
                    if (!viewModel.get("warehouseLoadedFromOrder")) {
                        viewModel.pickupWarehouseChanged();
                    }
                    viewModel.validateInputFields();
                }
            });

            if (widget.options.getDataOnInit && !widget.options.isDeliveryMethodsInUse)
                initDataSource();

            return viewModel;
        },

        _getDefaultViewTemplate: function () {
            var self = this;
            var html =
                    "<div id='freight-wrapper'>" +
					    "<!-- If have functionality configured choose if wish to use own carriers instead, or just use normal freight, also Store Pickup if normally available -->" +
			            "<select data-bind='visible:isFreightOwnCarriersAvailable, source:itemListInitialOwnCarriers, value: currentFreightUseOwnCarrier' data-text-field='CarrierDescription' data-value-field='CarrierCode'>&nbsp;</select>" +
						"<!-- If Chose want to use own carriers instead of normal freight, now choose an actual own carrier from those available -->" +
						"<div id='divFreightOwnCarriersSelection' data-bind='visible:isFreightUseOwnCarriersVisisble'>" +
							"<label><span><br /><br />Select from your list of own Carriers<br /></span></label>" +
			                "<select data-bind=' source:itemListOwnCarriers, value: currentFreightOwnCarrierName' data-text-field='CarrierDescription' required data-required-msg='Required' validationMessage='Your own Carrier selection is required'  data-value-field='CarrierCode'>&nbsp;</select>" +
							"<label><span><br /><br />Your Freight Account No.</span></label>" +
							"<input maxlength='25' type='text' required data-required-msg='Required' validationMessage='Your own Freight Account No. is required' data-bind='value: currentFreightOwnCarrierAccount'>" +
                            "<a href='javascript:$.noop()' id='button-save-freight-own-carrier' data-bind='click: setFreightOwnCarrier'>Update</a>" +
						"</div>" +
						"<!-- Choose from normal freight options available -->" +
						"<label data-bind='visible:isFreightNormalCarriersLabelVisisble'><span><br /><br />Select freight on order<br /></span></label>" +
			            "<select data-bind='visible:isFreightNormalCarriersVisisble, source: itemList, value: currentFreightID' data-text-field='CarrierDescription' data-value-field='ID'>&nbsp;</select>" +
                        "</ul>" +
                   "</div>";

            return html;
        }

    };

    $.cv.ui.widget(freightCarrierWidget);

})(jQuery);
