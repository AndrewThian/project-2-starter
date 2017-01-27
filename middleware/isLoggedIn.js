module.exports = function (req, res, callback) {
  console.log('checking authentication @ isLoggedIn!!!'.green)
  // console.log('user details @ isLoggedIn: '.blue, req.user)
  if (!req.user) {
    console.log('user not authenticated'.red)
    req.flash('error', 'you must be logged in to view the page!')
    res.redirect('/auth/login')
  } else {
    callback()
  }
}
