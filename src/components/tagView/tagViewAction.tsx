import { SettingOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Space } from 'antd';
import { connect, useHistory } from 'umi';

const TagsViewAction = (props: any) => {
  const { activeTagId } = props;
  const { dispatch } = props;
  const navigate = useHistory();
  const closeCurrent = (id: any) => {
    dispatch({
      type: 'tagsViewStore/removeTag',
      targetKey: id,
      navigate,
    });
  };
  const closeOther = () => {
    dispatch({
      type: 'tagsViewStore/removeOtherTag',
    });
  };
  // const closeAll = () => {
  //   dispatch({
  //     type: 'tagsViewStore/removeAllTag',
  //     navigate,
  //   });
  // };
  return (
    <Dropdown
      {...props}
      overlay={
        <Menu>
          <Menu.Item key="0" onClick={() => closeCurrent(activeTagId)}>
            关闭当前
          </Menu.Item>
          <Menu.Item key="1" onClick={() => closeOther()}>
            关闭其他
          </Menu.Item>
          {/* <Menu.Item key="2" onClick={() => closeAll()}>
            关闭全部
          </Menu.Item>
          <Menu.Divider />*/}
        </Menu>
      }
    >
      <span id="pageTabs-actions">
        {props.children ?? (
          <Space style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <SettingOutlined
              className="tagsView-extra"
              style={{ color: 'rgba(0, 0, 0, 0.75)', paddingTop: '6px' }}
            />
            <span style={{ color: '#aaa', padding: '0px 20px 0 10px' }}> | </span>
          </Space>
        )}
      </span>
    </Dropdown>
  );
};
export default connect(({ tagsViewStore }: { tagsViewStore: Record<string, unknown> }) => ({
  tagsViewStore,
}))(TagsViewAction);
