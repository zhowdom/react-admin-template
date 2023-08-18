import { add, sub, mul, div } from './index';

it('浮点运算', () => {
  expect(add(0.1, 0.2)).toEqual(0.3);
  expect(add(0.3, 0.1)).toEqual(0.5);
  expect(sub(0.1, 0.01)).toEqual(0.09);
  expect(mul(0.2, 0.4)).toEqual(0.08);
  expect(div(0.04, 2)).toEqual(0.02);
});
