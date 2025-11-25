import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, 
  ActivityIndicator, StyleSheet, Modal, FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCats } from '../context/CatContext';
import { COLORS } from '../constants/colors';
import globalStyles from '../constants/globalStyles';

const EditCatScreen = ({ route, navigation }) => {
  const { cat } = route.params;
  const { updateCat, cats, fetchCats } = useCats(); 

  const [name, setName] = useState(cat.name);
  const [breed, setBreed] = useState(cat.breed || '');
  const [gender, setGender] = useState(cat.gender);
  const [weight, setWeight] = useState(cat.weight ? cat.weight.toString() : '');
  const [isSpayed, setIsSpayed] = useState(cat.isSpayed);
  const [isArchived, setIsArchived] = useState(cat.isArchived);
  
  const [motherId, setMotherId] = useState(cat.motherId);
  const [fatherId, setFatherId] = useState(cat.fatherId);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingFor, setSelectingFor] = useState(null); 

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCats(); 
  }, []);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: name.trim(),
        breed: breed.trim() || null,
        gender,
        weight: weight ? parseFloat(weight) : null,
        isSpayed,
        isArchived,
        motherId,
        fatherId
      };

      await updateCat(cat.id, updateData);
      Alert.alert('Success', 'Cat profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('CatDetails', { catId: cat.id }) }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const openParentSelection = (role) => {
    setSelectingFor(role);
    setModalVisible(true);
  };

  const selectParent = (selectedCat) => {
    if (selectingFor === 'mother') setMotherId(selectedCat.id);
    if (selectingFor === 'father') setFatherId(selectedCat.id);
    setModalVisible(false);
  };

  const potentialParents = cats.filter(c => c.id !== cat.id);

  const getParentName = (id) => {
    const parent = cats.find(c => c.id === id);
    return parent ? parent.name : 'Select...';
  };

  return (
    <SafeAreaView style={globalStyles.containerPrimary}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <Text style={globalStyles.label}>Name *</Text>
        <TextInput
          style={globalStyles.input}
          value={name}
          onChangeText={setName}
          placeholder="Cat Name"
          placeholderTextColor={COLORS.gray}
        />

        <Text style={globalStyles.label}>Breed</Text>
        <TextInput
          style={globalStyles.input}
          value={breed}
          onChangeText={setBreed}
          placeholder="Breed"
          placeholderTextColor={COLORS.gray}
        />

        <Text style={globalStyles.label}>Gender</Text>
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
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="0.0"
          placeholderTextColor={COLORS.gray}
        />

        <View style={styles.toggleRow}>
          <Text style={globalStyles.label}>Spayed / Neutered?</Text>
          <TouchableOpacity
            style={[globalStyles.toggleButton, isSpayed && globalStyles.toggleActive]}
            onPress={() => setIsSpayed(!isSpayed)}
          >
            <Text style={[globalStyles.toggleText, isSpayed && globalStyles.toggleTextActive]}>
              {isSpayed ? 'Yes' : 'No'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Lineage</Text>
        
        <Text style={globalStyles.label}>Dam (Mother)</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => openParentSelection('mother')}>
          <Text style={styles.selectButtonText}>{getParentName(motherId)}</Text>
        </TouchableOpacity>

        <Text style={globalStyles.label}>Sire (Father)</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => openParentSelection('father')}>
          <Text style={styles.selectButtonText}>{getParentName(fatherId)}</Text>
        </TouchableOpacity>

        <View style={[styles.toggleRow, styles.archiveRow]}>
          <Text style={[globalStyles.label, { color: COLORS.error }]}>Archive Cat?</Text>
          <TouchableOpacity
            style={[globalStyles.toggleButton, isArchived && { backgroundColor: COLORS.error }]}
            onPress={() => setIsArchived(!isArchived)}
          >
            <Text style={[globalStyles.toggleText, isArchived && globalStyles.toggleTextActive]}>
              {isArchived ? 'Archived' : 'Active'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>Archived cats are hidden from the main list.</Text>

        <TouchableOpacity
          style={[globalStyles.primaryButton, loading && globalStyles.disabledButton]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={globalStyles.primaryButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {selectingFor === 'mother' ? 'Mother' : 'Father'}</Text>
            <FlatList
              data={potentialParents}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => selectParent(item)}>
                  <Text style={styles.modalItemText}>{item.name} ({item.breed})</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No other cats available.</Text>}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: { padding: 8 },
  backText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  selectButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectButtonText: { fontSize: 16, color: '#374151' },
  archiveRow: { marginTop: 20 },
  helperText: { fontSize: 12, color: '#9CA3AF', marginBottom: 30, marginTop: -15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalItemText: { fontSize: 16, color: '#374151' },
  closeButton: { marginTop: 20, alignSelf: 'center', padding: 10 },
  closeButtonText: { color: COLORS.primary, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#999', padding: 20 },
});

export default EditCatScreen;