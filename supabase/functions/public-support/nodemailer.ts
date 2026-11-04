// @deno-types="npm:@types/nodemailer@8.0.2/lib/smtp-connection/index.d.ts"
import SMTPConnection from 'nodemailer/smtp-connection';
// @deno-types="npm:@types/nodemailer@8.0.2/lib/mail-composer/index.d.ts"
import MailComposer from 'nodemailer/mail-composer';
import type { SmtpPhase, SmtpTransportFactory } from './smtp.ts';

// The public Nodemailer connection API lets timeout cleanup close the active
// socket immediately. Its high-level non-pool transport.close() does not close
// an in-flight socket. Nodemailer also handles MIME encoding and dot stuffing.
export const createNodemailerTransport: SmtpTransportFactory = options => {
  const connection = new SMTPConnection(options);
  let closed = false;
  let phase: SmtpPhase = 'compose';
  return {
    getPhase() { return phase; },
    async sendMail(message) {
      const compiled = new MailComposer(message).compile();
      const bytes = await compiled.build();
      if (closed) throw new Error('smtp_connection_closed');
      const messageId = compiled.messageId();
      return await new Promise((resolve, reject) => {
        connection.once('error', reject);
        connection.once('end', () => reject(new Error('smtp_connection_closed')));
        phase = 'connect';
        connection.connect(connectError => {
          if (connectError) return reject(connectError);
          if (closed) return reject(new Error('smtp_connection_closed'));
          phase = 'auth';
          connection.login(options.auth, error => {
            if (error) return reject(error);
            if (closed) return reject(new Error('smtp_connection_closed'));
            phase = 'send';
            connection.send(message.envelope, bytes, (sendError, result) => {
              if (sendError) return reject(sendError);
              phase = 'acceptance';
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
