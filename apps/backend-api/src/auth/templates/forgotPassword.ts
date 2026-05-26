export const forgotPasswordTemplate = (data: {
  name: string;
  resetLink: string;
}) => {
  return `
  <div style="font-family: Arial; padding: 20px;">
    <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:10px;">
      
      <h2 style="color:#d9534f;">Password Reset Request</h2>

      <p>Hello <b>${data.name}</b>,</p>

      <p>You requested to reset your password.</p>

      <a href="${data.resetLink}" style="
        display:inline-block;
        padding:12px 20px;
        background:#d9534f;
        color:#fff;
        text-decoration:none;
        border-radius:6px;
      ">
        Reset Password
      </a>

      <p style="margin-top:20px;font-size:12px;color:gray;">
        This link expires in 15 minutes.
      </p>

    </div>
  </div>
  `;
};