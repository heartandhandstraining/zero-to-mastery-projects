/* Name: message
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
* Params:  
*       dataSource: 
*       fadeTime: 
*       autoBind: 
*       viewTemplate: 
*       itemViewTemplate: 
*/
;
(function ($, undefined) {

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        MESSAGESHOWN = "messageShown",
        CHANGE = "change",
        URLMESSAGESOURCE = "urlMessage";


    var messageWidget = {
        // Standard Variables

        // widget name
        name: "message",

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            fadeTime: 'slow',
            queryStringMessageParameters: ["message"],
            queryStringMessageType: $.cv.css.messageTypes.warning,
            messageTypesRequiringConfirmation: [],
            // viewModel flags
            autoBind: true,
            displayUrlMessages: true,
            fadeOutMessages: false,
            // events
            // view flags
            // view text defaults
            // view Template
            viewTemplate: null, // TODO: Treat these as IDs, remove the last one.
            itemViewTemplate: null
            //itemTemplateId: "cvgrid-item-template-" + kendo.guid()
        },

        events: [DATABINDING, DATABOUND, MESSAGESHOWN],

        viewModel: null,

        view: null,

        // MVVM Support

        // private property
        _viewAppended: false,
        _itemViewAppended: false,


        // Standard Methods
        initialise: function(el, o) {

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
            $.cv.css.bind($.cv.css.eventnames.message, $.proxy(widget.viewModel.insertMessage, widget.viewModel));
        },

        destroy: function() {
            var widget = this;
            // remove the data element
            widget.element.removeData(widget.name);
            // clean up the DOM
            if (widget._viewAppended) {
                $.cv.util.destroyKendoWidgets(widget.element);
                widget.element.empty();
            }
        },

        insertMessage: function(message) {
            var widget = this;
            widget.viewModel.insertMessage(message);
        },

        // private function
        _getViewModel: function() {
            var widget = this;

            var initDataSource = function() {
                if (widget.options.dataSource.length == 0) {
                    var array = [];
                    widget.options.dataSource = array;
                }
                setDataSource();
                if (widget.options.displayUrlMessages) {
                    var urlMessage = "";
                    $.each(widget.options.queryStringMessageParameters, function (idx, item) {
                        urlMessage = $.cv.util.queryStringValue(item);
                        if (urlMessage != undefined && urlMessage.length > 0)
                            viewModel.insertMessage({ message: urlMessage, type: widget.options.queryStringMessageType, source: URLMESSAGESOURCE, clearExisting: false });
                    });
                }
            };
    
            var setDataSource = function() {
                widget.dataSource = kendo.data.DataSource.create(widget.options.dataSource);

                if (widget.options.autoBind) {
                    widget.dataSource.fetch();
                }
                viewModel.updateItemList();
            };
    
            var getDataView = function() {
                // check if ds is initialised
                if (!widget.dataSource || widget.dataSource.view().length == 0)
                    return [];
                $.each(widget.dataSource.view(), function(idx, item) {
                    // add standard commands
                    item.Index = idx;
                    // this is used as a callback method so that success messages are removed once they have faded out
                    item.removeMessage = function() {
                        widget.dataSource.remove(item);
                        $.cv.css.nonconfirmedMessageBeingShown = false;
                    };
                });
                return widget.dataSource.view();
            };

            kendo.data.binders.fadeIn = kendo.data.Binder.extend({
                refresh: function() {
                    var value = this.bindings["fadeIn"].get();
                    if (value) {
                        $(this.element).css({ 'display': 'none' }).fadeIn(widget.options.fadeTime);
                        widget.trigger(MESSAGESHOWN);
                    }
                }
            });

            var viewModel = kendo.observable({
                // Properties for UI elements
                dataSource: widget.options.dataSource,

                fadeMessageIn: true,

                message: '',

                hasMessages: function () {
                    return this.get("itemList").length;
                },

                updateItemList: function() {
                    this.set("itemList", getDataView());
                },

                itemList: getDataView(),

                insertMessage: function (message) {
                    var vm = this;
                    if (message.clearAllExisting) {
                        this.removeAllMessagesFromSource();
                    }
                    else if (message.clearExisting && message.source) {
                        this.removeExistingMessagesFromSource(message.source, message.messageGroup);
                    }
                    if (message.message !== "") {
                        message.execCommand_hide = function () {
                            widget.dataSource.remove(this);
                            $.cv.css.nonconfirmedMessageBeingShown = false;
                            vm.updateItemList();
                        }
                        if (_.indexOf(widget.options.messageTypesRequiringConfirmation, message.type) !== -1) {
                            message.requiresConfirmation = true;
                            message.allowFadeOut = false;
                        } else {
                            message.requiresConfirmation = false;
                            message.allowFadeOut = widget.options.fadeOutMessages;
                        }
                        message.additionalClasses = message.additionalClasses ? message.additionalClasses + " " + message.type : message.type;
                        widget.dataSource.add(message);

                        if (!message.requiresConfirmation) {
                            $.cv.css.nonconfirmedMessageBeingShown = true;
                        }
                    }
                    this.updateItemList();
                },

                removeExistingMessagesFromSource: function (source, messageGroup) {
                    var raw = widget.dataSource.data();
                    var length = raw.length;
                    var item, i;
                    var itemKey = "";
                    for (i = length - 1; i >= 0; i--) {
                        item = raw[i];
                        if (item.source) {
                            if (item.source === source) {
                                if ($.cv.util.isNullOrWhitespace(messageGroup)) {
                                    widget.dataSource.remove(item);
                                } else if (item.messageGroup === messageGroup) {
                                    widget.dataSource.remove(item);
                                }
                            }
                        }
                    }

                },
                
                removeAllMessagesFromSource: function () {
                    var raw = widget.dataSource.data();
                    var length = raw.length;
                    var item, i;
                    for (i = length - 1; i >= 0; i--) {
                        item = raw[i];
                        widget.dataSource.remove(item);
                    }

                }
            });

            initDataSource();

            return viewModel;
        },

        _getDefaultViewTemplate: function() {
            var widget = this;

            // modify view template based on widget.options where applicable
            var html =
            [
                '<div data-view="true">',
                '   <div>',
                '       <div class="itemList" data-bind="source: itemList" data-template="' + widget.options.itemViewTemplate + '"></div>',
                '   </div>',
                '</div>'
            ].join("\n");

            return html;
        },

        _getDefaultItemViewTemplate: function() {
            var widget = this;

            // return the template to be bound to the dataSource items
            var html =
            [
                '<script type="text/x-kendo-template" id="' + widget.options.itemViewTemplate + '">',
                '   <div data-bind="attr: { class: type }">',
                '       <span data-bind="text: message"></span>',
                '       <a href="" class="close" alt="Close">×</a>',
                '   </div>',
                '</script>'
            ].join("\n");

            return html;
        }
    };

    // register the widget

    $.cv.ui.widget(messageWidget);

})(jQuery);