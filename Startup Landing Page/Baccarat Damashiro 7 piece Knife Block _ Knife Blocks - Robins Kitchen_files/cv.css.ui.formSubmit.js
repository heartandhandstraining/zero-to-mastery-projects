/* Name: Sorter Widget
* Author: Aidan Thomas 
* Created: 20130220
*
* Dependencies:    
*          --- Third Party ---
*          jquery.js 
*          kendo.web.js
*
*           --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.util.js
*          /cv.css.js
*          /cv.css.user.js
* 
* Params:  
*           mailTo: 
*           emailFrom: 
*           redirectTemplate: 
*           redirectRoute: 
*           subject: 
*           emailTemplateName: 
*           questionnaireCode: 
*           formFieldTypes: 
*           formFieldPrefix: 
*           formHiddenFields: 
*           fieldsStored: 
*           postmode:
*           viewTemplate: kendo template id for the main view
*/
// TODO: Create default view?
;
(function ($, undefined) {

    var BEFORESUCCESSFULFORMSUBMIT = 'beforesuccessfulformsubmit',
        FORMSUBMITTED = 'formsubmitted',
        FORMSUBMITFAIL = 'formsubmitfail';

    var formSubmitWidget = {


        // Standard Variables

        // widget name
        name: "formSubmit",

        // widget extension
        extend: "mvvmwidget",

        // default widget options
        options: {
            // viewModel defaults
            mailTo: '',
            emailFrom: 'info@commercevision.com.au',
            redirectTemplate: '',
            redirectRoute: '',
            subject: '',
            emailTemplateName: '',
            questionnaireCode: '',
            formFieldTypes: 'input,select,textarea',
            formFieldPrefix: 'CVFormField_',
            formHiddenFields: 'mailto,EmailFrom,redirectroute,Subject,EmailTemplate,QuestionnaireCode,postmode',
            fieldsStored: '',
            postmode: 'emailform',
            // viewModel flags

            // events

            // view flags
            validateCaptcha: false,
            getCurrentUserEmail: true,
            loadQuestionnaireFields: false,
            triggerMessages: false,

            // view text defaults
            invalidCapture: "Incorrect validation code",
            captureRequired: "The validation code is required",

            // view Template
            viewTemplate: '', // treat like its an id

            validationOptions: $.cv.util.kendoValidatorRules
        },

        extendEvents: [BEFORESUCCESSFULFORMSUBMIT, FORMSUBMITTED, FORMSUBMITFAIL],

        initialise: function (el, o) {
            var widget = this;
        },

        // MVVM Support

        viewModelBinding: function () {
            var widget = this;
        },

        viewModelBound: function () {
            var widget = this;

            widget.viewModel.setFormFields();
        },

        // private functions
        _getDataView: function (data) {
            var widget = this, array = [];
            $.each(data, function (idx, item) {
                // add standard commands
                item.index = idx;
                var dataItem = $.cv.util.getFieldItemData(item);
                array.push(dataItem);
            });
            return array;
        },

        // private function
        _getQuestionnaireFields: function () {
            var widget = this;
            $.cv.css.questionnaire.questionnaireFields({ questionnaireCode: widget.options.questionnaireCode }).done(function (msg) {
                var data = msg.data
                if (data && data.Success) {
                    widget.viewModel.set("questionnaireFields", widget._getDataView(data.FieldData));
                    widget.options.fieldsStored = _.pluck(data.FieldData, 'FieldName').join(",");
                    widget.viewModel.set("showCapture", data.SpamValidation);
                    widget.options.validateCaptcha = data.SpamValidation;
                    widget.viewModel.resetCaptcha();
                    widget.viewModel.set("showAttachmentUpload", data.AttachmentUpload);
                    widget.viewModel.set("fieldToEmail", data.FieldToEmail);
                    widget.viewModel.set("useUserEmailAsSenderAddress", data.UseUserEmailAsSenderAddress);
                    $.cv.util.bindKendoWidgets($(widget.element[0]));
                    $.cv.css.trigger($.cv.css.eventnames.questionnaireLoaded, { Code: widget.options.questionnaireCode });
                }
            });
        },

        // private function
        _getViewModel: function () {
            var widget = this;
            return widget._getDefaultViewModel();
        },

        _getDefaultViewModel: function () {
            var widget = this;

            var initFormFields = function () {
                var fieldsStored = widget.options.fieldsStored.length > 0 ? widget.options.fieldsStored.split(',') : "";

                $(widget.element).find(widget.options.formFieldTypes).each(function (i, el) {
                    var $el = $(el);

                    // Ignore the captcha field as it MUST remain exactly with this name
                    if ($el.attr("name") === "_cvTemplateCaptcha") {
                        return true; // continue;
                    }

                    if ($el.attr("name") && $el.attr("name").indexOf(widget.options.formFieldPrefix) < 0) {
                        if (fieldsStored.length === 0) {
                            $el.attr("name", widget.options.formFieldPrefix + $el.attr("name"));
                        } else {
                            if ($.inArray($el.attr('name'), fieldsStored) > -1)
                                $el.attr("name", widget.options.formFieldPrefix + $el.attr("name"));
                        }
                    }
                });
            };


            var viewModel = kendo.observable({
                // Properties for UI elements
                postmode: widget.options.postmode,

                mailTo: widget.options.mailTo,

                emailFrom: widget.options.emailFrom,

                redirectTemplate: widget.options.redirectTemplate,

                redirectRoute: widget.options.redirectRoute,

                subject: widget.options.subject,

                emailTemplateName: widget.options.emailTemplateName,

                questionnaireCode: widget.options.questionnaireCode,

                formHiddenFields: widget.options.formHiddenFields,

                questionnaireFields: [],

                captchaText: '',

                loggedInUserEmail: '',

                captchaImageUrl: '/ValidationImage.aspx?rand=' + $.now(),

                isProcessing: false,

                isCaptureResetting: false,

                showCapture: false,

                showAttachmentUpload: false,

                fieldToEmail: "",

                useUserEmailAsSenderAddress: false,

                message: "",

                setMessage: function (message, type) {
                    $.cv.util.notify(this, message, type, {
                        triggerMessages: widget.options.triggerMessages,
                        source: widget.name
                    });
                },

                clearMessage: function () {
                    this.setMessage("", "");
                },

                formHiddenFieldsDataSource: function () {
                    var vs = this.get("formHiddenFields");
                    return vs.split(",");
                },

                initFormFields: function() {
                    initFormFields();
                },

                setFormFields: function () {
                    if (!widget.options.loadQuestionnaireFields) {
                        this.initFormFields();
                    } else {
                        widget._getQuestionnaireFields();
                    }
                },

                resetCaptcha: function (setIsProcessing) {
                    if (widget.options.validateCaptcha === true) {
                        setIsProcessing = $.cv.util.hasValue(setIsProcessing) && typeof (setIsProcessing) == "boolean" ? setIsProcessing : true;
                        viewModel.set("isCaptureResetting", setIsProcessing);
                        viewModel.set('captchaText', '');

                        $.cv.css.generateCaptcha().done(function () {
                            viewModel.set('captchaImageUrl', '/ValidationImage.aspx?rand=' + $.now());
                            viewModel.set("isCaptureResetting", false);
                        });
                    }
                },

                inputKeyUp: function (event) {
                    if (event.which == 13) {
                        // stops the form from submitting when using the widget on a page that has form submit buttons
                        event.preventDefault();
                        event.stopPropagation();
                        this.submitForm(event);
                    }
                },

                // UI Element state


                // retrieves the email address from the field that's been specified as the field to be used as the user's email address
                getSenderEmail: function (fieldToEmail) {
                    var emailFrom = "";

                    if (!$.cv.util.isNullOrWhitespace(fieldToEmail)) {
                        var fields = _.filter(viewModel.get("questionnaireFields"), function(item) {
                            return item.fieldItem.FieldName === fieldToEmail;
                        });
                        if (fields.length > 0) {
                            emailFrom = fields[0].get(fieldToEmail);
                        }
                    }

                    return emailFrom;
                },

                // functions for UI events
                submitForm: function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var _this = this;
                    _this.set("isProcessing", true);
                    this.clearMessage();

                    // Validation: We need it now so set it up.
                    var $widgetElement = $(widget.element);
                    var validator = $widgetElement.data("kendoValidator");

                    if (!validator && $widgetElement.kendoValidator) {
                        $widgetElement.kendoValidator(widget.options.validationOptions);
                        validator = $widgetElement.data("kendoValidator");
                    }

                    if (viewModel.get("useUserEmailAsSenderAddress")) {
                        var emailFrom = this.getSenderEmail(viewModel.get("fieldToEmail"));
                        if (!$.cv.util.isNullOrWhitespace(emailFrom)) {
                            viewModel.set("emailFrom", emailFrom);
                        }
                    }

                    // Validate: Return if not valid so user forced to enter valid values.
                    if (validator && !validator.validate()) {
                        _this.set("isProcessing", false);
                        return;
                    }

                    var prom = $.Deferred();

                    // Pre-validate captcha before submitting
                    if (widget.options.validateCaptcha === true) {
                        var text = this.get('captchaText');

                        if (text && text.length > 0) {
                            var validated = $.cv.css.validateCaptcha(text);

                            validated.done(function (response) {
                                if (response.data.Success) {
                                    prom.resolve();
                                } else {
                                    _this.set("isProcessing", false);
                                    prom.reject();
                                    widget.trigger(FORMSUBMITFAIL, { missingFields: 'cvTemplateCaptcha' });
                                    viewModel.setMessage(widget.options.invalidCapture, $.cv.css.messageTypes.error);
                                    viewModel.resetCaptcha(false);
                                }
                            });
                        } else {
                            _this.set("isProcessing", false);
                            prom.reject();
                            widget.trigger(FORMSUBMITFAIL, { missingFields: 'cvTemplateCaptcha' });
                            viewModel.setMessage(widget.options.captureRequired, $.cv.css.messageTypes.error);
                            viewModel.resetCaptcha(false);
                        }
                    } else {
                        prom.resolve();
                    }

                    prom.done(function () {
                        // Submit
                        viewModel.removeFormHiddenFields();
                        if (viewModel.get("postmode") != '' && viewModel.get("mailTo") != '' && viewModel.get("emailFrom") != '' && (viewModel.get("redirectTemplate") != '' || viewModel.get("redirectRoute") != '') && viewModel.get("subject") != '' && viewModel.get("emailTemplateName") != '') {
                            viewModel.insertFormHiddenFields();

                            $('form:first').attr('action', "/post.aspx?mailto=" + viewModel.get("mailTo") + "&RedirectTemplate=" + (viewModel.get("redirectTemplate") == '' ? viewModel.get("redirectRoute") : viewModel.get("redirectTemplate")) + "&Subject=" + encodeURIComponent(viewModel.get("subject")) + "&EmailTemplate=" + viewModel.get("emailTemplateName"));
                            if (widget.options.loadQuestionnaireFields) {
                                widget.viewModel.initFormFields();
                            }
                            widget.trigger(BEFORESUCCESSFULFORMSUBMIT);
                            $.cv.css.trigger($.cv.css.eventnames.questionnaireBeforeSubmit);
                            $('form:first').submit();
                            widget.trigger(FORMSUBMITTED);
                        }
                        else {
                            var missingFields = '';
                            missingFields += viewModel.get("mailTo") == '' ? 'mailto,' : '';
                            missingFields += viewModel.get("emailFrom") == '' ? 'emailFrom,' : '';
                            missingFields += (viewModel.get("redirectTemplate") == '' && viewModel.get("redirectRoute") == '') ? 'redirectTemplate or redirectRoute,' : '';
                            missingFields += viewModel.get("subject") == '' ? 'subject,' : '';
                            missingFields += viewModel.get("emailTemplateName") == '' ? 'emailTemplateName,' : '';
                            missingFields = missingFields.substring(0, missingFields.length - 1);

                            widget.trigger(FORMSUBMITFAIL, { missingFields: missingFields });
                            _this.set("isProcessing", false);
                        }
                    });
                },

                removeFormHiddenFields: function () {
                    for (var i = 0; i < this.formHiddenFieldsDataSource().length; i++) {
                        $('input[name="' + this.formHiddenFieldsDataSource()[i] + '"]').remove();
                    }
                },

                insertFormHiddenFields: function () {
                    var form = $("form:first");
                    $(form).append("<input name='postmode' value='" + this.get("postmode") + "' type='hidden'>");
                    $(form).append("<input name='mailto' value='" + this.get("mailTo") + "' type='hidden'>");
                    $(form).append("<input name='EmailFrom' value='" + this.get("emailFrom") + "' type='hidden'>");
                    this.get("redirectTemplate") == '' ? $(form).append("<input name='redirectroute' value='" + this.get("redirectRoute") + "' type='hidden'>") : $(form).append("<input name='RedirectTemplate' value='" + this.get("redirectTemplate") + "' type='hidden'>");

                    $(form).append("<input name='Subject' value='" + this.get("subject") + "' type='hidden'>");
                    $(form).append("<input name='EmailTemplate' value='" + this.get("emailTemplateName") + "' type='hidden'>");
                    if (this.get("questionnaireCode") != '')
                        $(form).append("<input name='QuestionnaireCode' value='" + this.get("questionnaireCode") + "' type='hidden'>");
                }
            });

            // Try and Load the current user's email address if not present
            // This will load async and bind when done so should just update when it is done.
            //
            // WARNING: Used in situations where $.cv namespace might not exist so we are not 
            // depending on it existing here on purpose!
            if (widget.options.getCurrentUserEmail && $.cv && $.cv.css) {
                var currentUser = $.cv.css.localGetUser();
                if (!currentUser) {
                    if ($.cv.css.user && $.cv.css.user.getCurrentUser) {
                        $.cv.css.user.getCurrentUser()
                         .done(function (response) {
                             if (response.data && response.data.length > 0 && response.data[0].ValidEmailAddress) {
                                 viewModel.set('loggedInUserEmail', response.data[0].ValidEmailAddress);
                             }
                         });
                    }
                } else {
                    if(currentUser.ValidEmailAddress)
                        viewModel.set('loggedInUserEmail', currentUser.ValidEmailAddress);
                }
            }

            return viewModel;
        },

        _buildViewTemplate: function () {
            var widget = this;
            // future widgets will not use view templates
        }

    }

    // register the widget

    $.cv.ui.widget(formSubmitWidget);

})(jQuery);