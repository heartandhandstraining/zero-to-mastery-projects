/// <reference path="../jquery-1.7.2.js" />
/*
*  TODO
*    Convert to dynamic services 
*       login
*       retrievePassword
*       changePassword
*
*/
/*
* Name: login
* Author: Aidan Thomas
* Date Created: 2013/01/04
* Description: contains logging in, change password and forgot password functionality
*
* Dependencies:    
*          --- Third Party ---
*          jquery.js (built with jquery-1.7.1.min.js)
*          kendo.web.js (kendo.web.min.js v2012.2.710)
*
*          --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.data.kendo.js
*          /Scripts/cv.ajax.js                  
*                  
* Params:
*          redirectOnLogin - Bool, reloads / redirects user to page after usccessful login or change of password
*          useCookie - Bool, shows the remoember me check box, stores the user id in a cookie after successful login when checked
*          cookieExpiry - Integer, length of time the cookie is valid for
*          
*          textPasswordMismatchError - Text, change password mismatch error message
*          textUserIdMandatory - Text, must enter a user id message
*          textPasswordChange - Text, password requires changing message
*          textPasswordChanged - Text, password successfully changed message
*          textPasswordSent - Text, password sent message
*          textEnterPassword - Text, enter a password message
*          textErrorChangingPassword - Text, error changing password message
*          
*          viewTemplate - Allows to specify an override template to be used for the view.
*          
*          textUserIdLabel - Text
*          textPasswordLabel - Text
*          textForgotPasswordLabel - Text
*          textRememberMeLabel - Text
*          textLoginButtonLabel - Text
*          textEmailMeButtonLabel - Text
*          textCancelSendPasswordButtonLabel - Text
*          textNewPasswordLabel - Text
*          textConfirmPasswordLabel - Text
*          textChangePasswordButtonLabel - Text
*          textNotificationEmailLabel - Text
*
*
*/
;
(function ($, undefined) {

    var DATABINDING = "dataBinding",
        DATABOUND = "dataBound",
        CHANGE = "change",
        LOGGEDIN = 'loggedin',
        FORGOTPASSWORDSENT = 'forgotpasswordsent',
        PASSWORDCHANGED = 'passwordchanged',
        CHANGINGPASSWORD = 'changingPassword',
        cookiekey = 'emailaddress',
        FIELDSUPDATED = "fieldsUpdated";
        FIELDSCOMPLETED = "fieldsCompleted",
        FIELDTYPEEMAIL = "email",
        FIELDTYPEDATE = "date",
        FIELDTYPEMONEY = "money",
        FIELDTYPEDOUBLE = "double",
        FIELDTYPEWEBADDRESS = "webaddress";

        var loginWidget = {


            // Standard Variables

            // widget name
            name: "login",

            // default widget options
            options: {
                inputErrorClass: "input-error",
                redirectOnLogin: true,
                overrideRedirectUrl: "",
                redirectOnChangePassword: false,
                changePasswordRedirectUrl: "",
                loadOrdersAfterLogin: true,
                useCookie: true,
                cookieExpiry: 365,
                isShowKeepMeLoggedIn: false,
                useRegistration: false,
                sendRegisterEmail: true,
                notifyEmailRequired: false, // Email Address is not valid email (i.e. its a username) or Notify Email Address is not set
                userIdRequiredAsEmail: true,
                firstNameRequiredForRegistration: true,
                surnameRequiredForRegistration: true,
                phoneNumberRequiredForRegistration: true,
                termsRequiredForRegistration: false,
                includeInBrowserHistory: false,
                registerFullName: false,
                registerFullNameField: "",
                registerUseConfirmEmail: false,
                registerUseNotifyEmail: false,
                registerUseCustomerCode: false,
                registerUseGeneratedPassword: false,
                registerInitialRole: "",
                registerCustomerCode: "",
                registerCustomerCodeField: "",
                b2bRegistrationRole: "",
                generatedPassword: "",
                clearPasswordOnMismatch: false,
                registerUseTerms: false,
                showEmailingPassword: false, // Password Recovery Mode
                clearEmailAfterPasswordEmailed: false,
                showChangingPassword: false, // Confirm Password = 'forcechange'
                clearPasswordAfterChange: true,
                clearWidgetMessages: true,
                accountSelectPageUrl: 'AccountSelect.aspx',

                // messages
                textPasswordMismatchError: 'Your passwords do not match. Please try again',
                textEmailMismatchError: "Your email addresses do not match. Please try again",
                textUserIdMandatory: 'Please enter an email address',
                textPasswordChanged: 'Password changed',
                textPasswordChangeRequired: 'You are required to change your password',
                textPasswordSent: 'Password sent to your email address',
                textEnterPassword: 'Please enter a password',
                textErrorChangingPassword: 'Error changing password',
                textErrorEnteredDateInWrongFormat: 'Date entered is in the wrong format',
                textErrorEnteredEmailInWrongFormat: 'Email entered is in the wrong format',
                textErrorEnteredDecimalInWrongFormat: 'Decimal entered in the wrong format',
                textErrorEnteredUrlInWrongFormat: 'Url entered in the wrong format',
                textRegisterMandatoryFieldsMissing: "The following fields are required:",
                textRegisterUserErrorDefaultMessage: "There was an error registering your user at this time",
                textTermsNotComplete: "You must agree to the terms and conditions",
                textMandatoryFieldNotComplete: "",
                textInvalidCaptcha: "The Validation Code you entered is incorrect",
                textB2BRegistrationCompletedMessage: "Thank you for registering. Please allow up to 48 business hours (during peak times) for your login to be validated and activated. A confirmation email of your registration has been sent to you. When your login has been fully activated another email will be sent to you with details on how to login and complete the registration process.",

                // view Template
                viewTemplate: null,
                itemViewTemplate: null,

                // standard view options
                triggerMessages: false,
                triggerRegisterMessages: false,
                textUserIdLabel: 'Email Address',
                textConfirmEmailLabel: 'Confirm Email Address',
                textPasswordLabel: 'Password',
                textForgotPasswordLabel: 'Forgot Password',
                textRememberMeLabel: 'Remember me',
                textLoginButtonLabel: 'Login',
                textEmailMeButtonLabel: 'Email Me',
                textCancelSendPasswordButtonLabel: 'Cancel',
                textNewPasswordLabel: 'New Password',
                textConfirmPasswordLabel: 'Confirm Password',
                textChangePasswordButtonLabel: 'Change Password',
                textNotificationEmailLabel: 'Notification Email Address',
                textFirstNamePrompt: "First Name",
                textSurnamePrompt: "Last Name",
                textCustomerCodePrompt: "Customer Code",
                textInitialRolePrompt: "Initial Role",
                textPhoneNumberPrompt: "Phone Number",
                textTermsPrompt: "I have read the terms & conditions",
                textKeepUserLoggedInCheckbox: "Keep me logged in",

                // others to be added to allow configuration of standard view
                validateCaptcha: false,
                gtmSuccessEventname: ''
            },

            // private property
            _viewAppended: false,

            events: [LOGGEDIN, FORGOTPASSWORDSENT, PASSWORDCHANGED, FIELDSUPDATED, CHANGINGPASSWORD],

            viewModel: null,

            view: null,

            // Standard Methods
            initialise: function (el, o) {
                var widget = this;
                // check for an internal view
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
                // now MMVM bind
                widget.viewModel = widget._getViewModel();
                var target = $(el).children(":first");
                kendo.bind(target, widget.viewModel);
                widget.trigger(DATABOUND);
                
                // after all theuser data has loaded continue with login process
                $.cv.css.bind($.cv.css.eventnames.login, function (data) {
                    var obj = widget.viewModel;
                    var redirectUrl;
                    if (widget.options.overrideRedirectUrl.length > 0) {
                        redirectUrl = widget.options.overrideRedirectUrl;
                        if (data.redirectAfterAccountSelect) {
                            redirectUrl = "/" + widget.options.accountSelectPageUrl + "?R=" + encodeURIComponent(redirectUrl);
                        }
                    } else {
                        if ($.cv.util.queryStringRedirectValue("R"))
                            redirectUrl = $.cv.util.queryStringRedirectValue("R");
                        else
                            redirectUrl = data.redirectAfterLogin;
                    }

                    if (data.result == '15' || data.result == '16') {
                        obj.set("isProcessing", false);
                        obj.set("redirectUrl", redirectUrl);
                        obj.set("changingPassword", true);
                        widget.trigger(CHANGINGPASSWORD);
                        $.cv.util.setMessage.apply(widget.viewModel, [widget.options.textPasswordChangeRequired, $.cv.css.messageTypes.info]);
                        if (data.result == '16') {
                            obj.set('notifyEmailRequired', true);
                        }
                    }
                    else {
                        widget.trigger(LOGGEDIN, { userId: obj.get("userId") }); // example of passing parameters to event handler
                        if (widget.options.redirectOnLogin && redirectUrl.length > 0) {
                            var queryStringRedirectValue = $.cv.util.queryStringRedirectValue("R", { excludedParams: ["message"] });
                            redirectUrl = $.cv.util.isNullOrWhitespace(queryStringRedirectValue) ? redirectUrl : queryStringRedirectValue;
                            $.cv.util.redirect(redirectUrl, null, false);
                        }
                    }
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

            var _getDataView = function (data) {
                var array = [];

                $.each(data, function (indexFields, fieldToUse) {
                    fieldToUse.index = indexFields;
                    array.push(_getFieldItemData(fieldToUse));
                });

                return array;
            };

            var _getDefaultDataView = function () {
                var array = [];
                array.push(_getFieldItemData({ FieldName: "userId", Prompt: widget.options.textUserIdLabel, Value: "", FieldType: widget.options.userIdRequiredAsEmail ? "email" : "varchar", Rows: 0, Columns: 0, Length: 50, Mandatory: true, Lookup: {}, isViewModelField: true }));
                if (widget.options.registerUseConfirmEmail)
                    array.push(_getFieldItemData({ FieldName: "confirmEmailAddress", Prompt: widget.options.textConfirmEmailLabel, Value: "", FieldType: "email", Rows: 0, Columns: 0, Length: 50, Mandatory: true, Lookup: {}, isViewModelField: true }));
                if (widget.options.registerUseNotifyEmail)
                    array.push(_getFieldItemData({ FieldName: "notifyEmailAddress", Prompt: widget.options.textNotificationEmailLabel, Value: "", FieldType: "email", Rows: 0, Columns: 0, Length: 50, Mandatory: viewModel.get("notifyEmailRequired"), Lookup: {}, isViewModelField: true }));
                array.push(_getFieldItemData({ FieldName: "firstName", Prompt: widget.options.textFirstNamePrompt, Value: "", FieldType: "varchar", Rows: 0, Columns: 0, Length: 50, Mandatory: widget.options.firstNameRequiredForRegistration, Lookup: {}, isViewModelField: true }));
                array.push(_getFieldItemData({ FieldName: "surname", Prompt: widget.options.textSurnamePrompt, Value: "", FieldType: "varchar", Rows: 0, Columns: 0, Length: 50, Mandatory: widget.options.surnameRequiredForRegistration, Lookup: {}, isViewModelField: true }));
                array.push(_getFieldItemData({ FieldName: "phoneNumber", Prompt: widget.options.textPhoneNumberPrompt, Value: "", FieldType: "varchar", Rows: 0, Columns: 0, Length: 50, Mandatory: widget.options.phoneNumberRequiredForRegistration, Lookup: {}, isViewModelField: true }));
                if (widget.options.registerUseGeneratedPassword) {
                    array.push(_getFieldItemData({ FieldName: "password", Prompt: widget.options.textPasswordLabel, Value: widget.options.generatedPassword, FieldType: "password", Rows: 0, Columns: 0, Length: 50, Mandatory: true, Lookup: {}, isViewModelField: true }));
                    array.push(_getFieldItemData({ FieldName: "confirmPassword", Prompt: widget.options.textConfirmPasswordLabel, Value: widget.options.generatedPassword, FieldType: "password", Rows: 0, Columns: 0, Length: 50, Mandatory: true, Lookup: {}, isViewModelField: true }));
                    viewModel.set("password", widget.options.generatedPassword);
                    viewModel.set("confirmPassword", widget.options.generatedPassword);
                } else {
                    array.push(_getFieldItemData({ FieldName: "password", Prompt: widget.options.textPasswordLabel, Value: "", FieldType: "password", Rows: 0, Columns: 0, Length: 50, Mandatory: true, Lookup: {}, isViewModelField: true }));
                    array.push(_getFieldItemData({ FieldName: "confirmPassword", Prompt: widget.options.textConfirmPasswordLabel, Value: "", FieldType: "password", Rows: 0, Columns: 0, Length: 50, Mandatory: true, Lookup: {}, isViewModelField: true }));
                }
                if (widget.options.registerUseCustomerCode)
                    array.push(_getFieldItemData({ FieldName: "customerCode", Prompt: "", Value: widget.options.registerCustomerCode, FieldType: "varchar", Rows: 0, Columns: 0, Length: 50, Mandatory: true, Lookup: {}, isViewModelField: true }));
                if (widget.options.registerUseTerms)
                    array.push(_getFieldItemData({ FieldName: "terms", Prompt: widget.options.textTermsPrompt, Value: "", FieldType: "bool", Rows: 0, Columns: 0, Length: 1, Mandatory: widget.options.termsRequiredForRegistration, Lookup: { regex: /true/ }, isViewModelField: true, MandatoryMessage: widget.options.textTermsNotComplete }));

                if (widget.options.validateCaptcha)
                    array.push(_getFieldItemData({ FieldName: "captchaText", Prompt: "Please enter the validation code", Value: "", FieldType: "varchar", Rows: 0, Columns: 0, Length: 6, Mandatory: true, Lookup: {}, isViewModelField: true, MandatoryMessage: "The Validation Code is required" }));

                return array;
            };

            var _getFieldItemData = function (fieldToUse) {
                if(widget.options.textMandatoryFieldNotComplete.trim() != "")
                    fieldToUse.MandatoryMessage = widget.options.textMandatoryFieldNotComplete;
                var dataItem = $.cv.util.getFieldItemData(fieldToUse);

                // trigger event for field change as some use keyup, others use click/blur etc
                dataItem.dataChanged = function (e) {
                    var fieldItem = e.data["fieldItem"];
                    var val = e.data[fieldItem.fieldName];
                    dataItem.fieldValid(e);
                    if (fieldItem.isViewModelField) {
                        viewModel.set(fieldItem.fieldName, val);
                    }
                    if (widget.options.registerCustomerCodeField === fieldItem.fieldName) {
                        widget._setCustomerCode(val);
                    }
                };

                return dataItem;
            };

            var _getMandatoryFieldList = function (data) {
                var itemList = viewModel.get("itemList"), mandatoryArray = [];
                $.each(itemList, function (idx, item) {
                    if (item.fieldItem.mandatory) {
                        var emptyMsg = item.prompt;
                        if (item.fieldItem && item.fieldItem.FieldName === "captchaText")
                            emptyMsg = "Validation Code";

                        mandatoryArray.push($.extend(item, { emptyMessage: emptyMsg}));
                    }
                });

                viewModel.set("mandatoryFieldList", mandatoryArray);
            };

            var initDataSource = function () {
                if (widget.options.useRegistration) {
                    var opts = {};
                    opts.roleName = widget.options.b2bRegistrationRole;

                    var d1 = $.cv.css.user.getUserRegistrationFieldDataForRole(opts);

                    d1.done(function (msg) {
                        var userRegistrationFieldData = msg.data.userRegistrationFieldData;
                        var dataListTemplates = _getDefaultDataView();

                        if (userRegistrationFieldData && userRegistrationFieldData.length > 0) {
                            dataListTemplates = $.merge(dataListTemplates, _getDataView(userRegistrationFieldData));
                        }

                        widget.viewModel.set('itemList', dataListTemplates);
                        widget.trigger(FIELDSUPDATED, { count: dataListTemplates.length });
                        _getMandatoryFieldList();
                        widget.viewModel.resetCaptcha();
                    });
                }
            };
            
            var viewModel = $.extend(kendo.observable(widget.options),
                {
                    userId: widget.options.useRegistration ? "" : widget.options.useCookie ? ($.cookie(cookiekey) ? $.cookie(cookiekey) : '') : '',

                    confirmEmailAddress: "",

                    firstName: "",

                    surname: "",

                    fullName: function () {
                        var firstName = this.get("firstName"), surname = this.get("surname");
                        return firstName + ($.trim(firstName).length == 0 ? "" : " ") + surname;
                    },

                    phoneNumber: "",

                    inputEventKeyUp: function (event) {
                        this.userIdKeyUp(event);
                    },

                    userIdKeyUp: function (event) {
                        if (event.which == 13) {
                            // stops the form from submitting when using the widget on a page that has form submit buttons
                            event.preventDefault();
                            event.stopPropagation();
                            if (widget.options.useRegistration) {
                                this.register();
                            } else {
                                if (!this.get("emailingPassword"))
                                    this.login();
                                else
                                    this.emailPassword();
                            }
                        }
                    },

                    password: '',

                    confirmPassword: "",

                    passwordEnabled: function () {
                        return this.get("userId").length > 0;
                    },

                    rememberMe: ($.cookie(cookiekey) != null),

                    keepMeLoggedIn: false,

                    changingPassword: widget.options.showChangingPassword,

                    emailingPassword: widget.options.showEmailingPassword,

                    emailPasswordSent: false,

                    changePassword1: '',

                    changePassword2: '',

                    changePasswordKeyUp: function (event) {
                        if (event.which == 13) {
                            // stops the form from submitting when using the widget on a page that has form submit buttons
                            event.preventDefault();
                            event.stopPropagation();
                            this.changePassword();
                        }
                    },

                    notifyEmailAddress: '',

                    notifyEmailRequired: widget.options.registerUseNotifyEmail && widget.options.notifyEmailRequired,

                    customerCode: widget.options.registerCustomerCode,

                    initialRole: widget.options.registerInitialRole,

                    itemList: [],

                    mandatoryFieldList: [],

                    redirectUrl: '',

                    isProcessing: false,

                    message: '',

                    type: '',

                    isB2BRegistrationCompleted: false,

                    captchaText: "",

                    captchaImageUrl: "/ValidationImage.aspx?rand=" + $.now(),

                    resetCaptcha: function (setIsProcessing) {
                        var vm = this;
                        setIsProcessing = $.cv.util.hasValue(setIsProcessing) && typeof (setIsProcessing) == "boolean" ? setIsProcessing : true;
                        vm.set("isCaptureResetting", setIsProcessing);

                        // Locate the actual field item from the itemList so can set the value on it to be cleared, this will trigger change event on it which will update the bound viewmodel property of same name.
                        var captchaField = $.grep(this.get("itemList"), function (item) { return item.fieldItem.fieldName === "captchaText" })[0];

                        if (captchaField && captchaField.fieldItem) {
                            captchaField.set(captchaField.fieldItem.FieldName, "");
                        }

                        $.cv.css.generateCaptcha().done(function () {
                            vm.set("captchaImageUrl", "/ValidationImage.aspx?rand=" + $.now());
                            vm.set("isCaptureResetting", false);
                        });
                    },

                    hasMessage: function () {
                        return this.get("message").length > 0;
                    },

                    clearMessage: function () {
                        this.set("message", "");
                        if (widget.options.triggerMessages || widget.options.triggerRegisterMessages)
                            $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: 'login', clearExisting: true });
                    },

                    _setRememberMeCookie: function() {
                        var vm = this;
                        if (widget.options.useCookie) {
                            if (vm.get("rememberMe"))
                                $.cookie(cookiekey, vm.get("userId"), { expires: widget.options.cookieExpiry });
                            else
                                $.removeCookie(cookiekey);
                        }
                    },

                    login: function (e) {
                        var obj = this;
                        // validate
                        if (obj.get("userId").length == 0) {
                            $.cv.util.setMessage.apply(widget.viewModel, [widget.options.textUserIdMandatory, $.cv.css.messageTypes.error]);
                            return;
                        }
                        $.cv.util.clearMessage.apply(widget.viewModel);

                        this.set("isProcessing", true);

                        _.extend($.cv.css._proxyMeta, $.cv.util.getBaseProxyMeta(widget));
                        $.cv.css.login(obj.get("userId"), obj.get("password"), {
                                                   loadOrdersAfterLogin: widget.options.loadOrdersAfterLogin,
                            keepMeLoggedIn: obj.get("keepMeLoggedIn"),
                            // Google Tag Manager: this method will be proxied to handle the
                            // relevant value below, otherwise it will be ignored.
                            gtmSuccessEventname: widget.options.gtmSuccessEventname

                        }).done(function (msg) {
                            var data = msg.data;

                            if (data.result == '0' || data.result == '15' || data.result == '16') {
                                obj._setRememberMeCookie();
                            } else {
                                obj.set("isProcessing", false);
                                $.cv.util.setMessage.apply(widget.viewModel, [data.responseMessage, $.cv.css.messageTypes.error]);
                            }
                        }).fail(function (msg) {
                            obj.set("isProcessing", false);
                            msg = JSON.parse(msg.responseText);
                            $.cv.util.setMessage.apply(widget.viewModel, [msg.message, $.cv.css.messageTypes.error]);
                        });
                    },

                    forgotPassword: function () {
                        var obj = this;
                        $.cv.util.clearMessage.apply(widget.viewModel);
                        obj.set("changingPassword", false);
                        obj.set("emailingPassword", true);
                    },

                    emailPassword: function (e) {
                        var obj = this;
                        // validate email
                        if (this.get("userId").length == 0) {
                            $.cv.util.setMessage.apply(widget.viewModel, [widget.options.textUserIdMandatory, $.cv.css.messageTypes.error]);
                            return;
                        }

                        this.set("isProcessing", true);
                        var d = $.cv.css.retrieveUserPassword({ username: this.get("userId") });

                        $.when(d).done(function (msg) {
                            var data = msg.data;
                            obj.set("isProcessing", false);
                            if (data.result) {
                                obj.set("emailingPassword", widget.options.showEmailingPassword);
                                obj.set("emailPasswordSent", true);
                                widget.trigger(FORGOTPASSWORDSENT);
                                obj._setRememberMeCookie();
                                if (widget.options.clearEmailAfterPasswordEmailed) {
                                    obj.set("userId", "");
                                }
                                $.cv.util.setMessage.apply(widget.viewModel, [data.responseMessage, $.cv.css.messageTypes.success]);
                            }
                            else {
                                $.cv.util.setMessage.apply(widget.viewModel, [data.responseMessage, $.cv.css.messageTypes.error]);
                            }
                        }).fail(function (msg) {
                            obj.set("isProcessing", false);
                            msg = JSON.parse(msg.responseText);
                            $.cv.util.setMessage.apply(widget.viewModel, [msg.errorMessage, $.cv.css.messageTypes.error]);
                        });
                    },

                    cancelEmailPassword: function () {
                        this.set("emailingPassword", false);
                    },

                    changePassword: function (e) {
                        var obj = this;
                        var op = obj.get("password");
                        var usr = $.cv.css.localGetUser();
                        // validate
                        var p1 = this.get("changePassword1");
                        var p2 = this.get("changePassword2");
                        if (p1 != p2) {
                            $.cv.util.setMessage.apply(widget.viewModel, [widget.options.textPasswordMismatchError, $.cv.css.messageTypes.error]);
                            if (widget.options.clearPasswordOnMismatch) {
                                this.set("changePassword1","");
                                this.set("changePassword2","");
                            }      
                            return;
                        }
                        if (p1.length == 0) {
                            $.cv.util.setMessage.apply(widget.viewModel, [widget.options.textEnterPassword, $.cv.css.messageTypes.error]);
                            return;
                        }
                        // call WS
                        this.set("isProcessing", true);
                        this.clearMessage();
                        var d = $.cv.css.changeUserPassword({
                            username: obj.get("userId"),
                            newPassword: p1,
                            newPasswordConfirm: p2,
                            notifyEmail: obj.get('notifyEmailAddress')
                        });
                        $.when(d).done(function (msg) {
                            var data = msg.data;
                            if (data.result) {
                                $.cv.util.clearMessage.apply(widget.viewModel);
                                widget.trigger(PASSWORDCHANGED);
                                $.cv.util.setMessage.apply(widget.viewModel, [widget.options.textPasswordChanged, $.cv.css.messageTypes.success]);
                                if ((obj.get("redirectUrl").length > 0 && widget.options.redirectOnLogin) || (widget.options.redirectOnChangePassword && widget.options.changePasswordRedirectUrl.length > 0)) {
                                    if ((obj.get("redirectUrl").length > 0 && widget.options.redirectOnLogin)) {
                                        $.cv.util.redirect(obj.get("redirectUrl"), null, false);
                                    } else {
                                        $.cv.util.redirect(widget.options.changePasswordRedirectUrl, null, false);
                                    }
                                } else {
                                    obj.set("isProcessing", false);
                                    if (widget.options.clearPasswordAfterChange) {
                                        obj.set("changePassword1", "");
                                        obj.set("changePassword2", "");
                                    }
                                    obj.set("changingPassword", widget.options.showChangingPassword);
                                }
                            }
                            else {
                                obj.set("isProcessing", false);
                                $.cv.util.setMessage.apply(widget.viewModel, [data.responseMessage, $.cv.css.messageTypes.error]);
                            }
                        }).fail(function (msg) {
                            obj.set("isProcessing", false);
                            msg = JSON.parse(msg.responseText);
                            $.cv.util.setMessage.apply(widget.viewModel, [msg.errorMessage, $.cv.css.messageTypes.error]);
                        });
                    },

                    getRegisterOptions: function () {
                        var opts = {};
                        opts.EmailAddress = this.get("userId");
                        opts.NotifyEmailAddress = this.get("notifyEmailAddress");
                        opts.FirstName = this.get("firstName");
                        opts.Surname = this.get("surname");
                        opts.Password = this.get("password");
                        opts.PhoneNumber = this.get("phoneNumber");
                        opts.sendEmail = widget.options.sendRegisterEmail;
                        if (!$.cv.util.isNullOrWhitespace(this.get("customerCode")) && !$.cv.util.isNullOrWhitespace(this.get("initialRole"))){
                            opts.CustomerCode = this.get("customerCode");
                            opts.initialRole = this.get("initialRole");
                            opts.setCustAndRole = true;
                        }

                        if (widget.options.b2bRegistrationRole.length > 0)
                            opts.b2bRegRole = widget.options.b2bRegistrationRole;

                        $.each(this.get("itemList"), function (idx, item) {
                            if (!item.fieldItem.isViewModelField) {
                                var val = this.get(item.fieldItem.fieldName);
                                if (val == null && item.fieldItem.FieldType != "date") {
                                    val = "";
                                }
                                if (val != null && val.toString() != "true" && val.toString() != "false" && $.type(val) !== "date") {
                                    opts[item.fieldItem.fieldName] = val.toString();
                                } else {
                                    opts[item.fieldItem.fieldName] = val;
                                }
                            }
                        });
                        if (widget.options.registerFullName && widget.options.registerFullNameField != "")
                            opts[widget.options.registerFullNameField] = this.fullName();
                        return opts;
                    },

                    setValidationError: function (item, message) {
                        if (item && item.setError && item.fieldItem) {
                            item.setError(item.fieldItem, message, message.length > 0 ? item.fieldItem.classForErrors : "");
                        }
                    },

                    checkAllRequiredFields: function () {
                        var allFieldsPopulated = true, emptyFields = "", mandatoryFieldList = this.get("mandatoryFieldList"), itemList = this.get("itemList"), _this = this, fieldGroupItem = [];
                        $.each(mandatoryFieldList, function (idx, item) {
                            if (!item.fieldItem.parent().fieldValid({ data: item.fieldItem.parent() }, true)) {
                                allFieldsPopulated = false;
                                emptyFields += ", " + item.emptyMessage;
                            }
                        });

                        if (emptyFields !== "") {
                            emptyFields = widget.options.textRegisterMandatoryFieldsMissing + " " + emptyFields.substring(1);
                            $.cv.util.setMessage.apply(widget.viewModel, [emptyFields, $.cv.css.messageTypes.error]);
                        }
                        return allFieldsPopulated;
                    },

                    checkPasswordsMatch: function () {
                        var passwordsMatch = true;
                        var passwordField = $.grep(this.get("itemList"), function (item) { return item.fieldItem.fieldName == "confirmPassword" })[0];
                        this.setValidationError(passwordField, "");
                        if (this.get("password") != this.get("confirmPassword")) {
                            passwordsMatch = false;
                            $.cv.util.setMessage.apply(widget.viewModel, [widget.options.textPasswordMismatchError, $.cv.css.messageTypes.error]);
                            this.setValidationError(passwordField, widget.options.textPasswordMismatchError);
                        }
                        return passwordsMatch;
                    },

                    checkEmailAddressMatch: function () {
                        var emailsMatch = true;
                        if (widget.options.registerUseConfirmEmail) {
                            var emailField = $.grep(this.get("itemList"), function (item) { return item.fieldItem.fieldName == "confirmEmailAddress" })[0];
                            this.setValidationError(emailField, "");
                            if (this.get("userId") != this.get("confirmEmailAddress")) {
                                emailsMatch = false;
                                $.cv.util.setMessage.apply(widget.viewModel, [widget.options.textEmailMismatchError, $.cv.css.messageTypes.error]);
                                this.setValidationError(emailField, widget.options.textEmailMismatchError);
                            }
                        }
                        return emailsMatch;
                    },

                    register: function () {
                        var _this = this;
                        _this.clearMessage();
                        if (this.checkAllRequiredFields() && this.checkPasswordsMatch() && this.checkEmailAddressMatch()) {
                            var opts = _this.getRegisterOptions();
                            _this.set("isProcessing", true);

                            var prom = $.Deferred();
                            var ok = true;
                            // Pre-validate captcha before submitting
                            if (widget.options.validateCaptcha === true) {
                                var text = _this.get("captchaText");

                                if (text && text.length > 0) {
                                    var validated = $.cv.css.validateCaptcha(text);

                                    validated.done(function (response) {
                                        if (response.data.Success) {
                                            prom.resolve();
                                        } else {
                                            _this.set("isProcessing", false);
                                            prom.reject();
                                            ok = false;
                                            var triggerMessages = _this.get("triggerMessages");
                                            _this.set("triggerMessages", widget.options.triggerRegisterMessages);
                                            $.cv.util.setMessage.apply(widget.viewModel, [widget.options.textInvalidCaptcha, $.cv.css.messageTypes.error]);
                                            _this.set("triggerMessages", triggerMessages);
                                            _this.resetCaptcha(false);
                                        }
                                    });
                                } else {
                                    // Otherwise if empty, will already have been handled in checkAllRequiredFields()
                                    prom.reject();
                                    ok = false;
                                } 

                            } else {
                                prom.resolve();
                            }
                            
                            prom.done(function () {
                                if (ok) {
                                    var d1 = $.cv.css.user.registerUser(opts);
                                    d1.done(function(msg) {
                                        var data = msg.data

                                        if (!data.sessionHasTimedOut) {
                                            if (data.result == true) {
                                                if (widget.options.b2bRegistrationRole.length === 0)
                                                    _this.login();
                                                else {
                                                    _this.set("isProcessing", false);
                                                    _this.set("isB2BRegistrationCompleted", true);
                                                }
                                            } else {
                                                _this.set("isProcessing", false);
                                                // this will allow you to not trigger validation messages and display only inline messages except for any error comes back from the dynamic service
                                                var triggerMessages = _this.get("triggerMessages");
                                                _this.set("triggerMessages", widget.options.triggerRegisterMessages);
                                                $.cv.util.setMessage.apply(widget.viewModel, [data.responseMessage, $.cv.css.messageTypes.error]);
                                                _this.set("triggerMessages", triggerMessages);
                                            }
                                        }
                                    }).fail(function(msg) {
                                        _this.set("isProcessing", false);
                                        // this will allow you to not trigger validation messages and display only inline messages except for any error comes back from the dynamic service
                                        var triggerMessages = _this.get("triggerMessages");
                                        _this.set("triggerMessages", widget.options.triggerRegisterMessages);
                                        $.cv.util.setMessage.apply(widget.viewModel, [widget.options.textRegisterUserErrorDefaultMessage, $.cv.css.messageTypes.error]);
                                        _this.set("triggerMessages", triggerMessages);
                                    });
                                }
                            });
                        }
                    }
                });

            initDataSource();

            return viewModel;
        },

        _setCustomerCode: function (val) {
            var widget = this;
            var customerCode = $.cv.util.isNullOrWhitespace(val) ? widget.options.registerCustomerCode : val.substring(1, val.length);
            widget.viewModel.set("customerCode", customerCode);
        },

        _getDefaultViewTemplate: function () {
            var widget = this;
            var html =
                "<div id='LoginWrapper'>"
                    // login
                    + "<div id='LoginContainer' data-bind='invisible: changingPassword'>"
                        + "<label id='UserIdLabel'>#= textUserIdLabel #</label>"
                        + "<input id='UserIdInput' type='text' data-bind='value: userId' data-value-update='keyup' />"
                        + "<label id='PasswordLabel' data-bind='invisible: emailingPassword'>#= textPasswordLabel #</label>"
                        + "<input id='PasswordInput' type='password' data-bind='value: password, enabled: passwordEnabled, invisible: emailingPassword, events:{keyup: userIdKeyUp}' />"
                        + "# if (useCookie) { #"
                        + "<label id='RememberMeLabel' data-bind='invisible: emailingPassword'>#= textRememberMeLabel #</label>"
                        + "<input id='RememberMeInput' type='checkbox' data-bind='checked: rememberMe, invisible: changingPassword, invisible: emailingPassword' />"
                        + "# } #"                        
                        + "# if (isShowKeepMeLoggedIn) { #"
                        + "<label id='KeepMeLoggedInLabel' data-bind='invisible: emailingPassword'>#= textKeepUserLoggedInCheckbox #</label>"
                        + "<input id='KeepMeLoggedInInput' type='checkbox' data-bind='checked: keepMeLoggedIn, invisible: changingPassword, invisible: emailingPassword' />"
                        + "# } #"
                        // email password
                        + "<input id='LoginButton' type='button' value='#= textLoginButtonLabel #' data-bind='click: login, invisible: emailingPassword' />"
                        + "<input id='EmailMeButton' type='button' value='#= textEmailMeButtonLabel #' data-bind='click: emailPassword, visible: emailingPassword' />"
                        + "<input id='CancelSendPasswordButton' type='button' value='#= textCancelSendPasswordButtonLabel #' data-bind='click: cancelEmailPassword, visible: emailingPassword' />"
                        + "<a id='ForgotPasswordLink' href='javascript:void(0)' data-bind='click: forgotPassword, invisible: emailingPassword'>#= textForgotPasswordLabel #</a>"
                    + "</div>"
                    // change password / notify email address
                    + "<div id='ChangePasswordContainer' data-bind='visible: changingPassword'>"
                        + "<label id='NewPasswordLabel'>#= textNewPasswordLabel #</label>"
                        + "<input id='NewPasswordInput' type='password' data-bind='value: changePassword1, events:{keyup: changePasswordKeyUp ' />"
                        + "<label id='ConfirmPasswordLabel'>#= textConfirmPasswordLabel #</label>"
                        + "<input id='ConfirmPasswordInput' type='password' data-bind='value: changePassword2, events:{keyup: changePasswordKeyUp}' />"
                        + "<label id='NotificationEmailLabel' data-bind='visible: notifyEmailRequired'>#= textNotificationEmailLabel #</label>"
                        + "<input id='NotificationEmailInput' type='email' data-bind='value: notifyEmailAddress, visible: notifyEmailRequired, events:{keyup: changePasswordKeyUp}' />"
                        + "<input id='ChangePasswordButton' type='button' data-bind='click: changePassword' value='#= textChangePasswordButtonLabel #' />"
                    + "</div>"
                    + "<span id='ErrorMessageContainer' data-bind='html: message'></span>"
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

    }

    // register the widget

    $.cv.ui.widget(loginWidget);

})(jQuery);
