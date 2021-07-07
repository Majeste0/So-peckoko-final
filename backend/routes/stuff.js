const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const saucesCtrl = require("../controllers/stuff");

router.get("/", auth, saucesCtrl.getAllStuff);
router.post("/", auth, multer, saucesCtrl.createSauce);
router.post("/:id/like", auth, saucesCtrl.like);
router.get("/:id", auth, saucesCtrl.getOneSauce);
router.put("/:id", auth, multer, saucesCtrl.modifySauce);
router.delete("/:id", auth, saucesCtrl.deleteSauce);

module.exports = router;
