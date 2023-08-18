import {ModalForm, ProFormTextArea} from "@ant-design/pro-components";
import {pubConfig, pubFilter, pubMsg, pubRequiredRule} from "@/utils/pubConfig";
import {approve} from '@/services/pages/AmsManage/applyList'

const Approval: React.FC<{
  open: boolean,
  openSet: any,
  dicList: any;
  dataSource: any;
  refresh: any;
}> = ({open, openSet, dataSource, dicList, refresh = Function.prototype}) =>
  (<ModalForm open={open}
              modalProps={{destroyOnClose: true}}
              autoFocusFirstInput={false}
              title={pubFilter(dicList?.ams_apply_status, dataSource.status)}
              onVisibleChange={(val) => openSet(val)}
              onFinish={async (values) => {
                const res = await approve({...values, id: dataSource.id, status: dataSource.status})
                if (res?.code == pubConfig.sCodeOrder) {
                  pubMsg(res?.message || '操作成功!', 'success')
                  refresh()
                  return true
                } else {
                  pubMsg(res?.message)
                }
                return false
              }}
  >
    <ProFormTextArea label={'备注'}
                     name={'rejectContent'}
                     rules={[pubRequiredRule]}
                     initialValue={dataSource.status == 'checkagree' ? '初审同意' : dataSource.status == 'agree' ? '同意' : ''}
                     fieldProps={{maxLength: 500}}
    />
  </ModalForm>)
export default Approval
