export const getUserToken = () => {
    return(window.localStorage.getItem('nevema_token'))
};

export const removeAuth = () => {
    window.localStorage.setItem('nevema_token', '')
    window.localStorage.setItem('nevema_userName', '')
    window.localStorage.setItem('nevema_roles', '')
    window.localStorage.setItem('nevema_loginUser', '')
    return true
};

export const getAuth = () => {
    return(window.localStorage.getItem('nevema_token'))
};

export const getUserInfo = () => {
    var loggedUserInfo = JSON.parse(localStorage.getItem("nevema_loginUser"));
    return loggedUserInfo;
};