import { useState, useRef } from 'react';
import { Modal, Form, Row, Col, Spin } from 'antd';
import { connect } from 'umi';
import moment from 'moment';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, {
  ProFormText,
  ProFormSelect,
  ProFormRadio,
  ProFormTextArea,
  ProFormDatePicker,
  ProFormCascader,
  ProFormDateTimePicker,
} from '@ant-design/pro-form';
import { insert, getDefaultContacts } from '@/services/pages/businessOut';
import { pubConfig, pubMsg, pubAlert } from '@/utils/pubConfig';
import { pubGetUserList, pubGetVendorList } from '@/utils/pubConfirm';
import PubDingDept from '@/components/PubForm/PubDingDept';

const Dialog = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    isModalVisible: false, // 弹窗显示
    dialogForm: {
      // 弹窗表单
      applicant_name: '', //申请人名称
      applicant_id: '', //申请人ID
      purpose: '', //出差目的
      remark: '', //出差备注
      vendor_id: '', //供应商ID
      travelRecordsTrip: {
        visit_time: null, //计划拜访时间
        peopleList: [], //同行人 前端用
        travelPeopleList: [], //同行人集合
        transportation: '', //交通方式(字典：SC_TRANSPORTATION)
        departure_provinces: '', //出发省份code
        departure_city: '', //出发城市code
        destination_provinces: '', //目的省份code
        destination_city: '', //目的城市code
        departure_time: null, //出发时间
        return_time: null, //返回时间

        need_reserve_ticket: '', //是否需要预定车票(0:否,1:是)
        need_reserve_hotel: '', //是否需要预定酒店(0:否,1:是)
        transit_city: '', //中转城市
        time_long: 0, // 出差时长 前端用
        time_day: 0, // 出差天数 前端用
      },
    },
  });
  const [defaultContacts, setDefaultContacts] = useState<any>({}); // 拜访人姓名电话
  const formRef = useRef<ProFormInstance>();
  const { common } = props;
  const format = 'YYYY-MM-DD HH:mm';
  props.addModel.current = {
    open: () => {
      setState((pre: any) => {
        return {
          ...pre,
          isModalVisible: true,
        };
      });
    },
  };
  const modalOk = () => {
    formRef?.current?.submit();
  };
  // 取消+关闭
  const modalClose = (val: any) => {
    setState((pre: any) => {
      return {
        ...pre,
        isModalVisible: false,
      };
    });
    setDefaultContacts({});
    if (!val) props.handleClose(true);
  };
  // 改变出发时间和返程时间
  const changeTime = () => {
    const data: any = state.dialogForm;
    const fromTime = formRef.current?.getFieldValue(['travelRecordsTrip', 'departure_time']);
    const endTime = formRef.current?.getFieldValue(['travelRecordsTrip', 'return_time']);
    const fromNum = Date.parse(moment(fromTime).format(format));
    const endNum = Date.parse(moment(endTime).format(format));

    if (fromTime && endTime && fromTime > endTime) {
      data.travelRecordsTrip.time_day = 0;
      data.travelRecordsTrip.time_long = 0;
      setState((pre: any) => {
        return {
          ...pre,
          dialogForm: data,
        };
      });
      return pubMsg('返程时间请大于出发时间');
    } else {
      data.travelRecordsTrip.time_day = 0;
      data.travelRecordsTrip.time_long = 0;
    }
    if (fromTime && endTime) {
      const day = ((endNum - fromNum) / (1000 * 60 * 60 * 24)).toFixed(2); // 时间戳相减，然后除以天数 四舍五入
      const hour = ((endNum - fromNum) / (1000 * 60 * 60)).toFixed(2); // 时间戳相减，然后除以天数 四舍五入
      data.travelRecordsTrip.time_day = day;
      data.travelRecordsTrip.time_long = hour;
      setState((pre: any) => {
        return {
          ...pre,
          dialogForm: data,
        };
      });
    }
  };
  // 改变 出差申请人
  const changeApplicant = (id: any, data: any) => {
    formRef.current?.setFieldsValue({ applicant_name: data.name });
  };
  // 改变 供应商
  const changeVendor = async (id: any, data: any) => {
    console.log(data);
    setLoading(true);
    const res = await getDefaultContacts({ vendor_id: id });
    if (res?.code != pubConfig.sCode) {
      pubMsg(res?.message);
    } else {
      setDefaultContacts(res.data ? res.data : {});
    }
    setLoading(false);
  };

  // 改变 同行人
  const changePeople = (data: any) => {
    const newArry = data.map((v: any) => {
      return {
        people_id: v.value,
        people_name: v.name,
      };
    });
    formRef.current?.setFieldsValue({
      travelRecordsTrip: {
        travelPeopleList: newArry,
      },
    });
  };

  // 提交
  const saveSubmit = async (val: any) => {
    val.travelRecordsTrip.departure_provinces = val.travelRecordsTrip.from[0];
    val.travelRecordsTrip.departure_city = val.travelRecordsTrip.from[1];
    val.travelRecordsTrip.destination_provinces = val.travelRecordsTrip.to[0];
    val.travelRecordsTrip.destination_city = val.travelRecordsTrip.to[1];

    const fromNum = Date.parse(moment(val.travelRecordsTrip.departure_time).format(format));
    const endNum = Date.parse(moment(val.travelRecordsTrip.return_time).format(format));
    if (
      val.travelRecordsTrip.departure_time &&
      val.travelRecordsTrip.return_time &&
      fromNum > endNum
    )
      return pubMsg('返程时间请大于出发时间');
    console.log(val);

    val.travelRecordsTrip.departure_time = moment(val.travelRecordsTrip.departure_time).format(
      'YYYY-MM-DD HH:mm:ss',
    );
    val.travelRecordsTrip.return_time = moment(val.travelRecordsTrip.return_time).format(
      'YYYY-MM-DD HH:mm:ss',
    );
    if (val.travelRecordsTrip.peopleList.indexOf(val.applicant_id) > -1)
      return pubAlert('出差申请人和同行人不能重复!');

    PubDingDept(
      async (dId: any) => {
        setLoading(true);
        const res = await insert(val, dId);
        if (res?.code != pubConfig.sCode) {
          pubMsg(res?.message);
        } else {
          modalClose(false);
        }
        setLoading(false);
      },
      (err: any) => {
        console.log(err);
      },
    );
  };
  return (
    <Modal
      width={900}
      title="新增出差申请"
      visible={state.isModalVisible}
      onOk={modalOk}
      onCancel={modalClose}
      destroyOnClose
      maskClosable={false}
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={async (values) => {
            saveSubmit(values);
          }}
          labelAlign="right"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          submitter={false}
          initialValues={state.dialogForm}
          layout="horizontal"
        >
          <Row>
            <Col span={24}>
              <ProFormSelect
                name="applicant_id"
                label="出差申请人"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 8 }}
                rules={[{ required: true, message: '请选择出差申请人' }]}
                showSearch
                debounceTime={300}
                fieldProps={{
                  filterOption: (input: any, option: any) => {
                    const trimInput = input.replace(/^\s+|\s+$/g, '');
                    if (trimInput) {
                      return option.label.indexOf(trimInput) >= 0;
                    } else {
                      return true;
                    }
                  },
                  onChange: (id, data) => {
                    changeApplicant(id, data);
                  },
                }}
                request={async (v) => {
                  const res: any = await pubGetUserList(v);
                  return res;
                }}
              />
              <ProFormText name="applicant_name" label="员工姓名" hidden />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="vendor_id"
                label="供应商"
                rules={[{ required: true, message: '请选择供应商' }]}
                showSearch
                debounceTime={300}
                fieldProps={{
                  filterOption: (input: any, option: any) => {
                    const trimInput = input.replace(/^\s+|\s+$/g, '');
                    if (trimInput) {
                      return option.label.indexOf(trimInput) >= 0;
                    } else {
                      return true;
                    }
                  },
                  onChange: (id, data) => {
                    changeVendor(id, data);
                  },
                }}
                request={async (v) => {
                  const res: any = await pubGetVendorList(v);
                  return res;
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="vendor_info"
                label="拜访人姓名电话"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 10 }}
              >
                <span style={{ marginRight: '15px' }}>{defaultContacts.name}</span>
                <span>{defaultContacts.telephone}</span>
              </ProFormText>
            </Col>
            <Col span={24}>
              <ProFormSelect
                mode="multiple"
                name={['travelRecordsTrip', 'peopleList']}
                label="同行人"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 20 }}
                request={async (v) => {
                  const res: any = await pubGetUserList(v);
                  return res;
                }}
                fieldProps={{
                  onChange: (_, data) => {
                    changePeople(data);
                  },
                }}
              />
              <ProFormText name={['travelRecordsTrip', 'travelPeopleList']} label="同行人" hidden />
            </Col>
            <Col span={12}>
              <ProFormDatePicker
                name={['travelRecordsTrip', 'visit_time']}
                label="计划拜访时间"
                rules={[{ required: true, message: '请选择计划拜访时间' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name={['travelRecordsTrip', 'transportation']}
                label="交通工具"
                rules={[{ required: true, message: '请选择交通工具' }]}
                valueEnum={common.dicList.SC_TRANSPORTATION}
              />
            </Col>
            <Col span={12}>
              <ProFormCascader
                name={['travelRecordsTrip', 'from']}
                label="出发城市"
                placeholder="请选择出发城市"
                rules={[{ required: true, message: '请选择出发城市' }]}
                fieldProps={{
                  options: common.cityData2,
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormCascader
                name={['travelRecordsTrip', 'to']}
                label="目的城市"
                placeholder="请选择目的城市"
                rules={[{ required: true, message: '请选择目的城市' }]}
                fieldProps={{
                  options: common.cityData2,
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormDateTimePicker
                name={['travelRecordsTrip', 'departure_time']}
                label="出发时间"
                rules={[{ required: true, message: '请选择出发时间' }]}
                fieldProps={{
                  format: format,
                  onChange: () => {
                    changeTime();
                  },
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormDateTimePicker
                name={['travelRecordsTrip', 'return_time']}
                label="返程时间"
                rules={[{ required: true, message: '请选择返程时间' }]}
                fieldProps={{
                  format: format,
                  onChange: () => {
                    changeTime();
                  },
                }}
              />
            </Col>
            <Col span={12}>
              <Form.Item label="出差时长">
                {state.dialogForm.travelRecordsTrip.time_long}小时
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="出差天数">
                {state.dialogForm.travelRecordsTrip.time_day}天
              </Form.Item>
            </Col>
            <Col span={12}>
              <ProFormRadio.Group
                name={['travelRecordsTrip', 'need_reserve_ticket']}
                label="需要预定车票"
                radioType="button"
                placeholder="请选择是否需要预定车票"
                rules={[{ required: true, message: '请选择是否需要预定车票' }]}
                valueEnum={common.dicList.SC_YES_NO}
              />
            </Col>
            <Col span={12}>
              <ProFormRadio.Group
                name={['travelRecordsTrip', 'need_reserve_hotel']}
                label="需要预定酒店"
                radioType="button"
                placeholder="请选择是否需要预定酒店"
                rules={[{ required: true, message: '请选择是否需要预定酒店' }]}
                valueEnum={common.dicList.SC_YES_NO}
              />
            </Col>
            <Col span={12}>
              <ProFormTextArea name="remark" label="出差备注" placeholder="请输入出差备注" />
            </Col>
            <Col span={12}>
              <ProFormTextArea
                name={['travelRecordsTrip', 'transit_city']}
                label="中转城市"
                placeholder="必填，没有填无"
                rules={[{ required: true, message: '请输入中转城市' }]}
              />
            </Col>
            <Col span={24}>
              <ProFormTextArea
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 18 }}
                name="purpose"
                label="出差目的"
                placeholder="请输入出差目的"
                rules={[{ required: true, message: '请输入出差目的' }]}
              />
            </Col>
          </Row>
        </ProForm>
      </Spin>
    </Modal>
  );
};

export default connect(({ common }: { common: Record<string, unknown> }) => ({
  common,
}))(Dialog);
