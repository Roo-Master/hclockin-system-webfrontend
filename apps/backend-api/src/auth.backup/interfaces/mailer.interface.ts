export const MAILER_TOKEN = 'IMAILER';

export interface IMailer {
  sendPasswordReset(
    to: string,
    resetUrl: string,
    userName: string,
    expiresInMinutes: number,
  ): Promise<void>;
}
