//function productAddedToCart(data) {
	//$("#addtocart-alert-message-" + data.productCode + ",#addtocart-alert-message-grid-" + data.productCode).fadeIn(400).delay(1500).fadeOut(400);
  //console.log(data);
//}


(function ($, undefined) {
 
    $.cv = $.cv || {};
    $.cv.widgetEvents = $.cv.widgetEvents || {};

	
	/*
    var paypalCheckout = false;
    $(function () {
        $('.payPalButton').click(function () {
            paypalCheckout = true;
        });

        $('.addToCart').click(function () {
            paypalCheckout = false;
        });
    });
	*/
	
	
    $.cv.widgetEvents.addToCartOrCheckout = function (data) {
        //if (paypalCheckout) {
		//$.cv.widgetEvents.paypal(data);
        //}
        //else {
		if ($("[data-role='product']").data("product").viewModel.isCheckoutWithPayPalExpress == false)	{
            $.cv.widgetEvents.productAddedToCart(data);
		}
        //}
    };
	 
	// products  
    //$.cv.widgetEvents.paypal = function (data) {
    //    $.fancybox("<p style='font-size:0.7em;'>Taking you to PayPal for Checkout. Do not refresh or navigate away from the page.</p> <br /> <img src='/images/TemplateImages/icons/loading-bar.gif' //style='display: block;margin-left: auto;margin-right: auto;margin-top: 10px;'/>")
    //    $("#paypal-final a").click();

    //};
	
	
	
  $.cv.widgetEvents.productAddedToCart = function (data) {
		var productDescription = $.cv.productCustom.getProductDescription(data.productCode);
		$.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: 'product', clearExisting: true });
		var addedMessage = "<span class='atc-message'>{0} x <b>{1}</b> has been added to your cart.</span>".format(data.quantity, productDescription);
		$.cv.productCustom.updateProductModal(addedMessage);
  };
	$.cv.widgetEvents.productAddedToCartFail = function (data) {
		var productDescription = $.cv.productCustom.getProductDescription(data.productCode);
		$.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: '', source: 'product', clearExisting: true });
		var failMessage = "<span class='atc-message error'>Error adding product {0}.<br />{1}</span>".format(productDescription, data.errorMessage);
		$.cv.productCustom.updateProductModal(failMessage);
  };
	$.cv.widgetEvents.productAddedToFavourites = function (data) {
		var productDescription = $.cv.productCustom.getProductDescription(data.productCode);
		var addedMessage = "<b>{0}</b> has been added to your wishlist.".format(productDescription);
		$.cv.css.trigger($.cv.css.eventnames.message, { message: addedMessage, type: $.cv.css.messageTypes.success, source: 'product', clearExisting: true });
  };
	$.cv.widgetEvents.productAddToFavouritesFail = function (data) {
		var addedMessage = "{0}".format(data.errorMessage);
		$.cv.css.trigger($.cv.css.eventnames.message, { message: addedMessage, type: $.cv.css.messageTypes.error, source: 'product', clearExisting: true });
  };
	
	// freight
	
	$.cv.widgetEvents.freightMessage = function() {
		var m = $("#modal-atc");
		if (m.length > 0) {
			var localOrder = $.cv.css.localGetCurrentOrder();
			var orderValue = 0;
			if (localOrder != null) {
				orderValue = localOrder.OrderTotalAmount;
			}
			//var orderValue = $.cv.css.localGetCurrentOrder().OrderTotalAmount;
			var freeShippingLabelThreshold = m.find(".atc-shipping-message").data("freeShippingLabelThreshold");
			if (!isNaN(orderValue) && !isNaN(freeShippingLabelThreshold)) {
				if (orderValue >= freeShippingLabelThreshold) {
					freightMessage = "Thank you! You qualified for Free Freight.";
				} else {
					freightMessage = "Add another {0} worth of items to receive free shipping on your order.".format(kendo.toString((freeShippingLabelThreshold - orderValue), 'c'));
				}
			}
			m.find(".atc-shipping-message").text(freightMessage);
		}
	};
	
	$.cv.css.bind($.cv.css.eventnames.orderChanged, $.cv.widgetEvents.freightMessage);
	
	// cart
	
	$.cv.widgetEvents.orderLinesRendered = function() {
		// Gift Card Note
    /*$(".giftcard-message-entry").hide();
    $(".gift-card-message").click(function(){
        $(".giftcard-message-entry").slideDown();
    });
		if($.isFunction($.cv.ordersCustom.verifyAvailableQuantity)) {
			$.cv.ordersCustom.verifyAvailableQuantity();
		}*/
	$(".gift-card-message").click(function() {
            $(this).next(".giftcard-message-entry").slideDown();
        });
	};
	
	// login
	
	$.cv.widgetEvents.forgotPasswordSent = function() {
		// Gift Card Note
    $(".giftcard-message-entry").hide();
    $(".gift-card-message").click(function(){
        $(".giftcard-message-entry").slideDown();
    });
		if($.isFunction($.cv.ordersCustom.verifyAvailableQuantity)) {
			$.cv.ordersCustom.verifyAvailableQuantity();
		}
	};
	
	$.cv.widgetEvents.changingPassword = function() {
	  $(".register").hide();
	};
	
	$.cv.widgetEvents.registerFieldUpdated = function() {
		$("[name='UserOffersByEmail'],[name='terms']").prop('checked', true).change();
	};
	
	// checkout
	$.cv.widgetEvents.billingAddressLoading = function() {
		if ($(".customer-shipping input").length > 0 && $(".customer-billing input").length > 0) {
			$.cv.checkoutCustom.setChangeEvents();
			$.cv.checkoutCustom.initialiseFullName();
			$.cv.checkoutCustom.updateBillingAddress();
			}
	};
	
	
	
	//paypalExpress checkout
	$.cv.widgetEvents.paypalBillingAddressLoading = function() {

		if ($(".customer-shipping input").length > 0 && $(".customer-billing input").length > 0) {
			$.cv.checkoutCustom.setChangeEvents();
			$.cv.checkoutCustom.initialiseFullName();
			$.cv.checkoutCustom.updateBillingAddress();
		}
		$('[name="SoDelState"]').prop("disabled", true); 	
			
	};
	
	
	
	// payment options
	
	$.cv.widgetEvents.paymentOptionsRendered = function() {
		$.cv.checkoutCustom.setPaymentOptionEvents();
	};
	
	// gift cards
	
	$.cv.widgetEvents.addedGiftCard = function() {
		$(".giftcard-entry").slideUp();
		$(".giftcard-summary").slideDown();
	};
	
	$.cv.widgetEvents.giftCardRemoved = function() {
		
	};
	
	// store locator
	
	$.cv.widgetEvents.storeLocatorShowNearest = function() {
		if (!kendo.support.mobileOS) {
			$('html,body').animate({scrollTop: $(".location-search-area").offset().top},'slow');
		} else {
			$('html,body').animate({scrollTop: $(".location-list").offset().top},'slow');
			$(".location-search-area").find("input").blur();
		}
	};
	
	// click and collect
	$.cv.widgetEvents.clickAndCollect = function() {
		console.log("helloworld")
	}

	
	
	//hide freight for pickup
	$(function () {
        $('#delivery-mode-pickup').click(function () {
            $('[data-role="freightcarrier"]').hide();
        });

        $('#delivery-mode-delivery').click(function () {
            $('[data-role="freightcarrier"]').show();
        });
    });
	
	
})(jQuery);
