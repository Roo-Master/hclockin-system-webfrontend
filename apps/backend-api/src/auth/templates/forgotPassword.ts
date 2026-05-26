export const forgotPasswordTemplate = (
  data: {
    name: string;
    otp: string;
  }
) => {
  return `
  <div style="font-family: Arial; padding: 20px;">
    
    <div style="
      max-width:600px;
      margin:auto;
      background:#fff;
      padding:20px;
      border-radius:10px;
    ">

      <h2 style="color:#d9534f;">
        Password Reset OTP
      </h2>

      <p>Hello <b>${data.name}</b>,</p>

      <p>
        Use the OTP below to reset your password:
      </p>

      <div style="
        font-size:32px;
        font-weight:bold;
        letter-spacing:8px;
        margin:20px 0;
        color:#333;
      ">
        ${data.otp}
      </div>

      <p>
        This OTP expires in 10 minutes.
      </p>

      <hr />

      <small>
        If you did not request this,
        ignore this email.
      </small>

    </div>

  </div>
  `;
};