// ============================================================
// ReliefSetu — Volunteer Matching
// AI-powered volunteer recommendations for tasks
// ============================================================

import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { store } from '@/services/store'
import { useStore } from '@/hooks/useStore'
import { matchVolunteers } from '@/services/mockAi'
import { generateVolunteerBrief } from '@/services/gemini'
import { Task, TaskStatus, VolunteerMatch, AssignmentStatus } from '@/types/models'
import { UrgencyBadge, StatusChip, MatchScoreRing, LoadingSpinner, EmptyState, LanguageBadge, ConfidenceBar } from '@/components/ui'
import {
  UserCheck, MapPin, Clock, Wrench, Globe, Truck, Star,
  CheckCircle2, XCircle, Brain, ArrowRight, ChevronDown, Shield,
  Zap, Activity, Award
} from 'lucide-react'
import clsx from 'clsx'

export default function VolunteerMatching() {
  const location = useLocation()
  const navigate = useNavigate()
  const s = useStore()

  const approvedTasks = s.getTasks().filter(t => t.status === TaskStatus.APPROVED)
  const initialTaskId = (location.state as any)?.taskId || approvedTasks[0]?.id
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTaskId || null)
  const [matches, setMatches] = useState<VolunteerMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState<string | null>(null)

  const selectedTask = selectedTaskId ? s.getTask(selectedTaskId) : null

  useEffect(() => {
    if (selectedTask) {
      loadMatches(selectedTask)
    }
  }, [selectedTaskId])

  const loadMatches = async (task: Task) => {
    setLoading(true)
    const volunteers = store.getVolunteers()
    const result = await matchVolunteers(task, volunteers)
    setMatches(result)
    setLoading(false)
  }

  const handleAssign = async (match: VolunteerMatch) => {
    if (!selectedTask) return
    setAssigning(match.volunteer.id)

    try {
      // Generate task brief
      const taskBrief = await generateVolunteerBrief(selectedTask, match.volunteer)

      // Create assignment
      const assignmentId = `a_${Date.now()}`
      store.addAssignment({
        id: assignmentId,
        taskId: selectedTask.id,
        volunteerId: match.volunteer.id,
        volunteerName: match.volunteer.name,
        status: AssignmentStatus.APPROVED,
        taskBrief,
        matchScore: match.score,
        matchReason: match.reasons.map(r => `${r.factor}: ${r.detail}`).join('; '),
        proposedAt: new Date().toISOString(),
      })

      // Update task
      store.updateTask(selectedTask.id, {
        status: TaskStatus.ASSIGNED,
        assignedVolunteerId: match.volunteer.id,
        assignedVolunteerName: match.volunteer.name,
        taskBrief,
      })

      // Update volunteer
      store.updateVolunteer(match.volunteer.id, {
        currentLoad: match.volunteer.currentLoad + 1,
      })

      // Audit log
      store.addAuditLog({
        id: `al_${Date.now()}`, action: 'volunteer_assigned', userId: 'u2', userName: 'Rajesh Kumar',
        entityType: 'assignment', entityId: assignmentId, timestamp: new Date().toISOString(),
        details: `Assigned ${match.volunteer.name} to ${selectedTask.extractedNeed.category} (${match.score}% match)`,
        aiGenerated: false,
      })

      setAssigning(null)
      // Select next available approved task
      const remaining = store.getTasks().filter(t => t.status === TaskStatus.APPROVED)
      setSelectedTaskId(remaining.length > 0 ? remaining[0].id : null)
      setMatches([])
    } catch (error: any) {
      console.error('Failed to assign volunteer:', error)
      alert(`Assignment Failed: ${error.message || 'Please check your Gemini API key and try again.'}`)
      setAssigning(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-surface-900">Volunteer Matching</h1>
        <p className="text-sm text-surface-500">AI-powered volunteer recommendations based on skills, distance, language, and availability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Left: Task Selection */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-surface-700 mb-3">Tasks Awaiting Assignment ({approvedTasks.length})</h3>
          {approvedTasks.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-8 h-8" />}
              title="All tasks assigned"
              description="No tasks pending volunteer assignment."
              action={<button onClick={() => navigate('/coordinator/tasks')} className="btn-primary btn-sm">View Task Queue</button>}
            />
          ) : (
            <div className="space-y-2">
              {approvedTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={clsx(
                    'w-full text-left card p-3 border-l-4 transition-all',
                    selectedTaskId === task.id ? 'border-l-brand-600 ring-2 ring-brand-200 bg-brand-50/30' : 'border-l-surface-200 hover:border-l-brand-300'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <UrgencyBadge urgency={task.extractedNeed.urgency} size="sm" />
                  </div>
                  <p className="text-sm font-medium text-surface-800">{task.extractedNeed.category}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{task.extractedNeed.location.area}, {task.extractedNeed.location.city}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Volunteer Matches */}
        <div className="lg:col-span-3">
          {!selectedTask ? (
            <EmptyState
              icon={<UserCheck className="w-8 h-8" />}
              title="Select a task"
              description="Choose a task from the left to see AI-recommended volunteer matches."
            />
          ) : loading ? (
            <LoadingSpinner text="Gemini AI is analyzing volunteer profiles..." />
          ) : (
            <>
              {/* Selected task summary */}
              <div className="card p-4 mb-4 border-brand-100 bg-brand-50/20">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-semibold text-brand-700">Matching volunteers for:</span>
                </div>
                <h3 className="text-sm font-bold text-surface-800">{selectedTask.extractedNeed.category}</h3>
                <p className="text-xs text-surface-500 mt-1">{selectedTask.extractedNeed.summary}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedTask.extractedNeed.requiredSkills.map(s => (
                    <span key={s} className="badge bg-violet-50 text-violet-600 border border-violet-200 text-[10px]">{s}</span>
                  ))}
                  {selectedTask.extractedNeed.languageNeed.map(l => (
                    <LanguageBadge key={l} language={l} />
                  ))}
                </div>
              </div>

              {/* Matches */}
              {matches.length === 0 ? (
                <EmptyState
                  icon={<XCircle className="w-8 h-8" />}
                  title="No suitable volunteers"
                  description="No available volunteers match the task requirements. Consider broadening criteria."
                />
              ) : (
                <div className="space-y-3">
                  {matches.map((match, i) => (
                    <div key={match.volunteer.id} className="card p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                      <div className="flex items-start gap-4">
                        <MatchScoreRing score={match.score} size={56} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-surface-800">{match.volunteer.name}</h4>
                            {i === 0 && <span className="badge bg-amber-100 text-amber-700 text-[10px]"><Award className="w-3 h-3" /> Top Match</span>}
                          </div>

                          {/* Match reasons */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                            {match.reasons.map(r => (
                              <div key={r.factor} className="text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-surface-500">{r.factor}</span>
                                  <span className="font-semibold text-surface-700">{r.score}</span>
                                </div>
                                <div className="h-1.5 bg-surface-100 rounded-full mt-0.5">
                                  <div
                                    className={clsx('h-full rounded-full transition-all', r.score >= 15 ? 'bg-emerald-500' : r.score >= 10 ? 'bg-blue-500' : r.score >= 5 ? 'bg-amber-500' : 'bg-red-400')}
                                    style={{ width: `${Math.min((r.score / 30) * 100, 100)}%` }}
                                  />
                                </div>
                                <p className="text-[10px] text-surface-400 mt-0.5 truncate">{r.detail}</p>
                              </div>
                            ))}
                          </div>

                          {/* Volunteer details */}
                          <div className="flex flex-wrap gap-3 text-xs text-surface-500 mb-3">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {match.estimatedDistance} ({match.estimatedTime})</span>
                            <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {match.volunteer.transportMode}</span>
                            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {match.volunteer.currentLoad}/{match.volunteer.maxWorkload} load</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {match.volunteer.reliabilityScore}% reliable</span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {match.volunteer.skills.map(s => (
                              <span key={s} className="badge bg-surface-100 text-surface-600 text-[10px]">{s}</span>
                            ))}
                          </div>

                          <button
                            onClick={() => handleAssign(match)}
                            disabled={assigning === match.volunteer.id}
                            className="btn-primary btn-sm"
                          >
                            {assigning === match.volunteer.id ? 'Assigning...' : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Assign
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-surface-400 text-center mt-3 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" /> Coordinator approval required for all assignments
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
