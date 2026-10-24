const User = require('../models/User')
const { getCompatibleDonorGroups } = require('./bloodCompatibility')

// Available, compatible donors near a blood request, nearest first.
// excludeIds: donor ids to skip (requester, already contacted donors)
const findNearbyDonors = async ({
  request,
  radiusKm,
  excludeIds = [],
  limit = 50,
}) => {
  return User.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [request.longitude, request.latitude],
        },
        key: 'location',
        distanceField: 'distanceMeters',
        maxDistance: radiusKm * 1000,
        spherical: true,
        query: {
          role: 'donor',
          isAvailable: true,
          profileCompleted: true,
          bloodGroup: { $in: getCompatibleDonorGroups(request.bloodGroup) },
          _id: { $nin: excludeIds },
        },
      },
    },
    { $limit: limit },
    { $project: { name: 1, bloodGroup: 1, city: 1, area: 1, distanceMeters: 1 } },
  ])
}

module.exports = findNearbyDonors