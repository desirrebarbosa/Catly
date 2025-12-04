import React, { useEffect, useState, useCallback } from 'react';
import { View as RNView, Text as RNText, FlatList as RNFlatList, TouchableOpacity as RNTouchableOpacity, Alert, ActivityIndicator as RNActivityIndicator } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, PlusIcon, TrashIcon, ArrowDownTrayIcon } from 'react-native-heroicons/outline';
import { 
  HeartIcon, 
  BeakerIcon, 
  ClipboardDocumentCheckIcon, 
  ScissorsIcon, 
  ExclamationTriangleIcon,
  SparklesIcon
} from 'react-native-heroicons/solid';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import api from '../services/api';

const View = RNView as any;
const Text = RNText as any;
const TouchableOpacity = RNTouchableOpacity as any;
const ActivityIndicator = RNActivityIndicator as any;
const FlatList = RNFlatList as any;
const useNavigation = (ReactNavigation as any).useNavigation;
const useRoute = (ReactNavigation as any).useRoute;
const useFocusEffect = (ReactNavigation as any).useFocusEffect;

export const HealthLogScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { catId, catName } = (route.params as any);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    const res = await api.get(`/cats/${catId}/health`);
    if (res.success) setEvents(res.data.events);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [catId])
  );

  const generatePDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; }
            h1 { color: #F5A9C8; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; color: #333; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; color: white; background-color: #999; }
          </style>
        </head>
        <body>
          <h1>Health Record: ${catName}</h1>
          <p>Generated on ${new Date().toDateString()}</p>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Title</th>
                <th>Diagnosis</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${events.map(e => `
                <tr>
                  <td>${new Date(e.date).toDateString()}</td>
                  <td><span class="badge" style="background-color: #F5A9C8;">${e.eventType}</span></td>
                  <td>${e.title}</td>
                  <td>${e.diagnosis || '-'}</td>
                  <td>${e.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'Could not generate PDF');
    }
  };

  const handleDelete = (eventId: string) => {
    Alert.alert("Delete Record", "Are you sure you want to remove this health event?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            await api.delete(`/cats/health/${eventId}`);
            fetchEvents();
        }}
    ]);
  };

  const getEventMeta = (type: string) => {
      switch(type) {
          case 'Vaccination': 
            return { icon: <BeakerIcon size={18} color="white" />, color: 'bg-green-400', border: 'border-green-100' };
          case 'Illness': 
            return { icon: <ExclamationTriangleIcon size={18} color="white" />, color: 'bg-red-400', border: 'border-red-100' };
          case 'Checkup': 
            return { icon: <ClipboardDocumentCheckIcon size={18} color="white" />, color: 'bg-blue-400', border: 'border-blue-100' };
          case 'Surgery': 
            return { icon: <ScissorsIcon size={18} color="white" />, color: 'bg-pink-500', border: 'border-pink-100' };
          case 'Medication': 
            return { icon: <SparklesIcon size={18} color="white" />, color: 'bg-purple-400', border: 'border-purple-100' };
          default: 
            return { icon: <HeartIcon size={18} color="white" />, color: 'bg-gray-400', border: 'border-gray-100' };
      }
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isLast = index === events.length - 1;
    const meta = getEventMeta(item.eventType);
    const dateObj = new Date(item.date);
    
    return (
        <View className="flex-row px-6">
            {/* Timeline Left */}
            <View className="items-center mr-4 w-8">
                <View className={`w-8 h-8 rounded-full items-center justify-center shadow-sm z-10 ${meta.color}`}>
                    {meta.icon}
                </View>
                {!isLast && <View className="w-0.5 flex-1 bg-gray-200 my-1" />}
            </View>

            {/* Content Card */}
            <View className="flex-1 pb-6">
                <View className={`bg-white p-4 rounded-2xl border shadow-sm ${meta.border}`}>
                    <View className="flex-row justify-between items-start mb-1">
                        <View className="flex-1 mr-2">
                             <Text className="text-secondary font-bold text-lg">{item.title}</Text>
                             <Text className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-2">
                                {dateObj.toDateString()}
                             </Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2 -mr-2 -mt-2 opacity-50">
                            <TrashIcon size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Event Type Badge */}
                    <View className="flex-row mb-3">
                         <View className={`${meta.color} px-2 py-0.5 rounded-md opacity-90`}>
                             <Text className="text-white text-[10px] font-bold uppercase">{item.eventType}</Text>
                         </View>
                    </View>

                    {item.diagnosis && (
                        <View className="bg-gray-50 px-3 py-2 rounded-xl mb-2">
                            <Text className="text-secondary text-sm font-semibold">Diagnosis: {item.diagnosis}</Text>
                        </View>
                    )}
                    
                    {item.notes ? (
                        <Text className="text-gray-500 leading-5 text-sm">{item.notes}</Text>
                    ) : null}
                </View>
            </View>
        </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top }} className="px-6 pb-4 flex-row items-center justify-between bg-primary z-20 shadow-sm">
        <View className="h-14 flex-row items-center justify-between w-full">
            <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="w-10 h-10 bg-white/20 items-center justify-center rounded-full backdrop-blur-md"
            >
            <ChevronLeftIcon size={24} color="white" strokeWidth={2.5} />
            </TouchableOpacity>
            <View className="items-center">
                <Text className="text-white text-lg font-bold">Health Timeline</Text>
                <Text className="text-white/80 text-xs font-medium">{catName}</Text>
            </View>
            <View className="flex-row gap-2">
                <TouchableOpacity 
                    className="bg-white/20 w-10 h-10 rounded-full justify-center items-center"
                    onPress={generatePDF}
                >
                    <ArrowDownTrayIcon size={20} color="white" strokeWidth={2.5} />
                </TouchableOpacity>
                <TouchableOpacity 
                className="bg-white w-10 h-10 rounded-full justify-center items-center shadow-lg shadow-black/10"
                onPress={() => navigation.navigate('AddHealthEvent', { catId, catName })}
                >
                <PlusIcon size={24} color="#F5A9C8" strokeWidth={3} />
                </TouchableOpacity>
            </View>
        </View>
      </View>

      <View className="flex-1 bg-gray-50 pt-8">
        {loading ? (
             <ActivityIndicator size="large" color="#F5A9C8" className="mt-10" />
        ) : (
            <FlatList
            data={events}
            keyExtractor={(item: any) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View className="items-center justify-center mt-20 opacity-50 px-10">
                    <ClipboardDocumentCheckIcon size={60} color="#D1D5DB" />
                    <Text className="text-gray-400 font-bold text-lg mt-4 text-center">No health records yet.</Text>
                    <Text className="text-gray-400 text-sm text-center leading-5 mt-1">
                        Keep track of vaccinations, checkups, and more by tapping the + button.
                    </Text>
                </View>
            }
            />
        )}
      </View>
    </View>
  );
};
