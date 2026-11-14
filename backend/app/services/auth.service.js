const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "khoa_cua_thu_vien";

class AuthService {
  async login(accountService, Email, password, accountType) {
    const account = await accountService.findByEmail(Email);
    // Không thấy account
    if (!account) {
      console.log("SAI EMAIL");
      return null;
    }

    // Mật khẩu được đặt tên theo schema của từng collection
    const hashedPassword =
      accountType === "nhanvien" ? account.Password : account.MatKhau;

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      console.log("SAI MAT KHAU");
      return null;
    }

    const payload = {
      id: account._id,
      accountType: accountType,
    };

    // Chỉ tài khoản nhân viên mới có chức vụ
    if (accountType === "nhanvien") {
      payload.Chucvu = account.Chucvu;
    }

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1d",
    });

    const accountInfo = {
      id: account._id,
      Email: account.Email,
    };

    if (accountType === "nhanvien") {
      accountInfo.HoTenNV = account.HoTenNV;
      accountInfo.Chucvu = account.Chucvu;
    } else {
      accountInfo.HoLot = account.HoLot;
      accountInfo.Ten = account.Ten;
    }

    return {
      token,
      account: accountInfo,
    };
  }
}

module.exports = AuthService;
