export default {
  namespace: 'tagsViewStore',
  state: {
    activeTagId: '',
    tags: [],
  },
  reducers: {
    // 设置选中
    setActiveTag(state: any, { activeTagId }: { activeTagId: string }) {
      return {
        ...state,
        activeTagId,
      };
    },
    // 新增tab
    addTag(state: any, { tagItem }: any) {
      let cur = JSON.parse(JSON.stringify(state.tags));
      if (!cur.find((tag: any) => tag.id === tagItem.id)) {
        cur.push(tagItem);
        const items: any = document.querySelectorAll('.ant-pro-global-header-layout-side>div');
        if(items[0]){
          items[0].style.width = `calc(100% -  ${items[1].clientWidth}px)`;
        }
      } else {
        cur = cur.flatMap((v: any) => {
          return v.id == tagItem.id ? [{ ...v, path: tagItem.path }] : [{ ...v }];
        });
      }
      return {
        ...state,
        tags: cur,
        activeTagId: tagItem.id,
      };
    },
    // 移除当前tab
    removeTag(state: any, { targetKey, navigate }: any) {
      const activeTagId = state.activeTagId;
      const currentIndex = state.tags.findIndex((n: any) => n.id === targetKey);
      const lastIndex = currentIndex - 1;
      const tags = JSON.parse(JSON.stringify(state.tags));
      tags.splice(currentIndex, 1);
      if (targetKey === state.tags[0].id) {
        navigate.push(state.tags[currentIndex + 1].path);
        return {
          ...state,
          activeTagId: state.tags[currentIndex + 1].id,
          tags,
        };
      } else {
        if (tags.length && activeTagId === targetKey) {
          if (navigate) {
            navigate.push(lastIndex >= 0 ? state.tags[lastIndex].path : state.tags[0].path);
          }
          return {
            ...state,
            activeTagId: lastIndex >= 0 ? state.tags[lastIndex].id : state.tags[0].id,
            tags,
          };
        } else {
          return {
            ...state,
            tags,
          };
        }
      }
    },
    // 移除全部，仅保留第一个
    removeAllTag(state: any, { navigate }: any) {
      state.activeTagId = state.tags[0].id;
      state.tags = [state.tags[0]];
      navigate.push(state.tags[0].path);
      return { ...state };
    },
    // 移除其他，仅保留当前
    removeOtherTag(state: any) {
      const activeTag = state.tags.find((tag: any) => tag.id === state.activeTagId);
      state.tags = [activeTag];
      return { ...state };
    },
  },
};
