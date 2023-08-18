import page404 from './noFind.png';
import { Button } from 'antd';
import { history } from 'umi';

const NoFoundPage = () => (
  <div
    style={{
      backgroundColor: '#fff',
      width: '100%',
      height: 'calc(100vh - 100px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <img style={{ display: 'block', maxWidth: '500px' }} src={page404} />
    <div style={{ color: '#666', lineHeight: '50px' }}>抱歉，你无权访问该页面</div>
    <Button type="primary" onClick={() => history.push('/')}>
      返回首页
    </Button>
  </div>
);

export default NoFoundPage;
