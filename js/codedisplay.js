(function($) {

    //鼠标移上去更换图片
    $(".qq").mouseover(function(){
    	$(this).attr("src","image/contact/qq2.png");
        $(".qqcode").find('img').show();
    });
    $(".wechat").mouseover(function(){
        $(this).attr("src","image/contact/wechat2.png");
        $(".wechatcode").find('img').show();
    });
    //鼠标移走更换图片
    $(".qq").mouseout(function(){
    	$(this).attr("src","image/contact/qq.png");
        $(".qqcode").find('img').hide();
    });
    $(".wechat").mouseout(function(){
        $(this).attr("src","image/contact/wechat.png");
        $(".wechatcode").find('img').hide();
    });

})(jQuery);