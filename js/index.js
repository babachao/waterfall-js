class Waterfall {
  constructor(column) {
    this.column = column;
    this.testnum = 0;
    this.init = function () {
      const app = document.querySelector('.app');
      let htmlStr = '';
      for (let i = 0; i < column; i++) {
        htmlStr += `<div class="column"></div>`;
      }
      app.innerHTML = htmlStr;
    },
      /**
       * @description:  获取瀑布流的列。默认3列
       * @author: huchao
       */
      this.getColumns = function () {
        return [...document.querySelectorAll(".column")];
      },
      /**
       * @description: 创建默认的div
       * @param { object } data 当前请求的数据
       * @return {*}
       * @author: huchao
       */
      this.creatDefaultDiv = function (data) {
        const columns = this.getColumns();
        for (let i = 0; i < data.length; i += column) {
          const combination = data.slice(i, i + column); // 截取3个出来组成新的数组
          combination.sort((a, b) => b.height - a.height); // 并且将数组从高到低排序
          // 循环 【column】dom节点，默认：3列
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
       * @return {*}
       * @author: huchao
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
       * @param { object } 请求下来的单条数据
       * @author: huchao
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
        createDiv.style.height = height / 2 + "px";
        createDiv.appendChild(imgDom);
        createDiv.appendChild(p);
        createDiv.appendChild(span);
        return createDiv;
      },

      /**
       * @description: 实现懒加载功能
       * @author: huchao
       */
      this.lazyImages = function () {
        console.log('次数', this.testnum);
        console.time('循环时间：')
        // 优化后，性能更好的懒加载，先循环列，再循环列中的imgBox，
        const bodyTopHeight = getBodyTopHeight();
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

        // 旧的懒加载方式，每次都会循环所有isLoad为false的imgBox，不是特别好
        // const allImgBox = document.querySelectorAll("[isLoad='false']"); // 只查找未加载的imgBox
        // for (let i = 0; i < allImgBox.length; i++) {
        //   const item = allImgBox[i];
        //   const imgHeight = item.offsetHeight + item.offsetTop;
        //   this.testnum += 1;
        //   if (imgHeight <= bodyTopHeight) {
        //     item.setAttribute("isLoad", "true");
        //     this.handleImg(item.children[0]);
        //   }
        // }
        console.timeEnd('循环时间：')
      },
      // 处理图片
      this.handleImg = (imgItem) => {
        const url = imgItem.getAttribute("data-src");
        imgItem.setAttribute("src", url);
        imgItem.onload = () => {
          imgItem.style.opacity = 1;
          imgItem.style.transition = "0.6s";
        };
      }
  }
}