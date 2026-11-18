const ApiError = require("../api_error");
const PublisherService = require("../services/publisher.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  try {
    const { TenNXB, DiaChi } = req.body;

    if (!TenNXB || !TenNXB.trim()) {
      return next(new ApiError(400, "Tên nhà xuất bản là bắt buộc."));
    }

    const publisherService = new PublisherService(MongoDB.client);
    const publisher = await publisherService.create({ TenNXB, DiaChi });

    return res.status(201).send({
      message: "Thêm nhà xuất bản thành công.",
      data: publisher,
    });
  } catch (error) {
    console.error("Create publisher error:", error);
    return next(new ApiError(500, "Lỗi khi thêm nhà xuất bản."));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const publishers = await publisherService.findAll();

    return res.send(publishers);
  } catch (error) {
    console.error("Find publishers error:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách nhà xuất bản."));
  }
};

exports.findByName = async (req, res, next) => {
  try {
    const { name } = req.params;

    if (!name || !name.trim()) {
      return next(new ApiError(400, "Tên nhà xuất bản không hợp lệ."));
    }

    const publisherService = new PublisherService(MongoDB.client);
    const publishers = await publisherService.findByName(name.trim());

    return res.send(publishers);
  } catch (error) {
    console.error("Find publisher by name error:", error);
    return next(new ApiError(500, "Lỗi khi tìm nhà xuất bản theo tên."));
  }
};

exports.findById = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const publisher = await publisherService.findById(req.params.id);

    if (!publisher) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản."));
    }

    return res.send(publisher);
  } catch (error) {
    console.error("Find publisher error:", error);
    return next(new ApiError(500, "Lỗi khi lấy nhà xuất bản."));
  }
};

exports.update = async (req, res, next) => {
  try {
    const { TenNXB, DiaChi } = req.body;

    if (TenNXB !== undefined && (!TenNXB || !TenNXB.trim())) {
      return next(new ApiError(400, "Tên nhà xuất bản không được để trống."));
    }

    const publisherService = new PublisherService(MongoDB.client);
    const publisher = await publisherService.update(req.params.id, {
      TenNXB,
      DiaChi,
    });

    if (!publisher) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản."));
    }

    return res.send({
      message: "Cập nhật nhà xuất bản thành công.",
      data: publisher,
    });
  } catch (error) {
    console.error("Update publisher error:", error);
    return next(new ApiError(500, "Lỗi khi cập nhật nhà xuất bản."));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const publisher = await publisherService.delete(req.params.id);

    if (!publisher) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản."));
    }

    return res.send({
      message: "Xóa nhà xuất bản thành công.",
    });
  } catch (error) {
    console.error("Delete publisher error:", error);
    return next(new ApiError(500, "Lỗi khi xóa nhà xuất bản."));
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const deletedCount = await publisherService.deleteAll();

    return res.send({
      message: `Đã xóa ${deletedCount} nhà xuất bản.`,
    });
  } catch (error) {
    console.error("Delete all publishers error:", error);
    return next(new ApiError(500, "Lỗi khi xóa tất cả nhà xuất bản."));
  }
};
