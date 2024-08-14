const express = require("express");
const router = express.Router();
const Pdo_comp1 = require("../../models/comp_1/PDO");
const { upload } = require("../../multer/multer_pdf");
const asyncErrCatcher = require("../../middlewares/asyncErrCatcher");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const checkAndDeleteFile = require("../../utils/checkAndDeleteFile");
const handleFileUnlinking = require("../../utils/handleFileUnlinking.js");

const createCookie = (user, statusCode, res) => {
  try {
    const payload = {
      email: user.email,
      jurisdiction: user.jurisdiction,
      state: user.state,
      role: user.user_role,
      tc_name: user.tc_name,
    };

    let access_token;

    if (payload.role === "user4") {
      access_token = jwt.sign(payload, process.env.JWT_SECRET_PASS, {
        expiresIn: "7hr",
      });
    } else if (payload.role === "user2") {
      access_token = jwt.sign(payload, process.env.JWT_SECRET_PASS, {
        expiresIn: "7hr",
      });
    } else if (payload.role === "user3") {
      access_token = jwt.sign(payload, process.env.JWT_SECRET_PASS, {
        expiresIn: "7hr",
      });
    } else {
      access_token = jwt.sign(payload, process.env.JWT_SECRET_PASS, {
        expiresIn: "7hr",
      });
    }
    //2AYpV2XebU-RcIuRPCA4QJ11ova3_LHsDKqMatBl24dkArYjtfY
    // if (user4Token) {
    //   res
    //     .status(statusCode)
    //     .cookie('user4Token', user4Token, {
    //       sameSite: 'None',
    //       httpOnly: true,
    //       secure: true
    //     })
    //     .json({ success: true, token: user4Token })
    // } else if (user1Token) {
    //   res
    //     .status(statusCode)
    //     .cookie('user1Token', user1Token, {
    //       sameSite: 'None',
    //       httpOnly: true,
    //       secure: true
    //     })
    //     .json({ success: true, token: user1Token })
    // } else if (user2Token) {
    //   res
    //     .status(statusCode)
    //     .cookie('user2Token', user2Token, {
    //       sameSite: 'None',
    //       httpOnly: true,
    //       secure: true
    //     })
    //     .json({ success: true, token: user2Token })
    // } else if (user3Token) {
    //   res
    //     .status(statusCode)
    //     .cookie('user3Token', user3Token, {
    //       sameSite: 'None',
    //       httpOnly: true,
    //       secure: true
    //     })
    //     .json({ success: true, token: user3Token })
    // }

    res
      .status(statusCode)
      .cookie("access_token", access_token, {
        sameSite: "None",
        httpOnly: true,
        secure: true,
      })
      .json({ success: true, token: access_token });
  } catch (err) {
    res.status(500).json(`Err creating cookie: ${err}`);
  }
};

router.post(
  "/set-user-cookies",
  asyncErrCatcher(async (req, res) => {
    try {
      const userData = req.body;

      createCookie(userData, 200, res);
    } catch (err) {
      res.status(500).json(`Err message: ${err}`);
    }
  })
);

// POST REQUEST

router.post(
  "/make-post-female-enrollment-rate-in-project-supportedTc",
  upload.fields([
    { name: "tc_report_pdf", maxCount: 1 },
    { name: "student_enrollment_data_doc_pdf", maxCount: 1 },
  ]),
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body;
      const jurisdiction = req.query.jurisdiction;
      const tcType = `${jurisdiction}_tc`;

      const existing_post = await Pdo_comp1.findOne({
        [`female_enrollment_rate_in_project_supportedTc.${tcType}.tc_name`]:
          items.tc_name,
      });

      if (existing_post) {
        await handleFileUnlinking(req.files);
        return res.status(400).json("Post data already exists");
      }

      if (
        items.no_of_female_students_enrolled_in_priority_trade &&
        items.total_no_of_students_enrolled_in_priority_trades
      ) {
        items.percentage =
          (items.no_of_female_students_enrolled_in_priority_trade /
            items.total_no_of_students_enrolled_in_priority_trades) *
          100;
      }

      if (
        items.no_of_tvet_sensitizations_conducted_by_school &&
        req.files["tc_report_pdf"]
      ) {
        const new_value = items.no_of_tvet_sensitizations_conducted_by_school;
        items.no_of_tvet_sensitizations_conducted_by_school = {
          value: new_value,
          tc_report_pdf: req.files["tc_report_pdf"][0].filename,
        };
      }

      if (req.files["student_enrollment_data_doc_pdf"]) {
        items.student_enrollment_data_doc_pdf =
          req.files["student_enrollment_data_doc_pdf"][0].filename;
      }

      const created_post = await Pdo_comp1.findOneAndUpdate(
        {},
        {
          $push: {
            [`female_enrollment_rate_in_project_supportedTc.${tcType}`]: items,
          },
        },
        { new: true, upsert: true }
      );

      const tcTypeArray =
        created_post.female_enrollment_rate_in_project_supportedTc[tcType];

      const matchedEntry = tcTypeArray.find((e) => e.tc_name === items.tc_name);

      const totalTc = await Pdo_comp1.find({
        [`female_enrollment_rate_in_project_supportedTc.${tcType}`]: {
          $exists: true,
        },
      });

      let total_females_in_tcType_tc = 0;
      let total_students_in_tcType_tc = 0;

      totalTc.forEach((doc) => {
        doc.female_enrollment_rate_in_project_supportedTc.federal_tc.forEach(
          (entry) => {
            total_females_in_tcType_tc +=
              entry.no_of_female_students_enrolled_in_priority_trade || 0;
            total_students_in_tcType_tc +=
              entry.total_no_of_students_enrolled_in_priority_trades || 0;
          }
        );

        doc.female_enrollment_rate_in_project_supportedTc.state_tc.forEach(
          (entry) => {
            total_females_in_tcType_tc +=
              entry.no_of_female_students_enrolled_in_priority_trade || 0;
            total_students_in_tcType_tc +=
              entry.total_no_of_students_enrolled_in_priority_trades || 0;
          }
        );
      });

      let percentage_of_female_students_across_tc;

      if (total_students_in_tcType_tc !== 0) {
        percentage_of_female_students_across_tc =
          (total_females_in_tcType_tc / total_students_in_tcType_tc) * 100;

        await Pdo_comp1.updateOne(
          {},
          {
            $set: {
              "female_enrollment_rate_in_project_supportedTc.percentage_of_female_students_across_tc":
                percentage_of_female_students_across_tc,
            },
          }
        );
      }

      res.status(200).json({
        success: true,
        message: "Post created successfully",
        matchedEntry,
      });
    } catch (err) {
      await handleFileUnlinking(req.files);
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  })
);

router.post(
  "/make-post-beneficiaries-of-job-focused-interventions",
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body;
      const jurisdiction = req.query.jurisdiction;
      const tcType = `${jurisdiction}_tc`;

      const existing_tc = await Pdo_comp1.findOne({
        [`beneficiaries_of_job_focused_interventions.${tcType}.tc_name`]:
          items.tc_name,
      });

      if (existing_tc) {
        res.status(400).json("Post already exists");
      }

      const new_doc = await Pdo_comp1.findOneAndUpdate(
        {},
        {
          $push: {
            [`beneficiaries_of_job_focused_interventions.${tcType}`]: items,
          },
        },
        { new: true, insert: true }
      );

      const subDocs =
        new_doc.beneficiaries_of_job_focused_interventions[tcType];
      const new_entry = subDocs.find((e) => e.tc_name === items.tc_name);

      res.status(200).json({ success: true, new_entry });
    } catch (err) {
      res.status(500).json({ err: `Internal Server Error: ${err}` });
    }
  })
);

// GET REQUEST

router.get(
  "/get-post-female-enrollment-rate-in-project-supportedTc",
  asyncErrCatcher(async (req, res) => {
    try {
      let requested_tc_data;

      const query = {};
      query[
        `female_enrollment_rate_in_project_supportedTc.${req.query.jurisdiction}_tc`
      ] = { $elemMatch: { tc_name: req.query.tc_name } };

      const data = await Pdo_comp1.findOne(query).maxTimeMS(10000);
      console.log(data);
      if (!data) return res.status(400).json("Tc data not found");

      const tc_collection =
        data.female_enrollment_rate_in_project_supportedTc[
          `${req.query.jurisdiction}_tc`
        ];

      const percentage_of_female_students_across_tc =
        data.female_enrollment_rate_in_project_supportedTc
          .percentage_of_female_students_across_tc;
      requested_tc_data = tc_collection.find(
        (e) => e.tc_name === req.query.tc_name
      );

      res.status(200).json({
        success: true,
        requested_tc_data,
        percentage_of_female_students_across_tc,
      });
    } catch (err) {
      res.status(500).json(`Err message: ${err}`);
    }
  })
);

router.get(
  "/get-post-beneficiaries-of-job-focused-interventions",
  asyncErrCatcher(async (req, res) => {
    try {
      const data = await Pdo_comp1.findOne({
        [`beneficiaries_of_job_focused_interventions.${req.query.jurisdiction}_tc`]:
          { $elemMatch: { tc_name: req.query.tc_name } },
      });

      if (!data) return res.status(400).json("Tc data not found");

      const subDocs =
        data.beneficiaries_of_job_focused_interventions[
          `${req.query.jurisdiction}_tc`
        ];
      const subDoc = subDocs.find((e) => e.tc_name === req.query.tc_name);
      res.status(200).json({
        success: true,
        requested_tc_data: subDoc,
      });
    } catch (err) {
      res.status(500).json(`Err message: ${err}`);
    }
  })
);

// UPDATE REQUEST

router.put(
  "/update-post-female-enrollment-rate-in-project-supportedTc/:post_id",
  upload.fields([
    { name: "tc_report_pdf", maxCount: 1 },
    { name: "student_enrollment_data_doc_pdf", maxCount: 1 },
  ]),
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body;
      const found_post_exists = await Pdo_comp1.findOne({
        [`female_enrollment_rate_in_project_supportedTc.${items.jurisdiction}_tc`]:
          { $elemMatch: { _id: req.params.post_id } },
      });

      if (!found_post_exists) {
        await handleFileUnlinking(req.files);
        return res
          .status(404)
          .json(`No tc with that id or invalid jurisdiction`);
      }

      const parentDoc =
        found_post_exists.female_enrollment_rate_in_project_supportedTc;
      const subDocs =
        found_post_exists.female_enrollment_rate_in_project_supportedTc[
          `${items.jurisdiction}_tc`
        ];
      const subDoc = subDocs.find(
        (e) => e._id.toString() === req.params.post_id
      );

      if (
        req.files &&
        req.files["tc_report_pdf"] &&
        items.no_of_tvet_sensitizations_conducted_by_school
      ) {
        const item_value = items.no_of_tvet_sensitizations_conducted_by_school;
        items.no_of_tvet_sensitizations_conducted_by_school = {
          value: item_value,
          tc_report_pdf: req.files["tc_report_pdf"][0].filename,
        };
        if (
          subDoc.no_of_tvet_sensitizations_conducted_by_school.tc_report_pdf
        ) {
          await new Promise((resolve, reject) => {
            checkAndDeleteFile(
              `uploads/${subDoc.no_of_tvet_sensitizations_conducted_by_school.tc_report_pdf}`,
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }
      if (req.files && req.files["student_enrollment_data_doc_pdf"]) {
        items.student_enrollment_data_doc_pdf =
          req.files["student_enrollment_data_doc_pdf"][0].filename;

        if (subDoc.student_enrollment_data_doc_pdf) {
          await new Promise((resolve, reject) => {
            checkAndDeleteFile(
              `uploads/${subDoc.student_enrollment_data_doc_pdf}`,
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }

      if (
        items.no_of_female_students_enrolled_in_priority_trade &&
        items.total_no_of_students_enrolled_in_priority_trades
      ) {
        items.percentage =
          (items.no_of_female_students_enrolled_in_priority_trade /
            items.total_no_of_students_enrolled_in_priority_trades) *
          100;
      }

      console.log("Updating sub-document with items:", items);

      Object.assign(subDoc, items);

      let total_females_in_tcType_tc = 0;
      let total_students_in_tcType_tc = 0;

      parentDoc.federal_tc.forEach((doc) => {
        total_females_in_tcType_tc +=
          doc.no_of_female_students_enrolled_in_priority_trade || 0;
        total_students_in_tcType_tc +=
          doc.total_no_of_students_enrolled_in_priority_trades || 0;
      });

      parentDoc.state_tc.forEach((doc) => {
        total_females_in_tcType_tc +=
          doc.no_of_female_students_enrolled_in_priority_trade || 0;
        total_students_in_tcType_tc +=
          doc.total_no_of_students_enrolled_in_priority_trades || 0;
      });

      let percentage_of_female_students_across_tc;

      if (total_students_in_tcType_tc !== 0) {
        percentage_of_female_students_across_tc =
          (total_females_in_tcType_tc / total_students_in_tcType_tc) * 100;
      }

      parentDoc.percentage_of_female_students_across_tc =
        percentage_of_female_students_across_tc;

      await found_post_exists.save();
      res.status(200).json({
        success: true,
        subDoc,
        percentage_of_female_students_across_tc,
      });
    } catch (err) {
      await handleFileUnlinking(req.files);
      console.error(err);
      res.status(500).json(`Err: ${err}`);
    }
  })
);

router.put(
  "/update-post-beneficiaries-of-job-focused-interventions/:post_id",
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body;
      const found_post_exists = await Pdo_comp1.findOne({
        [`beneficiaries_of_job_focused_interventions.${items.jurisdiction}_tc`]:
          {
            $elemMatch: { _id: req.params.post_id },
          },
      });
      if (!found_post_exists) {
        return res.status(404).json({ error: "Post not found" });
      }

      const subDoc =
        found_post_exists.beneficiaries_of_job_focused_interventions[
          `${items.jurisdiction}_tc`
        ].find((e) => e._id.toString() === req.params.post_id);

      if (!subDoc) {
        return res.status(404).json({ error: "Subdocument not found" });
      }

      if (typeof subDoc !== "object" || subDoc === null) {
        return res.status(500).json({ error: "Subdocument is not an object" });
      }

      for (const key in items) {
        if (key in subDoc) {
          for (const subKey in items[key]) {
            if (subKey in subDoc[key]) {
              subDoc[key][subKey] = items[key][subKey];
            } else {
              subDoc[key][subKey] = items[key][subKey];
            }
          }
        }
      }

      await found_post_exists.save();

      res.status(200).json({ success: true, subDoc });
    } catch (err) {
      res.status(500).json({ error: `Error: ${err.message}` });
    }
  })
);

// DELETE REQUEST

router.delete(
  "/delete-post-female-enrollment-rate-in-project-supportedTc/:post_id",
  asyncErrCatcher(async (req, res) => {
    try {
      const jurisdiction = req.query.jurisdiction;
      const tcType = `${jurisdiction}_tc`;

      if (!mongoose.Types.ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json({ error: "Invalid Id format" });
      }

      const query = {};
      query[`female_enrollment_rate_in_project_supportedTc.${tcType}._id`] =
        new mongoose.Types.ObjectId(req.params.post_id);

      const parentDoc = await Pdo_comp1.findOne(query);
      if (!parentDoc) {
        return res.status(404).json({ error: "Post not found" });
      }

      const pdfFilenamesToDelete = [];
      parentDoc.female_enrollment_rate_in_project_supportedTc[tcType].forEach(
        (subDoc) => {
          if (
            subDoc.no_of_tvet_sensitizations_conducted_by_school.tc_report_pdf
          ) {
            pdfFilenamesToDelete.push(
              subDoc.no_of_tvet_sensitizations_conducted_by_school.tc_report
            );
          }
          if (subDoc.student_enrollment_data_doc) {
            pdfFilenamesToDelete.push(subDoc.student_enrollment_data_doc_pdf);
          }
        }
      );

      const update = {
        $pull: {
          [`female_enrollment_rate_in_project_supportedTc.${tcType}`]: {
            _id: new mongoose.Types.ObjectId(req.params.post_id),
          },
        },
      };
      const options = { new: true };
      await Pdo_comp1.findOneAndUpdate(query, update, options);

      for (const filename of pdfFilenamesToDelete) {
        const filePath = `uploads/${filename}`;
        try {
          checkAndDeleteFile(filePath, (err) => {
            if (err) {
              console.error(err);
            }
          });
        } catch (error) {
          console.error(error);
        }
      }

      const totalTc = await Pdo_comp1.find({
        [`female_enrollment_rate_in_project_supportedTc.${tcType}`]: {
          $exists: true,
        },
      });

      let total_females_in_tcType_tc = 0;
      let total_students_in_tcType_tc = 0;

      totalTc.forEach((doc) => {
        doc.female_enrollment_rate_in_project_supportedTc.federal_tc.forEach(
          (entry) => {
            total_females_in_tcType_tc +=
              entry.no_of_female_students_enrolled_in_priority_trade || 0;

            total_students_in_tcType_tc +=
              entry.total_no_of_students_enrolled_in_priority_trades || 0;
          }
        );

        doc.female_enrollment_rate_in_project_supportedTc.state_tc.forEach(
          (entry) => {
            total_females_in_tcType_tc +=
              entry.no_of_female_students_enrolled_in_priority_trade || 0;
            total_students_in_tcType_tc +=
              entry.total_no_of_students_enrolled_in_priority_trades || 0;
          }
        );
      });

      let percentage_of_female_students_across_tc;

      if (total_students_in_tcType_tc !== 0) {
        percentage_of_female_students_across_tc =
          (total_females_in_tcType_tc / total_students_in_tcType_tc) * 100;

        await Pdo_comp1.updateOne(
          {},
          {
            $set: {
              "female_enrollment_rate_in_project_supportedTc.percentage_of_female_students_across_tc":
                percentage_of_female_students_across_tc,
            },
          }
        );
      }
      console.log(
        `fh: ${total_students_in_tcType_tc}, ${percentage_of_female_students_across_tc}`
      );

      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
      });
    } catch (err) {
      res.status(500).json({ error: `Err message: ${err.message}` });
    }
  })
);

router.delete(
  "/delete-post-beneficiaries-of-job-focused-interventions/:post_id",
  asyncErrCatcher(async (req, res) => {
    try {
      const tcType = `${req.query.jurisdiction}_tc`;
      const query = {};
      query[`beneficiaries_of_job_focused_interventions.${tcType}._id`] =
        new mongoose.Types.ObjectId(req.params.post_id);

      const update = {
        $pull: {
          [`beneficiaries_of_job_focused_interventions.${tcType}`]: {
            _id: new mongoose.Types.ObjectId(req.params.post_id),
          },
        },
      };

      const options = { new: true };

      const parentDoc = await Pdo_comp1.findOneAndUpdate(
        query,
        update,
        options
      );

      if (!parentDoc) {
        return res.status(404).json("Post not found");
      }

      res
        .status(200)
        .json({ success: true, message: "Post deleted successfully" });
    } catch (err) {
      res.status(500).json({ Error: err.message });
    }
  })
);
// GET REQUEST BY TC JURISDICTION

router.get(
  "/get-posts-female-enrollment-rate-in-project-supportedTc",
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts_exists = await Pdo_comp1.find({
        [`female_enrollment_rate_in_project_supportedTc.${req.query.jurisdiction}_tc`]:
          { $exists: true },
      });
      const jury_posts =
        found_posts_exists[0].female_enrollment_rate_in_project_supportedTc[
          `${req.query.jurisdiction}_tc`
        ];
      if (!found_posts_exists || jury_posts.length === 0)
        return res
          .status(400)
          .json(
            `${
              req.query.jurisdiction.charAt(0).toUpperCase() +
              req.query.jurisdiction.slice(1)
            } Tc Array empty`
          );

      const tc_data_found = found_posts_exists.find((doc) => {
        return doc.female_enrollment_rate_in_project_supportedTc[
          `${req.query.jurisdiction}_tc`
        ];
      });

      if (!tc_data_found || tc_data_found.length === 0)
        return res
          .status(400)
          .json(
            `${
              req.query.jurisdiction.charAt(0).toUpperCase() +
              req.query.jurisdiction.slice(1)
            } Tc not existent`
          );

      const percentage_of_female_students_across_tc =
        tc_data_found.female_enrollment_rate_in_project_supportedTc
          .percentage_of_female_students_across_tc;

      const found_posts =
        tc_data_found.female_enrollment_rate_in_project_supportedTc[
          `${req.query.jurisdiction}_tc`
        ];

      res.status(200).json({
        success: true,
        found_posts,
        percentage_of_female_students_across_tc,
        jurisdiction: req.query.jurisdiction,
      });
    } catch (err) {
      res.status(500).json(`Err message: ${err}`);
    }
  })
);

router.get(
  "/get-posts-beneficiaries-of-job-focused-interventions",
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts_exists = await Pdo_comp1.find({
        [`beneficiaries_of_job_focused_interventions.${req.query.jurisdiction}_tc`]:
          { $exists: true },
      });
      const jury_posts =
        found_posts_exists[0].beneficiaries_of_job_focused_interventions[
          `${req.query.jurisdiction}_tc`
        ];
      if (!found_posts_exists || jury_posts.length === 0)
        return res
          .status(400)
          .json(
            `${
              req.query.jurisdiction.charAt(0).toUpperCase() +
              req.query.jurisdiction.slice(1)
            } Tc Array empty`
          );

      const tc_data_found = found_posts_exists.find((doc) => {
        return doc.beneficiaries_of_job_focused_interventions[
          `${req.query.jurisdiction}_tc`
        ];
      });

      if (!tc_data_found || tc_data_found.length === 0)
        return res
          .status(400)
          .json(
            `${
              req.query.jurisdiction.charAt(0).toUpperCase() +
              req.query.jurisdiction.slice(1)
            } Tc not existent`
          );

      const found_posts =
        tc_data_found.beneficiaries_of_job_focused_interventions[
          `${req.query.jurisdiction}_tc`
        ];

      res.status(200).json({
        success: true,
        found_posts,
        jurisdiction: req.query.jurisdiction,
      });
    } catch (err) {
      res.status(500).json(`Err message: ${err}`);
    }
  })
);

// PUT REQUESTS FOR UPDATING STATUS FILEDS OF DATA ENTRY POST

router.put(
  "/update-status-for-female-enrollment-rate-in-project-supportedTc/:id",
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body;

      const post_exists = await Pdo_comp1.findOne({
        [`female_enrollment_rate_in_project_supportedTc.${items.jurisdiction}_tc`]:
          {
            $elemMatch: {
              _id: req.params.id,
            },
          },
      });

      if (!post_exists) {
        return res.status(404).json("Post not found");
      }
      const subDocs =
        post_exists.female_enrollment_rate_in_project_supportedTc[
          `${items.jurisdiction}_tc`
        ];
      const subDoc = subDocs.find((e) => e._id.toString() === req.params.id);
      subDoc.status = items.status;

      await post_exists.save();

      res
        .status(200)
        .json({ success: true, message: "Post updated", updated_post: subDoc });
    } catch (err) {
      res.status(500).json(`Err message: ${err}`);
    }
  })
);

router.put(
  "/update-status-for-beneficiaries-of-job-focused-interventions/:id",
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body;
      const post_exists = await Pdo_comp1.findOne({
        [`beneficiaries_of_job_focused_interventions.${items.jurisdiction}_tc`]:
          {
            $elemMatch: {
              _id: req.params.id,
            },
          },
      });

      if (!post_exists) {
        return res.status(404).json("Post not found");
      }
      const subDocs =
        post_exists.beneficiaries_of_job_focused_interventions[
          `${items.jurisdiction}_tc`
        ];
      const subDoc = subDocs.find((e) => e._id.toString() === req.params.id);
      subDoc.status = items.status;

      await post_exists.save();

      res
        .status(200)
        .json({ success: true, message: "Post updated", updated_post: subDoc });
    } catch (err) {
      res.status(500).json(`Err message: ${err}`);
    }
  })
);

//GET REQUESTS FOR GETTING SPECIFC PDOS WITH USER2 STATE
router.get(
  "/get-status-for-female-enrollment-rate-in-project-supportedTc-for-specific-state",
  asyncErrCatcher(async (req, res) => {
    try {
      const state = req.query.state;

      const found_posts_exists = await Pdo_comp1.find({
        "female_enrollment_rate_in_project_supportedTc.state_tc": {
          $exists: true,
          $ne: [],
        },
      });

      if (!found_posts_exists || found_posts_exists.length === 0) {
        return res.status(400).json(`State Tc Array is empty or not found`);
      }

      const jury_posts = found_posts_exists
        .map(
          (doc) => doc.female_enrollment_rate_in_project_supportedTc.state_tc
        )
        .flat();

      const found_posts = jury_posts.filter((item) => item.state === state);

      if (!found_posts || found_posts.length === 0) {
        return res.status(400).json(`Tc with specified state not existent`);
      }

      res.status(200).json({
        success: true,
        found_posts,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ Error: true, Message: err });
    }
  })
);

router.get(
  "/get-update-status-for-beneficiaries-of-job-focused-interventions-for-specific-state",
  asyncErrCatcher(async (req, res) => {
    try {
      const state = req.query.state;

      const found_posts_exists = await Pdo_comp1.find({
        "beneficiaries_of_job_focused_interventions.state_tc": {
          $exists: true,
          $ne: [],
        },
      });

      if (!found_posts_exists || found_posts_exists.length === 0) {
        return res.status(400).json(`State Tc Array is empty or not found`);
      }

      const jury_posts = found_posts_exists
        .map((doc) => doc.beneficiaries_of_job_focused_interventions.state_tc)
        .flat();

      const found_posts = jury_posts.filter((item) => item.state === state);

      if (!found_posts || found_posts.length === 0) {
        return res.status(400).json(`Tc with specified state not existent`);
      }

      res.status(200).json({
        success: true,
        found_posts,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ Error: true, Message: err });
    }
  })
);

// USER 2/VALIDATOR GETTING ALL PDO IN HIS STATE

router.get(
  "/get-validator-pdo2",
  asyncErrCatcher(async (req, res) => {
    try {
      const query = `${req.query.jurisdiction}_tc`;
      const pdo2 = `female_enrollment_rate_in_project_supportedTc`;
      const found_data = await Pdo_comp1.findOne({
        [`${pdo2}.${query}.state`]: req.query.state,
      });
      if (!found_data)
        return res.status(404).json("No data with inputed state");

      const filteredData = found_data[pdo2][query].filter(
        (e) => e.state === req.query.state
      );

      res.status(200).json({
        result: filteredData,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        Error: true,
        message: err.message,
      });
    }
  })
);
router.get(
  "/get-validator-pdo3",
  asyncErrCatcher(async (req, res) => {
    try {
      const query = `${req.query.jurisdiction}_tc`;
      const pdo3 = `beneficiaries_of_job_focused_interventions`;
      const found_data = await Pdo_comp1.findOne({
        [`${pdo3}.${query}.state`]: req.query.state,
      });
      if (!found_data)
        return res.status(404).json("No data with inputed state");

      const filteredData = found_data[pdo3][query].filter(
        (e) => e.state === req.query.state
      );

      res.status(200).json({
        result: filteredData,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        Error: true,
        message: err.message,
      });
    }
  })
);

// USER 3|NATIONAL ADMIN GET REQUESTS FOR ALL PERCENTAGE/COUNT IN IOI

router.get(
  "/get-all-pdo-percentage",
  asyncErrCatcher(async (req, res) => {
    try {
      const results_found = await Pdo_comp1.find({}).maxTimeMS(500000);

      if (results_found.length > 0) {
        const doc = results_found[0];
        const targetField1 = doc.female_enrollment_rate_in_project_supportedTc;
        const targetField2 = doc.beneficiaries_of_job_focused_interventions;

        const federalCount1 = targetField1.federal_tc.reduce((acc, curr) => {
          return acc + (curr.percentage || 0);
        }, 0);
        const federal_mean1 = federalCount1 / targetField1.federal_tc.length;

        const stateCount1 = targetField1.state_tc.reduce((acc, curr) => {
          return acc + (curr.percentage || 0);
        }, 0);
        const state_mean1 = stateCount1 / targetField2.state_tc.length;

        const pdo2 = {
          federal_tc: federal_mean1,
          state_tc: state_mean1,
        };
        const pdo2count = federal_mean1 + state_mean1;

        let total_aggregated_mean = pdo2count / 2;

        targetField1.total_federal_mean = federal_mean1;
        targetField1.total_state_mean = state_mean1;
        targetField1.total_aggregated_mean = total_aggregated_mean;

        await doc.save();

        res.status(200).json({
          success: true,
          results: { pdo2 },
        });
      } else {
        res.status(404).json({
          success: false,
          message: "No documents found",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  })
);

module.exports = router;
