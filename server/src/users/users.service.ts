import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(
    uid: string,
    email: string,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        uid,
        email,
        username: email,
        walletAddress: "",
      },
    });
  }
}
