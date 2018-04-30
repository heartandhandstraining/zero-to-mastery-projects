/* Name: user maintenance
* Author: Aidan Thomas
* Created: 20131111
*
* Dependencies:    
*          --- Third Party ---
*          jquery.js 
*          kendo.web.js
*           --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.css.js
*          /Scripts/widgets/cv.ui.mvvmwidget.js
*           --- CSS - OPTIONAL IF YOU WANT TO USE THESE ELEMENTS ---
* Params:  
*/
;
(function ($, undefined) {

    var WIDGETDATAINTIALISED = "widgetDataInitialised",
        LISTUPDATED = "listUpdated",
        SAVEDSUCCESSFULLY = "savedSuccessfully";

    var userMaintenanceWidget = {

        // Standard Variables

        // widget name
        name: "userMaintenance",

        extend: "mvvmwidget",

        // default widget options
        options: {
            // viewModel defaults
            jsonFieldGroupName: "",
            successfulRedirectUrl: "",
            notificationEmailPrompt: "",
            notifyEmailAddressFieldName: "NotifyEmailAddress",
            // viewModel flags
            autoBind: true,
            // events
            // view flags
            triggerMessages: false,
            clearWidgetMessages: true,
            updateOnChange: false,
            // view text defaults
            textMandatoryFieldsMissing: "The following fields are required: {0}",
            textErrorEnteredDateInWrongFormat: 'Date entered is in the wrong format',
            textErrorEnteredEmailInWrongFormat: 'Email entered is in the wrong format',
            textErrorEnteredDecimalInWrongFormat: 'Decimal entered in the wrong format',
            textErrorEnteredUrlInWrongFormat: 'Url entered in the wrong format',
            textMandatoryFieldNotComplete: "Mandatory field",
            textUpdateSuccessful: "Updated successfully",
            textUpdateErrorDefaultMessage: "There was an error updating your information at this time",
            // view Template
            viewTemplate: null,
            itemTemplate: ''
        },

        extendEvents: [WIDGETDATAINTIALISED, LISTUPDATED, SAVEDSUCCESSFULLY],

        // MVVM Support

        viewModelBound: function () {
            // called after the widget view is bound to the viewModel
            var widget = this, initDeferred = $.Deferred(), userDetailsDef = $.Deferred(), ds = [];
            widget.viewModel.set("isProcessing", true);

            userDetailsDef = $.cv.css.user.getUserMaintenanceData({ jsonFieldGroupName: widget.options.jsonFieldGroupName });

            $.when(userDetailsDef).done(function (msg) {
                if (!msg.errorMessage || msg.errorMessage.length == 0) {
                    if (msg.data && msg.data.length > 0 && msg.data[0].UserDetailsFieldData) {
                        ds = msg.data[0].UserDetailsFieldData;
                    } else {
                        ds = [];
                    }
                    widget.viewModel.set('itemList', widget._getDataView(ds));
                }
                initDeferred.resolve();
            });
            $.when(initDeferred).done(function () {
                widget.viewModel.set("isProcessing", false);
                widget.trigger(WIDGETDATAINTIALISED, { viewCount: widget.viewModel.get("itemList").length, dataCount: widget.viewModel.get("dataCount") });
            });
        },

        // private functions
        _getDataView: function (data) {
            var widget = this, array = [];
            $.each(data, function (idx, item) {
                // add standard commands
                item.index = idx;
                item.MandatoryMessage = widget.options.textMandatoryFieldNotComplete;

                if (item.FieldName === widget.options.notifyEmailAddressFieldName && widget.options.notificationEmailPrompt) {
                    item.Placeholder = widget.options.notificationEmailPrompt;
                }

                var dataItem = $.cv.util.getFieldItemData(item);
                dataItem.dataChanged = function (e) {
                    var fieldItem = e.data["fieldItem"];
                    var updateOnChange = widget.viewModel.get("updateOnChange");
                    if (dataItem.fieldValid(e) && updateOnChange) {
                        widget.viewModel.updateUserField(fieldItem.fieldName);
                    }
                };
                array.push(dataItem);
            });
            return array;
        },

        _stringEmpty: function (data) {
            if ($.type(data) == "string")
                data = data.replace(/ /g, "");
            return !data;
        },

        _getViewModel: function () {
            var widget = this;
            return widget._getDefaultViewModel();
        },

        _getDefaultViewModel: function () {
            var widget = this;

            var _getMandatoryFieldList = function () {
                var itemList = widget.viewModel.get("itemList"), mandatoryArray = [];
                $.each(itemList, function (idx, item) {
                    if (item.fieldItem.mandatory)
                        mandatoryArray.push($.extend(item, { emptyMessage: item.prompt }));
                });

                return mandatoryArray;
            };

            var viewModel = kendo.observable($.extend(widget.options, {

                // Properties for UI elements
                isProcessing: false,

                updateOnChange: widget.options.updateOnChange,

                currentUser: null,

                itemList: [],

                message: '',

                clearWidgetMessages: widget.options.clearWidgetMessages,

                dataCount: 0,

                updateUserField: function (fieldname) {
                    // create payload
                    var _this = this, list = {}, valid = true;
                    $.cv.util.clearMessage.apply(widget.viewModel);
                    $.each(this.get('itemList'), function (index, item) {
                        // if a fieldname triggered it, just validate and send that
                        if (fieldname != null && item.fieldItem.fieldName === fieldname) {
                            var val = this.get(item.fieldItem.fieldName);
                            if ($.cv.util.validateField(val, item.fieldItem.FieldType)) {
                                list[item.fieldItem.fieldName] = val;
                            } else
                                valid = false;
                        }
                    });

                    var currentUser = _this.getCurrentUser();
                    $.when(currentUser).done(function (currentUser) {
                        list["_objectKey"] = currentUser;
                        var d1 = $.cv.css.user.setCurrentUserDetails({ updateData: list, jsonFieldGroup: widget.options.jsonFieldGroupName });
                        $.when(d1).done(function (msg) {
                            var data = msg.data;
                            var params = {};
                            if (!data.sessionHasTimedOut) {
                                _this.set("isProcessing", false);
                            }
                        });
                    });
                },

                checkAllRequiredFields: function () {
                    var allFieldsPopulated = true, emptyFields = "", mandatoryFieldList = _getMandatoryFieldList();
                    $.each(mandatoryFieldList, function (idx, item) {
                        if (!item.fieldItem.parent().fieldValid({ data: item.fieldItem.parent() }, true)) {
                            allFieldsPopulated = false;
                            emptyFields += "," + item.emptyMessage;
                        }
                    });

                    if (emptyFields != "") {
                        emptyFields = widget.options.textMandatoryFieldsMissing.format(emptyFields.substring(1));
                        $.cv.util.setMessage.apply(widget.viewModel, [emptyFields, $.cv.css.messageTypes.error]);
                    }
                    return allFieldsPopulated;
                },

                getCurrentUser: function () {
                    var _this = this, currentUser = this.get("currentUser"), currentUserDeferred = $.Deferred();
                    if (currentUser == null) {
                        userToEdit = $.cv.css.localGetUser();
                    } else {
                        userToEdit["_objectKey"] = currentUser;
                    }
                    if (userToEdit && userToEdit != null) {
                        var d = $.Deferred();
                        d.resolve({ data: [userToEdit] });
                    }
                    else {
                        var d = $.cv.css.getCurrentUser();
                    }
                    $.when(d).done(function (usr) {
                        if (usr && usr.data && usr.data.length > 0) {
                            _this.set("currentUser", usr.data[0]._objectKey);
                        }
                        currentUserDeferred.resolve(usr.data[0]._objectKey);
                    });
                    return currentUserDeferred.promise();
                },

                getUserDetails: function() {
                    var _this = this, userDetails = $.Deferred(), userUpdateData = {};
                    var currentUser = _this.getCurrentUser();

                    $.each(_this.get("itemList"), function (idx, item) {
                        var val = item.get(item.fieldItem.fieldName);
                        if (val == null) {
                            val = "";
                        }
                        if (val.toString() != "true" && val.toString() != "false") {
                            userUpdateData[item.fieldItem.fieldName] = val.toString();
                        } else {
                            userUpdateData[item.fieldItem.fieldName] = val;
                        }
                    });

                    currentUser.done(function (currentUser) {
                        userUpdateData["_objectKey"] = currentUser;
                        userDetails.resolve(userUpdateData);
                    });
                    return userDetails.promise();
                },

                saveDetails: function () {
                    var _this = this;
                    $.cv.util.clearMessage.apply(widget.viewModel);
                    if (this.checkAllRequiredFields()) {
                        _this.set("isProcessing", true);
                        var u = _this.getUserDetails();
                        $.when(u).done(function (userDetails) {
                            var d1 = $.cv.css.user.setCurrentUserDetails({ updateData: userDetails, jsonFieldGroup: widget.options.jsonFieldGroupName });
                            $.when(d1).done(function (msg) {
                                var data = msg.data;
                                if (!data.sessionHasTimedOut) {
                                    if (widget.options.successfulRedirectUrl.length == 0) {
                                        _this.set("isProcessing", false);
                                        $.cv.util.setMessage.apply(widget.viewModel, [widget.options.textUpdateSuccessful, $.cv.css.messageTypes.success]);
                                        widget.trigger(SAVEDSUCCESSFULLY);
                                    } else {
                                        $.cv.util.redirect(widget.options.successfulRedirectUrl, {}, false);
                                    }
                                }
                            }).fail(function (msg) {
                                _this.set("isProcessing", false);
                                $.cv.util.setMessage.apply(widget.viewModel, [widget.options.textUpdateErrorDefaultMessage, $.cv.css.messageTypes.error]);
                            });
                        });                        
                    }
                }

            }));

            return viewModel;
        },

        _buildViewTemplate: function () {
            var widget = this;
            widget._buildDefaultViewTemplate();
        },

        _buildDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            widget._buildDefaultContentTemplate();
        },

        _buildDefaultContentTemplate: function () {
            var widget = this;
            var html = "<div class='cv-ui-element-content-area'>";
            html += "</div>";
            widget.viewTemplate += html;
        },

        _buildItemTemplateBody: function () {
            var widget = this;
            var html = "<div></div>";
            widget.itemTemplate += html;
        }

    };

    // register the widget
    $.cv.ui.widget(userMaintenanceWidget);

})(jQuery);
