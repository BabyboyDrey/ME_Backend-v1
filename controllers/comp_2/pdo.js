const { default: mongoose } = require("mongoose");
const asyncErrCatcher = require("../../middlewares/asyncErrCatcher");
const Pdo_comp2 = require("../../models/comp_2/pdo");
const router = require("express").Router();

//PDO 1

router.post(
  "/make-post-no-of-youths-obtaining-skills",
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body;

      const found_data = await Pdo_comp2.findOne({
        no_of_youths_obtaining_recognized_skills_afters_completing_an_informal_apprenticeship:
          { $elemMatch: { name_of_business: items.name_of_business } },
      });

      if (found_data) {
        return res.status(403).json({
          error: true,
          message: "Data already created with sent name of business",
        });
      }

      await Pdo_comp2.findOneAndUpdate(
        {},
        {
          $push: {
            no_of_youths_obtaining_recognized_skills_afters_completing_an_informal_apprenticeship:
              items,
          },
        },
        { new: true, upsert: true }
      );

      res.status(200).json({
        success: true,
        message: "Pdo created",
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
  "/get-all-no-youths-obtaining-skills",
  asyncErrCatcher(async (req, res) => {
    try {
      const data = await Pdo_comp2.findOne({
        no_of_youths_obtaining_recognized_skills_afters_completing_an_informal_apprenticeship:
          { $elemMatch: { $exists: true } },
      });
      if (!data) return res.status(400).json("Pdo data not found");

      const subDocs =
        data.no_of_youths_obtaining_recognized_skills_afters_completing_an_informal_apprenticeship;
      const subDoc_aggreagte = subDocs.reduce(
        (acc, curr) => {
          acc.male += curr.male;
          acc.female += curr.female;
          return acc;
        },
        { male: 0, female: 0 }
      );
      res.status(200).json({
        subDocs,
        subDoc_aggreagte,
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
  "/get-specific-no-youths-obtaining-skills/:data_id",
  asyncErrCatcher(async (req, res) => {
    try {
      const { data_id } = req.params;
      const data = await Pdo_comp2.findOne({
        no_of_youths_obtaining_recognized_skills_afters_completing_an_informal_apprenticeship:
          { $elemMatch: { _id: data_id } },
      });
      if (!data) return res.status(400).json("Pdo data not found");
      const subDocs =
        data.no_of_youths_obtaining_recognized_skills_afters_completing_an_informal_apprenticeship;

      const subDoc = subDocs.filter((e) => e._id.toString() === data_id);

      res.status(200).json({
        result: subDoc[0],
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
  "/update-no-youths-obtaining-skills/:data_id",
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body;
      const { data_id } = req.params;

      const data = await Pdo_comp2.findOne({
        no_of_youths_obtaining_recognized_skills_afters_completing_an_informal_apprenticeship:
          { $elemMatch: { _id: data_id } },
      });
      if (!data) return res.status(400).json("Pdo data not found");

      const subDocs =
        data.no_of_youths_obtaining_recognized_skills_afters_completing_an_informal_apprenticeship;

      const subDoc = subDocs.filter((e) => e._id.toString() === data_id);
      console.log(JSON.stringify(subDoc));
      let desired = subDoc[0];
      Object.keys(items).forEach((key) => {
        if (key !== "name_of_business") {
          desired[key] = items[key];
        }
      });
      await data.save();
      res.status(200).json({
        success: true,
        updated_data: subDoc,
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

// PDO 2 & 3

router.post(
  "/make-direct-project-beneficiaries",
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body;

      const found_data = await Pdo_comp2.findOne({
        direct_project_beneficiaries: {
          $elemMatch: { name_of_business: items.name_of_business },
        },
      });

      if (found_data) {
        return res.status(403).json({
          error: true,
          message: "Data already created with sent name of business",
        });
      }

      await Pdo_comp2.findOneAndUpdate(
        {},
        {
          $push: {
            direct_project_beneficiaries: items,
          },
        },
        { new: true, upsert: true }
      );

      res.status(200).json({
        success: true,
        message: "Pdo created",
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
  "/get-all-direct-project-beneficiaries",
  asyncErrCatcher(async (req, res) => {
    try {
      const found_data = await Pdo_comp2.findOne({
        direct_project_beneficiaries: {
          $elemMatch: { $exists: true },
        },
      });
      res.status(200).json({
        success: true,
        result: found_data["direct_project_beneficiaries"],
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
  "/update-direct-project-beneficiaries/:id",
  asyncErrCatcher(async (req, res) => {
    const deepMerge = (target, source) => {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (
            typeof source[key] === "object" &&
            source[key] !== null &&
            !Array.isArray(source[key])
          ) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
    };
    try {
      const items = req.body;
      const { id } = req.params;
      const found_data = await Pdo_comp2.findOne({
        direct_project_beneficiaries: {
          $elemMatch: { _id: id },
        },
      });

      const subDoc = found_data.direct_project_beneficiaries.id(id);

      deepMerge(subDoc, items);
      await found_data.save();

      res.status(200).json({
        success: true,
        subDoc,
      });
    } catch (err) {
      console.error(err);
      res.status(200).json({
        error: true,
        message: err.message,
      });
    }
  })
);

router.get(
  "/get-percentage-of-master-craft-person",
  asyncErrCatcher(async (req, res) => {
    try {
      const found_data = await Pdo_comp2.findOne({
        direct_project_beneficiaries: {
          $elemMatch: { $exists: true },
        },
      });
      const agg_result = found_data["direct_project_beneficiaries"].reduce(
        (acc, curr) => {
          acc.assessor.male += curr.master_craft_person.assessor.male || 0;
          acc.assessor.female += curr.master_craft_person.assessor.female || 0;
          acc.verifiers.male += curr.master_craft_person.verifiers.male || 0;
          acc.verifiers.female +=
            curr.master_craft_person.verifiers.female || 0;

          return acc;
        },
        {
          assessor: {
            male: 0,
            female: 0,
          },
          verifiers: {
            male: 0,
            female: 0,
          },
        }
      );

      const totalAssessors =
        agg_result.assessor.male + agg_result.assessor.female;
      const totalVerifiers =
        agg_result.verifiers.male + agg_result.verifiers.female;

      const female_assessor_percentage = totalAssessors
        ? (agg_result.assessor.female / totalAssessors) * 100
        : 0;
      const male_assessor_percentage = totalAssessors
        ? (agg_result.assessor.male / totalAssessors) * 100
        : 0;
      const male_verifiers_percentage = totalVerifiers
        ? (agg_result.verifiers.male / totalVerifiers) * 100
        : 0;
      const female_verifiers_percentage = totalVerifiers
        ? (agg_result.verifiers.female / totalVerifiers) * 100
        : 0;

      res.status(200).json({
        success: true,
        agg_result,
        assessor_percentage: {
          female_assessor_percentage: parseFloat(
            female_assessor_percentage.toFixed(2)
          ),
          male_assessor_percentage: parseFloat(
            male_assessor_percentage.toFixed(2)
          ),
        },
        verifiers_percentage: {
          female_verifiers_percentage: parseFloat(
            female_verifiers_percentage.toFixed(2)
          ),
          male_verifiers_percentage: parseFloat(
            male_verifiers_percentage.toFixed(2)
          ),
        },
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
