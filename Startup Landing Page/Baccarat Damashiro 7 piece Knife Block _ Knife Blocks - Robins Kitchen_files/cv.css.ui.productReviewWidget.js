/// <reference path="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.3-vsdoc.js" />

/*
Name: cv.css.ui.productReviewWidget.js (use .min.js version for deployment)
Author: Sean Craig

Dependencies:
    <link rel="stylesheet" href="/documents/css/foundation/foundation.css" />
    <script type="text/javascript" src="/documents/js/foundation/foundation.min.js"></script>

    <link rel="stylesheet" href="/documents/css/cv-ui-alerts.css" />
    <link rel="stylesheet" href="/documents/css/cv-ui-buttons.css" />
    <link rel="stylesheet" href="/documents/css/cv-ui-elements.css" />
    <link rel="stylesheet" href="/documents/css/cv-ui-forms.css" />
    <link rel="stylesheet" href="/documents/css/cv-ui-iconfonts.css" />
    <link rel="stylesheet" href="/documents/css/cv-ui-typeography.css" />
    <link rel="stylesheet" href="/documents/css/cv-ui-widgets.css" />

    <script type="text/javascript" src="/Scripts/jquery-1.8.3.min.js"></script>
    <script type="text/javascript" src="/Scripts/kendo.web-2013.1.319.js"></script>

    <link rel="stylesheet" href="/Scripts/fancybox/jquery.fancybox.css" type="text/css" media="screen" />
    <script src="/Scripts/fancybox/jquery.fancybox.pack.js"></script>

    <script type="text/javascript" src="/documents/star-ratings/jquery.rating.js"></script>
    <link rel="stylesheet" href="/documents/star-ratings/jquery.rating.css" />

    <script type="text/javascript" src="/Scripts/cv.widget.kendo.js"></script>
    <script type="text/javascript" src="/Scripts/cv.ajax.js"></script>
    <script type="text/javascript" src="/Scripts/cv.data.kendo.js"></script>
    <script type="text/javascript" src="/Scripts/widgets/cv.css.ui.productReviewWidget.js"></script>

Params:
    || Option || Type || Default Value || Notes ||
    | dynamicService | string | "orderTemplate" | The name of the dynamic service. |
    | viewTemplate | string | null | The ID of the HTML element to use for the view. |
    | productCode | string | null | The product code of the product to review. Required. |
    | reviewerName | string | "" | The name of the reviewer to place in the "Name" textbox. |
    | reviewerEmail | string | "" | The email address of the reviewer to place in the "Email" textbox. |
    | submitButtonText | string | "Submit Review" | Text of the submit button. |
    | cancelButtonText | string | "Cancel" | Text of the cancel button. |
    | popupId | string | null | The ID of the HTML element to use for the popup window. If null, a popup is not used. |
    | fancyboxOptions | object | {} | Options that can be specified for the FancyBox popup window. Only valid if popupId is not null. |
    | ratings | array | [] | Array of ratings (Code, Description) to use if you want to override the database values. |
*/

;

(function ($, undefined)
{
    var ON_BEFORE_SUBMIT = "onBeforeSubmit";
    var ON_AFTER_SUBMIT = "onAfterSubmit";
    var ON_CANCEL = "onCancel";
    var ON_POPUP_CLOSED = "onPopupClosed";
    
    var productReviewWidget =
    {
        name: "productReviewWidget",

        options:
        {
            dynamicService: "productReview",
            viewTemplate: null, // ID

            productCode: null,
            productDescription: null,
            reviewerName: "",
            reviewerEmail: "",
            submitButtonText: "Submit Review",
            cancelButtonText: "Cancel",
            popupId: null,
            fancyboxOptions: {},
            ratings: [],

            triggerMessages: false,
            useStarRatingPlugin: true,
            namePrompt: "Name",
            emailPrompt: "Email",
            ratingPrompt: "Overall Rating",
            locationPrompt: "Location",
            titlePrompt: "Review Title",
            summaryPrompt: "Your Review"
        },

        events: [ON_BEFORE_SUBMIT, ON_AFTER_SUBMIT, ON_CANCEL, ON_POPUP_CLOSED],

        // Private variables.
        _viewModel: null,
        _view: null,
        _viewAppended: false,
        
        _errorClass: "error",
        
        _defaultPopupId: "productReviewPopup",

        // Standard functions.
        initialise: function (el, o)
        {
            var widget = this;
            widget.options.productCode = el.attr('data-product-code');
            // Check for an internal view.
            var internalView = $(el).children(":first");
            if (internalView.data("view"))
            {
                widget.view = internalView.html();
            }
            else
            {
                if (!widget.options.viewTemplate)
                {
                    widget.options.viewTemplate = widget._getDefaultViewTemplate();
                }

                var viewTemplate = kendo.template(widget.options.viewTemplate);
                widget.view = viewTemplate(widget.options);
                internalView.append(widget.view);
                widget._viewAppended = true;
            }

            // MMVM bind.
            widget.viewModel = widget._getViewModel();
            var target = $(widget.element).children(":first");
            kendo.bind(target, widget.viewModel);
        },

        destroy: function ()
        {
            var widget = this;

            // Remove the data element.
            widget.element.removeData(widget.options.prefix + widget.options.name);

            // Clean up the DOM.
            if (widget._viewAppended)
            {
                widget.element.empty();
            }
        },
        
        // Private functions.
        _getViewModel: function ()
        {
            var widget = this;

            var viewModel = kendo.observable({
                productDescription: "[PRODUCT]",
                
                name: "",
                email: "",
                location: "",
                title: "",
                summary: "",
                rating: "",
                ratings: [], // rating start input field information, bound by dynamic service call
                
                submitButtonText: null,
                cancelButtonText: null,
                
                isSaving: false,
                isNotSaving: function()
                {
                    return !this.get("isSaving");
                },

                _getSubmitData: function() {
                    return {
                        productCode: widget.options.productCode,
                        name: this.name,
                        email: this.email,
                        location: this.location,
                        title: this.title,
                        text: this.summary,
                        ratingCode: this.rating
                    };
                },

                submit: function (e)
                {
                    e.preventDefault();

                    this.set("showValidationErrors", true);
                    if (this.isFormInvalid() || this.get("isSaving"))
                        return;

                    this.set("isSaving", true);
                    if (widget.options.useStarRatingPlugin) {
                        $("input.star").rating("readOnly", true);
                    }

                    var parameters = this._getSubmitData();

                    // the widget.trigger method modifies the arguments sent in which affects the parameters getting sent to the ajax call
                    var opts = this._getSubmitData();
                    widget.trigger(ON_BEFORE_SUBMIT, opts);
                    $.cv.ajax.call(widget.options.dynamicService + "/SaveProductReview",
                    {
                        parameters: parameters,
                        success: function ()
                        {
                            widget.trigger(ON_AFTER_SUBMIT, opts);

                            if (widget.options.popupId)
                            {
                                $.fancybox.close();
                            }

                            widget.viewModel.resetForm();
                        }
                    });
                },
                
                cancel: function (e)
                {
                    e.preventDefault();

                    widget.trigger(ON_CANCEL);

                    if (widget.options.popupId)
                    {
                        $.fancybox.close();
                    }
                },
                
                resetForm: function ()
                {
                    widget.viewModel.set("showValidationErrors", false);

                    widget.viewModel.set("name", widget.options.reviewerName);
                    widget.viewModel.set("email", widget.options.reviewerEmail);
                    widget.viewModel.set("location", "");
                    widget.viewModel.set("title", "");
                    widget.viewModel.set("summary", "");
                    widget.viewModel.set("rating", "");

                    widget.viewModel.set("isSaving", false);
                    if (widget.options.useStarRatingPlugin) {
                        $("input.star")
                            .rating("readOnly", false) // Turn off read-only mode.
                            .rating("select", false); // Reset star rating plugin - remove previously selected stars.
                    }
                },
                
                show: function (e)
                {
                    e.preventDefault();
                    if (!this.isPopup())
                        return;

                    var popupId = widget.options.popupId ? widget.options.popupId : widget._defaultPopupId;
                    var options =
                    {
                        href: "#" + popupId,
                        afterClose: function ()
                        {
                            widget.viewModel.set("showValidationErrors", false);
                            widget.trigger(ON_POPUP_CLOSED);
                        }
                    };
                    options = $.extend(options, widget.options.fancyboxOptions);

                    $.fancybox(options);
                },
                
                isPopup: function ()
                {
                    return widget.options.popupId != null;
                },
                                
                // Validation.
                showValidationErrors: false,
                
                isFormInvalid: function ()
                {
                    var invalid = !this.isFormValid();
                    if (invalid && widget.options.triggerMessages) {
                        this.triggerValidationMessage();
                    }
                    return invalid;
                },

                isFormValid: function ()
                {
                    return this.nameIsEmpty() == false &&
                        this.emailIsEmpty() == false &&
                        this.emailIsInvalid() == false &&
                        this.locationIsEmpty() == false &&
                        this.titleIsEmpty() == false &&
                        this.summaryIsEmpty() == false &&
                        this.ratingIsEmpty() == false;
                },

                triggerValidationMessage: function() {
                    var vm = this,
                        missingFields = "",
                        invalidFields = "",
                        message = "",
                        clearExisting = true,
                        name = vm.get("name"),
                        widgetName = widget.name;

                    missingFields = vm.nameIsEmpty() ? widget.options.namePrompt : "";
                    missingFields = vm.emailIsEmpty() ? (missingFields.length > 0 ? missingFields + ", " : "") + widget.options.emailPrompt : missingFields;
                    missingFields = vm.ratingIsEmpty() ? (missingFields.length > 0 ? missingFields + ", " : "") + widget.options.ratingPrompt : missingFields;
                    missingFields = vm.locationIsEmpty() ? (missingFields.length > 0 ? missingFields + ", " : "") + widget.options.locationPrompt : missingFields;
                    missingFields = vm.titleIsEmpty() ? (missingFields.length > 0 ? missingFields + ", " : "") + widget.options.titlePrompt : missingFields;
                    missingFields = vm.summaryIsEmpty() ? (missingFields.length > 0 ? missingFields + ", " : "") + widget.options.summaryPrompt : missingFields;
                    missingFields = missingFields.length > 0 ? "The following fields are required: " + missingFields : missingFields;
                    if (!vm.emailIsEmpty()) {
                        invalidFields = vm.emailIsInvalid() ? widget.options.emailPrompt + " is invalid" : "";
                    }

                    // Since there is a property called name on this viewModal the notify method sets the widget name to the value in the name property
                    vm.name = widgetName;
                    if (missingFields.length > 0) {
                        $.cv.util.notify(vm, missingFields, $.cv.css.messageTypes.error, {
                            triggerMessages: widget.options.triggerMessages,
                            source: widget.name,
                            clearExisting: true
                        });
                        clearExisting = false;
                    }
                    if (invalidFields.length > 0) {
                        $.cv.util.notify(vm, invalidFields, $.cv.css.messageTypes.error, {
                            triggerMessages: widget.options.triggerMessages,
                            source: widget.name,
                            clearExisting: clearExisting
                        });
                    }
                    vm.name = name;
                },

                nameIsEmpty: function () { return !!this.get("showValidationErrors") && $.trim(this.get("name")).length == 0; },
                nameInputClass: function () { return this.nameIsEmpty() ? widget._errorClass : ""; },

                emailIsEmpty: function () { return !!this.get("showValidationErrors") && $.trim(this.get("email")).length == 0; },
                emailIsInvalid: function ()
                {
                    if (this.get("showValidationErrors"))
                    {
                        if (this.emailIsEmpty() == false)
                        {
                            var pattern = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
                            return !pattern.test(this.get("email"));
                        }

                        return true;
                    }

                    return false;
                },
                emailInputClass: function () { return this.emailIsEmpty() || this.emailIsInvalid() ? widget._errorClass : ""; },
                emailErrorText: function ()
                {
                    if (this.emailIsEmpty())
                    {
                        return "Required";
                    }

                    if (this.emailIsInvalid())
                    {
                        return "Invalid";
                    }

                    return "";
                },

                locationIsEmpty: function () { return !!this.get("showValidationErrors") && $.trim(this.get("location")).length == 0; },
                locationInputClass: function () { return this.locationIsEmpty() ? widget._errorClass : ""; },

                titleIsEmpty: function () { return !!this.get("showValidationErrors") && $.trim(this.get("title")).length == 0; },
                titleInputClass: function () { return this.titleIsEmpty() ? widget._errorClass : ""; },

                summaryIsEmpty: function () { return !!this.get("showValidationErrors") && $.trim(this.get("summary")).length == 0; },
                summaryInputClass: function () { return this.summaryIsEmpty() ? widget._errorClass : ""; },

                ratingIsEmpty: function () { return !!this.get("showValidationErrors") && $.trim(this.get("rating")).length == 0; },
                ratingInputClass: function () { return this.ratingIsEmpty() ? widget._errorClass : ""; }
            });

            if (widget.options.productDescription == null)
            {
                $.cv.ajax.call(widget.options.dynamicService + "/GetProductInfo",
                {
                    parameters: { productCode: widget.options.productCode },
                    success: function (response)
                    {
                        if (response.data.length == 1)
                        {
                            viewModel.set("productDescription", response.data[0].Description);
                        }
                    }
                });
            }
            else
            {
                viewModel.set("productDescription", widget.options.productDescription);
            }

            viewModel.set("name", widget.options.reviewerName);
            viewModel.set("email", widget.options.reviewerEmail);
            viewModel.set("submitButtonText", widget.options.submitButtonText);
            viewModel.set("cancelButtonText", widget.options.cancelButtonText);

            return viewModel;
        },

        _getDefaultViewTemplate: function ()
        {
            var widget = this;

            if (widget.options.ratings.length == 0)
            {
                $.cv.ajax.call(widget.options.dynamicService + "/LoadRatings",
                {
                    parameters: {},
                    success: function (response)
                    {
                        widget.options.ratings = response.data;

                        // Bind the Ratings
                        widget.viewModel.set('ratings', response.data);

                        // Setup Rating Stars and make first one required
                        var stars = $(".star");
                        stars.rating(); // Init 'star rating' jQuery plugin. Need to do this if any ratings are created dynamically.
                        stars.first().addClass('required');
                    }
                });
            }

            var html =
            [
                "<section class='cv-ui-layout-pagecontent'>",
                "	<div class='row'>",
                "		<div class='twelve columns'>",
                "			<h1 class='page-heading'>Write A Product Review</h1>",
                "",
                "			<div class='cv-ui-widget-review'>",
                "				<div class='row'>",
                "					<div class='twelve columns'>",
                "						<p>If you have a <span style='font-weight: bold' data-bind='text: productDescription'></span>, let us know what you think. Write an opinion and share your opinions with others. All reviews will be independantly reviewed before being posted. Review must be on this particular product and not on the service or warranty issues.</p>",
                "					</div>",
                "				</div>",
                "",
                "				<div class='row'>",
                "					<div class='six columns'>",
                "						<div data-bind='attr: { class: nameInputClass }'>",
                "							<label style='display: inline'>Name:</label> <label class='error' style='display: inline-block'>*</label>",
                "							<input type='text' data-bind='attr: { class: nameInputClass }, value: name, enabled: isNotSaving' data-value-update='keyup' maxlength='100'>",
                "							<small data-bind='visible: nameIsEmpty'>Required</small>",
                "						</div>",
                "",
                "						<div data-bind='attr: { class: emailInputClass }'>",
                "							<label style='display: inline'>Email:</label> <label class='error' style='display: inline-block'>*</label>",
                "							<input type='email' data-bind='attr: { class: emailInputClass }, value: email, enabled: isNotSaving' data-value-update='keyup' maxlength='100'>",
                "							<small data-bind='visible: emailIsInvalid, text: emailErrorText'></small>",
                "						</div>",
                "",
                "						<div data-bind='attr: { class: locationInputClass }'>",
                "							<label style='display: inline'>Location:</label> <label class='error' style='display: inline-block'>*</label>",
                "							<input type='text' data-bind='attr: { class: locationInputClass }, value: location, enabled: isNotSaving' data-value-update='keyup' maxlength='100'>",
                "							<small data-bind='visible: locationIsEmpty'>Required</small>",
                "						</div>",
                "",
                "						<div data-bind='attr: { class: titleInputClass }'>",
                "							<label style='display: inline'>Review Title:</label> <label class='error' style='display: inline-block'>*</label>",
                "							<input type='text' data-bind='attr: { class: titleInputClass }, value: title, enabled: isNotSaving' data-value-update='keyup' maxlength='100'>",
                "							<small data-bind='visible: titleIsEmpty'>Required</small>",
                "						</div>",
                "",
                "						<div data-bind='attr: { class: summaryInputClass }'>",
                "							<label style='display: inline'>Your Review:</label> <label class='error' style='display: inline-block'>*</label>",
                "							<textarea data-bind='attr: { class: summaryInputClass }, value: summary, enabled: isNotSaving' data-value-update='keyup'></textarea>",
                "							<small data-bind='visible: summaryIsEmpty'>Required</small>",
                "						</div>",
                "					</div>",
                "",
                "					<div class='five columns'>",
                "						<div class='cv-ui-rating'>",
                "							<div class='row'>",
                "								<div class='five columns'>",
                "									<label class='overall' style='display: inline'>Overall Rating</label> <label class='error' style='display: inline-block'>*</label>",
                "								</div>",
                "								<div class='seven columns' data-bind='attr: { class: ratingInputClass }'>",
                "                                   <div data-bind='source: ratings' data-template='" + widget.options.itemTemplateId + "_rating_star'></div>",
                "									<div style='height: 2.5em'></div>",
                "									<small data-bind='visible: ratingIsEmpty'>Required</small>",
                "								</div>",
                "							</div>",
                "						</div>",
                "					</div>",
                "				</div>",
                "				",
                "				<hr />",
                "				<div class='row row-buttons'>",
                "					<div class='twelve columns' data-bind='visible: isNotSaving'>",
                "						<a href='javascript:$.noop()' class='cv-ui-button-green' data-reveal-id='modal-publish' data-bind='click: submit, text: submitButtonText'></a>",
                "						<a href='javascript:$.noop()' class='cv-ui-button-red' data-bind='click: cancel, text: cancelButtonText'></a>",
                "					</div>",
                "					<div class='twelve columns' data-bind='visible: isSaving'>",
                "						Review is being submitted. Please wait...<br />&nbsp;",
                "					</div>",
                "				</div>",
                "			</div>",
                "		</div>",
                "	</div>   ",
                " <script type='text/x-kendo-template' id='" + widget.options.itemTemplateId + "_rating_star'>",
                    "<input name='stars' type='radio' class='star' data-bind='value: Code, attr: { title: Description }, checked: rating' />",
                " </script>",
                "</section>"
            ].join("\n");
            
            if (widget.options.popupId)
            {
                html =
                [
                    "<div id='productReviewPopup' style='display: none; margin-left: auto; margin-right: auto'>",
                    html,
                    "</div>"
                ].join("\n");
            }

            return html;
        }

    };

    // Register the widget.
    $.cv.ui.widget(productReviewWidget);
})(jQuery);
