const router = require('express').Router()
const PetController = require('../controllers/PetController')

const verifyToken = require('../helpers/verify-token')
const { imageUpload } = require('../helpers/image-upload')

router.get('/', PetController.getAll)
router.get('/:id', PetController.getPetBtId)
router.get('/mypets', verifyToken, PetController.getAllUserPets)
router.get('/myadoptions', verifyToken, PetController.getAllUserAdoptions)
router.post('/create', verifyToken, imageUpload.array('images'), PetController.create)
router.delete('/:id', verifyToken, PetController.removePetById)

module.exports = router