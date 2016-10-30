$(function(){
    //根据localStorage中的workID渲染页面
    wilddog.auth().onAuthStateChanged(function(user) {
        if (user) {
            workInit(user); 
        } 
    });
    

    
    //页面显示初始化
    function workInit(user){
        var ref = '/works/',
            workID = localStorage.workID,
            workRef = wilddog.sync().ref(ref + workID),
            memberRef = workRef.child('members');
        workRef.once('value', function(snapshot) {
            work = snapshot.val();
            //项目表单初始化
            workFormInit(work);
            //项目参与者表单初始化
            memberInit(memberRef);
            //挂件初始化
            controlWidgetInit(work,user,workRef);
            //评论框初始化
            commentInit(work,user,workRef);
            //摸态框初始化
            modalInit(work,workRef);
        });    
    }
    
    //项目表单初始化
    function workFormInit(work){
        $('#work-name').html(work.name);
        $('#work-author').html(work.author);
        $('#work-summary').html(work.summary);
        $('#work-innovation').html(work.innovation);
        $('#work-progress').html(work.progress);
        $('#work-expect').html(work.expect);
        $('#work-problem').html(work.problem);
        $('#work-praise').html(work.praise);
    }
    
    //控制挂件初始化
    function controlWidgetInit(work,user,workRef){
        var userEmail = user.email,
            userID = userEmail.split('.')[0];
        //如果当前用户是该项目的作者
        if(userID == work.origin){
            //显示控制挂件
            $('.host').show();
            //禁用点赞按钮
            $('.addPrasie').attr('disabled','disabled');
            //隐藏加入项目按钮
            $('.visitor').hide();
        }else {
            //当前用户非该项目原作者  
            var followersRef = workRef.child('followers');    
            // 根据email查询当前用户是否为该用户点赞
            followersRef.orderByChild('user')
                .startAt(userEmail)
                .endAt(userEmail)
                .once('value',function(snapshot){
                    var follower = snapshot.val();
                    //如果查询到已点赞
                    if(follower !== null){
                        //禁用点赞按钮
                        $('.addPrasie').attr('disabled','disabled');
                    }
                });
        }
        
        // 初始化加入项目按钮
        workRef.child('members').orderByChild('email')
            .startAt(user.email)
            .endAt(user.email)
            .once('value',function(snapshot){
                var member = snapshot.val();
                //如果查询到是项目成员
                if(member !== null){
                    $('#join-btn').html('退出项目');
                }else{
                    $('#join-btn').html('加入项目');
                }
            });
        
        //删除项目按钮
        $('#delete-btn').click(function(){
            if(confirm("确定删除该项目吗？")){
                workRef.remove();
                location.href = "user.html";
            }
        });
        
        //点赞按钮
        $('.addPrasie').click(function(){
            var ref = '/works/',
                workID = localStorage.workID,
                workRef = wilddog.sync().ref(ref + workID);
            //计算点赞后的结果
            var praiseNums = parseInt($('#work-praise').html()) + 1;
            //更新后台数据
            workRef.update({praise : praiseNums});
            //后台追加用户邮箱到已点赞列表
            var followersRef = workRef.child('followers'),
                userEmail = wilddog.auth().currentUser.email;
            followersRef.push({user : userEmail});
            //更新页面数据
            $('#work-praise').html(praiseNums);
            //禁用点赞按钮
            $('.addPrasie').attr('disabled','disabled');
        });
        
        //加入/退出 项目按钮
        $('#join-btn').click(function(){
            var memberRef = workRef.child('members'),
                userRef = wilddog.sync().ref('/user/' + userID);
            //数据更新
            userRef.once('value', function(snapshot) {
                userDetail = snapshot.val();
                // 根据email查询当前用户是否为项目成员
                memberRef.orderByChild('email')
                    .startAt(user.email)
                    .endAt(user.email)
                    .once('value',function(snapshot){
                        var member = snapshot.val();
                        //如果查询到是项目成员
                        if(member !== null){
                            for(var item in member){
                                memberRef.child(item).remove();
                            }
                            $('#join-btn').html('加入项目');
                            alert('已退出该项目!');
                        }else{
                            var memberInfo = {
                                email : user.email,
                                job : '组员',
                                name : user.displayName,
                                qq : userDetail.qq
                            };
                            if(userDetail.identity && userDetail.identity == 'teacher'){
                                memberInfo.job = '指导老师';
                            }
                            memberRef.push(memberInfo);
                            $('#join-btn').html('退出项目');
                            alert('已加入该项目,请联系组长了解项目的详细信息。');
                        }
                        //更新UI
                        memberInit(memberRef);
                    });
            }); 
        });
    }
    
    //项目参与者列表
    function memberInit(memberRef){
        memberRef.once('value',function(snapshot){
            var members = snapshot.val();
            $('.member-info').html('<thead><th>姓名</th><th>职位</th><th>邮箱</th><th>QQ</th></thead>');
            for(var item in members){
                var member = members[item];
                var html = '<tr><td>'+ member.name +'</td><td>'+member.job+'</td><td>'+ member.email +'</td><td>'+ member.qq +'</td></tr>';
                $('.member-info').append(html);
            }
        });
        
    }
    
    //评论框初始化
    function commentInit(work,user,workRef){
        //添加评论
        $("#comment-add").click(function(){
            $(".comment-publish").slideDown();
        });
        
        //取消按钮
        $(".comment-btns button").eq(1).click(function(){
            $(".comment-publish").slideUp();
        });
        
        //提交按钮
        $(".comment-btns button").eq(0).click(function(){
            $(".comment-publish").slideUp();
            // 上传评论到服务器
            var commentContent = $('#commentInput').val(),
                commentUser = user.displayName ? user.displayName : user.email,
                mydate = new Date(),
                commentDate = mydate.getFullYear() + '-' +( +mydate.getMonth() + 1 )+ '-' + mydate.getDate();        
            var commentRef =  workRef.child('comments'),
                commentObj = {
                    user : commentUser,
                    date : commentDate,
                    content : commentContent
                };            
            commentRef.push(commentObj);
            //更新页面
            $('.no-comment').remove();
            $('.comment-body').prepend(createCommentDom(commentObj));
        });
        
        //构建评论列表
        buildComment(workRef);
        
        function buildComment(workRef){
            var commentRef =  workRef.child('comments');
            var commentBody = $('.comment-body');
            commentRef.once('value',function(snapshot){
                var comments = snapshot.val();
                if(comments){
                    for(var comment in comments){
                        commentBody.prepend(createCommentDom(comments[comment]));
                    }
                }else{
                    commentBody.prepend('<h6 class="no-comment">暂无评论<h6>');
                }
            });
        }
        
        function createCommentDom(comment){
            var html = "<li><p>"+ comment.content +"</p><div class='comment-user'><span>"+ comment.user +"</span><span>"+ comment.date +"</span></div></li>";
            return html;
        }
    }
    
    //摸态框初始化
    function modalInit(work,workRef){
        //内容初始化
        $('#modal-work-name').val(work.name);
        $('#modal-work-summary').val(work.summary);
        $('#modal-work-progress').val(work.progress);
        $('#modal-work-innovation').val(work.innovation);
        $('#modal-work-expect').val(work.expect);
        $('#modal-work-problem').val(work.problem);
        
        $('#work-submit-btn').click(function(){
            //从摸态框得到修改后的作品信息
            var workObj = {},
                props=['name','summary','progress','innovation','expect','problem'];
            for(var item of props){
                workObj[item] = $('#modal-work-' + item).val();
            }
            //更新远端数据
            workRef.update(workObj);
            //更新页面数据
            workFormInit(workObj);
            //隐藏模态框
            $('#workModal').modal('hide');
        });
    }
    
    function joinInit(){
        
    }
});
