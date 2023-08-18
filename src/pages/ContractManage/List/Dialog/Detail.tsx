import React from 'react';
import { useState } from 'react';
import { ModalForm } from '@ant-design/pro-form';
import { Col, Form, Row, Spin } from 'antd';
import { useAccess, Access } from 'umi';
import { vendorContractFindById } from '@/services/pages/contract';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import ShowFileList from '@/components/PubShowFiles/ShowFileList'; // 文件显示
import { pubDownLoad, pubPdfBlobDownLoad } from '@/utils/pubConfirm';

const DetailModal: React.FC<{ id: string; dicList: any }> = ({ id, dicList }: any) => {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const access = useAccess();
  // 获取详情数据
  const getDetail = async (cid: any): Promise<any> => {
    setLoading(true);
    const res = await vendorContractFindById({ id: cid });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    const newData = JSON.parse(JSON.stringify(res.data));
    newData.time = [newData.begin_time, newData.end_time];
    newData.associate_purchase_framework = newData.associate_purchase_framework + '';
    setDetail(newData);
    setLoading(false);
  };
  // 下载
  const downLoad: any = (row: any, isView?: boolean) => {
    if (!row.download_url) return pubMsg('当前合同无合同文件！');
    if (isView) {
      pubDownLoad(row?.view_url || row.download_url, row.name, true);
    } else {
      if (row.download_url.indexOf('aliyuncs.com') > -1) {
        window
          .fetch(row.download_url)
          .then((res) => {
            return res?.blob();
          })
          .then((res) => pubPdfBlobDownLoad(res, `${row.name}(${row.vendor_name})`));
      } else {
        pubDownLoad(row.download_url, row.name);
      }
    }
  };
  return (
    <ModalForm<any>
      title={detail.type == '1' ? '自定义合同查看' : '模板合同查看'}
      trigger={<a>查看</a>}
      submitter={false}
      width={800}
      labelAlign="right"
      labelCol={{ flex: '130px' }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
      }}
      onVisibleChange={async (visible: boolean) => {
        if (visible) {
          getDetail(id);
        }
      }}
    >
      <Spin spinning={loading}>
        <Row gutter={10} className="light-form-item-row">
          <Col span={24}>
            <Form.Item label="合同名称">{detail?.name}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="供应商(乙方)">{detail?.vendor_name}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="签约主体(甲方)">{detail?.subject_name}</Form.Item>
          </Col>
        </Row>
        {detail.type == '1' ? (
          <Row gutter={10} className="light-form-item-row">
            <Col span={12}>
              <Form.Item label="合同金额">{detail?.amount}</Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="违约责任金额">{detail?.breach_liability_amount}</Form.Item>
            </Col>
          </Row>
        ) : (
          ''
        )}

        <Row gutter={10} className="light-form-item-row">
          <Col span={12}>
            <Form.Item label="合同开始日期">{detail?.begin_time}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="合同结束日期">{detail?.end_time}</Form.Item>
          </Col>
          {detail.type == '1' ? (
            <Col span={12}>
              <Form.Item label="是否关联框架合同">
                {pubFilter(dicList.SC_YES_NO, detail?.associate_purchase_framework)}
              </Form.Item>
            </Col>
          ) : (
            ''
          )}
          {detail.name_id == 1 && detail.business_scope == 'IN' ? (
            <Col span={12}>
              <Form.Item label="甲方承担退货率">{detail?.return_rate}%</Form.Item>
            </Col>
          ) : (
            ''
          )}
          <Col span={12}>
            <Access key="down" accessible={access.canSee('contract_download')}>
              <Form.Item label="合同文件">
                {detail.download_url ? (
                  <a
                    onClick={() => {
                      downLoad(detail);
                    }}
                  >
                    下载合同({detail?.code})
                  </a>
                ) : (
                  <ShowFileList data={detail?.sys_files || []} />
                )}
              </Form.Item>
            </Access>
          </Col>
        </Row>
      </Spin>
    </ModalForm>
  );
};
export default DetailModal;
