import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useState } from 'react';

import { TabBarContext } from '@/context/tab-bar-context';

const TAB_BAR_BACKGROUND = '#030712';

export default function AppTabs() {
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);

  return (
    <TabBarContext value={{ isTabBarHidden, setIsTabBarHidden }}>
      <NativeTabs
        hidden={isTabBarHidden}
        backgroundColor={TAB_BAR_BACKGROUND}
        indicatorColor="rgba(74,168,254,0.35)"
        labelStyle={{ selected: { color: '#ffffff' }, default: { color: 'rgba(255,255,255,0.55)' } }}>
        <NativeTabs.Trigger name="meetings">
          <NativeTabs.Trigger.Label>Meetings</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'calendar', selected: 'calendar' }} md="event" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Chat</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{
              default: 'bubble.left.and.bubble.right',
              selected: 'bubble.left.and.bubble.right.fill',
            }}
            md="chat"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="tasks">
          <NativeTabs.Trigger.Label>Tasks</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'checklist', selected: 'checklist' }} md="checklist" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </TabBarContext>
  );
}
