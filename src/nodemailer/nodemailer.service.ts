import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { resolve } from 'path';
import * as handlebars from 'handlebars';
import * as fs from 'fs';

interface SendMailInterface {
  to: string;
  subject: string;
  template: string;
  params?: object;
}

@Injectable()
export class NodemailerService {
  constructor(private config: ConfigService) {}

  async sendMail({ to, subject, template, params }: SendMailInterface) {
    const transport = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get('SMTP_PORT'),
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASSWORD'),
      },
    });

    const templatePath = resolve(
      __dirname,
      'templates',
      `${template}.template.hbs`,
    );

    const partialPath = resolve(__dirname, 'partials', 'head.hbs');

    const templateFileContent = fs.readFileSync(templatePath).toString('utf8');

    const mailTemplateParser = handlebars.compile(templateFileContent);

    handlebars.registerPartial(
      'head',
      fs.readFileSync(partialPath).toString('utf8'),
    );

    const html = mailTemplateParser(params);

    await transport.sendMail({
      from: 'Team <team@mail.domain>',
      to,
      subject,
      html,
    });
  }
}
