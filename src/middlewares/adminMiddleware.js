const adminOnly = (req, res, next) => {
  if (!req.user.admin) {
    return res.status(403).json({ message: 'Acesso negado!' });
  }
  next();
};

export default adminOnly;
