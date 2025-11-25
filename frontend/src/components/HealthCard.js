
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const HealthCard = ({ event, onPress }) => {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.date}>{formattedDate}</Text>
        <Text style={styles.title}>{event.title}</Text>
        
        {event.diagnosis ? (
          <Text style={styles.details} numberOfLines={1}>
            {event.diagnosis}
          </Text>
        ) : null}
        
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{event.eventType}</Text>
        </View>
      </View>

      <View style={styles.iconContainer}>
         <Text style={styles.arrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  content: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F5', // Light pink bg
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  iconContainer: {
    paddingLeft: 12,
  },
  arrow: {
    fontSize: 20,
    color: '#D1D5DB',
  },
});

export default HealthCard;
