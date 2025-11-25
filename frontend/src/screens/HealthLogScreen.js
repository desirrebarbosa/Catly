
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HealthCard from '../components/HealthCard';
import api from '../services/api.service';
import { COLORS } from '../constants/colors';
import globalStyles from '../constants/globalStyles';

const HealthLogScreen = ({ route, navigation }) => {
  const { catId, catName } = route.params;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHealthEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/cats/${catId}/health`);
      if (response.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthEvents();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchHealthEvents();
    });
    return unsubscribe;
  }, [navigation, catId]);

  return (
    <SafeAreaView style={globalStyles.containerPrimary}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{catName}'s Health Log</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddHealthEvent', { catId })}
          style={styles.addButton}
        >
           <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {loading ? (
          <View style={globalStyles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <HealthCard 
                event={item} 
                onPress={() => { /* Navigate to details if implemented */ }} 
              />
            )}
            ListEmptyComponent={
              <View style={globalStyles.emptyState}>
                <Text style={globalStyles.emptyTitle}>No records found</Text>
                <Text style={globalStyles.emptySubtitle}>
                  Keep track of vaccines and check-ups!
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 8,
  },
  backText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: COLORS.white,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -2,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
  }
});

export default HealthLogScreen;
