import React, { useState } from 'react';
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
import { Counter } from '../types/schema';
import { useAddCounter } from '../hooks/useProjects';

interface AddCounterModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  existingCounters: Counter[];
}

export default function AddCounterModal({
  visible,
  onClose,
  projectId,
  existingCounters,
}: AddCounterModalProps) {
  const [name, setName] = useState('');
  const [min, setMin] = useState('0');
  const [max, setMax] = useState('999999');
  const [step, setStep] = useState('1');
  const [hasLink, setHasLink] = useState(false);
  const [linkedToCounterId, setLinkedToCounterId] = useState('');
  const [triggerValue, setTriggerValue] = useState('10');
  const [isManuallyDisabled, setIsManuallyDisabled] = useState(false);
  const addCounter = useAddCounter();

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

    const counter: Counter = {
      id: `counter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      value: minValue,
      min: minValue,
      max: maxValue,
      step: stepValue,
      linkedToCounterId: hasLink ? linkedToCounterId : undefined,
      triggerValue: hasLink ? triggerVal : undefined,
      isManuallyDisabled,
    };

    addCounter.mutate(
      { projectId, counter },
      {
        onSuccess: () => {
          setName('');
          setMin('0');
          setMax('999999');
          setStep('1');
          setHasLink(false);
          setLinkedToCounterId('');
          setTriggerValue('10');
          setIsManuallyDisabled(false);
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setName('');
    setMin('0');
    setMax('999999');
    setStep('1');
    setHasLink(false);
    setLinkedToCounterId('');
    setTriggerValue('10');
    setIsManuallyDisabled(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Counter</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
            disabled={!name.trim() || addCounter.isPending}
          >
            <Text style={[styles.saveText, !name.trim() && styles.saveTextDisabled]}>
              {addCounter.isPending ? 'Adding...' : 'Add'}
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
              autoFocus
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
                      {existingCounters.map((counter) => (
                        <Picker.Item
                          key={counter.id}
                          label={counter.name}
                          value={counter.id}
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