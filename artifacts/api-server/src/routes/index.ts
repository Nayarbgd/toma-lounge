import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reservationsRouter from "./reservations";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reservationsRouter);
router.use(adminRouter);

export default router;
