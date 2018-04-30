// mail management form
;
(function ($, undefined) {
    $.cv = $.cv || {};
    $.cv.mailManagmentCustom = $.cv.mailManagmentCustom || {};
    $.cv.mailManagmentCustom.checkURLS = function () {
        //Checks all anchor tags for fancybox properties and ammends URL for iframe if required
        var pageProtocol = document.location.protocol.toLowerCase().replace(':', '');
        var popupElements = $('a.iframe.popupWindow');
        
        popupElements.each(function() {
            $(this).addClass('fancybox-iframe');
            var url = $(this).attr('href');
            var urlProtocol = url.toLowerCase().substr(0, url.indexOf(':'));
            
            if (pageProtocol == 'https' && pageProtocol != urlProtocol) {
                url = url.replace(urlProtocol, pageProtocol);
                $(this).attr('href', url);            
            }
            return false;
        }); 
    }
})(jQuery);
$(document).ready(function () {   
        
    //check to make sure there are no https to http iframe popups    
    $.cv.mailManagmentCustom.checkURLS();
    
    //add the fancybox-iframe class to set fancybox content type    
    $('.iframe.popupWindow').addClass('fancybox-iframe');

    $('.iframe.popupWindow').click(function(e) {
        e.preventDefault();
        //var href = $(this).attr("href");
        $.fancybox.open({
            href: href,
            topRatio: '0.25',
            type: 'iframe',
            iframe : {
                scrolling : 'no'
            }
          });
    })
    
           
});
