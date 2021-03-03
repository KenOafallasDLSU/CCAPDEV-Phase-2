const router = require('express').Router()
const posterController = require('../controllers/posterController.js')
const {isCustomer, isEmp} = require('../middlewares/checkRoutes.js')
const { upload } = require('../middlewares/multer-gridfs.js');

router.get('/:prefix?/image/:filename', posterController.getPoster)

router.post('/upload', isEmp, upload.single('posterSubmit'), posterController.uploadPoster)

module.exports = router