export async function sendCandidateStatusEmail(params: {
  toEmail: string;
  candidateName: string;
  passportNumber: string;
  trade: string;
  stageNumber: number;
  stageName: string;
  remarks: string;
}) {
  if (!params.toEmail || !params.toEmail.includes("@")) {
    console.warn("Skipping email: No valid email address provided.");
    return false;
  }

  const payload = {
    service_id: "service_tlkgt3c",
    template_id: "template_athm2nf",
    user_id: "Ds8LtM9_L7ldIvKiv",
    template_params: {
      to_email: params.toEmail,
      candidate_name: params.candidateName,
      passport_number: params.passportNumber,
      trade: params.trade,
      stage_number: params.stageNumber,
      stage_name: params.stageName,
      officer_remarks: params.remarks || "Processing normally",
      portal_link: `${window.location.origin}/?passport=${params.passportNumber}`
    }
  };

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to send status email:", err);
    return false;
  }
}
