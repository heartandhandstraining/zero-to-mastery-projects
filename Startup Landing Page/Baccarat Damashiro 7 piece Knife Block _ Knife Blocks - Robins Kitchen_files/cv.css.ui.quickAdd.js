// Work around for allowing indexing of dynamicly created input fields for validation
var currentDynamicRowIndex = 0;
/*
<script type='text/x-kendo-template' id='quickOrderLineTemplate'>
	<li class="AddToOrderRow">
		<label>Code:</label>
		<span tabindex="-1" unselectable="on" class="k-state-default" style="background-color: transparent">
		  <input class="k-input" type="text" autocomplete="off" data-value-Update="keyup" data-bind="value:#="ProductCode"+currentDynamicRowIndex#" />
		</span>
		<input class="AddToOrderCode" innerInput="custom" placeholder="Product Code" data-role="selectcode" data-filter="contains" data-min-length="3" data-delay="500" data-show-value="true" data-auto-Bind="false" data-value-field="ProductCode" data-text-field="Description" data-template="productCombo" type="text" class="" data-bind="source: productSearchDataSource, value: productCode, click:preValidateOveride" />
		<label>Qty:</label>
		<input data-bind="value: quantity" min="0" type="text" placeholder="Qty" class="" />
		<label>Note:</label>
		<input data-bind="value: notes, visible: enableOrderLineNotes" type="text" placeholder="Note" class="" />     
		  
		#currentDynamicRowIndex++;#
	</li>
</script>
*/

// Note the usage of #currentDynamicRowIndex++;# in the template

/* Name: quick add
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
* Params:  
*       dataSource: 
*       quickAddLineDefaultDataSource:
*       stockCodeEntryLineCount:
*       refreshOrderLines:
*       linesElement: 
*       linesData: 
*       autoBind: 
*       linesRendered: 
*       noteIsExtendedLineDescription: 
*       triggerMessages: 
*       textProductAddedMessage:
*       viewTemplate: 
*       itemViewTemplate:
*/
;
(function ($, undefined) {

	var DATABINDING = "dataBinding",
		DATABOUND = "dataBound",
		CHANGE = "change",
		LINESRENDERED = "linesRendered",
		PRODUCTADDEDTOCART = "productAddedToCart",
		PRODUCTADDTOCARTFAIL = "productAddToCartFail",
		PRODUCTSADDEDTOCART = "productsAddedToCart",
		WIDGETBOUND = "widgetBound";

	var quickAddWidget = {
		// Standard Variables

		// widget name
		name: "quickAdd",

		// default widget options
		options: {
			// viewModel defaults
			dataSource: [],
			quickAddLineDefaultDataSource: { productCode: '', costCentreCode: '', description: '', quantity: '', notes: '', hasMultipleCostCentres: false, costCentreList: [], price: '', discount: '' },
			refreshOrderLines: true,
			linesElement: "[data-role='orderlines']",
			linesData: "orderLines",
			clearAdditionalWidgetMessages: "orderLines", // comma separated list of widget names
			defaultCostCentreCodeControl: '<input class="disabled" type="text" disabled="disabled">',
			showExpandCollapseButton: false,
			isCollapsableAreaExpandedByDefault: false,
			expandCollapseButtonLabelExpanded: "Expand to {0}",
			expandCollapseButtonLabelCollapsed: "Collapse to 1",
			// viewModel flags
			autoBind: true,
			clearExistingMessages: true,
			getCurrentOrderLinesOnAdd: true,
			// events
			linesRendered: null,
			// view flags
			noteIsExtendedLineDescription: true,
			triggerMessages: true,
			allowDecimals: false,
			// view text defaults
			// widget settings
			preValidateLines: false,
			inValidProductClass: "inValidProductClass",
			ValidProductClass: "ValidProductClass",
			// This is the default
			EmptyProductClass: "EmptyProductClass",
			// Depending on how you want it to function you should be able to change this to inValidProductClass or ValidProductClass
			CurrentlyBeingValidatedProductClass: "CurrentlyBeingValidatedProductClass",
			stockCodeEntryLineCount: 10,
			numberOfColumns: 1,
            numberOfLinesPerColumn: 10,
			enableOrderLineNotes: false,
			useCostCentres: false,
			costCentreList: [],
			pleaseSelectText: 'Please Select...',
			useOrderEntry: true,
			isStockCodeEntryAvailable: false,
			textProductPreValidateError: 'Your products have not been successfully added - Check the code is correct.',
			textProductAddedMessage: 'Your product has been successfully added',
			textProductsAddedMessage: 'These products have been successfully added:',
			textAddAllMessage: "{0} : {1}",
			textAddButtonLabel: "Add",
			textAddAllButtonLabel: "Add All",
			// view Template
			viewTemplate: null, // TODO: Treat these as IDs, remove the last one.
			itemViewTemplate: null,
			categoryFilter: "",
			gtmPageType: "",
			pageSize: 20
		},

		events: [DATABINDING, DATABOUND, LINESRENDERED, PRODUCTADDEDTOCART, PRODUCTADDTOCARTFAIL, PRODUCTSADDEDTOCART, WIDGETBOUND],

		viewModel: null,

		view: null,

	    // MVVM Support
        
		// private property
		_viewAppended: false,
		_itemViewAppended: false,

		// Standard Methods
		initialise: function (el, o) {

			var widget = this;

			var internalView = $(el).children(":first");
			if (internalView.data("view")) {
				widget.view = internalView.html();
			} else {
				// setup grid view
				 _viewAppended = true;
				if (!widget.options.itemViewTemplate) {
					// generate an item template name and flag it to be created
					widget.options.itemViewTemplate = widget.name + "-item-template-" + kendo.guid();
					widget._itemViewAppended = true;
				}
				// get template text and parse it with the options
				var templateText = widget.options.viewTemplate ? $("#" + widget.options.viewTemplate).html() : widget._getDefaultViewTemplate();
				var viewTemplate = kendo.template(templateText);
				widget.view = viewTemplate(widget.options);
				// add the itemView (not parsed)
				if (!widget._itemViewAppended) {
					widget.view += widget._getDefaultItemViewTemplate();
				}
				widget.element.html(widget.view);
			}
			widget.viewModel = widget._getViewModel();
			// bind view to viewModel
			var target = widget.element.children(":first");
			kendo.bind(target, widget.viewModel);
			$.cv.css.bind($.cv.css.eventnames.orderChanged, $.proxy(widget.viewModel.setLocalAddedOrderLines, widget.viewModel), true);

			$.cv.css.bind($.cv.css.eventnames.viewApprovalOrder, function (order) {
		        if (order) {
		            widget.viewModel.set("orderNo", order.SoOrderNo);
                }
		    });

			widget.trigger(DATABOUND);

			var clicky = false;
			$(document).mousedown(function () {
				clicky = true;
			});

			$(document).mouseup(function () {
				setTimeout(function () {
					clicky = false;
				}, 5);
			});

			var holder = widget.element.find("input");
			holder.on('keydown', function (e) {
				var innerholder = widget.element.find("input:visible");
				var code = e.keyCode || e.which;
				if (code == '9') {
					window.currentTabTarget = innerholder.get(innerholder.index(this) + 1);
				}
			});

			holder.on('click', function (e) {
				window.currentTabTarget = this;
			});

			holder.on('blur', function (e) {
				if (this == window.currentTabTarget && clicky == false) {
					e.preventDefault();
					setTimeout(function () {
					    window.currentTabTarget.focus();
					    clicky = true;
					}, 1);
				}
			});

			widget.trigger(WIDGETBOUND);

            //bind to the select code widget enter key press event 
			$.cv.css.bind($.cv.css.eventnames.addProductToOrderByEnterKey, function () {
                widget.viewModel.addAll();
			});
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

		// private function
		_getViewModel: function () {
			var widget = this;

			// product datasource
			var initialProductSearchFilter = "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz";

			var productDataSource = $.cv.data.dataSource(
				{
					method: 'products/productSearchQuickAdd',
					pageSize: widget.options.pageSize,
					params: function (options, type) {
					    return {
					        searchString: initialProductSearchFilter,
					        categoryFilter: widget.options.categoryFilter,
                            pageSizeArg: widget.options.pageSize
					    };
					}
				});
			productDataSource.originalfilter = productDataSource.filter;
			productDataSource.filter = function (attr) {
				// override filter and set searchterm from filter
				var newArguments = arguments;
				if (arguments && arguments.length === 1) {
                    // added extra check to handle both kendo 2014 and 2016
				    if (arguments[0][0] !== undefined && arguments[0][0].value != null) {
				        initialProductSearchFilter = arguments[0][0].value;
				        newArguments[0] = [];
				    } else if (arguments[0].filters[0] !== undefined && arguments[0].filters[0] !== null) {
				        initialProductSearchFilter = arguments[0].filters[0].value;
				        newArguments[0] = [];
				    }
				}
				productDataSource.originalfilter.apply(this, newArguments);
			};
			// END setup datatsources

			var initDataSource = function () {
			    // get local storage
			    // if no local storage make dynamic service call
			    var array = [];
			    if ((_.isArray(widget.options.costCentreList) && widget.options.costCentreList.length === 0) || widget.options.costCentreList === "[]") {
			        widget.options.costCentreList = "";
			    } 
			    if (widget.options.costCentreList.length > 1) {
			        widget.options.costCentreList.unshift({ CostCentreCode: "", Name: widget.options.pleaseSelectText });
			    }
			    if (widget.options.costCentreList.length === 1) {
			        widget.options.quickAddLineDefaultDataSource.costCentreCode = widget.options.costCentreList[0].CostCentreCode;
			    }
			    widget.options.quickAddLineDefaultDataSource.costCentreList = widget.options.costCentreList;
			    widget.options.quickAddLineDefaultDataSource.hasMultipleCostCentres = widget.options.costCentreList.length > 0;
			    for (var i = 0; i < widget.options.stockCodeEntryLineCount; i++) {
			        array.push(widget.options.quickAddLineDefaultDataSource);
			    }
			    widget.options.dataSource = array;
			    setDataSource();
			    bindMouseClickEvents();
			};

			var setDataSource = function () {
				widget.dataSource = kendo.data.DataSource.create(widget.options.dataSource);

				if (widget.options.autoBind) {
					widget.dataSource.fetch();
				}
				viewModel.updateItemList();
			};

			var getColumnarData = function () {
			    if (!widget.dataSource) {
			        return [];
			    }
                
			    var items = getDataView();
			    var numberOfColumns = viewModel.get('numberOfColumns');
			    var numberOfLinesPerColumn = viewModel.get('numberOfLinesPerColumn');
                
			    var columnarData = [];
			    var currentIndex = 0;
			    for (var columnIndex = 0; columnIndex < numberOfColumns; columnIndex++) {

			        var column = {
			            columnIndex: columnIndex,
			            lineItems: []
			        };

			        for (var lineIndex = 0; lineIndex < numberOfLinesPerColumn; lineIndex++) {
			            column.lineItems.push(items[currentIndex++]);
			        }

			        columnarData.push(column);
			    }

			    return columnarData;
			};

			var getDataView = function () {
			    if (!widget.dataSource) {
			        return [];
			    }
				
			    //Setup items
				$.each(widget.dataSource.view(), function (idx, item) {
					// add standard commands
				    item.Index = idx;
				    item.lastValidQuantity = item.quantity;
					item.enableOrderLineNotes = viewModel.get("enableOrderLineNotes");
					item.useCostCentres = viewModel.get("useCostCentres");
					item.costCentreList = viewModel.get("costCentreList");
					item.useOrderEntry = viewModel.get("useOrderEntry");
					item.textAddButtonLabel = viewModel.get("textAddButtonLabel");
					item.isAdding = false;
					item.triggerMessages = viewModel.get("triggerMessages");
					item.clearWidgetMessages = viewModel.get("clearExistingMessages");
				    item.name = viewModel.get("name");
					item.execCommand_addProductKeyUp = function (event) {
						if (event.which == 13) {
							// stops the form from submitting when using the widget on a page that has form submit buttons
							event.preventDefault();
							event.stopPropagation();
						    viewModel.addAll();
						}
					};

					if (widget.options.preValidateLines) {
						item.preValidate = function () {
							var currentInput = $(widget.element.find(".k-input").get(this.Index));
							var timeout;
							var tempValue;
							var isValid = true;

							var currentInputCheck = function () {
								clearTimeout(timeout);
								timeout = null;
								if (currentInput.val() === "") {
									currentInput.attr('data-product-validated', '1');
									doFormating(widget.options.EmptyProductClass);
									//We are allowed empty
									isValid = true;
								} else if (tempValue != currentInput.val()) {
									tempValue = currentInput.val();
									//Should do some kind of input check?
									var ajaxRequest = $.cv.css.product.productSearchExact({
										searchString: currentInput.val(),
										searchType: "exact"
									});
									var json = ajaxRequest.responseText, obj = JSON && JSON.parse(json) || $.parseJSON(json);

									if (obj["data"] && obj["data"][0] &&
										obj["data"][0].ProductCode.toLowerCase() === currentInput.val().toLowerCase()) {
										currentInput.attr('data-product-validated', '1');
										doFormating(widget.options.ValidProductClass);
										isValid = true;
									} else {
										currentInput.attr('data-product-validated', '0');
										doFormating(widget.options.inValidProductClass);
										isValid = false;
									}
								} else if (tempValue == currentInput.val() && isValid == true) {
									// This case should occur when a validate product is edited but not changed
									// or selected from dropdown
									currentInput.attr('data-product-validated', '1');
									doFormating(widget.options.ValidProductClass);
								}
							};

							currentInput.parent().next().click(function () {
								tempValue = currentInput.val();
								isValid = true;
								// no need to check this is going to be valid
								// just setting styles
								currentInputCheck();
							});

							// After added reset anything that was added
							widget.bind(PRODUCTSADDEDTOCART, function () {
								if (currentInput.val() === "") {
									currentInput.attr('data-product-validated', '1');
									doFormating(widget.options.EmptyProductClass);
								}
							});

							currentInput.keyup(function (e) {
								currentInput.attr('data-product-validated', '0');
								doFormating(widget.options.CurrentlyBeingValidatedProductClass);
								if (timeout) {
									clearTimeout(timeout);
									timeout = null;
								}
								timeout = setTimeout(currentInputCheck, 1000);
								// Need this because in this case it is not attached to the widget.
								// This is because of the use of the sugestions in the input box.
								item.execCommand_addProductKeyUp(e);
							});

							currentInput.focusin(function () {
								tempValue = currentInput.val();
							});

							currentInput.focusout(function () {
								currentInputCheck();
							});

							var doFormating = function (toStyle) {
								currentInput.removeClass(
									widget.options.ValidProductClass + " " +
										widget.options.inValidProductClass + " " +
										widget.options.EmptyProductClass + " " +
										widget.options.CurrentlyBeingValidatedProductClass
								);
								currentInput.addClass(toStyle);
							};

						};
					}

					item.execCommand_add = function (e) {
					    if (e.which === 9 || (e.shiftKey && e.which === 9)) {
					        return;
					    }

					    if (isQuantityValid(item) && !$.cv.util.isNullOrWhitespace(item.productCode)) {
					        var params = getProductParams(item);

					        if (viewModel.get("orderNo")) {
					            viewModel.clearMessage();
					            item.set("isAdding", true);
					            $.cv.css.ordersApproval.addLineToOrder({
					                productCode: item.productCode,
					                orderNo: viewModel.get("orderNo"),
					                quantity: params.quantity,
					                notes: params.notes
					            }).done(function (response) {
					                $.cv.css.trigger($.cv.css.eventnames.approvalOrderUpdated, viewModel.get("orderNo"));
					                if (response.data.message.length > 0) {
					                    viewModel.setMessage(response.data.message, $.cv.css.messageTypes.success);
					                } else {
					                    viewModel.setMessage(widget.options.textProductAddedMessage, $.cv.css.messageTypes.success);
					                }
					            }).always(function () {
					                item.set("isAdding", false);
					                item.set("productCode", "");
					                item.set("quantity", "");
					                item.set("notes", "");
					            });
					        } else {
					            viewModel.setLocalUpdatedCurrentOrderLines();
					            viewModel.clearMessage();

					            item.set("isAdding", true);

					            _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
					            $.cv.css.addToCurrentOrder(params).done(function (response) {
					                if (response.data.editOrderOk === true) {
					                    resetProductParams(item);

					                    //Set the focus in the first product code input element
					                    $("#ProductSearch" + item.Index).focus()

					                    widget.trigger(PRODUCTADDEDTOCART, { productCode: item.productCode });
					                    if (response.data.message.length == 0) {
					                        viewModel.setMessage(widget.options.textProductAddedMessage, $.cv.css.messageTypes.success);
					                    } else {
					                        viewModel.setMessage(response.data.message, $.cv.css.messageTypes.success);
					                    }
					                } else {
					                    widget.trigger(PRODUCTADDTOCARTFAIL, { productCode: item.productCode, errorMessage: response.data.message });
					                    viewModel.setMessage(response.data.message, $.cv.css.messageTypes.error);
					                }

					                if (widget.options.refreshOrderLines) {
					                    viewModel.refreshLines();
					                }

					                item.set("isAdding", false);
					            });
					        }
					    }
					};

				    item.packQuantityTarget = "notCurrentlyUsed",
                    item.quantityTarget = "quantity",

				    item.execCommand_increaseQty = function() {
				        $.cv.util.kendoNumericTextBoxIncrease(this);
				    };

				    item.execCommand_decreaseQty = function () {
				        $.cv.util.kendoNumericTextBoxDecrease(this, 0);
				    };
				});

				return widget.dataSource.view();
			};

			var isQuantityValid = function (item) {
			    if (item.get("quantity").length == 0 && item.get("productCode").length != 0) {
			        item.set("quantity", 1);
			    }

				var valid = true, quantity = item.get("quantity");
				if (isNaN(quantity) || (!widget.options.allowDecimals && quantity % 1 != 0) || quantity < 0) {
					valid = false;
				}
				if (!valid) {
					item.set("quantity", item.get("lastValidQuantity"));
				} else {
					item.set("lastValidQuantity", quantity);
				}
				return valid;
			};

			var getProductParams = function (item) {
			    var params = {};
			    var parsed;

				params.productCode = item.get("productCode");

			    // For qty in case user had hit the negative qty button to reduct it,make sure that it is at least 1, no point adding 0 or less of an item.
				var qty = item.get("quantity");
				qty = isNaN(parsed = parseFloat(qty)) || parsed <= 0 ? 1 : parsed;
				params.quantity = qty;

				params.costCentre = item.get("costCentreCode");
				params.notes = item.get("notes");
				params.noteIsExtendedLineDescription = widget.options.noteIsExtendedLineDescription;
				params.campaignCode = "";
				params.attributes = "";
				params.stampData = "";
				params.stampProofData = "";

                // Possible for price / discount overrides to be used for e.g. reps
				var price = item.get("price");
				var discount = item.get("discount");
				price = isNaN(parsed = parseFloat(price)) || parsed < 0 ? -1 : parsed;
				discount = isNaN(parsed = parseFloat(discount)) || parsed < 0 | parsed > 100 ? -1 : parsed;

				params.price = price;
				params.discount = discount;

				params.gtmPageType = widget.options.gtmPageType;
				return params;
			};

			var resetProductParams = function (item) {
			    item.set("productCode", "");
			    item.set("description", "");
				item.set("quantity", "");
				item.set("lastValidQuantity", "");
				if (widget.options.costCentreList.length == 0 || widget.options.costCentreList.length > 1) {
				    item.set("costCentreCode", "");
				}
				item.set("notes", "");
				item.set("price", "");
				item.set("discount", "");
			};

			var bindMouseClickEvents = function () {
				$(document).mousedown(function () {
					viewModel.set("_mouseClicked", true);
				});
				$(document).mouseup(function () {
					viewModel.set("_mouseClicked", false);
				});
			};

			var viewModelJson = {
				// Properties for UI elements
				isAddingAll: false,
				dataSource: widget.options.dataSource,
				stockCodeEntryLineCount: widget.options.stockCodeEntryLineCount,
				numberOfColumns: widget.options.numberOfColumns,
                numberOfLinesPerColumn: widget.options.numberOfLinesPerColumn,
				enableOrderLineNotes: widget.options.enableOrderLineNotes,
				useCostCentres: widget.options.useCostCentres,
			    costCentreList: widget.options.costCentreList,
				useOrderEntry: widget.options.useOrderEntry,
				isStockCodeEntryAvailable: widget.options.isStockCodeEntryAvailable && widget.options.stockCodeEntryLineCount > 0,
				textAddButtonLabel: widget.options.textAddButtonLabel,
				textAddAllButtonLabel: widget.options.textAddAllButtonLabel,
				message: "",
				clearExistingMessages: widget.options.clearExistingMessages,
				triggerMessages: widget.options.triggerMessages,
				name: widget.options.name,
				setMessage: function (message, type) {
					$.cv.util.notify(this, message, type, {
						triggerMessages: widget.options.triggerMessages,
						source: widget.name
					});
				},
				clearMessage: function () {
					this.set("message", "");
					if (widget.options.triggerMessages) {
					    $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: "", source: "quickAdd", clearExisting: true, clearAllExisting: true });
						if (widget.options.clearAdditionalWidgetMessages.length > 0) {
							var widgetNames = widget.options.clearAdditionalWidgetMessages.split(",");
							for (var i = 0; i < widgetNames.length; i++) {
								$.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: widgetNames[i], clearExisting: true });
							}
						}
					}
				},
				updateItemList: function () {
				    this.set("itemList", getDataView());
				    this.set("columnarData", getColumnarData());
					widget.trigger(LINESRENDERED);
				},
				itemList: getDataView(),
				columnarData: getColumnarData(),

				updateItem: function (e) {
				    var data = e.sender.dataSource.data();
				    var productCode = e.sender.value();

				    $.each(data, function () {
				        var searchItem = this;
				        if (searchItem.ProductCode === productCode) {
				            e.data.set('description', searchItem.Description);
				            return false;
				        }
				    });
				},

				getLocalUpdatedCurrentOrderLines: function () {
					var localUpdatedCurrentOrderLines = {}, localCurrentOrderLines;
					localUpdatedCurrentOrderLines = $.cv.css.localGetUpdatedCurrentOrderLines();
					if (localUpdatedCurrentOrderLines == null)
						localUpdatedCurrentOrderLines = { linesBeforeAdd: [], updatedLines: [] };
					if (localUpdatedCurrentOrderLines.linesBeforeAdd == undefined)
						localUpdatedCurrentOrderLines["linesBeforeAdd"] = [];
					if (localUpdatedCurrentOrderLines.updatedLines == undefined)
						localUpdatedCurrentOrderLines["updatedLines"] = [];
					return localUpdatedCurrentOrderLines;
				},
				setLocalAddedOrderLines: function () {
					var localUpdatedCurrentOrderLines = this.getLocalUpdatedCurrentOrderLines(), localCurrentOrderLines, updatedLines = [];
					localCurrentOrderLines = $.cv.css.localGetCurrentOrderLines();
					// if the lines before add array is non empty calculate the new lines and add them into an array in local storage - will be used on the order summary widget validation
					if (localCurrentOrderLines != null) {
						// find all the lines before the add, that exists in the local lines where their quantity has changed
						updatedLines = _.pluck(_.filter(localUpdatedCurrentOrderLines.linesBeforeAdd, function (item) { return _.find(localCurrentOrderLines, function (lItem) { return lItem.LineSeq == item.LineSeq && lItem.OrderedQty != item.OrderedQty; }); }), "LineSeq");
						if (updatedLines.length > 0 && localUpdatedCurrentOrderLines.updatedLines != undefined && localUpdatedCurrentOrderLines.updatedLines.length > 0) {
							updatedLines = _.union(updatedLines, localUpdatedCurrentOrderLines["updatedLines"]);
						}
						if (updatedLines.length > 0)
							localUpdatedCurrentOrderLines["updatedLines"] = updatedLines;
						// find all the lines in the local lines that where not there before the add
						if (localUpdatedCurrentOrderLines.linesBeforeAdd != undefined && localUpdatedCurrentOrderLines.linesBeforeAdd.length > 0) {
							localUpdatedCurrentOrderLines["addedLines"] = _.difference(_.pluck(localCurrentOrderLines, 'LineSeq'), _.pluck(localUpdatedCurrentOrderLines.linesBeforeAdd, "LineSeq"));
						}
						$.cv.css.localSetUpdatedCurrentOrderLines(localUpdatedCurrentOrderLines);
					}
				},
				setLocalUpdatedCurrentOrderLines: function () {
					var localUpdatedCurrentOrderLines = this.getLocalUpdatedCurrentOrderLines(), localCurrentOrderLines, linesBeforeAddSeq = [], linesBeforeAddQty = [];
					localCurrentOrderLines = $.cv.css.localGetCurrentOrderLines();
					if (localCurrentOrderLines != null) {
						linesBeforeAddSeq = _.pluck(localCurrentOrderLines, 'LineSeq');
						linesBeforeAddQty = _.pluck(localCurrentOrderLines, 'OrderedQty');
						$.each(linesBeforeAddSeq, function (idx, item) {
							localUpdatedCurrentOrderLines["linesBeforeAdd"][idx] = { LineSeq: item, OrderedQty: linesBeforeAddQty[idx] };
						});
						//localUpdatedCurrentOrderLines["linesBeforeAdd"] = _.pluck(localCurrentOrderLines, 'LineSeq');
						$.cv.css.localSetUpdatedCurrentOrderLines(localUpdatedCurrentOrderLines);
					}
				},
				addAll: function () {
				    var _this = this,
                        products = $.grep(this.get("itemList"), function(item, idx) {
                            return (isQuantityValid(item) && item.quantity.toString().length > 0 && !$.cv.util.isNullOrWhitespace(item.productCode));
                        }),
                        productsAdded = "",
                        errorMessages = [],
                        successMessages = [],
                        clearExistingMessages = this.get("clearExistingMessages"),
                        productParams = [],
                        localUpdatedCurrentOrderLines = {},
                        localCurrentOrderLines;

					if (products.length > 0 && $(widget.element.find('input.k-input[data-product-validated="0"]')).length == 0) {
						$.each(products, function (idx, item) {
							productParams.push(getProductParams(item));
						});
						this.setLocalUpdatedCurrentOrderLines();
						this.clearMessage();
						this.set("isAddingAll", true);
						_.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
						$.cv.css.orders.addToCurrentOrderBulk({
							batchData: productParams,
							triggerGetLines: widget.options.getCurrentOrderLinesOnAdd,
							gtmPageType: widget.options.gtmPageType
						}).done(function (response) {
							$.each(products, function (idx, item) {
								var responseData = response.data[idx];

								if (response.errorMessage[idx] == null &&
									responseData != null &&
									responseData.editOrderOk === true) {
								    if (responseData.message.length == 0) {
								        productsAdded = productsAdded.length == 0 ? item.productCode : productsAdded + ", " + item.productCode;
								    } else {
								        successMessages.push({
								            productCode: item.productCode,
								            successMessage: responseData.message
								        });
								    }
								    resetProductParams(item);
								} else {
									if (response.errorMessage[idx] != null) {
										errorMessages.push({
											productCode: item.productCode,
											errorMessage: response.errorMessage[idx]
										});
									} else if (responseData != null && responseData.message != '') {
										errorMessages.push({
											productCode: item.productCode,
											errorMessage: responseData.message
										});
									}
								}
							});

						    //Set the focus in the first product code input element
							$("#ProductSearch0").focus();

							widget.trigger(PRODUCTSADDEDTOCART, { products: products });
							if (productsAdded.length > 0)
								_this.setMessage(widget.options.textProductsAddedMessage + " " + productsAdded, $.cv.css.messageTypes.success);
							if (errorMessages.length > 0) {
								_this.set("clearExistingMessages", false);
								$.each(errorMessages, function (idx, item) {
									_this.setMessage(widget.options.textAddAllMessage.format(item.productCode, item.errorMessage), $.cv.css.messageTypes.error);
								});
								_this.set("clearExistingMessages", clearExistingMessages);
							}
							if (successMessages.length > 0) {
							    _this.set("clearExistingMessages", false);
							    $.each(successMessages, function (idx, item) {
							        _this.setMessage(item.successMessage, $.cv.css.messageTypes.success);
							    });
							    _this.set("clearExistingMessages", clearExistingMessages);
							}
							_this.set("isAddingAll", false);
						});
					} else if (products.length > 0) {
						_this.setMessage(widget.options.textProductPreValidateError);
					}
				},
				refreshLines: function () {
					var d1 = $.cv.css.getCurrentOrderLines();
					$.when(d1).done(function () {
						$(widget.options.linesElement).each(function () {
							var linesWidget = $(this).data(widget.options.linesData);
							if (linesWidget)
								linesWidget.refreshLines();
						});
					});
				},
				_mouseClicked: false,
				autoCompleteBlurEvent: function (e) {
				},
				productSearchDataSource: productDataSource,

				isCollapsableAreaExpandedByDefault: widget.options.isCollapsableAreaExpandedByDefault,
				isCollapsableAreaExpanded: widget.options.isCollapsableAreaExpandedByDefault,
				toggleCollapsableArea: function () {
				    this.set("isCollapsableAreaExpanded", !this.get("isCollapsableAreaExpanded"));
				},
				expandCollapseButtonLabel: function() {
				    return this.get("isCollapsableAreaExpanded") ? widget.options.expandCollapseButtonLabelCollapsed
                        : widget.options.expandCollapseButtonLabelExpanded.format(this.get("stockCodeEntryLineCount"));
				},
				showAddButton: function() {
				    return !this.get("isCollapsableAreaExpanded");
				}
			};

			//Binds all of the inputs that need preValidation
			for (var i = 0; i < widget.options.stockCodeEntryLineCount; i++) {
				viewModelJson[("ProductCode" + i)] = function (e) {
					e.preValidate();
				};
			}


			var viewModel = kendo.observable(viewModelJson);
			initDataSource();
            
			return viewModel;
		},

		_getDefaultViewTemplate: function () {
			var widget = this;
			// modify view template based on widget.options where applicable
			var html = ""
				+ "<div>"
				+ "<div class='itemList' data-bind='source: itemList' data-template='" + widget.options.itemTemplateId + "'>";
			// add the item template
			//html += "<div data-bind='source: itemList' data-template='" + widget.options.itemTemplateId + "'>";
			//html += "</div>";
			html += "</div>";
			return html;
		},

		_getDefaultItemViewTemplate: function () {
			var widget = this;
			// return the template to be bound to the dataSource items
			var html = "<script type='text/x-kendo-template' id='" + widget.options.itemTemplateId + "'>";
			html += "<div>";
			html += "Product";
			html += "</div></script>";
			return html;
		}
	};

	// register the widget

	$.cv.ui.widget(quickAddWidget);

})(jQuery);
