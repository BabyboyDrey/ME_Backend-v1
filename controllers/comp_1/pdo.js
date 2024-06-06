const express = require('express')
const router = express.Router()
const Pdo_comp1 = require('../../models/comp_1/PDO')
const { upload } = require('../../multer/multer_pdf')
const asyncErrCatcher = require('../../middlewares/asyncErrCatcher')
const user1Auth = require('../../middlewares/user1Auth')
const user4Auth = require('../../middlewares/user4Auth')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const checkAndDeleteFile = require('../../utils/checkAndDeleteFile')
const user2Auth = require('../../middlewares/user2Auth')

const createCookie = (user, statusCode, res) => {
  try {
    const payload = {
      email: user.email,
      jurisdiction: user.jurisdiction,
      state: user.state,
      role: user.user_role,
      tc_name: user.tc_name
    }

    let access_token

    if (payload.role === 'user4') {
      access_token = jwt.sign(payload, process.env.JWT_SECRET_PASS, {
        expiresIn: '7hr'
      })
    } else if (payload.role === 'user2') {
      access_token = jwt.sign(payload, process.env.JWT_SECRET_PASS, {
        expiresIn: '7hr'
      })
    } else if (payload.role === 'user3') {
      access_token = jwt.sign(payload, process.env.JWT_SECRET_PASS, {
        expiresIn: '7hr'
      })
    } else {
      access_token = jwt.sign(payload, process.env.JWT_SECRET_PASS, {
        expiresIn: '7hr'
      })
    }

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
      .cookie('access_token', access_token, {
        sameSite: 'None',
        httpOnly: true,
        secure: true
      })
      .json({ success: true, token: access_token })
  } catch (err) {
    res.status(500).json(`Err creating cookie: ${err}`)
  }
}

router.post(
  '/set-user-cookies',
  asyncErrCatcher(async (req, res) => {
    try {
      const userData = req.body

      createCookie(userData, 200, res)
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

// POST REQUEST

// router.post(
//   '/make-post-female-enrollment-rate-in-project-supportedTc',
//   upload.array('pdfs'),
//   asyncErrCatcher(async (req, res) => {
//     try {
//       const items = req.body
//       const jurisdiction = req.query.jurisdiction
//       const tcType = `${jurisdiction}_tc`

//       const existing_post = await Pdo_comp1.findOne({
//         [`female_enrollment_rate_in_project_supportedTc.${tcType}.tc_name`]:
//           items.tc_name
//       })

//       if (existing_post) {
//         if (req.files[0]) {
//           const filePath = `uploads/${req.files[0].filename}`
//           checkAndDeleteFile(filePath, err => {
//             if (err) {
//               console.error(err)
//             }
//           })
//         }
//         if (req.files[1]) {
//           const filePath = `uploads/${req.files[1].filename}`
//           checkAndDeleteFile(filePath, err => {
//             if (err) {
//               console.error(err)
//             }
//           })
//         }
//         return res.status(400).json('Post data already exists')
//       }
//       if (
//         items.no_of_female_students_enrolled_in_priority_trade &&
//         items.total_no_of_students_enrolled_in_priority_trades
//       ) {
//         items.percentage =
//           (items.no_of_female_students_enrolled_in_priority_trade /
//             items.total_no_of_students_enrolled_in_priority_trades) *
//           100
//       }

//       if (items.no_of_tvet_sensitizations_conducted_by_school && req.files[0]) {
//         const new_value = items.no_of_tvet_sensitizations_conducted_by_school
//         items.no_of_tvet_sensitizations_conducted_by_school = {
//           value: new_value
//         }
//         items.no_of_tvet_sensitizations_conducted_by_school.tc_report_pdf =
//           req.files[0].filename
//         console.log(
//           `fg: ${JSON.stringify(
//             items.no_of_tvet_sensitizations_conducted_by_school
//           )}, ${req.files[0]}`
//         )
//       }
//       if (req.files[1]) {
//         items.student_enrollment_data_doc_pdf = req.files[1].filename
//       }

//       const created_post = await Pdo_comp1.findOneAndUpdate(
//         {},
//         {
//           $push: {
//             [`female_enrollment_rate_in_project_supportedTc.${tcType}`]: items
//           }
//         },
//         { new: true, upsert: true }
//       )

//       const tcTypeArray =
//         created_post.female_enrollment_rate_in_project_supportedTc[tcType]

//       const matchedEntry = tcTypeArray.find(e => e.tc_name === items.tc_name)

//       const totalTc = await Pdo_comp1.find({
//         [`female_enrollment_rate_in_project_supportedTc.${tcType}`]: {
//           $exists: true
//         }
//       })

//       let total_females_in_tcType_tc = 0
//       let total_students_in_tcType_tc = 0

//       totalTc.forEach(doc => {
//         doc.female_enrollment_rate_in_project_supportedTc.federal_tc.forEach(
//           entry => {
//             total_females_in_tcType_tc +=
//               entry.no_of_female_students_enrolled_in_priority_trade || 0

//             total_students_in_tcType_tc +=
//               entry.total_no_of_students_enrolled_in_priority_trades || 0
//           }
//         )

//         doc.female_enrollment_rate_in_project_supportedTc.state_tc.forEach(
//           entry => {
//             total_females_in_tcType_tc +=
//               entry.no_of_female_students_enrolled_in_priority_trade || 0
//             total_students_in_tcType_tc +=
//               entry.total_no_of_students_enrolled_in_priority_trades || 0
//           }
//         )
//       })

//       let percentage_of_female_students_across_tc

//       if (total_students_in_tcType_tc !== 0) {
//         percentage_of_female_students_across_tc =
//           (total_females_in_tcType_tc / total_students_in_tcType_tc) * 100

//         await Pdo_comp1.updateOne(
//           {},
//           {
//             $set: {
//               'female_enrollment_rate_in_project_supportedTc.percentage_of_female_students_across_tc':
//                 percentage_of_female_students_across_tc
//             }
//           }
//         )
//       }

//       res.status(200).json({
//         success: true,
//         message: 'Post created successfully',
//         matchedEntry
//       })
//     } catch (err) {
//       if (req.files[0]) {
//         const filePath = `uploads/${req.files[0].filename}`
//         checkAndDeleteFile(filePath, err => {
//           if (err) {
//             console.error(err)
//           }
//         })
//       }
//       if (req.files[1]) {
//         const filePath = `uploads/${req.files[1].filename}`
//         checkAndDeleteFile(filePath, err => {
//           if (err) {
//             console.error(err)
//           }
//         })
//       }

//       console.error(err)
//       res.status(500).json({ success: false, message: 'Internal Server Error' })
//     }
//   })
// )
//this api has a bug, first pdf and pdf containinbg obj isnt posted to db
router.post(
  '/make-post-female-enrollment-rate-in-project-supportedTc',
  upload.array('pdfs'),
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const jurisdiction = req.query.jurisdiction
      const tcType = `${jurisdiction}_tc`

      const existing_post = await Pdo_comp1.findOne({
        [`female_enrollment_rate_in_project_supportedTc.${tcType}.tc_name`]:
          items.tc_name
      })

      if (existing_post) {
        if (req.files[0]) {
          const filePath = `uploads/${req.files[0].filename}`
          checkAndDeleteFile(filePath, err => {
            if (err) {
              console.error(err)
            }
          })
        }
        if (req.files[1]) {
          const filePath = `uploads/${req.files[1].filename}`
          checkAndDeleteFile(filePath, err => {
            if (err) {
              console.error(err)
            }
          })
        }
        return res.status(400).json('Post data already exists')
      }

      if (
        items.no_of_female_students_enrolled_in_priority_trade &&
        items.total_no_of_students_enrolled_in_priority_trades
      ) {
        items.percentage =
          (items.no_of_female_students_enrolled_in_priority_trade /
            items.total_no_of_students_enrolled_in_priority_trades) *
          100
      }

      if (items.no_of_tvet_sensitizations_conducted_by_school && req.files[0]) {
        const new_value = items.no_of_tvet_sensitizations_conducted_by_school
        items.no_of_tvet_sensitizations_conducted_by_school = {
          value: new_value,
          tc_report_pdf: req.files[0].filename
        }
      }
      console.log(
        'jk:',
        JSON.stringify(items.no_of_tvet_sensitizations_conducted_by_school)
      )
      if (req.files[1]) {
        items.student_enrollment_data_doc_pdf = req.files[1].filename
      }
      console.log('Formatted items:', JSON.stringify(items))
      const created_post = await Pdo_comp1.findOneAndUpdate(
        {},
        {
          $push: {
            [`female_enrollment_rate_in_project_supportedTc.${tcType}`]: items
          }
        },
        { new: true, upsert: true }
      )

      const tcTypeArray =
        created_post.female_enrollment_rate_in_project_supportedTc[tcType]

      const matchedEntry = tcTypeArray.find(e => e.tc_name === items.tc_name)

      const totalTc = await Pdo_comp1.find({
        [`female_enrollment_rate_in_project_supportedTc.${tcType}`]: {
          $exists: true
        }
      })

      let total_females_in_tcType_tc = 0
      let total_students_in_tcType_tc = 0

      totalTc.forEach(doc => {
        doc.female_enrollment_rate_in_project_supportedTc.federal_tc.forEach(
          entry => {
            total_females_in_tcType_tc +=
              entry.no_of_female_students_enrolled_in_priority_trade || 0
            total_students_in_tcType_tc +=
              entry.total_no_of_students_enrolled_in_priority_trades || 0
          }
        )

        doc.female_enrollment_rate_in_project_supportedTc.state_tc.forEach(
          entry => {
            total_females_in_tcType_tc +=
              entry.no_of_female_students_enrolled_in_priority_trade || 0
            total_students_in_tcType_tc +=
              entry.total_no_of_students_enrolled_in_priority_trades || 0
          }
        )
      })

      let percentage_of_female_students_across_tc

      if (total_students_in_tcType_tc !== 0) {
        percentage_of_female_students_across_tc =
          (total_females_in_tcType_tc / total_students_in_tcType_tc) * 100

        await Pdo_comp1.updateOne(
          {},
          {
            $set: {
              'female_enrollment_rate_in_project_supportedTc.percentage_of_female_students_across_tc':
                percentage_of_female_students_across_tc
            }
          }
        )
      }

      res.status(200).json({
        success: true,
        message: 'Post created successfully',
        matchedEntry
      })
    } catch (err) {
      if (req.files[0]) {
        const filePath = `uploads/${req.files[0].filename}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }
      if (req.files[1]) {
        const filePath = `uploads/${req.files[1].filename}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }

      console.error(err)
      res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
  })
)

router.post(
  '/make-post-beneficiaries-of-job-focused-interventions',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const jurisdiction = req.query.jurisdiction
      const tcType = `${jurisdiction}_tc`

      const existing_tc = await Pdo_comp1.findOne({
        [`beneficiaries_of_job_focused_interventions.${tcType}.tc_name`]:
          items.tc_name
      })

      if (existing_tc) {
        res.status(400).json('Post already exists')
      }

      const new_doc = await Pdo_comp1.findOneAndUpdate(
        {},
        {
          $push: {
            [`beneficiaries_of_job_focused_interventions.${tcType}`]: items
          }
        },
        { new: true, insert: true }
      )

      const subDocs = new_doc.beneficiaries_of_job_focused_interventions[tcType]
      const new_entry = subDocs.find(e => e.tc_name === items.tc_name)

      res.status(200).json({ success: true, new_entry })
    } catch (err) {
      res.status(500).json({ err: `Internal Server Error: ${err}` })
    }
  })
)

// GET REQUEST

router.get(
  '/get-post-female-enrollment-rate-in-project-supportedTc',
  user1Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      let requested_tc_data

      const query = {}
      query[
        `female_enrollment_rate_in_project_supportedTc.${req.user.jurisdiction}_tc`
      ] = { $elemMatch: { tc_name: req.user.tc_name } }

      const data = await Pdo_comp1.findOne(query).maxTimeMS(10000)
      if (!data) return res.status(400).json('Tc data not found')

      const tc_collection =
        data.female_enrollment_rate_in_project_supportedTc[
          `${req.user.jurisdiction}_tc`
        ]

      const percentage_of_female_students_across_tc =
        data.female_enrollment_rate_in_project_supportedTc
          .percentage_of_female_students_across_tc
      requested_tc_data = tc_collection.find(
        e => e.tc_name === req.user.tc_name
      )

      res.status(200).json({
        success: true,
        requested_tc_data,
        percentage_of_female_students_across_tc
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.get(
  '/get-post-beneficiaries-of-job-focused-interventions',
  user1Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const data = await Pdo_comp1.findOne({
        [`beneficiaries_of_job_focused_interventions.${req.user.jurisdiction}_tc`]:
          { $elemMatch: { tc_name: req.user.tc_name } }
      })

      if (!data) return res.status(400).json('Tc data not found')

      const subDocs =
        data.beneficiaries_of_job_focused_interventions[
          `${req.user.jurisdiction}_tc`
        ]
      const subDoc = subDocs.find(e => e.tc_name === req.user.tc_name)
      res.status(200).json({
        success: true,
        requested_tc_data: subDoc
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

// UPDATE REQUEST

router.put(
  '/update-post-female-enrollment-rate-in-project-supportedTc/:post_id',
  upload.array('pdfs'),
  user1Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const found_post_exists = await Pdo_comp1.findOne({
        [`female_enrollment_rate_in_project_supportedTc.${req.user.jurisdiction}_tc`]:
          { $elemMatch: { _id: req.params.post_id } }
      })

      if (!found_post_exists) {
        if (req.files[0]) {
          const filePath = `uploads/${req.files[0].filename}`
          checkAndDeleteFile(filePath, err => {
            if (err) {
              console.error(err)
            }
          })
        }
        if (req.files[1]) {
          const filePath = `uploads/${req.files[1].filename}`
          checkAndDeleteFile(filePath, err => {
            if (err) {
              console.error(err)
            }
          })
        }

        return res.status(404).json(`No tc with that id`)
      }

      const parentDoc =
        found_post_exists.female_enrollment_rate_in_project_supportedTc
      const subDocs =
        found_post_exists.female_enrollment_rate_in_project_supportedTc[
          `${req.user.jurisdiction}_tc`
        ]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.post_id)
      if (req.files[0] && items.no_of_tvet_sensitizations_conducted_by_school) {
        const item_value = items.no_of_tvet_sensitizations_conducted_by_school
        items.no_of_tvet_sensitizations_conducted_by_school = {
          value: item_value,
          tc_report_pdf: req.files[0].filename
        }
        if (
          subDoc.no_of_tvet_sensitizations_conducted_by_school.tc_report_pdf
        ) {
          const filePath = `uploads/${subDoc.no_of_tvet_sensitizations_conducted_by_school.tc_report_pdf}`
          checkAndDeleteFile(filePath, err => {
            if (err) {
              console.error(err)
            }
          })
        }
      }
      if (req.files[1]) {
        items.student_enrollment_data_doc_pdf = req.files[1].filename

        if (subDoc.student_enrollment_data_doc_pdf) {
          const filePath = `uploads/${subDoc.student_enrollment_data_doc_pdf}`
          checkAndDeleteFile(filePath, err => {
            if (err) {
              console.error(err)
            }
          })
        }
      }

      if (
        items.no_of_female_students_enrolled_in_priority_trade &&
        items.total_no_of_students_enrolled_in_priority_trades
      ) {
        items.percentage =
          (items.no_of_female_students_enrolled_in_priority_trade /
            items.total_no_of_students_enrolled_in_priority_trades) *
          100
      }

      await Pdo_comp1.findOneAndUpdate(
        {
          [`female_enrollment_rate_in_project_supportedTc.${req.user.jurisdiction}_tc._id`]:
            req.params.post_id
        },
        { $set: items },
        { upsert: true, new: true }
      )

      let total_females_in_tcType_tc = 0
      let total_students_in_tcType_tc = 0

      parentDoc.federal_tc.forEach(doc => {
        total_females_in_tcType_tc +=
          doc.no_of_female_students_enrolled_in_priority_trade || 0
        total_students_in_tcType_tc +=
          doc.total_no_of_students_enrolled_in_priority_trades || 0
      })

      parentDoc.state_tc.forEach(doc => {
        total_females_in_tcType_tc +=
          doc.no_of_female_students_enrolled_in_priority_trade || 0
        total_students_in_tcType_tc +=
          doc.total_no_of_students_enrolled_in_priority_trades || 0
      })

      let percentage_of_female_students_across_tc

      if (total_students_in_tcType_tc !== 0) {
        percentage_of_female_students_across_tc =
          (total_females_in_tcType_tc / total_students_in_tcType_tc) * 100
      }

      parentDoc.percentage_of_female_students_across_tc =
        percentage_of_female_students_across_tc

      await found_post_exists.save()
      res.status(200).json({
        success: true,
        subDoc,
        percentage_of_female_students_across_tc
      })
    } catch (err) {
      if (req.files[0]) {
        const filePath = `uploads/${req.files[0].filename}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }
      if (req.files[1]) {
        const filePath = `uploads/${req.files[1].filename}`
        checkAndDeleteFile(filePath, err => {
          if (err) {
            console.error(err)
          }
        })
      }
      res.status(500).json(`Err: ${err}`)
    }
  })
)

router.put(
  '/update-post-beneficiaries-of-job-focused-interventions/:post_id',
  user1Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const found_post_exists = await Pdo_comp1.findOne({
        [`beneficiaries_of_job_focused_interventions.${req.user.jurisdiction}_tc`]:
          {
            $elemMatch: { _id: new mongoose.Types.ObjectId(req.params.post_id) }
          }
      })
      if (!found_post_exists) {
        return res.status(404).json({ error: 'Post not found' })
      }

      const subDoc =
        found_post_exists.beneficiaries_of_job_focused_interventions[
          `${req.user.jurisdiction}_tc`
        ].find(e => e._id.toString() === req.params.post_id)

      if (!subDoc) {
        return res.status(404).json({ error: 'Subdocument not found' })
      }

      if (typeof subDoc !== 'object' || subDoc === null) {
        return res.status(500).json({ error: 'Subdocument is not an object' })
      }

      for (const key in items) {
        if (key in subDoc) {
          for (const subKey in items[key]) {
            if (subKey in subDoc[key]) {
              subDoc[key][subKey] = items[key][subKey]
            } else {
              subDoc[key][subKey] = items[key][subKey]
            }
          }
        }
      }

      await found_post_exists.save()

      res.status(200).json({ success: true, subDoc })
    } catch (err) {
      res.status(500).json({ error: `Error: ${err.message}` })
    }
  })
)

// DELETE REQUEST

router.delete(
  '/delete-post-female-enrollment-rate-in-project-supportedTc/:post_id',
  user4Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const jurisdiction = req.query.jurisdiction
      const tcType = `${jurisdiction}_tc`

      if (!mongoose.Types.ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json({ error: 'Invalid Id format' })
      }

      const query = {}
      query[`female_enrollment_rate_in_project_supportedTc.${tcType}._id`] =
        new mongoose.Types.ObjectId(req.params.post_id)

      const parentDoc = await Pdo_comp1.findOne(query)
      if (!parentDoc) {
        return res.status(404).json({ error: 'Post not found' })
      }

      const pdfFilenamesToDelete = []
      parentDoc.female_enrollment_rate_in_project_supportedTc[tcType].forEach(
        subDoc => {
          if (
            subDoc.no_of_tvet_sensitizations_conducted_by_school.tc_report_pdf
          ) {
            pdfFilenamesToDelete.push(
              subDoc.no_of_tvet_sensitizations_conducted_by_school.tc_report
            )
          }
          if (subDoc.student_enrollment_data_doc) {
            pdfFilenamesToDelete.push(subDoc.student_enrollment_data_doc_pdf)
          }
        }
      )

      const update = {
        $pull: {
          [`female_enrollment_rate_in_project_supportedTc.${tcType}`]: {
            _id: new mongoose.Types.ObjectId(req.params.post_id)
          }
        }
      }
      const options = { new: true }
      await Pdo_comp1.findOneAndUpdate(query, update, options)

      for (const filename of pdfFilenamesToDelete) {
        const filePath = `uploads/${filename}`
        try {
          await checkAndDeleteFile(filePath, err => {
            if (err) {
              console.error(err)
            }
          })
        } catch (error) {
          console.error(error)
        }
      }

      const totalTc = await Pdo_comp1.find({
        [`female_enrollment_rate_in_project_supportedTc.${tcType}`]: {
          $exists: true
        }
      })

      let total_females_in_tcType_tc = 0
      let total_students_in_tcType_tc = 0

      totalTc.forEach(doc => {
        doc.female_enrollment_rate_in_project_supportedTc.federal_tc.forEach(
          entry => {
            total_females_in_tcType_tc +=
              entry.no_of_female_students_enrolled_in_priority_trade || 0

            total_students_in_tcType_tc +=
              entry.total_no_of_students_enrolled_in_priority_trades || 0
          }
        )

        doc.female_enrollment_rate_in_project_supportedTc.state_tc.forEach(
          entry => {
            total_females_in_tcType_tc +=
              entry.no_of_female_students_enrolled_in_priority_trade || 0
            total_students_in_tcType_tc +=
              entry.total_no_of_students_enrolled_in_priority_trades || 0
          }
        )
      })

      let percentage_of_female_students_across_tc

      if (total_students_in_tcType_tc !== 0) {
        percentage_of_female_students_across_tc =
          (total_females_in_tcType_tc / total_students_in_tcType_tc) * 100

        await Pdo_comp1.updateOne(
          {},
          {
            $set: {
              'female_enrollment_rate_in_project_supportedTc.percentage_of_female_students_across_tc':
                percentage_of_female_students_across_tc
            }
          }
        )
      }
      console.log(
        `fh: ${total_students_in_tcType_tc}, ${percentage_of_female_students_across_tc}`
      )

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully'
      })
    } catch (err) {
      res.status(500).json({ error: `Err message: ${err.message}` })
    }
  })
)

router.delete(
  '/delete-post-beneficiaries-of-job-focused-interventions/:post_id',
  user4Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const tcType = `${req.query.jurisdiction}_tc`
      const query = {}
      query[`beneficiaries_of_job_focused_interventions.${tcType}._id`] =
        new mongoose.Types.ObjectId(req.params.post_id)

      const update = {
        $pull: {
          [`beneficiaries_of_job_focused_interventions.${tcType}`]: {
            _id: new mongoose.Types.ObjectId(req.params.post_id)
          }
        }
      }

      const options = { new: true }

      const parentDoc = await Pdo_comp1.findOneAndUpdate(query, update, options)

      if (!parentDoc) {
        return res.status(404).json('Post not found')
      }

      res
        .status(200)
        .json({ success: true, message: 'Post deleted successfully' })
    } catch (err) {
      res.status(500).json({ Error: err.message })
    }
  })
)
// GET REQUEST BY TC JURISDICTION

router.get(
  '/get-posts-female-enrollment-rate-in-project-supportedTc',
  user1Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts_exists = await Pdo_comp1.find({
        [`female_enrollment_rate_in_project_supportedTc.${req.user.jurisdiction}_tc`]:
          { $exists: true }
      })
      const jury_posts =
        found_posts_exists[0].female_enrollment_rate_in_project_supportedTc[
          `${req.user.jurisdiction}_tc`
        ]
      if (!found_posts_exists || jury_posts.length === 0)
        return res
          .status(400)
          .json(
            `${
              req.user.jurisdiction.charAt(0).toUpperCase() +
              req.user.jurisdiction.slice(1)
            } Tc Array empty`
          )

      const tc_data_found = found_posts_exists.find(doc => {
        return doc.female_enrollment_rate_in_project_supportedTc[
          `${req.user.jurisdiction}_tc`
        ]
      })

      if (!tc_data_found || tc_data_found.length === 0)
        return res
          .status(400)
          .json(
            `${
              req.user.jurisdiction.charAt(0).toUpperCase() +
              req.user.jurisdiction.slice(1)
            } Tc not existent`
          )

      const percentage_of_female_students_across_tc =
        tc_data_found.female_enrollment_rate_in_project_supportedTc
          .percentage_of_female_students_across_tc

      const found_posts =
        tc_data_found.female_enrollment_rate_in_project_supportedTc[
          `${req.user.jurisdiction}_tc`
        ]

      res.status(200).json({
        success: true,
        found_posts,
        percentage_of_female_students_across_tc,
        jurisdiction: req.user.jurisdiction
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

router.get(
  '/get-posts-beneficiaries-of-job-focused-interventions',
  user1Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts_exists = await Pdo_comp1.find({
        [`beneficiaries_of_job_focused_interventions.${req.user.jurisdiction}_tc`]:
          { $exists: true }
      })
      const jury_posts =
        found_posts_exists[0].beneficiaries_of_job_focused_interventions[
          `${req.user.jurisdiction}_tc`
        ]
      if (!found_posts_exists || jury_posts.length === 0)
        return res
          .status(400)
          .json(
            `${
              req.user.jurisdiction.charAt(0).toUpperCase() +
              req.user.jurisdiction.slice(1)
            } Tc Array empty`
          )

      const tc_data_found = found_posts_exists.find(doc => {
        return doc.beneficiaries_of_job_focused_interventions[
          `${req.user.jurisdiction}_tc`
        ]
      })

      if (!tc_data_found || tc_data_found.length === 0)
        return res
          .status(400)
          .json(
            `${
              req.user.jurisdiction.charAt(0).toUpperCase() +
              req.user.jurisdiction.slice(1)
            } Tc not existent`
          )

      const found_posts =
        tc_data_found.beneficiaries_of_job_focused_interventions[
          `${req.user.jurisdiction}_tc`
        ]

      res.status(200).json({
        success: true,
        found_posts,
        jurisdiction: req.user.jurisdiction
      })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

// PUT REQUESTS FOR UPDATING STATUS FILEDS OF DATA ENTRY POST

router.put(
  '/update-status-for-female-enrollment-rate-in-project-supportedTc/:id',
  user2Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const post_exists = await Pdo_comp1.findOne({
        [`female_enrollment_rate_in_project_supportedTc.${req.user.jurisdiction}_tc`]:
          {
            $elemMatch: {
              _id: req.params.id
            }
          }
      })

      if (!post_exists) {
        return res.status(404).json('Post not found')
      }
      const subDocs =
        post_exists.female_enrollment_rate_in_project_supportedTc[
          `${req.user.jurisdiction}_tc`
        ]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.id)
      subDoc.status = items.status

      await post_exists.save()

      res
        .status(200)
        .json({ success: true, message: 'Post updated', updated_post: subDoc })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)
router.put(
  '/update-status-for-beneficiaries-of-job-focused-interventions/:id',
  user2Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      const post_exists = await Pdo_comp1.findOne({
        [`beneficiaries_of_job_focused_interventions.${req.user.jurisdiction}_tc`]:
          {
            $elemMatch: {
              _id: req.params.id
            }
          }
      })

      if (!post_exists) {
        return res.status(404).json('Post not found')
      }
      const subDocs =
        post_exists.beneficiaries_of_job_focused_interventions[
          `${req.user.jurisdiction}_tc`
        ]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.id)
      subDoc.status = items.status

      await post_exists.save()

      res
        .status(200)
        .json({ success: true, message: 'Post updated', updated_post: subDoc })
    } catch (err) {
      res.status(500).json(`Err message: ${err}`)
    }
  })
)

// GET REQUESTS FOR GETTING SPECIFC PDOS WITH USER2 STATE

router.get(
  '/get-status-for-female-enrollment-rate-in-project-supportedTc-for-specific-state',
  user2Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts_exists = await Pdo_comp1.find({
        [`female_enrollment_rate_in_project_supportedTc.${req.user.jurisdiction}_tc`]:
          { $exists: true }
      })
      const jury_posts =
        found_posts_exists[0].female_enrollment_rate_in_project_supportedTc[
          `${req.user.jurisdiction}_tc`
        ]
      if (!found_posts_exists || jury_posts.length === 0)
        return res
          .status(400)
          .json(
            `${
              req.user.jurisdiction.charAt(0).toUpperCase() +
              req.user.jurisdiction.slice(1)
            } Tc Array empty`
          )
      const found_posts = jury_posts
        .filter(item => item.state === req.user.state)
        .flat()

      if (!found_posts || found_posts.length === 0)
        return res
          .status(400)
          .json(
            `${
              req.user.jurisdiction.charAt(0).toUpperCase() +
              req.user.jurisdiction.slice(1)
            } Tc with specified state not existent`
          )

      res.status(200).json({
        success: true,
        found_posts,
        jurisdiction: req.user.jurisdiction
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ Error: true, Message: err })
    }
  })
)
router.get(
  '/get-update-status-for-beneficiaries-of-job-focused-interventions-for-specific-state',
  user2Auth,
  asyncErrCatcher(async (req, res) => {
    try {
      const found_posts_exists = await Pdo_comp1.find({
        [`beneficiaries_of_job_focused_interventions.${req.user.jurisdiction}_tc`]:
          { $exists: true }
      })
      const jury_posts =
        found_posts_exists[0].beneficiaries_of_job_focused_interventions[
          `${req.user.jurisdiction}_tc`
        ]
      if (!found_posts_exists || jury_posts.length === 0)
        return res
          .status(400)
          .json(
            `${
              req.user.jurisdiction.charAt(0).toUpperCase() +
              req.user.jurisdiction.slice(1)
            } Tc Array empty`
          )
      const found_posts = jury_posts
        .filter(item => item.state === req.user.state)
        .flat()

      if (!found_posts || found_posts.length === 0)
        return res
          .status(400)
          .json(
            `${
              req.user.jurisdiction.charAt(0).toUpperCase() +
              req.user.jurisdiction.slice(1)
            } Tc with specified state not existent`
          )

      res.status(200).json({
        success: true,
        found_posts,
        jurisdiction: req.user.jurisdiction
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ Error: true, Message: err })
    }
  })
)

module.exports = router
