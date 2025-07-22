import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Counter as CounterType } from '../types/schema';
import {
  useIncrementCounter,
  useDecrementCounter,
  useResetCounter,
  useDeleteCounter,
} from '../hooks/useProjects';
import EditCounterModal from './EditCounterModal';

interface CounterProps {
  counter: CounterType;
  projectId: string;
  isLinked: boolean;
  linkedCounters: CounterType[];
  allCounters?: CounterType[];
}

export default function Counter({
  counter,
  projectId,
  isLinked,
  linkedCounters,
  allCounters = [],
}: CounterProps) {
  const [showEdit, setShowEdit] = useState(false);
  const incrementCounter = useIncrementCounter();
  const decrementCounter = useDecrementCounter();
  const resetCounter = useResetCounter();
  const deleteCounter = useDeleteCounter();

  const getLinkedDescription = () => {
    if (counter.linkedToCounterId && counter.triggerValue) {
      const linkedCounter = linkedCounters.find(c => c.id === counter.linkedToCounterId);
      if (linkedCounter) {
        return `+${counter.step} every ${counter.triggerValue} ${linkedCounter.name.toLowerCase()}`;
      }
    }
    if (counter.isManuallyDisabled) {
      return "Auto-increment only";
    }
    return `+${counter.step} per tap`;
  };

  const formatRange = () => {
    const min = counter.min;
    const max = counter.max;
    
    // For very large max values, show a cleaner format
    if (max >= 999999) {
      return min === 0 ? "0+" : `${min}+`;
    }
    if (max >= 1000) {
      return `${min}-${Math.round(max / 1000)}k`;
    }
    return `${min}-${max}`;
  };

  const shouldShowRange = () => {
    // Only show range if max is not the default value (999999) or min is not 0
    return counter.max < 999999 || counter.min !== 0;
  };

  const isAtMax = counter.value >= counter.max;
  const isAtMin = counter.value <= counter.min;
  const isManuallyDisabled = counter.isManuallyDisabled;

  const handleIncrement = () => {
    incrementCounter.mutate({ projectId, counterId: counter.id });
  };

  const handleDecrement = () => {
    decrementCounter.mutate({ projectId, counterId: counter.id });
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Counter",
      `Reset "${counter.name}" to ${counter.min}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: () => resetCounter.mutate({ projectId, counterId: counter.id }),
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Counter",
      `Are you sure you want to delete "${counter.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteCounter.mutate({ projectId, counterId: counter.id }),
        },
      ]
    );
  };

  const getCardStyle = () => {
    if (isManuallyDisabled) return [styles.card, styles.cardAutoOnly];
    if (isAtMax) return [styles.card, styles.cardAtMax];
    if (isLinked) return [styles.card, styles.cardLinked];
    return styles.card;
  };

  return (
    <View style={getCardStyle()}>
      {isLinked && (
        <View style={styles.linkedIndicator}>
          <Ionicons name="link" size={12} color="white" />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.counterName}>{counter.name}</Text>
        <View style={styles.headerRight}>
          {isLinked && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Linked</Text>
            </View>
          )}
          {isManuallyDisabled && (
            <View style={[styles.badge, styles.autoOnlyBadge]}>
              <Text style={[styles.badgeText, styles.autoOnlyBadgeText]}>Auto-only</Text>
            </View>
          )}
          {shouldShowRange() && (
            <View style={[styles.badge, isAtMax ? styles.rangeMaxBadge : styles.rangeBadge]}>
              <Text style={[styles.badgeText, isAtMax ? styles.rangeMaxBadgeText : styles.rangeBadgeText]}>
                {formatRange()}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowEdit(true)}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Counter Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.decrementButton,
            (isAtMin || isManuallyDisabled) && styles.controlButtonDisabled,
          ]}
          onPress={handleDecrement}
          disabled={isAtMin || isManuallyDisabled}
        >
          <Ionicons
            name="remove"
            size={20}
            color={(isAtMin || isManuallyDisabled) ? "#C4B5FD" : "#A855F7"}
          />
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={[styles.value, isAtMax && styles.valueAtMax]}>
            {counter.value}
          </Text>
          <Text style={[styles.description, isManuallyDisabled && styles.descriptionAutoOnly]}>
            {getLinkedDescription()}
          </Text>
          {isAtMax && (
            <Text style={styles.maxWarning}>Maximum reached</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.incrementButton,
            (isAtMax || isManuallyDisabled) && styles.controlButtonDisabled,
            isAtMax && !isManuallyDisabled && styles.incrementButtonAtMax,
          ]}
          onPress={handleIncrement}
          disabled={isAtMax || isManuallyDisabled}
        >
          <Ionicons
            name="add"
            size={20}
            color={
              isAtMax || isManuallyDisabled
                ? "#94A3B8"
                : isAtMax && !isManuallyDisabled
                ? "white"
                : "white"
            }
          />
        </TouchableOpacity>
      </View>

      {/* Reset Button */}
      {!isManuallyDisabled && (
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={12} color="#64748B" />
          <Text style={styles.resetText}>Reset to {counter.min}</Text>
        </TouchableOpacity>
      )}

      {/* Edit Modal */}
      <EditCounterModal
        visible={showEdit}
        onClose={() => setShowEdit(false)}
        counter={counter}
        projectId={projectId}
        onDelete={handleDelete}
        existingCounters={allCounters.filter(c => c.id !== counter.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    position: 'relative',
  },
  cardLinked: {
    borderWidth: 2,
    borderColor: '#A855F7',
    backgroundColor: '#FAF7FF',
  },
  cardAtMax: {
    borderWidth: 2,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  cardAutoOnly: {
    backgroundColor: '#F3E8FF',
    borderWidth: 2,
    borderColor: '#C4B5FD',
  },
  linkedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: '#A855F7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  counterName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#A855F7',
  },
  autoOnlyBadge: {
    backgroundColor: '#DBEAFE',
  },
  autoOnlyBadgeText: {
    color: '#2563EB',
  },
  rangeBadge: {
    backgroundColor: '#F1F5F9',
  },
  rangeBadgeText: {
    color: '#64748B',
  },
  rangeMaxBadge: {
    backgroundColor: '#FECACA',
  },
  rangeMaxBadgeText: {
    color: '#DC2626',
  },
  menuButton: {
    padding: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  decrementButton: {
    borderColor: '#A855F7',
    backgroundColor: 'white',
  },
  incrementButton: {
    borderColor: '#A855F7',
    backgroundColor: '#A855F7',
  },
  incrementButtonAtMax: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  controlButtonDisabled: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  valueContainer: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  valueAtMax: {
    color: '#DC2626',
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  descriptionAutoOnly: {
    color: '#2563EB',
  },
  maxWarning: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '500',
    marginTop: 4,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 4,
  },
  resetText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
});