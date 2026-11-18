const verifyAdmin = (req, res, next) => {
  if (req.user.accountType !== "nhanvien" || req.user.ChucVu !== "admin") {
    return res.status(403).send({
      message: "Bạn không có quyền truy cập!",
    });
  }

  return next();
};

module.exports = verifyAdmin;
