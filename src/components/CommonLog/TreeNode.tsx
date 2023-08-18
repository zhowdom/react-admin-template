const TreeNode = (props: any) => {
  const { data, fieldkey, isChild, level } = props;
  const levelN = level + 1;
  const preStyle: any = {
    marginBottom: 0,
    fontFamily: 'Arial, Helvetica, sans-serif',
    whiteSpace: 'pre-wrap',
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.85)',
    marginRight: '20px',
    display: 'inline-block',
    lineHeight: '30px',
  };
  const handleColor = (dataC: any) => {
    if (dataC?.children1?.length) {
      dataC?.children1.forEach((item: any) => {
        item.color = item.before_value != item.after_value;
        handleColor(item);
      });
    }
  };
  data.color = data.before_value != data.after_value;
  handleColor(data);
  return (
    <div>
      {!data?.children1?.length ? (
        <pre
          style={{ ...preStyle, color: data.color && fieldkey == 'after_value' ? '#d46b08' : '' }}
        >
          {data.item_name}: &nbsp;{data[fieldkey] || data[fieldkey] == '0' ? data[fieldkey] : '空'}
        </pre>
      ) : (
        <div
          className="children"
          style={{
            display: level == 2 ? 'flex' : 'block',
          }}
        >
          {isChild ? (
            <pre
              style={{
                ...preStyle,
                display: level == 2 ? 'inline-block' : 'block',
                marginRight: 0,
              }}
            >
              {`${data.item_name}: `}&nbsp;
            </pre>
          ) : (
            ''
          )}
          {data?.children1.map((item: any) => {
            return item?.children1?.length ? (
              <TreeNode
                key={item.key}
                data={item}
                fieldkey={fieldkey}
                isChild={true}
                level={levelN}
              />
            ) : (
              <pre
                style={{
                  ...preStyle,
                  display: level == 2 ? 'inline-block' : 'block',
                  color: item.color && fieldkey == 'after_value' ? '#d46b08' : '',
                }}
              >
                {item.item_name}:&nbsp;
                {item[fieldkey] || item[fieldkey] == '0' ? item[fieldkey] : '空'}
              </pre>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
