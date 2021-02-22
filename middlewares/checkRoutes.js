exports.isCustomer = (req, res, next) => {
  if (req.session.type == 'C')
    return next();
  else {
    req.flash('error_msg', 'Please log-in as a customer to proceed.');
    res.redirect('/movies');
  }
}

exports.isEmp = (req, res, next) => {
  if (req.session.type == 'E')
    return next();
  else {
    req.flash('error_msg', 'Please log-in as an employee to proceed.');
    res.redirect('/');
  }
}
