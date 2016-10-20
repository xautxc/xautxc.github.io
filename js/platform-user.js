$(function(){
    /*
        用户信息界面逻辑
     */
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
        //更新用户属性
        wilddog.auth().currentUser.updateProfile({
            displayName : data.displayName
        });
        //更新页面数据
        showUserInfo(data);
        
        $('.user-edit').toggle();
        $('.user-show').toggle();
    });
    
    //获取登录用户
    wilddog.auth().onAuthStateChanged(function(user) {
        if (user) {
            var userID = user.email.split('.')[0];
            var ref = wilddog.sync().ref("/user"),
                workRef = wilddog.sync().ref("/works");
            //显示用户信息
            ref.once('value',function(snapshot){
                var userInfo = snapshot.val()[userID];
                showUserInfo(userInfo);
            });
            //显示作品信息
            showUserWork(workRef,userID);
        }
    });
    
    
    /*
        控制挂件逻辑
     */
    $('#work-submit-btn').click(function(){
        //获取发表项目的表单数据
        var workInfo = getWorkInfo();
        //数据增强
        //获取当前的用户
        var user = wilddog.auth().currentUser,
            userID = user.email.split('.')[0];
        //添加work-date
        var nowDate = new Date();
        workInfo.date = nowDate.getFullYear() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getDate();
        //添加work-origin
        workInfo.origin = userID;
        //添加work-author
        workInfo.author = user.displayName ?　user.displayName : user.email;
        //添加获赞数
        workInfo.praise = 0;
        
        //野狗远端追加子节点
        var workRef = wilddog.sync().ref("/works");
        workRef.push(workInfo);
        
        //更新页面的项目信息
        var html = $(".user-works").html();
        html += buildWorksNode(workInfo);
        $(".user-works").html(html);
        
        
        //隐藏模态框
        $('#workModal').modal('hide');
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
                $(".user-works").html(userWorksHtml);
                
                /**
                 * 查看项目详细信息
                 */
                $(".work-detail").click(function(){
                    var workID = $(this).parent().parent().attr('name');
                    //项目的ID用localStorage保存
                    localStorage.workID = workID;
                    location.href = 'work.html';
                });
            }); 
    }
    
    //生成项目信息节点的HTML
    function buildWorksNode(obj,workKey){
        var html = "<ul class='works' name='"+ workKey +"'><li><span>项目名称： </span><span class='work-name'>"+ obj.name +"</span></li><li><span>发布时间： </span><span class='work-date'>"+ obj.date +"</span></li><li><span>项目简介： </span><p class='work-summary'>"+ obj.summary +"</p></li><li><i class='iconfont'>&#xe606; </i><span class='work-praise'>"+ obj.praise +"</span><span class='work-detail'>详细信息</span></li></ul>";
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
