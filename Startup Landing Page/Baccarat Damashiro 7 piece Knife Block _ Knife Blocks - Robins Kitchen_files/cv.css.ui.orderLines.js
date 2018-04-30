/* Name: order lines
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
*          /Scripts/cv.ajax.js
*          /Scripts/cv.css.orders.js
* Params:  
*       dataSource: 
*       autoBind: 
*       triggerMessages: 
*       messagesUseLineSeq: 
*       linesRendered: 
*       noteIsExtendedLineDescription: 
*       textLineUpdatedSuccessfully: 
*       textLinesUpdatedSuccessfully: d
*       textLinesUpdatedUnSuccessfully: 
*       textLinesUpdatedErrored: 
*       textEnterNumeric: 
*       viewTemplate: 
*       itemViewTemplate: null
*/
;
(function ($, undefined) {

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        LINESRENDERED = "linesRendered",
        CHARGELINESRENDERED = "chargeLinesRendered",
        CHARGELINESWITHOUTFREIGHTRENDERED = "chargeLinesWithoutFreightRendered",
        PRODUCTADDEDTOFAVOURITES = "productAddedToFavourites",
        PRODUCTADDTOFAVOURITESFAIL = "productAddToFavouritesFail",
        PRODUCTREMOVEDFROMFAVOURITES = "productRemovedFromFavourites",
        PRODUCTREMOVEDFROMFAVOURITESFAIL = "productRemovedFromFavouritesFail",
        STOCKLINE = "SN",
        NOTELINE = "DN",
        KITLINE = "KN",
        CHARGELINE = "SC",
        ITEMLISTVIEW = "itemListView",
        CHARGELINELISTVIEW = "chargeLineListView",
        NONCHANGEDEVENTS = ["HasErrors", "ErrorMessages", "ErrorTypes", "lastValidQuantity", "quantityReset", "requiresUpdate", "requiresDelete",
            "isDeleting", "removingFromFavourites", "addingToFavourites", "isFavourite", "hasOutOfStockNotify", "isShowAlternatesVisible", "PreventCheckout", "forceOrderPackQty"],
        LINESUPDATED = "linesUpdated",
        OPTIONENABLEDSUFFIX = "-enabled",
        OPTIONDISABLEDSUFFIX = "-disabled";

    var orderLinesWidget = {

        // Standard Variables

        // widget name
        name: "orderLines",

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            designStampUrl: "StampDesign.aspx?id={0}",
            clearAdditionalWidgetMessages: "quickAdd", // comma separated list of widget names
            pricingOnOrderGridClass: "ol-pricing-on-order-grid",
            orderLineNotesClass: "ol-order-line-notes",
            useOrderEntryClass: "ol-use-order-entry",
            notesRequiredForNonContractClass: "ol-notes-required-for-non-contract",

            // viewModel flags
            autoBind: true,
            triggerMessages: true,
            clearExistingMessages: false,
            messagesUseLineSeq: false,
            getLatestOrderOnLoad: false,
            lineErrorSeparator: ", ",
            freightChargeType: 0,
            modalEditClass: "modal-rep-edit",

            // events
            linesRendered: null,

            // view flags
            noteIsExtendedLineDescription: true,
            includeInBrowserHistory: true,
            isAddToFavouritesAMove: false,
            allowDecimals: false,
            updateLinesDuringDelete: false,

            // view text defaults
            textProductAddedToFavourites: 'Your product has been successfully added to your favourites',
            textDefaultErrorAddingToFavourites: 'Error adding this product to your favourites, it may already exist',
            textProductRemovedFromFavourites: "Product {0} has been successfully removed from your favourites",
            textDefaultErrorRemovedFromFavourites: "Error removing {0} from your favourites, it may have already been removed",

            // widget settings
            hidePricingInOrderGrid: false,
            enableOrderLineNotes: false,
            useCostCentres: false,
            userOrderEntry: true,
            notesRequiredForNonContractPurchasing: false,
            isAdvancedQuoteOrder: false,
            defaultLinesSortField: "",
            defaultLinesSortDirection: "",
            textLineUpdatedSuccessfully: 'Line updated successfully',
            textLinesUpdatedSuccessfully: 'updated successfully',
            linesUpdatedSuccessfullyGeneric: '',
            textLinesUpdatedUnSuccessfully: 'updated unsuccessfully',
            textLinesDeletedUnSuccessfully: 'deleted unsuccessfully',
            linesUpdatedUnSuccessfullyGeneric: '',
            textLinesUpdatedErrored: 'There was an error trying to update the lines',
            textEnterNumeric: 'Please enter a numeric quantity',
            textLineDeletedSuccessfully: 'Product Code {0} has been removed',
            textLinesDeletedSuccessfully: 'Products {0} have been removed',
            bindOrderLineRemoveEvent: true,

            // Stamps
            stampDesignMethod: "Standard",
            emailAddress: "",
            colopReturnUrl: "",

            // need to reload all lines, such as the case of multi line discount
            refreshOrderAfterLineUpdate: false,

            // This can be used when need to show details for some other order other than the users current order e.g. order searching, quotes etc.
            // Note: Currently it has only been implemented here for retreival and display in a read only fashion (e.g. can be used in checkout summary not 
            // in cart view). If this needs to be changed bear in mind that any functions in here that alter the lines will likely need changes for this.
            orderNoOverride: 0,

            // Product Store Availability Click and Collect options
            enableStoreAvailabilityClickAndCollect: false, // When this is used, need to set visibility of related availability icons on each line.
            storeAvailClickAndCollectDeliveryDisplayMode: "", // for Product Store Availability Click and Collect whether Delivery is in Standard or Warehouse Transfer Zone mode 
            currentPickupStoreName: "",
            // Show Nearby Pickup Stores Availability Click and Collect options
            checkNearbyStoresPickupAvailMaximumStores: 3,
            includeCurrentStoreInNearbyStoresAvailCheck: true,
            textProductNoNearbyStoresHaveAvail: "This item is either not currently available for pickup from any stores near to your current store, or there are no other stores close by.",
            textProductErrorCheckingNearbyStoresAvail: "Error checking availability from nearby stores near to your current store, or there are no other stores close by.",


            // view Template
            stampsTemplate: "#stampsTemplate",
            stampsWidgetContainer: ".stampsWidgetContainer",
            viewTemplate: null, // TODO: Treat these as IDs, remove the last one.
            itemViewTemplate: null,
            chargeLineViewTemplate: null,
            gtmPageType: ''
            //itemTemplateId: "cvgrid-item-template-" + kendo.guid()
        },

        events: [DATABINDING, DATABOUND, LINESRENDERED, CHARGELINESRENDERED, CHARGELINESWITHOUTFREIGHTRENDERED, LINESUPDATED, PRODUCTADDEDTOFAVOURITES, PRODUCTADDTOFAVOURITESFAIL, PRODUCTREMOVEDFROMFAVOURITES, PRODUCTREMOVEDFROMFAVOURITESFAIL],

        viewModel: null,

        view: null,

        // MVVM Support

        // private property
        _viewAppended: false,
        _itemViewAppended: false,
        _chargeLineViewAppended: false,


        // Standard Methods
        initialise: function (el, o) {

            var widget = this;

            var internalView = $(el).children(":first");
            if (internalView.data("view")) {
                widget.view = internalView.html();
            } else {
                // setup grid view
                widget._viewAppended = true;
                if (!widget.options.itemViewTemplate) {
                    // generate an item template name and flag it to be created
                    widget.options.itemViewTemplate = widget.name + "-item-template-" + kendo.guid();
                    widget._itemViewAppended = true;
                }
                if (!widget.options.chargeLineViewTemplate) {
                    // generate an item template name and flag it to be created
                    widget.options.chargeLineViewTemplate = widget.name + "-charge-line-template-" + kendo.guid();
                    widget._chargeLineViewAppended = true;
                }
                // get template text and parse it with the options
                var templateText = widget.options.viewTemplate ? $("#" + widget.options.viewTemplate).html() : widget._getDefaultViewTemplate();
                var viewTemplate = kendo.template(templateText);
                widget.view = viewTemplate(widget.options);
                // add the itemView (not parsed)
                if (!widget._itemViewAppended) {
                    widget.view += widget._getDefaultItemViewTemplate();
                }
                // add the chargeLineView (not parsed)
                if (!widget._chargeLineViewAppended) {
                    widget.view += widget._getDefaultChargeLineViewTemplate();
                }
                widget.element.html("<div class='cv-widget-wrapper'>" + widget.view + "</div>");
            }
            widget.viewModel = widget._getViewModel();
            // bind view to viewModel
            var target = widget.element.children(":first");
            kendo.bind(target, widget.viewModel);

            // Subscribe to Events
            $.cv.css.bind($.cv.css.eventnames.orderChanged, $.proxy(widget.viewModel.cartUpdated, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.localOrderChanged, $.proxy(widget.initDataSource, widget));
            $.cv.css.bind($.cv.css.eventnames.validateOrderStarted, $.proxy(function () { widget.viewModel.set("isValidating", true); }, widget));
            $.cv.css.bind($.cv.css.eventnames.validateOrderComplete, $.proxy(function () { widget.viewModel.set("isValidating", false); }, widget));
            $.cv.css.bind($.cv.css.eventnames.orderLinesOnlyShowErrors, $.proxy(widget.viewModel.onlyShowErrors, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.showAlternatesButton, $.proxy(widget.viewModel.showAlternatesButton, widget.viewModel));
            if (widget.options.bindOrderLineRemoveEvent === true) {
                $.cv.css.bind($.cv.css.eventnames.removeLineFromCartAfterSelectingNotifyWhenInStock, $.proxy(widget.viewModel.removeLineFromCartAfterSelectingNotifyWhenInStock, widget.viewModel));
            }

            if (widget.options.stampDesignMethod === "Colop") {
                $.cv.css.bind($.cv.css.eventnames.colopStampChanged, $.proxy(widget.viewModel.colopStampChanged, widget.viewModel));
            }

            if (widget.options.getLatestOrderOnLoad) {
                widget.viewModel.set("isProcessing", true);
                // Get the order lines that the widget is using from local storage. It could be either the users current 
                // order or some other order if have a orderNoOverride set e.g. order searching, approvals, quotes etc.
                var theOrderLines = widget.options.orderNoOverride === 0
                                        ? $.cv.css.getCurrentOrderLines()
                                        : $.cv.css.getOrderLines({ orderNo: widget.options.orderNoOverride, isLocalSetSelectedOrderLines: true });

                theOrderLines.done(function () {
                    // trigger local orderchanged - this will notify widgets
                    $.cv.css.trigger($.cv.css.eventnames.localOrderChanged);
                    widget.viewModel.set("isLoadingLines", false);
                    widget.viewModel.set("isProcessing", false);
                });
            } else {
                widget.initDataSource();
            }
        },

        initDataSource: function () {
            var widget = this;
            // get local storage
            // if no local storage make dynamic service call
            // Get the order lines that the widget is using from local storage. It could be either the users current 
            // order or some other order if have a orderNoOverride set e.g. order searching, approvals, quotes etc.
            var ds = widget.options.orderNoOverride === 0
                            ? $.cv.css.localGetCurrentOrderLines()
                            : $.cv.css.localGetSelectedOrderLines();
            if (ds) {
                widget.retainLineMessages(ds);
                widget.setDataSource(ds);
            }

        },

        retainLineMessages: function (ds) {
            var widget = this, updatedLines = [], addedLines = [], linesToIgnore = [], localUpdatedCurrentOrderLines = $.cv.css.localGetUpdatedCurrentOrderLines();
            if (widget.dataSource) {
                if (localUpdatedCurrentOrderLines == null)
                    localUpdatedCurrentOrderLines = { addedLines: [], updatedLines: [], linesDeleted: false };
                updatedLines = localUpdatedCurrentOrderLines["updatedLines"];
                addedLines = localUpdatedCurrentOrderLines["addedLines"];
                if (updatedLines != null && addedLines != null)
                    linesToIgnore = _.union(updatedLines, addedLines);
                else {
                    if (updatedLines != null)
                        linesToIgnore = updatedLines;
                    else if (addedLines != null)
                        linesToIgnore = addedLines;
                }
                if (linesToIgnore.length == 0) {
                    if (localUpdatedCurrentOrderLines["linesDeleted"] != undefined && localUpdatedCurrentOrderLines["linesDeleted"])
                        linesToIgnore = ["0"];
                }
                // if the updated lines array is not empty retain the error message status on all the non updated lines as they would not have been revalidated
                if (linesToIgnore.length > 0) {
                    rList = _.reject(widget.dataSource.data(), function (item) { return _.contains(linesToIgnore, item.LineSeq.toString()); });
                } else {
                    rList = widget.dataSource.data();
                }
                $.each(ds, function (idx, item) {
                    data = _.find(rList, function (lItem) { return lItem.LineSeq == item.LineSeq; });
                    if (data) {
                        ds[idx].HasErrors = data.HasErrors;
                        ds[idx].ErrorMessages = data.ErrorMessages;
                        ds[idx].ErrorTypes = data.ErrorTypes;
                    }
                });
            }
        },

        // for supporting changing the datasource via MVVM
        setDataSource: function (dataSource) {
            // set the internal datasource equal to the one passed in by MVVM
            this.options.dataSource = dataSource;
            // rebuild the datasource if necessary, or just reassign
            this._dataSource();
        },

        _dataSource: function () {
            var widget = this;
            // if the DataSource is defined and the _refreshHandler is wired up, unbind because
            // we need to rebuild the DataSource
            if (widget.dataSource && widget._refreshHandler) {
                widget.dataSource.unbind(CHANGE, widget._refreshHandler);
            }
            else {
                widget._refreshHandler = $.proxy(widget.refresh, widget);
            }

            // returns the datasource OR creates one if using array or configuration object
            widget.dataSource = kendo.data.DataSource.create(widget.options.dataSource);
            if (widget.viewModel) {
                widget.viewModel.set("dataSource", widget.dataSource);
            }

            // bind to the change event to refresh the widget
            widget.dataSource.bind(CHANGE, widget._refreshHandler);

            this._sortDataSource();

            if (widget.options.autoBind) {
                widget.dataSource.fetch();
            }
        },

        _sortDataSource: function () {
            var widget = this;
            if (widget.options.defaultLinesSortField != undefined && widget.options.defaultLinesSortField.length > 0) {
                var dssort = widget.dataSource.sort();
                if (dssort == undefined || dssort.length == 0) {
                    var direction = widget.options.defaultLinesSortDirection.length > 0 ? widget.options.defaultLinesSortDirection : "asc";
                    widget.dataSource.sort({ field: widget.options.defaultLinesSortField, dir: direction });
                }
            }
        },

        refresh: function (e) {
            if (e.action == "itemchange")
                return;
            var widget = this;
            widget.trigger(DATABINDING);
            widget.viewModel.updateViewModelFromDataSource();
            widget.trigger(DATABOUND);
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

        displayLineMessages: function (msgs, lines) {
            var widget = this;
            widget.viewModel.displayLineMessages(msgs, lines);
        },

        clearLineMessages: function (lines) {
            var widget = this;
            widget.viewModel.clearLineMessages(lines);
        },

        updateAllLines: function () {
            var widget = this;
            widget.viewModel.updateAllLines();
        },

        updateLinesFlaggedForUpdate: function (displayMessages, triggerOrderRefresh) {
            var widget = this;
            var d = widget.viewModel.updateLinesFlaggedForUpdate(displayMessages, triggerOrderRefresh);
            return d;
        },

        deleteAllLines: function () {
            var widget = this;
            var d = widget.viewModel.deleteAllLines();
            return d;
        },

        deleteLinesFlaggedForDelete: function (displayMessages, triggerOrderRefresh) {
            var widget = this;
            var d = widget.viewModel.deleteLinesFlaggedForDelete(displayMessages, triggerOrderRefresh);
            return d;
        },

        refreshLines: function () {
            var widget = this;
            widget.viewModel.refreshLines();
        },

        getLineErrorCount: function () {
            var widget = this;
            return widget.viewModel.getLineErrorCount();
        },

        getLinePreventChecktoutCount: function () {
            var widget = this;
            return widget.viewModel.getLinePreventChecktoutCount();
        },

        // private function
        _getViewModel: function () {
            var widget = this;

            initSettings = function () {
                if ($.cv.css.userFavourites.defaults)
                    $.cv.css.userFavourites.defaults.returnMessageOnAddFavourite = true;
            };

            var getChargeLines = function (data) {
                var array = [];
                if (data != null) {
                    $.each(data, function (idx, item) {
                        if ($.cv.util.hasValue(item) && item.LineType === CHARGELINE) {
                            array.push(item);
                        }
                    });
                }
                return array;
            };

            var appendLineCharge = function (array, item) {
                var lineSeqForCharge = Math.floor(item.LineSeq);
                var lineItem = $.grep(array, function (e) { return e.LineSeq == lineSeqForCharge; });
                if (lineItem.length == 1) {
                    if (lineItem[0].lineCharges == undefined)
                        lineItem[0].lineCharges = [];
                    lineItem[0].lineCharges.push(item);
                    lineItem[0].hasLineCharges = true;
                }
            };

            var appendNoteLine = function (array, item) {
                var lineSeqForNote = Math.floor(item.LineSeq);
                var lineItem = $.grep(array, function (e) { return e.LineSeq == lineSeqForNote; });
                if (lineItem.length == 1) {
                    if (widget.options.noteIsExtendedLineDescription) {
                        lineItem[0].ExtendedLineDescription = item.Description + " ";
                        lineItem[0].requiresUpdate = true;
                        item.requiresDelete = true;
                    }
                    if (lineItem[0].lineNotes == undefined)
                        lineItem[0].lineNotes = [];
                    lineItem[0].lineNotes.push(item);
                    lineItem[0].hasLineNotes = true;
                }
            };

            var getStockLines = function (data) {
                var array = [];
                if (data != null) {
                    $.each(data, function (idx, item) {
                        if ($.cv.util.hasValue(item) && (item.LineType === STOCKLINE || item.LineType === KITLINE)) {
                            item.lineNotes = [];
                            item.hasLineNotes = false;
                            item.lineCharges = [];
                            item.hasLineCharges = false;
                            if (item.LineSeq % 1 == 0) {
                                array.push(item);
                            } else {
                                appendLineCharge(array, item);
                            }
                        } else if ($.cv.util.hasValue(item) && item.LineType === NOTELINE) {
                            appendNoteLine(array, item);
                        }
                    });
                }
                return array;
            };

            var getDataView = function (listView) {
                // check if ds is initialised
                var array = [];
                if (!widget.dataSource)
                    return array;
                if (listView == ITEMLISTVIEW) {
                    array = getItemListView();
                } else if (listView == CHARGELINELISTVIEW) {
                    array = getChargeLineListView();
                }
                return array;
            };

            var getItemListView = function () {
                var array = [], stockLineIndex = 0, noteLineIndex = 0, batchLineUpdates = [], batchLineDeletes = [];
                $.each(getStockLines(widget.dataSource.view()), function (idx, item) {
                    // add standard commands
                    item.Index = idx;
                    item.lastValidQuantity = item.OrderedQty;

                    //
                    // Items used for price / discount overrideing e.g. Reps
                    // BEGIN
                    //

                    // Will bind to either these for Item Price display in line detail and will initially hold the OrderItemPrice /  OrderNetItemPrice or then 
                    // what user overrides to before Update. So will reflect entered changes in line detail before user applies the Update.
                    item.displayableOrderItemPrice = item.OrderItemPrice;
                    item.displayableOrderNetItemPrice = item.OrderNetItemPrice;

                    // Will bind to this for Discount display in line detail and will initially hold the SolDiscRate or then what user overrides to before Update
                    item.displayableItemDiscountRate = item.SolDiscRate / 100;

                    // These will bind for the override price  / discount values enterable in popup that is then used to update the line's item price / discount
                    item.overrideOrderItemPrice = item.displayableOrderItemPrice;
                    item.overrideOrderNetItemPrice = item.displayableOrderNetItemPrice;
                    item.overrideItemDiscountRate = item.SolDiscRate;

                    // These will always store the original Item Price / Discount values from the line before update in case ever need to restore back 
                    // for display purposes.
                    item.origOrderItemPrice = item.OrderItemPrice;
                    item.origOrderNetItemPrice = item.OrderNetItemPrice;
                    item.origItemDiscountRate = item.SolDiscRate / 100;

                    // These will hold / track whether the Item Price / Discount values have ever been overriden before we Update the line.
                    item.isPriceOverriden = false;
                    item.isDiscOverriden = false;

                    //
                    // Items used for price / discount overrideing e.g. Reps
                    // END
                    //

                    item.quantityReset = false;
                    item.isShowAlternatesVisible = false;
                    if (item.requiresUpdate === undefined)
                        item.requiresUpdate = false;
                    if (item.requiresDelete === undefined)
                        item.requiresDelete = false;
                    if (item.isProcessing === undefined)
                        item.isProcessing = false;
                    if (item.isUpdating === undefined)
                        item.isUpdating = false;
                    if (item.isDeleting === undefined)
                        item.isDeleting = false;
                    if (item.addingToFavourites === undefined)
                        item.addingToFavourites = false;
                    if (item.removingFromFavourites === undefined)
                        item.removingFromFavourites = false;
                    if (item.isLineEditable === undefined)
                        item.isLineEditable = !widget.options.isAdvancedQuoteOrder;

                    setClickAndCollectStoreAvailabilityIconsForItem(item);
                    
                    item.execCommand_showAlternates = function ()
                    {
                        $.cv.css.trigger($.cv.css.eventnames.showAlternatesPopup, item);
                    }

                    item.execCommand_destroy = function () {
                        item.isProcessing = true;
                        viewModel.setLocalLinesDeleted(true);

                        // set this line as requires delete
                        item.set("requiresDelete", true);
                        // ensure no updates are attempted on this line as it will be deleted
                        item.set("requiresUpdate", false);
                        item.set("isDeleting", true);

                        var currentLineDelete = new $.Deferred(), updates = new $.Deferred(), deletes = new $.Deferred();
                        // if update lines during delete is turned on we want to process any other updates and all deletes including the delete of this line, only trigger messages for updates
                        if (widget.options.updateLinesDuringDelete && _.filter(viewModel.get("itemList"), function (i) { return i.requiresUpdate && !i.requiresDelete; }).length > 0) {
                            // We don't wan't to trigger refresh of the order (orderChanged event) as this
                            // will cause a reload of the order from localStorage and re-binding of the
                            // dataSource, which results in wrong lines...
                            deletes = viewModel.deleteLinesFlaggedForDelete(false, false);
                            updates = viewModel.updateLinesFlaggedForUpdate(true, false);

                            currentLineDelete.resolve();
                        } else {
                            _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
                            currentLineDelete = $.cv.css.deleteCurrentOrderLine({ seq: item.LineSeq.toString(), triggerOrderRefresh: false, gtmPageType: widget.options.gtmPageType, description: item.Description, productCode: item.StockCode, price: item.OrderItemPrice, category: item.Product[0].CategoryDescription, quantity: item.OrderedQty });
                            updates.resolve();
                            deletes.resolve();
                        }

                        $.when(currentLineDelete, updates, deletes).done(function (data) {
                            // Check if any issue deleteing line e.g. compuslosry items not all deleted together when have clusters.
                            if (data && data.length > 0 && data[0] && data[0].data) {
                                var currLineDelResult = data[0].data;

                                if (typeof currLineDelResult.deleteLineOk !== "undefined" && currLineDelResult.deleteLineOk === false) {
                                    item.set("isDeleting", false);
                                    viewModel.clearMessage();
                                    viewModel.setMessage("Line " + widget.options.textLinesDeletedUnSuccessfully + ". " + currLineDelResult.message, $.cv.css.messageTypes.error);
                                    return;
                                }
                            }

                            // Reload order and lines and trigger orderChanged so that dataSource
                            // is re-set and bound etc... deleted lines will not be in the 
                            // data returned and set into localStorage, so no need in this case to
                            // remove it from the dataSource
                            $.when($.cv.css.getCurrentOrder(), $.cv.css.getCurrentOrderLines()).always(function () {
                                $.cv.css.trigger($.cv.css.eventnames.orderChanged);

                                item.set("isDeleting", false);
                                viewModel.clearMessage();

                                if (item.StockCode != null) {
                                    viewModel.setMessage(widget.options.textLineDeletedSuccessfully.format(item.StockCode), $.cv.css.messageTypes.success);
                                }
                            });
                        });
                    };

                    // stock lines and note lines can be individually deleted
                    if (item.lineNotes != undefined && item.lineNotes.length > 0) {
                        $.each(item.lineNotes, function (idx2, lineNote) {
                            lineNote.execCommand_destroy = function () {
                                lineNote.isProcessing = true;
                                _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
                                var d1 = $.cv.css.deleteCurrentOrderLine({ seq: lineNote.LineSeq.toString() });
                                $.when(d1).done(function (data) {
                                    //item.lineNotes[idx2].pop();
                                    item.lineNotes = item.lineNotes.splice(idx2, 1);
                                });
                            };
                        });
                    }

                    // these only apply to stock lines
                    item.stockLineIndex = stockLineIndex++;
                    item.hidePricingInOrderGrid = viewModel.get("hidePricingInOrderGrid");
                    item.notesRequiredForNonContractPurchasing = widget.options.notesRequiredForNonContractPurchasing;
                    item.enableOrderLineNotes = viewModel.get("enableOrderLineNotes");
                    item.useCostCentres = viewModel.get("useCostCentres");
                    item.userOrderEntry = viewModel.get("userOrderEntry");
                    item.originalQuantity = item.SolBackorderQty;
                    
                    // Stuff for "Click And Collect Store Availability" for showing nearby stores (to current store) pickup avail for product
                    item.nearbyStoreLocations = [];
                    item.noNearbyStoreLocations = false;

                    if (item.HasErrors == undefined)
                        item.HasErrors = false;
                    if (item.ErrorMessages == undefined)
                        item.ErrorMessages = "";
                    if (item.ErrorTypes == undefined)
                        item.ErrorTypes = "";
                    // to make it correct casing and inline with the casing of all other view model attributes (this is also the casing as used in the product widget - these need to be consistent)
                    if (item.CostCentreCode != undefined) {
                        item.costCentreCode = item.CostCentreCode;
                        // this ensure that if you are displaying the product cost centre box that the line cost centre value is displayed, it also stops the change event triggering when the product cost centre resource is set to use data-bind="valueWithDefault: costCentreCode"
                        if (item.CostCentreCodeControl != undefined && $(item.CostCentreCodeControl).attr("value") != undefined) {
                            item.CostCentreCodeControl = $(item.CostCentreCodeControl).attr("value", item.CostCentreCode).wrap("<div />").parent().html();
                        }
                        item.set("costCentreCode", item.CostCentreCode);
                    }
                    if (widget.options.notesRequiredForNonContractPurchasing) {
                        // this ensure that if you are displaying the non contract reason it stops the change event triggering when the non contract reason resource is set to use data-bind="valueWithDefault: nonContractReason"
                        if (item.NonContractReasonInputField != undefined && $(item.NonContractReasonInputField).attr("value") != undefined) {
                            item.set("nonContractReason", $(item.NonContractReasonInputField).attr("value"));
                        }

                    }
                    item.execCommand_updateErrorMessage = function (hasErrors, errorMessages, errorTypes, preventCheckout) {
                        this.set("HasErrors", hasErrors);
                        this.set("ErrorMessages", errorMessages);
                        this.set("ErrorTypes", errorTypes);
                        this.set("PreventCheckout", preventCheckout);
                    };

                    item.execCommand_updateWarningMessage = function (hasWarning, warningMessages, warningTypes) {
                        this.set("HasWarning", hasWarning);
                        this.set("WarningMessages", warningMessages);
                        this.set("WarningTypes", warningTypes);
                    };

                    item.inputEventKeyUp = function (event) {
                        if (event.which == 13) {
                            // stops the form from submitting when using the widget on a page that has form submit buttons
                            event.preventDefault();
                            event.stopPropagation();
                            item.execCommand_update();
                        }
                    };
                    item.execCommand_update = function () {
                        updateLineItem(item);
                    };

                    // Used for handling ok button event from price / discount override modal pop-up to update line detail display
                    // with entered values. Doesn't actually Update the line to the server.
                    item.execCommand_setPriceOrDiscount = function () {
                        // First check Item Price

                        // Could be that either the OrderItemPrice or OrderNetItemPrice is the field being shown to the user in 
                        // line details so will need to update either withg newe entered value in case.
                        var newOrderItemPrice = item.get("overrideOrderItemPrice");
                        if (typeof newOrderItemPrice == "string") {
                            var parsedOip;
                            newOrderItemPrice = isNaN(parsedOip = parseFloat(newOrderItemPrice)) ? -1 : parsedOip;
                        }
                        if (!(isNaN(newOrderItemPrice) || newOrderItemPrice < 0)) {
                            // Has it actually changed form the original?
                            if (item.origOrderItemPrice !== newOrderItemPrice) {
                                item.set("displayableOrderItemPrice", newOrderItemPrice);
                            } 
                        }

                        var newOrderNetItemPrice = item.get("overrideOrderNetItemPrice");
                        if (typeof newOrderNetItemPrice == "string") {
                            var parsedOnip;
                            newOrderNetItemPrice = isNaN(parsedOnip = parseFloat(newOrderNetItemPrice)) ? -1 : parsedOnip;
                        }
                        if (!(isNaN(newOrderNetItemPrice) || newOrderNetItemPrice < 0)) {
                            // Has it actually changed form the original?
                            if (item.overrideOrderNetItemPrice !== newOrderNetItemPrice) {
                                item.set("displayableOrderNetItemPrice", newOrderNetItemPrice);
                            }
                        }

                        // Flag if changed any of them
                        if (item.get("origOrderItemPrice") !== item.get("displayableOrderItemPrice")
                            || item.get("overrideOrderNetItemPrice") !== item.get("displayableOrderNetItemPrice")) {
                            item.set("isPriceOverriden", true);
                        } else {
                            item.set("isPriceOverriden", false);
                        }

                        // Now check Item Discount

                        var newItemDiscount = item.get("overrideItemDiscountRate");
                        if (typeof newItemDiscount == "string") {
                            var parsedDisc;
                            newItemDiscount = isNaN(parsedDisc = parseFloat(newItemDiscount)) ? -1 : parsedDisc;
                        }
                        if (!(isNaN(newItemDiscount) || newItemDiscount < 0 || newItemDiscount > 100))
                            item.set("displayableItemDiscountRate", newItemDiscount / 100);

                        // Flag if changed it
                        if (item.get("origItemDiscountRate") !== item.get("displayableItemDiscountRate")) {
                            item.set("isDiscOverriden", true);
                        } else {
                            item.set("isDiscOverriden", false);
                        }

                        if (item.get("isPriceOverriden") === true
                            || item.get("isDiscOverriden") === true) {
                            item.execCommand_update();
                        }
                    };

                    item.inputPriceOrDiscountEventKeyPress = function (event) {
                        if (event.which == 13) {
                            // prevent the default methods for the enter key, helps stop the form submitting when there is a input of type submit on the page somewhere
                            event.preventDefault();
                            event.stopPropagation();
                            $.fancybox.close();
                            item.execCommand_setPriceOrDiscount();
                        }
                    };

                    item.execCommand_designStamp = function (e) {
                        switch (widget.options.stampDesignMethod) {
                            case "Standard":
                                if (item.IsStampProduct != undefined && item.StampID != undefined) {
                                    if (item.IsStampProduct)
                                        $.cv.util.redirect(widget.options.designStampUrl.format(item.StampID), {}, !widget.options.includeInBrowserHistory);
                                }
                                break;

                            case "Colop":
                                var colopHref = $(e.target).data("colopHref");

                                $.fancybox.open({
                                    type: "iframe",
                                    helpers: { overlay: { closeClick: false } },
                                    iframe: { preload: false },
                                    href: colopHref,
                                    padding: 0
                                });
                                break;
                        }
                    };
                    item.isFavourite = false;
                    if (item.BuildDescriptionTextParts != undefined && item.BuildDescriptionTextParts.UserFavouriteIcon !== undefined && item.BuildDescriptionTextParts.UserFavouriteIcon.length > 0) {
                        item.isFavourite = true;
                    };
                    item.execCommand_addToFavourites = function () {
                        addItemToFavourites(item);
                    };
                    item.execCommand_removeFromFavourites = function () {
                        removeItemFromFavourites(item);
                    };
                    item.execCommand_toggleFavourite = function () {
                        if (item.get("isFavourite")) {
                            removeItemFromFavourites(item);
                        } else {
                            addItemToFavourites(item);
                        }
                    };
                    item.bind("change", function (e) {
                        // TODO: handle the change from the valueWithDefault binding to not flagged changed when loading the default value from the input
                        var validChange = true;
                        if (e.field == "OrderedQty" && (!isQuantityValid(item) || item.get("quantityReset"))) {
                            validChange = false;
                        }
                        if (!_.contains(NONCHANGEDEVENTS, e.field) && validChange)
                            item.set("requiresUpdate", true);
                        if (e.field == "OrderedQty" && !validChange && item.get("quantityReset")) {
                            item.set("quantityReset", false);
                        }
                    });

                    item.hasOutOfStockNotify = false;
                    if (item.BuildDescriptionTextParts != undefined && item.BuildDescriptionTextParts.OutOfStockNotification !== undefined && item.BuildDescriptionTextParts.OutOfStockNotification.length > 0) {
                        item.hasOutOfStockNotify = true;
                    };
                    item.execCommand_outOfStockNotify = function () {
                        var data;
                        if (item.hasOutOfStockNotify) {
                            data = {
                                productCodes: item.StockCode,
                                onChange: function (flag) {
                                    item.set("hasOutOfStockNotify", flag);
                                },
                                data: item
                            };
                            $.cv.css.trigger($.cv.css.eventnames.stockAvailabilityNotifyRemove, data);
                        } else {
                            data = {
                                productCodes: item.StockCode,
                                hasOutOfStockNotify: item.hasOutOfStockNotify,
                                onChange: function (flag) {
                                    item.set("hasOutOfStockNotify", flag);
                                },
                                data: item
                            };
                            $.cv.css.trigger($.cv.css.eventnames.stockAvailabilityNotifyShowPopup, data);
                        }
                    };

                    item.execCommand_setClickAndCollectStoreAvailabilityIconsForItem = function () {
                        setClickAndCollectStoreAvailabilityIconsForItem(item);
                    };

                    item.execCommand_findNearestPickupStores = function () {
                        findNearestPickupStores(item);
                    };

                    item.execCommand_getDataView = function (data) {
                        var array = [];
                        $.each(data, function (idx, item) {
                            // add standard commands
                            item.index = idx;
                            var dataItem = $.cv.util.getFieldItemData(item);
                            array.push(dataItem);
                        });
                        return array;
                    };

                    item.packQuantityTarget = "Product[0].PackQty",
                    item.quantityTarget = "OrderedQty",

                    item.execCommand_increaseQty = function () {
                        $.cv.util.kendoNumericTextBoxIncrease(this);
                    };

                    item.execCommand_decreaseQty = function () {
                        var minimumQuantity = $.cv.util.isNullOrWhitespace(this.MinimumQuantity) ||
                                              isNaN(this.MinimumQuantity)
                                              ? 1
                                              : this.MinimumQuantity;

                        // The minimum quantity is set on the server side. For a normal stock item this will be 1 unless
                        // the system setting ForceOrderPackQuantity is set. Then Product.PackQty. If the current order line
                        // is for a product which is for a cluster line and is also compulsory then the minimum quantity is the 
                        // suggested cluster line quantity.
                        // There is one override to this. Where the product is not a compulsory cluster line item and the 
                        // widget option increaseQuantitiesInPackQty is set and the minimum Quantity is not equal to the PackQuantity
                        // then the minimum quantity is the PackQuantity.
                        // NOTE: ClusterLinesCategoryCode and Compulsory from the Product dynamic service data is used to determine
                        // whether the order line is for a compulsory cluster line item.
                        var packQuantity = this.get(this.get("packQuantityTarget"));
                        if (this.forceOrderPackQty === true &&
                            minimumQuantity !== packQuantity && 
                            ($.cv.util.isNullOrWhitespace(this.ClusterLineCategoryCode) ||
                             this.Compulsory === false)) {
                            minimumQuantity = packQuantity;
                        }

                        $.cv.util.kendoNumericTextBoxDecrease(this, minimumQuantity);
                    };

                    item.ModalEditId = widget.options.modalEditClass + "-" + item.Index;

                    item.execCommand_repEditAmounts = function () {
                        $.fancybox.open({
                            href: "#" + this.ModalEditId,
                            modal: true,
                            afterShow: function () {
                                // Init Kendo widgets.
                                kendo.init($("#" + this.ModalEditId));
                                // Resize FancyBox popup window.
                                $.fancybox.update();
                            }
                        });
                    };

                    array.push(item);
                });
                return array;
            };

            var setClickAndCollectStoreAvailabilityIconsForItem = function(item) {
                if (!widget.options.enableStoreAvailabilityClickAndCollect)
                    return;

                if (item.Product === null || item.Product === undefined || item.Product[0] === null || item.Product[0] === undefined)
                    return;

                var delOption = item.Product[0].GetDeliveryOptionClickAndCollectAsString,
                    delOptionTfrZone = item.Product[0].GetDeliveryOptionTransferZoneClickAndCollectAsString,
                    pickupOption = item.Product[0].GetPickupOptionClickAndCollectAsString;

                if (delOption === undefined || pickupOption === undefined)
                    return;

                if (widget.options.storeAvailClickAndCollectDeliveryDisplayMode === "Standard") {
                    switch (delOption) {
                        case "SelectProductAttributes":
                            item.showDeliverySelectProductAttributes = true;
                            item.showDeliveryAvailable = false;
                            item.showDeliveryIndentProductCall = false;
                            item.showDeliveryUnavailable = false;
                            break;

                        case "Available":
                            item.showDeliverySelectProductAttributes = false;
                            item.showDeliveryAvailable = true;
                            item.showDeliveryIndentProductCall = false;
                            item.showDeliveryUnavailable = false;
                            break;

                        case "CallToOrderIndentProduct":
                            item.showDeliverySelectProductAttributes = false;
                            item.showDeliveryAvailable = false;
                            item.showDeliveryIndentProductCall = true;
                            item.showDeliveryUnavailable = false;
                            break;

                        case "Unavailable":
                            item.showDeliverySelectProductAttributes = false;
                            item.showDeliveryAvailable = false;
                            item.showDeliveryIndentProductCall = false;
                            item.showDeliveryUnavailable = true;
                            break;

                        case "NotApplicable":
                            item.showDeliverySelectProductAttributes = false;
                            item.showDeliveryAvailable = false;
                            item.showDeliveryIndentProductCall = false;
                            item.showDeliveryUnavailable = false;
                            break;
                    }
                } else { // Assume it is WarehouseTransferZone mode
                    switch (delOptionTfrZone) {
                        case "SelectProductAttributes":
                            item.showDeliverySelectProductAttributes = true;
                            item.showDeliveryAvailable = false;
                            item.showDeliveryAvailableTwoToFiveDays = false;
                            item.showDeliveryAvailableThreeToSixDays = false;
                            item.showDeliveryAvailableFiveToSevenDays = false;
                            item.showDeliverySpecialOrder = false;
                            item.showDeliveryUnavailable = false;
                            break;

                        case "Available":
                            item.showDeliverySelectProductAttributes = false;
                            item.showDeliveryAvailable = true;
                            item.showDeliveryAvailableTwoToFiveDays = false;
                            item.showDeliveryAvailableThreeToSixDays = false;
                            item.showDeliveryAvailableFiveToSevenDays = false;
                            item.showDeliverySpecialOrder = false;
                            item.showDeliveryUnavailable = false;
                            break;

                        case "TwoToFiveDays":
                            item.showDeliverySelectProductAttributes = false;
                            item.showDeliveryAvailable = false;
                            item.showDeliveryAvailableTwoToFiveDays = true;
                            item.showDeliveryAvailableThreeToSixDays = false;
                            item.showDeliveryAvailableFiveToSevenDays = false;
                            item.showDeliverySpecialOrder = false;
                            item.showDeliveryUnavailable = false;
                            break;

                        case "ThreeToSixDays":
                            item.showDeliverySelectProductAttributes = false;
                            item.showDeliveryAvailable = false;
                            item.showDeliveryAvailableTwoToFiveDays = false;
                            item.showDeliveryAvailableThreeToSixDays = true;
                            item.showDeliveryAvailableFiveToSevenDays = false;
                            item.showDeliverySpecialOrder = false;
                            item.showDeliveryUnavailable = false;
                            break;

                        case "FiveToSevenDays":
                            item.showDeliverySelectProductAttributes = false;
                            item.showDeliveryAvailable = false;
                            item.showDeliveryAvailableTwoToFiveDays = false;
                            item.showDeliveryAvailableThreeToSixDays = false;
                            item.showDeliveryAvailableFiveToSevenDays = true;
                            item.showDeliverySpecialOrder = false;
                            item.showDeliveryUnavailable = false;
                            break;

                        case "SpecialOrder":
                            item.showDeliverySelectProductAttributes = false;
                            item.showDeliveryAvailable = false;
                            item.showDeliveryAvailableTwoToFiveDays = false;
                            item.showDeliveryAvailableThreeToSixDays = false;
                            item.showDeliveryAvailableFiveToSevenDays = false;
                            item.showDeliverySpecialOrder = true;
                            item.showDeliveryUnavailable = false;
                            break;

                        case "Unavailable":
                            item.showDeliverySelectProductAttributes = false;
                            item.showDeliveryAvailable = false;
                            item.showDeliveryAvailableTwoToFiveDays = false;
                            item.showDeliveryAvailableThreeToSixDays = false;
                            item.showDeliveryAvailableFiveToSevenDays = false;
                            item.showDeliverySpecialOrder = false;
                            item.showDeliveryUnavailable = true;
                            break;

                        case "NotApplicable":
                            item.showDeliverySelectProductAttributes = false;
                            item.showDeliveryAvailable = false;
                            item.showDeliveryAvailableTwoToFiveDays = false;
                            item.showDeliveryAvailableThreeToSixDays = false;
                            item.showDeliveryAvailableFiveToSevenDays = false;
                            item.showDeliverySpecialOrder = false;
                            item.showDeliveryUnavailable = false;
                            break;
                    }
                }

                switch (pickupOption) {
                    case "SelectProductAttributes":
                        item.showPickupSelectProductAttributes = true;
                        item.showPickupAvailable = false;
                        item.showPickupIndentProductCall = false;
                        item.showPickupLowStockCall = false;
                        item.showPickupStoreNotSet = false;
                        item.showPickupUnavailable = false;
                        break;

                    case "Available":
                        item.showPickupSelectProductAttributes = false;
                        item.showPickupAvailable = true;
                        item.showPickupIndentProductCall = false;
                        item.showPickupLowStockCall = false;
                        item.showPickupStoreNotSet = false;
                        item.showPickupUnavailable = false;
                        break;

                    case "CallToOrderIndentProduct":
                        item.showPickupSelectProductAttributes = false;
                        item.showPickupAvailable = false;
                        item.showPickupIndentProductCall = true;
                        item.showPickupLowStockCall = false;
                        item.showPickupStoreNotSet = false;
                        item.showPickupUnavailable = false;
                        break;

                    case "CallStoreLowStock":
                        item.showPickupSelectProductAttributes = false;
                        item.showPickupAvailable = false;
                        item.showPickupIndentProductCall = false;
                        item.showPickupLowStockCall = true;
                        item.showPickupStoreNotSet = false;
                        item.showPickupUnavailable = false;
                        break;

                    case "StoreNotSet":
                        item.showPickupSelectProductAttributes = false;
                        item.showPickupAvailable = false;
                        item.showPickupIndentProductCall = false;
                        item.showPickupLowStockCall = false;
                        item.showPickupStoreNotSet = true;
                        item.showPickupUnavailable = false;
                        break;

                    case "Unavailable":
                        item.showPickupSelectProductAttributes = false;
                        item.showPickupAvailable = false;
                        item.showPickupIndentProductCall = false;
                        item.showPickupLowStockCall = false;
                        item.showPickupStoreNotSet = false;
                        item.showPickupUnavailable = true;
                        break;
                }
            };

            var findNearestPickupStores = function (item) {
                if (item.Product === null || item.Product === undefined || item.Product[0] === null || item.Product[0] === undefined)
                    return false;

                var maxNumberOfStores = widget.options.checkNearbyStoresPickupAvailMaximumStores,
                    message = "";

                item.set("isProcessing", true);
                item.set("nearbyStoreLocations", []);
                item.set("noNearbyStoreLocations", false);

                var prom = $.cv.css.orders.findNearestPickupStoresForLine({ orderNo: item.SoOrderNo, orderSuffix: "", lineSeq: item.LineSeq, numberOfStores: maxNumberOfStores, includeCurrentStore: widget.options.includeCurrentStoreInNearbyStoresAvailCheck });
                prom.done(function(data) {
                    if (data.data) {
                        if (data.data.length > 0) {
                            $.each(data.data, function (i, sl) {
                                if (sl.StoreLocation.StoreLocationDetailsFieldData) {
                                    sl.StoreLocation.StoreLocationDetailsFieldData = item.execCommand_getDataView(sl.StoreLocation.StoreLocationDetailsFieldData);
                                }
                            });

                            item.set("nearbyStoreLocations", data.data);
                        } else {
                            item.set("noNearbyStoreLocations", true);
                        }

                    } else {
                        if (data.errorMessage != null)
                            message = data.errorMessage;
                        else
                            message = widget.options.textProductErrorCheckingNearbyStoresAvail;

                        viewModel.setMessage(message, $.cv.css.messageTypes.error);
                    }

                    item.set("isProcessing", false);
                });

                return true; // Need to return true as is triggered by click even on anchor tag which refs the modal window is to be fancyboxed.
            };

            var getChargeLineListView = function () {
                var array = [], chargeLineIndex = 0;
                $.each(getChargeLines(widget.dataSource.view()), function (idx, item) {
                    // add standard commands
                    item.Index = idx;
                    item.chargeLineIndex = chargeLineIndex++;
                    item.hidePricingInOrderGrid = viewModel.get("hidePricingInOrderGrid");
                    array.push(item);
                });
                return array;
            };

            var isQuantityValid = function (item) {
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
            };

            var updateLineItem = function (item, displayMessages) {
                var opts = {};
                displayMessages = typeof displayMessages !== 'undefined' ? displayMessages : true;
                if (isNaN(item.OrderedQty.toString()) || item.OrderedQty.toString() == '') {
                    viewModel.setMessage(widget.options.textEnterNumeric, $.cv.css.messageTypes.error);
                } else if (item.OrderedQty == 0) {
                    item.execCommand_destroy();
                } else {
                    opts = buildLineItemJSON(item);
                    viewModel.setLocalLinesUpdated([opts]);
                    item.set("isProcessing", true);
                    item.set("isUpdating", true);
                    _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
                    var d1 = $.cv.css.updateCurrentOrderLine(opts);
                    $.when(d1).done(function (data) {
                        if (data.data.toString().toLowerCase() === 'true') {
                            viewModel.updateItemList();
                            item.set("isProcessing", false);
                            item.set("isUpdating", false);
                            if (displayMessages) {
                                viewModel.clearMessage();
                                viewModel.setMessage(widget.options.textLineUpdatedSuccessfully, $.cv.css.messageTypes.success);
                            }

                            if (widget.options.refreshOrderAfterLineUpdate) {
                                $.when($.cv.css.getCurrentOrder(), $.cv.css.getCurrentOrderLines())
                                    .done(function() {
                                        $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                                    });
                            }

                        }
                        else if (data.data.toString().toLowerCase() === "false" && data.message && data.message.length > 0) {
                            viewModel.clearMessage();
                            viewModel.setMessage( "Line " + widget.options.textLinesUpdatedUnSuccessfully + ". " + data.message, $.cv.css.messageTypes.error);
                        }
                    }).fail(function (msg) {
                        item.set("isProcessing", false);
                        item.set("isUpdating", false);
                        if (displayMessages)
                            viewModel.setMessage(widget.options.textLinesUpdatedUnSuccessfully, $.cv.css.messageTypes.error);
                    });
                }
            };

            var buildLineItemJSON = function (item) {
                var opts = {
                    sequence: item.LineSeq.toString(),
                    quantity: item.OrderedQty.toString(),

                    // If the price could be overriden, e.g. Reps, then it will have changed either OrderItemPrice or OrderNetItemPrice depending 
                    // on which one is displayed as the Item Price field in line details, so check either if changed (only one will have)
                    price: item.isPriceOverriden
                            ? item.displayableOrderItemPrice !== item.origOrderItemPrice
                                ? item.displayableOrderItemPrice.toString()
                                : item.displayableOrderNetItemPrice !== item.origOrderNetItemPrice 
                                    ? item.displayableOrderNetItemPrice.toString()
                                    : "-1.0" 
                            : "-1.0",

                    //  Discount may have been overriden too
                    discount: item.isDiscOverriden ? (item.displayableItemDiscountRate * 100).toString() : "-1.0",
                    orderItemPrice: item.OrderItemPrice != null ? item.OrderItemPrice : "-1.0",
                    description: item.Description,
                    productCode: item.StockCode,
                    category: item.CategoryDescription
                };

                if (widget.options.noteIsExtendedLineDescription) {
                    if (typeof item.ExtendedLineDescription != 'undefined') {
                        opts.note = item.ExtendedLineDescription;
                    } else {
                        opts.note = "";
                    }
                }

                if (typeof item.costCentreCode != 'undefined') {
                    opts.costCentreCode = item.costCentreCode.toString();
                } else {
                    opts.costCentreCode = "";
                }

                if (widget.options.notesRequiredForNonContractPurchasing) {
                    if (typeof item.nonContractReason != 'undefined') {
                        opts.nonContractReason = item.nonContractReason.toString();
                    } else {
                        opts.nonContractReason = "";
                    }
                }

                if (typeof item.originalQuantity !== 'undefined') {
                    opts.originalQuantity = item.originalQuantity.toString();
                } else {
                    opts.originalQuantity = "";
                }

                return opts;
            };

            var removeItemFromFavourites = function (item) {
                var removeSuccess = false, message = "";
                if (item.Product != null && item.StockCode != null && item.StockCode != "") {
                    var pCode = item.StockCode;
                    item.isProcessing = true;
                    item.set("removingFromFavourites", true);
                    var d = $.cv.css.userFavourites.removeFavourites({ productCodes: [pCode] });
                    $.when(d).done(function (msg) {
                        viewModel.set("triggerMessages", true);
                        viewModel.set("clearExistingMessages", true);
                        item.set("removingFromFavourites", false);
                        if (msg.data.toLowerCase() == 'true') {
                            removeSuccess = true;
                            message = widget.options.textProductRemovedFromFavourites.format(pCode);
                        } else {
                            if (msg.errorMessage != null)
                                message = msg.errorMessage;
                            else
                                message = widget.options.textDefaultErrorRemovedFromFavourites.format(pCode);
                        }
                        if (removeSuccess)
                            widget.trigger(PRODUCTREMOVEDFROMFAVOURITES, { productCode: pCode });
                        else
                            widget.trigger(PRODUCTREMOVEDFROMFAVOURITESFAIL, { productCode: pCode, errorMessage: message });
                        item.isProcessing = false;
                        viewModel.clearMessage();
                        viewModel.setMessage(message, removeSuccess ? $.cv.css.messageTypes.success : $.cv.css.messageTypes.error);
                        if (removeSuccess) {
                            item.set("isFavourite", false);
                        }
                        viewModel.set("triggerMessages", widget.options.triggerMessages);
                        viewModel.set("clearExistingMessages", widget.options.clearExistingMessages);
                    });
                }
            };

            var addItemToFavourites = function (item) {
                var addSuccess = false, message = "";
                if (item.Product != null && item.StockCode != null && item.StockCode != "") {
                    var pCode = item.StockCode;
                    item.isProcessing = true;
                    item.set("addingToFavourites", true);
                    var d = $.cv.css.userFavourites.addFavourite({ productCode: pCode });
                    $.when(d).done(function (msg) {
                        viewModel.set("triggerMessages", true);
                        viewModel.set("clearExistingMessages", true);
                        item.set("addingToFavourites", false);
                        if ($.cv.css.userFavourites.defaults && $.cv.css.userFavourites.defaults.returnMessageOnAddFavourite) {
                            message = msg.data.Messages[0];
                            if (msg.data.Success)
                                addSuccess = true;
                        } else {
                            if (msg.data == 'True') {
                                addSuccess = true;
                                message = widget.options.textProductAddedToFavourites;
                            }
                            else {
                                if (msg.errorMessage != null)
                                    message = msg.errorMessage;
                                else
                                    message = widget.options.textDefaultErrorAddingToFavourites;
                            }
                        }
                        if (addSuccess)
                            widget.trigger(PRODUCTADDEDTOFAVOURITES, { productCode: widget.options.productCode });
                        else
                            widget.trigger(PRODUCTADDTOFAVOURITESFAIL, { productCode: widget.options.productCode, errorMessage: msg });
                        item.isProcessing = false;
                        viewModel.clearMessage();
                        viewModel.setMessage(msg.data.Messages[0], addSuccess ? $.cv.css.messageTypes.success : $.cv.css.messageTypes.error);
                        if (addSuccess) {
                            if (widget.options.isAddToFavouritesAMove)
                                item.execCommand_destroy();
                            if (addSuccess) {
                                item.set("isFavourite", true);
                            }
                        }
                        viewModel.set("triggerMessages", widget.options.triggerMessages);
                        viewModel.set("clearExistingMessages", widget.options.clearExistingMessages);
                    });
                }
            };

            var viewModel = kendo.observable({
                showAlternatesButtonVisible: false,

                // Properties for UI elements
                dataSource: widget.options.dataSource,

                isOnlyShowingErrors: false,
                isLoadingLines: true,

                updateViewModelFromDataSource: function () {
                    this.updateItemList();
                    this.updateChargeLineList();
                    this.updateChargeLineWithoutFreightList();
                },

                hidePricingInOrderGrid: widget.options.hidePricingInOrderGrid,

                hidePricingInOrderGridClass: function () {
                    var c = widget.options.pricingOnOrderGridClass;
                    return this.get("hidePricingInOrderGrid") ? c + OPTIONDISABLEDSUFFIX : c + OPTIONENABLEDSUFFIX;
                },

                enableOrderLineNotes: widget.options.enableOrderLineNotes,

                enableOrderLineNotesClass: function () {
                    var c = widget.options.orderLineNotesClass;
                    return this.get("enableOrderLineNotes") ? c + OPTIONENABLEDSUFFIX : c + OPTIONDISABLEDSUFFIX;
                },

                useCostCentres: widget.options.useCostCentres,

                userOrderEntry: widget.options.userOrderEntry,

                useOrderEntryClass: function () {
                    var c = widget.options.useOrderEntryClass;
                    return this.get("userOrderEntry") ? c + OPTIONENABLEDSUFFIX : c + OPTIONDISABLEDSUFFIX;
                },

                notesRequiredForNonContractPurchasingClass: function () {
                    var c = widget.options.notesRequiredForNonContractClass;
                    return widget.options.notesRequiredForNonContractPurchasing ? c + OPTIONENABLEDSUFFIX : c + OPTIONDISABLEDSUFFIX;
                },

                linesCssClasses: function () {
                    var classes = "";
                    classes += this.hidePricingInOrderGridClass();
                    classes = classes.length > 0 ? classes + " " + this.enableOrderLineNotesClass() : this.enableOrderLineNotesClass();
                    classes = classes.length > 0 ? classes + " " + this.useOrderEntryClass() : this.userOrderEntryClass();
                    classes = classes.length > 0 ? classes + " " + this.notesRequiredForNonContractPurchasingClass() : this.notesRequiredForNonContractPurchasingClass();
                    return classes;
                },

                linesCssClassesAdd: function () {
                    return { add: true, cssClass: this.linesCssClasses() };
                },

                message: '',

                hasLines: false,

                hasChargeLines: false,

                hasChargeLinesWithoutFreight: false,

                isProcessing: false,
                isValidating: false,

                // Encompasses whole process: from when we are about to send the update call
                // to when we have finished validation
                isUpdating: function () {
                    return this.get('isProcessing') || this.get('isValidating');
                },

                startUpdating: function () {
                    // isUpdating() returns true when at least 1 of the following conditions is true,
                    // isUpdating() encompases the whole process of updating.
                    this.set('isProcessing', true);
                    this.set('isValidating', true);
                },

                clearExistingMessages: widget.options.clearExistingMessages,

                setMessage: function (message, type) {
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name
                    });
                },

                clearMessage: function () {
                    this.set("message", "");
                    if (widget.options.triggerMessages) {
                        $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: 'orderLines', clearExisting: true });
                        if (widget.options.clearAdditionalWidgetMessages.length > 0) {
                            var widgetNames = widget.options.clearAdditionalWidgetMessages.split(",");
                            for (var i = 0; i < widgetNames.length; i++) {
                                $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: widgetNames[i], clearExisting: true });
                            }
                        }
                    }
                },

                cartUpdated: function (opts) {
                    var p = new $.Deferred();
                    if (opts && $.cv.util.hasValue(opts.orderNoOverride)) {
                        widget.options.orderNoOverride = opts.orderNoOverride;
                        p = $.cv.css.getOrderLines({ orderNo: widget.options.orderNoOverride, isLocalSetSelectedOrderLines: true });
                    } else {
                        p.resolve();
                    }

                    $.when(p).done(function() {
                        widget.initDataSource();
                        widget.viewModel.onlyShowErrors(false);
                    });
                },

                colopStampChanged: function(opts) {
                    var lineSeq = opts.lineSeq;

                    // Yes, this is horrible...
                    var data = this.dataSource.data()[lineSeq - 1];
                    data.set("HasErrors", false);
                    data.set("ErrorMessages", "");
                    data.set("ErrorTypes", "");

                    $.cv.css.trigger($.cv.css.eventnames.orderChanged);
                },

                onlyShowErrors: function (showErrors) {
                    showErrors = $.cv.util.hasValue(showErrors) ? showErrors : !this.get("isOnlyShowingErrors");
                    this.set("isOnlyShowingErrors", showErrors);
                },

                showAlternatesButton: function (item) {
                    if (!widget.dataSource) {
                        return;
                    }

                    $.each(this.get("itemList"), function (idx, line) {
                        if (line.LineSeq === item.SolLineSeq) {
                            line.set("isShowAlternatesVisible", item.AlternatesCount > 0);
                        }
                    });
                },

                updateItemList: function () {
                    var dataView = getDataView(ITEMLISTVIEW);
                    this.set("itemList", dataView);
                    this.set("hasLines", dataView.length > 0);
                    widget.trigger(LINESRENDERED, { count: dataView.length });
                    $.cv.css.trigger($.cv.css.eventnames.cartLinesRendered, { stampsWidgetContainer: widget.options.stampsWidgetContainer, lines: this.get("itemList") });
                },

                updateChargeLineList: function () {
                    var dataView = getDataView(CHARGELINELISTVIEW);
                    this.set("chargeLineList", dataView);
                    this.set("hasChargeLines", dataView.length > 0);
                    widget.trigger(CHARGELINESRENDERED, { count: dataView.length });
                },

                updateChargeLineWithoutFreightList: function () {
                    var dataView = _.filter(getDataView(CHARGELINELISTVIEW), function (line) { return line.SolChgType != widget.options.freightChargeType; });
                    this.set("chargeLineWithoutFreightList", dataView);
                    this.set("hasChargeLinesWithoutFreight", dataView.length > 0);
                    widget.trigger(CHARGELINESWITHOUTFREIGHTRENDERED, { count: dataView.length });
                },

                itemList: [],

                chargeLineList: [],

                chargeLineWithoutFreightList: [],

                // function called externally from the widget, allow individual line errors to be regsitered against the line iteself
                displayLineMessages: function (lineMessages, lines) {
                    var itemList = this.get("itemList"), linesWithoutErrors = [];
                    itemList = $.grep(itemList, function (e) { return e.StockCode != null; });
                    if (lineMessages.length > 0) {
                        if (lines.length == 0)
                            linesWithoutErrors = itemList;
                        else {
                            linesWithoutErrors = _.filter(itemList, function (item) { return _.contains(lines.toString().split(","), item.LineSeq.toString()); });
                        }
                        $.each(lineMessages, function (idx, item) {
                            var hasErrors = false, errorMessages = "", errorTypes = "";
                            var hasWarning = false, warningMessages = "", warningTypes = "";

                            var line;
                            var linePreventCheckout = false;
                            $.each(item["lineMessages"], function (idx, lineMessage) {
                                line = $.grep(itemList, function (e) { return e.LineSeq == lineMessage.lineSeq; });
                                linesWithoutErrors = $.grep(linesWithoutErrors, function (e) { return e.LineSeq != lineMessage.lineSeq; });
                                if (line.length > 0) {
                                    if (lineMessage.errorMessage != "") {
                                        if (lineMessage.preventsCheckOut) {
                                            linePreventCheckout = true;
                                            hasErrors = true;
                                            errorMessages = errorMessages == "" ? lineMessage.errorMessage : errorMessages + widget.options.lineErrorSeparator + lineMessage.errorMessage;
                                            errorTypes = errorTypes == "" ? lineMessage.errorType : errorTypes + " " + lineMessage.errorType;
                                        } else {
                                            hasWarning = true;
                                            warningMessages = warningMessages == "" ? lineMessage.errorMessage : warningMessages + widget.options.lineErrorSeparator + lineMessage.errorMessage;
                                            warningTypes = warningTypes == "" ? lineMessage.errorType : warningTypes + " " + lineMessage.errorType;
                                        }

                                    }
                                }
                            });

                            if (hasErrors)
                                line[0].execCommand_updateErrorMessage(true, errorMessages, errorTypes, linePreventCheckout);

                            if (hasWarning)
                                line[0].execCommand_updateWarningMessage(true, warningMessages, warningTypes);
                        });
                        $.each(linesWithoutErrors, function (idx, item) {
                            item.execCommand_updateErrorMessage(false, "", "", false);
                        });
                    }
                },

                clearLineMessages: function (lines) {
                    var itemList = this.get("itemList"), clearLines = [];
                    itemList = $.grep(itemList, function (e) { return e.StockCode != null; });
                    clearLines = _.filter(itemList, function (item) { return _.contains(lines.toString().split(","), item.LineSeq.toString()); });
                    $.each(clearLines, function (idx, item) {
                        item.execCommand_updateErrorMessage(false, "", "", false);
                    });
                },

                setLocalLinesDeleted: function (deleted) {
                    localUpdatedCurrentOrderLines = $.cv.css.localGetUpdatedCurrentOrderLines();
                    if (localUpdatedCurrentOrderLines == null)
                        localUpdatedCurrentOrderLines = { linesDeleted: deleted };
                    $.cv.css.localSetUpdatedCurrentOrderLines(localUpdatedCurrentOrderLines);
                },

                setLocalLinesUpdated: function (updateList) {
                    var updatedLines = [];
                    localUpdatedCurrentOrderLines = $.cv.css.localGetUpdatedCurrentOrderLines();
                    if (localUpdatedCurrentOrderLines == null)
                        localUpdatedCurrentOrderLines = { updatedLines: [] };
                    if (localUpdatedCurrentOrderLines["updatedLines"] != undefined)
                        updatedLines = localUpdatedCurrentOrderLines["updatedLines"];
                    // if updated lines exists merge them with the current list of lines being updated else set the list of updated list to the current list of lines
                    if (updatedLines != null && updatedLines.length > 0) {
                        updatedLines = _.union(updatedLines, _.pluck(updateList, 'sequence'));
                    } else {
                        updatedLines = _.pluck(updateList, 'sequence');
                    }
                    localUpdatedCurrentOrderLines["updatedLines"] = updatedLines;
                    // store the list of updated lines in local storage
                    $.cv.css.localSetUpdatedCurrentOrderLines(localUpdatedCurrentOrderLines);
                },

                buildLineItemJSON: function (item) {
                    return buildLineItemJSON(item);
                },

                updateLinesFlaggedForUpdate: function (displayMessages, triggerOrderRefresh) {
                    var _this = this, batchData = [], def = new $.Deferred();
                    displayMessages = typeof displayMessages !== 'undefined' ? displayMessages : true;
                    triggerOrderRefresh = typeof triggerOrderRefresh !== 'undefined' ? triggerOrderRefresh : true;
                    $.each(this.get("itemList"), function (idx, item) {
                        // don't need to include deleted lines in an update
                        if (item.requiresUpdate && !item.requiresDelete) {
                            batchData.push(buildLineItemJSON(item));
                        }
                    });
                    if (batchData.length > 0) {
                        def = _this.updateAllLines(batchData, displayMessages, triggerOrderRefresh);
                    } else {
                        def.resolve();
                    }
                    return def;
                },

                updateAllLines: function (batchData, displayMessages, triggerOrderRefresh) {
                    var _this = this, d1 = new $.Deferred(), d2 = new $.Deferred(), d3 = new $.Deferred(), itemList = [], deleteList = [], updateList = [], localUpdatedCurrentOrderLines = {};
                    batchData = typeof batchData !== 'undefined' ? batchData : [];
                    displayMessages = typeof displayMessages !== 'undefined' ? displayMessages : true;
                    triggerOrderRefresh = typeof triggerOrderRefresh !== 'undefined' ? triggerOrderRefresh : true;
                    if (batchData.length == 0) {
                        $.each(widget.dataSource.view(), function (idx, item) {
                            batchData.push(buildLineItemJSON(item));
                        });
                    }
                    if (batchData.length > 0) {
                        deleteList = _.filter(batchData, function (item) { return item.quantity == 0; });
                        updateList = _.filter(batchData, function (item) { return item.quantity != 0; });
                        if (displayMessages) {
                            _this.clearMessage();
                        }
                        if (deleteList.length > 0) {
                            _this.setLocalLinesDeleted(true);

                            for (var i = 0; i < deleteList.length; i++) {
                                deleteList[i]["seq"] = deleteList[i]["sequence"];
                            }

                            d3 = _this.deleteAllLines(deleteList, displayMessages, triggerOrderRefresh && updateList.length == 0);
                        } else {
                            _this.setLocalLinesDeleted(false);
                            d3.resolve();
                        }
                        if (updateList.length > 0) {
                            _this.setLocalLinesUpdated(updateList);

                            _this.startUpdating(); // isProcessing & isValidating set to true

                            // Update Lines
                            _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
                            d2 = $.cv.css.orders.updateCurrentOrderLineBulk({ batchData: updateList, triggerOrderRefresh: triggerOrderRefresh });
                            $.when(d2).done(function (data) {
                                _this.set("isProcessing", false);
                                var linesSuccessful = '';
                                var linesUnSuccessful = '';
                                if (!widget.options.messagesUseLineSeq)
                                    var itemList = _this.get("itemList");
                                for (var i = 0; i < data.data.length; i++) {
                                    switch (data.data[i].toLowerCase()) {
                                        case "true":
                                            linesSuccessful += (widget.options.messagesUseLineSeq ? batchData[i].sequence : $.grep(itemList, function (e) { return e.LineSeq == updateList[i].sequence; })[0].Index + 1) + ",";
                                            break;
                                        default:
                                            linesUnSuccessful += (widget.options.messagesUseLineSeq ? batchData[i].sequence : $.grep(itemList, function (e) { return e.LineSeq == updateList[i].sequence; })[0].Index + 1) + ",";
                                    }
                                }
                                if (linesSuccessful != "") {
                                    if (displayMessages) {
                                        if (widget.options.linesUpdatedSuccessfullyGeneric.length > 0) {
                                            _this.setMessage(widget.options.linesUpdatedSuccessfullyGeneric, $.cv.css.messageTypes.success);
                                        } else {
                                            _this.setMessage("Lines " + linesSuccessful + " " + widget.options.textLinesUpdatedSuccessfully, $.cv.css.messageTypes.success);
                                        }
                                    }

                                    if (widget.options.refreshOrderAfterLineUpdate) {
                                        $.when($.cv.css.getCurrentOrder(), $.cv.css.getCurrentOrderLines())
                                            .done(function () {
                                                $.cv.css.trigger($.cv.css.eventnames.orderChanged);

                                                if (triggerOrderRefresh) {
                                                    _this.updateItemList();
                                                }
                                            });
                                    }
                                    else if (triggerOrderRefresh) {
                                        _this.updateItemList();
                                    }
                                }
                                if (linesUnSuccessful != "") {
                                    if (displayMessages) {
                                        if (widget.options.linesUpdatedUnSuccessfullyGeneric.length > 0) {
                                            _this.setMessage(widget.options.linesUpdatedUnSuccessfullyGeneric, $.cv.css.messageTypes.success);
                                        } else {
                                            _this.setMessage("Lines " + linesUnSuccessful + " " + widget.options.textLinesUpdatedUnSuccessfully, $.cv.css.messageTypes.error);
                                        }
                                    }
                                }
                                widget.trigger(LINESUPDATED, { linesSuccessful: linesSuccessful, linesUnSuccessful: linesUnSuccessful, displayMessages: displayMessages });
                            }).fail(function (msg) {
                                _this.set("isProcessing", false);
                                if (displayMessages)
                                    _this.setMessage(widget.options.textLinesUpdatedErrored, $.cv.css.messageTypes.error);
                            });
                        } else {
                            d2.resolve();
                        }
                        $.when(d2, d3).always(function (data) {
                            d1.resolve();
                        });
                    } else {
                        d1.resolve();
                    }
                    return d1;
                },

                deleteLinesFlaggedForDelete: function (displayMessages, triggerOrderRefresh) {
                    var _this = this, batchData = [], def = new $.Deferred();
                    displayMessages = typeof displayMessages !== 'undefined' ? displayMessages : true;
                    triggerOrderRefresh = typeof triggerOrderRefresh !== 'undefined' ? triggerOrderRefresh : true;
                    $.each(this.get("itemList"), function (idx, item) {
                        if (item.requiresDelete) {
                            batchData.push({ seq: item.LineSeq.toString() });
                        } else if (item.hasLineNotes) {
                            $.each(item.lineNotes, function (idx2, lineNote) {
                                if (lineNote.requiresDelete)
                                    batchData.push({ seq: lineNote.LineSeq.toString() });
                            });
                        }
                    });
                    if (batchData.length > 0) {
                        def = _this.deleteAllLines(batchData, displayMessages, triggerOrderRefresh);
                    } else {
                        def.resolve();
                    }
                    return def;
                },

                deleteAllLines: function (batchData, displayMessages, triggerOrderRefresh) {
                    var _this = this, d1 = new $.Deferred(), productsRemoved = "";
                    batchData = typeof batchData !== 'undefined' ? batchData : [];
                    displayMessages = typeof displayMessages !== 'undefined' ? displayMessages : true;
                    triggerOrderRefresh = typeof triggerOrderRefresh !== 'undefined' ? triggerOrderRefresh : true;
                    if (batchData.length == 0) {
                        $.each(this.get("itemList"), function (idx, item) {
                            batchData.push({ seq: item.LineSeq.toString() });
                        });
                    }
                    if (batchData.length > 0) {
                        _this.setLocalLinesDeleted(true);

                        // Need to ensure that each item in the list contains an array detailing all the other lines getting deleted in the batch.
                        // This is important when have clusterline based items in the cart and some have compulsory flag set as can only delete
                        // them when all other compulsory items from the same cluster are getting deleted in same opearation. This only applies in
                        // some cases depending on catalogue in use and certain conditions but need to know details of all lines
                        var allLineSeqsToDelete = [];

                        for (var i = 0; i < batchData.length; i++) {
                            allLineSeqsToDelete.push(parseFloat(batchData[i]["seq"]));
                        }

                        // Need to store the data in a variable here are the service call can trigger an order refresh which will in turn change the datasource
                        // This can cause the script inside the "done" block to fail
                        var ds = widget.dataSource.data();
                        _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
                        var d2 = $.cv.css.orders.deleteCurrentOrderLineBulk({ batchData: batchData, allLineSeqsToDeleteIfBatch: allLineSeqsToDelete, triggerOrderRefresh: triggerOrderRefresh });
                        $.when(d2).done(function (data) {
                            // Check if any issue deleteing line e.g. compuslosry items not all deleted together when have clusters.
                            if (data && data.data && data.data.length > 0) {
                                var currLineDelResult = data.data[0];

                                if (typeof currLineDelResult.deleteLineOk !== "undefined" && currLineDelResult.deleteLineOk === false) {
                                    _this.clearMessage();
                                    _this.setMessage("Line " + widget.options.textLinesDeletedUnSuccessfully + ". " + currLineDelResult.message, $.cv.css.messageTypes.error);
                                    d1.resolve(data);
                                    return;
                                }
                            }
                            // If we are triggering an order refresh wait until it is finished before resolving
                            if (triggerOrderRefresh) {
                                var orderRefreshed = function() {
                                    d1.resolve(data);
                                    $.cv.css.unbind($.cv.css.eventnames.orderChanged, orderRefreshed);
                                }
                                $.cv.css.bind($.cv.css.eventnames.orderChanged, orderRefreshed);
                            } else {
                                d1.resolve(data);
                            }
                            $.each(batchData, function (idx, item) {
                                var lineItem = $.grep(ds, function (e) { return e.LineSeq.toString() === item.seq; });
                                if ($.cv.util.hasValue(lineItem) && lineItem.length === 1) {
                                    if (lineItem[0].StockCode)
                                        productsRemoved = productsRemoved.length === 0 ? lineItem[0].StockCode : productsRemoved + ", " + lineItem[0].StockCode;
                                    // If we are triggering an order don't try and remove items from the datasource as is can get confused it it updates from the refresh and you are trying to remove an item
                                    if (!triggerOrderRefresh) {
                                        try {
                                            widget.dataSource.remove(lineItem[0]);
                                        } catch (err) { }
                                    }
                                } else {
                                    lineItem = $.grep(ds, function (e) { return e.LineSeq == Math.floor(item.seq); });
                                    if ($.cv.util.hasValue(lineItem) && lineItem.length === 1) {
                                        var removeIndexes = [];
                                        $.each(lineItem[0].lineNotes, function (idx2, lineNote) {
                                            if (lineNote.LineSeq == item.seq)
                                                removeIndexes.push(idx2);
                                        });
                                        if (removeIndexes.length > 0) {
                                            removeIndexes = removeIndexes.sort(function (a, b) { return b - a; });
                                            for (var i = 0; i < removeIndexes.length; i++)
                                                lineItem[0].lineNotes = lineItem[0].lineNotes.splice(removeIndexes[i], 1);
                                        }
                                    }
                                }
                            });
                            if (displayMessages) {
                                _this.clearMessage();
                                if (batchData.length == 1)
                                    _this.setMessage(widget.options.textLineDeletedSuccessfully.format(productsRemoved), $.cv.css.messageTypes.success);
                                else
                                    _this.setMessage(widget.options.textLinesDeletedSuccessfully.format(productsRemoved), $.cv.css.messageTypes.success);
                            }
                        });
                    } else {
                        d1.resolve();
                    }
                    return d1;
                },

                getLineErrorCount: function () {
                    var count = 0;
                    $.each(this.get("itemList"), function (idx, item) {
                        if (item.HasErrors) {
                            count++;
                        }
                    });
                    return count;
                },

                getLinePreventChecktoutCount: function () {
                    var count = 0;
                    $.each(this.get("itemList"), function (idx, item) {
                        if (item.PreventCheckout) {
                            count++;
                        }
                    });
                    return count;
                },

                refreshLines: function () {
                    widget.initDataSource();
                },

                retainSortSelected: function () {
                    var dssort = widget.dataSource.sort();
                    var sortField = '';
                    var sortDirection = "";
                    if (dssort && dssort.length > 0) {
                        sortField = dssort[0].field;
                        sortDirection = dssort[0].dir != undefined ? dssort[0].dir : "asc";
                        widget.options.defaultLinesSortField = sortField;
                        widget.options.defaultLinesSortDirection = sortDirection;
                    }
                },

                removeLineFromCartAfterSelectingNotifyWhenInStock: function (item) {
                    if (item) {
                        item.execCommand_destroy();
                    }
                }
            });

            initSettings();

            viewModel.bind("change", function (e) {
                if (e.field == "dataSource") {
                    viewModel.retainSortSelected();     
                }
            });

            return viewModel;
        },

        _getDefaultSorterTemplate: function () {
            var widget = this;
            if (widget.options.searchFields && (widget.options.searchPosition == POSITIONBOTH || widget.options.searchPosition == POSITIONTOP)) {
                return "<div data-role='sorter' data-sort-options='#= sortOptions #' data-bind='source: dataSource'></div>";
            }
            return "";
        },

        _getDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = ""
                    + "<div>"
                    + "<div class='itemList' data-bind='source: itemList' data-template='" + widget.options.itemViewTemplate + "'></div>"
                    + "<div class='chargeLineList' data-bind='source: chargeLineList' data-template='" + widget.options.chargeLineViewTemplate + "'></div>";
            html += "</div>";
            return html;
        },

        _getDefaultItemViewTemplate: function () {
            var widget = this;
            // return the template to be bound to the dataSource items
            var html = "<script type='text/x-kendo-template' id='" + widget.options.itemViewTemplate + "'>";
            html += "<div>";
            html += "Product";
            html += "</div></script>";
            return html;
        },

        _getDefaultChargeLineViewTemplate: function () {
            var widget = this;
            // return the template to be bound to the dataSource items
            var html = "<script type='text/x-kendo-template' id='" + widget.options.chargeLineViewTemplate + "'>";
            html += "<div>";
            html += "Charge Line";
            html += "</div></script>";
            return html;
        }

    }; // register the widget

    $.cv.ui.widget(orderLinesWidget);

})(jQuery);