import express from "express";

import { getRequests, updateRequest, getRequest } from "../controllers/requests.js";
import { verifyToken } from "../mw/verify-token.js";

const router = express.Router();

router.get("/", verifyToken, getRequests);
router.get('/:requestId', verifyToken, getRequest)

router.patch("/:requestId", verifyToken, updateRequest);

export default router;
