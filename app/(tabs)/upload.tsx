import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from 'expo-vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../../constants/theme';

export default function UploadTabRedirect() {
  React.useEffect(() => {
    router.push('/upload');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.center}>
        <LinearGradient colors={[Colors.lime, '#00A060']} style={styles.icon}>
          <Ionicons name="add" size={40} color={Colors.black} />
        </LinearGradient>
        <Text style={styles.text}>Opening upload...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.base,
    color: Colors.gray,
  },
});
