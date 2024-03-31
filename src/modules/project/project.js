const { authenticateJWT } = require('../middleware/middleware.js');
const {addproject,deleteproject,updateproject,getproject,changeProjStatus} = require('./project.contrroller.js');
const router = require('express').Router();

router.post('/project',authenticateJWT, addproject);
router.delete('/project', authenticateJWT,deleteproject);
router.patch('/project', authenticateJWT,updateproject);
router.get('/project',authenticateJWT, getproject);
router.patch('/ProjStatus',authenticateJWT,changeProjStatus)
module.exports = router;
