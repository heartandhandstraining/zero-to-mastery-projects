;
(function ($, undefined) {
  $.cv = $.cv || {};
  $.cv.checkoutCustom = $.cv.checkoutCustom || {};
  
  $.cv.checkoutCustom.processPageValidationErrors = function() {
		var widgetElement = "[data-role='{0}']", widget;
    $.each(_.values($.cv.css.pageValidationErrors), function (idx, item) {
        $(widgetElement.format(item.toLowerCase())).each(function () {
            widget = $(this).data(item);
            if (widget) {
                if ($.isFunction(widget.validateInputFields))
                    widget.validateInputFields(true);
            }
        });
    });
	};
	
	
	//save the data when they checkout
	$.cv.checkoutCustom.saveAddress = function() {
		var d = $.Deferred(), currentUser = $.cv.css.localGetUser();
		if (currentUser == null) {
				d = $.cv.css.getCurrentUser();
		} else {
				d.resolve({ data: [currentUser] });
		}
		$.when(d).done(function (usr) {
		if($('[data-role="deliveryaddress"]').data("deliveryAddressMode") != "Pickup") {
				//if order is delivery, save the following data against the user record.
				if (usr && usr.data && usr.data.length > 0) {
					var userUpdateData = {
						_objectKey: usr.data[0]._objectKey,
						ARUAddressLine0: $("input[name='SoDelAddr6']").eq(0).val(),
						FirstName: $("input[name='CN_DeliveryFirstName']").eq(0).val(),
						Surname: $("input[name='CN_DeliverySurname']").eq(0).val(),
						ARUAddressLine1: $("input[name='SoDelAddr2']").eq(0).val(),
						ARUAddressLine2: $("input[name='SoDelAddr3']").eq(0).val(),
						ARUSuburb: $("input[name='SoDelSuburb']").eq(0).val(),
						ARUState: $("select[name='SoDelState']").eq(0).val(),
						ARUPostCode: $("input[name='SoDelPostcode']").eq(0).val(),
						ARUContactPhone: $("input[name='SoDelPhone']").eq(0).val()
					}
					$.cv.css.user.setCurrentUserDetails({ updateData: userUpdateData, jsonFieldGroup: "saveAddressFieldGroup2" });
				}
			}
		else{	
				//if order is pickup, save the following data against the user record.
				if (usr && usr.data && usr.data.length > 0) {
					var userUpdateData = {
						_objectKey: usr.data[0]._objectKey,
						FirstName: $("input[name='CN_DeliveryFirstName']").eq(0).val(),
						Surname: $("input[name='CN_DeliverySurname']").eq(0).val(),
						SoBillAddr1: $("input[name='CN_BillingDelAddr0']").eq(0).val(),
						SoBillAddr2: $("input[name='CN_BillingDelAddr2']").eq(0).val(),
						SoBillAddr3: $("input[name='CN_BillingDelAddr3']").eq(0).val(),
						SoBillSuburb: $("input[name='CN_BillingDelAddr4']").eq(0).val(),
						SoBillState: $("select[name='CN_BillingDelState']").eq(0).val(),
						SoBillPostcode: $("input[name='CN_BillingPostcode']").eq(0).val(),
						SoBillAddr4: $("input[name='CN_BillingDelPhone']").eq(0).val(),
						ARUAddressLine0: $("input[name='CN_BillingDelAddr0']").eq(0).val(),
						ARUAddressLine1: $("input[name='CN_BillingDelAddr2']").eq(0).val(),
						ARUAddressLine2: $("input[name='CN_BillingDelAddr3']").eq(0).val(),
						ARUSuburb: $("input[name='CN_BillingDelAddr4']").eq(0).val(),
						ARUState: $("select[name='CN_BillingDelState']").eq(0).val(),
						ARUPostCode: $("input[name='CN_BillingPostcode']").eq(0).val(),
						ARUContactPhone: $("input[name='CN_BillingDelPhone']").eq(0).val(),
					}
					$.cv.css.user.setCurrentUserDetails({ updateData: userUpdateData, jsonFieldGroup: "saveAddressFieldGroup2" });
				}
			}  
		
		});
	};
  
  $.cv.checkoutCustom.refreshBillingDetails = function(updateOnChange) {
		/*$("#checkout-billing-details").each(function() {
			var ocWidget = $(this).data("orderCompleteFields");
			if (ocWidget) {
					ocWidget.destroy();
			}
      $("#checkout-billing-details").orderCompleteFields({viewTemplate: "billingDetailsTemplate"});
      var dWidget = $(this).data("deliveryAddress");
			if (dWidget) {
					dWidget.destroy();
			}
      $("#checkout-delivery-details").deliveryAddress({viewTemplate: "deliveryDetailsTemplate"});
		});*/
		$("#billingDetailsFullNameSpan").html($("input[name='CN_BillingName']").eq(0).val());
		$("#billingDetailsAddr0Span").html($("input[name='CN_BillingDelAddr0']").eq(0).val());
		$("#billingDetailsAddr1Span").html($("input[name='CN_BillingDelAddr2']").eq(0).val());
		$("#billingDetailsAddr2Span").html($("input[name='CN_BillingDelAddr3']").eq(0).val());
		$("#billingDetailsSuburbSpan").html($("input[name='CN_BillingDelAddr4']").eq(0).val());
		$("#billingDetailsStateSpan").html($("select[name='CN_BillingDelState']").eq(0).val());
		$("#billingDetailsPostcodeSpan").html($("input[name='CN_BillingPostcode']").eq(0).val());
		$("#billingDetailsPhoneNameSpan").html($("input[name='CN_BillingDelPhone']").eq(0).val());
		
		
		$("#deliveryDetailsAddr0Span").html($("input[name='SoDelAddr0']").eq(0).val());
		$("#deliveryDetailsAddr6Span").html($("input[name='SoDelAddr6']").eq(0).val());
		$("#deliveryDetailsFullNameSpan").html($("input[name='SoDelAddr1']").eq(0).val());
		$("#deliveryDetailsAddr1Span").html($("input[name='SoDelAddr2']").eq(0).val());
		$("#deliveryDetailsAddr2Span").html($("input[name='SoDelAddr3']").eq(0).val());
		$("#deliveryDetailsSuburbSpan").html($("input[name='SoDelSuburb']").eq(0).val());
		$("#deliveryDetailsStateSpan").html($("select[name='SoDelState']").eq(0).val());
		$("#deliveryDetailsPostcodeSpan").html($("input[name='SoDelPostcode']").eq(0).val());
		$("#deliveryDetailsPhoneNameSpan").html($("input[name='SoDelPhone']").eq(0).val());
		
	};
	
	
  $.cv.checkoutCustom.refreshBillingDetailsPaypal = function(updateOnChange) {

		$("#billingDetailsFullNameSpan").html($("input[name='SoBillAddr1']").eq(0).val());
		//$("#billingDetailsAddr0Span").html($("input[name='SoBillAddr1']").eq(0).val());
		$("#billingDetailsAddr1Span").html($("input[name='SoBillAddr2']").eq(0).val());
		$("#billingDetailsAddr2Span").html($("input[name='SoBillAddr3']").eq(0).val());
		$("#billingDetailsSuburbSpan").html($("input[name='SoBillSuburb']").eq(0).val());
		$("#billingDetailsStateSpan").html($("input[name='SoBillAddr5']").eq(0).val());
		$("#billingDetailsPostcodeSpan").html($("input[name='SoBillPostcode']").eq(0).val());
		$("#billingDetailsPhoneNameSpan").html($("input[name='SoBillAddr7']").eq(0).val());
		
		//$("#billingDetailsFullNameSpan").html($("input[name='CN_BillingName']").eq(0).val());
		//$("#billingDetailsAddr0Span").html($("input[name='CN_BillingDelAddr0']").eq(0).val());
		//$("#billingDetailsAddr1Span").html($("input[name='CN_BillingDelAddr2']").eq(0).val());
		//$("#billingDetailsAddr2Span").html($("input[name='CN_BillingDelAddr3']").eq(0).val());
		//$("#billingDetailsSuburbSpan").html($("input[name='CN_BillingDelAddr4']").eq(0).val());
		//$("#billingDetailsStateSpan").html($("select[name='CN_BillingDelState']").eq(0).val());
		//$("#billingDetailsPostcodeSpan").html($("input[name='CN_BillingPostcode']").eq(0).val());
		//$("#billingDetailsPhoneNameSpan").html($("input[name='CN_BillingDelPhone']").eq(0).val());

	};
	
	//custom method to update CN fields if its PPE.
	$.cv.checkoutCustom.updateBillingAddressPaypal = function() {
			
				//split full name
				var fullName = 'N/A'
				if($("input[name='SoBillAddr1']").val().length > 0){
				var fullName = $("input[name='SoBillAddr1']").val();
				}
				
				var firstName = fullName.substring(0, fullName.indexOf(' ')); 
				var surName = fullName.substring(fullName.indexOf(' ')+1); 
				
				if (firstName.length == 0){
					var firstName = surName;
					var surName = "N/A";
				}
				
				
				$.cv.css.orders.updateOrderCompleteFieldGroupData({
					newValues: {
					'BillingAddressDetails': {
											'CN_BillingFirstName': firstName,
											'CN_BillingSurname': surName,
											'CN_BillingName': $("input[name='SoBillAddr1']").val(),
											'CN_BillingDelAddr0': 'N/A',
											'CN_BillingDelAddr2': $("input[name='SoBillAddr2']").val(),
											'CN_BillingDelAddr3': $("input[name='SoBillAddr3']").val(),
											'CN_BillingDelAddr4': $("input[name='SoBillSuburb']").val(),
											'CN_BillingDelState': $("input[name='SoBillAddr5']").val(),
											'CN_BillingDelAddr5': $("input[name='SoBillPostcode']").val(),
											'CN_BillingPostcode': $("input[name='SoBillPostcode']").val(),
											'CN_BillingDelPhone': $("input[name='SoBillAddr7']").val()
											},
					'BillingAddressDetailsPaypal': {}						
					}
				});
				
				
			};

	

	
	
  
  $.cv.checkoutCustom.changeBillingAddressUpdates = function(updateOnChange) {
		$(".customer-billing[data-role='ordercompletefields']").each(function() {
			var ocWidget = $(this).data("orderCompleteFields");
			if (ocWidget) {
					ocWidget.setUpdateOnChange(updateOnChange);
			}
		});
	};
  
	$.cv.checkoutCustom.bulkChangeBillingAddress = function() {
		$(".customer-billing[data-role='ordercompletefields']").each(function() {
			var ocWidget = $(this).data("orderCompleteFields");
			if (ocWidget) {
					ocWidget.updateOrderCompleteFields();
			}
		});
	};
  
	$.cv.checkoutCustom.copyAddressFieldsToBillingAddress = function(obs) {
		$.cv.checkoutCustom.changeBillingAddressUpdates(false);
		$.each(obs, function(idx, item) {
			$.cv.checkoutCustom.copyAddressFieldToBillingAddress(item.obj, item.val);
		});
		$.cv.checkoutCustom.bulkChangeBillingAddress();
		$.cv.checkoutCustom.changeBillingAddressUpdates(true);
	};
  
	$.cv.checkoutCustom.copyAddressFieldToBillingAddress  = function(obj, val) {
		obj.val(val).change();
	};
  
	$.cv.checkoutCustom.updateBillingAddress = function() {
		var obs = [];
		var updateOnChange = true;
		if ($("#different-billing-address").is(':checked')) {
			obs.push({obj: $("input[name='CN_BillingFirstName']").eq(0), val: ""});
			obs.push({obj: $("input[name='CN_BillingSurname']").eq(0), val: ""});
			obs.push({obj: $("input[name='CN_BillingName']").eq(0), val: ""});
			obs.push({obj: $("input[name='CN_BillingDelAddr0']").eq(0), val: ""});
			obs.push({obj: $("input[name='CN_BillingDelAddr2']").eq(0), val: ""});
			obs.push({obj: $("input[name='CN_BillingDelAddr3']").eq(0), val: ""});
			obs.push({obj: $("input[name='CN_BillingDelAddr4']").eq(0), val: ""});
			obs.push({obj: $("select[name='CN_BillingDelState']").eq(0), val: ""});
			obs.push({obj: $("input[name='CN_BillingPostcode']").eq(0), val: ""});
			obs.push({obj: $("input[name='CN_BillingDelPhone']").eq(0), val: ""});
			$.cv.checkoutCustom.copyAddressFieldsToBillingAddress(obs);
		} else if ($('[data-role="deliveryaddress"]').data("deliveryAddressMode") == "Pickup"){
			$.cv.checkoutCustom.updateBillingAddressPickUp();
		}
		else {
			obs.push({obj: $("input[name='CN_BillingFirstName']").eq(0), val: $("input[name='CN_DeliveryFirstName']").val()});
			obs.push({obj: $("input[name='CN_BillingSurname']").eq(0), val: $("input[name='CN_DeliverySurname']").val()});
			obs.push({obj: $("input[name='CN_BillingName']").eq(0), val: $("input[name='SoDelAddr1']").val()});
			obs.push({obj: $("input[name='CN_BillingDelAddr0']").eq(0), val: $("input[name='SoDelAddr6']").val()});
			obs.push({obj: $("input[name='CN_BillingDelAddr2']").eq(0), val: $("input[name='SoDelAddr2']").val()});
			obs.push({obj: $("input[name='CN_BillingDelAddr3']").eq(0), val: $("input[name='SoDelAddr3']").val()});
			obs.push({obj: $("input[name='CN_BillingDelAddr4']").eq(0), val: $("input[name='SoDelSuburb']").val()});
			obs.push({obj: $("select[name='CN_BillingDelState']").eq(0), val: $("select[name='SoDelState']").val()});
			obs.push({obj: $("input[name='CN_BillingPostcode']").eq(0), val: $("input[name='SoDelPostcode']").val()});
			obs.push({obj: $("input[name='CN_BillingDelPhone']").eq(0), val: $("input[name='SoDelPhone']").val()});
			$.cv.checkoutCustom.copyAddressFieldsToBillingAddress(obs);
		}
	};
	
	//custom method to update sobill fields when not PPE
	$.cv.checkoutCustom.updateBillingAddress2 = function() {
			$.cv.css.orders.updateOrderCompleteFieldGroupData({
				newValues: {
				'BillingAddressDetails': {},
				'BillingAddressDetailsPaypal': {
										'SoBillAddr1': $("input[name='CN_BillingName']").val(),
										'SoBillAddr2': $("input[name='CN_BillingDelAddr2']").val(),
										'SoBillSuburb': $("input[name='CN_BillingDelAddr4']").val(),
										'SoBillAddr5': $("select[name='CN_BillingDelState']").val(),
										'SoBillPostcode': $("input[name='CN_BillingPostcode']").val(),
										'SoBillAddr7': $("input[name='CN_BillingDelPhone']").val()
									
				}
			}
		});
	}
	
	
	
	$.cv.checkoutCustom.updateBillingAddressPickUp = function() {
			var obs = [];
			var updateOnChange = true;
			$.cv.css.getUserDetails({userDetailJsonFieldGroup: 'UserDetails',
			success: function (data) {
				delete data.d;
				if (data.Success) { 
					if (data.Data.SoBillAddr1 !== null ) {
					var firstName = data.Data.FirstName;
					var surName = data.Data.Surname;	
					var fullName = $.cv.checkoutCustom.mergeFullName2(firstName, surName);
					obs.push({obj: $("input[name='CN_BillingName']").eq(0), val: fullName}); 
					//obs.push({obj: $("input[name='CN_DeliveryFirstName']").eq(0), val: data.Data.StoreName});	 
					obs.push({obj: $("input[name='CN_BillingFirstName']").eq(0), val: data.Data.FirstName});
					obs.push({obj: $("input[name='CN_BillingSurname']").eq(0), val: data.Data.Surname});
					obs.push({obj: $("input[name='CN_BillingDelAddr0']").eq(0), val: data.Data.ARUAddressLine0});
					obs.push({obj: $("input[name='CN_BillingDelAddr2']").eq(0), val: data.Data.ARUAddressLine1});
					obs.push({obj: $("input[name='CN_BillingDelAddr3']").eq(0), val: data.Data.ARUAddressLine2});
					obs.push({obj: $("input[name='CN_BillingDelAddr4']").eq(0), val: data.Data.ARUSuburb});
					obs.push({obj: $("select[name='CN_BillingDelState']").eq(0), val: data.Data.ARUState});
					obs.push({obj: $("input[name='CN_BillingPostcode']").eq(0), val: data.Data.ARUPostCode});
					obs.push({obj: $("input[name='CN_BillingDelPhone']").eq(0), val: data.Data.ARUContactPhone});
					$.cv.checkoutCustom.copyAddressFieldsToBillingAddress(obs);
					$(".customer-billing").show();
					}
					else{
					console.log("updateBillingAddressPickUp error");	
					}
				}
				else {
					alert(data.Error);
				}
				}
			});
	}
	
	/*
	$.cv.checkoutCustom.updateBillingAddressPaypalExpress = function() {
		var obs = [];
		var updateOnChange = true;
			//obs.push({obj: $("input[name='CN_BillingFirstName']").eq(0), val: ""});
			//obs.push({obj: $("input[name='CN_BillingSurname']").eq(0), val: ""});
			obs.push({obj: $("input[name='SoBillAddr1']").eq(0), val: $("input[name='SoBillAddr1']").val()});
			//obs.push({obj: $("input[name='CN_BillingDelAddr0']").eq(0), val: $("input[name='SoBillAddr7']").val());
			obs.push({obj: $("input[name='SoBillAddr2']").eq(0), val: $("input[name='SoBillAddr2']").val()});
			obs.push({obj: $("input[name='SoBillAddr3']").eq(0), val: $("input[name='SoBillAddr3']").val()});
			obs.push({obj: $("input[name='SoBillAddr4']").eq(0), val: $("input[name='SoBillAddr4']").val()});
			obs.push({obj: $("select[name='SoBillAddr5']").eq(0), val: $("input[name='SoBillAddr5']").val()});
			obs.push({obj: $("input[name='SoBillPostcode']").eq(0), val: $("input[name='SoBillPostcode']").val()});
			obs.push({obj: $("input[name='SoBillAddr7']").eq(0), val: $("input[name='SoBillAddr7']").val()});
			$.cv.checkoutCustom.copyAddressFieldsToBillingAddress(obs);
	}*/
	
	
  
	$.cv.checkoutCustom.mergeShippingFullName = function() {
		var fullName = $.cv.checkoutCustom.mergeFullName("input[name='CN_DeliveryFirstName']", "input[name='CN_DeliverySurname']");
		$("input[name='SoDelAddr1']").eq(0).val(fullName).change();
	//	var appendedAddress = $.cv.checkoutCustom.mergeFullName("input[name='SoDelAddr6']", "input[name='SoDelAddr2']");
	//	$("input[name='SoDelAddr2']").eq(0).val(fullName).change();
		return fullName;
	//	return appendedAddress;
	};
	$.cv.checkoutCustom.mergeBillingFullName = function() {
		var fullName = $.cv.checkoutCustom.mergeFullName("input[name='CN_BillingFirstName']", "input[name='CN_BillingSurname']");
		$("input[name='CN_BillingName']").eq(0).val(fullName).change();
	return fullName;
	 //   var appendedAddress = $.cv.checkoutCustom.mergeFullName("input[name='CN_BillingDelAddr0']", "input[name='CN_BillingDelAddr2']");
	//	$("input[name='CN_BillingDelAddr2']").eq(0).val(fullName).change();
	//	return appendedAddress;	
	};
  $.cv.checkoutCustom.mergeFullName = function(fName, sName) {
		var firstName = $(fName).val();
		var surname = $(sName).eq(0).val();
		var fullName = firstName.length > 0 ? firstName + " " + surname : surname;
		return fullName;
	};
	
  $.cv.checkoutCustom.mergeFullName2 = function(fName, sName) {
		var firstName = fName;
		var surname = sName;
		var fullName = firstName.length > 0 ? firstName + " " + surname : surname;
		return fullName;
	};
	$.cv.checkoutCustom.setChangeEvents = function() {
		$("input[name='CN_DeliveryFirstName']").change(function() {
			var fullName = $.cv.checkoutCustom.mergeShippingFullName();
      if (!$("#different-billing-address").is(':checked')) {
        $.cv.checkoutCustom.copyAddressFieldsToBillingAddress([{obj: $("input[name='CN_BillingFirstName']").eq(0), val: $(this).val() }, {obj: $("input[name='CN_BillingName']").eq(0), val: fullName }]);
      }
    });
		$("input[name='CN_DeliverySurname']").change(function() {
			var fullName = $.cv.checkoutCustom.mergeShippingFullName();
      if (!$("#different-billing-address").is(':checked')) {
        $.cv.checkoutCustom.copyAddressFieldsToBillingAddress([{obj: $("input[name='CN_BillingSurname']").eq(0), val: $(this).val() }, {obj: $("input[name='CN_BillingName']").eq(0), val: fullName }]);
      }
    });
		
		$("input[name='CN_BillingFirstName'],input[name='CN_BillingSurname']").change(function() {
      if ($("#different-billing-address").is(':checked')) {
        $.cv.checkoutCustom.mergeBillingFullName();
      }
    });
	  
//		$("input[name='SoDelAddr1']").change(function() {
//      if (!$("#different-billing-address").is(':checked')) {
//        $.cv.checkoutCustom.copyAddressFieldsToBillingAddress([{obj: $("input[name='CN_BillingName']").eq(0), val: $(this).val() }]);
//      }
//    });

    $("input[name='SoDelAddr6']").change(function() {
      if (!$("#different-billing-address").is(':checked')) {
        $.cv.checkoutCustom.copyAddressFieldsToBillingAddress([{obj: $("input[name='CN_BillingDelAddr0']").eq(0), val: $(this).val() }]);
      }
    });
    $("input[name='SoDelAddr2']").change(function() {
      if (!$("#different-billing-address").is(':checked')) {
        $.cv.checkoutCustom.copyAddressFieldsToBillingAddress([{obj: $("input[name='CN_BillingDelAddr2']").eq(0), val: $(this).val() }]);
      }
    });
    $("input[name='SoDelAddr3']").change(function() {
      if (!$("#different-billing-address").is(':checked')) {
        $.cv.checkoutCustom.copyAddressFieldsToBillingAddress([{obj: $("input[name='CN_BillingDelAddr3']").eq(0), val: $(this).val() }]);
      }
    });
    $("input[name='SoDelSuburb']").change(function() {
      if (!$("#different-billing-address").is(':checked')) {
        $.cv.checkoutCustom.copyAddressFieldsToBillingAddress([{obj: $("input[name='CN_BillingDelAddr4']").eq(0), val: $(this).val() }]);
      }
    });
    $("select[name='SoDelState']").change(function() {
      if (!$("#different-billing-address").is(':checked')) {
        $.cv.checkoutCustom.copyAddressFieldsToBillingAddress([{obj: $("select[name='CN_BillingDelState']").eq(0), val: $(this).val() }]);
      }
    });
    $("input[name='SoDelPostcode']").change(function() {
      if (!$("#different-billing-address").is(':checked')) {
        $.cv.checkoutCustom.copyAddressFieldsToBillingAddress([{obj: $("input[name='CN_BillingPostcode']").eq(0), val: $(this).val() }]);
      }
    });
    $("input[name='SoDelPhone']").change(function() {
      if (!$("#different-billing-address").is(':checked')) {
        $.cv.checkoutCustom.copyAddressFieldsToBillingAddress([{obj: $("input[name='CN_BillingDelPhone']").eq(0), val: $(this).val() }]);
      }
    });
	};
	
	$.cv.checkoutCustom.initialiseFullName = function() {
		if($('[data-role="deliveryaddress"]').data("deliveryAddressMode") != "Pickup") {
			
			var shippingFullName = $.cv.checkoutCustom.mergeFullName("input[name='CN_DeliveryFirstName']", "input[name='CN_DeliverySurname']");
			if (shippingFullName != $("input[name='SoDelAddr1']").eq(0).val()) {
				$.cv.checkoutCustom.mergeShippingFullName();
			}
			var billingFullName = $.cv.checkoutCustom.mergeFullName("input[name='CN_BillingFirstName']", "input[name='CN_BillingSurname']");
			if (billingFullName != $("input[name='CN_BillingName']").eq(0).val()) {
				$.cv.checkoutCustom.mergeBillingFullName();
			}
		}
	};
  
  $.cv.checkoutCustom.setPaymentOptionEvents = function() {
    // Credid Card Type
    $("input[name='payment-options-radio']").change(function () {
      
    });
    $("#cc-Visa").click(function() {
        $("#cc-Visa").removeClass('inactive').addClass('active');
        $("#cc-MasterCard, #cc-Amex, #cc-BankCard, #cc-DinersClub").removeClass('active').addClass('inactive');
    });

    $("#cc-MasterCard").click(function() {
				$("#cc-MasterCard").removeClass('inactive').addClass('active');
        $("#cc-Visa, #cc-Amex, #cc-BankCard, #cc-DinersClub").removeClass('active').addClass('inactive');
    });

    $("#cc-Amex").click(function() {
				$("#cc-Amex").removeClass('inactive').addClass('active');
        $("#cc-Visa, #cc-MasterCard, #cc-BankCard, #cc-DinersClub").removeClass('active').addClass('inactive');
    });

    $("#cc-BankCard").click(function() {
				$("#cc-BankCard").removeClass('inactive').addClass('active');
        $("#cc-Visa, #cc-MasterCard, #cc-Amex, #cc-DinersClub").removeClass('active').addClass('inactive');
    });

    $("#cc-DinersClub").click(function() {
				$("#cc-DinersClub").removeClass('inactive').addClass('active');
        $("#cc-Visa, #cc-MasterCard, #cc-Amex, #cc-BankCard").removeClass('active').addClass('inactive');
    });
  };
  
  $.cv.checkoutCustom.pickUp  = function() {
	
	if($('[data-role="deliveryaddress"]').data("deliveryAddressMode") == "Pickup") {
	$("input[name='SoDelAddr6']").val($('[data-role="storeavailabilitylocator"]').data("userCurrentStoreName"))
	}
  }
  
})(jQuery);