const path = require("path");

try {
  process.loadEnvFile(path.join(__dirname, "../../.env"));
} catch {
  // Không có file .env thì dùng giá trị mặc định bên dưới
}

const config = {
  app: {
    port: process.env.PORT || 5000,
  },
  db: {
    uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/book_borrowing",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "khoa_cua_thu_vien",
  },
};

module.exports = config;
