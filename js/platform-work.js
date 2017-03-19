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
            
            
            memberModalInit(memberRef,workRef,work);
        
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
            userID = user.uid;
        //如果当前用户是该项目的作者
        if(userID == work.origin){
            //显示控制挂件
            $('.host').show();
            //禁用点赞按钮
            $('.addPrasie').attr('disabled','disabled');
            //隐藏加入项目按钮
            $('.visitor').remove();
        }else {
            $('.host').remove();
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
                    for(var item in member){
                        var curMember = member[item];
                    }
                    if(curMember.state == 2){
                        $('#join-btn').html('退出项目');
                    }else{
                        $('#join-btn').html('申请中...');
                        $('#join-btn').attr({'disabled':'disabled'});
                    }
                    
                }else{
                    $('#join-btn').html('申请加入');
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
                userRef = wilddog.sync().ref('/user/' + userID),
                workID = localStorage.workID;
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
                            //删除该项目member节点下用户信息
                            for(var item in member){
                                var joininID = member[item].joininID;
                                memberRef.child(item).remove();
                            }
                            //删除该用户joinin节点下的项目信息
                            var joinRef = wilddog.sync().ref('/user/' + userID +'/joinin/' + joininID);
                            joinRef.remove();
                            //修改界面显示
                            $('#join-btn').html('加入项目');
                            alert('已退出该项目!');
                        }else{
                            var memberInfo = {
                                email : user.email,
                                job : '组员',
                                name : user.displayName,
                                uid : user.uid,
                                state : 1
                            };
                            
                            if(userDetail.identity && userDetail.identity == 'teacher'){
                                memberInfo.job = '指导老师';
                                memberInfo.clazz = userDetail.teachClass;
                            }else{
                                memberInfo.clazz = userDetail.stuClass;
                            }
                            
                            //用户路径下的joinin节点添加该项目的key作为value
                            var joinRef = wilddog.sync().ref('/user/' + userID +'/joinin');
                            var backRef = joinRef.push(workID,function(){
                                backRef.once('value',function(snapshot){
                                    var newKey = snapshot.key();
                                    memberInfo.joininID = newKey;
                                    
                                    //项目路径下的member节点更新用户信息
                                    memberRef.push(memberInfo);
                                    
                                    $('#join-btn').html('退出项目');
                                    alert('已加入该项目,请联系组长了解项目的详细信息。');
                                    //更新UI
                                    memberInit(memberRef);
                                });
                            });
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
            $('.member-info').html('<thead><th>姓名</th><th>班级</th><th>邮箱</th><th>职位</th></thead>');
            for(var item in members){
                var member = members[item];
                if(member.state == 1){
                    continue;
                }
                var html = '<tr><td>'+ member.name +'</td><td>'+member.clazz+'</td><td>'+ member.email +'</td><td>'+ member.job +'</td></tr>';
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
            $('#commentInput').val('');
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
    
    //修改项目摸态框初始化
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
    
    //成员摸态框
    function memberModalInit(memberRef,workRef,work){
        //获取成员相关信息
        memberRef.once('value',function(snapshot){
            var members = snapshot.val();
            var joinMemberArr = [],
                applyMemberArr = [];
            var member;
            
            //成员筛选
            for(var item in members){
                member = members[item];
                //申请入组的成员
                if(member.state && member.state == 1){
                    applyMemberArr.push(member);
                }else if(member.state && member.state == 2){
                //已加入的成员
                    joinMemberArr.push(member);
                }
            }
            
            joinMember(joinMemberArr);
            applyMember(applyMemberArr);
            memberModalBtn(joinMemberArr,applyMemberArr,workRef,work);
        });
        
        //加载项目组内成员
        function joinMember(joinMemberArr){
            $('.joinMember').html('<thead><th>姓名</th><th>班级</th><th>邮箱</th><th>职位</th><th>操作</th></thead>');
            for(var i = 0; i < joinMemberArr.length; i++){
                var member = joinMemberArr[i];
                var html = '<tr><td>'+ member.name +'</td><td>'+member.clazz+'</td><td>'+ member.email +'</td><td>'+ member.job +'</td><td><button class="memberTick btn btn-danger btn-xs">踢出</button></td></tr>';
                $('.joinMember').append(html);
            }
        }
        
        //加载申请中成员
        function applyMember(applyMemberArr){
            $('.applyMember').html('<thead><th>姓名</th><th>班级</th><th>邮箱</th><th>职位</th><th>操作</th></thead>');
            for(var i = 0; i < applyMemberArr.length; i++){
                var member = applyMemberArr[i];
                var html = '<tr><td>'+ member.name +'</td><td>'+member.clazz+'</td><td>'+ member.email +'</td><td>'+ member.job +'</td><td><button class="memberAgree btn btn-success btn-xs">接受</button><button class="memberDeny btn btn-danger btn-xs">拒绝</button></td></tr>';
                $('.applyMember').append(html);
                
            }
        }
        
        //按钮事件绑定
        function memberModalBtn(joinMemberArr,applyMemberArr,workRef,work){
            //踢出按钮事件绑定
            $(".joinMember").delegate("button","click",function(e){
                if(!confirm('是否要从项目中移除该成员?')){
                    return;
                }
                var targetEmail = e.target.parentNode.previousSibling.previousSibling.innerText;
                // 根据邮箱查询要踢出的用户
                workRef.child('members').orderByChild('email')
                    .startAt(targetEmail)
                    .endAt(targetEmail)
                    .once('value',function(snapshot){
                        var targetMember = snapshot.val();
                        //单次循环取对象
                        for(var item in targetMember){
                            targetMember = targetMember[item];
                        }
                        //不能踢出项目创建者
                        //joininID
                        if(targetMember.name !== work.author){
                            //根据joininID删除该用户信息下的joinin下的项目节点
                            var joininID = targetMember.joininID;
                            var joinRef = wilddog.sync().ref('/user/' + targetMember.uid +'/joinin/' + joininID);
                            joinRef.remove();
                            console.log(joininID);
                            //删除项目members下的节点
                            workRef.child('members').child(item.toString()).remove();
                            //删除joinMemberArr中该成员
                            for(var i = 0; i < joinMemberArr.length; i++){
                                if(joinMemberArr[i].uid == targetMember.uid){
                                    joinMemberArr.splice(i,1);
                                    break;
                                }
                            }
                            //刷新显示列表
                            joinMember(joinMemberArr);
                        }else{
                            alert('不能踢出项目创建者！');
                        }
                    });  
                
            });
            
            //同意入组按钮点击事件
            $(".applyMember").delegate(".memberAgree","click",function(e){
                if(!confirm('是否同意其加入项目组?')){
                    return;
                }
                var targetEmail = e.target.parentNode.previousSibling.previousSibling.innerText;
                // 根据邮箱查询要同意的用户
                workRef.child('members').orderByChild('email')
                    .startAt(targetEmail)
                    .endAt(targetEmail)
                    .once('value',function(snapshot){
                        var targetMember = snapshot.val();
                        //单次循环取对象
                        for(var item in targetMember){
                            targetMember = targetMember[item];
                        }
                        //更新服务器上的用户数据
                        workRef.child('members').child(item.toString()).update({'state':2});
                        //刷新显示列表
                        //删除applyMemberArr中该成员,转移至joinMem
                        for(var i = 0; i < applyMemberArr.length; i++){
                            if(applyMemberArr[i].uid == targetMember.uid){
                                joinMemberArr.push(applyMemberArr[i]);
                                applyMemberArr.splice(i,1);
                                break;
                            }
                        }
                        //刷新显示列表
                        joinMember(joinMemberArr);
                        applyMember(applyMemberArr);
                    }); 
            });
            
            //拒绝入组按钮点击事件
            $(".applyMember").delegate(".memberDeny","click",function(e){
                if(!confirm('是否拒绝其加入项目组?')){
                    return;
                }
                var targetEmail = e.target.parentNode.previousSibling.previousSibling.innerText;
                // 根据邮箱查询要踢出的用户
                workRef.child('members').orderByChild('email')
                    .startAt(targetEmail)
                    .endAt(targetEmail)
                    .once('value',function(snapshot){
                        var targetMember = snapshot.val();
                        //单次循环取对象
                        for(var item in targetMember){
                            targetMember = targetMember[item];
                        }
                    
                        //根据joininID删除该用户信息下的joinin下的项目节点
                        var joininID = targetMember.joininID;
                        var joinRef = wilddog.sync().ref('/user/' + targetMember.uid +'/joinin/' + joininID);
                        joinRef.remove();
                        //删除项目members下的节点
                        workRef.child('members').child(item.toString()).remove();
                        //删除joinMemberArr中该成员
                        for(var i = 0; i < applyMemberArr.length; i++){
                            if(applyMemberArr[i].uid == targetMember.uid){
                                applyMemberArr.splice(i,1);
                                break;
                            }
                        }
                        //刷新显示列表
                        applyMember(applyMemberArr);
                        
                    });  
            });
            
        }
        
    }
});
