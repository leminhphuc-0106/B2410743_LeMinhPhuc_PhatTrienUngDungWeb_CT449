const verifyStaff = (req, res, next) => {
  const { id, accountType, ChucVu } = req.user;

  if (accountType !== "nhanvien") {
    return res.status(403).send({
      message: "Bạn không có quyền thực hiện thao tác này!",
    });
  }

  if (ChucVu === "admin" || (ChucVu === "staff" && id === req.params.id)) {
    return next();
  }

  return res.status(403).send({
    message: "Bạn không có quyền thực hiện thao tác này!",
  });
};

module.exports = verifyStaff;
