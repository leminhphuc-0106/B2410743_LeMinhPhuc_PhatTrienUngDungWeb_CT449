const verifyStaff = (req, res, next) => {
  if (
    req.role === "admin" ||
    (req.role === "staff" && req.id === req.params.id)
  ) {
    return next();
  }

  return res.status(403).send({
    message: "Bạn không có quyền thực hiện thao tác này!"
  });
};

module.exports = verifyStaff;