import { Button, Modal, Dropdown, Tag, Menu, Alert, Spin, Input, Space } from 'antd';
import { LockFilled, PlusOutlined, TagsFilled } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import {
  dictDetailAuth,
  dictDetailAuthAdd,
  dictDetailAuthEdit,
  dictDetailAuthRemove,
} from '@/services/base';
import {
  findByTagTypeOrderTagRecord,
  findByExceptionTypeOrderExceptionRecord,
} from '@/services/pages/order';
import './index.less';
import { pubConfig, pubMsg } from '@/utils/pubConfig';

const MenuColor = (prop: any) => (
  <Menu
    {...prop}
    onSelect={({ item, key }) => {
      console.log(item, key, 'select');
    }}
    items={[
      {
        key: '#E91E63',
        label: (
          <>
            <TagsFilled style={{ color: '#E91E63', marginRight: 4 }} />
            pink
          </>
        ),
      },
      {
        key: '#F44336',
        label: (
          <>
            <TagsFilled style={{ color: '#F44336', marginRight: 4 }} />
            red
          </>
        ),
      },
      {
        key: '#009688',
        label: (
          <>
            <TagsFilled style={{ color: '#009688', marginRight: 4 }} />
            teal
          </>
        ),
      },
      {
        key: '#FFEB3B',
        label: (
          <>
            <TagsFilled style={{ color: '#FFEB3B', marginRight: 4 }} />
            yellow
          </>
        ),
      },
      {
        key: '#FF9800',
        label: (
          <>
            <TagsFilled style={{ color: '#FF9800', marginRight: 4 }} />
            orange
          </>
        ),
      },
      {
        key: '#FF5722',
        label: (
          <>
            <TagsFilled style={{ color: '#FF5722', marginRight: 4 }} />
            deepOrange
          </>
        ),
      },
      {
        key: '#00BCD4',
        label: (
          <>
            <TagsFilled style={{ color: '#00BCD4', marginRight: 4 }} />
            cyan
          </>
        ),
      },
      {
        key: '#4CAF50',
        label: (
          <>
            <TagsFilled style={{ color: '#4CAF50', marginRight: 4 }} />
            green
          </>
        ),
      },
      {
        key: '#8BC34A',
        label: (
          <>
            <TagsFilled style={{ color: '#8BC34A', marginRight: 4 }} />
            green
          </>
        ),
      },
      {
        key: '#2196F3',
        label: (
          <>
            <TagsFilled style={{ color: '#2196F3', marginRight: 4 }} />
            blue
          </>
        ),
      },
      {
        key: '#9C27B0',
        label: (
          <>
            <TagsFilled style={{ color: '#9C27B0', marginRight: 4 }} />
            purple
          </>
        ),
      },
      {
        key: '#673AB7',
        label: (
          <>
            <TagsFilled style={{ color: '#673AB7', marginRight: 4 }} />
            deepPurple
          </>
        ),
      },
      {
        key: '#03A9F4',
        label: (
          <>
            <TagsFilled style={{ color: '#03A9F4', marginRight: 4 }} />
            lightblue
          </>
        ),
      },
      {
        key: '#3F51B5',
        label: (
          <>
            <TagsFilled style={{ color: '#3F51B5', marginRight: 4 }} />
            indigo
          </>
        ),
      },
      {
        key: '#795548',
        label: (
          <>
            <TagsFilled style={{ color: '#795548', marginRight: 4 }} />
            brown
          </>
        ),
      },
      {
        key: '#CDDC39',
        label: (
          <>
            <TagsFilled style={{ color: '#CDDC39', marginRight: 4 }} />
            lime
          </>
        ),
      },
      {
        key: '#607D8B',
        label: (
          <>
            <TagsFilled style={{ color: '#607D8B', marginRight: 4 }} />
            blueGrey
          </>
        ),
      },
      {
        key: '#FFC107',
        label: (
          <>
            <TagsFilled style={{ color: '#FFC107', marginRight: 4 }} />
            amber
          </>
        ),
      },
    ]}
  />
);
const Component: React.FC<{
  triggerText: any;
  type?: 'tag' | 'exception'; // 标记管理 | 异常管理
  dispatch: any;
}> = ({ triggerText, type = 'tag', dispatch }) => {
  const [open, openSet] = useState(false);
  type typeTag = {
    dictType?: 'ORDER_TAG_TYPE' | 'ORDER_EXCEPTION_TYPE';
    status?: any;
    id?: string;
    cssClass?: string;
    isDefault?: 'N' | 'Y'; // 是否默认, 有锁头图标
    dictLabel: string;
    dictValue: string;
    dictSort: number;
    editable?: boolean; // 是否可编辑
  };
  const [tags, tagsSet] = useState<typeTag[]>([]);
  const [refreshKey, refreshKeySet] = useState(1);
  const [loading, loadingSet] = useState(false);
  const [submitting, submittingSet] = useState(false);
  const [timeStamp, timeStampSet] = useState(0);
  const [isAdd, isAddSet] = useState<boolean>(false);
  const [newTag, newTagSet] = useState<Record<string, any>>({
    cssClass: 'grey',
    dictType: type == 'tag' ? 'ORDER_TAG_TYPE' : 'ORDER_EXCEPTION_TYPE',
    dictLabel: '',
    status: '0',
    dictValue: type == 'tag' ? 'ORDER_TAG_TYPE' + Date.now() : 'ORDER_EXCEPTION_TYPE' + Date.now(),
    dictSort: (Number(tags[tags.length - 1]?.dictSort) || 0) + 1,
  });
  useEffect(() => {
    loadingSet(true);
    dictDetailAuth({
      dictType: type == 'tag' ? 'ORDER_TAG_TYPE' : 'ORDER_EXCEPTION_TYPE',
      pageIndex: 1,
      pageSize: 999,
    })
      .then((res: any) => {
        if (res.code == pubConfig.sCode) {
          const list = res.data?.list;
          if (list && list.length) {
            tagsSet(list);
          }
        }
      })
      .finally(() => {
        loadingSet(false);
      });
  }, [type, refreshKey]);
  const removeCheck = (data: Record<string, any>) => {
    let api: any = findByExceptionTypeOrderExceptionRecord;
    if (type == 'tag') api = findByTagTypeOrderTagRecord;
    return api(data).then((res: any) => {
      if (res?.code == '0' && res.data == 0) {
        return true;
      } else {
        pubMsg(`操作失败: 当前${type == 'tag' ? '标记' : '异常类型'}已被订单关联, 无法编辑和删除`);
        return false;
      }
    });
  };
  return (
    <>
      <Button onClick={() => openSet(true)}>{triggerText}</Button>
      <Modal
        width={760}
        title={type == 'tag' ? `标记管理` : `异常管理`}
        onCancel={() => openSet(false)}
        open={open}
        footer={null}
        bodyStyle={{ paddingTop: 10 }}
        destroyOnClose
      >
        <Spin spinning={loading}>
          <Alert
            banner
            showIcon={false}
            type={'info'}
            message={`Tips: 点击+新增, 双击文字进行编辑${
              type == 'tag' ? ', 点击图标可更换颜色' : ''
            }`}
            style={{ marginBottom: 20 }}
          />
          <Space wrap={true} size={'small'}>
            {tags.map((tag: any) => (
              <Tag
                key={tag.id + timeStamp}
                onClose={async (e: any) => {
                  e?.preventDefault();
                  const canRemove: any =
                    type == 'tag'
                      ? await removeCheck({ tagType: tag.dictValue })
                      : await removeCheck({ exceptionType: tag.dictValue });
                  if (canRemove) {
                    const res = await dictDetailAuthRemove({ ids: tag.id });
                    if (res?.code == '0') {
                      tagsSet(tags.filter((item) => item.id != tag.id));
                      pubMsg(res?.message || '删除成功', 'success');
                      dispatch({
                        type: 'common/getDicAction',
                        payload: {},
                      });
                    } else {
                      pubMsg('删除失败: ' + res?.message);
                    }
                  }
                }}
                closable={tag.isDefault == 'N'}
                style={{ fontSize: '14px', lineHeight: '32px' }}
              >
                {tag.isDefault == 'N' && type == 'tag' ? (
                  <Dropdown
                    arrow
                    overlay={
                      <MenuColor
                        onClick={async ({ key }: any) => {
                          const res = await dictDetailAuthEdit({ ...tag, cssClass: key });
                          if (res?.code == '0') {
                            tagsSet(
                              tags.map((item) => {
                                if (tag.id == item.id) return { ...item, cssClass: key };
                                return item;
                              }),
                            );
                            dispatch({
                              type: 'common/getDicAction',
                              payload: {},
                            });
                          } else {
                            pubMsg(res?.message);
                          }
                        }}
                      />
                    }
                  >
                    <TagsFilled style={{ color: tag.cssClass || 'grey' }} />
                  </Dropdown>
                ) : type == 'tag' ? (
                  <TagsFilled style={{ color: tag.cssClass || 'grey' }} />
                ) : null}
                <span
                  suppressContentEditableWarning
                  onBlur={async (e: any) => {
                    tagsSet(
                      tags.map((item) => {
                        if (tag.id == item.id) return { ...item, editable: false };
                        return item;
                      }),
                    );
                    if (tag.dictLabel == e?.target?.innerText) {
                      return;
                    }
                    if (e?.target?.innerText?.length > 10) {
                      timeStampSet(Date.now());
                      pubMsg('输入长度不能大于10个字符');
                      return;
                    }
                    // 检查重复
                    const matched = tags.find(
                      (item: any) => item.dictLabel == e?.target?.innerText,
                    );
                    if (matched) {
                      timeStampSet(Date.now());
                      pubMsg(`修改失败, 已有"${e?.target?.innerText}", 名称不可重复`);
                      return;
                    }
                    const canRemove: any =
                      type == 'tag'
                        ? await removeCheck({ tagType: tag.dictValue })
                        : await removeCheck({ exceptionType: tag.dictValue });
                    if (canRemove) {
                      let api = dictDetailAuthAdd;
                      if (tag.id) api = dictDetailAuthEdit;
                      const res = await api({
                        ...tag,
                        dictLabel: e?.target?.innerText,
                      });
                      if (res?.code == '0') {
                        refreshKeySet(Date.now());
                        pubMsg('修改成功', 'success');
                        dispatch({
                          type: 'common/getDicAction',
                          payload: {},
                        });
                      } else {
                        pubMsg(res?.message);
                        timeStampSet(Date.now());
                      }
                    } else {
                      timeStampSet(Date.now());
                    }
                  }}
                  style={{ padding: '0 8px' }}
                  contentEditable={tag.isDefault == 'N' && tag.editable}
                  onClick={() =>
                    tagsSet(
                      tags.map((item) => {
                        if (tag.id == item.id) return { ...item, editable: true };
                        return item;
                      }),
                    )
                  }
                >
                  {tag.dictLabel}
                </span>
                {tag.isDefault == 'N' ? null : (
                  <LockFilled
                    style={{ color: 'grey', marginLeft: 2 }}
                    title={
                      '有“锁”标识的标记，属于系统内置逻辑，或是在系统中已有相关标记的处理逻辑，逻辑不可更改'
                    }
                  />
                )}
              </Tag>
            ))}
            {isAdd ? (
              <div style={{ display: 'inline-block' }}>
                <Input.Group compact style={{ display: 'flex', alignItems: 'center' }}>
                  <Dropdown
                    arrow
                    overlay={
                      <MenuColor
                        onClick={({ key }: any) => {
                          newTagSet({ ...newTag, cssClass: key });
                        }}
                      />
                    }
                  >
                    <TagsFilled style={{ color: newTag.cssClass }} />
                  </Dropdown>
                  <Input
                    autoFocus
                    maxLength={10}
                    style={{ width: 100, marginLeft: 4 }}
                    onChange={({ target }: any) => {
                      newTagSet({ ...newTag, dictLabel: target?.value });
                    }}
                  />
                  <Button onClick={() => isAddSet(false)}>取消</Button>
                  <Button
                    loading={submitting}
                    type={'primary'}
                    onClick={async () => {
                      submittingSet(true);
                      const res = await dictDetailAuthAdd(newTag);
                      submittingSet(false);
                      if (res?.code == '0') {
                        pubMsg('添加成功', 'success');
                        refreshKeySet(Date.now);
                        dispatch({
                          type: 'common/getDicAction',
                          payload: {},
                        });
                        isAddSet(false);
                      } else {
                        pubMsg(res?.message);
                      }
                    }}
                  >
                    提交
                  </Button>
                </Input.Group>
              </div>
            ) : (
              <Button
                style={{ width: 100, height: 32 }}
                title={'添加新标记'}
                loading={submitting}
                onClick={() => {
                  newTagSet({
                    ...newTag,
                    dictValue:
                      type == 'tag'
                        ? 'ORDER_TAG_TYPE' + Date.now()
                        : 'ORDER_EXCEPTION_TYPE' + Date.now(),
                  });
                  isAddSet(true);
                }}
                type={'dashed'}
              >
                <PlusOutlined />
              </Button>
            )}
          </Space>
          {type == 'tag' ? (
            <>
              <div style={{ marginTop: 60 }}>标记逻辑:</div>
              <ul>
                <li>
                  1、有“锁”标识的标记，属于系统内置逻辑，或是在系统中已有相关标记的处理逻辑，逻辑不可更改；
                </li>
                <li>2、可以新增标记：标记名称不可重复，可以自定义不同的颜色标签；</li>
                <li>3、可以删除标记：前提条件是需要删除的标签，未被订单引用；</li>
              </ul>
            </>
          ) : (
            <>
              <div style={{ marginTop: 60 }}>异常类型逻辑:</div>
              <ul>
                <li>1、有“锁”标识的异常类型，属于系统内置逻辑，数据不可更改/删除；</li>
                <li>2、可以新增标识：标识名称不可重复；</li>
                <li>3、可以删除标识：非内置的异常类型 且 未被引用的情况下，可以进行编辑和删除；</li>
              </ul>
            </>
          )}
        </Spin>
      </Modal>
    </>
  );
};
export default Component;
