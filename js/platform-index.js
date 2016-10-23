$(function(){
    //优秀项目数据获取
    var ref = wilddog.sync().ref("/works");
    ref.orderByChild("praise").limitToLast(3).on("child_added", function(snapshot) {
      var html = buildWorksNode(snapshot.val(),snapshot.key());
      $('.work-title').after(html);
      /*查看项目详细信息*/
      $(".work-detail").click(function(){
          var workID = $(this).parent().parent().attr('name');
          //项目的ID用localStorage保存
          localStorage.workID = workID;
          location.href = 'work.html';
      });
    });
    
    //名人堂获取并生成
    var bestRef = wilddog.sync().ref("/best"),
        userRef = wilddog.sync().ref("/user"),
        studentRef = bestRef.child('student'),
        teacherRef = bestRef.child('teacher');
    
    //最佳学生
    //查找最佳学生的ID
    studentRef.once('value',function(snapshot){
        var studentID = snapshot.val();
        //通过ID查找对应的用户
        userRef.once('value',function(snapshot){
            var bestStudent = snapshot.val()[studentID];
            $('.name-student').html(bestStudent.displayName?bestStudent.displayName:bestStudent.email);
            $('.introduction-student').html(bestStudent.introduction);
        });
        //查找对应的项目
        findNum(studentID,'student');
    });
    
    //教师之星
    //查找教师之星的ID
    teacherRef.once('value',function(snapshot){
        var teacherID = snapshot.val();
        //通过ID查找对应的用户
        userRef.once('value',function(snapshot){
            var bestTeacher = snapshot.val()[teacherID];
            $('.name-teacher').html(bestTeacher.displayName?bestTeacher.displayName:bestTeacher.email);
            $('.introduction-teacher').html(bestTeacher.introduction);
        });
        //查找对应的项目
        findNum(teacherID,'teacher');
    });
   
    //计算项目数和获赞数
    function findNum(userID,identity){
        var workRef = wilddog.sync().ref("/works");
        workRef.orderByChild('origin')
            .startAt(userID)
            .endAt(userID)
            .once('value',function(snapshot){
                var userWorks = snapshot.val(),
                    workNum = 0,
                    praiseNum = 0;
                for(var item in userWorks){
                    var work = userWorks[item];
                    workNum++;
                    praiseNum += work.praise;
                }
                $('.praiseNum-' + identity).html(praiseNum);
                $('.workNum-' + identity).html(workNum);
            }); 
    }
    
    //生成项目信息节点的HTML
    function buildWorksNode(obj,workKey){
        var html = "<ul class='works' name='"+ workKey +"'><li><span>项目名称： </span><span class='work-name'>"+ obj.name +"</span></li><li><span>项目作者： </span><span class='work-author'>"+ obj.author +"</span></li><li><span>发布时间： </span><span class='work-date'>"+ obj.date +"</span></li><li><span>项目简介： </span><p class='work-summary'>"+ obj.summary +"</p></li><li><i class='iconfont'>&#xe606; </i><span class='work-praise'>"+ obj.praise +"</span><span class='work-detail'>详细信息</span></li></ul>";
        return html;
    }    
});
