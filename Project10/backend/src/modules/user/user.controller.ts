import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { LoginDto, RegisterDto, UpdateUserDto } from "./dto/user.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { UserRole } from "./schemas/user.schema";
import { Roles } from "./decorators/roles.decorator";

@ApiTags("用户管理")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  @ApiOperation({ summary: "用户注册" })
  @UsePipes(new ValidationPipe())
  async register(@Body() registerDto: RegisterDto) {
    return this.userService.create(registerDto);
  }

  @Post("login")
  @ApiOperation({ summary: "用户登录" })
  @UsePipes(new ValidationPipe())
  async login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "获取当前用户信息" })
  async getCurrentUser(@Request() req) {
    return this.userService.findById(req.user.sub);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "获取所有用户" })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "获取用户详情" })
  async findOne(@Param("id") id: string) {
    return this.userService.findById(id);
  }

  @Put(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "更新用户信息" })
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "删除用户" })
  async delete(@Param("id") id: string) {
    return this.userService.delete(id);
  }
}
