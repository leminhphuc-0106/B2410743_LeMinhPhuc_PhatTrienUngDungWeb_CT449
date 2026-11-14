const verifyAdmin = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).send({
      message: "Bạn không có quyền truy cập!"
    });
  }

  next();
};

module.exports = verifyAdmin;