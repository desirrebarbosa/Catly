
import React from 'react';
import { View as RNView, Text as RNText, TouchableOpacity as RNTouchableOpacity, ScrollView, Image as RNImage, Alert } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { ArrowRightOnRectangleIcon, PencilSquareIcon } from 'react-native-heroicons/outline';
import { UserCircleIcon } from 'react-native-heroicons/solid';

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;
const useNavigation = (ReactNavigation as any).useNavigation;

export const ProfileScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <View className="flex-1 bg-white">
       <View style={{ height: insets.top }} className="bg-primary" />
       
       <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Header / Banner */}
            <View className="bg-primary pb-12 pt-6 px-6 rounded-b-[40px] shadow-sm items-center z-10">
                <Text className="text-white text-lg font-bold mb-6 tracking-wide opacity-90">MY PROFILE</Text>
                
                <View className="w-28 h-28 bg-white p-1 rounded-full shadow-lg mb-4">
                    <View className="w-full h-full bg-gray-100 rounded-full items-center justify-center overflow-hidden">
                        {user?.photoUrl ? (
                             <Image source={{ uri: user.photoUrl }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                             <UserCircleIcon size={80} color="#D1D5DB" />
                        )}
                    </View>
                    <TouchableOpacity 
                        className="absolute bottom-0 right-0 bg-secondary w-9 h-9 rounded-full border-2 border-white items-center justify-center shadow-md"
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <PencilSquareIcon size={16} color="white" />
                    </TouchableOpacity>
                </View>
                
                <Text className="text-white text-2xl font-extrabold tracking-tight">{user?.name || 'Cat Parent'}</Text>
                <Text className="text-primaryLight font-medium mt-1">{user?.email}</Text>
            </View>

            {/* Info Cards */}
            <View className="px-6 -mt-8">
                <View className="bg-white p-6 rounded-[30px] shadow-lg shadow-black/5 border border-gray-100 mb-6">
                    <Text className="text-gray-400 text-xs font-extrabold uppercase mb-5 tracking-widest ml-1">Personal Details</Text>
                    
                    <InfoRow label="Full Name" value={user?.name || '-'} />
                    <InfoRow label="Email" value={user?.email || '-'} />
                    <InfoRow label="Phone" value={user?.phone || 'Not set'} />
                    <View className="pt-3">
                         <Text className="text-gray-400 font-medium text-sm mb-1">About</Text>
                         <Text className="text-secondary font-medium leading-5">{user?.about || 'No bio yet.'}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View className="gap-3">
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('EditProfile')}
                        className="bg-white border border-gray-100 p-4 rounded-2xl flex-row items-center justify-between shadow-sm active:bg-gray-50"
                    >
                        <View className="flex-row items-center">
                            <View className="bg-blue-50 p-2.5 rounded-xl mr-4">
                                <PencilSquareIcon size={20} color="#3B82F6" />
                            </View>
                            <Text className="text-secondary font-bold text-base">Edit Profile</Text>
                        </View>
                        <Text className="text-gray-300 font-bold">›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleLogout}
                        className="bg-red-50 border border-red-100 p-4 rounded-2xl flex-row items-center justify-between mt-2 active:bg-red-100"
                    >
                        <View className="flex-row items-center">
                             <View className="bg-red-100 p-2.5 rounded-xl mr-4">
                                <ArrowRightOnRectangleIcon size={20} color="#EF4444" />
                            </View>
                            <Text className="text-red-500 font-bold text-base">Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View className="items-center mt-10 mb-6">
                    <Text className="text-gray-300 text-xs font-bold">Catly App v1.0.0</Text>
                </View>
            </View>
       </ScrollView>
    </View>
  );
};

const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <View className="flex-row justify-between py-3 border-b border-gray-50 last:border-0">
        <Text className="text-gray-400 font-medium text-sm">{label}</Text>
        <Text className="text-secondary font-bold text-sm max-w-[60%] text-right">{value}</Text>
    </View>
);
