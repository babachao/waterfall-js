
/**
 * @description: 防抖函数的实现
 * @param { Function } fn 需要调用的方法
 * @param { number } wait 等待的时间
 * @param { boolean } immediate 是否需要再开始边界触发
 * @return { Function } 返回被调用的方法
 * @author: huchao
 */
const debounce = function (fn, wait, immediate = false) {
  let result = null; // 储存返回的result
  let timeOut = null; // 记录定时器
  return function (...args) {
    const context = this; // 获取this指向
    const now = immediate && !timeOut; //如果需要在开始边界执行，则需要immediate为true并且没有timeOut
    clearTimeout(timeOut); // 关键：每次进来时，需要清除上一个定时器，防抖目的是等待时间内只执行一次
    timeOut = setTimeout(() => {
      if (!immediate) result = fn.call(context, ...args); // 结束边界触发
      timeOut = null;
    }, wait);
    // 开始边界触发
    if (now) result = fn.call(context, ...args);
    return result;
  };
};

/**
 * @description: 计算： 屏幕高度 + 卷去的高度
 * @param { number } addHeight 需要增加的高度
 * @return { number } 返回计算出来的结果
 * @author: huchao
 */
const getBodyTopHeight = function (addHeight = 0) {
  return document.documentElement.clientHeight + document.documentElement.scrollTop + addHeight;
}