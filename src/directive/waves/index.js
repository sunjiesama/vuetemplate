import waves from "./waves";

const install = function(Vue) {
  Vue.directive("waves", waves);// 创建自定义指令
};

if (window.Vue) {
  window.waves = waves;
  Vue.use(install); // eslint-disable-line
}

waves.install = install;
export default waves;
