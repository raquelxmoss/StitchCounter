import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProjects, useAddProject } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import AddProjectModal from '../components/AddProjectModal';

export default function HomeScreen() {
  const { data: projects = [], isLoading } = useProjects();
  const [showAddProject, setShowAddProject] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Ionicons name="cut" size={24} color="#6366F1" />
            <Text style={styles.title}>StitchCounter</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {projects.length === 0 ? (
            // Empty State
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="cut" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Projects Yet</Text>
              <Text style={styles.emptyDescription}>
                Create your first knitting project to start tracking your progress.
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowAddProject(true)}
              >
                <Text style={styles.createButtonText}>Create Project</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Projects List
            <View>
              <View style={styles.projectsHeader}>
                <Text style={styles.projectsTitle}>Projects</Text>
                <View style={styles.filterContainer}>
                  <TouchableOpacity 
                    style={[styles.filterButton, showOnlyActive && styles.filterButtonActive]}
                    onPress={() => setShowOnlyActive(true)}
                  >
                    <Text style={[styles.filterButtonText, showOnlyActive && styles.filterButtonTextActive]}>
                      Active ({projects.filter(p => p.isActive).length})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.filterButton, !showOnlyActive && styles.filterButtonActive]}
                    onPress={() => setShowOnlyActive(false)}
                  >
                    <Text style={[styles.filterButtonText, !showOnlyActive && styles.filterButtonTextActive]}>
                      All ({projects.length})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {projects
                .filter(project => showOnlyActive ? project.isActive : true)
                .map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                  />
                ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      {projects.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddProject(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        visible={showAddProject}
        onClose={() => setShowAddProject(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 16,
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
  },
  settingsButton: {
    padding: 8,
  },
  main: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#F1F5F9',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  createButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  projectsHeader: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  projectsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#0F172A',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#6366F1',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});