import { PrismaClient } from '@prisma/client';
import * as yup from 'yup';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// const handleErrors = (err: Error) => {};

const one_day_ms = 86400 * 1000;

let { TOKEN_SECRET } = process.env;

const createToken = (id: number) => {
  return jwt.sign({ id }, TOKEN_SECRET, {
    expiresIn: one_day_ms,
  });
};

const loginService = async ({ email, password }: { email: string; password: string }) => {
  let prisma;

  try {
    prisma = new PrismaClient();
    // console.log({ email, password });

    const hashedPassword = await prisma.user.findFirst({
      where: { email: email },
    });

    // console.log({ test: bcrypt.compareSync(password, hashedPassword.password) });

    if (hashedPassword && bcrypt.compareSync(password, hashedPassword.password)) {
      let { id } = hashedPassword;
      return createToken(id);
    } else {
      throw { status: 401, message: 'Email ou senha inválidos' };
    }
  } catch (err) {
    // throw new Error(err);
    console.log({ err });
  } finally {
    await prisma?.$disconnect();
  }
};

export const loginSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export const signup_get = (req: Request, res: Response) => {
  res.send('signup_get route ?');
};

export const signup_post = (req: Request, res: Response) => {
  res.send('signup_post route ?');
};

export const login_get = (req: Request, res: Response) => {
  res.send('login page ?');
};

export const login_post = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    await loginSchema.validate(data);

    const { email, password } = req.body;
    // console.log({ email, password });
    const token = await loginService({ email, password });
    console.log({ email, password, token });
    if (token) {
      res.cookie('jwt', token, { httpOnly: true, maxAge: one_day_ms });
      res.status(200).json({
        //
        msg: 'login ok',
        email,
        accessToken: token,
        user: {
          email,
          id: '5e86809283e28b96d2d38537',
          avatar: '/assets/avatars/avatar-anika-visser.png',
          name: 'Anika Visser',
          plan: 'Premium',
        },
      });
    } else {
      res.status(200).json({
        //
        msg: 'login failed',
        email,
        accessToken: token,
        user: {
          email,
          id: '5e86809283e28b96d2d38537',
          avatar: '/assets/avatars/avatar-anika-visser.png',
          name: 'Anika Visser',
          plan: 'Premium',
        },
      });
    }
  } catch (err) {
    // const errors = handleErrors(err);
    res.status(400).json({ err });
  }
};

export const logout_get = (req: Request, res: Response) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
};
