import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { MemoColors } from '@/assets/colors';
import { useAuth } from '@/providers/auth-provider';

export default function ProtectedLayout() {
  const { initializing, session } = useAuth();

  if (initializing) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={MemoColors.secondaryBlue} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth" />;
  }

  return <AppTabs />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#030712',
  },
});
