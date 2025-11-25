import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleGenerativeAI } from "@google/generative-ai"; // Correct SDK import
import api from '../services/api.service';
import { COLORS } from '../constants/colors';
import globalStyles from '../constants/globalStyles';

const AddHealthEventScreen = ({ route, navigation }) => {
  // 1. Get Params safely
  const { catId } = route.params || {}; 

  // 2. State Management
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('Checkup');
  const [notes, setNotes] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [saving, setSaving] = useState(false);

  // 3. AI Analysis Function
  const analyzeSymptoms = async () => {
    // A. Input Validation
    if (!symptoms.trim()) {
      Alert.alert('Input Required', 'Please describe the symptoms first.');
      return;
    }

    // B. Check for API Key
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      Alert.alert("Configuration Error", "API Key not found in .env file.");
      return;
    }

    setIsAnalyzing(true);
    try {
      // C. Initialize Gemini
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        A user is reporting these symptoms for their cat: "${symptoms}". 
        Provide a response in exactly this format:
        
        **Assessment:** [Urgent/Routine/Monitor]
        **Category:** [Illness/Injury/etc]
        **Advice:** [1 short sentence of immediate advice]
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setAiSuggestion(text);
    } catch (error) {
      console.error("AI Error:", error);
      Alert.alert("AI Error", "Unable to analyze symptoms. Please check your internet connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 4. Save to Database Function
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Info", "Please enter an event title.");
      return;
    }

    setSaving(true);
    try {
      // Combine manual notes with AI insights for the backend
      const finalNotes = [
        notes,
        symptoms ? `\n--- Symptoms ---\n${symptoms}` : '',
        aiSuggestion ? `\n--- AI Assessment ---\n${aiSuggestion}` : ''
      ].filter(Boolean).join('\n');

      const payload = {
        catId,
        title,
        eventType,
        notes: finalNotes,
        date: new Date().toISOString(),
        diagnosis: symptoms ? 'Symptomatic' : 'Routine'
      };

      // Ensure your api.service.js is pointing to the correct Render URL
      await api.post(`/cats/${catId}/health`, payload);
      
      Alert.alert("Success", "Health event saved successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", "Failed to save event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Helper Component for Type Pills
  const EventTypePill = ({ type }) => (
    <TouchableOpacity
      onPress={() => setEventType(type)}
      style={[
        styles.pill, 
        eventType === type ? styles.pillActive : styles.pillInactive
      ]}
    >
      <Text style={eventType === type ? styles.pillTextActive : styles.pillTextInactive}>
        {type}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.containerPrimary}>
      {/* Header */}
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Text style={styles.backText}>←</Text>
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Add Health Event</Text>
         <View style={{width: 40}} /> 
      </View>

      {/* Main Content */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{flex: 1}}
      >
        <ScrollView style={styles.formContainer} contentContainerStyle={{paddingBottom: 40}}>
          
          {/* Title Input */}
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="e.g. Annual Check-up"
            placeholderTextColor={COLORS.gray}
            value={title}
            onChangeText={setTitle}
          />

          {/* Event Type Selection */}
          <Text style={styles.label}>Event Type</Text>
          <View style={styles.pillContainer}>
            {['Checkup', 'Vaccination', 'Illness', 'Surgery', 'Other'].map(type => (
              <EventTypePill key={type} type={type} />
            ))}
          </View>

          {/* Symptoms Input */}
          <Text style={styles.label}>Symptoms / Observations</Text>
          <TextInput
            style={[globalStyles.input, styles.textArea]}
            placeholder="Is the cat eating? Lethargic? Vomiting?"
            placeholderTextColor={COLORS.gray}
            multiline
            textAlignVertical="top"
            value={symptoms}
            onChangeText={setSymptoms}
          />
          
          {/* AI Button */}
          <TouchableOpacity 
            onPress={analyzeSymptoms} 
            disabled={isAnalyzing || !symptoms.trim()}
            style={[styles.aiButton, (!symptoms.trim() && styles.disabledAiButton)]}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color="#9333EA" />
            ) : (
              <Text style={styles.aiButtonText}>✨ Ask Gemini AI</Text>
            )}
          </TouchableOpacity>

          {/* AI Result Display */}
          {aiSuggestion ? (
            <View style={styles.aiResultBox}>
              <Text style={styles.aiResultTitle}>Gemini Analysis:</Text>
              <Text style={styles.aiResultText}>{aiSuggestion}</Text>
            </View>
          ) : null}

          {/* Additional Notes */}
          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={[globalStyles.input, styles.textArea]}
            placeholder="Veterinarian name, costs, medication instructions..."
            placeholderTextColor={COLORS.gray}
            multiline
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            style={[globalStyles.primaryButton, saving && globalStyles.disabledButton]}
            disabled={saving}
          >
            {saving ? (
               <ActivityIndicator color={COLORS.white} />
            ) : (
               <Text style={globalStyles.primaryButtonText}>Save Details</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 8,
    width: 40,
    alignItems: 'center',
  },
  backText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillInactive: {
    backgroundColor: COLORS.white,
    borderColor: '#E5E7EB',
  },
  pillTextActive: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  pillTextInactive: {
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 14,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  aiButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8B4FE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledAiButton: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  aiButtonText: {
    color: '#9333EA',
    fontWeight: 'bold',
    fontSize: 14,
  },
  aiResultBox: {
    backgroundColor: '#FAF5FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginTop: 10,
    marginBottom: 10,
  },
  aiResultTitle: {
    color: '#6B21A8',
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 14,
  },
  aiResultText: {
    color: '#581C87',
    fontSize: 14,
    lineHeight: 22,
  },
});

export default AddHealthEventScreen;