;
(function ($, undefined) {
    $.cv = $.cv || {};
    $.cv.css = $.cv.css || {};
    $.cv.css.orderLinesWidget = $.cv.css.orderLinesWidget || {};
    $.cv.css.orderLinesWidget.orderLinesRendered = function () {
        var id = $(this.element[0]).attr("id");
        $("#" + id).find("select.form-select").kendoDropDownList();

        $("#" + id).find(".form-number").each(function () {
            $.cv.util.kendoNumericTextBox(this);
        });
        $("#" + id).find(".add-note-button").click(function () {
            $(this).parent().next(".line-notes-area").slideToggle();
        });
    }
})(jQuery);