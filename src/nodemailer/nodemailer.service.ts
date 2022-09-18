import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface SendMailInterface {
  to: string;
  subject: string;
  body: string;
}

@Injectable()
export class NodemailerService {
  constructor(private config: ConfigService) {}

  async sendMail({ to, subject, body }: SendMailInterface) {
    const transport = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get('SMTP_PORT'),
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASSWORD'),
      },
    });

    await transport.sendMail({
      from: 'Team <team@mail.domain>',
      to,
      subject,
      html: body,
    });
  }
}
