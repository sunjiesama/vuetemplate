import axios from "axios";

axios.interceptors.response.use(function(config) {
  // 如果数据没有请求到，并且返回到结果为校监失败
  if (config.data.code !== 200) {
    // token失效，移除token
    document.cookie = "Token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
  return config;
});
// 用户登录
export const userLogin = data =>
  axios({
    url: "http://localhost/code/vueElementTest/userLogin.php",
    method: "post",
    data
  });
// 获取用户列表
export const getUserList = () =>
  axios({
    url: "http://localhost/code/vueElementTest/getUser.php",
    method: "get"
  });
// 删除用户
export const deleteUser = data =>
  axios({
    url: "http://localhost/code/vueElementTest/deleteUser.php",
    method: "post",
    data
  });

// 注册用户
export const register = data =>
  axios({
    url: "http://localhost/code/vueElementTest/register.php",
    method: "post",
    data
  });
// 朋友圈相关
export const moments = data =>
  axios({
    url: "http://localhost/code/vueElementTest/moments.php",
    method: "post",
    data
  });
// 更新用户名
export const updateUser = data =>
  axios({
    url: "http://localhost/code/vueElementTest/editUser.php",
    method: "post",
    data
  });
