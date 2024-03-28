import { User } from "../models/userSchema.js";
const user = User;
export const chatIUserController = {
  getAllUsers: async (req, res, next) => {
    try {
      console.log("all user api hit");
      const users = await user
        .find({ _id: { $ne: req.params.id } })
        .select(["email", "name", "avatarImage", "_id"]);
        
      return res.json(users);
    } catch (ex) {
      next(ex);
    }
  },

  setAvatar: async (req, res, next) => {
    try {
      const userId = req.params.id;
      const avatarImage = req.body.image;
      const userData = await user.findByIdAndUpdate(
        userId,
        {
          isAvatarImageSet: true,
          avatarImage,
        },
        { new: true }
      );
      return res.json({
        isSet: userData.isAvatarImageSet,
        image: userData.avatarImage,
      });
    } catch (ex) {
      next(ex);
    }
  },
  logOut: (req, res, next) => {
    try {
      if (!req.params.id) return res.json({ msg: "User id is required " });
      onlineUsers.delete(req.params.id);
      return res.status(200).send();
    } catch (ex) {
      next(ex);
    }
  },
};
