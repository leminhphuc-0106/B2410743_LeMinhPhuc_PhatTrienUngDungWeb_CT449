const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");

const PASSWORD_FIELDS = {
  docgia: "MatKhau",
  nhanvien: "Password",
};

class AuthService {
  async login(accountService, Email, password, accountType) {
    const account = await accountService.findByEmail(Email);

    if (!account) return null;

    const passwordField = PASSWORD_FIELDS[accountType] || "MatKhau";
    const hashedPassword = account[passwordField];

    if (!hashedPassword) return null;

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) return null;

    const id = account.MSNV || account.MaDocGia || account._id;
    const payload = {
      id: id.toString(),
      accountType,
    };

    if (accountType === "nhanvien") {
      payload.ChucVu = account.ChucVu;
    }

    const token = jwt.sign(payload, config.auth.jwtSecret, {
      expiresIn: "1d",
    });

    const accountInfo = {
      id: id.toString(),
      Email: account.Email,
    };

    if (accountType === "nhanvien") {
      accountInfo.MSNV = account.MSNV;
      accountInfo.HoTenNV = account.HoTenNV;
      accountInfo.ChucVu = account.ChucVu;
    } else {
      accountInfo.MaDocGia = account.MaDocGia;
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
