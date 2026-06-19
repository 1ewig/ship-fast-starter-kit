export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@localhost";
  const senderName = process.env.BREVO_SENDER_NAME || "SaaS Starter Kit";

  if (!apiKey) {
    console.warn("[Email] BREVO_API_KEY is not set. Logging email to console:");
    console.log("-----------------------------------------");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("HTML Content:");
    console.log(html);
    console.log("-----------------------------------------");
    return;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API responded with status ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("[Email] Failed to send email via Brevo:", error);
    throw error;
  }
}
