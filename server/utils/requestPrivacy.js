// Contact details of a blood request are private.
// They are visible only to the requester, the donor who accepted, and admins.
const PRIVATE_FIELDS = ['contactNumber', 'alternateContact', 'attendantName']

const idOf = (value) => String(value?._id || value || '')

const sanitizeRequestForUser = (request, user) => {
  const data =
    typeof request.toObject === 'function' ? request.toObject() : { ...request }

  const isOwner = idOf(data.requestedBy) === String(user._id)
  const isAssignedDonor =
    Boolean(data.acceptedBy) && idOf(data.acceptedBy) === String(user._id)

  if (isOwner || isAssignedDonor || user.role === 'admin') {
    return data
  }

  PRIVATE_FIELDS.forEach((field) => {
    delete data[field]
  })

  return data
}

module.exports = { sanitizeRequestForUser }