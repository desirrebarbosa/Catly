import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import globalStyles from '../constants/globalStyles';

export const SetupProfileScreen = ({ navigation }) => {
  const { updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const result = await updateProfile({ name, phone, about });
    setLoading(false);
    if (result.success) navigation.navigate('Dashboard');
    else Alert.alert('Error', result.error || 'Failed to save');
  };

  return (
    <SafeAreaView style={globalStyles.containerPrimary}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={globalStyles.cardLarge}>
          <Text style={styles.title}>Set Up Your Account</Text>

          <View style={styles.avatarContainer}>
            <View style={globalStyles.avatarLarge}>
              <Text style={styles.avatarIcon}>👤</Text>
              <View style={styles.plusIconContainer}>
                <Text style={styles.plusIcon}>+</Text>
              </View>
            </View>
          </View>

          <View style={styles.form}>
            <TextInput
              style={globalStyles.input}
              placeholder="Name"
              placeholderTextColor={COLORS.gray}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Phone Number"
              placeholderTextColor={COLORS.gray}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={[globalStyles.input, styles.textArea]}
              placeholder="About Yourself"
              placeholderTextColor={COLORS.gray}
              value={about}
              onChangeText={setAbout}
              multiline
            />

            <TouchableOpacity
              style={[styles.saveButton, loading && globalStyles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={globalStyles.primaryButtonText}>{loading ? 'Saving...' : 'Save Details'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.black, textAlign: 'center', marginBottom: 25, fontStyle: 'italic' },
  avatarContainer: { alignItems: 'center', marginBottom: 25 },
  avatarIcon: { fontSize: 40, color: '#999' },
  plusIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  plusIcon: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', marginTop: -2 },
  form: { width: '100%' },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#333333', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
});