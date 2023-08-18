import { connect } from 'umi';
import { Divider } from 'antd';

const PubDivider = (props: any) => {
  return (
    <Divider orientation="left" orientationMargin="0" style={{ color: '#2e62e2' }}>
      {props.title}
    </Divider>
  );
};
const Page: React.FC<any> = connect(({ common }: any) => ({ common }))(PubDivider);
export default Page;
