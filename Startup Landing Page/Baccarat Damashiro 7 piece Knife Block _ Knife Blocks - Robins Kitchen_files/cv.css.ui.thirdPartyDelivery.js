/**
    Widget:
        Third party Delivery Charges

    Author:
        Tod Lewin: 2015-08-18
        Call: 74080
**/

;

(function ($) {
    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change";
        DELIVERY_METHOD_NOT_SET = "";
        DELIVERY_METHOD_DELIVERY = "Delivery";
        DELIVERY_METHOD_PICKUP = "Pickup";

    var widgetDefinition = {
        name: "thirdPartyDelivery",
        extend: "mvvmwidget",
        extendEvents: [DATABINDING, DATABOUND],

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            clearExistingMessages: true,
            getDataOnInit: true,
            showMessages: true,
            alwaysDisplay: false,
            overrideRolePrompt: false,
            overrideResourceMessages: false,
            deliveryMethod: DELIVERY_METHOD_NOT_SET,

            // viewModel flags
            autoBind: true,
            triggerMessages: true,

            // events
            // view flags
            // view text defaults
            textThirdPartyDeliveryChargePrompt: "Third Party Delivery Charge",
            textThirdPartydeliveryNotApplicablePrompt: "No Third Party Delivery Charge Applies",
            textThirdPartyDeliveryApplicableMessage: "Your Delivery Address is not in our record. A Third Party Delivery Charge will be added to this order",
            textThirdPartyDeliveryNotApplicableMessage: "Your Delivery Address is in our record. A Third Party Delivery Charge is not applicable for this order",

            // widget settings
            viewTemplate: null
        },

        // Standard Methods
        initialise: function (el, o) {
            var widget = this,
                viewIsWidgetContent = false,
                tmp = null;

            widget.sharedClassObjCheckAndSetup();
            $.cv.css.sharedClassObj.addClass(this.name, this);

            if (widget.options.allowCustomOptions)
                widget._createCustomOptions();

            var internalView = $(el).children(":first");

            // Allow data-view on the containing element instead
            if (!internalView.data("view")) {
                internalView = $(el);
            }

            if (internalView.data("view")) {
                widget.view = internalView.html();
            } else {
                // setup grid view
                widget._viewAppended = true;
                // if itemTemplate is defined, it must be defined on the extended widget - and therefore required 
                if (widget.options.itemTemplate !== undefined) {
                    // generate an item template id and flag it to be created
                    widget.options.itemTemplateId = widget.name + "-item-template-" + kendo.guid();
                    widget._itemTemplateAppended = true;
                }
                // get template text and parse it with the options
                if (widget.options.viewTemplate) {
                    widget.viewTemplate = widget.options.viewTemplate;
                } else {
                    widget.viewTemplate = '';
                    tmp = widget._buildViewTemplate(); // this sets the viewTemplate property

                    // Bring some consistency: view, item and model methods all optionally
                    // return what they create.
                    if (tmp != null) {
                        widget.viewTemplate = tmp;
                        tmp = null; // 4 clarity
                    }
                }
                var templateFn = kendo.template(widget.viewTemplate);
                if ($.isFunction(widget.viewTemplateParsing)) {
                    widget.viewTemplateParsing(widget.options);
                }
                widget.view = templateFn(widget.options);
                if ($.isFunction(widget.viewTemplateParsed)) {
                    widget.viewTemplateParsed(widget.options);
                }
                // add the itemTemplate (not parsed)
                if (widget.options.itemTemplateId) {
                    widget.itemTemplate = '';
                    tmp = widget._buildItemTemplate();

                    // Bring some consistency: view, item and model methods all optionally
                    // return what they create
                    if (tmp != null) {
                        widget.itemTemplate = tmp;
                        tmp = null; // 4 clarity
                    }

                    widget.view += widget.itemTemplate;
                }
                if ($.isFunction(widget.viewAppending)) {
                    widget.viewAppending();
                }
                widget.element.html(widget.view);
                if ($.isFunction(widget.viewAppended)) {
                    widget.viewAppended();
                }
            }

            widget.viewModel = widget._getViewModel();

            // wrap the view if not a single element - i.e. need to bind to a single element that contains the whole view
            if (widget.element.children().length > 1) {
                var whtml = widget.element.html();
                widget.element.html("<div class='cv-widget-view-wrapper'>" + whtml + "</div>");
            }

            var target = widget.element.children(":first");
            if ($.isFunction(widget.viewModelBinding)) {
                widget.viewModelBinding();
            }
            // bind view to viewModel
            kendo.bind(target, widget.viewModel);
            if ($.isFunction(widget.viewModelBound)) {
                widget.viewModelBound();
            }
            // dataSource default should be [] if the widget uses a datasource
            if (widget.options.dataSource) {
                widget._dataSource();
                // initialise the datasource if function defined
                if ($.isFunction(widget.initDataSource) && !widget.options.disableSourceInit) {
                    // ensure datasource not passed in
                    var passedIn = (widget.options.dataSource instanceof kendo.data.DataSource) || ($.isArray(widget.options.dataSource) && widget.options.dataSource.length > 0);
                    if (!passedIn) {
                        widget.initDataSource();
                    }
                }
            }

            $.cv.css.bind($.cv.css.eventnames.deliveryAddressModeChanged, $.proxy(widget.viewModel.deliveryAddressModeChanged, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.addressBeingEdited, $.proxy(widget.viewModel.addressBeingEdited, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.addressChanged, $.proxy(widget.viewModel.addressChanged, widget.viewModel));
            $.cv.css.bind($.cv.css.eventnames.addressValidationUpdated, $.proxy(widget.viewModel.addressValidationUpdated, widget.viewModel));
        },

        initDataSource: function (showMessages) {
            var widget = this;

            var options = {
                deliveryMethod: widget.viewModel.get("deliveryMethod")
            };

            if (widget.options.overrideRolePrompt && widget.options.textThirdPartyDeliveryChargePrompt && widget.options.textThirdPartyDeliveryChargePrompt !== "") {
                options.thirdPartyDeliveryChargePrompt = widget.options.textThirdPartyDeliveryChargePrompt;
            }

            var thirdPartyDeliveryPromise = $.cv.css.thirdPartyDelivery.getThirdPartyDelivery(options);
            $.when(thirdPartyDeliveryPromise).done(function (msg) {
                var data = msg.data;
                
                if (showMessages && msg.data.Messages.length > 0) {
                    widget.viewModel.clearMessage();
                    $.each(data.Messages, function (idx, item) {
                        widget.viewModel.setMessage(item, $.cv.css.messageTypes.error);
                    });
                }

                widget.setDataSource(data.ThirdPartyDeliveryCharges);

                widget.viewModel.set("isInitialLoad", false);
            });
        },

        _getViewModel: function () {
            var widget = this,
                opts = widget.options;

            var vm = kendo.observable($.extend({}, opts, {
                hasThirdPartyDeliveryCharges: function () {
                    if (this.get("itemList").length > 0) {
                        return true;
                    }

                    return false;
                },

                // UI Element state
                isInitialLoad: true,
                isDisabled: false,
                message: '',


                showThirdPartyDelivery: function () {
                    if (this.get("isDisabled")) {
                        return false;
                    }

                    if (this.get("alwaysDisplay")) {
                        return true;
                    }

                    if (this.get("itemList").length > 0) {
                        return true;
                    }

                    return false;
                },

                // functions for UI events
                clearMessage: function () {
                    var clearExistingMessages = this.get("clearExistingMessages");
                    this.set("clearExistingMessages", true);
                    this.set("message", "");
                    if (widget.options.triggerMessages)
                        $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: 'thirdPartyDelivery', clearExisting: this.get("clearExistingMessages") });
                    this.set("clearExistingMessages", clearExistingMessages);
                },

                setMessage: function (message, type) {
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name
                    });
                },

                updateViewModelFromDataSource: function () {
                    this.updateItemList();
                },

                updateItemList: function () {
                    var dataView = this.getDataView();
                    this.set("itemList", dataView);
                },

                getDataView: function () {
                    if (!this.get("dataSource")) {
                        return [];
                    }
                        
                    return this.get("dataSource").view();
                },

                // Holds the list of third party delivery charges which are applicable
                itemList: [],

                addressChanged: function (msg) {
                    if (msg.deliveryAddressMode === DELIVERY_METHOD_DELIVERY && (this.get("deliveryMethod") === DELIVERY_METHOD_DELIVERY || this.get("deliveryMethod") === DELIVERY_METHOD_NOT_SET)) {
                        if (this.showThirdPartyDelivery()) {
                            widget.initDataSource(this.get("showMessages"));
                        }
                    }
                },

                deliveryAddressModeChanged: function (msg) {
                    switch (msg.message) {
                        case "Delivery":
                            this.set("deliveryMethod", DELIVERY_METHOD_DELIVERY);

                            this.set("isInitialLoad", true);
                            this.set("isDisabled", false);
                            break;
                        case "Pickup":
                            this.set("deliveryMethod", DELIVERY_METHOD_PICKUP);
                            this.set("isDisabled", true);
                            break;
                    }
                    widget.initDataSource(this.get("showMessages"));
                }
            }));

            return vm;
        }
    };

    // Register
    $.cv.ui.widget(widgetDefinition);

})(jQuery);
