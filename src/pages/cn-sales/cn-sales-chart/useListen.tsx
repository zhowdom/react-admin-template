export default () => {
  const getStyleByAttr = (obj: any, name: any) => {
    return getComputedStyle(obj, null)[name];
  };
  const addListen = (itemName: string) => {
    const charts: any = [...document.querySelectorAll(itemName)];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((item) => {
        if (item.isIntersecting) {
          item.target.querySelectorAll("div[data-chart-source-type='G2Plot']").forEach((v: any) => {
            v.style.display = '';
          });
        } else {
          item.target.style.height = getStyleByAttr(item.target, 'height');
          item.target.querySelectorAll("div[data-chart-source-type='G2Plot']").forEach((v: any) => {
            v.style.display = 'none';
          });
        }
      });
    });
    charts.forEach((c: any) => io.observe(c));
  };
  return addListen;
};
