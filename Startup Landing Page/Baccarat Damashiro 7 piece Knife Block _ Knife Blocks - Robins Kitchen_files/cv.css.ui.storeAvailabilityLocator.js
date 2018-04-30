/*
* 
*/
;


(function ($, undefined) {
    var ON_BEFORE_SHOWNEAREST = "beforeShowNearest";
    var ON_AFTER_SHOWNEAREST = "afterShowNearest";
    var ON_BEFORE_UPDATELATLNG = "beforeUpdateLatLng";
    var ON_AFTER_UPDATELATLNG = "afterUpdateLatLng";

    var storeAvailabilityLocatorWidget = {
        name: "storeAvailabilityLocator",
        extend: "mvvmwidget",
        events: [
            ON_BEFORE_SHOWNEAREST,
            ON_AFTER_SHOWNEAREST,
            ON_BEFORE_UPDATELATLNG,
            ON_AFTER_UPDATELATLNG
        ],

        options: {
            widgetGuid: null,
            addressSearchId: "",

            searchResultsMax: 3,
            whenNoStoreSetText: "Please select your store",
            setStoreButtonText: "Set Location",
            currentStoreButtonText: "My Store",
            userCurrentStoreName: "",
            storeLocationDetailsFieldDataCustomFieldGroup: "store-location-availability",
            
            errorMessageAddressNotFound: "Address not found.",
            errorMessageAddressLookupFailed: "Address lookup failed.",
            errorMessageUnableToShowMap: "Unable to show map.",
            checkStoreAvailabilityClickAndCollect: true
        },
        
        initialise: function (el, o) {
            var widget = this,
                opts = widget.options,
                vm = widget.viewModel;
                
            vm._bindSuburbLookup();
        },
        
        // Called after the widget view is bound to the viewModel.
        viewModelBound: function () {
            var widget = this; 
        },
        
        _getViewModel: function () {
            var widget = this;

            var viewModel = kendo.observable({
                storeLocations: [],
                currentStoreDetails: [],
                currentStoreName: widget.options.userCurrentStoreName,
                selectedAddress: "",
                selectDone: false,
                disableView: false,

                
                isProcessing: false,
                isProcessingSetStore: false,
                              
                _showError: function (messageText) {
                    viewModel.set("isProcessing", false);
                    viewModel._showMessage({ Type: "error", Message: messageText });
                },
                
                _showMessage: function (message, clearExisting) {
                    // Get CSS class for type of error.
                    var type = "";
                    $.each($.cv.css.messageTypes, function (key, value) {
                        if (key == message.Type) {
                            type = value;
                        }
                    });

                    var result = $.cv.css.trigger($.cv.css.eventnames.message, { type: type, message: message.Message, source: widget.name, clearExisting: clearExisting });
                    if (result.handlerCount == 0) {
                        // No widget handled message - display alert.
                        alert(message.Message);
                    }
                },
                
                _clearMessages: function() {
                    $.cv.css.trigger($.cv.css.eventnames.message, { message: "", type: "", source: widget.name, clearExisting: true });
                },
                
                _bindSuburbLookup: function () {
                    var vm = this;
                    var inptAddessSearch = $("input#" + widget.options.addressSearchId);
                    
                    var suburbList = $.cv.data.dataSource({
                        method: 'storeLocator/getSuburbHelpers',
                        params: function () {
                            return {                   
                                searchFilter: inptAddessSearch.val(),
                                incName: true,
                                useLikeName: true,
                                incPostcode: true,
                                useLikePostcode: true,
                                maxResults: 30
                            };
                        }
                    });
                    
                    inptAddessSearch.kendoAutoComplete({
                        dataSource: suburbList,
                        filter: "startswith",            
                        template: '<span>#= data.Name # #= data.State # #= data.Postcode #</span>',
                        change: function(e) {                
                        },
                        select: function(e) {
                            if (e.item.length > 0) {
                                if (e.item[0].innerText == undefined) {
                                    vm.set("selectedAddress", e.item[0].textContent);
                                } else {
                                    vm.set("selectedAddress", e.item[0].innerText);
                                }
                                vm.set("selectDone", true);
                            }
                        },
                        close: function (e) {
                            if (vm.get("selectDone") == true) {                             
                                inptAddessSearch.val(vm.get("selectedAddress"));
                            }                     
                        }
                    });        
                },

                _getDataView: function (data) {
                    var array = [];
                    $.each(data, function (idx, item) {
                        // add standard commands
                        item.index = idx;
                        var dataItem = $.cv.util.getFieldItemData(item);
                        array.push(dataItem);
                    });
                    return array;
                },

                _findStores: function() {
                    var vm = this;
                    var address = vm.get("selectedAddress");

                    if (vm.get("selectDone") == false) {
                        return false;
                    }

                    vm.set("isProcessing", true);

                    // 2. Get latitude/longitude of address.
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ "address": address, "region": 'Australia' }, function(results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            // 3. Get nearest stores.
                            var origLat = results[0].geometry.location.lat(),
                                origLng = results[0].geometry.location.lng();

                            var p = $.cv.css.storeLocator.findNearestStore({
                                latitude: origLat,
                                longitude: origLng,
                                maxStores: widget.options.searchResultsMax,
                                jsonFieldGroupName: widget.options.storeLocationDetailsFieldDataCustomFieldGroup,
                                checkStoreAvailabilityClickAndCollect: widget.options.checkStoreAvailabilityClickAndCollect
                        });

                            $.when(p).done(function (data) {
                                $.each(data.data, function (i, storeLocation) {
                                    if (storeLocation.StoreLocationDetailsFieldData) {
                                        storeLocation.StoreLocationDetailsFieldData = vm._getDataView(storeLocation.StoreLocationDetailsFieldData);
                                    } 
                                });

                                vm.set("storeLocations", data.data);
                                vm.set("isProcessing", false);
                                vm.set("selectDone", false);
                            });
                        } else {
                            vm.set("isProcessing", false);
                            vm.set("selectDone", false);
                        }
                    });

                    return false; // prevent postback
                },

                _setStore: function (item) {
                    var vm = this,
                        storeToSet = item.data.StoreName;

                    // just return if click on current store.
                    if (storeToSet === vm.get("currentStoreName"))
                        return false; // prevent postback

                    vm._stopIsProcessingSetStore(true, storeToSet);

                    var p = $.cv.css.storeLocator.setUserCurrentStore({ storeName: storeToSet});

                    $.when(p).done(function (data) {
                        if (data.data && data.data.success) {

                            // Update vm with what current store is
                            vm.set("currentStoreName", storeToSet);

                            // Set Cookie
                            vm._setCurrentStoreNameCookie(storeToSet);

                            if (data.data.reloadPage) {
                                location.reload(true);
                            }

                            // Go through and update each one so correct one shows as current store.
                            var searchStores = vm.get("storeLocations");

                            $.each(searchStores, function(i, store) {
                                store.set("IsUsersCurrentPickupStore", store.StoreName === storeToSet);
                            });
                        }
                        vm._stopIsProcessingSetStore(false, "");
                    });

                    return false; // prevent postback
                },

                _stopIsProcessingSetStore: function (checked, storeToSet) {
                    var vm = this;
                    var searchStoresCheck = vm.get("storeLocations");
                    if (checked) {
                        _.each(searchStoresCheck, function (store) {
                            store.set("isProcessingSetStore", store.StoreName === storeToSet);
                            store.set("disableView", store.StoreName !== storeToSet);
                        });
                    } else {

                        _.each(searchStoresCheck, function (store) {
                            store.set("isProcessingSetStore", false);
                            store.set("disableView", true);
                        });
                    }
                },
                
                _getCurrentStoreText: function () {
                    var vm = this,
                        currStore = vm.get("currentStoreName");

                    return currStore.length > 0 ? currStore : widget.options.whenNoStoreSetText;
                },

                _getSetStoreButtonText: function (item) {
                    return item.get("IsUsersCurrentPickupStore") ? widget.options.currentStoreButtonText : widget.options.setStoreButtonText;
                },

                _setCurrentStoreNameCookie: function (storeName) {
                    $.cookie("User.StoreName", storeName, { expires: 365 } );
                },

                showStoreList: false,

                _toggleStoreLocationDisplay: function () {
                    var vm = this;
                    vm.set("showStoreList", !vm.get("showStoreList"));
                    var addInp = $("#" + widget.options.addressSearchId);
                    if (addInp.length > 0) { 
                        addInp.kendoAutoComplete();
                        var kendAutoComp = addInp.data('kendoAutoComplete');
                        kendAutoComp.focus();
                    }
                }
            });

            return viewModel;
        }
    };

    // Register the widget.
    $.cv.ui.widget(storeAvailabilityLocatorWidget);
})(jQuery);
