import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
const isSplit = (nodes, index, pageHeight) => {
  // 计算当前这块dom是否跨越了a4大小，以此分割
  if (
    nodes[index].offsetTop + nodes[index].offsetHeight < pageHeight &&
    nodes[index + 1] &&
    nodes[index + 1].offsetTop + nodes[index + 1].offsetHeight > pageHeight
  ) {
    return true;
  }
  return false;
};
const uploadPdf = () => {
  let ST = document.documentElement.scrollTop || document.body.scrollTop;
  let SL = document.documentElement.scrollLeft || document.body.scrollLeft;
  document.documentElement.scrollTop = 0;
  document.documentElement.scrollLeft = 0;
  document.body.scrollTop = 0;
  document.body.scrollLeft = 0;
  //获取滚动条的位置并赋值为0，因为是el-dialog弹框，并且内容较多出现了纵向的滚动条,截图出来的效果只能截取到视图窗口显示的部分,超出窗口部分则无法生成。所以先将滚动条置顶
  const A4_WIDTH = 592.28;
  const A4_HEIGHT = 841.89;
  let imageWrapper = document.querySelector('#content-html'); // 获取DOM
  let pageHeight = (imageWrapper.scrollWidth / A4_WIDTH) * A4_HEIGHT;
  let lableListID = imageWrapper.querySelectorAll('.r-w');
  // 进行分割操作，当dom内容已超出a4的高度，则将该dom前插入一个空dom，把他挤下去，分割
//   for (let i = 0; i < lableListID.length; i++) {
//     let multiple = Math.ceil((lableListID[i].offsetTop + lableListID[i].offsetHeight) / pageHeight);
//     if (isSplit(lableListID, i, multiple * pageHeight)) {
//       let divParent = lableListID[i].parentNode; // 获取该div的父节点
//       let newNode = document.createElement('div');
//       newNode.className = 'emptyDiv';
//       newNode.style.background = '#ffffff';
//       let _H = multiple * pageHeight - (lableListID[i].offsetTop + lableListID[i].offsetHeight);
//       //留白
//       newNode.style.height = _H + 30 + 'px';
//       newNode.style.width = '100%';
//       let next = lableListID[i].nextSibling; // 获取div的下一个兄弟节点
//       // 判断兄弟节点是否存在
//       if (next) {
//         // 存在则将新节点插入到div的下一个兄弟节点之前，即div之后
//         divParent.insertBefore(newNode, next);
//       } else {
//         // 不存在则直接添加到最后,appendChild默认添加到divParent的最后
//         divParent.appendChild(newNode);
//       }
//     }
//   }
  html2canvas(imageWrapper, {
    allowTaint: true,
    // x: imageWrapper.getBoundingClientRect().left + 13, // 绘制的dom元素相对于视口的位置
    // y: imageWrapper.getBoundingClientRect().top,
    x: 0,
    y: 0,
    width: imageWrapper.offsetWidth - 15, // 因为多出的需要剪裁掉，
    height: imageWrapper.offsetHeight,
    backgroundColor: '#FFF', //一定要设置北京颜色，否则有的浏览器就会变花~，比如Edge
    useCORS: true,
    scale: 3, // 图片模糊
    dpi: 350, //z
  }).then((canvas) => {
    let pdf = new jsPDF('p', 'mm', 'a4'); //A4纸，纵向
    let ctx = canvas.getContext('2d'),
      a4w = 190,
      a4h = 277, //A4大小，210mm x 297mm，四边各保留10mm的边距，显示区域190x277
      imgHeight = Math.floor((a4h * canvas.width) / a4w), //按A4显示比例换算一页图像的像素高度
      renderedHeight = 0;

    while (renderedHeight < canvas.height) {
      let page = document.createElement('canvas');
      page.width = canvas.width;
      page.height = Math.min(imgHeight, canvas.height - renderedHeight); //可能内容不足一页
      //用getImageData剪裁指定区域，并画到前面创建的canvas对象中
      page
        .getContext('2d')
        .putImageData(
          ctx.getImageData(
            0,
            renderedHeight,
            canvas.width,
            Math.min(imgHeight, canvas.height - renderedHeight),
          ),
          0,
          0,
        );
      pdf.addImage(
        page.toDataURL('image/jpeg', 0.2),
        'JPEG',
        10,
        10,
        a4w,
        Math.min(a4h, (a4w * page.height) / page.width),
      ); //添加图像到页面，保留10mm边距
      renderedHeight += imgHeight;
      if (renderedHeight < canvas.height) pdf.addPage(); //如果后面还有内容，添加一个空页
    }
    pdf.output('dataurlnewwindow', {
        filename: filename ?? 'foo.pdf',
      });
      return
    //     pdf.save('测试.pdf');
    let uploadPdf = pdf.output('datauristring'); //转成Base64
    let arr = uploadPdf.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let suffix = mime.split('/')[1];
    let bstr = window.atob(arr[1]); //自行百度新大陆
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    let filename = 'temp_img';
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    let file = new File([u8arr], `${filename}.${suffix}`, { type: mime });
    let formdata = new FormData();
    formdata.append('uploadfile', file);
    let params = { project: this.pid, courseid: this.id };
    this.$axios({
      url: `vueindex/UploadWord/uploadpdf`,
      method: 'post',
      headers: { 'Content-Type': 'multipart/form-data ' },
      data: formdata,
      params: params,
    }).then((res) => {
      if (res.data.code == 0) {
        //上传成功，刷新页面，打完收工
      }
    });
  });
};
export default uploadPdf