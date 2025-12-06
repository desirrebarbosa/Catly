
import React, { useEffect, useState, useCallback } from 'react';
import { View as RNView, Text as RNText, FlatList as RNFlatList, TouchableOpacity as RNTouchableOpacity, Alert, ActivityIndicator as RNActivityIndicator, Image as RNImage, Modal, ScrollView as RNScrollView } from 'react-native';
import * as ReactNavigation from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ChevronLeftIcon as ChevronLeftIconOutline, 
  PlusIcon as PlusIconOutline, 
  TrashIcon as TrashIconOutline, 
  ArrowDownTrayIcon as ArrowDownTrayIconOutline, 
  XMarkIcon as XMarkIconOutline
} from 'react-native-heroicons/outline';
import { 
  HeartIcon as HeartIconSolid, 
  BeakerIcon as BeakerIconSolid, 
  ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid, 
  ScissorsIcon as ScissorsIconSolid, 
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  SparklesIcon as SparklesIconSolid,
  PhotoIcon as PhotoIconSolid
} from 'react-native-heroicons/solid';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import api from '../services/api';

// Fix for icon type errors
const ChevronLeftIcon = ChevronLeftIconOutline as any;
const PlusIcon = PlusIconOutline as any;
const TrashIcon = TrashIconOutline as any;
const ArrowDownTrayIcon = ArrowDownTrayIconOutline as any;
const XMarkIcon = XMarkIconOutline as any;

const HeartIcon = HeartIconSolid as any;
const BeakerIcon = BeakerIconSolid as any;
const ClipboardDocumentCheckIcon = ClipboardDocumentCheckIconSolid as any;
const ScissorsIcon = ScissorsIconSolid as any;
const ExclamationTriangleIcon = ExclamationTriangleIconSolid as any;
const SparklesIcon = SparklesIconSolid as any;
const PhotoIcon = PhotoIconSolid as any;

const View = RNView as any;
const Text = RNText as any;
const Image = RNImage as any;
const TouchableOpacity = RNTouchableOpacity as any;
const ActivityIndicator = RNActivityIndicator as any;
const FlatList = RNFlatList as any;
const ScrollView = RNScrollView as any;

const useNavigation = (ReactNavigation as any).useNavigation;
const useRoute = (ReactNavigation as any).useRoute;
const useFocusEffect = (ReactNavigation as any).useFocusEffect;

const EVENT_TYPES = ['All', 'Checkup', 'Vaccination', 'Illness', 'Medication', 'Surgery', 'Procedure'];

export const HealthLogScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { catId, catName } = (route.params as any);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('All');

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

  const filteredEvents = events.filter(e => filterType === 'All' || e.eventType === filterType);

  const generatePDF = async () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Health Report - ${catName}</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
              body { 
                font-family: 'Inter', sans-serif; 
                padding: 40px; 
                color: #1F2937;
                background: #fff;
              }
              .header { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-end; 
                border-bottom: 3px solid #F5A9C8; 
                padding-bottom: 20px; 
                margin-bottom: 40px; 
              }
              .brand { font-size: 24px; font-weight: 900; color: #F5A9C8; letter-spacing: -0.5px; }
              .title h1 { margin: 0; font-size: 32px; font-weight: 800; color: #111; }
              .title h2 { margin: 5px 0 0; font-size: 14px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
              
              .meta-grid { 
                display: grid; 
                grid-template-columns: repeat(2, 1fr); 
                gap: 20px; 
                background: #F9FAFB; 
                padding: 20px; 
                border-radius: 12px; 
                margin-bottom: 40px; 
                border: 1px solid #E5E7EB;
              }
              .meta-item label { display: block; font-size: 11px; color: #9CA3AF; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
              .meta-item span { font-size: 18px; font-weight: 700; color: #374151; }
              
              .table-container { border-radius: 8px; overflow: hidden; border: 1px solid #E5E7EB; }
              table { width: 100%; border-collapse: collapse; }
              th { background: #F3F4F6; color: #4B5563; font-weight: 700; text-transform: uppercase; font-size: 11px; padding: 12px 16px; text-align: left; }
              td { border-top: 1px solid #E5E7EB; padding: 16px; vertical-align: top; }
              tr:nth-child(even) { background: #F9FAFB; }
              
              .date-cell { white-space: nowrap; font-weight: 600; color: #6B7280; font-size: 13px; }
              .badge { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: #EEF2FF; color: #4F46E5; }
              .badge.checkup { background: #DBEAFE; color: #1E40AF; }
              .badge.vaccination { background: #D1FAE5; color: #065F46; }
              .badge.illness { background: #FEE2E2; color: #991B1B; }
              
              .event-title { font-weight: 700; font-size: 15px; margin-bottom: 4px; display: block; color: #111; }
              .event-notes { font-size: 13px; color: #4B5563; line-height: 1.5; margin-top: 4px; }
              .event-diag { font-size: 13px; color: #059669; font-weight: 600; margin-top: 4px; }
              
              .footer { margin-top: 60px; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px; color: #9CA3AF; font-size: 12px; }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="title">
                  <h1>${catName}</h1>
                  <h2>Medical History Report</h2>
              </div>
              <div class="brand">Catly</div>
          </div>

          <div class="meta-grid">
              <div class="meta-item">
                  <label>Patient Name</label>
                  <span>${catName}</span>
              </div>
              <div class="meta-item">
                  <label>Total Records</label>
                  <span>${events.length}</span>
              </div>
              <div class="meta-item">
                  <label>Generated On</label>
                  <span>${new Date().toLocaleDateString()}</span>
              </div>
          </div>

          <div class="table-container">
              <table>
                  <thead>
                      <tr>
                          <th style="width: 15%">Date</th>
                          <th style="width: 15%">Type</th>
                          <th>Details</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${events.map(e => `
                        <tr>
                            <td class="date-cell">${new Date(e.date).toLocaleDateString()}</td>
                            <td><span class="badge ${e.eventType.toLowerCase()}">${e.eventType}</span></td>
                            <td>
                                <span class="event-title">${e.title}</span>
                                ${e.diagnosis ? `<div class="event-diag">Diagnosis: ${e.diagnosis}</div>` : ''}
                                ${e.notes ? `<div class="event-notes">${e.notes}</div>` : ''}
                            </td>
                        </tr>
                      `).join('')}
                  </tbody>
              </table>
          </div>

          <div class="footer">
              Generated by Catly App • Smart Cat Management
          </div>
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

  const handleEdit = (event: any) => {
    navigation.navigate('AddHealthEvent', { catId, catName, event });
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
    const isLast = index === filteredEvents.length - 1;
    const meta = getEventMeta(item.eventType);
    const dateObj = new Date(item.date);
    
    // Parse Images
    let photos: string[] = [];
    try {
        if(item.attachmentUrl) {
            if(item.attachmentUrl.startsWith('[')) {
                photos = JSON.parse(item.attachmentUrl);
            } else {
                photos = [item.attachmentUrl];
            }
        }
    } catch (e) {
        photos = [];
    }

    return (
        <View className="flex-row px-6">
            {/* Timeline Left */}
            <View className="items-center mr-4 w-8">
                <View className={`w-8 h-8 rounded-xl items-center justify-center shadow-sm z-10 ${meta.color}`}>
                    {meta.icon}
                </View>
                {!isLast && <View className="w-0.5 flex-1 bg-gray-200 my-1" />}
            </View>

            {/* Content Card */}
            <View className="flex-1 pb-6">
                <TouchableOpacity 
                    activeOpacity={0.8}
                    onLongPress={() => handleEdit(item)}
                    className={`bg-white p-4 rounded-[24px] border shadow-sm ${meta.border}`}
                >
                    <View className="flex-row justify-between items-start mb-1">
                        <View className="flex-1 mr-2">
                             <Text className="text-secondary font-bold text-lg">{item.title}</Text>
                             <Text className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-2">
                                {dateObj.toDateString()}
                             </Text>
                        </View>
                        <View className="flex-row gap-1">
                             <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2 -mr-2 -mt-2 bg-gray-50 rounded-xl">
                                <TrashIcon size={16} color="#EF4444" />
                             </TouchableOpacity>
                        </View>
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
                        <Text className="text-gray-500 leading-5 text-sm mb-3">{item.notes}</Text>
                    ) : null}

                    {photos.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                            {photos.map((uri, idx) => (
                                <TouchableOpacity key={idx} onPress={() => setViewImage(uri)} className="mr-2">
                                    <Image source={{ uri }} className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top }} className="bg-primary z-20 shadow-sm rounded-b-[32px]">
        <View className="px-6 pb-4">
            <View className="h-14 flex-row items-center justify-between w-full">
                <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                className="w-12 h-12 bg-white/20 items-center justify-center rounded-2xl backdrop-blur-md"
                >
                <ChevronLeftIcon size={24} color="white" strokeWidth={2.5} />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-white text-lg font-bold">Health Timeline</Text>
                    <Text className="text-white/80 text-xs font-medium">{catName}</Text>
                </View>
                <View className="flex-row gap-2">
                    <TouchableOpacity 
                        className="bg-white/20 w-12 h-12 rounded-2xl justify-center items-center"
                        onPress={generatePDF}
                    >
                        <ArrowDownTrayIcon size={20} color="white" strokeWidth={2.5} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                    className="bg-white w-12 h-12 rounded-2xl justify-center items-center shadow-lg shadow-black/10"
                    onPress={() => navigation.navigate('AddHealthEvent', { catId, catName })}
                    >
                    <PlusIcon size={26} color="#F5A9C8" strokeWidth={3} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>

        {/* Filters */}
        <View className="pb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                {EVENT_TYPES.map(type => (
                    <TouchableOpacity 
                        key={type}
                        onPress={() => setFilterType(type)}
                        className={`px-4 py-2 rounded-xl mr-2 ${filterType === type ? 'bg-white shadow-sm' : 'bg-white/20'}`}
                    >
                        <Text className={`text-xs font-bold ${filterType === type ? 'text-primary' : 'text-white'}`}>
                            {type}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <Text className="text-white/60 text-[10px] font-medium text-center mt-2">Long press a card to edit</Text>
        </View>
      </View>

      <View className="flex-1 bg-gray-50 pt-8">
        {loading ? (
             <ActivityIndicator size="large" color="#F5A9C8" className="mt-10" />
        ) : (
            <FlatList
            data={filteredEvents}
            keyExtractor={(item: any) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View className="items-center justify-center mt-20 opacity-50 px-10">
                    <ClipboardDocumentCheckIcon size={60} color="#D1D5DB" />
                    <Text className="text-gray-400 font-bold text-lg mt-4 text-center">No health records.</Text>
                    <Text className="text-gray-400 text-sm text-center leading-5 mt-1">
                        Try changing filters or tap + to add one.
                    </Text>
                </View>
            }
            />
        )}
      </View>

      {/* Image Modal */}
      <Modal visible={!!viewImage} transparent={true} animationType="fade">
           <View className="flex-1 bg-black/90 justify-center items-center">
                <TouchableOpacity 
                    onPress={() => setViewImage(null)}
                    className="absolute top-12 right-6 p-2 bg-white/20 rounded-full z-10"
                >
                    <XMarkIcon color="white" size={24} />
                </TouchableOpacity>
                {viewImage && (
                    <Image source={{ uri: viewImage }} className="w-full h-3/4" resizeMode="contain" />
                )}
           </View>
      </Modal>
    </View>
  );
};
