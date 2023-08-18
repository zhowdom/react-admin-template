import './index.less';

export default (props: any) => {
  const list: any = props?.data || [];
  return list.map((v: any)=> {
    return (
      <div className='suggest-detail-approveLog' key={v.id}>
        <span>{v.create_time}</span>
        <i>{v.create_user_name}</i>
        <span>{v.remarks}</span>
      </div>
    )
  })
};
