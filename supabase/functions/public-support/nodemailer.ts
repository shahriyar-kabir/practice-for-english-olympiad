// @deno-types="npm:@types/nodemailer@8.0.2/lib/smtp-connection/index.d.ts"
import SMTPConnection from 'nodemailer/smtp-connection';
// @deno-types="npm:@types/nodemailer@8.0.2/lib/mail-composer/index.d.ts"
import MailComposer from 'nodemailer/mail-composer';
import type { SmtpTransportFactory } from './smtp.ts';

// The public Nodemailer connection API lets timeout cleanup close the active
// socket immediately. Its high-level non-pool transport.close() does not close
// an in-flight socket. Nodemailer also handles MIME encoding and dot stuffing.
export const createNodemailerTransport: SmtpTransportFactory = options => {
  const connection = new SMTPConnection(options);
  let closed = false;
  return {
    async sendMail(message) {
      const compiled = new MailComposer(message).compile();
      const bytes = await compiled.build();
      if (closed) throw new Error('smtp_connection_closed');
      const messageId = compiled.messageId();
      return await new Promise((resolve, reject) => {
        connection.once('error', reject);
        connection.once('end', () => reject(new Error('smtp_connection_closed')));
        connection.connect(() => {
          if (closed) return reject(new Error('smtp_connection_closed'));
          connection.login(options.auth, error => {
            if (error) return reject(error);
            if (closed) return reject(new Error('smtp_connection_closed'));
            connection.send(message.envelope, bytes, (sendError, result) => {
              if (sendError) return reject(sendError);
              resolve({ ...result, messageId });
            });
          });
        });
      });
    },
    close() {
      closed = true;
      connection.close();
    },
  };
};
