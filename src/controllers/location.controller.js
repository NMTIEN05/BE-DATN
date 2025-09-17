import axios from 'axios';

const API_BASE_URL = 'https://provinces.open-api.vn/api';

// [GET] /api/location/provinces
export const getProvinces = async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/p`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách tỉnh/thành phố' });
  }
};

// [GET] /api/location/provinces/:code
export const getProvinceDetail = async (req, res) => {
  try {
    const { code } = req.params;
    const response = await axios.get(`${API_BASE_URL}/p/${code}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching province detail:', error);
    res.status(500).json({ message: 'Không thể lấy thông tin tỉnh/thành phố' });
  }
};

// [GET] /api/location/provinces/:code/districts
export const getDistricts = async (req, res) => {
  try {
    const { code } = req.params;
    const response = await axios.get(`${API_BASE_URL}/p/${code}?depth=2`);
    res.json(response.data.districts || []);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách quận/huyện' });
  }
};

// [GET] /api/location/districts/:code
export const getDistrictDetail = async (req, res) => {
  try {
    const { code } = req.params;
    const response = await axios.get(`${API_BASE_URL}/d/${code}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching district detail:', error);
    res.status(500).json({ message: 'Không thể lấy thông tin quận/huyện' });
  }
};

// [GET] /api/location/districts/:code/wards
export const getWards = async (req, res) => {
  try {
    const { code } = req.params;
    const response = await axios.get(`${API_BASE_URL}/d/${code}?depth=2`);
    res.json(response.data.wards || []);
  } catch (error) {
    console.error('Error fetching wards:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách phường/xã' });
  }
};

// [GET] /api/location/wards/:code
export const getWardDetail = async (req, res) => {
  try {
    const { code } = req.params;
    const response = await axios.get(`${API_BASE_URL}/w/${code}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching ward detail:', error);
    res.status(500).json({ message: 'Không thể lấy thông tin phường/xã' });
  }
}; 