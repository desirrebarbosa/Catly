import React, { useEffect, useState } from 'react';
import { View as RNView, Text as RNText, ScrollView as RNScrollView, Image as RNImage, TouchableOpacity as RNTouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCats } from '../context/CatContext';
import { Button } from '../components/ui/Button';

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;
const ScrollView = RNScrollView as any;

export const CatDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { catId } = route.params;
  const { getCatDetails, deleteCat, currentCat, isLoading } = useCats();
  const [activeTab, setActiveTab] = useState('About');

  useEffect(() => {
    getCatDetails(catId);
  }, [catId]);

  const handleDelete = () => {
    Alert.alert('Delete Cat', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteCat(catId); navigation.goBack(); } }
    ]);
  };

  if (isLoading || !currentCat) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator color="#F5A9C8" /></View>;
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="h-64 relative">
        <Image source={{ uri: currentCat.photoUrl || 'https://placekitten.com/400/400' }} className="w-full h-full" resizeMode="cover" />
        <TouchableOpacity 
          className="absolute top-12 left-5 bg-black/40 px-3 py-2 rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-bold">← Back</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white -mt-6 rounded-t-3xl px-6 pt-6 flex-1">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-3xl font-bold text-secondary">{currentCat.name}</Text>
            <Text className="text-gray-500 text-base">{currentCat.breed || 'Unknown'}</Text>
          </View>
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-secondary font-bold">{currentCat.gender}</Text>
          </View>
        </View>

        <View className="flex-row border-b border-gray-100 mb-6">
          {['About', 'Health', 'Lineage'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              className={`mr-6 pb-3 ${activeTab === tab ? 'border-b-2 border-primary' : ''}`}
            >
              <Text className={`text-base font-medium ${activeTab === tab ? 'text-primary' : 'text-gray-400'}`}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'About' && (
          <View className="gap-4">
            <Row label="Weight" value={`${currentCat.weight} kg`} />
            <Row label="Status" value={currentCat.isSpayed ? 'Spayed/Neutered' : 'Intact'} />
            <Row label="Birthday" value="Unknown" />
            
            <View className="mt-8 gap-3">
               <Button title="Edit Profile" onPress={() => navigation.navigate('EditCat', { cat: currentCat })} />
               <Button title="Delete Cat" variant="outline" onPress={handleDelete} className="border-red-400 text-red-400" />
            </View>
          </View>
        )}

        {activeTab === 'Health' && (
          <View className="items-center py-10">
            <Text className="text-gray-400 mb-4">Check health records and logs.</Text>
            <Button 
              title="View Health Log" 
              variant="secondary" 
              className="w-full"
              onPress={() => navigation.navigate('HealthLog', { catId: currentCat.id, catName: currentCat.name })}
            />
          </View>
        )}

        {activeTab === 'Lineage' && (
          <View className="items-center py-10">
             <Text className="text-gray-400 mb-4">View parents and offspring.</Text>
             <Button 
               title="View Family Tree" 
               variant="secondary"
               className="w-full"
               onPress={() => navigation.navigate('FamilyTree', { catId: currentCat.id })} 
             />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const Row = ({ label, value }: any) => (
  <View className="flex-row justify-between py-3 border-b border-gray-50">
    <Text className="text-gray-500">{label}</Text>
    <Text className="text-secondary font-medium">{value}</Text>
  </View>
);