import { createContext, type Dispatch, type SetStateAction, use } from 'react';

type TabBarContextValue = {
  isTabBarHidden: boolean;
  setIsTabBarHidden: Dispatch<SetStateAction<boolean>>;
};

export const TabBarContext = createContext<TabBarContextValue>({
  isTabBarHidden: false,
  setIsTabBarHidden: () => {},
});

export function useTabBar() {
  return use(TabBarContext);
}
