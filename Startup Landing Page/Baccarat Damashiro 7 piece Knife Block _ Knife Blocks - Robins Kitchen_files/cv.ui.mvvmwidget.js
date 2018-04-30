;


(function ($, undefined) {

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        ITEMCHANGE = "itemchange";

    var mvvmwidget = {
        name: "mvvmwidget",
        options: {
            viewTemplate: '', // what impact this has on declarative binding - or do those properties all need to be on the main widget?
            refreshOnItemChange: false,
            allowCustomOptions: false,
            allowCustomArrayOptions: false,
            disableSourceInit: false // when declarative binding, the data source is bound using setDataSource after widget initialisation. This property will stop default initialisation being called.
        },

        // Standard Methods
        initialise: function(el, o) {
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
        },

        events: [DATABINDING, DATABOUND],

        items: function() {
            // this shoudld be overridden where required in extending widgets
            return [];
        },

        // for supporting changing the datasource via MVVM
        setDataSource: function(dataSource) {
            // set the internal datasource equal to the one passed in by MVVM
            this.options.dataSource = dataSource;
            // rebuild the datasource if necessary, or just reassign
            this._dataSource();
        },

        _dataSource: function() {

            var widget = this;
            // if the DataSource is defined and the _refreshHandler is wired up, unbind because
            // we need to rebuild the DataSource
            if (widget.dataSource && widget._refreshHandler) {
                widget.dataSource.unbind(CHANGE, widget._refreshHandler);
            } else {
                widget._refreshHandler = $.proxy(widget.refresh, widget);
            }

            // returns the datasource OR creates one if using array or configuration object
            widget.dataSource = kendo.data.DataSource.create(widget.options.dataSource);
            if (widget.viewModel) {
                widget.viewModel.set("dataSource", widget.dataSource);
            }

            // bind to the change event to refresh the widget
            widget.dataSource.bind(CHANGE, widget._refreshHandler);

            if (widget.options.autoBind) {
                widget.dataSource.fetch();
            }
        },

        refresh: function(e) {
            var widget = this;
            // don't refresh recursively
            if (widget.refreshing)
                return;
            if (e.action == ITEMCHANGE && !widget.options.refreshOnItemChange)
                return;
            widget.refreshing = true;
            widget.trigger(DATABINDING);
            widget.viewModel.updateViewModelFromDataSource();
            widget.trigger(DATABOUND);
            widget.refreshing = false;
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

        _createCustomOptions: function() {
            var widget = this,
                options = widget.options;
            _.each($(widget.element).data(), function(value, key, list) {
                if ((typeof value != "object" || (widget.options.allowCustomArrayOptions && _.isArray(value))) && typeof value != "function" && !_.has(options, key)) {
                    widget.options[key] = value;
                }
            });
        },

        _buildItemTemplate: function() {
            this._buildItemTemplateStartScriptTag();

            // Body: method can return the string, if so we append it to the
            // itemTemplate for the caller (they shouldn't do it themselves in this case)
            var body = this._buildItemTemplateBody();

            if ($.cv.util.hasValue(body)) {
                this.itemTemplate += body;
            }

            this._buildItemTemplateEndScriptTag();
        },

        _buildItemTemplateStartScriptTag: function() {
            this.itemTemplate += '<script type="text/x-kendo-template" id="' + this.options.itemTemplateId + '">';
        },

        _buildItemTemplateBody: function() {
            // Extended widget will override this
        },

        _buildItemTemplateEndScriptTag: function() {
            this.itemTemplate += '</script>';
        },

        getClassValue: function(key){
            this.sharedClassObjCheckAndSetup();

            if ($.cv.css.sharedClassObj.observableClassObjects[this.name]
                && $.cv.css.sharedClassObj.observableClassObjects[this.name].obj)
                return $.cv.css.sharedClassObj.observableClassObjects[this.name].obj.get(key);
            return null;
        },

        setClassValue: function (key,value) {
            this.sharedClassObjCheckAndSetup();

            if (!$.cv.css.sharedClassObj.observableClassObjects[this.name]) {
                $.cv.css.sharedClassObj.addClass(name, this);
            }

            if (!$.cv.css.sharedClassObj.observableClassObjects[this.name].obj) {
                $.cv.css.sharedClassObj.observableClassObjects[this.name].obj = kendo.observable();
            }

            $.cv.css.sharedClassObj.observableClassObjects[this.name].obj.set(key, value);
        },

        sharedClassObjCheckAndSetup: function () {
            if ($.cv.css.sharedClassObj)
                return;

            $.cv.css.sharedClassObj = {
                observableClassObjects : {},

                // As a general idea we could include some functionailty at this level to help debugging easily
                // At this point we have refs to every widget extended from mvvm.
                // could be useful, maybe not... 
                //logAllInitClassObjects : function ()
                //{
                //    console.log("Not implemented");
                //},

                addClass: function (widgetName, widgetRef) {
                    var widget = this;
                    if (!widget.observableClassObjects[widgetName]) {
                        widget.observableClassObjects[widgetName] = { currentActiveWidgets: [widgetRef], obj: null };
                    } else {
                        widget.observableClassObjects[widgetName].currentActiveWidgets.push(widgetRef);
                    }
                }
            }
        }
    };

    $.cv.ui.widget(mvvmwidget);

})(jQuery);
