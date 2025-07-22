import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Counter } from '../types/schema';
import { useUpdateCounter } from '../hooks/useProjects';

interface EditCounterModalProps {
  visible: boolean;
  onClose: () => void;
  counter: Counter;
  projectId: string;
  onDelete: () => void;
}

export default function EditCounterModal({
  visible,
  onClose,
  counter,
  projectId,
  onDelete,
}: EditCounterModalProps) {
  const [name, setName] = useState(counter.name);
  const [min, setMin] = useState(counter.min.toString());
  const [max, setMax] = useState(counter.max.toString());
  const [step, setStep] = useState(counter.step.toString());
  const updateCounter = useUpdateCounter();

  useEffect(() => {
    if (visible) {
      setName(counter.name);
      setMin(counter.min.toString());
      setMax(counter.max.toString());
      setStep(counter.step.toString());
    }
  }, [visible, counter]);

  const handleSubmit = () => {
    if (name.trim() === '') {
      Alert.alert('Error', 'Counter name is required');
      return;
    }

    const minValue = parseInt(min);
    const maxValue = parseInt(max);
    const stepValue = parseInt(step);

    if (isNaN(minValue)) {
      Alert.alert('Error', 'Minimum value must be a valid number');
      return;
    }

    if (isNaN(maxValue)) {
      Alert.alert('Error', 'Maximum value must be a valid number');
      return;
    }

    if (isNaN(stepValue) || stepValue <= 0) {
      Alert.alert('Error', 'Step must be a number greater than 0');
      return;
    }

    if (minValue >= maxValue) {
      Alert.alert('Error', 'Minimum value must be less than maximum value');
      return;
    }

    // Adjust current value if it's outside new range
    let newValue = counter.value;
    if (newValue < minValue) newValue = minValue;
    if (newValue > maxValue) newValue = maxValue;

    updateCounter.mutate(
      {
        projectId,
        counterId: counter.id,
        updates: {
          name: name.trim(),
          min: minValue,
          max: maxValue,
          step: stepValue,
          value: newValue,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Counter</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
            disabled={!name.trim() || updateCounter.isPending}
          >
            <Text style={[styles.saveText, !name.trim() && styles.saveTextDisabled]}>
              {updateCounter.isPending ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Counter Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Rows, Stitches"
              maxLength={50}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Min Value</Text>
              <TextInput
                style={styles.input}
                value={min}
                onChangeText={(text) => setMin(text.replace(/[^-0-9]/g, ''))}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Max Value</Text>
              <TextInput
                style={styles.input}
                value={max}
                onChangeText={(text) => setMax(text.replace(/[^0-9]/g, ''))}
                placeholder="999999"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Step Size</Text>
            <TextInput
              style={styles.input}
              value={step}
              onChangeText={(text) => setStep(text.replace(/[^0-9]/g, ''))}
              placeholder="1"
              keyboardType="numeric"
            />
            <Text style={styles.helpText}>How much to increment/decrement by each tap</Text>
          </View>

          {/* Current Value Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#6366F1" />
            <Text style={styles.infoText}>
              Current value: {counter.value}
              {'\n'}Value will be adjusted if it falls outside the new range.
            </Text>
          </View>

          {/* Delete Button */}
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.deleteText}>Delete Counter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  cancelButton: {
    padding: 4,
    width: 80,
  },
  cancelText: {
    fontSize: 16,
    color: '#6366F1',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  saveButton: {
    padding: 4,
    width: 80,
    alignItems: 'flex-end',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '500',
  },
  saveTextDisabled: {
    color: '#94A3B8',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#0F172A',
  },
  helpText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  deleteText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 8,
  },
});