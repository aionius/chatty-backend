import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
// import moment from 'moment';
// import publicIp from 'ip';

import { config } from '@root/config';
import { joiValidation } from '@globals/decorators/joi-decorators';
import { loginSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@globals/helpers/error-handler';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@service/db/user.service';
// import { emailQueue } from '@service/queues/email.queue';
// import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password.template';
// import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password.template';
// import { mailTransport } from '@service/emails/mail.transport';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials.');
    }

    const passwordsMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials.');
    }

    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);

    // create user token
    const userJWT: string = JWT.sign(
      {
        // TODO: use `userId: user._id`
        userId: existingUser._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );

    // sending email
    // await mailTransport.sendEmail('mireille52@ethereal.email', 'Testing Development Email', 'This is a test email.');

    // password change confirmation email
    // const templateParams: IResetPasswordParams = {
    //   username: existingUser.username!,
    //   email: existingUser.email!,
    //   ipaddress: publicIp.address(),
    //   date: moment().format('DD/MM/YYY HH:mm')
    // };
    // const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    // emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: 'mireille52@ethereal.email', subject: 'Password reset confirmation' });

    // forgot password email
    // const resetLink = `${config.CLIENT_URL}/reset-password?token=123412341234`;
    // const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink);
    // emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: 'mireille52@ethereal.email', subject: 'Reset your password' });

    req.session = { jwt: userJWT };

    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser.id,
      username: existingUser.username,
      email: existingUser.email,
      avatarColor: existingUser.avatarColor,
      uId: existingUser.uId,
      createdAt: existingUser.createdAt
    } as IUserDocument;

    res.status(HTTP_STATUS.OK).json({
      message: 'User login successfull.',
      user: userDocument,
      token: userJWT
    });
  }
}
