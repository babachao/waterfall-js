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