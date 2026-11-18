const ApiError = require("../api_error");
const AuthorService = require("../services/author.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  try {
    const { TenTG, QuocTich } = req.body;

    if (!TenTG || !TenTG.trim()) {
      return next(new ApiError(400, "Tên tác giả là bắt buộc"));
    }

    const authorService = new AuthorService(MongoDB.client);
    const result = await authorService.create({ TenTG, QuocTich });

    return res.status(201).send({
      message: "Thêm tác giả thành công",
      data: result,
    });
  } catch (error) {
    console.error("Create author error:", error);
    return next(new ApiError(500, "Lỗi khi thêm tác giả"));
  }
};

exports.find = async (req, res, next) => {
  try {
    const authorService = new AuthorService(MongoDB.client);
    const authors = await authorService.find(req.query);

    return res.send(authors);
  } catch (error) {
    console.error("Find authors error:", error);
    return next(new ApiError(500, "Lỗi khi tìm kiếm tác giả"));
  }
};

exports.findByName = async (req, res, next) => {
  try {
    const authorService = new AuthorService(MongoDB.client);
    const authors = await authorService.findByName(req.params.name);

    return res.send(authors);
  } catch (error) {
    console.error("Find author by name error:", error);
    return next(new ApiError(500, "Lỗi khi tìm tác giả theo tên"));
  }
};

exports.findById = async (req, res, next) => {
  try {
    const authorService = new AuthorService(MongoDB.client);
    const author = await authorService.findById(req.params.id);

    if (!author) {
      return next(new ApiError(404, "Không tìm thấy tác giả"));
    }

    return res.send(author);
  } catch (error) {
    console.error("Find author by ID error:", error);
    return next(new ApiError(500, "Lỗi khi lấy thông tin tác giả"));
  }
};

exports.update = async (req, res, next) => {
  try {
    const authorService = new AuthorService(MongoDB.client);
    const author = await authorService.update(req.params.id, req.body);

    if (!author) {
      return next(new ApiError(404, "Không tìm thấy tác giả"));
    }

    return res.send({
      message: "Cập nhật thông tin tác giả thành công",
      data: author,
    });
  } catch (error) {
    console.error("Update author error:", error);
    return next(new ApiError(500, "Lỗi khi cập nhật tác giả"));
  }
};

exports.deleteById = async (req, res, next) => {
  try {
    const authorService = new AuthorService(MongoDB.client);
    const result = await authorService.delete(req.params.id);

    if (!result) {
      return next(new ApiError(404, "Không tìm thấy tác giả"));
    }

    return res.send({
      message: "Xóa tác giả thành công",
    });
  } catch (error) {
    console.error("Delete author error:", error);
    return next(new ApiError(500, "Lỗi khi xóa tác giả"));
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const authorService = new AuthorService(MongoDB.client);
    const deletedCount = await authorService.deleteAll();

    return res.send({
      message: `Đã xóa ${deletedCount} tác giả`,
      data: deletedCount,
    });
  } catch (error) {
    console.error("Delete all authors error:", error);
    return next(new ApiError(500, "Lỗi khi xóa toàn bộ tác giả"));
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const authorService = new AuthorService(MongoDB.client);
    const authors = await authorService.findAll();

    return res.send(authors);
  } catch (error) {
    console.error("Get all authors error:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách tác giả"));
  }
};
