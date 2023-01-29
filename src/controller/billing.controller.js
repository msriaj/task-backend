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

    const save = await Bill.insertOne({ ...data, billingId, createdBy: "email", isDeleted: false, createdAt: timeStamp() });
    if (!save) return res.status(400).send("Something went wrong");

    res.send({ status: "success", billingId, message: "Billing added successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getBillingList = async (req, res) => {
  try {
    const Bill = await getDb().collection("bills");
    //const { email } = req.user;

    const { page, limit, searchBy } = req.query;
    if (!page || !limit) return res.status(400).send("Invalid query");

    const skip = (page - 1) * limit;

    if (searchBy) {
      const query = [
        { name: { $regex: searchBy, $options: "i" } },
        { email: { $regex: searchBy, $options: "i" } },
        { phone: { $regex: searchBy, $options: "i" } },
      ];

      const billCount = await Bill.countDocuments({ isDeleted: false, $or: query });
      const pageNo = Math.ceil(billCount / limit);

      const find = await Bill.aggregate([
        {
          $match: {
            isDeleted: false,
            $or: query,
          },
        },
        {
          $project: {
            _id: 0,
            name: 1,
            email: 1,
            phone: 1,
            payableAmount: 1,
            billingId: 1,
            createdAt: 1,
          },
        },
        { $skip: skip },
        { $limit: parseInt(limit) },
        { $sort: { createdAt: -1 } },
      ]).toArray();

      if (!find || !find.length) return res.status(404).send("No billing found");

      return res.send({ status: "success", billList: find, pageNo, message: "Billing fetched successfully" });
    }

    const billCount = await Bill.countDocuments({ isDeleted: false });
    const pageNo = Math.ceil(billCount / limit);

    const find = await Bill.aggregate([
      { $match: { isDeleted: false } },
      {
        $project: {
          _id: 0,
          name: 1,
          email: 1,
          phone: 1,
          payableAmount: 1,
          billingId: 1,
          createdAt: 1,
        },
      },
      { $skip: skip },
      { $limit: parseInt(limit) },
      { $sort: { createdAt: -1 } },
    ]).toArray();

    if (!find || !find.length) return res.status(404).send("No billing found");

    return res.send({ status: "success", billList: find, pageNo, message: "Billing fetched successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateBill = async (req, res) => {
  try {
    const Bill = await getDb().collection("bills");

    const { billingId } = req.params;
    if (!billingId) return res.status(400).send("Invalid billing id");

    // check if billing data is valid
    const isDataValid = billingValidate(req.body);
    if (isDataValid.error) return res.status(400).send(isDataValid.error.details[0].message);

    const data = isDataValid.value;

    // check if billing exist
    const isExist = await Bill.findOne({ billingId, isDeleted: false });
    if (!isExist) return res.status(404).send("No billing found");

    // update billing
    await Bill.updateOne({ billingId, isDeleted: false }, { $set: { ...data, updatedAt: timeStamp() } });

    res.send({ status: "success", message: "Billing updated successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const Bill = await getDb().collection("bills");

    const { billingId } = req.params;
    if (!billingId) return res.status(400).send("Invalid billing id");

    // check if billing exist
    const isExist = await Bill.findOne({ billingId, isDeleted: false });
    if (!isExist) return res.status(404).send("No billing found");

    // delete billing
    await Bill.updateOne({ billingId, isDeleted: false }, { $set: { isDeleted: true, updatedAt: timeStamp() } });

    res.send({ status: "success", message: "Billing deleted successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
