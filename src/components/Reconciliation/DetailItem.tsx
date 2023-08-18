import './detailItem.less';

const Item = (props: any) => {
  return (
    <div className="d-item">
      <div className="d-item-title">{props.title ? props.title + '：' : ''}</div>
      <div className="d-item-nav" style={{padding: props.noPadding ? 0 : '10px'}}>{props.children}</div>
    </div>
  );
};

export default Item;
