
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCats } from '../context/CatContext';
import { COLORS } from '../constants/colors';
import globalStyles from '../constants/globalStyles';

const AddCatScreen = ({ navigation }) => {
  const { addCat, isLoading } = useCats();
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState('');
  const [isSpayed, setIsSpayed] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert('Missing Information', "Please enter your cat's name.");

    const catData = {
      name: name.trim(),
      breed: breed.trim() || null,
      gender,
      weight: weight ? parseFloat(weight) : null,
      isSpayed,
    };

    try {
      await addCat(catData);
      Alert.alert('Success', 'Welcome to the family! 🐾', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not add cat.');
    }
  };

  return (
    <SafeAreaView style={globalStyles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={globalStyles.scrollContent}>
          <View style={globalStyles.navHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={globalStyles.backButtonText}>← Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>New Cat Profile</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.form}>
            <Text style={globalStyles.label}>Name *</Text>
            <TextInput 
              style={globalStyles.input} 
              placeholder="e.g. Luna" 
              value={name} 
              onChangeText={setName} 
              placeholderTextColor={COLORS.gray} 
            />

            <Text style={globalStyles.label}>Breed (Optional)</Text>
            <TextInput 
              style={globalStyles.input} 
              placeholder="e.g. Siamese" 
              value={breed} 
              onChangeText={setBreed} 
              placeholderTextColor={COLORS.gray} 
            />

            <Text style={globalStyles.label}>Gender *</Text>
            <View style={globalStyles.genderContainer}>
              <TouchableOpacity 
                style={[globalStyles.genderButton, gender === 'Male' && globalStyles.genderActive]} 
                onPress={() => setGender('Male')}
              >
                <Text style={[globalStyles.genderText, gender === 'Male' && globalStyles.genderTextActive]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[globalStyles.genderButton, gender === 'Female' && globalStyles.genderActive]} 
                onPress={() => setGender('Female')}
              >
                <Text style={[globalStyles.genderText, gender === 'Female' && globalStyles.genderTextActive]}>Female</Text>
              </TouchableOpacity>
            </View>

            <Text style={globalStyles.label}>Weight (kg)</Text>
            <TextInput 
              style={globalStyles.input} 
              placeholder="e.g. 4.5" 
              value={weight} 
              onChangeText={setWeight} 
              keyboardType="numeric" 
              placeholderTextColor={COLORS.gray} 
            />

            <Text style={globalStyles.label}>Spayed / Neutered?</Text>
            <View style={globalStyles.genderContainer}>
              <TouchableOpacity 
                style={[globalStyles.genderButton, isSpayed === true && globalStyles.genderActive]} 
                onPress={() => setIsSpayed(true)}
              >
                <Text style={[globalStyles.genderText, isSpayed === true && globalStyles.genderTextActive]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[globalStyles.genderButton, isSpayed === false && globalStyles.genderActive]} 
                onPress={() => setIsSpayed(false)}
              >
                <Text style={[globalStyles.genderText, isSpayed === false && globalStyles.genderTextActive]}>No</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 40 }}>
              <TouchableOpacity 
                style={[globalStyles.primaryButton, isLoading && globalStyles.disabledButton]} 
                onPress={handleSubmit} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={globalStyles.primaryButtonText}>Save Profile</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: COLORS.black },
  form: { padding: 24 },
});

export default AddCatScreen;
