import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CallApi from '../CallApi';
import LocationSelector from '../../location/LocationSelector';

export default function Customertrangchubanvila() {
  const navigate = useNavigate();
  const [directs, setDirects] = useState([]);
  const [realEstates, setRealEstates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedDirect, setSelectedDirect] = useState('');
  const [selectedLocation, setSelectedLocation] = useState({
    provinceName: '',
    districtName: '',
    wardName: '',
  });
  const [selectedPriceRange, setSelectedPriceRange] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await CallApi.getAllRealEstate();
        const RealEstate = response.filter(statusRealEstate => statusRealEstate.status === 2)
        setRealEstates(RealEstate);
        const locationResponse = await CallApi.getAllLocation();
        setLocations(locationResponse);
        const directsResponse = await CallApi.getAllDirect();
        setDirects(directsResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleDirectSelect = (directId) => {
    setSelectedDirect(directId);
  };

  const handlePriceRangeSelect = (priceRange) => {
    setSelectedPriceRange(priceRange);
  };

  const getCityName = (locationId) => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.city : '';
  };

  const getDistrictName = (locationId) => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.district : '';
  };

  const getWardName = (locationId) => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.ward : '';
  };

  const limitWords = (text, limit) => {
    if (text) {
      const words = text.split(' ');
      const truncatedWords = words.slice(0, limit);
      const truncatedText = truncatedWords.join(' ');
      if (words.length > limit) {
        return truncatedText + ' .....';
      }
      return truncatedText;
    }
    return '';
  };

  const getFrontImages = realEstate => {
    return realEstate.realEstateImages.filter(image => image.imageName === 'Ảnh Mặt Trước');
  };

  const getPrice = realEstate => {
    return realEstate.price;
  };

  const getStatus = realEstate => {
    let status = '';
    switch (realEstate.status) {
      case 2:
      case 6:
        status = 'Đang Mở Bán';
        break;
      default:
        status = ''; // Or any default status you want to show
        break;
    }
    return status;
  };

  const handleRealEstateClick = estate => {
    navigate(`/thongtinchitietbatdongsan/${estate.id}`);
  };

  const filteredRealEstates = realEstates.filter(estate => {
    const cityName = getCityName(estate.locationId);
    const districtName = getDistrictName(estate.locationId);
    const wardName = getWardName(estate.locationId);
    const selectedCityName = selectedLocation.provinceName;
    const selectedDistrictName = selectedLocation.districtName;
    const selectedWardName = selectedLocation.wardName;
    const selectedDirectId = parseInt(selectedDirect);
    const estatePrice = parseInt(getPrice(estate).replace(/,/g, ''));
    console.log('estatePrice', (estatePrice));

    if (selectedCityName === "Chọn tỉnh") {
      return true;
    }

    const cityMatch = selectedCityName ? cityName === selectedCityName : true;

    if (selectedDistrictName === "Chọn quận") {
      return cityMatch;
    }

    const districtMatch = selectedDistrictName ? districtName === selectedDistrictName : true;

    if (selectedWardName === "Chọn phường") {
      return cityMatch && districtMatch;
    }

    const wardMatch = selectedWardName ? wardName === selectedWardName : true;

    if (selectedDirect.includes("Chọn hướng")) {
      return cityMatch && districtMatch && wardMatch;
    }

    const directMatch = selectedDirectId ? estate.directId === selectedDirectId : true;


    // Check if the price falls within the selected price range
    const withinPriceRange = selectedPriceRange ?
      (estatePrice >= selectedPriceRange.min && estatePrice <= selectedPriceRange.max) :
      true;

    return cityMatch && districtMatch && wardMatch && directMatch && withinPriceRange;

  });

  const priceRanges = [
    { label: 'Chọn khoảng giá', min: 0, max: 999999999999999 },
    { label: 'Dưới 10 tỷ', min: 0, max: 10000000000 },
    { label: 'Từ 10 tỷ tới 30 tỷ', min: 10000000000, max: 30000000000 },
    { label: 'Từ 30 tỷ tới 50 tỷ', min: 30000000000, max: 50000000000 },
    { label: 'Trên 50 tỷ', min: 40000000000, max: 999999999999999 }
  ];

  return (
    <div>


      <div className="estate-container">

        <div className='main-title'>
          <div className="real-title">
            <div className='text-realtitle'>
              <span className='textso1'>NHÀ ĐẤT</span>
              <h2 className='textso2'>BÁN</h2>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', textAlign: 'left', justifyContent: 'space-between', marginBottom:'20px' }}>
          <LocationSelector onSelect={handleLocationSelect} selectedLocation={selectedLocation} className='cus-local' />

          <select style={{ width: 'max-content', marginLeft: '10px', borderColor: 'black' }} onChange={(e) => handleDirectSelect(e.target.value)} value={selectedDirect}>
            <option value="Chọn hướng">Chọn hướng</option>
            {directs.map(direct => (
              <option key={direct.id} value={direct.id}>{direct.directName}</option>
            ))}
          </select>

          <select style={{ width: 'auto', marginLeft: '10px', borderColor: 'black' }} onChange={(e) => handlePriceRangeSelect(JSON.parse(e.target.value))}>
            {priceRanges.map((range, index) => (
              <option key={index} value={JSON.stringify(range)}>{range.label}</option>
            ))}
          </select>
        </div>
        <div className="estates-wrapper">
          {filteredRealEstates.map((estate, index) => (
            <div key={index} className="estate-item">
              <div className="estate-info">
                <div className="image-container">
                  {getFrontImages(estate).map((image, imageIndex) => (
                    <div key={imageIndex} className="image-item">
                      <img onClick={() => handleRealEstateClick(estate)} src={image.imageUrl} alt={image.imageName} className="estate-image" />
                    </div>
                  ))}
                </div>
                <div onClick={() => handleRealEstateClick(estate)} className="estate-name">{estate.realestateName}</div>
                <span className="estate-discription">{limitWords(estate.discription, 15)}</span>
                <div className='thanhphoprice'>
                  <div className='logo-thanhpho'>
                    <img className='logo-location' src='/logotrangchu/location.png' alt="location" />
                    <span className='thanhpho'>{getCityName(estate.locationId)}</span>
                  </div>
                  <span className='price'>{getPrice(estate)}</span>
                </div>
                <span className='trangthaiban'>{getStatus(estate)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
