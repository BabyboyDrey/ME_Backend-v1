const { default: mongoose } = require('mongoose')
const asyncErrCatcher = require('../../middlewares/asyncErrCatcher')
const user1Auth = require('../../middlewares/user1Auth')
const Teachers = require('../../models/comp_1/Teachers')
const user4Auth = require('../../middlewares/user4Auth')
const router = require('express').Router()

// POST REQUEST

router.post(
  '/create-teacher',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body
      items.date_of_birth = new Date(items.date_of_birth)
      const found_teacher = await Teachers.findOne({
        [`${items.jurisdiction}_tc`]: {
          $elemMatch: {
            email: items.email
          }
        }
      })

      if (found_teacher) {
        return res.status(400).json('Teacher exists with this email')
      }

      const new_teacher = await Teachers.findOneAndUpdate(
        {},
        {
          $push: {
            [`${items.jurisdiction}_tc`]: items
          }
        },
        { new: true, upsert: true }
      )

      res.status(200).json({
        success: true,
        new_teacher: new_teacher[`${items.jurisdiction}_tc`],
        message: 'Teacher created'
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

// PUT REQUESTS

router.put(
  '/update-teacher/:id',
  asyncErrCatcher(async (req, res) => {
    try {
      const items = req.body

      const found_teacher = await Teachers.findOne({
        [`${items.jurisdiction}_tc._id`]: new mongoose.Types.ObjectId(
          req.params.id
        )
      })

      if (!found_teacher) {
        return res.status(404).json({ Message: 'Teacher not found' })
      }

      const subDocs = found_teacher[`${items.jurisdiction}_tc`]
      const subDoc = subDocs.find(e => e._id.toString() === req.params.id)

      Object.assign(subDoc, items)

      await found_teacher.save()

      res.status(200).json({ success: true, updated_teacher: subDoc })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

// GET REQUESTS

router.get(
  '/get-teacher-data/:id',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_teacher = await Teachers.findOne({
        [`${req.query.jurisdiction}_tc`]: {
          $elemMatch: {
            _id: new mongoose.Types.ObjectId(req.params.id)
          }
        }
      })

      if (!found_teacher) {
        return res
          .status(404)
          .json({ success: false, message: 'Teacher not found' })
      }

      const subDocs = found_teacher[`${req.query.jurisdiction}_tc`]

      const subDoc = subDocs.find(e => e._id.toString() === req.params.id)

      res.status(200).json({
        success: true,
        subDoc
      })
    } catch (err) {
      res.status(500).json({ ErrMessage: err })
    }
  })
)

router.get(
  '/get-all-teachers',
  asyncErrCatcher(async (req, res) => {
    try {
      const all_teachers = await Teachers.find({
        [`${req.query.jurisdiction}_tc`]: {
          $exists: true
        }
      })

      res.status(200).json({
        success: true,
        all_posts: all_teachers[0][`${req.query.jurisdiction}_tc`]
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

// DELETE REQUEST

router.delete(
  '/delete-teacher/:id',
  asyncErrCatcher(async (req, res) => {
    try {
      const query = {}
      query[`${req.query.jurisdiction}_tc._id`] = new mongoose.Types.ObjectId(
        req.params.id
      )

      const found_teacher = await Teachers.findOne(query)

      if (!found_teacher) {
        return res.status(404).json({ message: 'Teacher not found' })
      }

      const subDocs = found_teacher[`${req.query.jurisdiction}_tc`]

      const subDocIndex = subDocs.findIndex(
        e => e._id.toString() === req.params.id
      )

      if (subDocIndex === -1) {
        return res.status(404).json({ message: 'Subdocument not found' })
      }

      const deleted_teacher = subDocs.splice(subDocIndex, 1)

      await found_teacher.save()

      res.status(200).json({
        success: true,
        message: 'Teacher deleted successfully',
        deleted_teacher
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ ErrMessage: err })
    }
  })
)

// USER 2/VALIDATOR GETTING ALL TEACHERS IN HIS STATE

router.get(
  '/get-validator-teachers',
  asyncErrCatcher(async (req, res) => {
    try {
      const query = `${req.query.jurisdiction}_tc`
      const found_data = await Teachers.findOne({
        [`${query}.school_state_location`]: req.query.state
      })

      const filteredData = found_data[query].filter(
        e => e.school_state_location === req.query.state
      )
      if (!found_data) return res.status(404).json('No data with inputed state')

      res.status(200).json({
        result: filteredData
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        Error: true,
        message: err.message
      })
    }
  })
)

// USER 3/NATIONAL ADMIN GETTING ALL TEACHERS

router.get(
  '/get-national-admin-teachers',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_data = await Teachers.findOne({})
      if (!found_data) return res.status(404).json('No teachers found')

      const federal_teachers_count = found_data.federal_tc.length
      const state_teachers_count = found_data.state_tc.length
      const total_count = federal_teachers_count + state_teachers_count

      found_data.total_number_of_teachers = total_count
      await found_data.save()
      res.status(200).json({
        result: {
          total_count,
          federal_teachers_count,
          state_teachers_count
        }
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        Error: true,
        message: err.message
      })
    }
  })
)

// GET TEACHERS THAT ARE TRAINED IN DIGITAL LITERACY AND PEDAGOGY

router.get(
  '/get-digital-literacy-pedagogy-trained-teachers',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_data = await Teachers.find({})
      if (!found_data || found_data.length === 0) {
        return res.status(404).json({
          Error: true,
          message: 'No teachers data'
        })
      }
      const data = found_data[0]
      const federal_data = data.federal_tc
      const state_data = data.state_tc
      let trained_federal_teachers = []
      let trained_state_teachers = []

      federal_data.map(obj => {
        if (
          obj.occupational_training.digital_literacy_training &&
          obj.occupational_training.pedagogy_training
        ) {
          trained_federal_teachers.push(obj)
        }
      })
      state_data.map(obj => {
        if (
          obj.occupational_training.digital_literacy_training &&
          obj.occupational_training.pedagogy_training
        ) {
          trained_state_teachers.push(obj)
        }
      })

      if (
        trained_federal_teachers.length === 0 &&
        trained_state_teachers.length === 0
      ) {
        return res.status(404).json({
          Error: true,
          message: 'No teachers in any aggregation meet requirement'
        })
      }
      res.status(200).json({
        success: true,
        trained_federal_teachers:
          trained_federal_teachers.length > 0
            ? trained_federal_teachers
            : 'No teachers meet requirement',
        trained_state_teachers:
          trained_state_teachers.length > 0
            ? trained_state_teachers
            : 'No teachers meet requirement'
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        Error: true,
        message: err.message
      })
    }
  })
)

// GET TEACHERS NSQF CERT ASSESSORS && VERIFIERS DISAGGREGATED BY GENEDER

router.get(
  '/get-nsqf-assessors-verifiers-teachers',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_data = await Teachers.find({})
      if (!found_data || found_data.length === 0) {
        return res.status(404).json({
          Error: true,
          message: 'No teachers data'
        })
      }
      const data = found_data[0]
      const federal_data = data.federal_tc
      const state_data = data.state_tc
      let certified_assesors_federal_teachers = []
      let certified_verifiers_federal_teachers = []

      let certified_assesors_state_teachers = []
      let certified_verifiers_state_teachers = []

      federal_data.map(obj => {
        if (obj.certified_as_NSQF_assesors) {
          certified_assesors_federal_teachers.push(obj)
        }
      })
      federal_data.map(obj => {
        if (obj.certified_as_NSQF_verifiers) {
          certified_verifiers_federal_teachers.push(obj)
        }
      })

      state_data.map(obj => {
        if (obj.certified_as_NSQF_assesors) {
          certified_assesors_state_teachers.push(obj)
        }
      })
      state_data.map(obj => {
        if (obj.certified_as_NSQF_verifiers) {
          certified_verifiers_state_teachers.push(obj)
        }
      })

      if (
        certified_assesors_federal_teachers.length === 0 &&
        certified_verifiers_federal_teachers.length === 0 &&
        certified_assesors_state_teachers.length === 0 &&
        certified_verifiers_state_teachers.length === 0
      ) {
        return res.status(404).json({
          Error: true,
          message: 'No teachers in any aggregation meet requirement'
        })
      }
      const certified_teachers = {
        federal: {
          male_assesors: certified_assesors_federal_teachers.filter(
            obj => obj.gender === 'Male'
          ),
          female_assesors: certified_assesors_federal_teachers.filter(
            obj => obj.gender === 'Female'
          ),
          male_verifiers: certified_verifiers_federal_teachers.filter(
            obj => obj.gender === 'Male'
          ),
          female_verifiers: certified_verifiers_federal_teachers.filter(
            obj => obj.gender === 'Female'
          )
        },
        state: {
          male_assesors: certified_assesors_state_teachers.filter(
            obj => obj.gender === 'Male'
          ),
          female_assesors: certified_assesors_state_teachers.filter(
            obj => obj.gender === 'Female'
          ),
          male_verifiers: certified_verifiers_state_teachers.filter(
            obj => obj.gender === 'Male'
          ),
          female_verifiers: certified_verifiers_state_teachers.filter(
            obj => obj.gender === 'Female'
          )
        }
      }
      res.status(200).json({
        success: true,
        certified_teachers
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        Error: true,
        message: err.message
      })
    }
  })
)

// GET TEACHERS DISAGGREGATED BY SERVICE TYPE

router.get(
  '/get-service-typed-teachers',
  asyncErrCatcher(async (req, res) => {
    try {
      const found_data = await Teachers.find({})
      if (!found_data || found_data.length === 0) {
        res.staus(404).json({
          Error: true,
          message: 'No teachers found'
        })
      }
      const data = found_data[0]
      const pre_service_data = data.federal_tc.filter(
        obj => obj.service_type === 'Pre-service'
      )
      const in_service_data = data.federal_tc.filter(
        obj => obj.service_type === 'In-service'
      )

      res.status(200).json({
        Success: true,
        Filtered_data: {
          pre_service_data,
          in_service_data
        }
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        Error: true,
        message: err.message
      })
    }
  })
)

module.exports = router
