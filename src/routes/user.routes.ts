import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { upload } from "../utils/cloudinaryUpload";
import { getMeController, updateMeController, deleteMeController } from "../controllers/user.controller";
import { asyncHandler } from "../utils/asyncHandlers"

const router = Router();

router.get("/me", authenticate, asyncHandler(getMeController));
router.patch("/me", authenticate, upload.single("avatar"), asyncHandler(updateMeController));
router.delete("/me", authenticate, asyncHandler(deleteMeController));

export default router;