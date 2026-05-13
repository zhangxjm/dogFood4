import { Injectable } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { existsSync, mkdirSync } from "fs";

@Injectable()
export class UploadService {
  getMulterConfig() {
    const uploadPath = join(process.cwd(), "uploads");
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    return {
      storage: diskStorage({
        destination: uploadPath,
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join("");
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    };
  }

  getFileUrl(filename: string) {
    const port = process.env.PORT || 3001;
    return `http://localhost:${port}/uploads/${filename}`;
  }
}
