// ============================================================
// ReliefSetu — Core Data Models
// ============================================================

export enum UserRole {
  FIELD_WORKER = 'field_worker',
  COORDINATOR = 'coordinator',
  VOLUNTEER = 'volunteer',
  ADMIN = 'admin',
}

export enum Urgency {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum ReportStatus {
  SUBMITTED = 'submitted',
  EXTRACTING = 'extracting',
  EXTRACTED = 'extracted',
  DUPLICATE_FLAGGED = 'duplicate_flagged',
  TASK_CREATED = 'task_created',
  REJECTED = 'rejected',
}

export enum TaskStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AssignmentStatus {
  PROPOSED = 'proposed',
  APPROVED = 'approved',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

// ---- Users ----
export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  avatar?: string
  organizationId?: string
}

// ---- Location ----
export interface GeoLocation {
  lat: number
  lng: number
  address: string
  area: string
  city: string
  state: string
}

// ---- Reports ----
export interface Report {
  id: string
  rawText: string
  location: GeoLocation
  imageUrl?: string
  submittedBy: string
  submittedByName: string
  timestamp: string
  status: ReportStatus
  extractedNeed?: ExtractedNeed
  urgencyHint?: Urgency
  language?: string
}

export interface ExtractedNeed {
  category: string
  summary: string
  summaryHindi?: string
  affectedCount: number
  vulnerableGroups: string[]
  requiredSupplies: string[]
  requiredSkills: string[]
  urgencyScore: number // 1-10
  urgency: Urgency
  deadline?: string
  location: GeoLocation
  languageNeed: string[]
  confidence: number // 0-1
  missingInfo: string[]
  constraints: string[]
  reasoning: string
}

// ---- Tasks ----
export interface Task {
  id: string
  reportId: string
  extractedNeed: ExtractedNeed
  status: TaskStatus
  assignedVolunteerId?: string
  assignedVolunteerName?: string
  coordinatorNotes?: string
  approvedBy?: string
  approvalTimestamp?: string
  createdAt: string
  updatedAt: string
  taskBrief?: TaskBrief
  duplicateClusterId?: string
  priorityRank?: number
  priorityReason?: string
}

export interface TaskBrief {
  english: {
    whatToDo: string
    whatToCarry: string[]
    whereToGo: string
    whoToContact: string
    safetyNotes: string[]
    estimatedTime: string
  }
  hindi: {
    whatToDo: string
    whatToCarry: string[]
    whereToGo: string
    whoToContact: string
    safetyNotes: string[]
    estimatedTime: string
  }
}

// ---- Volunteers ----
export interface Volunteer {
  id: string
  userId: string
  name: string
  phone: string
  location: GeoLocation
  skills: string[]
  languages: string[]
  availability: 'available' | 'busy' | 'offline'
  transportMode: string
  maxWorkload: number
  currentLoad: number
  reliabilityScore: number // 0-100
  completedTasks: number
  joinedAt: string
  isActive: boolean
}

// ---- Assignments ----
export interface Assignment {
  id: string
  taskId: string
  volunteerId: string
  volunteerName: string
  status: AssignmentStatus
  taskBrief?: TaskBrief
  matchScore: number
  matchReason: string
  proposedAt: string
  acceptedAt?: string
  completedAt?: string
  rejectionReason?: string
}

// ---- Volunteer Match ----
export interface VolunteerMatch {
  volunteer: Volunteer
  score: number
  reasons: MatchReason[]
  estimatedDistance: string
  estimatedTime: string
}

export interface MatchReason {
  factor: string
  score: number
  detail: string
}

// ---- Duplicate Clusters ----
export interface DuplicateCluster {
  id: string
  reportIds: string[]
  similarity: number
  mergeStatus: 'pending' | 'merged' | 'kept_separate'
  detectedAt: string
}

// ---- Impact Summary ----
export interface ImpactSummary {
  id: string
  date: string
  totalReports: number
  tasksCompleted: number
  peopleHelped: number
  volunteersDeployed: number
  duplicatesMerged: number
  criticalResolved: number
  unresolvedCritical: number
  avgResponseTime: string
  topCategories: { category: string; count: number }[]
  topAreas: { area: string; count: number }[]
  narrative: string
  narrativeHindi: string
  recommendations: string[]
}

// ---- Audit Logs ----
export interface AuditLog {
  id: string
  action: string
  userId: string
  userName: string
  entityType: 'report' | 'task' | 'assignment' | 'volunteer'
  entityId: string
  timestamp: string
  details: string
  aiGenerated: boolean
}
