const verifyAdmin = (req, res, next) => {
  if (
    req.user.accountType !== "nhanvien" ||
    req.user.Chucvu !== "admin"
  ) {
    return res.status(403).send({
      message: "Bạn không có quyền truy cập!"
    });
  }

  next();
};

module.exports = verifyAdmin;
