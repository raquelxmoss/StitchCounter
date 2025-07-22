import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
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
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={project.isExpanded ? "chevron-down" : "chevron-forward"}
            size={20}
            color="#64748B"
          />
          <View style={styles.projectInfo}>
            <Text style={styles.projectName}>{project.name}</Text>
            {project.description && (
              <Text style={styles.projectDescription}>{project.description}</Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.counterCount}>
            {project.counters.length} counter{project.counters.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleDeleteProject}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

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
                <Ionicons name="add" size={16} color="#6366F1" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  projectInfo: {
    marginLeft: 12,
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  projectDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterCount: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 8,
  },
  menuButton: {
    padding: 4,
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
    backgroundColor: '#6366F1',
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
    color: '#6366F1',
    fontWeight: '500',
  },
});