import express from "express";

import { verifyToken } from "../mw/verify-token.js";
import {
  createEvent,
  getEvent,
  getEvents,
  updateEvent,
} from "../controllers/events.js";

const router = express.Router();

router.get("/", verifyToken, getEvents);
router.get("/:eventId", verifyToken, getEvent);

router.post("/create", verifyToken, createEvent);

router.patch("/:eventId", verifyToken, updateEvent);

export default router;
