
const bcrypt = require("bcryptjs");
const ApiError = require("../api_error");
const StaffService = require("../services/staff.service");
const AuthService = require("../services/auth.service");
const MongoDB = require("../utils/mongodb.util");

const authService = new AuthService();

// Tạo tài khoản nhân viên
// Endpoint này chỉ nên cho admin được quyền sử dụng
exports.register = async (req, res, next) => {
  const {
    HoTenNV,
    Email,
    Password,
    Chucvu,
    Diachi,
    SoDienThoai,
  } = req.body;

  if (!HoTenNV || !Email || !Password) {
    return next(
      new ApiError(400, "Vui lòng điền đầy đủ thông tin bắt buộc")
    );
  }

  try {
    const staffService = new StaffService(MongoDB.client);

    const existing = await staffService.findByEmail(Email);

    if (existing) {
      return next(new ApiError(400, "Email đã tồn tại"));
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const newStaff = {
      HoTenNV,
      Email,
      Password: hashedPassword,
      Chucvu,
      Diachi,
      SoDienThoai,
    };

    const result = await staffService.create(newStaff);

    const { Password: _, ...safeStaff } = result;

    return res.status(201).json({
      message: "Tạo tài khoản nhân viên thành công",
      staff: safeStaff,
    });
  } catch (error) {
    console.error("Register staff error:", error);
    return next(new ApiError(500, "Lỗi khi tạo tài khoản nhân viên"));
  }
};

// Đăng nhập nhân viên
exports.login = async (req, res, next) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return next(new ApiError(400, "Email và mật khẩu là bắt buộc"));
  }

  try {
    const staffService = new StaffService(MongoDB.client);
    const result = await authService.login(
      staffService,
      Email,
      Password,
      "nhanvien"
    );

    if (!result) {
      return next(
        new ApiError(401, "Email hoặc mật khẩu không chính xác")
      );
    }

    if (result.locked) {
      return next(new ApiError(401, "Tài khoản của bạn đang bị khóa"));
    }

    return res.send(result);
  } catch (error) {
    console.error("Staff login error:", error);
    return next(new ApiError(500, "Lỗi khi đăng nhập nhân viên"));
  }
};

// Cập nhật thông tin nhân viên
exports.update = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);

    const currentStaff = await staffService.findById(req.params.id);

    if (!currentStaff) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }

    if (req.body.Email && req.body.Email !== currentStaff.Email) {
      const emailExists = await staffService.findByEmail(req.body.Email);

      if (emailExists) {
        return next(new ApiError(400, "Email đã được sử dụng"));
      }
    }

    const updated = await staffService.update(
      req.params.id,
      req.body
    );

    if (!updated) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }

    const staff = updated.value ?? updated;
    if (!staff) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }

    const { Password, ...safeStaff } = staff;

    return res.send({
      message: "Cập nhật thông tin nhân viên thành công",
      data: safeStaff,
    });
  } catch (error) {
    console.error("Update staff error:", error);
    return next(new ApiError(500, "Lỗi khi cập nhật nhân viên"));
  }
};

// Lấy thông tin nhân viên đang đăng nhập
exports.getProfile = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);

    const staff = await staffService.findById(req.id);

    if (!staff) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }

    const { Password, ...safeStaff } = staff;

    return res.send(safeStaff);
  } catch (error) {
    console.error("Get staff profile error:", error);
    return next(new ApiError(500, "Lỗi khi lấy thông tin nhân viên"));
  }
};

// Lấy nhân viên theo ID
exports.getById = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const staff = await staffService.findById(req.params.id);

    if (!staff) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }

    const { Password, ...safeStaff } = staff;

    return res.send(safeStaff);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy thông tin nhân viên"));
  }
};

// Lấy danh sách nhân viên
exports.getAll = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const staffs = await staffService.findAll();

    const safeStaffs = staffs.map(({ Password, ...staff }) => staff);

    return res.send(safeStaffs);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách nhân viên"));
  }
};

// Xóa nhân viên
exports.deleteById = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const result = await staffService.delete(req.params.id);

    if (!result || !result.value) {
      return next(new ApiError(404, "Không tìm thấy nhân viên"));
    }

    return res.send({
      message: "Xóa nhân viên thành công",
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa nhân viên"));
  }
};
