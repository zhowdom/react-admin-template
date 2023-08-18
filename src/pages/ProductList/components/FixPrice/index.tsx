import { Card, Col, Empty, Radio, Row, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { ModalForm } from '@ant-design/pro-form';
import './index.less';
import SearchForm from './SearchForm';
import Result from './Result';
import { pricingCalculation } from '@/services/pages/productList';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import Desc from './Desc';

const Comp = (props: any) => {
  const options = [
    { label: '按所选产品', value: 1 },
    { label: '按自定义规格', value: 2 },
  ];
  const { dicList, goodsSkus, business_scope, category_id } = props;
  const [value, setValue] = useState(1);
  const [result, setResult] = useState<any>();
  const [loading, setLoading] = useState(false);
  const _ref: any = useRef();
  const onChange = (val: any) => {
    setValue(val.target.value);
    setResult(null);
    setLoading(false);
    _ref.current.resetFields();
  };
  // 计算结果
  const showResult = async (data: any) => {
    setLoading(true);
    const keyR = `CUSTOMRESULT${value}`;
    const res = await pricingCalculation({ ...data, business_scope, category_id });
    if (res?.code != pubConfig.sCode) {
      setResult(null);
      sessionStorage.removeItem(`${keyR}`);
      setTimeout(() => {
        setLoading(false);
      }, 600);
      pubMsg(res?.message);
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 600);
      sessionStorage.setItem(`${keyR}`, JSON.stringify(res.data));
      setResult(res.data);
    }
  };
  // 取缓存
  useEffect(() => {
    const data: any = sessionStorage.getItem(`CUSTOMRESULT${value}`)
      ? JSON.parse(sessionStorage.getItem(`CUSTOMRESULT${value}`) as string)
      : null;
    if (data) {
      setResult(data);
    }
  }, [value]);
  // 关闭清除
  const closeAction = () => {
    setValue(1);
    setResult(null);
    setLoading(false);
  };

  return (
    <ModalForm
      width={1150}
      title={
        <>
          <Radio.Group
            options={options}
            onChange={onChange}
            value={value}
            optionType="button"
            buttonStyle="solid"
          />
          <Desc />
        </>
      }
      trigger={<a>产品定价</a>}
      layout="horizontal"
      modalProps={{ destroyOnClose: true, className: 'fix-price', maskClosable: false }}
      onVisibleChange={async (visible: boolean) => {
        if (!visible) {
          closeAction();
        } else {
          setResult(null);
          sessionStorage.removeItem(`CUSTOMRESULT1`);
          sessionStorage.removeItem(`CUSTOMRESULT2`);
          sessionStorage.removeItem(`CUSTOMTAB1`);
          sessionStorage.removeItem(`CUSTOMTAB2`);
        }
      }}
      submitter={{
        searchConfig: {
          submitText: '确认',
          resetText: '关闭',
        },
        submitButtonProps: {
          style: {
            display: 'none',
          },
        },
      }}
    >
      <Row gutter={10}>
        <Col span={10}>
          <Card>
            <SearchForm
              value={value}
              _ref={_ref}
              dicList={dicList}
              goodsSkus={goodsSkus?.map((v: any) => {
                return {
                  value: v.id,
                  label: v.sku_name,
                };
              })}
              showResult={showResult}
              loading={loading}
            />
          </Card>
        </Col>

        <Col span={14}>
          {result ? (
            <Spin spinning={loading}>
              <Result value={value} dicList={dicList} result={result} />
            </Spin>
          ) : (
            <div className="empty-wrapper">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          )}
        </Col>
      </Row>
    </ModalForm>
  );
};
export default Comp;
