import ShowFileList from '@/components/PubShowFiles/ShowFileList';
import { add } from '@/utils/pubConfirm';
import { Card, Form } from 'antd';
import moment from 'moment';
import '../index.less';

export default (props: any) => {
  const { data } = props;

  return (
    <Card
      title="物流时效"
      bordered={false}
      style={{ marginBottom: '15px' }}
      className="custom-top-table"
    >
      <table width={'100%'}>
        <tbody>
          <tr>
            <td align="right">最晚供应商出货时间 （货好时间）：</td>
            <td>
              <>
                {data?.warehouse_delivery_time
                  ? moment(data?.warehouse_delivery_time).format('YYYY/MM/DD')
                  : '-'}
              </>
            </td>
            <td align="right">实际出厂/发货/装柜时间：</td>
            <td>{data?.delivery_date ? moment(data?.delivery_date).format('YYYY/MM/DD') : '-'}</td>

            <td align="right">货好时间-装柜时间：</td>
            <td>
              {data?.warehouse_delivery_days || data?.warehouse_delivery_days == 0
                ? `${data?.warehouse_delivery_days} 天`
                : '-'}
            </td>
          </tr>
          <tr>
            <td align="right">预计开船时间ETD：</td>
            <td>{data?.etd_date ? moment(data?.etd_date).format('YYYY/MM/DD') : '-'}</td>
            <td align="right">实际开船时间ATD：</td>
            <td>{data?.atd_date ? moment(data?.atd_date).format('YYYY/MM/DD') : '-'}</td>
            <td align="right">发货-ATD：</td>
            <td>
              {data?.delivery_atd_days || data?.delivery_atd_days == 0
                ? `${data?.delivery_atd_days} 天`
                : '-'}
            </td>
          </tr>
          <tr>
            <td align="right">预计到港时间ETA：</td>
            <td>{data?.eta_date ? moment(data?.eta_date).format('YYYY/MM/DD') : '-'}</td>
            <td align="right">实际到港时间ATA：</td>
            <td>{data?.ata_date ? moment(data?.ata_date).format('YYYY/MM/DD') : '-'}</td>
            <td align="right">ATD-ATA：</td>
            <td>
              {data?.atd_ata_days || data?.atd_ata_days == 0 ? `${data?.atd_ata_days} 天` : '-'}
            </td>
          </tr>
          <tr>
            <td align="right">预计入仓时间：</td>
            <td>
              {data?.platform_appointment_time
                ? moment(data?.platform_appointment_time).format('YYYY/MM/DD')
                : '-'}
            </td>
            <td align="right">实际入仓时间：</td>
            <td>
              {data?.actual_warehouse_date
                ? moment(data?.actual_warehouse_date).format('YYYY/MM/DD')
                : '-'}
            </td>
            <td align="right">ATA-入仓：</td>
            <td>
              {data?.ata_warehouse_days || data?.ata_warehouse_days == 0
                ? `${data?.ata_warehouse_days} 天`
                : '-'}
            </td>
          </tr>
          <tr>
            <td align="right">
              <></>
            </td>
            <td>
              <></>
            </td>
            <td align="right">POD提供时间：</td>
            <td>{data?.pod_date ? moment(data?.pod_date).format('YYYY/MM/DD') : '-'}</td>
            <td align="right">
              <strong>发货至入仓总时效：</strong>
            </td>
            <td>
              {typeof data?.ata_warehouse_days != 'number' &&
              typeof data?.delivery_atd_days != 'number' &&
              typeof data?.atd_ata_days != 'number'
                ? '-'
                : `${add(
                    data?.ata_warehouse_days || 0,
                    add(data?.delivery_atd_days || 0, data?.atd_ata_days || 0),
                  )}天`}
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ float: 'left', fontSize: '14px', marginTop: '10px' }}>
        <Form.Item label="下载签收证明" labelCol={{ flex: '100px' }}>
          {data?.pod_files ? (
            <ShowFileList data={data?.pod_files || []} isShowDownLoad={true} />
          ) : (
            '-'
          )}
        </Form.Item>
      </div>
    </Card>
  );
};
