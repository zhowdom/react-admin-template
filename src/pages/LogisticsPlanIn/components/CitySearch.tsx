import { useState } from 'react';
import { Select } from 'antd';

const Comp = (props: any) => {
  const { onChange, cityData2 } = props;
  const [cityList, cityListSet] = useState();
  const [cityValue, cityValueSet] = useState<any>();
  const [provinceValue, provinceValueSet] = useState<any>();
  const changeProvince = (provinces_name: any) => {
    provinceValueSet(provinces_name);
    const selectedProvince =
      (cityData2 && cityData2.find((item: any) => item.label === provinces_name)) || {};
    const cityListC =
      selectedProvince && selectedProvince.children
        ? selectedProvince.children.map((item: any) => ({
            label: item.label,
            value: item.label,
          }))
        : [];
    cityListSet(cityListC);
    cityValueSet('');
    onChange([provinces_name, '']);
  };
  const changeCity = (v: any) => {
    onChange([provinceValue, v]);
    cityValueSet(v)
  };
  return (
    <div style={{ display: 'flex' }}>
      <Select
        style={{ width: 200, marginRight: 2 }}
        placeholder="请选择省"
        allowClear
        defaultValue={props?.initialValue?.[0]}
        showSearch
        options={
          cityData2 &&
          cityData2.map((item: any) => ({
            label: item.label,
            value: item.label,
          }))
        }
        value={provinceValue}
        onChange={(v: any) => changeProvince(v)}
      />
      <Select
        style={{ minWidth: 100 }}
        placeholder="请选择市"
        allowClear
        value={cityValue}
        showSearch
        filterOption={(input: any, option: any) => {
          const trimInput = input.replace(/^\s+|\s+$/g, '');
          if (trimInput) {
            return option.label.indexOf(trimInput) >= 0;
          } else {
            return true;
          }
        }}
        options={cityList}
        onChange={(v: any) => changeCity(v)}
      />
    </div>
  );
};

export default Comp;
