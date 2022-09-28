

const app = document.querySelector('.app');

const init = function () {
  let htmlStr = '';
  for (let i = 0; i < column; i++) {
    htmlStr += `<div class="column"></div>`
  }
  app.innerHTML = htmlStr;
}

/**
 * @description:  获取瀑布流的列。默认3列
 * @author: huchao
 */
const getDomList = function () {
  return [...document.querySelectorAll(".column")];
};

/**
 * @description:  创建div->img节点，appendChild到每一列中
 * @param { object } 请求下来的单条数据
 * @author: huchao
 */
const createDom = function (dataItem) {
  const { url, width, height, id, text } = dataItem;
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
};

// 图片延迟加载
const lazyImages = function () {
  const colums = getDomList();
  const allImgBox = document.querySelectorAll("[isLoad='false']"); // 只查找未加载的imgBox
  const bodyTopHeight = getBodyTopHeight();
  for (let i = 0; i < allImgBox.length; i++) {
    const item = allImgBox[i];
    const imgItem = item.children[0];
    const imgHeight = item.offsetHeight + item.offsetTop - 200;
    console.log(imgHeight , bodyTopHeight)
    if (imgHeight <= bodyTopHeight) {
      item.setAttribute("isLoad", "true");
      handleImg(imgItem);
    }
  }
};
// 处理图片
const handleImg = (imgItem) => {
  const url = imgItem.getAttribute("data-src");
  imgItem.setAttribute("src", url);
  imgItem.onload = () => {
    imgItem.style.opacity = 1;
    imgItem.style.transition = "0.6s";
  };
};