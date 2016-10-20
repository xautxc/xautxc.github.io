//创建 Wilddog Auth 实例
var config = {
    authDomain: "xautxc.wilddog.com",
    syncURL: "https://xautxc.wilddogio.com"
};
wilddog.initializeApp(config);


//登录检测         
wilddog.auth().onAuthStateChanged(function(user) {
    if (user) {

    } else {
        //未登录 则跳转至登录页面
        location.href = 'login.html';
    }
});
