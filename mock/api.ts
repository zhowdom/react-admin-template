import { Request, Response } from 'express';

const getNotices = {
  code: 200,
  message: 'success',
  data: {
    totalElements: 266,
    totalPages: 646,
    number: 76,
    size: 10,
    content: [
      {
        createId: 857,
        updateId: 597,
        createTime: '2021-11-18',
        updateTime: '2021-11-18',
        id: 309,
        ruleName: '弘文.梁',
        remark: '8qunz3',
        havingTarget: 627,
        targetRemark: 'rtnheg',
        ruleId: 49,
        havingSummary: 380,
        roleId: '44',
      },
    ],
    sort: {
      empty: true,
      orders: [
        {
          object: 'any object',
        },
      ],
    },
    numberOfElements: 116,
    first: true,
    pageable: {
      offset: 1,
      sort: {
        empty: true,
        orders: [
          {
            object: 'any object',
          },
        ],
      },
      unpaged: true,
      paged: true,
      pageNumber: 369,
      pageSize: 10,
    },
    last: true,
    empty: true,
  },
  total: 266,
};
export default {
  'POST /api/assessmentRule/getAllRules': (req: Request, res: Response) => {
    res.send(getNotices);
  },
  //   'POST /api/assessmentRule/getAllRules': getNotices,
};
