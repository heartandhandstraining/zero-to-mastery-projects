
/***************************************************************************************
 * WARNINGS: 
 * - Requires product.config dynamic service file for price break functionality only
 *   if using the [Product.AttributePriceBreakContainer] token.
 * - This file MUST come AFTER cv.ajax.js
 **************************************************************************************/

var priceLabel = "";
var availableLabel = "";
var priceLabelsInitialValues = [];

var unloading = false;
$(window).on("beforeunload", function () { unloading = true; });

/**
 * Price Break Functionality
**/
(function ($) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.products = $.cv.css.products || {};
    $.cv.css.productAttributes = $.cv.css.productAttributes || {};

    $.cv.css.products.getProductAttributePriceBreakInformation = function (options) {
        var opts = $.extend({
            productCode: '',
            attributeSequence: '',
            priceTaxType: '', // 'int'/'ex'/'' latter meaning use Product.Price() 
            returnParsedProductAttributeTemplate: false,
            success: $.noop,
            error: $.noop
        }, options);

        return $.cv.ajax.call('products/GetProductAttributePriceBreakInformation', {
            parameters: {
                productCode: opts.productCode,
                attributeSequence: options.attributeSequence,
                priceTaxType: options.priceTaxType,
                returnParsedProductAttributeTemplate: options.returnParsedProductAttributeTemplate
            },
            success: opts.success,
            error: opts.error
        });
    };

    // Function to check whether price break information should be retrieved which 
    // is determined by the existence of elements with a specific id (or starting with 
    // a specific id value). The enabled state is only checked the first time we need
    // to ascertain this and we just cache the result.
    var statusChecked = false;
    var isRetrievalEnabled = false;

    $.cv.css.productAttributes.isPriceBreakRetrievalEnabled = function isPriceBreakRetrievalEnabled() {
        if (statusChecked === false) {
            isRetrievalEnabled = $('[id^="attributedProductQtyBreakInfo_"]').length > 0;
            statusChecked = true;
        }

        return isRetrievalEnabled;
    };

})(jQuery);

function getSelectedValues(panelID, productcode) {
    var index = 0;
    var val = 0;
    var attributes = "";

    for (var x = 0; x <= 10; x++) {
        val = null;
        var selects = $get(productcode + "_Input_" + x);
        if (selects) {
            if (x <= panelID) {
                val = selects.value;
            }
            else {
                selects.selectedIndex = 0;
            }
        }
        else {
            var radios = $('input');
            for (var i = 0; i < radios.length; i++) {
                var input = radios[i];
                if (input.type == 'radio' && input.name == productcode + "_Input_" + x && input.checked) {
                    if (x <= panelID) {
                        val = input.value;
                        break;
                    }
                    else {
                        input.checked = false;
                    }
                }
            }
        }
        if (val != null) {
            attributes += val + ";";
        }
    }
    return attributes;
}

function OnError(jqXHR, textStatus, errorThrown) {
	if (!unloading)
		throw new Error(errorThrown);
}

function resetPrice(productcode) {
    var labels = $('.priceForOne_' + productcode);
    if (labels) {
        for (var i = 0, l = labels.length; i < l; i++) {
            // Setup tracking for initial labels
            var found = false;
            for (var ind = 0, len = priceLabelsInitialValues.length; ind < len; ind++) {
                if (priceLabelsInitialValues[ind].key === productcode + "_" + i.toString()) {
                    found = true;
                    break;
                }
            }
             
            if (!found)
                priceLabelsInitialValues.push({ "key": productcode + "_" + i.toString(), "value": labels[i].innerHTML });

            labels[i].innerHTML = priceLabel;
        }
    }
}

function resetLabels(productcode, labelsForReset) {
    if(!labelsForReset)
        labelsForReset = $('.priceForOne_' + productcode);

    if (labelsForReset && priceLabelsInitialValues && priceLabelsInitialValues.length > 0) {
        for (var i = 0, l = labelsForReset.length; i < l; i++) {
            for (var ind = 0, len = priceLabelsInitialValues.length; ind < len; ind++) {
                if (priceLabelsInitialValues[ind].key === productcode + "_" + i.toString()) {
                    var initialHtml = priceLabelsInitialValues[ind].value;

                    if (initialHtml)
                        labelsForReset[i].innerHTML = initialHtml;

                    break;
                }
            }
        }
    }
}

function attributesSelected(productCode, error) {
    //    productCode = productCode.replace(" ", "-");
    var labels = $('.priceForOne_' + productCode);
    if (labels != null && labels.length > 0) {
        var price = labels[0].innerHTML;
        if (price.indexOf("$") > -1) {
            document.forms[0].submit();
        }
        else {
            alert(error);
            return false;

        }
    }
    else {
        // no price labels so
        document.forms[0].submit();
    }
}

function updatePanel(panelID, productcode, setDefaultProductAttribute) {
    var attributeValues = getSelectedValues(panelID, productcode);

    if (attributeValues.startsWith("-1")) {
        // clear selected sequence so can no longer be added to cart as now have no option selected
        setHiSelectedProductAttributes(productcode, "Please select");

        // reset the labels
        resetLabels(productcode);        
    } else {
        var attributeTitel = $get(productcode + "_" + (panelID + 1).toString());

        if (attributeTitel) {
            resetPrice(productcode);
            var targetPanel = productcode + "_" + (panelID + 1);
            var userContext = { targetPanel: targetPanel, setDefaultProductAttribute: setDefaultProductAttribute };

            $.cssWebServicesAjax.getProductAttributeValues({
                inputIdx: panelID + 1,
                productCode: productcode,
                selectedTitleValue: attributeValues,
                selectDefaultProduct: setDefaultProductAttribute,
                error: OnError,
                success: function (msg) {
                    var panelToUpdate = $get(userContext.targetPanel);
                    var result = msg.d;
                    if (panelToUpdate) {
                        panelToUpdate.innerHTML = result;

                        // Required to trigger attribute defaulting down the line (on last attribute it will trigger the price/avail WS calls
                        if (userContext.setDefaultProductAttribute) {
                        	var $el = $($(result).get(0));
                        	if ($el.is("table"))
                        	{
                        		eval($el.attr("data-client-execute")); // :op yuk
                        	}
                        	else
                        	{
                        		($el).prop("onchange")();
                        	}
                        }
                    }
                }
            });
        } else {
            // we are at end of list get total
            var priceTaxType = '',
                priceType = '';

            // Determine Ex/Inc tax mode
            var label = $('.priceForOne_' + productcode);

            if (label.is('.priceForOneInc')){
                priceTaxType = 'inc';
            } else if (label.is('.priceForOneEx')) {
                priceTaxType = 'ex';
            }

            // Price Tax Type: Retrieve from data attribute
            // Another option instead of class which is confusingly named.
            if (label.attr('data-price-tax-type')) {
                priceTaxType = label.attr('data-price-tax-type');
            }

            // Price Type: Retrieve from data attribute
            if (label.attr('data-price-type')) {
                priceType = label.attr('data-price-type');
            }

            attributeValues = attributeValues.substring(0, attributeValues.length - 1);
            var myContextPrice = { productcode: productcode };

            // Price
            $.cssWebServicesAjax.getProductAttributePriceGst({
                productCode: productcode,
                attributeSequence: attributeValues,
                priceTaxType: priceTaxType.toLowerCase(),
                priceType: priceType.toLowerCase(),
                error: OnError,
                success: function (msg) {
                    var result = msg.d;
                    var labels = $('.priceForOne_' + myContextPrice.productcode);
                    if (labels) {
                        if (result.length == 0) // indicates no price as not all attributes yet selected
                            resetLabels(myContextPrice.productcode, labels);
                        else {
                            for (var i = 0, l = labels.length; i < l; i++) {
                                if (priceLabel == "" && labels[i].innerHTML.length > 0) {
                                    priceLabel = labels[i].innerHTML;
                                }
                                labels[i].innerHTML = result;
                            }
                        }
                    }
                }
            });

            // Availability
            var availableForOneLabels = $('.availableForOne_' + myContextPrice.productcode);
            if (availableForOneLabels.length > 0)
            {
		        $.cssWebServicesAjax.getProductAttributeAvailability({
			        productCode: productcode,
			        attributeSequence: attributeValues,
			        success: function(msg) {
				        var result = msg.d;
				        if (availableForOneLabels.length > 0) {
					        for (var i = 0, l = availableForOneLabels.length; i < l; i++) {
						        if (availableLabel == "" && availableForOneLabels[i].innerHTML.length > 0) {
						        	availableLabel = availableForOneLabels[i].innerHTML;
						        }
						        availableForOneLabels[i].innerHTML = result;
					        }
				        }
			        }
		        });
	        }

	        // Price Break Information
            if (true === $.cv.css.productAttributes.isPriceBreakRetrievalEnabled()) {
                var availProm = $.cv.css.products.getProductAttributePriceBreakInformation({
                    productCode: productcode,
                    attributeSequence: attributeValues,
                    priceTaxType: priceTaxType,
                    returnParsedProductAttributeTemplate: true, // Result is parsed template not recordset...
                    error: OnError
                });

                availProm.done(function (results) {
                    var resultContainer = $('#attributedProductQtyBreakInfo_' + productcode);

                    // WARNING: The results.data might be an empty string but we still need to assign it
                    // to the container. This might happen if some attributes don't have breaks and a prior
                    // one did, or when the user selects 'Please select..' for one of the attributes.
                    if (resultContainer.length > 0 && typeof results.data == 'string') {
                        resultContainer.empty().html(results.data);
                    }
                });
            }

            // set selected sequence so can be added to cart. Need to manipulate the string to find the matching productcode
            // so can set the selected attribute in the hidden variable in the right location.
            setHiSelectedProductAttributes(productcode, attributeValues);
        }
    }
}

function setHiSelectedProductAttributes(productcode, attributeValues) {
    // set selected sequence so can be added to cart. Need to manipulate the string to find the matching productcode
    // so can set the selected attribute in the hidden variable in the right location. Note: could also be clearing
    // so can no longer be added to cart if now have no option selected (i.e passed "Please select" for attributeValues.
    var hidden = $get('hiSelectedProductAttributes');
    if (hidden) {
        var prodAttribsArray = hidden.value.split('|');
        hidden.value = "";
        var prodFound = false;

        for (var i = 0; i < prodAttribsArray.length; i++) {
            var productAndAttrPairArray = prodAttribsArray[i].split('=');

            if (productAndAttrPairArray.length == 2) {
                if (productAndAttrPairArray[0] == productcode) {
                    hidden.value += productAndAttrPairArray[0] + "=" + attributeValues + "|";
                    prodFound = true;
                } else {
                    hidden.value += productAndAttrPairArray[0] + "=" + productAndAttrPairArray[1] + "|";
                }
            }
        }

        if (!prodFound) {
            hidden.value += productcode + "=" + attributeValues + "|";
        }

        if (hidden.value.length > 0 && hidden.value.substring(hidden.value.length - 1) == "|")
            hidden.value = hidden.value.substring(0, hidden.value.length - 1);
    }
}
