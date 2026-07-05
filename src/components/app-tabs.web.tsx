import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { TabBarContext, useTabBar } from '@/context/tab-bar-context';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);

  return (
    <TabBarContext value={{ isTabBarHidden, setIsTabBarHidden }}>
      <Tabs>
        <TabSlot style={{ height: '100%' }} />
        <TabList asChild>
          <CustomTabList>
            <TabTrigger name="meetings" href="/meetings" asChild>
              <TabButton>Meetings</TabButton>
            </TabTrigger>
            <TabTrigger name="index" href="/" asChild>
              <TabButton>Chat</TabButton>
            </TabTrigger>
            <TabTrigger name="tasks" href="/tasks" asChild>
              <TabButton>Tasks</TabButton>
            </TabTrigger>
          </CustomTabList>
        </TabList>
      </Tabs>
    </TabBarContext>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const { isTabBarHidden } = useTabBar();

  return (
    <View
      {...props}
      style={[styles.tabListContainer, isTabBarHidden && styles.hidden]}
      pointerEvents={isTabBarHidden ? 'none' : 'auto'}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          Memo
        </ThemedText>

        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  hidden: {
    display: 'none',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
