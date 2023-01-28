const billing = require("../controller/billing.controller");
const Auth = require("../controller/auth.controller");
const { verifyToken } = require("../middleware/tokenVerify");
const router = require("express").Router();

// router.post("/login", Auth.login);
router.post("/register", Auth.register);
router.post("/add-billing", billing.addBilling);
// router.post("/billing-list", verifyToken, billing.getBillingList);
// router.post("/update-billing/:id", verifyToken, billing.updateBill);
// router.post("/delete-billing/:id", verifyToken, billing.deleteBill);

module.exports = router;
