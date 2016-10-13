$(function(){
    $('.user-show button').click(function(){
        $('.user-show').toggle();
        $('.user-edit').toggle();
    });
    
    $('.user-edit button').click(function(e){
        e.preventDefault();
        
        //点击保存编辑修改远端数据
        var user = wilddog.auth().currentUser,
            ref = wilddog.sync().ref("/user"),
            id = user.email.split('.')[0],
            node = ref.child(id);
        //获取表单的数据
        var ids = ['displayName','direction','college','major','qq','introduction'],
            data = getUserInfo(ids);
        //更新远程数据    
        node.update(data);  

        //更新页面数据
        showUserInfo(data);
        
        $('.user-edit').toggle();
        $('.user-show').toggle();
    });
    
    //创建 Wilddog Auth 实例
    var config = {
        authDomain: "xautxc.wilddog.com",
        syncURL: "https://xautxc.wilddogio.com"
    };
    wilddog.initializeApp(config);
    
    //获取登录用户
    wilddog.auth().onAuthStateChanged(function(user) {
        if (user) {
            // document.querySelector('.hello').innerHTML = 'hello ' + user.email;
            // console.log(user);
            var id = user.email.split('.')[0];
            //读取存储内容
            var ref = wilddog.sync().ref("/user");
            ref.once('value',function(snapshot){
                var userInfo = snapshot.val()[id];
                console.log(userInfo);
                showUserInfo(userInfo);
            });
        } else {
            console.log("no user");
            location.href = 'login.html';
        }
    });
    
    //更新页面的用户信息
    function showUserInfo(userInfo){
        var selector;
        //展示界面
        var prop = ["displayName","identity","direction","qq"];
        for(var item of prop){
            selector = '.' + item + ' span';
            $(selector).eq(1).html(userInfo[item]);
        }
        //院系信息
        $(".college span").eq(1).html(userInfo['college'] + ' / ' + userInfo['major']);
        //简介
        $('.introduction p').eq(0).html(userInfo['introduction']);
        
        //编辑页面
        prop = ["displayName","direction","qq","college","major","introduction"];
        for(var item of prop){
            selector = '#' + item;
            $(selector).val(userInfo[item]);
        }
        //职位信息
        if(userInfo['identity'] == 'student'){
            $('#optionsRadios1').prop("checked", function( i, val ) {
                return !val;
            });
        }else{
            $('#optionsRadios2').prop("checked", function( i, val ) {
                return !val;
            });
        }
    }
    
    //获取表单数据
    //输入为节点ID数组
    //返回为数据对象
    function getUserInfo(ids){
        var selector,
            data = {};
        for(var item of ids){
            selector = '#' + item;
            data[item] = $(selector).val();
        }
        //radio数据读取
        if($('#optionsRadios1').prop('checked')){
            data['identity'] = 'student';
        }else{
            data['identity'] = 'teacher';
        }
        return data;
    }
});
