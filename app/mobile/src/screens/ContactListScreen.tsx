
import React, { useState, useCallback } from 'react';
import { View as RNView, Text as RNText, FlatList as RNFlatList, TouchableOpacity as RNTouchableOpacity, Alert, Linking, TextInput as RNTextInput } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusIcon, PhoneIcon, TrashIcon, UserGroupIcon, HomeIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TouchableOpacity = RNTouchableOpacity as any;
const FlatList = RNFlatList as any;
const TextInput = RNTextInput as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useFocusEffect = (ReactNavigation as any).useFocusEffect;

export const ContactListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContacts = async () => {
    const res = await api.get('/contacts');
    if(res.success) setContacts(res.data.contacts);
  };

  useFocusEffect(useCallback(() => { fetchContacts(); }, []));

  const handleDelete = (id: string) => {
    Alert.alert('Delete Contact', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await api.delete(`/contacts/${id}`);
          fetchContacts();
      }}
    ]);
  };

  const filteredContacts = contacts.filter((item: any) => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => {
    const adoptedCats = item.adoptions 
        ? item.adoptions.map((a: any) => a.cat.name).join(', ') 
        : '';

    return (
        <TouchableOpacity 
            onLongPress={() => navigation.navigate('AddContact', { contact: item })}
            activeOpacity={0.7}
            className="bg-white p-5 rounded-[24px] mb-3 border border-gray-100 shadow-sm"
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <Text className="text-secondary font-bold text-lg">{item.name}</Text>
                    <Text className="text-primary font-bold text-xs uppercase mb-1">{item.role}</Text>
                    <Text className="text-gray-400 text-sm">{item.phone || 'No phone'}</Text>
                </View>
                <View className="flex-row gap-2">
                    {item.phone && (
                        <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} className="bg-green-100 p-3 rounded-2xl">
                            <PhoneIcon size={20} color="#16A34A" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDelete(item.id)} className="bg-red-50 p-3 rounded-2xl">
                        <TrashIcon size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Adopted Cats Badge */}
            {adoptedCats && (
                <View className="mt-4 bg-orange-50 border border-orange-100 px-3 py-2 rounded-xl flex-row items-center self-start">
                    <HomeIcon size={14} color="#F97316" />
                    <Text className="text-orange-600 text-xs font-bold ml-2">
                        Adopted: {adoptedCats}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top }} className="px-6 pb-6 bg-primary z-10 shadow-sm rounded-b-[32px]">
          <View className="h-14 flex-row items-center justify-between mb-2">
             <Text className="text-white text-2xl font-extrabold tracking-tight">Contacts</Text>
             <TouchableOpacity 
                onPress={() => navigation.navigate('AddContact')} 
                className="w-12 h-12 bg-white items-center justify-center rounded-2xl shadow-sm active:bg-gray-50"
             >
                <PlusIcon color="#F5A9C8" size={26} strokeWidth={2.5} />
             </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="bg-white rounded-2xl flex-row items-center px-4 h-12 shadow-sm">
              <MagnifyingGlassIcon size={20} color="#9CA3AF" />
              <TextInput 
                  className="flex-1 text-secondary text-base h-full font-medium ml-2"
                  placeholder="Search contacts..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
              />
          </View>
      </View>

      <View className="flex-1 bg-gray-50 pt-6 px-6">
        <FlatList 
            data={filteredContacts} 
            keyExtractor={(item: any) => item.id} 
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View className="items-center mt-20 opacity-50">
                    <UserGroupIcon size={60} color="#D1D5DB" />
                    <Text className="text-gray-400 mt-4 font-bold text-lg">No contacts found.</Text>
                </View>
            }
        />
      </View>
    </View>
  );
};
