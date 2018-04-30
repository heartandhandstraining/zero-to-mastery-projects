//redefining bindKendoDropDownWidgets

$.cv.util.bindKendoDropDownWidgets = function (target) {
   target.find("select:not([name*='Bill'])")
	    .each(function () {
	        var k = $(this).data("kendoDropDownList");
	        if (k == undefined) {
	            $(this).kendoDropDownList();
	        }
	    });
};


	
(function ($, undefined) {
	$.cv.util.fieldEditTemplates.DropDown = function (field, add) {
	    var check = $.cv.data.fieldEditTempateCanEdit(field, add);
	    if (check.length == 0) {
		var input = '<select data-text-field="Text" data-value-field="Value" data-value-update="keyup change" name="' + field.fieldName + '" data-bind="events: {change: dataChanged },value: ' + field.fieldName + ', enabled:' + field.fieldName + '_isEnabled, source:' + field.fieldName + '_lookup"' + (field.readonly ? 'readonly="readonly"' : ' ') + ' >';
		input = input + "</select>";
		return input;
	    } else
		return check;
	};
  $.cv.css.isProcessingClass = "btn-inactive";
  $.cv.css.userFavourites.defaults.returnMessageOnAddFavourite = true;
  $.cv.ajax.setup({timeoutRedirectUrl: "/login", timeoutRedirectMessage: "Your session has timed out, please log in again."});
  
  
  $.cv.css.proceedPPECheckout = function (){
	  	$.cv.checkoutCustom.refreshBillingDetailsPaypal();
		$.cv.checkoutCustom.updateBillingAddressPaypal();
		$.cv.checkoutCustom.saveAddress();
		$(".checkout-area.paypal-1").hide();
		$(".checkout-area.paypal-2").show();
		$('html,body').animate({scrollTop: 0},'fast');
		$.fancybox.close();
  }
  
  $.cv.css.proceedCheckout = function (){
		 $.cv.css.pageValidationErrors = ""
		 $.cv.checkoutCustom.refreshBillingDetails();
		 $.cv.checkoutCustom.updateBillingAddress2();
		 $.cv.checkoutCustom.saveAddress();
		 $(".checkout-area.checkout-1").hide();
		 $(".checkout-area.checkout-2").show();
		 $('html,body').animate({scrollTop: 0},'fast');
		 $.fancybox.close();
  }
  
})(jQuery);

function functionPromo() {
$.cv.css.trigger($.cv.css.eventnames.addressChanged);
}


function setStoreCustom(varStoreName){
                    var p = $.cv.css.storeLocator.setUserCurrentStore({ storeName: varStoreName});

                    $.when(p).done(function (data) {
                        if (data.data && data.data.success) {

                            if (data.data.reloadPage) {
                                location.reload(true);
                            }
						}
                    });
                    return false; // prevent postback
}

function setModelHeightFix() {
	$("[id^='modal-availability']" ).parent().css("height","auto")
}

$(document).ajaxComplete(function (event, xhr, settings) {

if (settings.url.indexOf("findNearestPickupStores") >= 0) {
   setModelHeightFix();
}
});


function appendEmail() {
	var subscribeEmail = $("#subscribeHomePage").val();
	$("a#subscribeHomePageHref").attr("href", "http://house.us6.list-manage.com/subscribe/post?u=283b11c4aed001e1b3e286262&id=340bbee994" + "&EMAIL=" + subscribeEmail)
	
}



function removeNewLines() {
var vm = $('[data-role="orderlines"]').data().orderLines.viewModel;
for(var i = 0; i < vm.itemList.length; i++)
{
console.log(vm.itemList[i]);
console.log(vm.itemList[i].get("ExtendedLineDescription"));
vm.itemList[i].set(
"ExtendedLineDescription",
vm.itemList[i].get("ExtendedLineDescription")
.replace(/(?:\r\n|\r|\n)/g, ' ')
 
    )
            console.log(vm.itemList[i].get("ExtendedLineDescription"));
}
};

$(document).ready(function() {
	
    /* -------------------------------------------------------------------- *\
        kendo
    \* -------------------------------------------------------------------- */
    kendo.culture("en-AU");

	$(function() {
	  $(".fancylink").fancybox({
			content: $('.afterPayConditionsImage').html()
		  })
	});
	
		
		/* -------------------------------------------------------------------- *\
        disable HTML 5 form validation
    \* -------------------------------------------------------------------- */
		$("form").attr("novalidate","novalidate")
    
    /* menu */
		//already doing this in BPD general script
		//if($.isFunction($.fn.dlmenu)) {
		//	$('#dl-menu').dlmenu();
		//}
		$(".dummy-button").bind("click",function(event){
			// stops the form from submitting on enter
			// require to stop the mobile menu opening when using the keyboard input submitting a value
			event.preventDefault();
			event.stopPropagation();
		})

    /* -------------------------------------------------------------------- *\
        FITVIDS - Responsive Video
         + http://fitvidsjs.com/
    \* -------------------------------------------------------------------- */
    $(".video").fitVids();

    /* -------------------------------------------------------------------- *\
        jCarousel
    \* -------------------------------------------------------------------- */
    $("#carousel-topsellers").jcarousel({
        auto: 5,
        wrap: 'last',
        scroll: 2
    });
    $("#carousel-topbrands").jcarousel({
        auto: 5,
        wrap: 'last',
        scroll: 2
    });
    $("#carousel-mostpopular").jcarousel({
        auto: 5,
        wrap: 'last',
        scroll: 2
    });

	
	 /* -------------------------------------------------------------------- *\
        PIKACHOOSE - Product Detail Image Gallery
         + http://www.pikachoose.com/
    \* -------------------------------------------------------------------- */


	var pikaBuildFinshed = function(self){
	self.anchor.on("click", function(e){
	         // find index of corresponding thumbnail
	         var pikaindex = $("#product-detail-gallery").find("li.active").index();
	         // open fancybox gallery starting from corresponding index
	         $.fancybox(fancyGallery,{
	            "cyclic": true,
	            "index": pikaindex // start with the corresponding thumb index
	     });
	return false; // prevent default and stop propagation
	}); // on click
	}
	    
	    $(".product-gallery a.zoom-link").on("click", function(e){
	         // find index of corresponding thumbnail
	         var pikaindex = $("#product-detail-gallery").find("li.active").index();
	         // open fancybox gallery starting from corresponding index
	         $.fancybox(fancyGallery,{
	            "cyclic": true,
	            "index": pikaindex // start with the corresponding thumb index
	     });
	return false; // prevent default and stop propagation
	}); // on click
	    
	    var fancyGallery = [];
	    $("#product-detail-gallery").find("a").each(function(i){
		// build fancybox gallery group
		fancyGallery[i] = {"href" : this.href, "title" : this.title, "rel" : "gallery1"};
	    }).end().PikaChoose({
	         autoPlay : false,
	         // bind fancybox to big images element after pikachoose is built
	         buildFinished: pikaBuildFinshed,
	     });
	
	

    /* -------------------------------------------------------------------- *\
        FANCYBOX 2 - Modal Windows
         + http://fancyapps.com/fancybox/
    \* -------------------------------------------------------------------- */
    $('.fancybox').fancybox({
        topRatio: '0.25'
    });
    $('.fancybox-noclose').fancybox({
        closeBtn: false,
        topRatio: '0.25'
    });
    $('.fancybox-processing').fancybox({
        closeBtn: false,
        topRatio: '0.25'
    });
	$("a.fancybox").fancybox({type: 'iframe'});
	
	$("a.fancybox-image").fancybox();

    /* -------------------------------------------------------------------- *\
        FILTERS

            !!! I know this is not good code, ok for templates but update
                for actual site thanks
    \* -------------------------------------------------------------------- */
    
	// Metadata Summary 
    $.cv.metaDataSummaryCustom.setSummaryEvents();

    // Freight Estimation
    $("#freight-estimate").hide();
    $("#estimate-apply").click(function(){
        $("#freight-estimate").fadeIn("slow");
    });

    // Checkout Billing The Same
	if($('[data-role="deliveryaddress"]').data("deliveryAddressMode") != "Pickup") {
		
    $(".customer-billing").hide();
    /*$(".billing-same").click(function(){
        $(".customer-billing").slideToggle();
        $.cv.widgetEvents.billingAddressLoading();
    });*/
    $("#different-billing-address").change(function() {
         $(".customer-billing").slideToggle();
         $.cv.checkoutCustom.updateBillingAddress();
         var vm = $('[data-role="ordercompletefields"]').data().orderCompleteFields.viewModel;
         vm.validateInputFields();
    });
	
	}
	else {
		//this till cause the billing address to render blank
		//$("#different-billing-address").prop("checked", true);
		$(".customer-billing").hide();	
		$(".billing-same").hide();
		$(".customer-shipping").hide();
    }
	
	
	
	/* -------------------------------------------------------------------- *\
		ADDRESS VALIDATION START
    \* -------------------------------------------------------------------- */
	
	// NON-PPE Validation - Checkout proceed buttons - PICKUP
    $(".checkout-area.checkout-1 .btn-proceed.pickup").click(function() {
		passedValidation = true;
		
		var pickUpMode = $('[data-role="deliveryaddress"]').data("deliveryAddress").viewModel.deliveryAddressMode;
		
		if (pickUpMode != "Pickup") {
		//validate delivery address fields
		var addresslist = $('[data-role="deliveryaddress"]').data("deliveryAddress").viewModel.addressItemList
			$.each(addresslist, function(e) {
	 
				value = addresslist[e][addresslist[e].fieldItem.fieldName] == null ? "" : (addresslist[e][addresslist[e].fieldItem.fieldName] instanceof Date ? kendo.toString(addresslist[e][addresslist[e].fieldItem.fieldName], "dd/MM/yyyy") : addresslist[e][addresslist[e].fieldItem.fieldName].toString().trim())
				
				if ((addresslist[e].fieldItem.Mandatory && value.length == 0)) {
				addresslist[e].setError(addresslist[e].fieldItem, addresslist[e].fieldItem.mandatoryMessage, addresslist[e].fieldItem.inputErrorClass);
				
				passedValidation = false;
				}
				 
			});
		}
		
		//validate billing address
         var vm = $('[data-role="ordercompletefields"]').data().orderCompleteFields.viewModel.itemList1;	
         for (var i = 0; i < vm.length; i++) {
            if (vm[i].fieldItem.Mandatory == true && vm[i].fieldItem.parent().fieldValid({data: vm[i].fieldItem.parent()}) == false) {
                    // console.log(vm[i].fieldItem.FieldName)
                    passedValidation = false;	 
                    //break;
            }
         }

        if (!passedValidation) {
            //console.log("Check mandatory fields.");
        }
        else {
         //already have custom validation set this to null
			$.cv.css.proceedCheckout();
        }
    });
	
	
	
	// NON-PPE Validation - Checkout proceed buttons - DELIVERY
    $(".checkout-area.checkout-1 .btn-proceed.delivery").click(function() {
		passedValidation = true;
		
		var pickUpMode = $('[data-role="deliveryaddress"]').data("deliveryAddress").viewModel.deliveryAddressMode;
		
		if (pickUpMode != "Pickup") {
		//validate delivery address fields
		var addresslist = $('[data-role="deliveryaddress"]').data("deliveryAddress").viewModel.addressItemList
			$.each(addresslist, function(e) {
	 
				value = addresslist[e][addresslist[e].fieldItem.fieldName] == null ? "" : (addresslist[e][addresslist[e].fieldItem.fieldName] instanceof Date ? kendo.toString(addresslist[e][addresslist[e].fieldItem.fieldName], "dd/MM/yyyy") : addresslist[e][addresslist[e].fieldItem.fieldName].toString().trim())
				
				if ((addresslist[e].fieldItem.Mandatory && value.length == 0)) {
				addresslist[e].setError(addresslist[e].fieldItem, addresslist[e].fieldItem.mandatoryMessage, addresslist[e].fieldItem.inputErrorClass);
				
				passedValidation = false;
				}
				 
			});
		}
		
		//validate billing address
         var vm = $('[data-role="ordercompletefields"]').data().orderCompleteFields.viewModel.itemList1;	
         for (var i = 0; i < vm.length; i++) {
            if (vm[i].fieldItem.Mandatory == true && vm[i].fieldItem.parent().fieldValid({data: vm[i].fieldItem.parent()}) == false) {
                    // console.log(vm[i].fieldItem.FieldName)
                    passedValidation = false;	 
                    //break;
            }
         }

        if (!passedValidation) {
            //console.log("Check mandatory fields.");
        }
        else {
			
			//validate state/suburb/postcode 

			var validateSuburb = $("[name='SoDelSuburb']").val().toLowerCase();
			var validateState = $("[name='SoDelState']").val().toLowerCase();
			var validatePostcode = $("[name='SoDelPostcode']").val().toLowerCase();
			
			
			//validate address data against database
			$.cv.css.storeLocator.getSuburbHelpers({searchFilter: validatePostcode,incPostcode: true}).done(function (data) {
				passedCheckoutValidation = false;				
				var databaseAddressResults = data.data;
				
				$.each(databaseAddressResults, function(k, v) {
					var databaseSuburb = v.Name.toLowerCase();
					var databaseState = v.State.toLowerCase();
					var databasePostcode = v.Postcode.toLowerCase();
					
					if(databaseSuburb == validateSuburb && databaseState == validateState && databasePostcode == validatePostcode) {
						passedCheckoutValidation = true;
					}
					
				});

				//if pass PPE  validation then proceed
				if(passedCheckoutValidation == true){
					 $.cv.css.proceedCheckout();
				} else {
					//should alert box proceed anyway or back to PPE
					 $.fancybox([
					{ href : '#checkoutError' }
					]);			
					console.info("we could not find a match for your surbub/state/postcode combination")
				}
			});
			
			
			
        }
    });
	
	
	// PPE billing address validation - DELIVERY
	$(".checkout-area.paypal-1 .btn-proceed.delivery").click(function() {		
		
		var vm = $('[data-role="ordercompletefields"]').data().orderCompleteFields.viewModel.itemList2;	
		for (var i = 0; i < vm.length; i++) {
			passedValidation = true;
			
			if (vm[i].fieldItem.Mandatory == true && vm[i].fieldItem.parent().fieldValid({data: vm[i].fieldItem.parent()}) == false) {
				//console.log(vm[i].fieldItem.FieldName)
				passedValidation = false;	 
				break;
			}
		}

		if(passedValidation == true){
			
			//validate state/suburb/postcode of PPE
			var ppeValidation = $('[data-role="deliveryaddress"]').data('deliveryAddress').viewModel.addressItemList;
			var paypalSuburb = "";
			var paypalState = "";
			var paypalPostcode = "";
			
			//get the address data from Paypal
			$.each(ppeValidation, function(k, v) {
				if (v.fieldItem.FieldName == "SoDelSuburb") {
					paypalSuburb = v.fieldItem.Value.toLowerCase();
				}
				if (v.fieldItem.FieldName == "SoDelState") {
					paypalState = v.fieldItem.Value.toLowerCase();
				}
				if (v.fieldItem.FieldName == "SoDelPostcode") {
					paypalPostcode = v.fieldItem.Value.toLowerCase();
				}	
			});
			
			//validate address data against database
			$.cv.css.storeLocator.getSuburbHelpers({searchFilter: paypalPostcode,incPostcode: true}).done(function (data) {
				passedPPEValidation = false;
				
				var databaseAddressResults = data.data;
				
				$.each(databaseAddressResults, function(k, v) {
					
					var databaseSuburb = v.Name.toLowerCase();
					var databaseState = v.State.toLowerCase();
					var databasePostcode = v.Postcode.toLowerCase();
					
					if(databaseSuburb == paypalSuburb && databaseState == paypalState && databasePostcode == paypalPostcode) {
						passedPPEValidation = true;
					} 				
				});

				//if pass PPE  validation then proceed
				if(passedPPEValidation == true){
					$.cv.css.proceedPPECheckout();
				} else {
					//should alert box proceed anyway or back to PPE
					 $.fancybox([
					{ href : '#paypalExpressError' }
					]);			
					console.info("we could not find a match for your surbub/state/postcode combination")
				}
			});
		}
    }); 
	
	// PPE billing address validation - PICKUP
	$(".checkout-area.paypal-1 .btn-proceed.pickup").click(function() {		
		var vm = $('[data-role="ordercompletefields"]').data().orderCompleteFields.viewModel.itemList2;	
		for (var i = 0; i < vm.length; i++) {
			passedValidation = true;
			
			if (vm[i].fieldItem.Mandatory == true && vm[i].fieldItem.parent().fieldValid({data: vm[i].fieldItem.parent()}) == false) {
				console.log(vm[i].fieldItem.FieldName)
				passedValidation = false;	 
				break;
			}
		}
        if (!passedValidation) {
            console.log("Check mandatory fields.");
        }
        else {
		  $.cv.checkoutCustom.refreshBillingDetailsPaypal();
		  $.cv.checkoutCustom.updateBillingAddressPaypal();
		  $.cv.checkoutCustom.saveAddress();
          $(".checkout-area.paypal-1").hide();
          $(".checkout-area.paypal-2").show();
          $('html,body').animate({scrollTop: 0},'fast');
        }
    }); 		
	/* -------------------------------------------------------------------- *\
		ADDRESS VALIDATION END
    \* -------------------------------------------------------------------- */
	
	
	
    $(".checkout-area.checkout-2 .btn-return").click(function() {
        //location.hash = "";
		$(".checkout-area.checkout-1").show();
        $(".checkout-area.checkout-2").hide();
        $('html,body').animate({scrollTop: 0},'fast');
    });

    // Giftcards
    $(".giftcard-entry").hide();
    $(".giftcard-summary").hide();
    $(".btn-giftcards").click(function(){
        $(".giftcard-entry").slideDown();
    });
    $(".btn-giftcardcancel").click(function(){
        $(".giftcard-entry").slideUp();
    });
    $(".btn-giftcardapply").click(function(){
        //$(".giftcard-entry").slideUp();
        //$(".giftcard-summary").slideDown();
    });


    // CV Template Payment Tabs
    $("#payment-pp").hide();
    $("#payment-ac").hide();
    $("#payment-dd").hide();
    $("#payment-bp").hide();


    $("#option-cc").click(function() {
        $("#payment-pp").fadeOut('800');
        $("#payment-ac").fadeOut('800');
        $("#payment-dd").fadeOut('800');
        $("#payment-bp").fadeOut('800');
        $("#payment-cc").delay('400').fadeIn('800');
        $(".payment-select ul li").removeClass("active");
        $("#option-cc").addClass("active");
    });
		$("#option-cc").click();

    $("#option-pp").click(function() {
        $("#payment-cc").fadeOut('800');
        $("#payment-ac").fadeOut('800');
        $("#payment-dd").fadeOut('800');
        $("#payment-bp").fadeOut('800');
        $("#payment-pp").delay('400').fadeIn('800');
        $(".payment-select ul li").removeClass("active");
        $("#option-pp").addClass("active");
    });

    $("#option-ac").click(function() {
        $("#payment-cc").fadeOut('800');
        $("#payment-pp").fadeOut('800');
        $("#payment-dd").fadeOut('800');
        $("#payment-bp").fadeOut('800');
        $("#payment-ac").delay('400').fadeIn('800');
        $(".payment-select ul li").removeClass("active");
        $("#option-ac").addClass("active");
    });

    $("#option-dd").click(function() {
        $("#payment-cc").fadeOut('800');
        $("#payment-ac").fadeOut('800');
        $("#payment-pp").fadeOut('800');
        $("#payment-bp").fadeOut('800');
        $("#payment-dd").delay('400').fadeIn('800');
        $(".payment-select ul li").removeClass("active");
        $("#option-dd").addClass("active");
    });

    $("#option-bp").click(function() {
        $("#payment-cc").fadeOut('800');
        $("#payment-pp").fadeOut('800');
        $("#payment-ac").fadeOut('800');
        $("#payment-dd").fadeOut('800');
        $("#payment-bp").delay('400').fadeIn('800');
        $(".payment-select ul li").removeClass("active");
        $("#option-bp").addClass("active");
    });
		
	// CV Credit Card Input Tabbing
	if (!kendo.support.mobileOS) {
		$(".cc-number").keyup(function(event) {
			if(event.which != 9 && event.which != 16)
				if($(this).val().length == 4) {
					$(this).next(".cc-number").focus().select().trigger('keydown');
				}
		});
	}
	
	var loginPage = function() {
        if($('#formLogin').length > 0) {
          $("#noncasual").remove();
        }
      }
    loginPage();


    
    $("#user-delivery-information").hide();
    $(".change-pwd").hide();
    $(".vip").hide();
    $(".menu-your-details").click(function() {
        $("#user-delivery-information,.change-pwd,.vip").hide();
        $("#user-contact-information").show();
    });
    $(".menu-delivery-information").click(function() {
        $("#user-contact-information,.change-pwd,.vip").hide();
        $("#user-delivery-information").show();
    });
    $(".menu-change-password").click(function() {
        $("#user-contact-information,#user-delivery-information,.vip").hide();
        $(".change-pwd").show();
    });
    $(".menu-vip-points").click(function() {
        $("#user-contact-information,#user-delivery-information,.change-pwd").hide();
        $(".vip").show();
    });
	
    $("#my-account-select").change(function() {
        if ($(this).val().indexOf("/") > -1) {
            $.cv.util.redirect($(this).val(), {}, false);
        } else {
            $("#user-contact-information,#user-delivery-information,.change-pwd,.vip").hide();
            $("." + $(this).val()).show();
        }
    });
	
	
    
    // Store Locator
    $.cv.storeLocatorCustom.setAddressEvents();
	
	
		/* -------------------------------------------------------------------- *\
        NIVO SLIDER
         + http://nivo.dev7studios.com/support/jquery-plugin-usage/
    \* -------------------------------------------------------------------- */
	if ($('#homepage-slider').length == 1) {
		$('#homepage-slider').nivoSlider({
			effect: 'fold', // Specify sets like: 'fold,fade,sliceDown'
			slices: 15, // For slice animations
			boxCols: 8, // For box animations
			boxRows: 4, // For box animations
			animSpeed: 2000, // Slide transition speed
			pauseTime: 6500, // How long each slide will show
			pauseOnHover: true, ///
			startSlide: 0, // Set starting Slide (0 index)
			directionNav: true, // Next & Prev navigation
			controlNav: true, // 1,2,3... navigation
			controlNavThumbs: false, // Use thumbnails for Control Nav
			pauseOnHover: true, // Stop animation while hovering
			manualAdvance: false,   // Force manual transitions
			prevText: 'Prev', // Prev directionNav text
			nextText: 'Next', // Next directionNav text
			randomStart: false // Start on a random slide
		});
	}
	
	// Open first list of Meta Data Summary (Subcat) in brands page only
	if ($("input#showCategoryByDefault").length == 1) {
		if ($("input#showCategoryByDefault").val() == "1") {
			$(" #filter-1.expandable-content").show();
		}
	}
    
    $(".checkout-area.paypal-2 .btn-return").click(function() {
		//location.hash = "";
        $(".checkout-area.paypal-1").show();
        $(".checkout-area.paypal-2").hide();
        $('html,body').animate({scrollTop: 0},'fast');
    });
	
	//hide freight estimate if pickup
	if(window.location.href.indexOf("orders") != -1) {
		if($('#delivery-mode-pickup').is(':checked')){
			$('[data-role="freightcarrier"]').hide();	
		}
	}
	
	// payment cancelled
	if(window.location.href.indexOf("#step2") != -1) {
		$(".checkout-area.checkout-1").hide();
		$.cv.css.bind($.cv.css.eventnames.orderCompleteFieldsValidated, function() {
			$(".checkout-area.checkout-1 .btn-proceed").click();
		});
	}
	
	 //wait for ordercomplete fields to be rendered before showing address PPE
	  $.cv.css.bind($.cv.css.eventnames.orderCompleteFieldsValidated, function() {
		$(".checkout-area.paypal-1").show();
		$(".checkout-area.paypal-1.address-loading").hide();
	  });
	 

	
});






