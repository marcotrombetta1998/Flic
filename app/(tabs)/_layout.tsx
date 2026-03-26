import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize } from '../../constants/theme';
import { useStore } from '../../store';

function UploadTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.uploadTab}>
      <Ionicons name="add" size={26} color={Colors.black} />
    </View>
  );
}

function CreditTabIcon({ focused }: { focused: boolean }) {
  const credits = useStore((s) => s.creditsBalance);
  return (
    <View style={styles.creditTabWrapper}>
      <Ionicons
        name="flash"
        size={22}
        color={focused ? Colors.lime : Colors.gray}
      />
      {credits > 0 && (
        <View style={styles.creditBadge}>
          <Text style={styles.creditBadgeText}>{credits}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const unreadCount = useStore((s) => s.unreadCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.black,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.lime,
        tabBarInactiveTintColor: Colors.gray,
        tabBarLabelStyle: {
          fontFamily: FontFamily.dmSansMedium,
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
              {unreadCount > 0 && (
                <View style={styles.notifDot} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => <UploadTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="credits"
        options={{
          title: 'Credits',
          tabBarIcon: ({ focused }) => <CreditTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  uploadTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  creditTabWrapper: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.lime,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  creditBadgeText: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: 8,
    color: Colors.black,
    fontWeight: 'bold',
  },
  notifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.pink,
  },
});
