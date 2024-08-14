const mongoose = require("mongoose");

const pdoSchema = new mongoose.Schema({
  no_of_youths_obtaining_recognized_skills_afters_completing_an_informal_apprenticeship:
    [
      {
        name_of_business: {
          type: String,
        },
        male: {
          type: Number,
        },
        female: {
          type: Number,
        },
      },
    ],
  direct_project_beneficiaries: [
    {
      name_of_business: {
        type: String,
      },
      trainees_in_technical_colleges: {
        enrolled: {
          state: {
            male: {
              type: Number,
            },
            female: {
              type: Number,
            },
          },
          federal: {
            male: {
              type: Number,
            },
            female: {
              type: Number,
            },
          },
        },
        graduated: {
          state: {
            male: {
              type: Number,
            },
            female: {
              type: Number,
            },
          },
          federal: {
            male: {
              type: Number,
            },
            female: {
              type: Number,
            },
          },
        },
      },
      master_craft_person: {
        assessor: {
          male: {
            type: Number,
          },
          female: {
            type: Number,
          },
        },
        verifiers: {
          male: {
            type: Number,
          },
          female: {
            type: Number,
          },
        },
      },
    },
  ],
});

pdoSchema.index({
  "no_of_youths_obtaining_recognized_skills_afters_completing_an_informal_apprenticeship.name_of_business": 1,
});
pdoSchema.index({ "direct_project_beneficiaries.name_of_business": 1 });

module.exports = Pdo_comp2 = mongoose.model("Pdo_comp2", pdoSchema);
