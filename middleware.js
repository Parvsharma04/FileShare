function auth(req, res, next) {
  if (req.session.user) next();
  else res.status(404).render("error.ejs", { error: "Unauthorized accesss" });
}


module.exports = auth