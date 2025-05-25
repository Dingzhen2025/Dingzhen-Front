// 认证接口
import request from './request';

// 登录
export const login = (account, password) =>
    request.post('/users/login', { account, password });

// 注册
export const register = (user) =>
    request.post('/users/register', user);

// 更改用户名
export const changeUsername = (userId, name) =>
    request.post('/users/change_name', { userId, name });