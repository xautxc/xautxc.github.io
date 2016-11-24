$(function(){
    //获取已登录账号         
    wilddog.auth().onAuthStateChanged(function(user) {
        if (user) {
            if(user.uid !== '50118fa1bef63e14a3dda2ce6462'){
                //退出登录
                wilddog.auth().signOut().then(function () {
                    console.info("user sign out.");
                    location.href = "login.html";
                });
            }
        } else {
            location.href = "login.html";
        }
    });
    
    //审查信息按钮点击事件
    $('#pendingInfo').click(pending);
    
    //退出系统按钮点击事件
    $('#signOut').click(function(){
        wilddog.auth().signOut().then(function () {
            location.href = 'login.html';
        });
    });
    
        
    function pending(){
        var userRef = wilddog.sync().ref("/user");
        //查找所有state='1'的用户
        userRef.orderByChild('state')
            .startAt('1')
            .endAt('1')
            .once('value', function(snapshot) {
                //所有待审查的用户
                var pendingObj = snapshot.val();
                if(pendingObj === null){
                    $('#stuInfo').hide();
                    //待审核用户数目显示
                    $('#pendingNum').text('('+0+')');
                }else{
                    var pendingUID = Object.keys(pendingObj);   //包含用户UID的Arr
                    //待审核用户数目显示
                    $('#pendingNum').text('('+(pendingUID.length)+')');
                    //当前显示的用户UID
                    var currentUID = pendingUID.pop();
                    //显示待审核用户的信息
                    makeUserInfo(pendingObj[currentUID]);
                }
                
                //审核按钮点击事件
                $('.btn-pending').click(function(){
                    var currentRef = wilddog.sync().ref("/user/"+currentUID);
                    //如果是通过按钮
                    if($(this).hasClass('btn-pass')){
                        currentRef.update({
                            'state' : '2'
                        });
                    }else{//如果是不合格按钮
                        currentRef.update({
                            'state' : '4'
                        });
                    }
                    
                    //待审核用户数目显示
                    $('#pendingNum').text('('+(pendingUID.length)+')');
                    //如果没有待审核用户直接结束
                    if(pendingUID.length === 0){
                        $('#stuInfo').hide();
                        $('#teachInfo').hide();
                        return;
                    }
                    //显示待审核用户的信息
                    currentUID = pendingUID.pop();
                    makeUserInfo(pendingObj[currentUID]);
                });
            });
  
        //补全审查信息
        function makeUserInfo(userObj){
            //学生信息
            if(userObj.identity == 'student'){
                //隐藏teachInfo 显示stu-info
                $('#stuInfo').show();
                $('#teachInfo').hide();
                //信息补全
                for(var stuItem of ['stuName','stuNum','stuColleage','stuMajor','stuClass','stuEmail','stuSkill','stuIntroduction']){
                    $('#'+stuItem).text(userObj[stuItem]);
                }
            }else{//教师信息 
                //隐藏stuInfo 显示teachInfo
                $('#stuInfo').hide();
                $('#teachInfo').show();
                for(var teachItem of ['teachName','teachNum','teachClass','teachPhone','teachIndex','teachSkill','teachIntroduction']){
                    $('#'+teachItem).text(userObj[teachItem]);
                }
            }
        }
    }
});
