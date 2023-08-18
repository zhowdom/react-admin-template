import { Image, Space, Table } from 'antd';
import { priceValue } from '@/utils/filter';
import { pubConfig, pubMsg } from '@/utils/pubConfig';
import { authProcessAttachments } from '@/services/pages/askOrder';
export default (process_instance_id: any, user_id: string) => {
  const preStyle: any = {
    marginBottom: 0,
    fontFamily: 'Arial, Helvetica, sans-serif',
    whiteSpace: 'pre-wrap',
    fontSize: '12px',
    color: 'rgba(0, 0, 0, 0.85)',
  };
  // 下载钉盘文件
  const downloadFile = async (file_id: string, space_id: string, file_name: string,file_type: string) => {
    console.log(process_instance_id, 'process_instance_id');
    const res = await authProcessAttachments({
      process_instance_id,
      user_id,
      file_id,
      space_id,
      file_name,
      file_type
    });
    if (res.code == pubConfig.sCode) {
      if (res?.data?.body?.result?.downloadUri) {
        const a = document.createElement('a');
        a.href = res?.data?.body?.result?.downloadUri;
        // a.target = '_parent';
        a.download = file_name;
        (document.body || document.documentElement).appendChild(a);
        a.click();
        a.remove();
      } else {
        pubMsg('文件无url');
      }
    } else {
      pubMsg(`提交失败: ${res.message}`);
    }
  };
  // 渲染表格内组件
  const renderFormItemT = (item: any, isPrint?: any) => {
    // 多选
    if (item.componentType == 'DDMultiSelectField') {
      return <span className="f14">{item?.value?.join('; ')}</span>;
      // 多行
    } else if (item.componentType == 'TextareaField') {
      return (
        <pre className="f14" style={preStyle}>
          {item?.value}
        </pre>
      );
      // 金额
    } else if (item.componentType == 'MoneyField') {
      return isPrint ? (
        <>
          {item?.value || item?.value == '0' ? (
            <span>
              {priceValue(item?.value)} &nbsp;{`(${item.extendValue?.upper})`}
            </span>
          ) : (
            ''
          )}
        </>
      ) : item?.value || item?.value == '0' ? (
        <>
          <div>{priceValue(item?.value)}</div>
          <div style={{ color: '#999' }}>大写 &nbsp;&nbsp;{item.extendValue?.upper}</div>
        </>
      ) : (
        '-'
      );
      // 图片
    } else if (item.componentType == 'DDPhotoField') {
      return (
        <Space>
          {item?.value &&
            item?.value?.map((v: any) => <Image width={80} height={80} src={v} key={v} />)}
        </Space>
      );
      // 附件
    } else if (item.componentType == 'DDAttachment') {
      if (item?.value) {
        return isPrint ? (
          <>
            {item?.value &&
              item?.value?.map((v: any, i: number) => (
                <div key={v}>
                  <span
                    style={{
                      display: item?.value.length != 1 ? 'inline-block' : 'none',
                    }}
                  >
                    {i + 1}. &nbsp;
                  </span>
                  <span>{v.fileName}</span>
                </div>
              ))}
          </>
        ) : (
          <>
            {item?.value &&
              JSON.parse(item?.value)?.map((v: any) => (
                <a
                  key={v.fileId}
                  style={{ lineHeight: '24px', display: 'block' }}
                  onClick={() => {
                    downloadFile(v.fileId, v.spaceId, v.fileName,v.fileType);
                  }}
                >
                  {v.fileName}
                </a>
              ))}
          </>
        );
      } else {
        return '-';
      }
      // 签名
    } else if (item.componentType == 'SignatureField') {
      return (
        <Image
          rootClassName="Signature"
          width={'auto'}
          height={60}
          src={item?.value}
          preview={isPrint ? false : true}
        />
      );
    } else {
      return <span className="f14">{isPrint ? item?.value ?? '' : item?.value ?? '-'}</span>;
    }
  };
  // 渲染表格
  const renderTable = (value: any, isPrint: any) => {
    console.log(value, 'value');
    // 组装表格数据
    const columns: any = [];
    const dataSource: any = [];
    value.forEach((table: any, tableIndex: any) => {
      const dataSourceObj: any = {};
      // 渲染列
      table.rowValue.forEach((v: any) => {
        if (tableIndex == 0) {
          const comp = v.key.slice(0, v.key.indexOf('_'));
          const columnsObj = {
            dataIndex: v.key,
            title: comp == 'TextNote' ? '说明' : v.label,
            render: (_: any, record: any) => {
              const data = {
                value: record[v.key],
                componentType: comp,
                extValue: record?.extValue,
              };
              return renderFormItemT(data, isPrint);
            },
          };
          columns.push(columnsObj);
        }
        dataSourceObj[v.key] = v.value;
        dataSourceObj.extValue = v?.extValue;
      });
      dataSource.push(dataSourceObj);
    });
    return (
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        bordered
        scroll={isPrint ? undefined : { x: 500 }}
      />
    );
  };
  // 渲染通用表单
  const renderFormItem = (item: any, isPrint?: any) => {
    // 多选
    if (item.componentType == 'DDMultiSelectField') {
      return <span className="f14">{JSON.parse(item?.value)?.join('; ')}</span>;
      // 多行
    } else if (item.componentType == 'TextareaField') {
      return (
        <pre className="f14" style={preStyle}>
          {isPrint ? item?.value ?? '' : item?.value ?? '-'}
        </pre>
      );
      // 金额
    } else if (item.componentType == 'MoneyField') {
      return isPrint ? (
        <>
          {item?.value || item?.value == '0' ? (
            <span>
              {priceValue(item?.value)} &nbsp;{`(${JSON.parse(item?.extValue)?.upper})`}
            </span>
          ) : (
            ''
          )}
        </>
      ) : item?.value || item?.value == '0' ? (
        <>
          <div>{priceValue(item?.value)}</div>
          <div style={{ color: '#999' }}>大写 &nbsp;&nbsp;{JSON.parse(item?.extValue)?.upper}</div>
        </>
      ) : (
        '-'
      );
      // 图片
    } else if (item.componentType == 'DDPhotoField') {
      return isPrint ? (
        <>
          {item?.value &&
            JSON.parse(item?.value)?.map((v: any, i: number) => (
              <div key={v}>
                <span
                  style={{ display: JSON.parse(item?.value).length != 1 ? 'inline-block' : 'none' }}
                >
                  {i + 1}. &nbsp;
                </span>
                <span>图片地址： {v}</span>
                <div>图片内容在首页后展示</div>
              </div>
            ))}
        </>
      ) : (
        <Space>
          {item?.value &&
            JSON.parse(item?.value)?.map((v: any) => (
              <Image width={80} height={80} src={v} key={v} />
            ))}
        </Space>
      );
      // 附件
    } else if (item.componentType == 'DDAttachment') {
      if (item?.value) {
        return isPrint ? (
          <>
            {item?.value &&
              JSON.parse(item?.value)?.map((v: any, i: number) => (
                <div key={v}>
                  <span
                    style={{
                      display: JSON.parse(item?.value).length != 1 ? 'inline-block' : 'none',
                    }}
                  >
                    {i + 1}. &nbsp;
                  </span>
                  <span>{v.fileName}</span>
                </div>
              ))}
          </>
        ) : (
          <>
            {item?.value &&
              JSON.parse(item?.value)?.map((v: any) => (
                <a
                  key={v.fileId}
                  style={{ lineHeight: '24px', display: 'block' }}
                  onClick={() => {
                    downloadFile(v.fileId, v.spaceId, v.fileName,v.fileType);
                  }}
                >
                  {v.fileName}
                </a>
              ))}
          </>
        );
      } else {
        return isPrint ? '' : '-';
      }
      // 签名
    } else if (item.componentType == 'SignatureField') {
      return (
        <Image
          rootClassName="Signature"
          width={'auto'}
          height={60}
          src={item?.value}
          preview={isPrint ? false : true}
        />
      );
      // 表格
    } else if (item.componentType == 'TableField') {
      return renderTable(JSON.parse(item.value), isPrint);
    } else {
      return <span className="f14">{isPrint ? item?.value ?? '' : item?.value ?? '-'}</span>;
    }
  };
  return renderFormItem;
};
