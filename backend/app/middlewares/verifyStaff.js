const verifyStaff = (req, res, next) => {
  const { id, accountType, Chucvu } = req.user;

  if (accountType !== "nhanvien") {
    return res.status(403).send({
      message: "Bạn không có quyền thực hiện thao tác này!"
    });
  }

  if (
    Chucvu === "admin" ||
    (Chucvu === "staff" && id === req.params.id)
  ) {
    return next();
  }

  return res.status(403).send({
    message: "Bạn không có quyền thực hiện thao tác này!"
  });
};

module.exports = verifyStaff;
