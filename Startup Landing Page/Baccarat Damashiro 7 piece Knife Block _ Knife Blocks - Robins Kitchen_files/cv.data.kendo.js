/// <reference path="jquery-1.7.2.js" />

/*
cv.data.kendo.js
    
Core library for MVVVM binding datasurces.

Dependencies:
jquery
In Script folder or http://jquery.com/

cv.util.js
In Script folder

*/

;
(function ($, undefined) {  /// <param name="$" type="jQuery" />

    //$ = jQuery;

    $.cv = $.cv || {};
    
    $.cv.data = $.cv.data || {};

    $.cv.data.dataSource = function (options) {
        var defopts = {
            method: '',
            url: '',
            updateurl: '',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            type: "POST",
            change: null,
            pageSize: 15,
            params: {},
            sort: {},
            serverFiltering: true,
            serverPaging: true,
            serverSorting: true,
            update: false,
            destroy: false,
            create: false,
            batch: false,
            error: function(e) {
                var response = e.xhr ? $.parseJSON(e.xhr.responseText) : $.parseJSON(e.responseText);
                if (response.sessionHasTimedOut) {
                    $.cv.ajax.redirectFromTimeout();
                }
                else {
                    var msg = "An error occurred. Please try again. Close your browser and login again if the problem persists";
                    if (response.errorMessage) {
                        msg = msg + '. Error Message : ' + response.errorMessage;
                    }
                    if ($.cv.ui && $.cv.ui.alert) {
                        $.cv.ui.alert({
                            title: 'Datasource Error',
                            message: msg
                        });
                    }
                    else {
                        alert('ERROR: ' + msg);
                    }
                }
            }
        };

        var opts = $.extend(defopts, options);

        if (opts.method) {
            opts.url = $.cv.ajax.settings.url + '/' + opts.method;
        }

        var getSort = function (sortString) {
            var results = [];

            sortString = $.trim(sortString);

            if (sortString) {
                // Separate into separate field dir parts
                // i.e. from: "Description asc, ProductCode desc"
                // i.e.   to: ["Description asc", "ProductCode desc"]
                var fieldDetails = sortString.split(","); 

                if (fieldDetails.length > 0) {
                    for (var i = 0; i < fieldDetails.length; i++) {
                        // Split into field direction parts
                        // i.e. from: "Description asc"
                        // i.e.   to: ["Description", "asc"]
                        var fieldDir = $.trim(fieldDetails[i]).split(" ");

                        // Cater for situations where there is only field name and no direction
                        // as well as when both as specified
                        if (fieldDir.length == 1) 
                            results.push({ field:fieldDir[0], dir: 'asc'});
                        else if (fieldDir.length == 2)
                            results.push({ field:fieldDir[0], dir: fieldDir[1]});
                    }
                }
            }

            return results;
        };

        var dsconfig = {
            transport: {
                read: {
                    url: opts.url + "?rand=" + ($.now()),
                    dataType: opts.dataType,
                    contentType: opts.contentType,
                    type: opts.type
                },
                parameterMap: function (options, type) {
                    var params = options;

                    // Handle sort that is a string. i.e. Description desc
                    if (options.sort && typeof options.sort === 'string') {
                        params.sort = getSort(options.sort);
                    }

                    // Extend Params from function/object
                    if (typeof (opts.params) == "function")
                        $.extend(params, opts.params(options, type));
                    else
                        $.extend(params, opts.params);

                    // If params are filtering parameters (i.e. they filter the data), remove the standard filter params
                    if (opts.filterParams) {
                        delete params.filter;
                    }

                    // Add session id for handling session expiry
                    if ($.cookie) {
                        params._sessionId = $.cookie("dynamicServiceSessionId");
                    }

                    // do any date adjusting here
                    params = $.cv.util.parseDates(params, true);

                    return kendo.stringify(params);
                }
            },
            serverPaging: opts.serverPaging,
            serverSorting: opts.serverSorting,
            serverFiltering: opts.serverFiltering,
            pageSize: opts.pageSize,
            batch: opts.batch,
            sort: opts.sort,
            requestStart: opts.requestStart,
            requestEnd: opts.requestEnd,

            schema: {
                data: function (result) {
                    return result.data;
                },
                total: function (result) {
                    return result.recordCount;
                },
                parse: function(data) {
                    // check for string object that needs casting to javascript object
                    if (data.data) {
                        if (data.data.length) {
                            $.each(data.data, function(index, item) {
                                $.cv.data.parseDate(index, item, data);
                            });
                        } else {
                            var itemToParse = data.data;
                            $.cv.data.parseDate(null, itemToParse, data.data);
                        }
                    }
                return data;
                }
            }
        };
       
        if (opts.model) {
            dsconfig.schema.model = opts.model;
        }

        if (opts.change) {
            dsconfig.change = opts.change;
        }

        if (opts.updateurl != '') {
            dsconfig.transport.update = {
                url: opts.updateurl,
                dataType: opts.dataType,
                contentType: opts.contentType,
                type: opts.type
            };
        }
        else if (opts.update) {
            dsconfig.transport.update = {
                url: opts.url + '-update',
                dataType: opts.dataType,
                contentType: opts.contentType,
                type: opts.type
            }
        }

        if (opts.destroy) {
            dsconfig.transport.destroy = {
                url: opts.url + '-destroy',
                dataType: opts.dataType,
                contentType: opts.contentType,
                type: opts.type
            }
        }
        if (opts.create) {
            dsconfig.transport.create = {
                url: opts.url + '-create',
                dataType: opts.dataType,
                contentType: opts.contentType,
                type: opts.type
            }
        }

        if (!dsconfig.schema.model) {
            dsconfig.schema.model = {
                id: "_objectKey"
            };
        }

        if (opts.fields) {
            dsconfig.schema.model.fields = opts.fields;
        }

        if (opts.error) {
            dsconfig.error = opts.error;
        }

        if (opts.options != undefined) {
            $.extend(dsconfig, opts.options);
        }

         // setup data
        if (opts.data) {
            // clear transport if no method set
            if (!opts.method || opts.method.length == 0)
                delete dsconfig.transport;
            dsconfig.data = opts.data;
            delete dsconfig.serverPaging;
            delete dsconfig.serverSorting;
            delete dsconfig.serverFiltering;
            delete dsconfig.batch;
            delete dsconfig.schema;
            delete dsconfig.sort;
            delete dsconfig.pageSize;
        }

        var ds = new kendo.data.DataSource(dsconfig);

        return ds;
    };

    $.cv.data.parseDate = function (index, item, data) {
        $.each(item, function(currindex, currentitem) {
            if (typeof currentitem == 'string') {
                var plus = currentitem.indexOf('+');
                if (plus == -1) plus = currentitem.indexOf(')');
                if (currentitem.length > 6 && currentitem.substr(0, 6) == '/Date(' && plus != -1) {
                    if (index != null)
                        data.data[index][currindex] = $.cv.util.toDate(currentitem);
                    else 
                        data.data[currindex] = $.cv.util.toDate(currentitem);
                }
            }
        });
    };

    $.cv.data.getLookupText = function (lookup, values) {
        if (lookup === null) {
            lookup = '';
        }
        var result = lookup === '' ? '' : lookup.toString() + ' - Unknown';
        var found = false;
        $.each(values, function(index, item) {
            if (item.Value === lookup.toString()) {
                result = item.Text;
                found = true;
            }
        });
        if (!found && lookup === 0) {
            result = '';
        }
        return result;
    }

    $.cv.data.getGrid = function (container) {
        return $(container).closest("div[data-role='grid']").data("kendoGrid");
    }

    $.cv.data.getGridColumn = function (grid, col) {
        var colToReturn = null;
        $.each(grid.columns,function(index,item) {
            if (item.field == col) 
                colToReturn = item;    
        });
        return colToReturn;
    }

    $.cv.data.checkEditableField = function (container, options) {
        var theGrid = $.cv.data.getGrid(container);
        var colData = $.cv.data.getGridColumn(theGrid,options.field);
        if ((options.model.isNew() && !colData.canAdd) || (!options.model.isNew() && !colData.canEdit)) {
            $('<span data-bind="text:' + options.field + '"></span>').appendTo(container);
            return false;
        } else {
            return true;
        }
    }

    $.cv.data.gridColumnEditors = {
        Email: function (container, options) {
            if ($.cv.data.checkEditableField(container, options))
                $('<input type="email" data-bind="value:' + options.field + '" class="k-input k-textbox" />').appendTo(container);
        },
        URL: function(container, options) {
            if ($.cv.data.checkEditableField(container, options))
            $('<input type="url" data-bind="value:' + options.field + '" class="k-input k-textbox" />').appendTo(container);
        },
        TextBox: function (container, options) {
            if ($.cv.data.checkEditableField(container, options))
                $('<input data-bind="value:' + options.field + '" class="k-input k-textbox" />').appendTo(container);
        },
        CheckBox: function(container, options) {
            if ($.cv.data.checkEditableField(container, options))
                $('<input type="checkbox" name="' + options.field + '" data-bind="checked: ' + options.field + '" value="" />').click(function () { var checked = $(this).attr("checked") == "checked" ? "True" : "False"; $(this).attr("value", checked); }).appendTo(container);
        },
        DatePicker: function(container, options) {
            if ($.cv.data.checkEditableField(container, options))
                $('<input data-role="datepicker" data-bind="value: ' + options.field + '" />').appendTo(container);
        },
        TimePicker: function(container, options) {
            if ($.cv.data.checkEditableField(container, options))
                $('<input data-role="timepicker" data-bind="value: ' + options.field + '" />').appendTo(container);
        },
        DateTimePicker: function(container, options) {
            if ($.cv.data.checkEditableField(container, options))
                $('<input data-role="datetimepicker" data-bind="value: ' + options.field + '" />').appendTo(container);
        },
        NumericTextBox: function(container, options) {
            if ($.cv.data.checkEditableField(container, options))
                $('<input data-role="numerictextbox" data-format="n' + options.length + '" data-bind="value: ' + options.field + '" />').appendTo(container);
        },
        NumericIntTextBox: function(container, options) {
            if ($.cv.data.checkEditableField(container, options))
                $('<input data-format="n0" data-bind="value: ' + options.field + '" />').appendTo(container).kendoNumericTextBox({ step: 1 });
        }, 
        Html: function(container, options) {
            if ($.cv.data.checkEditableField(container, options))
                $('<textarea id="editor" rows="' + options.rows + '" cols="30" data-bind="value:' + options.field + '" />').appendTo(container).kendoEditor();
        },  
        Password: function(container, options) {
            if ($.cv.data.checkEditableField(container, options))
                $('<input data-bind="value:' + options.field + '" class="k-input k-password" type="password" />').appendTo(container);
        },
        Money: function(container, options) {
            if ($.cv.data.checkEditableField(container, options))
                $('<input data-format="n2" data-bind="value: ' + options.field + '" />').appendTo(container).kendoNumericTextBox({ step: 0.01, decimals: 2 });
        },
        DropDown: function(container, options) {
            if ($.cv.data.checkEditableField(container, options)) {
                // options - field, model
                var field = options.model.fields[options.field];
                var ddoptions = {
                    autoBind: false,
                    dataSource: new kendo.data.DataSource({
                        data: field.lookupValues
                    })
                };
                if (!field.mandatory) {
                    ddoptions.optionLabel = 'Select ..';
                }
                $('<input data-text-field="Text" data-value-field="Value" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList(ddoptions);
            }
        },
        DropDownDynamic: function(container, options) {
            if ($.cv.data.checkEditableField(container, options)) {
                var field = options.model.fields[options.field];
                var comboOptions = {
                    autoBind: false,
                    dataSource: $.cv.data.dataSource({
                        method: field.method + '-lookup-' + options.field
                    }),
                    filter: "contains"
                };
                $("<input data-text-field='Text' data-value-field='Value' data-bind='value:" + options.field + "' />")
                    .appendTo(container)
                    .kendoComboBox(comboOptions);
            }
        }
    }

    $.cv.data.gridColumnTemplates = {
        Email: function(field) {
            return '#= kendo.toString(' + field.fieldName + ') #';
        },
        TextBox: function(field) {
            return '#= kendo.toString(' + field.fieldName + ') #';
        },
        TimePicker: function(field) {
            return '#= kendo.toString(' + field.fieldName + ',"hh:mm tt") #';            
        },
        NumericTextBox: function(field) {
            return '#= kendo.toString(' + field.fieldName + ',"n' + field.length + '") #';            
        },
        NumericIntTextBox: function(field) {
            return '#= kendo.toString(' + field.fieldName + ',"n0") #';            
        }, 
        Html: function(field) {
            return '#= kendo.toString(' + field.fieldName + ') #';
        },  
        Password: function(field) {
            return '#= kendo.toString(' + field.fieldName + ') == null ? "" : kendo.toString(' + field.fieldName + ').replace(/./g,"x") #';
        },
        Money: function(field) {
            return '#= kendo.toString(' + field.fieldName + ',"c") #';            
        }, 
        CheckBox:  function(field) {
            return '#= ' + field.fieldName + ' ? "Yes" : "No" #';
        },

        DatePicker: function(field) {
            return '#= kendo.toString(' + field.fieldName + ',"dd-MMM-yyyy") #';
        },

        DateTimePicker: function(field) {
            return '#= kendo.toString(' + field.fieldName + ',"dd-MMM-yyyy hh:mm tt") #';
        },

        DropDown: function(field) {
            return '#= ( data.hasOwnProperty("' + field.fieldName + '__DisplayText") ? ' + field.fieldName + '__DisplayText : ' + field.fieldName + ' ) # '; 
        },

        DropDownDynamic: function(field) {
            return '#= ( data.hasOwnProperty("' + field.fieldName + '__DisplayText") ? ' + field.fieldName + '__DisplayText : ' + field.fieldName + ' ) # '; 
        }

    };

  
    // creates a column object for use in the kendo grid
    //
    $.cv.data.gridColumn = function(field, method) {
        var colObj = {
            field: field.fieldName,
            title: field.prompt
        };
        // set default displayType
        if (!field.displayType) {
            if (field.type == "date") field.displayType = "DatePicker";
            if (field.type == "datetime") field.displayType = "DateTimePicker";
            if (field.type == "bit") field.displayType = "Checkbox";
        }
        // text
        if (field.type == "text") {
            colObj.sortable = false;
        }
        // primary key and protected settings to allow add/edit
        colObj.canAdd = field.type != 'identity';
        colObj.canEdit = !field.protected && !field.primarykey;
        // column editor
        if ($.cv.data.gridColumnEditors[field.displayType]) { //&& !field.protected
            colObj.editor = $.cv.data.gridColumnEditors[field.displayType];
        }
        // column template
        if ($.cv.data.gridColumnTemplates[field.displayType]) {
            colObj.template = $.cv.data.gridColumnTemplates[field.displayType](field);
        }
        return colObj;
    };

    // field object for mvvm binding
    $.cv.data.fieldMVVM = function(field, method) {
        var fieldObj = field;

        // primary key and protected settings to allow add/edit
        fieldObj.canAdd = field.type != 'identity';
        fieldObj.canEdit = !field.protected && !field.primarykey;

        if (field.displayType == "DropDownDynamic") {
            fieldObj.method = method; // store the method for use in the autocomplete datasource
        }
        return fieldObj;
    };

    // creates a field object for use in a kendo datasource
    //
    $.cv.data.field = function(field, method) {
        var fieldObj = {
            type: "string"
        };
        // nullable stuffs up the DD editor
        if (field.displayType != "DropDown" && field.displayType != "DropDownDynamic") {
            fieldObj.nullable = true;
        }

        // set defaultValue if available
        if (field.defaultValue) {
            fieldObj.defaultValue = field.defaultValue;
        }

        // set the name so we can see this when creating new objects based on fieldObj collection
        if (field.name) {
            fieldObj.name = field.name;
        }

        if (field.mandatory) {
            fieldObj.validation = { required: true };
            // workaround for grid dropdown only binding value on "change" of dropdown.
            if (field.lookupValues && field.lookupValues.length > 0) {
                fieldObj.defaultValue = field.lookupValues[0].Value;
            }
        }
        if (field.lookupValues) {
            fieldObj.lookupValues = field.lookupValues;
        }
        if (field.displayType == "DropDownDynamic") {
            fieldObj.method = method; // store the method for use in the autocomplete datasource
        }
        // dateTime
        if (field.type == "date" || field.type == "datetime") {
            fieldObj.type = "date";
        }
        // numeric
        if (field.type == "int" || field.type == "decimal") {
            fieldObj.type = "number";
            // workaround for grid bug where dropdown cannot change a null value
            if (field.displayType == "DropDown") {
                fieldObj.parse = function(val) {
                    if (val === null) {
                        return 0;
                    }
                    return kendo.parseFloat(val);
                };
            }
            // workaround for comboBox not setting values
            if (field.displayType == "DropDownDynamic") {
                fieldObj.type = "string";
                fieldObj.parse = function(val) {
                    if (val === null) {
                        return '';
                    }
                    return val.toString();
                };
            }
        }
        // boolean
        if (field.type == "bit") {
            fieldObj.type = "boolean";
        }
        if (field.type == "varchar" && field.displayType == "DropDown") {
            // when binding dropdown need to pull out value from object
            fieldObj.parse = function(val) {
                if (val) {
                    if (val === null) {
                        return '';
                    }
                    if (val.value)
                        return val.value.toString();
                    else
                    return val.toString();
                } else {
                    return '';
                }
            };
        }
       

        return fieldObj;
    };

    // form field templates the same as grid templates
    $.cv.data.fieldDisplayTemplates = $.cv.data.gridColumnTemplates;

    // check if field editable based on cvfield primary key/identity rules
    $.cv.data.fieldEditTempateCanEdit = function (field, add) {
        if ((add && !field.canAdd) || (!add && !field.canEdit))
            return '<span data-bind="text:' + field.fieldName + '"></span>';
        else
            return "";
    }

    $.cv.data.fieldEditTemplates = {
        Email: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input type="email" data-bind="value:' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled" name="' + field.fieldName + '" ' + (field.mandatory ? 'required="required"' : ' ') + ' class="k-input k-textbox" />';
            else
                return check;
        },
        URL: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input type="url" data-bind="value:' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled" name="' + field.fieldName + '" ' + (field.mandatory ? 'required="required"' : ' ') + ' class="k-input k-textbox" />';
            else
                return check;
        },
        TextBox: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input data-bind="value:' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled" name="' + field.fieldName + '" ' + (field.mandatory ? 'required="required"' : ' ') + ' class="k-input k-textbox" />';
            else
                return check;
        },
        CheckBox: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input type="checkbox" name="' + field.fieldName + '" data-bind="checked:' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled" value="" />';
            else
                return check;
        },
        DatePicker: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input data-role="datepicker" name="' + field.fieldName + '" data-bind="value: ' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled" ' + (field.mandatory ? 'required="required"' : '') + ' />';
            else
                return check;
        },
        TimePicker: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input data-role="timepicker" name="' + field.fieldName + '" data-bind="value: ' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled" ' + (field.mandatory ? 'required="required"' : '') + ' />';
            else
                return check;
        },
        DateTimePicker: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input data-role="datetimepicker" name="' + field.fieldName + '" data-bind="value: ' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled" ' + (field.mandatory ? 'required="required"' : '') + ' />';
            else
                return check;
        },
        NumericTextBox: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input data-role="numerictextbox" name="' + field.fieldName + '" data-format="n' + (field.length ? field.length : 2) + '" data-bind="value: ' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled" ' + (field.mandatory ? 'required="required"' : '') + ' />';
            else
                return check;
        },
        NumericIntTextBox: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input data-step="1" data-format="n0" name="' + field.fieldName + '" data-bind="value: ' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled" ' + (field.mandatory ? 'required="required"' : '') + ' />';
            else
                return check;
        }, 
        Html: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<textarea id="editor" name="' + field.fieldName + '" rows="' + (field.rows ? field.rows : 5) + '" cols="' + (field.cols ? field.cols : 30) + '" data-bind="value:' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled" ' + (field.mandatory ? 'required="required"' : '') + ' />';
            else
                return check;
        },  
        Password: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input data-bind="value:' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled" name="' + field.fieldName + '" class="k-input k-textbox k-password" type="password" ' + (field.mandatory ? 'required="required"' : '') + ' />';
            else
                return check;
        },
        Money: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<input data-step="0.01" data-decimals="2" data-format="n2" name="' + field.fieldName + '" data-bind="value: ' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled" ' + (field.mandatory ? 'required="required"' : '') + ' />';
            else
                return check;
        }, 
        DropDown: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0) {
                var input = '<select data-text-field="Text" data-value-field="Value" data-role="dropdownlist" name="' + field.fieldName + '" data-bind="value: ' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled, source:' + field.fieldName + '_lookup" >';
                input = input + "</select>";
                return input;
            }
            else
                return check;
        },
        DropDownDynamic: function (field, add) {
            var check = $.cv.data.fieldEditTempateCanEdit(field, add);
            if (check.length == 0)
                return '<select data-text-field="Text" data-value-field="Value" data-role="combobox" name="' + field.fieldName + '" data-bind="value:' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled, source:' + field.fieldName + '_lookup" ' + (field.mandatory ? 'required="required"' : '') + ' />';
            else
                return check;
        }
    };

    $.cv.data.fieldContainerTemplate = function(field, controlTemplate, help) {
        return "<div class='fieldContainer' data-bind='visible:" + field.fieldName + "_isVisible, enabled:" + field.fieldName + "_isEnabled'><label>" + field.prompt + ":&nbsp;</label>" + help + controlTemplate + "</div>";
    };

    // generate markup for help tooltip if help defined on field
    $.cv.data.fieldHelpTemplate = function(field) {
        if (field.help && field.help.length > 0)
            return "<span class='cv-tooltip'>?<span class='cv-tooltip-message'>" + field.help + "</span></span>";
        else
            return "";
    }

    $.cv.data.formTemplate = {
        Start: function () {
            return '<div class="list-item-container">';
        },
        End: function () {
            return '</div>';
        }
    }

    $.cv.data.fieldTemplateCollection = function (fields, edit, add) {
        var template = $.cv.data.formTemplate["Start"]();
        $.each(fields, function (index, field) {
           template = template + $.cv.data.fieldTemplate(field, edit,add);
        });
        template = template + $.cv.data.formTemplate["End"]();
        return template;
    };

    $.cv.data.fieldTemplate = function(field, edit, add) {
        // set default displayType
        if (!field.displayType) {
            if (field.type == "date") field.displayType = "DatePicker";
            if (field.type == "datetime") field.displayType = "DateTimePicker";
            if (field.type == "bit") field.displayType = "Checkbox";
        }
        var foundControlTemplate;
        if (add) {
            foundControlTemplate = $.cv.data.fieldEditTemplates[field.displayType](field, add);
        } else if (edit) {
             foundControlTemplate = $.cv.data.fieldEditTemplates[field.displayType](field);
        } else {
             foundControlTemplate = $.cv.data.fieldDisplayTemplates[field.displayType](field);
        }
        // now get help span if help defined on field
        var helpMarkup = $.cv.data.fieldHelpTemplate(field);

        return $.cv.data.fieldContainerTemplate(field, foundControlTemplate, helpMarkup);
    };
    
    // extend object for Kendo UI MVVM databind features visible, enabled and datasources
    $.cv.data.extendObject = function(item, schema) {
         $.each(schema.properties, function (index, field) {
            item[field.fieldName + "_isVisible"] = true;
            item[field.fieldName + "_isEnabled"] = true;
            // check for lookups
            if (field.lookupValues && $.isArray(field.lookupValues)) {
                // check if not mandatory, if so add a select entry if one not already in there
                if (!field.mandatory && $.grep(field.lookupValues, function(n) { return n.Value == "-1"; }) == false)
                    field.lookupValues.splice(0,0,{Text:'Select...',Value: "-1"});
                item[field.fieldName + "_lookup"] = $.cv.data.dataSource({ dataType: '', data: field.lookupValues, transport: null });
            } else if (field.lookup && field.lookup.length > 0) {
                // there is a lookup defined( a method or static), so we can call dynamic service with <servicename>-lookup-<fieldname>
                item[field.fieldName + "_lookup"] = $.cv.data.dataSource({
                    method: field.method + '-lookup-' + field.fieldName
            });
            }
         })
    };

    // clean up properties added to observable for mvvm form binding but not persisted data
    $.cv.data.reduceObject = function(item, schema) {
         $.each(schema.properties, function (index, field) {
            // check for lookups
            if (item[field.fieldName + "_lookup"])
                delete item[field.fieldName + "_lookup"];
            if (item[field.fieldName + "_isVisible"]) 
                delete item[field.fieldName + "_isVisible"];
            if (item[field.fieldName + "_isEnabled"]) 
                delete item[field.fieldName + "_isEnabled"];
         })
    };

    // create a new object based on the schema object from $.cv.data.loadSchema
    $.cv.data.newObject = function(ds) {
        var objectToReturn = {};
        // iterate over each field and set property and default if defined
        $.each(ds.properties, function (index, field) {
            if (field.defaultValue) {
                var itemToAssign = null;
                if (field.type == "date") {
                    itemToAssign = $.cv.util.toDate(field.defaultValue);
                } else if (field.type == "bit") {
                    itemToAssign = field.defaultValue === "1" ? true : false;
                } else {
                    itemToAssign = field.defaultValue;
                }
                objectToReturn[field.fieldName] = itemToAssign;
            } else {
                if (field.type == "int" || field.type == "bit" || field.type == "decimal" || field.type == "date" || field.type == "datetime") {
                    objectToReturn[field.fieldName] = null;
                } else {
                     objectToReturn[field.fieldName] = '';
                }
            }

        });
        return objectToReturn;
    };

    $.cv.data.loadSchema = function (options) {

        var opts = $.extend({
            method: '',
            gridColumnWidths: '',
            schemaLoaded: $.noop,
            mode: '', // can be grid/listview/mvvmform
            gridColumns: '',
            formFields: '',
            params: ''
        }, options);

        return $.cv.ajax.call(opts.method + '-schema', {
            parameters: opts.params,
            success: function (msg) {
                // construct on object and pass it as a param to schemaLoaded
                // object properties: properties, dataSourceFields, gridColumns
                var s = {}; 
                s.properties = msg.data;
                s.dataSourceFields = {};
                s.gridColumns = [];
                s.formTemplate = {};
                s.formEditTemplate = {};
                s.formAddTemplate = {};
               
                if (opts.mode == '' || opts.mode.indexOf('grid') != -1 ) {
                    $.each(s.properties, function (index, field) {
                        var fieldObj = $.cv.data.field(field, opts.method);
                        var colObj = $.cv.data.gridColumn(field, opts.method);
                        s.dataSourceFields[field.fieldName] = fieldObj;
                        if (opts.gridColumns == '' || $.inArray(field.fieldName,opts.gridColumns.split(',')) != -1) {
                            s.gridColumns.push(colObj);
                        }
                    });
                }

                // field displays for list/mvvm form
                if (opts.mode == '' || opts.mode.indexOf('listview') != -1 || opts.mode.indexOf('mvmmform') != -1 ) {
                    
                    // filter down set of fields if set in formfields
                    var fieldsForForm = [];
                    $.each(s.properties, function (index, field) {
                    if (opts.formFields == '' || $.inArray(field.fieldName,opts.formFields.split(',')) != -1) {
                        var fieldOb = $.cv.data.fieldMVVM(field, opts.method);
                        fieldsForForm.push(fieldOb);
                        }
                    });

                    if (opts.mode == '' || opts.mode.indexOf('listview') != -1 || opts.mode.indexOf('mvmmform') != -1  ) {
                        s.formTemplate = $.cv.data.fieldTemplateCollection(fieldsForForm, false);
                        s.formEditTemplate = $.cv.data.fieldTemplateCollection(fieldsForForm, true);
                        s.formAddTemplate = $.cv.data.fieldTemplateCollection(fieldsForForm, false, true);
                    }

                }

                // apply the col widths to the col objects
                var widths = opts.gridColumnWidths.split(',');
                $.each(s.gridColumns, function(index, col) {
                    if (widths[index]) {
                        col.width = widths[index];
                    };
                });

                // call the schemaLoaded event function
                opts.schemaLoaded(s);
            }
        });

    }

})(jQuery);