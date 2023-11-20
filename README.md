
💡 体验Demo:  [https://codesandbox.io/s/watefall-js-ykewbr](https://codesandbox.io/s/watefall-js-ykewbr) (codesandbox加载可能有些慢)

💡 写的不对的地方麻烦大伙纠正~，谢谢
## HTML
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>瀑布流</title>
    <link rel="stylesheet" href="./css/index.css">
  </head>
  <body>
    <div class="app clearfix"></div>
    <script src="./js/utils.js"></script>
    <script src="./js/index.js"></script>
    <script src="https://cdn.bootcdn.net/ajax/libs/axios/0.27.2/axios.min.js"></script>
    <script>
      // 初始化
      const waterfallNew = new Waterfall(3);
      waterfallNew.init()
      /**
       * @description:  发起请求获取数据
       */
      const getData = function (type) {
        axios.get("./data.json").then((res) => {
          waterfallNew.creatDefaultDiv(res.data);
          // 调用延迟加载, 数据绑定完后延迟500ms
          if (type === 'init') {
            setTimeout(() => { waterfallNew.lazyImages() }, 500);
          }
        });
      };
      // 到达条件时，触发加载更多数据
      const loadMore = function () {
        // 滚动到底部-》 屏幕高度 + 卷去的高度 + 500 >= 页面的真实高度
        const bodyTopHeight = getBodyTopHeight(500);
        const bodyHeight = document.documentElement.offsetHeight;
        if (bodyTopHeight >= bodyHeight) {
          getData();
        }
        waterfallNew.lazyImages();
      }
      
      // 监听滚动事件
      window.onscroll = throttle(loadMore, 300);
      getData('init');
    </script>
  </body>
</html>

```
## JS
```javascript
class Waterfall {
	constructor(column) {
        this.column = column;
        this.testnum = 0;
        this.init = function () {
            const app = document.querySelector('.app');
            let htmlStr = '';
            for (let i = 0; i < column; i++) {
                    htmlStr += `<div id="${i}" class="column" style="width: ${Math.floor(100 / column)}%;"></div>`;
            }
            app.innerHTML = htmlStr;
        },
      /**
       * @description:  获取瀑布流的列。默认3列
       */
        this.getColumns = function () {
                return [...document.querySelectorAll(".column")];
        },
        /**
       * @description: 创建默认的div
       * @param { object } data 当前请求的数据
       */
       this.creatDefaultDiv = function (data) {
        const columns = this.getColumns();
        for (let i = 0; i < data.length; i += column) {
            // 3个为一组，组成新的数组。
            // 1->data.slice(0,3) 2->data.slice(4,7) 依次类推
            const combination = data.slice(i, i + column);
            // 并且将【column】默认为3个，为一组的数据从高到低排序
            combination.sort((a, b) => b.height - a.height);
            // 根据dom的offsetHeight来排序，将优先插入矮的【column】
            columns
                .sort((a, b) => a.offsetHeight - b.offsetHeight)
                .forEach((columnDom, index) => {
                    const dataItem = combination[index];
                    if (!dataItem) return false;
                    // columnDom.innerHTML = this.creatInnerHTML(dataItem, columnDom);
                    columnDom.appendChild(this.createAppendDom(dataItem));
                });
            }
	},
     /**
       * @description: 基于innerHTML创建imgBox和img标签
       * @param {*} dataItem 单个数据item
       * @param {*} domItem 单个数据item
       * @return {string} 返回组装好的html
       */
    this.creatInnerHTML = function (dataItem, columnDom) {
        const { url, height, id, text } = dataItem;
        const htmlStr = columnDom.innerHTML;
        const newHtml = `
          <div id="${id}" class="column-item" style="height:${height / 2}px;" isLoad="false" >
            <img src="" data-src="${url}" />
            <p>${text}</p>
            <span>${id}</span>
          </div>
        `;
        return htmlStr + newHtml;
        },
     /**
       * @description:  创建div->img节点，appendChild到每一列中
       * @param { object } dataItem 请求下来的单条数据
       */
        this.createAppendDom = function (dataItem) {
            const { url, height, id, text } = dataItem;
            const createDiv = document.createElement("div");
            const span = document.createElement("span");
            const p = document.createElement("p");
            const imgDom = new Image();
            p.innerHTML = text;
            span.innerHTML = id;
            imgDom.setAttribute("data-src", url);
            createDiv.classList.add("column-item");
            createDiv.setAttribute("id", id);
            createDiv.setAttribute("isLoad", "false");
            createDiv.style.height = height / 2 + "px";  // 因为我用的图片高度太高了，所以除2了
            createDiv.appendChild(imgDom);
            createDiv.appendChild(p);
            createDiv.appendChild(span);
            return createDiv;
        },


     /**
      * @description: 实现懒加载功能
      */
    this.lazyImages = function () {
        console.log('次数', this.testnum);
        console.time('循环时间：')
        const bodyTopHeight = getBodyTopHeight(); // 获取可视高度 + 滚动高度（此方法在utils.js中）
        const colums = this.getColumns();
        for (let j = 0; j < colums.length; j++) {
            const columnItems = [...colums[j].querySelectorAll(".column-item[isLoad='false']")]; // 获取还没有加载过的box
            for (let i = 0; i < columnItems.length; i++) {
                const imgBox = columnItems[i];
                const imgBoxHeight = imgBox.offsetHeight + imgBox.offsetTop; // 当前imgBox的高 + 距离顶部的高
                this.testnum += 1;
                // // imgBox的高 + 距离顶部的高 <= body高 + 滚动的距离时，进入判断并且将图片加载出来
                if (imgBoxHeight <= bodyTopHeight) {
                        imgBox.setAttribute('isLoad', 'true');
                        this.handleImg(imgBox.children[0]);
                } else {
                        break;
                }
            }
        }
        console.timeEnd('循环时间：')
    },
    /**
      * @description:  实现懒加载功能
      * @param { object } imgItem 当前img的Dom节点
      */
        this.handleImg = function (imgItem) {
            const url = imgItem.getAttribute("data-src"); // 获取到图片的链接
            imgItem.setAttribute("src", url); // 设置给img的src
            // 加载成功后设置style
            imgItem.onload = () => {
                    imgItem.style.opacity = 1;
                    imgItem.style.transition = "0.6s";
            };
            imgItem.onerror = (e) => {
                    // xxx 若加载失败，可在这展示默认图片
            };
        }
    }
}
```
## CSS
```css
html,
body {
	margin: 0;
	padding: 0;
	background-color: #f5f5f5;
}

.clearfix::after {
	content: "";
	display: block;
	visibility: hidden;
	clear: both;
}

.app {
	padding: 0.4%;
}

.app>.column {
	/* width: 32.5%; */
	float: left;
	background-color: #fff;
}

.app .column-item {
	position: relative;
	width: 100%;
	overflow: hidden;
	margin-bottom: 10px;
	background: url("..//img/load.gif") no-repeat center center;
	background-size: 70%;
	background-color: #e8e8e8;
	box-shadow: 0 0 6px 6px #ccc;
}

.app .column-item p {
	display: none;
	color: #fff;
	text-align: center;
}

.app .column-item span {
	position: absolute;
	top: 40%;
	left: 50%;
	color: #fff;
	font-size: 20px;
	display: none;
}

.app>div:nth-last-child(2n) {
	margin: 0 0.5%;
}

.app img {
	opacity: 0;
	width: 100%;
	height: 100%;
}
```
## JS-原理分析
#### 1、实现init()方法-默认3列
> 💡 Tips：3列的话，width宽度为33.3333%，对应列的width需要自己修改一下。

   💡循环column遍，生成对应列，放入到div容器中
```javascript
  // column 默认为3，通过传参拿到
	const init = fucntion (column) {
    const app = document.querySelector('.app');
    let htmlStr = '';
    for (let i = 0; i < column; i++) {
      htmlStr += `<div class="column"></div>`;
    }
  	app.innerHTML = htmlStr;
  }
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0bf0356afad240f08f080142082703a3~tplv-k3u1fbpfcp-zoom-1.image)
#### 2、实现creatDefaultDiv()方法，创建默认的imgBox。
> 💡 Tips：将数据遍历分为3组并且排序，创建装有img的div 
> 实现getColumns方法，获取所有列
> 💡 知识点：
> 1、[offsetHeight](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/offsetHeight)  返回该元素的像素高度
> 2、[querySelectorAll](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/querySelectorAll) 返回与指定的选择器组匹配的文档中的元素列表
> 3、[setAttribute](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/setAttribute) 设置指定元素上的某个属性值（有则更新，无则添加）

```javascript
const getColumns = function () {
    return [...document.querySelectorAll(".column")];
}
```
```javascript
const creatDefaultDiv = function (data) {
  const columns = getColumns();
  for (let i = 0; i < data.length; i += column) {
    // 3个为一组，组成新的数组。
    // 1->data.slice(0,3) 2->data.slice(4,7) 依次类推
    const combination = data.slice(i, i + column);
    // 并且将【column】默认为3个，为一组的数据从高到低排序
    combination.sort((a, b) => b.height - a.height);
    // 根据dom的offsetHeight来排序，将优先插入矮的【column】
    columns
      .sort((a, b) => a.offsetHeight - b.offsetHeight)
      .forEach((columnDom, index) => {
        const dataItem = combination[index];
        if (!dataItem) return false;
        columnDom.appendChild(createAppendDom(dataItem));
      });
  }
}
```
💡  imgBox设置一张默认加载的[背景图](https://github.com/babachao/waterfall-js/blob/main/img/load.gif)
```javascript
 /**
 * @description: 创建默认的div
 * @param { object } data 当前请求的数据
 */
const createAppendDom = function (dataItem) {
  const { url, height, id, text } = dataItem;
  const createDiv = document.createElement("div");
  const span = document.createElement("span");
  const p = document.createElement("p");
  const imgDom = new Image();
  p.innerHTML = text;
  span.innerHTML = id;
  imgDom.setAttribute("data-src", url);
  createDiv.classList.add("column-item");
  createDiv.setAttribute("id", id);
  createDiv.setAttribute("isLoad", "false");
  createDiv.style.height = height + "px";
  createDiv.appendChild(imgDom);
  createDiv.appendChild(p);
  createDiv.appendChild(span);
  return createDiv;
}
```
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c7b45f7ca28f415e81d5b689584d38cc~tplv-k3u1fbpfcp-zoom-1.image)
#### 3、实现lazyImages()懒加载功能
> 💡 Tips：(img的opacity默认是0;)  
> 1、创建img时，将url地址绑在data-src上 
	2、需要展示img时，通过setAttribute()设置url，加载图片
	3、给img.style.opacity = 1和 img.style.transtion = '0.6s'，添加一个渐现的动画
> 💡 知识点：
> 1、使用[querySelectorAll](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/querySelectorAll) [属性选择器](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Attribute_selectors)查找对应的【.column-item】DOM
> 2、[offsetTop](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/offsetTop) 返回当前元素相对于其 [offsetParent](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/offsetParent) 元素的顶部内边距的距离。

```javascript
/**
 * @description:  实现懒加载功能
 */
const lazyImages = function () {
  const bodyTopHeight = getBodyTopHeight(); // 获取页面可视高度 + 滚动高度（此方法在utils.js中）
  const colums = getColumns(); // 获取所有列
  // 先循环列，再循环imgBox
  for (let j = 0; j < colums.length; j++) {
    const columnItems = [...colums[j].querySelectorAll(".column-item[isLoad='false']")]; // 通过属性获取还没有加载过的imgBox
    for (let i = 0; i < columnItems.length; i++) {
      const imgBox = columnItems[i];
      const imgBoxHeight = imgBox.offsetHeight + imgBox.offsetTop; // 当前imgBox的高 + 距离顶部的高
      // imgBox的高 + 距离顶部的高 <= body高 + 滚动的距离时，进入判断并且将图片加载出来
      if (imgBoxHeight <= bodyTopHeight) {
        imgBox.setAttribute('isLoad', 'true');
        handleImg(imgBox.children[0]); // 处理img的展示
      } else {
        break;
      }
    }
  }
}
```

```javascript
/**
 * @description:  实现懒加载功能
 * @param { object } imgItem 当前img的Dom节点
 */
const handleImg = function (imgItem) {
	const url = imgItem.getAttribute("data-src"); // 获取到图片的链接
	imgItem.setAttribute("src", url); // 设置给img的src
	// 加载成功后设置style
	imgItem.onload = () => {
		imgItem.style.opacity = 1;
		imgItem.style.transition = "0.6s";
	};
	imgItem.onerror = (e) => {
		// xxx 若加载失败，可在这展示默认图片
	};
}
```
## utils.js
```javascript
/**
 * @description: 防抖函数的实现
 * @param { Function } fn 需要调用的方法
 * @param { number } wait 等待的时间
 * @param { boolean } immediate 是否需要在开始边界触发
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
 * @description: 节流
 * @param { Function } fn 需要调用的方法
 * @param { number } wait 等待的时间
 */
const throttle = function (fn, wait){
  var timer = null;
  return function(...args){
      var context = this;
      clearTimeout(timer);
      timer = setTimeout(function(){
          fn.call(context, args);
      }, wait);
  };
};

/**
 * @description: 计算： 屏幕高度 + 卷去的高度
 * @param { number } addHeight 需要增加的高度
 * @return { number } 返回计算出来的结果
 */
const getBodyTopHeight = function (addHeight = 0) {
  return document.documentElement.clientHeight + document.documentElement.scrollTop + addHeight;
}

```
## 总结 💡
1、该瀑布流实现方案是在接口已经返回了img的高度情况下，不需要一张一张等待img的图片加载完再计算高度，而且这种方案用户体验更好，还可以实现懒加载功能

2、还有就是图片的宽、高可以在B端中上传时拿到，将宽高拼接到img链接后面，或者当参数传给后端，具体方案可以与后端商定好


