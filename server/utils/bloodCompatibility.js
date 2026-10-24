// Red blood cell compatibility: which donor groups a patient can receive from.
const CAN_RECEIVE_FROM = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
}

// Returns the donor blood groups that are compatible with a patient group
const getCompatibleDonorGroups = (patientGroup) =>
  CAN_RECEIVE_FROM[patientGroup] || []

module.exports = { CAN_RECEIVE_FROM, getCompatibleDonorGroups }