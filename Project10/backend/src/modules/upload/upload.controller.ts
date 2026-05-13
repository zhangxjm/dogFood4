import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  UploadedFiles,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { UploadService } from "./upload.service";
import { JwtAuthGuard } from "../user/guards/jwt-auth.guard";

@ApiTags("文件上传")
@Controller("upload")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("single")
  @ApiOperation({ summary: "上传单个文件" })
  @UseInterceptors(FileInterceptor("file"))
  uploadSingle(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: this.uploadService.getFileUrl(file.filename),
    };
  }

  @Post("multiple")
  @ApiOperation({ summary: "上传多个文件" })
  @UseInterceptors(FilesInterceptor("files", 10))
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    return files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: this.uploadService.getFileUrl(file.filename),
    }));
  }
}
