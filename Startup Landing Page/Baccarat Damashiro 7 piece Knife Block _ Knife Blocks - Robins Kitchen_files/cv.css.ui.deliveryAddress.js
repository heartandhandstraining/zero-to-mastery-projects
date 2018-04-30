/* Name: delivery address
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
*          /Scripts/cv.css.deliveryAddress.js
* Params:  
*           orderComments: 
*           deliveryInstructions: 
*           orderReference: 
*           copyOrderConfirmation: 
*           soDelCountry: 
*           soDelPhone: 
*           autoBind: 
*           triggerMessages: 
*           enterOrderComments: 
*           disableDeliveryAddress: 
*           showDeliveryInstructions: 
*           showAuthorityToLeave:
*           forceOrderReference: 
*           allowCopyOrderConfirmation: 
*           textOrderReferenceMandatory: 
*           textCustomerReferenceUpdatedSuccess: 
*           textDeliveryAddressUpdatedSuccess: 
*           textOrderCommentsUpdatedSuccess: 
*           textDeliveryInstructionsUpdatedSuccess: 
*           textCopyOrderConfirmationUpdatedSuccess: 
*           textCopyOrderConfirmationInvalidEmails: 
*           settings: 
*           resources: 
*           useSettings: 
*           viewTemplate: kendo template id for the main view
*/
;
(function ($, undefined) {

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        ADDRESSRENDERED = "addressRendered",
        MULTIADDRESSRENDERED = "multiAddressRendered",
        ADDRESSVALIDATIONRENDERED = "addressValidationRendered",
        ADDRESSVALIDATIONOPTIONSELECTED = "addressValidationOptionSelected",
        COPYADDRESSTOBILLING = "addressToBilling",
        COPYBILLINGTOADDRESS = "billingToAddress",
        AUTHORITYTOLEAVEDEFAULTOPTIONS = [{label: "Please select...", 
                                          value: ""},
                                         {label: "Reception",
                                          value: "Reception"}, 
                                         {label: "Front Door", 
                                          value: "Front Door"}, 
                                         {label: "Front Porch", 
                                          value: "Front Porch"}, 
                                         {label: "Front Verandah", 
                                          value: "Front Verandah"}, 
                                         {label: "In Carport", 
                                          value: "In Carport"}, 
                                         {label: "In Garage", 
                                          value: "In Garage"}, 
                                         {label: "In Letter Box", 
                                          value: "In Letter Box"},
                                         {label: "In Mail Box", 
                                          value: "In Mail Box"}, 
                                         {label: "Over Front Fence", 
                                          value: "Over Front Fence"}, 
                                         {label: "Next To Wheelie Bins", 
                                          value: "Next To Wheelie Bins"},
                                         {label: "Under Front Stairs", 
                                         value: "Under Front Stairs"
                                         }];

    var deliveryAddressWidget = {
        // Standard Variables

        // widget name
        name: "deliveryAddress",

        // default widget options
        options: {
            // viewModel defaults
            dataSource: [],
            multipleDeliveryAddressDataSource: [],
            deliveryAddressValidationDataSource: [],
            orderComments: '',
            deliveryInstructions: '',
            orderReference: '',
            copyOrderConfirmation: '',
            soDelCountry: '',
            soDelPhone: '',
            sessionTimeOutRedirectUrl: "login.aspx",
            multipleAddressTextField: "Name",
            multipleAddressValueField: "Name",
            addressValidationTextField: "label",
            addressValidationValueField: "value",
            defaultMultipleAddressValue: '',
            defaultAddressValidationValue: '',
            inputErrorClass: "input-error",
            deliveryAddressMode: "Delivery",
            authorityToLeaveOptionList: [],
            authorityToLeaveFormat: "Authority to leave {0}",
            defaultLeaveAtAlternateLocation: undefined,

            // viewModel flags
            autoBind: true,
            triggerMessages: false,
            triggerErrorMessages: false,
            triggerExternalValidationMessages: false,
            includeInBrowserHistory: false,
            showCustomerReferenceUpdatedMessage: false,
            updateAddressOnChanged: false,
            autoSelectAddressValidationValue: false,
            usingAddressValidation: false,
            saveAddressForUser: true,
            saveDeliveryInstructions: false,
            showPickupDeliveryControls: false,
            pickupContactFieldData: [],
            defaultLinkDeliveryAndBilling: false,
            useNegationLogicForLinkingAddress: false,
            showBillingAddressOnPickup: false,
            clearOnUncheckedLink: true,
            saveAddressDownToUser: true,
            saveBillAddressDownToUser: false,
            addressMapMode: COPYBILLINGTOADDRESS,
            loadBlankBillingFromDelivery: false,
            preserveLoadedDeliveryAddress: false,
            callValidateServiceOnCheckout: false,
            fieldMapFrom: "0,1,2,3,4,5,6,7,8,9,10,11,12",
            userAddressFields: "DeliveryContactName,DeliveryAddress1,DeliveryAddress2,DeliverySuburb,DeliveryState,DeliveryCountry,DeliveryPostcode,PhoneNumber,DeliveryAddress7",
            saveAddressFieldGroup: "saveAddressFieldGroup",
            createUserFromGuest: false,
            guestCheckoutEmailField: "",
            isDeliveryMethodsInUse: false,
            isDeliveryMethodSetOnOrder: false,
            useAddressLookup: false,
            displayValuesFromSeq: "1,2",
            addressObjectMapping: "",
            billingAddressLookupMandatoryMessage: "Billing Address is Mandatory",
            deliveryAddressLookupMandatoryMessage: "Delivery Address is Mandatory",
            emptyBillingAddressFields: { SoBillAddr2: "", SoBillSuburb: "", SoBillPostcode: "", AddressId: "" },
            emptyDeliveryAddressFields: { SoDelAddr2: "", SoDelSuburb: "", SoDelPostcode: "", AddressId: "" },

            // events
            // view flags
            // view text defaults
            textErrorGettingDeliveryAddress: "There was an error getting the delivery address for the order",
            textErrorUpdatingDeliveryAddress: "There was an error updating the delivery address for the order",
            textErrorValidatingSuburbPostcode: "There was an error validating the delivery address' suburb and postcode",
            textCustomerReferenceUpdatedSuccess: 'Customer reference updated successfully',
            textDeliveryAddressUpdatedSuccess: 'Delivery address updated successfully',
            textBillingAddressUpdatedSuccess: 'Billing address updated successfully',
            textCopyOrderConfirmationInvalidEmails: 'One of the copy confirmation email addresses is invalid',
            textErrorGettingMutipleDeliveryAddress: "There was an error retrieving your list of delivery addresses",
            textUpdatingAttentionToSuccess: "Attention to and phone number updated successfully",
            textErrorUpdatingAttentionTo: "There was an error updating the attention to or phone number",
            textErrorSavingDeliveryAddress: "There was an error saving your delivery address",
            textErrorMissingDeliveryAddressFields: "Not all the mandatory address fields have been populated",
            textErrorCannotEditAddressOnPickup: "The delivery address cannot be changed when using pickup",
            defaultMultipleAddressText: 'Please Select...',
            defaultAddressValidationText: 'Please Select...',
            defaultAuthorityToLeaveText: 'Please Select...',
            textMandatoryFieldNotComplete: "",
            addressIsValid: "Your address is valid",
            // widget settings
            countryList: '',
            showCountry: false,
            stateList: '',
            enterOrderComments: true,
            disableDeliveryAddress: false,
            disableBillingAddress: false,
            showDeliveryInstructions: true,
            showAuthorityToLeave: false,
            forceOrderReference: true,
            allowCopyOrderConfirmation: true,
            copyOrderConfirmationMandatory: false,
            hasMultipleDeliveryAddresses: false,
            showAttentionToUserDetails: false,
            isViewOnly: false,
            isDangerousGoodsPoBoxDelivery: false,
            textOrderReferenceMandatory: 'Please enter an order reference',
            textCopyOrderConfirmationMandatory: 'Please enter an order confirmation copy email address',
            textPickupContactDetailsIncomplete: "Pickup contact details are incomplete",
            textOrderCommentsUpdatedSuccess: 'Order comments updated successfully',
            textDeliveryInstructionsUpdatedSuccess: 'Delivery instructions updated successfully',
            textAuthorityToLeaveUpdatedSuccess: 'Authority to leave updated successfully',
            textErrorUpdatingAuthorityToLeave: 'There was an error updating the authority to leave location',
            textAuthorityToLeaveMandatory: 'Please enter an authority to leave location',
            textAuthorityToLeaveOptionNotSelected: 'Authority to leave selected but no location chosen. Please select a location.',
            textCopyOrderConfirmationUpdatedSuccess: 'Copy order confirmation updated successfully',
            attentionUserName: "",
            attentionPhoneNumber: "",
            multiUpdateThrottleTimeout: 0,
            surbPostCodeInputThrottleTimeout: 500,
            // This can be used when need to show details for some other order other than the users current order e.g. order searching, quotes etc.
            // Note: Currently it has only been implemented here for retreival and display in a read only fashion (e.g. can be used in checkout summary not 
            // in checkout details entry or editing views). If this needs to be changed bear in mind that any functions in here that alter the order will 
            // likely need changes for this.
            orderNoOverride: 0,
            // view Template
            viewTemplate: '', // treat like its an id
            addressViewTemplate: null,
            multipleAddressViewTemplate: null,
            addressValidationViewTemplate: null,

            // Pickup view only field mapping
            pickupSuburbFieldName: 'SoDelAddr3',
            pickupStateFieldName: 'SoDelAddr4',

            // Suburb and Postcode Auto-complete: (these get the dropdowns but State gets set too in result selection). Uses AddressRulesets to be configured for use. 
            // Works for b2b and b2c (b2c also will do it on billing fields but as b2c address fields are hard coded in razor don't need to pass anything in).
            addressRulesetsAssignmentsSuburbField: "",
            addressRulesetsAssignmentsStateField: "",
            addressRulesetsAssignmentsPostcodeField: "",
            delAddressSuburbAutoCompleteTemplateId: "",
            isB2c: false,

            // Suburb and Postcode Validation
            enableSuburbAndPostcodeValidation: false,
            suburbFieldName: 'SoDelSuburb',
            postcodeFieldName: 'SoDelPostcode',
            countryFieldName: 'SoDelCountry',
            billingSuburbFieldName: 'SoBillSuburb',
            billingPostcodeFieldName: 'SoBillPostcode',
            billingCountryFieldName: 'SoBillCountry',
            suburbAndPostcodeInvalidMessage: 'The suburb and postcode don\'t correspond.',

            customerFieldNameForDefaultAddressName: '', // Field on Customer record that is used for the DA Delivery Address instead of just the customer name

            // IMPORTANT:
            // If the StoreAvailaibilityClickAndCollect functionality is in use then the user will have chosen either Pickup or Delivery on the cart page.
            // If Pickup was selected the Delivery Details are already set and we do not allow any changes to the order (must go to payment or back to cart 
            // if want to change delivery). In this case user still needs to be able to enter Billing / Contact Address fields though. Need to make sure we 
            // don't render any choice between Pickup and Delivery on here for this functionality (this functionality requires a pickup location will already 
            // have been selected if wanted). But, if Delivery was chosen then still need to be able  to enter both Delivery and Billing address fields and 
            // select freight!
            isStoreAvailPickup: false,
            warehouseIfIsStoreAvailPickup: "",

            addressValidationMode: ""
        },

        events: [DATABINDING, DATABOUND, MULTIADDRESSRENDERED, ADDRESSRENDERED, ADDRESSVALIDATIONRENDERED, ADDRESSVALIDATIONOPTIONSELECTED],

        viewModel: null,

        view: null,

        // private property
        _viewAppended: false,
        _addressViewAppended: false,
        _multipleAddressViewAppended: false,
        _addressValidationViewAppended: false,

        // Standard Methods
        initialise: function (el, o) {
            var widget = this;
            // check for an internal view
            var internalView = $(el).children(":first");
            if (internalView.data("view")) {
                widget.view = internalView.html();
            } else {
                widget._viewAppended = true;
                if (!widget.options.addressViewTemplate) {
                    // generate an item template name and flag it to be created
                    widget.options.addressViewTemplate = widget.name + "-address-template-" + kendo.guid();
                    widget._addressViewAppended = true;
                }
                if (!widget.options.multipleAddressViewTemplate) {
                    // generate an item template name and flag it to be created
                    widget.options.multipleAddressViewTemplate = widget.name + "-multi-address-template-" + kendo.guid();
                    widget._multipleAddressViewAppended = true;
                }
                if (!widget.options.addressValidationViewTemplate) {
                    // generate an item template name and flag it to be created
                    widget.options.addressValidationViewTemplate = widget.name + "-address-validation-template-" + kendo.guid();
                    widget._addressValidationViewAppended = true;
                }
                // get template text and parse it with the options
                var templateText = widget.options.viewTemplate ? $("#" + widget.options.viewTemplate).html() : widget._getDefaultViewTemplate();
                var viewTemplate = kendo.template(templateText);
                widget.view = viewTemplate(widget.options);
                // add the addressViewTemplate (not parsed)
                if (widget._addressViewAppended) {
                    widget.view += widget._getDefaultAddressViewTemplate();
                }
                // add the multipleAddressViewTemplate (not parsed)
                if (widget._multipleAddressViewAppended) {
                    widget.view += widget._getDefaultMultipleAddressViewTemplate();
                }
                // add the addressValidationViewTemplate (not parsed)
                if (widget._addressValidationViewAppended) {
                    widget.view += widget._getDefaultAddressValidationViewTemplate();
                }
                widget.element.html(widget.view);
            }
            // now MMVM bind
            widget.viewModel = widget._getViewModel();
            var target = widget.element.children(":first");
            kendo.bind(target, widget.viewModel);
            widget.trigger(DATABOUND);
            if (widget.options.isViewOnly) {
                $.cv.css.bind($.cv.css.eventnames.localdeliveryAddressChanged, $.proxy(widget.viewModel.localdeliveryAddressChanged, widget.viewModel));
                $.cv.css.bind($.cv.css.eventnames.deliveryAddressModeChanged, function (msg) {
                    widget.viewModel.set("deliveryAddressMode", msg.message)
                });
            }
            if (widget.options.isDeliveryMethodsInUse) {
                $.cv.css.bind($.cv.css.eventnames.deliveryMethodSetOnOrder, $.proxy(widget.viewModel.deliveryMethodSetOnOrder, widget.viewModel));
                $.cv.css.bind($.cv.css.eventnames.deliveryMethodClearedFromOrder, $.proxy(widget.viewModel.deliveryMethodClearedFromOrder, widget.viewModel));
            }

            if (widget.options.useAddressLookup) {
                $.cv.css.bind($.cv.css.eventnames.addressLookupSelected, $.proxy(widget.viewModel.addressLookupSelected, widget.viewModel));
                $.cv.css.bind($.cv.css.eventnames.addressLookupValueEdited, $.proxy(widget.viewModel.addressLookupValueEdited, widget.viewModel));
            }

            widget._setThrottles();
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
            var widget = this,
                triggerMessages = widget.options.triggerMessages,
                validateDeferred = $.Deferred();
            if (!widget.options.isViewOnly && widget.viewModel.showAddressView()) {
                if (widget.options.triggerExternalValidationMessages) {
                    widget.options.triggerMessages = true;
                }
                validateDeferred = widget.viewModel.validateInputFields(showMessages, widget.options.callValidateServiceOnCheckout);
                widget.options.triggerMessages = triggerMessages;
            }
            return validateDeferred;
        },

        _setThrottles: function () {
            var widget = this;
            widget._updateDeliveryAddressThrottled = _.debounce(function () {
                if (widget.options.multiUpdateThrottleTimeout > 0) {
                    var triggerUpdate = !widget.options.updateAddressOnChanged || (widget.options.updateAddressOnChanged && !widget.viewModel.get("isAddressBeingEdited"));
                    if (widget.viewModel.get("deliveryAddressMode") != "Pickup" && widget.options.addressMapMode == COPYBILLINGTOADDRESS && widget.viewModel.shouldAddressBeCopied()) {
                        triggerUpdate = !widget.options.updateAddressOnChanged || (widget.options.updateAddressOnChanged && !widget.viewModel.get("isBillingAddressBeingEdited"));
                    }
                    if (triggerUpdate) {
                        return widget.viewModel._updateDeliveryAddress.apply(widget.viewModel, arguments);
                    }
                } else {
                    return widget.viewModel._updateDeliveryAddress.apply(widget.viewModel, arguments);
                }
            }, widget.options.multiUpdateThrottleTimeout);
            widget._updateBillingAddressThrottled = _.debounce(function () {
                if (widget.options.multiUpdateThrottleTimeout > 0) {
                    var triggerUpdate = !widget.options.updateAddressOnChanged || (widget.options.updateAddressOnChanged && !widget.viewModel.get("isBillingAddressBeingEdited"));
                    if (widget.viewModel.get("deliveryAddressMode") != "Pickup" && widget.options.addressMapMode == COPYADDRESSTOBILLING && widget.viewModel.shouldAddressBeCopied()) {
                        triggerUpdate = !widget.options.updateAddressOnChanged || (widget.options.updateAddressOnChanged && !widget.viewModel.get("isAddressBeingEdited"));
                    }
                    if (triggerUpdate) {
                        return widget.viewModel._updateBillingAddress.apply(widget.viewModel, arguments);
                    }
                } else {
                    return widget.viewModel._updateBillingAddress.apply(widget.viewModel, arguments);
                }
            }, widget.options.multiUpdateThrottleTimeout);
        },

        // private function
        _getViewModel: function () {
            var widget = this;

            var init = function (forceLoad) {
                if (forceLoad || !widget.options.isViewOnly) {
                    if (forceLoad || !widget.options.isDeliveryMethodsInUse) {
                        loadSoDelAddress().done(function (response) {
                            if (response && response.data && response.data.result && response.data.result.length > 0) {
                                //Check our viewModel information and check to see that we have values set appropriately for
                                //any of the delivery address fields. In particulart that SoDelCountry and SoDelState are set
                                //SoDelCountry if not set should be set to the default (Please Select...) from it's option list
                                //or if only one option available then this value. SoDelState should be set according to this.
                                viewModel.setAddressDefaults();

                                //At this point we have loaded address data from the source
                                //and should have available the addressItemList and billingAddressItemList
                                //on the view model.
                                var addrList = viewModel.get('addressItemList');
                                var billAddrList = viewModel.get('billingAddressItemList');

                                // Do Suburb and PostCode Validation if enabled.
                                if (widget.options.enableSuburbAndPostcodeValidation === true) {
                                    // Extract 3 required fields for suburb-postcode validation
                                    // for both delivery and billing...
                                    var addr = {
                                        suburb: '',
                                        postcode: '',
                                        country: ''
                                    },
                                        bill = {
                                            suburb: '',
                                            postcode: '',
                                            country: ''
                                        };

                                    _.each(addrList, function (item) {
                                        if (item.fieldItem.FieldName === "SoDelCountry") {
                                            addr.country = item.value;
                                            return;
                                        }

                                        if (item.fieldItem.FieldName === widget.options.suburbFieldName) {
                                            addr.suburb = item.value;
                                            return;
                                        }

                                        if (item.fieldItem.FieldName === widget.options.postcodeFieldName) {
                                            addr.postcode = item.value;
                                            return;
                                        }
                                    });

                                    // Only process the billing fields if they are actually in use i.e. in b2c only, b2b does not show or use billing fields
                                    if (widget.options.isB2c) {
                                        _.each(billAddrList, function(item) {
                                            if (item.fieldItem.FieldName === "SoDelCountry") {
                                                bill.country = item.value;
                                                return;
                                            }

                                            if (item.fieldItem.FieldName === widget.options.billingSuburbFieldName) {
                                                bill.suburb = item.value;
                                                return;
                                            }

                                            if (item.fieldItem.FieldName === widget.options.billingPostcodeFieldName) {
                                                bill.postcode = item.value;
                                                return;
                                            }
                                        });
                                    }
                                    // ... and validate them ...
                                    var d1 = viewModel.validateSuburbAndPostCodeInternal(addr.suburb, addr.postcode, addr.country, false /* delivery */);

                                    // Only process the billing fields if they are actually in use i.e. in b2c only, b2b does not show or use billing fields
                                    var d2 = widget.options.isB2c
                                        ? viewModel.validateSuburbAndPostCodeInternal(bill.suburb, bill.postcode, bill.country, true  /* billing */)
                                        : {};

                                    $.when(d1, d2).done(function () {
                                        viewModel.validateInputFields(false);
                                    });
                                }
                            }
                        });
                    }

                    // Multiple delivery addresses
                    if (widget.options.hasMultipleDeliveryAddresses && widget.options.multipleDeliveryAddressDataSource.length == 0) {
                        getDeliveryAddresses();
                    } else {
                        setMultipleDeliveryAddressDataSource();
                    }
                    if (widget.options.showAttentionToUserDetails) {
                        viewModel.setAttentionToUserName(false);
                        viewModel.setAttentionToPhoneNumber(false);
                    }
                } else {
                    viewModel.localdeliveryAddressChanged();
                }
                
                // If the StoreAvailaibilityClickAndCollect functionality is in use then the user can have chosen either Pickup or Delivery on the cart page
                // (cant't select it at checkout page!). If Pickup was selected the Delivery Details are already set to that of the store and this needs to
                // be shown (for Pickup location) when the widget is used for Order Summary Review at checkout. In this case, as unlike normal pickup selection
                // which would have happened via the freight options on checkoutpage and would have set the pickup address into local storage for use as
                // datasource in kendotemplate showing those details, this won't have happened, so need to fetch the pickup address now.
                if (widget.options.isStoreAvailPickup) {
                    viewModel.getPickupAddressDataSource();
                }
                $.cv.css.trigger($.cv.css.eventnames.deliveryMethodLoadedCheck, { widgetName: widget.name });

                if (widget.options.authorityToLeaveOptionList.length === 0) {
                    // use defaults for view model
                    viewModel.authorityToLeaveOptionList = AUTHORITYTOLEAVEDEFAULTOPTIONS;
                }
            };

            var bindAdditionalMethod = function () {
                var additionalEventBound = viewModel.get("additionalEventBound");
                if (!additionalEventBound && widget.options.usingAddressValidation && widget.options.addressValidationMode != "") {
                    $.cv.css.bind($.cv.css.eventnames.addressBeingEdited, $.proxy(widget.viewModel._addressBeingEdited, widget.viewModel));
                    $.cv.css.bind($.cv.css.eventnames.addressValidated, $.proxy(widget.viewModel._validationUpdated, widget.viewModel));
                }
                viewModel.set("additionalEventBound", true);
            }

            var goValidateAddress = function (addressValidationMode) {
                if (addressValidationMode === "") {
                    viewModel.set("addressValidated", true);
                } else {
                // Get the order that the widget is using. It could be either the users current 
                // order or some other order if have a orderNoOverride set e.g. order searching, quotes etc.
                var d1 = widget.options.orderNoOverride === 0
                            ? $.cv.css.deliveryAddress.getDeliveryAddressForCurrentOrder()
                            : $.cv.css.deliveryAddress.getDeliveryAddressForSelectedOrder({ orderNo: widget.options.orderNoOverride });
                d1.done(function (msg) {
                    var data = msg.data;
                        if (data.result && data.result.length > 0 && (data.result[0].SoBillAddr1 !== "" || data.result[0].SoDelAddr1 !== "")) {
                        //if (data.result && data.result.length > 0) {
                            viewModel.set("addressValidated", data.result[0].AddressValidated);
                    } else {
                            viewModel.set("addressValidated", false);
                    }
                        bindAdditionalMethod();
                    }
                    ).fail(function () {
                        viewModel.set("addressValidated", false);
                });

                }
            }

            var loadSoDelAddress = function (copyDeliveryToBilling) {
                    // Get the order that the widget is using. It could be either the users current 
                    // order or some other order if have a orderNoOverride set e.g. order searching, quotes etc.
                copyDeliveryToBilling = $.cv.util.hasValue(copyDeliveryToBilling) ? copyDeliveryToBilling : false;
                    var d1 = widget.options.orderNoOverride === 0
                                ? $.cv.css.deliveryAddress.getDeliveryAddressForCurrentOrder()
                                : $.cv.css.deliveryAddress.getDeliveryAddressForSelectedOrder({ orderNo: widget.options.orderNoOverride });

                    d1.done(function (msg) {
                        var data = msg.data;
                    if (!msg.sessionHasTimedOut) {
                        processAddressData(data, copyDeliveryToBilling);

                        // If AddressRulesets have been configured to enable suburb lookup / auto-complete then set it all up.
                        viewModel.initSuburbLookupFields();
                    } else {
                        viewModel.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, params, widget.options.includeInBrowserHistory);
                    }
                    bindAdditionalMethod();
                }).fail(function () {
                    viewModel.setMessage(widget.options.textErrorGettingDeliveryAddress, $.cv.css.messageTypes.error);
                    });

                return d1;
            };

            var rePopulateAddressCountryStateList = function (isBilling, addressFieldData, countryFieldName, stateFieldName, addressItemList) {
                if (addressFieldData) {
                    populateCountryList(addressFieldData, countryFieldName);
                    populateStateList(addressFieldData, stateFieldName, countryFieldName);
                    var dataListTemplates = _getAddressDataView(addressFieldData, isBilling);
                    viewModel.set(addressItemList, dataListTemplates);
                }
            }

            var changeStateList = function (isBilling) {
                if (viewModel.get("isCountryBeingEdited") === false)
                    return;

                var d1 = $.cv.css.deliveryAddress.getDeliveryAddressForCurrentOrder();

                d1.done(function (msg) {
                    var data = msg.data;
                    if (!msg.sessionHasTimedOut) {
                        if (data.result && data.result.length > 0) {
                            for (var i = 0; i < 1; i++) {
                                var addressFieldData = isBilling ? data.result[i].BillingAddressFieldData : data.result[i].AddressFieldData;
                                var countryFieldName = isBilling ? 'SoBillCountry' : 'SoDelCountry';
                                var stateFieldName = isBilling ? 'SoBillState' : 'SoDelState';
                                var addressItemList = isBilling ? 'billingAddressItemList' : 'addressItemList';
                                rePopulateAddressCountryStateList(isBilling, addressFieldData, countryFieldName, stateFieldName, addressItemList);
                            }
                            widget.trigger(ADDRESSRENDERED);
                            bindAdditionalMethod();
                        }
                    } else {
                        viewModel.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, params, widget.options.includeInBrowserHistory);
                    }
                }).fail(function () {
                    viewModel.setMessage(widget.options.textErrorGettingDeliveryAddress, $.cv.css.messageTypes.error);
                });
            };

            var populateCountryList = function (fieldList, countryFieldName) {
                var updatedCountryItem = null;

                if (widget.options.showCountry) {
                    var countryNames = $.map(widget.options.countryList, function (item, index) { return item; });

                    $.each(fieldList, function (idx, item) {
                        if (item.FieldName === countryFieldName) {
                            item.Lookup = addPleaseSelect(widget.options.countryList);

                            if (countryNames.length === 1) {
                                item.Value = countryNames[0];
                                updatedCountryItem = item;
                            }

                            if (item.Value === "") {
                                item.Value = " ";
                            }
                        }
                    });
                }

                return updatedCountryItem;
            }

            var addPleaseSelect = function (target) {
                // Don't add "Please Select" if there is only one item.
                if ($.map(target, function (item, index) { return index; }).length === 1) {
                    return target;
                }

                return $.extend({}, { ' ': 'Please Select' }, target);
            }

            var populateStateList = function (fieldList, stateFieldName, countryFieldName) {
                if (widget.options.showCountry) {
                    var countryName;
                    $.each(fieldList, function (idx, item) {
                        if (item.FieldName === countryFieldName) {
                            countryName = item.Value;
                            return;
                        }
                    });
                    var stateDic = widget.options.stateList;
                    $.each(fieldList, function (idx, item) {
                        if (item.FieldName === stateFieldName) {
                            if (stateDic[countryName]) {
                                if (!stateDic[countryName].hasOwnProperty(item.Value)) {
                                    item.Value = ' ';
                                }
                                item.Lookup = stateDic[countryName];
                            } else {
                                item.Lookup = {};
                            }

                            item.Lookup = addPleaseSelect(item.Lookup);
                            return;
                        }
                    });
                }
            }

            var processAddressData = function (data, copyDeliveryToBilling) {
                var deliveryAddressMode = viewModel.get("deliveryAddressMode");
                copyDeliveryToBilling = $.cv.util.hasValue(copyDeliveryToBilling) ? copyDeliveryToBilling : false;
                viewModel.set("isInitialLoad", true);
                if (data.result && data.result.length > 0) {
                    for (var i = 0; i < 1; i++) {
                        viewModel.set("authorityToLeave", data.result[i].AuthorityToLeave);
                        if (viewModel.get("authorityToLeave") && viewModel.get("authorityToLeave") !== "") {
                            viewModel.set("leaveAtAlternateLocation", true);
                        }
                        viewModel.set("deliveryInstructions", data.result[i].SoDelIns);
                        viewModel.set("orderReference", data.result[i].SoCustReference);
                        viewModel.set("copyOrderConfirmation", data.result[i].CopyOrderConfirmationEmail);
                        viewModel.set("orderComments", data.result[i].SoComments);
                        viewModel.set("soDelCountry", data.result[i].SoDelCountry);
                        viewModel.set("soDelPhone", data.result[i].SoDelPhone);
                        if (data.result[i].ContactFirstName !== undefined) {
                            viewModel.set("contactFirstName", deliveryAddressMode == "Pickup" ? data.result[i].ContactFirstName : "");
                        }
                        if (data.result[i].ContactLastName !== undefined) {
                            viewModel.set("contactLastName", deliveryAddressMode == "Pickup" ? data.result[i].ContactLastName : "");
                        }
                        if (data.result[i].ContactPhoneNumber !== undefined) {
                            viewModel.set("contactPhoneNumber", deliveryAddressMode == "Pickup" ? data.result[i].ContactPhoneNumber : "");
                        }
                        if (viewModel.get("deliveryAddressObjectKey").length == 0)
                            viewModel.set("deliveryAddressObjectKey", data.result[i]._objectKey);

                        populateCountryList(data.result[i].AddressFieldData, 'SoDelCountry');
                        populateStateList(data.result[i].AddressFieldData, 'SoDelState', 'SoDelCountry');

                        var dataListTemplates = _getAddressDataView(data.result[i].AddressFieldData, false);
                        if (dataListTemplates.length > 0)
                            viewModel.set('addressFieldsExist', true);
                        viewModel.set('addressItemList', dataListTemplates);

                        if (data.result[i].BillingAddressFieldData && data.result[i].BillingAddressFieldData != null) {
                            populateCountryList(data.result[i].BillingAddressFieldData, 'SoBillCountry');
                            populateStateList(data.result[i].BillingAddressFieldData, 'SoBillState', 'SoBillCountry');

                            var billingAddressListTemplates = _getAddressDataView(data.result[i].BillingAddressFieldData, true);
                            if (billingAddressListTemplates.length > 0) 
                                viewModel.set('billingAddressFieldsExist', true);
                            viewModel.set('billingAddressItemList', billingAddressListTemplates);

                            if ((copyDeliveryToBilling && !viewModel.deliveryAndBillingMatch()) ||
                                (widget.options.addressMapMode == COPYBILLINGTOADDRESS && widget.options.loadBlankBillingFromDelivery && viewModel.isBillingAddressEmpty() && !viewModel.isDeliveryAddressEmpty() && widget.options.deliveryAddressMode !== "Pickup")) {
                                widget.options.addressMapMode = COPYADDRESSTOBILLING;
                                viewModel.copyAddressFields(false);
                                viewModel.triggerCopyUpdate();
                                widget.options.addressMapMode = COPYBILLINGTOADDRESS;
                            }
                            if (viewModel.shouldAddressBeCopied() && !viewModel.deliveryAndBillingMatch()) {
                                // only copy if they are not already the same
                                if (!widget.options.preserveLoadedDeliveryAddress
                                    || (widget.options.addressMapMode == COPYBILLINGTOADDRESS && viewModel.isDeliveryAddressEmpty())
                                    || widget.options.addressMapMode == COPYADDRESSTOBILLING) {
                                    viewModel.copyAddressFields();
                                    viewModel.triggerCopyUpdate();
                                } else {
                                    viewModel.set("preserveAddressData", true);
                                    if (widget.options.useNegationLogicForLinkingAddress) {
                                        viewModel.set("linkDeliveryAndBilling", true);
                                    } else {
                                        viewModel.set("linkDeliveryAndBilling", false);
                                    }
                                    viewModel.set("preserveAddressData", false);
                                }
                            }
                            viewModel.disableEnableCopiedAddressFields();
                        }
                        widget.trigger(ADDRESSRENDERED);
                    }
                }

                viewModel.validateInputFields(false);
                viewModel.set("isInitialLoad", false);
            };

            var localProcessAddressData = function (data) {
                if (data.result && data.result.length > 0) {
                    for (var i = 0; i < 1; i++) {
                        viewModel.set("authorityToLeave", data.result[i].AuthorityToLeave);
                        viewModel.set("deliveryInstructions", data.result[i].SoDelIns);
                        viewModel.set("orderReference", data.result[i].SoCustReference);
                        viewModel.set("copyOrderConfirmation", data.result[i].CopyOrderConfirmationEmail);
                        viewModel.set("orderComments", data.result[i].SoComments);
                        viewModel.set("soDelCountry", data.result[i].SoDelCountry);
                        viewModel.set("soDelPhone", data.result[i].SoDelPhone);
                        viewModel.set("attentionUserName", data.result[i].AttentionUserName);
                        viewModel.set("attentionPhoneNumber", data.result[i].AttentionPhoneNumber);
                        if (data.result[i].ContactFirstName !== undefined) {
                            viewModel.set("contactFirstName", data.result[i].ContactFirstName);
                        }
                        if (data.result[i].ContactLastName !== undefined) {
                            viewModel.set("contactLastName", data.result[i].ContactLastName);
                        }
                        if (data.result[i].ContactPhoneNumber !== undefined) {
                            viewModel.set("contactPhoneNumber", data.result[i].ContactPhoneNumber);
                        }
                        if (data.result[i].AddressFieldData > 0)
                            viewModel.set('addressFieldsExist', true);
                        viewModel.set('addressItemList', data.result[i].AddressFieldData);
                        if (data.result[i].BillingAddressFieldData.length > 0)
                            viewModel.set('billingAddressFieldsExist', true);
                        viewModel.set('billingAddressItemList', data.result[i].BillingAddressFieldData);
                    }
                }
            };

            var getDeliveryAddresses = function () {
                var d1 = $.cv.css.deliveryAddress.getDeliveryAddressesForCurrentUser({
                    customerFieldNameForDefaultAddressName: widget.options.customerFieldNameForDefaultAddressName
                });
                $.when(d1).done(function (msg) {
                    var data = msg.data;
                    if (!msg.sessionHasTimedOut) {
                        widget.options.multipleDeliveryAddressDataSource = data;
                        setMultipleDeliveryAddressDataSource();
                    } else {
                        viewModel.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, params, widget.options.includeInBrowserHistory);
                    }
                }).fail(function () {
                    viewModel.setMessage(widget.options.textErrorGettingMutipleDeliveryAddress, $.cv.css.messageTypes.error);
                });
            };

            var setMultipleDeliveryAddressDataSource = function () {
                widget.multipleDeliveryAddressDataSource = kendo.data.DataSource.create(widget.options.multipleDeliveryAddressDataSource);

                if (widget.options.autoBind) {
                    widget.multipleDeliveryAddressDataSource.fetch();
                }
                viewModel.updateMultiAddressItemList();
            };

            var setDeliveryAddressValidationDataSource = function () {
                widget.deliveryAddressValidationDataSource = kendo.data.DataSource.create(widget.options.deliveryAddressValidationDataSource);

                if (widget.options.autoBind) {
                    widget.deliveryAddressValidationDataSource.fetch();
                }
                viewModel.updateAddressValidationItemList();
            };

            var triggerChangeOnTimeout = _.debounce(function (e, dataItem) {
                var obj = $(":focus");
                if (obj && obj.prevObject && obj.prevObject.length > 0) {
                    var activeElement = $(obj.prevObject[0].activeElement);
                    $(activeElement).change();
                    if (dataItem.fieldValid(e)) {
                        viewModel.set("changeTriggered", true);
                    }
                }
            }, widget.options.multiUpdateThrottleTimeout);

            var validateSuburbWithPostCode = function (isBilling) {
                var suburbField = isBilling ? widget.options.billingSuburbFieldName : widget.options.suburbFieldName;
                var postCodeField = isBilling ? widget.options.billingPostcodeFieldName : widget.options.postcodeFieldName;
                var countryCodeField = isBilling ? widget.options.billingCountryFieldName : widget.options.countryFieldName;
                var itemList = isBilling ? viewModel.get("billingAddressItemList") : viewModel.get("addressItemList");
                var suburb, postCode, country;
                $.each(itemList, function (idx, item) {
                    if (item.fieldItem.fieldName === suburbField) {
                        suburb = item[item.fieldItem.fieldName];
                    }
                    if (item.fieldItem.fieldName === postCodeField) {
                        postCode = item[item.fieldItem.fieldName];
                    }
                    if (item.fieldItem.fieldName === countryCodeField) {
                        country = item[item.fieldItem.fieldName];
                    }
                });

                if (suburb && postCode) // only do validation when both are populated
                    viewModel.doSuburbAndPostCodeValidation(suburb, postCode, country, isBilling);
            };

            var validateSuburbWithPostCodeDebounced = _.debounce(validateSuburbWithPostCode, widget.options.surbPostCodeInputThrottleTimeout);

            var isEarlyValidationDone = {};

            var doEarlyValidation = function (fieldName) {
                isEarlyValidationDone[fieldName] = true;

                if (fieldName === widget.options.billingSuburbFieldName || fieldName === widget.options.billingPostcodeFieldName) {
                    validateSuburbWithPostCodeDebounced(true);
                }
                else if (fieldName === widget.options.suburbFieldName || fieldName === widget.options.postcodeFieldName) {
                    validateSuburbWithPostCodeDebounced(false);
                }
            };

            var doFallBackValidation = function(fieldName) {
                if (isEarlyValidationDone[fieldName] !== true) {
                    doEarlyValidation(fieldName);
                }
                delete isEarlyValidationDone[fieldName];
            };

            var _getAddressDataView = function (data, isBilling) {
                //var widget = this;
                var array = [];
                // get index item
                var item = data;

                $.each(item, function (indexFields, fieldToUse) {
                    if (!isBilling && viewModel.get("disableDeliveryAddress") && !(fieldToUse.FieldName === widget.options.guestCheckoutEmailField && widget.options.isStoreAvailPickup)) {
                        fieldToUse.Readonly = true;
                    }

                    // If going to be using suburb auto-complete (which relies on address rulesets specifying which field is actually the suburb and state (as can vary in b2b and won't
                    // be hardcoded to sodelsuburb like in b2c hence need to use addressrulesets to configure it for both b2b and b2c). We can't use custom paste binding that is always
                    // added to the cvfields for textboxes as the kendo autocomplete won't work with it, so need to set disablePaste on the fields now before they are rendered.
                    if (fieldToUse.FieldName === widget.options.addressRulesetsAssignmentsSuburbField
                         || fieldToUse.FieldName === widget.options.addressRulesetsAssignmentsPostcodeField) {
                        fieldToUse.disablePaste = true;
                    }

                    if (widget.options.isB2c
                        && (fieldToUse.FieldName === "SoBillSuburb"
                            || fieldToUse.FieldName === "SoBillPostcode")) {
                        fieldToUse.disablePaste = true;
                    }

                    fieldToUse.addKeyupEvent = widget.options.multiUpdateThrottleTimeout != 0;
                    fieldToUse.addKeydownEvent = widget.options.multiUpdateThrottleTimeout != 0;
                    var dataItem = $.cv.util.getFieldItemData(fieldToUse);

                    // Override default dataChanged event
                    // The skipValidCheckAndProcessLinkedAddress param is a hack when need to call dataChanged manually as can't trigger it automatically (e.g. after setting address 
                    // fields programmatically when the suburb lookup auto-complete is in use and has been selected. In this case won't need to do the doFallBackValidation which really 
                    // just calls validateSuburbWithPostCodeDebounced as data populated in fields from the auto-complete is sourced from the same server sider data anyway. Also, won't 
                    // do the processLinkedAddresses() as it relies on the e too but in the case of suburb auto-complete selection and population of the target fields it will already
                    // have just run via their change event binding so calling it again here is redundant.
                    dataItem.dataChanged = function (e, skipValidCheckAndProcessLinkedAddress) {

                        var isLookupField = dataItem.fieldItem.Lookup.length > 0;

                        if (((!skipValidCheckAndProcessLinkedAddress && dataItem.fieldValid(e))
                                || skipValidCheckAndProcessLinkedAddress)
                            && widget.options.updateAddressOnChanged
                            && (isLookupField || !viewModel.get("changeTriggered"))) {
                            // for cases where the doEarlyValidation is skipped, i.e. Chrome auto-fill is in use or fieldToUse.addKeyupEvent is undefined,
                            // do a fallback validation as safeguard.
                            doFallBackValidation(this.fieldItem.FieldName);

                            viewModel.set("isCountryBeingEdited", dataItem.fieldItem.FieldName === 'SoBillCountry' || dataItem.fieldItem.FieldName === 'SoDelCountry');

                            var soDelAddress = {};
                            var soBillAddress = {};
                            if (viewModel.shouldAddressBeCopied() && !(viewModel.get("deliveryAddressMode") == "Pickup" && widget.options.addressMapMode == COPYBILLINGTOADDRESS)) {
                                if (!skipValidCheckAndProcessLinkedAddress && widget.options.multiUpdateThrottleTimeout != 0) {
                                    viewModel.processLinkedAddresses(e);
                                }
                                soDelAddress = viewModel.getSoDelAddress();
                                soBillAddress = viewModel.getSoBillAddress();

                                // For lookup types, avoiding throttled versions will greatly improve response speed.
                                if (isLookupField) {
                                    viewModel._updateBillingAddress(soBillAddress, "");
                                    viewModel._updateDeliveryAddress(soDelAddress, "");
                                } else {
                                    viewModel.updateBillingAddress(soBillAddress, "");
                                    viewModel.updateDeliveryAddress(soDelAddress, "");       
                                }                             
                            } else {
                                if (!isBilling) {
                                    soDelAddress = viewModel.getSoDelAddress();
                                    if (isLookupField) {
                                        viewModel._updateDeliveryAddress(soDelAddress, "");
                                    } else {
                                        viewModel.updateDeliveryAddress(soDelAddress, "");
                                    }                                    
                                } else {
                                    soBillAddress = viewModel.getSoBillAddress();
                                    if (isLookupField) {
                                        viewModel._updateBillingAddress(soBillAddress, "");
                                    } else {
                                        viewModel.updateBillingAddress(soBillAddress, "");
                                    }                                   
                                }
                            }
                            if (!isBilling) {
                                viewModel.set("isAddressBeingEdited", false);
                            } else {
                                viewModel.set("isBillingAddressBeingEdited", false);
                            }
                        } else {
                            viewModel.set("changeTriggered", false);
                            if (!widget.options.updateAddressOnChanged) {
                                $.cv.css.trigger($.cv.css.eventnames.addressBeingEdited);
                            }
                        }
                    };
                    dataItem.dataKeydown = function (e) {
                        this._previousVal = this.get(this.fieldItem.FieldName);
                    };
                    dataItem.dataKeyup = function (e) {
                        var currVal = this.get(this.fieldItem.FieldName);
                        if (this._previousVal != undefined && this._previousVal != currVal) {
                            if (!isBilling) {
                                viewModel.set("isAddressBeingEdited", true);
                            } else {
                                viewModel.set("isBillingAddressBeingEdited", true);
                            }
                            if (!isBilling || (isBilling && viewModel.shouldAddressBeCopied() && !(viewModel.get("deliveryAddressMode") === "Pickup" && widget.options.addressMapMode === COPYBILLINGTOADDRESS))) {
                                $.cv.css.trigger($.cv.css.eventnames.addressBeingEdited);
                            }
                            viewModel.set("changeTriggered", false);
                            doEarlyValidation(this.fieldItem.FieldName);
                            triggerChangeOnTimeout(e, dataItem);
                        } else {
                            if (!isBilling) {
                                viewModel.set("isAddressBeingEdited", false);
                            } else {
                                viewModel.set("isBillingAddressBeingEdited", false);
                            }
                        }
                    };
                    array.push(dataItem);
                });

                return array;
            };

            var getMultiAddressDataView = function () {
                // check if ds is initialised
                if (!widget.multipleDeliveryAddressDataSource)
                    return [];
                var array = [];
                $.each(widget.multipleDeliveryAddressDataSource.view(), function (idx, item) {
                    // add standard commands
                    item.Index = idx;
                    item.value = item[widget.options.multipleAddressValueField];
                    item.label = item[widget.options.multipleAddressTextField];
                    array.push(item);
                });
                if (array.length > 0) {
                    var defaultMultipleAddress = {};
                    defaultMultipleAddress["label"] = widget.options.defaultMultipleAddressText;
                    defaultMultipleAddress["value"] = widget.options.defaultMultipleAddressValue;
                    array = $.merge([defaultMultipleAddress], array);
                }
                return array;
            };

            var getAddressValidationDataView = function () {
                // check if ds is initialised
                if (!widget.deliveryAddressValidationDataSource)
                    return [];
                var array = [];
                $.each(widget.deliveryAddressValidationDataSource.view(), function (idx, item) {
                    // add standard commands
                    item.Index = idx;
                    item.value = item[widget.options.addressValidationValueField];
                    item.label = item[widget.options.addressValidationTextField];
                    array.push(item);
                });
                if (array.length == 1)
                    viewModel.set("deliveryAddressValidationValue", array[0].value);
                else if (array.length > 1) {
                    var defaultAddressValidation = {};
                    defaultAddressValidation["label"] = widget.options.defaultAddressValidationText;
                    defaultAddressValidation["value"] = widget.options.defaultAddressValidationValue;
                    array = $.merge([defaultAddressValidation], array);
                }
                return array;
            };

            var buildPickListArray = function (obj) {
                var pickList = new Array();
                pickList = [];
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        var el = {};
                        el[widget.options.addressValidationValueField] = key;
                        el[widget.options.addressValidationTextField] = obj[key];
                        pickList.push(el);
                    }
                }
                return pickList;
            };

            var viewModel = kendo.observable({
                // Properties for UI elements

                name: widget.name,

                multipleDeliveryAddressDataSource: widget.options.multipleDeliveryAddressDataSource,

                deliveryAddressValidationDataSource: widget.options.deliveryAddressValidationDataSource,

                multipleDeliveryAddressValue: '',

                deliveryAddressValidationValue: '',

                hasMultipleDeliveryAddresses: widget.options.hasMultipleDeliveryAddresses,

                message: '',

                clearExistingMessages: true,

                deliveryAddressObjectKey: '',

                orderComments: widget.options.orderComments,

                deliveryInstructions: widget.options.deliveryInstructions,

                deliveryInstructionsAreReadonly: false,

                showAuthorityToLeave: widget.options.showAuthorityToLeave,

                authorityToLeave: "",

                authorityToLeaveOptionList: widget.options.authorityToLeaveOptionList,

                leaveAtAlternateLocation: widget.options.defaultLeaveAtAlternateLocation,

                authorityToLeaveFormat: widget.options.authorityToLeaveFormat,

                authorityToLeaveFormatted: function() {
                                               return kendo.format(this.get("authorityToLeaveFormat"), this.get("authorityToLeave"));
                                           },

                orderReference: widget.options.orderReference,

                orderReferenceHasError: false,

                orderReferenceErrorMsg: "",

                orderConfirmationHasError: false,

                orderConfirmationErrorMsg: "",

                attentionToHasError: false,

                attentionToErrorMsg: "",

                copyOrderConfirmation: widget.options.copyOrderConfirmation,

                soDelCountry: widget.options.soDelCountry,

                soDelPhone: widget.options.soDelPhone,

                addressFieldsExist: false,

                billingAddressFieldsExist: false,

                saveAddress: false,

                preserveGuestDetails: false,

                createUserFromGuest: widget.options.createUserFromGuest,

                additionalEventBound: false,
               
                linkDeliveryAndBilling: (widget.options.defaultLinkDeliveryAndBilling && !widget.options.useNegationLogicForLinkingAddress) || (!widget.options.defaultLinkDeliveryAndBilling && widget.options.useNegationLogicForLinkingAddress),

                isDangerousGoodsPoBoxDelivery: widget.options.isDangerousGoodsPoBoxDelivery,

                showDangerousGoodsWarningInBillAddress: function () {
                    return this.shouldAddressBeCopied() && this.get("isDangerousGoodsPoBoxDelivery");
                },

                showDangerousGoodsWarningInDelAddress: function () {
                    return !this.shouldAddressBeCopied() && this.get("isDangerousGoodsPoBoxDelivery");
                },

                isAddressListEmpty: function (list) {
                    var empty = true;
                    $.each(this.get(list), function (idx, item) {
                        if (!(this.get(item.fieldItem.fieldName) == null) && $.trim(this.get(item.fieldItem.fieldName)).length > 0) {
                            empty = false;
                            return false;
                        }
                    });
                    return empty;
                },

                isBillingAddressEmpty: function () {
                    return this.isAddressListEmpty("billingAddressItemList");
                },
                
                isDeliveryAddressEmpty: function () {
                    return this.isAddressListEmpty("addressItemList");
                },

                deliveryAndBillingMatch: function () {
                    var vm = this, match = true;
                    if (widget.options.addressMapMode === COPYBILLINGTOADDRESS || widget.options.addressMapMode === COPYADDRESSTOBILLING) {
                        var fromList = widget.options.addressMapMode == COPYBILLINGTOADDRESS ? this.get("billingAddressItemList") : this.get("addressItemList"),
                            toList = widget.options.addressMapMode == COPYBILLINGTOADDRESS ? this.get("addressItemList") : this.get("billingAddressItemList"),
                            mapList = widget.options.fieldMapFrom.split(",");
                        $.each(mapList, function (index, item) {
                            if (!isNaN(item) && fromList.length > item && toList.length > item) {
                                if (fromList[item][fromList[item].fieldItem.fieldName] != null) {
                                    if (fromList[item].fieldItem.fieldName !== widget.options.guestCheckoutEmailField && toList[item].fieldItem.fieldName !== widget.options.guestCheckoutEmailField && $.trim(toList[item].get(toList[item].fieldItem.fieldName)) !== $.trim(fromList[item][fromList[item].fieldItem.fieldName].toString())) {
                                        match = false;
                                    }
                                }
                            }
                        });
                    }
                    return match;
                },

                isDeliveryMethodsInUse: widget.options.isDeliveryMethodsInUse,

                isDeliveryMethodSetOnOrder: widget.options.isDeliveryMethodSetOnOrder,

                showAddressView: function () {
                    var vm = this;

                    if (vm.get("isDeliveryMethodsInUse") && !vm.get("isDeliveryMethodSetOnOrder")) {
                        return false;
                    }

                    return true;
                },


                preserveAddressData: false,

                shouldAddressBeCopied: function () {
                    var copyAddress = false;
                    if (widget.options.useNegationLogicForLinkingAddress) {
                        copyAddress = !this.get("linkDeliveryAndBilling");
                    } else {
                        copyAddress = this.get("linkDeliveryAndBilling");
                    }
                    return copyAddress;
                },

                copyingAddressFields: false,

                addressItemList: [],

                billingAddressItemList: [],

                lookupSelected: false,

                pickupAddress: {},

                // Used in the suburb auto-complete selection event to know that it has actually fired as it always then followed by firing of the 
                // close event. This allows to determine if the close event fires without a real select event having taken place first as can occur 
                // if user just types text into the input but then tabs or clicks out without selecting anything from the auto-complete suggestions.
                isSuburbAutoCompleteSelectStarted: false,

                setAddressDefaults: function () {
                    if (!widget.options.showCountry || !widget.options.saveAddressDownToUser)
                        return;

                    var vm = this;
                    var addressItems = vm.get("addressItemList");
    
                    $.each(addressItems, function (index, addressItem) {
                        var fieldItem = addressItem.get("fieldItem");
                        
                        switch (fieldItem.get("fieldName")) {
                            case "SoDelCountry":
                                //Check to see if we have a value for SoDelCountry for the 
                                //delivery address and if not that we have some country values to 
                                //work with.
                                if ($.cv.util.hasValue(fieldItem.get("Value")) && fieldItem.Lookup.length === 1) {
                                    //If there is only one option for the country then save this information back to the user.
                                    //If the user happens to be a first time user then by default this is not saved back
                                    //unless the user changes other fields. 
                                    viewModel.saveBillingAddressToUser();
                                    viewModel.saveDeliveryAddressToUser();                                   
                                }

                                break;
                        }

                    });
                },

                // If the StoreAvailaibilityClickAndCollect functionality is in use then the user can have chosen either Pickup or Delivery on the cart page
                // (cant't select it at checkout page!). If Pickup was selected the Delivery Details are already set to that of the store and this needs to
                // be shown (for Pickup location) when the widget is used for Order Summary Review at checkout. In this case, as unlike normal pickup selection
                // which would have happened via the freight options on checkoutpage and would have set the pickup address into local storage for use as
                // datasource in kendotemplate showing those details, this won't have happened, so need to fetch the pickup address using this.
                getPickupAddressDataSource: function () {
                    var vm = this;

                    if (!widget.options.isStoreAvailPickup
                        || widget.options.warehouseIfIsStoreAvailPickup.length === 0) {
                        return this.get("pickupAddress");
                    }

                    // Get the address for order that the widget is using. It could be either the users current 
                    // order or some other order if have a orderNoOverride set e.g. order searching, quotes etc.
                    var pickupAddress = widget.options.orderNoOverride === 0
                                            ? $.cv.css.localGetcurrentPickupAddress()
                                            : $.cv.css.localGetSelectedOrderPickupAddress();

                    // If happen to already have it in local storage then just use that
                    if (pickupAddress != null && pickupAddress.WarehouseCode === widget.options.warehouseIfIsStoreAvailPickup) {
                        vm.set("pickupAddress", pickupAddress);
                        return vm.get("pickupAddress");
                    }

                    // Otherwise will need to fetch it from server and set in local storage
                    var p = $.cv.css.storeLocator.getWarehouse({ warehouseCode: widget.options.warehouseIfIsStoreAvailPickup });
                    p.done(function (data) {
                        if (data.data && data.data.length ===1) {
                            pickupAddress = data.data[0];
                            $.cv.css.localSetcurrentPickupAddress(pickupAddress);
                            vm.set("pickupAddress", pickupAddress);
                            return vm.get("pickupAddress");
                        } else {
                            return vm.get("pickupAddress");
                        }
                    });

                    return p;
                },

                // Used for temp storing current entered address fields when user changes to Pickup option from Delivery so can 
                // restore them back if they then switch back to Delivery as choosing Pickup overrides the fields on the order.
                tempAddressItemList: [],

                showAttentionToUserDetails: widget.options.showAttentionToUserDetails,

                attentionUserName: widget.options.attentionUserName,

                attentionPhoneNumber: widget.options.attentionPhoneNumber,

                showPickupDeliveryControls: widget.options.showPickupDeliveryControls,

                showDeliveryAddress: function() {
                     return this.get("deliveryAddressMode") === "Delivery";
                },

                showBillingAddress: function() {
                    return this.get("deliveryAddressMode") === "Delivery"
                            || (this.get("deliveryAddressMode") === "Pickup"
                                && widget.options.showBillingAddressOnPickup);
                },

                deliveryAddressMode: widget.options.deliveryAddressMode,

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
                    DELIVERY ADDRESS
                \*------------------------------------*/

                getSoDelAddress: function () {
                    var vm = this;
                    var newAddressFieldInfo = {};
                    $.each(vm.get("addressItemList"), function (idx, item) {
                        newAddressFieldInfo[item.fieldItem.fieldName] = this.get(item.fieldItem.fieldName) == null ? "" : $.trim(this.get(item.fieldItem.fieldName));
                    });

                    var soDelAddress = {
                        SoDelCountry: this.get("soDelCountry"),
                        SoDelPhone: this.get("soDelPhone"),
                        updatedAddressDetails: newAddressFieldInfo
                    };
                    return (soDelAddress);
                },

                clearDeliveryAddress: function (noThrottle) {
                    var vm = this,
                        deliveryAddressMode = vm.get("deliveryAddressMode");

                    noThrottle = typeof noThrottle != "undefined" ? noThrottle : true;
                    $.each(this.get("addressItemList"), function (idx, item) {
                        if (item.fieldItem.fieldName !== widget.options.guestCheckoutEmailField && item.fieldItem.fieldName !== "SoDelCountry") {
                            this.set(item.fieldItem.fieldName, "");
                        }
                    });
                    vm.set("soDelCountry", "");
                    vm.set("soDelPhone", "");
                    widget.trigger(DATABOUND, true);
                    return vm.setDeliveryAddress(deliveryAddressMode === "Delivery", noThrottle);
                },

                // Stores each of the values currently in the address item list (i.e what the user can set for delivery details)
                // into a temporary store so that can restore them if required. e.g. If uses switches modes from Delivery
                // to Pickup these would be lost as the order would have the fields overrwritten with new Pickup values for
                // store / warehouse location and if they swap back to Delivery, don't want to make them re-enter everything again.
                storeIntoTempAddressItemList: function () {
                    var vm = this,
                        tempAddressFieldInfo = [],
                        gotSoDelCountry = false,
                        gotSoDelPhone = false,
                        fldNameSoDelCountry = "soDelCountry",
                        fldNameSoDelPhone = "soDelPhone";

                    // Go through each of the address items
                    $.each(vm.get("addressItemList"), function (idx, item) {
                        var currentFieldName = item.fieldItem.fieldName;

                        if (currentFieldName.toLowerCase() === fldNameSoDelCountry.toLowerCase()) {
                            gotSoDelCountry = true;
                        } else if (currentFieldName.toLowerCase() === fldNameSoDelCountry.toLowerCase()) {
                            gotSoDelPhone = true;
                        }

                        var elementry = {},
                            theValue = this.get(currentFieldName);

                        elementry.fieldName = currentFieldName;
                        elementry.fieldValue = theValue == null ? "" : theValue;
                        tempAddressFieldInfo.push(elementry);
                    });

                    // Now do special handling if the SoDelCountry and SoDelPhone fields weren't in the list
                    if (!gotSoDelCountry) {
                        var elementryCountry = {},
                            theValueCountry = vm.get(fldNameSoDelCountry);

                        elementryCountry.fieldName = fldNameSoDelCountry;
                        elementryCountry.fieldValue = theValueCountry == null ? "" : theValueCountry;
                        tempAddressFieldInfo.push(elementryCountry);
                    }

                    if (!gotSoDelPhone) {
                        var elementryPhone = {},
                            theValuePhone = vm.get(fldNameSoDelPhone);

                        elementryPhone.fieldName = fldNameSoDelPhone;
                        elementryPhone.fieldValue = theValuePhone == null ? "" : theValuePhone;
                        tempAddressFieldInfo.push(elementryPhone);
                    }

                    vm.set("tempAddressItemList", tempAddressFieldInfo);
                },

                // Retrieves each of the values currently in the temporary store of address item list (i.e what the user may have previously 
                // entered for delivery details) and sets them back into the actual address item list fields. e.g. If user switches modes from Delivery
                // to Pickup initially would have store them into the temporaty storage so these would not have been lost, as the order would have had 
                // the fields overrwritten with new Pickup values for the store / warehouse location, now when they reselect Delivery mode instead of
                // Pickup we atre here swapping the temporary stored field values back to the Delivery adress item list fields so as to not force them 
                // to re-enter everything again.
                restoreFromTempAddressItemList: function () {
                    var vm = this,
                        tempAddressFieldInfo = vm.get("tempAddressItemList");

                    if (!tempAddressFieldInfo || tempAddressFieldInfo.length === 0) {
                        return false;
                    }

                    var gotSoDelCountry = false,
                        gotSoDelPhone = false,
                        atLeastOne = false,
                        fldNameSoDelCountry = "soDelCountry",
                        fldNameSoDelPhone = "soDelPhone";

                    // Go through each of the items in the address item list to which we need to restore
                    $.each(vm.get("addressItemList"), function (idx, item) {
                        var that = this;
                        var currentFieldName = item.fieldItem.fieldName;

                        // Now go through each of the items in our temporary storage to locate it's match and if find it set it back to the target
                        $.each(vm.get("tempAddressItemList"), function (idy, tempItem) {
                            if (tempItem.fieldName === currentFieldName && tempItem.fieldName !== widget.options.guestCheckoutEmailField) {
                                item.fieldItem.Value = tempItem.fieldValue;
                                that.set(currentFieldName, tempItem.fieldValue);

                                if (currentFieldName.toLowerCase() === fldNameSoDelCountry.toLowerCase()) {
                                    gotSoDelCountry = true;
                                } else if (currentFieldName.toLowerCase() === fldNameSoDelCountry.toLowerCase()) {
                                    gotSoDelPhone = true;
                                } 

                                atLeastOne = true;
                                return false; // break as found our target
                            }
                        });
                    });

                    if (!gotSoDelCountry) {
                        $.each(vm.get("tempAddressItemList"), function (idx, tempItem) {
                            if (tempItem.fieldName === fldNameSoDelCountry) {
                                vm.set(fldNameSoDelCountry, tempItem.fieldValue);
                                return false; // break as found our target
                            }
                        });
                    }

                    if (!gotSoDelPhone) {
                        $.each(vm.get("tempAddressItemList"), function (idx, tempItem) {
                            if (tempItem.fieldName === fldNameSoDelPhone) {
                                vm.set(fldNameSoDelPhone, tempItem.fieldValue);
                                return false; // break as found our target
                            }
                        });
                    }

                    // Clear the temp storage list
                    vm.set("tempAddressItemList", []);
                    return atLeastOne;
                },

                /*------------------------------------*\
                    ADDRESS LOOKUP
                \*------------------------------------*/

                linkDeliveryAndBillingStateChanged: function (e) {
                    var value = viewModel.get("linkDeliveryAndBilling") && !$(e.currentTarget).prop("checked");
                    viewModel.set("isBillingAndDeliveryAddressTheSame", value);
                },

                isBillingAndDeliveryAddressTheSame: (widget.options.defaultLinkDeliveryAndBilling && !widget.options.useNegationLogicForLinkingAddress) || (!widget.options.defaultLinkDeliveryAndBilling && widget.options.useNegationLogicForLinkingAddress),

                billingAddressId: "",

                deliveryAddressId: "",

                addressId: function () {
                    if ($.cv.util.isNullOrWhitespace(viewModel.get("billingAddressId"))
                        && $.cv.util.isNullOrWhitespace(viewModel.get("deliveryAddressId"))) {
                        return "";
                    }
                    var addressId = "B:" + viewModel.get("billingAddressId");
                    if (viewModel.get("isBillingAndDeliveryAddressTheSame")) {
                        addressId = addressId + ",D:" + viewModel.get("billingAddressId");
                    } else {
                        addressId = addressId + ",D:" + viewModel.get("deliveryAddressId");
                    }
                    return addressId;
                },

                addressLookupSelected: function(data) {
                    if ($.cv.util.hasValue(data) && $.cv.util.hasValue(data.Address) && $.cv.util.hasValue(data.Type)) {
                        viewModel.set("lookupSelected", true);
                        viewModel.copyLookupFieldValues(data, false);
                        viewModel.set("lookupSelected", false);

                        if (data.Type === "Billing") {
                            var soBillAddress = viewModel.getSoBillAddress();
                            viewModel.updateBillingAddress(soBillAddress, "");
                            if (viewModel.shouldAddressBeCopied()) {
                                viewModel.updateDeliveryAddress(viewModel.getSoDelAddress(), "");
                            }
                        } else {
                            viewModel.updateDeliveryAddress(viewModel.getSoDelAddress(), "");
                        }
                    }
                },

                addressLookupValueEdited: function (data) {
                    if ($.cv.util.hasValue(data) && $.cv.util.hasValue(data.Address) && $.cv.util.hasValue(data.Type)) {
                        viewModel.copyLookupFieldValues(data, true);
                    } else if ($.cv.util.hasValue(data) && $.cv.util.hasValue(data.IsEmpty) && $.cv.util.hasValue(data.Type) && data.IsEmpty) {
                        viewModel.clearAddressFields(data);
                    }

                    var fields = data.Type === "Billing" ? viewModel.get("billingAddressItemList") : viewModel.get("addressItemList");
                    _.each(data.Address, function (addressItem) {
                        var addressItemFields = addressItem.Field ? addressItem.Field.split(",") : [];

                        _.each(fields, function (field) {
                            if (addressItemFields.indexOf(field.fieldItem.FieldName) !== -1) {
                                viewModel.changeFieldEnabledState(field, true);
                            }
                        });
                    });
                },

                clearAddressFields: function(data) {
                    var emptyAddress = viewModel.get("emptyBillingAddressFields");
                    if (data.Type === "Delivery") {
                        emptyAddress = viewModel.get("emptyDeliveryAddressFields");
                    }
                    data.Address = emptyAddress;
                    viewModel.copyLookupFieldValues(data, true);
                },

                copyLookupFieldValues: function (data, enable) {
                    var addressIdKey = "AddressId";
                    var fields = data.Type === "Billing" ? viewModel.get("billingAddressItemList") : viewModel.get("addressItemList");
                    var fieldName = data.Type.charAt(0).toLowerCase() + data.Type.slice(1) + addressIdKey;

                    if ($.cv.util.hasValue(viewModel[fieldName])) {
                        if ($.cv.util.isNullOrWhitespace(data.Address) || $.cv.util.isNullOrWhitespace(data.Address[addressIdKey])) {
                            viewModel.set(fieldName, "");
                            return;
                        } else if (data.Address[addressIdKey] === "-1") {
                            viewModel.set(fieldName, "");
                        } else {
                            viewModel.set(fieldName, data.Address[addressIdKey]);
                        }
                    }

                    _.each(_.keys(data.Address), function (key) {
                        _.each(fields, function (field) {
                            var splitKeys = key.split(",");
                            _.each(splitKeys, function(splitKey) {
                                if (field.fieldItem.FieldName === splitKey) {
                                    field.set(splitKey, data.Address[splitKey]);
                                    viewModel.changeFieldEnabledState(field, enable);
                                }
                            });
                        });
                    });
                },

                changeFieldEnabledState: function (field, enabled) {
                    field.set(field.fieldItem.FieldName + "_isEnabled", enabled);
                },

                /*------------------------------------*\
                    BILLING ADDRESS
                \*------------------------------------*/

                getSoBillAddress: function () {
                    var newBillAddressFieldInfo = {};
                    $.each(this.get("billingAddressItemList"), function (idx, item) {
                        newBillAddressFieldInfo[item.fieldItem.fieldName] = this.get(item.fieldItem.fieldName) == null ? "" : $.trim(this.get(item.fieldItem.fieldName));
                    });
                    var soBillAddress = {
                        updatedBillingAddressDetails: newBillAddressFieldInfo
                    };
                    return (soBillAddress);
                },

                clearBillingAddress: function () {
                    $.each(this.get("billingAddressItemList"), function (idx, item) {
                        this.set(item.fieldItem.fieldName, "");
                    });
                    this.setBillingAddress();
                },

                // UI Element state
                enterOrderComments: widget.options.enterOrderComments,

                disableDeliveryAddress: widget.options.disableDeliveryAddress,

                disableBillingAddress: widget.options.disableBillingAddress,

                showDeliveryInstructions: widget.options.showDeliveryInstructions,

                forceOrderReference: widget.options.forceOrderReference,

                allowCopyOrderConfirmation: widget.options.allowCopyOrderConfirmation,

                copyOrderConfirmationMandatory: widget.options.copyOrderConfirmationMandatory,

                isInitialLoad: true,

                isSuburbAndPostCodeValid: widget.options.disableDeliveryAddress ? true : !widget.options.enableSuburbAndPostcodeValidation,
                isBillingSuburbAndPostCodeValid: widget.options.disableBillingAddress ? true : !widget.options.enableSuburbAndPostcodeValidation,

                deliveryAddressErrorMsg: "",

                productDeliveryRestrictionsErrorMsg: "",

                orderCommentsErrorMsg: "",

                deliveryInstructionsErrorMsg: "",

                authorityToLeaveErrorMsg: "",

                addressValidated: false,

                deliveryMethodDisableAddressEdit: false,

                passedValidation: false,

                useAddressLookup: widget.options.useAddressLookup,

                displayValuesFromSeq: widget.options.displayValuesFromSeq.toString(),

                addressObjectMapping: widget.options.addressObjectMapping,

                billingAddressLookupMandatoryMessage: widget.options.billingAddressLookupMandatoryMessage,

                deliveryAddressLookupMandatoryMessage: widget.options.deliveryAddressLookupMandatoryMessage,

                triggerMessages: widget.options.triggerMessages,

                hideAuthorityToLeave: function () {
                    var vm = this;

                    if (vm.get("showAuthorityToLeave") === true && vm.get("deliveryMethodDisableAddressEdit") === false) {
                        return false;
                    }

                    return true;
                },

                // functions for UI events

                localdeliveryAddressChanged: function (opts) {
                    if (opts && $.cv.util.hasValue(opts.orderNoOverride)) {
                        widget.options.orderNoOverride = opts.orderNoOverride;

                        init(true);
                        viewModel.setLocalDeliveryAddress();
                    }

                    // Get the address for order that the widget is using. It could be either the users current 
                    // order or some other order if have a orderNoOverride set e.g. order searching, quotes etc.
                    var address = widget.options.orderNoOverride === 0
                                ? $.cv.css.localGetcurrentDeliveryAddress()
                                : $.cv.css.localGetSelectedOrderDeliveryAddress();

                    if (address != null) {
                        localProcessAddressData(address);
                    }
                },

                _addressBeingEdited: function (data) {
                    var vm = this;
                    if (widget.options.usingAddressValidation) {
                        vm.set("addressValidated", false);
                        vm._setIsProcessing(true);
                    }
                },

                _validationUpdated: function () {
                    var vm = this;
                    vm._setIsProcessing(false);
                },

                _setIsProcessing: function (isProcessing) {
                    var vm = this;
                    vm.set("isProcessing", isProcessing);
                    if (!isProcessing) {
                        goValidateAddress(widget.options.addressValidationMode);
                    }
                },

                // 
                // Depending of the supplied isDelivery param gets from this widget's addressItemList or billingAddressItemList, either the value assigned to the 
                // SoDelCountry or SoBillCountry. Note that the field may not actually be present. In B2B SoDelCountry is not displayed , nor is billing fields used. 
                // In B2C SoDelCountry can be configured to be shown and billing fields also.
                //
                _getAddressItemCountry: function (isDelivery) {
                    var vm = this;

                    return this._getAddressItemValue(isDelivery
                           ? widget.options.countryFieldName // defaults to SoDelCountry unless address rulesets change it
                           : widget.options.billingCountryFieldName, // defaults to  SoBillCountry unless address rulesets change it
                       vm.get(isDelivery
                           ? "addressItemList"
                           : "billingAddressItemList"));
                },

                // 
                // Depending of the supplied isDelivery param gets from this widget's addressItemList or billingAddressItemList, either the value assigned to the 
                // field that holds the delivery or billing suburb. Note in B2B billing fields aren't used. 
                //
                _getAddressItemSuburb: function (isDelivery) {
                    var vm = this;

                    return this._getAddressItemValue(isDelivery
                           ? widget.options.suburbFieldName // defaults to SoDelSuburb unless address rulesets change it
                           : widget.options.billingSuburbFieldName, // defaults to  SoBillSuburb unless address rulesets change it
                       vm.get(isDelivery
                           ? "addressItemList"
                           : "billingAddressItemList"));
                },
                
                // 
                // Depending of the supplied isDelivery param gets from this widget's addressItemList or billingAddressItemList, either the value assigned to the 
                // field that holds the delivery or billing Postcode. Note in B2B billing fields aren't used. 
                //
                _getAddressItemPostcode: function (isDelivery) {
                    var vm = this;

                    return this._getAddressItemValue(isDelivery
                            ? widget.options.postcodeFieldName 
                            : widget.options.billingPostcodeFieldName, 
                        vm.get(isDelivery
                            ? "addressItemList"
                            : "billingAddressItemList"));
                },

                //
                // Generic function to fetch the view model field value currently stored in the specified fieldToCheck in the supplied addrList
                //
                _getAddressItemValue: function (fieldToCheck, addrList) {
                    var val = "";

                    _.each(addrList,
                        function (item) {
                            if (item.fieldItem.FieldName === fieldToCheck) {  
                                val = item.get(item.fieldItem.FieldName);
                            }
                        });

                    return val;
                },

                deliveryMethodSetOnOrder: function (msg) {
                    // only run this method if the event trigger was forced by this widget or it was generally triggered by the delivery methods widget
                    if ($.cv.util.hasValue(msg.widgetName) && msg.widgetName !== widget.name) {
                        return;
                    }
                    var vm = this;
                    var deliveryAddress = undefined;
                    var disableAddressEdit = undefined;
                    var dataInitialisingPromise = {};

                    if (vm.get("addressItemList").length === 0) {
                        dataInitialisingPromise = loadSoDelAddress();
                    }

                    if (msg && msg.deliveryAddressInfo) {
                        deliveryAddress = msg.deliveryAddressInfo.deliveryAddress;
                        disableAddressEdit = msg.deliveryAddressInfo.disableAddressEdit;

                        $.when(dataInitialisingPromise).done(function () {
                            // NOTE(jwwishart) if address rulesets are on (BPD for example) we only have 5 fields. These checks
                            // guard against errors when trying to assign to addressItemList.
                            if (vm.addressItemList.length > 0) vm.addressItemList[0].set("SoDelAddr1",    deliveryAddress.deliveryAddress1);
                            if (vm.addressItemList.length > 1) vm.addressItemList[1].set("SoDelAddr2",    deliveryAddress.deliveryAddress2);
                            if (vm.addressItemList.length > 2) vm.addressItemList[2].set("SoDelAddr3",    deliveryAddress.deliveryAddress3);
                            if (vm.addressItemList.length > 3) vm.addressItemList[3].set("SoDelAddr4",    deliveryAddress.deliveryAddress4);
                            if (vm.addressItemList.length > 4) vm.addressItemList[4].set("SoDelAddr5",    deliveryAddress.deliveryAddress5);
                            if (vm.addressItemList.length > 5) vm.addressItemList[5].set("SoDelAddr6",    deliveryAddress.deliveryAddress6);
                            if (vm.addressItemList.length > 6) vm.addressItemList[6].set("SoDelSuburb",   deliveryAddress.deliverySuburb);
                            if (vm.addressItemList.length > 7) vm.addressItemList[7].set("SoDelState",    deliveryAddress.deliveryState);
                            if (vm.addressItemList.length > 8) vm.addressItemList[8].set("SoDelPostcode", deliveryAddress.deliveryPostCode);

                            vm.set("deliveryMethodDisableAddressEdit", disableAddressEdit);

                            _.each(vm.addressItemList, function (item) {
                                item.set("Readonly", disableAddressEdit);
                                item.fieldItem.set("Readonly", disableAddressEdit);
                            });

                            vm.set("deliveryInstructionsAreReadonly", disableAddressEdit);
                            
                            var isbillingcopied = false;

                            if (widget.options.updateAddressOnChanged && !vm.get("changeTriggered")) {
                                var soDelAddress = {};

                                // Only process the billing fields if they are actually in use i.e. in b2c only, b2b does not show or use billing fields
                                if (widget.options.isB2c && vm.shouldAddressBeCopied() && !(vm.get("deliveryAddressMode") === "Pickup" && widget.options.addressMapMode === COPYBILLINGTOADDRESS)) {
                                    isbillingcopied = true;
                                    var soBillAddress = {};

                                    if (widget.options.multiUpdateThrottleTimeout !== 0) {
                                        vm.processLinkedAddresses(e);
                                    }
                                    soDelAddress = vm.getSoDelAddress();
                                    soBillAddress = vm.getSoBillAddress();
                                    vm.updateDeliveryAddress(soDelAddress, "");
                                    vm.updateBillingAddress(soBillAddress, "");
                                } else {
                                    soDelAddress = vm.getSoDelAddress();
                                    vm.updateDeliveryAddress(soDelAddress, "");
                                }

                                vm.set("isAddressBeingEdited", false);
                            } else {
                                vm.set("changeTriggered", false);
                            }

                            // Validate Suburb postcode match if set to do so.
                            var d1 = vm.validateSuburbAndPostCodeInternal(vm._getAddressItemSuburb(true),
                                vm._getAddressItemPostcode(true),
                                vm._getAddressItemCountry(true), // If comes back empty that's ok as country not shown so server side will handle this here.
                                false /* delivery */);

                            // Only process the billing fields if they are actually in use and copied across to them i.e. in b2c only, b2b does not show or use billing fields
                            var d2 = isbillingcopied
                                ? vm.validateSuburbAndPostCodeInternal(vm._getAddressItemSuburb(false),
                                    vm._getAddressItemPostcode(false),
                                    vm._getAddressItemCountry(false), // If comes back empty that's ok as country not shown so server side will handle this here.
                                    true  /* billing */)
                                : {};

                            $.when(d1, d2).done(function () {
                                vm.validateInputFields(true);
                            });

                            vm.set("isDeliveryMethodSetOnOrder", true);
                        });
                    }
                },

                deliveryMethodClearedFromOrder: function (msg) {
                    // only run this method if the event trigger was forced by this widget or it was generally triggered by the delivery methods widget
                    if ($.cv.util.hasValue(msg.widgetName) && msg.widgetName !== widget.name) {
                        return;
                    }
                    var vm = this;
                    var deliveryAddress = undefined;
                    var disableAddressEdit = undefined;

                    if (msg && msg.deliveryAddressInfo && vm.get("addressItemList").length > 0) {
                        deliveryAddress = msg.deliveryAddressInfo.deliveryAddress;
                        disableAddressEdit = msg.deliveryAddressInfo.disableAddressEdit;

                        if (vm.addressItemList.length > 0) vm.addressItemList[0].set("SoDelAddr1", deliveryAddress.deliveryAddress1);
                        if (vm.addressItemList.length > 1) vm.addressItemList[1].set("SoDelAddr2", deliveryAddress.deliveryAddress2);
                        if (vm.addressItemList.length > 2) vm.addressItemList[2].set("SoDelAddr3", deliveryAddress.deliveryAddress3);
                        if (vm.addressItemList.length > 3) vm.addressItemList[3].set("SoDelAddr4", deliveryAddress.deliveryAddress4);
                        if (vm.addressItemList.length > 4) vm.addressItemList[4].set("SoDelAddr5", deliveryAddress.deliveryAddress5);
                        if (vm.addressItemList.length > 5) vm.addressItemList[5].set("SoDelAddr6", deliveryAddress.deliveryAddress6);
                        if (vm.addressItemList.length > 6) vm.addressItemList[6].set("SoDelSuburb", deliveryAddress.deliverySuburb);
                        if (vm.addressItemList.length > 7) vm.addressItemList[7].set("SoDelState", deliveryAddress.deliveryState);
                        if (vm.addressItemList.length > 8) vm.addressItemList[8].set("SoDelPostcode", deliveryAddress.deliveryPostCode);

                        _.each(vm.addressItemList, function (item) {
                            item.set("Readonly", disableAddressEdit);
                        });

                        vm.set("deliveryInstructionsAreReadonly", disableAddressEdit);

                        if (widget.options.updateAddressOnChanged && !viewModel.get("changeTriggered")) {
                            var soDelAddress = {};
                            var soBillAddress = {};
                            if (viewModel.shouldAddressBeCopied() && !(viewModel.get("deliveryAddressMode") === "Pickup" && widget.options.addressMapMode === COPYBILLINGTOADDRESS)) {
                                if (widget.options.multiUpdateThrottleTimeout !== 0) {
                                    viewModel.processLinkedAddresses(e);
                                }
                                soDelAddress = viewModel.getSoDelAddress();
                                soBillAddress = viewModel.getSoBillAddress();
                                viewModel.updateDeliveryAddress(soDelAddress, "");
                                viewModel.updateBillingAddress(soBillAddress, "");
                            } else {
                                soDelAddress = viewModel.getSoDelAddress();
                                viewModel.updateDeliveryAddress(soDelAddress, "");
                            }

                            viewModel.set("isAddressBeingEdited", false);
                        } else {
                            viewModel.set("changeTriggered", false);
                        }

                        vm.set("isDeliveryMethodSetOnOrder", false);
                    }
                },


                addressWasValidated: function() {
                    var vm = this;
                    return vm.addressValidated;
                },

                updateMultiAddressItemList: function () {
                    this.set("multiAddressItemList", getMultiAddressDataView());
                    widget.trigger(MULTIADDRESSRENDERED);
                },

                multiAddressItemList: getMultiAddressDataView(),

                updateAddressValidationItemList: function () {
                    this.set("deliveryAddressValidationValue", "");
                    var data = getAddressValidationDataView();
                    this.set("addressValidationItemList", data);
                    $.cv.css.trigger($.cv.css.eventnames.addressValidationUpdated, { valid: data.length === 0 });
                    if (widget.options.usingAddressValidation && this.get("isSettingAddresses")) {
                        return;
                    }
                    widget.trigger(ADDRESSVALIDATIONRENDERED);
                },

                addressValidationItemList: getAddressValidationDataView(),

                hasAddressValidationPickList: function () {
                    return this.get("addressValidationItemList").length > 0;
                },

                hasAddressValidationVerifiedOptions: function () {
                    var count = 0, addressValidationItemList = this.get("addressValidationItemList");
                    $.each(addressValidationItemList, function (idx, item) {
                        if (item.value != "UnverifiedUseMyEnteredAddressKey")
                            count++;
                    });
                    return count > 0;
                },

                multiAddressItemSelected: function () {
                    var _this = this;
                    if (this.get("multipleDeliveryAddressValue") == '') {
                        //viewModel.setMessage(widget.options.textEnterNumeric, $.cv.css.messageTypes.error);
                    } else {
                        _this.clearMessage();
                        _this.set("deliveryAddressErrorMsg", "");
                        var d1 = $.cv.css.deliveryAddress.setDeliveryAddressByName({ deliveryAddressName: this.get("multipleDeliveryAddressValue") });
                        $.when(d1).done(function (msg) {
                            var data = msg.data;
                            if (!msg.sessionHasTimedOut) {
                                if (!msg.errorMessage || msg.errorMessage.length === 0) {
                                    processAddressData(data);

                                    // Make sure that in case the delivery address has changed due to address selection form list, the details fields will have been altered 
                                    // and this appears not to trigger the relevant address updated events like updateDeliveryAddress() so freight wouldn't get set too.
                                    if (widget.options.updateAddressOnChanged && !viewModel.get("changeTriggered")) {
                                        var soDelAddress = {};
                                        var soBillAddress = {};
                                        if (viewModel.shouldAddressBeCopied() && !(viewModel.get("deliveryAddressMode") === "Pickup" && widget.options.addressMapMode === COPYBILLINGTOADDRESS)) {
                                            if (widget.options.multiUpdateThrottleTimeout !== 0) {
                                                viewModel.processLinkedAddresses(e);
                                            }
                                            soDelAddress = viewModel.getSoDelAddress();
                                            soBillAddress = viewModel.getSoBillAddress();
                                            viewModel.updateDeliveryAddress(soDelAddress, "");
                                            viewModel.updateBillingAddress(soBillAddress, "");                                                                                        
                                        } else {
                                            soDelAddress = viewModel.getSoDelAddress();
                                            viewModel.updateDeliveryAddress(soDelAddress, "");
                                        }

                                        viewModel.set("isAddressBeingEdited", false);
                                    } else {
                                        viewModel.set("changeTriggered", false);
                                    }

                                    if (!data.success) {
                                        if (data.message !== "") {
                                            _this.setMessage(data.message, $.cv.css.messageTypes.error);
                                            _this.set("deliveryAddressErrorMsg", data.message);
                                            
                                        }
                                    }
                                } else {
                                    _this.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                                    _this.set("deliveryAddressErrorMsg", data.message);
                                }
                            } else {
                                viewModel.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, params, widget.options.includeInBrowserHistory);
                            }
                        }).fail(function () {
                            _this.setMessage(widget.options.textErrorUpdatingDeliveryAddress, $.cv.css.messageTypes.error);
                            _this.set("deliveryAddressErrorMsg", widget.options.textErrorUpdatingDeliveryAddress);
                        });
                    }
                },

                addressValidationItemSelected: function () {
                    var _this = this;
                    var moniker = _this.get("deliveryAddressValidationValue");
                    _this.set("preserveGuestDetails", true);
                    opts = { selectAddressMoniker: moniker, preserveGuestDetails: _this.get("preserveGuestDetails") };
                    opts.validateMissingFields = false;
                    var d1 = $.cv.css.deliveryAddress.updateDeliveryAddressForCurrentOrder(opts);
                    $.when(d1).done(function (msg) {
                        var data = msg.data;
                        if (!msg.sessionHasTimedOut) {
                            if (!msg.errorMessage || msg.errorMessage.length == 0) {
                                if (data.result) {
                                    _this.setMessage(widget.options.textDeliveryAddressUpdatedSuccess, $.cv.css.messageTypes.success);
                                    var load = loadSoDelAddress(widget.options.usingAddressValidation && _this.shouldAddressBeCopied() && widget.options.addressMapMode === COPYBILLINGTOADDRESS);
                                    if (_this.get("saveAddress")) {
                                        _this.saveDeliveryAddress();
                                    }
                                    load.done(function() {
                                        if (widget.options.saveAddressDownToUser) {
                                            _this.saveDeliveryAddressToUser();
                                        }
                                    });
                                    widget.trigger(ADDRESSVALIDATIONOPTIONSELECTED);
                                    $.cv.css.trigger($.cv.css.eventnames.addressValidationUpdated, { valid: true });
                                    $.cv.css.trigger($.cv.css.eventnames.addressChanged, { deliveryAddressMode: viewModel.get("deliveryAddressMode") });
                                } else {
                                    if (data.message != "")
                                        _this.setMessage(data.message, $.cv.css.messageTypes.error);
                                }
                            } else {
                                _this.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                                $.cv.css.trigger($.cv.css.eventnames.addressValidationUpdated, { valid: false });
                            }
                        } else {
                            viewModel.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, params, widget.options.includeInBrowserHistory);
                        }
                    }).fail(function () {
                        _this.setMessage(widget.options.textErrorUpdatingDeliveryAddress, $.cv.css.messageTypes.error);
                    });
                },

                clearMessage: function (messageGroup, triggerMessagesOverride) {
                    var vm = this;
                    vm.set("message", "");
                    if (triggerMessagesOverride ||
                        widget.options.triggerMessages ||
                        widget.options.triggerErrorMessages ||
                        widget.options.triggerExternalValidationMessages) {
                        $.cv.util.clearNotifications(
                        {
                            viewModel: vm,
                            messageGroup: messageGroup
                        },
                        triggerMessagesOverride);
                    }
                },

                setMessage: function (message, type, triggerMessageOverride, messageGroup) {
                    var triggerMessages = typeof triggerMessageOverride !== 'undefined' ? triggerMessageOverride : widget.options.triggerMessages;
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: triggerMessages,
                        messageGroup: messageGroup,
                        source: widget.name
                    });
                },

                validCustomerReference: function (showMessage) {
                    var vm = this;
                    vm.clearMessage("validCustomerReference", true);
                    var valid = ((vm.get("forceOrderReference") && vm.get("orderReference").length) > 0 || !vm.get("forceOrderReference"));
                    if (showMessage && !valid)
                        vm.setMessage(widget.options.textOrderReferenceMandatory, $.cv.css.messageTypes.error, true, "validCustomerReference");
                    if (!valid) {
                        vm.set("orderReferenceHasError", widget.options.inputErrorClass);
                        vm.set("orderReferenceErrorMsg", widget.options.textOrderReferenceMandatory);
                    } else {
                        vm.set("orderReferenceHasError", "");
                        vm.set("orderReferenceErrorMsg", "");
                    }
                    return valid;
                },

                setCustomerReference: function () {
                    var vm = this;
                    if (!vm.validCustomerReference(true))
                        return;
                    else {
                        vm.updateDeliveryAddressField({ SoCustReference: this.get("orderReference") },
                            widget.options.showCustomerReferenceUpdatedMessage
                                ? widget.options.textCustomerReferenceUpdatedSuccess
                                : "");
                    }
                },

                clearingPickupContact: false,

                setPickupContact: function () {
                    var vm = this;
                    vm.updateDeliveryAddressField({
                        ContactFirstName: this.get("contactFirstName"),
                        ContactLastName: this.get("contactLastName"),
                        ContactPhoneNumber: this.get("contactPhoneNumber")
                    }, '');
                },

                clearPickupContact: function (triggerUpdate) {
                    var vm = this,
                        cleared = $.Deferred();
                    if (vm.get("contactFirstName") != undefined &&
                        vm.get("contactLastName") != undefined &&
                        vm.get("contactPhoneNumber") != undefined &&
                        (vm.get("contactFirstName").length > 0 || vm.get("contactLastName").length > 0 || vm.get("contactPhoneNumber").length > 0)) {
                        vm.set("clearingPickupContact", true);
                        vm.set("contactFirstName", "");
                        vm.set("contactLastName", "");
                        vm.set("contactPhoneNumber", "");
                        if (triggerUpdate) {
                            cleared = vm.updateDeliveryAddressField({
                                ContactFirstName: "",
                                ContactLastName: "",
                                ContactPhoneNumber: ""
                            }, '');
                        } else {
                            cleared.resolve();
                        }
                        vm.set("clearingPickupContact", false);
                    } else {
                        cleared.resolve();
                    }
                    return cleared;
                },

                contactFirstNameErrorMsg: "",
                contactLastNameErrorMsg: "",
                contactPhoneErrorMsg: "",

                validPickupContact: function (showMessages) {
                    var vm = this,
                        valid = true;
                    if (!widget.options.pickupContactFieldData.length == 0) {
                        $.each(widget.options.pickupContactFieldData, function (idx, item) {
                            if (item.Mandatory && !vm.validPickupContactField(item.FieldName, item.Prompt)) {
                                valid = false;
                            }
                        });
                    }
                    if (!valid && showMessages) {
                        vm.clearMessage();
                        vm.setMessage(widget.options.textPickupContactDetailsIncomplete, $.cv.css.messageTypes.error);
                    }
                    return valid;
                },

                validPickupContactField: function (field, fieldPrompt) {
                    var valid = true,
                        field = field.substr(0, 1).toLowerCase() + field.substr(1);
                    if ($.trim(this.get(field).length) == 0) {
                        this.set(field + "ErrorMsg", $.cv.css.mandatoryFieldIncompleteMessage.format(fieldPrompt));
                        valid = false;
                    } else {
                        this.set(field + "ErrorMsg", "");
                    }
                    return valid;
                },

                checkAttentionToDefaults: function () {
                    if (this.get("attentionUserName") == "")
                        this.set("attentionUserName", widget.options.attentionUserName);
                    if (this.get("attentionPhoneNumber") == "")
                        this.set("attentionPhoneNumber", widget.options.attentionPhoneNumber);
                },

                setAttention: function (triggerMessage) {
                    var _this = this;
                    triggerMessage = typeof triggerMessage !== 'undefined' ? triggerMessage : true;
                    this.set("attentionToHasError", "");
                    this.set("attentionToErrorMsg", "");
                    _this.checkAttentionToDefaults();
                    var d1 = $.cv.css.deliveryAddress.setDeliveryAddressAttentionTo({ name: _this.get("attentionUserName"), phone: _this.get("attentionPhoneNumber") });
                    $.when(d1).done(function (msg) {
                        var data = msg.data;
                        if (!msg.sessionHasTimedOut) {
                            if (triggerMessage) {
                                if (!msg.errorMessage || msg.errorMessage.length == 0) {
                                    _this.setMessage(widget.options.textUpdatingAttentionToSuccess, $.cv.css.messageTypes.success);
                                } else {
                                    _this.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                                    _this.set("attentionToHasError", widget.options.inputErrorClass);
                                    _this.set("attentionToErrorMsg", msg.errorMessage);
                                }
                            }
                        } else {
                            viewModel.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, params, widget.options.includeInBrowserHistory);
                        }
                    }).fail(function () {
                        if (triggerMessage) {
                            _this.setMessage(widget.options.textErrorUpdatingAttentionTo, $.cv.css.messageTypes.error);
                            _this.set("attentionToHasError", widget.options.inputErrorClass);
                            _this.set("attentionToErrorMsg", widget.options.textErrorUpdatingAttentionTo);
                        }
                    });
                },

                setAttentionToUserName: function (triggerMessage) {
                    var _this = this;
                    _this.setAttention(triggerMessage);
                },

                setAttentionToPhoneNumber: function (triggerMessage) {
                    var _this = this;
                    _this.setAttention(triggerMessage);
                },

                isSettingAddresses: false,
                setAddresses: function(e) {
                    var vm = this;
                    vm.set("isSettingAddresses", true);
                    vm.set("preserveGuestDetails", true);
                    vm.processLinkedAddresses(e);
                    var soBillAddress = this.getSoBillAddress();
                    vm._updateBillingAddress(soBillAddress, widget.options.textBillingAddressUpdatedSuccess, "billingAddressErrorMsg").done(function() {
                        vm.setDeliveryAddress();
                    });
                    return false;
                },

                setDeliveryAddress: function (clearPickupContact, noThrottle) {
                    var soDelAddress = this.getSoDelAddress(), set = $.Deferred();
                    var _this = this;
                    noThrottle = typeof noThrottle != "undefined" ? noThrottle : false;
                    if (!noThrottle) {
                        set = _this.updateDeliveryAddress(soDelAddress, widget.options.textDeliveryAddressUpdatedSuccess, "deliveryAddressErrorMsg", _this.get("saveAddress"), clearPickupContact);
                    } else {
                        set = _this._updateDeliveryAddress(soDelAddress, widget.options.textDeliveryAddressUpdatedSuccess, "deliveryAddressErrorMsg", _this.get("saveAddress"), clearPickupContact);
                    }
                    return set;
                },

                setBillingAddress: function () {
                    var soBillAddress = this.getSoBillAddress();
                    var _this = this;
                    return _this.updateBillingAddress(soBillAddress, widget.options.textBillingAddressUpdatedSuccess, "billingAddressErrorMsg");
                },

                setOrderComments: function () {
                    var _this = this;
                    _this.updateDeliveryAddressField({ SoComments: this.get("orderComments") }, widget.options.textOrderCommentsUpdatedSuccess, "orderCommentsErrorMsg");
                },

                setDeliveryInstructions: function () {
                    var _this = this;
                    _this.updateDeliveryAddressField({ SoDelIns: this.get("deliveryInstructions") }, widget.options.textDeliveryInstructionsUpdatedSuccess, "deliveryInstructionsErrorMsg");
                },

                validAuthorityToLeave: function (showMessages) {
                    var vm = this;
                    vm.clearMessage("validAuthorityToLeave", true);
                    var valid = true;

                    var leaveAtAlternateLocation = vm.get("leaveAtAlternateLocation");
                    if (leaveAtAlternateLocation == true) {
                        var authorityToLeave = this.get("authorityToLeave");
                        var valid = !$.cv.util.isNullOrWhitespace(authorityToLeave) && authorityToLeave !== widget.options.defaultAuthorityToLeaveText;
                    }
                    
                    if (!valid && showMessages)
                        vm.setMessage(widget.options.textAuthorityToLeaveOptionNotSelected,
                            $.cv.css.messageTypes.error,
                            true,
                            "validAuthorityToLeave");
                    if (!valid) {
                        vm.set("authorityToLeaveErrorMsg", widget.options.textAuthorityToLeaveMandatory);
                    } else {
                        vm.set("authorityToLeaveErrorMsg", "");
                    }
                    return valid;
                },

                setAuthorityToLeave: function (triggerMessage) {
                    var vm = this;
                    
                    triggerMessage = typeof triggerMessage !== 'undefined' ? triggerMessage : true;

                    vm.updateDeliveryAddressField({ AuthorityToLeave: this.get("authorityToLeave") },
                                                     widget.options.textAuthorityToLeaveUpdatedSuccess,
                                                     "authorityToLeaveErrorMsg").done(function (msg) {
                            var data = msg.data;
                            if (!msg.sessionHasTimedOut) {
                                if (triggerMessage) {
                                    if (!msg.errorMessage || msg.errorMessage.length == 0) {
                                        vm.setMessage(widget.options.textAuthorityToLeaveUpdatedSuccess, $.cv.css.messageTypes.success);
                                        vm.set("authorityToLeaveErrorMsg", "");
                                    } else {
                                        vm.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                                        vm.set("authorityToLeaveErrorMsg", msg.errorMessage);
                                    }
                                }
                            } else {
                                viewModel.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, params, widget.options.includeInBrowserHistory);
                            }
                        }).fail(function () {
                            if (triggerMessage) {
                                vm.setMessage(widget.options.textErrorUpdatingAuthorityToLeave, $.cv.css.messageTypes.error);
                                vm.set("authorityToLeaveErrorMsg", widget.options.textErrorUpdatingAttentionTo);
                            }
                        });
                },

                validCopyOrderConfirmation: function (showMessages) {
                    var vm = this;
                    vm.clearMessage("validCopyOrderConfirmation", true);
                    var valid = !(vm.get("allowCopyOrderConfirmation") &&
                        vm.get("copyOrderConfirmationMandatory") &&
                        vm.get("copyOrderConfirmation").length === 0);
                    if (!valid && showMessages)
                        vm.setMessage(widget.options.textCopyOrderConfirmationMandatory,
                            $.cv.css.messageTypes.error,
                            true,
                            "validCopyOrderConfirmation");
                    if (!valid) {
                        vm.set("orderConfirmationHasError", widget.options.inputErrorClass);
                        vm.set("orderConfirmationErrorMsg", widget.options.textCopyOrderConfirmationMandatory);
                    } else {
                        vm.set("orderConfirmationHasError", "");
                        vm.set("orderConfirmationErrorMsg", "");
                        valid = vm.validateCopyConfirmationEmailAddresses();
                    }
                    return valid;
                },

                setCopyOrderConfirmation: function () {
                    var vm = this;
                    if (!this.validCopyOrderConfirmation(true))
                        return;
                    else {
                        if (vm.validateCopyConfirmationEmailAddresses()) {
                            vm.updateDeliveryAddressField({
                                        CopyOrderConfirmationEmail: this.get("copyOrderConfirmation")
                                    },
                                    widget.options.textCopyOrderConfirmationUpdatedSuccess,
                                    "orderConfirmationErrorMsg");
                        }
                    }
                },

                validateCopyConfirmationEmailAddresses: function () {
                    var vm = this;
                    vm.clearMessage("validateCopyConfirmationEmailAddresses", true);
                    var allEmailsValid = true;
                    if ($.trim(vm.get("copyOrderConfirmation")) != "") {
                        var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
                        var emails = vm.get("copyOrderConfirmation").split(";");
                        $.each(emails, function (idx, item) {
                            if (!pattern.test(item))
                                allEmailsValid = false;
                        });
                    }
                    if (!allEmailsValid) {
                        vm.set("orderConfirmationHasError", widget.options.inputErrorClass);
                        vm.set("orderConfirmationErrorMsg", widget.options.textCopyOrderConfirmationInvalidEmails);
                        vm.setMessage(widget.options.textCopyOrderConfirmationInvalidEmails,
                            $.cv.css.messageTypes.error,
                            true,
                            "validateCopyConfirmationEmailAddresses");
                    } else {
                        vm.set("orderConfirmationHasError", "");
                        vm.set("orderConfirmationErrorMsg", "");
                    }
                    return allEmailsValid;
                },

                saveBillingAddressToUser: function() {
                    var _this = this, d = $.Deferred(), currentUser = $.cv.css.localGetUser(),
                        userUpdateData = {},
                        billingAddress = this.get("billingAddressItemList");

                    if (widget.options.saveAddressFieldGroup.length > 0) {
                        if (currentUser == null) {
                            d = $.cv.css.getCurrentUser();
                        } else {
                            d.resolve({ data: [currentUser] });
                        }
                        $.each(billingAddress, function (index, item) {
                            userUpdateData[item.fieldItem.FieldName] = item.get(item.fieldItem.FieldName);
                        });
                        $.when(d).done(function (usr) {
                            if (usr && usr.data && usr.data.length > 0) {
                                userUpdateData["_objectKey"] = usr.data[0]._objectKey;
                                $.cv.css.user.setCurrentUserDetails({ updateData: userUpdateData, jsonFieldGroup: widget.options.saveAddressFieldGroup });
                            }
                        });
                    }
                },

                saveDeliveryAddressToUser: function () {
                    var _this = this, d = $.Deferred(), currentUser = $.cv.css.localGetUser(),
                        saveFields = widget.options.userAddressFields.split(","),
                        userUpdateData = {},
                        address = this.get("addressItemList");

                    if (saveFields.length > 0 && widget.options.saveAddressFieldGroup.length > 0) {
                        if (currentUser == null) {
                            d = $.cv.css.getCurrentUser();
                        } else {
                            d.resolve({ data: [currentUser] });
                        }
                        $.each(saveFields, function (index, item) {
                            if (address.length > index) {
                                if (_this.get("createUserFromGuest") && item === "NotifyEmailAddress") {
                                    userUpdateData[item] = address[index].get(widget.options.guestCheckoutEmailField);
                                } else {
                                userUpdateData[item] = address[index].get(address[index].fieldItem.fieldName);
                            }
                            }
                        });
                        $.when(d).done(function (usr) {
                            if (usr && usr.data && usr.data.length > 0) {
                                userUpdateData["_objectKey"] = usr.data[0]._objectKey;
                                $.cv.css.user.setCurrentUserDetails({ updateData: userUpdateData, jsonFieldGroup: widget.options.saveAddressFieldGroup });
                            }
                        });
                    }
                },

                setCreateUserFromGuest: function() {
                    var vm = this;
                    $.cv.css.user.setUserStatus({ userStatus: vm.get("createUserFromGuest") ? 1 : 2 });
                },

                saveDeliveryAddress: function () {
                    var soDelAddress = this.getSoDelAddress(), _this = this;
                    var d1 = $.cv.css.deliveryAddress.saveAddress({ saveForUser: widget.options.saveAddressForUser, saveDeliveryInstructions: widget.options.saveDeliveryInstructions });
                    $.when(d1).done(function (msg) {
                        var data = msg.data;
                        if (!msg.sessionHasTimedOut) {
                            if (!msg.errorMessage || msg.errorMessage.length == 0) {
                                if (data.Success) {
                                    $.cv.css.trigger($.cv.css.eventnames.addressSaved);
                                } else {
                                    if (data.Messages.length > 0) {
                                        var message = "";
                                        for (var i = 0; i < data.Messages.length; i++)
                                            message = message.length == 0 ? data.Messages[i] : message + ", " + data.Messages[i];
                                        _this.setMessage(message, $.cv.css.messageTypes.error);
                                    }
                                }
                            } else {
                                _this.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                            }
                        } else {
                            viewModel.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, {}, widget.options.includeInBrowserHistory);
                        }
                    }).fail(function () {
                        _this.setMessage(widget.options.textErrorSavingDeliveryAddress, $.cv.css.messageTypes.error);
                    });
                },

                changeTriggered: false,

                isAddressBeingEdited: false,

                isCountryBeingEdited: false,

                _updateDeliveryAddressThrottled: $.noop,

                updateDeliveryAddress: function(options, successMessage, addressErrorMsgProperty, saveAddress, clearPickupContact) {
                    return widget._updateDeliveryAddressThrottled(options, successMessage, addressErrorMsgProperty, saveAddress, clearPickupContact);
                },

                _updateDeliveryAddress: function (options, successMessage, addressErrorMsgProperty, saveAddress, clearPickupContact) {
                    var vm = this,
                        processingLinkedAddresses = vm.get("processingLinkedAddresses"),
                        pickupContactCleared = {};
                    var opts = $.extend({
                        _objectKey: this.get("deliveryAddressObjectKey"),
                        validateMissingFields: !widget.options.updateAddressOnChanged,
                        selectedAddressId: vm.addressId(),
                        preserveGuestDetails: vm.get("preserveGuestDetails")
                    }, options);

                    saveAddress = typeof saveAddress !== 'undefined' ? saveAddress : false;
                    clearPickupContact = typeof clearPickupContact !== 'undefined' ? clearPickupContact : false;

                    vm.set("deliveryAddressErrorMsg", "");
                    vm.set("productDeliveryRestrictionsErrorMsg", "");
                    vm.clearMessage();

                    var addressUpdated = $.cv.css.deliveryAddress.updateDeliveryAddressForCurrentOrder(opts);
                    addressUpdated.done(function (msg) {
                        var data = msg.data;
                        if (!msg.sessionHasTimedOut) {
                            if (!msg.errorMessage || msg.errorMessage.length == 0) {
                                vm.set("isDangerousGoodsPoBoxDelivery", data.isDangerousGoodsPoBoxDelivery);
                                // First check if there is any Product Delivery Restrictions related issues
                                if (widget.options.usingAddressValidation) {
                                    vm.set("isSettingAddresses", false);
                                }
                                if (data.productDeliveryRestrictionsMessage && data.productDeliveryRestrictionsMessage.length > 0) {
                                    loadSoDelAddress();
                                    vm.setMessage(data.productDeliveryRestrictionsMessage, $.cv.css.messageTypes.error);
                                    vm.set("productDeliveryRestrictionsErrorMsg", data.productDeliveryRestrictionsMessage);
                                } else if (data.result) {
                                    if (!widget.options.updateAddressOnChanged) {
                                        vm.setMessage(widget.options.textDeliveryAddressUpdatedSuccess, $.cv.css.messageTypes.success);

                                        // If the user is copying the billing address to the delivery address and the address that comes back from the address validation passes it is not always the same as the entered billing address
                                        // i.e. Place will get converted to Pl or Street converted to St
                                        // This gets populated in the delivery address as Pl or St but leaves the billing address as Place or Street which will inadvertently treats the two addresses as different
                                        // The end result is weird UI behaviour where the widget opens up the delivery address entry box event though it says the address is valid, so we need to copy this back to the billing address in this case
                                        loadSoDelAddress(widget.options.usingAddressValidation && vm.shouldAddressBeCopied() && widget.options.addressMapMode === COPYBILLINGTOADDRESS);
                                    }
                                    if (widget.options.showCountry) {
                                        changeStateList(false);
                                    }
                                    $.cv.css.trigger($.cv.css.eventnames.addressChanged, { deliveryAddressMode: vm.get("deliveryAddressMode") });

                                    vm.validateInputFields(false);
                                    if (widget.options.usingAddressValidation) {
                                        if (vm.get("passedValidation") === true) {
                                            $.cv.util.notify(vm, widget.options.addressIsValid, $.cv.css.messageTypes.success, {
                                                triggerMessages: true,
                                                source: widget.name
                                            });
                                        }
                                    }
                                    if (saveAddress) {
                                        vm.saveDeliveryAddress();
                                    }
                                    if (widget.options.saveAddressDownToUser) {
                                        vm.saveDeliveryAddressToUser();
                                    }
                                } else {
                                    if (data.message != "" && data.pickList == null) {
                                        if (!widget.options.updateAddressOnChanged) {
                                            loadSoDelAddress();
                                        }
                                        vm.setMessage(data.message, $.cv.css.messageTypes.error, (widget.options.triggerErrorMessages && !processingLinkedAddresses));
                                        if (addressErrorMsgProperty != undefined && addressErrorMsgProperty != "") {
                                            vm.set(addressErrorMsgProperty, data.message);
                                        }
                                    }
                                    else if (data.pickList != null) {
                                        loadSoDelAddress(widget.options.usingAddressValidation && vm.shouldAddressBeCopied() && widget.options.addressMapMode === COPYBILLINGTOADDRESS);
                                        var pickList = buildPickListArray(data.pickList);
                                        if (pickList.length > 0) {
                                            widget.options.deliveryAddressValidationDataSource = pickList;
                                            setDeliveryAddressValidationDataSource();
                                        } else {
                                            if (!$.cv.util.isNullOrWhitespace(data.message)) {
                                                vm.setMessage(data.message, $.cv.css.messageTypes.error, (widget.options.triggerErrorMessages && !processingLinkedAddresses));
                                            }
                                        }
                                    }
                                }
                                if (clearPickupContact) {
                                    pickupContactCleared = vm.clearPickupContact(true);
                                }                               
                            } else {
                                vm.setMessage(msg.errorMessage, $.cv.css.messageTypes.error)
                                if (addressErrorMsgProperty != undefined && addressErrorMsgProperty != "") {
                                    vm.set(addressErrorMsgProperty, msg.errorMessage);
                                }
                            }
                        } else {
                            viewModel.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, {}, widget.options.includeInBrowserHistory);
                        }
                    }).fail(function () {
                        vm.setMessage(widget.options.textErrorUpdatingDeliveryAddress, $.cv.css.messageTypes.error);
                        if (addressErrorMsgProperty != undefined && addressErrorMsgProperty != "") {
                            vm.set(addressErrorMsgProperty, widget.options.textErrorUpdatingDeliveryAddress);
                        }
                    });

                    return $.when(addressUpdated, pickupContactCleared);
                },

                isBillingAddressBeingEdited: false,

                _updateBillingAddressThrottled: $.noop,

                clearWidgetMessages: false,

                updateBillingAddress: function (options, successMessage, addressErrorMsgProperty) {
                    return widget._updateBillingAddressThrottled(options, successMessage, addressErrorMsgProperty);
                },

                _updateBillingAddress: function (options, successMessage, addressErrorMsgProperty) {
                    var vm = this;
                    var opts = $.extend({
                        _objectKey: vm.get("deliveryAddressObjectKey"),
                        selectedAddressId: vm.addressId()
                    }, options);

                    vm.set("billingAddressErrorMsg", "");
                    vm.clearMessage();
                    vm.setCreateUserFromGuest();

                    var addressUpdated = $.cv.css.deliveryAddress.updateBillingAddressForCurrentOrder(opts);

                    addressUpdated.done(function (msg) {
                        var data = msg.data;
                        if (!msg.sessionHasTimedOut) {
                            if (!msg.errorMessage || msg.errorMessage.length == 0) {
                                if (data.result) {
                                    if (!widget.options.updateAddressOnChanged) {
                                        vm.setMessage(widget.options.textDeliveryAddressUpdatedSuccess, $.cv.css.messageTypes.success);
                                        if (!widget.options.usingAddressValidation) {
                                            loadSoDelAddress();
                                        }
                                    }
                                    if (widget.options.showCountry) {
                                        changeStateList(true);
                                    }
                                    $.cv.css.trigger($.cv.css.eventnames.billingAddressChanged);
                                    if (widget.options.saveBillAddressDownToUser) {
                                        vm.saveBillingAddressToUser();
                                    }
                                } else {
                                    if (data.message != "") {
                                        if (!widget.options.updateAddressOnChanged) {
                                            if (!widget.options.usingAddressValidation) {
                                                loadSoDelAddress();
                                            }
                                        }
                                        vm.setMessage(data.message, $.cv.css.messageTypes.error)
                                        if (addressErrorMsgProperty != undefined && addressErrorMsgProperty != "") {
                                            vm.set(addressErrorMsgProperty, data.message);
                                        }
                                    }
                                }
                            } else {
                                vm.setMessage(msg.errorMessage, $.cv.css.messageTypes.error)
                                if (addressErrorMsgProperty != undefined && addressErrorMsgProperty != "") {
                                    vm.set(addressErrorMsgProperty, msg.errorMessage);
                                }
                            }
                        } else {
                            viewModel.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, {}, widget.options.includeInBrowserHistory);
                        }
                    }).fail(function () {
                        vm.setMessage(widget.options.textErrorUpdatingDeliveryAddress, $.cv.css.messageTypes.error);
                        if (addressErrorMsgProperty != undefined && addressErrorMsgProperty != "") {
                            vm.set(addressErrorMsgProperty, widget.options.textErrorUpdatingDeliveryAddress);
                        }
                    });

                    return addressUpdated;
                },

                validateSuburbAndPostCodeInternal: function (suburb, postcode, country, isBilling) {
                    var suburbValidated = $.Deferred();
                    // If not defined yet and this got triggered can't validate yet.
                    // Ensure we return the promise so that any method expecting it doesn't fail
                    if (!$.cv.util.hasValue(suburb) || !$.cv.util.hasValue(postcode)) {
                        suburbValidated.resolve({ data: true });
                        return suburbValidated;
                    }

                    var vm = this;
                    
                    // if suburb or postcode is not valid no need to call the validation method just return false
                    if (suburb.length === 0 || postcode.length === 0) {
                        if (isBilling === true) {
                            vm.set("isBillingSuburbAndPostCodeValid", false);
                            vm.updateBillingSuburbPostcodeValidStatus();
                        } else {
                            vm.set("isSuburbAndPostCodeValid", false);
                            vm.updateSuburbPostcodeValidStatus();
                        }
                        suburbValidated.resolve({ data: false });
                        return suburbValidated;
                    }
                    suburbValidated = $.cv.css.deliveryAddress.validateSuburbAndPostCode({
                        suburb: suburb,
                        postcode: postcode,
                        country: country
                    });

                    suburbValidated.done(function (response) {
                        if (!response.sessionHasTimedOut) {
                            var isValid = response.data;
                            if (isBilling === true) {
                                vm.set("isBillingSuburbAndPostCodeValid", isValid);
                                vm.updateBillingSuburbPostcodeValidStatus();
                            } else {
                                vm.set("isSuburbAndPostCodeValid", isValid);
                                vm.updateSuburbPostcodeValidStatus();
                            }
                        } else {
                            viewModel.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, {}, widget.options.includeInBrowserHistory);
                        }
                    }).fail(function () {
                        // Don't allow validation to succeed!
                        if (isBilling === true) {
                            vm.set("isBillingSuburbAndPostCodeValid", false);
                            vm.updateBillingSuburbPostcodeValidStatus();
                        } else {
                            vm.set("isSuburbAndPostCodeValid", false);
                            vm.updateSuburbPostcodeValidStatus();
                        }

                        vm.setMessage(widget.options.textErrorValidatingSuburbPostcode, $.cv.css.messageTypes.error);
                    });

                    return suburbValidated;
                },

                doSuburbAndPostCodeValidation: function (suburb, postcode, country, isBilling) {
                    var vm = this;

                    // Only process for billing fields if they are actually in use i.e. in b2c only, b2b does not show or use billing fields
                    if (!isBilling || widget.options.isB2c) {
                        if (widget.options.enableSuburbAndPostcodeValidation === true) {
                            vm.validateSuburbAndPostCodeInternal(
                                    suburb,
                                    postcode,
                                    country,
                                    isBilling)
                                .done(function() {
                                    vm.validateInputFields(false);
                                });
                        } else {
                            if (isBilling === true) {
                                vm.set("isBillingSuburbAndPostCodeValid", true);
                                vm.updateBillingSuburbPostcodeValidStatus();
                            } else {
                                vm.set("isSuburbAndPostCodeValid", true);
                                vm.updateSuburbPostcodeValidStatus();
                            }
                        }
                    }
                },

                updateDeliveryAddressField: function (options, successMessage, addressErrorMsgProperty) {
                    var vm = this;
                    var opts = $.extend({
                        _objectKey: this.get("deliveryAddressObjectKey")
                    }, options);
                    var d1 = $.cv.css.deliveryAddress.setDeliveryAddressFieldForCurrentOrder(opts);
                    $.when(d1).done(function (msg) {
                        var data = {};
                        data["result"] = msg.data;
                        vm.clearMessage("updateDeliveryAddressField");
                        if (!msg.sessionHasTimedOut) {
                            if (!msg.errorMessage || msg.errorMessage.length === 0) {
                                if (data.result.length > 0) {
                                    vm.setMessage(successMessage,
                                        $.cv.css.messageTypes.success,
                                        true,
                                        "updateDeliveryAddressField");
                                    if (!widget.options.updateAddressOnChanged) {
                                        processAddressData(data);
                                    }
                                } else {
                                    vm.setMessage(widget.options.textErrorUpdatingDeliveryAddress,
                                        $.cv.css.messageTypes.error,
                                        true,
                                        "updateDeliveryAddressField");
                                }
                            } else {
                                vm.setMessage(msg.errorMessage,
                                    $.cv.css.messageTypes.error,
                                    true,
                                    "updateDeliveryAddressField");
                                if (addressErrorMsgProperty != undefined && addressErrorMsgProperty !== "") {
                                    vm.set(addressErrorMsgProperty, msg.errorMessage);
                                }
                            }
                        } else {
                            viewModel.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, params, widget.options.includeInBrowserHistory);
                        }
                    }).fail(function () {
                        vm.setMessage(widget.options.textErrorUpdatingDeliveryAddress,
                            $.cv.css.messageTypes.error,
                            true,
                            "updateDeliveryAddressField");
                        if (addressErrorMsgProperty != undefined && addressErrorMsgProperty !== "") {
                            vm.set(addressErrorMsgProperty, widget.options.textErrorUpdatingDeliveryAddress);
                        }
                    });
                    return d1;
                },

                validateAddressFields: function (list, showMessages) {
                    var result = { allValid: true, errorMessage: "" };
                    var displayValuesFromSeq = this.displayValuesFromSeq.toString(),
                        addressObjectMapping = this.addressObjectMapping,
                        replaceMandatoryMessage = false;

                    var billingAddressFields = [], deliveryAddressFields = [];
                    var billingAddressLookupMandatoryMessage = this.billingAddressLookupMandatoryMessage,
                        deliveryAddressLookupMandatoryMessage = this.deliveryAddressLookupMandatoryMessage;
                    if (this.useAddressLookup && $.cv.util.hasValue(displayValuesFromSeq) && addressObjectMapping.length > 0) {
                        replaceMandatoryMessage = true;
                        var billingMapping = _.find(addressObjectMapping, function (mapping) { return mapping.AddressType === "Billing"; });
                        var deliveryMapping = _.find(addressObjectMapping, function(mapping) { return mapping.AddressType === "Delivery"; });

                        _.each(displayValuesFromSeq.split(","), function (seq) {
                            var billingAddressItem = _.find(billingMapping.Map, function (item) { return item.Seq.toString() === seq; });
                            billingAddressFields.push({ "Fieldname": billingAddressItem.Field });
                            var deliveryAddressItem = _.find(deliveryMapping.Map, function (item) { return item.Seq.toString() === seq; });
                            deliveryAddressFields.push({ "Fieldname": deliveryAddressItem.Field });
                        });
                    }
                    $.each(list, function (idx, item) {
                        if (!item.fieldItem.parent().fieldValid({ data: item.fieldItem.parent() }, showMessages)) {
                            result.allValid = false;
                            if (replaceMandatoryMessage) {
                                // check whether in billingAddressFields
                                var billing = _.find(billingAddressFields, function (field) { return field.Fieldname === item.fieldItem.fieldName; });
                                if (billing) {
                                    item.fieldItem.errorMessage = billingAddressLookupMandatoryMessage;
                                }
                                // check whether in deliveryAddressFields
                                var delivery = _.find(deliveryAddressFields, function (field) { return field.Fieldname === item.fieldItem.fieldName; });
                                if (delivery) {
                                    item.fieldItem.errorMessage = deliveryAddressLookupMandatoryMessage;
                                }
                            }
                            result.errorMessage = item.fieldItem.errorMessage;

                            return false;
                        }
                    });
                    return result;
                },

                _validateAddressServiceCall: function () {
                    var vm = this;
                    var validateDeferred = $.Deferred();

                    if (viewModel.get("disableDeliveryAddress")) {
                        validateDeferred.resolve(true);
                    }
                    else {
                        vm.clearMessage();

                        $.cv.css.deliveryAddress.validateCurrentOrderDeliveryAddress({ validateDeliveryRestriction: !vm.get("isDeliveryMethodsInUse") }).done(function (msg) {
                            var data = msg.data;
                            if (!msg.sessionHasTimedOut) {
                                if (!msg.errorMessage || msg.errorMessage.length == 0) {
                                    if (!data.result && data.responseMessage.length > 0) {
                                        vm.setMessage(data.responseMessage, $.cv.css.messageTypes.error, widget.options.triggerExternalValidationMessages);
                                    }
                                } else {
                                    vm.setMessage(msg.errorMessage, $.cv.css.messageTypes.error);
                                }
                                validateDeferred.resolve(data.result);
                            } else {
                                vm.redirectToTimeoutUrl(widget.options.sessionTimeOutRedirectUrl, {}, widget.options.includeInBrowserHistory);
                            }
                        });
                    }

                    return validateDeferred;
                },

                validateInputFields: function (showMessages, callValidateServiceOnCheckout) {
                    var vm = this,
                        passedValidation = true,
                        widgetReference = "deliveryAddress",
                        errorMessage = "",
                        suburbPostCodeNotMatch = false,
                        serviceCallDeferred = $.Deferred(),
                        validateDeferred = $.Deferred();
                    callValidateServiceOnCheckout = typeof callValidateServiceOnCheckout !== 'undefined' ? (this.get("deliveryAddressMode") == "Pickup" ? false : callValidateServiceOnCheckout) : false;
                    if (!widget.options.isViewOnly) {
                        // Check mandatory fields
                        if (this.get("deliveryAddressMode") == "Pickup" && !this.validPickupContact(showMessages)) {
                            passedValidation = false;
                        }

                        if (!this.validCustomerReference(showMessages)) {
                            passedValidation = false;
                        }

                        if (!this.validCopyOrderConfirmation(showMessages)) {
                            passedValidation = false;
                        }

                        if (!this.validAuthorityToLeave(showMessages)) {
                            passedValidation = false;
                        }

                        if (!widget.options.disableDeliveryAddress && this.showDeliveryAddress()) {
                            var validateDelAddrResult = this.validateAddressFields(this.get("addressItemList"), showMessages);
                            if (!validateDelAddrResult.allValid) {
                                passedValidation = false;
                                errorMessage = validateDelAddrResult.errorMessage;
                            }
                        }

                        // For b2b the billing address fields are never used.
                        if (widget.options.isB2c && !widget.options.disableBillingAddress && this.showBillingAddress()) {
                            var validateBillAddrResult = this.validateAddressFields(this.get("billingAddressItemList"), showMessages);
                            if (!validateBillAddrResult.allValid) {
                                passedValidation = false;
                                errorMessage = validateBillAddrResult.errorMessage;
                            }
                        }

                        // Don't check suburb / postcode validation (ensures they pair up) at this point if that functionality not enabled. Otherwise it can 
                        // remove mandatory field / field length validation which is needed on these fields and will have already been performed.
                        // If delivery address is the same as the billing address, don't check validation.
                        if (!widget.options.disableDeliveryAddress && widget.options.enableSuburbAndPostcodeValidation && this.showDeliveryAddress() &&
                            !viewModel.shouldAddressBeCopied()) {
                            if (!this.get("isSuburbAndPostCodeValid")) {
                                passedValidation = false;
                                suburbPostCodeNotMatch = true;                                
                            }
                            if (showMessages === true) {
                                this.updateSuburbPostcodeValidStatus();
                            }
                        }

                        // Same for Billing suburb / postcode validation but only for b2c as for b2b the billing address fields are never used.
                        if (widget.options.isB2c && !widget.options.disableBillingAddress && widget.options.enableSuburbAndPostcodeValidation && this.showBillingAddress()) {
                            if (!this.get("isBillingSuburbAndPostCodeValid")) {
                                passedValidation = false;
                                suburbPostCodeNotMatch = true;
                            }
                            if (showMessages === true) {
                                this.updateBillingSuburbPostcodeValidStatus();
                            }
                        }

                        viewModel.set("passedValidation", passedValidation);

                        if (!passedValidation) {
                            if (showMessages) {
                                if (errorMessage) {
                                    this.set("deliveryAddressErrorMsg", errorMessage);
                                    this.setMessage(errorMessage, $.cv.css.messageTypes.error);
                                }
                                else if (suburbPostCodeNotMatch) {
                                    this.setMessage(widget.options.textErrorValidatingSuburbPostcode, $.cv.css.messageTypes.error);
                                }
                            }
                        }

                        if (passedValidation && callValidateServiceOnCheckout) {
                            serviceCallDeferred = this._validateAddressServiceCall();
                        } else {
                            serviceCallDeferred.resolve(passedValidation);
                        }
                        serviceCallDeferred.done(function (passed) {
                            $.cv.css.addRemovePageValidationError(passed, widgetReference);
                            if (!vm.get("copyingAddressFields")) {
                                $.cv.css.trigger($.cv.css.eventnames.addressValidated);
                                if (widget.options.usingAddressValidation && passed) {
                                    $.cv.css.trigger($.cv.css.eventnames.addressValidationUpdated, { valid: true });
                                }
                            }
                            validateDeferred.resolve();
                        });
                        return validateDeferred;
                    }
                },

                // Update error status of suburb and postcode based on vm status
                // @returns bool - true if fields are valid, false if not
                updateSuburbPostcodeValidStatus: function () {
                    var vm = this,
                        isValid = vm.get("isSuburbAndPostCodeValid"),
                        addressCopied = this.shouldAddressBeCopied() && widget.options.addressMapMode == COPYBILLINGTOADDRESS,
                        isPickup = vm.get("deliveryAddressMode") == "Pickup";

                    if (!addressCopied && !isPickup && !widget.options.isViewOnly) {
                        _.each(vm.get("addressItemList"), function (item) {
                            if (item.fieldItem.FieldName === widget.options.suburbFieldName ||
                                item.fieldItem.FieldName === widget.options.postcodeFieldName) {
                                // Clear or set invalid message
                                if (isValid) {
                                    item.fieldItem.set("hasNonFieldValidMessage", false); // allow fieldItem.fieldValid method to add its own message if required
                                    item.setError(item.fieldItem, "", "");
                                } else {
                                    item.fieldItem.set("hasNonFieldValidMessage", true); // stop fieldItem.fieldValid method clearing this message
                                    item.setError(item.fieldItem, widget.options.suburbAndPostcodeInvalidMessage, item.fieldItem.classForErrors);
                                }
                            }
                        });
                    } else {
                        isValid = true;
                    }

                    return isValid;
                },

                // Update error status of suburb and postcode based on vm status for Billing address
                // @returns bool - true if fields are valid, false if not
                updateBillingSuburbPostcodeValidStatus: function () {
                    var vm = this,
                        isValid = vm.get("isBillingSuburbAndPostCodeValid"),
                        addressCopied = this.shouldAddressBeCopied() && widget.options.addressMapMode == COPYADDRESSTOBILLING,
                        validate = (vm.get("deliveryAddressMode") == "Pickup" && widget.options.showBillingAddressOnPickup) || vm.get("deliveryAddressMode") == "Delivery";

                    if (!addressCopied && validate && !widget.options.isViewOnly) {
                        _.each(vm.get("billingAddressItemList"), function (item) {
                            if (item.fieldItem.FieldName === widget.options.billingSuburbFieldName ||
                                item.fieldItem.FieldName === widget.options.billingPostcodeFieldName) {
                                // Clear or set invalid message
                                if (isValid) {
                                    item.fieldItem.set("hasNonFieldValidMessage", false); // allow fieldItem.fieldValid method to add its own message if required
                                    item.setError(item.fieldItem, "", "");
                                } else {
                                    item.fieldItem.set("hasNonFieldValidMessage", true); // stop fieldItem.fieldValid method clearing this message
                                    item.setError(item.fieldItem, widget.options.suburbAndPostcodeInvalidMessage, item.fieldItem.classForErrors);
                                }
                            }
                        });
                    } else {
                        isValid = true;
                    }

                    return isValid;
                },

                // Used when mode changing to Delivery from Pickup, then will want to restore current delivery address fields previously entered by the user 
                // from the temp storage location we put them into when Pickup first chosen, as it will have overriden the order's values for these fields, 
                // so if user swaps back to Delivery then want to restore the form to what they had entered.
                // Note: will only occur if from initially loaded in Delivery mode. If user had chosen Pickup, then navd away and came back to page won't 
                // be anything there.
                // But will always call service to clear Warehouse Store Locations fields off from order when going back to Delivery as
                // don't want remnant fields populated on the order that aren't setable by the user when they enter their own details. 
                // So if don't have any temp store it will simply rest back to defaults of new order
                clearWarehouseAndRestoreTempDeliveryFeilds: function () {
                    var vm = this,
                        callLoaded = true;

                    var pickupAddressCleared = $.cv.css.deliveryAddress.clearWarehouseAndDeliveryAddressOnOrder();

                    pickupAddressCleared.done(function (msg) {
                        if (!msg.sessionHasTimedOut) {
                            if (!msg.errorMessage || msg.errorMessage.length === 0) {

                                if (vm.restoreFromTempAddressItemList()) {
                                    callLoaded = false;

                                    var updatedDelb = vm.setDeliveryAddress(true, true);

                                    updatedDelb.done(function () {
                                        vm.validateInputFields(false);
                                    });
                                }

                                if (callLoaded) {
                                    if (vm.get("deliveryAddressMode") === "Delivery" && widget.options.addressMapMode === "") {
                                        init();
                                    }
                                    vm.validateInputFields(false);
                                }
                            }
                        }
                    });

                    // Return Promise which is resolved when services are done (or failed)
                    return pickupAddressCleared;
                },

                deliveryAddressModeChanged: function (e) {
                    var vm = this,
                        deliveryAddressMode = vm.get("deliveryAddressMode"),
                        pickupAddressClearedAndDeliveAddRestored = {};

                    // If mode changing to Pickup, then will want to store current delivery address fields as entered by the user into a temp 
                    // storage as Pickup will override the order's values for these fields, so if user swaps back to Delivery then will want to 
                    // restore the form to what they had entered.
                    if (deliveryAddressMode.toLowerCase() === "pickup") {
                        vm.storeIntoTempAddressItemList();
                    }

                    // If mode changed back to delivery and we need to copy billing to address
                    // Otherwise clear delivery address.
                    if (deliveryAddressMode.toLowerCase() === "delivery") {

                        if (widget.options.addressMapMode === COPYBILLINGTOADDRESS) {
                            vm.processLinkedAddresses(e);
                        }

                        // If mode changing to Delivery from Pickup, then will want to restore current delivery address fields previously entered by the user 
                        // from the temp storage location we put them into when Pickup first chosen, as it will have overriden the order's values for these fields, 
                        // so if user swaps back to Delivery then want to restore the form to what they had entered.
                        // Note: will only occur if from initially loaded in Delivery mode. If user had chosen Pickup, then navd away and came back to page won't 
                        // be anything there.
                        // This will always call service to clear Warehouse Store Locations fields off from order when going back to Delivery as
                        // don't want remnant fields populated on the order that aren't setable by the user when they enter their own details.
                        pickupAddressClearedAndDeliveAddRestored = vm.clearWarehouseAndRestoreTempDeliveryFeilds();

                        pickupAddressClearedAndDeliveAddRestored.done(function () {
                            // Trigger event "delivery address mode changed".
                            $.cv.css.trigger($.cv.css.eventnames.deliveryAddressModeChanged,
                                { message: deliveryAddressMode, type: "", source: "deliveryAddress", clearExisting: true });

                        });
                    }else {

                        var cleared = this.clearDeliveryAddress();
                        $.when(cleared).done(function() {
                            if (deliveryAddressMode.toLowerCase() === "delivery" && widget.options.addressMapMode === "") {
                                init();
                            }

                            vm.validateInputFields(false);

                            // Trigger event "delivery address mode changed".
                            $.cv.css.trigger($.cv.css.eventnames.deliveryAddressModeChanged,
                                { message: deliveryAddressMode, type: "", source: "deliveryAddress", clearExisting: true });
                        });
                    }
                },

                processingLinkedAddresses: false,

                processLinkedAddresses: function (e) {
                    var vm = this, deliveryAddressMode = vm.get("deliveryAddressMode");
                    if (!(deliveryAddressMode == "Pickup" && widget.options.addressMapMode == COPYBILLINGTOADDRESS)) {
                        if (this.shouldAddressBeCopied() && !this.get("copyingAddressFields")) {
                            this.copyAddressFields();
                        }
                        if (e.field == "linkDeliveryAndBilling" || (e.field == "deliveryAddressMode" && deliveryAddressMode == "Delivery" && widget.options.addressMapMode == COPYBILLINGTOADDRESS)) {
                            vm.set("processingLinkedAddresses", true);
                            if (this.shouldAddressBeCopied()) {
                                if (widget.options.usingAddressValidation) {
                                    vm.set("isSettingAddresses", true);
                                    $.cv.css.trigger($.cv.css.eventnames.addressBeingEdited);
                                }
                                this.triggerCopyUpdate();
                            }
                            if (!this.shouldAddressBeCopied() && widget.options.clearOnUncheckedLink && !this.get("preserveAddressData")) {
                                this.clearCopiedAddressFields();
                            }
                            vm.set("processingLinkedAddresses", false);
                        }
                        if (e.field === "linkDeliveryAndBilling") {
                            viewModel.disableEnableCopiedAddressFields();
                        }
                    }
                },

                triggerCopyUpdate: function () {
                    if (widget.options.addressMapMode == COPYBILLINGTOADDRESS) {
                        var soDelAddress = viewModel.getSoDelAddress();
                        this.updateDeliveryAddress(soDelAddress, "");
                    } else {
                        var soBillAddress = viewModel.getSoBillAddress();
                        this.updateBillingAddress(soBillAddress, "");
                    }
                },

                copyAddressFields: function (runDisableEnable) {
                    runDisableEnable = typeof runDisableEnable !== 'undefined' ? runDisableEnable : true;
                    if (widget.options.addressMapMode === COPYBILLINGTOADDRESS || widget.options.addressMapMode === COPYADDRESSTOBILLING) {
                        var _this = this,
                            fromList = widget.options.addressMapMode == COPYBILLINGTOADDRESS ? this.get("billingAddressItemList") : this.get("addressItemList"),
                            toList = widget.options.addressMapMode == COPYBILLINGTOADDRESS ? this.get("addressItemList") : this.get("billingAddressItemList"),
                            mapList = widget.options.fieldMapFrom.split(",");
                        _this.set("copyingAddressFields", true);
                        $.each(mapList, function (index, item) {
                            if (!isNaN(item) && fromList.length > item && toList.length > item && fromList[item].fieldItem.fieldName !== widget.options.guestCheckoutEmailField && toList[item].fieldItem.fieldName !== widget.options.guestCheckoutEmailField) {
                                if (fromList[item][fromList[item].fieldItem.fieldName] != null) {
                                    toList[item].set(toList[item].fieldItem.fieldName, fromList[item][fromList[item].fieldItem.fieldName].toString());
                                } else {
                                    toList[item].set(toList[item].fieldItem.fieldName, "");
                                }
                            }
                        });
                        _this.validateInputFields(false);
                        if (runDisableEnable) {
                            _this.disableEnableCopiedAddressFields();
                        }
                        _this.set("copyingAddressFields", false);
                    }
                },

                disableEnableCopiedAddressFields: function () {
                    var _this = this,
                        toList = widget.options.addressMapMode === COPYBILLINGTOADDRESS ? this.get("addressItemList") : this.get("billingAddressItemList");
                    $.each(toList, function (index, item) {
                        if (_this.shouldAddressBeCopied() && item.fieldItem.fieldName !== widget.options.guestCheckoutEmailField) {
                            item.set(item.fieldItem.fieldName + "_isEnabled", false);
                        } else {
                            if (!widget.viewModel.get("lookupSelected")) {
                                item.set(item.fieldItem.fieldName + "_isEnabled", true);
                            }
                        }
                    });
                },

                clearCopiedAddressFields: function () {
                    if (widget.options.addressMapMode == COPYBILLINGTOADDRESS) {
                        this.clearDeliveryAddress();
                    } else {
                        this.clearBillingAddress();
                    }
                    this.validateInputFields(false);
                },
                
                setLocalDeliveryAddress: function() {
                    if (!widget.options.isViewOnly && this.get("addressItemList").length > 0 || this.get("billingAddressItemList").length > 0) {
                        var data = {},
                            deliveryAddressMode = this.get("deliveryAddressMode");
                        data["result"] = [];
                        data.result.push({
                            AddressFieldData: this.get("addressItemList"),
                            BillingAddressFieldData: this.get("billingAddressItemList"),
                            CopyOrderConfirmationEmail: this.get("copyOrderConfirmation"),
                            SoComments: this.get("orderComments"),
                            SoCustReference: this.get("orderReference"),
                            SoDelIns: this.get("deliveryInstructions"),
                            SoDelCountry: this.get("soDelCountry"),
                            SoDelPhone: this.get("soDelPhone"),
                            AttentionUserName: this.get("attentionUserName"),
                            AttentionPhoneNumber: this.get("attentionPhoneNumber"),
                            ContactFirstName: deliveryAddressMode == "Pickup" ? this.get("contactFirstName") : "",
                            ContactLastName: deliveryAddressMode == "Pickup" ? this.get("contactLastName") : "",
                            ContactPhoneNumber: deliveryAddressMode == "Pickup" ? this.get("contactPhoneNumber") : "",
                            AuthorityToLeave: this.get('authorityToLeave')
                        });
                        
                        // Make sure to use the order that the widget is using. It could be either the users current 
                        // order or some other order if have a orderNoOverride set e.g. order searching, quotes etc.
                        if (widget.options.orderNoOverride === 0) {
                            $.cv.css.localSetcurrentDeliveryAddress(data);
                        } else {
                            $.cv.css.localSetSelectedOrderDeliveryAddress(data);
                        }

                        $.cv.css.trigger($.cv.css.eventnames.localdeliveryAddressChanged);
                    }
                },

                //
                // This function looks to see whether the widget is configured to use suburb autcomplete functionality by checking that certain required widget options (configured via
                // address rulesets) are present. These are used to locate which fields to bind the lookup functionality to as can vary based on address rulesets being used. it is the 
                // main entry point for setting all this up and it then  locates the relevant suburb/postcode delivery fields (and in case of b2c also billing ones) and sets up the kendo 
                // autocomplete binding.
                //
                initSuburbLookupFields: function () {
                    
                    // Make sure that all 3 required fields are known to be present.
                    if ($.cv.util.isNullOrWhitespace(widget.options.addressRulesetsAssignmentsSuburbField)
                        || $.cv.util.isNullOrWhitespace(widget.options.addressRulesetsAssignmentsStateField)
                        || $.cv.util.isNullOrWhitespace(widget.options.addressRulesetsAssignmentsPostcodeField)) {
                        return;
                    }
                    
                    // B2B and B2C - Get the Delivery suburb and state inputs as these are the ones that will get an auto-complete/drop-down added to them
                    // Note that in B2C these should match the hard coded in razor widget's SoDelSuburb and SoDelPostcode but in b2b there is no hard coded ones so can be different.
                    var vm = this,
                        widgetElement = widget.element,
                        inptDelAddessSearchSuburb = widgetElement.find("input[name='" + widget.options.addressRulesetsAssignmentsSuburbField + "']"),
                        inptDelAddessSearchPostcode = widgetElement.find("input[name='" + widget.options.addressRulesetsAssignmentsPostcodeField + "']"),
                        inptBillAddessSearchSuburb = widget.options.isB2c ? widgetElement.find("input[name='" + widget.options.billingSuburbFieldName + "']") : null,
                        inptBillAddessSearchPostcode = widget.options.isB2c ? widgetElement.find("input[name='" + widget.options.billingPostcodeFieldName + "']") : null,
                        formAutoCompleteClass = $.cv.css.formAutoCompleteClass;
                    
                    // If the Delivery suburb and postcode fields aren't located then just bail as no point continuing.
                    if (!inptDelAddessSearchSuburb
                        || inptDelAddessSearchSuburb.length === 0
                        || !inptDelAddessSearchPostcode
                        || inptDelAddessSearchPostcode.length === 0){
                        return;
                    }

                    // Add the form-autocomplete class to them.
                    inptDelAddessSearchSuburb.addClass(formAutoCompleteClass);
                    inptDelAddessSearchPostcode.addClass(formAutoCompleteClass);

                    // If B2C then also need to find the billing suburb and postcode fields.
                    // No widget options to locate those as the B2C razor has them hardcoded (note the same would be said of the B2C ones above for delivery but they will match the
                    // AddressRulesetsAssignments options passed in anyway and that is a pre-req for using the functionality.
                    if (widget.options.isB2c) {
                        // If can't find the billing ones don't worry about baling will still have the delivery ones for B2C at least.
                        // But add the form-autocomplete class to them.
                        if (inptBillAddessSearchSuburb && inptBillAddessSearchSuburb.length > 0)
                            inptBillAddessSearchSuburb.addClass(formAutoCompleteClass);

                        if (inptBillAddessSearchPostcode && inptBillAddessSearchPostcode.length > 0)
                            inptBillAddessSearchPostcode.addClass(formAutoCompleteClass);
                    }

                    // Now wire up the kendo auto-complete for suburb lookup to the fields
                    vm.bindKendoAutoCompleteForSuburbLookup(inptDelAddessSearchSuburb, false, false);
                    vm.bindKendoAutoCompleteForSuburbLookup(inptDelAddessSearchPostcode, true, false);

                    if (widget.options.isB2c) {
                        vm.bindKendoAutoCompleteForSuburbLookup(inptBillAddessSearchSuburb, false, true);
                        vm.bindKendoAutoCompleteForSuburbLookup(inptBillAddessSearchPostcode, true, true);
                    }
                },
                
                // Binds the actual kendo auto complete to the supplied suburb/postcode input field.
                bindKendoAutoCompleteForSuburbLookup: function (targetInputField, isPostcode, isBilling) {
                    var vm = this;

                    var suburbList = $.cv.data.dataSource({
                        method: 'storeLocator/getSuburbHelpers',
                        params: function () {
                            return {
                                searchFilter: targetInputField.val(),
                                incName: true,
                                useLikeName: true,
                                incPostcode: true,
                                useLikePostcode: true,
                                maxResults: 30
                            };
                        }
                    });

                    targetInputField.kendoAutoComplete({
                        dataSource: suburbList,

                        // For postcode need to use contains as won't be first up in each item, but can use startswith otherwise i.e for the suburb
                        filter: isPostcode ? "contains" : "startswith",
                        template: $("#" + widget.options.delAddressSuburbAutoCompleteTemplateId).html(), // e.g. <span>#= data.Name # #= data.State # #= data.Postcode #</span>

                        // Make sure we update the correct value from the selected item into the text field depending if the autocomplete is for suburb or postcode.
                        dataTextField: isPostcode ? "Postcode" : "Name",
                        select: function (e) {
                            if (e.item.length > 0) {
                                if (e.item[0].innerText !== undefined) {
                                    // Must set this so know in the close event that we have done an actual selection and will have set the chosen items
                                    // underlying suburb/postocde/state to the correct address items fields (has to be done manually)
                                    vm.set("isSuburbAutoCompleteSelectStarted", true);

                                    // Pass the selected item so can update needed address fields with it
                                    vm.setSelectedSuburbLookupToAddressFields(this.dataItem(e.item.index()), isBilling);
                                }
                            }
                        },
                        close: function () {
                            //
                            // The way data changed events are bound to the address item fields to trigger ajax updates to the server will not be triggered via the 
                            // population of data that we do with the suburb auto-complete selection handling above so we need to manually trigger the event here 
                            // in the close event of the auto-complete once we have already set the selected address parts into the target fields.
                            //

                            // Go through and get the field that matches the suburb from the main addressItemList widget data source.
                            $.each(vm.get(isBilling ? "billingAddressItemList" : "addressItemList"), function (idx, item) {
                                if (item.fieldItem.fieldName === targetInputField.attr("Name")) {

                                    // Firstly, if the close event has been triggered without the user having actually done a selection from the auto-complete suggestions, i.e. they
                                    // may have just typed in text and clicked/tabbed out, then we need to manually update the whole current text entered into the input fields
                                    // matching address item. Remember with the auto-complete binding the data item update events of those never auto-fire now so we trigger
                                    // them manually but in this case we don't have selected auto suggest items to put it's underlying data into the other address fields, just 
                                    // need to put the whole set of text currently in there to the one address item.
                                    if (vm.get("isSuburbAutoCompleteSelectStarted") === false) {
                                        this.set(item.fieldItem.fieldName, targetInputField.val());
                                    }

                                    // Call the dataChanged, note, we must pass in null for the event param as not have access here to the standard one that would be passed 
                                    // to it when it is normally triggered automatically. Instead will pass true for second param, skipValidCheckAndProcessLinkedAddress as 
                                    // it requires the first param to locate the field then do some validation on the suburb/postcode data but as this suburb auto-complete 
                                    // uses that validation source as it's datasource anyway, it's not really required. Also don't need it call processLinkedAddresses() which
                                    // also relies on triggering even arg as will already have just had it invoked anyway from setSelectedSuburbLookupToAddressFields() when
                                    // setting the address item list fields as they trigger it from bound change event handling.
                                    
                                    // must first set the changeTriggered back to false as we won't have fired the normal item.dataKeyup as would normally occur if we are to 
                                    // call dataChanged manually as it will not go and do our validation otherwise.
                                    vm.set("changeTriggered", false);
                                    item.dataChanged(null, true);
                                    return false; // break out as found the one we needed
                                } else {
                                    return true; // continue to next iteration.
                                }
                            });

                            // Clear it for case next time.
                            vm.set("isSuburbAutoCompleteSelectStarted", false);
                        }
                    });
                },

                setSelectedSuburbLookupToAddressFields: function (selectedItem, isBilling) {
                    var vm = this;

                    if (isBilling) {
                        // Billing fields (only b2c)
                        $.each(vm.get("billingAddressItemList"), function (idx, item) {
                            switch (item.fieldItem.fieldName) {
                                case widget.options.billingSuburbFieldName:
                                    this.set(item.fieldItem.fieldName, selectedItem.Name);
                                    break;

                                case "SoBillState":
                                    this.set(item.fieldItem.fieldName, selectedItem.State);
                                    break;

                                case widget.options.billingPostcodeFieldName:
                                    this.set(item.fieldItem.fieldName, selectedItem.Postcode);
                                    break;
                            }
                        });
                    } else {
                        // Delivery fields (both b2b and b2c)
                        $.each(vm.get("addressItemList"), function (idx, item) {
                            switch (item.fieldItem.fieldName) {
                                case widget.options.addressRulesetsAssignmentsSuburbField:
                                    this.set(item.fieldItem.fieldName, selectedItem.Name);
                                    break;

                                case widget.options.addressRulesetsAssignmentsStateField:
                                    this.set(item.fieldItem.fieldName, selectedItem.State);
                                    break;

                                case widget.options.addressRulesetsAssignmentsPostcodeField:
                                    this.set(item.fieldItem.fieldName, selectedItem.Postcode);
                                    break;
                            }
                        });
                    }
                }
            });

            // "Pickup warehouse changed" event.
            $.cv.css.bind($.cv.css.eventnames.pickupWarehouseChanged, function (msg) {
                if (widget.options.isViewOnly) {
                    // Get the address for order that the widget is using. It could be either the users current 
                    // order or some other order if have a orderNoOverride set e.g. order searching, quotes etc.
                    var pickupAddress = widget.options.orderNoOverride === 0
                                            ? $.cv.css.localGetcurrentPickupAddress()
                                            : $.cv.css.localGetSelectedOrderPickupAddress();

                    if (pickupAddress != null) {
                        viewModel.set("pickupAddress", pickupAddress);
                    }
                    return;
                }
                if (msg.warehouse == "") {
                    viewModel.clearDeliveryAddress({ noThrottle: false });

                    var soDelAddress = viewModel.getSoDelAddress();
                    soDelAddress.updatedAddressDetails.SoWhseCode = "";
                    viewModel.updateDeliveryAddress(soDelAddress, "");
                    viewModel.validateInputFields(false);
                    return;
                }

                var p = $.cv.css.storeLocator.getWarehouse({ warehouseCode: msg.warehouse });
                $.when(p).done(function (data) {
                    viewModel.set("isInitialLoad", true);

                    viewModel.set("soDelPhone", data.data[0].Phone);
                    viewModel.set("soDelCountry", "");

                    $.each(viewModel.get("addressItemList"), function (idx, item) {
                        switch (item.fieldItem.fieldName.toUpperCase()) {
                            case "SODELADDR1":
                                viewModel.set(item.fieldItem.fieldName, data.data[0].AddressLine1);
                                item[item.fieldItem.fieldName] = data.data[0].AddressLine1 // Used by the view only address widget
                                break;

                            case "SODELADDR2":
                                viewModel.set(item.fieldItem.fieldName, data.data[0].AddressLine2);
                                item[item.fieldItem.fieldName] = data.data[0].AddressLine2 // Used by the view only address widget
                                break;

                            case "SODELSUBURB":
                                viewModel.set(item.fieldItem.fieldName, data.data[0].Suburb);
                                item[item.fieldItem.fieldName] = data.data[0].Suburb // Used by the view only address widget
                                break;

                            case widget.options.pickupSuburbFieldName.toUpperCase():
                                item[item.fieldItem.fieldName] = data.data[0].Suburb // Used by the view only address widget
                                break;

                            case "SODELSTATE":
                                viewModel.set(item.fieldItem.fieldName, data.data[0].State);
                                item[item.fieldItem.fieldName] = data.data[0].State // Used by the view only address widget
                                break;

                            case widget.options.pickupStateFieldName.toUpperCase():
                                item[item.fieldItem.fieldName] = data.data[0].State // Used by the view only address widget
                                break;

                            case "SODELPOSTCODE":
                                viewModel.set(item.fieldItem.fieldName, data.data[0].Postcode);
                                item[item.fieldItem.fieldName] = data.data[0].Postcode // Used by the view only address widget
                                break;
                        }
                    });

                    widget.trigger(ADDRESSRENDERED);
                    viewModel.setLocalDeliveryAddress();
                    viewModel.validateInputFields(false);
                    viewModel.set("isInitialLoad", false);
                });
            });

            viewModel.bind("change", function (e) {
                if (!viewModel.get("isInitialLoad") && !widget.options.isViewOnly) {
                    if (e.field == "multipleDeliveryAddressValue") {
                        viewModel.multiAddressItemSelected();
                    }
                    if (e.field == "deliveryAddressValidationValue") {
                        if (widget.options.autoSelectAddressValidationValue)
                            viewModel.addressValidationItemSelected();
                    }
                    if (e.field == "orderReference") {
                        viewModel.setCustomerReference();
                    }
                    if (e.field === "addressValidated") {
                        $.cv.css.trigger($.cv.css.eventnames.addressValidationUpdated, { valid: viewModel.get("addressValidated") });
                    }
                    if (e.field === "copyOrderConfirmation") {
                        viewModel.setCopyOrderConfirmation();
                    }
                    if (((e.field == "addressItemList" || e.field == "billingAddressItemList") && e.action == "itemchange")) {
                        if (widget.options.multiUpdateThrottleTimeout == 0 || (!viewModel.get("isAddressBeingEdited") && !viewModel.get("isBillingAddressBeingEdited"))) {
                            viewModel.processLinkedAddresses(e);
                        }
                    }
                    if (e.field == "linkDeliveryAndBilling") {
                        viewModel.processLinkedAddresses(e);
                    }
                    if (e.field == "deliveryAddressMode") {
                        viewModel.deliveryAddressModeChanged(e);
                    }
                    if ((e.field == "contactFirstName" || e.field == "contactLastName" || e.field == "contactPhoneNumber") && !viewModel.get("clearingPickupContact")) {
                        viewModel.setPickupContact();
                        viewModel.validateInputFields(true);
                    }
                    if (e.field === "createUserFromGuest") {
                        viewModel.setCreateUserFromGuest();
                    }
                }
                if (!widget.options.isViewOnly) {
                    viewModel.setLocalDeliveryAddress();
                }
            });

            init();

            return viewModel;
        },

        _getDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = "";

            return html;
        },

        _getDefaultAddressViewTemplate: function () {
            var widget = this;
            // return the template to be bound to the dataSource items
            var html = "<script type='text/x-kendo-template' id='" + widget.options.itemViewTemplate + "'>"
                + "<div class='fieldContainer'><label data-bind='html: prompt'></label><span data-bind='html: fieldTemplate'></span></div>"
                + "</script>";
            return html;
        },

        _getDefaultMultipleAddressViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = "";

            return html;
        },

        _getDefaultAddressValidationViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = "";

            return html;
        }

    };

    // register the widget
    $.cv.ui.widget(deliveryAddressWidget);

})(jQuery);
