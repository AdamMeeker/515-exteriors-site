/**
 * RoofingIQ — Feedback Function
 *
 * Azure Static Web Apps Function (Node.js, v3 programming model).
 * Receives a JSON POST from the feedback form, validates required fields,
 * logs the submission to the function host's stdout (visible in Azure
 * Application Insights / Log Stream), and returns a JSON success response.
 *
 * TODO (production): persist to Azure Blob Storage and email Adam directly.
 *   - Wire to @azure/storage-blob with SWA-managed identity, OR
 *   - Send via SendGrid / Resend with an API key from app settings.
 */

module.exports = async function (context, req) {
  // --- CORS / preflight ---
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    context.res = { status: 204, headers: corsHeaders, body: '' };
    return;
  }

  if (req.method !== 'POST') {
    context.res = {
      status: 405,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, message: 'Method not allowed.' }),
    };
    return;
  }

  // --- Parse body ---
  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {
      body = {};
    }
  }

  const name = (body.name || '').toString().trim();
  const email = (body.email || '').toString().trim();
  const role = (body.role || '').toString().trim();
  const features = Array.isArray(body.features) ? body.features : [];
  const nobrainer = (body.nobrainer || '').toString().trim();
  const interest = (body.interest || '').toString().trim();
  const submittedAt = (body.submittedAt || new Date().toISOString()).toString();

  // --- Validate ---
  if (!name || !email) {
    context.res = {
      status: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        message: 'Name and email are required.',
      }),
    };
    return;
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    context.res = {
      status: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        message: 'That email address looks off — can you double-check?',
      }),
    };
    return;
  }

  // --- Build the entry ---
  const entry = {
    name,
    email,
    role,
    features,
    nobrainer,
    interest,
    submittedAt,
    userAgent: (req.headers && req.headers['user-agent']) || '',
    ip:
      (req.headers && (req.headers['x-forwarded-for'] || req.headers['client-ip'])) || '',
  };

  // --- Log it (visible in Azure Function logs) ---
  context.log('═══════════ ROOFINGIQ FEEDBACK ═══════════');
  context.log(JSON.stringify(entry, null, 2));
  context.log('══════════════════════════════════════════');

  // --- Respond ---
  context.res = {
    status: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      message: 'Thank you for your feedback!',
    }),
  };
};
