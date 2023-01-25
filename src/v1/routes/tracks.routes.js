const express = require("express");
const {
  postPlaylist,
  getAllPlaylists,
  getPlaylistById,
  deletePlaylist,
  patchPlaylist,
} = require("../../controllers/playlist.controller");
const { checkJwt } = require("../../middlewares/check.middleware");
const router = express.Router();
router
  .get("/", getAllPlaylists)
  .get("/:id", getPlaylistById)
  .post("/:id", postPlaylist)
  .delete("/:id", deletePlaylist)
  .patch("/:id", patchPlaylist);

module.exports = router;

// const trackRouter = require("express").Router();
// const trackController = require("../controllers/track.controller");

// trackRouter
//   .get("/", trackController.getTracks)
//   .post("/", trackController.updateTrack)
//   .delete("/:id", trackController.deleteTrack);

// module.exports = trackRouter;
