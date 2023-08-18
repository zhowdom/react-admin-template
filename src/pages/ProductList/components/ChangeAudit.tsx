import { Col, Form, Modal, Row } from 'antd';
import { ModalForm, ProFormTextArea, EditableProTable } from '@ant-design/pro-components';
import type { ProFormInstance, ProColumns } from '@ant-design/pro-components';
import { useMemo, useRef, useState } from 'react';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { getReviewDetail, confirmReviewResult } from '@/services/pages/productList';
import { pubConfig, pubFilter, pubMsg } from '@/utils/pubConfig';
import { flatData } from '@/utils/filter';
const skuList = {
  toM2SkuList: [],
  toMClearSkuList: [],
};
const ChangeAudit: React.FC<{
  title?: any;
  dicList: any;
  reload: any;
  business_scope: any;
  data: { goodsSkus: any[] };
}> = (props: any) => {
  const formRef: any = useRef<ProFormInstance>();
  const { dicList, data, business_scope } = props;
  const [lifeCycleEnum, lifeCycleEnumSet] = useState<any>(dicList?.GOODS_LIFE_CYCLE || {});
  const [editableKeysM2, editableKeysM2Set] = useState<React.Key[]>([]);
  const [originSalesList, originSalesListSet] = useState<React.Key[]>([]);
  const [optionList, optionListSet] = useState<any>({});
  // 上传结束后
  const handleUpload = async (sys_files: any) => {
    formRef.current?.setFieldsValue({ sys_files: sys_files });
  };

  const pubGetOptions = function (hased?: any) {
    //  b、如果款式生命周期选择的是测试期，则销售状态可选项为测试期、清仓期
    // c、如果款式生命周期选择的是稳定期，则销售状态可选项为测试期、清仓期、稳定期，且必须存在一项为稳定期
    // d、如果选择款式生命周期为清仓期，则销售状态只能选清仓期
    return new Promise(async (resolve) => {
      const list = JSON.parse(JSON.stringify(dicList?.LINK_MANAGEMENT_SALES_STATUS || {}));
      delete list?.[4];
      // 测试期
      if (hased == '1') {
        delete list?.[2];
        // 清仓期
      } else if (hased == '3') {
        delete list?.[1];
        delete list?.[2];
      }
      resolve(list);
    });
  };
  const columns: ProColumns<any>[] = useMemo(() => {
    // 单个生命周期变化
    const lifeCycleChange = async (val: any, entity: any) => {
      const bb = JSON.parse(JSON.stringify(optionList));
      bb[entity.id] = await pubGetOptions(val);
      optionListSet(bb);
      const linkManagementSkuList: any = formRef?.current?.getFieldValue('linkManagementSkuList');
      linkManagementSkuList.forEach((v: any) => {
        if (v.pId == entity.id) {
          const isSinglePlat =
            linkManagementSkuList?.filter((c: any) => c.pId == entity.id)?.length == 1;
          v.sales_status = isSinglePlat
            ? val
            : Object.keys(bb[entity.id]).includes(v.sales_status)
            ? v.sales_status
            : null;
        }
      });
      formRef?.current?.setFieldsValue({
        linkManagementSkuList,
      });
    };
    return [
      {
        title: '款式名称',
        dataIndex: 'sku_name',
        editable: false,
      },
      {
        title: '款式编码',
        dataIndex: 'sku_code',
        editable: false,
      },
      {
        title: '生命周期',
        dataIndex: 'life_cycle',
        valueType: 'select',
        align: 'center',
        width: 200,
        formItemProps: {
          rules: [{ required: true, message: '请选择生命周期' }],
        },
        valueEnum: (record: any) => {
          // 不可选的生命周期设置
          const life_cycle_origin = record.life_cycle1;
          const goodsLifeCycle = JSON.parse(JSON.stringify(dicList?.GOODS_LIFE_CYCLE));
          delete goodsLifeCycle?.[4];
          if (life_cycle_origin) {
            Object.keys(goodsLifeCycle).forEach((key) => {
              goodsLifeCycle[key] = {
                ...goodsLifeCycle[key],
                disabled: Number(key) < Number(life_cycle_origin),
              };
            });
          }

          return goodsLifeCycle;
        },
        fieldProps: (form: any, { entity }: any) => ({
          onChange: (val: any) => {
            lifeCycleChange(val, entity);
          },
        }),
      },
      {
        title: '产品定位',
        dataIndex: 'position',
        align: 'center',
        valueType: 'radio',
        valueEnum: dicList?.PROJECTS_GOODS_SKU_POSITION || {},
        width: 180,
      },
    ];
  }, [lifeCycleEnum, dicList, data]);
  return (
    <ModalForm
      title={'确认评审结果'}
      trigger={<a>确认评审结果</a>}
      labelAlign="right"
      labelCol={{ flex: '0 0 100px' }}
      layout="horizontal"
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        style: { top: 20 },
      }}
      request={async () => {
        const res = await getReviewDetail({ batch_no: data.batch_no, id: data.id });
        if (res?.code == pubConfig.sCode) {
          // 不可选生命周期设置
          const life_cycle = res?.data?.life_cycle ? String(res?.data?.life_cycle) : null;
          const lifeCycleDic = { ...dicList?.GOODS_LIFE_CYCLE };
          Object.keys(lifeCycleDic).forEach((key) => {
            lifeCycleDic[key] = {
              ...lifeCycleDic[key],
              disabled: Number(key) < Number(life_cycle || -1) || key == '4',
            };
          });
          lifeCycleEnumSet(lifeCycleDic);
          // 款式过滤掉已下架的
          const goodsSkus: any =
            res?.data?.goodsSkus?.filter((a: any) => a.sales_status != 4)?.map((item: any) => ({
              ...item,
              position: item.position + '',
              life_cycle1: item.life_cycle,
              pId: item.id,
               // 链接过滤掉已下架的
              linkManagementSkuList: item.linkManagementSkuList?.filter((a: any) => a.sales_status != 4)
            })) || [];
          const aa = {};
          goodsSkus.forEach(async (item: any) => {
            aa[item.id] = await pubGetOptions(item.life_cycle);
          });
          optionListSet(aa);
          let saleList = JSON.parse(JSON.stringify(goodsSkus))?.filter(
            (v: any) => v?.linkManagementSkuList?.length,
          );
          // 跨境 : 如果一个款式只有一个sku，则销售状态需要直接等于款式生命周期
          if (business_scope == 'IN') {
            saleList = saleList.map((v: any) => {
              return {
                ...v,
                linkManagementSkuList:
                  v?.linkManagementSkuList?.length == 1
                    ? v?.linkManagementSkuList?.map((c: any) => ({
                        ...c,
                        sales_status: v.life_cycle,
                      }))
                    : v.linkManagementSkuList,
              };
            });
            // 国内同一款式存在相同平台去重，随机取一个
          } else {
            saleList.forEach((v: any) => {
              const linkManagementSkuList = {};
              v.linkManagementSkuList.forEach((a: any) => {
                if (!linkManagementSkuList[a.name]) {
                  linkManagementSkuList[a.name] = a;
                }
              });
              v.linkManagementSkuList = Object.values(linkManagementSkuList);
              // 国内： 如果一个款式只在一个平台上有非已下架的链接，则销售状态需要直接等于款式生命周期
              if (v?.linkManagementSkuList?.length == 1) {
                v.linkManagementSkuList = [
                  { ...v.linkManagementSkuList?.[0], sales_status: v.life_cycle },
                ];
              }
            });
          }

          const dataFlat = flatData(saleList, 'linkManagementSkuList');
          originSalesListSet(dataFlat);
          editableKeysM2Set(dataFlat?.map((item: any) => item.id) || []);
          return {
            remarks: '',
            ...res?.data,
            goodsSkus: goodsSkus,
            linkManagementSkuList: dataFlat,
          };
        } else {
          pubMsg(res?.message);
        }
        return {};
      }}
      formRef={formRef}
      width={1200}
      onFinish={async (values: Record<string, any>) => {
        try {
            // 判断销售状态是否修改过，1修改过，0没有修改
        values?.linkManagementSkuList?.forEach((cur: any) => {
          const pre: any = originSalesList.filter((v: any) => v.id == cur.id)?.[0];
          if (cur.sales_status != pre.sales_status) {
            cur.sales_status_changed = 1;
          } else {
            cur.sales_status_changed = 0;
          }
        });
        values.goodsSkus.forEach((v: any) => {
          const cur = values?.linkManagementSkuList?.filter((c: any) => c.pId == v.id) || [];
          v.linkManagementSkuList = v?.linkManagementSkuList || []
          v?.linkManagementSkuList?.forEach((a: any) => {
            cur.forEach((c: any) => {
              if (a.id == c.id) {
                a.sales_status = c.sales_status;
                a.sales_status_changed = c.sales_status_changed;
              }
            });
          });
          // 相同平台随机展示一个修改后，未展示的销售状态应该与展示的一致同步修改
          if (business_scope == 'CN' && cur?.length) {
            // 数据数量不一致证明存在合并在售平台
            if (v?.linkManagementSkuList?.length != cur?.length) {
              cur?.forEach((d: any) => {
                v?.linkManagementSkuList?.forEach((e: any) => {
                  if (d.name == e.name) {
                    e.sales_status = d.sales_status;
                    e.sales_status_changed = d.sales_status_changed;
                  }
                });
              });
            }
          }
        });

        const postData = {
          id: data.id,
          batch_no: data.batch_no,
          remarks: values.remarks,
          sys_files: values.sys_files,
          goodsSkus: values.goodsSkus,
        };
        const res = await confirmReviewResult(postData);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
          return false;
        } else {
          pubMsg('提交成功!', 'success');
          if (props?.reload) props.reload();
          return true;
        }
        } catch(e) {
          console.log(e)
        }
      }}
      onFinishFailed={() => {
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      }}
      onVisibleChange={(val) => {
        if (!val) {
          skuList.toM2SkuList = [];
          skuList.toMClearSkuList = [];
        }
      }}
    >
      <Row>
        <Col span={12} className="item10">
          <Form.Item label="产品名">{data?.name_cn || '-'}</Form.Item>
        </Col>
        <Col span={12} className="item10">
          <Form.Item label="产品生命周期">
            {pubFilter(dicList?.GOODS_LIFE_CYCLE, data.life_cycle) || '-'}
          </Form.Item>
        </Col>
        <Col span={24} className="edit-table">
          <Form.Item label="生命周期" labelAlign="right" required>
            <EditableProTable
              name={'goodsSkus'}
              bordered
              rowKey={'pId'}
              size="small"
              recordCreatorProps={false}
              className="center-th"
              editable={{
                type: 'multiple',
                editableKeys: data?.goodsSkus?.map((v: any) => v.id),
              }}
              columns={columns}
            />
          </Form.Item>
        </Col>
        <Col span={24} className="edit-table">
          {editableKeysM2?.length ? (
            <Form.Item label="销售状态" labelAlign="right" required>
              <EditableProTable
                name={'linkManagementSkuList'}
                bordered
                rowKey={'id'}
                size="small"
                recordCreatorProps={false}
                className="center-th"
                editable={{
                  type: 'multiple',
                  editableKeys: editableKeysM2,
                }}
                columns={[
                  {
                    title: '款式编码',
                    dataIndex: 'sku_code',
                    editable: false,
                    onCell: ({ rowSpan1 }) => ({ rowSpan: rowSpan1 }),
                  },

                  {
                    title: '在售平台',
                    dataIndex: 'name',
                    editable: false,
                    hideInTable: business_scope == 'IN',
                  },
                  {
                    title: 'SKU',
                    dataIndex: 'shop_sku_code',
                    editable: false,
                    hideInTable: business_scope == 'CN',
                  },
                  {
                    title: '所属链接',
                    dataIndex: 'link_name',
                    editable: false,
                    hideInTable: business_scope == 'CN',
                  },

                  {
                    title: '销售状态',
                    dataIndex: 'sales_status',
                    valueType: 'select',
                    align: 'center',
                    formItemProps: {
                      rules: [{ required: true, message: '请选择' }],
                    },
                    valueEnum: (a) => {
                      return optionList[a.pId];
                    },
                  },
                ]}
              />
            </Form.Item>
          ) : (
            <></>
          )}
        </Col>
      </Row>
      <ProFormTextArea
        name="remarks"
        label="评审备注"
        placeholder="请输入评审备注"
        rules={[{ required: true, message: '请输入评审备注' }]}
      />
      <Form.Item label="附件" name="sys_files">
        <UploadFileList
          fileBack={handleUpload}
          businessType="VENDOR_COMMUNICATION_RECORD"
          listType="picture"
        />
      </Form.Item>
    </ModalForm>
  );
};
export default ChangeAudit;
