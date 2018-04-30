;
(function ($, undefined) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.metaData = $.cv.css.metaData || {};

    $.cv.css.metaData.getMetaDataArray = function(widget, msg) {
        var filterMode = "";
        if (msg.data.Mode != undefined) {
            filterMode = msg.data.Mode;
        }
        var FeatureValues = [];
        var currentFilter = $.cv.util.getFilterFeatures();
        var _featureValues = msg.data.FeatureValues,
            _numericFeatureValues = msg.data.NumericFeatureValues != undefined ? msg.data.NumericFeatureValues : {};
        $.each(_.extend(_featureValues, _numericFeatureValues), function (index, item) {
            if (item.length > 0) {
                var featureArray = [];
                $.each(item, function (indexRow, rowItem) {
                    var isMatching = false;

                    // check options against filters only applying to current feature
                    var filtersToCheck = _.filter(currentFilter, function (item) {
                        // If there is only one selection being made under one feature use item[0].Value.
                        // Otherwise if there are multiple selections under one feature, use item[0][0].Value
                        // The structure of the array returned by $.cv.util.getFilterFeatures() can vary. 
                        return (item[0].Value || item[0][0].Value) === index;
                    });

                    // ensure filter by options aren't auto-selected if named similarly
                    for (var cf = 0; cf < filtersToCheck.length; cf++) {
                        for (var cfi = 0; cfi < filtersToCheck[cf].length; cfi++) {
                            if (_.isArray(filtersToCheck[cf][cfi])) {
                                _.each(filtersToCheck[cf][cfi], function (orItem) {
                                    if (orItem.Key === "Value" && orItem.Value === rowItem.Value) {
                                        isMatching = true;
                                    }
                                });
                            } else {
                                if (filtersToCheck[cf][cfi].Key === "Value" && filtersToCheck[cf][cfi].Value === rowItem.Value) {
                                    isMatching = true;
                                }
                            }
                        }
                    }

                    // check not already in filters
                    if (filtersToCheck.length === 0 || !isMatching || widget.options.showAll) {
                        // create new array item with click function
                        featureArray.push({
                            featureName: rowItem.Value,
                            featureNameID: rowItem.Value.replace(/ /g, ''),
                            featureProductCount: rowItem.Count,
                            featureKey: index,
                            featureKeyMode: filterMode,
                            isSelected: isMatching,
                            toggleIsSelected: function () {
                                widget.viewModel.clearMessage();
                                var toggleValue = true,
                                    isSelectedValue = this.get("isSelected"),
                                    toggleSingleSelectionMsg = false;
                                if ($.isFunction(widget.viewModel.isSingleSelectionFilter)) {
                                    if (!this.get("isSelected") && widget.viewModel.isSingleSelectionFilter(this.parent().parent().Feature) && this.parent().parent().hasSelectedFilters()) {
                                        toggleSingleSelectionMsg = true;
                                    }
                                }
                                if (toggleValue) {
                                    this.set("isSelected", !isSelectedValue);
                                    if (toggleSingleSelectionMsg) {
                                        this.setFilter(true, false);
                                        this.parent().parent().clear(this);
                                    } else {
                                        if (widget.options.filterOnItemChange) {
                                            this.isSelectedChanged();
                                        }
                                    }
                                }
                            },
                            isSelectedChanged: function () {
                                var triggerNewUri = true;
                                if (widget.options.filterOnItemChange) {
                                    if ($.isFunction(widget.viewModel.unselectedMandatoryFields) && !$.cv.util.isNullOrWhitespace(widget.viewModel.unselectedMandatoryFields($.cv.css.metaData.getSelectedFilters(widget.viewModel)))) {
                                        triggerNewUri = false;
                                    }
                                    this.setFilter(true, triggerNewUri);
                                }
                            },
                            setFilter: function (negateIsSelected, triggerNewUri) {
                                negateIsSelected = (typeof negateIsSelected !== 'undefined' && typeof negateIsSelected !== 'object') ? negateIsSelected : false;
                                triggerNewUri = $.cv.util.hasValue(triggerNewUri) ? triggerNewUri : true;
                                var isSelected = negateIsSelected ? !this.get("isSelected") : this.get("isSelected");
                                if (!negateIsSelected) {
                                    this.set("isSelected", !this.get("isSelected"));
                                }
                                if (widget.options.allowCombinations || this.get("featureProductCount") > 0) {
                                    if (!isSelected) {
                                        $.cv.css.metaData.setupFilter(widget, this.get("featureKey"), this.get("featureName"), this.get("featureKeyMode"), true, triggerNewUri);
                                    } else {
                                        $.cv.css.metaData.setupFilter(widget, this.get("featureKey"), this.get("featureName"), this.get("featureKeyMode"), false, triggerNewUri);
                                    }

                                }
                            }
                        });
                    }
                });
                var rangeSettings = { min: 0, max: 0, selectionStart: 0, selectionEnd: 0, largeStep: 10, isRangeSlider: false };
                if (_.has(_numericFeatureValues, index)) {
                    var values = _.map(_.pluck(featureArray, 'featureName'), function(num) {
                        if (!isNaN(num)) {
                            return Number(num);
                        }
                        return 0;
                    });
                    rangeSettings.min = Math.floor(_.min(values));
                    rangeSettings.max = Math.ceil(_.max(values));

                    var key = index;
                    var selectionStart = "";
                    var selectionEnd = "";

                    $.each(currentFilter, function () {
                        if (this[0].Value === key) {
                            if (this[1].Condition === "ge") {
                                selectionStart = this[1].Value;
                            }
                            if (this[1].Condition === "le") {
                                selectionEnd = this[1].Value;
                            }
                        }
                    });

                    selectionStart = $.cv.util.isNullOrWhitespace(selectionStart) ? rangeSettings.min : selectionStart;
                    selectionEnd = $.cv.util.isNullOrWhitespace(selectionEnd) ? rangeSettings.max : selectionEnd;

                    rangeSettings.selectionStart = selectionStart;
                    rangeSettings.selectionEnd = selectionEnd;

                    // Dynamically calculate steps for range slider
                    // Kendo has some specific requirements for the step sizes for it to actually display the labels on the tick markers
                    // There is a a method $.cv.css.metaData.setRangeSliderTicks that can be fired off to render the tick labels where there are not
                    var difference = Math.abs(rangeSettings.max) - Math.abs(rangeSettings.min);
                    rangeSettings.smallStep = difference / ($.cv.util.hasValue(widget.options.sliderSmallStepCount) ? widget.options.sliderSmallStepCount : 10);
                    rangeSettings.largeStep = rangeSettings.smallStep * ($.cv.util.hasValue(widget.options.sliderLargeStepMultiplier) ? widget.options.sliderLargeStepMultiplier : 2);
                    rangeSettings.isRangeSlider = true;
                }
                // A range slider needs at least two values
                if (!(rangeSettings.isRangeSlider && featureArray.length < 2)) {
                    FeatureValues.push({
                        Feature: index,
                        FeatureID: index.replace(/ /g, ''),
                        Data: featureArray,
                        HasData: featureArray.length > 0,
                        isExpanded: false,
                        toggleExpanded: function () {
                            this.set("isExpanded", !this.get("isExpanded"));
                        },
                        selectedFilter: null,
                        hasSelectedFilters: function() {
                            return this.selectedFilters().length > 0;
                        },
                        selectedFilters: function() {
                            if (!this.isRangeSlider) {
                                return _.filter(this.Data, function(item) { return item.isSelected; });
                            } else {
                                if (this.get("rangeStart") > this.get("rangeSettings.min") || this.get("rangeEnd") < this.get("rangeSettings.max")) {
                                    var rangeFilter = this.Data[0];
                                    rangeFilter["isRangeSlider"] = true;
                                    rangeFilter["range"] = [this.get("rangeStart"), this.get("rangeEnd")];
                                    return [rangeFilter];
                                }
                                return [];
                            }
                        },
                        isApplying: false,
                        apply: function() {
                            this.set("isApplying", true); // only used be redirect method for now, so no need to unset
                            widget.viewModel.applyFilters();
                        },
                        isClearing: false,
                        clear: function(leaveThisItemTrue) {
                            this.set("isClearing", true); // only used be redirect method for now, so no need to unset
                            var selectedFilters = this.selectedFilters();
                            $.each(selectedFilters, function(idx, filter) {
                                if (filter.get("isSelected") && leaveThisItemTrue.featureName != filter.featureName) {
                                    filter.set("isSelected", false);
                                }
                            });
                            widget.viewModel.removeFilters(_.filter(selectedFilters, function (item) { return item.featureName != leaveThisItemTrue.featureName; }));
                        },
                        rangeSettings: rangeSettings,
                        rangeStart: rangeSettings.selectionStart,
                        rangeEnd: rangeSettings.selectionEnd,
                        isRangeSlider: rangeSettings.isRangeSlider,
                        sliderChanged: function(e) {
                            if (e != undefined && e.values != undefined && _.isArray(e.values) && e.values.length > 1) {
                                this.set("rangeStart", e.values[0]);
                                this.set("rangeEnd", e.values[1]);
                                var triggerNewUri = true;
                                if (widget.options.filterOnItemChange) {
                                    if ($.isFunction(widget.viewModel.unselectedMandatoryFields) && !$.cv.util.isNullOrWhitespace(widget.viewModel.unselectedMandatoryFields($.cv.css.metaData.getSelectedFilters(widget.viewModel)))) {
                                        triggerNewUri = false;
                                    }
                                    $.cv.css.metaData.setupFilter(widget, this.Data[0].featureKey, [this.get("rangeStart"), this.get("rangeEnd")], this.Data[0].featureKeyMode, false, triggerNewUri);
                                }
                            }
                        }
                    });
                }
            }
        });
        return FeatureValues;
    };

    $.cv.css.metaData.setupFilter = function (widget, key, value, keyCondition, add, triggerNewUri) {
        var uriFilters = widget.options.redirectOnFilter ? $.cv.util.getFilterFeatures() : widget.viewModel.get("currentFilters");
        triggerNewUri = $.cv.util.hasValue(triggerNewUri) ? triggerNewUri : true;
        if (!_.isArray(value)) {
            if (!add) {
                // REMOVE: Remove the union containing the filter condition key/value filters (x2)
                uriFilters = $.cv.css.metaData.removeUriFilter(uriFilters, key, value, keyCondition);
            } else {
                // Add: Add new union with filter conditions (x2)
                uriFilters = $.cv.css.metaData.addUriFilter(uriFilters, key, value, keyCondition);
            }
        } else {
            uriFilters = $.cv.css.metaData.removeUriFilter(uriFilters, key, value[0].toString(), keyCondition, false);
            uriFilters = $.cv.css.metaData.removeUriFilter(uriFilters, key, value[1].toString(), keyCondition, false);
            uriFilters = $.cv.css.metaData.addUriFilter(uriFilters, key, value[0].toString(), keyCondition, "ge");
            uriFilters = $.cv.css.metaData.addUriFilter(uriFilters, key, value[1].toString(), keyCondition, "le");
        }

        if (triggerNewUri) {
            // Generate New Uri
            $.cv.css.metaData.generateNewUri(widget, uriFilters);
        } else {
            widget.viewModel.set("currentFilters", uriFilters);
        }
    };

    $.cv.css.metaData.removeUriFilters = function (widget, filters) {
        var uriFilters = widget.options.redirectOnFilter ? $.cv.util.getFilterFeatures() : widget.viewModel.get("currentFilters");
        $.each(filters, function (idx, item) {
            uriFilters = $.cv.css.metaData.removeUriFilter(uriFilters, item.get("featureKey"), item.get("featureName"), item.get("featureKeyMode"));
        });
        // Generate New Uri
        $.cv.css.metaData.generateNewUri(widget, uriFilters);
    };

    $.cv.css.metaData.removeUriFilter = function (uriFilters, key, value, keyCondition, compareValue) {
        var keyLabel = (keyCondition === "FeaturesByGroup" ? "ProductFeatureNames.Group" : "ProductFeatureNames.Name");
        var newUriFilters = [];
        var shouldCompareValue = $.cv.util.hasValue(compareValue) ? compareValue : true;

        var tempUriFilters = [];
        _.each(uriFilters, function (item) {
            if (_.isArray(item[0])) {
                _.each(item,
                    function(innerItem) {
                        tempUriFilters.push(innerItem);
                    });
            } else {
                tempUriFilters.push(item);
            }
        });
        uriFilters = tempUriFilters;

        for (var i = 0; i < uriFilters.length; i++) { // < Union
            (function () {
                for (var j = 0; j < uriFilters[i].length; j += 2) { // The filter values come in pairs so go through list 2 at a time
                    var newUnionEntry = [],
                        includeThisUnion = true;
                    if (uriFilters[i][j] && uriFilters[i][j + 1]) {
                        if (_.isArray(uriFilters[i][j])) {
                            for (var k = 0; k < uriFilters[i][j].length; k += 2) {
                                if (uriFilters[i][j][k].Key === keyLabel &&
                                    uriFilters[i][j][k].Value === key && uriFilters[i][j][k + 1].Key === "Value" &&
                                    ((shouldCompareValue && uriFilters[i][j][k + 1].Value === value) || !shouldCompareValue)) {
                                    includeThisUnion = false;
                                    break;
                                } else {
                                    newUnionEntry.push(uriFilters[i][j][k]);
                                    newUnionEntry.push(uriFilters[i][j][k + 1]);
                                }
                            }
                        } else {
                            if (uriFilters[i][j].Key === keyLabel &&
                                uriFilters[i][j].Value === key &&
                                uriFilters[i][j + 1].Key === "Value" &&
                                ((shouldCompareValue && uriFilters[i][j + 1].Value === value) || !shouldCompareValue)) // WARNING: not 'value' is decoded value!!! so compare to Value not RawValue!
                            {
                                includeThisUnion = false;
                                break;
                            } else {
                                newUnionEntry.push(uriFilters[i][j]);
                                newUnionEntry.push(uriFilters[i][j + 1]);
                            }
                        }
                    } else {
                        includeThisUnion = false;
                    }
                    if (includeThisUnion === true) {
                        newUriFilters.push(newUnionEntry);
                    }
                }
            })();
        }
        return newUriFilters;
    };

    $.cv.css.metaData.addUriFilter = function (uriFilters, key, value, keyCondition, condition) {
        var keyLabel = (keyCondition === "FeaturesByGroup" ? "ProductFeatureNames.Group" : "ProductFeatureNames.Name"),
            newUnionPart = [],
            uriCondition = $.cv.util.hasValue(condition) ? condition : "eq",
            localUriFilters = [];
        // need to create a local variable here as it was updating the reference to the wrong widget
        $.each(uriFilters, function(idx, item) {
            localUriFilters.push(item);
        });
        newUnionPart.push({ Key: keyLabel, Condition: "eq", RawValue: $.cv.util.encodeFilterFeatureValue(key), Value: key });
        newUnionPart.push({ Key: "Value", Condition: uriCondition, RawValue: $.cv.util.encodeFilterFeatureValue(value), Value: value });
        localUriFilters.push(newUnionPart);
        return localUriFilters;
    };

    $.cv.css.metaData.applyFilters = function (widget, filters) {
        var uriFilters = [];
        $.each(filters, function (idx, item) {
            if (item.range !== undefined) {
                uriFilters = $.cv.css.metaData.addUriFilter(uriFilters, item.get("featureKey"), item.range[0].toString(), item.get("featureKeyMode"), "ge");
                uriFilters = $.cv.css.metaData.addUriFilter(uriFilters, item.get("featureKey"), item.range[1].toString(), item.get("featureKeyMode"), "le");
            } else {
                uriFilters = $.cv.css.metaData.addUriFilter(uriFilters, item.get("featureKey"), item.get("featureName"), item.get("featureKeyMode"));
            }
        });
        // Generate New Uri
        $.cv.css.metaData.generateNewUri(widget, uriFilters);
    };

    $.cv.css.metaData.generateNewUri = function (widget, uriFilters) {
        var uriParts = [],
            uniqueFilters = [],
            filter = "";

        // build a list of unique filters
        for (var i = 0; i < uriFilters.length; i++) {
            filter = uriFilters[i][0].Key + ':' + uriFilters[i][0].Condition + ':' + uriFilters[i][0].RawValue;
            if (_.indexOf(uniqueFilters, filter) == -1) {
                uniqueFilters.push(filter);
            }
        }

        // build filter combination
        for (var i = 0; i < uniqueFilters.length; i++) {
            (function () {
                var filterCombinations = [];
                for (var j = 0; j < uriFilters.length; j++) {
                    filter = uriFilters[j][0].Key + ':' + uriFilters[j][0].Condition + ':' + uriFilters[j][0].RawValue;
                    if (uniqueFilters[i] == filter) {
                        (function () {
                            var filterItems = [];

                            for (var k = 0; k < uriFilters[j].length; k++) { // < Filter Entries for said union
                                filterItems.push(uriFilters[j][k].Key + ':' +
                                uriFilters[j][k].Condition + ':' +
                                uriFilters[j][k].RawValue);
                            }

                            filterCombinations.push(filterItems.join(','));
                        })();
                    }
                }
                var joinChar = _.find(filterCombinations, function (item) { return item.indexOf("Value:ge") !== -1 || item.indexOf("Value:le") !== -1; }) === undefined ? "|" : "%C3%B1";
                uriParts.push(filterCombinations.join(joinChar));
            })();
        }
        var newUri = uriParts.join('%C3%B1');

        var filterToSet = { FilterFeature: newUri, PageProduct: "1" };
        if (widget.options.redirectOnFilter) {
            if ($.cv.util.hasValue(widget.options.redirectOnPriceFilter) && widget.options.redirectOnPriceFilter) {
                $.cv.css.trigger($.cv.css.eventnames.priceFilterRedirect, {filterToSet: filterToSet, clearAll: widget.viewModel.isClearingAll});
            } else {
                $.cv.util.redirect(null, filterToSet, false);
            }
        } else {
            widget.viewModel.set("currentFilters", uriFilters);
            widget.viewModel.set("currentFilterValue", filterToSet.FilterFeature);
            $.cv.css.trigger($.cv.css.eventnames.metadataSummaryFilterChanged, { filterArray: uriFilters, filterString: decodeURIComponent(filterToSet.FilterFeature), widgetName: widget.name });
        }

        return newUri;
    };

    $.cv.css.metaData.getSelectedFilters = function (vm) {
        var itemList = vm.get("itemList"),
            filters = [],
            selectedFilters = [];
        $.each(itemList, function (idx, item) {
            selectedFilters = this.selectedFilters();
            $.each(selectedFilters, function () {
                filters.push(this);
            });
        });
        return filters;
    };

    $.cv.css.metaData.generateEncodedString = function (array) {
        var newFilterArrayEncoded = [];
        $.each(array, function (idx1, item1) {
            var filterEncoded = [];
            $.each(this.split(":"), function (idx2, item2) {
                filterEncoded.push(encodeURIComponent(item2));
            });
            newFilterArrayEncoded.push(filterEncoded.join(":"));
        });
        return newFilterArrayEncoded.join("%C3%B1");
    };

})(jQuery);