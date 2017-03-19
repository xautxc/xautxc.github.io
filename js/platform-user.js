$(function(){
    
    //获取登录用户
    wilddog.auth().onAuthStateChanged(function(user) {
        if (user) {
            var userID = user.uid;
            var ref = wilddog.sync().ref("/user"),
                workRef = wilddog.sync().ref("/works");
            //显示用户信息
            ref.once('value',function(snapshot){
                var userInfo = snapshot.val()[userID];
                showUserInfo(userInfo);
                editUserModal(userInfo);
            });
            //显示作品信息
            showUserWork(workRef,userID);
            
            showUserJoinin(userID);
            
            //验证邮箱密码
            //修改密码用
            // wilddog.auth().currentUser
            // .reauthenticate(wilddog.auth.EmailAuthProvider.credential('caozhihao@quyiyuan.com', '321321'))
            // .then(function (user) {
            //     console.info("link email.", user);
            // })
            // .catch(function (err) {
            //     console.info(err.code);
            // });
        }
    });
    
    /**
     * 查看项目详细信息
     */
    $(".user-works").on('click','.work-detail',function(){
        var workID = $(this).parent().parent().attr('name');
        //项目的ID用localStorage保存
        localStorage.workID = workID;
        location.href = 'work.html';
    });
    
    
    /*
        控制挂件逻辑
     */
    $('#work-submit-btn').click(function(){
        //获取发表项目的表单数据
        var workInfo = getWorkInfo();
        //获取当前的用户
        var user = wilddog.auth().currentUser,
            userID = user.uid;
        wilddog.sync().ref("/user/" + userID).once('value',function(snapshot){
            var userObj = snapshot.val();
            //数据增强
            //添加work-date
            var nowDate = new Date();
            workInfo.date = nowDate.getFullYear() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getDate();
            //添加work-origin
            workInfo.origin = userID;
            //添加work-author
            workInfo.author = user.displayName;
            //添加获赞数
            workInfo.praise = 0;
            //项目成员
            if(userObj.identity == 'student'){
                workInfo.members = {
                    author : {
                        email : user.email,
                        job : '组长',
                        name : user.displayName,
                        clazz : userObj.stuClass,
                        uid : user.uid,
                        state : 2
                    }
                };
            }else{
                workInfo.members = {
                    author : {
                        email : user.email,
                        job : '指导教师',
                        name : user.displayName,
                        clazz : userObj.teachClass,
                        uid : user.uid,
                        state : 2
                    }
                };
            }
            
            
            //野狗远端追加子节点
            var workRef = wilddog.sync().ref("/works");
            workRef.push(workInfo,function(){
                alert('发表成功');
                location.reload();
            });
            
            //更新页面的项目信息
            var html = $(".user-works").html();
            html += buildWorksNode(workInfo);
            $(".user-works").html(html);
            
            //隐藏模态框
            $('#workModal').modal('hide');
        });
    });    
    
    
    //更新页面的作品信息
    function showUserWork(workRef,userID){
        //生成我的项目部件
        var userWorksHtml = "<h4 class='title'>我的项目</h4>";
        // 根据work-origin查询
        workRef.orderByChild('origin')
            .startAt(userID)
            .endAt(userID)
            .once('value',function(snapshot){
                var userWorks = snapshot.val();
                for(var item in userWorks){
                    userWorksHtml += buildWorksNode(userWorks[item],item);
                }
                
                userWorksHtml += $(".user-works").html();
                $(".user-works").html(userWorksHtml);
            }); 
    }
    
    //显示用户参与的项目
    function showUserJoinin(userID){
        var joininRef = wilddog.sync().ref("/user/" + userID + "/joinin"),
            workRef = wilddog.sync().ref("/works");
        joininRef.once('value',function(snapshot){
            if(snapshot.val() === null){
                return;
            }
            var joinWorks = snapshot.val(),
                worksID = Object.keys(joinWorks);
            for(var workid of worksID){
                workRef.child(joinWorks[workid]).once('value',function(snapshot){
                    if(snapshot.val() !== null){
                        var userWorksHtml = $(".user-works").html();
                        var html = buildWorksNode(snapshot.val(),snapshot.key());
                        
                        userWorksHtml += html;
                        $(".user-works").html(userWorksHtml);
                    }else{
                        //如果未查到该项目信息，删除joinin信息
                        joininRef.child(workid).remove();
                    }
                });
            }
        });
    }
    
    //生成项目信息节点的HTML
    function buildWorksNode(obj,workKey){
        var html = "<ul class='works' name='"+ workKey +"'><li><span>项目名称： </span><span class='work-name'>"+ obj.name +"</span></li><li><span>发布时间： </span><span class='work-date'>"+ obj.date +"</span></li><li><span>项目简介： </span><span class='work-summary'>"+ obj.summary +"</span></li><li><i class='iconfont'>&#xe606; </i><span class='work-praise'>"+ obj.praise +"</span><span class='work-detail'>详细信息</span></li></ul>";
        return html;
    }    
        
    //获取发表项目表单中的信息
    //返回包含信息的对象
    function getWorkInfo(){
        var prop = ["name","summary","progress","innovation","expect","problem"];
        var info = {},
            selector;
        for(var item of prop){
            selector = '#work-' + item;
            info[item] = $(selector).val();
        }
        return info;
    }        
        
    //更新页面的用户信息
    function showUserInfo(userInfo){
        var selector;
        var props = [];
        //展示界面
        if(userInfo.identity == 'student'){
            $('#stuInfo').show();
            $('#teachInfo').remove();
            props = ["stuName","stuNum","stuEmail","identity","stuClass","stuSkill","stuIntroduction",'stuColleage','stuMajor'];
        }else{
            $('#stuInfo').remove();
            $('#teachInfo').show();
            props = ["teachName","teachNum","teachEmail","identity","teachClass","teachSkill","teachIntroduction",'teachIndex'];
        }
        for(var prop of props){
            $('#'+prop).text(userInfo[prop]);
        }
    }
    
    
    //根据用户身份调整修改信息的模态框
    function editUserModal(userInfo) {
        if(userInfo.identity == 'teacher'){
            $('#user-edit-stu').remove();
            $('#teachIntroductionModal').text(userInfo.teachIntroduction);
            $('#teachSkillModal').text(userInfo.teachSkill);
        }else{
            $('#user-edit-teach').remove();
            $('#stuIntroductionModal').text(userInfo.stuIntroduction);
            $('#stuSkillModal').text(userInfo.stuSkill);
        }
    }
    
    //修改信息提交按钮点击事件
    $('#user-submit-btn').click(function(){
        //获取当前的用户
        var user = wilddog.auth().currentUser,
            userID = user.uid;
        wilddog.sync().ref("/user/" + userID).once('value',function(snapshot){
            var userObj = snapshot.val();
            var ref = wilddog.sync().ref("/user/" + userID);
            var userModalInfo = {};
            if($('#user-edit-stu').length > 0){
                userModalInfo.stuSkill = $('#stuSkillModal').val();  
                userModalInfo.stuIntroduction = $('#stuIntroductionModal').val();           
            }else{
                userModalInfo.teachSkill = $('#teachSkillModal').val();  
                userModalInfo.teachIntroduction = $('#teachIntroductionModal').val();
            }
            ref.update(userModalInfo);
            //隐藏模态框
            $('#userModal').modal('hide');
            location.reload();
        });
    });
    
    $('#pw-submit-btn').click(function(){
        //获取输入内容
        var curPw = $('#curPw').val(),
            newPw1 = $('#newPw1').val(),
            newPw2 = $('#newPw2').val();
        
        if(newPw1 !== newPw2){
            alert('新密码前后输入不一致');
            return;
        }
        
        //获取当前的用户
        var user = wilddog.auth().currentUser,
            userID = user.uid;
        if(user){
            var email = user.email;
            user.reauthenticate(wilddog.auth.EmailAuthProvider.credential(email, curPw))
            .then(function (user) {
                user.updatePassword(newPw1).then(function() {
                    alert('修改密码成功,请重新登录!');
                    wilddog.auth().signOut().then(function () {
                        location.href = 'login.html';
                    });
                })
                .catch(function(){
                    alert('修改密码失败!');
                });
            })
            .catch(function (err) {
                console.info(err.code);
                alert('当前密码错误，请重新输入。');
            });
        }
    });
});
