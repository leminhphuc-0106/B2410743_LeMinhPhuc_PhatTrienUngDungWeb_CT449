const verifyStaff = (req, res, next) => {
  const { id, accountType, chuc_vu } = req.user;

  if (accountType !== "nhanvien") {
    return res.status(403).send({
      message: "Bạn không có quyền thực hiện thao tác này!"
    });
  }

  if (
    chuc_vu === "admin" ||
    (chuc_vu === "staff" && id === req.params.id)
  ) {
    return next();
  }

  return res.status(403).send({
    message: "Bạn không có quyền thực hiện thao tác này!"
  });
};

module.exports = verifyStaff;