import type { FC } from 'react';
import React, { useEffect, useState, useRef } from 'react';
import { Button, Card, Tag, Space, InputNumber, Input, Form, Modal, Spin } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { connect, history, useAccess } from 'umi';
import { pubConfig, pubMsg, pubModal, pubMessage, pubFilter, pubAlert } from '@/utils/pubConfig';
import {
  stockUpAdviceFindById,
  stockUpAdviceCalcAndSave,
  exportDetailExcel,
  reCalc,
  stockUpAdviceApprovePass,
  stockUpAdviceSubmit,
  stockUpAdviceNext,
} from '@/services/pages/stockUpIn/stockUp/suggestList';
import { ArrowLeftOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { pubBlobDownLoad, printFn } from '@/utils/pubConfirm';
import './style.less';
import PendingEcharts from './components/PendingEcharts';
import PendingInfo from './components/PendingInfo';
import ApproveLog from './components/ApproveLog';
import AddPlan from './components/AddPlan';
import PubWeekRender from '@/components/PubWeekRender';
import ModalCalDetail from './components/ModalCalDetail';
import SendGoodsNum from './components/SendGoodsNum';
import AdviceShipMentDetail from './components/AdviceShipMentDetail';
import { cloneDeep } from 'lodash';
import { NumberValue } from '@/utils/filter';
import BatchEdit from './components/BatchEdit';
import AduitNo from './Dialog/AduitNo';
import CancelPlan from './Dialog/CancelPlan';

// version 当前版本 0是第一版 有历史数据  1是2023-05版本[IN备货v1.4]
// latest_version 最后版本

const Page: FC<Record<string, any>> = (props) => {
  const pageReadonly = history?.location?.query?.readonly == 'true';
  const [readonly, readonlySet] = useState(true);
  const [id, idSet] = useState('');
  const code = history?.location?.query?.code;
  const [loading, setLoading] = useState(false);
  const [downLoading, setDownLoading] = useState(false);
  const [allData, setAllData] = useState<any>({
    detail: {},
    editableData: [],
    allData: [],
  });
  const [columns, setColumns] = useState<any[]>([]);
  const [show, setShow] = useState({
    infoShow: false,
    statisticsShow: false,
    approveLogShow: false,
  });
  const [firstWeekSale, firstWeekSaleSet] = useState<any>(null);
  const access = useAccess();
  // 添加弹窗实例
  const addPlanModel = useRef();
  const aduitNoModel = useRef();
  const cancelPlanModel = useRef(); // 作废计划

  const editorFormRef = useRef<any>();
  const types = (data: any) => [
    {
      name: '淡旺季系数',
      key: 'season_sale_ratio',
      version: [0, 1]
    },
    {
      name: '系统预测销量',
      key: 'sell_forecast_radio',
      version: [0, 1]
    },
    {
      name: 'PMC预测总销售量',
      key: 'total_pmc_sell_forecast',
      version: [0, 1]
    },
    {
      name: 'PMC预测销量',
      key: 'sell_forecast_artificial',
      editable: true,
      version: [0, 1]
    },
    {
      name: 'PMC预测活动销量',
      key: 'sell_forecast_activity',
      editable: true,
      version: [0, 1]
    },
    {
      name: '系统建议采购数量',
      key: 'advice_purchase_num',
      version: [0, 1]
    },
    {
      name: 'PMC申请采购数量',
      key: 'apply_purchase_num',
      editable: true,
      version: [0, 1]
    },
    {
      name: '可发货数量',
      key: 'available_shipment_num',
      version: [0, 1]
    },
    {
      name: data?.version == 0 ? '系统建议发货数量' : (
        <>
          <AdviceShipMentDetail
            trigger={(
              <>
                系统建议发货数量
                <a>({data?.defaultApplyShipment?.logistics_time})</a>
              </>
            )}
            detail={data}
          />
        </>
      ),
      key: 'advice_shipment_num',
      version: [0, 1]
    },
    {
      name: `PMC申请发货数量`,
      key: 'apply_shipment_normal',
      version: [1]
    },
    {
      name: `PMC申请发货数量(${data?.shipping_method?.indexOf('boat') > -1 ? '龙舟' : '货代'}-普船${data?.logistics_time_normal
        })`,
      key: 'apply_shipment_normal',
      version: [0]
    },
    {
      name: `PMC申请发货数量(${data?.shipping_method?.indexOf('boat') > -1 ? '龙舟' : '货代'}-快船${data?.logistics_time_quick
        })`,
      key: 'apply_shipment_quick',
      version: [0]
    },
    {
      name: '预计入库数量',
      key: 'expect_instock_num',
      version: [0, 1]
    },
    {
      name: '预计入库数量(调整)',
      key: 'expect_instock_adjust',
      editable: true,
      version: [0, 1]
    },
    {
      name: '期末库存',
      key: 'inventory_num',
      version: [0, 1]
    },
    {
      name: '期末结转',
      key: 'turnover_days',
      version: [0, 1]
    },
  ];
  // 数据转换
  const getNewData = (key: any, data: any) => {
    const newData: any = {};
    data.forEach((element: any) => {
      newData[`${element.id}`] = element[key] || 0;
    });
    return newData;
  };
  // 重置数据
  // const restBack = () => {
  //   editorFormRef?.current?.setFieldsValue({
  //     note: allData?.editableDataCopy,
  //   });
  //   pubMsg('重置成功', 'success');
  // };
  // 导出
  const downLoadTempAction = async () => {
    setDownLoading(true);
    const res = await exportDetailExcel({ id });
    setDownLoading(false);
    if (res) {
      pubBlobDownLoad(res, '备货建议');
    } else {
      pubMsg('服务异常, 导出失败了!');
    }
  };
  // 批量修改
  const batchSave = (data: any) => {
    // console.log(data)
    const note = editorFormRef?.current?.getFieldsValue()?.note;
    const index = note.findIndex((v: any) => v.typeKey == 'sell_forecast_artificial');
    const obj = note?.filter((v: any) => v.typeKey == 'sell_forecast_artificial')?.[0];
    delete obj.typeKey;
    Object.keys(obj).forEach((v: any, i: number) => {
      obj[v] = data[i] ?? obj[v];
    });
    note.splice(index, 1, { ...obj, typeKey: 'sell_forecast_artificial' });
    // console.log(editorFormRef?.current?.getFieldsValue());
    editorFormRef?.current?.setFieldsValue({
      note,
    });
  };

  // 第一周销量
  const checkFirstWeek = (value: any) => {
    // console.log(value)
    const newList = columns.filter((v: any, index: number) => index);
    // console.log(newList)
    const baseNum = value / newList[0].season_sale_ratio; // 填入的数字除以第一周的系数的结果
    console.log(baseNum)
    // console.log(baseNum)
    const growth_rate = allData?.detail?.growth_rate / 100; // 详情上的年度增长率
    const backList = newList.map((k) => {
      console.log(printFn(value / newList[0].season_sale_ratio * k.season_sale_ratio))
      return k.cycle_year_now
        ? Math.ceil(printFn(value / newList[0].season_sale_ratio * k.season_sale_ratio))
        : Math.ceil(printFn(value / newList[0].season_sale_ratio * k.season_sale_ratio * (1 + growth_rate)));
    });
    console.log(backList, '前端计算的结果')
    // checkFirstWeekSave({ hand_sales: value })
    batchSave(backList);
    pubMsg('设置成功', 'success');
  };
  const copyAction = () => {
    const note = editorFormRef?.current?.getFieldsValue()?.note;
    const obj = note?.filter((v: any) => v.typeKey == 'sell_forecast_artificial')?.[0];
    delete obj.typeKey;
    const areaValue = Object.values(obj).join('\t');
    // 1.创建一个input元素
    const input: any = document.createElement('textarea');
    // 2.将传入的值赋值给textarea
    input.value = areaValue;
    input.style.width = '0';
    input.style.height = '0';
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    pubMsg('复制成功', 'success');
  };

  // 作废备货建议
  const cancelRow = async (rowData: any, modalType: string) => {
    const data: any = aduitNoModel?.current;
    data.open(rowData, modalType,'fromDetail');
  };
  // 作废计划
  const cancelPlanOpen = (rowData: any) => {
    const data: any = cancelPlanModel?.current;
    data.open(rowData);
  };

  // 获取详情
  const getPageDetail = async () => {
    setLoading(true);
    const res = await stockUpAdviceFindById({ code });
    setLoading(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    // 把不是当前版本的字段隐藏掉
    const newTypes = types(res?.data).filter((v: any) => v.version.includes(res?.data?.version));
    const editList = newTypes.map((v: any) => {
      return {
        type: v.name,
        typeKey: v.key,
        editable: v.editable,
        ...getNewData(v.key, res.data.details),
      };
    });
    const newColumns = [
      {
        title: '时间',
        dataIndex: 'type',
        align: 'center',
        editable: false,
        width: 220,
        fixed: 'left',
      },
      ...res?.data?.details.map((v: any) => {
        return {
          title: () => (
            <PubWeekRender
              option={{
                cycle_time: v.cycle_time,
                begin: v.cycle_time_begin,
                end: v.cycle_time_end,
                color: true,
              }}
              onlyFirst={true}
            />
          ),
          cycle_time: v.cycle_time,
          cycle_year: v.cycle_time.split('-')[0],
          cycle_year_now:
            v.cycle_time.split('-')[0] == res?.data?.details[0].cycle_time.split('-')[0],
          season_sale_ratio: v.season_sale_ratio,
          expect_instock_tag: v.expect_instock_tag,
          available_shipment_tag: v.available_shipment_tag,
          apply_shipment_tag: v.apply_shipment_tag,
          dataIndex: `${v.id}`,
          align: 'right',
          valueType: 'digit',
          width: 80,
          applyShipments: v.applyShipments, // 小格子里的PMC申请发货数量 2023-05-11
        };
      }),
    ];
    idSet(res.data?.id);
    setColumns(newColumns);
    console.log(newColumns);
    console.log(editList);
    setAllData({
      detail: res?.data,
      editableData: editList,
      editableDataCopy: cloneDeep(editList),
    });

    const newReadonly = history?.location?.query?.readonly == 'true' || res?.data?.status != 'Pending';
    readonlySet(newReadonly);

    editorFormRef?.current?.setFieldsValue({
      note: editList,
    });
    if (!readonly) {
      // setEditableKeys(
      //   types(res?.data)
      //     .filter((k: any) => k.editable)
      //     .map((v: any) => v.key),
      // );
    }
    // 重置第一周销量输入
    firstWeekSaleSet(null);
  };
  // 重算
  const reCalcById = async () => {
    setLoading(true);
    pubMsg('提交中...', 'loading');
    const res = await reCalc({ code });
    setLoading(false);
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      getPageDetail();
    }
  };
  // 检查表单提交的数据有没有变化过
  const checkSaveData = async () => {
    // 取表格里指定的字段
    const keyList = [
      'sell_forecast_artificial',
      'sell_forecast_activity',
      'apply_purchase_num',
      'expect_instock_adjust',
    ]
    return new Promise((resolve) => {
      const copyD = JSON.parse(JSON.stringify(allData?.editableDataCopy));
      const oldData = copyD.filter((k: any) => keyList.includes(k.typeKey)).map((v: any) => {
        const back = v;
        for (const i in back) {
          back[i] = String(back[i])
        }
        delete back.type;
        delete back.typeKey;
        delete back.editable;
        return { ...back };
      })
      // console.log(oldData, 'oldData');

      const tableValue = editorFormRef?.current?.getFieldsValue();
      const nowData = tableValue.note.filter((k: any) => keyList.includes(k.typeKey)).map((v: any) => {
        const back = v;
        for (const i in back) {
          back[i] = String(back[i])
        }
        delete back.type;
        delete back.typeKey;
        delete back.editable;
        return { ...back };
      })
      // console.log(nowData, 'tableValue');
      const bb = JSON.stringify(oldData);
      const cc = JSON.stringify(nowData);
      resolve(bb != cc);
    })
  };

  // 下一个没有数据时的提示
  const showNextMessage = () => {
    pubAlert(`没有数据了，所有【${pubFilter(props?.common?.dicList.IN_STOCK_UP_ADVICE_STATUS, allData?.detail?.status)}】的备货建议已处理完成！`)
    getPageDetail()
  };
  // 下一个
  const goNext = async (type: string) => {
    if (!type) return;
    const res = await stockUpAdviceNext({
      cycle_time: allData?.detail?.cycle_time,
      status: (allData?.detail?.status == 'Executed' || allData?.detail?.status == 'Voided') ? ['Executed', 'Voided'] : [allData?.detail?.status],
    });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
      return;
    }
    const nextData = res?.data || [];
    // console.log(nextData)
    if (!nextData.length) {
      // 先进页面，然后取消掉数据权限，再点下一个的时候，接口得到的数据里，没有当前页面的code，而且有可能为空
      showNextMessage();
      return;
    }
    const spuIndex = nextData.findIndex((k: any) => k.link_management_id == allData?.detail?.link_management_id)
    // console.log(spuIndex, 'spuIndex');
    let newCode = ''
    if (spuIndex > -1) {
      // 如果是最后一个
      if ((type == 'SPU' && nextData.length == 1) || (type == 'SKU' && nextData.length == 1 && nextData[0].codes.length == 1)) {
        showNextMessage();
        return;
      }
      const skuIndex = nextData[spuIndex].codes.findIndex((k: any) => k == allData?.detail?.stock_up_advice_code)
      // console.log(skuIndex, 'skuIndex');
      if (type == 'SPU') {
        const num = ((spuIndex + 1) == nextData.length) ? 0 : (spuIndex + 1);
        // console.log(num, 'num');
        newCode = nextData[num].codes[0];
      }
      if (type == 'SKU') {
        if ((skuIndex + 1) == nextData[spuIndex].codes.length) {
          const spunum = ((spuIndex + 1) == nextData.length) ? 0 : (spuIndex + 1);
          console.log(spunum, 'spunum');
          newCode = nextData[spunum].codes[0];
        } else {
          newCode = nextData[spuIndex].codes[skuIndex + 1];
        }
      }
    } else {
      // 情况1：先进页面，然后取消掉数据权限，再点下一个的时候，接口得到的数据里，没有当前页面的code，所以直接跳返回结果的第一个
      // 情况2：先进页面，当前状态是待处理，然后在别的浏览器给操作了，当前状态已经不是待处理了，但是显示还是待处理，点下一个的时候，返回结果里，没有当前自己
      newCode = nextData[0].codes[0]
    }
    // console.log(newCode);
    history.push(
      `/stock-up-in/stockUp/suggest-detail?code=${newCode}&readonly=${history?.location?.query?.readonly == 'true'}`,
    );
  };

  // 操作成功，跳转下一个SKU
  const showMessageGoNext = () => {
    pubMessage('操作成功，自动跳转到下一个SKU', 'success');
    goNext('SKU')
  };
  // 提交
  const allSave = (type: any, params: any = {}, nextType: string = '') => {
    editorFormRef?.current
      ?.validateFields()
      .then(async () => {
        console.log(123);
        const tableValue = editorFormRef?.current?.getFieldsValue();
        console.log(tableValue, 'tableValue');
        const bb = [
          'sell_forecast_artificial',
          'sell_forecast_activity',
          'apply_purchase_num',
          'expect_instock_adjust',
        ];
        const tableNum = {};
        tableValue?.note.forEach((element: any) => {
          if (bb.includes(element.typeKey)) {
            tableNum[element.typeKey] = { ...element };
          }
        });
        console.log(tableNum, 'tableNum');
        console.log(allData?.detail.details, '123');
        const newSave = allData?.detail.details.map((item: any) => {
          const itemObj = {};
          for (const k in tableNum) {
            itemObj[k] = tableNum[k][item.id];
          }
          return {
            id: item.id,
            cycle_time: item.cycle_time,
            ...itemObj,
          };
        });
        console.log(newSave, 'newSave');
        pubMsg('提交中...', 'loading');
        setLoading(true);
        const res = await stockUpAdviceCalcAndSave({
          details: newSave,
          applyShipments: type == 'sendGoods' ? params : null,
          stock_up_advice_code: code,
        }, { code: code });
        setLoading(false);
        if (res?.code != pubConfig.sCode) {
          pubAlert(res?.message);
          return;
        }
        if (type == 'save' || type == 'sendGoods') {
          // 计算并保存
          getPageDetail();
        } else if (type == 'goNext') {
          // 点下一步前，数据有变化时，保存
          goNext(nextType)
        } else if (type == 'saveAndAdd') {
          // 预览计划
          const data: any = addPlanModel?.current;
          data.open(id);
        } else if (type == 'saveAndAudit') {
          // 提交审核
          setLoading(true);
          const resAudit = await stockUpAdviceSubmit({ code: [allData?.detail?.stock_up_advice_code] });
          setLoading(false);
          if (resAudit?.code != pubConfig.sCode) {
            pubMsg(resAudit?.message);
          } else {
            pubMessage('提交成功，自动跳转到下一个SKU', 'success');
            goNext('SKU')
          }
        }
      })
      .catch(() => {
        Modal.warning({
          title: '提示',
          content: '请检查表单信息正确性',
        });
      });
  };

  // 下一个的按钮
  const wellGoNext = async (type: string) => {
    if (allData?.detail?.status == 'Pending') {
      // 待处理才检查有没有改变
      const isChange = await checkSaveData();
      console.log(isChange, 'xx');
      if (isChange) {
        pubModal('当前数据已修改，是否先保存数据后在切换？').then(() => {
          allSave('goNext', {}, type)
        }).catch(() => {
          console.log('点击了取消')
        })
      } else {
        goNext(type)
      }
    } else {
      goNext(type)
    }
  };


  // 预览计划
  const showPlan = () => {
    // 预览计划时 如果是待处理，先触发保存再预览，如果是其他状态，直接预览
    if (allData?.detail?.status == 'Pending' && !pageReadonly) {
      allSave('saveAndAdd')
    } else {
      const data: any = addPlanModel?.current;
      data.open(id);
    }
  };

  // 修改申请发货数量后，先保存一次
  const sendGoodsNumBack = (data: any) => {
    allSave('sendGoods', data)
  };

  useEffect(() => {
    getPageDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history?.location?.query]);

  // 审批通过
  const autidOkOpen = async (rowData: any) => {
    pubModal(`确认选中的备货建议 审批通过?`)
      .then(async () => {
        setLoading(true);
        const res = await stockUpAdviceApprovePass({ code: rowData });
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          // pubMsg('操作成功', 'success');
          // getPageDetail();
          pubMessage('操作成功，自动跳转到下一个SKU', 'success');
          goNext('SKU')
        }
        setLoading(false);
      })
      .catch(() => {
        console.log('点了取消');
      });
  };
  // 提交
  const auditOk = () => {
    pubModal(`确认提交此备货建议?`)
      .then(async () => {
        allSave('saveAndAudit')
      })
      .catch(() => {
        console.log('点了取消');
      });
  };

  // 表格里的每一项
  const getTableItem = ({ v, index, k, kindex }: any) => {
    // 如果是第一列
    if (!kindex) {
      return (
        <>
          <Space>
            <span>{v[k.dataIndex]}</span>
            {v?.typeKey == 'sell_forecast_artificial' && (
              <a onClick={copyAction}>复制</a>
            )}
          </Space>
          <Form.Item
            hidden
            name={['note', index, 'typeKey']}
            initialValue={v.typeKey}
          >
            <Input hidden />
          </Form.Item>
        </>
      )
    }
    // 如果是不可编辑的格子
    if (!v.editable) {
      if ([
        'available_shipment_num',
        'expect_instock_num',
        'turnover_days',
        'advice_purchase_num',
        'advice_shipment_num',
        'inventory_num',
      ].includes(v?.typeKey)) {
        return (
          <ModalCalDetail
            trigger={
              <>
                <a>{NumberValue(v[k.dataIndex])}</a>
                {(v?.typeKey == 'expect_instock_num' &&
                  k?.expect_instock_tag == 1) ||
                  (v?.typeKey == 'available_shipment_num' &&
                    k?.available_shipment_tag == 1) ? (
                  <Tag
                    title={'【申请发货数量】推算出的'}
                    color={'cyan'}
                    style={{ marginLeft: 2 }}
                  >
                    申
                  </Tag>
                ) : null}
              </>
            }
            params={{
              id: allData?.detail?.id,
              cycle_time: k?.cycle_time,
              field: v?.typeKey,
            }}
          />
        )
      }
      if (['apply_shipment_normal'].includes(v?.typeKey) && allData?.detail?.version == 1) {
        // 旧版本只显示，没有操作
        return (
          <SendGoodsNum
            trigger={
              <>
                <a>{NumberValue(v[k.dataIndex])}</a>
                {(k?.apply_shipment_tag == 1) ? (
                  <Tag
                    title={'当前方式数量与默认方式不一致'}
                    color={'cyan'}
                    style={{ marginLeft: 2 }}
                  >
                    调
                  </Tag>
                ) : null}
              </>
            }
            id={k.dataIndex}
            back={sendGoodsNumBack}
            readonly={allData?.detail.status != 'Pending' || readonly}
            row={k}
          />
        )
      }
      return NumberValue(v[k.dataIndex])
    }
    // 如果是能编辑的格子
    if (v.editable) {
      return readonly ? v[k.dataIndex] : (
        <Form.Item
          name={['note', index, k.dataIndex]}
          initialValue={v[k.dataIndex]}
          rules={[
            { required: true, message: '' },
            {
              validator: (_: any, value: any) => {
                if (value >= 0) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('输入数字且不能小于0'));
              },
            },
            {
              validator: (a: any, value: any) => {
                if (
                  [
                    'apply_purchase_num',
                  ].indexOf(v?.typeKey) > -1
                ) {
                  if (value >= 0 && value % allData?.detail?.box_num) {
                    return Promise.reject(
                      new Error(
                        `非整箱, 请输入装箱数量:${allData?.detail?.box_num}的整数倍`,
                      ),
                    );
                  }
                  return Promise.resolve();
                } else {
                  return Promise.resolve();
                }
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
      )
    }
    return '';
  };

  // 自定义弹窗按钮
  const footerList = [
    <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => {
      history.push(
        `/stock-up-in/stockUp/suggestList`,
      );
    }}>
      返回
    </Button>,
    <Button
      key="nextSku"
      onClick={() => wellGoNext('SKU')}
    >
      下一个SKU
    </Button>,
    <Button
      key="nextSpu"
      onClick={() => wellGoNext('SPU')}
    >
      下一个SPU
    </Button>
  ];
  if (allData?.detail.status == 'Pending' && !pageReadonly) {
    footerList.push(
      <Button
        disabled={loading}
        key="reCalc"
        type="primary"
        ghost
        onClick={() => reCalcById()}
      >
        重算
      </Button>
    );
    if (access.canSee('suggestList_cancel')) {
      footerList.push(
        <Button
          disabled={loading}
          key="suggestList_cancel"
          type="primary"
          ghost
          onClick={() => {
            cancelRow([allData?.detail?.stock_up_advice_code], 'ZF');
          }}
        >
          作废建议
        </Button>
      );
    }
    footerList.push(
      <Button
        key="checkSave"
        type="primary"
        disabled={loading}
        ghost
        onClick={() => allSave('save')}
      >
        计算并保存
      </Button>,
      <Button
        key="savetoAudit"
        type="primary"
        disabled={loading}
        onClick={() => auditOk()}
      >
        提交
      </Button>,
    );
  }
  if (allData?.detail.status == 'Wait_Approval') {
    if (access.canSee('scm_suggestList_return')) {
      footerList.push(
        <Button
          disabled={loading}
          key="audit_ch"
          type="primary"
          onClick={() => {
            cancelRow([allData?.detail?.stock_up_advice_code], 'CH');
          }}
        >
          撤回
        </Button>
      );
    }
    if (access.canSee('scm_suggestList_autidOk')) {
      footerList.push(
        <Button
          disabled={loading}
          key="audit_OK"
          type="primary"
          onClick={() => {
            autidOkOpen([allData?.detail?.stock_up_advice_code]);
          }}
        >
          通过
        </Button>
      );
    }
    if (access.canSee('scm_suggestList_autidNo')) {
      footerList.push(
        <Button
          key="audit_NO"
          type="primary"
          disabled={loading}
          onClick={() => {
            cancelRow([allData?.detail?.stock_up_advice_code], 'TH');
          }}
        >
          退回
        </Button>
      );
    }
  }
  footerList.push(
    <Button
      key="showPlan"
      type="primary"
      ghost
      disabled={loading}
      onClick={() => showPlan()}
    >
      预览计划
    </Button>
  );
  if ((allData?.detail.status == 'Executed' || allData?.detail.status == 'Voided') && [1].includes(allData?.detail?.version) && access.canSee('scm_suggestList_cancelPlan')) {
    footerList.push(
      <Button
        key="cancelPlan"
        type="primary"
        disabled={loading}
        onClick={() => {
          cancelPlanOpen([allData?.detail.stock_up_advice_code]);
        }}
      >
        作废计划
      </Button>
    );
  }
  return (
    <PageContainer
      style={{ minWidth: '888px' }}
      header={{
        title: false,
        breadcrumb: {},
      }}
      footer={footerList}
    >
      <Card bordered={false} title={false}>
        <PendingEcharts id={id} sku={allData?.detail?.shop_sku} detail={allData?.detail} />
      </Card>
      <Card
        bordered={false}
        title={
          <Space size={20} align="start" wrap>
            <div>No.: {allData?.detail?.stock_up_advice_code}</div>
            <div>SKU: {allData?.detail?.shop_sku}/{allData?.detail?.sku_name}/{pubFilter(props?.common?.dicList.LINK_MANAGEMENT_SALES_STATUS, allData?.detail?.sales_status)}</div>
            {readonly ? null : (
              <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  第一周销量:
                  <Input.Group compact style={{ marginLeft: 4 }}>
                    <InputNumber
                      step={100}
                      onPressEnter={() => {
                        if (firstWeekSale) {
                          checkFirstWeek(firstWeekSale);
                        }
                      }}
                      min={0}
                      max={999999999}
                      precision={0}
                      controls={false}
                      value={firstWeekSale}
                      onBlur={(e) => {
                        firstWeekSaleSet(e?.target?.value ? Number(e.target.value) : 0);
                      }}
                    />
                    <Button
                      loading={loading}
                      onClick={() => {
                        if (firstWeekSale) {
                          checkFirstWeek(firstWeekSale);
                        } else {
                          pubMsg('请输入第一周销量', 'warning');
                        }
                      }}
                      type="primary"
                    >
                      提交
                    </Button>
                  </Input.Group>
                </div>
                <BatchEdit batchSave={batchSave} columns={columns} />
              </>
            )}
          </Space>
        }
        extra={
          readonly ? (
            ''
          ) : (
            <Button
              loading={downLoading}
              disabled={downLoading}
              type="primary"
              onClick={downLoadTempAction}
            >
              {downLoading ? '导出中' : '导出'}
            </Button>
          )
        }
        style={{ marginTop: '15px' }}
      >
        {allData?.editableData ? (
          <Spin spinning={loading}>
            <Form ref={editorFormRef}>
              <div className="edit-num-nav" key={Date.now()}>
                <table
                  className="edit-num-table"
                  style={{ width: columns.length * 80 + 220 + 'px' }}
                >
                  <thead>
                    <tr>
                      {columns.map((v, index) => {
                        return (
                          <th
                            key={v.dataIndex + 't'}
                            className={
                              index ? 'edit-num-table-th-right' : 'edit-num-table-th-first'
                            }
                          >
                            {!index ? v.title : v.title()}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {allData?.editableData.map((v: any, index: any) => {
                      // 需要变色的行
                      const blueColor = ['sell_forecast_artificial', 'sell_forecast_activity', 'apply_purchase_num', 'expect_instock_adjust', 'apply_shipment_normal'];
                      return (
                        <tr key={v.typeKey}
                          className={
                            !readonly && blueColor.includes(v.typeKey) ? 'td-bg-blue' : ''

                          }>
                          {columns.map((k, kindex) => {
                            return (
                              <td
                                key={k.dataIndex}
                                className={`
                                ${kindex ? 'edit-num-table-td-right' : 'edit-num-table-td-first'}
                                  ${v?.typeKey == 'turnover_days' && v[k.dataIndex] > 60
                                    ? 'edit-table-color1'
                                    : ''
                                  }
                                  ${v?.typeKey == 'turnover_days' && v[k.dataIndex] < 15
                                    ? 'edit-table-color2'
                                    : ''
                                  }`}
                              >
                                <div className={`tb-nav ${!readonly && blueColor.includes(v.typeKey) ? 'td-bg-blue' : ''
                                  }`}>
                                  {getTableItem({ v, index, k, kindex })}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Form>
          </Spin>
        ) : (
          ''
        )}
        <AddPlan
          dicList={props?.common?.dicList}
          addPlanModel={addPlanModel}
        />
      </Card>
      <Card
        bordered={false}
        title={'数量统计'}
        style={{ marginTop: '15px' }}
        extra={
          <a
            onClick={() => {
              setShow((v: any) => ({ ...v, statisticsShow: !show.statisticsShow }));
            }}
          >
            {show.statisticsShow ? (
              <>
                <DownOutlined />
                <span> 展开</span>
              </>
            ) : (
              <>
                <UpOutlined />
                <span> 收起</span>
              </>
            )}
          </a>
        }
        bodyStyle={{ display: show.statisticsShow ? 'none' : 'block' }}
      >
        <PendingInfo data={{ ...allData?.detail, id }} dicList={props?.common?.dicList} type="statistics" />
      </Card>
      <Card
        bordered={false}
        title={'产品信息'}
        style={{ marginTop: '15px' }}
        extra={
          <a
            onClick={() => {
              setShow((v: any) => ({ ...v, infoShow: !show.infoShow }));
            }}
          >
            {show.infoShow ? (
              <>
                <DownOutlined />
                <span> 展开</span>
              </>
            ) : (
              <>
                <UpOutlined />
                <span> 收起</span>
              </>
            )}
          </a>
        }
        bodyStyle={{ display: show.infoShow ? 'none' : 'block' }}
      >
        <PendingInfo data={{ ...allData?.detail, id }} dicList={props?.common?.dicList} type="info" />
      </Card>
      <Card
        bordered={false}
        title={'审批日志'}
        style={{ marginTop: '15px' }}
        extra={
          <a
            onClick={() => {
              setShow((v: any) => ({ ...v, approveLogShow: !show.approveLogShow }));
            }}
          >
            {show.approveLogShow ? (
              <>
                <DownOutlined />
                <span> 展开</span>
              </>
            ) : (
              <>
                <UpOutlined />
                <span> 收起</span>
              </>
            )}
          </a>
        }
        bodyStyle={{ display: show.approveLogShow ? 'none' : 'block' }}
      >
        <ApproveLog data={allData?.detail?.approveLogs} />
      </Card>

      <AduitNo aduitNoModel={aduitNoModel} reload={getPageDetail} goNext={showMessageGoNext} />
      <CancelPlan cancelPlanModel={cancelPlanModel} dicList={props?.common?.dicList} reload={getPageDetail} />
    </PageContainer>
  );
};
// 全局model注入
const ConnectPage: React.FC = connect(({ common }: any) => ({ common }))(Page);
export default ConnectPage;
