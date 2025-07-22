import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Project } from '../types/schema';
import { useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import Counter from './Counter';
import AddCounterModal from './AddCounterModal';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [showAddCounter, setShowAddCounter] = useState(false);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const toggleExpanded = () => {
    updateProject.mutate({
      projectId: project.id,
      updates: { isExpanded: !project.isExpanded }
    });
  };

  const toggleActive = () => {
    updateProject.mutate({
      projectId: project.id,
      updates: { isActive: !project.isActive }
    });
  };

  const showProjectMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            'Cancel',
            `Mark as ${project.isActive ? 'Completed' : 'Active'}`,
            'Delete Project'
          ],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            toggleActive();
          } else if (buttonIndex === 2) {
            handleDeleteProject();
          }
        }
      );
    } else {
      // Android - show alert with options
      Alert.alert(
        'Project Options',
        'What would you like to do?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: `Mark as ${project.isActive ? 'Completed' : 'Active'}`, onPress: toggleActive },
          { text: 'Delete Project', style: 'destructive', onPress: handleDeleteProject },
        ]
      );
    }
  };

  const handleDeleteProject = () => {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteProject.mutate(project.id),
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        {/* First Row: Title, Status, Menu */}
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.expandButton} onPress={toggleExpanded}>
            <Ionicons
              name={project.isExpanded ? "chevron-down" : "chevron-forward"}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
          <View style={[styles.statusIndicator, project.isActive ? styles.statusActive : styles.statusCompleted]} />
          <Text style={styles.projectName}>{project.name}</Text>
          <View style={[styles.statusBadge, project.isActive ? styles.statusBadgeActive : styles.statusBadgeCompleted]}>
            <Text style={[styles.statusBadgeText, project.isActive ? styles.statusBadgeTextActive : styles.statusBadgeTextCompleted]}>
              {project.isActive ? 'Active' : 'Completed'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={showProjectMenu}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
        
        {/* Second Row: Description and Counter Count */}
        <View style={styles.headerBottom}>
          {project.description && (
            <Text style={styles.projectDescription}>{project.description}</Text>
          )}
          <Text style={styles.counterCount}>
            {project.counters.length} counter{project.counters.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Expanded Content */}
      {project.isExpanded && (
        <View style={styles.content}>
          {project.counters.length === 0 ? (
            <View style={styles.emptyCounters}>
              <Text style={styles.emptyCountersText}>No counters yet</Text>
              <TouchableOpacity
                style={styles.addFirstCounterButton}
                onPress={() => setShowAddCounter(true)}
              >
                <Text style={styles.addFirstCounterText}>Add Counter</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.counters}>
              {project.counters.map((counter) => {
                const linkedCounters = project.counters.filter(
                  c => c.linkedToCounterId === counter.id
                );
                const isLinked = project.counters.some(
                  c => c.linkedToCounterId === counter.id
                );

                return (
                  <Counter
                    key={counter.id}
                    counter={counter}
                    projectId={project.id}
                    isLinked={isLinked}
                    linkedCounters={linkedCounters}
                    allCounters={project.counters}
                  />
                );
              })}
              
              {/* Add Counter Button */}
              <TouchableOpacity
                style={styles.addCounterButton}
                onPress={() => setShowAddCounter(true)}
              >
                <Ionicons name="add" size={16} color="#A855F7" />
                <Text style={styles.addCounterText}>Add Counter</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Add Counter Modal */}
      <AddCounterModal
        visible={showAddCounter}
        onClose={() => setShowAddCounter(false)}
        projectId={project.id}
        existingCounters={project.counters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 28, // Align with content after chevron and dot
  },
  expandButton: {
    padding: 4,
    marginRight: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  statusActive: {
    backgroundColor: '#A7F3D0',
  },
  statusCompleted: {
    backgroundColor: '#C4B5FD',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusBadgeActive: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeCompleted: {
    backgroundColor: '#F3E8FF',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  statusBadgeTextActive: {
    color: '#059669',
  },
  statusBadgeTextCompleted: {
    color: '#7C3AED',
  },
  projectDescription: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    marginRight: 12,
  },
  counterCount: {
    fontSize: 12,
    color: '#64748B',
  },
  menuButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyCounters: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyCountersText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  addFirstCounterButton: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addFirstCounterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  counters: {
    gap: 12,
  },
  addCounterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  addCounterText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#A855F7',
    fontWeight: '500',
  },
});