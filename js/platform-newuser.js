$(function(){
    //教师入口点击
    $('#teach-enter').click(function(){
        $('.wrap-flex').hide();
        $('.teach-info').show();
    });
    //学生入口点击
    $('#stu-enter').click(function(){
        $('.wrap-flex').hide();
        $('.stu-info').show();
    });
    

    
    //获取登录用户
    wilddog.auth().onAuthStateChanged(function(user) {
        if (user) {
            //教师信息提交按钮
            $('#teach-btn').click(function(){
                var info = getInfo(['teachName','teachNum','teachClass','teachPhone','teachIndex','teachSkill','teachIntroduction']);
                //更新user属性
                wilddog.auth().currentUser.updateProfile({
                    displayName : info.teachName
                });
                
                info.uid = user.uid;
                info.identity = 'teacher';
                info.teachEmail = user.email;
                info.state = '1';
                //将信息存入待审核区
                var ref = wilddog.sync().ref("/user");
                ref.child(user.uid).set(info, function(error) {
                    if (error === null){
                        // 数据同步到野狗云端成功完成
                        alert('信息已成功提交，请耐心等待审核通过。在审核通过前，仅能浏览平台，其他的操作受限。');
                        location.href = "index.html";
                    }else{
                        alert('信息提交失败，请稍后再次提交。');
                    }
                });
                
            });
            
            //学生信息提交按钮
            $('#stu-btn').click(function(){
                var info = getInfo(['stuName','stuNum','stuColleage','stuMajor','stuClass','stuPhone','stuSkill','stuIntroduction']);
                //更新user属性
                wilddog.auth().currentUser.updateProfile({
                    displayName : info.stuName
                });
                
                info.uid = user.uid;
                info.identity = 'student';
                info.stuEmail = user.email;
                //pending状态标志
                // 1 : 审核中
                // 2 : 审核通过
                // 4 : 审核未通过
                info.state = '1';
                //将信息存入待审核区
                var ref = wilddog.sync().ref("/user");
                ref.child(user.uid).set(info, function(error) {
                    if (error === null){
                        // 数据同步到野狗云端成功完成
                        alert('信息已成功提交，请耐心等待审核通过。在审核通过前，仅能浏览平台，其他的操作受限。');
                        location.href = "index.html";
                    }else{
                        alert('信息提交失败，请稍后再次提交。');
                    }
                });
            });
        }
    });
    

    /**
     * [getInfo 获取表单信息]
     * @param  {[Array]} idArr [输入框的id数组]
     * @return {[Object]} [表单信息的对象]
     */
    function getInfo(idArr){
        var infoObj = {};
        for(var item of idArr){
            infoObj[item] = $('#' + item).val();
        }
        return infoObj;
    }
});
