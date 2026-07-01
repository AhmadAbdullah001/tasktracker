const RESEND_API_URL = "https://api.resend.com";

const getApiKey = () => process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;
const getDefaultFrom = () => process.env.EMAIL_FROM || "TaskTracker <onboarding@resend.dev>";

const parseRecipients = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  return value
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
};

const requestResend = async (path, options = {}) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch(`${RESEND_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || data?.error || "Email service request failed";
    const error = new Error(message);
    error.statusCode = response.status;
    error.response = data;
    throw error;
  }

  return data;
};

const sendMail = async ({ from, to, subject, text, html }) => {
  const data = await requestResend("/emails", {
    method: "POST",
    body: JSON.stringify({
      from: from || getDefaultFrom(),
      to: parseRecipients(to),
      subject,
      text,
      html,
    }),
  });

  return {
    messageId: data.id,
    accepted: parseRecipients(to),
    rejected: [],
    response: "Queued by Resend",
    provider: "resend",
  };
};

const verify = async () => {
  await requestResend("/domains", { method: "GET" });
  return true;
};

module.exports = {
  sendMail,
  verify,
  isConfigured: () => Boolean(getApiKey()),
  getDefaultFrom,
  provider: "resend",
};
