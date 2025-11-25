
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api.service';
import { COLORS } from '../constants/colors';

const FamilyTreeScreen = ({ route, navigation }) => {
  const { catId } = route.params;
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatDetails = async () => {
      try {
        const response = await api.get(`/cats/${catId}`);
        if (response.success) {
          setCat(response.data.cat);
        }
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Failed to load lineage.");
      } finally {
        setLoading(false);
      }
    };
    fetchCatDetails();
  }, [catId]);

  if (loading || !cat) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const ParentNode = ({ role, data }) => (
    <View style={styles.nodeContainer}>
      <View style={styles.parentNodeCircle}>
        {data?.photoUrl ? (
          <Image source={{ uri: data.photoUrl }} style={styles.nodeImage} />
        ) : (
          <Text style={styles.placeholderEmoji}>🐱</Text>
        )}
      </View>
      <Text style={styles.nodeName}>{data?.name || "Unknown"}</Text>
      <Text style={styles.nodeRole}>{role}</Text>
    </View>
  );

  // Combine children from motherOf and fatherOf
  const offspring = [...(cat.childrenMother || []), ...(cat.childrenFather || [])];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
           <Text style={styles.backText}>Back</Text>
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Family Tree</Text>
         <View style={{width: 40}} />
      </View>

      <View style={styles.treeContainer}>
        
        {/* Grandparents / Parents Layer */}
        <View style={styles.parentsRow}>
           <ParentNode role="Sire (Father)" data={cat.father} />
           <ParentNode role="Dam (Mother)" data={cat.mother} />
        </View>

        {/* Visual Lines connecting Parents to Child */}
        <View style={styles.linesContainer}>
           <View style={styles.connectorArc} />
           <View style={styles.connectorVertical} />
        </View>

        {/* Current Cat (The Star) */}
        <View style={styles.starNodeContainer}>
           <View style={styles.starNodeCircle}>
             {cat.photoUrl ? (
               <Image source={{ uri: cat.photoUrl }} style={styles.nodeImage} />
             ) : (
               <Text style={{fontSize: 40}}>😺</Text>
             )}
           </View>
           <Text style={styles.starName}>{cat.name}</Text>
           <Text style={styles.starLabel}>The Star</Text>
        </View>

        {/* Offspring Layer */}
        <View style={styles.offspringSection}>
          <View style={styles.offspringHeader}>
            <Text style={styles.offspringTitle}>Offspring</Text>
            <View style={styles.offspringLine} />
          </View>
          
          {offspring.length > 0 ? (
            <View style={styles.offspringGrid}>
              {offspring.map(child => (
                <View key={child.id} style={styles.childNode}>
                  <View style={styles.childCircle}>
                     <Image 
                       source={{ uri: child.photoUrl || 'https://placekitten.com/100/100' }} 
                       style={styles.nodeImage} 
                     />
                  </View>
                  <Text style={styles.childName}>{child.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No offspring recorded.</Text>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  treeContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  parentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  nodeContainer: {
    alignItems: 'center',
  },
  parentNodeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    borderWidth: 4,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nodeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderEmoji: {
    fontSize: 24,
  },
  nodeName: {
    fontWeight: 'bold',
    color: '#374151',
    fontSize: 14,
  },
  nodeRole: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  linesContainer: {
    height: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    marginBottom: 0,
    zIndex: -1,
  },
  connectorArc: {
    width: 160,
    height: 40,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#E5E7EB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    top: -10,
  },
  connectorVertical: {
    width: 2,
    height: 30,
    backgroundColor: '#E5E7EB',
    position: 'absolute',
    bottom: -10,
  },
  starNodeContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  starNodeCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  starName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  starLabel: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  offspringSection: {
    width: '100%',
    paddingHorizontal: 30,
    flex: 1,
  },
  offspringHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  offspringTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    backgroundColor: COLORS.white,
    zIndex: 1,
    paddingHorizontal: 10,
  },
  offspringLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
    position: 'absolute',
    top: 8,
    zIndex: 0,
  },
  offspringGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  childNode: {
    alignItems: 'center',
  },
  childCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    marginBottom: 4,
  },
  childName: {
    fontSize: 12,
    color: '#4B5563',
  },
  emptyText: {
    textAlign: 'center',
    color: '#D1D5DB',
    fontStyle: 'italic',
    marginTop: 10,
  },
});

export default FamilyTreeScreen;
