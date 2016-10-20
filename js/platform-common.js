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

    //标题栏用户名显示       
    wilddog.auth().onAuthStateChanged(function(user) {
        if (user) {
            if(wilddog.auth().currentUser !== null){
                $(".nav-userName").html(wilddog.auth().currentUser.displayName);
            }else{
                $(".nav-userName").html(wilddog.auth().currentUser.email);
            }
        } else {
            //未登录 则跳转至登录页面
            location.href = 'login.html';
        }
    });
    
    
    //用户点击退出登录
    $('.user-quit').click(function(){
        wilddog.auth().signOut().then(function () {
            location.href = 'login.html';
        });
    });
 
})(jQuery);
