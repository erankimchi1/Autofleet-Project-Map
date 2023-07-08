import express from "express";
import {getVehicles, getVehiclesInsideArea} from '../controller/vehicles.js'
const router = express.Router();

router.get('/', getVehicles);
router.get('/insideArea', getVehiclesInsideArea);

export default router