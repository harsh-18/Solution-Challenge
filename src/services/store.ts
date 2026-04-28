// ============================================================
// ReliefSetu — Data Store (Demo Mode)
// In-memory reactive data store with local storage persistence
// ============================================================

import { Report, Task, Volunteer, Assignment, ImpactSummary, AuditLog, DuplicateCluster, ReportStatus, TaskStatus, AssignmentStatus } from '@/types/models'
import { SEED_REPORTS, SEED_TASKS, SEED_VOLUNTEERS, SEED_ASSIGNMENTS, SEED_IMPACT_SUMMARY, SEED_AUDIT_LOGS, SEED_DUPLICATE_CLUSTERS } from '@/data/seedData'

export type StoreListener = () => void

class DataStore {
  private reports: Report[] = []
  private tasks: Task[] = []
  private volunteers: Volunteer[] = []
  private assignments: Assignment[] = []
  private impactSummary: ImpactSummary = { ...SEED_IMPACT_SUMMARY }
  private auditLogs: AuditLog[] = []
  private duplicateClusters: DuplicateCluster[] = []
  private listeners: Set<StoreListener> = new Set()

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('reliefsetu_store')
      if (saved) {
        const data = JSON.parse(saved)
        this.reports = data.reports || [...SEED_REPORTS]
        this.tasks = data.tasks || [...SEED_TASKS]
        this.volunteers = data.volunteers || [...SEED_VOLUNTEERS]
        this.assignments = data.assignments || [...SEED_ASSIGNMENTS]
        this.impactSummary = data.impactSummary || { ...SEED_IMPACT_SUMMARY }
        this.auditLogs = data.auditLogs || [...SEED_AUDIT_LOGS]
        this.duplicateClusters = data.duplicateClusters || [...SEED_DUPLICATE_CLUSTERS]
        return
      }
    } catch (e) {
      console.error('Failed to parse store data from local storage', e)
    }

    // Fallback to seed data
    this.reports = [...SEED_REPORTS]
    this.tasks = [...SEED_TASKS]
    this.volunteers = [...SEED_VOLUNTEERS]
    this.assignments = [...SEED_ASSIGNMENTS]
    this.impactSummary = { ...SEED_IMPACT_SUMMARY }
    this.auditLogs = [...SEED_AUDIT_LOGS]
    this.duplicateClusters = [...SEED_DUPLICATE_CLUSTERS]
  }

  private saveToStorage() {
    const data = {
      reports: this.reports,
      tasks: this.tasks,
      volunteers: this.volunteers,
      assignments: this.assignments,
      impactSummary: this.impactSummary,
      auditLogs: this.auditLogs,
      duplicateClusters: this.duplicateClusters,
    }
    localStorage.setItem('reliefsetu_store', JSON.stringify(data))
  }

  subscribe(listener: StoreListener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.saveToStorage()
    this.listeners.forEach(l => l())
  }

  // ---- Reports ----
  getReports() { return [...this.reports] }
  getReport(id: string) { return this.reports.find(r => r.id === id) }
  
  addReport(report: Report) {
    this.reports = [report, ...this.reports]
    this.notify()
  }
  
  updateReport(id: string, updates: Partial<Report>) {
    this.reports = this.reports.map(r => r.id === id ? { ...r, ...updates } : r)
    this.notify()
  }

  getReportsByStatus(status: ReportStatus) {
    return this.reports.filter(r => r.status === status)
  }

  // ---- Tasks ----
  getTasks() { return [...this.tasks] }
  getTask(id: string) { return this.tasks.find(t => t.id === id) }
  
  addTask(task: Task) {
    this.tasks = [task, ...this.tasks]
    this.notify()
  }
  
  updateTask(id: string, updates: Partial<Task>) {
    this.tasks = this.tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)
    this.notify()
  }

  getTasksByStatus(status: TaskStatus) {
    return this.tasks.filter(t => t.status === status)
  }

  getTasksByVolunteer(volunteerId: string) {
    return this.tasks.filter(t => t.assignedVolunteerId === volunteerId)
  }

  // ---- Volunteers ----
  getVolunteers() { return [...this.volunteers] }
  getVolunteer(id: string) { return this.volunteers.find(v => v.id === id) }
  
  updateVolunteer(id: string, updates: Partial<Volunteer>) {
    this.volunteers = this.volunteers.map(v => v.id === id ? { ...v, ...updates } : v)
    this.notify()
  }

  getAvailableVolunteers() {
    return this.volunteers.filter(v => v.isActive && v.availability !== 'offline' && v.currentLoad < v.maxWorkload)
  }

  // ---- Assignments ----
  getAssignments() { return [...this.assignments] }
  getAssignment(id: string) { return this.assignments.find(a => a.id === id) }
  
  addAssignment(assignment: Assignment) {
    this.assignments = [assignment, ...this.assignments]
    this.notify()
  }
  
  updateAssignment(id: string, updates: Partial<Assignment>) {
    this.assignments = this.assignments.map(a => a.id === id ? { ...a, ...updates } : a)
    this.notify()
  }

  getAssignmentsByTask(taskId: string) {
    return this.assignments.filter(a => a.taskId === taskId)
  }

  getAssignmentsByVolunteer(volunteerId: string) {
    return this.assignments.filter(a => a.volunteerId === volunteerId)
  }

  // ---- Impact ----
  getImpactSummary() { return { ...this.impactSummary } }

  // ---- Audit Logs ----
  getAuditLogs() { return [...this.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) }
  
  addAuditLog(log: AuditLog) {
    this.auditLogs = [log, ...this.auditLogs]
    this.notify()
  }

  // ---- Duplicate Clusters ----
  getDuplicateClusters() { return [...this.duplicateClusters] }
  
  addDuplicateCluster(cluster: DuplicateCluster) {
    this.duplicateClusters = [cluster, ...this.duplicateClusters]
    this.notify()
  }

  // ---- Stats ----
  getStats() {
    const tasks = this.tasks
    return {
      totalReports: this.reports.length,
      pendingReview: tasks.filter(t => t.status === TaskStatus.PENDING_REVIEW).length,
      extractedPending: this.reports.filter(r => r.status === ReportStatus.EXTRACTED).length,
      activeTasks: tasks.filter(t => [TaskStatus.APPROVED, TaskStatus.ASSIGNED, TaskStatus.ACCEPTED, TaskStatus.IN_PROGRESS].includes(t.status)).length,
      completedTasks: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      criticalTasks: tasks.filter(t => t.extractedNeed.urgency === 'critical' && t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED).length,
      volunteersDeployed: new Set(this.assignments.filter(a => [AssignmentStatus.ACCEPTED, AssignmentStatus.COMPLETED].includes(a.status)).map(a => a.volunteerId)).size,
      totalVolunteers: this.volunteers.filter(v => v.isActive).length,
      avgResponseTime: '25 min',
      duplicatesDetected: this.duplicateClusters.length,
    }
  }
}

// Singleton store
export const store = new DataStore()
