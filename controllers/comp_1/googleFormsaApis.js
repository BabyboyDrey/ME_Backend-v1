const { default: mongoose } = require("mongoose");
const asyncErrCatcher = require("../../middlewares/asyncErrCatcher");
const Teachers = require("../../models/comp_1/Teachers");
const router = require("express").Router();
require("dotenv").config();

const { google } = require("googleapis");
const path = require("path");

// Load the service account credentials
const serviceAccount = require(path.join(
  __dirname,
  "../../config",
  "agile-form-432514-0ef669f505f2.json"
));

// Create a JWT client using the service account credentials
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

// Example: Authorize and use the Sheets API
auth.authorize((err, tokens) => {
  if (err) {
    console.error("Error authorizing Google Sheets API:", err);
    return;
  }
  console.log("Successfully connected to Google Sheets API");
});

router.post(
  "/google-form",
  asyncErrCatcher(async (req, res) => {
    try {
      const response = await someGoogleFormsFunction(auth);
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
