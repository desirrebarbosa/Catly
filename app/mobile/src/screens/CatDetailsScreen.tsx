import React, { useEffect, useState, useRef } from 'react';
import { View as RNView, Text as RNText, Animated, Image as RNImage, TouchableOpacity as RNTouchableOpacity, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, PencilIcon } from 'react-native-heroicons/outline';
import { useCats } from '../context/CatContext';
import { Button } from '../components/ui/Button';

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.45; // 45% of screen height for header
const COLLAPSED_HEIGHT = 100;

export const CatDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { catId } = route.params;
  const { getCatDetails, deleteCat, currentCat, isLoading } = useCats();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Medical' | 'Family' | 'Notes'>('Overview');
  
  // Animation Value
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getCatDetails(catId);
  }, [catId]);

  const handleDelete = () => {
    Alert.alert('Delete Cat', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteCat(catId); navigation.goBack(); } }
    ]);
  };

  const calculateAge = (dateString: string) => {
      if(!dateString) return 'Unknown age';
      const birth = new Date(dateString);
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      if (months < 0) {
          years--;
          months += 12;
      }
      return `${years} years, ${months} months old`;
  };

  if (isLoading || !currentCat) {
    return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" color="#F5A9C8" /></View>;
  }

  // Animation Interpolations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - COLLAPSED_HEIGHT],
    outputRange: [HEADER_HEIGHT, COLLAPSED_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - COLLAPSED_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View className="flex-1 bg-white">
      {/* Animated Header Image (Behind) */}
      <Animated.View 
        style={{ 
            height: headerHeight, 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 0,
            opacity: imageOpacity
        }}
      >
        <Image 
            source={{ uri: currentCat.photoUrl || 'https://placekitten.com/400/400' }} 
            className="w-full h-full" 
            resizeMode="cover" 
        />
        {/* Gradient Overlay for Text Readability */}
        <View className="absolute inset-0 bg-black/20" />
      </Animated.View>

      {/* Navigation Actions (Always on top) */}
      <View 
          style={{ paddingTop: insets.top + 10 }} 
          className="absolute w-full flex-row justify-between px-6 z-20"
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

      {/* Main Scroll Content */}
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 30 }} // Overlap slightly
        stickyHeaderIndices={[1]} // Stick the Tabs section
      >
        {/* 1. Cat Info Sheet (Rounded Top) */}
        <View className="bg-white rounded-t-[35px] px-6 pt-8 pb-4 shadow-2xl min-h-screen">
            <View className="items-center mb-4 border-b border-gray-100 pb-6">
                <Text className="text-3xl font-extrabold text-secondary mb-1 tracking-tight">{currentCat.name}</Text>
                {currentCat.nickname && (
                    <Text className="text-gray-400 font-bold italic mb-1">"{currentCat.nickname}"</Text>
                )}
                <Text className="text-secondaryLight text-base mb-3 font-medium">
                    {currentCat.breed || 'Domestic'} • {currentCat.gender}
                </Text>
                {currentCat.birthDate && (
                    <Text className="text-gray-400 text-sm mb-3">{calculateAge(currentCat.birthDate)}</Text>
                )}
                <View className="bg-primaryLight px-5 py-1.5 rounded-full">
                    <Text className="text-primaryDark font-bold text-sm">{currentCat.weight || '?'} kg</Text>
                </View>
            </View>

            {/* 2. Sticky Tabs (Index 1) */}
            <View className="bg-white pb-6 pt-2">
                <View className="flex-row justify-between px-2">
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
            </View>

            {/* 3. Tab Content */}
            <View className="pb-32">
                {activeTab === 'Overview' && (
                <View className="gap-6">
                    <View className="bg-primary/5 p-6 rounded-[30px] border border-primary/10">
                        <Text className="text-primaryDark font-bold text-xl mb-4">About {currentCat.name}</Text>
                        <InfoRow label="Date of Birth" value={currentCat.birthDate ? new Date(currentCat.birthDate).toDateString() : 'Unknown'} />
                        <InfoRow label="Spayed/Neutered" value={currentCat.isSpayed ? 'Yes' : 'No'} />
                        <InfoRow label="Color/Markings" value={currentCat.color || 'N/A'} />
                        <InfoRow label="Eye Color" value={currentCat.eyeColor || 'N/A'} />
                        <InfoRow label="Identifying Features" value={currentCat.features || 'None listed'} />
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
            </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const InfoRow = ({ label, value }: any) => (
  <View className="flex-row justify-between py-3 border-b border-gray-200/50 last:border-0">
    <Text className="text-gray-500 font-medium text-base">{label}</Text>
    <Text className="text-secondary font-bold text-base max-w-[50%] text-right" numberOfLines={2}>{value}</Text>
  </View>
);