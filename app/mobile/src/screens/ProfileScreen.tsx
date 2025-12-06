
import React, { useState } from 'react';
import { View as RNView, Text as RNText, TouchableOpacity as RNTouchableOpacity, ScrollView, Image as RNImage, Alert, Switch, Modal, TextInput as RNTextInput, Clipboard } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { ArrowRightOnRectangleIcon, PencilSquareIcon, ShieldCheckIcon, DocumentDuplicateIcon } from 'react-native-heroicons/outline';
import { UserCircleIcon } from 'react-native-heroicons/solid';
import { Button } from '../components/ui/Button';

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;
const TextInput = RNTextInput as any;
const useNavigation = (ReactNavigation as any).useNavigation;

export const ProfileScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, logout, generate2FA, enable2FA, disable2FA } = useAuth();
  
  // 2FA Setup State
  const [showSetup, setShowSetup] = useState(false);
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout }
    ]);
  };
  
  const toggle2FA = async (value: boolean) => {
      if (value) {
          // Enable Flow
          setLoading(true);
          const res = await generate2FA();
          setLoading(false);
          if (res.success) {
              setSecret(res.data.base32);
              setShowSetup(true);
          } else {
              Alert.alert("Error", "Could not initiate 2FA setup.");
          }
      } else {
          // Disable Flow
          Alert.alert("Disable 2FA", "Are you sure you want to remove this security layer?", [
              { text: "Cancel", style: "cancel" },
              { text: "Disable", style: "destructive", onPress: async () => {
                  await disable2FA();
              }}
          ]);
      }
  };

  const confirmEnable2FA = async () => {
      if(code.length !== 6) return Alert.alert("Invalid Code", "Must be 6 digits");
      setLoading(true);
      const res = await enable2FA(code, secret);
      setLoading(false);
      if(res.success) {
          setShowSetup(false);
          setCode('');
          setSecret('');
          Alert.alert("Success", "Two-Factor Authentication is now active.");
      } else {
          Alert.alert("Error", "Invalid code. Please try again.");
      }
  };

  const copySecret = () => {
      Clipboard.setString(secret);
      Alert.alert("Copied", "Secret key copied to clipboard.");
  };

  return (
    <View className="flex-1 bg-white">
       <View style={{ height: insets.top }} className="bg-primary" />
       
       <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Header */}
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
                        className="absolute bottom-0 right-0 bg-secondary w-9 h-9 rounded-2xl border-2 border-white items-center justify-center shadow-md"
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <PencilSquareIcon size={16} color="white" />
                    </TouchableOpacity>
                </View>
                
                <Text className="text-white text-2xl font-extrabold tracking-tight">{user?.name || 'Cat Parent'}</Text>
                <Text className="text-primaryLight font-medium mt-1">{user?.email}</Text>
            </View>

            {/* Content */}
            <View className="px-6 mt-4">
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
                
                {/* Security Section */}
                <View >
                     {/* <View className="flex-row items-center mb-4">
                         <ShieldCheckIcon size={20} color="#3B82F6" />
                         <Text className="text-gray-400 text-xs font-extrabold uppercase tracking-widest ml-2">Security</Text>
                     </View>
                     <View className="flex-row items-center justify-between">
                         <View className="flex-1 mr-4">
                             <Text className="text-secondary font-bold text-base">Two-Factor Authentication</Text>
                             <Text className="text-gray-400 text-xs mt-1">Protect your account with an extra layer of security.</Text>
                         </View>
                         <Switch 
                            value={user?.is2FAEnabled || false}
                            onValueChange={toggle2FA}
                            trackColor={{ false: '#767577', true: '#F5A9C8' }}
                            thumbColor={user?.is2FAEnabled ? '#fff' : '#f4f3f4'}
                         />
                     </View> */}
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
            </View>
       </ScrollView>

       {/* 2FA Setup Modal */}
       <Modal visible={showSetup} animationType="slide" presentationStyle="pageSheet">
           <View className="flex-1 bg-white p-6">
               <View className="flex-row justify-between items-center mb-6 mt-4">
                   <Text className="text-2xl font-bold text-secondary">Setup 2FA</Text>
                   <TouchableOpacity onPress={() => setShowSetup(false)}><Text className="text-primary font-bold">Cancel</Text></TouchableOpacity>
               </View>

               <Text className="text-gray-500 mb-6 leading-6">
                   1. Install Google Authenticator or Authy.{'\n'}
                   2. Enter the secret key below manually.{'\n'}
                   3. Enter the 6-digit code to confirm.
               </Text>

               <View className="bg-gray-100 p-4 rounded-2xl flex-row justify-between items-center mb-8">
                   <Text className="text-secondary font-mono text-lg font-bold tracking-widest flex-1">{secret}</Text>
                   <TouchableOpacity onPress={copySecret} className="p-2">
                       <DocumentDuplicateIcon size={24} color="#3B82F6" />
                   </TouchableOpacity>
               </View>

               <TextInput 
                  className="bg-gray-50 border border-gray-200 rounded-2xl text-center text-3xl tracking-[10px] font-bold h-20 w-full mb-6 text-secondary"
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={setCode}
                  autoFocus
              />

              <Button title="Enable 2FA" onPress={confirmEnable2FA} loading={loading} />
           </View>
       </Modal>
    </View>
  );
};

const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <View className="flex-row justify-between py-3 border-b border-gray-50 last:border-0">
        <Text className="text-gray-400 font-medium text-sm">{label}</Text>
        <Text className="text-secondary font-bold text-sm max-w-[60%] text-right">{value}</Text>
    </View>
);
