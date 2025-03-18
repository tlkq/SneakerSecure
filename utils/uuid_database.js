// This file contains the list of verified UUIDs for sneakers
const verifiedUUIDs = [
  "d3b59a87-86f4-473a-8a96-78f5ccee853b",
  // Add more UUIDs as needed
];

export const checkUUIDVerification = (uuid) => {
  if (!uuid) return false;
  return verifiedUUIDs.includes(uuid);
};