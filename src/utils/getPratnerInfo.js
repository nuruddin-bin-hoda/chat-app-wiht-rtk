export default function getPartnerInfo(participants, email) {
  const partner = participants.find(
    (participant) => participant.email !== email
  );

  return partner;
}
