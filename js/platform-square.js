$(function(){
    //优秀项目数据获取
    var ref = wilddog.sync().ref("/works");
    ref.orderByKey().once("value", function(snapshot) {
        for(var item in snapshot.val()){
            var html = buildWorksNode(snapshot.val()[item],item);
            $('.work-title').after(html);
        }
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
    
    //搜索按键
    $('#btn-search').click(function(e){
        e.preventDefault();
        var searchName = $('#search-input').val();
        var workRef = wilddog.sync().ref("/works");
        ref.orderByChild('name')
        .startAt(searchName)
        .endAt(searchName)
        .once('value', function(snapshot) {
            var result = snapshot.val();
            $('.search-reasult').html('');
            //如果没有查找到结果
            if(result === null){
                $('.search-reasult').append('<h4>未查找到结果</h4>');
            }else{
                for(var item in result){
                    var html = buildWorksNode(snapshot.val()[item],item);
                    $('.search-reasult').append(html);
                }
                /**
                 * 查看项目详细信息
                 */
                $(".work-detail").click(function(){
                    var workID = $(this).parent().parent().attr('name');
                    //项目的ID用localStorage保存
                    localStorage.workID = workID;
                    location.href = 'work.html';
                });
            }
            //显示搜索结果
            $('.search-reasult').slideDown();
        });
    });
    

    var workRef = wilddog.sync().ref("/works");
    workRef.orderByChild("praise").limitToLast(5).on("child_added", function(snapshot) {
        var html = buildHotWork(snapshot.val(),snapshot.key());
        $('.work-list').append(html);
        
        /*查看项目详细信息*/
        $(".work-list span").click(function(){
            var workID = $(this).attr('name');
            //项目的ID用localStorage保存
            localStorage.workID = workID;
            location.href = 'work.html';
        });
    });
    
    //生成项目信息节点的HTML
    function buildWorksNode(obj,workKey){
        var html = "<ul class='works' name='"+ workKey +"'><li><span>项目名称： </span><span class='work-name'>"+ obj.name +"</span></li><li><span>项目作者： </span><span class='work-author'>"+ obj.author +"</span></li><li><span>发布时间： </span><span class='work-date'>"+ obj.date +"</span></li><li><span>项目简介： </span><p class='work-summary'>"+ obj.summary +"</p></li><li><i class='iconfont'>&#xe606; </i><span class='work-praise'>"+ obj.praise +"</span><span class='work-detail'>详细信息</span></li></ul>";
        return html;
    }    
    //生成热点项目LI节点的HTML
    function buildHotWork(obj,workKey){
        var html = "<li><span class='hotwork-name' name='"+ workKey +"'>"+ obj.name +"</span></li>";
        return html;
    }
});
