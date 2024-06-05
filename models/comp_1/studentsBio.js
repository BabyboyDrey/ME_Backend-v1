const mongoose = require('mongoose')

const studentBioSchema = new mongoose.Schema({
  federal_tc: [
    {
      school_type: {
        type: String
      },
      school_name: {
        type: String
      },
      entry_level: {
        type: String
      },
      surname: {
        type: String
      },
      first_name: {
        type: String
      },
      other_name: {
        type: String
      },
      email: {
        type: String
      },
      nationality: {
        type: String
      },
      state: {
        type: String
      },
      lga: {
        type: String
      },
      sex: {
        type: String
      },
      reg_num: {
        type: Number
      },
      married: {
        type: String
      },
      date_of_birth: {
        type: Date
      },
      home_town: {
        type: String
      },
      home_address: {
        type: String
      },
      phone_number: {
        type: Number
      },
      parent_name: {
        type: String
      },
      parent_address: {
        type: String
      },
      nin: {
        type: Number
      },
      o_level_qual: {
        type: String
      },
      number_sitting: {
        type: Number
      },
      gpa: {
        type: Number
      },
      grad_status: {
        type: String
      },
      enrolled: {
        type: String
      },
      year_of_cert: {
        type: Number
      },
      grade_award: {
        type: String
      },
      mode_of_entry: {
        type: String
      },
      dept: {
        type: String
      },
      entry_year: {
        type: Number
      },
      entry_level: {
        type: String
      },
      qualification_in_view: {
        type: String
      },
      mode_of_study: {
        type: String
      },
      exit_year: {
        type: Number
      },
      current_session: {
        type: String
      },
      current_semester: {
        type: String
      },
      final_yr: {
        type: String
      },
      duration_of_study: {
        type: String
      },
      image_jpeg: {
        type: String
      },
      awards: {
        type: [String]
      },
      curr_grade: {
        type: String
      },
      cgpa: {
        type: Number
      },
      grade_stat: {
        type: String
      },
      enrollment_stat: {
        type: String
      },
      status: {
        type: Number
      },
      timed: {
        type: Date
      },
      pass: {
        type: String
      },
      student_code: {
        type: Number
      }
    }
  ],
  state_tc: [
    {
      school_type: {
        type: String
      },
      school_name: {
        type: String
      },
      entry_level: {
        type: String
      },
      surname: {
        type: String
      },
      first_name: {
        type: String
      },
      other_name: {
        type: String
      },
      email: {
        type: String
      },
      nationality: {
        type: String
      },
      state: {
        type: String
      },
      lga: {
        type: String
      },
      sex: {
        type: String
      },
      reg_num: {
        type: Number
      },
      married: {
        type: String
      },
      date_of_birth: {
        type: Date
      },
      home_town: {
        type: String
      },
      home_address: {
        type: String
      },
      phone_number: {
        type: Number
      },
      parent_name: {
        type: String
      },
      parent_address: {
        type: String
      },
      nin: {
        type: Number
      },
      o_level_qual: {
        type: String
      },
      number_sitting: {
        type: Number
      },
      gpa: {
        type: Number
      },
      grad_status: {
        type: String
      },
      enrolled: {
        type: String
      },
      year_of_cert: {
        type: Number
      },
      grade_award: {
        type: String
      },
      mode_of_entry: {
        type: String
      },
      dept: {
        type: String
      },
      entry_year: {
        type: Number
      },
      entry_level: {
        type: String
      },
      qualification_in_view: {
        type: String
      },
      mode_of_study: {
        type: String
      },
      exit_year: {
        type: Number
      },
      current_session: {
        type: String
      },
      current_semester: {
        type: String
      },
      final_yr: {
        type: String
      },
      duration_of_study: {
        type: String
      },
      image_jpeg: {
        type: String
      },
      awards: {
        type: [String]
      },
      curr_grade: {
        type: String
      },
      cgpa: {
        type: Number
      },
      grade_stat: {
        type: String
      },
      enrollment_stat: {
        type: String
      },
      status: {
        type: Number
      },
      timed: {
        type: Date
      },
      pass: {
        type: String
      },
      student_code: {
        type: Number
      }
    }
  ]
})

studentBioSchema.index({ 'federal_tc.reg_num': 1 })
studentBioSchema.index({ 'state_tc.reg_num': 1 })

module.exports = Student = mongoose.model('Student', studentBioSchema)
