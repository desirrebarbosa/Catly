
import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Image
} from 'react-native';
import { useCats } from '../context/CatContext';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import globalStyles from '../constants/globalStyles';

const CatListScreen = ({ navigation }) => {
  const { cats, fetchCats, isLoading, error } = useCats(); // Get error from context
  const { userInfo, logout } = useAuth(); // Get logout function

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  const renderCatItem = ({ item }) => (
    <TouchableOpacity style={globalStyles.card} onPress={() => navigation.navigate('CatDetails', { catId: item.id })}>
      <View style={globalStyles.row}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.photoUrl || 'https://placekitten.com/200/200' }} style={globalStyles.avatar} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.catName}>{item.name}</Text>
          <Text style={globalStyles.textGray}>{item.gender} • {item.breed || 'Domestic Short Hair'}</Text>
          <Text style={globalStyles.textGray}>{item.isSpayed ? '✨ Spayed/Neutered' : '⚠️ Intact'}</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  // If there is an error (like Not Authorized), show this screen
  if (error) {
    return (
      <View style={globalStyles.center}>
        <Text style={styles.errorText}>Oops! Something went wrong.</Text>
        <Text style={styles.errorDetails}>{error}</Text>
        
        <TouchableOpacity style={styles.retryButton} onPress={fetchCats}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Log Out & Restart</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={globalStyles.headerTitle}>Hello, {userInfo?.name || 'Cat Lover'}!</Text>
          <Text style={globalStyles.textGray}>Here are your furry friends.</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddCat')}>
          <Text style={styles.addButtonText}>+ Add Cat</Text>
        </TouchableOpacity>
      </View>

      {isLoading && cats.length === 0 ? (
        <View style={globalStyles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={cats}
          keyExtractor={(item) => item.id}
          renderItem={renderCatItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchCats} />}
          ListEmptyComponent={
            <View style={globalStyles.emptyState}>
              <Text style={globalStyles.emptyTitle}>No cats yet!</Text>
              <Text style={globalStyles.emptySubtitle}>Tap the "+ Add Cat" button to track your first pet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addButtonText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  listContainer: { padding: 20 },
  avatarContainer: { marginRight: 16 },
  infoContainer: { flex: 1 },
  catName: { fontSize: 18, fontWeight: '700', color: COLORS.black, marginBottom: 4 },
  arrow: { fontSize: 24, color: '#9CA3AF', marginLeft: 8 },
  
  // Error Styles
  errorText: { fontSize: 20, fontWeight: 'bold', color: COLORS.black, marginBottom: 8 },
  errorDetails: { fontSize: 14, color: 'red', marginBottom: 24, paddingHorizontal: 40, textAlign: 'center' },
  retryButton: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25, marginBottom: 12 },
  retryButtonText: { color: COLORS.white, fontWeight: 'bold' },
  logoutButton: { paddingHorizontal: 30, paddingVertical: 12 },
  logoutButtonText: { color: COLORS.gray, textDecorationLine: 'underline' },
});

export default CatListScreen;
