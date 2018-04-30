/* Name: checkout messages
* Author: Chad Paynter
* Created: 20130510
*
* Dependencies:    
*          --- Third Party ---
*          jquery.js 
*          kendo.web.js
*           --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.css.js
*          /Scripts/cv.util.js
* Params:  
*           dataSource: 
*           autoBind: 
*           triggerMessages
*           fieldsUpdated: 
*           showUpdateButton
*           textErrorUpdating
*           textErrorEnteredDateInWrongFormat
*           textErrorEnteredEmailInWrongFormat
*           textErrorEnteredDecimalInWrongFormat
*           textErrorEnteredUrlInWrongFormat
*           viewTemplate: kendo template id for the main view
*           itemViewTemplate: kendo template id for each item
*/
;
(function ($, undefined) {

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        FIELDSUPDATED = "fieldsUpdated",
        FIELDSCOMPLETED = "fieldsCompleted",
        WIDGETDATAINTIALISED = "widgetDataInitialised",
        FIELDSCHANGED = "fieldsChanged";


    var orderCompleteFieldsWidget = {
        // Standard Variables

        // widget name
        name: "orderCompleteFields",

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            inputErrorClass: "input-error",
            // viewModel flags
            autoBind: true,
            hideEmptyPrompt: true,
            // messages
            triggerMessages: false,
            // events
            fieldsUpdated: '',
            // view flags
            showUpdateButton: false,
            updateOnChange: true,

            // text resources
            textErrorUpdating: 'Error updating order',
            textErrorEnteredDateInWrongFormat: 'Date entered is in the wrong format',
            textErrorEnteredEmailInWrongFormat: 'Email entered is in the wrong format',
            textErrorEnteredDecimalInWrongFormat: 'Decimal entered in the wrong format',
            textErrorEnteredUrlInWrongFormat: 'Url entered in the wrong format',
            textErrorNotAllFieldsComplete: "The following fields are incomplete:",
            textMandatoryFieldNotComplete: "Mandatory field",
            textErrorNotAllFieldsValid: "The following fields are invalid:",

            // view Template
            viewTemplate: null,
            itemViewTemplate: null
        },

        events: [DATABINDING, DATABOUND, FIELDSUPDATED, FIELDSCOMPLETED, WIDGETDATAINTIALISED, FIELDSCHANGED],

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
                if (!widget.options.itemViewTemplate) {
                    // generate an item template name and flag it to be crevated
                    widget.options.itemViewTemplate = widget.name + "-item-template-" + kendo.guid();
                    widget._itemViewAppended = true;
                }
                // get template text and parse it with the options
                var templateText = widget.options.viewTemplate ? $("#" + widget.options.viewTemplate).html() : widget._getDefaultViewTemplate();
                var viewTemplate = kendo.template(templateText);
                widget.view = viewTemplate(widget.options);
                // add the itemView (not parsed)
                if (widget._itemViewAppended) {
                    widget.view += widget._getDefaultItemViewTemplate();
                }
                widget.element.html(widget.view);
            }
            widget.viewModel = widget._getViewModel();
            // bind view to viewModel
            var target = widget.element.children(":first");
            kendo.bind(target, widget.viewModel);
            widget.trigger(DATABOUND);
            $.cv.css.bind($.cv.css.eventnames.orderChanged, $.proxy(widget.viewModel.orderUpdated, widget.viewModel));
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

        setUpdateOnChange: function (updateOnChange) {
            var widget = this;
            widget.viewModel.set("updateOnChange", updateOnChange);
        },

        updateOrderCompleteFields: function () {
            var widget = this;
            widget.viewModel.updateOrderCompleteFields();
        },

        // private function

        _getViewModel: function () {
            var widget = this;

            var _getDataView = function (data, posToProcess) {
                var widget = this;
                var array = [];
                // get index item
                if (posToProcess < data.length) {
                    var item = data[posToProcess];

                    $.each(item.Fields, function (indexFields, fieldToUse) {
                        var dataItem = $.cv.util.getFieldItemData(fieldToUse);

                        // override default dataChanged event
                        dataItem.dataChanged = function (e) {
                            var updateOnChange = this.parent().parent().get("updateOnChange");
                            if (dataItem.fieldValid(e) && updateOnChange) {
                                this.parent().parent().updateOrderCompleteField(this.fieldItem.fieldName);
                                this.parent().parent().validateInputFields(false);
                            }
                        };

                        array.push(dataItem);
                    });
                }

                return array;
            };

            var initDataSource = function () {
                var d3 = $.cv.css.orders.getOrderCompleteFieldGroupData();
                $.when(d3).done(function (msg) {
                    if (!msg.errorMessage || msg.errorMessage.length == 0) {
                        widget.options.dataSource = msg.data;
                        // set data to list of fields bound
                        for (var intPos = 0; intPos < msg.data.length; intPos++) {
                            // get list of fields
                            var dataListTemplates = _getDataView(msg.data, intPos);
                            // set name of fieldgroup
                            $.each(dataListTemplates, function (index, field) {
                                var fieldToUse = field.fieldItem;
                                var order = widget.viewModel;
                                viewModel.set('fieldsExist' + (intPos + 1).toString(), true);
                            });
                            viewModel.set('itemList' + (intPos + 1).toString(), dataListTemplates); //kendo.dataSource();
                            // get display label of fieldgroup
                            viewModel.set('fieldGroup' + (intPos + 1).toString() + 'Name', msg.data[intPos].FieldGroupName);
                            viewModel.set('fieldGroup' + (intPos + 1).toString() + 'Description', msg.data[intPos].Description);

                        }
                        viewModel.validateInputFields(false);

                    } else {
                        widget.options.dataSource = [];
                        widget.viewModel.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                    }
                    widget.trigger(WIDGETDATAINTIALISED);
                    // to make the drop down widget appear as kendo drop downs
                    $.cv.util.bindKendoWidgets($(widget.element[0]));
                });
            };

            var viewModel = kendo.observable({
                // Properties for UI elements
                order: null,

                /*------------------------------------*\
                   TIMEOUTS
               \*------------------------------------*/

                redirectToTimeoutUrl: function (fallbackUrl, params, includeInBrowserHistory) {
                    if ($.cv.ajax.settings.timeoutRedirectUrl == "")
                        $.cv.util.redirect(fallbackUrl, params, !includeInBrowserHistory);
                    else
                        $.cv.util.redirect($.cv.ajax.settings.timeoutRedirectUrl, params, !includeInBrowserHistory);
                },

                /*------------------------------------*\
                   MESSAGES
               \*------------------------------------*/

                clearMessage: function () {
                    var clearExistingMessages = this.get("clearExistingMessages");
                    this.set("clearExistingMessages", true);
                    this.set("message", "");
                    if (widget.options.triggerMessages)
                        $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: 'orderCompleteFields', clearExisting: this.get("clearExistingMessages") });
                    this.set("clearExistingMessages", clearExistingMessages);
                },

                setMessage: function (message, type) {
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name
                    });
                },

                clearExistingMessages: true,
                message: '',

                dataSource: widget.options.dataSource,

                // indicates if all fields entered
                fieldsCompleted: function (displayMessages) {
                    displayMessages = typeof displayMessages !== 'undefined' ? displayMessages : false;
                    var fields = [];
                    var completed = true, incompleteFields = "";
                    $.merge($.merge(fields, this.get('itemList1')), this.get('itemList2'));
                    $.each(fields, function (index, item) {
                        if (!item.fieldItem.parent().fieldValid({ data: item.fieldItem.parent() }, displayMessages)) {
                            completed = false;
                            if (!item.emptyPrompt)
                                incompleteFields = incompleteFields.length == 0 ? " " + item.fieldItem.Prompt : incompleteFields + ", " + item.fieldItem.Prompt;
                        }
                    });
                    if (completed === true)
                        widget.trigger(FIELDSCOMPLETED);
                    if (!completed && displayMessages)
                        this.setMessage(widget.options.textErrorNotAllFieldsComplete + incompleteFields, $.cv.css.messageTypes.error);
                    return completed;
                },

                // indicates if all fields valid
                fieldsValid: function (displayMessages) {
                    displayMessages = typeof displayMessages !== 'undefined' ? displayMessages : false;
                    var fields = [];
                    var valid = true, invalidFields = "";
                    $.merge($.merge(fields, this.get('itemList1')), this.get('itemList2'));
                    $.each(fields, function (index, item) {
                        var val = this.get(item.fieldItem.fieldName);
                        var itemValid = true;
                        if (val != null) {
                            itemValid = item.fieldItem.parent().fieldValid({ data: item.fieldItem.parent() }, displayMessages);
                        }
                        if (!itemValid) {
                            valid = false;
                            if (!item.emptyPrompt)
                                invalidFields = invalidFields.length == 0 ? " " + item.fieldItem.Prompt : invalidFields + ", " + item.fieldItem.Prompt;
                            
                        }
                    });
                    if (!valid && displayMessages)
                        this.setMessage(widget.options.textErrorNotAllFieldsValid + invalidFields, $.cv.css.messageTypes.error);
                    return valid;
                },

                orderUpdated: function () {

                },

                updateItemList: function () {
                    var dataView = widget._getDataView();
                    this.set("itemList", dataView);
                    widget.trigger(FIELDSUPDATED, { count: dataView.length });
                },

                updateOnChange: widget.options.updateOnChange,

                updateOrderCompleteField: function (fieldname) {
                    // create payload
                    var list = {};
                    var list2 = {};
                    var valid = true;
                    widget.viewModel.clearMessage();
                    $.each([this.get('itemList1'), this.get('itemList2')], function (index, fieldgroupdata) {
                        $.each(fieldgroupdata, function (idx, item) {
                            // if a fieldname triggered it, just validate and send that
                            if (fieldname != null && item.fieldItem.fieldName === fieldname) {
                                var val = this.get(item.fieldItem.fieldName);
                                if (item.fieldItem.parent().fieldValid({ data: item.fieldItem.parent() }, false)) {
                                    if (index == 0)
                                        list[item.fieldItem.fieldName] = val;
                                    else if (index == 1)
                                        list2[item.fieldItem.fieldName] = val;
                                } else
                                    valid = false;
                            }
                        });
                    });

                    var pload = {};

                    pload[this.get('fieldGroup1Name')] = list;
                    pload[this.get('fieldGroup2Name')] = list2;

                    this.updateOrderCompleteFieldList(pload);
                },

                updateOrderCompleteFields: function () {
                    // create payload
                    var list = {};
                    var list2 = {};
                    var valid = true;
                    widget.viewModel.clearMessage();
                    $.each([this.get('itemList1'), this.get('itemList2')], function (index, fieldgroupdata) {
                        $.each(fieldgroupdata, function (idx, item) {
                            var val = this.get(item.fieldItem.fieldName);
                            if (item.fieldItem.parent().fieldValid({ data: item.fieldItem.parent() }, false)) {
                                if (index == 0)
                                    list[item.fieldItem.fieldName] = val;
                                else if (index == 1)
                                    list2[item.fieldItem.fieldName] = val;
                            } else
                                valid = false;
                        });
                    });

                    var pload = {};

                    pload[this.get('fieldGroup1Name')] = list;
                    pload[this.get('fieldGroup2Name')] = list2;

                    this.updateOrderCompleteFieldList(pload);
                    this.validateInputFields(false);

                },

                updateOrderCompleteFieldList: function (pload) {
                    var prom = $.cv.css.orders.updateOrderCompleteFieldGroupData({
                        newValues: pload
                    });
                    prom.done(function (msg) {
                        if (msg.errorMessage != null)
                            widget.viewModel.setMessage(widget.options.textErrorUpdating, $.cv.css.messageTypes.error);
                        else {
                            widget.viewModel.orderUpdated();
                            widget.trigger(FIELDSCHANGED);
                        }
                    });
                    prom.fail(function (msg) {
                        widget.viewModel.setMessage(widget.options.textErrorUpdating, $.cv.css.messageTypes.error);
                    });
                },

                // list of field templates and fieldgroup names to bind to list item template
                itemList1: [],
                itemList2: [],
                // data binding flags to show /hide fieldgroups
                fieldsExist1: false,
                fieldsExist2: false,
                // names of fieldgroups to use for updating data
                fieldGroup1Name: '',
                fieldGroup2Name: '',

                validateInputFields: function (showMessages) {
                    var passedValidation = true, widgetReference = "orderCompleteFields";
                    // check mandatory fields
                    // using the this command inside this validation function ensures it fires of when one of the fields being monitored is updated
                    this.clearMessage();
                    if (!this.fieldsCompleted(showMessages))
                        passedValidation = false;
                    else if (!this.fieldsValid(showMessages))
                        passedValidation = false;
                    $.cv.css.addRemovePageValidationError(passedValidation, widgetReference);
                    $.cv.css.trigger($.cv.css.eventnames.orderCompleteFieldsValidated);
                }


            });

            viewModel.bind("change", function (e) {

            });
            initDataSource();
            return viewModel;
        },

        _getDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = ""
                + "<div data-view='true'>"
                + "<div>"
                //+ "<span data-bind='html: message'></span>"
                + "<div data-bind='visible: fieldsExist1'>"
                + "<fieldset class='order-complete-fields'><legend data-bind='text: fieldGroup1Name'></legend><div class='itemList1' data-bind='source: itemList1' data-template='" + widget.options.itemViewTemplate + "'></div></fieldset>"
                + "</div><div data-bind='visible: fieldsExist2'><fieldset class='order-complete-fields' data-bind='visible: fieldsExist2'><legend data-bind='text: fieldGroup2Name'></legend><div class='itemList2' data-bind='source: itemList2' data-template='" + widget.options.itemViewTemplate + "'></div></fieldset>"
                + "</div>" + (widget.options.showUpdateButton ? "<input type='button' data-bind='click: updateOrderCompleteFields' value='Update' />" : "")
                + "</div>"
                + "</div>";
            return html;
        },

        _getDefaultItemViewTemplate: function () {
            var widget = this;
            // return the template to be bound to the dataSource items
            var html = "<script type='text/x-kendo-template' id='" + widget.options.itemViewTemplate + "'>"
                + "<div class='fieldContainer'>"
                + (widget.options.hideEmptyPrompt ? "<label data-bind='html: prompt, invisible: emptyPrompt'></label>" : "<label data-bind='html: prompt'></label>")
                + "<span data-bind='html: fieldTemplate'></span>"
                + "</div>"
                + "</script>";
            return html;
        }
    };

    // register the widget

    $.cv.ui.widget(orderCompleteFieldsWidget);

})(jQuery);