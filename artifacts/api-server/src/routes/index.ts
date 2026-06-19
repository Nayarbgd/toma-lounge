import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reservationsRouter from "./reservations";
import adminRouter from "./admin";
import eventsRouter from "./events";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reservationsRouter);
router.use(adminRouter);
router.use(eventsRouter);

export default router;
