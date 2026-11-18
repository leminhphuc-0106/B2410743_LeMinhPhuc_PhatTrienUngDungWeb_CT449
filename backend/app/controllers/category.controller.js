const ApiError = require("../api_error");
const CategoryService = require("../services/category.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  try {
    const { TenTheLoai, MoTa } = req.body;

    if (!TenTheLoai || !TenTheLoai.trim()) {
      return next(new ApiError(400, "Tên thể loại không được để trống."));
    }

    const categoryService = new CategoryService(MongoDB.client);
    const category = await categoryService.create({ TenTheLoai, MoTa });

    return res.status(201).send({
      message: "Thêm thể loại thành công.",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    return next(new ApiError(500, "Lỗi khi thêm thể loại."));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const categoryService = new CategoryService(MongoDB.client);
    const categories = await categoryService.findAll();

    return res.send(categories);
  } catch (error) {
    console.error("Find categories error:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách thể loại."));
  }
};

exports.findByName = async (req, res, next) => {
  try {
    const { name } = req.params;

    if (!name || !name.trim()) {
      return next(new ApiError(400, "Tên thể loại không hợp lệ."));
    }

    const categoryService = new CategoryService(MongoDB.client);
    const categories = await categoryService.findByName(name.trim());

    return res.send(categories);
  } catch (error) {
    console.error("Find category by name error:", error);
    return next(new ApiError(500, "Lỗi khi tìm thể loại theo tên."));
  }
};

exports.findById = async (req, res, next) => {
  try {
    const categoryService = new CategoryService(MongoDB.client);
    const category = await categoryService.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, "Không tìm thấy thể loại."));
    }

    return res.send(category);
  } catch (error) {
    console.error("Find category error:", error);
    return next(new ApiError(500, "Lỗi khi lấy thể loại."));
  }
};

exports.update = async (req, res, next) => {
  try {
    const { TenTheLoai, MoTa } = req.body;

    if (TenTheLoai !== undefined && (!TenTheLoai || !TenTheLoai.trim())) {
      return next(new ApiError(400, "Tên thể loại không được để trống."));
    }

    const categoryService = new CategoryService(MongoDB.client);
    const category = await categoryService.update(req.params.id, {
      TenTheLoai,
      MoTa,
    });

    if (!category) {
      return next(new ApiError(404, "Không tìm thấy thể loại."));
    }

    return res.send({
      message: "Cập nhật thể loại thành công.",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    return next(new ApiError(500, "Lỗi khi cập nhật thể loại."));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const categoryService = new CategoryService(MongoDB.client);
    const category = await categoryService.delete(req.params.id);

    if (!category) {
      return next(new ApiError(404, "Không tìm thấy thể loại."));
    }

    return res.send({
      message: "Xóa thể loại thành công.",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return next(new ApiError(500, "Lỗi khi xóa thể loại."));
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const categoryService = new CategoryService(MongoDB.client);
    const deletedCount = await categoryService.deleteAll();

    return res.send({
      message: `Đã xóa ${deletedCount} thể loại.`,
    });
  } catch (error) {
    console.error("Delete all categories error:", error);
    return next(new ApiError(500, "Lỗi khi xóa tất cả thể loại."));
  }
};
