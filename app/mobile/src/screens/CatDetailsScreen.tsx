import React, { useEffect, useState } from 'react';
import { View as RNView, Text as RNText, ScrollView as RNScrollView, Image as RNImage, TouchableOpacity as RNTouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, PencilIcon } from 'react-native-heroicons/outline';
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
  const insets = useSafeAreaInsets();
  const { catId } = route.params;
  const { getCatDetails, deleteCat, currentCat, isLoading } = useCats();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Medical' | 'Family' | 'Notes'>('Overview');

  useEffect(() => {
    getCatDetails(catId);
  }, [catId]);

  const handleDelete = () => {
    Alert.alert('Delete Cat', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteCat(catId); navigation.goBack(); } }
    ]);
  };

  if (isLoading || !currentCat) {
    return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" color="#F5A9C8" /></View>;
  }

  return (
    <View className="flex-1 bg-white">
      {/* Top Section: Photo & Header */}
      <View className="h-[40%] w-full relative">
        <Image 
            source={{ uri: currentCat.photoUrl || 'https://placekitten.com/400/400' }} 
            className="w-full h-full" 
            resizeMode="cover" 
        />
        
        {/* Navigation Actions with Safe Area */}
        <View 
            style={{ paddingTop: insets.top + 10 }} 
            className="absolute w-full flex-row justify-between px-6 z-10"
        >
            <TouchableOpacity 
                className="bg-black/20 backdrop-blur-md w-10 h-10 rounded-full items-center justify-center border border-white/20 shadow-sm"
                onPress={() => navigation.goBack()}
            >
                <ChevronLeftIcon size={24} color="white" strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity 
                className="bg-black/20 backdrop-blur-md w-10 h-10 rounded-full items-center justify-center border border-white/20 shadow-sm"
                onPress={() => navigation.navigate('EditCat', { cat: currentCat })}
            >
                <PencilIcon size={20} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
        </View>
      </View>

      {/* Content Container (Rounded Top) */}
      <View className="flex-1 bg-white -mt-12 rounded-t-[30px] px-6 pt-8 shadow-2xl">
        
        {/* Cat Basic Info */}
        <View className="items-center mb-6 border-b border-gray-100 pb-6">
            <Text className="text-3xl font-extrabold text-secondary mb-1 tracking-tight">{currentCat.name}</Text>
            <Text className="text-secondaryLight text-base mb-3 font-medium">{currentCat.breed || 'Domestic Cat'} • {currentCat.gender}</Text>
            <View className="bg-primaryLight px-5 py-1.5 rounded-full">
                 <Text className="text-primaryDark font-bold text-sm">{currentCat.weight} kg</Text>
            </View>
        </View>

        {/* Custom Tabs */}
        <View className="flex-row justify-between mb-6 px-2">
          {['Overview', 'Medical', 'Family', 'Notes'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab as any)}
              className="items-center"
            >
              <Text className={`text-base font-bold ${activeTab === tab ? 'text-primary' : 'text-gray-300'}`}>{tab}</Text>
              {activeTab === tab && <View className="w-1.5 h-1.5 bg-primary rounded-full mt-1" />}
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
            {activeTab === 'Overview' && (
            <View className="gap-6 pb-6">
                <View className="bg-primary/5 p-6 rounded-[30px] border border-primary/10">
                    <Text className="text-primaryDark font-bold text-xl mb-4">About {currentCat.name}</Text>
                    <InfoRow label="Spayed/Neutered" value={currentCat.isSpayed ? 'Yes' : 'No'} />
                    <InfoRow label="Color/Markings" value="Standard" />
                    <InfoRow label="Identifying Features" value="None listed" />
                    <InfoRow label="Status" value={currentCat.isArchived ? 'Archived' : 'Active'} />
                </View>
                
                {/* Delete Button at the bottom */}
                <View className="mt-4">
                     <Button 
                        title="Delete Profile" 
                        variant="danger" 
                        onPress={handleDelete} 
                    />
                </View>
            </View>
            )}

            {activeTab === 'Medical' && (
            <View className="gap-4">
                <View className="bg-white border border-blue-100 p-5 rounded-3xl shadow-sm">
                    <Text className="text-blue-500 font-bold text-lg mb-2">Health Log</Text>
                    <Text className="text-gray-500 mb-4 leading-5">Track vaccinations, checkups, and illness history.</Text>
                    <Button 
                        title="View Records" 
                        className="bg-blue-500 h-12" 
                        onPress={() => navigation.navigate('HealthLog', { catId: currentCat.id, catName: currentCat.name })}
                    />
                </View>
                <View className="bg-white border border-pink-100 p-5 rounded-3xl shadow-sm flex-row items-center justify-between">
                     <View>
                        <Text className="text-primary font-bold text-lg">Log New Event</Text>
                        <Text className="text-gray-400 text-xs mt-1">Add checkups, illnesses, etc.</Text>
                     </View>
                     <TouchableOpacity 
                        className="bg-primary w-12 h-12 rounded-2xl justify-center items-center shadow-md shadow-primary/30"
                        onPress={() => navigation.navigate('AddHealthEvent', { catId: currentCat.id, catName: currentCat.name })}
                    >
                        <Text className="text-white font-bold text-2xl">+</Text>
                     </TouchableOpacity>
                </View>
            </View>
            )}

            {activeTab === 'Family' && (
            <View className="gap-6">
                <View className="bg-purple-50 p-6 rounded-3xl">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-purple-600 font-bold text-xl">Lineage</Text>
                        <TouchableOpacity 
                            className="bg-purple-200 px-3 py-1 rounded-lg"
                            onPress={() => navigation.navigate('FamilyTree', { catId: currentCat.id })}
                        >
                            <Text className="text-purple-700 font-bold text-xs uppercase">View Tree</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <InfoRow label="Mother (Dam)" value={currentCat.mother?.name || 'Unknown'} />
                    <InfoRow label="Father (Sire)" value={currentCat.father?.name || 'Unknown'} />
                </View>
                
                <View className="bg-white border border-gray-100 p-6 rounded-3xl">
                     <Text className="text-secondary font-bold text-xl mb-4">Offspring</Text>
                     <View className="flex-row flex-wrap gap-2">
                        {[...(currentCat.childrenMother || []), ...(currentCat.childrenFather || [])].map((child: any) => (
                             <TouchableOpacity 
                                key={child.id} 
                                className="bg-gray-100 px-4 py-3 rounded-2xl"
                                onPress={() => {
                                    navigation.push('CatDetails', { catId: child.id });
                                }}
                            >
                                 <Text className="text-secondary font-bold text-sm">{child.name}</Text>
                             </TouchableOpacity>
                        ))}
                        {[...(currentCat.childrenMother || []), ...(currentCat.childrenFather || [])].length === 0 && (
                            <Text className="text-gray-400 italic">No offspring recorded.</Text>
                        )}
                     </View>
                </View>
            </View>
            )}
            
            {activeTab === 'Notes' && (
                <View className="bg-yellow-50 p-6 rounded-3xl min-h-[200px] justify-center items-center border border-yellow-100">
                    <Text className="text-3xl mb-2">📝</Text>
                    <Text className="text-yellow-700 font-bold text-lg">Notes & Behavior</Text>
                    <Text className="text-yellow-600/60 mt-2 text-center px-4">Log dietary preferences and behavioral traits here.</Text>
                </View>
            )}
        </ScrollView>
      </View>
    </View>
  );
};

const InfoRow = ({ label, value }: any) => (
  <View className="flex-row justify-between py-3 border-b border-gray-200/50 last:border-0">
    <Text className="text-gray-500 font-medium text-base">{label}</Text>
    <Text className="text-secondary font-bold text-base">{value}</Text>
  </View>
);
