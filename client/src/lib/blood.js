export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

// Red blood cell compatibility: which groups a patient can receive from.
export const CAN_RECEIVE_FROM = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': [...BLOOD_GROUPS],
}

// Shows a proper minus sign instead of a hyphen.
export const formatGroup = (group) => group.replace(/-$/, '\u2212')
