import { Request, Response } from 'express';
// import * as cloudinaryUploads from '@globals/helpers/cloudinary.upload';
import { authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { SignUp } from '../signup';
import { CustomError } from '@globals/helpers/error-handler';

jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/queue/user.queue');
jest.mock('@service/queue/auth.queue');
jest.mock('@globals/helpers/cloudinary.upload');

describe('SignUp', () => {
  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'test1@email.com',
        password: 'test',
        avatarColor: 'red',
        avatarImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/'
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field.');
    });
  });
});
