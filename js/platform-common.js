(function($){
    //nav-user的下拉列表栏
    var navUser = $('.nav-user'),
        userList = $('.user-list');
    navUser.mouseover(function(){
        navUser.css("color","#e50012");
        userList.show();
    });
    navUser.mouseout(function(){
        navUser.css("color","#555");
        userList.hide();
    });
    
})(jQuery);
