import React, { useEffect, useState } from 'react';
import { View as RNView, Text as RNText, Image as RNImage, ActivityIndicator as RNActivityIndicator, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;
const ActivityIndicator = RNActivityIndicator as any;

export const FamilyTreeScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { catId } = route.params;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`/cats/${catId}`).then(res => {
      if(res.success) setData(res.data.cat);
    });
  }, [catId]);

  if (!data) return <ActivityIndicator className="mt-20" color="#F5A9C8" />;

  const ParentNode = ({ label, cat }: any) => (
    <View className="items-center">
      <View className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-sm overflow-hidden mb-2">
        {cat ? <Image source={{ uri: cat.photoUrl || 'https://placekitten.com/100/100' }} className="w-full h-full" /> : <Text className="text-2xl text-center mt-5">❓</Text>}
      </View>
      <Text className="font-bold text-gray-700">{cat?.name || 'Unknown'}</Text>
      <Text className="text-xs text-gray-400 uppercase">{label}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="pt-14 px-5 pb-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}><Text className="text-primary font-bold text-lg">Back</Text></TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-gray-800 mr-10">Family Tree</Text>
      </View>
      
      <View className="items-center pt-10">
        <View className="flex-row w-full justify-around px-10 mb-5">
           <ParentNode label="Sire" cat={data.father} />
           <ParentNode label="Dam" cat={data.mother} />
        </View>

        {/* Lines */}
        <View className="w-40 h-10 border-t-2 border-l-2 border-r-2 border-gray-200 rounded-t-3xl -mt-5" />
        <View className="w-0.5 h-8 bg-gray-200" />

        {/* Child */}
        <View className="items-center mb-10">
           <View className="w-28 h-28 rounded-full bg-primary border-4 border-white shadow-md overflow-hidden justify-center items-center mb-2">
             <Image source={{ uri: data.photoUrl || 'https://placekitten.com/200/200' }} className="w-full h-full" />
           </View>
           <Text className="text-2xl font-bold text-gray-800">{data.name}</Text>
           <Text className="text-primary font-bold">The Star</Text>
        </View>

        <View className="w-full px-8">
          <View className="flex-row items-center mb-4">
             <Text className="text-xs font-bold text-gray-400 uppercase bg-white pr-2">Offspring</Text>
             <View className="h-[1px] bg-gray-200 flex-1" />
          </View>
          <View className="flex-row flex-wrap gap-4 justify-center">
            {[...(data.childrenMother || []), ...(data.childrenFather || [])].map((child: any) => (
              <View key={child.id} className="items-center">
                 <View className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden mb-1">
                   <Image source={{ uri: child.photoUrl || 'https://placekitten.com/50/50' }} className="w-full h-full" />
                 </View>
                 <Text className="text-xs text-gray-600">{child.name}</Text>
              </View>
            ))}
            {[...(data.childrenMother || []), ...(data.childrenFather || [])].length === 0 && (
               <Text className="text-gray-300 italic">No offspring recorded.</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};