import { checkEnShortName, checkGoodsCode } from '@/services/pages/establish';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { Button, Col, Divider, Modal, Popover, Row } from 'antd';

const Create = (props: any) => {
  // 校验产品编码
  const checkoutCode = async (name: string, goods_code: string, values: any) => {
    const res = await checkGoodsCode({
      goods_code,
      id: props?.id,
      type: props?.formRef?.current?.getFieldValue('type'),
      goods_id: props?.detailData?.goods_id
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    props.setDetailData((pre: any) => {
      return {
        ...pre,
        name,
        goods_code,
      };
    });
    props.setRequireData(values);
  };
  // 生成产品信息
  const createProduct = async (values: any) => {
    if (!props.productName) {
      return Modal.warning({
        title: '提示',
        content: '请选择产品线',
      });
    }
    // 校验英文简称
    const res = await checkEnShortName({
      ...(props?.formRef?.current?.getFieldsValue(['business_scope', 'vendor_group_id']) || {}),
      en_short_name: values.en_short_name,
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    const name = `${values.requirement_name}${props.productName}${values.requirement_en_name}${values.consumption_level}V${values.goods_version}`;
    const code = `${values.en_short_name}${values.requirement_en_name}${values.consumption_level}V${values.goods_version}`;
    if (res.data) {
      Modal.confirm({
        title: '提示',
        content: <div style={{ color: 'red' }}>{res.data}</div>,
        okText: '否,重新设置',
        cancelText: '是,继续使用',
        onOk() {},
        onCancel() {
          checkoutCode(name, code, values);
        },
      });
    } else {
      checkoutCode(name, code, values);
    }
  };
  return (
    <>
      <ProForm
        layout="horizontal"
        onFinish={async (values: any) => {
          return createProduct(values);
        }}
        labelAlign="right"
        className={props.disabled ? 'pub-detail-form' : ''}
        formRef={props.formRef1}
        submitter={false}
        labelCol={{ flex: '123px' }}
      >
        <Row gutter={24}>
          <Col span={8} style={{ marginBottom: '10px' }}>
            <ProFormText
              required={!props.disabled}
              name="requirement_name"
              label="需求"
              fieldProps={{
                maxLength: 125,
              }}
              placeholder={props.disabled ? '--' : '请输入需求'}
              readonly={props.disabled}
              rules={[
                { required: true, message: '请输入需求名' },
                {
                  pattern: /^(?=.*\S).+$/,
                  message: '请输入需求',
                },
              ]}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              name="requirement_en_name"
              label="需求英文简称"
              required={!props.disabled}
              fieldProps={{
                maxLength: 125,
              }}
              placeholder={props.disabled ? '--' : '请输入需求英文简称'}
              readonly={props.disabled}
              rules={[
                () => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.reject(new Error('请输入需求英文简称'));
                    }
                    if (!/^[a-zA-Z]+$/g.test(value)) {
                      return Promise.reject(new Error('请输入需求英文简称'));
                    }
                    if (value.length > 5) {
                      return Promise.reject(new Error('不能超过五位'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            />
          </Col>
          <Col span={8}>
            <ProFormSelect
              required={!props.disabled}
              name="goods_version"
              label="版本号: "
              placeholder={props.disabled ? '--' : '请选择版本号'}
              readonly={props.disabled}
              rules={[{ required: !props.disabled, message: '请选择版本号' }]}
              valueEnum={props.dicList.PROJECTS_GOODS_VERSION}
            />
          </Col>
          <Col span={8}>
            <ProFormSelect
              required={!props.disabled}
              name="consumption_level"
              label="消费层级: "
              placeholder={props.disabled ? '--' : '请选择消费层级'}
              readonly={props.disabled}
              rules={[{ required: !props.disabled, message: '请选择消费层级' }]}
              valueEnum={props.dicList.PROJECTS_CONSUMPTION_LEVEL}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              name="en_name"
              label="产品线英文名"
              fieldProps={{
                maxLength: 125,
              }}
              required={!props.disabled}
              placeholder={props.disabled ? '-' : '请输入产品线英文名'}
              readonly={props.disabled}
              rules={[
                () => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.reject(new Error('请输入产品线英文名'));
                    }
                    if (!/^[a-zA-Z ]+$/g.test(value) || !/^(?=.*\S).+$/.test(value)) {
                      return Promise.reject(new Error('请输入产品线英文名'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              name="en_short_name"
              required={!props.disabled}
              label="产品线英文简称"
              fieldProps={{
                maxLength: 125,
              }}
              placeholder={props.disabled ? '--' : '请输入产品线英文简称'}
              readonly={props.disabled}
              rules={[
                () => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.reject(new Error('请输入产品线英文简称'));
                    }
                    if (!/^[a-zA-Z]+$/g.test(value)) {
                      return Promise.reject(new Error('请输入产品线英文简称'));
                    }
                    if (value.length > 5) {
                      return Promise.reject(new Error('不能超过五位'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            />
          </Col>
          <Col
            span={24}
            style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '55px' }}
          >
            {props.disabled ? (
              <></>
            ) : (
              <>
                <Button
                  type="primary"
                  key="save"
                  onClick={async () => {
                    props.formRef1.current?.submit?.();
                  }}
                >
                  {props.edit ? '修改' : '确定'}
                </Button>

                <Popover
                  content={
                    <>
                      <p>
                        1、产品名称：需求+产品线+需求简称+消费层级+V+迭代次数
                        <br />
                        举例：儿童滑板车K5V3
                      </p>
                      <p>
                        2、产品编码：产品线英文简称+需求简称+消费层级+V+迭代次数
                        <br />
                        举例：STK5V3
                      </p>
                      <p>
                        3、款式名称：产品名称 + 款式属性
                        <br />
                        举例：遛娃推车SLK5V1蓝色带座椅 VK欧版
                      </p>
                      <p>
                        4、款式编码：产品编码+两位自增数（按已被使用顺序自动生成）
                        <br />
                        举例：STK5V301 / STK5V302 /STK5V303 /STK5V304..
                      </p>
                    </>
                  }
                  title="命名规则说明"
                >
                  <QuestionCircleOutlined style={{ marginLeft: 4, cursor: 'pointer' }} />
                </Popover>
              </>
            )}
          </Col>
        </Row>
      </ProForm>
      <Divider />
    </>
  );
};
export default Create;
