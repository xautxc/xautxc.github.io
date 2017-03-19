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
    
    $('#stuTable').hide();
    $('#teachTable').hide();
    $('#worksTable').hide();
    
    $('#userTableStudent').hide();
    $('#userTableTeacher').hide();
    $('#worksTable').hide();
    
    //审查信息按钮点击事件
    $('#pendingInfo').click(pending);
    
    //退出系统按钮点击事件
    $('#signOut').click(function(){
        wilddog.auth().signOut().then(function () {
            location.href = 'login.html';
        });
    });
    
    //导出用户按钮点击事件
    $('#userExport').click(printUser);
    
    //导出项目按钮点击事件
    $('#workExport').click(printWork);
    
    
    
    
    
    //信息审核    
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
    
    
    //打印用户信息
    function printUser(){
        var userRef = wilddog.sync().ref("/user");
        
        $('#userTableStudent').html("<thead><th class='col-md-2'>姓名</th><th class='col-md-2'>学号</th><th class='col-md-2'>班级</th><th class='col-md-2'>手机</th><th class='col-md-2'>邮箱</th></thead>");
        $('#userTableTeacher').html("<thead><th class='col-md-2'>姓名</th><th class='col-md-2'>工号</th><th class='col-md-2'>院系</th><th class='col-md-2'>手机</th><th class='col-md-2'>邮箱</th></thead>");
        
        $('.btn').attr('disabled','disabled');
        
        $('#stuTable').show();
        $('#teachTable').show();
        $('#worksTable').hide();
        $('#userTableStudent').show();
        $('#userTableTeacher').show();
        $('#worksTable').hide();
        
        alert('我郑重的告诉你，这个过程很慢。');
        userRef.once('value',function(snapshot){
            var users = snapshot.val(),
                user = {},
                htmlStu = '',
                htmlTeach = '';
            for(var item in users){
                user = users[item];
                if(user.identity == 'student'){
                    if(user.stuEmail == 'admin@xautxc.com'){
                        continue;
                    }
                    htmlStu += "<tr><td>"+user.stuName+"</td><td>"+user.stuNum+"</td><td>"+user.stuClass+"</td><td>"+user.stuPhone+"</td><td>"+user.stuEmail+"</td></tr>";
                }else{
                    htmlTeach += "<tr><td>"+user.teachName+"</td><td>"+user.teachNum+"</td><td>"+user.teachClass+"</td><td>"+user.teachPhone+"</td><td>"+user.teachEmail+"</td></tr>";
                }
            }
            $('#userTableStudent').append(htmlStu);
            $('#userTableTeacher').append(htmlTeach);
            $('.btn').removeAttr("disabled");
        });
    }
    
    //打印项目信息
    function printWork() {
        var workRef = wilddog.sync().ref("/works");
        
        $('#workTable').html("<thead><th>项目名</th><th>创建者</th><th>创建日期</th><th>项目成员</th></thead>");
        $('.btn').attr('disabled','disabled');
        
        $('#stuTable').hide();
        $('#teachTable').hide();
        $('#worksTable').show();
        $('#userTableStudent').hide();
        $('#userTableTeacher').hide();
        $('#worksTable').show();
        
        alert('我郑重的告诉你，这个过程很慢。');
        workRef.once('value',function(snapshot){
            var works = snapshot.val(),
                work = {},
                members = {},
                member = {},
                html = "",
                memberHtml = "";
            for(var item in works){
                memberHtml = "";
                work = works[item];
                members = work.members;
                for(item in members){
                    member = members[item];
                    memberHtml += member.name + '&nbsp;&nbsp;&nbsp;';
                }
                html += "<tr><td>"+work.name+"</td><td>"+work.author+"</td><td>"+work.date+"</td><td>"+memberHtml+"</td></tr>";
            }
            $('#workTable').append(html);
            $('.btn').removeAttr("disabled");
        });
    }
});
