const { default: mongoose } = require("mongoose");
const asyncErrCatcher = require("../../middlewares/asyncErrCatcher");
const MCP = require("../../models/comp_2/mcp");
const router = require("express").Router();

router.post(
  "/make-mcp",
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body;

      const found_mcp = await MCP.findOne({
        mcps: { $elemMatch: { name_of_business: items.name_of_business } },
      });

      if (found_mcp) {
        return res.status(403).json({
          error: true,
          message: "MCP User already created with sent name of business",
        });
      }

      await MCP.findOneAndUpdate(
        {},
        {
          $push: {
            mcps: items,
          },
        },
        { new: true, upsert: true }
      );

      res.status(200).json({
        success: true,
        message: "MCP created",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: true,
        message: err.message,
      });
    }
  })
);

router.get(
  "/get-all-mcps",
  asyncErrCatcher(async (req, res) => {
    try {
      const all_mcp = await MCP.find({});

      res.status(200).json({
        success: true,
        result: all_mcp[0],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: true,
        message: err.message,
      });
    }
  })
);

router.put(
  "/update-mcp/:post_id",
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body;
      const { post_id } = req.params;

      const objectId = new mongoose.Types.ObjectId(post_id);

      const found_mcp = await MCP.findOne({
        mcps: {
          $elemMatch: {
            _id: objectId,
          },
        },
      });

      if (!found_mcp) {
        return res.status(404).json({
          error: true,
          message: "MCP User not found",
        });
      }

      const updateObject = {};
      for (const key in items) {
        if (key !== "_id") {
          updateObject[`mcps.$.${key}`] = items[key];
        }
      }

      const new_data = await MCP.findOneAndUpdate(
        {
          "mcps._id": objectId,
        },
        {
          $set: updateObject,
        },
        {
          new: true,
        }
      );

      res.status(200).json({
        success: true,
        new_data: new_data,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: true,
        message: err.message,
      });
    }
  })
);

module.exports = router;
