
;
(function ($, undefined) {

    var WIDGETDATAINTIALISED = "widgetDataInitialised",
        LISTUPDATED = "listUpdated",
        ADDRESSUPDATED = "addressUpdated";

    var myAddressWidget = {

        // Standard Variables

        // widget name
        name: "myAddress",

        extend: "mvvmwidget",

        // default widget options
        options: {
            // viewModel defaults
            // Suburb and Postcode Validation
            enableSuburbAndPostcodeValidation: true,
            suburbFieldName: "DeliverySuburb",
            postcodeFieldName: "DeliveryPostcode",
            billingSuburbFieldName: "SoBillSuburb",
            billingPostcodeFieldName: "SoBillPostcode",
            suburbAndPostcodeInvalidMessage: "The suburb and postcode don't correspond.",
            
            customerFieldNameForDefaultAddressName: "",
            overlayId: "modal-delivery-addresses",
            
            //Multiple Address options
            hasMultipleDeliveryAddresses: false,
            multipleDeliveryAddressDataSource: undefined,
            multipleAddressTextField: "Name",
            multipleAddressValueField: "Name",
            addressValidationTextField: "label",
            addressValidationValueField: "value",

            // viewModel flags
            autoBind: true,

            // events
            listUpdated: null,
            widgetDataInitialised: null,

            // view flags
            triggerMessages: true,
            clearWidgetMessages: true,

            // view text defaults
            notAllFieldsValid: "Not all the fields have valid values, please check and try again",
            suburbPostcodeNotValid: "You have an invalid suburb and postcode",
            errorValidatingSuburbPostcode: "There was an error validating the suburb and postcode",

            noDefaultDeliveryAddressSelected: "A default delivery address has not been selected. Nothing to process.",
            errorSettingDefaultDeliveryAddress: "There was an error setting the default delivery address.",
            errorLoadingPossibleAddresses: "There was an error loading possible delivery addresses.",
            defaultDeliveryAddressSameAsPrevious: "The selected default delivery address has not been changed. No update will be performed.",
            // view Template
            viewTemplate: null
        },

        extendEvents: [WIDGETDATAINTIALISED, LISTUPDATED, ADDRESSUPDATED],

        initialise: function (el, o) {
            var widget = this;
        },

        // MVVM Support

        viewModelBinding: function () {
            var widget = this;
        },

        // private functions
       
        _getViewModel: function () {
            var widget = this;
            var opts = widget.options;

            var _loadMyDefaultDeliveryAddress = function() {
                viewModel.set("isLoadingMyDefaultAddress", true);
            
                return $.cv.css.user.myAddress().done(function (result) {
                    //check for a result
                    if (!$.cv.util.hasValue(result)) {
                        $.cv.util.notify(widget.viewModel, vm.get("errorSettingDefaultDeliveryAddress"), $.cv.css.messageTypes.error);
                        return;
                    }

                    //Check to see if we returned any error messages.
                    if (!$.cv.util.isNullOrWhitespace(result.errorMessage)) {
                        $.cv.util.notify(widget.viewModel, vm.get("errorSettingDefaultDeliveryAddress"), $.cv.css.messageTypes.error);
                        return;
                    }

                    //Check to se if we received data from the request.
                    if (!$.cv.util.hasValue(result.data) || result.data.length === 0) {
                        //We didn't get any data back. Display a message if set to do so.
                        $.cv.util.notify(widget.viewModel, vm.get("errorSettingDefaultDeliveryAddress"), $.cv.css.messageTypes.error);
                    }

                    //We have data back process it. 
                    var data = result.data[0];
                        
                    if (data.DeliveryAddressFieldData) {
                        viewModel.set("deliveryAddressList", _getAddressDataView(data.DeliveryAddressFieldData));
                    }

                    if (data.BillingAddressFieldData) {
                        viewModel.set("billingAddressList", _getAddressDataView(data.BillingAddressFieldData));

                        //Check to see if we have different billing and delivery addresses set as the current billing and delivery addresses.
                        //Note: currently in a B2C scenario there is only one delivery address.
                        //In a B2B scenario there may be more than one.
                        widget.viewModel.set("differentDeliveryAndBilling", widget.viewModel.addressesMatch());
                    }
                }).always(function(result) {
                    viewModel.set("isLoadingMyDefaultAddress", false);
                });
            };

            var _loadMyPossibleAddresses = function() {
                viewModel.set("isLoadingMyPossibleAddresses", true);

                return $.cv.css.deliveryAddress.getDeliveryAddressesForCurrentUser({
                    customerFieldNameForDefaultAddressName: widget.options.customerFieldNameForDefaultAddressName
                }).done(function (result) {
                    if (!result.errorMessage || result.errorMessage.length === 0) {
                        if (result.data) {
                            //We have delivery address data returned process it.
                            viewModel.setMultipleDeliveryAddressDataSource(result.data);
                        } else {
                            //We didn't get any data back. Display a message if set to do so.
                            $.cv.util.notify(widget.viewModel, vm.get("errorLoadingPossibleAddresses"), $.cv.css.messageTypes.error);
                        }
                    } else {
                        //we received an error. Display a message if set to do so.
                        $.cv.util.notify(widget.viewModel, vm.get("errorLoadingPossibleAddresses"), $.cv.css.messageTypes.error);

                    }
                }).fail(function (result) {
                    //Handle ajax call failure here. 
                    viewModel.setMessage(widget.options.textErrorGettingMutipleDeliveryAddress, $.cv.css.messageTypes.error);
                }).always(function (result) {
                    viewModel.set("isLoadingMyPossibleAddresses", false);
                });
            };

            var _getAddressDataView = function (data) {
                var array = [];

                _.each(data, function (item, index) {
                    // add standard commands
                    item.index = index;
                    var dataItem = $.cv.util.getFieldItemData(item);
                    array.push(dataItem);
                });

                return array;
            };

            var _setDefaultDeliveryAddress = function (deliveryAddress) {
                //verify that we are working with a delivery address item.
                if ($.cv.util.hasValue(deliveryAddress)) {
                    //get the index to the currently set default delivery address
                    var multipleAddressItemList = viewModel.get("multipleAddressItemList");
                    var defaultDeliveryAddressIndex = viewModel.get("defaultDeliveryAddressIndex");
                        
                    //verify that we have the right number of address items to work with.
                    if (deliveryAddress.Index < multipleAddressItemList.length)
                    {
                        //verify that we actually have a default delivery address set. NOTE: This should always be the case 
                        //however as a fallback, the default in this widget is -1 indicating that a default has not been set.
                        //We should just check that the value is within range and then set false
                        if (defaultDeliveryAddressIndex >= 0 && defaultDeliveryAddressIndex < multipleAddressItemList.length) {
                            multipleAddressItemList[defaultDeliveryAddressIndex].set("IsDefaultDeliveryAddress", false);
                        }
                            
                        //set default true on the newly selected delivery address item
                        deliveryAddress.set("IsDefaultDeliveryAddress", true);
                        //set the default delivery address index on the view model so we can keep track of it.
                        viewModel.set("defaultDeliveryAddressIndex", deliveryAddress.Index);
                    }
                }
            };

            var _getMultipleAddressDataView = function () {
                // check if the data source for the multiple delivery adresses has been initialised
                var multipleDeliveryAddressDataSource = viewModel.get("multipleDeliveryAddressDataSource");
                if (!multipleDeliveryAddressDataSource) {
                    viewModel.set("defaultDeliveryAddressIndex", -1);
                    viewModel.set("previousDefaultDeliveryAddressIndex", -1);
                    return [];
                }

                var array = [];
                _.each(multipleDeliveryAddressDataSource.view(), function (item, index) {
                    // add standard commands
                    item.Index = index;
                    if (item.IsDefaultDeliveryAddress) {
                        viewModel.set("defaultDeliveryAddressIndex", index);
                        viewModel.set("previousDefaultDeliveryAddressIndex", index);
                    }

                    item.setAsDefaultDeliveryAddress = function() {
                        _setDefaultDeliveryAddress(item);
                    };

                    array.push(item);
                });
                
                return array;
            };

            var viewModel = kendo.observable($.extend({}, opts, {
                // Properties for UI elements
                isProcessing: false,
                isLoadingMyPossibleAddresses: false,
                isLoadingMyDefaultAddress: false,
                differentDeliveryAndBilling: false,

                multipleAddressItemList: [],
                deliveryAddressList: [],
                billingAddressList: [],
                defaultDeliveryAddressIndex: -1,
                previousDefaultDeliveryAddressIndex: -1,
                
                message: "",
                clearWidgetMessages: widget.options.clearWidgetMessages,
                setMessage: function (message, type) {
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name
                    });
                },

                addressesMatch: function () {
                    var vm = this;
                    var match = true;
                    var billingAddress = vm.get("billingAddressList");

                    $.each(vm.get("deliveryAddressList"), function (idx, item) {
                        var billingField = billingAddress.length >= idx ? billingAddress[idx] : null;
                        if (billingField == null) {
                            match = false;
                            // break out of loop
                            return false;
                        } else if (item.get(item.fieldItem.fieldName) != billingField.get(billingField.fieldItem.fieldName)) {
                            match = false;
                            // break out of loop
                            return false;
                        }
                    });

                    return match;
                },

                clearMessage: function () {
                    var vm = this;

                    vm.setMessage("", "");
                },

                getAddressField: function (addressList, fieldName) {
                    return _.find(addressList, function (item) { return item.fieldItem.FieldName === fieldName });
                },

                getBillingAddressField: function (fieldName) {
                    return this.getAddressField(this.get("billingAddressList"), fieldName);
                },

                getBillingAddressSuburbField: function () {
                    return this.getBillingAddressField(widget.options.billingSuburbFieldName);
                },

                getBillingAddressSuburbFieldValue: function () {
                    return this.getBillingAddressSuburbField().get(widget.options.billingSuburbFieldName);
                },

                getBillingAddressPostcodeField: function () {
                    return this.getBillingAddressField(widget.options.billingPostcodeFieldName);
                },

                getBillingAddressPostcodeFieldValue: function () {
                    return this.getBillingAddressPostcodeField().get(widget.options.billingPostcodeFieldName);
                },

                getBillingAddress: function () {
                    var vm = this;
                    var newAddressFieldInfo = {};

                    $.each(vm.get("billingAddressList"), function (idx, item) {
                        newAddressFieldInfo[item.fieldItem.fieldName] = this.get(item.fieldItem.fieldName) == null ? "" : this.get(item.fieldItem.fieldName);
                    });
                    return (newAddressFieldInfo);
                },

                getDeliveryAddressField: function (fieldName) {
                    return this.getAddressField(this.get("deliveryAddressList"), fieldName);
                },

                getDeliveryAddressSuburbField: function () {
                    return this.getDeliveryAddressField(widget.options.suburbFieldName);
                },

                getDeliveryAddressSuburbFieldValue: function () {
                    return this.getDeliveryAddressSuburbField().get(widget.options.suburbFieldName);
                },

                getDeliveryAddressPostcodeField: function () {
                    return this.getDeliveryAddressField(widget.options.postcodeFieldName);
                },

                getDeliveryAddressPostcodeFieldValue: function () {
                    return this.getDeliveryAddressPostcodeField().get(widget.options.postcodeFieldName);
                },

                getDelAddress: function () {
                    var vm = this;
                    var newAddressFieldInfo = {};

                    if (vm.get("differentDeliveryAndBilling")) {
                        $.each(vm.get("deliveryAddressList"), function(idx, item) {
                            newAddressFieldInfo[item.fieldItem.fieldName] = this.get(item.fieldItem.fieldName) == null ? "" : this.get(item.fieldItem.fieldName);
                        });
                    } else {
                        var billingAddress = vm.get("billingAddressList");
                        $.each(vm.get("deliveryAddressList"), function (idx, item) {
                            var billingField = billingAddress.length >= idx ? billingAddress[idx] : null;
                            newAddressFieldInfo[item.fieldItem.fieldName] = (billingField == null || billingField.get(billingField.fieldItem.fieldName) == null)
                                ? "" : billingField.get(billingField.fieldItem.fieldName);
                            this.set(item.fieldItem.fieldName, newAddressFieldInfo[item.fieldItem.fieldName]);
                        });
                    }
                    return (newAddressFieldInfo);
                },

                validateSuburbAndPostCode: function (suburb, postcode, country) {
                    var vm = this;
                    var suburbValidated = $.Deferred();

                    // if suburb or postcode is not valid no need to call the validation method just return false
                    if (!$.cv.util.hasValue(suburb) || !$.cv.util.hasValue(postcode)) {
                        suburbValidated.resolve([{ data: false }]);
                        return suburbValidated;
                    }
                    var suburbValidated = $.cv.css.deliveryAddress.validateSuburbAndPostCode({
                        suburb: suburb,
                        postcode: postcode,
                        country: country
                    });

                    suburbValidated.fail(function () {
                        vm.setMessage(widget.options.errorValidatingSuburbPostcode, $.cv.css.messageTypes.error);
                    });

                    return suburbValidated;
                },

                validateBillingSuburbAndPostCode: function () {
                    var vm = this;

                    return this.validateSuburbAndPostCode(vm.getBillingAddressSuburbFieldValue(), vm.getBillingAddressPostcodeFieldValue(), "");
                },

                validateDeliverySuburbAndPostCode: function () {
                    var vm = this;
                    var deferred = $.Deferred();

                    if (!vm.get("differentDeliveryAndBilling")) {
                        deferred.resolve([{ data: true }]);
                        return deferred;
                    } else {
                        return this.validateSuburbAndPostCode(vm.getDeliveryAddressSuburbFieldValue(), vm.getDeliveryAddressPostcodeFieldValue(), "");
                    }
                },

                setFieldErrorMessage: function(field, message) {
                    field.setError(field.fieldItem, message, "");
                },

                billingAddressInvalid: false,

                clearBillingInvalidSuburbAndPostCode: function () {
                    var vm = this;

                    vm.set("billingAddressInvalid", false);
                    vm.setFieldErrorMessage(vm.getBillingAddressPostcodeField(), "");
                    vm.setFieldErrorMessage(vm.getBillingAddressSuburbField(), "");
                },

                setBillingInvalidSuburbAndPostCode: function () {
                    var vm = this;

                    vm.setFieldErrorMessage(vm.getBillingAddressPostcodeField(), widget.options.suburbAndPostcodeInvalidMessage);
                    vm.setFieldErrorMessage(vm.getBillingAddressSuburbField(), widget.options.suburbAndPostcodeInvalidMessage);
                    vm.set("billingAddressInvalid", true);
                },

                deliveryAddressInvalid: false,

                clearDeliveryInvalidSuburbAndPostCode: function () {
                    var vm = this;

                    vm.set("deliveryAddressInvalid", false);
                    vm.setFieldErrorMessage(vm.getDeliveryAddressPostcodeField(), "");
                    vm.setFieldErrorMessage(vm.getDeliveryAddressSuburbField(), "");
                },

                setDeliveryInvalidSuburbAndPostCode: function () {
                    var vm = this;

                    vm.setFieldErrorMessage(vm.getDeliveryAddressPostcodeField(), widget.options.suburbAndPostcodeInvalidMessage);
                    vm.setFieldErrorMessage(vm.getDeliveryAddressSuburbField(), widget.options.suburbAndPostcodeInvalidMessage);
                    vm.set("deliveryAddressInvalid", true);
                },

                suburbAndStateValid: function () {
                    var vm = this;
                    var deferred = $.Deferred();

                    vm.clearBillingInvalidSuburbAndPostCode();
                    vm.clearDeliveryInvalidSuburbAndPostCode();

                    if (widget.options.enableSuburbAndPostcodeValidation) {
                        $.when(vm.validateBillingSuburbAndPostCode(), vm.validateDeliverySuburbAndPostCode()).done(function(billing, delivery) {
                            var valid = true;
                            if (billing.length > 0 && !billing[0].data) {
                                vm.setBillingInvalidSuburbAndPostCode();
                                valid = false;
                            }
                            if (delivery.length > 0 && !delivery[0].data) {
                                vm.setDeliveryInvalidSuburbAndPostCode();
                                valid = false;
                            }

                            deferred.resolve(valid);
                        });
                    } else {
                        deferred.resolve(true);
                    }

                    return deferred;
                },

                validateAddressFields: function (list, showMessages) {
                    var allValid = true;
                    $.each(list, function (idx, item) {
                        if (!item.fieldItem.parent().fieldValid({ data: item.fieldItem.parent() }, showMessages)) {
                            allValid = false;
                        }
                    });
                    return allValid;
                },

                allFieldsValid: function () {
                    var vm = this;
                    var valid = true;

                    valid = vm.validateAddressFields(vm.get("billingAddressList"), widget.options.triggerMessages);
                    if (valid) {
                        if (!vm.get("differentDeliveryAndBilling")) {
                            return valid;
                        } else {
                            valid = vm.validateAddressFields(vm.get("deliveryAddressList"), widget.options.triggerMessages);
                        }
                    } else {
                        vm.validateAddressFields(vm.get("deliveryAddressList"), widget.options.triggerMessages);
                    }
                    return valid;
                },

                updateMyAddress: function () {
                    var vm = this;

                    $.cv.util.clearMessage.apply(widget.viewModel);
                    vm.clearMessage();
                    vm.set("isProcessing", true);
                    if (vm.allFieldsValid()) {
                        vm.suburbAndStateValid().done(function(valid) {
                            if (valid) {
                                $.cv.css.user.updateMyAddress({ deliveryAddress: vm.getDelAddress(), billingAddress: vm.getBillingAddress() }).done(function(msg) {
                                    if (!msg.errorMessage || msg.errorMessage.length === 0) {
                                        if ($.cv.util.hasValue(msg.data) && msg.data.Messages && msg.data.Messages.length > 0) {
                                            var messages = _.reduce(msg.data.Messages, function(memo, message) { return memo + (memo.length > 0 ? ", " : "") + message; }, "");
                                            vm.setMessage(messages, (msg.data.Success ? $.cv.css.messageTypes.success : $.cv.css.messageTypes.error));
                                        }
                                    }
                                    vm.set("isProcessing", false);
                                    widget.trigger(ADDRESSUPDATED);
                                });
                            } else {
                                vm.setMessage(widget.options.suburbPostcodeNotValid, $.cv.css.messageTypes.error);
                                vm.set("isProcessing", false);
                            }
                        });
                    } else {
                        vm.setMessage(widget.options.notAllFieldsValid, $.cv.css.messageTypes.error);
                        vm.set("isProcessing", false);
                    }
                },

                //Multiple Delivery Address Functionality
               
                setMultipleDeliveryAddressDataSource: function (data) {
                    var vm = this;
                    var multipleDeliveryAddressDataSource;

                    if (data) {
                        multipleDeliveryAddressDataSource = kendo.data.DataSource.create(data);
                    } else {
                        multipleDeliveryAddressDataSource = kendo.data.DataSource.create(widget.options.multipleDeliveryAddressDataSource);
                    }

                    if (widget.options.autoBind) {
                        multipleDeliveryAddressDataSource.fetch();
                    }

                    vm.set("multipleDeliveryAddressDataSource", multipleDeliveryAddressDataSource);

                    vm.updateMultipleAddressItemList();
                },

                updateMultipleAddressItemList: function () {
                    var vm = this;

                    vm.set("multipleAddressItemList", _getMultipleAddressDataView());
                },

                showOverlay: function () {
                    var vm = this;
                    //Get the overlayId to be used to 
                    var overlayId = vm.get("overlayId");

                    //Check that there is actually an overlay id before attempting to do anything
                    //if not return
                    if ($.cv.util.isNullOrWhitespace(overlayId)) {
                        return;
                    }

                    $.fancybox.open(
                    {
                        topRatio: '0.25',
                        minWidth: '320',
                        padding: '0',
                        href: "#" + overlayId,
                        
                        afterShow: function () {
                            // Resize FancyBox popup window.
                            $.fancybox.update();
                        }
                    });
                },

                hideOverlay: function () {
                    $.fancybox.close(true);
                },

                cancelSetDefaultDeliveryAddress: function () {
                    var vm = this;
                    //get the multiple address items for the current user
                    var multipleAddressItemList = vm.get("multipleAddressItemList");

                    if (multipleAddressItemList && multipleAddressItemList.length > 0) {
                        //get the default delivery address and previous delivery address index  index.
                        var defaultDeliveryAddressIndex = vm.get("defaultDeliveryAddressIndex");
                        var previousDefaultDeliveryAddressIndex = vm.get("previousDefaultDeliveryAddressIndex");
                    
                        //Check to see if our default and previous addresses are the same. If so we don't need to do anything.
                        if (defaultDeliveryAddressIndex !== previousDefaultDeliveryAddressIndex) {
                            //check to make sure that the default delivery address index is in range before attmepting to set
                            //the corresponding address item to no longer be the default
                            if (defaultDeliveryAddressIndex >= 0 && defaultDeliveryAddressIndex < multipleAddressItemList.length) {
                                multipleAddressItemList[defaultDeliveryAddressIndex].set("IsDefaultDeliveryAddress", false);
                            }

                            //check to make sure that the previous default delivery address index is in range before attempting to set
                            //the corresponding address item to be the default
                            if (previousDefaultDeliveryAddressIndex >= 0 && previousDefaultDeliveryAddressIndex < multipleAddressItemList.length) {
                                multipleAddressItemList[previousDefaultDeliveryAddressIndex].set("IsDefaultDeliveryAddress", true);
                                //And set the defaultDeliveryAddressIndex to be the same as the previousDefaultDeliveryAddressIndex
                                vm.set("defaultDeliveryAddressIndex", previousDefaultDeliveryAddressIndex);
                            }
                        }
                    } else {
                        //we don't have any entries in the list so set our indexes to -1.
                        //We should not get to this point, but just in case something goes astray
                        vm.set("defaultDeliveryAddressIndex", -1);
                        vm.set("previousDefaultDeliveryAddressIndex", -1);
                    }

                    //and hide the overlay
                    vm.hideOverlay();
                },

                

                updateDefaultDeliveryAddress: function () {
                    var vm = this;

                    if (vm.get("isProcessing") === false) {
                        vm.set("isProcessing", true);

                        var multipleAddressItemList = vm.get("multipleAddressItemList");
                        var defaultDeliveryAddressIndex = vm.get("defaultDeliveryAddressIndex");

                        //Check for a default delivery address being set. If we don't have a default delivery address set at all then nothing to do here.
                        if (!$.cv.util.hasValue(defaultDeliveryAddressIndex) || defaultDeliveryAddressIndex === -1) {
                            $.cv.util.notify(widget.viewModel, vm.get("noDefaultDeliveryAddressSelected"), $.cv.css.messageTypes.info, { clearExisting: true });
                            vm.set("isProcessing", false);
                            return;
                        }

                        //If we don't have a previous delivery address set then there is nothing to do here.
                        //NOTE: On initialisation previousdefault and default will have been set to the same thing. default will only be changed
                        //when the user selects a delivery address tile in the overlay. The call to update the delivery address is not done until the confirm button on the overlay
                        //is clicked.

                        var previousDefaultDeliveryAddressIndex = vm.get("previousDefaultDeliveryAddressIndex");
                        //Check for a default delivery address being set
                        if (!$.cv.util.hasValue(previousDefaultDeliveryAddressIndex) || defaultDeliveryAddressIndex === previousDefaultDeliveryAddressIndex) {
                            $.cv.util.notify(widget.viewModel, vm.get("defaultDeliveryAddressSameAsPrevious"), $.cv.css.messageTypes.info, { clearExisting: true });
                            vm.set("isProcessing", false);
                            return;
                        }

                        //the user has selected a new default delivery address. Make the call to update the default delivery
                        //address
                        var deliveryAddress = multipleAddressItemList[defaultDeliveryAddressIndex];
                        var options = {
                            addressKey: deliveryAddress.Name,
                            isDefaultCustomerAddress: deliveryAddress.IsDefaultCustomerAddress
                            };
                        $.cv.css.user.setDefaultDeliveryAddress(options).done(function (response) {
                            //Successful service call. Check to see if the request to set the default delivery address was handled
                            //successfully or not. Also show any messages as appropriate.
                            //NOTE: if the request failed we need to set the default delivery address back to what it was before we started. 
                            if (response && response.data) {
                                var responseData = response.data;
                                if (responseData.Success) {
                                    vm.set("previousDefaultDeliveryAddressIndex", defaultDeliveryAddressIndex);
                                    //Show any response messages
                                    _.each(responseData.Messages, function (message) {
                                        if ($.cv.util.hasValue(message)) {
                                            $.cv.util.notify(widget.viewModel, message, $.cv.css.messageTypes.success, { clearExisting: true });
                                        }
                                    });
                                } else {
                                    //Show any response messages
                                    _.each(responseData.Messages, function (message) {
                                        if ($.cv.util.hasValue(message)) {
                                            $.cv.util.notify(widget.viewModel, message, $.cv.css.messageTypes.error, { clearExisting: true });
                                        }
                                    });
                                }
                            }
                            vm.hideOverlay();
                            vm.set("isProcessing", false);
                        }).fail(function (result) {
                            //The service call failed. Show any messages indicating the failure
                            $.cv.util.notify(widget.viewModel, vm.get("errorSettingDefaultDeliveryAddress"), $.cv.css.messageTypes.error, { clearExisting: true });

                            //We don't need to adjust the previous delivery address. This is only done on success.
                            vm.hideOverlay();
                            vm.set("isProcessing", false);
                        });
                    }
                }
            }));

            viewModel.bind("change", function (e) {
                if (e.action === "itemchange") {
                    viewModel.clearMessage();
                    if (e.items && e.items.length > 0) {
                        if (viewModel.get("billingAddressInvalid") && _.contains([widget.options.billingPostcodeFieldName, widget.options.billingSuburbFieldName], e.items[0].fieldItem && e.items[0].fieldItem.FieldName)) {
                            viewModel.clearBillingInvalidSuburbAndPostCode();
                        }
                        if (viewModel.get("deliveryAddressInvalid") && _.contains([widget.options.postcodeFieldName, widget.options.suburbFieldName], e.items[0].fieldItem && e.items[0].fieldItem.FieldName)) {
                            viewModel.clearDeliveryInvalidSuburbAndPostCode();
                        }
                    }
                }
            });

            viewModel.set("isProcessing", true);

            _loadMyDefaultDeliveryAddress().always(function () {
                if (viewModel.get("isLoadingMyPossibleAddresses") === false && viewModel.get("isLoadingMyDefaultAddress") === false) {
                    viewModel.set("isProcessing", false);
                    widget.trigger(WIDGETDATAINTIALISED);
                }
            });

            if (viewModel.get("hasMultipleDeliveryAddresses")) {
                _loadMyPossibleAddresses().always(function () {
                    if (viewModel.get("isLoadingMyPossibleAddresses") === false && viewModel.get("isLoadingMyDefaultAddress") === false) {
                        viewModel.set("isProcessing", false);
                        widget.trigger(WIDGETDATAINTIALISED);
                    }
                });
            }

            return viewModel;
        },

        _buildViewTemplate: function () {
            var widget = this;
            widget._buildDefaultViewTemplate();
        },

        _buildDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = "";
            widget.viewTemplate += html;
        },

        _buildItemTemplateBody: function () {
            var widget = this;
            var html = "";
            widget.itemTemplate += html;
        }

    };

    // register the widget
    $.cv.ui.widget(myAddressWidget);

})(jQuery);