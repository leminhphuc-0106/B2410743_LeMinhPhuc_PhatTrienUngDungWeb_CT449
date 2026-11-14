const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "khoa_cua_thu_vien";

class AuthService {
  async login(accountService, email, password, accountType) {
    const account = await accountService.findByEmail(email);
    // Không thấy account
    if (!account) {
      console.log("SAI EMAIL")
      return null;
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(
      password,
      account.password
    );

    if (!isMatch) {
      console.log("SAI MAT KHAU")
      return null;
    }

    const payload = {
      id: account._id,
      accountType: accountType
    };

    // Chỉ tài khoản nhân viên mới có chức vụ
    if (accountType === "nhanvien") {
      payload.chuc_vu = account.chuc_vu;
    }

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1d"
    });

    return {
      token,
      account: {
        id: account._id,
        ho_ten: account.ho_ten,
        email: account.email,
        ...(accountType === "nhanvien" && {
          chuc_vu: account.chuc_vu
        })
      }
    };
  }
}

module.exports = AuthService;
