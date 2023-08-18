const data = {
  result: {
    attachedProcessInstanceIds: [],
    businessId: '202305091923000462950',
    title: '邬湘东提交的request_funds_template',
    originatorDeptId: '669210095',
    operationRecords: [
      {
        date: '2023-05-09T19:23Z',
        result: 'NONE',
        type: 'START_PROCESS_INSTANCE',
        userId: '020953100336487280',
      },
    ],
    id: 1,
    formComponentValues: [
      {
        componentType: 'TextField',
        name: '单行输入框',
        id: 'TextField-K2AD4O5B',
        value: '测试',
      },
      {
        componentType: 'TextareaField',
        name: '多行输入框',
        id: 'TextareaField_1ZO2L6YDY75S0',
        value: '1\n2\n3',
      },
      {
        componentType: 'NumberField',
        name: '数字输入框',
        id: 'NumberField_1ZHO6L2SGAO00',
        value: '1000',
      },
      {
        componentType: 'MoneyField',
        name: '金额（元）',
        id: 'MoneyField_198F0TWR01HC0',
        value: '1000',
        extValue: '{"upper":"壹仟元整","componentName":"MoneyField"}',
      },
      {
        componentType: 'DDSelectField',
        name: '单选框',
        id: 'DDSelectField_DUADVZGJ61S0',
        value: '选项1',
        extValue: '{"label":"选项1","key":"option_0"}',
      },
      {
        componentType: 'DDMultiSelectField',
        name: '多选框',
        id: 'DDMultiSelectField_5B568VC5CYC0',
        value: '["选项2","选项3"]',
        extValue:
          '[{"label":"选项2","value":"选项2","key":"option_1"},{"label":"选项3","value":"选项3","key":"option_2"}]',
      },
      {
        componentType: 'DDDateField',
        name: '日期',
        id: 'DDDateField_1SAHQF4GZ9XC0',
        value: '2023-05-09',
      },
      {
        componentType: 'TextNote',
        id: 'TextNote_1DOSGK447NZ40',
        value: '请输入说明文字',
      },
      {
        componentType: 'IdCardField',
        name: '身份证',
        id: 'IdCardField_1S8YHUA1T6RK0',
      },
      {
        componentType: 'InnerContactField',
        name: '联系人',
        id: 'InnerContactField_1M5WT4B63U680',
        value: '邬湘东',
        extValue:
          '[{"nick":"邬湘东","orgUserName":"邬湘东","emplId":"020953100336487280","corpId":"ding57b9dbff9aacabbc35c2f4657eb6378f","name":"邬湘东","avatar":"https://static.dingtalk.com/media/lADPBFRycImiizbNAljNA-g_1000_600.jpg"}]',
      },
      {
        componentType: 'PhoneField',
        name: '电话',
        id: 'PhoneField_1SJC2G5FNF280',
        value: '18974523368',
        extValue:
          '{"mode":"phone","countryKey":"CN","flag":"C","countryCode":"+86","areaNumber":"","flagPy":"Z","countryNameZh":"中国","countryName":"China","countryNamePy":"ZHONGGUO"}',
      },
      {
        componentType: 'DDPhotoField',
        name: '图片',
        id: 'DDPhotoField_1D89U393Z9LS0',
        value: '["https://static.dingtalk.com/media/lADPM5HilS890OnNBQDNA8A_960_1280.jpg"]',
      },
      {
        componentType: 'DDAttachment',
        name: '附件',
        id: 'DDAttachment_1JBDVVUGW0PS0',
        value:
          '[{"spaceId":"766340708","fileName":"P30415-195941_[B@ca1a63b.jpg","fileSize":242658,"fileType":"jpg","fileId":"104052079067"}]',
      },
      {
        componentType: 'SignatureField',
        name: '手写签名',
        id: 'SignatureField_1FGKCFBCOP400',
        value:
          'https://down-cdn.dingtalk.com/ddmedia/iAElAqNwbmcDBgTNAkMFzQGKBtoAI4QBpCEEvfYCqiw_xR1OT2JeMsIDzwAAAYfvE5cuBM4AClN3BwAIAA.png',
        extValue:
          '{"watermask":"仅限[request_funds_template]使用","sticker":{"time":1683625687084,"username":"邬湘东"},"time":1683625687084}',
      },
      {
        componentType: 'InvoiceField',
        name: '电子发票',
        id: 'InvoiceField_TFOM506KO8W0',
      },
      {
        componentType: 'RecipientAccountField',
        name: '收款账户',
        id: 'RecipientAccountField_1DD7D6WRIHKW0',
        value: '邬湘东',
        extValue:
          '{"identityType":"DINGTALK_ACCOUNT","name":"邬湘东","id":"1","jobNumber":"","isSelf":"1"}',
      },
      //   {
      //     componentType: 'TableField',
      //     name: '表格',
      //     id: 'TableField_18PIU0IUSUGW0',
      //     value:
      //       '[{"rowValue":[{"label":"数字输入框","value":"1000","key":"NumberField_8XMSJBMQQ980"}],"rowNumber":"TableField_18PIU0IUSUGW0_15DSYROTF37G0"}]',
      //     extValue: '{"statValue":[],"componentName":"TableField"}',
      //   },
      {
        componentType: 'TableField',
        name: '表格',
        bizAlias: '',
        id: 'TableField_9RG5CUD9MPC0',
        value:
          '[{"rowValue":[{"label":"单行输入框1","value":"1234","key":"TextField_F50JM42IX880"},{"label":"单行输入框","value":"123","key":"TextField_H3J8PYWTLEG0"}],"rowNumber":"TableField_9RG5CUD9MPC0_1JE0B97Q7MPS0"},{"rowValue":[{"label":"单行输入框1","value":"1234","key":"TextField_F50JM42IX880"},{"label":"单行输入框","value":"123","key":"TextField_H3J8PYWTLEG0"}],"rowNumber":"TableField_9RG5CUD9MPC0_1JE0B97Q7MPS0"}]',
        extValue: '{"statValue":[],"componentName":"TableField"}',
      },
      {
        componentType: 'TableField',
        name: '表格',
        bizAlias: '',
        id: 'TableField_1IR77YUL4HFK0',
        value:
          '[{"rowValue":[{"label":"产品分类","extendValue":{"code":"234","level":1,"name":"B","fullNamePath":"默认分类/B","id":3703506,"fullIdPath":"3846545/3703506","parentId":3846545,"order":1683793150000},"value":"默认分类/B","key":"CascadeField_170XR9TR0S5C0"}],"rowNumber":"TableField_1IR77YUL4HFK0_23KTG4GXNHC00"}]',
        extValue: '{"statValue":[],"componentName":"TableField"}',
      },
      {
        componentType: 'TableField',
        name: '表格',
        id: 'TableField_1WNV5LVHLYSG0',
        value:
          '[{"rowValue":[{"label":"单行输入框","value":"1","key":"TextField_HWC6011A71C0"},{"label":"数字输入框","value":"2500","key":"NumberField_189LH7A88VPC0"},{"label":"多选框","extendValue":[{"label":"选项3","value":"选项3","key":"option_2"},{"label":"选项2","value":"选项2","key":"option_1"}],"value":["选项3","选项2"],"key":"DDMultiSelectField_KAJY5XWQZI80"}],"rowNumber":"TableField_1WNV5LVHLYSG0_159Y4QICBIRG0"}]',
        extValue: '{"statValue":[],"componentName":"TableField"}',
      },
      {
        componentType: 'TableField',
        name: '表格',
        id: 'TableField_1YRZ7MUNX4JK0',
        value:
          '[{"rowValue":[{"label":"报销项目1","value":"请客户吃饭","key":"TextField_1DSB6LCLO08W0"},{"label":"报销项目2","value":"出差","key":"TextField_64C2VGK8BJK0"},{"label":"报销金额","value":"3000","key":"NumberField_XGX5H2MEMWG0"},{"label":"日期","value":"2023-05-12","key":"DDDateField_LNF7E6T85340"},{"label":"多行输入框","value":"1.吃饭费用\\n2.出差交通费","key":"TextareaField_159LMK4E9LZ40"},{"label":"报销人电话","extendValue":{"mode":"phone","countryKey":"CN","flag":"C","countryCode":"+86","areaNumber":"","flagPy":"Z","countryNameZh":"中国","countryName":"China","countryNamePy":"ZHONGGUO"},"value":"15322146954","key":"PhoneField_PH110634W2O0"},{"label":"报销图片","value":["https://static.dingtalk.com/media/lALPM4rHl_22JFjNBP_NAms_619_1279.png"],"key":"DDPhotoField_44PB2LJ637W0"},{"label":"报销联系人","extendValue":[{"nick":"徐秀梅","orgUserName":"徐秀梅","emplId":"195919104024502869","corpId":"ding57b9dbff9aacabbc35c2f4657eb6378f","name":"徐秀梅","avatar":"https://static.dingtalk.com/media/lADPD4PvPO6MAtrNAd_NAeA_480_479.jpg"}],"value":"徐秀梅","key":"InnerContactField_1CFI3CIBYMXS0"},{"label":"报销费用分类","extendValue":{"code":"1","level":1,"name":"出差","fullNamePath":"默认分类/出差","id":3699618,"fullIdPath":"3577515/3699618","parentId":3577515,"order":1683854787000},"value":"默认分类/出差","key":"CascadeField_K9CBV01626O0"},{"value":"请输入说明文字","key":"TextNote_1XZHWMP222XS0"},{"label":"报销附件","value":[{"spaceId":"766340708","fileName":"run(2).sh","fileSize":1307,"fileType":"sh","fileId":"104301389804"}],"key":"DDAttachment_2XJXTI1OGEO0"},{"label":"报销部门","extendValue":[{"number":0,"name":"跨境电商部","id":62147607}],"value":"跨境电商部","key":"DepartmentField_YWVYUPN47Q80"}],"rowNumber":"TableField_1YRZ7MUNX4JK0_T1LQ02RX38G0"}]',
        extValue: '{"statValue":[],"componentName":"TableField"}',
      },
    ],
    result: '',
    bizAction: 'NONE',
    createTime: '2023-05-09T19:23Z',
    originatorUserId: '020953100336487280',
    tasks: [
      {
        result: 'NONE',
        activityId: '1918_5cd3',
        pcUrl:
          'aflow.dingtalk.com?procInsId=CLkFYyRDS4Cd8KQN9jaQTA03651683631426&taskId=79893867827&businessId=202305091923000462950',
        createTime: '2023-05-09T19:23Z',
        mobileUrl:
          'aflow.dingtalk.com?procInsId=CLkFYyRDS4Cd8KQN9jaQTA03651683631426&taskId=79893867827&businessId=202305091923000462950',
        userId: '020953100336487280',
        taskId: 79893867827,
        status: 'RUNNING',
      },
    ],
    originatorDeptName: '研发部',
    status: 'RUNNING',
  },
  success: true,
};
export default data;
