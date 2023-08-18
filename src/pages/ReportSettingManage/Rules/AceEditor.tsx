import { useState } from 'react';
import { Switch, Space } from 'antd';
import AceEditor from 'react-ace';
/**
 * 如果要引入其他语言模式，在这里加上对应的js包
 *  import 'ace-builds/src-min-noconflict/mode-java'
 */
// import 'ace-builds/src-min-noconflict/theme-dracula'
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-min-noconflict/theme-clouds';

import 'ace-builds/src-min-noconflict/mode-drools';
import 'ace-builds/src-min-noconflict/mode-json';
// import "ace-builds/src-noconflict/mode-sh";
import 'ace-builds/src-noconflict/ext-language_tools';

const Editor: React.FC<any> = (props: any) => {
  const { mode, height, width, name, placeholder, value, onChange, theme } = props;
  const [editable, editableSet] = useState(false);
  const [themeEditor, themeEditorSet] = useState(theme || 'monokai');

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Space
        style={{
          position: 'absolute',
          top: '1px',
          right: '1px',
          zIndex: 1,
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '4px',
        }}
      >
        <Switch
          checkedChildren="浅色"
          unCheckedChildren="深色"
          defaultChecked
          onChange={(val: boolean) => {
            if (val) {
              themeEditorSet('monokai');
            } else {
              themeEditorSet('clouds');
            }
          }}
        />
        <Switch checkedChildren="编辑" unCheckedChildren="编辑" onChange={editableSet} />
      </Space>

      <AceEditor
        readOnly={!editable}
        width={width || '500px'}
        height={height || '600px'}
        mode={mode || 'drools'}
        theme={themeEditor}
        placeholder={placeholder || ''}
        onChange={onChange}
        name={name || 'ace-editor'}
        value={value}
        editorProps={{ $blockScrolling: true }}
        fontSize="14px"
        showGutter={true}
        highlightActiveLine={true}
        showPrintMargin={false}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: false,
        }}
        // onLoad = {(editor)=>{
        // console.log(editor)  //onLoad 的第一个参数是编辑器实例
        //}}
        // commands= {[{    //键盘指令
        //	name:'saveFile',
        //	bindKey:{win:'Ctrl-S',mac:'Command-S'}
        //	exec:()=>{
        //		console.log('saveFile')
        //}
        //}]}
        //debounceChangePeriod = {500} // 防抖时间
      />
    </div>
  );
};
export default Editor;
