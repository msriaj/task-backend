const billings = require("../controller/billing.controller");
const Auth = require("../controller/auth.controller");
const router = require("express").Router();
const { tokenVerify } = require("../middleware/tokenVerify");

router.post("/login", Auth.login);
router.post("/register", Auth.register);
router.post("/add-billing", tokenVerify, billings.addBilling);

router.get("/auth/token-verify", tokenVerify, Auth.checkToken);
router.get("/billing-list", billings.getBillingList);

router.put("/update-billing/:billingId", tokenVerify, billings.updateBill);

router.delete("/delete-billing/:billingId", tokenVerify, billings.deleteBill);

module.exports = router;
