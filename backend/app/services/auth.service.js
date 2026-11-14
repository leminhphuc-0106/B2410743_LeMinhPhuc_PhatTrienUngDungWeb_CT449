
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "khoa_cua_thu_vien";

class AuthService {
  async login(accountService, email, password, role) {
    const account = await accountService.findByEmail(email);

    if (!account) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, account.mat_khau);

    if (!isMatch) {
      return null;
    }

    // Nếu tài khoản có trạng thái thì kiểm tra trạng thái
    if (account.trang_thai && account.trang_thai !== "active") {
      return { locked: true };
    }

    const token = jwt.sign(
      {
        id: account._id,
        role: role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: account._id,
        email: account.email,
        role,
      },
    };
  }
}

module.exports = AuthService;
