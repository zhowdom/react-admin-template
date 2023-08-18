import moment from 'moment';

export default ({ option,type,onlyFirst }: any) => {
  // type == line 时，左右排版 为空时，上下排版
  // onlyFirst == true 时，只显示每周的开始时间 不显示结尾时间
  const { cycle_time, begin, end, color = false } = option;

  const startTime = cycle_time ? moment(begin).format('MM.DD') : begin;
  const endTime = cycle_time ? moment(end).format('MM.DD') : end;
  return (
    <>
      {cycle_time ? cycle_time : ''}
      {begin && end ? (
        <div className={color ? 'blue' : ''} style={{ whiteSpace: 'nowrap',display: type == 'line'? 'inline-block': 'block' }}>
          {onlyFirst?(
            cycle_time ? `(${startTime})` : `${startTime}`
          )
          :(
            cycle_time ? `(${startTime} - ${endTime})` : `${startTime} - ${endTime}`
          )}
        </div>
      ) : (
        '-'
      )}
    </>
  );
};
