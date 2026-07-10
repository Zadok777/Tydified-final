import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import { TabBar, type TabItem } from '../components/layout/TabBar';
import { ChoresScreen } from '../screens/parent/ChoresScreen';
import { FamilyScreen } from '../screens/parent/FamilyScreen';
import { MoreScreen } from '../screens/parent/MoreScreen';
import { ParentDashboard } from '../screens/parent/ParentDashboard';
import { ReviewScreen } from '../screens/parent/ReviewScreen';
import { C } from '../theme';
import type { MainTabParamList } from '../types/app.types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Parent navigation matching the Lumina Bloom prototype: Home / Review /
// Chores / Family / More. Rewards is not a tab — it's pushed from More.
const TAB_META: Record<keyof MainTabParamList, TabItem> = {
  Home: {
    key: 'Home',
    label: 'Home',
    iconActive: 'home',
    iconInactive: 'home-outline',
  },
  Review: {
    key: 'Review',
    label: 'Review',
    iconActive: 'checkmark-circle',
    iconInactive: 'checkmark-circle-outline',
  },
  Chores: {
    key: 'Chores',
    label: 'Chores',
    iconActive: 'list',
    iconInactive: 'list-outline',
  },
  Family: {
    key: 'Family',
    label: 'Family',
    iconActive: 'people',
    iconInactive: 'people-outline',
  },
  More: {
    key: 'More',
    label: 'More',
    iconActive: 'settings',
    iconInactive: 'settings-outline',
  },
};

function TydifiedTabBar({ state, navigation }: BottomTabBarProps) {
  const tabs = state.routes.map(
    (route) => TAB_META[route.name as keyof MainTabParamList]
  );
  const activeKey = state.routes[state.index]?.name ?? 'Home';

  return (
    <TabBar
      tabs={tabs}
      activeKey={activeKey}
      onChange={(key) => {
        const route = state.routes.find((r) => r.name === key);
        if (route === undefined) return;
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (!event.defaultPrevented) {
          navigation.navigate(route.name);
        }
      }}
    />
  );
}

export function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TydifiedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: C.bg },
      }}
    >
      <Tab.Screen name="Home" component={ParentDashboard} />
      <Tab.Screen name="Review" component={ReviewScreen} />
      <Tab.Screen name="Chores" component={ChoresScreen} />
      <Tab.Screen name="Family" component={FamilyScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
