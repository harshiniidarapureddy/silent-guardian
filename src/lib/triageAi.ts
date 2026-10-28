export interface TriageResult {
  message: string;
  isEmergency: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  specialist?: string;
}

export function evaluateSymptomTriage(input: string): TriageResult {
  const query = input.toLowerCase();

  // 1. Critical Red-Flag Emergency checks
  const isCardiac = (query.includes('chest pain') || query.includes('chest tightness') || query.includes('heart attack') || query.includes('pressure on chest') || (query.includes('chest') && (query.includes('sweat') || query.includes('arm') || query.includes('jaw'))));
  const isStroke = (query.includes('face drooping') || query.includes('slurred speech') || query.includes('arm weakness') || query.includes('stroke') || query.includes('loss of vision') || query.includes('one side numb'));
  const isSevereTrauma = (query.includes('unconscious') || query.includes('heavy bleeding') || query.includes('severe bleeding') || query.includes('cannot breathe') || query.includes('stopped breathing') || query.includes('choking') || query.includes('seizure'));

  if (isCardiac || isStroke || isSevereTrauma) {
    let emergencyReason = "acute cardiovascular signs";
    let specialist = "Emergency Medicine / Cardiologist";
    if (isStroke) {
      emergencyReason = "potential neurological or stroke indicators";
      specialist = "Emergency Care / Neurologist";
    } else if (isSevereTrauma) {
      emergencyReason = "severe respiratory or trauma signs";
      specialist = "Trauma & Emergency Services";
    }

    return {
      isEmergency: true,
      severity: 'critical',
      specialist,
      message: `🚨 SEEK EMERGENCY CARE NOW

Your description contains critical signs (${emergencyReason}) that require immediate in-person evaluation.

• Dial local emergency services (108 / 911) or have someone drive you to the nearest Emergency Department immediately.
• Stay calm and seated in a safe position. Do not exert yourself or walk unnecessarily.
• If chest pain is present with no aspirin allergy or bleeding disorder, medical protocols recommend resting until emergency responders arrive.
• Recommended Specialist: ${specialist}.

This is guidance, not a diagnosis.`,
    };
  }

  // 2. High severity
  if (query.includes('high fever') || query.includes('febrile') || query.includes('fracture') || query.includes('severe abdominal') || query.includes('vomiting blood') || query.includes('acute asthma') || query.includes('deep cut')) {
    return {
      isEmergency: false,
      severity: 'high',
      specialist: 'Urgent Care / General Physician',
      message: `I hear your concern. These symptoms require urgent medical evaluation today.

1. Severity Assessment: High urgency.
2. Recommended Specialist: Urgent Care Physician, General Surgeon, or Emergency Doctor.
3. Safe Next Steps: Rest comfortably, avoid eating solid foods if severe abdominal discomfort is present, and keep hydrated with small sips of water.
4. When to escalate: If pain intensifies, or if you develop sudden confusion, dizziness, or shortness of breath, proceed to an emergency facility immediately.

This is guidance, not a diagnosis.`,
    };
  }

  // 3. Medium severity (migraine, rashes, earache, sore throat, cough)
  if (query.includes('headache') || query.includes('migraine') || query.includes('rash') || query.includes('cough') || query.includes('throat') || query.includes('ear') || query.includes('stomach') || query.includes('cramp') || query.includes('joint') || query.includes('sprain')) {
    let spec = "General Physician or Internist";
    if (query.includes('headache') || query.includes('migraine')) spec = "Neurologist or Family Physician";
    if (query.includes('ear') || query.includes('throat')) spec = "ENT Specialist (Otolaryngologist)";
    if (query.includes('joint') || query.includes('sprain')) spec = "Orthopedic Specialist or Physiotherapist";
    if (query.includes('rash')) spec = "Dermatologist";

    return {
      isEmergency: false,
      severity: 'medium',
      specialist: spec,
      message: `Thank you for sharing your symptoms. Here is gentle guidance for what you are experiencing:

1. Likely Severity: Medium. While uncomfortable, it does not currently signal an acute emergency.
2. Recommended Specialist: ${spec}.
3. Safe Home-Care: Stay well hydrated, rest in a quiet low-light room if dealing with head pressure, and apply warm or cool compresses if helpful.
4. Watch Out For: High persistent fever above 102°F (39°C), sudden stiff neck, or inability to keep fluids down. If these emerge, consult a clinic promptly.

This is guidance, not a diagnosis.`,
    };
  }

  // 4. Low severity / General Wellness
  return {
    isEmergency: false,
    severity: 'low',
    specialist: 'Primary Care Physician / Teleconsultation',
    message: `Hello! I'm glad you checked in with Silent Guardian.

1. Likely Severity: Low / Mild symptoms.
2. Recommended Specialist: Primary Care Physician or Community Wellness Clinic.
3. Safe Self-Care: Ensure adequate sleep (7-8 hours), drink plenty of fluids, eat balanced meals, and monitor how you feel over the next 24-48 hours.
4. Clarifying note: How long have you felt this way, and are there any other symptoms accompanying it? If symptoms worsen or persist, please schedule a routine visit with your doctor.

This is guidance, not a diagnosis.`,
  };
}
