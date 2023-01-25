const mongoose = require("mongoose");
const { User } = require("../models");
// const fs = require("fs-extra");
// const { uploadImage, destroyImage } = require("../utils/cloudinary");

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({})
        .limit(10)
        .sort({ date: -1 })
        .populate("favGenres")
        .populate("favPlaylists")
        .populate("favAlbums")
        .populate("favTracks")
        .populate("followers")
        .populate("following")
        .lean();

      if (users.length < 1) {
        return res.status(404).send({
          status: "FALSE",
          message: `The DB is currently empty`,
        });
      }

      res.status(200).send(users);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  getUserById: async (req, res) => {
    const {
      params: { id },
    } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send({
        status: "FALSE",
        message: `${id} is an invalid ID`,
      });
    }

    try {
      const user = await User.findById(id)
        .populate("favGenres")
        .populate("favPlaylists")
        .populate("favAlbums")
        .populate("favTracks")
        .populate("followers")
        .populate("following")
        .lean();

      if (!user) {
        return res.status(404).send({
          status: "FALSE",
          message: `User ${id} was not found`,
        });
      }

      res.status(200).send(user);
    } catch (err) {
      res.status(400).send(err);
    }
  },
  postUser: async (req, res) => {
    const { body } = req;

    // if (!body.avatar) {
    //   body.avatar =
    //     "https://res.cloudinary.com/drghk9p6q/image/upload/v1674474842/Final-Project-MERN/images-orpheus/default-images/Untitled_design_tvsbzn.webp";
    // }

    try {
      const userExists = await User.findOne({ email: body.email }); // Get to userData.email
      if (userExists) {
        return res.status(400).send({
          status: "false",
          message: "User already stored in the DB",
        });
      }
      const user = await User.create({ ...body });
      res.status(201).send({
        status: "Created",
        data: user,
      });
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  deleteUser: async (req, res) => {
    const {
      params: { id },
    } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send({
        status: "FALSE",
        message: `User ${id} is invalid`,
      });
    }

    try {
      const user = await User.findByIdAndDelete(id);

      // Destroy user image from cloudinary
      if (user.img?.id) {
        await destroyImage(body.img.id);
      }

      if (!user) {
        res.status(404).send({
          status: "FALSE",
          message: `User ${id} was not found`,
        });
      }
      res.status(200).send(user);
    } catch (err) {
      res.status(400).send(err);
    }
  },
  patchUser: async (req, res) => {
    const {
      params: { id },
      body,
      files,
    } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send({
        status: "FALSE",
        message: `User ${id} is invalid`,
      });
    }

    try {
      if (files?.image) {
        // Destroy previous image from cloudinary
        if (body.img?.id) {
          await destroyImage(body.img);
        }

        // If an image is uploaded we upload it to cloudinary and get the public_id and the URL
        const { public_id, secure_url } = await uploadImage(
          files.image.tempFilePath
        );

        // Once uploaded, delete the temp. file
        await fs.unlink(files.image.tempFilePath);

        const user = await User.findByIdAndUpdate(
          { _id: id },
          {
            ...body,
            img: { id: public_id, url: secure_url },
          }
        );

        if (!user) {
          res.status(404).send({
            status: "FALSE",
            message: `User ${id} was not found`,
          });
        }
        res.status(201).send({
          status: "OK",
          message: `User ${id} updated successfully`,
        });
      } else {
        const user = await User.findByIdAndUpdate({ _id: id }, { ...body });

        if (!user) {
          res.status(404).send({
            status: "FALSE",
            message: `User ${id} was not found`,
          });
        }
        res.status(201).send({
          status: "OK",
          message: `User ${id} updated successfully`,
        });
      }
    } catch (err) {
      res.status(400).send(err);
    }
  },
};

module.exports = {
  getAllUsers: userController.getAllUsers,
  getUserById: userController.getUserById,
  postUser: userController.postUser,
  deleteUser: userController.deleteUser,
  patchUser: userController.patchUser,
};

// const userModel = require("../models/user.models");

// const getAllUsers = async (req, res, next) => {
//   const { firstName, lastName, userName, email } = req.body;

//   try {
//     const user = await userModel.find({
//       firstName,
//       lastName,
//       userName,
//       email,
//     });
//     res.status(201).send({ status: true, data: user });
//   } catch (error) {
//     res.status(500).send({ status: false, msg: error.message });
//   }
// };

// const createUser = async (req, res, next) => {
//   const { firstName, lastName, userName, email } = req.body;

//   try {
//     const user = await userModel.create({
//       firstName,
//       lastName,
//       userName,
//       email,
//     });
//     res.status(201).send({ status: true, data: user });
//   } catch (error) {
//     res.status(500).send({ status: false, msg: error.message });
//   }
// };

// const updateUser = async (req, res, next) => {
//   const { id } = req.params;
//   const { ...fields } = req.body;

//   try {
//     const updatedUser = await userModel
//       .findOneAndUpdate(
//         { _id: id },
//         {
//           $set: {
//             ...fields,
//           },
//         },
//         { new: true }
//       )
//       .lean()
//       .exec();

//     res.status(200).send({ status: true, data: updatedUser });
//   } catch (error) {
//     res.status(500).send({ status: false, msg: error.message });
//   }
// };

// const getUserID = async (req, res, next) => {
//   const { id } = req.params;

//   try {
//     const user = await userModel.findById(id).lean().exec();

//     res.status(200).send({ status: true, data: user });
//   } catch (error) {
//     res.status(500).send({ status: false, msg: error.message });
//   }
// };

// module.exports = { getAllUsers, createUser, getUserID, updateUser };
