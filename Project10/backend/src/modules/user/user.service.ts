import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { User, UserDocument, UserRole } from "./schemas/user.schema";
import { LoginDto, RegisterDto, UpdateUserDto } from "./dto/user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async create(registerDto: RegisterDto) {
    const existingUser = await this.userModel.findOne({
      username: registerDto.username,
    });
    if (existingUser) {
      throw new ConflictException("用户名已存在");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
    });
    await user.save();
    return this.toUserResponse(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({ username: loginDto.username });
    if (!user) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    const payload = { sub: user._id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: this.toUserResponse(user),
    };
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select("-password");
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select("-password");
    if (!user) {
      throw new NotFoundException("用户不存在");
    }
    return user;
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.userModel.find({ role }).select("-password");
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select("-password");
    if (!user) {
      throw new NotFoundException("用户不存在");
    }
    return user;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException("用户不存在");
    }
  }

  private toUserResponse(user: UserDocument) {
    return {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      managerId: user.managerId,
    };
  }

  async initDefaultUsers() {
    const count = await this.userModel.countDocuments();
    if (count > 0) return;

    const defaultUsers = [
      {
        username: "admin",
        password: "admin123",
        name: "系统管理员",
        email: "admin@oa.com",
        role: UserRole.ADMIN,
        department: "IT",
      },
      {
        username: "employee1",
        password: "123456",
        name: "张员工",
        email: "emp1@oa.com",
        role: UserRole.EMPLOYEE,
        department: "研发部",
      },
      {
        username: "employee2",
        password: "123456",
        name: "李员工",
        email: "emp2@oa.com",
        role: UserRole.EMPLOYEE,
        department: "市场部",
      },
      {
        username: "manager1",
        password: "123456",
        name: "王经理",
        email: "mgr1@oa.com",
        role: UserRole.MANAGER,
        department: "研发部",
      },
      {
        username: "manager2",
        password: "123456",
        name: "赵经理",
        email: "mgr2@oa.com",
        role: UserRole.MANAGER,
        department: "市场部",
      },
      {
        username: "hr1",
        password: "123456",
        name: "刘人事",
        email: "hr1@oa.com",
        role: UserRole.HR,
        department: "人事部",
      },
      {
        username: "finance1",
        password: "123456",
        name: "陈财务",
        email: "fin1@oa.com",
        role: UserRole.FINANCE,
        department: "财务部",
      },
    ];

    for (const userData of defaultUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await this.userModel.create({ ...userData, password: hashedPassword });
    }
    console.log("Default users initialized");
  }
}
