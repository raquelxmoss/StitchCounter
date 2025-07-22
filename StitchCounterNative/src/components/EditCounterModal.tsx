import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ScrollView,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { Counter } from '../types/schema';
import { useUpdateCounter } from '../hooks/useProjects';

interface EditCounterModalProps {
  visible: boolean;
  onClose: () => void;
  counter: Counter;
  projectId: string;
  onDelete: () => void;
  existingCounters: Counter[];
}

export default function EditCounterModal({
  visible,
  onClose,
  counter,
  projectId,
  onDelete,
  existingCounters,
}: EditCounterModalProps) {
  const [name, setName] = useState(counter.name);
  const [min, setMin] = useState(counter.min.toString());
  const [max, setMax] = useState(counter.max.toString());
  const [step, setStep] = useState(counter.step.toString());
  const [hasLink, setHasLink] = useState(!!counter.linkedToCounterId);
  const [linkedToCounterId, setLinkedToCounterId] = useState(counter.linkedToCounterId || '');
  const [triggerValue, setTriggerValue] = useState(counter.triggerValue?.toString() || '10');
  const [isManuallyDisabled, setIsManuallyDisabled] = useState(counter.isManuallyDisabled);
  const updateCounter = useUpdateCounter();

  useEffect(() => {
    if (visible) {
      setName(counter.name);
      setMin(counter.min.toString());
      setMax(counter.max.toString());
      setStep(counter.step.toString());
      setHasLink(!!counter.linkedToCounterId);
      setLinkedToCounterId(counter.linkedToCounterId || '');
      setTriggerValue(counter.triggerValue?.toString() || '10');
      setIsManuallyDisabled(counter.isManuallyDisabled);
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

    const triggerVal = hasLink ? parseInt(triggerValue) : undefined;
    if (hasLink && (isNaN(triggerVal!) || triggerVal! <= 0)) {
      Alert.alert('Error', 'Trigger value must be a number greater than 0');
      return;
    }

    if (hasLink && !linkedToCounterId) {
      Alert.alert('Error', 'Please select a counter to link to');
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
          linkedToCounterId: hasLink ? linkedToCounterId : undefined,
          triggerValue: hasLink ? triggerVal : undefined,
          isManuallyDisabled,
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
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
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

          {/* Counter Linking */}
          <View style={styles.inputGroup}>
            <View style={styles.switchRow}>
              <Text style={[styles.label, existingCounters.length === 0 && styles.labelDisabled]}>
                Link to another counter
              </Text>
              <Switch
                value={hasLink}
                onValueChange={setHasLink}
                disabled={existingCounters.length === 0}
              />
            </View>
            {existingCounters.length === 0 && (
              <Text style={styles.helpText}>Create another counter first to enable linking</Text>
            )}
          </View>

          {hasLink && existingCounters.length > 0 && (
            <View style={styles.linkingSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Link to counter</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => {
                    if (Platform.OS === 'ios') {
                      const options = ['Cancel', ...existingCounters.map(c => c.name)];
                      ActionSheetIOS.showActionSheetWithOptions(
                        {
                          options,
                          cancelButtonIndex: 0,
                        },
                        (buttonIndex) => {
                          if (buttonIndex > 0) {
                            setLinkedToCounterId(existingCounters[buttonIndex - 1].id);
                          }
                        }
                      );
                    }
                  }}
                >
                  <Text style={styles.pickerButtonText}>
                    {linkedToCounterId 
                      ? existingCounters.find(c => c.id === linkedToCounterId)?.name || 'Select counter...'
                      : 'Select counter...'}
                  </Text>
                  <Text style={styles.pickerButtonArrow}>▼</Text>
                </TouchableOpacity>
                {Platform.OS === 'android' && (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={linkedToCounterId}
                      onValueChange={setLinkedToCounterId}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select counter..." value="" />
                      {existingCounters.map((c) => (
                        <Picker.Item
                          key={c.id}
                          label={c.name}
                          value={c.id}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Trigger every X counts</Text>
                <TextInput
                  style={styles.input}
                  value={triggerValue}
                  onChangeText={(text) => setTriggerValue(text.replace(/[^0-9]/g, ''))}
                  placeholder="10"
                  keyboardType="numeric"
                />
                <Text style={styles.helpText}>Auto-increment this counter every X counts of the linked counter</Text>
              </View>
            </View>
          )}

          {/* Manual Disable */}
          <View style={styles.inputGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Auto-increment only</Text>
              <Switch
                value={isManuallyDisabled}
                onValueChange={setIsManuallyDisabled}
              />
            </View>
            <Text style={styles.helpText}>Disable manual +/- buttons (can only be incremented automatically)</Text>
          </View>


          {/* Delete Button */}
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.deleteText}>Delete Counter</Text>
          </TouchableOpacity>
        </ScrollView>
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
    color: '#A855F7',
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
    color: '#A855F7',
    fontWeight: '500',
  },
  saveTextDisabled: {
    color: '#94A3B8',
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelDisabled: {
    color: '#94A3B8',
  },
  linkingSection: {
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E2E8F0',
    paddingLeft: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#0F172A',
  },
  pickerButtonArrow: {
    fontSize: 12,
    color: '#64748B',
  },
});