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
            //限制管理员访问权限
            if(user.uid == '50118fa1bef63e14a3dda2ce6462'){
                location.href = "admin.html";
            }
            
            //判断该用户信息是否通过审核  
            var userRef = wilddog.sync().ref("/user/" + user.uid);
            userRef.once('value',function(snapshot){
                var userObj = snapshot.val();
                //等待审核的用户
                if(userObj.state !== '2'){
                    //无法访问个人中心页面
                    $("a[href='user.html']").click(function(e){
                        e.preventDefault();
                        alert('你的资料尚未通过审核，部分功能受限');
                    });
                    //隐藏用户控制操作按钮(user.html & work.html)
                    $(".user-control").remove();
                    //禁止评论
                    $("#comment-add").remove();
                }
            });
            
            
            //标题栏用户名显示 
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
