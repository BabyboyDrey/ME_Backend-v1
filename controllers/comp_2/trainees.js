const { default: mongoose } = require("mongoose");
const asyncErrCatcher = require("../../middlewares/asyncErrCatcher");
const Trainees = require("../../models/comp_2/trainees");
const router = require("express").Router();

router.post(
  "/create-trainee",
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body;
      const trainee_data = await Trainees.findOne({
        business_name: items.business_name,
      });

      if (trainee_data) {
        return res.status(403).json({
          error: true,
          message: "Trainees already exist with this business name",
        });
      }

      await Trainees.create(items);

      res.status(200).json({
        success: true,
        message: "Trainee created successfully.",
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
  "/get-all-trainees",
  asyncErrCatcher(async (req, res) => {
    try {
      const trainee_data = await Trainees.find({});
      if (trainee_data.length === 0) {
        return res.status(400).json({
          error: true,
          message: "No trainees created",
        });
      }
      res.status(200).json({
        success: true,
        trainee_data,
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
  "/get-trainees/:id",
  asyncErrCatcher(async (req, res) => {
    try {
      const { id } = req.params;
      const trainee_data = await Trainees.findOne({
        _id: id,
      });
      if (!trainee_data) {
        return res.status(403).json({
          error: true,
          message: "Trainee does not exist",
        });
      }
      res.status(200).json({
        success: true,
        trainee_data,
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
  "/edit-trainee/:id",
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body;
      const { id } = req.params;
      const trainee_data = await Trainees.findOne({
        _id: id,
      });
      if (!trainee_data) {
        return res.status(403).json({
          error: true,
          message: "Trainee does not exist",
        });
      }
      Object.assign(trainee_data, items);
      await trainee_data.save();
      res.status(200).json({
        success: true,
        trainee_data,
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
  "/get-trainee-by-business-name",
  asyncErrCatcher(async (req, res) => {
    try {
      const { business_name } = req.query;
      const trainee_data = await Trainees.findOne({
        business_name: business_name,
      });
      if (!trainee_data) {
        return res.status(403).json({
          error: true,
          message: "Trainee does not exist",
        });
      }
      res.status(200).json({
        success: true,
        trainee_data,
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

router.delete(
  "/delete-trainee/:id",
  asyncErrCatcher(async (req, res) => {
    try {
      const { id } = req.params;
      console.log("id:", id);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: true,
          message: "Invalid ID format",
        });
      }

      const trainee_data = await Trainees.findByIdAndDelete(id);
      console.log("tr:", trainee_data);
      if (!trainee_data) {
        return res.status(404).json({
          error: true,
          message: "Trainee does not exist",
        });
      }

      res.status(200).json({
        success: true,
        message: "Data deleted",
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
