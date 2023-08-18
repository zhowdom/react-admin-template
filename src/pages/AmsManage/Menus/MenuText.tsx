import { pubCopyText } from '@/utils/pubConfig';
const MenuText: React.FC<{
  text?: string; // 这里只能是string， 要是dom结构，自己再封装
}> = ({ text }) => {
  const isDev = process.env.NODE_ENV === 'development'; // 是不是开发环境
  const is82 = window.location.host == '172.16.99.82'; // 是不是82环境
  return (
    ((isDev || is82) && text) ? (
      <>{text} <a onClick={() => pubCopyText(text)}>复制</a></>
    )
      : <>{text}</>
  );
};
export default MenuText;
