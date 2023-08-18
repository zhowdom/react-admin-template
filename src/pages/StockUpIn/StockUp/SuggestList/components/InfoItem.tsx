export default (props: any) => {
  return (
    <div className="suggest-info-item">
      <div className="suggest-info-item-title">{props?.title}</div>
      <div className="suggest-info-item-nav">{props?.children}</div>
    </div>
  );
};
