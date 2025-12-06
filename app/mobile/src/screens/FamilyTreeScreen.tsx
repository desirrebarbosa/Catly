
import React, { useEffect, useState } from 'react';
import { View as RNView, Text as RNText, Image as RNImage, ActivityIndicator as RNActivityIndicator, TouchableOpacity as RNTouchableOpacity, ScrollView } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;
const ActivityIndicator = RNActivityIndicator as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useRoute = (ReactNavigation as any).useRoute;

export const FamilyTreeScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { catId } = (route.params as any);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`/cats/${catId}`).then(res => {
      if(res.success) setData(res.data.cat);
    });
  }, [catId]);

  if (!data) return <ActivityIndicator className="mt-20" size="large" color="#F5A9C8" />;

  const ParentNode = ({ label, cat, color = "bg-gray-200" }: any) => (
    <View className="items-center z-10">
      <View className={`w-20 h-20 rounded-full ${color} border-4 border-white shadow-lg overflow-hidden mb-2`}>
        {cat ? (
            <Image source={{ uri: cat.photoUrl || 'https://placekitten.com/100/100' }} className="w-full h-full" resizeMode="cover" />
        ) : (
            <View className="items-center justify-center h-full"><Text className="text-2xl opacity-50">?</Text></View>
        )}
      </View>
      <View className="bg-white/80 px-3 py-1 rounded-full shadow-sm backdrop-blur-sm border border-white">
        <Text className="font-bold text-gray-700 text-sm text-center" numberOfLines={1}>{cat?.name || 'Unknown'}</Text>
      </View>
      <Text className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{label}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
        {/* Header */}
      <View 
        style={{ paddingTop: insets.top + 10, paddingBottom: 16 }} 
        className="px-5 flex-row items-center bg-white z-20 shadow-sm"
      >
        <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="mr-4 w-10 h-10 bg-gray-50 items-center justify-center rounded-2xl"
        >
             <ChevronLeftIcon size={24} color="#F5A9C8" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Family Tree</Text>
      </View>
      
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="items-center pt-10">
            
            {/* Parents Layer */}
            <View className="flex-row w-full justify-evenly px-4 mb-8 relative">
                <ParentNode label="Sire (Father)" cat={data.father} color="bg-blue-100" />
                <ParentNode label="Dam (Mother)" cat={data.mother} color="bg-pink-100" />
                
                {/* Connecting Curve */}
                <View className="absolute top-10 left-[25%] right-[25%] h-16 border-t-2 border-l-2 border-r-2 border-gray-300 rounded-t-[40px] -z-0" />
            </View>

            {/* Vertical Link */}
            <View className="w-0.5 h-10 bg-gray-300 -mt-10 mb-2 z-0" />

            {/* Child (Focal Point) */}
            <View className="items-center mb-12 z-10">
                <View className="relative">
                    <View className="w-32 h-32 rounded-full bg-primary border-[6px] border-white shadow-xl overflow-hidden mb-3">
                        <Image source={{ uri: data.photoUrl || 'https://placekitten.com/200/200' }} className="w-full h-full" resizeMode="cover" />
                    </View>
                    <View className="absolute -bottom-3 -right-3 bg-yellow-400 w-12 h-12 rounded-full border-4 border-white items-center justify-center shadow-md">
                        <Text className="text-xl">⭐</Text>
                    </View>
                </View>
                <Text className="text-3xl font-extrabold text-gray-800 mt-2">{data.name}</Text>
                <Text className="text-primary font-bold tracking-wide uppercase text-xs">Current Profile</Text>
            </View>

            {/* Offspring Section */}
            <View className="w-full px-6">
                <View className="flex-row items-center mb-6">
                    <View className="h-[1px] bg-gray-200 flex-1" />
                    <Text className="text-xs font-extrabold text-gray-400 uppercase bg-white px-4 tracking-widest">Offspring</Text>
                    <View className="h-[1px] bg-gray-200 flex-1" />
                </View>

                {/* Vertical Link from Child to Offspring */}
                <View className="absolute top-[-30px] left-[50%] w-0.5 h-8 bg-gray-200" />

                <View className="flex-row flex-wrap gap-4 justify-center">
                    {[...(data.childrenMother || []), ...(data.childrenFather || [])].map((child: any) => (
                    <TouchableOpacity 
                        key={child.id} 
                        className="items-center mb-4 bg-gray-50 p-3 rounded-2xl border border-gray-100 w-24"
                        onPress={() => navigation.push('CatDetails', { catId: child.id })}
                    >
                        <View className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden mb-2 border-2 border-white shadow-sm">
                            <Image source={{ uri: child.photoUrl || 'https://placekitten.com/50/50' }} className="w-full h-full" resizeMode="cover" />
                        </View>
                        <Text className="text-xs font-bold text-gray-600 text-center" numberOfLines={1}>{child.name}</Text>
                    </TouchableOpacity>
                    ))}
                    {[...(data.childrenMother || []), ...(data.childrenFather || [])].length === 0 && (
                        <View className="items-center py-6">
                            <Text className="text-gray-300 italic text-base">No recorded offspring.</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
      </ScrollView>
    </View>
  );
};
