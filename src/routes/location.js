import express from 'express';
import {
  getProvinces,
  getProvinceDetail,
  getDistricts,
  getDistrictDetail,
  getWards,
  getWardDetail,
} from '../controllers/location.controller.js';

const router = express.Router();

// Tỉnh/thành phố
router.get('/provinces', getProvinces);
router.get('/provinces/:code', getProvinceDetail);
router.get('/provinces/:code/districts', getDistricts);

// Quận/huyện
router.get('/districts/:code', getDistrictDetail);
router.get('/districts/:code/wards', getWards);

// Phường/xã
router.get('/wards/:code', getWardDetail);

export default router; 