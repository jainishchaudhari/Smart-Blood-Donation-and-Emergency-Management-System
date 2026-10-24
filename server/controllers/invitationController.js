const mongoose = require('mongoose')
const BloodRequest = require('../models/BloodRequest')
const DonorInvitation = require('../models/DonorInvitation')
const User = require('../models/User')
const findNearbyDonors = require('../utils/findNearbyDonors')

const ALLOWED_RADII_KM = [5, 10, 25, 50]
const MAX_PER_SEND = 5

// Minutes a donor has to respond (set INVITATION_EXPIRY_MINUTES in .env)
const getExpiryMinutes = () => {
  const minutes = Number(process.env.INVITATION_EXPIRY_MINUTES)
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 30
}

// Pending invitations whose time ran out become "expired"
const expireStaleInvitations = (filter = {}) =>
  DonorInvitation.updateMany(
    { ...filter, status: 'pending', expiresAt: { $lt: new Date() } },
    { $set: { status: 'expired' } }
  )

// Loads a request and checks the user may manage it
const loadManageableRequest = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid blood request ID' })
    return null
  }

  const request = await BloodRequest.findById(id)

  if (!request) {
    res.status(404).json({ success: false, message: 'Blood request not found' })
    return null
  }

  const isOwner = String(request.requestedBy) === String(req.user._id)

  if (!isOwner && req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'You can only manage your own requests',
    })
    return null
  }

  return request
}

// POST /api/requests/:id/invitations
// Send the request to the nearest eligible donors that were not contacted yet
const sendInvitations = async (req, res) => {
  try {
    const request = await loadManageableRequest(req, res)
    if (!request) return

    if (request.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: 'This request is no longer waiting for a donor',
      })
    }

    if (
      typeof request.latitude !== 'number' ||
      typeof request.longitude !== 'number'
    ) {
      return res.status(400).json({
        success: false,
        message: 'This request has no map location',
      })
    }

    // Express 5: req.body is undefined when the request has no body
    const body = req.body || {}
    const count = Number(body.count ?? 1)
    const radiusKm = Number(body.radius ?? 10)

    if (!Number.isInteger(count) || count < 1 || count > MAX_PER_SEND) {
      return res.status(400).json({
        success: false,
        message: `You can contact 1 to ${MAX_PER_SEND} donors at a time`,
      })
    }

    if (!ALLOWED_RADII_KM.includes(radiusKm)) {
      return res.status(400).json({
        success: false,
        message: `Radius must be one of: ${ALLOWED_RADII_KM.join(', ')} km`,
      })
    }

    await expireStaleInvitations({ request: request._id })

    // Never contact the same donor twice (pending, rejected, expired...)
    const alreadyContacted = await DonorInvitation.find({
      request: request._id,
    }).distinct('donor')

    const donors = await findNearbyDonors({
      request,
      radiusKm,
      excludeIds: [...alreadyContacted, request.requestedBy],
      limit: count,
    })

    if (donors.length === 0) {
      return res.status(200).json({
        success: true,
        sent: 0,
        message: `No more eligible donors within ${radiusKm} km. Try a larger distance.`,
      })
    }

    const expiresAt = new Date(Date.now() + getExpiryMinutes() * 60 * 1000)
    const created = []

    for (const donor of donors) {
      try {
        const invitation = await DonorInvitation.create({
          request: request._id,
          donor: donor._id,
          distanceKm: Math.round((donor.distanceMeters / 1000) * 10) / 10,
          expiresAt,
        })

        created.push({ invitationId: invitation._id, name: donor.name })
      } catch (err) {
        // 11000 = duplicate: another click already invited this donor
        if (err.code !== 11000) throw err
      }
    }

    return res.status(201).json({
      success: true,
      sent: created.length,
      message:
        created.length === 1
          ? `Request sent to ${created[0].name}`
          : `Request sent to ${created.length} donors`,
    })
  } catch (error) {
    console.error('Send invitations error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while sending requests to donors',
    })
  }
}

// GET /api/requests/:id/invitations
// Which donors were contacted and what they answered (no phone / address)
const getRequestInvitations = async (req, res) => {
  try {
    const request = await loadManageableRequest(req, res)
    if (!request) return

    await expireStaleInvitations({ request: request._id })

    const invitations = await DonorInvitation.find({ request: request._id })
      .populate('donor', 'name bloodGroup city area')
      .sort({ sentAt: 1 })

    // Details of the donor who accepted (shared with the requester only).
    // Shared: name, phone, area/city, approximate distance.
    // Not shared: email, date of birth, exact address or coordinates.
    let acceptedDonor = null

    if (request.acceptedBy) {
      const donor = await User.findById(request.acceptedBy).select(
        'name phone bloodGroup city area'
      )

      const acceptedInvitation = invitations.find(
        (inv) => String(inv.donor?._id) === String(request.acceptedBy)
      )

      if (donor) {
        acceptedDonor = {
          name: donor.name,
          phone: donor.phone,
          bloodGroup: donor.bloodGroup,
          city: donor.city,
          area: donor.area,
          distanceKm: acceptedInvitation?.distanceKm ?? null,
        }
      }
    }

    return res.status(200).json({
      success: true,
      requestStatus: request.status,
      acceptedDonor,
      count: invitations.length,
      invitations: invitations.map((inv) => ({
        _id: inv._id,
        donorId: inv.donor?._id,
        name: inv.donor?.name || 'Donor',
        bloodGroup: inv.donor?.bloodGroup,
        city: inv.donor?.city,
        area: inv.donor?.area,
        distanceKm: inv.distanceKm,
        status: inv.status,
        sentAt: inv.sentAt,
        expiresAt: inv.expiresAt,
        respondedAt: inv.respondedAt,
      })),
    })
  } catch (error) {
    console.error('Get request invitations error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching contacted donors',
    })
  }
}

// GET /api/invitations/my  (donor)
const getMyInvitations = async (req, res) => {
  try {
    await expireStaleInvitations({ donor: req.user._id })

    const invitations = await DonorInvitation.find({
      donor: req.user._id,
      status: { $in: ['pending', 'accepted'] },
    })
      .populate('request')
      .sort({ sentAt: -1 })

    const result = invitations
      .filter((inv) => {
        if (!inv.request) return false
        // A pending invitation is only useful while the request is still open
        if (inv.status === 'pending') return inv.request.status === 'pending'
        return true
      })
      .map((inv) => {
        const r = inv.request

        const item = {
          _id: inv._id,
          status: inv.status,
          sentAt: inv.sentAt,
          expiresAt: inv.expiresAt,
          distanceKm: inv.distanceKm,
          request: {
            _id: r._id,
            patientName: r.patientName,
            bloodGroup: r.bloodGroup,
            units: r.units,
            urgency: r.urgency,
            hospitalName: r.hospitalName,
            hospitalAddress: r.hospitalAddress,
            city: r.city,
            area: r.area,
            latitude: r.latitude,
            longitude: r.longitude,
            requiredBy: r.requiredBy,
            medicalCondition: r.medicalCondition,
            notes: r.notes,
            status: r.status,
          },
        }

        // Contact details are shared only after the donor has accepted
        if (inv.status === 'accepted') {
          item.request.contactNumber = r.contactNumber
          item.request.attendantName = r.attendantName
        }

        return item
      })

    return res.status(200).json({
      success: true,
      count: result.length,
      invitations: result,
    })
  } catch (error) {
    console.error('My invitations error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching your requests',
    })
  }
}

// Loads one of the donor's own pending invitations
const loadMyPendingInvitation = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid invitation ID' })
    return null
  }

  const invitation = await DonorInvitation.findOne({
    _id: id,
    donor: req.user._id,
  })

  if (!invitation) {
    res.status(404).json({ success: false, message: 'Request not found' })
    return null
  }

  if (invitation.status !== 'pending') {
    res.status(409).json({
      success: false,
      message: `This request is already ${invitation.status}`,
    })
    return null
  }

  if (invitation.expiresAt < new Date()) {
    invitation.status = 'expired'
    await invitation.save()

    res.status(410).json({
      success: false,
      message: 'This request has expired',
    })
    return null
  }

  return invitation
}

// PATCH /api/invitations/:id/accept  (donor)
const acceptInvitation = async (req, res) => {
  try {
    const invitation = await loadMyPendingInvitation(req, res)
    if (!invitation) return

    // Atomic: only one donor can win the request
    const assigned = await BloodRequest.findOneAndUpdate(
      { _id: invitation.request, status: 'pending', acceptedBy: null },
      { $set: { status: 'accepted', acceptedBy: req.user._id } },
      { new: true }
    )

    if (!assigned) {
      invitation.status = 'cancelled'
      invitation.respondedAt = new Date()
      await invitation.save()

      return res.status(409).json({
        success: false,
        message: 'Sorry, this request was already accepted by someone else',
      })
    }

    invitation.status = 'accepted'
    invitation.respondedAt = new Date()
    await invitation.save()

    // Everyone else who was still waiting no longer needs to respond
    await DonorInvitation.updateMany(
      { request: invitation.request, status: 'pending', _id: { $ne: invitation._id } },
      { $set: { status: 'cancelled', respondedAt: new Date() } }
    )

    return res.status(200).json({
      success: true,
      message: 'Thank you! You have accepted this request.',
    })
  } catch (error) {
    console.error('Accept invitation error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while accepting the request',
    })
  }
}

// PATCH /api/invitations/:id/reject  (donor)
const rejectInvitation = async (req, res) => {
  try {
    const invitation = await loadMyPendingInvitation(req, res)
    if (!invitation) return

    invitation.status = 'rejected'
    invitation.respondedAt = new Date()
    await invitation.save()

    return res.status(200).json({
      success: true,
      message: 'You declined this request.',
    })
  } catch (error) {
    console.error('Reject invitation error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while declining the request',
    })
  }
}

// PATCH /api/invitations/:id/withdraw  (donor)
// An accepted donor can no longer come: the request goes back to "pending"
const withdrawInvitation = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid invitation ID' })
    }

    const invitation = await DonorInvitation.findOne({
      _id: id,
      donor: req.user._id,
      status: 'accepted',
    })

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'No accepted request found',
      })
    }

    const reopened = await BloodRequest.findOneAndUpdate(
      { _id: invitation.request, status: 'accepted', acceptedBy: req.user._id },
      { $set: { status: 'pending', acceptedBy: null } },
      { new: true }
    )

    if (!reopened) {
      return res.status(409).json({
        success: false,
        message: 'This request can no longer be withdrawn',
      })
    }

    invitation.status = 'withdrawn'
    invitation.respondedAt = new Date()
    await invitation.save()

    return res.status(200).json({
      success: true,
      message: 'You have withdrawn. The requester can now contact another donor.',
    })
  } catch (error) {
    console.error('Withdraw invitation error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while withdrawing',
    })
  }
}

// PATCH /api/requests/:id/status
// accepted -> in_progress  (assigned donor or requester)
// accepted / in_progress -> completed  (requester)
// pending / accepted / in_progress -> cancelled  (requester)
const TRANSITIONS = {
  in_progress: { from: ['accepted'], by: ['donor', 'owner'] },
  completed: { from: ['accepted', 'in_progress'], by: ['owner'] },
  cancelled: { from: ['pending', 'accepted', 'in_progress'], by: ['owner'] },
}

const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body || {}

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blood request ID' })
    }

    const rule = TRANSITIONS[status]

    if (!rule) {
      return res.status(400).json({
        success: false,
        message: 'Status must be in_progress, completed or cancelled',
      })
    }

    const request = await BloodRequest.findById(id)

    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found' })
    }

    const isOwner =
      String(request.requestedBy) === String(req.user._id) ||
      req.user.role === 'admin'

    const isAssignedDonor =
      request.acceptedBy &&
      String(request.acceptedBy) === String(req.user._id)

    const allowed =
      (rule.by.includes('owner') && isOwner) ||
      (rule.by.includes('donor') && isAssignedDonor)

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to make this change',
      })
    }

    // Atomic: only changes the request if it is still in an allowed state
    const updated = await BloodRequest.findOneAndUpdate(
      { _id: id, status: { $in: rule.from } },
      { $set: { status } },
      { new: true }
    )

    if (!updated) {
      return res.status(409).json({
        success: false,
        message: `This request is already ${request.status.replace('_', ' ')}`,
      })
    }

    if (status === 'cancelled') {
      await DonorInvitation.updateMany(
        { request: id, status: { $in: ['pending', 'accepted'] } },
        { $set: { status: 'cancelled', respondedAt: new Date() } }
      )
    }

    return res.status(200).json({
      success: true,
      message: `Request marked as ${status.replace('_', ' ')}`,
      request: updated,
    })
  } catch (error) {
    console.error('Update request status error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Server error while updating the request',
    })
  }
}

module.exports = {
  withdrawInvitation,
  updateRequestStatus,
  sendInvitations,
  getRequestInvitations,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
}