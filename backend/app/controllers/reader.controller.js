const bcrypt = require("bcryptjs");
const ApiError = require("../api_error");
const ReaderService = require("../services/reader.service");
const AuthService = require("../services/auth.service");
const MongoDB = require("../utils/mongodb.util");

const authService = new AuthService();

exports.register = async (req, res, next) => {
  const { HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai, Email, MatKhau } =
    req.body;

  if (!HoLot || !Ten || !Email || !MatKhau) {
    return next(
      new ApiError(400, "Vui lòng điền đầy đủ thông tin bắt buộc")
    );
  }

  try {
    const readerService = new ReaderService(MongoDB.client);
    const existing = await readerService.findByEmail(Email);

    if (existing) {
      return next(new ApiError(400, "Email đã tồn tại"));
    }

    const hashedPassword = await bcrypt.hash(MatKhau, 10);

    const result = await readerService.create({
      HoLot,
      Ten,
      NgaySinh,
      Phai,
      DiaChi,
      DienThoai,
      Email,
      MatKhau: hashedPassword,
    });

    const { MatKhau: _matKhau, ...safeReader } = result;

    return res.status(201).json({
      message: "Đăng ký độc giả thành công",
      data: safeReader,
    });
  } catch (error) {
    console.error("Register reader error:", error);
    return next(new ApiError(500, "Lỗi khi đăng ký độc giả"));
  }
};

exports.login = async (req, res, next) => {
  const { Email, MatKhau } = req.body;

  if (!Email || !MatKhau) {
    return next(new ApiError(400, "Email và mật khẩu là bắt buộc"));
  }

  try {
    const readerService = new ReaderService(MongoDB.client);
    const result = await authService.login(
      readerService,
      Email,
      MatKhau,
      "docgia"
    );

    if (!result) {
      return next(
        new ApiError(401, "Email hoặc mật khẩu không chính xác")
      );
    }

    return res.send(result);
  } catch (error) {
    console.error("Reader login error:", error);
    return next(new ApiError(500, "Lỗi khi đăng nhập"));
  }
};

exports.update = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);

    const currentReader = await readerService.findById(req.params.id);

    if (!currentReader) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }

    if (req.body.Email && req.body.Email !== currentReader.Email) {
      const emailExists = await readerService.findByEmail(req.body.Email);

      if (emailExists) {
        return next(new ApiError(400, "Email đã được sử dụng"));
      }
    }

    const updated = await readerService.update(req.params.id, req.body);

    if (!updated) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }

    const { MatKhau, ...safeReader } = updated;

    return res.send({
      message: "Cập nhật thông tin độc giả thành công",
      data: safeReader,
    });
  } catch (error) {
    console.error("Update reader error:", error);
    return next(new ApiError(500, "Lỗi khi cập nhật độc giả"));
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const reader = await readerService.findById(req.id);

    if (!reader) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }

    const { MatKhau, ...safeReader } = reader;

    return res.send(safeReader);
  } catch (error) {
    console.error("Get reader profile error:", error);
    return next(new ApiError(500, "Lỗi khi lấy thông tin độc giả"));
  }
};

exports.getById = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const reader = await readerService.findById(req.params.id);

    if (!reader) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }

    const { MatKhau, ...safeReader } = reader;

    return res.send(safeReader);
  } catch (error) {
    console.error("Get reader error:", error);
    return next(new ApiError(500, "Lỗi khi lấy thông tin độc giả"));
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const readers = await readerService.findAll();

    const safeReaders = readers.map(({ MatKhau, ...reader }) => reader);

    return res.send(safeReaders);
  } catch (error) {
    console.error("Get readers error:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách độc giả"));
  }
};

exports.deleteById = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const result = await readerService.delete(req.params.id);

    if (!result) {
      return next(new ApiError(404, "Không tìm thấy độc giả"));
    }

    return res.send({
      message: "Xóa độc giả thành công",
    });
  } catch (error) {
    console.error("Delete reader error:", error);
    return next(new ApiError(500, "Lỗi khi xóa độc giả"));
  }
};
