import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { useCats } from '../context/CatContext';
import { COLORS } from '../constants/colors';
import globalStyles from '../constants/globalStyles';

const CatDetailsScreen = ({ route, navigation }) => {
  const { catId } = route.params;
  const { getCatDetails, deleteCat, currentCat, isLoading } = useCats();
  const [activeTab, setActiveTab] = useState('About');

  useEffect(() => {
    getCatDetails(catId);
  }, [catId, getCatDetails]);

  const handleDelete = () => {
    Alert.alert('Delete Cat', 'Are you sure? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteCat(catId); navigation.goBack(); } },
    ]);
  };

  if (isLoading || !currentCat) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={globalStyles.container}>
      <View style={styles.header}>
        <Image source={{ uri: currentCat.photoUrl || 'https://placekitten.com/400/400' }} style={styles.coverImage} />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={globalStyles.rowBetween}>
          <View>
            <Text style={styles.name}>{currentCat.name}</Text>
            <Text style={globalStyles.textGray}>{currentCat.breed || 'Unknown Breed'}</Text>
          </View>
          <View style={globalStyles.badge}>
            <Text style={globalStyles.badgeText}>{currentCat.gender}</Text>
          </View>
        </View>

        <View style={[globalStyles.tabContainer, { marginTop: 24 }]}>
          {['About', 'Medical', 'Lineage'].map((tab) => (
            <TouchableOpacity key={tab} style={[globalStyles.tab, activeTab === tab && globalStyles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[globalStyles.tabText, activeTab === tab && globalStyles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          {activeTab === 'About' && (
            <>
              <InfoRow label="Weight" value={`${currentCat.weight || '--'} kg`} />
              <InfoRow label="Status" value={currentCat.isSpayed ? 'Spayed/Neutered' : 'Intact'} />
              <InfoRow label="Microchip" value={currentCat.microchipId || 'Not Registered'} />
              <InfoRow label="Birthday" value={currentCat.birthDate ? new Date(currentCat.birthDate).toDateString() : 'Unknown'} />
            </>
          )}
          {activeTab === 'Medical' && (
            <View style={globalStyles.emptyState}>
              <Text style={globalStyles.emptySubtitle}>No medical records found.</Text>
              <TouchableOpacity style={styles.smallButton}>
                <Text style={styles.smallButtonText}>+ Add Record</Text>
              </TouchableOpacity>
            </View>
          )}
          {activeTab === 'Lineage' && (
            <View style={globalStyles.emptyState}>
              <Text style={globalStyles.emptySubtitle}>Family tree is empty.</Text>
              <Text style={styles.subText}>Link parents to see lineage.</Text>
            </View>
          )}
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity style={globalStyles.primaryButton} onPress={() => Alert.alert('Coming Soon', 'Edit feature is next!')}>
            <Text style={globalStyles.primaryButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={globalStyles.outlineButton} onPress={handleDelete}>
            <Text style={globalStyles.outlineButtonText}>Delete Cat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={globalStyles.textGray}>{label}</Text>
    <Text style={globalStyles.text}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { height: 250, position: 'relative' },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 },
  backText: { color: COLORS.white, fontWeight: '600' },
  content: { flex: 1, marginTop: -20, backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  name: { fontSize: 28, fontWeight: 'bold', color: COLORS.black, marginBottom: 4 },
  section: { minHeight: 150 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  smallButton: { marginTop: 10, backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8 },
  smallButtonText: { color: COLORS.primary, fontWeight: '600' },
  subText: { color: '#D1D5DB', fontSize: 14, marginTop: 4 },
  actionContainer: { marginTop: 20, gap: 12 },
});

export default CatDetailsScreen;