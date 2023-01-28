const { ObjectId } = require("mongodb");
const { getDb } = require("../database/db");
const { timeStamp } = require("../utils/timestamp");
const { uniqueId } = require("../utils/uniqueId");
const { billingValidate } = require("../validators/validate");

exports.addBilling = async (req, res) => {
  try {
    const Bill = await getDb().collection("bills");
    //const { email } = req.user;

    const isDataValid = billingValidate(req.body);
    if (isDataValid.error) return res.status(400).send(isDataValid.error.details[0].message);

    const data = isDataValid.value;

    // generate billing id
    const checkId = async (newId) => {
      const isExist = await Bill.findOne({ billingId: newId });

      if (isExist) {
        return checkId(uniqueId().toString());
      }
      return newId;
    };

    const billingId = await checkId(uniqueId().toString());

    const save = await Bill.insertOne({ ...data, billingId, createdBy: "email", createdAt: timeStamp() });
    if (!save) return res.status(400).send("Something went wrong");

    res.send({ status: "success", billingId, message: "Billing added successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
