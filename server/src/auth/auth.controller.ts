import { Controller, Post, Body, UnauthorizedException } from "@nestjs/common";
import { FirebaseAdminService } from "./auth.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly prisma: PrismaService,
  ) {}

  // @Post("verify-token")
  // async verifyToken(@Body("idToken") idToken: string) {
  //   try {
  //     const decodedToken = await this.firebaseAdminService.verifyIdToken(
  //       idToken,
  //     );
  //     const { uid, email } = decodedToken;

  //     let user = await this.prisma.user.findUnique({
  //       where: { uid },
  //     });

  //     if (!user) {
  //       user = await this.prisma.user.create({
  //         data: {
  //           uid,
  //           email,
  //           username: email.split("@")[0],
  //           walletAddress: "",
  //         },
  //       });
  //     }

  //     return { user };
  //   } catch (error) {
  //     throw new UnauthorizedException("Invalid token");
  //   }
  // }
}
