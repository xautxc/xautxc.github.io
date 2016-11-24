(function($){
    //创建 Wilddog Auth 实例
    var config = {
        authDomain: "xautxc.wilddog.com",
        syncURL: "https://xautxc.wilddogio.com"
    };
    wilddog.initializeApp(config);
    
    //登录检测         
    wilddog.auth().onAuthStateChanged(function(user) {
        if (user && user.emailVerified) {
            location.href = "index.html";
        }
    });
    
    //保存当前状态
    var state = 'signin';
    
    //阻止按键的默认方法
    $('.form-group button').click(function(e){
        e.preventDefault();
    });
    
    /*
        点击切换登录/注册
    */
    var btnIn = $(".login-sign").eq(0),
        btnUp = $(".login-sign").eq(1);
    //点击登录
    btnIn.click(function(){
        if(!btnIn.hasClass('active')){
            btnIn.addClass('active');
            btnUp.removeClass('active');
            $('.signin-form').css('display','block');
            $('.signup-form').css('display','none');                    
            state = 'signin';
        }
    });
    //点击注册
    btnUp.click(function(){
        if(!btnUp.hasClass('active')){
            btnUp.addClass('active');
            btnIn.removeClass('active');
            $('.signup-form').css('display','block');
            $('.signin-form').css('display','none');    
            state = 'signup';
        }
    });

    /*
        按钮点击事件处理    
    */
    var email,
        pw,
        tip = $('.tips');
        
    //记住账号则补全    
    if(state == 'signin'){
        email = $('#inputEmail1');
        if($.cookie('rmbUser')){
            email.val($.cookie('userEmail'));
            $('.checkbox input').prop('checked',true);
        }   
    }    
       
    //登录按钮点击事件
    $('.signin-form button').click(function(){
        email = $('#inputEmail1');
        pw = $('#inputPassword1');
        
        //登录信息格式检测   
        if(!emailTest(email.val())){
            tip.text('邮箱格式错误').show();
        }else if(pw.val().length === 0){
            tip.text('密码不能为空').show();
        }else{
            tip.hide();
            //检测是否记住账号
            var checkbox = $('.checkbox input');
            if(checkbox.is(':checked')){
                $.cookie('rmbUser',true,{expires:7});
                $.cookie('userEmail',email.val(),{expires:7});
            }else{
                $.cookie('rmbUser',false,{expires:7});
                $.cookie('userEmail','',{expires:7});
            }
            
            //登录中，登录按钮禁用
            $('.signin-form button').text('登录中').attr("disabled","disabled");
            
            //调用野狗API登录
            var userEmail = email.val(),
                pwd = pw.val();
            //邮箱登录
            wilddog.auth().signInWithEmailAndPassword(userEmail, pwd)
                .then(function(res){
                //登录成功
                var user = wilddog.auth().currentUser;
                //管理员账号
                if(user.uid == '50118fa1bef63e14a3dda2ce6462'){
                    location.href = "admin.html";
                }
                
                //用户是否验证邮箱
                if(user.emailVerified){
                    var userRef = wilddog.sync().ref("/user");
                    var userkey = user.uid;
                    
                    //判断是否建立用户信息
                    userRef.once('value',function(snapshot){
                        //用户信息对象
                        var userObj = snapshot.val();
                        //判断是否录入当前用户的信息
                        if(userObj && userObj[userkey] !== undefined){
                            //信息已存在
                            var currentUser = userObj[userkey];
                            //根据用户状态判断
                            switch (currentUser.state) {
                                case '1':
                                    //审核中
                                    console.log('审核中');
                                    //审核中，跳转至首页，操作受限
                                    location.href = "index.html";
                                    break;
                                case '2':
                                    //审核通过
                                    console.log('审核通过');
                                    location.href = "index.html";
                                    break;
                                case '4':
                                    //审核未通过
                                    console.log('审核未通过');
                                    alert('您的信息审核未通过，请重新填写并提交。');
                                    //跳转至信息录入界面
                                    location.href = "newuser.html";
                                    break;
                            }
                        }else{
                            //未录入信息
                            console.log('未录入信息');
                            alert('初次登陆请认真填写相关信息，信息将进行真实性审核。');
                            //跳转至信息录入界面
                            location.href = "newuser.html";
                        }
                    });
                }else{
                    //邮箱验证未通过
                    alert('请前往邮箱验证后再登录。');
                    wilddog.auth().signOut();
                    
                    //登录结束，登录按钮恢复
                    $('.signin-form button').text('登录').removeAttr("disabled");
                }                
            }).catch(function (error) {
                // 错误处理
                console.log(error);
                tip.text('账号或密码错误').show();
                //登录结束，登录按钮恢复
                $('.signin-form button').text('登录').removeAttr("disabled");
            });
        }
    });
    
    //注册按钮点击事件
    $('.signup-form button').click(function(){
        //注册中，按钮禁用
        $('.signup-form button').text('注册中').attr("disabled","disabled");
        
        email = $('#inputEmail2');
        pw = $('#inputPassword2');
        //注册信息格式检测
        var pw2 = $('#inputPassword3');
        if(!emailTest(email.val())){
            tip.text('邮箱格式错误').show();
        }else if(pw.val().length === 0){
            tip.text('密码不能为空').show();
        }else if(!pwTest(pw.val())){
            tip.text('密码格式不正确或包含非法字符').show();
        }else if(pw.val() !== pw2.val()){
            tip.text('两次输入的密码不一致').show();
        }else{
            tip.hide();
            var userEmail = email.val(),
                pwd = pw.val();
            //调用野狗API注册账号
            wilddog.auth().createUserWithEmailAndPassword(userEmail,pwd)
            	.then(function (user) {
                // 注册成功
                // 邮箱验证
                user.sendEmailVerification();
                alert('注册成功，请前往邮箱验证之后登录！');
                //注册结束，恢复按钮
                $('.signup-form button').text('注册').removeAttr("disabled");   
        	}).catch(function (err) {
            //注册失败
                console.info("create user failed.", err);
                tip.text('该邮箱已被注册使用').show();
                //注册结束，恢复按钮
                $('.signup-form button').text('注册').removeAttr("disabled");
            });    
        }
    });
        
    //邮箱格式检测函数
    function emailTest(email){
        if(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(email)){
            return true;
        }else{
            return false;
        }
    }
    //密码格式检测
    function pwTest(pw){
        if(/^[_0-9a-zA-Z]\w{5,17}$/.test(pw)){
            return true;
        }else{
            return false;
        }
    }
})(jQuery);
