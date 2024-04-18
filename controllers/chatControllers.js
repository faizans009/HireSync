import { User } from "../models/userSchema.js";
import Messages from "../models/messageModel.js";
const user = User;
export const chatIUserController = {
  getAllUsers: async (req, res, next) => {
    try {
      const userId = req.params.id


      const messages = await Messages.find({
        users: { $in: [userId] },
      });

      const otherUsers = messages.reduce((acc, curr) => {
        curr.users.forEach((user) => {
          if (user !== userId && !acc.find((accUser) => accUser._id === user)) {
            acc.push(user);
          }
        });
        return acc;
      }, []);

      const users = await User.find({
        _id: { $in: otherUsers },
      }).select(["email", "name", "avatarImage", "_id"]);

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
