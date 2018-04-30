/*
* See Doco : http://confluence.commercevision.com.au/x/BgH_Aw
*/
;
(function ($, undefined) {
    var ON_BEFORE_SHOWNEAREST = "beforeShowNearest";
    var ON_AFTER_SHOWNEAREST = "afterShowNearest";
    var ON_BEFORE_UPDATELATLNG = "beforeUpdateLatLng";
    var ON_AFTER_UPDATELATLNG = "afterUpdateLatLng";
    
    var storeLocationWidget = {
        name: "storeLocator",
        extend: "mvvmwidget",
        events: [
            ON_BEFORE_SHOWNEAREST,
            ON_AFTER_SHOWNEAREST,
            ON_BEFORE_UPDATELATLNG,
            ON_AFTER_UPDATELATLNG
        ],

        options: {
            addressIds: [],
            addressAutocompleteId: null,
            addressRegion: "au",
            
            // Expected structure = [['fieldToFilterAgainst','filterType','renderType','optionText',[[optionXText,optionXValue]]],....]
            // eg .. [['pickUp','eq','radioList','a title',[['All','NOFILTER'],['Store Only',1],['Hire Only',0]]],['pickUp2','eq','select','a title',[['All','NOFILTER'],['Store Only',1],['Hire Only',0]]]]
            filterList: null,
            
            latitudeId: null,
            longitudeId: null,
            mapCanvasId: null,
            mapZoom: 12,
            mapMarkerTitle: "You are here",
            mapIconPath: "/images/",
            mapIconPrefix: null,
            mapIconSuffix: ".png",
            mapIconWidth: 50,
            mapIconHeight: 50,
            
            spinnerId: null,
            spinnerOptions: {},

            clearStoresOnSearch: true,
            loadSuburbsOnInit: false,

            errorMessageAddressNotFound: "Address not found.",
            errorMessageAddressLookupFailed: "Address lookup failed.",
            errorMessageUnableToShowMap: "Unable to show map."
        },
        
        initialise: function (el, o) {
            var widget = this,
                opts = widget.options,
                vm = widget.viewModel;
                
            vm.updateFilters();    
        },
        
        // Called after the widget view is bound to the viewModel.
        viewModelBound: function () {
            var widget = this;
        },
        
        _getViewModel: function () {
            var widget = this;

            var viewModel = kendo.observable({
                storeLocations:[],
                
                fitlersHaveBeenBuild:false,
                filters:[],
                updateFilters:function(){
                    var vm = this;
                    
                    if(vm.get("fitlersHaveBeenBuild") == false){
                        vm.set("fitlersHaveBeenBuild",true);
                        
                        var tempArray = [],
                            fList = widget.options.filterList;
                        
                        if(fList != null)
                        {
                            for(var fIndex in fList)
                            {
                                // INCORRECT INPUT :O
                                if (fList[fIndex].length != 5)
                                {
                                    return;
                                }
                                
                                var optionsListWithOptsAsObjects=[];
                                for(var fOptsIndex in fList[fIndex][4])
                                {
                                    optionsListWithOptsAsObjects.push({
                                        text:fList[fIndex][4][fOptsIndex][0],
                                        optVal:fList[fIndex][4][fOptsIndex][1]
                                    });
                                }
                                
                                var isSelect = fList[fIndex][2] == 'select';
                                tempArray.push({
                                    showRadio:!isSelect,
                                    showSelect:isSelect,
                                    // IE ProductCode or StoreId
                                    // that is to say the field name in sql
                                    fieldToFilterAgainst: fList[fIndex][0],
                                    valueToFilterAgainst: 'NOFILTER',
                                    // eq is only current option
                                    // eq = equal or 'where fieldToFilterAgainst = valueToFilterAgainst'
                                    filterType: fList[fIndex][1],
                                    optionText: fList[fIndex][3],
                                    options: optionsListWithOptsAsObjects
                                });
                            }
                        }
                        
                        vm.set("filters",tempArray);
                    }
                },

                // Returns a ; seperated list of applied filters
                getAppliedFilters:function(){
                    var vm = this,
                        filters = vm.get("filters"),
                        expandoString = '',
                        isNotFirst = false;
                    
                    for(var filter in filters){
                        if (filters[filter].valueToFilterAgainst != null && 
                            filters[filter].valueToFilterAgainst != 'NOFILTER')
                        {
                            expandoString += 
                                (isNotFirst? ";":"") + 
                                filters[filter].fieldToFilterAgainst + ":" +
                                filters[filter].filterType + ":" + 
                                filters[filter].valueToFilterAgainst;
                             
                            isNotFirst = true;
                        }
                    }

                    var selectSuburb = vm.get("selectedSuburb");
                    if (selectSuburb && selectSuburb != null && selectSuburb != "" && selectSuburb != '')
                    {
                        expandoString +=
                            (isNotFirst ? ";" : "") +
                            "Suburb:" +
                            "eq:" +
                            selectSuburb;
                    }

                    return expandoString;
                },
                
                isProcessing: false,

                suburbList: [],
                suburbListPopulated: function () {
                    return vm.get('suburbList').length > 0;
                },
                getSuburbList: function () {
                    var vm = this;

                    $.cv.css.storeLocator.getSuburbs().done(function (data) {
                        var dataObject = [];

                        for (var q = 0; q < data.data.length; q++) {
                            dataObject.push(kendo.observable({
                                id: data.data[q].Suburb,
                                text: data.data[q].Suburb
                            }));
                        }

                        vm.set('suburbList', dataObject);
                    });
                },

                selectedSuburb: "",
                
                // Get latitude/longitude from an address.
                updateLatLongFromAddress: function () {
                    widget.trigger(ON_BEFORE_UPDATELATLNG);
                    viewModel._clearMessages();
                    
                    // Build address.
                    var address = viewModel._getAddress();

                    // Get latitude/longitude from an address.
                    var $lat = $("#" + widget.options.latitudeId);
                    var $lng = $("#" + widget.options.longitudeId);

                    if ($lat.length > 0 && $lng.length > 0 && address.length > 0) {
                        var geocoder = new google.maps.Geocoder();
                        viewModel.set("isProcessing", true);
                        viewModel._showSpinner();
                        geocoder.geocode({ "address": address, "region": widget.options.addressRegion }, function(results, status) {
                            viewModel.set("isProcessing", false);
                            viewModel._hideSpinner();
                            if (status == google.maps.GeocoderStatus.OK) {
                                $lat.val(results[0].geometry.location.lat());
                                $lng.val(results[0].geometry.location.lng());
                            } else {
                                $lat.val(0);
                                $lng.val(0);
                                viewModel._showError(widget.options.errorMessageAddressNotFound);
                            }

                            widget.trigger(ON_AFTER_UPDATELATLNG);
                        });
                    } else {
                        viewModel._showError(widget.options.errorMessageAddressLookupFailed);
                        widget.trigger(ON_AFTER_UPDATELATLNG);
                    }
                },
                
                // Show a map based on latitude/longitude.
                showMap: function() {
                    viewModel._clearMessages();

                    var $lat = $("#" + widget.options.latitudeId);
                    var $lng = $("#" + widget.options.longitudeId);

                    if (widget.options.mapCanvasId.length > 0 && $lat.length > 0 && $lng.length > 0) {
                        viewModel._showMap($lat.val(), $lng.val());
                    } else {
                        viewModel._showError(widget.options.errorMessageUnableToShowMap);
                    }
                },

                showNearest: function () {
                    var vm = this;
                
                    widget.trigger(ON_BEFORE_SHOWNEAREST);
                    vm.set("isProcessing", true);
                    if (widget.options.clearStoresOnSearch) {
                        vm.set("storeLocations", []);
                        vm._hideMap();
                    }
                    vm._clearMessages();
                    vm._showSpinner();

                    // 1. Get the address.
                    var address = vm._getAddress();
                    var mapSetup = function(results, status, showMap) {
                        var appliedFilters = vm.getAppliedFilters();
                        var p = $.noop;
                        if (status == google.maps.GeocoderStatus.OK || (status == "filterOnly" && appliedFilters != '')) {
                            // 3. Get nearest stores.
                            if (status == "filterOnly") {
                                p = $.cv.css.storeLocator.findNearestStore({
                                    latitude: 0,
                                    longitude: 0,
                                    filters: appliedFilters
                                });
                            } else if (appliedFilters != '') {
                                showMap = false;
                                p = $.cv.css.storeLocator.findNearestStore({
                                    latitude: results[0].geometry.location.lat(),
                                    longitude: results[0].geometry.location.lng(),
                                    filters: appliedFilters
                                });
                            } else {
                                p = $.cv.css.storeLocator.findNearestStore({
                                    latitude: results[0].geometry.location.lat(),
                                    longitude: results[0].geometry.location.lng(),
                                    filters: ""
                                });
                            }
                            $.when(p).done(function (data) {
                                if (showMap) {
                                    // Calculate boundary for markers.
                                    var bounds = new google.maps.LatLngBounds();
                                    bounds.extend(new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng())); // Add search location.

                                    $.each(data.data, function(i, storeLocation) {
                                        storeLocation.position = new google.maps.LatLng(storeLocation.Latitude, storeLocation.Longitude);
                                        bounds.extend(storeLocation.position);
                                    });

                                    // 4. Show map.
                                    var map = vm._showMap(results[0].geometry.location.lat(), results[0].geometry.location.lng(), bounds);

                                    // 5. Add markers to map.
                                    $.each(data.data, function(i, storeLocation) {
                                        storeLocation.Index = i + 1;
                                        vm._addMarker(map, storeLocation.position, storeLocation.StoreName, storeLocation.Index);
                                    });
                                } else {
                                    $.each(data.data, function (i, storeLocation) {
                                        storeLocation.Index = i + 1;
                                    });
                                }

                                vm.set("storeLocations", data.data);

                                vm._hideSpinner();
                                vm.set("isProcessing", false);
                                widget.trigger(ON_AFTER_SHOWNEAREST);
                            });
                        } else {
                            vm._showError(widget.options.errorMessageAddressNotFound);
                            widget.trigger(ON_AFTER_SHOWNEAREST);
                        }
                    };

                    if (!address || address == "" || address == '') {
                        // skip step 2
                        mapSetup(null,"filterOnly",false);
                    } else {
                        // 2. Get latitude/longitude of address.
                        var geocoder = new google.maps.Geocoder();
                        geocoder.geocode({ "address": address, "region": widget.options.addressRegion }, function (results, status) {
                                mapSetup(results, status, true);
                            }
                        );
                    }
                },
                
                searchInputKeyUp: function (event) {
                    if (event.which == 13) {
                        // Prevent the default methods for the enter key, helps stop the form submitting when there is an input of type submit on the page.
                        event.preventDefault();
                        event.stopPropagation();
                        viewModel.showNearest();
                    }
                },

                _getAddress: function() {
                    var address = "";

                    $.each(widget.options.addressIds, function(i, addressId) {
                        if (i > 0) {
                            address += " ";
                        }
                        address += $("#" + addressId).val();
                    });

                    return address;
                },

                _hideMap: function () {
                    $("#" + widget.options.mapCanvasId).empty();
                },

                _showMap: function(latitude, longitude, bounds) {
                    var mapOptions = {
                        center: new google.maps.LatLng(latitude, longitude),
                        zoom: widget.options.mapZoom,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    var map = new google.maps.Map($("#" + widget.options.mapCanvasId).get(0), mapOptions);

                    var latlong = new google.maps.LatLng(latitude, longitude);
                    var marker = new google.maps.Marker({
                        map: map,
                        position: latlong,
                        title: widget.options.mapMarkerTitle
                    });
                    
                    if (bounds) {
                        map.fitBounds(bounds);
                        map.panToBounds(bounds);
                    }
                    return map;
                },
                
                _addMarker: function (map, position, title, index) {
                    var icon = null;
                    if (widget.options.mapIconPrefix) {
                        icon = new google.maps.MarkerImage(
                            widget.options.mapIconPath + widget.options.mapIconPrefix + index + widget.options.mapIconSuffix,
                            new google.maps.Size(widget.options.mapIconWidth, widget.options.mapIconHeight));
                    }
                    
                    var marker = new google.maps.Marker({
                        map: map,
                        position: position,
                        title: title,
                        icon: icon
                    });
                },
                
                _showError: function (messageText) {
                    viewModel._hideSpinner();
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
                
                _showSpinner: function() {
                    if (widget.options.spinnerId) {
                        $("#" + widget.options.spinnerId).spin(widget.options.spinnerOptions);
                    }
                },
                    
                _hideSpinner: function() {
                    if (widget.options.spinnerId) {
                        $("#" + widget.options.spinnerId).spin(false);
                    }
                }
            });
            
            if (widget.options.addressAutocompleteId) {
                var addressElement = $("#" + widget.options.addressAutocompleteId).get(0);
                var autocomplete = new google.maps.places.Autocomplete(addressElement, { types: ["geocode"], componentRestrictions: { country: widget.options.addressRegion } });

                google.maps.event.addListener(autocomplete, "place_changed", function () {
                    viewModel.showNearest();
                });
            }

            if (widget.options.loadSuburbsOnInit) {
                viewModel.getSuburbList();
            }

            return viewModel;
        },

        _buildViewTemplate: function () {
            var widget = this;
        }
    };

    // Register the widget.
    $.cv.ui.widget(storeLocationWidget);
})(jQuery);
