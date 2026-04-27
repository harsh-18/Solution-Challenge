// ============================================================
// ReliefSetu — Mock AI Service (Demo Mode)
// Simulates Vertex AI Gemini responses
// ============================================================

import { ExtractedNeed, Urgency, GeoLocation, VolunteerMatch, MatchReason, Volunteer, Task, TaskBrief, ImpactSummary } from '@/types/models'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Simulate Gemini extraction from messy Hinglish text
export async function extractNeedFromReport(
  rawText: string,
  location: GeoLocation,
  _imageUrl?: string
): Promise<ExtractedNeed> {
  await delay(1500 + Math.random() * 1000) // Simulate API latency

  // Simple keyword-based extraction for demo
  const textLower = rawText.toLowerCase()
  
  let category = 'General Assistance'
  let urgencyScore = 5
  let urgency = Urgency.MEDIUM
  const vulnerableGroups: string[] = []
  const requiredSupplies: string[] = []
  const requiredSkills: string[] = []
  const constraints: string[] = []

  // Category detection
  if (textLower.includes('medicine') || textLower.includes('dawai') || textLower.includes('dawa') || textLower.includes('diabetes') || textLower.includes('medical')) {
    category = 'Medicine Delivery'
    requiredSkills.push('medicine pickup and delivery')
    urgencyScore = 7
  }
  if (textLower.includes('blood') || textLower.includes('khoon') || textLower.includes('rakt')) {
    category = 'Blood Donation'
    urgencyScore = 9
    requiredSkills.push('blood donation', 'hospital coordination')
  }
  if (textLower.includes('food') || textLower.includes('khana') || textLower.includes('bhojan') || textLower.includes('ration')) {
    category = 'Food Distribution'
    requiredSupplies.push('Food packets', 'Drinking water')
    requiredSkills.push('logistics', 'distribution')
  }
  if (textLower.includes('flood') || textLower.includes('baadh') || textLower.includes('paani bhar')) {
    category = category === 'General Assistance' ? 'Flood Relief' : category
    constraints.push('flood/waterlogging')
    urgencyScore = Math.max(urgencyScore, 8)
  }
  if (textLower.includes('shelter') || textLower.includes('ghar gir') || textLower.includes('tent') || textLower.includes('tarpaulin')) {
    category = 'Temporary Shelter'
    requiredSupplies.push('Tarpaulin', 'Blankets', 'Sleeping mats')
    requiredSkills.push('shelter setup')
    urgencyScore = 8
  }
  if (textLower.includes('heatwave') || textLower.includes('loo') || textLower.includes('garmi') || textLower.includes('heat')) {
    category = 'Heatwave Relief'
    requiredSupplies.push('Drinking water', 'ORS packets', 'Portable fans')
    urgencyScore = 7
  }
  if (textLower.includes('transport') || textLower.includes('wheelchair') || textLower.includes('hospital jaana')) {
    category = 'Transport Support'
    requiredSkills.push('driving')
    urgencyScore = 7
  }
  if (textLower.includes('school') || textLower.includes('notebook') || textLower.includes('pen') || textLower.includes('padhai')) {
    category = 'Education Supplies'
    requiredSupplies.push('Notebooks', 'Pens', 'School bags')
    urgencyScore = 4
  }

  // Vulnerable group detection
  if (textLower.includes('elderly') || textLower.includes('buzurg') || textLower.includes('boodhe')) {
    vulnerableGroups.push('elderly')
    urgencyScore = Math.min(urgencyScore + 1, 10)
  }
  if (textLower.includes('child') || textLower.includes('bachch') || textLower.includes('kids')) {
    vulnerableGroups.push('children')
  }
  if (textLower.includes('pregnant') || textLower.includes('garbhvati')) {
    vulnerableGroups.push('pregnant women')
    urgencyScore = Math.min(urgencyScore + 1, 10)
  }
  if (textLower.includes('disabled') || textLower.includes('wheelchair') || textLower.includes('divyang')) {
    vulnerableGroups.push('disabled person')
  }

  // Count detection
  let affectedCount = 1
  const numberMatch = rawText.match(/(\d+)\s*(log|people|parivaar|families|bachch|person|elderly)/i)
  if (numberMatch) {
    affectedCount = parseInt(numberMatch[1])
    if (rawText.toLowerCase().includes('parivaar') || rawText.toLowerCase().includes('families')) {
      affectedCount *= 4 // Rough family size
    }
  }

  // Language detection
  const languageNeed: string[] = ['Hindi']
  if (textLower.includes('english')) languageNeed.push('English')
  if (textLower.includes('bengali') || textLower.includes('bangla')) languageNeed.push('Bengali')
  if (textLower.includes('assamese')) languageNeed.push('Assamese')
  if (textLower.includes('marathi')) languageNeed.push('Marathi')

  if (urgencyScore >= 8) urgency = Urgency.CRITICAL
  else if (urgencyScore >= 6) urgency = Urgency.HIGH
  else if (urgencyScore >= 4) urgency = Urgency.MEDIUM
  else urgency = Urgency.LOW

  requiredSkills.push(`${languageNeed[0]} speaking`)

  return {
    category,
    summary: `${category} needed for ${affectedCount} ${vulnerableGroups.length > 0 ? vulnerableGroups.join(', ') : 'people'} in ${location.area}, ${location.city}. ${constraints.length > 0 ? 'Constraints: ' + constraints.join(', ') + '.' : ''}`,
    summaryHindi: `${location.area}, ${location.city} में ${affectedCount} ${vulnerableGroups.length > 0 ? 'कमजोर लोगों' : 'लोगों'} के लिए ${category} की आवश्यकता है।`,
    affectedCount,
    vulnerableGroups,
    requiredSupplies: requiredSupplies.length > 0 ? requiredSupplies : ['To be assessed on-site'],
    requiredSkills,
    urgencyScore,
    urgency,
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    location,
    languageNeed,
    confidence: 0.75 + Math.random() * 0.2,
    missingInfo: ['Exact address/landmark', 'Contact number of affected person'],
    constraints,
    reasoning: `AI analysis: Detected ${category.toLowerCase()} need based on keywords. ${vulnerableGroups.length > 0 ? `Vulnerable groups identified: ${vulnerableGroups.join(', ')}.` : ''} Urgency score ${urgencyScore}/10 based on time-sensitivity and vulnerability factors.`,
  }
}

// Simulate volunteer matching
export async function matchVolunteers(
  task: Task,
  volunteers: Volunteer[]
): Promise<VolunteerMatch[]> {
  await delay(1000 + Math.random() * 500)

  const need = task.extractedNeed

  return volunteers
    .filter(v => v.isActive && v.currentLoad < v.maxWorkload)
    .map(volunteer => {
      const reasons: MatchReason[] = []
      let totalScore = 0

      // Skill match
      const matchedSkills = volunteer.skills.filter(s =>
        need.requiredSkills.some(rs => rs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(rs.toLowerCase()))
      )
      const skillScore = Math.min((matchedSkills.length / Math.max(need.requiredSkills.length, 1)) * 30, 30)
      reasons.push({ factor: 'Skills', score: Math.round(skillScore), detail: matchedSkills.length > 0 ? `Matches: ${matchedSkills.join(', ')}` : 'No direct skill match' })
      totalScore += skillScore

      // Language match
      const langMatch = volunteer.languages.some(l => need.languageNeed.includes(l))
      const langScore = langMatch ? 15 : 0
      reasons.push({ factor: 'Language', score: langScore, detail: langMatch ? `Speaks: ${volunteer.languages.filter(l => need.languageNeed.includes(l)).join(', ')}` : 'Language gap' })
      totalScore += langScore

      // Availability
      const availScore = volunteer.availability === 'available' ? 15 : volunteer.availability === 'busy' ? 5 : 0
      reasons.push({ factor: 'Availability', score: availScore, detail: `Status: ${volunteer.availability}, Load: ${volunteer.currentLoad}/${volunteer.maxWorkload}` })
      totalScore += availScore

      // Reliability
      const relScore = (volunteer.reliabilityScore / 100) * 15
      reasons.push({ factor: 'Reliability', score: Math.round(relScore), detail: `${volunteer.reliabilityScore}% reliability, ${volunteer.completedTasks} tasks completed` })
      totalScore += relScore

      // Distance (simplified — same city = close)
      const sameCity = volunteer.location.city === need.location.city
      const sameState = volunteer.location.state === need.location.state
      const distScore = sameCity ? 20 : sameState ? 10 : 2
      reasons.push({ factor: 'Distance', score: distScore, detail: sameCity ? `Same city (${volunteer.location.city})` : sameState ? `Same state (${volunteer.location.state})` : `Different state` })
      totalScore += distScore

      // Transport match
      const transportNeeded = need.constraints.some(c => c.includes('boat'))
      const hasBoat = volunteer.transportMode.toLowerCase().includes('boat')
      const transportScore = transportNeeded && hasBoat ? 5 : !transportNeeded ? 5 : 0
      reasons.push({ factor: 'Transport', score: transportScore, detail: `Mode: ${volunteer.transportMode}` })
      totalScore += transportScore

      const estimatedKm = sameCity ? Math.floor(Math.random() * 10 + 2) : sameState ? Math.floor(Math.random() * 100 + 30) : Math.floor(Math.random() * 500 + 200)

      return {
        volunteer,
        score: Math.round(totalScore),
        reasons,
        estimatedDistance: `${estimatedKm} km`,
        estimatedTime: estimatedKm < 10 ? `${estimatedKm * 5} mins` : estimatedKm < 50 ? `${Math.round(estimatedKm / 30 * 60)} mins` : `${Math.round(estimatedKm / 50)} hours`,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Top 5 matches
}

// Simulate task brief generation
export async function generateVolunteerBrief(
  task: Task,
  volunteer: Volunteer
): Promise<TaskBrief> {
  await delay(800 + Math.random() * 500)

  const need = task.extractedNeed

  return {
    english: {
      whatToDo: `Respond to ${need.category.toLowerCase()} request in ${need.location.area}, ${need.location.city}. ${need.summary}`,
      whatToCarry: need.requiredSupplies.length > 0 ? [...need.requiredSupplies, 'First aid kit', 'ID card', 'Phone charger'] : ['First aid kit', 'ID card', 'Phone charger'],
      whereToGo: `${need.location.address} (${need.location.area}, ${need.location.city})`,
      whoToContact: `Field Worker: +91 98765 43210 | Coordinator: +91 98765 43211`,
      safetyNotes: [
        ...need.constraints.map(c => `Be cautious: ${c}`),
        'Keep coordinator updated on progress',
        'Do not take unnecessary risks',
        'Call emergency services if needed: 112',
      ],
      estimatedTime: `${Math.floor(Math.random() * 3 + 1)}-${Math.floor(Math.random() * 3 + 3)} hours`,
    },
    hindi: {
      whatToDo: `${need.location.area}, ${need.location.city} में ${need.category} अनुरोध का जवाब दें। ${need.summaryHindi || need.summary}`,
      whatToCarry: need.requiredSupplies.length > 0 ? [...need.requiredSupplies, 'फर्स्ट एड किट', 'पहचान पत्र', 'फोन चार्जर'] : ['फर्स्ट एड किट', 'पहचान पत्र', 'फोन चार्जर'],
      whereToGo: `${need.location.address} (${need.location.area}, ${need.location.city})`,
      whoToContact: `फील्ड वर्कर: +91 98765 43210 | कोऑर्डिनेटर: +91 98765 43211`,
      safetyNotes: [
        ...need.constraints.map(c => `सावधानी: ${c}`),
        'कोऑर्डिनेटर को प्रगति की जानकारी दें',
        'अनावश्यक जोखिम न लें',
        'ज़रूरत पड़ने पर इमरजेंसी सेवाओं को कॉल करें: 112',
      ],
      estimatedTime: `${Math.floor(Math.random() * 3 + 1)}-${Math.floor(Math.random() * 3 + 3)} घंटे`,
    },
  }
}

// Simulate impact summary
export async function generateImpactSummary(
  tasks: Task[],
): Promise<string> {
  await delay(1200)
  
  const completed = tasks.filter(t => t.status === 'completed').length
  const active = tasks.filter(t => ['assigned', 'accepted', 'in_progress'].includes(t.status)).length
  const critical = tasks.filter(t => t.extractedNeed.urgency === Urgency.CRITICAL).length

  return `Today's operations: ${tasks.length} total tasks tracked. ${completed} completed, ${active} currently active, ${critical} critical priority. The team showed strong response times, with the fastest assignment completed in under 30 minutes. Focus areas remain flood relief in Bihar/Assam and medical support in Delhi. Key recommendation: prioritize unresolved critical tasks in Assam camp and Silchar shelter situations.`
}

// Simulate duplicate detection
export async function findDuplicateReports(
  newNeedCategory: string,
  newNeedLocation: GeoLocation,
  existingReports: { id: string, category: string, location: GeoLocation }[]
): Promise<{ reportId: string, similarity: number }[]> {
  await delay(600)

  return existingReports
    .filter(r => {
      const sameArea = r.location.city === newNeedLocation.city
      const sameCategory = r.category.toLowerCase().includes(newNeedCategory.toLowerCase().split(' ')[0])
      return sameArea && sameCategory
    })
    .map(r => ({
      reportId: r.id,
      similarity: 0.6 + Math.random() * 0.35,
    }))
    .filter(r => r.similarity > 0.65)
}
