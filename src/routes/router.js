const billings = require("../controller/billing.controller");
const Auth = require("../controller/auth.controller");
const router = require("express").Router();
const { tokenVerify } = require("../middleware/tokenVerify");

router.post("/login", Auth.login);
router.post("/register", Auth.register);
router.post("/add-billing", billings.addBilling);

router.get("/auth/token-verify", Auth.checkToken);
router.get("/billing-list", tokenVerify, billings.getBillingList);

router.put("/update-billing/:billingId", billings.updateBill);

router.delete("/delete-billing/:billingId", billings.deleteBill);

module.exports = router;
