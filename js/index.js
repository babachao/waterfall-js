

const app = document.querySelector('.app');

const init = function () {
  let htmlStr = '';
   for (let i = 0; i < column; i++) {
      htmlStr +=`<div class="column"></div>`
   }
   app.innerHTML = htmlStr;
}
