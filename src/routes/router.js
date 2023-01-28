const billings = require("../controller/billing.controller");
const Auth = require("../controller/auth.controller");
const { verifyToken } = require("../middleware/tokenVerify");
const router = require("express").Router();

router.post("/login", Auth.login);
router.post("/register", Auth.register);
router.post("/add-billing", billings.addBilling);

router.get("/billing-list", billings.getBillingList);

router.put("/update-billing/:billingId", billings.updateBill);

router.delete("/delete-billing/:billingId", billings.deleteBill);

module.exports = router;
