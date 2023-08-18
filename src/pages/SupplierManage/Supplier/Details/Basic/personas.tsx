import ProCard from '@ant-design/pro-card';
import { Row, Col, Form } from 'antd';
import {
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormDependency,
  ProFormDigit,
} from '@ant-design/pro-form';
import UploadFileList from '@/components/PubUpload/UploadFileList';
import { history } from 'umi';
import { pubRequiredRule } from '@/utils/pubConfig';

const Personas = (props: any) => {
  const pathname = history.location.pathname;
  const showOther =
    pathname.indexOf('/edit-basic') != -1 || pathname.indexOf('/detail-basic') != -1;
  const handleUpload = (info: any) => {
    props?.formRef?.current?.setFieldsValue({
      portrait: {
        questionnaire_files: info,
      },
    });
  };
  const handleUploadQf = (info: any) => {
    props?.formRef?.current?.setFieldsValue({
      portrait: {
        media_files: info,
      },
    });
  };
  return (
    <ProCard headerBordered title="供应商画像数据">
      {props.formData && (
        <>
          <Row gutter={24}>
            <Col span={8}>
              <ProFormSelect
                readonly={props.disabled}
                name={['portrait', 'vendor_source']}
                label="现有客户群体"
                placeholder={props.disabled ? '--' : '现有客户群体'}
                valueEnum={props.dicList.VENDOR_CUSTOMER_SERVICE_GROUP}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                readonly={props.disabled}
                name={['portrait', 'have_shop']}
                label="是否有自主电商业务"
                valueEnum={props.dicList.VENDOR_E_COMMERCE_BUSINESS}
                placeholder={props.disabled ? '--' : '请选择自主电商业务'}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                valueEnum={props.dicList.VENDOR_IS_STOCK}
                readonly={props.disabled}
                name={['portrait', 'is_stock']}
                label="是否愿意备库存"
                placeholder={props.disabled ? '--' : '请选择备库存类型'}
              />
            </Col>
            {showOther && (
              <Col span={8}>
                <ProFormSelect
                  name={['portrait', 'free_shipping']}
                  label="是否包邮"
                  readonly={props.disabled}
                  valueEnum={props?.dicList?.SC_YES_NO}
                  placeholder={props.disabled ? '--' : '请选择是否包邮'}
                />
              </Col>
            )}

            <Col span={8}>
              <ProFormDependency name={['portrait', 'plant_area']}>
                {(value) => {
                  return props.disabled ? (
                    value?.portrait?.plant_area ? (
                      <Form.Item label="厂房面积"> {value?.portrait?.plant_area}平方</Form.Item>
                    ) : (
                      <Form.Item label="厂房面积">-</Form.Item>
                    )
                  ) : (
                    <ProFormDigit
                      rules={[pubRequiredRule]}
                      name={['portrait', 'plant_area']}
                      label="厂房面积"
                      disabled={props.disabled}
                      placeholder={props.disabled ? '--' : '请输入厂房面积'}
                      fieldProps={{ precision: 2, addonAfter: '平方' }}
                      min={0}
                    />
                  );
                }}
              </ProFormDependency>
            </Col>
            <Col span={8}>
              <ProFormSelect
                readonly={props.disabled}
                name={['portrait', 'factory_nature']}
                label="工厂性质"
                valueEnum={props.dicList.VENDOR_FACTORY_NATURE}
                placeholder={props.disabled ? '--' : '请选择工厂性质'}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name={['portrait', 'is_barcode']}
                label="是否自有条码"
                readonly={props.disabled}
                valueEnum={props.dicList.SC_YES_NO}
                placeholder={props.disabled ? '--' : '请选择是否自有条码'}
              />
            </Col>
            <Col span={8}>
              <ProFormText
                name={['portrait', 'origin_place']}
                label="产地"
                readonly={props.disabled}
                placeholder="请输入产地"
              />
            </Col>
            <Col span={8}>
              <ProFormDependency name={['portrait', 'annual_turnover']}>
                {(value) => {
                  return props.disabled ? (
                    value?.portrait?.annual_turnover ? (
                      <Form.Item label="年营业额"> {value?.portrait?.annual_turnover}</Form.Item>
                    ) : (
                      <Form.Item label="年营业额">-</Form.Item>
                    )
                  ) : (
                    <ProFormText
                      name={['portrait', 'annual_turnover']}
                      label="年营业额"
                      placeholder={props.disabled ? '--' : '请输入年营业额'}
                      disabled={props.disabled}
                    />
                  );
                }}
              </ProFormDependency>
            </Col>

            <Col span={8}>
              <ProFormText
                readonly={props.disabled}
                name={['portrait', 'peak_season']}
                label="生产旺季"
                placeholder="请输入生产旺季"
              />
            </Col>
            <Col span={8}>
              <ProFormText
                name={['portrait', 'off_season']}
                label="生产淡季"
                readonly={props.disabled}
                placeholder="请输入生产淡季"
              />
            </Col>
            <Col span={8}>
              <ProFormText
                readonly={props.disabled}
                name={['portrait', 'decision_maker']}
                label="公司决策人出身（业务/技术）"
                placeholder="请输入公司决策人出身"
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={16}>
              <ProFormText name={['portrait', 'id']} label="ID" hidden />
              <ProFormDependency name={[['portrait', 'worth']]}>
                {({ portrait }) => {
                  return props.disabled ? (
                    <Form.Item name={['portrait', 'worth']} label="引入供应商目的价值">
                      <pre>{portrait?.worth || '-'}</pre>
                    </Form.Item>
                  ) : (
                    <ProFormTextArea
                      name={['portrait', 'worth']}
                      fieldProps={{
                        autoSize: true,
                      }}
                      style={{ minHeight: '120px' }}
                      readonly={props.disabled}
                      label="引入供应商目的价值"
                      placeholder="价格，交期，品质配合等方面分析供应商价值"
                      rules={[
                        () => ({
                          validator(_, value) {
                            if (value?.length > 250) {
                              return Promise.reject(new Error('最多输入250字'));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    />
                  );
                }}
              </ProFormDependency>
            </Col>
            <Col span={16}>
              <ProFormDependency name={[['portrait', 'advantage']]}>
                {({ portrait }) => {
                  return props.disabled ? (
                    <Form.Item name={['portrait', 'advantage']} label="供应商优势">
                      <pre>{portrait?.advantage || '-'}</pre>
                    </Form.Item>
                  ) : (
                    <ProFormTextArea
                      fieldProps={{
                        autoSize: true,
                      }}
                      readonly={props.disabled}
                      placeholder="价格，交期，品质配合等方面分析供应商优势"
                      rules={[
                        () => ({
                          validator(_, value) {
                            if (value?.length > 400) {
                              return Promise.reject(new Error('最多输入400字'));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                      label="供应商优势"
                      name={['portrait', 'advantage']}
                    />
                  );
                }}
              </ProFormDependency>
            </Col>
            <Col span={16}>
              <ProFormDependency name={[['portrait', 'inferiority']]}>
                {({ portrait }) => {
                  return props.disabled ? (
                    <Form.Item name={['portrait', 'inferiority']} label="供应商劣势">
                      <pre>{portrait?.inferiority || '-'}</pre>
                    </Form.Item>
                  ) : (
                    <ProFormTextArea
                      fieldProps={{
                        autoSize: true,
                      }}
                      readonly={props.disabled}
                      rules={[
                        () => ({
                          validator(_, value) {
                            if (value?.length > 250) {
                              return Promise.reject(new Error('最多输入250字'));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                      label="供应商劣势"
                      placeholder={props.disabled ? '--' : '分析供应商劣势'}
                      name={['portrait', 'inferiority']}
                    />
                  );
                }}
              </ProFormDependency>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              {
                <Form.Item
                  label="资料调查表"
                  name={['portrait', 'questionnaire_files']}
                  valuePropName="questionnaire_files"
                  extra="只支持word,pdf,excel文件"
                >
                  <UploadFileList
                    disabled={props.disabled}
                    required={!props.disabled}
                    fileBack={handleUpload}
                    businessType="VENDOR_QUESTIONNAIRE"
                    listType="picture"
                    checkMain={false}
                    defaultFileList={props?.formData?.portrait?.questionnaire_files}
                    accept={['.docx,.doc,.pdf,.xls,.xlsx']}
                    acceptType={['docx', 'doc', 'pdf', 'xls', 'xlsx']}
                    maxSize="5"
                  />
                </Form.Item>
              }
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Form.Item
                label="供应商图片/视频"
                name={['portrait', 'media_files']}
                valuePropName="media_files"
                extra="支持.jpg,.jpeg,.png,.mp4格式,最多可以传20张图片，5个视频，图片最大20M,视频最大100M"
              >
                <UploadFileList
                  disabled={props.disabled}
                  fileBack={handleUploadQf}
                  businessType="VENDOR_MEDIA"
                  listType="picture"
                  fileData={{
                    pic: {
                      size: 20,
                      count: 20,
                    },
                    video: {
                      size: 100,
                      count: 5,
                    },
                  }}
                  checkMain={false}
                  defaultFileList={props?.formData?.portrait?.media_files}
                  accept={['.jpg,.jpeg,.png,.mp4,.mp3']}
                  acceptType={['jpg', 'jpeg', 'png', 'mp4', 'mp3']}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
    </ProCard>
  );
};
export default Personas;
